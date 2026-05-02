import bcrypt
from datetime import datetime
from backend.core.firebase import get_firestore_client
from backend.schemas.user import UserCreate

db = get_firestore_client()
collection_name = "users"

class AuthService:
    @staticmethod
    def hash_password(password: str) -> str:
        """
        Mã hóa mật khẩu bằng bcrypt.
        """
        # Chuyển mật khẩu sang dạng bytes để mã hóa
        pwd_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(pwd_bytes, salt)
        # Trả về dạng chuỗi (string) để lưu vào database
        return hashed_password.decode('utf-8')

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Kiểm tra mật khẩu thuần có khớp với bản mã hóa không.
        """
        return bcrypt.checkpw(
            plain_password.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )

    @staticmethod
    def create_user(user_data: UserCreate):
        """
        Kiểm tra email và tạo user mới trong Firestore.
        """
        # 1. Kiểm tra xem email đã tồn tại chưa
        existing_user = db.collection(collection_name).where("email", "==", user_data.email).get()
        if len(existing_user) > 0:
            return None, "Email đã được đăng ký!"

        # 2. Chuẩn bị dữ liệu để lưu
        user_dict = user_data.model_dump()
        
        # Mã hóa mật khẩu trực tiếp bằng bcrypt
        user_dict["hashed_password"] = AuthService.hash_password(user_data.password)
        
        # Loại bỏ mật khẩu thuần túy
        del user_dict["password"]
        
        # Thêm thông tin thời gian
        user_dict["created_at"] = datetime.utcnow()
        
        # 3. Lưu vào Firestore
        doc_ref = db.collection(collection_name).document()
        user_dict["id"] = doc_ref.id
        doc_ref.set(user_dict)
        
        return user_dict, None
