from datetime import datetime
from typing import Optional


class Product:
    """Product domain entity."""

    def __init__(
        self,
        name: str,
        sku: str,
        price: float,
        stock_qty: int,
        is_active: bool = True,
        id: Optional[int] = None,
        created_at: Optional[datetime] = None,
    ):
        self.id = id
        self.name = name
        self.sku = sku
        self.price = price
        self.stock_qty = stock_qty
        self.is_active = is_active
        self.created_at = created_at or datetime.utcnow()

    def has_sufficient_stock(self, quantity: int) -> bool:
        """Check if product has sufficient stock for the requested quantity."""
        return self.is_active and self.stock_qty >= quantity

    def reduce_stock(self, quantity: int) -> None:
        """Reduce stock quantity."""
        if not self.has_sufficient_stock(quantity):
            raise ValueError(
                f"Insufficient stock for product {self.sku}. "
                f"Available: {self.stock_qty}, Requested: {quantity}"
            )
        self.stock_qty -= quantity

    def validate(self) -> None:
        """Validate product business rules."""
        if not self.name or len(self.name.strip()) == 0:
            raise ValueError("Product name cannot be empty")

        if not self.sku or len(self.sku.strip()) == 0:
            raise ValueError("Product SKU cannot be empty")

        if self.price < 0:
            raise ValueError("Product price cannot be negative")

        if self.stock_qty < 0:
            raise ValueError("Product stock quantity cannot be negative")
