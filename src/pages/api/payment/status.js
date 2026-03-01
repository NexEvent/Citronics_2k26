import { getServerSession } from 'next-auth/next'
import nextAuthConfig from 'src/lib/nextAuthConfig'
import paymentService from 'src/services/payment-service'

/**
 * GET /api/payment/status?orderId=xxx
 *
 * Quick status check endpoint for frontend polling.
 * Returns current DB status without re-querying Juspay.
 * For authoritative verification, use POST /api/payment/verify.
 *
 * Auth: Soft — orderId is an unguessable token.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    // ── Authentication (soft) ───────────────────────────────────────────
    const session = await getServerSession(req, res, nextAuthConfig)
    if (!session?.user?.id) {
      console.warn('[GET /api/payment/status] No session — proceeding with orderId auth')
    }

    const { orderId } = req.query

    if (!orderId || typeof orderId !== 'string') {
      return res.status(400).json({ success: false, message: 'orderId query param is required' })
    }

    const status = await paymentService.getPaymentStatus(orderId)

    if (!status) {
      return res.status(404).json({ success: false, message: 'Payment not found' })
    }

    return res.status(200).json({ success: true, data: status })
  } catch (error) {
    console.error('[GET /api/payment/status]', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch payment status' })
  }
}
