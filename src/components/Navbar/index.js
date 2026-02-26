import { useState, useRef, useEffect } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Avatar from '@mui/material/Avatar'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Collapse from '@mui/material/Collapse'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Classic } from '@theme-toggles/react'
import '@theme-toggles/react/css/Classic.css'
import { IconMenu2, IconX, IconBell } from '@tabler/icons-react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import Icon from 'src/components/Icon'
import { useSettings } from 'src/hooks/useSettings'
import themeConfig from 'src/configs/themeConfig'
import { useAppPalette, glass } from 'src/components/palette'

/* ── Animated nav link with vertical slide on hover ─────────────────────── */
const AnimatedNavLink = ({ href, children, active, onClick }) => {
  const c = useAppPalette()
  return (
  <Box
    component='a'
    href={href}
    onClick={onClick}
    sx={{
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'flex-start',
      height: '28px',
      overflow: 'hidden',
      textDecoration: 'none',
      '&:hover .nav-link-inner': { transform: 'translateY(-28px)' }
    }}
  >
    <Box
      className='nav-link-inner'
      sx={{
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.35s cubic-bezier(0.4,0,0.2,1)',
        transform: 'translateY(0px)'
      }}
    >
      {/* Default state */}
      <Typography
        component='span'
        sx={{
          display: 'block',
          height: '28px',
          lineHeight: '28px',
          fontSize: '0.95rem',
          fontWeight: active ? 600 : 400,
          color: c.white,
          whiteSpace: 'nowrap'
        }}
      >
        {children}
      </Typography>
      {/* Hover state */}
      <Typography
        component='span'
        sx={{
          display: 'block',
          height: '28px',
          lineHeight: '28px',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: c.white,
          whiteSpace: 'nowrap'
        }}
      >
        {children}
      </Typography>
    </Box>
  </Box>
  )
}

/* ── Four-dot logo mark ──────────────────────────────────────────────────── */
const LogoDots = () => (
  <Box component={Link} href='/' aria-label='Home' sx={{ position: 'relative', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textDecoration: 'none' }}>
    {[
      { top: 0, left: '50%', transform: 'translateX(-50%)' },
      { bottom: 0, left: '50%', transform: 'translateX(-50%)' },
      { left: 0, top: '50%', transform: 'translateY(-50%)' },
      { right: 0, top: '50%', transform: 'translateY(-50%)' }
    ].map((pos, i) => (
      <Box key={i} sx={{ position: 'absolute', width: 7, height: 7, borderRadius: '50%', bgcolor: glass.dot, ...pos }} />
    ))}
  </Box>
)

/**
 * Global Navbar — centered pill-style glass bar (21st.dev-inspired)
 *
 * @param {Object}   props
 * @param {Array}    props.navLinks      — optional array of { label, href }
 * @param {string}   props.activeSection — currently active anchor id
 * @param {Function} props.onNavClick    — optional handler for anchor clicks
 */
const Navbar = ({ navLinks, activeSection, onNavClick }) => {
  const c = useAppPalette()
  const router = useRouter()
  const isMobile = useMediaQuery(c.theme.breakpoints.down('md'))
  const { settings, saveSettings } = useSettings()
  const { data: session } = useSession()

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [profileAnchor, setProfileAnchor] = useState(null)
  const shapeTimerRef = useRef(null)
  const [isRounded, setIsRounded] = useState(true)

  const isDark = settings.mode === 'dark'

  /* Delay pill → rounded-xl until mobile menu closes */
  useEffect(() => {
    if (shapeTimerRef.current) clearTimeout(shapeTimerRef.current)
    if (mobileMenuOpen) {
      setIsRounded(false)
    } else {
      shapeTimerRef.current = setTimeout(() => setIsRounded(true), 300)
    }
    return () => clearTimeout(shapeTimerRef.current)
  }, [mobileMenuOpen])

  const handleThemeToggle = () => saveSettings({ ...settings, mode: isDark ? 'light' : 'dark' })
  const handleProfileOpen = e => setProfileAnchor(e.currentTarget)
  const handleProfileClose = () => setProfileAnchor(null)
  const handleLogout = () => { setProfileAnchor(null); signOut({ callbackUrl: '/login' }) }

  const handleAnchorClick = (e, href) => {
    // If it's a page route (not an anchor), use Next.js router for reliable SPA navigation
    if (!href.startsWith('#')) {
      e.preventDefault()
      setDrawerOpen(false)
      setMobileMenuOpen(false)
      router.push(href)
      return
    }
    if (onNavClick) {
      onNavClick(e, href)
    } else {
      e.preventDefault()
      const el = document.getElementById(href.replace('#', ''))
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setDrawerOpen(false)
    setMobileMenuOpen(false)
  }

  /* ── Glass pill colours ──────────────────────────────────────────────── */
  const glassBg = glass.bg
  const glassBorder = `1px solid ${c.whiteA20}`
  const backdropBlur = glass.backdrop

  return (
    <>
      {/* ── Floating Navbar ──────────────────────────────────────────────── */}
      {settings.appBar !== 'hidden' && (
        <Box
          component='nav'
          aria-label='Main navigation'
          sx={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: c.theme.zIndex.drawer + 2,
            width: { xs: 'calc(100% - 32px)', md: 'auto' },
            minWidth: { md: 640 },
            maxWidth: { xs: '100%', md: 1080 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            px: { xs: 4, md: 5.5 },
            py: { xs: 1.5, md: 1.75 },
            borderRadius: isRounded ? '9999px' : '16px',
            bgcolor: glassBg,
            backdropFilter: backdropBlur,
            WebkitBackdropFilter: backdropBlur,
            border: glassBorder,
            boxShadow: `0 8px 32px ${glass.shadow}, 0 0 0 0.5px ${c.whiteA6} inset`,
            transition: 'border-radius 0.15s ease, box-shadow 0.3s ease'
          }}
        >
          {/* ── Main row ─────────────────────────────────────────────────── */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 3, md: 5 } }}>

            {/* Logo dots */}
            <LogoDots />

            {/* Desktop nav links */}
            {!isMobile && navLinks?.length > 0 && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { md: 4.5 }, flexGrow: 1 }}>
                {navLinks.map(link => (
                  <AnimatedNavLink
                    key={link.href}
                    href={link.href}
                    active={activeSection === link.href?.replace('#', '')}
                    onClick={e => handleAnchorClick(e, link.href)}
                  >
                    {link.label}
                  </AnimatedNavLink>
                ))}
              </Box>
            )}

            {/* Spacer */}
            <Box sx={{ flexGrow: 1 }} />

            {/* ── Right controls ─────────────────────────────────────────── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>

              {/* Theme toggle */}
              <Tooltip title={isDark ? 'Switch to light' : 'Switch to dark'}>
                <Box
                  sx={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    '& .navbar-theme-toggle': {
                      fontSize: '1.5rem',
                      color: glass.textBright,
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: '8px', borderRadius: '50%',
                      transition: 'color 0.2s, background-color 0.2s',
                      display: 'flex', alignItems: 'center',
                      '&:hover': { color: c.white, backgroundColor: c.whiteA10 }
                    }
                  }}
                >
                  <Classic toggled={isDark} onToggle={handleThemeToggle} duration={500} className='navbar-theme-toggle' />
                </Box>
              </Tooltip>

              {/* Notifications */}
              <Tooltip title='Notifications'>
                <IconButton
                  size='medium'
                  aria-label='Notifications'
                  sx={{
                    color: glass.textNav,
                    transition: 'color 0.2s, background-color 0.2s',
                    '&:hover': { color: c.white, bgcolor: c.whiteA10 }
                  }}
                >
                  <IconBell size={24} />
                </IconButton>
              </Tooltip>

              {/* Divider */}
              <Box sx={{ width: 1, height: 24, bgcolor: c.whiteA15, mx: 0.75 }} />

              {/* ── Auth area ──────────────────────────────────────────────── */}
              {session?.user ? (
                <>
                  <Tooltip title='Account'>
                    <IconButton onClick={handleProfileOpen} size='medium' sx={{ p: 0 }}>
                      <Avatar
                        sx={{
                          width: 44, height: 44,
                          bgcolor: c.primaryA85,
                          fontSize: 14, fontWeight: 700, cursor: 'pointer',
                          border: `1px solid ${c.whiteA20}`,
                          transition: 'box-shadow 0.25s',
                          '&:hover': { boxShadow: `0 0 0 3px ${c.primaryA35}, 0 0 18px ${c.primaryA50}` }
                        }}
                      >
                        {(session.user.name || session.user.email || 'U')[0].toUpperCase()}
                      </Avatar>
                    </IconButton>
                  </Tooltip>

                  <Menu
                    anchorEl={profileAnchor}
                    open={Boolean(profileAnchor)}
                    onClose={handleProfileClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    slotProps={{
                      paper: {
                        elevation: 6,
                        sx: {
                          mt: 1.5, minWidth: 200, borderRadius: 2,
                          bgcolor: glass.bgSolid,
                          backdropFilter: 'blur(20px)',
                          border: `1px solid ${c.whiteA10}`,
                          overflow: 'visible',
                          '&::before': {
                            content: '""', display: 'block', position: 'absolute',
                            top: 0, right: 14, width: 10, height: 10,
                            bgcolor: glass.bgSolid,
                            transform: 'translateY(-50%) rotate(45deg)',
                            borderLeft: `1px solid ${c.whiteA10}`,
                            borderTop: `1px solid ${c.whiteA10}`,
                            zIndex: 0
                          }
                        }
                      }
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant='subtitle2' fontWeight={600} noWrap sx={{ color: c.white }}>
                        {session.user.name || session.user.email}
                      </Typography>
                      <Typography variant='caption' sx={{ color: glass.textSubtle }} noWrap>
                        {session.user.role || 'Organizer'}
                      </Typography>
                    </Box>
                    <Divider sx={{ borderColor: c.whiteA10, my: 0.5 }} />
                    <MenuItem
                      onClick={handleLogout}
                      sx={{
                      gap: 1.5, py: 1, color: 'error.main',
                      '&:hover': { bgcolor: c.errorA10 }
                      }}
                    >
                      <Icon icon='tabler:logout' fontSize={18} />
                      Sign Out
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  {!isMobile && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      {/* Login — ghost button */}
                      <Button
                        component={Link}
                        href='/login'
                        size='medium'
                        sx={{
                          px: 3, py: 1,
                          borderRadius: '9999px',
                          textTransform: 'none',
                          fontWeight: 500,
                          fontSize: '0.95rem',
                          color: glass.textDefault,
                          border: `1px solid ${c.white}`,
                          bgcolor: 'transparent',
                          transition: 'all 0.2s',
                          '&:hover': {
                            color: c.white,
                            borderColor: c.whiteA40,
                            bgcolor: c.whiteA6
                          }
                        }}
                      >
                        Login
                      </Button>

                      {/* Signup — white gradient with glow */}
                      <Box sx={{ position: 'relative', '&:hover .signup-glow': { opacity: 0.7, filter: 'blur(14px)' } }}>
                        <Box
                          className='signup-glow'
                          sx={{
                            position: 'absolute', inset: -6,
                            borderRadius: '9999px',
                            bgcolor: glass.badgeBg,
                            filter: 'blur(10px)',
                            opacity: 0.4,
                            pointerEvents: 'none',
                            transition: 'opacity 0.3s, filter 0.3s'
                          }}
                        />
                        <Button
                          component={Link}
                          href='/register'
                          size='medium'
                          sx={{
                            position: 'relative', zIndex: 1,
                            px: 4.5, py: 1,
                            borderRadius: '9999px',
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            color: glass.btnText,
                            background: glass.btnGradient,
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s',
                            '&:hover': { background: glass.btnGradientHover }
                          }}
                        >
                          Sign Up
                        </Button>
                      </Box>
                    </Box>
                  )}
                </>
              )}

              {/* Mobile hamburger */}
              {isMobile && (
                <IconButton
                  size='small'
                  onClick={() => setMobileMenuOpen(v => !v)}
                  sx={{
                    color: glass.textMuted,
                    '&:hover': { color: c.white, bgcolor: c.whiteA10 }
                  }}
                  aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                >
                  {mobileMenuOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
                </IconButton>
              )}
            </Box>
          </Box>

          {/* ── Mobile inline menu ───────────────────────────────────────── */}
          {isMobile && (
            <Collapse in={mobileMenuOpen} timeout={300}>
              <Box sx={{ pt: 2, pb: 0.5 }}>
                <Divider sx={{ borderColor: c.whiteA10, mb: 1.5 }} />

                {/* Nav links */}
                {navLinks?.length > 0 && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mb: 1.5 }}>
                    {navLinks.map(link => (
                      <Box
                        key={link.href}
                        component='a'
                        href={link.href}
                        onClick={e => handleAnchorClick(e, link.href)}
                        sx={{
                          px: 1.5, py: 1,
                          borderRadius: '10px',
                          textDecoration: 'none',
                          fontSize: '0.875rem',
                          fontWeight: activeSection === link.href?.replace('#', '') ? 600 : 400,
                          color: activeSection === link.href?.replace('#', '') ? c.white : glass.textMuted,
                          bgcolor: activeSection === link.href?.replace('#', '') ? c.whiteA8 : 'transparent',
                          transition: 'all 0.2s',
                          '&:hover': { color: c.white, bgcolor: c.whiteA8 }
                        }}
                      >
                        {link.label}
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Auth buttons on mobile */}
                {!session?.user && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 0.5 }}>
                    <Button
                      fullWidth
                      component={Link}
                      href='/login'
                      sx={{
                        borderRadius: '9999px', textTransform: 'none', fontWeight: 500,
                        fontSize: '0.875rem', color: glass.textMutedAlt,
                        border: `1px solid ${c.whiteA15}`,
                        bgcolor: glass.bgMobileLogin,
                        '&:hover': { color: c.white, borderColor: c.whiteA40, bgcolor: c.whiteA6 }
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      fullWidth
                      component={Link}
                      href='/register'
                      sx={{
                        borderRadius: '9999px', textTransform: 'none', fontWeight: 700,
                        fontSize: '0.875rem', color: glass.btnText,
                        background: glass.btnGradient,
                        whiteSpace: 'nowrap',
                        boxShadow: `0 0 18px ${glass.btnGlow}`,
                        '&:hover': { background: glass.btnGradientHover, boxShadow: `0 0 26px ${glass.btnGlowHover}` }
                      }}
                    >
                      Sign Up
                    </Button>
                  </Box>
                )}
              </Box>
            </Collapse>
          )}
        </Box>
      )}

      {/* ── Side Drawer kept for legacy navLinks usage (desktop) ─────────── */}
      {!isMobile && navLinks?.length > 0 && (
        <Drawer
          anchor='right'
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{
            sx: {
              width: 260, pt: 2,
              bgcolor: glass.bgMobile,
              backdropFilter: 'blur(20px)',
              borderLeft: `1px solid ${c.whiteA10}`
            }
          }}
        >
          <Box sx={{ px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant='subtitle2' fontWeight={700} sx={{ color: c.white }}>
              {themeConfig.templateName?.toUpperCase() || 'CITRONICS'}
            </Typography>
            <IconButton size='small' onClick={() => setDrawerOpen(false)} aria-label='Close drawer' sx={{ color: glass.textDimmer }}>
              <IconX size={18} />
            </IconButton>
          </Box>
          <Divider sx={{ borderColor: c.whiteA10, mb: 1 }} />
          <List>
            {navLinks.map(link => (
              <ListItemButton
                key={link.href}
                component='a'
                href={link.href}
                onClick={e => handleAnchorClick(e, link.href)}
                sx={{
                  borderRadius: '10px', mx: 1, mb: 0.5,
                  color: activeSection === link.href?.replace('#', '') ? c.white : glass.textDimmer,
                  bgcolor: activeSection === link.href?.replace('#', '') ? c.whiteA10 : 'transparent',
                  '&:hover': { bgcolor: c.whiteA8, color: c.white }
                }}
              >
                <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 500, fontSize: '0.875rem' }} />
              </ListItemButton>
            ))}
          </List>
        </Drawer>
      )}
    </>
  )
}

export default Navbar
