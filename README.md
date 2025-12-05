# TopSaúdeHUB - Sistema de Catálogo e Pedidos

Sistema moderno de gestão de catálogo de produtos e pedidos desenvolvido com **FastAPI** (Python), **React** (TypeScript) e **PostgreSQL**.

## 📋 Sobre o Projeto

Este projeto foi desenvolvido como parte de um case técnico Full-Stack, demonstrando a implementação de um sistema completo de catálogo e pedidos com as seguintes características:

- **Backend robusto** com Python FastAPI e Clean Architecture
- **Frontend moderno** com React 18+ e TypeScript
- **Sidebar fixa e minimizável** para melhor experiência do usuário
- **Ícone personalizado TSH** na aba do navegador
- **Banco de dados PostgreSQL** com migrações Alembic
- **Containerização** completa com Docker e Docker Compose
- **Testes unitários** com pytest
- **Observabilidade** com logs estruturados
- **Idempotência** em criação de pedidos
- **Validação de estoque** em tempo real
- **UI acessível** com Material-UI

## 🏗️ Arquitetura

O projeto segue os princípios de **Clean Architecture** e **SOLID**:

```
.
├── backend/
│   ├── src/
│   │   ├── api/                 # Camada de apresentação (FastAPI)
│   │   │   ├── routes/          # Endpoints REST
│   │   │   ├── schemas/         # Pydantic schemas e envelope
│   │   │   └── main.py          # Aplicação FastAPI
│   │   ├── application/         # Camada de aplicação
│   │   │   └── services/        # Serviços de negócio
│   │   ├── domain/              # Camada de domínio
│   │   │   └── entities/        # Entidades de negócio
│   │   └── infrastructure/      # Camada de infraestrutura
│   │       ├── database/        # SQLAlchemy models e config
│   │       └── repositories/    # Repositórios de dados
│   ├── tests/                   # Testes unitários
│   ├── alembic/                 # Migrações de banco
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── pages/               # Páginas da aplicação
│   │   ├── services/            # Serviços de API
│   │   ├── types/               # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🚀 Tecnologias Utilizadas

### Backend
- **Python 3.11**
- **FastAPI** - Framework web moderno e de alta performance
- **SQLAlchemy** - ORM para PostgreSQL
- **Alembic** - Gerenciamento de migrações
- **Pydantic** - Validação de dados
- **Structlog** - Logs estruturados
- **Pytest** - Testes unitários

### Frontend
- **React 18+** com TypeScript
- **Vite** - Build tool
- **Material-UI (MUI)** - Biblioteca de componentes
- **React Router** - Roteamento
- **TanStack Query (React Query)** - Gerenciamento de estado assíncrono
- **React Hook Form** - Gerenciamento de formulários
- **Axios** - Cliente HTTP

### Infraestrutura
- **PostgreSQL 15**
- **Docker** e **Docker Compose**

## 📦 Funcionalidades

### Gestão de Produtos (CRUD)
- ✅ Listagem com paginação, filtros e ordenação
- ✅ Criação de novos produtos
- ✅ Edição de produtos existentes
- ✅ Exclusão de produtos
- ✅ Validação de estoque
- ✅ Busca por nome ou SKU

### Gestão de Clientes (CRUD)
- ✅ Listagem com paginação, filtros e ordenação
- ✅ Criação de novos clientes
- ✅ Edição de clientes existentes
- ✅ Exclusão de clientes
- ✅ Validação de email e documento (CPF/CNPJ)

### Gestão de Pedidos
- ✅ Criação de pedidos com validação de estoque
- ✅ Transação atômica (rollback em caso de erro)
- ✅ Idempotência via header `Idempotency-Key`
- ✅ Listagem de pedidos
- ✅ Visualização de detalhes do pedido
- ✅ Atualização de status (CREATED, PAID, CANCELLED)
- ✅ Autocomplete para busca de produtos
- ✅ Cálculo automático de totais

### API Features
- ✅ Envelope padrão para todas as respostas
- ✅ Tratamento global de erros
- ✅ CORS configurável
- ✅ Logs estruturados em JSON
- ✅ Health check endpoint

## 🔧 Execução Local

### Pré-requisitos
- Docker e Docker Compose instalados
- Portas 3000, 5432 e 8000 disponíveis

### Passo 1: Clone o repositório

```bash
git clone <url-do-repositorio>
cd case2-saudehub
```

### Passo 2: Configure as variáveis de ambiente

```bash
cp .env.example .env
```

As variáveis padrão já estão configuradas no `.env.example` e funcionam out-of-the-box.

### Passo 3: Inicie os containers

```bash
docker-compose up --build
```

Este comando irá:
1. Criar e iniciar o container PostgreSQL
2. Construir e iniciar o backend FastAPI
3. Executar as migrações do banco de dados
4. Popular o banco com dados de seed (20 produtos, 10 clientes e 23 pedidos de exemplo)
5. Construir e iniciar o frontend React

### Passo 4: Acesse a aplicação

- **Frontend**: http://localhost:3000
- **API Backend**: http://localhost:8000
- **Documentação da API (Swagger)**: http://localhost:8000/docs
- **Documentação da API (ReDoc)**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 🧪 Executando os Testes

### Testes Backend

```bash
# Dentro do container do backend
docker-compose exec backend pytest

# Com coverage
docker-compose exec backend pytest --cov=src --cov-report=html
```

### Estrutura de Testes

Os testes cobrem as regras de negócio das entidades de domínio:

- `tests/test_domain_entities.py` - Testes das entidades Product, Customer e Order
  - Validações de campos obrigatórios
  - Regras de negócio (estoque, status, etc.)
  - Cálculos de totais
  - Transições de estado

## 📡 Contrato de API (Envelope Padrão)

Todas as respostas da API seguem o envelope padrão:

### Sucesso
```json
{
  "cod_retorno": 0,
  "mensagem": null,
  "data": {
    "id": 1,
    "name": "Produto Exemplo"
  }
}
```

### Erro
```json
{
  "cod_retorno": 1,
  "mensagem": "Estoque insuficiente",
  "data": null
}
```

### Campos
- `cod_retorno`: 0 (sucesso) ou 1 (erro)
- `mensagem`: Mensagem descritiva (opcional em sucesso, obrigatória em erro)
- `data`: Payload da operação (null em caso de erro)

## 🗄️ Modelagem do Banco de Dados

```sql
-- Products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    price FLOAT NOT NULL,
    stock_qty INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    document VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    total_amount FLOAT NOT NULL,
    status order_status NOT NULL, -- ENUM: CREATED, PAID, CANCELLED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    unit_price FLOAT NOT NULL,
    quantity INTEGER NOT NULL,
    line_total FLOAT NOT NULL
);
```

## 🔐 Regras de Negócio

### Produtos
- Nome e SKU são obrigatórios
- SKU deve ser único
- Preço e estoque não podem ser negativos
- Apenas produtos ativos podem ser vendidos

### Clientes
- Nome, email e documento são obrigatórios
- Email deve ser válido e único
- Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos) e único

### Pedidos
- Pedido deve ter pelo menos um item
- Validação de estoque antes da criação
- Transação atômica (rollback em caso de erro)
- Idempotência via `Idempotency-Key` header
- Status: CREATED → PAID ou CREATED → CANCELLED
- Pedidos pagos não podem ser cancelados

## 🎨 Interface do Usuário

### Acessibilidade
- Navegação por teclado funcional
- Labels semânticos em formulários
- Feedback visual de ações
- Mensagens de erro claras
- Loading states

### Funcionalidades UI
- Paginação em todas as listagens
- Filtros e ordenação
- Autocomplete para busca de produtos
- Validação de formulários em tempo real
- Confirmação de ações destrutivas
- Cálculo automático de totais

## 📝 Decisões Técnicas

### Backend

1. **Clean Architecture**: Separação clara entre camadas (Domain, Application, Infrastructure, API)
2. **SOLID Principles**: Código modular, testável e manutenível
3. **Repository Pattern**: Abstração da camada de dados
4. **Service Layer**: Lógica de negócio isolada
5. **Envelope Pattern**: Padronização de respostas da API
6. **Structured Logging**: Logs em JSON para melhor observabilidade
7. **Idempotency Store**: Implementação em memória (produção: Redis)

### Frontend

1. **TypeScript**: Type safety e melhor DX
2. **Component Composition**: Componentes reutilizáveis
3. **React Query**: Cache automático e gerenciamento de estado assíncrono
4. **React Hook Form**: Performance e validação otimizada
5. **Material-UI**: Componentes acessíveis e responsivos
6. **Axios Interceptors**: Tratamento global de erros e envelope

### Infraestrutura

1. **Docker Compose**: Ambiente consistente e reproduzível
2. **Multi-stage Builds**: Otimização de imagens
3. **Health Checks**: Garantia de disponibilidade
4. **Volume Persistence**: Dados do PostgreSQL persistidos

## 📊 Dados de Exemplo (Seed)

O sistema é populado automaticamente com dados de demonstração:

### Produtos (20 itens)
- Produtos médicos e hospitalares (termômetros, máscaras, luvas, oxímetros, etc.)
- Preços variando de R$ 9,80 a R$ 1.299,00
- Estoque entre 5 e 500 unidades
- Mix de produtos ativos e inativos

### Clientes (10 registros)
- Pessoas físicas e jurídicas
- Emails e documentos únicos validados
- Dados realistas para testes

### Pedidos (23 registros)
- **8 pedidos CREATED** (aguardando pagamento) - R$ 3.632,00
- **12 pedidos PAID** (confirmados e pagos) - R$ 5.228,10
- **3 pedidos CANCELLED** (cancelados) - R$ 359,40
- **Receita Total**: R$ 9.219,50
- Distribuição temporal nos últimos 30 dias

Isso permite testar todos os fluxos do sistema, incluindo:
- Visualização de pedidos por status
- Gráficos e métricas do dashboard
- Alertas de estoque baixo
- Filtros e ordenação

## 🤖 Uso de IA

Este projeto foi desenvolvido com auxílio de IA (Claude Code) para:

### Desenvolvimento
- Estruturação inicial do projeto seguindo Clean Architecture
- Geração de código boilerplate com boas práticas
- Implementação de endpoints REST com FastAPI
- Criação de componentes React reutilizáveis
- Setup de TypeScript e configurações

### Qualidade
- Revisão de código e sugestões de melhorias
- Implementação de padrões SOLID
- Criação de testes unitários
- Correção de bugs e otimizações
- Validações e tratamento de erros

### Documentação
- Este README completo e estruturado
- Comentários em código quando necessário
- Documentação de API (OpenAPI/Swagger)
- Descrição de decisões técnicas

### Processo
Todo código gerado foi **revisado e adaptado manualmente** para:
- Garantir aderência aos requisitos do case
- Manter qualidade e consistência
- Seguir as melhores práticas da indústria
- Adicionar funcionalidades específicas solicitadas (sidebar fixa, dashboard, etc.)

## 🚀 Próximos Passos (Melhorias Futuras)

- [ ] Implementar autenticação e autorização
- [ ] Adicionar testes de integração
- [ ] Implementar cache com Redis
- [ ] Adicionar logging distribuído (ELK Stack)
- [ ] Implementar CI/CD pipeline
- [ ] Adicionar monitoramento (Prometheus/Grafana)
- [ ] Implementar rate limiting
- [ ] Adicionar documentação OpenAPI extendida
- [ ] Implementar WebSockets para atualizações em tempo real
- [ ] Adicionar suporte a múltiplos idiomas

## 📄 Licença

Este projeto foi desenvolvido para fins de avaliação técnica.

## 👤 Autor

Desenvolvido como parte do case técnico para TopSaúdeHUB.

---

**TopSaúdeHUB** - Sistema de Catálogo e Pedidos © 2025
