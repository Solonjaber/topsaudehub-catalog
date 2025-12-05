import { Box, Card, CardContent, Grid, Typography, Button } from '@mui/material'
import { Inventory, People, ShoppingCart, AddShoppingCart } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

export function HomePage() {
  const navigate = useNavigate()

  const cards = [
    {
      title: 'Produtos',
      description: 'Gerencie o catálogo de produtos',
      icon: <Inventory sx={{ fontSize: 60 }} />,
      color: '#1976d2',
      path: '/products',
    },
    {
      title: 'Clientes',
      description: 'Gerencie os clientes',
      icon: <People sx={{ fontSize: 60 }} />,
      color: '#388e3c',
      path: '/customers',
    },
    {
      title: 'Pedidos',
      description: 'Visualize e gerencie pedidos',
      icon: <ShoppingCart sx={{ fontSize: 60 }} />,
      color: '#f57c00',
      path: '/orders',
    },
    {
      title: 'Novo Pedido',
      description: 'Crie um novo pedido',
      icon: <AddShoppingCart sx={{ fontSize: 60 }} />,
      color: '#7b1fa2',
      path: '/orders/new',
    },
  ]

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-in-out' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Bem-vindo ao TopSaúdeHUB
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Sistema de gestão de catálogo de produtos e pedidos
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {cards.map((card, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            key={card.title}
            sx={{
              animation: `fadeIn 0.5s ease-in-out ${index * 0.1}s both`,
            }}
          >
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  boxShadow: 6,
                  transform: 'translateY(-4px)',
                },
              }}
              onClick={() => navigate(card.path)}
            >
              <CardContent
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Box sx={{ color: card.color, mb: 2 }}>{card.icon}</Box>
                <Typography variant="h5" component="h2" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.description}
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2, bgcolor: card.color }}
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(card.path)
                  }}
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
