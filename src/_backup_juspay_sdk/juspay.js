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
 *   JUSPAY_BASE_URL             — (optional) override the gateway base URL entirely
 */

const crypto = require('crypto')
const { Juspay, APIError } = require('expresscheckout-nodejs')

// ── HDFC SmartGateway base URLs ───────────────────────────────────────────────
// HDFC migrated SmartGateway from hdfcbank.com → hdfcuat.bank.in / hdfcbank.in
// Old (now Cloudflare-blocked):  https://smartgatewayuat.hdfcbank.com
// New UAT domain:                https://smartgateway.hdfcuat.bank.in
const SANDBOX_BASE_URL = 'https://smartgateway.hdfcuat.bank.in'
const PRODUCTION_BASE_URL = 'https://smartgateway.hdfcbank.com'

// ── Serverless-safe logger ────────────────────────────────────────────────────
// The Juspay SDK's default logger creates a Winston file transport to `logs/`
// which crashes on read-only filesystems (Vercel, AWS Lambda, etc.).
// Setting Juspay.customLogger bypasses the file transport entirely.
Juspay.customLogger = {
  info(msg)  { console.log('[Juspay]', typeof msg === 'string' ? msg : JSON.stringify(msg)) },
  error(msg) { console.error('[Juspay]', typeof msg === 'string' ? msg : JSON.stringify(msg)) }
}

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

  // Allow full override via JUSPAY_BASE_URL env var (useful if HDFC changes domains again)
  const finalBaseUrl = (process.env.JUSPAY_BASE_URL || baseUrl).trim()

  // Use JWE/JWS auth when RSA keys are provided, otherwise fall back to Basic Auth (apiKey)
  const config = { merchantId, baseUrl: finalBaseUrl }

  if (publicKey && privateKey) {
    config.jweAuth = { keyId: keyUUID, publicKey, privateKey }
    console.log(`[Juspay] Using JWE/JWS authentication`)
  } else {
    config.apiKey = keyUUID
    console.log(`[Juspay] Using Basic (apiKey) authentication — set JUSPAY_PUBLIC_KEY & JUSPAY_PRIVATE_KEY for JWE/JWS`)
  }

  _juspayInstance = new Juspay(config)

  console.log(`[Juspay] Initialized — env=${env}, merchant=${merchantId}, base=${finalBaseUrl}`)
  console.log(`[Juspay] Auth mode: ${publicKey && privateKey ? 'JWE/JWS' : 'Basic (apiKey)'}`)

  // Warn about common misconfigurations
  if (env === 'sandbox' && process.env.NODE_ENV === 'production') {
    console.warn(`[Juspay] ⚠️  WARNING: JUSPAY_ENV=sandbox but NODE_ENV=production — are you sure?`)
  }
  if (env === 'production' && !publicKey) {
    console.warn(`[Juspay] ⚠️  WARNING: JUSPAY_ENV=production but JUSPAY_PUBLIC_KEY is not set — JWE/JWS auth disabled`)
  }
  if (env === 'production' && !privateKey) {
    console.warn(`[Juspay] ⚠️  WARNING: JUSPAY_ENV=production but JUSPAY_PRIVATE_KEY is not set — JWE/JWS auth disabled`)
  }

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
