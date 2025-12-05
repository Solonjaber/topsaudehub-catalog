from fastapi import APIRouter, Depends, Query, Header
from sqlalchemy.orm import Session
from typing import Optional

from src.infrastructure.database import get_db
from src.application.services import OrderService
from src.api.schemas import (
    ApiResponse,
    OrderCreate,
    OrderResponse,
    OrderListResponse,
    OrderStatusUpdate
)
import structlog

logger = structlog.get_logger()
router = APIRouter()


@router.post("", response_model=ApiResponse[OrderResponse])
def create_order(
    order: OrderCreate,
    db: Session = Depends(get_db),
    idempotency_key: Optional[str] = Header(None, alias="Idempotency-Key")
):
    """Create a new order with idempotency support."""
    try:
        service = OrderService(db)

        # Prepare items
        items = [item.model_dump() for item in order.items]

        created_order = service.create_order(
            customer_id=order.customer_id,
            items=items,
            idempotency_key=idempotency_key
        )

        response_data = OrderResponse.model_validate(created_order)
        return ApiResponse.success(data=response_data)
    except ValueError as e:
        logger.warning("Order creation failed", error=str(e))
        return ApiResponse.error(mensagem=str(e))
    except Exception as e:
        logger.error("Unexpected error creating order", error=str(e))
        return ApiResponse.error(mensagem="Internal server error")


@router.get("/{order_id}", response_model=ApiResponse[OrderResponse])
def get_order(order_id: int, db: Session = Depends(get_db)):
    """Get an order by ID."""
    try:
        service = OrderService(db)
        order = service.get_order(order_id)

        if not order:
            return ApiResponse.error(mensagem=f"Order with id {order_id} not found")

        response_data = OrderResponse.model_validate(order)
        return ApiResponse.success(data=response_data)
    except Exception as e:
        logger.error("Unexpected error fetching order", error=str(e))
        return ApiResponse.error(mensagem="Internal server error")


@router.get("", response_model=ApiResponse[OrderListResponse])
def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    customer_id: Optional[int] = None,
    status: Optional[str] = None,
    order_by: str = Query("created_at"),
    order_dir: str = Query("desc"),
    db: Session = Depends(get_db)
):
    """List orders with pagination and filters."""
    try:
        service = OrderService(db)
        orders, total = service.list_orders(skip, limit, customer_id, status, order_by, order_dir)

        response_data = OrderListResponse(
            items=[OrderResponse.model_validate(o) for o in orders],
            total=total,
            skip=skip,
            limit=limit
        )
        return ApiResponse.success(data=response_data)
    except Exception as e:
        logger.error("Unexpected error listing orders", error=str(e))
        return ApiResponse.error(mensagem="Internal server error")


@router.patch("/{order_id}/status", response_model=ApiResponse[OrderResponse])
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db)
):
    """Update order status."""
    try:
        service = OrderService(db)
        updated_order = service.update_order_status(order_id, status_update.status.value)
        response_data = OrderResponse.model_validate(updated_order)
        return ApiResponse.success(data=response_data)
    except ValueError as e:
        logger.warning("Order status update failed", error=str(e))
        return ApiResponse.error(mensagem=str(e))
    except Exception as e:
        logger.error("Unexpected error updating order status", error=str(e))
        return ApiResponse.error(mensagem="Internal server error")


@router.delete("/{order_id}", response_model=ApiResponse[dict])
def delete_order(order_id: int, db: Session = Depends(get_db)):
    """Delete an order."""
    try:
        service = OrderService(db)
        result = service.delete_order(order_id)

        if not result:
            return ApiResponse.error(mensagem=f"Order with id {order_id} not found")

        return ApiResponse.success(data={"deleted": True})
    except Exception as e:
        logger.error("Unexpected error deleting order", error=str(e))
        return ApiResponse.error(mensagem="Internal server error")
