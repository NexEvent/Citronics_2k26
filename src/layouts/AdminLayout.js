import { useState } from 'react'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme, alpha } from '@mui/material/styles'
import { Classic } from '@theme-toggles/react'
import '@theme-toggles/react/css/Classic.css'
import Icon from 'src/components/Icon'
import { useSettings } from 'src/hooks/useSettings'
import { isAdminRole, canModify, isOwner } from 'src/configs/acl'

const DRAWER_WIDTH = 260

// Navigation items
const getNavItems = (userRole) => {
  const items = [
    {
      title: 'Dashboard',
      path: '/admin/dashboard',
      icon: 'tabler:layout-dashboard'
    },
    {
      title: 'Events',
      path: '/admin/events',
      icon: 'tabler:calendar-event'
    },
    {
      title: 'Users',
      path: '/admin/users',
      icon: 'tabler:users'
    },
    {
      title: 'Analytics',
      path: '/admin/analytics',
      icon: 'tabler:chart-bar'
    }
  ]

  return items
}

const AdminLayout = ({ children }) => {
  const theme = useTheme()
  const router = useRouter()
  const { data: session } = useSession()
  const { settings, saveSettings } = useSettings()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileAnchor, setProfileAnchor] = useState(null)

  const isDark = settings.mode === 'dark'
  const userRole = session?.user?.role?.toLowerCase() || ''
  const navItems = getNavItems(userRole)

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen)
  const handleThemeToggle = () => saveSettings({ ...settings, mode: isDark ? 'light' : 'dark' })
  const handleProfileOpen = (e) => setProfileAnchor(e.currentTarget)
  const handleProfileClose = () => setProfileAnchor(null)
  const handleLogout = () => {
    setProfileAnchor(null)
    signOut({ callbackUrl: '/admin/login' })
  }
  const handleGoHome = () => router.push('/')

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'owner': return 'error'
      case 'admin': return 'primary'
      case 'executive': return 'info'
      default: return 'default'
    }
  }

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Section */}
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon icon='tabler:bolt' color='white' fontSize={24} />
        </Box>
        <Box>
          <Typography variant='h6' fontWeight={700} lineHeight={1.2}>
            Citronics
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Admin Portal
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* User Info */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          {session?.user?.name?.[0]?.toUpperCase() || 'A'}
        </Avatar>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography variant='body2' fontWeight={600} noWrap>
            {session?.user?.name || 'Admin'}
          </Typography>
          <Chip
            label={userRole?.toUpperCase()}
            color={getRoleBadgeColor(userRole)}
            size='small'
            sx={{ height: 20, fontSize: '0.65rem', mt: 0.5 }}
          />
        </Box>
      </Box>

      <Divider />

      {/* Navigation */}
      <List sx={{ flex: 1, py: 1 }}>
        {navItems.map((item) => {
          const isActive = router.pathname.startsWith(item.path)
          return (
            <ListItemButton
              key={item.path}
              onClick={() => {
                router.push(item.path)
                if (isMobile) setMobileOpen(false)
              }}
              sx={{
                mx: 1.5,
                mb: 0.5,
                borderRadius: 2,
                bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                color: isActive ? 'primary.main' : 'text.secondary',
                '&:hover': {
                  bgcolor: isActive
                    ? alpha(theme.palette.primary.main, 0.15)
                    : alpha(theme.palette.primary.main, 0.05)
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: isActive ? 'primary.main' : 'inherit'
                }}
              >
                <Icon icon={item.icon} fontSize={22} />
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.9rem'
                }}
              />
            </ListItemButton>
          )
        })}
      </List>

      <Divider />

      {/* Footer Actions */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleGoHome}
          sx={{
            borderRadius: 2,
            mb: 1,
            bgcolor: alpha(theme.palette.info.main, 0.1),
            '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.15) }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <Icon icon='tabler:home' fontSize={20} />
          </ListItemIcon>
          <ListItemText
            primary='Go to Site'
            primaryTypographyProps={{ fontSize: '0.875rem' }}
          />
        </ListItemButton>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            color: 'error.main',
            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
            <Icon icon='tabler:logout' fontSize={20} />
          </ListItemIcon>
          <ListItemText
            primary='Logout'
            primaryTypographyProps={{ fontSize: '0.875rem' }}
          />
        </ListItemButton>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position='fixed'
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Toolbar>
          <IconButton
            color='inherit'
            edge='start'
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' }, color: 'text.primary' }}
          >
            <Icon icon='tabler:menu-2' />
          </IconButton>

          <Typography variant='h6' component='div' sx={{ flexGrow: 1, color: 'text.primary' }}>
            {navItems.find((item) => router.pathname.startsWith(item.path))?.title || 'Admin'}
          </Typography>

          {/* Theme Toggle */}
          <Tooltip title={isDark ? 'Light Mode' : 'Dark Mode'}>
            <Box sx={{ mr: 1 }}>
              <Classic
                duration={500}
                toggled={isDark}
                toggle={handleThemeToggle}
                style={{
                  fontSize: '1.4rem',
                  color: theme.palette.text.primary
                }}
              />
            </Box>
          </Tooltip>

          {/* Profile Menu */}
          <Tooltip title='Account'>
            <IconButton onClick={handleProfileOpen} sx={{ p: 0.5 }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                {session?.user?.name?.[0]?.toUpperCase() || 'A'}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={handleProfileClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant='body2' fontWeight={600}>
                {session?.user?.name}
              </Typography>
              <Typography variant='caption' color='text.secondary'>
                {session?.user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleGoHome}>
              <Icon icon='tabler:home' style={{ marginRight: 8 }} />
              Go to Site
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <Icon icon='tabler:logout' style={{ marginRight: 8 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component='nav'
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile Drawer */}
        <Drawer
          variant='temporary'
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              bgcolor: 'background.paper'
            }
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant='permanent'
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              bgcolor: 'background.paper',
              borderRight: `1px solid ${theme.palette.divider}`
            }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component='main'
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          bgcolor: 'background.default',
          minHeight: '100vh'
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        {children}
      </Box>
    </Box>
  )
}

export default AdminLayout
