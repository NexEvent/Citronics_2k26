import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'

/* ═══════════════════════════════════════════════════════════════════════════
 *  Ticket PDF Generator — Citronics 2026
 *
 *  Generates a professional event ticket as a downloadable PDF.
 *  Each ticket includes:
 *    - Event name, date, time, venue
 *    - Attendee name & email
 *    - QR code for verification
 *    - Ticket ID & order reference
 *    - Branding
 *
 *  Uses jsPDF for PDF generation and qrcode for QR image.
 * ═══════════════════════════════════════════════════════════════════════════ */

// Brand colors
const BRAND = {
  primary: '#7367F0',
  primaryDark: '#655BD3',
  dark: '#1A1A2E',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  white: '#FFFFFF',
  success: '#28C76F'
}

/**
 * Format ISO date to readable string
 */
function fmtDate(iso) {
  if (!iso) return 'TBA'
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function fmtTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

function fmtCurrency(amount) {
  // jsPDF standard fonts don't support the Unicode rupee sign (₹), use Rs. instead
  return `Rs. ${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

/**
 * Draw a rounded rectangle (used for ticket card, info boxes, etc.)
 */
function roundedRect(doc, x, y, w, h, r, style = 'F') {
  doc.roundedRect(x, y, w, h, r, r, style)
}

/**
 * Generate a QR code as a data URL (PNG base64).
 */
async function generateQRDataUrl(text, size = 200) {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    color: { dark: '#1A1A2E', light: '#FFFFFF' },
    errorCorrectionLevel: 'H'
  })
}

/**
 * Draw a diagonal watermark grid across the entire ticket.
 * jsPDF has no native opacity for text, so we use a very light tinted color.
 */
function drawWatermark(doc, W, H) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor('#DDD9F7') // near-white purple

  const text = 'CITRONICS 2026'
  // 6 evenly-spaced diagonal stamps at 30°
  const stamps = [
    [W * 0.12, H * 0.52],
    [W * 0.48, H * 0.30],
    [W * 0.78, H * 0.52],
    [W * 0.28, H * 0.82],
    [W * 0.62, H * 0.78],
    [W * 0.35, H * 0.10]
  ]
  stamps.forEach(([x, y]) => {
    doc.text(text, x, y, { angle: 28 })
  })
}

/**
 * Build the verification URL for a ticket QR code.
 */
function getVerifyUrl(qrCode) {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/tickets/verify?code=${qrCode}`
  }
  return `https://citronics.in/tickets/verify?code=${qrCode}`
}

/* ─────────────────────────────────────────────────────────────────────────
 *  Main: Generate PDF for a single ticket
 * ───────────────────────────────────────────────────────────────────────── */

/**
 * Generate a ticket PDF and trigger download (or return the doc for batch).
 *
 * @param {Object} ticket - Ticket data from API
 * @param {Object} [options]
 * @param {boolean} [options.download=true] - Auto-trigger download
 * @param {boolean} [options.returnDoc=false] - Return jsPDF doc instead
 * @returns {Promise<jsPDF|void>}
 */
export async function generateTicketPDF(ticket, options = {}) {
  const { download = true, returnDoc = false } = options

  // A5 landscape for a ticket-like format (210 x 148 mm)
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' })

  // Delegate all drawing to the shared helper (same pipeline as batch)
  await _drawTicketOnPage(doc, ticket)

  if (returnDoc) return doc

  if (download) {
    const filename = `Citronics-Ticket-${ticket.ticketId}-${(ticket.eventTitle || 'Event').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 30)}.pdf`
    doc.save(filename)
  }

  return doc
}

/**
 * Generate a combined PDF with multiple tickets (one per page).
 */
export async function generateAllTicketsPDF(tickets) {
  if (!tickets || tickets.length === 0) return

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' })

  for (let i = 0; i < tickets.length; i++) {
    if (i > 0) doc.addPage('a5', 'landscape')

    // Generate each ticket on its own page by building it inline
    const ticket = tickets[i]
    await _drawTicketOnPage(doc, ticket)
  }

  const filename = `Citronics-All-Tickets-${Date.now()}.pdf`
  doc.save(filename)
}

/**
 * Internal: Draw a single ticket on the current page of an existing doc.
 */
async function _drawTicketOnPage(doc, ticket) {
  const W = 210
  const H = 148
  const mg = 9          // left/right margin inside panels
  const perfX = 152     // divider between left content and right QR panel
  const footerH = 10
  const topBar = 5

  /* ── Base background ───────────────────────────────────── */
  doc.setFillColor(BRAND.white)
  doc.rect(0, 0, W, H, 'F')

  /* ── Top accent band ───────────────────────────────────── */
  doc.setFillColor(BRAND.primary)
  doc.rect(0, 0, W, topBar, 'F')

  /* ── Left panel tint ───────────────────────────────────── */
  doc.setFillColor('#F7F6FF')
  doc.rect(0, topBar, perfX, H - topBar - footerH, 'F')

  /* ── Right panel stays white ───────────────────────────── */
  doc.setFillColor(BRAND.white)
  doc.rect(perfX, topBar, W - perfX, H - topBar - footerH, 'F')

  /* ── Watermark (left panel only) ────────────────────────── */
  drawWatermark(doc, perfX, H)

  /* ─────────────────────────────────────────────────────────
   *  LEFT PANEL
   * ───────────────────────────────────────────────────────── */

  // Tiny brand tag
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6)
  doc.setTextColor(BRAND.primary)
  doc.text('CITRONICS 2026  |  E-TICKET', mg, 12)

  // Event title (max 2 lines)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(BRAND.dark)
  const maxTitleW = perfX - mg * 2
  const rawTitleLines = doc.splitTextToSize(ticket.eventTitle || 'Event', maxTitleW)
  const titleLines = rawTitleLines.slice(0, 2)
  doc.text(titleLines, mg, 20)
  const titleEndY = 20 + titleLines.length * 6.5

  // Accent bar under title
  doc.setFillColor(BRAND.primary)
  doc.rect(mg, titleEndY + 2, 28, 1, 'F')

  /* ── Info rows ─────────────────────────────────────────── */
  // Each row: label (5.5pt gray) + value (8.5pt dark)
  // Returns the Y at the bottom of the value text
  function infoCell(label, value, x, y, maxW) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5.5)
    doc.setTextColor(BRAND.gray)
    doc.text(label.toUpperCase(), x, y)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(BRAND.dark)
    const wrapped = doc.splitTextToSize(String(value || 'N/A'), maxW)
    doc.text(wrapped.slice(0, 2), x, y + 4.5)
    return y + 4.5 + wrapped.slice(0, 2).length * 5
  }

  function hRule(y) {
    doc.setDrawColor('#DDD8F5')
    doc.setLineWidth(0.25)
    doc.line(mg, y, perfX - mg, y)
  }

  const col1X = mg
  const col2X = mg + 70
  const colW = 64
  let rowY = titleEndY + 8
  const rowGap = 14  // vertical space allocated per row

  // Row 1 — Date | Time (side by side)
  const timeStr = ticket.startTime
    ? `${fmtTime(ticket.startTime)}${ticket.endTime ? ' - ' + fmtTime(ticket.endTime) : ''}`
    : 'TBA'
  infoCell('Date', fmtDate(ticket.startTime), col1X, rowY, colW)
  infoCell('Time', timeStr, col2X, rowY, colW)
  rowY += rowGap
  hRule(rowY)
  rowY += 4

  // Row 2 — Venue (full width)
  infoCell('Venue', ticket.venue || 'To be announced', col1X, rowY, maxTitleW)
  rowY += rowGap
  hRule(rowY)
  rowY += 4

  // Row 3 — Attendee | Email (side by side)
  const email = ticket.attendeeEmail || ticket.attendee_email
  infoCell('Attendee', ticket.attendeeName || ticket.attendee_name || 'N/A', col1X, rowY, colW)
  if (email) {
    infoCell('Email', email, col2X, rowY, colW)
  }
  rowY += rowGap

  // Row 4 — Amount Paid (only if paid)
  if (ticket.priceAtBooking > 0) {
    hRule(rowY)
    rowY += 4
    infoCell('Amount Paid', fmtCurrency(ticket.priceAtBooking), col1X, rowY, colW)
  }

  /* ─────────────────────────────────────────────────────────
   *  PERFORATION
   * ───────────────────────────────────────────────────────── */
  doc.setDrawColor('#BFB4F5')
  doc.setLineWidth(0.3)
  for (let py = topBar + 4; py < H - footerH - 4; py += 3.5) {
    doc.line(perfX, py, perfX, py + 1.8)
  }

  /* ─────────────────────────────────────────────────────────
   *  RIGHT PANEL
   * ───────────────────────────────────────────────────────── */
  const rightCX = perfX + (W - perfX) / 2  // horizontal center of right panel

  // QR code with a subtle border
  const verifyUrl = getVerifyUrl(ticket.qrCode)
  const qrDataUrl = await generateQRDataUrl(verifyUrl, 300)
  const qrSize = 38
  const qrX = rightCX - qrSize / 2
  const qrY = 12

  doc.setFillColor(BRAND.white)
  doc.setDrawColor('#DDD8F5')
  doc.setLineWidth(0.5)
  roundedRect(doc, qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 2, 'FD')
  doc.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)

  // SCAN TO VERIFY label
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.5)
  doc.setTextColor(BRAND.gray)
  doc.text('SCAN TO VERIFY', rightCX, qrY + qrSize + 6, { align: 'center' })

  // Ticket ID
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(BRAND.primary)
  doc.text(`#${ticket.ticketId}`, rightCX, qrY + qrSize + 12, { align: 'center' })

  // Order ID (tiny, optional)
  const orderLabelY = qrY + qrSize + 17
  if (ticket.orderId) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(4.5)
    doc.setTextColor(BRAND.gray)
    doc.text(`Order: ${ticket.orderId}`, rightCX, orderLabelY, { align: 'center' })
  }

  // Status badge
  const isCheckedIn = !!ticket.checkInAt
  const statusText = isCheckedIn ? 'USED' : ticket.bookingStatus === 'confirmed' ? 'VALID' : 'PENDING'
  const statusColor = isCheckedIn ? BRAND.gray : ticket.bookingStatus === 'confirmed' ? BRAND.success : '#F59E0B'
  const badgeY = ticket.orderId ? orderLabelY + 5 : qrY + qrSize + 20
  const badgeW = 26
  doc.setFillColor(statusColor)
  roundedRect(doc, rightCX - badgeW / 2, badgeY, badgeW, 7.5, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(BRAND.white)
  doc.text(statusText, rightCX, badgeY + 5, { align: 'center' })

  /* ─────────────────────────────────────────────────────────
   *  FOOTER
   * ───────────────────────────────────────────────────────── */
  doc.setFillColor(BRAND.dark)
  doc.rect(0, H - footerH, W, footerH, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(BRAND.white)
  doc.text('CITRONICS 2026', mg, H - 5.5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.5)
  doc.setTextColor('#9CA3AF')
  doc.text('Non-transferable. Present QR code at entry.', mg, H - 1.5)

  if (ticket.issuedAt) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(5)
    doc.setTextColor('#9CA3AF')
    doc.text(`Issued: ${fmtDate(ticket.issuedAt)}`, W - mg, H - 5.5, { align: 'right' })
  }
}

export default generateTicketPDF
