import { API_URL } from "./config.js";

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Kiểm tra trạng thái đăng nhập (đơn giản bằng cách check xem có thông tin user không)
    // Trong thực tế, ta nên gọi API /me để verify token trong cookie
    
    const logoutBtn = document.getElementById('logoutBtn');

    // Xử lý đăng xuất
    logoutBtn.addEventListener('click', () => {
        // Thực hiện xóa session/cookie (phía client chỉ có thể redirect, server sẽ xử lý cookie)
        alert('Đã đăng xuất!');
        window.location.href = 'index.html';
    });

    // 2. Load dữ liệu sơ bộ
    try {
        const response = await fetch(`${API_URL}/products/`);
        if (response.ok) {
            const products = await response.json();
            document.getElementById('productCount').textContent = products.length;
        }
    } catch (error) {
        console.error("Lỗi khi load sản phẩm:", error);
    }
});
