from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Trang Web Bán Hàng Admin",
    description="Backend API cho ứng dụng quản lý bán hàng phía Admin",
    version="1.0.0"
)

# Cấu hình CORS để frontend có thể giao tiếp với backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "message": "Chào mừng đến với hệ thống API Quản lý Bán Hàng",
        "description": "API hỗ trợ các tính năng quản lý sản phẩm.",
    }
