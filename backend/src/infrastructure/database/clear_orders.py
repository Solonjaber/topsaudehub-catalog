"""
Script to clear all orders from the database.
This removes example/test orders while keeping products and customers.
"""
import os
import sys
from sqlalchemy.orm import Session

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from src.infrastructure.database.config import SessionLocal
from src.infrastructure.database.models import OrderModel, OrderItemModel
import structlog

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


def clear_orders(db: Session):
    """Clear all orders from the database."""
    logger.info("Clearing all orders from database...")

    try:
        # Count existing orders
        order_count = db.query(OrderModel).count()
        order_items_count = db.query(OrderItemModel).count()
        logger.info(f"Found {order_count} orders and {order_items_count} order items to delete")

        # Delete order items first (foreign key constraint)
        db.query(OrderItemModel).delete()
        logger.info(f"Deleted {order_items_count} order items")

        # Then delete orders
        db.query(OrderModel).delete()
        db.commit()

        logger.info(f"Successfully deleted {order_count} orders and {order_items_count} order items")
        return order_count
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting orders: {str(e)}")
        raise


def main():
    """Main function."""
    logger.info("Starting order cleanup...")

    db = SessionLocal()
    try:
        deleted_count = clear_orders(db)
        logger.info(f"Order cleanup completed! Deleted {deleted_count} orders.")
        print(f"\n✅ Successfully deleted {deleted_count} orders from the database.\n")
    except Exception as e:
        logger.error(f"Error during cleanup: {str(e)}")
        print(f"\n❌ Error: {str(e)}\n")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
