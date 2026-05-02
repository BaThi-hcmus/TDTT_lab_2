from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.health import router as health_router
from backend.routes.root import router as root_router

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

# Đăng ký các router
app.include_router(root_router)
app.include_router(health_router)
