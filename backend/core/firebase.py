import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

# Load các biến môi trường từ file .env
load_dotenv()

# Tạo dictionary cấu hình từ các biến trong .env
firebase_config = {
    "type": "service_account",
    "project_id": os.getenv("FIREBASE_PROJECT_ID"),
    "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace("\\n", "\n"),
    "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
    "token_uri": "https://oauth2.googleapis.com/token",
}

# Khởi tạo Firebase App nếu chưa được khởi tạo
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(firebase_config)
        firebase_admin.initialize_app(cred)
        print("Đã kết nối Firebase thành công!")
    except Exception as e:
        print(f"Lỗi khi kết nối Firebase: {e}")

def get_firestore_client():
    """
    Hàm trả về instance của Firestore để tương tác với cơ sở dữ liệu.
    """
    return firestore.client()
