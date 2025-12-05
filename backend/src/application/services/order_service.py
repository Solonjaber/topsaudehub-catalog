from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from src.domain.entities import Order, OrderItem
from src.infrastructure.repositories import OrderRepository, ProductRepository, CustomerRepository
import structlog

logger = structlog.get_logger()


class IdempotencyStore:
    """Simple in-memory idempotency store."""
    _store: Dict[str, int] = {}

    @classmethod
    def get(cls, key: str) -> Optional[int]:
        """Get order ID for idempotency key."""
        return cls._store.get(key)

    @classmethod
    def set(cls, key: str, order_id: int) -> None:
        """Store order ID for idempotency key."""
        cls._store[key] = order_id

    @classmethod
    def exists(cls, key: str) -> bool:
        """Check if idempotency key exists."""
        return key in cls._store


class OrderService:
    """Service layer for Order operations with idempotency support."""

    def __init__(self, db: Session):
        self.order_repository = OrderRepository(db)
        self.product_repository = ProductRepository(db)
        self.customer_repository = CustomerRepository(db)
        self.db = db

    def create_order(
        self,
        customer_id: int,
        items: List[dict],
        idempotency_key: Optional[str] = None
    ) -> Order:
        """Create a new order with atomic transaction and idempotency."""
        logger.info(
            "Creating order",
            customer_id=customer_id,
            items_count=len(items),
            idempotency_key=idempotency_key
        )

        # Check idempotency
        if idempotency_key:
            existing_order_id = IdempotencyStore.get(idempotency_key)
            if existing_order_id:
                logger.info(
                    "Idempotent request detected, returning existing order",
                    order_id=existing_order_id,
                    idempotency_key=idempotency_key
                )
                existing_order = self.order_repository.get_by_id(existing_order_id)
                if existing_order:
                    return existing_order

        try:
            # Start transaction
            # Verify customer exists
            customer = self.customer_repository.get_by_id(customer_id)
            if not customer:
                raise ValueError(f"Customer with id {customer_id} not found")

            # Validate and prepare order items
            order_items = []
            product_ids = [item["product_id"] for item in items]
            products = {p.id: p for p in self.product_repository.get_by_ids(product_ids)}

            for item_data in items:
                product_id = item_data["product_id"]
                quantity = item_data["quantity"]

                # Check if product exists
                product = products.get(product_id)
                if not product:
                    raise ValueError(f"Product with id {product_id} not found")

                # Validate stock
                if not product.has_sufficient_stock(quantity):
                    logger.warning(
                        "Insufficient stock",
                        product_id=product_id,
                        requested=quantity,
                        available=product.stock_qty
                    )
                    raise ValueError(
                        f"Insufficient stock for product '{product.name}'. "
                        f"Available: {product.stock_qty}, Requested: {quantity}"
                    )

                # Create order item
                order_item = OrderItem(
                    product_id=product_id,
                    unit_price=product.price,
                    quantity=quantity
                )
                order_item.validate()
                order_items.append(order_item)

                # Reduce stock
                product.reduce_stock(quantity)
                self.product_repository.update(product)

            # Create order entity
            order = Order(customer_id=customer_id, items=order_items)
            order.validate()

            # Save order
            created_order = self.order_repository.create(order)

            # Store idempotency key
            if idempotency_key:
                IdempotencyStore.set(idempotency_key, created_order.id)

            # Commit transaction
            self.db.commit()

            logger.info(
                "Order created successfully",
                order_id=created_order.id,
                total_amount=created_order.total_amount
            )

            return created_order

        except Exception as e:
            # Rollback transaction on error
            self.db.rollback()
            logger.error("Failed to create order", error=str(e))
            raise

    def get_order(self, order_id: int) -> Optional[Order]:
        """Get order by ID."""
        logger.debug("Fetching order", order_id=order_id)
        return self.order_repository.get_by_id(order_id)

    def list_orders(
        self,
        skip: int = 0,
        limit: int = 100,
        customer_id: Optional[int] = None,
        status: Optional[str] = None,
        order_by: str = "created_at",
        order_dir: str = "desc"
    ) -> tuple[List[Order], int]:
        """List orders with pagination and filters."""
        logger.debug(
            "Listing orders",
            skip=skip,
            limit=limit,
            customer_id=customer_id,
            status=status
        )
        return self.order_repository.get_all(skip, limit, customer_id, status, order_by, order_dir)

    def update_order_status(self, order_id: int, new_status: str) -> Order:
        """Update order status."""
        logger.info("Updating order status", order_id=order_id, new_status=new_status)

        order = self.order_repository.get_by_id(order_id)
        if not order:
            logger.warning("Order not found", order_id=order_id)
            raise ValueError(f"Order with id {order_id} not found")

        # Update status based on business rules
        if new_status == "PAID":
            order.mark_as_paid()
        elif new_status == "CANCELLED":
            order.cancel()
        else:
            raise ValueError(f"Invalid status: {new_status}")

        updated_order = self.order_repository.update(order)
        logger.info("Order status updated successfully", order_id=order_id, status=new_status)

        return updated_order

    def delete_order(self, order_id: int) -> bool:
        """Delete an order."""
        logger.info("Deleting order", order_id=order_id)

        result = self.order_repository.delete(order_id)
        if result:
            logger.info("Order deleted successfully", order_id=order_id)
        else:
            logger.warning("Order not found", order_id=order_id)

        return result
