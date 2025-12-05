from datetime import datetime
from typing import Optional
import re


class Customer:
    """Customer domain entity."""

    def __init__(
        self,
        name: str,
        email: str,
        document: str,
        id: Optional[int] = None,
        created_at: Optional[datetime] = None,
    ):
        self.id = id
        self.name = name
        self.email = email
        self.document = document
        self.created_at = created_at or datetime.utcnow()

    def validate(self) -> None:
        """Validate customer business rules."""
        if not self.name or len(self.name.strip()) == 0:
            raise ValueError("Customer name cannot be empty")

        if not self.email or len(self.email.strip()) == 0:
            raise ValueError("Customer email cannot be empty")

        if not self._is_valid_email(self.email):
            raise ValueError("Invalid email format")

        if not self.document or len(self.document.strip()) == 0:
            raise ValueError("Customer document cannot be empty")

        if not self._is_valid_document(self.document):
            raise ValueError("Invalid document format (must be CPF or CNPJ)")

    @staticmethod
    def _is_valid_email(email: str) -> bool:
        """Validate email format."""
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    @staticmethod
    def _is_valid_document(document: str) -> bool:
        """Validate document format (CPF or CNPJ)."""
        # Remove non-numeric characters
        clean_doc = re.sub(r'\D', '', document)
        # CPF has 11 digits, CNPJ has 14 digits
        return len(clean_doc) in [11, 14]
