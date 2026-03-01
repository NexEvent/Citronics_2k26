import paymentService from 'src/services/payment-service'

/**
 * GET /api/payment/callback
 *
 * Juspay redirects the user here after payment (success or failure).
 * We verify the payment server-side and redirect to the appropriate frontend page.
 *
 * Query params from Juspay: order_id, status (these come from the redirect)
 *
 * SECURITY: We NEVER trust the query params. We always verify with Juspay API.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST'])
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    // Juspay sends order_id in query (GET) or body (POST)
    const rawOrderId = req.query?.order_id || req.query?.orderId || req.body?.order_id || req.body?.orderId

    if (!rawOrderId) {
      return res.redirect(302, '/checkout?payment=error&reason=missing_order')
    }

    // SECURITY: Sanitize orderId to prevent header injection / XSS in redirect
    // Our order IDs follow pattern: CIT-{timestamp}-{alphanumeric}
    const orderId = String(rawOrderId).replace(/[^a-zA-Z0-9\-_]/g, '')
    if (!orderId || orderId.length > 50) {
      return res.redirect(302, '/checkout?payment=error&reason=invalid_order')
    }

    // Verify payment with Juspay (server-side — the source of truth)
    const result = await paymentService.verifyAndProcessPayment(orderId)

    switch (result.status) {
      case 'success':
        // Payment confirmed — redirect to success page with order ID
        return res.redirect(302, `/checkout/payment-status?orderId=${orderId}&status=success`)

      case 'pending':
        // Still processing — redirect to pending page
        return res.redirect(302, `/checkout/payment-status?orderId=${orderId}&status=pending`)

      case 'failed':
        // Payment failed — redirect with failure
        return res.redirect(302, `/checkout/payment-status?orderId=${orderId}&status=failed`)

      default:
        return res.redirect(302, `/checkout/payment-status?orderId=${orderId}&status=unknown`)
    }
  } catch (error) {
    console.error('[GET /api/payment/callback]', error)
    return res.redirect(302, '/checkout?payment=error&reason=verification_failed')
  }
}
