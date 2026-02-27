import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { alpha, useTheme } from '@mui/material/styles'
import { useRouter } from 'next/router'
import { useSelector } from 'react-redux'
import { useSession } from 'next-auth/react'
import {
  IconHome,
  IconCalendarEvent,
  IconShoppingCart,
  IconInfoCircle,
  IconLayoutDashboard
} from '@tabler/icons-react'
import { selectCartEventCount } from 'src/store/slices/cartSlice'
import { useAppPalette } from 'src/components/palette'

/* ── Navigation items ──────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: 'Home', href: '/', icon: IconHome, matchExact: true },
  { label: 'Events', href: '/events', icon: IconCalendarEvent },
  { label: 'Cart', href: '/cart', icon: IconShoppingCart, showBadge: true },
  { label: 'About', href: '/#about', icon: IconInfoCircle, isAnchor: true },
  { label: 'Dashboard', href: '/dashboard', icon: IconLayoutDashboard, authOnly: true }
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

  const items = useMemo(() => {
    return NAV_ITEMS.filter(item => {
      if (item.authOnly && !session?.user) return false
      if (item.guestOnly && session?.user) return false
      return true
    })
  }, [session])

  if (!isMobile) return null

  const isActive = (href, matchExact, isAnchor) => {
    if (isAnchor) return false // anchor links are never "active" as a route
    if (matchExact) return router.pathname === href
    return router.pathname === href || router.pathname.startsWith(href + '/')
  }

  const handleNavClick = (item) => {
    if (item.isAnchor) {
      if (router.pathname === '/') {
        // Already on home — scroll to the section
        const el = document.getElementById('about')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        router.push(item.href)
      }
      return
    }
    router.push(item.href)
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
        zIndex: theme.zIndex.drawer + 3,
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
        /* Height + safe-area for iPhone home indicator */
        height: 'calc(64px + env(safe-area-inset-bottom, 0px))',
        pb: 'env(safe-area-inset-bottom, 0px)',
        px: 0.5
      }}
    >
      {items.map(item => {
        const active = isActive(item.href, item.matchExact, item.isAnchor)
        const IconComp = item.icon

        return (
          <Box
            key={item.href}
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
              /* Active indicator pill at top */
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
            {/* Icon with optional badge */}
            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconComp
                size={22}
                stroke={active ? 2.2 : 1.6}
                color={active ? c.primary : c.isDark ? alpha(c.white, 0.55) : alpha(c.black, 0.45)}
              />
              {/* Cart badge */}
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

            {/* Label */}
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
  )
}

export default MobileBottomNav
