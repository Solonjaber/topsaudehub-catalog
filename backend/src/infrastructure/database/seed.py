"""
Seed script to populate the database with initial data.
Creates 20 products and 10 customers for testing.
"""
import os
import sys
from sqlalchemy.orm import Session

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))

from src.infrastructure.database.config import SessionLocal
from src.application.services import ProductService, CustomerService
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


def seed_products(db: Session):
    """Seed products."""
    logger.info("Seeding products...")
    service = ProductService(db)

    products = [
        {"name": "Termômetro Digital", "sku": "TERM-001", "price": 29.90, "stock_qty": 150},
        {"name": "Medidor de Pressão Arterial", "sku": "MED-001", "price": 89.90, "stock_qty": 75},
        {"name": "Oxímetro de Pulso", "sku": "OXI-001", "price": 119.90, "stock_qty": 60},
        {"name": "Estetoscópio Profissional", "sku": "ESTE-001", "price": 159.90, "stock_qty": 40},
        {"name": "Luva de Procedimento (Caixa)", "sku": "LUV-001", "price": 24.90, "stock_qty": 300},
        {"name": "Máscara Cirúrgica (Pacote 50un)", "sku": "MASC-001", "price": 19.90, "stock_qty": 500},
        {"name": "Álcool em Gel 70% (500ml)", "sku": "ALC-001", "price": 12.90, "stock_qty": 200},
        {"name": "Seringa Descartável 5ml (Pacote)", "sku": "SER-001", "price": 8.90, "stock_qty": 250},
        {"name": "Atadura de Crepom (Pacote 12un)", "sku": "ATAD-001", "price": 15.90, "stock_qty": 180},
        {"name": "Gaze Estéril (Pacote 10un)", "sku": "GAZE-001", "price": 6.90, "stock_qty": 400},
        {"name": "Micropore 2,5cm x 10m", "sku": "MICRO-001", "price": 4.90, "stock_qty": 350},
        {"name": "Algodão Hidrófilo (500g)", "sku": "ALG-001", "price": 9.90, "stock_qty": 220},
        {"name": "Compressa de Gaze (Pacote 500un)", "sku": "COMP-001", "price": 45.90, "stock_qty": 100},
        {"name": "Nebulizador Portátil", "sku": "NEB-001", "price": 179.90, "stock_qty": 35},
        {"name": "Glicosímetro Digital", "sku": "GLIC-001", "price": 79.90, "stock_qty": 55},
        {"name": "Tiras de Glicose (Caixa 50un)", "sku": "TIRA-001", "price": 89.90, "stock_qty": 80},
        {"name": "Lancetas para Glicose (Caixa 100un)", "sku": "LANC-001", "price": 18.90, "stock_qty": 150},
        {"name": "Bolsa Térmica Grande", "sku": "BOLS-001", "price": 34.90, "stock_qty": 90},
        {"name": "Kit Primeiros Socorros", "sku": "KIT-001", "price": 129.90, "stock_qty": 45},
        {"name": "Touca Descartável (Pacote 100un)", "sku": "TOUC-001", "price": 22.90, "stock_qty": 280},
    ]

    for product_data in products:
        try:
            service.create_product(**product_data)
            logger.info(f"Created product: {product_data['name']}")
        except ValueError as e:
            logger.warning(f"Product already exists: {product_data['sku']}")

    logger.info("Products seeding completed")


def seed_customers(db: Session):
    """Seed customers."""
    logger.info("Seeding customers...")
    service = CustomerService(db)

    customers = [
        {"name": "Maria Silva Santos", "email": "maria.silva@email.com", "document": "12345678901"},
        {"name": "João Pedro Oliveira", "email": "joao.pedro@email.com", "document": "23456789012"},
        {"name": "Ana Paula Costa", "email": "ana.costa@email.com", "document": "34567890123"},
        {"name": "Carlos Eduardo Souza", "email": "carlos.souza@email.com", "document": "45678901234"},
        {"name": "Fernanda Lima Rocha", "email": "fernanda.lima@email.com", "document": "56789012345"},
        {"name": "Roberto Carlos Alves", "email": "roberto.alves@email.com", "document": "67890123456"},
        {"name": "Juliana Martins Pereira", "email": "juliana.martins@email.com", "document": "78901234567"},
        {"name": "Ricardo Mendes Barbosa", "email": "ricardo.mendes@email.com", "document": "89012345678"},
        {"name": "Patricia Fernandes Dias", "email": "patricia.dias@email.com", "document": "90123456789"},
        {"name": "Hospital Boa Saúde LTDA", "email": "contato@boasaude.com.br", "document": "12345678000190"},
    ]

    for customer_data in customers:
        try:
            service.create_customer(**customer_data)
            logger.info(f"Created customer: {customer_data['name']}")
        except ValueError as e:
            logger.warning(f"Customer already exists: {customer_data['email']}")

    logger.info("Customers seeding completed")


def main():
    """Main seed function."""
    logger.info("Starting database seeding...")

    db = SessionLocal()
    try:
        seed_products(db)
        seed_customers(db)
        logger.info("Database seeding completed successfully!")
    except Exception as e:
        logger.error(f"Error during seeding: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
