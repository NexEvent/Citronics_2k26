import nodemailer from 'nodemailer'

/**
 * Mailer — Citronics 2026
 *
 * Gmail SMTP transport configured with App Password.
 * Singleton transporter ensures connection pooling.
 *
 * Env vars:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 */

let _transporter = null

function getTransporter() {
  if (_transporter) return _transporter

  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!user || !pass) {
    throw new Error('[Mailer] SMTP_USER and SMTP_PASS must be configured in environment variables')
  }

  const isProd = process.env.NODE_ENV === 'production'

  _transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for 587 (STARTTLS)
    auth: { user, pass },
    pool: true,           // reuse connections
    maxConnections: 2,    // keep it low — not sending bulk
    maxMessages: 5,       // per connection before reconnect
    rateDelta: 2000,      // minimum 2s between messages (rate limiting)
    rateLimit: 1,         // max 1 message per rateDelta
    connectionTimeout: 30_000,   // 30s to establish TCP connection
    greetingTimeout: 30_000,     // 30s to receive SMTP greeting
    socketTimeout: 120_000,      // 2min idle socket timeout
    authTimeout: 30_000,         // 30s for AUTH exchange
    tls: {
      rejectUnauthorized: isProd // enforce valid cert in production only
    }
  })

  console.log(`[Mailer] Configured SMTP transport: ${host}:${port} as ${user}`)

  return _transporter
}

/**
 * Send a single email.
 *
 * @param {Object} options
 * @param {string} options.to       - Recipient email
 * @param {string} options.subject  - Email subject
 * @param {string} options.html     - HTML body
 * @param {string} [options.text]   - Plain text fallback
 * @param {Array}  [options.attachments] - Nodemailer attachment objects
 * @returns {Promise<{messageId: string}>}
 */
export async function sendMail({ to, subject, html, text, attachments }) {
  const transporter = getTransporter()
  const from = process.env.SMTP_FROM || `"Citronics 2026" <${process.env.SMTP_USER}>`

  const info = await transporter.sendMail({
    from,
    to,
    subject,
    html,
    text: text || subject,
    attachments: attachments || []
  })

  console.log(`[Mailer] Sent to ${to} — messageId: ${info.messageId}`)

  return { messageId: info.messageId }
}

/**
 * Verify SMTP connection is alive. Call once at startup if desired.
 */
export async function verifyMailer() {
  try {
    const transporter = getTransporter()
    await transporter.verify()
    console.log('[Mailer] SMTP connection verified ✓')

    return true
  } catch (err) {
    console.error('[Mailer] SMTP verification failed:', err.message)

    return false
  }
}

export default { sendMail, verifyMailer }
