import { enqueueEmail } from 'src/services/email-queue'
import { generateTicketPDFBuffer, generateAllTicketsPDFBuffer } from 'src/lib/generateTicketPDF-server'

/**
 * Email Service — Citronics 2026
 *
 * Composes and enqueues ticket confirmation emails.
 * Each email includes:
 *   - Professional HTML template with event details
 *   - PDF ticket(s) as attachment
 *
 * This service ENQUEUES emails — it does NOT block the caller.
 * The email queue processes them one-by-one with proper throttling.
 */

/**
 * Format a date for email display
 */
function fmtDate(iso) {
  if (!iso) return 'TBA'

  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

function fmtTime(iso) {
  if (!iso) return ''

  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric', minute: '2-digit', hour12: true
  })
}

function fmtCurrency(amount) {
  return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

/**
 * Enqueue ticket confirmation email(s) for a user after successful payment.
 *
 * For each unique attendee email in the tickets array, one email is sent
 * with ALL their tickets attached as a combined PDF.
 *
 * @param {Array<Object>} tickets - Ticket objects (same shape as payment-service output)
 * @param {string} orderId - Order reference
 */
export async function enqueueTicketEmails(tickets, orderId) {
  if (!tickets || tickets.length === 0) {
    console.warn('[EmailService] No tickets to email')

    return
  }

  // Group tickets by attendee email
  const byEmail = new Map()
  for (const ticket of tickets) {
    const email = ticket.attendeeEmail || ticket.attendee_email
    if (!email) {
      console.warn(`[EmailService] Ticket #${ticket.ticketId} has no attendee email — skipping`)
      continue
    }
    if (!byEmail.has(email)) {
      byEmail.set(email, {
        name: ticket.attendeeName || ticket.attendee_name || 'Attendee',
        tickets: []
      })
    }
    byEmail.get(email).tickets.push(ticket)
  }

  // For each attendee, generate PDF and enqueue email
  for (const [email, { name, tickets: userTickets }] of byEmail) {
    try {
      // Generate PDF attachment
      let pdfBuffer
      let pdfFilename

      if (userTickets.length === 1) {
        pdfBuffer = await generateTicketPDFBuffer(userTickets[0])
        const safeTitle = (userTickets[0].eventTitle || 'Event').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)
        pdfFilename = `Citronics-Ticket-${userTickets[0].ticketId}-${safeTitle}.pdf`
      } else {
        pdfBuffer = await generateAllTicketsPDFBuffer(userTickets)
        pdfFilename = `Citronics-Tickets-${orderId || Date.now()}.pdf`
      }

      if (!pdfBuffer) {
        console.error(`[EmailService] PDF generation returned null for ${email}`)
        continue
      }

      // Build email HTML
      const html = _buildTicketEmailHTML(name, userTickets, orderId)
      const subject = userTickets.length === 1
        ? `Your Citronics 2026 Ticket — ${userTickets[0].eventTitle}`
        : `Your Citronics 2026 Tickets (${userTickets.length} events)`

      // Enqueue — this returns immediately
      enqueueEmail({
        to: email,
        subject,
        html,
        text: _buildTicketEmailText(name, userTickets, orderId),
        attachments: [
          {
            filename: pdfFilename,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ],
        tag: `tickets-${orderId || 'unknown'}-${email}`
      })
    } catch (err) {
      console.error(`[EmailService] Failed to prepare ticket email for ${email}:`, err)
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  HTML Email Template
// ─────────────────────────────────────────────────────────────────────────────

function _buildTicketEmailHTML(name, tickets, orderId) {
  const firstName = name.split(' ')[0]

  const ticketRows = tickets.map(t => {
    const date = fmtDate(t.startTime)
    const time = t.startTime ? fmtTime(t.startTime) : 'TBA'
    const price = t.priceAtBooking > 0 ? fmtCurrency(t.priceAtBooking) : 'Free'

    return `
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #f0f0f0;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>
                <p style="margin: 0 0 4px; font-size: 16px; font-weight: 700; color: #1A1A2E;">
                  ${_escapeHtml(t.eventTitle || 'Event')}
                </p>
                <p style="margin: 0 0 2px; font-size: 13px; color: #6B7280;">
                  📅 ${date} ${time ? `&nbsp;•&nbsp; 🕐 ${time}` : ''}
                </p>
                <p style="margin: 0; font-size: 13px; color: #6B7280;">
                  📍 ${_escapeHtml(t.venue || 'TBA')}
                </p>
              </td>
              <td style="text-align: right; vertical-align: top; white-space: nowrap;">
                <span style="display: inline-block; padding: 4px 12px; background: #7367F0; color: #fff; border-radius: 12px; font-size: 12px; font-weight: 600;">
                  #${t.ticketId}
                </span>
                <br />
                <span style="font-size: 13px; color: #6B7280; margin-top: 4px; display: inline-block;">
                  ${price}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
  }).join('')

  const totalAmount = tickets.reduce((sum, t) => sum + (parseFloat(t.priceAtBooking) || 0), 0)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Citronics 2026 Tickets</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f3ff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f3ff; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%;">

          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #7367F0 0%, #655BD3 100%); padding: 32px 28px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="margin: 0 0 8px; color: #FFFFFF; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
                🎉 CITRONICS 2026
              </h1>
              <p style="margin: 0; color: rgba(255,255,255,0.85); font-size: 15px;">
                Your ticket${tickets.length > 1 ? 's are' : ' is'} confirmed!
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color: #ffffff; padding: 28px 24px;">

              <!-- Greeting -->
              <p style="margin: 0 0 16px; font-size: 16px; color: #1A1A2E;">
                Hi <strong>${_escapeHtml(firstName)}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; color: #4B5563; line-height: 1.6;">
                Thank you for your purchase! Your Citronics 2026 ticket${tickets.length > 1 ? 's have' : ' has'} been confirmed.
                ${tickets.length > 1
                  ? `You have <strong>${tickets.length} ticket(s)</strong> for the following events:`
                  : 'Here are your event details:'
                }
              </p>

              <!-- Tickets Table -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
                ${ticketRows}
              </table>

              ${totalAmount > 0 ? `
              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="text-align: right; padding: 8px 20px;">
                    <span style="font-size: 14px; color: #6B7280;">Total Paid:&nbsp;</span>
                    <span style="font-size: 18px; font-weight: 700; color: #7367F0;">${fmtCurrency(totalAmount)}</span>
                  </td>
                </tr>
              </table>` : ''}

              ${orderId ? `
              <!-- Order Reference -->
              <p style="margin: 0 0 24px; font-size: 13px; color: #9CA3AF; text-align: center;">
                Order Reference: <strong>${_escapeHtml(orderId)}</strong>
              </p>` : ''}

              <!-- PDF Note -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f7f6ff; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 16px 20px;">
                    <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: #1A1A2E;">
                      📎 Your ticket${tickets.length > 1 ? 's are' : ' is'} attached
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #6B7280; line-height: 1.5;">
                      The PDF attached to this email contains your e-ticket${tickets.length > 1 ? 's' : ''} with a QR code.
                      Present the QR code at the event entrance for verification.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Important Notes -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-left: 3px solid #7367F0; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px;">
                    <p style="margin: 0 0 6px; font-size: 13px; font-weight: 600; color: #1A1A2E;">
                      Important:
                    </p>
                    <ul style="margin: 0; padding-left: 16px; font-size: 13px; color: #6B7280; line-height: 1.8;">
                      <li>Tickets are non-transferable</li>
                      <li>Keep your QR code safe — it's your entry pass</li>
                      <li>You can also access your tickets from your dashboard at citronics.in</li>
                    </ul>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #1A1A2E; padding: 24px 28px; border-radius: 0 0 12px 12px; text-align: center;">
              <p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #FFFFFF;">
                Citronics 2026
              </p>
              <p style="margin: 0 0 4px; font-size: 12px; color: #9CA3AF;">
                Chameli Devi Group of Institutions, Indore
              </p>
              <p style="margin: 0; font-size: 11px; color: #6B7280;">
                This is an automated email. For support, contact citronicssupport@cdgi.edu.in
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─────────────────────────────────────────────────────────────────────────────
//  Plain Text Fallback
// ─────────────────────────────────────────────────────────────────────────────

function _buildTicketEmailText(name, tickets, orderId) {
  const lines = [
    `Hi ${name.split(' ')[0]},`,
    '',
    `Thank you for your purchase! Your Citronics 2026 ticket${tickets.length > 1 ? 's have' : ' has'} been confirmed.`,
    ''
  ]

  for (const t of tickets) {
    lines.push(`--- Ticket #${t.ticketId} ---`)
    lines.push(`Event: ${t.eventTitle || 'Event'}`)
    lines.push(`Date: ${fmtDate(t.startTime)}`)
    if (t.startTime) lines.push(`Time: ${fmtTime(t.startTime)}`)
    lines.push(`Venue: ${t.venue || 'TBA'}`)
    if (t.priceAtBooking > 0) lines.push(`Paid: ${fmtCurrency(t.priceAtBooking)}`)
    lines.push('')
  }

  if (orderId) lines.push(`Order Reference: ${orderId}`)
  lines.push('')
  lines.push('Your PDF ticket(s) are attached to this email.')
  lines.push('Present the QR code at the event entrance for verification.')
  lines.push('')
  lines.push('---')
  lines.push('Citronics 2026 | Chameli Devi Group of Institutions, Indore')
  lines.push('For support: citronicssupport@cdgi.edu.in')

  return lines.join('\n')
}

// ─────────────────────────────────────────────────────────────────────────────
//  Utilities
// ─────────────────────────────────────────────────────────────────────────────

function _escapeHtml(str) {
  if (!str) return ''

  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default { enqueueTicketEmails }
