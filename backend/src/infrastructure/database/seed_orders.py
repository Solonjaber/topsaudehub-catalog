"""Script to seed sample orders."""
from sqlalchemy.orm import Session
from src.infrastructure.database.config import SessionLocal
from src.infrastructure.database.models import OrderModel, OrderItemModel, ProductModel, CustomerModel
from src.domain.entities.order import OrderStatus
from datetime import datetime, timedelta
import random


def seed_sample_orders():
    """Create sample orders for dashboard visualization."""
    db = SessionLocal()
    try:
        # Check if orders already exist
        existing_orders = db.query(OrderModel).count()
        if existing_orders >= 10:
            print(f"Já existem {existing_orders} pedidos no banco. Pulando seed de pedidos.")
            return

        if existing_orders > 0:
            print(f"Existem {existing_orders} pedidos no banco. Adicionando mais pedidos de exemplo...")

        # Get all products and customers
        products = db.query(ProductModel).filter(ProductModel.is_active == True).all()
        customers = db.query(CustomerModel).all()

        if not products or not customers:
            print("Não há produtos ou clientes no banco. Execute o seed principal primeiro.")
            return

        print(f"Criando pedidos de exemplo com {len(products)} produtos e {len(customers)} clientes...")

        orders_data = []
        statuses = [OrderStatus.CREATED, OrderStatus.PAID, OrderStatus.CANCELLED]

        # Create 15 sample orders
        for i in range(15):
            # Random customer
            customer = random.choice(customers)

            # Random status (more PAID than others)
            status = random.choices(
                statuses,
                weights=[2, 6, 1],  # 2 CREATED, 6 PAID, 1 CANCELLED
                k=1
            )[0]

            # Random date in the last 30 days
            days_ago = random.randint(0, 30)
            created_at = datetime.now() - timedelta(days=days_ago)

            # Create order
            order = OrderModel(
                customer_id=customer.id,
                status=status.value,
                total_amount=0,  # Will be updated after adding items
                created_at=created_at
            )
            db.add(order)
            db.flush()  # Get order ID

            # Add 1-4 random items to order
            num_items = random.randint(1, 4)
            selected_products = random.sample(products, num_items)

            total_amount = 0
            for product in selected_products:
                quantity = random.randint(1, 5)
                unit_price = product.price
                line_total = unit_price * quantity

                order_item = OrderItemModel(
                    order_id=order.id,
                    product_id=product.id,
                    quantity=quantity,
                    unit_price=unit_price,
                    line_total=line_total
                )
                db.add(order_item)

                total_amount += line_total

            order.total_amount = total_amount
            orders_data.append({
                'id': order.id,
                'customer': customer.name,
                'status': status.value,
                'total': total_amount,
                'items': num_items
            })

        db.commit()

        print(f"\n✅ {len(orders_data)} pedidos de exemplo criados com sucesso!")
        print("\nResumo dos pedidos:")
        for order_info in orders_data[:5]:  # Show first 5
            print(f"  - Pedido #{order_info['id']} | Cliente: {order_info['customer']} | "
                  f"Status: {order_info['status']} | Total: R$ {order_info['total']:.2f} | "
                  f"Itens: {order_info['items']}")
        if len(orders_data) > 5:
            print(f"  ... e mais {len(orders_data) - 5} pedidos")

    except Exception as e:
        db.rollback()
        print(f"❌ Erro ao criar pedidos: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_sample_orders()
