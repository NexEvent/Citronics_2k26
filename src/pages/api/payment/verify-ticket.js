import { getServerSession } from 'next-auth/next'
import nextAuthConfig from 'src/lib/nextAuthConfig'
import paymentService from 'src/services/payment-service'

/**
 * POST /api/payment/verify-ticket
 *
 * Verify a ticket by QR code UUID. Returns ticket + event details.
 * Optionally checks in the ticket if `checkIn: true` is passed.
 *
 * Body: { qrCode: string, checkIn?: boolean }
 *
 * Accessible to:
 *   - Any authenticated user (verify only — to see their own ticket)
 *   - Staff/admin (verify + check-in)
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, nextAuthConfig)
    if (!session?.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    // Safe body parsing
    let body = req.body
    if (typeof body === 'string') {
      try { body = JSON.parse(body) } catch {
        return res.status(400).json({ success: false, message: 'Invalid request body' })
      }
    }
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ success: false, message: 'Request body required' })
    }

    const { qrCode, checkIn } = body

    if (!qrCode || typeof qrCode !== 'string') {
      return res.status(400).json({ success: false, message: 'qrCode is required' })
    }
    if ('checkIn' in body && typeof checkIn !== 'boolean') {
      return res.status(400).json({ success: false, message: 'checkIn must be a boolean' })
    }

    // Sanitize — QR codes are UUIDs
    const sanitized = qrCode.trim().toLowerCase()
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    if (!uuidRegex.test(sanitized)) {
      return res.status(400).json({ success: false, message: 'Invalid QR code format' })
    }

    // Verify the ticket
    const ticket = await paymentService.verifyTicket(sanitized)

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found or invalid' })
    }

    // Ownership: non-staff can only look up their own tickets
    const STAFF_ROLES = ['admin', 'organizer', 'owner', 'head']
    const userRole = (session.user.role || '').toLowerCase()
    const isStaff = STAFF_ROLES.includes(userRole)
    if (!isStaff && ticket.userId !== session.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorised to view this ticket' })
    }

    // Check-in (staff only)
    if (checkIn === true) {
      if (!isStaff) {
        return res.status(403).json({ success: false, message: 'Only staff can check in tickets' })
      }

      if (ticket.checkedIn) {
        return res.status(409).json({
          success: false,
          message: 'Ticket already checked in',
          data: { ticket }
        })
      }

      if (ticket.bookingStatus !== 'confirmed') {
        return res.status(400).json({
          success: false,
          message: `Booking status is "${ticket.bookingStatus}" — cannot check in`
        })
      }

      const result = await paymentService.checkInTicket(sanitized, session.user.id)
      ticket.checkedIn = true
      ticket.checkInAt = new Date().toISOString()

      return res.status(200).json({
        success: true,
        message: 'Ticket checked in successfully',
        data: { ticket }
      })
    }

    return res.status(200).json({
      success: true,
      data: {
        ticket,
        valid: ticket.bookingStatus === 'confirmed' && !ticket.checkedIn
      }
    })
  } catch (error) {
    console.error('[POST /api/payment/verify-ticket]', error)

    if (error.message?.includes('already checked in')) {
      return res.status(409).json({ success: false, message: error.message })
    }
    if (error.message?.includes('not found') || error.message?.includes('not confirmed')) {
      return res.status(400).json({ success: false, message: error.message })
    }

    return res.status(500).json({ success: false, message: 'Failed to verify ticket' })
  }
}
