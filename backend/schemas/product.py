from pydantic import BaseModel, Field
from typing import List, Optional, Union
from datetime import datetime

class Dimensions(BaseModel):
    width: float
    height: float
    depth: float

class Review(BaseModel):
    rating: int
    comment: str
    date: datetime
    reviewerName: str
    reviewerEmail: str

class MetaInfo(BaseModel):
    createdAt: datetime
    updatedAt: datetime
    barcode: str
    qrCode: str

# Schema cơ sở chứa các trường chung
class ProductBase(BaseModel):
    title: str
    description: str
    category: str
    price: float
    discountPercentage: float = 0.0
    rating: float = 0.0
    stock: int
    tags: List[str] = []
    brand: Optional[str] = None
    sku: str
    weight: float
    dimensions: Dimensions
    warrantyInformation: str
    shippingInformation: str
    availabilityStatus: str
    reviews: List[Review] = []
    returnPolicy: str
    minimumOrderQuantity: int
    meta: MetaInfo
    images: List[str] = []
    thumbnail: str

# Schema dùng cho việc tạo sản phẩm mới (thường không yêu cầu ID vì DB sẽ tự sinh)
class ProductCreate(ProductBase):
    pass

# Schema dùng để trả về dữ liệu cho Client (bao gồm cả ID)
class ProductResponse(ProductBase):
    id: Union[int, str]  # Để Union[int, str] vì Firebase sau này sẽ dùng chuỗi (string) làm ID, nhưng ví dụ hiện tại là int (1)

    class Config:
        from_attributes = True
