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
  return `₹${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
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
  const W = 210
  const H = 148

  // ── Background ──────────────────────────────────────────────────────
  doc.setFillColor(BRAND.white)
  doc.rect(0, 0, W, H, 'F')

  // Top accent band
  doc.setFillColor(BRAND.primary)
  doc.rect(0, 0, W, 6, 'F')

  // Watermark (drawn before content so it sits behind text)
  drawWatermark(doc, W, H)

  // ── Left section (event info) ───────────────────────────────────────
  const leftW = 145
  const margin = 14

  // Event title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(BRAND.dark)
  const titleLines = doc.splitTextToSize(ticket.eventTitle || 'Event', leftW - margin * 2)
  doc.text(titleLines, margin, 22)

  const titleBottomY = 22 + titleLines.length * 7

  // Subtle divider
  doc.setDrawColor(BRAND.primary)
  doc.setLineWidth(0.5)
  doc.line(margin, titleBottomY + 2, margin + 40, titleBottomY + 2)

  // ── Info rows ───────────────────────────────────────────────────────
  let infoY = titleBottomY + 10
  const infoGap = 9

  // Helper: draw an info row with label and value
  function drawInfoRow(label, value, y) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(BRAND.gray)
    doc.text(label.toUpperCase(), margin, y)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(BRAND.dark)
    doc.text(String(value || 'N/A'), margin, y + 5)
  }

  // Date
  drawInfoRow('Date', fmtDate(ticket.startTime), infoY)

  // Time
  drawInfoRow('Time',
    ticket.startTime
      ? `${fmtTime(ticket.startTime)}${ticket.endTime ? ' – ' + fmtTime(ticket.endTime) : ''}`
      : 'TBA',
    infoY + infoGap
  )

  // Venue
  drawInfoRow('Venue', ticket.venue || 'To be announced', infoY + infoGap * 2)

  // Attendee name
  drawInfoRow('Attendee', ticket.attendeeName || ticket.attendee_name || 'N/A', infoY + infoGap * 3)

  // Email (if available)
  const email = ticket.attendeeEmail || ticket.attendee_email
  if (email) {
    drawInfoRow('Email', email, infoY + infoGap * 4)
  }

  // Amount paid
  if (ticket.priceAtBooking > 0) {
    drawInfoRow('Amount Paid', fmtCurrency(ticket.priceAtBooking), infoY + infoGap * (email ? 5 : 4))
  }

  // ── Dashed perforation line ─────────────────────────────────────────
  const perfX = leftW
  doc.setDrawColor('#D1D5DB')
  doc.setLineWidth(0.3)
  doc.setLineDashPattern([2, 2], 0)
  for (let py = 10; py < H - 6; py += 4) {
    doc.line(perfX, py, perfX, py + 2)
  }
  doc.setLineDashPattern([], 0)

  // ── Right section (QR + ticket ID) ──────────────────────────────────
  const rightX = perfX + 5
  const rightCenterX = rightX + (W - perfX - 5) / 2

  // QR Code
  const verifyUrl = getVerifyUrl(ticket.qrCode)
  const qrDataUrl = await generateQRDataUrl(verifyUrl, 300)
  const qrSize = 38
  doc.addImage(qrDataUrl, 'PNG', rightCenterX - qrSize / 2, 18, qrSize, qrSize)

  // "Scan to verify" text
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(BRAND.gray)
  doc.text('SCAN TO VERIFY', rightCenterX, 60, { align: 'center' })

  // Ticket ID
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(BRAND.primary)
  doc.text(`#${ticket.ticketId}`, rightCenterX, 70, { align: 'center' })

  // QR UUID (truncated)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.5)
  doc.setTextColor(BRAND.gray)
  const shortQr = ticket.qrCode ? ticket.qrCode.slice(0, 8) + '...' + ticket.qrCode.slice(-4) : ''
  doc.text(shortQr, rightCenterX, 75, { align: 'center' })

  // Order ID if available
  if (ticket.orderId) {
    doc.setFontSize(5.5)
    doc.setTextColor(BRAND.gray)
    doc.text(`Order: ${ticket.orderId}`, rightCenterX, 82, { align: 'center' })
  }

  // Status badge
  const isCheckedIn = !!ticket.checkInAt
  const statusText = isCheckedIn ? 'USED' : ticket.bookingStatus === 'confirmed' ? 'VALID' : 'PENDING'
  const statusColor = isCheckedIn ? BRAND.gray : ticket.bookingStatus === 'confirmed' ? BRAND.success : '#F59E0B'
  doc.setFillColor(statusColor)
  const badgeW = 22
  const badgeH = 7
  roundedRect(doc, rightCenterX - badgeW / 2, 88, badgeW, badgeH, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(BRAND.white)
  doc.text(statusText, rightCenterX, 93, { align: 'center' })

  // ── Footer ──────────────────────────────────────────────────────────
  // Bottom band
  doc.setFillColor(BRAND.dark)
  doc.rect(0, H - 12, W, 12, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(BRAND.white)
  doc.text('CITRONICS 2026', margin, H - 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.setTextColor('#9CA3AF')
  doc.text('This ticket is non-transferable. Present QR code at entry for verification.', margin, H - 1.5)

  // Issued date
  if (ticket.issuedAt) {
    doc.setFontSize(5.5)
    doc.setTextColor('#9CA3AF')
    doc.text(`Issued: ${fmtDate(ticket.issuedAt)}`, W - margin, H - 5, { align: 'right' })
  }

  // ── Output ──────────────────────────────────────────────────────────
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
  const margin = 14

  // Background
  doc.setFillColor(BRAND.white)
  doc.rect(0, 0, W, H, 'F')

  // Top accent
  doc.setFillColor(BRAND.primary)
  doc.rect(0, 0, W, 6, 'F')

  // Watermark
  drawWatermark(doc, W, H)

  // Left section
  const leftW = 145

  // Event title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(BRAND.dark)
  const titleLines = doc.splitTextToSize(ticket.eventTitle || 'Event', leftW - margin * 2)
  doc.text(titleLines, margin, 22)
  const titleBottomY = 22 + titleLines.length * 7

  doc.setDrawColor(BRAND.primary)
  doc.setLineWidth(0.5)
  doc.line(margin, titleBottomY + 2, margin + 40, titleBottomY + 2)

  let infoY = titleBottomY + 10
  const infoGap = 9

  function drawInfoRow(label, value, y) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(BRAND.gray)
    doc.text(label.toUpperCase(), margin, y)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(BRAND.dark)
    doc.text(String(value || 'N/A'), margin, y + 5)
  }

  drawInfoRow('Date', fmtDate(ticket.startTime), infoY)
  drawInfoRow('Time',
    ticket.startTime
      ? `${fmtTime(ticket.startTime)}${ticket.endTime ? ' – ' + fmtTime(ticket.endTime) : ''}`
      : 'TBA',
    infoY + infoGap
  )
  drawInfoRow('Venue', ticket.venue || 'To be announced', infoY + infoGap * 2)
  drawInfoRow('Attendee', ticket.attendeeName || ticket.attendee_name || 'N/A', infoY + infoGap * 3)

  const email = ticket.attendeeEmail || ticket.attendee_email
  if (email) {
    drawInfoRow('Email', email, infoY + infoGap * 4)
  }
  if (ticket.priceAtBooking > 0) {
    drawInfoRow('Amount Paid', fmtCurrency(ticket.priceAtBooking), infoY + infoGap * (email ? 5 : 4))
  }

  // Perforation
  const perfX = leftW
  doc.setDrawColor('#D1D5DB')
  doc.setLineWidth(0.3)
  for (let py = 10; py < H - 6; py += 4) {
    doc.line(perfX, py, perfX, py + 2)
  }

  // Right section
  const rightX = perfX + 5
  const rightCenterX = rightX + (W - perfX - 5) / 2

  const verifyUrl = getVerifyUrl(ticket.qrCode)
  const qrDataUrl = await generateQRDataUrl(verifyUrl, 300)
  const qrSize = 38
  doc.addImage(qrDataUrl, 'PNG', rightCenterX - qrSize / 2, 18, qrSize, qrSize)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6.5)
  doc.setTextColor(BRAND.gray)
  doc.text('SCAN TO VERIFY', rightCenterX, 60, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(BRAND.primary)
  doc.text(`#${ticket.ticketId}`, rightCenterX, 70, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.5)
  doc.setTextColor(BRAND.gray)
  const shortQr = ticket.qrCode ? ticket.qrCode.slice(0, 8) + '...' + ticket.qrCode.slice(-4) : ''
  doc.text(shortQr, rightCenterX, 75, { align: 'center' })

  if (ticket.orderId) {
    doc.setFontSize(5.5)
    doc.text(`Order: ${ticket.orderId}`, rightCenterX, 82, { align: 'center' })
  }

  const isCheckedIn = !!ticket.checkInAt
  const statusText = isCheckedIn ? 'USED' : ticket.bookingStatus === 'confirmed' ? 'VALID' : 'PENDING'
  const statusColor = isCheckedIn ? BRAND.gray : ticket.bookingStatus === 'confirmed' ? BRAND.success : '#F59E0B'
  doc.setFillColor(statusColor)
  roundedRect(doc, rightCenterX - 11, 88, 22, 7, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(BRAND.white)
  doc.text(statusText, rightCenterX, 93, { align: 'center' })

  // Footer
  doc.setFillColor(BRAND.dark)
  doc.rect(0, H - 12, W, 12, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(BRAND.white)
  doc.text('CITRONICS 2026', margin, H - 5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(6)
  doc.setTextColor('#9CA3AF')
  doc.text('This ticket is non-transferable. Present QR code at entry for verification.', margin, H - 1.5)
  if (ticket.issuedAt) {
    doc.setFontSize(5.5)
    doc.text(`Issued: ${fmtDate(ticket.issuedAt)}`, W - margin, H - 5, { align: 'right' })
  }
}

export default generateTicketPDF
