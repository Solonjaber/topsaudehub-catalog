from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime


class CustomerCreate(BaseModel):
    """Schema for creating a customer."""
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    document: str = Field(..., min_length=11, max_length=20)


class CustomerUpdate(BaseModel):
    """Schema for updating a customer."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    document: Optional[str] = Field(None, min_length=11, max_length=20)


class CustomerResponse(BaseModel):
    """Schema for customer response."""
    id: int
    name: str
    email: str
    document: str
    created_at: datetime

    class Config:
        from_attributes = True


class CustomerListResponse(BaseModel):
    """Schema for customer list response."""
    items: List[CustomerResponse]
    total: int
    skip: int
    limit: int
