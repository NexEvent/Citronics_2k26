import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import { alpha } from '@mui/material/styles'
import { useAppPalette } from 'src/components/palette'
import Icon from 'src/components/Icon'
import PublicNavbar from 'src/views/home/PublicNavbar'
import PublicFooter from 'src/views/home/PublicFooter'
import axios from 'axios'

/* ── Helpers ──────────────────────────────────────────────────────────────── */

function fmtDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
  })
}

function fmtTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric', minute: '2-digit', hour12: true
  })
}

function fmtCurrency(n) {
  return `₹${parseFloat(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function getStatus(ticket) {
  if (ticket.checkInAt) return { label: 'Used', color: 'default', icon: 'tabler:check' }
  if (ticket.bookingStatus === 'confirmed') return { label: 'Valid', color: 'success', icon: 'tabler:circle-check' }
  if (ticket.bookingStatus === 'pending') return { label: 'Pending', color: 'warning', icon: 'tabler:clock' }
  return { label: 'Cancelled', color: 'error', icon: 'tabler:x' }
}

function isUpcoming(ticket) {
  if (!ticket.startTime) return true
  return new Date(ticket.startTime) > new Date()
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Ticket Card Component
 * ═══════════════════════════════════════════════════════════════════════════ */

function TicketCard({ ticket, onDownload, downloading }) {
  const c = useAppPalette()
  const status = getStatus(ticket)

  return (
    <Box
      sx={{
        borderRadius: '16px',
        border: `1.5px solid ${alpha(c.primary, 0.12)}`,
        overflow: 'hidden',
        bgcolor: c.bgPaper,
        transition: 'box-shadow 0.2s, border-color 0.2s',
        '&:hover': {
          boxShadow: `0 8px 32px ${alpha(c.primary, 0.08)}`,
          borderColor: alpha(c.primary, 0.25)
        }
      }}
    >
      {/* Top accent */}
      <Box sx={{ height: 4, bgcolor: c.primary }} />

      <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
        {/* Header row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1, mr: 2 }}>
            <Typography variant='h6' sx={{ fontWeight: 700, color: c.textPrimary, fontSize: { xs: '1rem', sm: '1.1rem' }, lineHeight: 1.3 }}>
              {ticket.eventTitle}
            </Typography>
            <Typography variant='caption' sx={{ color: c.textDisabled, fontFamily: 'monospace', mt: 0.5, display: 'block' }}>
              Ticket #{ticket.ticketId}
            </Typography>
          </Box>
          <Chip
            icon={<Icon icon={status.icon} fontSize={14} />}
            label={status.label}
            color={status.color}
            size='small'
            sx={{ fontWeight: 700, fontSize: '0.7rem' }}
          />
        </Box>

        {/* Details grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mb: 2.5 }}>
          {ticket.startTime && (
            <InfoItem icon='tabler:calendar' label='Date' value={fmtDate(ticket.startTime)} c={c} />
          )}
          {ticket.startTime && (
            <InfoItem icon='tabler:clock' label='Time'
              value={`${fmtTime(ticket.startTime)}${ticket.endTime ? ' – ' + fmtTime(ticket.endTime) : ''}`}
              c={c}
            />
          )}
          {ticket.venue && (
            <InfoItem icon='tabler:map-pin' label='Venue' value={ticket.venue} c={c} />
          )}
          {ticket.attendeeName && (
            <InfoItem icon='tabler:user' label='Attendee' value={ticket.attendeeName} c={c} />
          )}
          {ticket.priceAtBooking > 0 && (
            <InfoItem icon='tabler:currency-rupee' label='Price' value={fmtCurrency(ticket.priceAtBooking)} c={c} />
          )}
          {ticket.orderId && (
            <InfoItem icon='tabler:receipt' label='Order' value={ticket.orderId} c={c} />
          )}
        </Box>

        {/* QR preview line + actions */}
        <Box sx={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          pt: 2, borderTop: `1px dashed ${alpha(c.divider, 0.4)}`
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon icon='tabler:qrcode' fontSize={16} style={{ color: c.textDisabled }} />
            <Typography variant='caption' sx={{ color: c.textDisabled, fontFamily: 'monospace', fontSize: '0.68rem' }}>
              {ticket.qrCode ? ticket.qrCode.slice(0, 8) + '···' + ticket.qrCode.slice(-4) : '—'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title='Download PDF'>
              <span>
                <IconButton
                  size='small'
                  onClick={() => onDownload(ticket)}
                  disabled={downloading}
                  sx={{
                    color: c.primary,
                    bgcolor: alpha(c.primary, 0.08),
                    '&:hover': { bgcolor: alpha(c.primary, 0.16) }
                  }}
                >
                  {downloading ? <CircularProgress size={16} /> : <Icon icon='tabler:download' fontSize={18} />}
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

function InfoItem({ icon, label, value, c }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
      <Icon icon={icon} fontSize={15} style={{ color: c.primary, marginTop: 2, flexShrink: 0 }} />
      <Box>
        <Typography variant='caption' sx={{ color: c.textDisabled, fontSize: '0.65rem', display: 'block', lineHeight: 1.2 }}>
          {label}
        </Typography>
        <Typography variant='body2' sx={{ color: c.textPrimary, fontWeight: 600, fontSize: '0.82rem', lineHeight: 1.3 }}>
          {value}
        </Typography>
      </Box>
    </Box>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  My Tickets Page View
 * ═══════════════════════════════════════════════════════════════════════════ */

function MyTicketsView() {
  const c = useAppPalette()
  const { data: session, status: sessionStatus } = useSession()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState(0)
  const [downloadingId, setDownloadingId] = useState(null)
  const [downloadingAll, setDownloadingAll] = useState(false)

  const fetchTickets = useCallback(async () => {
    if (!session?.user?.id) return
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get('/api/payment/tickets')
      setTickets(data.data?.tickets || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tickets')
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  useEffect(() => {
    if (session?.user?.id) fetchTickets()
  }, [session?.user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownloadOne = useCallback(async (ticket) => {
    setDownloadingId(ticket.ticketId)
    try {
      const { generateTicketPDF } = await import('src/lib/generateTicketPDF')
      await generateTicketPDF(ticket)
    } catch (err) {
      console.error('PDF generation failed:', err)
    } finally {
      setDownloadingId(null)
    }
  }, [])

  const handleDownloadAll = useCallback(async () => {
    setDownloadingAll(true)
    try {
      const { generateAllTicketsPDF } = await import('src/lib/generateTicketPDF')
      const confirmed = tickets.filter(t => t.bookingStatus === 'confirmed')
      await generateAllTicketsPDF(confirmed.length ? confirmed : tickets)
    } catch (err) {
      console.error('PDF generation failed:', err)
    } finally {
      setDownloadingAll(false)
    }
  }, [tickets])

  // ── Filtering ───────────────────────────────────────────────────────
  const upcomingTickets = tickets.filter(t => t.bookingStatus === 'confirmed' && isUpcoming(t) && !t.checkInAt)
  const pastTickets = tickets.filter(t => !isUpcoming(t) || t.checkInAt)
  const allConfirmed = tickets.filter(t => t.bookingStatus === 'confirmed')

  const filteredTickets = tab === 0 ? upcomingTickets : tab === 1 ? pastTickets : tickets

  // ── Loading / Auth ──────────────────────────────────────────────────
  if (sessionStatus === 'loading' || (session && loading)) {
    return (
      <Container maxWidth='md' sx={{ py: { xs: 8, md: 14 }, textAlign: 'center' }}>
        <CircularProgress size={40} sx={{ color: c.primary }} />
        <Typography variant='body1' sx={{ color: c.textSecondary, mt: 2 }}>Loading your tickets…</Typography>
      </Container>
    )
  }

  if (!session?.user) {
    return (
      <Container maxWidth='sm' sx={{ py: { xs: 8, md: 14 }, textAlign: 'center' }}>
        <Icon icon='tabler:lock' fontSize={48} style={{ color: c.textDisabled, marginBottom: 16 }} />
        <Typography variant='h5' sx={{ fontWeight: 700, color: c.textPrimary, mb: 1 }}>Sign In Required</Typography>
        <Typography variant='body1' sx={{ color: c.textSecondary, mb: 3 }}>
          Please sign in to view your tickets.
        </Typography>
        <Button variant='contained' href='/login' sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', px: 4, py: 1.5, bgcolor: c.primary }}>
          Sign In
        </Button>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth='sm' sx={{ py: { xs: 8, md: 14 }, textAlign: 'center' }}>
        <Icon icon='tabler:alert-circle' fontSize={48} style={{ color: c.error, marginBottom: 16 }} />
        <Typography variant='h5' sx={{ fontWeight: 700, color: c.textPrimary, mb: 1 }}>Something went wrong</Typography>
        <Typography variant='body1' sx={{ color: c.textSecondary, mb: 3 }}>{error}</Typography>
        <Button variant='contained' onClick={fetchTickets} startIcon={<Icon icon='tabler:refresh' />}
          sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', px: 4, py: 1.5, bgcolor: c.primary }}>
          Retry
        </Button>
      </Container>
    )
  }

  if (tickets.length === 0) {
    return (
      <Container maxWidth='sm' sx={{ py: { xs: 8, md: 14 }, textAlign: 'center' }}>
        <Icon icon='tabler:ticket-off' fontSize={64} style={{ color: c.textDisabled, marginBottom: 16 }} />
        <Typography variant='h5' sx={{ fontWeight: 700, color: c.textPrimary, mb: 1 }}>No Tickets Yet</Typography>
        <Typography variant='body1' sx={{ color: c.textSecondary, mb: 4 }}>
          You haven't purchased any tickets. Browse events to get started!
        </Typography>
        <Button variant='contained' href='/events'
          startIcon={<Icon icon='tabler:calendar-event' />}
          sx={{ borderRadius: '10px', fontWeight: 700, textTransform: 'none', px: 4, py: 1.5, bgcolor: c.primary }}>
          Browse Events
        </Button>
      </Container>
    )
  }

  return (
    <Container maxWidth='md' sx={{ py: { xs: 4, md: 8 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant='h4' sx={{ fontWeight: 800, color: c.textPrimary, letterSpacing: '-0.02em' }}>
            My Tickets
          </Typography>
          <Typography variant='body2' sx={{ color: c.textSecondary, mt: 0.5 }}>
            {allConfirmed.length} confirmed ticket{allConfirmed.length !== 1 ? 's' : ''}
          </Typography>
        </Box>

        {allConfirmed.length > 0 && (
          <Button
            variant='outlined'
            onClick={handleDownloadAll}
            disabled={downloadingAll}
            startIcon={downloadingAll ? <CircularProgress size={16} /> : <Icon icon='tabler:download' />}
            sx={{
              borderRadius: '10px', fontWeight: 700, textTransform: 'none', px: 3,
              borderColor: alpha(c.primary, 0.3), color: c.primary,
              '&:hover': { borderColor: c.primary, bgcolor: alpha(c.primary, 0.04) }
            }}
          >
            Download All
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          mb: 3,
          '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minWidth: 'auto', px: 2 },
          '& .Mui-selected': { color: c.primary }
        }}
        TabIndicatorProps={{ sx: { bgcolor: c.primary } }}
      >
        <Tab label={`Upcoming (${upcomingTickets.length})`} />
        <Tab label={`Past (${pastTickets.length})`} />
        <Tab label={`All (${tickets.length})`} />
      </Tabs>

      {/* Ticket list */}
      {filteredTickets.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant='body1' sx={{ color: c.textSecondary }}>
            {tab === 0 ? 'No upcoming tickets' : tab === 1 ? 'No past tickets' : 'No tickets'}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {filteredTickets.map(ticket => (
            <TicketCard
              key={ticket.ticketId}
              ticket={ticket}
              onDownload={handleDownloadOne}
              downloading={downloadingId === ticket.ticketId}
            />
          ))}
        </Box>
      )}
    </Container>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
 *  Page wrapper
 * ═══════════════════════════════════════════════════════════════════════════ */

const MyTicketsPage = () => (
  <Box
    component='main'
    sx={{
      overflowX: 'hidden',
      bgcolor: 'background.default',
      minHeight: '100vh',
      pb: { xs: 'calc(64px + env(safe-area-inset-bottom, 0px))', md: 0 }
    }}
  >
    <PublicNavbar />
    <Box sx={{ pt: { xs: 2, md: 10 }, pb: { xs: 4, md: 6 } }}>
      <MyTicketsView />
    </Box>
    <PublicFooter />
  </Box>
)

MyTicketsPage.authGuard = false
MyTicketsPage.guestGuard = false
MyTicketsPage.getLayout = page => page

export default MyTicketsPage
