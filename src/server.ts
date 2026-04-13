import express from "express";
import path from "path";
import session from "express-session";
import flash from "connect-flash";
import dotenv from "dotenv";
import pool from "./config/database";
import { setupDatabase } from "./config/setupDatabase";
import { RowDataPacket } from "mysql2";

// Import routes
import authRoutes from "./routes/auth";
import bookRoutes from "./routes/books";
import adminRoutes from "./routes/admin";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default-secret-key-change-this",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 giờ
    },
  }),
);

// Flash messages
app.use(flash());

// Global variables cho views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// Routes
app.use("/auth", authRoutes);
app.use("/books", bookRoutes);
app.use("/admin", adminRoutes);

// Trang chủ
app.get("/", async (req, res) => {
  try {
    const [recentBooks] = await pool.execute<RowDataPacket[]>(
      `SELECT b.*, c.name as category_name
             FROM books b
             LEFT JOIN categories c ON b.category_id = c.id
             ORDER BY b.created_at DESC LIMIT 12`,
    );

    res.render("home", {
      title: "Trang chủ",
      recentBooks,
      user: req.session.user || null,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    console.error("Home page error:", error);
    res.render("home", {
      title: "Trang chủ",
      recentBooks: [],
      user: req.session.user || null,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  }
});

// 404
app.use((req, res) => {
  res.status(404).render("404", {
    title: "404 - Không tìm thấy",
    user: req.session.user || null,
  });
});

// Khởi động server

async function startServer() {
  try {
    // Setup database tự động
    await setupDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
      console.log(`📚 BookRead - Website đọc sách online`);
      console.log(`\n📋 Các route chính:`);
      console.log(`   - Trang chủ:    http://localhost:${PORT}`);
      console.log(`   - Đăng nhập:    http://localhost:${PORT}/auth/login`);
      console.log(`   - Đăng ký:      http://localhost:${PORT}/auth/register`);
      console.log(`   - Thư viện:     http://localhost:${PORT}/books`);
      console.log(`   - Admin:        http://localhost:${PORT}/admin`);
      console.log(`\n`);
    });
  } catch (error) {
    console.error("❌ Không thể khởi động server:", error);
    process.exit(1);
  }
}

startServer();

export default app;
