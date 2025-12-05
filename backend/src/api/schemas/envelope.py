from typing import Optional, Any, Generic, TypeVar
from pydantic import BaseModel

T = TypeVar('T')


class ApiResponse(BaseModel, Generic[T]):
    """
    Standard API response envelope.

    cod_retorno: 0 for success, 1 for error
    mensagem: Optional message (error description or success message)
    data: Payload of the operation
    """
    cod_retorno: int
    mensagem: Optional[str] = None
    data: Optional[T] = None

    @classmethod
    def success(cls, data: Any = None, mensagem: Optional[str] = None):
        """Create a success response."""
        return cls(cod_retorno=0, mensagem=mensagem, data=data)

    @classmethod
    def error(cls, mensagem: str, data: Any = None):
        """Create an error response."""
        return cls(cod_retorno=1, mensagem=mensagem, data=data)
