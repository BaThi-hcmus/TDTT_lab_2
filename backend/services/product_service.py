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
        Lấy danh sách sản phẩm từ Firestore (bỏ qua những sản phẩm đã bị xóa mềm).
        """
        products = []
        # Lọc các sản phẩm chưa bị xóa (is_deleted không tồn tại hoặc bằng False)
        # Vì trước đây chưa có trường này, ta sẽ dùng query để lấy hết rồi check bằng code (do Firestore khó filter nếu field không tồn tại)
        docs = db.collection(collection_name).stream()
        for doc in docs:
            data = doc.to_dict()
            if not data.get("is_deleted", False):
                products.append(data)
        return products

    @staticmethod
    def delete_product(product_id: str):
        """
        Xóa mềm sản phẩm (set is_deleted = True).
        """
        doc_ref = db.collection(collection_name).document(product_id)
        doc = doc_ref.get()
        if not doc.exists:
            return False, "Sản phẩm không tồn tại!"
        
        doc_ref.update({"is_deleted": True})
        return True, None

    @staticmethod
    def edit_product(product_id: str, update_data: dict):
        """
        Cập nhật thông tin sản phẩm.
        """
        doc_ref = db.collection(collection_name).document(product_id)
        doc = doc_ref.get()
        if not doc.exists:
            return False, "Sản phẩm không tồn tại!"
        
        # Ngăn chặn cập nhật trường ID và các trường không hợp lệ
        if "id" in update_data:
            del update_data["id"]
            
        doc_ref.update(update_data)
        return True, None
