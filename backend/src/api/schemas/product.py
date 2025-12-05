from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ProductCreate(BaseModel):
    """Schema for creating a product."""
    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., ge=0)
    stock_qty: int = Field(..., ge=0)
    is_active: bool = True


class ProductUpdate(BaseModel):
    """Schema for updating a product."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[float] = Field(None, ge=0)
    stock_qty: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    """Schema for product response."""
    id: int
    name: str
    sku: str
    price: float
    stock_qty: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    """Schema for product list response."""
    items: List[ProductResponse]
    total: int
    skip: int
    limit: int
