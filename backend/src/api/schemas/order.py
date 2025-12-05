from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from src.domain.entities.order import OrderStatus


class OrderItemCreate(BaseModel):
    """Schema for creating an order item."""
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)


class OrderItemResponse(BaseModel):
    """Schema for order item response."""
    id: int
    product_id: int
    unit_price: float
    quantity: int
    line_total: float

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    """Schema for creating an order."""
    customer_id: int = Field(..., gt=0)
    items: List[OrderItemCreate] = Field(..., min_length=1)


class OrderResponse(BaseModel):
    """Schema for order response."""
    id: int
    customer_id: int
    total_amount: float
    status: OrderStatus
    created_at: datetime
    items: List[OrderItemResponse]

    class Config:
        from_attributes = True


class OrderListResponse(BaseModel):
    """Schema for order list response."""
    items: List[OrderResponse]
    total: int
    skip: int
    limit: int


class OrderStatusUpdate(BaseModel):
    """Schema for updating order status."""
    status: OrderStatus
