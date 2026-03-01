import { getServerSession } from 'next-auth/next'
import nextAuthConfig from 'src/lib/nextAuthConfig'
import paymentService from 'src/services/payment-service'

/**
 * POST /api/payment/initiate
 *
 * Creates pending bookings and initiates a Juspay payment session.
 * Returns the SDK payload needed by the frontend to open the payment page.
 *
 * SECURITY: Requires authenticated session. userId is derived server-side only.
 *
 * Body: { items: [{eventId, quantity}] }
 * Response: { success, data: { orderId, sdkPayload, amount, bookings } }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    // ── Authentication ──────────────────────────────────────────────────
    const session = await getServerSession(req, res, nextAuthConfig)
    const userId = session?.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in and try again.'
      })
    }

    const { items } = req.body

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'items must be a non-empty array of { eventId, quantity }'
      })
    }

    // Sanitize items
    const sanitized = items
      .map(item => ({
        eventId: parseInt(item.eventId, 10),
        quantity: Math.max(1, parseInt(item.quantity, 10) || 1)
      }))
      .filter(item => !isNaN(item.eventId) && item.eventId > 0)
      .slice(0, 20)

    if (sanitized.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid items provided' })
    }

    // ── Build return URL ────────────────────────────────────────────────
    // After Juspay redirects, we land on our payment callback page
    // SECURITY: Validate host to prevent host-header injection attacks
    const protocol = req.headers['x-forwarded-proto'] || 'http'
    const rawHost = req.headers['x-forwarded-host'] || req.headers.host || ''
    // Strip port, whitespace, and reject anything with special chars
    const host = rawHost.split(',')[0].trim()
    if (!host || /[\s<>'";(){}\\]/.test(host)) {
      return res.status(400).json({ success: false, message: 'Invalid request origin' })
    }
    const returnUrl = `${protocol === 'https' ? 'https' : 'http'}://${host}/api/payment/callback`

    // ── Initiate payment ────────────────────────────────────────────────
    const result = await paymentService.createOrderSession(
      parseInt(userId, 10),
      sanitized,
      returnUrl
    )

    return res.status(200).json({
      success: true,
      data: {
        orderId: result.orderId,
        sdkPayload: result.sdkPayload,
        paymentId: result.paymentId,
        amount: result.amount,
        bookings: result.bookings
      }
    })
  } catch (error) {
    console.error('[POST /api/payment/initiate]', error)

    // Business logic errors
    if (
      error.message &&
      (error.message.includes('not found') ||
        error.message.includes('not available') ||
        error.message.includes('sold out') ||
        error.message.includes('spot(s) left') ||
        error.message.includes('already have a confirmed') ||
        error.message.includes('Payment gateway error'))
    ) {
      return res.status(400).json({ success: false, message: error.message })
    }

    return res.status(500).json({ success: false, message: 'Failed to initiate payment' })
  }
}
