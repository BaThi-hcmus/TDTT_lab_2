from fastapi import APIRouter

router = APIRouter(
    tags=["root"]
)

@router.get("/")
def read_root():
    """
    Endpoint gốc, cung cấp thông tin giới thiệu về API.
    """
    return {
        "message": "Chào mừng đến với hệ thống API Quản lý Bán Hàng",
        "description": "API hỗ trợ các tính năng quản lý sản phẩm.",
    }
