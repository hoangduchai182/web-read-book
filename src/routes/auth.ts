import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { isGuest, isAuthenticated } from '../middlewares/auth';
import { RowDataPacket } from 'mysql2';

const router = Router();

// GET /auth/login
router.get('/login', isGuest, (req: Request, res: Response) => {
    res.render('auth/login', {
        title: 'Đăng nhập',
        error: req.flash('error'),
        success: req.flash('success')
    });
});

// POST /auth/login
router.post('/login', isGuest, async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            req.flash('error', 'Vui lòng nhập đầy đủ thông tin');
            return res.redirect('/auth/login');
        }

        const [rows] = await pool.execute<RowDataPacket[]>(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, username]
        );

        if (rows.length === 0) {
            req.flash('error', 'Tài khoản hoặc mật khẩu không đúng');
            return res.redirect('/auth/login');
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            req.flash('error', 'Tài khoản hoặc mật khẩu không đúng');
            return res.redirect('/auth/login');
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            avatar: user.avatar
        };

        req.flash('success', 'Đăng nhập thành công!');
        res.redirect('/');
    } catch (error) {
        console.error('Login error:', error);
        req.flash('error', 'Đã xảy ra lỗi, vui lòng thử lại');
        res.redirect('/auth/login');
    }
});

// GET /auth/register
router.get('/register', isGuest, (req: Request, res: Response) => {
    res.render('auth/register', {
        title: 'Đăng ký',
        error: req.flash('error'),
        success: req.flash('success')
    });
});

// POST /auth/register
router.post('/register', isGuest, async (req: Request, res: Response) => {
    try {
        const { username, email, password, confirm_password, full_name } = req.body;

        if (!username || !email || !password || !confirm_password || !full_name) {
            req.flash('error', 'Vui lòng nhập đầy đủ thông tin');
            return res.redirect('/auth/register');
        }

        if (password !== confirm_password) {
            req.flash('error', 'Mật khẩu xác nhận không khớp');
            return res.redirect('/auth/register');
        }

        if (password.length < 6) {
            req.flash('error', 'Mật khẩu phải có ít nhất 6 ký tự');
            return res.redirect('/auth/register');
        }

        // Kiểm tra username đã tồn tại
        const [existingUsers] = await pool.execute<RowDataPacket[]>(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUsers.length > 0) {
            req.flash('error', 'Tên đăng nhập hoặc email đã tồn tại');
            return res.redirect('/auth/register');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.execute(
            'INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)',
            [username, email, hashedPassword, full_name, 'user']
        );

        req.flash('success', 'Đăng ký thành công! Vui lòng đăng nhập.');
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Register error:', error);
        req.flash('error', 'Đã xảy ra lỗi, vui lòng thử lại');
        res.redirect('/auth/register');
    }
});

// GET /auth/logout
router.get('/logout', isAuthenticated, (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) console.error('Logout error:', err);
        res.redirect('/auth/login');
    });
});

export default router;