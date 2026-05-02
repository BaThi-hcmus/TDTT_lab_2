from fastapi import APIRouter, HTTPException
from typing import List
from backend.schemas.product import ProductCreate, ProductResponse
from backend.services.product_service import ProductService

router = APIRouter(
    prefix="/products",
    tags=["products"]
)

@router.post("/create", response_model=ProductResponse)
def add_product(product: ProductCreate):
    """
    API thêm mới sản phẩm.
    """
    try:
        new_product = ProductService.create_product(product)
        return new_product
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi thêm sản phẩm: {str(e)}")

@router.get("/", response_model=List[ProductResponse])
def get_products():
    """
    API lấy danh sách sản phẩm.
    """
    try:
        products = ProductService.get_all_products()
        return products
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi lấy danh sách sản phẩm: {str(e)}")

@router.delete("/delete/{product_id}")
def delete_product(product_id: str):
    """
    API xóa mềm sản phẩm.
    """
    try:
        success, error = ProductService.delete_product(product_id)
        if not success:
            raise HTTPException(status_code=404, detail=error)
        return {"message": "Xóa sản phẩm thành công"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi khi xóa sản phẩm: {str(e)}")
