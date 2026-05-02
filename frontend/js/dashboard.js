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

    // --- ĐIỀU HƯỚNG SIDEBAR (SPA ROUTING) ---
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const viewSections = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('pageTitle');

    sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            // Xóa active khỏi tất cả menu items
            sidebarItems.forEach(i => i.classList.remove('active'));
            // Thêm active cho menu item được click
            item.classList.add('active');

            // Ẩn tất cả các view
            viewSections.forEach(view => view.classList.remove('active'));
            
            // Hiện view tương ứng
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');

            // Cập nhật tiêu đề trang
            pageTitle.textContent = item.textContent.trim().split(' ')[1] || item.textContent.trim();
        });
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
        delete addProductForm.dataset.editId; // Xóa trạng thái sửa
        document.querySelector('#productModal h2').textContent = 'Thêm sản phẩm mới';
        productModal.style.display = 'flex';
    });

    // Đóng modal thêm sản phẩm
    closeProductModal.addEventListener('click', () => {
        productModal.style.display = 'none';
    });

    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) productModal.style.display = 'none';
    });

    // Xử lý submit form thêm/sửa sản phẩm
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

        const isEditing = addProductForm.dataset.editId !== undefined;
        const editId = addProductForm.dataset.editId;

        try {
            // Thay đổi text của nút để báo đang xử lý
            const submitBtn = addProductForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Đang lưu...';
            submitBtn.disabled = true;

            const url = isEditing ? `${API_URL}/products/edit/${editId}` : `${API_URL}/products/create`;
            const method = isEditing ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newProductData)
            });

            if (response.ok) {
                alert(isEditing ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
                productModal.style.display = 'none';
                loadProducts(); // Tải lại bảng dữ liệu
            } else {
                const errorData = await response.json();
                alert(`Lỗi: ${errorData.detail || 'Không thể lưu sản phẩm'}`);
            }
        } catch (error) {
            console.error("Lỗi khi lưu sản phẩm:", error);
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

// Biến toàn cục để lưu danh sách sản phẩm hiện tại
let currentProducts = [];
let currentPage = 1;
const itemsPerPage = 5;

// Format tiền tệ VNĐ
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

function renderProducts(page) {
    const tableBody = document.getElementById('productTableBody');
    
    if (currentProducts.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">Chưa có sản phẩm nào. Hãy thêm mới!</td></tr>';
        document.getElementById('paginationInfo').textContent = 'Hiển thị 0 sản phẩm';
        document.getElementById('pageNumbers').innerHTML = '';
        document.getElementById('prevPageBtn').disabled = true;
        document.getElementById('nextPageBtn').disabled = true;
        return;
    }

    const totalPages = Math.ceil(currentProducts.length / itemsPerPage);
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    currentPage = page;

    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, currentProducts.length);
    
    const productsToShow = currentProducts.slice(startIndex, endIndex);

    tableBody.innerHTML = '';

    productsToShow.forEach(p => {
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
    
    document.getElementById('prevPageBtn').disabled = page === 1;
    document.getElementById('nextPageBtn').disabled = page === totalPages;

    const pageNumbersContainer = document.getElementById('pageNumbers');
    pageNumbersContainer.innerHTML = '';
    
    // Giới hạn hiển thị số trang nếu có quá nhiều trang (tùy chọn, ở đây hiện hết)
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `btn ${i === page ? 'btn-primary' : ''}`;
        btn.style.padding = '4px 10px';
        btn.style.minWidth = '32px';
        if (i !== page) {
            btn.style.background = 'white';
            btn.style.color = 'var(--text-main)';
            btn.style.border = '1px solid var(--border-color)';
        }
        btn.onclick = () => renderProducts(i);
        pageNumbersContainer.appendChild(btn);
    }
}

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products/`);
        if (response.ok) {
            currentProducts = await response.json();
            
            // Cập nhật số lượng
            document.getElementById('productCount').textContent = currentProducts.length;
            
            // Render trang 1
            renderProducts(1);
        }
    } catch (error) {
        console.error("Lỗi khi load sản phẩm:", error);
        document.getElementById('productTableBody').innerHTML = 
            '<tr><td colspan="6" class="empty-state" style="color: #ef4444;">Lỗi khi tải dữ liệu. Vui lòng thử lại!</td></tr>';
    }
}

// Xử lý sự kiện nút Previous / Next
document.getElementById('prevPageBtn').addEventListener('click', () => {
    if (currentPage > 1) renderProducts(currentPage - 1);
});

document.getElementById('nextPageBtn').addEventListener('click', () => {
    const totalPages = Math.ceil(currentProducts.length / itemsPerPage);
    if (currentPage < totalPages) renderProducts(currentPage + 1);
});

// Xử lý mở form sửa sản phẩm
window.editProduct = (id) => {
    // Tìm sản phẩm trong danh sách hiện tại
    const product = currentProducts.find(p => p.id === id);
    if (!product) return;

    // Điền thông tin vào form
    document.getElementById('prodTitle').value = product.title;
    document.getElementById('prodSku').value = product.sku;
    document.getElementById('prodPrice').value = product.price;
    document.getElementById('prodStock').value = product.stock;
    document.getElementById('prodCategory').value = product.category;
    document.getElementById('prodThumbnail').value = product.thumbnail || '';
    document.getElementById('prodDesc').value = product.description || '';

    // Đánh dấu form đang ở chế độ chỉnh sửa (lưu ID vào data attribute)
    const form = document.getElementById('addProductForm');
    form.dataset.editId = id;
    
    // Đổi tiêu đề modal
    document.querySelector('#productModal h2').textContent = 'Chỉnh sửa sản phẩm';
    
    // Hiển thị modal
    document.getElementById('productModal').style.display = 'flex';
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
