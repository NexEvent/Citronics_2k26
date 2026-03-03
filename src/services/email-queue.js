/**
 * Email Queue — Citronics 2026
 *
 * Simple in-memory FIFO queue that processes emails one-at-a-time
 * with a configurable delay between sends.
 *
 * Why a queue?
 *   - Gmail has rate limits (~500/day for workspace, ~100/day for free)
 *   - Sending sequentially avoids being flagged as spam
 *   - Retries on transient failures without blocking the payment flow
 *   - Keeps the API response fast (fire-and-forget enqueue)
 *
 * Trade-off: In-memory queue is lost on server restart.
 *   For Citronics' scale (small daily volume) this is acceptable.
 *   Failed emails are logged + retried up to 3 times.
 */

import { sendMail } from 'src/lib/mailer'

// ── Queue State ─────────────────────────────────────────────────────────────

const _queue = []          // Array of { job, retries, addedAt }
let _processing = false    // Only one worker at a time
const MAX_RETRIES = 3
const RETRY_DELAY_MS = 10_000    // 10s between retries
const SEND_DELAY_MS = 3_000      // 3s between consecutive sends
const MAX_QUEUE_SIZE = 200       // hard cap — reject when queue is full
const MAX_FAILED_JOBS = 50       // max failed-job entries kept in memory
const _failedJobs = []           // Keep last N failed jobs for diagnostics

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Mask a recipient email for safe logging — keeps domain, redacts local part.
 * e.g. "user@example.com" → "***@example.com"
 */
function maskEmail(email) {
  if (!email || typeof email !== 'string') return '[unknown]'
  const at = email.indexOf('@')

  return at === -1 ? '[redacted]' : `***@${email.slice(at + 1)}`
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Enqueue an email job. Returns immediately — processing is async.
 *
 * @param {Object} job
 * @param {string} job.to          - Recipient email
 * @param {string} job.subject     - Email subject
 * @param {string} job.html        - HTML body
 * @param {string} [job.text]      - Plain text fallback
 * @param {Array}  [job.attachments] - Nodemailer attachments
 * @param {string} [job.tag]       - Human-readable tag for logging (e.g. "ticket-42")
 */
export function enqueueEmail(job) {
  if (!job?.to || !job?.subject) {
    console.error('[EmailQueue] Rejected job — missing "to" or "subject":', job?.tag || 'unknown')

    return
  }

  if (_queue.length >= MAX_QUEUE_SIZE) {
    console.error(`[EmailQueue] Queue full (${MAX_QUEUE_SIZE}) — dropping job: ${job.tag || job.subject} → ${maskEmail(job.to)}`)

    return
  }

  _queue.push({
    job,
    retries: 0,
    addedAt: new Date().toISOString()
  })

  console.log(`[EmailQueue] Enqueued: ${job.tag || job.subject} → ${maskEmail(job.to)}  (queue size: ${_queue.length})`)

  // Kick off processing if not already running
  _startProcessing()
}

/**
 * Get queue diagnostics (for admin/debug endpoints).
 */
export function getQueueStats() {
  return {
    pending: _queue.length,
    processing: _processing,
    recentFailures: _failedJobs.slice(-10)
  }
}

// ── Internal Worker ─────────────────────────────────────────────────────────

function _startProcessing() {
  if (_processing) return  // already a worker running
  _processing = true
  _processNext()
}

async function _processNext() {
  if (_queue.length === 0) {
    _processing = false

    return
  }

  const entry = _queue.shift()
  const { job, retries } = entry

  try {
    console.log(`[EmailQueue] Sending: ${job.tag || job.subject} → ${maskEmail(job.to)}  (attempt ${retries + 1}/${MAX_RETRIES + 1})`)
    await sendMail(job)
    console.log(`[EmailQueue] Sent OK: ${job.tag || job.subject} → ${maskEmail(job.to)}`)
  } catch (err) {
    console.error(`[EmailQueue] Failed: ${job.tag || job.subject} → ${maskEmail(job.to)} — ${err.message}`)

    if (retries < MAX_RETRIES) {
      // Re-enqueue at the back with incremented retry count
      _queue.push({
        ...entry,
        retries: retries + 1
      })
      console.log(`[EmailQueue] Re-queued for retry ${retries + 1}/${MAX_RETRIES}: ${job.tag || job.subject}`)

      // Wait longer before retrying
      await _sleep(RETRY_DELAY_MS)
    } else {
      // Max retries exhausted — log to failed list
      _failedJobs.push({
        to: maskEmail(job.to), // store masked — no PII in diagnostics
        subject: job.subject,
        tag: job.tag,
        error: err.message,
        failedAt: new Date().toISOString(),
        attempts: retries + 1
      })
      if (_failedJobs.length > MAX_FAILED_JOBS) _failedJobs.shift()

      console.error(`[EmailQueue] PERMANENTLY FAILED after ${MAX_RETRIES + 1} attempts: ${job.tag || job.subject} → ${maskEmail(job.to)}`)
    }
  }

  // Throttle: wait before processing the next email
  await _sleep(SEND_DELAY_MS)
  _processNext()
}

function _sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export default { enqueueEmail, getQueueStats }
