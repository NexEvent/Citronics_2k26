import { useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { alpha, useTheme } from '@mui/material/styles'
import Collapse from '@mui/material/Collapse'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { useSession } from 'next-auth/react'
import Icon from 'src/components/Icon'
import { selectCartEventCount } from 'src/store/slices/cartSlice'
import { useAppPalette } from 'src/components/palette'

/* ── Navigation items ──────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: 'tabler:home', matchExact: true },
  { label: 'Events', href: '/events', icon: 'tabler:calendar-event' },
  {
    label: 'About',
    href: '#',
    icon: 'tabler:info-circle',
    children: [
      { label: 'About CDGI', href: '/about', icon: 'tabler:school' },
      { label: 'About Citronics', href: '/about-citronics', icon: 'tabler:rocket' },
   
      { label: 'About Team', href: '/team', icon: 'tabler:users-group' },

    ]
  },
  { label: 'Cart', href: '/cart', icon: 'tabler:shopping-cart', showBadge: true },
  { label: 'Login', href: '/login', icon: 'tabler:login', guestOnly: true },
  { label: 'Dashboard', href: '/dashboard', icon: 'tabler:layout-dashboard', authOnly: true }
]

/**
 * MobileBottomNav — Fixed bottom navigation bar for small screens.
 *
 * - Visible only below the `md` breakpoint
 * - Highlights the active route
 * - Supports safe-area insets for iPhone notch/home-indicator
 * - Does NOT affect desktop layout
 */
const MobileBottomNav = () => {
  const theme = useTheme()
  const c = useAppPalette()
  const router = useRouter()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const cartEventCount = useSelector(selectCartEventCount)
  const { data: session } = useSession()
  const [submenuOpen, setSubmenuOpen] = useState(false)

  const items = useMemo(() => {
    return NAV_ITEMS.filter(item => {
      if (item.authOnly && !session?.user) return false
      if (item.guestOnly && session?.user) return false
      return true
    })
  }, [session])

  if (!isMobile) return null

  const isActive = (href, matchExact, isAnchor) => {
    if (isAnchor) return false
    if (matchExact) return router.pathname === href
    return router.pathname === href || router.pathname.startsWith(href + '/')
  }

  const isChildActive = (item) => {
    if (!item.children) return false
    return item.children.some(child => router.pathname === child.href || router.pathname.startsWith(child.href + '/'))
  }

  const handleNavClick = (item) => {
    if (item.children) {
      setSubmenuOpen(prev => !prev)
      return
    }
    setSubmenuOpen(false)
    if (item.isAnchor) {
      if (router.pathname === '/') {
        const el = document.getElementById('about')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        router.push(item.href)
      }
      return
    }
    router.push(item.href)
  }

  const handleSubItemClick = (href) => {
    setSubmenuOpen(false)
    router.push(href)
  }

  return (
    <Box
      component='nav'
      aria-label='Mobile navigation'
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.drawer + 3
      }}
    >
      {/* Submenu panel */}
      <Collapse in={submenuOpen} timeout={250}>
        <Box
          sx={{
            mx: 1,
            mb: 0.5,
            p: 1,
            borderRadius: '16px',
            bgcolor: c.isDark ? alpha(c.bgPaper, 0.97) : alpha(c.white, 0.98),
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: `1px solid ${c.isDark ? alpha(c.white, 0.1) : alpha(c.black, 0.08)}`,
            boxShadow: `0 -8px 32px ${alpha(c.black, 0.12)}`,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 0.5
          }}
        >
          {NAV_ITEMS.find(i => i.children)?.children.map(child => {
            const childActive = router.pathname === child.href
            return (
              <Box
                key={child.href}
                role='button'
                tabIndex={0}
                onClick={() => handleSubItemClick(child.href)}
                onKeyDown={e => e.key === 'Enter' && handleSubItemClick(child.href)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 1.2,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  bgcolor: childActive ? alpha(c.primary, 0.1) : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: alpha(c.primary, 0.08) },
                  '&:active': { transform: 'scale(0.97)' }
                }}
              >
                <Icon
                  icon={child.icon}
                  fontSize={18}
                  color={childActive ? c.primary : c.isDark ? alpha(c.white, 0.6) : alpha(c.black, 0.5)}
                />
                <Typography
                  component='span'
                  sx={{
                    fontSize: '0.78rem',
                    fontWeight: childActive ? 700 : 500,
                    color: childActive ? c.primary : c.isDark ? alpha(c.white, 0.7) : alpha(c.black, 0.6),
                    lineHeight: 1.2
                  }}
                >
                  {child.label}
                </Typography>
              </Box>
            )
          })}
        </Box>
      </Collapse>

      {/* Main nav bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          bgcolor: c.isDark
            ? alpha(c.bgPaper, 0.95)
            : alpha(c.white, 0.97),
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderTop: `1px solid ${c.isDark ? alpha(c.white, 0.08) : alpha(c.black, 0.06)}`,
          boxShadow: `0 -4px 24px ${alpha(c.black, 0.08)}`,
          height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
          pb: 'env(safe-area-inset-bottom, 0px)',
          px: 0.5
        }}
      >
        {items.map(item => {
          const active = item.children ? isChildActive(item) || submenuOpen : isActive(item.href, item.matchExact, item.isAnchor)

          return (
            <Box
              key={item.label}
              role='button'
              tabIndex={0}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              onClick={() => handleNavClick(item)}
              onKeyDown={e => e.key === 'Enter' && handleNavClick(item)}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                gap: 0.25,
                pt: 1,
                pb: 0.5,
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.2s ease',
                borderRadius: '12px',
                mx: 0.25,
                '&::before': active
                  ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '25%',
                      right: '25%',
                      height: 3,
                      borderRadius: '0 0 3px 3px',
                      bgcolor: c.primary,
                      transition: 'all 0.25s ease'
                    }
                  : {},
                '&:hover': {
                  bgcolor: alpha(c.primary, 0.06)
                },
                '&:active': {
                  transform: 'scale(0.95)'
                }
              }}
            >
              <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon
                  icon={item.icon}
                  fontSize={22}
                  color={active ? c.primary : c.isDark ? alpha(c.white, 0.55) : alpha(c.black, 0.45)}
                />
                {item.showBadge && cartEventCount > 0 && (
                  <Box
                    component='span'
                    sx={{
                      position: 'absolute',
                      top: -4,
                      right: -8,
                      minWidth: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: c.error,
                      color: c.white,
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1,
                      px: 0.25
                    }}
                  >
                    {cartEventCount > 9 ? '9+' : cartEventCount}
                  </Box>
                )}
              </Box>

              <Typography
                component='span'
                sx={{
                  fontSize: '0.62rem',
                  fontWeight: active ? 700 : 500,
                  letterSpacing: '0.02em',
                  color: active
                    ? c.primary
                    : c.isDark
                      ? alpha(c.white, 0.5)
                      : alpha(c.black, 0.45),
                  lineHeight: 1,
                  transition: 'color 0.2s ease'
                }}
              >
                {item.label}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default MobileBottomNav