from fastapi import APIRouter

router = APIRouter(
    prefix="/health",
    tags=["health"]
)

@router.get("/")
def check_health():
    """
    Kiểm tra trạng thái hoạt động của server.
    """
    return {
        "status": "ok",
        "message": "Server đang hoạt động bình thường"
    }
