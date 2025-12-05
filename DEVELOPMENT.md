# Guia de Desenvolvimento

Este documento contém informações úteis para desenvolvimento e manutenção do projeto.

## Configuração do Ambiente de Desenvolvimento

### Pré-requisitos
- Docker 20.10+
- Docker Compose 2.0+
- Git

### Setup Inicial

1. Clone o repositório:
```bash
git clone <repository-url>
cd case2-saudehub
```

2. Execute o script de setup:
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

Ou manualmente:
```bash
cp .env.example .env
docker-compose up --build
```

## Estrutura de Branches

- `main` - Branch principal (produção)
- `develop` - Branch de desenvolvimento
- `feature/*` - Branches de funcionalidades
- `bugfix/*` - Branches de correção de bugs
- `hotfix/*` - Correções urgentes

## Fluxo de Desenvolvimento

1. Crie uma branch a partir de `develop`:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/nome-da-feature
```

2. Desenvolva e teste localmente

3. Commit com mensagens descritivas:
```bash
git add .
git commit -m "feat: adiciona nova funcionalidade X"
```

4. Push e crie Pull Request:
```bash
git push origin feature/nome-da-feature
```

## Convenções de Código

### Backend (Python)

- Seguir PEP 8
- Usar type hints
- Documentar funções complexas
- Máximo 100 caracteres por linha

Exemplo:
```python
def create_product(
    self,
    name: str,
    sku: str,
    price: float,
    stock_qty: int
) -> Product:
    """
    Create a new product.

    Args:
        name: Product name
        sku: Stock keeping unit
        price: Product price
        stock_qty: Stock quantity

    Returns:
        Created product entity

    Raises:
        ValueError: If SKU already exists
    """
    # Implementation
```

### Frontend (TypeScript/React)

- Usar arrow functions para componentes
- Props tipadas com interfaces
- Usar hooks modernos (useState, useEffect, etc.)
- Componentização adequada

Exemplo:
```typescript
interface ProductFormProps {
  onSubmit: (data: Product) => void
  initialData?: Product
}

export function ProductForm({ onSubmit, initialData }: ProductFormProps) {
  // Implementation
}
```

## Comandos Úteis

### Docker

```bash
# Iniciar serviços
docker-compose up

# Iniciar em background
docker-compose up -d

# Parar serviços
docker-compose down

# Ver logs
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f backend

# Reconstruir imagens
docker-compose up --build

# Executar comando em container
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Backend

```bash
# Entrar no container
docker-compose exec backend bash

# Rodar testes
docker-compose exec backend pytest

# Rodar testes com coverage
docker-compose exec backend pytest --cov=src --cov-report=html

# Criar migração
docker-compose exec backend alembic revision --autogenerate -m "description"

# Aplicar migrações
docker-compose exec backend alembic upgrade head

# Reverter migração
docker-compose exec backend alembic downgrade -1

# Executar seed
docker-compose exec backend python -m src.infrastructure.database.seed

# Lint
docker-compose exec backend black src/
docker-compose exec backend flake8 src/
```

### Frontend

```bash
# Entrar no container
docker-compose exec frontend sh

# Instalar dependência
docker-compose exec frontend npm install <package>

# Build
docker-compose exec frontend npm run build

# Lint
docker-compose exec frontend npm run lint
```

### Database

```bash
# Conectar ao PostgreSQL
docker-compose exec db psql -U topsaudehub -d topsaudehub_catalog

# Backup
docker-compose exec db pg_dump -U topsaudehub topsaudehub_catalog > backup.sql

# Restore
docker-compose exec -T db psql -U topsaudehub topsaudehub_catalog < backup.sql
```

## Testes

### Backend - Testes Unitários

Os testes cobrem as regras de negócio das entidades de domínio.

```bash
# Rodar todos os testes
docker-compose exec backend pytest

# Rodar testes específicos
docker-compose exec backend pytest tests/test_domain_entities.py

# Rodar com coverage
docker-compose exec backend pytest --cov=src --cov-report=term-missing

# Gerar relatório HTML
docker-compose exec backend pytest --cov=src --cov-report=html
```

### Adicionar Novos Testes

1. Criar arquivo em `backend/tests/`
2. Seguir convenção `test_*.py`
3. Usar fixtures do pytest
4. Cobrir casos de sucesso e erro

Exemplo:
```python
def test_product_validation():
    """Test product validation rules."""
    product = Product(name="Test", sku="TEST", price=10.0, stock_qty=5)
    product.validate()  # Should not raise

def test_product_invalid_price():
    """Test product with invalid price."""
    product = Product(name="Test", sku="TEST", price=-10.0, stock_qty=5)
    with pytest.raises(ValueError):
        product.validate()
```

## Debugging

### Backend

Adicione breakpoints com `import pdb; pdb.set_trace()` no código.

Para usar o debugger:
```bash
docker-compose up backend
# Anexe ao processo com seu IDE
```

### Frontend

Use as Chrome DevTools ou React DevTools.

Console do navegador mostrará erros de runtime.

## Troubleshooting

### Portas em uso

Se as portas 3000, 5432 ou 8000 estiverem em uso:

```bash
# Identificar processo
lsof -i :3000
lsof -i :5432
lsof -i :8000

# Matar processo
kill -9 <PID>
```

Ou altere as portas no `docker-compose.yml`.

### Problemas com migrações

```bash
# Resetar banco (CUIDADO: perde dados)
docker-compose down -v
docker-compose up --build
```

### Container não inicia

```bash
# Ver logs
docker-compose logs <service-name>

# Reconstruir
docker-compose up --build

# Remover containers e volumes
docker-compose down -v
docker system prune -a
```

## Performance

### Backend

- Use índices no banco de dados
- Implemente cache (Redis)
- Use paginação em listagens
- Otimize queries com `joinedload`

### Frontend

- Use React.memo para componentes pesados
- Implemente virtualização em listas longas
- Use lazy loading para rotas
- Otimize bundle com code splitting

## Segurança

- Nunca commite `.env` com dados sensíveis
- Use variáveis de ambiente para secrets
- Valide todos os inputs do usuário
- Sanitize dados antes de inserir no banco
- Use HTTPS em produção
- Implemente rate limiting
- Configure CORS adequadamente

## Deploy

### Preparação

1. Configure variáveis de ambiente de produção
2. Construa imagens otimizadas
3. Configure reverse proxy (nginx)
4. Configure SSL/TLS
5. Configure backup automático
6. Configure monitoramento

### Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Migrações aplicadas
- [ ] Testes passando
- [ ] Logs configurados
- [ ] Backup configurado
- [ ] SSL/TLS configurado
- [ ] Monitoramento ativo
- [ ] Rollback plan definido

## Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

### Code Review

Pull Requests devem:
- Ter descrição clara
- Incluir testes
- Passar no CI/CD
- Seguir convenções de código
- Ser revisados por pelo menos 1 pessoa

## Recursos Úteis

### Documentação
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [SQLAlchemy](https://docs.sqlalchemy.org/)
- [Material-UI](https://mui.com/)
- [Docker](https://docs.docker.com/)

### Ferramentas
- [Postman](https://www.postman.com/) - Testar API
- [DBeaver](https://dbeaver.io/) - Cliente PostgreSQL
- [React DevTools](https://react.dev/learn/react-developer-tools)

## Suporte

Para dúvidas ou problemas:
1. Verifique a documentação
2. Procure em issues existentes
3. Abra uma nova issue com detalhes
