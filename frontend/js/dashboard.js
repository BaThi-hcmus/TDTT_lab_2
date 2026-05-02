import { API_URL } from "./config.js";

document.addEventListener('DOMContentLoaded', () => {
    const userModal = document.getElementById('userModal');
    const userProfileBtn = document.getElementById('userProfile');
    const closeModalBtn = document.getElementById('closeModal');
    const logoutBtn = document.getElementById('logoutBtn');

    // 1. Hiển thị tên user từ localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
        document.getElementById('userName').textContent = user.full_name || user.email;
        document.getElementById('welcomeName').textContent = (user.full_name || 'Admin').split(' ').pop();
    } else {
        // Chưa đăng nhập -> quay về trang login
        window.location.href = 'index.html';
        return;
    }

    // 2. Click vào tên user -> mở modal thông tin
    userProfileBtn.addEventListener('click', async () => {
        // Hiển thị thông tin từ localStorage trước
        document.getElementById('profileName').textContent = user.full_name || '--';
        document.getElementById('profileEmail').textContent = user.email || '--';
        document.getElementById('profileRole').textContent = user.role || 'user';
        document.getElementById('profileUsername').textContent = user.username || user.email.split('@')[0];

        // Nếu có avatar (đăng nhập Google)
        const avatarEl = document.getElementById('profileAvatar');
        if (user.avatar) {
            avatarEl.innerHTML = `<img src="${user.avatar}" alt="Avatar">`;
        }

        userModal.style.display = 'flex';

        // Gọi API /auth/me để lấy thông tin mới nhất từ server
        try {
            const response = await fetch(`${API_URL}/auth/me`, {
                credentials: 'include'
            });
            if (response.ok) {
                const freshUser = await response.json();
                document.getElementById('profileName').textContent = freshUser.full_name || '--';
                document.getElementById('profileEmail').textContent = freshUser.email || '--';
                document.getElementById('profileRole').textContent = freshUser.role || 'user';
                document.getElementById('profileUsername').textContent = freshUser.username || freshUser.email.split('@')[0];
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin user:", error);
        }
    });

    // 3. Đóng modal
    closeModalBtn.addEventListener('click', () => {
        userModal.style.display = 'none';
    });

    userModal.addEventListener('click', (e) => {
        if (e.target === userModal) userModal.style.display = 'none';
    });

    // 4. Đăng xuất
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('user');
        window.location.href = 'index.html';
    });

    // 5. Load số lượng sản phẩm
    loadProductCount();
});

async function loadProductCount() {
    try {
        const response = await fetch(`${API_URL}/products/`);
        if (response.ok) {
            const products = await response.json();
            document.getElementById('productCount').textContent = products.length;
        }
    } catch (error) {
        console.error("Lỗi khi load sản phẩm:", error);
    }
}
