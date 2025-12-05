import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Divider,
  Stack,
  Tooltip,
  Alert,
  TextField,
  MenuItem,
} from '@mui/material'
import {
  Add,
  Visibility,
  Delete,
  LocalShipping,
  CheckCircle,
  Cancel,
  Print,
  Email,
  FileDownload,
  Refresh,
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'
import { ordersService } from '../services/orders'
import { customersService } from '../services/customers'
import { productsService } from '../services/products'
import type { Order, Customer, Product } from '../types'
import { LoadingSkeleton } from '../components/LoadingSkeleton'

export function OrdersPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [customerInfo, setCustomerInfo] = useState<Customer | null>(null)
  const [productsInfo, setProductsInfo] = useState<Map<number, Product>>(new Map())

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['orders', page, rowsPerPage, statusFilter],
    queryFn: () =>
      ordersService.getAll({
        skip: page * rowsPerPage,
        limit: rowsPerPage,
        order_by: 'created_at',
        order_dir: 'desc',
        status: statusFilter || undefined,
      }),
    refetchOnMount: 'always',
    staleTime: 0,
  })

  // Refetch when page mounts or becomes visible
  useEffect(() => {
    refetch()
  }, [refetch])

  const deleteMutation = useMutation({
    mutationFn: ordersService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  const handleViewDetails = async (orderId: number) => {
    const order = await ordersService.getById(orderId)
    setSelectedOrder(order)

    // Buscar informações do cliente
    const customer = await customersService.getById(order.customer_id)
    setCustomerInfo(customer)

    // Buscar informações dos produtos
    const productIds = order.items.map((item) => item.product_id)
    const productsMap = new Map<number, Product>()

    for (const productId of productIds) {
      const product = await productsService.getById(productId)
      productsMap.set(productId, product)
    }
    setProductsInfo(productsMap)

    setDetailsOpen(true)
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
        return 'Aguardando Pagamento'
      case 'PAID':
        return 'Pago'
      case 'CANCELLED':
        return 'Cancelado'
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CREATED':
        return <LocalShipping />
      case 'PAID':
        return <CheckCircle />
      case 'CANCELLED':
        return <Cancel />
      default:
        return null
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Gestão de Pedidos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualize e gerencie todos os pedidos do sistema
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Refresh />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Atualizar
          </Button>
          <Button variant="contained" size="large" startIcon={<Add />} onClick={() => navigate('/orders/new')}>
            Novo Pedido
          </Button>
        </Stack>
      </Box>

      {/* Estatísticas Rápidas */}
      {isLoading ? (
        <LoadingSkeleton variant="stats" />
      ) : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <LocalShipping color="warning" fontSize="large" />
                  <Box>
                    <Typography variant="h4">
                      {data?.items.filter((o) => o.status === 'CREATED').length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Aguardando Pagamento
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
                  <CheckCircle color="success" fontSize="large" />
                  <Box>
                    <Typography variant="h4">
                      {data?.items.filter((o) => o.status === 'PAID').length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pagos
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
                  <Cancel color="error" fontSize="large" />
                  <Box>
                    <Typography variant="h4">
                      {data?.items.filter((o) => o.status === 'CANCELLED').length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Cancelados
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Filtrar por Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setPage(0)
              }}
            >
              <MenuItem value="">Todos os Status</MenuItem>
              <MenuItem value="CREATED">Aguardando Pagamento</MenuItem>
              <MenuItem value="PAID">Pago</MenuItem>
              <MenuItem value="CANCELLED">Cancelado</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="body2" color="text.secondary" align="right">
              Total de pedidos: <strong>{data?.total || 0}</strong>
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} sx={{ minHeight: '400px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Pedido #</strong></TableCell>
              <TableCell><strong>Cliente</strong></TableCell>
              <TableCell><strong>Itens</strong></TableCell>
              <TableCell><strong>Total</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Data</strong></TableCell>
              <TableCell align="center"><strong>Ações</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ py: 8, border: 0 }}>
                  <Box sx={{ px: 2 }}>
                    <LoadingSkeleton variant="table" rows={5} />
                  </Box>
                </TableCell>
              </TableRow>
            ) : data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                  <Typography variant="body1" color="text.secondary">
                    Nenhum pedido encontrado
                  </Typography>
                  <Button variant="outlined" startIcon={<Add />} onClick={() => navigate('/orders/new')} sx={{ mt: 2 }}>
                    Criar Primeiro Pedido
                  </Button>
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((order) => (
                <TableRow key={order.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      #{String(order.id).padStart(4, '0')}
                    </Typography>
                  </TableCell>
                  <TableCell>ID: {order.customer_id}</TableCell>
                  <TableCell>
                    <Chip label={`${order.items.length} ${order.items.length === 1 ? 'item' : 'itens'}`} size="small" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold" color="primary">
                      R$ {order.total_amount.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      {...(getStatusIcon(order.status) && { icon: getStatusIcon(order.status)! })}
                      label={getStatusLabel(order.status)}
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(order.created_at).toLocaleTimeString('pt-BR')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Ver Detalhes">
                      <IconButton onClick={() => handleViewDetails(order.id)} size="small" color="primary">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Excluir Pedido">
                      <IconButton onClick={() => deleteMutation.mutate(order.id)} size="small" color="error">
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data?.total || 0}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10))
            setPage(0)
          }}
          labelRowsPerPage="Pedidos por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </TableContainer>

      {/* Dialog de Detalhes */}
      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Pedido #{String(selectedOrder?.id).padStart(4, '0')}</Typography>
            <Chip
              {...(selectedOrder && getStatusIcon(selectedOrder.status) && { icon: getStatusIcon(selectedOrder.status)! })}
              label={selectedOrder ? getStatusLabel(selectedOrder.status) : ''}
              color={selectedOrder ? getStatusColor(selectedOrder.status) : 'default'}
            />
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Box>
              {/* Informações do Cliente */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  INFORMAÇÕES DO CLIENTE
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Nome:</strong> {customerInfo?.name || 'Carregando...'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Email:</strong> {customerInfo?.email || 'Carregando...'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Documento:</strong> {customerInfo?.document || 'Carregando...'}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Informações do Pedido */}
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  DETALHES DO PEDIDO
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Data:</strong> {new Date(selectedOrder.created_at).toLocaleString('pt-BR')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2">
                      <strong>Total de Itens:</strong> {selectedOrder.items.length}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Itens do Pedido */}
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  ITENS DO PEDIDO
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>Produto</strong></TableCell>
                        <TableCell><strong>SKU</strong></TableCell>
                        <TableCell align="right"><strong>Qtd</strong></TableCell>
                        <TableCell align="right"><strong>Preço Unit.</strong></TableCell>
                        <TableCell align="right"><strong>Subtotal</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => {
                        const product = productsInfo.get(item.product_id)
                        return (
                          <TableRow key={index}>
                            <TableCell>{product?.name || `Produto #${item.product_id}`}</TableCell>
                            <TableCell>{product?.sku || '-'}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">R$ {item.unit_price.toFixed(2)}</TableCell>
                            <TableCell align="right">
                              <strong>R$ {item.line_total.toFixed(2)}</strong>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                      <TableRow>
                        <TableCell colSpan={4} align="right">
                          <Typography variant="h6">TOTAL DO PEDIDO:</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="h6" color="primary">
                            R$ {selectedOrder.total_amount.toFixed(2)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>

              {selectedOrder.status === 'CREATED' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Este pedido está aguardando confirmação de pagamento.
                </Alert>
              )}
              {selectedOrder.status === 'PAID' && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Pagamento confirmado! Pedido pronto para separação e entrega.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Print />} onClick={handlePrint}>
            Imprimir
          </Button>
          <Button startIcon={<Email />}>Enviar por Email</Button>
          <Button startIcon={<FileDownload />}>Exportar PDF</Button>
          <Button onClick={() => setDetailsOpen(false)} variant="contained">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
