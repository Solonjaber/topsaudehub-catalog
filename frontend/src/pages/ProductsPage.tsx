import { useState } from 'react'
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
  TextField,
  Typography,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material'
import { Add, Edit, Delete, ArrowUpward, ArrowDownward } from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { productsService } from '../services/products'
import type { Product } from '../types'
import { LoadingSkeleton } from '../components/LoadingSkeleton'

export function ProductsPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [orderBy, setOrderBy] = useState('created_at')
  const [orderDir, setOrderDir] = useState<'asc' | 'desc'>('desc')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { control, handleSubmit, reset } = useForm<Omit<Product, 'id' | 'created_at'>>({
    defaultValues: {
      name: '',
      sku: '',
      price: 0,
      stock_qty: 0,
      is_active: true,
    },
  })

  const { data, isLoading } = useQuery({
    queryKey: ['products', page, rowsPerPage, search, orderBy, orderDir],
    queryFn: () =>
      productsService.getAll({
        skip: page * rowsPerPage,
        limit: rowsPerPage,
        search: search || undefined,
        order_by: orderBy,
        order_dir: orderDir,
      }),
  })

  const createMutation = useMutation({
    mutationFn: productsService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      handleCloseDialog()
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<Product, 'id' | 'created_at'>> }) =>
      productsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      handleCloseDialog()
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: productsService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      setError(null)
    },
    onError: (error: Error) => {
      setError(error.message || 'Erro ao deletar produto')
    },
  })

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      reset(product)
    } else {
      setEditingProduct(null)
      reset({
        name: '',
        sku: '',
        price: 0,
        stock_qty: 0,
        is_active: true,
      })
    }
    setError(null)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingProduct(null)
    setError(null)
  }

  const onSubmit = (formData: Omit<Product, 'id' | 'created_at'>) => {
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleSort = (column: string) => {
    if (orderBy === column) {
      setOrderDir(orderDir === 'asc' ? 'desc' : 'asc')
    } else {
      setOrderBy(column)
      setOrderDir('asc')
    }
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.3s ease-in-out' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Produtos
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Novo Produto
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="Buscar"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nome ou SKU..."
          sx={{ flexGrow: 1 }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ minHeight: '400px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => handleSort('name')}
                >
                  Nome
                  {orderBy === 'name' && (orderDir === 'asc' ? <ArrowUpward /> : <ArrowDownward />)}
                </Box>
              </TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => handleSort('price')}
                >
                  Preço
                  {orderBy === 'price' && (orderDir === 'asc' ? <ArrowUpward /> : <ArrowDownward />)}
                </Box>
              </TableCell>
              <TableCell>Estoque</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} sx={{ py: 8, border: 0 }}>
                  <Box sx={{ px: 2 }}>
                    <LoadingSkeleton variant="table" rows={rowsPerPage} />
                  </Box>
                </TableCell>
              </TableRow>
            ) : data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Nenhum produto encontrado
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>R$ {product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock_qty}</TableCell>
                  <TableCell>
                    <Chip
                      label={product.is_active ? 'Ativo' : 'Inativo'}
                      color={product.is_active ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(product)} size="small">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => deleteMutation.mutate(product.id)} size="small" color="error">
                      <Delete />
                    </IconButton>
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
          labelRowsPerPage="Linhas por página:"
        />
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogTitle>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Nome é obrigatório' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Nome"
                    required
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="sku"
                control={control}
                rules={{ required: 'SKU é obrigatório' }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="SKU"
                    required
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="price"
                control={control}
                rules={{ required: 'Preço é obrigatório', min: 0 }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Preço"
                    type="number"
                    required
                    inputProps={{ step: '0.01', min: '0' }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="stock_qty"
                control={control}
                rules={{ required: 'Quantidade é obrigatória', min: 0 }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Quantidade em Estoque"
                    type="number"
                    required
                    inputProps={{ min: '0' }}
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select {...field} label="Status" value={field.value ? 'true' : 'false'} onChange={(e) => field.onChange(e.target.value === 'true')}>
                      <MenuItem value="true">Ativo</MenuItem>
                      <MenuItem value="false">Inativo</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">
              Salvar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}
