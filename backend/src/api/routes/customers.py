from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from src.infrastructure.database import get_db
from src.application.services import CustomerService
from src.api.schemas import (
    ApiResponse,
    CustomerCreate,
    CustomerUpdate,
    CustomerResponse,
    CustomerListResponse
)
import structlog

logger = structlog.get_logger()
router = APIRouter()


@router.post("", response_model=ApiResponse[CustomerResponse])
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    """Create a new customer."""
    try:
        service = CustomerService(db)
        created_customer = service.create_customer(**customer.model_dump())
        response_data = CustomerResponse.model_validate(created_customer)
        return ApiResponse.success(data=response_data)
    except ValueError as e:
        logger.warning("Customer creation failed", error=str(e))
        return ApiResponse.error(mensagem=str(e))
    except Exception as e:
        logger.error("Unexpected error creating customer", error=str(e))
        return ApiResponse.error(mensagem="Internal server error")


@router.get("/{customer_id}", response_model=ApiResponse[CustomerResponse])
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    """Get a customer by ID."""
    try:
        service = CustomerService(db)
        customer = service.get_customer(customer_id)

        if not customer:
            return ApiResponse.error(mensagem=f"Customer with id {customer_id} not found")

        response_data = CustomerResponse.model_validate(customer)
        return ApiResponse.success(data=response_data)
    except Exception as e:
        logger.error("Unexpected error fetching customer", error=str(e))
        return ApiResponse.error(mensagem="Internal server error")


@router.get("", response_model=ApiResponse[CustomerListResponse])
def list_customers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    order_by: str = Query("created_at"),
    order_dir: str = Query("desc"),
    db: Session = Depends(get_db)
):
    """List customers with pagination and filters."""
    try:
        service = CustomerService(db)
        customers, total = service.list_customers(skip, limit, search, order_by, order_dir)

        response_data = CustomerListResponse(
            items=[CustomerResponse.model_validate(c) for c in customers],
            total=total,
            skip=skip,
            limit=limit
        )
        return ApiResponse.success(data=response_data)
    except Exception as e:
        logger.error("Unexpected error listing customers", error=str(e))
        return ApiResponse.error(mensagem="Internal server error")


@router.put("/{customer_id}", response_model=ApiResponse[CustomerResponse])
def update_customer(customer_id: int, customer: CustomerUpdate, db: Session = Depends(get_db)):
    """Update a customer."""
    try:
        service = CustomerService(db)
        updated_customer = service.update_customer(
            customer_id,
            **customer.model_dump(exclude_unset=True)
        )
        response_data = CustomerResponse.model_validate(updated_customer)
        return ApiResponse.success(data=response_data)
    except ValueError as e:
        logger.warning("Customer update failed", error=str(e))
        return ApiResponse.error(mensagem=str(e))
    except Exception as e:
        logger.error("Unexpected error updating customer", error=str(e))
        return ApiResponse.error(mensagem="Internal server error")


@router.delete("/{customer_id}", response_model=ApiResponse[dict])
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    """Delete a customer."""
    try:
        service = CustomerService(db)
        result = service.delete_customer(customer_id)

        if not result:
            return ApiResponse.error(mensagem=f"Customer with id {customer_id} not found")

        return ApiResponse.success(data={"deleted": True})
    except Exception as e:
        logger.error("Unexpected error deleting customer", error=str(e))
        return ApiResponse.error(mensagem="Internal server error")
