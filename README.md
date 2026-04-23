# 📚 BookRead - Website Đọc Sách Trực Tuyến

<div align="center">

![BookRead]
![Node.js]
![TypeScript]
![Express]
![MySQL]
![TailwindCSS]

**Nền tảng đọc sách trực tuyến miễn phí, hỗ trợ PDF & EPUB — đọc mọi lúc, mọi nơi.**

</div>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng](#-tính-năng)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Cài đặt & Chạy](#-cài-đặt--chạy)
- [Cấu hình](#-cấu-hình)
- [Tài khoản mặc định](#-tài-khoản-mặc-định)
- [Screenshots](#-screenshots)
- [API Routes](#-api-routes)

---

## 🎯 Giới thiệu

**BookRead** là một website đọc sách trực tuyến được xây dựng bằng Node.js, Express và TypeScript. Ứng dụng cho phép người dùng đọc sách định dạng PDF và EPUB trực tiếp trên trình duyệt, với khả năng lưu tiến trình đọc và quản lý thư viện sách cá nhân.

---

## ✨ Tính năng

### 👤 Người dùng

- 🔐 **Đăng ký / Đăng nhập** — Hệ thống xác thực với bcrypt
- 📖 **Đọc PDF trực tuyến** — Trình đọc PDF tích hợp (pdf.js) với zoom, điều hướng trang
- 📕 **Đọc EPUB trực tuyến** — Trình đọc EPUB tích hợp (epub.js) với mục lục, tùy chỉnh font, theme
- 💾 **Lưu tiến trình đọc** — Tự động lưu vị trí đọc, tiếp tục đọc bất kỳ lúc nào
- 🔍 **Tìm kiếm sách** — Tìm theo tên sách hoặc tác giả
- 🏷️ **Lọc theo thể loại** — Phân loại sách theo danh mục
- 🔥 **Sách đọc nhiều** — Xem danh sách sách phổ biến, được đọc nhiều nhất
- 📱 **Responsive** — Giao diện tương thích mọi kích thước màn hình
- 🌙 **Dark Mode** — Chuyển đổi chế độ sáng/tối, lưu preference

### 🛠️ Quản trị viên (Admin)

- 📊 **Dashboard** — Tổng quan thống kê (số sách, người dùng, thể loại)
- 📚 **Quản lý sách** — Thêm, sửa, xóa sách (upload PDF/EPUB + ảnh bìa)
- 👥 **Quản lý người dùng** — Thêm, sửa, xóa, đổi mật khẩu, phân quyền
- 📂 **Quản lý thể loại** — Phân loại sách theo danh mục
- 📈 **Thống kê & Báo cáo** — 7 biểu đồ trực quan với Chart.js:
  - 🍩 Sách theo thể loại (Doughnut Chart)
  - 🍩 Định dạng sách PDF vs EPUB (Doughnut Chart)
  - 📈 Sách upload theo tháng - 12 tháng gần nhất (Line Chart)
  - 📊 Người dùng đăng ký theo tháng - 12 tháng gần nhất (Bar Chart)
  - 🏆 Top 10 sách xem nhiều nhất (Horizontal Bar Chart)
  - 👑 Tỉ lệ vai trò Admin vs User (Doughnut Chart)
  - 🥇 Top 10 người dùng đọc nhiều nhất (Bar Chart)

### 🎨 Giao diện

- ✅ Scroll Reveal Animation — Hiệu ứng xuất hiện mượt khi cuộn trang
- ✅ Skeleton Loading — Hiệu ứng shimmer khi tải ảnh bìa sách
- ✅ Scroll to Top — Nút cuộn lên đầu trang
- ✅ Navbar Active State — Highlight menu đang active
- ✅ Dark Mode — Chuyển đổi sáng/tối
- ✅ Trang 404 — Trang lỗi với animation đẹp mắt
- ✅ Flash Messages — Thông báo tự động ẩn sau 5 giây

---

## 🛠 Công nghệ sử dụng

| Thành phần         | Công nghệ                              |
| ------------------ | -------------------------------------- |
| **Backend**        | Node.js, Express.js, TypeScript        |
| **Frontend**       | EJS (Template Engine), TailwindCSS 3.4 |
| **Database**       | MySQL 8.0 (mysql2)                     |
| **Authentication** | express-session, bcryptjs              |
| **File Upload**    | Multer                                 |
| **PDF Reader**     | pdf.js                                 |
| **EPUB Reader**    | epub.js                                |
| **Charts**         | Chart.js 4.4                           |
| **Icons**          | Font Awesome 6.5                       |
| **Fonts**          | Google Fonts (Manrope, Inter)          |

---

## 📁 Cấu trúc dự án

```
web-read-book/
├── database/
│   └── init.sql                # Script khởi tạo database
├── src/
│   ├── config/
│   │   ├── database.ts         # Kết nối MySQL pool
│   │   └── setupDatabase.ts    # Tự động tạo bảng khi khởi động
│   ├── middlewares/
│   │   ├── auth.ts             # Middleware xác thực (isAuthenticated, isAdmin, isGuest)
│   │   └── upload.ts           # Cấu hình Multer upload file
│   ├── public/
│   │   ├── css/
│   │   │   ├── input.css       # TailwindCSS source
│   │   │   └── output.css      # CSS đã build
│   │   └── uploads/
│   │       ├── books/          # File sách (PDF, EPUB)
│   │       └── covers/         # Ảnh bìa sách
│   ├── routes/
│   │   ├── auth.ts             # Routes đăng nhập, đăng ký, đăng xuất
│   │   ├── books.ts            # Routes thư viện, đọc sách, lưu tiến trình
│   │   └── admin.ts            # Routes quản trị (CRUD sách, người dùng)
│   ├── views/
│   │   ├── partials/           # Components dùng chung
│   │   │   ├── header.ejs      # Head HTML, meta, CSS, dark mode script
│   │   │   ├── navbar.ejs      # Thanh điều hướng (responsive + dark mode toggle)
│   │   │   ├── footer.ejs      # Footer + scroll reveal + scroll-to-top scripts
│   │   │   └── flash.ejs       # Flash messages (success/error)
│   │   ├── auth/
│   │   │   ├── login.ejs       # Trang đăng nhập
│   │   │   └── register.ejs    # Trang đăng ký
│   │   ├── books/
│   │   │   ├── index.ejs       # Thư viện sách (grid + search + filter + pagination)
│   │   │   ├── detail.ejs      # Chi tiết sách
│   │   │   ├── reader-pdf.ejs  # Trình đọc PDF
│   │   │   └── reader-epub.ejs # Trình đọc EPUB
│   │   ├── admin/
│   │   │   ├── dashboard.ejs   # Dashboard quản trị
│   │   │   ├── statistics.ejs  # Thống kê & Báo cáo (7 biểu đồ Chart.js)
│   │   │   ├── books/          # CRUD sách (index, add, edit)
│   │   │   ├── users/          # CRUD người dùng (index, add, edit)
│   │   │   └── partials/       # Sidebar, footer admin
│   │   ├── home.ejs            # Trang chủ (hero, stats, features, CTA)
│   │   └── 404.ejs             # Trang lỗi 404
│   └── server.ts               # Entry point, cấu hình Express
├── tailwind.config.js          # Cấu hình TailwindCSS (dark mode, custom colors)
├── tsconfig.json               # Cấu hình TypeScript
├── package.json
└── README.md
```

---

## 🚀 Cài đặt & Chạy

### Yêu cầu hệ thống

- **Node.js** >= 18.x
- **MySQL** >= 8.0
- **npm** >= 9.x

### Bước 1: Clone dự án

```bash
git clone https://github.com/your-username/web-read-book.git
cd web-read-book
```

### Bước 2: Cài đặt dependencies

```bash
npm install
```

### Bước 3: Tạo database

Có 2 cách:

**Cách 1: Tự động** — Server sẽ tự tạo bảng khi khởi động (khuyên dùng)

Chỉ cần tạo database trống trong MySQL:

```sql
CREATE DATABASE web_read_book CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

**Cách 2: Thủ công** — Import file SQL

```bash
mysql -u root -p < database/init.sql
```

### Bước 4: Cấu hình môi trường

Tạo file `.env` ở thư mục gốc:

```env
# Server
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=web_read_book

# Session
SESSION_SECRET=your-secret-key-change-this-in-production
```

### Bước 5: Build TailwindCSS

```bash
npm run tailwind:build
```

### Bước 6: Chạy ứng dụng

**Development:**

```bash
npm run dev
```

**Production:**

```bash
npm run build
npm start
```

### Bước 7: Truy cập

Mở trình duyệt và truy cập: **http://localhost:3000**

---

## ⚙️ Cấu hình

### Biến môi trường (.env)

| Biến             | Mô tả                  | Mặc định             |
| ---------------- | ---------------------- | -------------------- |
| `PORT`           | Cổng chạy server       | `3000`               |
| `DB_HOST`        | Host MySQL             | `localhost`          |
| `DB_PORT`        | Port MySQL             | `3306`               |
| `DB_USER`        | User MySQL             | `root`               |
| `DB_PASSWORD`    | Password MySQL         | (trống)              |
| `DB_NAME`        | Tên database           | `web_read_book`      |
| `SESSION_SECRET` | Secret key cho session | `default-secret-key` |

### Scripts

| Script                   | Mô tả                              |
| ------------------------ | ---------------------------------- |
| `npm run dev`            | Chạy development server (ts-node)  |
| `npm run build`          | Compile TypeScript sang JavaScript |
| `npm start`              | Chạy production server             |
| `npm run tailwind:build` | Build TailwindCSS một lần          |
| `npm run tailwind:watch` | Watch & auto-build TailwindCSS     |

---

## 🔑 Tài khoản mặc định

Sau khi khởi tạo database, hệ thống tự tạo tài khoản admin:

| Thông tin    | Giá trị       |
| ------------ | ------------- |
| **Username** | `admin`       |
| **Password** | `admin123`    |
| **Role**     | Administrator |

> ⚠️ **Lưu ý:** Hãy đổi mật khẩu admin ngay sau khi đăng nhập lần đầu!

---

## 📸 Screenshots

### Trang chủ

- Hero section với gradient animation
- Thống kê (500+ sách, PDF & EPUB, 100% miễn phí)
- Tính năng nổi bật
- Sách mới cập nhật

### Thư viện sách

- Grid sách responsive (2-6 cột)
- Tìm kiếm theo tên/tác giả
- Lọc theo thể loại
- Phân trang

### Trình đọc sách

- **PDF:** Zoom, điều hướng trang, phím tắt
- **EPUB:** Mục lục, tùy chỉnh font size, theme (sáng/sepia/tối)

### Admin Dashboard

- Thống kê tổng quan
- Quản lý sách & người dùng

### Thống kê & Báo cáo

- 4 thẻ tổng quan (Tổng sách, Người dùng, Lượt xem, Đang đọc)
- 7 biểu đồ tương tác (Doughnut, Line, Bar, Horizontal Bar)
- Dữ liệu realtime từ database

---

## 🗺 API Routes

### Public Routes

| Method | Route | Mô tả     |
| ------ | ----- | --------- |
| GET    | `/`   | Trang chủ |

### Auth Routes (`/auth`)

| Method | Route            | Mô tả           |
| ------ | ---------------- | --------------- |
| GET    | `/auth/login`    | Form đăng nhập  |
| POST   | `/auth/login`    | Xử lý đăng nhập |
| GET    | `/auth/register` | Form đăng ký    |
| POST   | `/auth/register` | Xử lý đăng ký   |
| GET    | `/auth/logout`   | Đăng xuất       |

### Book Routes (`/books`) — Yêu cầu đăng nhập

| Method | Route                 | Mô tả                                       |
| ------ | --------------------- | ------------------------------------------- |
| GET    | `/books`              | Danh sách sách (search, filter, pagination) |
| GET    | `/books/:id`          | Chi tiết sách                               |
| GET    | `/books/:id/read`     | Đọc sách (PDF/EPUB reader)                  |
| POST   | `/books/:id/progress` | Lưu tiến trình đọc (API JSON)               |

### Admin Routes (`/admin`) — Yêu cầu quyền admin

| Method | Route                              | Mô tả                          |
| ------ | ---------------------------------- | ------------------------------ |
| GET    | `/admin`                           | Dashboard                      |
| GET    | `/admin/statistics`                | Thống kê & Báo cáo (7 biểu đồ) |
| GET    | `/admin/books`                     | Danh sách sách                 |
| GET    | `/admin/books/add`                 | Form thêm sách                 |
| POST   | `/admin/books/add`                 | Xử lý thêm sách (upload file)  |
| GET    | `/admin/books/edit/:id`            | Form sửa sách                  |
| POST   | `/admin/books/edit/:id`            | Xử lý sửa sách                 |
| POST   | `/admin/books/delete/:id`          | Xóa sách                       |
| GET    | `/admin/users`                     | Danh sách người dùng           |
| GET    | `/admin/users/add`                 | Form thêm người dùng           |
| POST   | `/admin/users/add`                 | Xử lý thêm người dùng          |
| GET    | `/admin/users/edit/:id`            | Form sửa người dùng            |
| POST   | `/admin/users/edit/:id`            | Xử lý sửa người dùng           |
| POST   | `/admin/users/change-password/:id` | Đổi mật khẩu                   |
| POST   | `/admin/users/delete/:id`          | Xóa người dùng                 |

---

## 📄 Database Schema

### Bảng `users`

| Cột       | Kiểu                 | Mô tả                  |
| --------- | -------------------- | ---------------------- |
| id        | INT (PK)             | ID tự tăng             |
| username  | VARCHAR(50)          | Tên đăng nhập (unique) |
| email     | VARCHAR(100)         | Email (unique)         |
| password  | VARCHAR(255)         | Mật khẩu (bcrypt hash) |
| full_name | VARCHAR(100)         | Họ tên                 |
| role      | ENUM('user','admin') | Vai trò                |
| avatar    | VARCHAR(255)         | Ảnh đại diện           |

### Bảng `categories`

| Cột         | Kiểu         | Mô tả                 |
| ----------- | ------------ | --------------------- |
| id          | INT (PK)     | ID tự tăng            |
| name        | VARCHAR(100) | Tên thể loại (unique) |
| description | TEXT         | Mô tả                 |

### Bảng `books`

| Cột         | Kiểu               | Mô tả               |
| ----------- | ------------------ | ------------------- |
| id          | INT (PK)           | ID tự tăng          |
| title       | VARCHAR(255)       | Tên sách            |
| author      | VARCHAR(255)       | Tác giả             |
| description | TEXT               | Mô tả               |
| cover_image | VARCHAR(255)       | Đường dẫn ảnh bìa   |
| file_path   | VARCHAR(255)       | Đường dẫn file sách |
| file_type   | ENUM('pdf','epub') | Loại file           |
| category_id | INT (FK)           | ID thể loại         |
| uploaded_by | INT (FK)           | ID người upload     |

### Bảng `reading_progress`

| Cột              | Kiểu         | Mô tả                |
| ---------------- | ------------ | -------------------- |
| id               | INT (PK)     | ID tự tăng           |
| user_id          | INT (FK)     | ID người dùng        |
| book_id          | INT (FK)     | ID sách              |
| current_page     | INT          | Trang hiện tại (PDF) |
| current_location | VARCHAR(255) | Vị trí CFI (EPUB)    |
| last_read_at     | TIMESTAMP    | Thời gian đọc cuối   |

---

## 👥 Phân công công việc

### Thành viên nhóm

| STT | Họ và tên             | Tỉ lệ đóng góp |
| --- | --------------------- | -------------- |
| 1   | **Trần Duy Trường**   | 40%            |
| 2   | **Trần Thị Xuân Mến** | 30%            |
| 3   | **Trần Gia Thành**    | 30%            |

### Chi tiết phân công

| Công việc                      | Trần Duy Trường (40%)                                                                                                                                        | Trần Thị Xuân Mến (30%)                                                                 | Trần Gia Thành (30%)                                                                            |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Business Analysis (BA)**     | Phân tích yêu cầu chức năng chính, định hướng kiến trúc hệ thống                                                                                             | Phân tích yêu cầu người dùng, viết đặc tả use case                                      | Phân tích yêu cầu phi chức năng, khảo sát người dùng                                            |
| **Thiết kế Database**          | Thiết kế schema chính (users, books, reading_progress), tối ưu query                                                                                         | Thiết kế bảng categories, định nghĩa quan hệ giữa các bảng                              | Tạo dữ liệu mẫu, viết script khởi tạo database                                                  |
| **Thiết kế giao diện (UI/UX)** | Thiết kế layout tổng thể, hệ thống design (màu sắc, typography, components)                                                                                  | Thiết kế giao diện trang chủ, trang đăng nhập/đăng ký                                   | Thiết kế giao diện thư viện sách, trang chi tiết sách                                           |
| **Frontend**                   | Code giao diện Admin (Dashboard, Thống kê, Quản lý sách & người dùng), Trình đọc PDF/EPUB, Dark Mode, Responsive                                             | Code giao diện trang chủ (Hero, Features, CTA), trang đăng nhập/đăng ký, Flash Messages | Code giao diện thư viện sách (Grid, Search, Filter, Pagination), trang chi tiết sách, trang 404 |
| **Backend**                    | Xây dựng kiến trúc server, cấu hình Express/TypeScript, Routes & Controllers Admin (CRUD sách, người dùng, thống kê), Authentication middleware, Upload file | Routes đăng nhập/đăng ký/đăng xuất, Session management, Validation dữ liệu              | Routes thư viện sách (search, filter, pagination), API lưu tiến trình đọc, Cấu hình database    |
| **Kiểm thử & Triển khai**      | Review code, fix bugs, tối ưu hiệu năng                                                                                                                      | Kiểm thử chức năng người dùng, viết tài liệu hướng dẫn                                  | Kiểm thử giao diện responsive, viết README documentation                                        |

---

## 📝 License

Dự án này được phát triển cho mục đích học tập.

---

<div align="center">

**Được thiết kế với ❤️ cho người yêu sách**

</div>
