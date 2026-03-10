/**
 * HDFC SmartGateway — Direct HTTPS Integration (No SDK)
 *
 * Replaces the expresscheckout-nodejs SDK with direct HTTPS calls,
 * matching the PaymentHandler approach from previous year.
 * SDK backup is in src/_backup_juspay_sdk/
 *
 * Environment variables required:
 *   JUSPAY_MERCHANT_ID             — merchant id (e.g. SG2129)
 *   JUSPAY_KEY_UUID                — API key for Basic Auth
 *   JUSPAY_PAYMENT_PAGE_CLIENT_ID  — payment page client id
 *   JUSPAY_RESPONSE_KEY            — response key for webhook HMAC verification
 *   JUSPAY_ENV                     — 'sandbox' | 'production' (default: sandbox)
 *   JUSPAY_RESELLER_ID             — reseller id header (e.g. hdfc_reseller)
 *   JUSPAY_API_VERSION             — API version header (default: 2024-06-24)
 *   JUSPAY_BASE_URL                — (optional) override the gateway base URL
 */

const crypto = require('crypto')
const https = require('https')

// ── HDFC SmartGateway base URLs ───────────────────────────────────────────────
const SANDBOX_BASE_URL = 'https://smartgateway.hdfcuat.bank.in'
const PRODUCTION_BASE_URL = 'https://smartgateway.hdfc.bank.in'

// ── APIError (matches the interface payment-service.js expects) ───────────────
class APIError extends Error {
  constructor(httpResponseCode, status, errorCode, errorMessage) {
    super(errorMessage || errorCode || 'Something went wrong')
    this.httpResponseCode = httpResponseCode
    this.status = status
    this.errorCode = errorCode
    this.errorMessage = errorMessage
  }
}

// ── Resolve base URL from env ─────────────────────────────────────────────────
function resolveBaseUrl() {
  const env = process.env.JUSPAY_ENV || 'sandbox'
  const base = env === 'production' ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL
  return (process.env.JUSPAY_BASE_URL || base).trim()
}

// ── Direct HTTPS call (mirrors PaymentHandler.makeServiceCall) ────────────────
function makeServiceCall({ apiTag, path, method, body }) {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.JUSPAY_KEY_UUID
    const merchantId = process.env.JUSPAY_MERCHANT_ID

    if (!apiKey) return reject(new Error('JUSPAY_KEY_UUID is not configured'))

    const isPost = method === 'POST' || method === 'PUT'

    // Old PaymentHandler defaults to form-urlencoded, but orderSession
    // overrides to application/json — HDFC /session requires JSON.
    const headers = {
      'Content-Type': isPost ? 'application/json' : 'application/x-www-form-urlencoded',
      'User-Agent': 'NODEJS_KIT/1.0.0',
      'version': process.env.JUSPAY_API_VERSION || '2024-06-24',
      'x-merchantid': merchantId,
      'Authorization': 'Basic ' + Buffer.from(apiKey).toString('base64'),
    }

    // Reseller ID header — required by HDFC SmartGateway
    const resellerId = process.env.JUSPAY_RESELLER_ID
    if (resellerId) {
      headers['x-resellerid'] = resellerId
    }

    let payload = ''
    if (body && typeof body === 'object') {
      if (isPost) {
        // POST /session expects JSON body
        payload = JSON.stringify(body)
      } else {
        payload = Object.keys(body)
          .filter(k => body[k] !== undefined && body[k] !== null)
          .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(String(body[k])))
          .join('&')
      }
    }

    const fullUrl = new URL(path, resolveBaseUrl())

    if (isPost) {
      headers['Content-Length'] = String(Buffer.byteLength(payload))
    }

    console.log(`[Payment] ${apiTag} ${method} ${fullUrl.pathname}`)

    const req = https.request(
      {
        hostname: fullUrl.hostname,
        port: fullUrl.port || 443,
        path: fullUrl.pathname + fullUrl.search,
        method,
        headers,
      },
      (res) => {
        res.setEncoding('utf-8')
        let responseBody = ''
        res.on('data', chunk => { responseBody += chunk })
        res.once('end', () => {
          console.log(`[Payment] ${apiTag} response ${res.statusCode}`)
          let parsed
          try {
            parsed = JSON.parse(responseBody)
          } catch {
            return reject(
              new APIError(res.statusCode, 'INVALID_RESPONSE', 'INVALID_RESPONSE',
                responseBody || 'Failed to parse response JSON')
            )
          }
          if (res.statusCode >= 200 && res.statusCode < 300) {
            return resolve(parsed)
          }
          return reject(
            new APIError(res.statusCode, parsed.status, parsed.error_code, parsed.error_message)
          )
        })
      }
    )

    req.setTimeout(30000, () => {
      req.destroy(new APIError(-1, 'REQUEST_TIMEOUT', 'REQUEST_TIMEOUT', 'Request timed out'))
    })

    req.on('error', (err) => {
      if (err instanceof APIError) return reject(err)
      return reject(new APIError(-1, 'CONNECTION_ERROR', 'CONNECTION_ERROR', err.message))
    })

    if (isPost) {
      req.write(payload)
    }
    req.end()
  })
}

// ── Singleton instance (same interface as old Juspay SDK) ─────────────────────
let _instance = null

function getJuspayInstance() {
  if (_instance) return _instance

  const merchantId = process.env.JUSPAY_MERCHANT_ID
  const apiKey = process.env.JUSPAY_KEY_UUID
  const env = process.env.JUSPAY_ENV || 'sandbox'

  if (!merchantId || !apiKey) {
    throw new Error(
      'Payment gateway not configured. Set JUSPAY_MERCHANT_ID and JUSPAY_KEY_UUID env vars.'
    )
  }

  console.log(`[Payment] Direct HTTPS — env=${env}, merchant=${merchantId}, base=${resolveBaseUrl()}`)

  _instance = {
    order: {
      /**
       * Create an order session — POST /session
       * Same payload shape as the Juspay SDK's juspay.order.create()
       */
      async create(payload) {
        return makeServiceCall({
          apiTag: 'ORDER_SESSION',
          path: '/session',
          method: 'POST',
          body: payload,
        })
      },

      /**
       * Get order status — GET /orders/{orderId}
       * Same return shape as the Juspay SDK's juspay.order.status()
       */
      async status(orderId) {
        return makeServiceCall({
          apiTag: 'ORDER_STATUS',
          path: `/orders/${encodeURIComponent(orderId)}`,
          method: 'GET',
        })
      },
    },
  }

  return _instance
}

function getPaymentPageClientId() {
  return process.env.JUSPAY_PAYMENT_PAGE_CLIENT_ID || ''
}

function getJuspayEnv() {
  return process.env.JUSPAY_ENV || 'sandbox'
}

/**
 * Verify a webhook signature using HMAC-SHA256.
 *
 * @param {string} rawBody - raw request body (JSON string)
 * @param {string} signature - signature from request header
 * @returns {boolean}
 */
function verifyWebhookSignature(rawBody, signature) {
  const responseKey = process.env.JUSPAY_RESPONSE_KEY
  if (!responseKey) {
    console.warn('[Payment] JUSPAY_RESPONSE_KEY not set — cannot verify webhook signature')
    return false
  }
  if (!rawBody || !signature) return false

  try {
    const computed = crypto
      .createHmac('sha256', responseKey)
      .update(rawBody, 'utf8')
      .digest('hex')

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(computed, 'hex'),
      Buffer.from(signature, 'hex')
    )
  } catch (err) {
    console.error('[Payment] Webhook signature verification error:', err.message)
    return false
  }
}

module.exports = {
  getJuspayInstance,
  getPaymentPageClientId,
  getJuspayEnv,
  verifyWebhookSignature,
  APIError,
  SANDBOX_BASE_URL,
  PRODUCTION_BASE_URL
}
