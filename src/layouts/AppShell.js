import { useState } from 'react'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Collapse from '@mui/material/Collapse'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import { alpha, useTheme, styled } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useSession, signOut } from 'next-auth/react'
import Icon from 'src/components/Icon'
import themeConfig from 'src/configs/themeConfig'

const drawerWidth = themeConfig.navigationSize

// ── Styled main content ───────────────────────────────────────────────────────
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open, isMobile }) => ({
    flexGrow: 1,
    minHeight: '100vh',
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginLeft: isMobile ? 0 : `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen
      }),
      marginLeft: 0
    })
  })
)

// ── Navigation structure ──────────────────────────────────────────────────────
// ── Navigation items — add new routes here as pages are built ────────────────
const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { title: 'Dashboard', path: '/dashboard', icon: 'tabler:layout-dashboard' }
    ]
  }
]

/**
 * Main Layout Component
 *
 * Provides a responsive sidebar + top-bar layout for the EventHub platform.
 */
const Layout = ({ children }) => {
  const [open, setOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const theme = useTheme()
  const router = useRouter()
  const { data: session } = useSession()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleDrawerToggle = () => {
    if (isMobile) setMobileOpen((v) => !v)
    else setOpen((v) => !v)
  }

  const handleLogout = () => signOut({ callbackUrl: '/login' })

  // ── Check if a path/prefix is active ──────────────────────────────────────
  const isActive = (path) =>
    path === '/dashboard'
      ? router.pathname === path
      : router.pathname.startsWith(path)

  // ── Drawer content ─────────────────────────────────────────────────────────
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

      {/* Logo */}
      <Box
        sx={{
          px: 3,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Icon icon="tabler:calendar-event" color="#fff" fontSize={20} />
        </Box>
        <Typography variant="h6" fontWeight={700} color="text.primary" noWrap>
          {themeConfig.templateName}
        </Typography>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {NAV_SECTIONS.map((section) => (
          <Box key={section.label} sx={{ mb: 0.5 }}>
            <Typography
              variant="caption"
              fontWeight={600}
              color="text.disabled"
              sx={{ px: 3, py: 1, display: 'block', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
              {section.label}
            </Typography>

            <List dense disablePadding sx={{ px: 1.5 }}>
              {section.items.map((item) => {
                const active = isActive(item.path)

                return (
                  <ListItem key={item.path} disablePadding sx={{ mb: 0.25 }}>
                    <ListItemButton
                      component={Link}
                      href={item.path}
                      selected={active}
                      sx={{
                        borderRadius: 2,
                        py: 0.875,
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: '#fff',
                          '&:hover': { bgcolor: 'primary.dark' },
                          '& .MuiListItemIcon-root': { color: '#fff' }
                        },
                        '&:not(.Mui-selected):hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.08)
                        }
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 38 }}>
                        <Icon icon={item.icon} fontSize={20} />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: active ? 600 : 400 }}
                      />
                      {item.badge && (
                        <Chip label={item.badge} size="small" color="success" sx={{ height: 18, fontSize: 10 }} />
                      )}
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Divider />

      {/* User + Logout */}
      <Box sx={{ p: 1.5 }}>
        {session?.user && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 1.5,
              py: 1,
              mb: 0.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.06)
            }}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
              {(session.user.name || session.user.email || 'U')[0].toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {session.user.name || session.user.email}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {session.user.role || 'Organizer'}
              </Typography>
            </Box>
          </Box>
        )}

        <ListItemButton onClick={handleLogout} sx={{ borderRadius: 2 }}>
          <ListItemIcon sx={{ minWidth: 38 }}>
            <Icon icon="tabler:logout" fontSize={20} />
          </ListItemIcon>
          <ListItemText primary="Logout" primaryTypographyProps={{ variant: 'body2' }} />
        </ListItemButton>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* ── AppBar ─────────────────────────────────────────────────────────── */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: open ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: open ? `${drawerWidth}px` : 0 },
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen
          }),
          bgcolor: alpha(theme.palette.background.paper, 0.92),
          backdropFilter: 'blur(8px)',
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`
        }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton color="inherit" onClick={handleDrawerToggle} edge="start">
            <Icon icon={open ? 'tabler:layout-sidebar-left-collapse' : 'tabler:layout-sidebar-left-expand'} />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          {/* Quick actions */}
          <Tooltip title="Notifications">
            <IconButton color="inherit" size="small">
              <Icon icon="tabler:bell" fontSize={20} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Search">
            <IconButton color="inherit" size="small">
              <Icon icon="tabler:search" fontSize={20} />
            </IconButton>
          </Tooltip>

          {session?.user && (
            <Avatar
              sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 13, cursor: 'pointer', ml: 0.5 }}
            >
              {(session.user.name || session.user.email || 'U')[0].toUpperCase()}
            </Avatar>
          )}
        </Toolbar>
      </AppBar>

      {/* ── Mobile Drawer ──────────────────────────────────────────────────── */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* ── Desktop Drawer ─────────────────────────────────────────────────── */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            borderRight: `1px solid ${theme.palette.divider}`
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <Main open={open} isMobile={isMobile}>
        <Toolbar />
        <Box sx={{ p: { xs: 2, md: 3 } }}>{children}</Box>
      </Main>
    </Box>
  )
}

export default Layout


/**
 * Main content wrapper
 */
const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open, isMobile }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: isMobile ? 0 : `-${drawerWidth}px`,
    ...(open && {
      transition: theme.transitions.create('margin', {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
)

export default Layout