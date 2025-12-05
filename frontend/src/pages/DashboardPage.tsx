import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Paper,
  Chip,
  Avatar,
  Stack,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material'
import {
  Inventory,
  People,
  ShoppingCart,
  AttachMoney,
  TrendingUp,
  Warning,
  CheckCircle,
  LocalShipping,
  Cancel,
  Refresh,
} from '@mui/icons-material'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { ordersService } from '../services/orders'
import { productsService } from '../services/products'
import { customersService } from '../services/customers'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import type { Order, Product } from '../types'

export function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['dashboard-orders', refreshKey],
    queryFn: () => ordersService.getAll({ limit: 100 }),
  })

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['dashboard-products', refreshKey],
    queryFn: () => productsService.getAll({ limit: 100 }),
  })

  const { data: customersData, isLoading: customersLoading } = useQuery({
    queryKey: ['dashboard-customers', refreshKey],
    queryFn: () => customersService.getAll({ limit: 100 }),
  })

  const isLoading = ordersLoading || productsLoading || customersLoading

  // Calcular métricas
  const totalProducts = productsData?.total || 0
  const activeProducts = productsData?.items.filter((p: Product) => p.is_active).length || 0
  const totalCustomers = customersData?.total || 0
  const totalOrders = ordersData?.total || 0

  const totalRevenue = ordersData?.items.reduce((sum: number, order: Order) => {
    return sum + order.total_amount
  }, 0) || 0

  const ordersCreated = ordersData?.items.filter((o: Order) => o.status === 'CREATED').length || 0
  const ordersPaid = ordersData?.items.filter((o: Order) => o.status === 'PAID').length || 0
  const ordersCancelled = ordersData?.items.filter((o: Order) => o.status === 'CANCELLED').length || 0

  // Produtos com estoque baixo
  const lowStockProducts = productsData?.items.filter((p: Product) => p.stock_qty < 10) || []

  // Pedidos recentes
  const recentOrders = ordersData?.items.slice(0, 5) || []

  // Dados para gráficos
  const ordersByStatus = [
    { name: 'Criados', value: ordersCreated, color: '#1976d2' },
    { name: 'Pagos', value: ordersPaid, color: '#2e7d32' },
    { name: 'Cancelados', value: ordersCancelled, color: '#d32f2f' },
  ]

  // Receita por status
  const revenueByStatus = [
    {
      status: 'Criados',
      valor: ordersData?.items
        .filter((o: Order) => o.status === 'CREATED')
        .reduce((sum: number, o: Order) => sum + o.total_amount, 0) || 0,
    },
    {
      status: 'Pagos',
      valor: ordersData?.items
        .filter((o: Order) => o.status === 'PAID')
        .reduce((sum: number, o: Order) => sum + o.total_amount, 0) || 0,
    },
    {
      status: 'Cancelados',
      valor: ordersData?.items
        .filter((o: Order) => o.status === 'CANCELLED')
        .reduce((sum: number, o: Order) => sum + o.total_amount, 0) || 0,
    },
  ]

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CREATED':
        return <LocalShipping fontSize="small" />
      case 'PAID':
        return <CheckCircle fontSize="small" />
      case 'CANCELLED':
        return <Cancel fontSize="small" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CREATED':
        return 'warning'
      case 'PAID':
        return 'success'
      case 'CANCELLED':
        return 'error'
      default:
        return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'CREATED':
        return 'Criado'
      case 'PAID':
        return 'Pago'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return status
    }
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visão geral do sistema de catálogo e pedidos
          </Typography>
        </Box>
        <Tooltip title="Atualizar dados">
          <IconButton onClick={handleRefresh} disabled={isLoading} color="primary">
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Main Metrics Cards */}
      {isLoading ? (
        <LoadingSkeleton variant="stats" />
      ) : (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Total de Produtos */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { boxShadow: 4 } }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total de Produtos
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                      {totalProducts}
                    </Typography>
                    <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                      {activeProducts} ativos
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56 }}>
                    <Inventory sx={{ fontSize: 32, color: 'primary.main' }} />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Total de Clientes */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { boxShadow: 4 } }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total de Clientes
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                      {totalCustomers}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      Cadastrados
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.light', width: 56, height: 56 }}>
                    <People sx={{ fontSize: 32, color: 'success.main' }} />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Total de Pedidos */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { boxShadow: 4 } }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total de Pedidos
                    </Typography>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 'bold' }}>
                      {totalOrders}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                      <TrendingUp fontSize="small" color="success" />
                      +12.5% vs. mês anterior
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'warning.light', width: 56, height: 56 }}>
                    <ShoppingCart sx={{ fontSize: 32, color: 'warning.main' }} />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Receita Total */}
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', transition: 'all 0.3s', '&:hover': { boxShadow: 4 } }}>
              <CardContent>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Receita Total
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                      R$ {totalRevenue.toFixed(2).replace('.', ',')}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                      <TrendingUp fontSize="small" color="success" />
                      +12.5% vs. mês anterior
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.light', width: 56, height: 56 }}>
                    <AttachMoney sx={{ fontSize: 32, color: 'success.main' }} />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Pedidos por Status - Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <TrendingUp color="primary" />
              <Typography variant="h6">Pedidos por Status</Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            {isLoading ? (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LoadingSkeleton variant="cards" rows={1} />
              </Box>
            ) : totalOrders === 0 ? (
              <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Warning sx={{ fontSize: 64, color: 'text.disabled' }} />
                <Typography variant="body1" color="text.secondary">
                  Nenhum pedido encontrado
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Crie pedidos para visualizar as estatísticas
                </Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ordersByStatus.filter(item => item.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                  >
                    {ordersByStatus.filter(item => item.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value: number, name: string) => [`${value} pedidos`, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
            <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Chip label={`Criados: ${ordersCreated} (${totalOrders > 0 ? ((ordersCreated/totalOrders)*100).toFixed(0) : 0}%)`} color="warning" size="small" />
              <Chip label={`Pagos: ${ordersPaid} (${totalOrders > 0 ? ((ordersPaid/totalOrders)*100).toFixed(0) : 0}%)`} color="success" size="small" />
              <Chip label={`Cancelados: ${ordersCancelled} (${totalOrders > 0 ? ((ordersCancelled/totalOrders)*100).toFixed(0) : 0}%)`} color="error" size="small" />
            </Box>
          </Paper>
        </Grid>

        {/* Receita por Status - Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <AttachMoney color="success" />
              <Typography variant="h6">Receita por Status</Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            {isLoading ? (
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LoadingSkeleton variant="cards" rows={1} />
              </Box>
            ) : totalOrders === 0 ? (
              <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Warning sx={{ fontSize: 64, color: 'text.disabled' }} />
                <Typography variant="body1" color="text.secondary">
                  Nenhum pedido encontrado
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Crie pedidos para visualizar a receita
                </Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={revenueByStatus.filter(item => item.valor > 0)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <RechartsTooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                  <Legend />
                  <Bar dataKey="valor" fill="#2e7d32" name="Valor (R$)" maxBarSize={80} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Bottom Row */}
      <Grid container spacing={3}>
        {/* Produtos com Estoque Baixo */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Warning color="error" />
              <Typography variant="h6">Produtos com Estoque Baixo</Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            {isLoading ? (
              <LoadingSkeleton variant="table" rows={3} />
            ) : lowStockProducts.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  Todos os produtos com estoque adequado
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {lowStockProducts.slice(0, 5).map((product: Product) => (
                  <Box
                    key={product.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {product.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {product.sku}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${product.stock_qty} un.`}
                      color={product.stock_qty === 0 ? 'error' : 'warning'}
                      size="small"
                    />
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Pedidos Recentes */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <ShoppingCart color="primary" />
              <Typography variant="h6">Pedidos Recentes</Typography>
            </Stack>
            <Divider sx={{ mb: 2 }} />
            {isLoading ? (
              <LoadingSkeleton variant="table" rows={3} />
            ) : recentOrders.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <ShoppingCart sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  Nenhum pedido recente
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {recentOrders.map((order: Order) => (
                  <Box
                    key={order.id}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      bgcolor: 'background.default',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar sx={{ bgcolor: 'primary.light' }}>
                        <ShoppingCart sx={{ color: 'primary.main' }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          Pedido #{String(order.id).padStart(4, '0')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack alignItems="flex-end" spacing={1}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                        R$ {order.total_amount.toFixed(2)}
                      </Typography>
                      <Chip
                        {...(getStatusIcon(order.status) && { icon: getStatusIcon(order.status)! })}
                        label={getStatusLabel(order.status)}
                        color={getStatusColor(order.status) as any}
                        size="small"
                      />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
