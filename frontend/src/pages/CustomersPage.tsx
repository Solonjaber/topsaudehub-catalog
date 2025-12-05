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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material'
import { Add, Edit, Delete, ArrowUpward, ArrowDownward } from '@mui/icons-material'
import { useForm, Controller } from 'react-hook-form'
import { customersService } from '../services/customers'
import type { Customer } from '../types'
import { LoadingSkeleton } from '../components/LoadingSkeleton'

export function CustomersPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [search, setSearch] = useState('')
  const [orderBy, setOrderBy] = useState('created_at')
  const [orderDir, setOrderDir] = useState<'asc' | 'desc'>('desc')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { control, handleSubmit, reset } = useForm<Omit<Customer, 'id' | 'created_at'>>({
    defaultValues: {
      name: '',
      email: '',
      document: '',
    },
  })

  const { data, isLoading } = useQuery({
    queryKey: ['customers', page, rowsPerPage, search, orderBy, orderDir],
    queryFn: () =>
      customersService.getAll({
        skip: page * rowsPerPage,
        limit: rowsPerPage,
        search: search || undefined,
        order_by: orderBy,
        order_dir: orderDir,
      }),
  })

  const createMutation = useMutation({
    mutationFn: customersService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      handleCloseDialog()
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Omit<Customer, 'id' | 'created_at'>> }) =>
      customersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      handleCloseDialog()
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: customersService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })

  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer)
      reset(customer)
    } else {
      setEditingCustomer(null)
      reset({
        name: '',
        email: '',
        document: '',
      })
    }
    setError(null)
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingCustomer(null)
    setError(null)
  }

  const onSubmit = (formData: Omit<Customer, 'id' | 'created_at'>) => {
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data: formData })
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
          Clientes
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Novo Cliente
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          label="Buscar"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nome, email ou documento..."
          fullWidth
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
              <TableCell>Email</TableCell>
              <TableCell>Documento</TableCell>
              <TableCell>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ py: 8, border: 0 }}>
                  <Box sx={{ px: 2 }}>
                    <LoadingSkeleton variant="table" rows={rowsPerPage} />
                  </Box>
                </TableCell>
              </TableRow>
            ) : data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  Nenhum cliente encontrado
                </TableCell>
              </TableRow>
            ) : (
              data?.items.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.document}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenDialog(customer)} size="small">
                      <Edit />
                    </IconButton>
                    <IconButton onClick={() => deleteMutation.mutate(customer.id)} size="small" color="error">
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
          <DialogTitle>{editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
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
                name="email"
                control={control}
                rules={{
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: 'Email inválido',
                  },
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Email"
                    type="email"
                    required
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
              <Controller
                name="document"
                control={control}
                rules={{
                  required: 'Documento é obrigatório',
                  minLength: { value: 11, message: 'Documento deve ter no mínimo 11 dígitos' },
                }}
                render={({ field, fieldState }) => (
                  <TextField
                    {...field}
                    label="Documento (CPF/CNPJ)"
                    required
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
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
