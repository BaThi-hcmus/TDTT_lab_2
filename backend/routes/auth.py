from fastapi import APIRouter, HTTPException, status, Response, Cookie
from typing import Optional
from backend.schemas.user import UserCreate, UserResponse, UserLogin, UserGoogleLogin
from backend.services.auth_service import AuthService
import jwt
import os

router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate):
    new_user, error = AuthService.create_user(user)
    if error:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
    return new_user

@router.post("/login")
def login(user_credentials: UserLogin, response: Response):
    user, error = AuthService.authenticate_user(user_credentials.email, user_credentials.password)
    if error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=error)
    
    access_token = AuthService.create_access_token(data={"sub": user["email"], "role": user["role"]})
    response.set_cookie(
        key="access_token", value=f"Bearer {access_token}",
        httponly=True, max_age=3600, samesite="lax", secure=False
    )
    return {
        "message": "Đăng nhập thành công!",
        "user": {
            "email": user["email"],
            "full_name": user.get("full_name", ""),
            "role": user["role"]
        }
    }

@router.post("/google")
def google_login(google_data: UserGoogleLogin, response: Response):
    user, error = AuthService.verify_google_token(google_data.id_token)
    if error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=error)
    
    access_token = AuthService.create_access_token(data={"sub": user["email"], "role": user["role"]})
    response.set_cookie(
        key="access_token", value=f"Bearer {access_token}",
        httponly=True, max_age=3600, samesite="lax", secure=False
    )
    return {
        "message": "Đăng nhập Google thành công!",
        "user": {
            "email": user["email"],
            "full_name": user.get("full_name", ""),
            "role": user.get("role", "user"),
            "avatar": user.get("avatar", ""),
            "username": user.get("username", "")
        }
    }

@router.get("/me")
def get_current_user(access_token: Optional[str] = Cookie(None)):
    """
    Lấy thông tin user hiện tại từ JWT token trong cookie.
    """
    if not access_token:
        raise HTTPException(status_code=401, detail="Chưa đăng nhập")
    
    try:
        token = access_token.replace("Bearer ", "")
        payload = jwt.decode(token, os.getenv("JWT_SECRET_KEY"), algorithms=[os.getenv("JWT_ALGORITHM")])
        email = payload.get("sub")
        
        if not email:
            raise HTTPException(status_code=401, detail="Token không hợp lệ")
        
        user, error = AuthService.get_user_by_email(email)
        if error:
            raise HTTPException(status_code=404, detail=error)
        
        user.pop("hashed_password", None)
        return user
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token đã hết hạn")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token không hợp lệ")
