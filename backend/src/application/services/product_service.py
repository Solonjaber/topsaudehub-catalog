from typing import List, Optional
from sqlalchemy.orm import Session
from src.domain.entities import Product
from src.infrastructure.repositories import ProductRepository
import structlog

logger = structlog.get_logger()


class ProductService:
    """Service layer for Product operations."""

    def __init__(self, db: Session):
        self.repository = ProductRepository(db)
        self.db = db

    def create_product(
        self,
        name: str,
        sku: str,
        price: float,
        stock_qty: int,
        is_active: bool = True
    ) -> Product:
        """Create a new product."""
        logger.info("Creating product", sku=sku, name=name)

        # Check if SKU already exists
        existing = self.repository.get_by_sku(sku)
        if existing:
            logger.warning("Product with SKU already exists", sku=sku)
            raise ValueError(f"Product with SKU '{sku}' already exists")

        # Create and validate product entity
        product = Product(
            name=name,
            sku=sku,
            price=price,
            stock_qty=stock_qty,
            is_active=is_active
        )
        product.validate()

        # Save to database
        created_product = self.repository.create(product)
        logger.info("Product created successfully", product_id=created_product.id, sku=sku)

        return created_product

    def get_product(self, product_id: int) -> Optional[Product]:
        """Get product by ID."""
        logger.debug("Fetching product", product_id=product_id)
        return self.repository.get_by_id(product_id)

    def list_products(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
        order_by: str = "created_at",
        order_dir: str = "desc"
    ) -> tuple[List[Product], int]:
        """List products with pagination and filters."""
        logger.debug(
            "Listing products",
            skip=skip,
            limit=limit,
            search=search,
            is_active=is_active
        )
        return self.repository.get_all(skip, limit, search, is_active, order_by, order_dir)

    def update_product(
        self,
        product_id: int,
        name: Optional[str] = None,
        sku: Optional[str] = None,
        price: Optional[float] = None,
        stock_qty: Optional[int] = None,
        is_active: Optional[bool] = None
    ) -> Product:
        """Update an existing product."""
        logger.info("Updating product", product_id=product_id)

        # Get existing product
        product = self.repository.get_by_id(product_id)
        if not product:
            logger.warning("Product not found", product_id=product_id)
            raise ValueError(f"Product with id {product_id} not found")

        # Check SKU uniqueness if changing
        if sku and sku != product.sku:
            existing = self.repository.get_by_sku(sku)
            if existing:
                logger.warning("Product with SKU already exists", sku=sku)
                raise ValueError(f"Product with SKU '{sku}' already exists")

        # Update fields
        if name is not None:
            product.name = name
        if sku is not None:
            product.sku = sku
        if price is not None:
            product.price = price
        if stock_qty is not None:
            product.stock_qty = stock_qty
        if is_active is not None:
            product.is_active = is_active

        # Validate and save
        product.validate()
        updated_product = self.repository.update(product)

        logger.info("Product updated successfully", product_id=product_id)
        return updated_product

    def delete_product(self, product_id: int) -> bool:
        """Delete a product."""
        logger.info("Deleting product", product_id=product_id)

        # Check if product exists
        product = self.repository.get_by_id(product_id)
        if not product:
            logger.warning("Product not found", product_id=product_id)
            raise ValueError(f"Product with id {product_id} not found")

        # Check if product is used in any orders
        from src.infrastructure.database.models import OrderItemModel
        order_items_count = self.db.query(OrderItemModel).filter(
            OrderItemModel.product_id == product_id
        ).count()

        if order_items_count > 0:
            logger.warning(
                "Cannot delete product in use",
                product_id=product_id,
                order_items_count=order_items_count
            )
            raise ValueError(
                f"Não é possível deletar o produto '{product.name}' pois ele está sendo usado em {order_items_count} pedido(s). "
                "Considere marcá-lo como inativo em vez de deletar."
            )

        result = self.repository.delete(product_id)
        if result:
            logger.info("Product deleted successfully", product_id=product_id)

        return result

    def search_products(self, query: str, limit: int = 10) -> List[Product]:
        """Search products by name or SKU (for autocomplete)."""
        logger.debug("Searching products", query=query, limit=limit)
        products, _ = self.repository.get_all(
            skip=0,
            limit=limit,
            search=query,
            is_active=True
        )
        return products
