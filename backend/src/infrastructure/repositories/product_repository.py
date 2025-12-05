from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from src.infrastructure.database.models import ProductModel
from src.domain.entities import Product


class ProductRepository:
    """Repository for Product entity."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, product: Product) -> Product:
        """Create a new product."""
        db_product = ProductModel(
            name=product.name,
            sku=product.sku,
            price=product.price,
            stock_qty=product.stock_qty,
            is_active=product.is_active,
        )
        self.db.add(db_product)
        self.db.commit()
        self.db.refresh(db_product)
        return self._to_entity(db_product)

    def get_by_id(self, product_id: int) -> Optional[Product]:
        """Get product by ID."""
        db_product = self.db.query(ProductModel).filter(ProductModel.id == product_id).first()
        return self._to_entity(db_product) if db_product else None

    def get_by_sku(self, sku: str) -> Optional[Product]:
        """Get product by SKU."""
        db_product = self.db.query(ProductModel).filter(ProductModel.sku == sku).first()
        return self._to_entity(db_product) if db_product else None

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
        order_by: str = "created_at",
        order_dir: str = "desc"
    ) -> tuple[List[Product], int]:
        """Get all products with pagination and filters."""
        query = self.db.query(ProductModel)

        # Apply filters
        if search:
            query = query.filter(
                or_(
                    ProductModel.name.ilike(f"%{search}%"),
                    ProductModel.sku.ilike(f"%{search}%")
                )
            )

        if is_active is not None:
            query = query.filter(ProductModel.is_active == is_active)

        # Get total count
        total = query.count()

        # Apply ordering
        order_column = getattr(ProductModel, order_by, ProductModel.created_at)
        if order_dir.lower() == "desc":
            query = query.order_by(order_column.desc())
        else:
            query = query.order_by(order_column.asc())

        # Apply pagination
        products = query.offset(skip).limit(limit).all()

        return [self._to_entity(p) for p in products], total

    def update(self, product: Product) -> Product:
        """Update an existing product."""
        db_product = self.db.query(ProductModel).filter(ProductModel.id == product.id).first()
        if not db_product:
            raise ValueError(f"Product with id {product.id} not found")

        db_product.name = product.name
        db_product.sku = product.sku
        db_product.price = product.price
        db_product.stock_qty = product.stock_qty
        db_product.is_active = product.is_active

        self.db.commit()
        self.db.refresh(db_product)
        return self._to_entity(db_product)

    def delete(self, product_id: int) -> bool:
        """Delete a product."""
        db_product = self.db.query(ProductModel).filter(ProductModel.id == product_id).first()
        if not db_product:
            return False

        self.db.delete(db_product)
        self.db.commit()
        return True

    def get_by_ids(self, product_ids: List[int]) -> List[Product]:
        """Get multiple products by their IDs."""
        db_products = self.db.query(ProductModel).filter(ProductModel.id.in_(product_ids)).all()
        return [self._to_entity(p) for p in db_products]

    @staticmethod
    def _to_entity(model: ProductModel) -> Product:
        """Convert database model to domain entity."""
        return Product(
            id=model.id,
            name=model.name,
            sku=model.sku,
            price=model.price,
            stock_qty=model.stock_qty,
            is_active=model.is_active,
            created_at=model.created_at,
        )
