import { getServerSession } from 'next-auth/next'
import nextAuthConfig from 'src/lib/nextAuthConfig'
import paymentService from 'src/services/payment-service'
import rateLimit from 'src/lib/rateLimit'

const limiter = rateLimit({ windowMs: 60_000, max: 10 })

/**
 * POST /api/payment/verify
 *
 * Server-side verification of payment status from Juspay.
 * This is the CRITICAL endpoint — it queries Juspay directly, never trusts frontend.
 * On success, it confirms bookings and generates tickets.
 *
 * Auth: Soft — orderId itself is an unguessable token. Session checked but not required.
 *
 * Body: { orderId }
 * Response: { success, data: { status, message, payment, tickets? } }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    // ── Rate limiting ────────────────────────────────────────────────
    const { ok } = limiter.check(req)
    if (!ok) {
      return res.status(429).json({ success: false, message: 'Too many requests. Please wait a moment.' })
    }

    // ── Authentication ─────────────────────────────────────────────────
    const session = await getServerSession(req, res, nextAuthConfig)
    if (!session?.user?.id) {
      return res.status(401).json({ success: false, message: 'Authentication required' })
    }

    const { orderId } = req.body

    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ success: false, message: 'orderId is required' })
    }

    // SECURITY: Validate orderId format (CIT-{timestamp}-{hex})
    const sanitizedOrderId = orderId.replace(/[^a-zA-Z0-9\-_]/g, '')
    if (sanitizedOrderId !== orderId || orderId.length > 80) {
      return res.status(400).json({ success: false, message: 'Invalid orderId format' })
    }

    // SECURITY: Verify the payment belongs to the authenticated user
    const owner = await paymentService.getPaymentOwner(sanitizedOrderId)
    if (!owner) {
      return res.status(404).json({ success: false, message: 'Payment not found' })
    }
    if (String(owner.userId) !== String(session.user.id)) {
      console.warn(`[POST /api/payment/verify] User ${session.user.id} tried to verify order owned by ${owner.userId}`)
      return res.status(403).json({ success: false, message: 'You do not have access to this payment' })
    }

    // Verify payment directly with Juspay and process accordingly
    const result = await paymentService.verifyAndProcessPayment(sanitizedOrderId)

    return res.status(200).json({
      success: true,
      data: result
    })
  } catch (error) {
    console.error('[POST /api/payment/verify]', error)

    if (error.message?.includes('Payment record not found')) {
      return res.status(404).json({ success: false, message: error.message })
    }

    if (error.message?.includes('Payment verification failed')) {
      return res.status(502).json({ success: false, message: error.message })
    }

    return res.status(500).json({ success: false, message: 'Payment verification failed' })
  }
}
