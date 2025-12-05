from datetime import datetime
from typing import Optional, List
from enum import Enum


class OrderStatus(str, Enum):
    """Order status enumeration."""
    CREATED = "CREATED"
    PAID = "PAID"
    CANCELLED = "CANCELLED"


class OrderItem:
    """Order item domain entity."""

    def __init__(
        self,
        product_id: int,
        unit_price: float,
        quantity: int,
        order_id: Optional[int] = None,
        id: Optional[int] = None,
    ):
        self.id = id
        self.order_id = order_id
        self.product_id = product_id
        self.unit_price = unit_price
        self.quantity = quantity

    @property
    def line_total(self) -> float:
        """Calculate line total."""
        return round(self.unit_price * self.quantity, 2)

    def validate(self) -> None:
        """Validate order item business rules."""
        if self.quantity <= 0:
            raise ValueError("Order item quantity must be greater than zero")

        if self.unit_price < 0:
            raise ValueError("Order item unit price cannot be negative")


class Order:
    """Order domain entity."""

    def __init__(
        self,
        customer_id: int,
        items: List[OrderItem],
        status: OrderStatus = OrderStatus.CREATED,
        id: Optional[int] = None,
        created_at: Optional[datetime] = None,
    ):
        self.id = id
        self.customer_id = customer_id
        self.items = items
        self.status = status
        self.created_at = created_at or datetime.utcnow()

    @property
    def total_amount(self) -> float:
        """Calculate total amount from order items."""
        return round(sum(item.line_total for item in self.items), 2)

    def validate(self) -> None:
        """Validate order business rules."""
        if not self.items or len(self.items) == 0:
            raise ValueError("Order must have at least one item")

        for item in self.items:
            item.validate()

    def mark_as_paid(self) -> None:
        """Mark order as paid."""
        if self.status != OrderStatus.CREATED:
            raise ValueError(f"Cannot mark order as paid. Current status: {self.status}")
        self.status = OrderStatus.PAID

    def cancel(self) -> None:
        """Cancel order."""
        if self.status == OrderStatus.CANCELLED:
            raise ValueError("Order is already cancelled")
        if self.status == OrderStatus.PAID:
            raise ValueError("Cannot cancel a paid order")
        self.status = OrderStatus.CANCELLED
