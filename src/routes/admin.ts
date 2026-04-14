import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import path from "path";
import pool from "../config/database";
import { isAuthenticated, isAdmin } from "../middlewares/auth";

import { uploadBookWithCover } from "../middlewares/upload";
import { RowDataPacket, ResultSetHeader } from "mysql2";

const router = Router();

// Áp dụng middleware cho tất cả route admin
router.use(isAuthenticated, isAdmin);

// GET /admin - Dashboard
router.get("/", async (req: Request, res: Response) => {
  try {
    const [bookCount] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM books",
    );
    const [userCount] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM users",
    );
    const [categoryCount] = await pool.execute<RowDataPacket[]>(
      "SELECT COUNT(*) as count FROM categories",
    );
    const [recentBooks] = await pool.execute<RowDataPacket[]>(
      "SELECT b.*, c.name as category_name FROM books b LEFT JOIN categories c ON b.category_id = c.id ORDER BY b.created_at DESC LIMIT 5",
    );
    const [recentUsers] = await pool.execute<RowDataPacket[]>(
      "SELECT id, username, email, full_name, role, created_at FROM users ORDER BY created_at DESC LIMIT 5",
    );

    res.render("admin/dashboard", {
      title: "Quản trị - Dashboard",
      bookCount: bookCount[0].count,
      userCount: userCount[0].count,
      categoryCount: categoryCount[0].count,
      recentBooks,
      recentUsers,
      user: req.session.user,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    req.flash("error", "Đã xảy ra lỗi");
    res.redirect("/");
  }
});

// ==================== QUẢN LÝ SÁCH ====================

// GET /admin/books - Danh sách sách
router.get("/books", async (req: Request, res: Response) => {
  try {
    const [books] = await pool.execute<RowDataPacket[]>(
      `SELECT b.*, c.name as category_name, u.full_name as uploader_name
             FROM books b
             LEFT JOIN categories c ON b.category_id = c.id
             LEFT JOIN users u ON b.uploaded_by = u.id
             ORDER BY b.created_at DESC`,
    );

    res.render("admin/books/index", {
      title: "Quản lý sách",
      books,
      user: req.session.user,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    console.error("Admin books error:", error);
    req.flash("error", "Đã xảy ra lỗi");
    res.redirect("/admin");
  }
});

// GET /admin/books/add - Form thêm sách
router.get("/books/add", async (req: Request, res: Response) => {
  try {
    const [categories] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM categories ORDER BY name",
    );

    res.render("admin/books/add", {
      title: "Thêm sách mới",
      categories,
      user: req.session.user,
      error: req.flash("error"),
    });
  } catch (error) {
    console.error("Admin add book form error:", error);
    req.flash("error", "Đã xảy ra lỗi");
    res.redirect("/admin/books");
  }
});

// POST /admin/books/add - Xử lý thêm sách
router.post("/books/add", (req: Request, res: Response) => {
  const upload = uploadBookWithCover.fields([
    { name: "book_file", maxCount: 1 },
    { name: "cover_image", maxCount: 1 },
  ]);

  upload(req, res, async (err: any) => {
    if (err) {
      req.flash("error", err.message || "Lỗi upload file");
      return res.redirect("/admin/books/add");
    }

    try {
      const { title, author, description, category_id } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files["book_file"] || files["book_file"].length === 0) {
        req.flash("error", "Vui lòng chọn file sách");
        return res.redirect("/admin/books/add");
      }

      if (!title || !author) {
        req.flash("error", "Vui lòng nhập đầy đủ thông tin");
        return res.redirect("/admin/books/add");
      }

      const bookFile = files["book_file"][0];
      const fileExt = path
        .extname(bookFile.originalname)
        .toLowerCase()
        .replace(".", "");
      const filePath = "/uploads/books/" + bookFile.filename;

      let coverPath = null;
      if (files["cover_image"] && files["cover_image"].length > 0) {
        coverPath = "/uploads/covers/" + files["cover_image"][0].filename;
      }

      await pool.execute<ResultSetHeader>(
        `INSERT INTO books (title, author, description, cover_image, file_path, file_type, category_id, uploaded_by)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          author,
          description || null,
          coverPath,
          filePath,
          fileExt,
          category_id || null,
          req.session.user!.id,
        ],
      );

      req.flash("success", "Thêm sách thành công!");
      res.redirect("/admin/books");
    } catch (error) {
      console.error("Admin add book error:", error);
      req.flash("error", "Đã xảy ra lỗi khi thêm sách");
      res.redirect("/admin/books/add");
    }
  });
});

// GET /admin/books/edit/:id - Form chỉnh sửa sách
router.get("/books/edit/:id", async (req: Request, res: Response) => {
  try {
    const [books] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM books WHERE id = ?",
      [req.params.id],
    );

    if (books.length === 0) {
      req.flash("error", "Không tìm thấy sách");
      return res.redirect("/admin/books");
    }

    const [categories] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM categories ORDER BY name",
    );

    res.render("admin/books/edit", {
      title: "Chỉnh sửa sách",
      book: books[0],
      categories,
      user: req.session.user,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    console.error("Admin edit book form error:", error);
    req.flash("error", "Đã xảy ra lỗi");
    res.redirect("/admin/books");
  }
});

// POST /admin/books/edit/:id - Xử lý chỉnh sửa sách
router.post("/books/edit/:id", (req: Request, res: Response) => {
  const upload = uploadBookWithCover.fields([
    { name: "book_file", maxCount: 1 },
    { name: "cover_image", maxCount: 1 },
  ]);

  upload(req, res, async (err: any) => {
    if (err) {
      req.flash("error", err.message || "Lỗi upload file");
      return res.redirect("/admin/books/edit/" + req.params.id);
    }

    try {
      const { title, author, description, category_id } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!title || !author) {
        req.flash("error", "Vui lòng nhập đầy đủ thông tin");
        return res.redirect("/admin/books/edit/" + req.params.id);
      }

      // Lấy thông tin sách hiện tại
      const [currentBooks] = await pool.execute<RowDataPacket[]>(
        "SELECT * FROM books WHERE id = ?",
        [req.params.id],
      );

      if (currentBooks.length === 0) {
        req.flash("error", "Không tìm thấy sách");
        return res.redirect("/admin/books");
      }

      const currentBook = currentBooks[0];
      let filePath = currentBook.file_path;
      let fileType = currentBook.file_type;
      let coverPath = currentBook.cover_image;

      // Nếu có upload file sách mới
      if (files["book_file"] && files["book_file"].length > 0) {
        const bookFile = files["book_file"][0];
        fileType = path
          .extname(bookFile.originalname)
          .toLowerCase()
          .replace(".", "");
        filePath = "/uploads/books/" + bookFile.filename;
      }

      // Nếu có upload ảnh bìa mới
      if (files["cover_image"] && files["cover_image"].length > 0) {
        coverPath = "/uploads/covers/" + files["cover_image"][0].filename;
      }

      await pool.execute<ResultSetHeader>(
        `UPDATE books SET title = ?, author = ?, description = ?, cover_image = ?, file_path = ?, file_type = ?, category_id = ?
                 WHERE id = ?`,
        [
          title,
          author,
          description || null,
          coverPath,
          filePath,
          fileType,
          category_id || null,
          req.params.id,
        ],
      );

      req.flash("success", "Cập nhật sách thành công!");
      res.redirect("/admin/books");
    } catch (error) {
      console.error("Admin edit book error:", error);
      req.flash("error", "Đã xảy ra lỗi khi cập nhật sách");
      res.redirect("/admin/books/edit/" + req.params.id);
    }
  });
});

// POST /admin/books/delete/:id - Xóa sách
router.post("/books/delete/:id", async (req: Request, res: Response) => {
  try {
    await pool.execute("DELETE FROM books WHERE id = ?", [req.params.id]);
    req.flash("success", "Xóa sách thành công!");
    res.redirect("/admin/books");
  } catch (error) {
    console.error("Delete book error:", error);
    req.flash("error", "Đã xảy ra lỗi khi xóa sách");
    res.redirect("/admin/books");
  }
});

// ==================== QUẢN LÝ NGƯỜI DÙNG ====================

// GET /admin/users - Danh sách người dùng
router.get("/users", async (req: Request, res: Response) => {
  try {
    const [users] = await pool.execute<RowDataPacket[]>(
      "SELECT id, username, email, full_name, role, created_at FROM users ORDER BY created_at DESC",
    );

    res.render("admin/users/index", {
      title: "Quản lý người dùng",
      users,
      user: req.session.user,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    console.error("Admin users error:", error);
    req.flash("error", "Đã xảy ra lỗi");
    res.redirect("/admin");
  }
});

// GET /admin/users/add - Form thêm người dùng
router.get("/users/add", (req: Request, res: Response) => {
  res.render("admin/users/add", {
    title: "Thêm người dùng",
    user: req.session.user,
    error: req.flash("error"),
  });
});

// POST /admin/users/add - Xử lý thêm người dùng
router.post("/users/add", async (req: Request, res: Response) => {
  try {
    const { username, email, password, full_name, role } = req.body;

    if (!username || !email || !password || !full_name) {
      req.flash("error", "Vui lòng nhập đầy đủ thông tin");
      return res.redirect("/admin/users/add");
    }

    // Kiểm tra tồn tại
    const [existing] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email],
    );

    if (existing.length > 0) {
      req.flash("error", "Tên đăng nhập hoặc email đã tồn tại");
      return res.redirect("/admin/users/add");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === "admin" ? "admin" : "user";

    await pool.execute(
      "INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)",
      [username, email, hashedPassword, full_name, userRole],
    );

    req.flash("success", "Thêm người dùng thành công!");
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Admin add user error:", error);
    req.flash("error", "Đã xảy ra lỗi khi thêm người dùng");
    res.redirect("/admin/users/add");
  }
});

// GET /admin/users/edit/:id - Form chỉnh sửa người dùng
router.get("/users/edit/:id", async (req: Request, res: Response) => {
  try {
    const [users] = await pool.execute<RowDataPacket[]>(
      "SELECT id, username, email, full_name, role, created_at, updated_at FROM users WHERE id = ?",
      [req.params.id],
    );

    if (users.length === 0) {
      req.flash("error", "Không tìm thấy người dùng");
      return res.redirect("/admin/users");
    }

    res.render("admin/users/edit", {
      title: "Chỉnh sửa người dùng",
      editUser: users[0],
      user: req.session.user,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    console.error("Admin edit user form error:", error);
    req.flash("error", "Đã xảy ra lỗi");
    res.redirect("/admin/users");
  }
});

// POST /admin/users/edit/:id - Xử lý chỉnh sửa thông tin người dùng
router.post("/users/edit/:id", async (req: Request, res: Response) => {
  try {
    const { username, email, full_name, role } = req.body;
    const userId = parseInt(req.params.id);

    if (!username || !email || !full_name) {
      req.flash("error", "Vui lòng nhập đầy đủ thông tin");
      return res.redirect("/admin/users/edit/" + userId);
    }

    // Kiểm tra username/email đã tồn tại (trừ user hiện tại)
    const [existing] = await pool.execute<RowDataPacket[]>(
      "SELECT id FROM users WHERE (username = ? OR email = ?) AND id != ?",
      [username, email, userId],
    );

    if (existing.length > 0) {
      req.flash(
        "error",
        "Tên đăng nhập hoặc email đã được sử dụng bởi người dùng khác",
      );
      return res.redirect("/admin/users/edit/" + userId);
    }

    const userRole = role === "admin" ? "admin" : "user";

    await pool.execute(
      "UPDATE users SET username = ?, email = ?, full_name = ?, role = ? WHERE id = ?",
      [username, email, full_name, userRole, userId],
    );

    // Cập nhật session nếu đang sửa chính mình
    if (userId === req.session.user!.id) {
      req.session.user!.username = username;
      req.session.user!.email = email;
      req.session.user!.full_name = full_name;
      req.session.user!.role = userRole;
    }

    req.flash("success", "Cập nhật thông tin người dùng thành công!");
    res.redirect("/admin/users/edit/" + userId);
  } catch (error) {
    console.error("Admin edit user error:", error);
    req.flash("error", "Đã xảy ra lỗi khi cập nhật người dùng");
    res.redirect("/admin/users/edit/" + req.params.id);
  }
});

// POST /admin/users/change-password/:id - Đổi mật khẩu người dùng
router.post(
  "/users/change-password/:id",
  async (req: Request, res: Response) => {
    try {
      const { new_password, confirm_password } = req.body;
      const userId = parseInt(req.params.id);

      if (!new_password || !confirm_password) {
        req.flash("error", "Vui lòng nhập đầy đủ thông tin");
        return res.redirect("/admin/users/edit/" + userId);
      }

      if (new_password !== confirm_password) {
        req.flash("error", "Mật khẩu xác nhận không khớp");
        return res.redirect("/admin/users/edit/" + userId);
      }

      if (new_password.length < 6) {
        req.flash("error", "Mật khẩu phải có ít nhất 6 ký tự");
        return res.redirect("/admin/users/edit/" + userId);
      }

      // Kiểm tra user tồn tại
      const [users] = await pool.execute<RowDataPacket[]>(
        "SELECT id FROM users WHERE id = ?",
        [userId],
      );

      if (users.length === 0) {
        req.flash("error", "Không tìm thấy người dùng");
        return res.redirect("/admin/users");
      }

      const hashedPassword = await bcrypt.hash(new_password, 10);
      await pool.execute("UPDATE users SET password = ? WHERE id = ?", [
        hashedPassword,
        userId,
      ]);

      req.flash("success", "Đổi mật khẩu thành công!");
      res.redirect("/admin/users/edit/" + userId);
    } catch (error) {
      console.error("Admin change password error:", error);
      req.flash("error", "Đã xảy ra lỗi khi đổi mật khẩu");
      res.redirect("/admin/users/edit/" + req.params.id);
    }
  },
);

// POST /admin/users/delete/:id - Xóa người dùng
router.post("/users/delete/:id", async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    // Không cho xóa chính mình
    if (userId === req.session.user!.id) {
      req.flash("error", "Không thể xóa tài khoản của chính mình");
      return res.redirect("/admin/users");
    }

    await pool.execute("DELETE FROM users WHERE id = ?", [userId]);
    req.flash("success", "Xóa người dùng thành công!");
    res.redirect("/admin/users");
  } catch (error) {
    console.error("Delete user error:", error);
    req.flash("error", "Đã xảy ra lỗi khi xóa người dùng");
    res.redirect("/admin/users");
  }
});

export default router;
