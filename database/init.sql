-- Tạo database
CREATE DATABASE IF NOT EXISTS web_read_book CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE web_read_book;

-- Bảng users
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
) ENGINE=InnoDB;

-- Bảng categories (thể loại sách)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Bảng books
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
) ENGINE=InnoDB;

-- Bảng reading_progress (tiến trình đọc sách)
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
) ENGINE=InnoDB;

-- Tạo tài khoản admin mặc định (password: admin123)
INSERT INTO users (username, email, password, full_name, role) VALUES
('admin', 'admin@bookread.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'admin');

-- Thêm một số thể loại mẫu
INSERT INTO categories (name, description) VALUES
('Văn học', 'Sách văn học trong và ngoài nước'),
('Khoa học', 'Sách khoa học tự nhiên và xã hội'),
('Công nghệ', 'Sách về công nghệ thông tin, lập trình'),
('Kinh tế', 'Sách kinh tế, tài chính, quản trị'),
('Tâm lý', 'Sách tâm lý học, phát triển bản thân'),
('Lịch sử', 'Sách lịch sử Việt Nam và thế giới');