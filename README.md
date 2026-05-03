# Dự án Quản lý Bán hàng (Admin Dashboard)
## Tổng quan hệ thống:
- Hệ thống quản lí bán hàng phía Admin
- Giúp quản trị viên có thể quản lí thông tin sản phẩm, đơn hàng, và người dùng một cách tối ưu và bảo mật

## Công nghệ sử dụng: 
- Backend: FastAPI
- Frontend: Javascript, HTML, CSS, áp dụng kiến trúc Single Page Application, giúp người dùng có trải nghiệm mượt mà khi chuyển tab mà không cần tải loại toàn bộ trang web
- Database: Firebase Firestore

## Các tính năng chính: 
- Hệ thống xác thực: có 2 cách xác thực tài khoản:
    + Sử dụng email và password
    + Sử dụng Google Sign-in    
- Quản lí sản phẩm: có thể thêm, sửa, xóa và xem chỉ tiết sản phẩm

## Các endpoint của hệ thống: 
- GET / => hiển thị thông tin tổng quan về hệ thống
- GET /health => kiểm tra trạng thái hoạt động của hệ thống
- POST /auth/login => đăng nhập tài khoản bằng email + password
- POST /auth/logout => đăng xuất tài khoản
- POST /auth/google => đăng nhập bằng Google
- POST /auth/me => lấy thông tin tài khoản sau khi đăng nhập
- GET /products => lấy danh sách sản phẩm
- POST /products/create => thêm sản phẩm mới
- GET /products/detail/:id => lấy chi tiết sản phẩm
- PATCH /products/edit/:id => cập nhật sản phẩm
- DELETE /products/delete/:id => xóa sản phẩm

## Mục lục
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Hướng dẫn cài đặt Environment](#hướng-dẫn-cài-đặt-environment)
- [Hướng dẫn chạy Backend](#hướng-dẫn-chạy-backend)
- [Hướng dẫn chạy Frontend](#hướng-dẫn-chạy-frontend)
- [Video Demo](#video-demo)

---

## Yêu cầu hệ thống
- **Python**: Phiên bản 3.9 trở lên.
- **Trình duyệt**: Chrome, Edge hoặc Firefox bản mới nhất.
- **Tài khoản Firebase**: Đã cấu hình Firestore Database.

---

## Hướng dẫn cài đặt Environment

1. **Clone project và tạo môi trường ảo :**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Trên Linux/macOS
   .\venv\Scripts\activate   # Trên Windows
   ```

2. **Cài đặt các thư viện cần thiết:**
   Dự án sử dụng các thư viện chính: `fastapi`, `uvicorn`, `google-cloud-firestore`, `python-dotenv`.
   ```bash
   pip install -r requirements.txt
   ```

3. **Cấu hình Firebase:**
   - Đảm bảo file `firebase-key.json` (Service Account) đã được đặt đúng vị trí hoặc đã cấu hình biến môi trường theo hướng dẫn trong `backend/core/firebase.py`.
   - Cấu hình các thông số Firebase Web SDK trong `frontend/js/config.js`.

---

## Hướng dẫn chạy Backend

Backend được xây dựng bằng FastAPI, chạy tại cổng **8000**.

1. Mở terminal tại thư mục gốc của dự án.
2. Chạy lệnh sau:
   ```bash
   uvicorn backend.main:app --reload
   ```
3. Sau khi chạy, có thể truy cập tài liệu API tại: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## Hướng dẫn chạy Frontend

Frontend là ứng dụng Vanilla JS thuần túy, chạy tại cổng **3000**.

1. Mở một terminal mới tại thư mục gốc dự án.
2. Sử dụng Python để chạy một server local nhanh:
   ```bash
   python -m http.server 3000 --directory frontend
   ```
3. Truy cập vào Dashboard tại địa chỉ: [http://localhost:3000/dashboard.html](http://localhost:3000/dashboard.html)

---

## Video Demo

Xem hướng dẫn sử dụng và demo các tính năng (Thêm, Sửa, Xóa, Phân trang, Xem chi tiết) tại đây:

**[Link Video Demo tại đây]** https://drive.google.com/drive/folders/16seDtC92G1DzzorOQtqj6j5J_pQpp5Z2?usp=drive_link

---

## Tính năng chính đã hoàn thiện
- [x] Giao diện Dashboard, login, quản lí sản phẩm.
- [x] Cơ chế SPA chuyển tab không load lại trang.
- [x] Quản lý sản phẩm (CRUD) trực tiếp với Firestore.
- [x] Login bằng Firebase Authentication. 
- [x] Logout.
- [x] Phân trang .
- [x] Xem chi tiết sản phẩm.

