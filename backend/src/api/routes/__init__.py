from fastapi import APIRouter
from .products import router as products_router
from .customers import router as customers_router
from .orders import router as orders_router

api_router = APIRouter()

api_router.include_router(products_router, prefix="/products", tags=["Products"])
api_router.include_router(customers_router, prefix="/customers", tags=["Customers"])
api_router.include_router(orders_router, prefix="/orders", tags=["Orders"])
