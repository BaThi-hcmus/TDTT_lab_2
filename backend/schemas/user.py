from pydantic import BaseModel, Field
from typing import Optional, Union
from datetime import datetime

# Schema cơ sở cho User
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: str
    full_name: Optional[str] = None
    role: str = "user"  # admin, staff, user
    avatar: Optional[str] = None
    is_active: bool = True

# Schema dùng cho việc đăng ký/tạo mới User (có mật khẩu)
class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

# Schema dùng để trả về thông tin User (không bao gồm mật khẩu)
class UserResponse(UserBase):
    id: Union[str, int]
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True
