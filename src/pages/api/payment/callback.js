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
 * We use absolute URLs with APP_URL / NEXTAUTH_URL so the redirect always
 * goes to the canonical site — not the referrer or any proxy origin.
 */

/**
 * Resolve the canonical site origin for redirects.
 * Always prefer the configured APP_URL / NEXTAUTH_URL over request headers.
 */
function getSiteOrigin() {
  const raw = (process.env.APP_URL || process.env.NEXTAUTH_URL || '').trim().replace(/[\/\r\n]+$/, '')
  if (raw && /^https?:\/\//.test(raw)) return raw

  // Fallback — should not happen in production
  return 'https://cdgicitronics.in'
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).json({ success: false, message: 'Method not allowed' })
    return
  }

  const origin = getSiteOrigin()

  try {
    // Juspay sends order_id in query (GET) or body (POST)
    const rawOrderId = req.query?.order_id || req.query?.orderId || req.body?.order_id || req.body?.orderId

    if (!rawOrderId) {
      res.redirect(302, `${origin}/checkout?payment=error&reason=missing_order`)
      return
    }

    // SECURITY: Sanitize orderId to prevent header injection / XSS in redirect
    // Our order IDs follow pattern: CIT-{timestamp}-{alphanumeric}
    const orderId = String(rawOrderId).replace(/[^a-zA-Z0-9\-_]/g, '')
    if (!orderId || orderId.length > 80) {
      res.redirect(302, `${origin}/checkout?payment=error&reason=invalid_order`)
      return
    }

    // Verify payment with Juspay (server-side — the source of truth)
    const result = await paymentService.verifyAndProcessPayment(orderId)

    switch (result.status) {
      case 'success':
        res.redirect(302, `${origin}/checkout/payment-status?orderId=${orderId}&status=success`)
        return

      case 'pending':
        res.redirect(302, `${origin}/checkout/payment-status?orderId=${orderId}&status=pending`)
        return

      case 'failed':
        res.redirect(302, `${origin}/checkout/payment-status?orderId=${orderId}&status=failed`)
        return

      default:
        res.redirect(302, `${origin}/checkout/payment-status?orderId=${orderId}&status=unknown`)
        return
    }
  } catch (error) {
    console.error('[GET /api/payment/callback]', error)
    res.redirect(302, `${origin}/checkout?payment=error&reason=verification_failed`)
  }
}
