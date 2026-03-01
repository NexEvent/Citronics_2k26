import paymentService from 'src/services/payment-service'

const { verifyWebhookSignature } = require('src/lib/juspay')

/**
 * POST /api/payment/webhook
 *
 * Juspay webhook endpoint for async payment notifications.
 * Juspay may call this when payment status changes (backup for redirect flow).
 *
 * This ensures payments are processed even if the user closes the browser
 * before the redirect callback fires.
 *
 * SECURITY:
 *   - Verifies HMAC-SHA256 signature using JUSPAY_RESPONSE_KEY
 *   - Returns 200 quickly — Juspay retries on failure
 *   - Never trusts payload amounts — always re-verifies with Juspay API
 */

// Disable Next.js body parsing — we need the raw body for signature verification
export const config = {
  api: {
    bodyParser: false
  }
}

/**
 * Read raw body from request stream for signature verification.
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<string>}
 */
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    // Read raw body for signature verification
    const rawBody = await getRawBody(req)
    const payload = JSON.parse(rawBody)

    // ── Signature verification ──────────────────────────────────────────
    const signature = req.headers['x-juspay-signature'] ||
                      req.headers['x-signature'] ||
                      req.headers['x-webhook-signature']

    if (process.env.JUSPAY_RESPONSE_KEY) {
      // If a RESPONSE_KEY is configured, enforce signature verification
      if (!signature) {
        console.warn('[Webhook] Missing signature header — rejecting')
        return res.status(401).json({ success: false, message: 'Missing webhook signature' })
      }

      if (!verifyWebhookSignature(rawBody, signature)) {
        console.warn('[Webhook] Invalid signature — rejecting')
        return res.status(401).json({ success: false, message: 'Invalid webhook signature' })
      }
    } else {
      console.warn('[Webhook] JUSPAY_RESPONSE_KEY not set — skipping signature verification (insecure)')
    }

    // Extract order_id from webhook payload
    const rawOrderId = payload?.content?.order?.order_id ||
                    payload?.order_id ||
                    payload?.orderId

    if (!rawOrderId) {
      console.warn('[Webhook] Received webhook without order_id:', JSON.stringify(payload).slice(0, 500))
      return res.status(200).json({ success: true, message: 'No order_id found, ignoring' })
    }

    // Sanitize order ID
    const orderId = String(rawOrderId).replace(/[^a-zA-Z0-9\-_]/g, '')
    if (!orderId || orderId.length > 50) {
      console.warn('[Webhook] Invalid order_id format:', rawOrderId)
      return res.status(200).json({ success: true, message: 'Invalid order_id, ignoring' })
    }

    console.log(`[Webhook] Received for order: ${orderId}`)

    // Verify and process payment (idempotent — safe to call multiple times)
    const result = await paymentService.verifyAndProcessPayment(orderId)

    console.log(`[Webhook] Processed order ${orderId}: ${result.status}`)

    // Always return 200 to prevent retries
    return res.status(200).json({ success: true, status: result.status })
  } catch (error) {
    console.error('[POST /api/payment/webhook]', error)

    // Still return 200 to prevent infinite retries from Juspay
    // The payment will be verified on next callback or manual check
    return res.status(200).json({ success: true, message: 'Webhook received, processing deferred' })
  }
}
