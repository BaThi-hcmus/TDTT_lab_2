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

    // 5. Load danh sách sản phẩm
    loadProducts();
});

// Format tiền tệ VNĐ
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products/`);
        if (response.ok) {
            const products = await response.json();
            
            // Cập nhật số lượng
            document.getElementById('productCount').textContent = products.length;
            
            // Render bảng
            const tableBody = document.getElementById('productTableBody');
            
            if (products.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">Chưa có sản phẩm nào. Hãy thêm mới!</td></tr>';
                return;
            }

            tableBody.innerHTML = ''; // Xóa chữ "Đang tải dữ liệu..."

            products.forEach(p => {
                // Determine badge class for status
                let statusBadge = '';
                if (p.availabilityStatus === 'In Stock') {
                    statusBadge = '<span class="badge badge-green">Còn hàng</span>';
                } else if (p.availabilityStatus === 'Low Stock') {
                    statusBadge = '<span class="badge badge-blue">Sắp hết</span>';
                } else {
                    statusBadge = '<span class="badge badge-red">Hết hàng</span>';
                }

                // Hình ảnh mặc định nếu không có thumbnail
                const imgSrc = p.thumbnail || 'https://via.placeholder.com/48?text=No+Image';

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>
                        <div class="product-cell">
                            <img src="${imgSrc}" alt="${p.title}" class="product-thumb">
                            <div class="product-info">
                                <span class="product-title">${p.title}</span>
                                <span class="product-sku">SKU: ${p.sku}</span>
                            </div>
                        </div>
                    </td>
                    <td style="color: var(--text-muted);">${p.category}</td>
                    <td style="font-weight: 500;">${formatCurrency(p.price)}</td>
                    <td>${p.stock}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="action-btn" onclick="editProduct('${p.id}')">Sửa</button>
                        <button class="action-btn" style="color: var(--error);" onclick="deleteProduct('${p.id}')">Xóa</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });

        }
    } catch (error) {
        console.error("Lỗi khi load sản phẩm:", error);
        document.getElementById('productTableBody').innerHTML = 
            '<tr><td colspan="6" class="empty-state" style="color: #ef4444;">Lỗi khi tải dữ liệu. Vui lòng thử lại!</td></tr>';
    }
}

// Giữ lại scope cho các hàm onClick
window.editProduct = (id) => {
    alert("Tính năng sửa sản phẩm ID: " + id + " đang được phát triển.");
};

window.deleteProduct = (id) => {
    if(confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
        alert("Tính năng xóa sản phẩm ID: " + id + " đang được phát triển.");
    }
};
