from fastapi import APIRouter, HTTPException, status, Response
from backend.schemas.user import UserCreate, UserResponse, UserLogin, UserGoogleLogin
from backend.services.auth_service import AuthService

router = APIRouter(
    prefix="/auth",
    tags=["authentication"]
)

@router.post("/register", response_model=UserResponse)
def register(user: UserCreate):
    """
    Endpoint đăng ký tài khoản mới.
    """
    new_user, error = AuthService.create_user(user)
    
    if error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error
        )
    
    return new_user

@router.post("/login")
def login(user_credentials: UserLogin, response: Response):
    """
    Endpoint đăng nhập truyền thống, trả về Token qua Cookie.
    """
    user, error = AuthService.authenticate_user(user_credentials.email, user_credentials.password)
    
    if error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error
        )
    
    # Tạo JWT Token
    access_token = AuthService.create_access_token(data={"sub": user["email"], "role": user["role"]})
    
    # Thiết lập Token vào Cookie (HttpOnly để tăng tính bảo mật)
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=3600, # 1 giờ
        samesite="lax",
        secure=False # Để False nếu chạy ở localhost không có HTTPS
    )
    
    return {
        "message": "Đăng nhập thành công!",
        "user": {
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user["role"]
        }
    }

@router.post("/google")
def google_login(google_data: UserGoogleLogin, response: Response):
    """
    Endpoint đăng nhập bằng Google.
    Nhận id_token từ Frontend, xác thực và trả về Token qua Cookie.
    """
    user, error = AuthService.verify_google_token(google_data.id_token)
    
    if error:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=error
        )
    
    # Tạo JWT Token của hệ thống mình (để đồng nhất với đăng nhập truyền thống)
    access_token = AuthService.create_access_token(data={"sub": user["email"], "role": user["role"]})
    
    # Gắn vào Cookie
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=3600,
        samesite="lax",
        secure=False
    )
    
    return {
        "message": "Đăng nhập Google thành công!",
        "user": user
    }
