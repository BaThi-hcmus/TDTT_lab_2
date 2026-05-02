from fastapi import APIRouter, HTTPException, status
from backend.schemas.user import UserCreate, UserResponse
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
