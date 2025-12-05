import { ReactNode, useState } from 'react'
import {
  AppBar,
  Box,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Tooltip,
} from '@mui/material'
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Inventory,
  People,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  LocalHospital,
} from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'

interface LayoutProps {
  children: ReactNode
}

const DRAWER_WIDTH = 240
const DRAWER_WIDTH_COLLAPSED = 65

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Produtos', icon: <Inventory />, path: '/products' },
  { text: 'Clientes', icon: <People />, path: '/customers' },
  { text: 'Pedidos', icon: <ShoppingCart />, path: '/orders' },
]

export function Layout({ children }: LayoutProps) {
  const [open, setOpen] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const handleDrawerToggle = () => {
    setOpen(!open)
  }

  const handleMenuClick = (path: string) => {
    navigate(path)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          transition: (theme) =>
            theme.transitions.create(['width', 'margin'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.leavingScreen,
            }),
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="toggle drawer"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <LocalHospital sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            TopSaúdeHUB - Catálogo e Pedidos
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
          flexShrink: 0,
          whiteSpace: 'nowrap',
          boxSizing: 'border-box',
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          '& .MuiDrawer-paper': {
            width: open ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
            transition: (theme) =>
              theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            overflowX: 'hidden',
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <List>
            {menuItems.map((item) => (
              <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                <Tooltip title={!open ? item.text : ''} placement="right">
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => handleMenuClick(item.path)}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? 'initial' : 'center',
                      px: 2.5,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{
                        opacity: open ? 1 : 0,
                        display: open ? 'block' : 'none',
                      }}
                    />
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            ))}
          </List>
          <Box sx={{ flexGrow: 1 }} />
          <Divider />
          <List>
            <ListItem disablePadding sx={{ display: 'block' }}>
              <Tooltip title={open ? 'Minimizar' : 'Expandir'} placement="right">
                <ListItemButton
                  onClick={handleDrawerToggle}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : 'auto',
                      justifyContent: 'center',
                    }}
                  >
                    {open ? <ChevronLeft /> : <ChevronRight />}
                  </ListItemIcon>
                  <ListItemText
                    primary={open ? 'Minimizar' : ''}
                    sx={{
                      opacity: open ? 1 : 0,
                      display: open ? 'block' : 'none',
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          transition: 'margin-left 0.3s ease-in-out',
        }}
      >
        <Toolbar />
        <Container
          maxWidth="xl"
          sx={{
            flexGrow: 1,
            py: 3,
            px: { xs: 2, sm: 3 },
            minHeight: 'calc(100vh - 64px - 60px)', // viewport - toolbar - footer
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </Container>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 2,
            mt: 'auto',
            backgroundColor: (theme) => theme.palette.grey[200],
          }}
        >
          <Container maxWidth="xl">
            <Typography variant="body2" color="text.secondary" align="center">
              © 2025 TopSaúdeHUB. Todos os direitos reservados.
            </Typography>
          </Container>
        </Box>
      </Box>
    </Box>
  )
}
