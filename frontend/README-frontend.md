# Frontend - TopSaúdeHUB

Interface moderna desenvolvida com React 18, TypeScript e Material-UI.

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/         # Componentes reutilizáveis
│   │   └── Layout.tsx      # Layout principal com navegação
│   │
│   ├── pages/              # Páginas da aplicação
│   │   ├── HomePage.tsx    # Dashboard inicial
│   │   ├── ProductsPage.tsx    # Gestão de produtos
│   │   ├── CustomersPage.tsx   # Gestão de clientes
│   │   ├── OrdersPage.tsx      # Listagem de pedidos
│   │   └── NewOrderPage.tsx    # Criação de pedidos
│   │
│   ├── services/           # Serviços de API
│   │   ├── api.ts          # Configuração Axios + Interceptor
│   │   ├── products.ts     # Serviço de produtos
│   │   ├── customers.ts    # Serviço de clientes
│   │   └── orders.ts       # Serviço de pedidos
│   │
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── Dockerfile
```

## Comandos Úteis

### Desenvolvimento
```bash
npm run dev
```

### Build para produção
```bash
npm run build
```

### Preview da build
```bash
npm run preview
```

### Lint
```bash
npm run lint
```

## Funcionalidades

### Produtos
- Listagem com paginação
- Filtros por nome/SKU
- Ordenação por colunas
- CRUD completo
- Validação de formulários

### Clientes
- Listagem com paginação
- Filtros por nome/email/documento
- Ordenação por colunas
- CRUD completo
- Validação de email e documento

### Pedidos
- Listagem com paginação
- Visualização de detalhes
- Criação com autocomplete de produtos
- Validação de estoque em tempo real
- Cálculo automático de totais
- Feedback visual de status

## Variáveis de Ambiente

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Tecnologias Principais

- React 18.2
- TypeScript 5.3
- Vite 5.0
- Material-UI 5.15
- TanStack Query (React Query) 5.17
- React Router 6.21
- React Hook Form 7.49
- Axios 1.6
