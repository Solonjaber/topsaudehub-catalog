from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional

from src.infrastructure.database import get_db
from src.application.services import ProductService
from src.api.schemas import (
    ApiResponse,
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse
)
import structlog

logger = structlog.get_logger()
router = APIRouter()


@router.post("", response_model=ApiResponse[ProductResponse])
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """Create a new product."""
    try:
        service = ProductService(db)
        created_product = service.create_product(**product.model_dump())
        response_data = ProductResponse.model_validate(created_product)
        return ApiResponse.success(data=response_data)
    except ValueError as e:
        logger.warning("Product creation failed", error=str(e))
        return ApiResponse.error(mensagem=str(e))
    except Exception as e:
        logger.error("Unexpected error creating product", error=str(e))
        return ApiResponse.error(mensagem="Internal server error")


@router.get("/{product_id}", response_model=ApiResponse[ProductResponse])
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Get a product by ID."""
    try:
        service = ProductService(db)
        product = service.get_product(product_id)

        if not product:
            return ApiResponse.error(mensagem=f"Product with id {product_id} not found")

        response_data = ProductResponse.model_validate(product)
        return ApiResponse.success(data=response_data)
    except Exception as e:
        logger.error("Unexpected error fetching product", error=str(e))
        return ApiResponse.error(mensagem="Internal server error")


@router.get("", response_model=ApiResponse[ProductListResponse])
def list_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    order_by: str = Query("created_at"),
    order_dir: str = Query("desc"),
    db: Session = Depends(get_db)
):
    """List products with pagination and filters."""
    try:
        service = ProductService(db)
        products, total = service.list_products(skip, limit, search, is_active, order_by, order_dir)

        response_data = ProductListResponse(
            items=[ProductResponse.model_validate(p) for p in products],
            total=total,
            skip=skip,
            limit=limit
        )
        return ApiResponse.success(data=response_data)
    except Exception as e:
        logger.error("Unexpected error listing products", error=str(e))
        return ApiResponse.error(mensagem="Internal server error")


@router.put("/{product_id}", response_model=ApiResponse[ProductResponse])
def update_product(product_id: int, product: ProductUpdate, db: Session = Depends(get_db)):
    """Update a product."""
    try:
        service = ProductService(db)
        updated_product = service.update_product(
            product_id,
            **product.model_dump(exclude_unset=True)
        )
        response_data = ProductResponse.model_validate(updated_product)
        return ApiResponse.success(data=response_data)
    except ValueError as e:
        logger.warning("Product update failed", error=str(e))
        return ApiResponse.error(mensagem=str(e))
    except Exception as e:
        logger.error("Unexpected error updating product", error=str(e))
        return ApiResponse.error(mensagem="Internal server error")


@router.delete("/{product_id}", response_model=ApiResponse[dict])
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Delete a product."""
    try:
        service = ProductService(db)
        result = service.delete_product(product_id)

        if not result:
            return ApiResponse.error(mensagem=f"Product with id {product_id} not found")

        return ApiResponse.success(data={"deleted": True})
    except ValueError as e:
        logger.warning("Product deletion failed", error=str(e))
        return ApiResponse.error(mensagem=str(e))
    except Exception as e:
        logger.error("Unexpected error deleting product", error=str(e))
        return ApiResponse.error(mensagem="Internal server error")


@router.get("/search/autocomplete", response_model=ApiResponse[list[ProductResponse]])
def search_products(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Search products for autocomplete."""
    try:
        service = ProductService(db)
        products = service.search_products(q, limit)
        response_data = [ProductResponse.model_validate(p) for p in products]
        return ApiResponse.success(data=response_data)
    except Exception as e:
        logger.error("Unexpected error searching products", error=str(e))
        return ApiResponse.error(mensagem="Internal server error")
