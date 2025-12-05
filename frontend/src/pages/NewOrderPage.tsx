import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Paper,
  Typography,
  TextField,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  Tooltip,
  InputAdornment,
} from '@mui/material'
import {
  Add,
  Delete,
  ShoppingCart,
  Warning,
  CheckCircle,
  Person,
  Inventory,
  AttachMoney,
} from '@mui/icons-material'
import { ordersService } from '../services/orders'
import { productsService } from '../services/products'
import { customersService } from '../services/customers'
import type { Product, Customer, CreateOrderItem } from '../types'

interface OrderItemForm {
  product: Product | null
  quantity: number
}

export function NewOrderPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [customerId, setCustomerId] = useState<number | null>(null)
  const [items, setItems] = useState<OrderItemForm[]>([])
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [currentQuantity, setCurrentQuantity] = useState(1)
  const [productSearch, setProductSearch] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersService.getAll({ limit: 100 }),
  })

  const { data: products } = useQuery({
    queryKey: ['products-search', productSearch],
    queryFn: () => productsService.search(productSearch),
    enabled: productSearch.length > 0,
  })

  const createOrderMutation = useMutation({
    mutationFn: (data: { customer_id: number; items: CreateOrderItem[] }) =>
      ordersService.create(data),
    onSuccess: async () => {
      // Invalidar e refetch do cache de pedidos
      await queryClient.invalidateQueries({ queryKey: ['orders'] })
      await queryClient.refetchQueries({ queryKey: ['orders'] })

      setSuccess('Pedido criado com sucesso!')
      setTimeout(() => {
        navigate('/orders')
      }, 1500)
    },
    onError: (err: Error) => {
      setError(err.message || 'Erro ao criar pedido')
    },
  })

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const handleAddItem = () => {
    if (!currentProduct) {
      setError('Selecione um produto')
      return
    }

    if (currentQuantity <= 0) {
      setError('Quantidade deve ser maior que zero')
      return
    }

    if (currentProduct.stock_qty < currentQuantity) {
      setError(`Estoque insuficiente. Disponível: ${currentProduct.stock_qty} unidades`)
      return
    }

    const existingItem = items.find((item) => item.product?.id === currentProduct.id)
    if (existingItem) {
      setError('Produto já adicionado ao pedido. Para alterar a quantidade, remova o item e adicione novamente.')
      return
    }

    setItems([...items, { product: currentProduct, quantity: currentQuantity }])
    setCurrentProduct(null)
    setCurrentQuantity(1)
    setProductSearch('')
    setError(null)
    setSuccess(`${currentProduct.name} adicionado ao pedido`)
  }

  const handleRemoveItem = (index: number) => {
    const removedItem = items[index]
    setItems(items.filter((_, i) => i !== index))
    setSuccess(`${removedItem.product?.name} removido do pedido`)
  }

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setError('Quantidade deve ser maior que zero')
      return
    }

    const item = items[index]
    if (item.product && item.product.stock_qty < newQuantity) {
      setError(`Estoque insuficiente. Disponível: ${item.product.stock_qty} unidades`)
      return
    }

    const updatedItems = [...items]
    updatedItems[index] = { ...item, quantity: newQuantity }
    setItems(updatedItems)
    setError(null)
  }

  const calculateTotal = () => {
    return items.reduce((total, item) => {
      if (item.product) {
        return total + item.product.price * item.quantity
      }
      return total
    }, 0)
  }

  const calculateTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const handleSubmit = () => {
    if (!customerId) {
      setError('Selecione um cliente para o pedido')
      return
    }

    if (items.length === 0) {
      setError('Adicione pelo menos um produto ao pedido')
      return
    }

    const orderItems: CreateOrderItem[] = items.map((item) => ({
      product_id: item.product!.id,
      quantity: item.quantity,
    }))

    createOrderMutation.mutate({
      customer_id: customerId,
      items: orderItems,
    })
  }

  const selectedCustomer = customers?.items.find((c: Customer) => c.id === customerId)

  const getStockStatus = (product: Product, quantity: number) => {
    const stockPercent = (quantity / product.stock_qty) * 100
    if (stockPercent > 80) return { color: 'error' as const, text: 'Estoque Baixo' }
    if (stockPercent > 50) return { color: 'warning' as const, text: 'Estoque Médio' }
    return { color: 'success' as const, text: 'Estoque OK' }
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingCart color="primary" />
          Novo Pedido
        </Typography>
      </Box>

      <Box sx={{ minHeight: '60px', mb: error || success ? 0 : 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, animation: 'fadeIn 0.3s ease-in-out' }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2, animation: 'fadeIn 0.3s ease-in-out' }} onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Person color="primary" fontSize="large" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cliente Selecionado
                  </Typography>
                  <Typography variant="h6">
                    {selectedCustomer ? selectedCustomer.name : 'Nenhum'}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Inventory color="primary" fontSize="large" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total de Itens
                  </Typography>
                  <Typography variant="h6">{calculateTotalItems()} unidades</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <AttachMoney color="primary" fontSize="large" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Valor Total
                  </Typography>
                  <Typography variant="h6" color="primary">
                    R$ {calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Customer Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person />
          Selecionar Cliente
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <FormControl fullWidth>
          <InputLabel>Cliente *</InputLabel>
          <Select
            value={customerId || ''}
            onChange={(e) => setCustomerId(Number(e.target.value))}
            label="Cliente *"
          >
            <MenuItem value="">
              <em>Selecione um cliente</em>
            </MenuItem>
            {customers?.items.map((customer: Customer) => (
              <MenuItem key={customer.id} value={customer.id}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="body1">{customer.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {customer.email} • Doc: {customer.document}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Add Products */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Inventory />
          Adicionar Produtos ao Pedido
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              fullWidth
              options={products || []}
              getOptionLabel={(option) => `${option.name} (${option.sku})`}
              value={currentProduct}
              onChange={(_, newValue) => setCurrentProduct(newValue)}
              inputValue={productSearch}
              onInputChange={(_, newInputValue) => setProductSearch(newInputValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar Produto *"
                  placeholder="Digite o nome ou SKU do produto..."
                />
              )}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body1">{option.name}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        SKU: {option.sku}
                      </Typography>
                      <Chip
                        size="small"
                        label={`R$ ${option.price.toFixed(2)}`}
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        size="small"
                        label={`Estoque: ${option.stock_qty}`}
                        color={option.stock_qty > 10 ? 'success' : option.stock_qty > 0 ? 'warning' : 'error'}
                      />
                    </Stack>
                  </Box>
                </li>
              )}
              noOptionsText="Nenhum produto encontrado"
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Quantidade *"
              type="number"
              value={currentQuantity}
              onChange={(e) => setCurrentQuantity(Number(e.target.value))}
              inputProps={{ min: 1 }}
              InputProps={{
                endAdornment: <InputAdornment position="end">un.</InputAdornment>,
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={handleAddItem}
              sx={{ height: '56px' }}
            >
              Adicionar
            </Button>
          </Grid>
        </Grid>

        {currentProduct && (
          <Alert
            severity={
              currentProduct.stock_qty === 0
                ? 'error'
                : currentProduct.stock_qty < 10
                ? 'warning'
                : 'info'
            }
            icon={currentProduct.stock_qty === 0 ? <Warning /> : <CheckCircle />}
            sx={{ mt: 2 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {currentProduct.name}
            </Typography>
            <Typography variant="body2">
              Estoque disponível: {currentProduct.stock_qty} unidades • Preço: R${' '}
              {currentProduct.price.toFixed(2)}
            </Typography>
            {currentQuantity > 0 && (
              <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                Subtotal: R$ {(currentProduct.price * currentQuantity).toFixed(2)}
              </Typography>
            )}
          </Alert>
        )}
      </Paper>

      {/* Order Items */}
      <Paper sx={{ p: 3, mb: 3, minHeight: '300px' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingCart />
          Itens do Pedido ({items.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {items.length === 0 ? (
          <Alert severity="info" sx={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            Nenhum item adicionado ao pedido. Use o campo acima para adicionar produtos.
          </Alert>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Produto</TableCell>
                  <TableCell>SKU</TableCell>
                  <TableCell align="right">Preço Unit.</TableCell>
                  <TableCell align="center">Quantidade</TableCell>
                  <TableCell align="right">Subtotal</TableCell>
                  <TableCell align="center">Status Estoque</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => {
                  const stockStatus = item.product
                    ? getStockStatus(item.product, item.quantity)
                    : { color: 'default' as const, text: '' }
                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {item.product?.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={item.product?.sku} variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">R$ {item.product?.price.toFixed(2)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(index, Number(e.target.value))}
                          inputProps={{ min: 1, style: { textAlign: 'center' } }}
                          size="small"
                          sx={{ width: 80 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          R$ {((item.product?.price || 0) * item.quantity).toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip size="small" label={stockStatus.text} color={stockStatus.color} />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Remover item">
                          <IconButton onClick={() => handleRemoveItem(index)} size="small" color="error">
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Order Summary and Actions */}
      {items.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h6" gutterBottom>
                Resumo do Pedido
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total de Produtos:
                  </Typography>
                  <Typography variant="body2">{items.length} produtos diferentes</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Total de Unidades:
                  </Typography>
                  <Typography variant="body2">{calculateTotalItems()} unidades</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="h6">Valor Total:</Typography>
                  <Typography variant="h6" color="primary">
                    R$ {calculateTotal().toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" size="large" onClick={() => navigate('/orders')}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          size="large"
          startIcon={<ShoppingCart />}
          onClick={handleSubmit}
          disabled={!customerId || items.length === 0 || createOrderMutation.isPending}
        >
          {createOrderMutation.isPending ? 'Criando Pedido...' : 'Criar Pedido'}
        </Button>
      </Box>
    </Box>
  )
}
