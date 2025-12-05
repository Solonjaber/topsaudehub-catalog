from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from src.infrastructure.database.models import CustomerModel
from src.domain.entities import Customer


class CustomerRepository:
    """Repository for Customer entity."""

    def __init__(self, db: Session):
        self.db = db

    def create(self, customer: Customer) -> Customer:
        """Create a new customer."""
        db_customer = CustomerModel(
            name=customer.name,
            email=customer.email,
            document=customer.document,
        )
        self.db.add(db_customer)
        self.db.commit()
        self.db.refresh(db_customer)
        return self._to_entity(db_customer)

    def get_by_id(self, customer_id: int) -> Optional[Customer]:
        """Get customer by ID."""
        db_customer = self.db.query(CustomerModel).filter(CustomerModel.id == customer_id).first()
        return self._to_entity(db_customer) if db_customer else None

    def get_by_email(self, email: str) -> Optional[Customer]:
        """Get customer by email."""
        db_customer = self.db.query(CustomerModel).filter(CustomerModel.email == email).first()
        return self._to_entity(db_customer) if db_customer else None

    def get_by_document(self, document: str) -> Optional[Customer]:
        """Get customer by document."""
        db_customer = self.db.query(CustomerModel).filter(CustomerModel.document == document).first()
        return self._to_entity(db_customer) if db_customer else None

    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        order_by: str = "created_at",
        order_dir: str = "desc"
    ) -> tuple[List[Customer], int]:
        """Get all customers with pagination and filters."""
        query = self.db.query(CustomerModel)

        # Apply filters
        if search:
            query = query.filter(
                or_(
                    CustomerModel.name.ilike(f"%{search}%"),
                    CustomerModel.email.ilike(f"%{search}%"),
                    CustomerModel.document.ilike(f"%{search}%")
                )
            )

        # Get total count
        total = query.count()

        # Apply ordering
        order_column = getattr(CustomerModel, order_by, CustomerModel.created_at)
        if order_dir.lower() == "desc":
            query = query.order_by(order_column.desc())
        else:
            query = query.order_by(order_column.asc())

        # Apply pagination
        customers = query.offset(skip).limit(limit).all()

        return [self._to_entity(c) for c in customers], total

    def update(self, customer: Customer) -> Customer:
        """Update an existing customer."""
        db_customer = self.db.query(CustomerModel).filter(CustomerModel.id == customer.id).first()
        if not db_customer:
            raise ValueError(f"Customer with id {customer.id} not found")

        db_customer.name = customer.name
        db_customer.email = customer.email
        db_customer.document = customer.document

        self.db.commit()
        self.db.refresh(db_customer)
        return self._to_entity(db_customer)

    def delete(self, customer_id: int) -> bool:
        """Delete a customer."""
        db_customer = self.db.query(CustomerModel).filter(CustomerModel.id == customer_id).first()
        if not db_customer:
            return False

        self.db.delete(db_customer)
        self.db.commit()
        return True

    @staticmethod
    def _to_entity(model: CustomerModel) -> Customer:
        """Convert database model to domain entity."""
        return Customer(
            id=model.id,
            name=model.name,
            email=model.email,
            document=model.document,
            created_at=model.created_at,
        )
