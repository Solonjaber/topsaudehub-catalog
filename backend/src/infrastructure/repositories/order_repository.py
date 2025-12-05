from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from src.infrastructure.database.models import OrderModel, OrderItemModel
from src.domain.entities import Order, OrderItem


class OrderRepository:
    """Repository for Order entity."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, order: Order) -> Order:
        """Create a new order with items."""
        # Create order
        db_order = OrderModel(
            customer_id=order.customer_id,
            total_amount=order.total_amount,
            status=order.status,
        )
        self.db.add(db_order)
        self.db.flush()  # Flush to get the order ID

        # Create order items
        for item in order.items:
            db_item = OrderItemModel(
                order_id=db_order.id,
                product_id=item.product_id,
                unit_price=item.unit_price,
                quantity=item.quantity,
                line_total=item.line_total,
            )
            self.db.add(db_item)

        self.db.commit()
        self.db.refresh(db_order)
        return self._to_entity(db_order)

    def get_by_id(self, order_id: int) -> Optional[Order]:
        """Get order by ID with items."""
        db_order = (
            self.db.query(OrderModel)
            .options(joinedload(OrderModel.items))
            .filter(OrderModel.id == order_id)
            .first()
        )
        return self._to_entity(db_order) if db_order else None

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        customer_id: Optional[int] = None,
        status: Optional[str] = None,
        order_by: str = "created_at",
        order_dir: str = "desc"
    ) -> tuple[List[Order], int]:
        """Get all orders with pagination and filters."""
        query = self.db.query(OrderModel).options(joinedload(OrderModel.items))

        # Apply filters
        if customer_id:
            query = query.filter(OrderModel.customer_id == customer_id)

        if status:
            query = query.filter(OrderModel.status == status)

        # Get total count
        total = query.count()

        # Apply ordering
        order_column = getattr(OrderModel, order_by, OrderModel.created_at)
        if order_dir.lower() == "desc":
            query = query.order_by(order_column.desc())
        else:
            query = query.order_by(order_column.asc())

        # Apply pagination
        orders = query.offset(skip).limit(limit).all()

        return [self._to_entity(o) for o in orders], total

    def update(self, order: Order) -> Order:
        """Update an existing order."""
        db_order = self.db.query(OrderModel).filter(OrderModel.id == order.id).first()
        if not db_order:
            raise ValueError(f"Order with id {order.id} not found")

        db_order.status = order.status
        db_order.total_amount = order.total_amount

        self.db.commit()
        self.db.refresh(db_order)
        return self._to_entity(db_order)

    def delete(self, order_id: int) -> bool:
        """Delete an order."""
        db_order = self.db.query(OrderModel).filter(OrderModel.id == order_id).first()
        if not db_order:
            return False

        self.db.delete(db_order)
        self.db.commit()
        return True

    @staticmethod
    def _to_entity(model: OrderModel) -> Order:
        """Convert database model to domain entity."""
        items = [
            OrderItem(
                id=item.id,
                order_id=item.order_id,
                product_id=item.product_id,
                unit_price=item.unit_price,
                quantity=item.quantity,
            )
            for item in model.items
        ]

        return Order(
            id=model.id,
            customer_id=model.customer_id,
            items=items,
            status=model.status,
            created_at=model.created_at,
        )
