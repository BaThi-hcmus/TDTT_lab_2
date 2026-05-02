import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { firebaseConfig, API_URL } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const loginForm = document.getElementById('loginForm');
const googleBtn = document.getElementById('googleLogin');
const errorMsg = document.getElementById('errorMessage');

const showError = (message) => {
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
};

// 1. Đăng nhập truyền thống
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (response.ok) {
            // Lưu thông tin user vào localStorage để Dashboard sử dụng
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } else {
            showError(data.detail || 'Đăng nhập thất bại');
        }
    } catch (error) {
        showError('Không thể kết nối tới server');
    }
});

// 2. Đăng nhập bằng Google
googleBtn.addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const idToken = await result.user.getIdToken();

        const response = await fetch(`${API_URL}/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ id_token: idToken })
        });
        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'dashboard.html';
        } else {
            showError(data.detail || 'Xác thực Google thất bại');
        }
    } catch (error) {
        if (error.code !== 'auth/popup-closed-by-user') {
            showError('Lỗi đăng nhập Google: ' + error.message);
        }
    }
});
