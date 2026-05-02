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

    // --- QUẢN LÝ SẢN PHẨM ---
    const productModal = document.getElementById('productModal');
    const addProductBtn = document.getElementById('addProductBtn');
    const closeProductModal = document.getElementById('closeProductModal');
    const addProductForm = document.getElementById('addProductForm');

    // Mở modal thêm sản phẩm
    addProductBtn.addEventListener('click', () => {
        addProductForm.reset(); // Xóa dữ liệu cũ trong form
        productModal.style.display = 'flex';
    });

    // Đóng modal thêm sản phẩm
    closeProductModal.addEventListener('click', () => {
        productModal.style.display = 'none';
    });

    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) productModal.style.display = 'none';
    });

    // Xử lý submit form thêm sản phẩm
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Thu thập thông tin từ Form
        const newProductData = {
            title: document.getElementById('prodTitle').value,
            sku: document.getElementById('prodSku').value,
            price: parseFloat(document.getElementById('prodPrice').value),
            stock: parseInt(document.getElementById('prodStock').value),
            category: document.getElementById('prodCategory').value,
            thumbnail: document.getElementById('prodThumbnail').value || 'https://via.placeholder.com/150',
            description: document.getElementById('prodDesc').value || 'Mô tả trống',
            
            // --- Các trường bắt buộc theo Schema nhưng không có trong UI form ---
            discountPercentage: 0,
            rating: 5.0,
            tags: ["new"],
            weight: 0.5,
            dimensions: { width: 10, height: 10, depth: 10 },
            warrantyInformation: "Bảo hành 12 tháng",
            shippingInformation: "Giao hàng tiêu chuẩn",
            availabilityStatus: document.getElementById('prodStock').value > 0 ? "In Stock" : "Out of Stock",
            reviews: [],
            returnPolicy: "Đổi trả 7 ngày",
            minimumOrderQuantity: 1,
            meta: {
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                barcode: "N/A",
                qrCode: "N/A"
            },
            images: []
        };

        try {
            // Thay đổi text của nút để báo đang xử lý
            const submitBtn = addProductForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Đang lưu...';
            submitBtn.disabled = true;

            const response = await fetch(`${API_URL}/products/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // credentials: 'include', // Bật lên nếu endpoint POST /products/ có yêu cầu xác thực JWT
                body: JSON.stringify(newProductData)
            });

            if (response.ok) {
                alert('Thêm sản phẩm thành công!');
                productModal.style.display = 'none';
                loadProducts(); // Tải lại bảng dữ liệu
            } else {
                const errorData = await response.json();
                alert(`Lỗi: ${errorData.detail || 'Không thể thêm sản phẩm'}`);
            }
        } catch (error) {
            console.error("Lỗi khi thêm sản phẩm:", error);
            alert("Lỗi kết nối tới máy chủ!");
        } finally {
            // Khôi phục trạng thái nút
            const submitBtn = addProductForm.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Lưu Sản Phẩm';
            submitBtn.disabled = false;
        }
    });

    // 5. Load danh sách sản phẩm ban đầu
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

window.deleteProduct = async (id) => {
    if(confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
        try {
            const response = await fetch(`${API_URL}/products/delete/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert("Đã xóa sản phẩm thành công!");
                // Tải lại danh sách sau khi xóa
                loadProducts();
            } else {
                const errorData = await response.json();
                alert(`Lỗi: ${errorData.detail || 'Không thể xóa sản phẩm'}`);
            }
        } catch (error) {
            console.error("Lỗi khi xóa sản phẩm:", error);
            alert("Lỗi kết nối tới máy chủ!");
        }
    }
};
