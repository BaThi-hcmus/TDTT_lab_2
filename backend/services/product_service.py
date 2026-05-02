from backend.core.firebase import get_firestore_client
from backend.schemas.product import ProductCreate

db = get_firestore_client()
collection_name = "products"

class ProductService:
    @staticmethod
    def create_product(product_data: ProductCreate):
        """
        Lưu sản phẩm mới vào Firestore.
        """
        product_dict = product_data.model_dump()
        doc_ref = db.collection(collection_name).document()
        product_dict["id"] = doc_ref.id
        doc_ref.set(product_dict)
        return product_dict

    @staticmethod
    def get_all_products():
        """
        Lấy danh sách sản phẩm từ Firestore.
        """
        products = []
        docs = db.collection(collection_name).stream()
        for doc in docs:
            products.append(doc.to_dict())
        return products
