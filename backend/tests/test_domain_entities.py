import pytest
from src.domain.entities import Product, Customer, Order, OrderItem, OrderStatus


class TestProduct:
    """Test Product entity business rules."""

    def test_create_valid_product(self):
        """Test creating a valid product."""
        product = Product(
            name="Test Product",
            sku="TEST-001",
            price=10.0,
            stock_qty=100
        )
        product.validate()
        assert product.name == "Test Product"
        assert product.sku == "TEST-001"
        assert product.price == 10.0
        assert product.stock_qty == 100
        assert product.is_active is True

    def test_product_name_cannot_be_empty(self):
        """Test that product name cannot be empty."""
        product = Product(name="", sku="TEST-001", price=10.0, stock_qty=100)
        with pytest.raises(ValueError, match="Product name cannot be empty"):
            product.validate()

    def test_product_sku_cannot_be_empty(self):
        """Test that product SKU cannot be empty."""
        product = Product(name="Test", sku="", price=10.0, stock_qty=100)
        with pytest.raises(ValueError, match="Product SKU cannot be empty"):
            product.validate()

    def test_product_price_cannot_be_negative(self):
        """Test that product price cannot be negative."""
        product = Product(name="Test", sku="TEST-001", price=-10.0, stock_qty=100)
        with pytest.raises(ValueError, match="Product price cannot be negative"):
            product.validate()

    def test_product_stock_cannot_be_negative(self):
        """Test that product stock cannot be negative."""
        product = Product(name="Test", sku="TEST-001", price=10.0, stock_qty=-5)
        with pytest.raises(ValueError, match="Product stock quantity cannot be negative"):
            product.validate()

    def test_has_sufficient_stock(self):
        """Test stock validation."""
        product = Product(name="Test", sku="TEST-001", price=10.0, stock_qty=10)
        assert product.has_sufficient_stock(5) is True
        assert product.has_sufficient_stock(10) is True
        assert product.has_sufficient_stock(11) is False

    def test_reduce_stock(self):
        """Test stock reduction."""
        product = Product(name="Test", sku="TEST-001", price=10.0, stock_qty=10)
        product.reduce_stock(5)
        assert product.stock_qty == 5

    def test_reduce_stock_insufficient(self):
        """Test stock reduction with insufficient stock."""
        product = Product(name="Test", sku="TEST-001", price=10.0, stock_qty=5)
        with pytest.raises(ValueError, match="Insufficient stock"):
            product.reduce_stock(10)


class TestCustomer:
    """Test Customer entity business rules."""

    def test_create_valid_customer(self):
        """Test creating a valid customer."""
        customer = Customer(
            name="John Doe",
            email="john@example.com",
            document="12345678901"
        )
        customer.validate()
        assert customer.name == "John Doe"
        assert customer.email == "john@example.com"
        assert customer.document == "12345678901"

    def test_customer_name_cannot_be_empty(self):
        """Test that customer name cannot be empty."""
        customer = Customer(name="", email="john@example.com", document="12345678901")
        with pytest.raises(ValueError, match="Customer name cannot be empty"):
            customer.validate()

    def test_customer_email_cannot_be_empty(self):
        """Test that customer email cannot be empty."""
        customer = Customer(name="John", email="", document="12345678901")
        with pytest.raises(ValueError, match="Customer email cannot be empty"):
            customer.validate()

    def test_customer_invalid_email(self):
        """Test that customer email must be valid."""
        customer = Customer(name="John", email="invalid-email", document="12345678901")
        with pytest.raises(ValueError, match="Invalid email format"):
            customer.validate()

    def test_customer_document_cannot_be_empty(self):
        """Test that customer document cannot be empty."""
        customer = Customer(name="John", email="john@example.com", document="")
        with pytest.raises(ValueError, match="Customer document cannot be empty"):
            customer.validate()

    def test_customer_invalid_document(self):
        """Test that customer document must be valid (CPF or CNPJ)."""
        customer = Customer(name="John", email="john@example.com", document="123")
        with pytest.raises(ValueError, match="Invalid document format"):
            customer.validate()


class TestOrder:
    """Test Order entity business rules."""

    def test_create_valid_order(self):
        """Test creating a valid order."""
        items = [
            OrderItem(product_id=1, unit_price=10.0, quantity=2),
            OrderItem(product_id=2, unit_price=20.0, quantity=1),
        ]
        order = Order(customer_id=1, items=items)
        order.validate()
        assert order.customer_id == 1
        assert len(order.items) == 2
        assert order.total_amount == 40.0
        assert order.status == OrderStatus.CREATED

    def test_order_must_have_items(self):
        """Test that order must have at least one item."""
        order = Order(customer_id=1, items=[])
        with pytest.raises(ValueError, match="Order must have at least one item"):
            order.validate()

    def test_order_item_quantity_must_be_positive(self):
        """Test that order item quantity must be greater than zero."""
        item = OrderItem(product_id=1, unit_price=10.0, quantity=0)
        with pytest.raises(ValueError, match="Order item quantity must be greater than zero"):
            item.validate()

    def test_order_item_line_total_calculation(self):
        """Test order item line total calculation."""
        item = OrderItem(product_id=1, unit_price=10.5, quantity=3)
        assert item.line_total == 31.5

    def test_order_total_amount_calculation(self):
        """Test order total amount calculation."""
        items = [
            OrderItem(product_id=1, unit_price=10.0, quantity=2),
            OrderItem(product_id=2, unit_price=15.5, quantity=3),
        ]
        order = Order(customer_id=1, items=items)
        assert order.total_amount == 66.5

    def test_mark_order_as_paid(self):
        """Test marking order as paid."""
        items = [OrderItem(product_id=1, unit_price=10.0, quantity=1)]
        order = Order(customer_id=1, items=items)
        order.mark_as_paid()
        assert order.status == OrderStatus.PAID

    def test_cannot_mark_paid_order_as_paid(self):
        """Test that paid order cannot be marked as paid again."""
        items = [OrderItem(product_id=1, unit_price=10.0, quantity=1)]
        order = Order(customer_id=1, items=items, status=OrderStatus.PAID)
        with pytest.raises(ValueError, match="Cannot mark order as paid"):
            order.mark_as_paid()

    def test_cancel_order(self):
        """Test cancelling an order."""
        items = [OrderItem(product_id=1, unit_price=10.0, quantity=1)]
        order = Order(customer_id=1, items=items)
        order.cancel()
        assert order.status == OrderStatus.CANCELLED

    def test_cannot_cancel_paid_order(self):
        """Test that paid order cannot be cancelled."""
        items = [OrderItem(product_id=1, unit_price=10.0, quantity=1)]
        order = Order(customer_id=1, items=items, status=OrderStatus.PAID)
        with pytest.raises(ValueError, match="Cannot cancel a paid order"):
            order.cancel()
