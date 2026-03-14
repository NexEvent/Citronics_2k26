#!/usr/bin/env node

/**
 * generate-file-hashes.js
 *
 * Generates SHA-256 hash values for all payment-related coding files.
 * Required by HDFC Bank for file integrity verification.
 *
 * Usage:
 *   node scripts/generate-file-hashes.js
 *   npm run hash:payment
 *
 * Categories:
 *   Request  — files serving the main website (https://www.cdgicitronics.in)
 *   Response — files handling the payment callback
 *              (https://www.cdgicitronics.in/api/payment/callback)
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const ROOT = path.resolve(__dirname, '..')

// ── File lists ───────────────────────────────────────────────────────────────

/** Files powering the Request Web URL: https://www.cdgicitronics.in */
const REQUEST_FILES = [
  'next.config.js',
  'src/pages/index.js',
  'src/pages/cart/index.js',
  'src/pages/checkout/index.js',
  'src/pages/checkout/payment-status.js',
  'src/pages/api/checkout/index.js',
  'src/pages/api/checkout/verify.js',
  'src/pages/api/payment/initiate.js',
  'src/pages/api/payment/status.js',
  'src/pages/api/payment/verify.js',
  'src/pages/api/payment/verify-ticket.js',
  'src/pages/api/payment/tickets.js',
  'src/services/payment-service.js',
  'src/services/checkout-service.js',
  'src/lib/juspay.js'
]

/** Files powering the Response Web URL: https://www.cdgicitronics.in/api/payment/callback */
const RESPONSE_FILES = [
  'src/pages/api/payment/callback.js',
  'src/pages/api/payment/webhook.js',
  'src/services/payment-service.js',
  'src/lib/juspay.js'
]

// ── Helpers ──────────────────────────────────────────────────────────────────

function sha256(filePath) {
  const content = fs.readFileSync(filePath)
  return crypto.createHash('sha256').update(content).digest('hex')
}

function printSection(title, url, files) {
  console.log('='.repeat(80))
  console.log(`  ${title}`)
  console.log(`  URL: ${url}`)
  console.log('='.repeat(80))
  console.log()
  console.log(
    'Filename'.padEnd(50) + 'SHA-256 Hash'
  )
  console.log('-'.repeat(50) + '  ' + '-'.repeat(64))

  for (const relPath of files) {
    const absPath = path.join(ROOT, relPath)
    if (!fs.existsSync(absPath)) {
      console.log(`${relPath.padEnd(50)}  FILE NOT FOUND`)
      continue
    }
    const hash = sha256(absPath)
    console.log(`${relPath.padEnd(50)}  ${hash}`)
  }

  console.log()
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log()
console.log('HDFC Bank — File Integrity Verification (SHA-256)')
console.log(`Generated: ${new Date().toISOString()}`)
console.log()

printSection(
  'REQUEST FILES',
  'https://www.cdgicitronics.in',
  REQUEST_FILES
)

printSection(
  'RESPONSE FILES',
  'https://www.cdgicitronics.in/api/payment/callback',
  RESPONSE_FILES
)
