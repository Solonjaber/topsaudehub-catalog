"""Script to delete orders containing a specific product."""
from src.infrastructure.database.config import SessionLocal
from src.infrastructure.database.models import OrderModel, OrderItemModel, ProductModel


def delete_orders_with_product(product_name: str):
    """Delete all orders that contain a specific product."""
    db = SessionLocal()
    try:
        # Find the product
        product = db.query(ProductModel).filter(ProductModel.name.ilike(f'%{product_name}%')).first()

        if not product:
            print(f"Produto '{product_name}' não encontrado.")
            return

        print(f"Produto encontrado: ID={product.id}, Nome={product.name}")

        # Find order items with this product
        order_items = db.query(OrderItemModel).filter(OrderItemModel.product_id == product.id).all()

        if not order_items:
            print(f"Nenhum pedido usando este produto.")
            return

        print(f"\nEncontrados {len(order_items)} item(ns) de pedido usando este produto.")

        # Get unique order IDs
        order_ids = list(set([item.order_id for item in order_items]))
        print(f"IDs dos pedidos a serem deletados: {order_ids}")

        # Delete order items first (due to foreign key)
        for order_id in order_ids:
            items_count = db.query(OrderItemModel).filter(OrderItemModel.order_id == order_id).delete()
            print(f"  - Deletados {items_count} itens do pedido {order_id}")

        # Delete orders
        for order_id in order_ids:
            order = db.query(OrderModel).filter(OrderModel.id == order_id).first()
            if order:
                db.delete(order)
                print(f"  - Pedido {order_id} deletado")

        db.commit()
        print(f"\n✅ {len(order_ids)} pedido(s) deletado(s) com sucesso!")
        print(f"Agora você pode deletar o produto '{product.name}'")

    except Exception as e:
        db.rollback()
        print(f"❌ Erro: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    delete_orders_with_product("compressa")
