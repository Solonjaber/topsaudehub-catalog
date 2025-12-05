# Backend - TopSaúdeHUB

API REST desenvolvida com FastAPI seguindo Clean Architecture e princípios SOLID.

## Estrutura do Projeto

```
backend/
├── src/
│   ├── api/                    # Camada de apresentação
│   │   ├── routes/             # Endpoints REST
│   │   │   ├── products.py     # CRUD de produtos
│   │   │   ├── customers.py    # CRUD de clientes
│   │   │   └── orders.py       # CRUD de pedidos
│   │   ├── schemas/            # Schemas Pydantic
│   │   │   ├── envelope.py     # Envelope padrão
│   │   │   ├── product.py
│   │   │   ├── customer.py
│   │   │   └── order.py
│   │   └── main.py             # Aplicação FastAPI
│   │
│   ├── application/            # Camada de aplicação
│   │   └── services/           # Serviços de negócio
│   │       ├── product_service.py
│   │       ├── customer_service.py
│   │       └── order_service.py
│   │
│   ├── domain/                 # Camada de domínio
│   │   └── entities/           # Entidades de negócio
│   │       ├── product.py      # Regras de negócio de produto
│   │       ├── customer.py     # Regras de negócio de cliente
│   │       └── order.py        # Regras de negócio de pedido
│   │
│   └── infrastructure/         # Camada de infraestrutura
│       ├── database/
│       │   ├── config.py       # Configuração SQLAlchemy
│       │   ├── models.py       # Models do banco
│       │   └── seed.py         # Script de seed
│       └── repositories/       # Repositórios
│           ├── product_repository.py
│           ├── customer_repository.py
│           └── order_repository.py
│
├── tests/                      # Testes
│   ├── conftest.py
│   └── test_domain_entities.py
│
├── alembic/                    # Migrações
│   └── versions/
│
├── Dockerfile
├── requirements.txt
└── pytest.ini
```

## Comandos Úteis

### Executar servidor de desenvolvimento
```bash
uvicorn src.api.main:app --reload
```

### Executar migrações
```bash
alembic upgrade head
```

### Criar nova migração
```bash
alembic revision --autogenerate -m "description"
```

### Executar seed
```bash
python -m src.infrastructure.database.seed
```

### Executar testes
```bash
pytest
pytest --cov=src --cov-report=html
```

## Endpoints Disponíveis

### Products
- `GET /api/v1/products` - Listar produtos
- `GET /api/v1/products/{id}` - Buscar produto
- `POST /api/v1/products` - Criar produto
- `PUT /api/v1/products/{id}` - Atualizar produto
- `DELETE /api/v1/products/{id}` - Deletar produto
- `GET /api/v1/products/search/autocomplete` - Buscar produtos (autocomplete)

### Customers
- `GET /api/v1/customers` - Listar clientes
- `GET /api/v1/customers/{id}` - Buscar cliente
- `POST /api/v1/customers` - Criar cliente
- `PUT /api/v1/customers/{id}` - Atualizar cliente
- `DELETE /api/v1/customers/{id}` - Deletar cliente

### Orders
- `GET /api/v1/orders` - Listar pedidos
- `GET /api/v1/orders/{id}` - Buscar pedido
- `POST /api/v1/orders` - Criar pedido (com header Idempotency-Key)
- `PATCH /api/v1/orders/{id}/status` - Atualizar status
- `DELETE /api/v1/orders/{id}` - Deletar pedido

## Variáveis de Ambiente

```env
DATABASE_URL=postgresql://user:pass@host:port/db
BACKEND_HOST=0.0.0.0
BACKEND_PORT=8000
LOG_LEVEL=INFO
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000
```
