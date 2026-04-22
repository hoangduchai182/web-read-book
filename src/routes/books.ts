import { Router, Request, Response } from "express";
import pool from "../config/database";
import { isAuthenticated } from "../middlewares/auth";
import { RowDataPacket } from "mysql2";

const router = Router();

// GET /books - Danh sách sách
router.get("/", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const search = (req.query.search as string) || "";
    const categoryId = (req.query.category as string) || "";
    const sortBy = (req.query.sort as string) || "latest";
    const page = parseInt(req.query.page as string) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;

    let query = `
            SELECT b.*, c.name as category_name, u.full_name as uploader_name
            FROM books b
            LEFT JOIN categories c ON b.category_id = c.id
            LEFT JOIN users u ON b.uploaded_by = u.id
            WHERE 1=1
        `;
    let countQuery = "SELECT COUNT(*) as total FROM books b WHERE 1=1";
    const params: any[] = [];
    const countParams: any[] = [];

    if (search) {
      query += " AND (b.title LIKE ? OR b.author LIKE ?)";
      countQuery += " AND (b.title LIKE ? OR b.author LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    if (categoryId) {
      query += " AND b.category_id = ?";
      countQuery += " AND b.category_id = ?";
      params.push(categoryId);
      countParams.push(categoryId);
    }

    // Xử lý sắp xếp
    switch (sortBy) {
      case "name_asc":
        query += " ORDER BY b.title ASC";
        break;
      case "name_desc":
        query += " ORDER BY b.title DESC";
        break;
      case "views":
        query += " ORDER BY b.views DESC, b.created_at DESC";
        break;
      case "latest":
      default:
        query += " ORDER BY b.created_at DESC";
        break;
    }

    query += ` LIMIT ${limit} OFFSET ${offset}`;

    const [books] = await pool.execute<RowDataPacket[]>(query, params);
    const [countResult] = await pool.execute<RowDataPacket[]>(
      countQuery,
      countParams,
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limit);

    const [categories] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM categories ORDER BY name",
    );

    res.render("books/index", {
      title: "Thư viện sách",
      books,
      categories,
      search,
      categoryId,
      sortBy,
      currentPage: page,
      totalPages,
      user: req.session.user,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    console.error("Books list error:", error);
    req.flash("error", "Đã xảy ra lỗi khi tải danh sách sách");
    res.redirect("/");
  }
});

// GET /books/:id - Chi tiết sách
router.get("/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const [books] = await pool.execute<RowDataPacket[]>(
      `SELECT b.*, c.name as category_name, u.full_name as uploader_name
             FROM books b
             LEFT JOIN categories c ON b.category_id = c.id
             LEFT JOIN users u ON b.uploaded_by = u.id
             WHERE b.id = ?`,
      [req.params.id],
    );

    if (books.length === 0) {
      req.flash("error", "Không tìm thấy sách");
      return res.redirect("/books");
    }

    const book = books[0];

    // Lấy tiến trình đọc
    const [progress] = await pool.execute<RowDataPacket[]>(
      "SELECT * FROM reading_progress WHERE user_id = ? AND book_id = ?",
      [req.session.user!.id, req.params.id],
    );

    res.render("books/detail", {
      title: book.title,
      book,
      progress: progress.length > 0 ? progress[0] : null,
      user: req.session.user,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    console.error("Book detail error:", error);
    req.flash("error", "Đã xảy ra lỗi");
    res.redirect("/books");
  }
});

// GET /books/:id/read - Đọc sách
router.get(
  "/:id/read",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      // Tăng lượt xem (views) thêm 1
      await pool.execute("UPDATE books SET views = views + 1 WHERE id = ?", [
        req.params.id,
      ]);

      const [books] = await pool.execute<RowDataPacket[]>(
        "SELECT * FROM books WHERE id = ?",
        [req.params.id],
      );

      if (books.length === 0) {
        req.flash("error", "Không tìm thấy sách");
        return res.redirect("/books");
      }

      const book = books[0];

      // Lấy tiến trình đọc
      const [progress] = await pool.execute<RowDataPacket[]>(
        "SELECT * FROM reading_progress WHERE user_id = ? AND book_id = ?",
        [req.session.user!.id, req.params.id],
      );

      const template =
        book.file_type === "pdf" ? "books/reader-pdf" : "books/reader-epub";

      res.render(template, {
        title: `Đọc: ${book.title}`,
        book,
        progress: progress.length > 0 ? progress[0] : null,
        user: req.session.user,
      });
    } catch (error) {
      console.error("Read book error:", error);
      req.flash("error", "Đã xảy ra lỗi");
      res.redirect("/books");
    }
  },
);

// POST /books/:id/progress - Lưu tiến trình đọc
router.post(
  "/:id/progress",
  isAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { current_page, current_location } = req.body;
      const userId = req.session.user!.id;
      const bookId = req.params.id;

      await pool.execute(
        `INSERT INTO reading_progress (user_id, book_id, current_page, current_location)
             VALUES (?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE current_page = ?, current_location = ?`,
        [
          userId,
          bookId,
          current_page || 0,
          current_location || null,
          current_page || 0,
          current_location || null,
        ],
      );

      res.json({ success: true });
    } catch (error) {
      console.error("Save progress error:", error);
      res.status(500).json({ success: false, message: "Lỗi lưu tiến trình" });
    }
  },
);

export default router;
