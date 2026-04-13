import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

export async function setupDatabase(): Promise<void> {
  // Kết nối không chỉ định database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  const dbName = process.env.DB_NAME || "web_read_book";

  try {
    console.log("🔧 Đang kiểm tra database...");

    // Tạo database nếu chưa có
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    await connection.query(`USE \`${dbName}\``);

    console.log(`✅ Database "${dbName}" đã sẵn sàng`);

    // Tạo bảng users
    await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) NOT NULL UNIQUE,
                email VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100) NOT NULL,
                role ENUM('user', 'admin') DEFAULT 'user',
                avatar VARCHAR(255) DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB
        `);
    console.log("✅ Bảng users đã sẵn sàng");

    // Tạo bảng categories
    await connection.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB
        `);
    console.log("✅ Bảng categories đã sẵn sàng");

    // Tạo bảng books
    await connection.query(`
            CREATE TABLE IF NOT EXISTS books (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255) NOT NULL,
                description TEXT,
                cover_image VARCHAR(255) DEFAULT NULL,
                file_path VARCHAR(255) NOT NULL,
                file_type ENUM('pdf', 'epub') NOT NULL,
                category_id INT,
                uploaded_by INT,
                total_pages INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
                FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
            ) ENGINE=InnoDB
        `);
    console.log("✅ Bảng books đã sẵn sàng");

    // Tạo bảng reading_progress
    await connection.query(`
            CREATE TABLE IF NOT EXISTS reading_progress (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                book_id INT NOT NULL,
                current_page INT DEFAULT 0,
                current_location VARCHAR(255) DEFAULT NULL,
                last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user_book (user_id, book_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
            ) ENGINE=InnoDB
        `);
    console.log("✅ Bảng reading_progress đã sẵn sàng");

    // Tạo admin mặc định nếu chưa có
    const [admins] = (await connection.query(
      'SELECT id FROM users WHERE role = "admin" LIMIT 1',
    )) as any;

    if (admins.length === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      await connection.query(
        "INSERT INTO users (username, email, password, full_name, role) VALUES (?, ?, ?, ?, ?)",
        [
          "admin",
          "admin@bookread.com",
          hashedPassword,
          "Administrator",
          "admin",
        ],
      );
      console.log("✅ Tạo tài khoản admin mặc định:");
      console.log("   👤 Username: admin");
      console.log("   🔑 Password: admin123");
    }

    // Thêm categories mẫu nếu chưa có
    const [cats] = (await connection.query(
      "SELECT id FROM categories LIMIT 1",
    )) as any;
    if (cats.length === 0) {
      const categories = [
        ["Văn học", "Sách văn học trong và ngoài nước"],
        ["Khoa học", "Sách khoa học tự nhiên và xã hội"],
        ["Công nghệ", "Sách về công nghệ thông tin, lập trình"],
        ["Kinh tế", "Sách kinh tế, tài chính, quản trị"],
        ["Tâm lý", "Sách tâm lý học, phát triển bản thân"],
        ["Lịch sử", "Sách lịch sử Việt Nam và thế giới"],
      ];
      for (const [name, desc] of categories) {
        await connection.query(
          "INSERT INTO categories (name, description) VALUES (?, ?)",
          [name, desc],
        );
      }
      console.log("✅ Đã thêm các thể loại mẫu");
    }

    console.log("\n🎉 Setup database hoàn tất!\n");
  } catch (error) {
    console.error("❌ Lỗi setup database:", error);
    throw error;
  } finally {
    await connection.end();
  }
}
