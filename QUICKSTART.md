# 🚀 Guia Rápido - TopSaúdeHUB

## Início Rápido

### 1. Pré-requisitos
- Docker e Docker Compose instalados
- Portas 3000, 5432 e 8000 livres

### 2. Executar o Projeto

```bash
# Iniciar todos os serviços
docker-compose up --build
```

Aguarde alguns segundos até ver as mensagens:
- `database system is ready to accept connections` (PostgreSQL)
- `Application startup complete` (Backend)
- `ready in XXX ms` (Frontend)

### 3. Acessar a Aplicação

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **Frontend** | http://localhost:3000 | Interface web completa |
| **API** | http://localhost:8000 | API REST |
| **Docs (Swagger)** | http://localhost:8000/docs | Documentação interativa |
| **ReDoc** | http://localhost:8000/redoc | Documentação alternativa |
| **Health** | http://localhost:8000/health | Status da API |

### 4. Testar a API

```bash
# Health check
curl http://localhost:8000/health

# Listar produtos (envelope padrão)
curl http://localhost:8000/api/v1/products?limit=5

# Listar clientes
curl http://localhost:8000/api/v1/customers?limit=5

# Listar pedidos
curl http://localhost:8000/api/v1/orders
```

### 5. Dados Iniciais (Seed)

O sistema já vem com dados de teste:
- ✅ **20 produtos** de equipamentos médicos
- ✅ **10 clientes** (pessoas e empresas)

## Funcionalidades Principais

### Frontend (http://localhost:3000)

**Interface Moderna com:**
- ✨ **Sidebar fixa e minimizável** - Clique no ícone de menu (☰) ou no botão (◄/►) na parte inferior
- 🎨 **Ícone personalizado TSH** - Visível na aba do navegador
- 🏥 **Design clean** com Material-UI

**Funcionalidades:**
1. **Home** - Dashboard com acesso rápido
2. **Produtos** - CRUD completo com paginação e filtros
3. **Clientes** - Gestão de clientes com validação
4. **Pedidos** - Lista de pedidos
5. **Novo Pedido** - Criar pedido com autocomplete e validação de estoque

**Dica:** Minimize a sidebar para ter mais espaço na tela!

### Backend (API REST)

Todas as respostas seguem o envelope padrão:

**Sucesso:**
```json
{
  "cod_retorno": 0,
  "mensagem": null,
  "data": { /* dados */ }
}
```

**Erro:**
```json
{
  "cod_retorno": 1,
  "mensagem": "Mensagem de erro",
  "data": null
}
```

## Comandos Úteis

```bash
# Parar os serviços
docker-compose down

# Parar e remover volumes (limpa banco de dados)
docker-compose down -v

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# Reiniciar um serviço
docker-compose restart backend

# Executar testes
docker-compose exec backend pytest

# Executar testes com coverage
docker-compose exec backend pytest --cov=src --cov-report=term-missing
```

## Exemplo de Uso Completo

### 1. Criar um Produto

```bash
curl -X POST http://localhost:8000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Produto Teste",
    "sku": "TEST-001",
    "price": 99.90,
    "stock_qty": 100,
    "is_active": true
  }'
```

### 2. Criar um Cliente

```bash
curl -X POST http://localhost:8000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João da Silva",
    "email": "joao@teste.com",
    "document": "12345678901"
  }'
```

### 3. Criar um Pedido (com Idempotência)

```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: pedido-123-unique" \
  -d '{
    "customer_id": 1,
    "items": [
      {
        "product_id": 1,
        "quantity": 2
      },
      {
        "product_id": 2,
        "quantity": 1
      }
    ]
  }'
```

## Estrutura de Dados

### Produtos
- ID, Nome, SKU, Preço, Estoque, Ativo, Data de Criação

### Clientes
- ID, Nome, Email, Documento (CPF/CNPJ), Data de Criação

### Pedidos
- ID, Cliente ID, Total, Status (CREATED/PAID/CANCELLED), Data de Criação
- Items: Produto ID, Preço Unitário, Quantidade, Total da Linha

## Recursos Avançados

### Idempotência

Evite pedidos duplicados usando o header `Idempotency-Key`:

```bash
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Idempotency-Key: meu-identificador-unico" \
  -H "Content-Type: application/json" \
  -d '{ /* dados do pedido */ }'
```

Se você enviar a mesma requisição duas vezes com a mesma chave, receberá o mesmo pedido sem criar duplicatas.

### Paginação e Filtros

```bash
# Produtos com paginação
curl "http://localhost:8000/api/v1/products?skip=0&limit=10"

# Produtos com busca
curl "http://localhost:8000/api/v1/products?search=Termômetro"

# Produtos ordenados
curl "http://localhost:8000/api/v1/products?order_by=price&order_dir=asc"
```

### Validação de Estoque

Ao criar um pedido, o sistema:
1. Verifica se todos os produtos existem
2. Valida se há estoque suficiente
3. Reduz o estoque automaticamente
4. Usa transação atômica (rollback em caso de erro)

## Troubleshooting

### Porta em uso

Se alguma porta estiver em uso:

```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :8000
netstat -ano | findstr :5432

# Linux/Mac
lsof -i :3000
lsof -i :8000
lsof -i :5432
```

Altere as portas no `docker-compose.yml` se necessário.

### Reiniciar do zero

```bash
# Para containers, remove volumes e reconstrói
docker-compose down -v
docker-compose up --build
```

### Backend não inicia

Verifique os logs:

```bash
docker-compose logs backend
```

Problemas comuns:
- Banco de dados ainda não está pronto (aguarde o health check)
- Erro de migração (verifique logs do Alembic)

### Frontend não carrega

1. Verifique se o backend está rodando
2. Verifique a variável `VITE_API_URL` no `.env`
3. Limpe o cache do navegador

## Próximos Passos

1. Explore a interface web em http://localhost:3000
2. Teste criar produtos, clientes e pedidos
3. Veja a documentação interativa em http://localhost:8000/docs
4. Execute os testes: `docker-compose exec backend pytest`
5. Leia o README.md completo para detalhes técnicos

## Suporte

- Documentação completa: veja `README.md`
- Guia de desenvolvimento: veja `DEVELOPMENT.md`
- Docs backend: veja `backend/README-backend.md`
- Docs frontend: veja `frontend/README-frontend.md`

---

**TopSaúdeHUB** - Sistema de Catálogo e Pedidos © 2025
