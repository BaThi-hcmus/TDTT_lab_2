import bcrypt
import jwt
import os
from datetime import datetime, timedelta
from firebase_admin import auth
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

    @staticmethod
    def create_access_token(data: dict):
        """
        Tạo mã JWT Token.
        """
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60)))
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, os.getenv("JWT_SECRET_KEY"), algorithm=os.getenv("JWT_ALGORITHM"))
        return encoded_jwt

    @staticmethod
    def authenticate_user(email: str, password: str):
        """
        Xác thực email và mật khẩu của user.
        """
        # 1. Tìm user theo email
        user_query = db.collection(collection_name).where("email", "==", email).get()
        if not user_query:
            return None, "Email không tồn tại!"
        
        user_data = user_query[0].to_dict()
        
        # 2. Kiểm tra mật khẩu
        if not AuthService.verify_password(password, user_data["hashed_password"]):
            return None, "Mật khẩu không chính xác!"
        
        return user_data, None

    @staticmethod
    def verify_google_token(id_token: str):
        """
        Xác thực ID Token từ Google và trả về thông tin User.
        """
        try:
            # 1. Xác thực token bằng Firebase Admin SDK
            decoded_token = auth.verify_id_token(id_token)
            email = decoded_token.get("email")
            full_name = decoded_token.get("name")
            avatar = decoded_token.get("picture")

            # 2. Kiểm tra xem user này đã tồn tại trong DB của mình chưa
            user_query = db.collection(collection_name).where("email", "==", email).get()
            
            if user_query:
                # Nếu đã có, lấy thông tin user
                user_data = user_query[0].to_dict()
            else:
                # Nếu chưa có, tạo mới user từ thông tin Google trả về
                user_data = {
                    "id": decoded_token.get("uid"), # Dùng luôn UID của Firebase
                    "username": email.split("@")[0],
                    "email": email,
                    "full_name": full_name,
                    "role": "user",
                    "avatar": avatar,
                    "is_active": True,
                    "created_at": datetime.utcnow()
                }
                db.collection(collection_name).document(user_data["id"]).set(user_data)
            
            return user_data, None
        except Exception as e:
            return None, f"Token không hợp lệ hoặc đã hết hạn: {str(e)}"
