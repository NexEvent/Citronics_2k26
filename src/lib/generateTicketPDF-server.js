import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'

/**
 * Server-side Ticket PDF Generator — Citronics 2026
 *
 * Generates ticket PDFs as Buffer (for email attachments).
 * This is a server-only version of generateTicketPDF.js — no `window` references.
 *
 * Returns an ArrayBuffer that can be used as a nodemailer attachment.
 */

const BRAND = {
  primary: '#7367F0',
  primaryDark: '#655BD3',
  dark: '#1A1A2E',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  white: '#FFFFFF',
  success: '#28C76F'
}

function fmtDate(iso) {
  if (!iso) return 'TBA'

  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Asia/Kolkata'
  })
}

function fmtTime(iso) {
  if (!iso) return ''

  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric', minute: '2-digit', hour12: true,
    timeZone: 'Asia/Kolkata'
  })
}

function fmtCurrency(amount) {
  return `Rs. ${parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

function roundedRect(doc, x, y, w, h, r, style = 'F') {
  doc.roundedRect(x, y, w, h, r, r, style)
}

async function generateQRDataUrl(text, size = 200) {
  return QRCode.toDataURL(text, {
    width: size,
    margin: 1,
    color: { dark: '#1A1A2E', light: '#FFFFFF' },
    errorCorrectionLevel: 'H'
  })
}

function drawWatermark(doc, W, H) {
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor('#DDD9F7')

  const text = 'CITRONICS 2026'
  const stamps = [
    [W * 0.12, H * 0.52], [W * 0.48, H * 0.30], [W * 0.78, H * 0.52],
    [W * 0.28, H * 0.82], [W * 0.62, H * 0.78], [W * 0.35, H * 0.10]
  ]
  stamps.forEach(([x, y]) => { doc.text(text, x, y, { angle: 28 }) })
}

function getVerifyUrl(qrCode) {
  const base = process.env.NEXTAUTH_URL || 'https://cdgicitronics.in'

  return `${base}/tickets/verify?code=${qrCode}`
}

/**
 * Generate a ticket PDF and return as Buffer (for email attachment).
 *
 * @param {Object} ticket - Ticket data
 * @returns {Promise<Buffer>} PDF as Buffer
 */
export async function generateTicketPDFBuffer(ticket) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' })
  await _drawTicketOnPage(doc, ticket)

  // Get as ArrayBuffer, then convert to Node.js Buffer
  const arrayBuffer = doc.output('arraybuffer')

  return Buffer.from(arrayBuffer)
}

/**
 * Generate a combined PDF with multiple tickets and return as Buffer.
 */
export async function generateAllTicketsPDFBuffer(tickets) {
  if (!tickets || tickets.length === 0) return null

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' })

  for (let i = 0; i < tickets.length; i++) {
    if (i > 0) doc.addPage('a5', 'landscape')
    await _drawTicketOnPage(doc, tickets[i])
  }

  const arrayBuffer = doc.output('arraybuffer')

  return Buffer.from(arrayBuffer)
}

/**
 * Internal: Draw a single ticket on the current page of an existing doc.
 * (Identical logic to the client-side version)
 */
async function _drawTicketOnPage(doc, ticket) {
  const W = 210
  const H = 148
  const mg = 9
  const perfX = 152
  const footerH = 10
  const topBar = 5

  doc.setFillColor(BRAND.white)
  doc.rect(0, 0, W, H, 'F')

  doc.setFillColor(BRAND.primary)
  doc.rect(0, 0, W, topBar, 'F')

  doc.setFillColor('#F7F6FF')
  doc.rect(0, topBar, perfX, H - topBar - footerH, 'F')

  doc.setFillColor(BRAND.white)
  doc.rect(perfX, topBar, W - perfX, H - topBar - footerH, 'F')

  drawWatermark(doc, perfX, H)

  // Tiny brand tag
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(6)
  doc.setTextColor(BRAND.primary)
  doc.text('CITRONICS 2026  |  E-TICKET', mg, 12)

  // Event title
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(BRAND.dark)
  const maxTitleW = perfX - mg * 2
  const rawTitleLines = doc.splitTextToSize(ticket.eventTitle || 'Event', maxTitleW)
  const titleLines = rawTitleLines.slice(0, 2)
  doc.text(titleLines, mg, 20)
  const titleEndY = 20 + titleLines.length * 6.5

  doc.setFillColor(BRAND.primary)
  doc.rect(mg, titleEndY + 2, 28, 1, 'F')

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
  const rowGap = 14

  const timeStr = ticket.startTime
    ? `${fmtTime(ticket.startTime)}${ticket.endTime ? ' - ' + fmtTime(ticket.endTime) : ''}`
    : 'TBA'
  infoCell('Date', fmtDate(ticket.startTime), col1X, rowY, colW)
  infoCell('Time', timeStr, col2X, rowY, colW)
  rowY += rowGap
  hRule(rowY)
  rowY += 4

  infoCell('Venue', ticket.venue || 'To be announced', col1X, rowY, maxTitleW)
  rowY += rowGap
  hRule(rowY)
  rowY += 4

  const email = ticket.attendeeEmail || ticket.attendee_email
  infoCell('Attendee', ticket.attendeeName || ticket.attendee_name || 'N/A', col1X, rowY, colW)
  if (email) {
    infoCell('Email', email, col2X, rowY, colW)
  }
  rowY += rowGap

  if (ticket.priceAtBooking > 0) {
    hRule(rowY)
    rowY += 4
    infoCell('Amount Paid', fmtCurrency(ticket.priceAtBooking), col1X, rowY, colW)
  }

  // Perforation
  doc.setDrawColor('#BFB4F5')
  doc.setLineWidth(0.3)
  for (let py = topBar + 4; py < H - footerH - 4; py += 3.5) {
    doc.line(perfX, py, perfX, py + 1.8)
  }

  // Right panel
  const rightCX = perfX + (W - perfX) / 2

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

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5.5)
  doc.setTextColor(BRAND.gray)
  doc.text('SCAN TO VERIFY', rightCX, qrY + qrSize + 6, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(BRAND.primary)
  doc.text(`#${ticket.ticketId}`, rightCX, qrY + qrSize + 12, { align: 'center' })

  const orderLabelY = qrY + qrSize + 17
  if (ticket.orderId) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(4.5)
    doc.setTextColor(BRAND.gray)
    doc.text(`Order: ${ticket.orderId}`, rightCX, orderLabelY, { align: 'center' })
  }

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

  // Footer
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

export default { generateTicketPDFBuffer, generateAllTicketsPDFBuffer }
