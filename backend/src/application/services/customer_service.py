from typing import List, Optional
from sqlalchemy.orm import Session
from src.domain.entities import Customer
from src.infrastructure.repositories import CustomerRepository
import structlog

logger = structlog.get_logger()


class CustomerService:
    """Service layer for Customer operations."""

    def __init__(self, db: Session):
        self.repository = CustomerRepository(db)
        self.db = db

    def create_customer(self, name: str, email: str, document: str) -> Customer:
        """Create a new customer."""
        logger.info("Creating customer", email=email, document=document)

        # Check if email already exists
        existing_email = self.repository.get_by_email(email)
        if existing_email:
            logger.warning("Customer with email already exists", email=email)
            raise ValueError(f"Customer with email '{email}' already exists")

        # Check if document already exists
        existing_doc = self.repository.get_by_document(document)
        if existing_doc:
            logger.warning("Customer with document already exists", document=document)
            raise ValueError(f"Customer with document '{document}' already exists")

        # Create and validate customer entity
        customer = Customer(name=name, email=email, document=document)
        customer.validate()

        # Save to database
        created_customer = self.repository.create(customer)
        logger.info("Customer created successfully", customer_id=created_customer.id)

        return created_customer

    def get_customer(self, customer_id: int) -> Optional[Customer]:
        """Get customer by ID."""
        logger.debug("Fetching customer", customer_id=customer_id)
        return self.repository.get_by_id(customer_id)

    def list_customers(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        order_by: str = "created_at",
        order_dir: str = "desc"
    ) -> tuple[List[Customer], int]:
        """List customers with pagination and filters."""
        logger.debug("Listing customers", skip=skip, limit=limit, search=search)
        return self.repository.get_all(skip, limit, search, order_by, order_dir)

    def update_customer(
        self,
        customer_id: int,
        name: Optional[str] = None,
        email: Optional[str] = None,
        document: Optional[str] = None
    ) -> Customer:
        """Update an existing customer."""
        logger.info("Updating customer", customer_id=customer_id)

        # Get existing customer
        customer = self.repository.get_by_id(customer_id)
        if not customer:
            logger.warning("Customer not found", customer_id=customer_id)
            raise ValueError(f"Customer with id {customer_id} not found")

        # Check email uniqueness if changing
        if email and email != customer.email:
            existing = self.repository.get_by_email(email)
            if existing:
                logger.warning("Customer with email already exists", email=email)
                raise ValueError(f"Customer with email '{email}' already exists")

        # Check document uniqueness if changing
        if document and document != customer.document:
            existing = self.repository.get_by_document(document)
            if existing:
                logger.warning("Customer with document already exists", document=document)
                raise ValueError(f"Customer with document '{document}' already exists")

        # Update fields
        if name is not None:
            customer.name = name
        if email is not None:
            customer.email = email
        if document is not None:
            customer.document = document

        # Validate and save
        customer.validate()
        updated_customer = self.repository.update(customer)

        logger.info("Customer updated successfully", customer_id=customer_id)
        return updated_customer

    def delete_customer(self, customer_id: int) -> bool:
        """Delete a customer."""
        logger.info("Deleting customer", customer_id=customer_id)

        result = self.repository.delete(customer_id)
        if result:
            logger.info("Customer deleted successfully", customer_id=customer_id)
        else:
            logger.warning("Customer not found", customer_id=customer_id)

        return result
