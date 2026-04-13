import { Request, Response, NextFunction } from 'express';

// Mở rộng session
declare module 'express-session' {
    interface SessionData {
        user: {
            id: number;
            username: string;
            email: string;
            full_name: string;
            role: string;
            avatar: string | null;
        };
    }
}

// Kiểm tra đã đăng nhập chưa
export const isAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
    if (req.session.user) {
        next();
    } else {
        req.flash('error', 'Bạn cần đăng nhập để truy cập trang này');
        res.redirect('/auth/login');
    }
};

// Kiểm tra quyền admin
export const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (req.session.user && req.session.user.role === 'admin') {
        next();
    } else {
        req.flash('error', 'Bạn không có quyền truy cập trang này');
        res.redirect('/');
    }
};

// Kiểm tra chưa đăng nhập (cho trang login/register)
export const isGuest = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
};