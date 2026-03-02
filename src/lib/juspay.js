/**
 * Juspay (HDFC SmartGateway) SDK Initialization — Citronics
 *
 * Singleton instance of the expresscheckout-nodejs SDK.
 * Uses JWE/JWS authentication with RSA keys.
 *
 * Environment variables required:
 *   JUSPAY_MERCHANT_ID          — merchant id from HDFC dashboard
 *   JUSPAY_KEY_UUID             — JWE key UUID (API_KEY from HDFC config)
 *   JUSPAY_PUBLIC_KEY           — bank's RSA public key (PEM string or base64)
 *   JUSPAY_PRIVATE_KEY          — your RSA private key (PEM string or base64)
 *   JUSPAY_PAYMENT_PAGE_CLIENT_ID — payment page client id
 *   JUSPAY_RESPONSE_KEY         — response key for webhook signature verification
 *   JUSPAY_ENV                  — 'sandbox' | 'production' (default: sandbox)
 */

const crypto = require('crypto')
const { Juspay, APIError } = require('expresscheckout-nodejs')

const SANDBOX_BASE_URL = 'https://smartgatewayuat.hdfcbank.com'
const PRODUCTION_BASE_URL = 'https://smartgateway.hdfcbank.com'

/**
 * Resolve PEM key from env var.
 * Supports:
 *  - Direct PEM string (starts with -----BEGIN)
 *  - Base64-encoded PEM
 *  - Newline-escaped string (\\n → \n)
 */
function resolveKey(envValue) {
  if (!envValue) return null
  // Already a PEM
  if (envValue.startsWith('-----BEGIN')) {
    return envValue
  }
  // Replace escaped newlines
  const unescaped = envValue.replace(/\\n/g, '\n')
  if (unescaped.startsWith('-----BEGIN')) {
    return unescaped
  }
  // Try base64 decode
  try {
    const decoded = Buffer.from(envValue, 'base64').toString('utf8')
    if (decoded.startsWith('-----BEGIN')) return decoded
  } catch (_) {}
  // Return as-is (hope for the best)
  return envValue
}

// ── Singleton ─────────────────────────────────────────────────────────────────

let _juspayInstance = null

function getJuspayInstance() {
  if (_juspayInstance) return _juspayInstance

  const merchantId = process.env.JUSPAY_MERCHANT_ID
  const keyUUID = process.env.JUSPAY_KEY_UUID
  const publicKey = resolveKey(process.env.JUSPAY_PUBLIC_KEY)
  const privateKey = resolveKey(process.env.JUSPAY_PRIVATE_KEY)
  const env = process.env.JUSPAY_ENV || 'sandbox'

  if (!merchantId || !keyUUID) {
    throw new Error(
      'Juspay SDK not configured. Set JUSPAY_MERCHANT_ID and JUSPAY_KEY_UUID env vars.'
    )
  }

  const baseUrl = env === 'production' ? PRODUCTION_BASE_URL : SANDBOX_BASE_URL

  // Use JWE/JWS auth when RSA keys are provided, otherwise fall back to Basic Auth (apiKey)
  const config = { merchantId, baseUrl }

  if (publicKey && privateKey) {
    config.jweAuth = { keyId: keyUUID, publicKey, privateKey }
    console.log(`[Juspay] Using JWE/JWS authentication`)
  } else {
    config.apiKey = keyUUID
    console.log(`[Juspay] Using Basic (apiKey) authentication — set JUSPAY_PUBLIC_KEY & JUSPAY_PRIVATE_KEY for JWE/JWS`)
  }

  _juspayInstance = new Juspay(config)

  console.log(`[Juspay] Initialized — env=${env}, merchant=${merchantId}, base=${baseUrl}`)

  return _juspayInstance
}

function getPaymentPageClientId() {
  return process.env.JUSPAY_PAYMENT_PAGE_CLIENT_ID || ''
}

function getJuspayEnv() {
  return process.env.JUSPAY_ENV || 'sandbox'
}

/**
 * Verify a webhook signature from Juspay using HMAC-SHA256.
 *
 * Juspay signs the webhook body with the RESPONSE_KEY.
 * We compute HMAC-SHA256(body, responseKey) and compare against the
 * signature sent in the `x-juspay-signature` (or `x-signature`) header.
 *
 * @param {string} rawBody - raw request body (JSON string)
 * @param {string} signature - signature from request header
 * @returns {boolean}
 */
function verifyWebhookSignature(rawBody, signature) {
  const responseKey = process.env.JUSPAY_RESPONSE_KEY
  if (!responseKey) {
    console.warn('[Juspay] JUSPAY_RESPONSE_KEY not set — cannot verify webhook signature')
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
    console.error('[Juspay] Webhook signature verification error:', err.message)
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
