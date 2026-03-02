import { v4 as uuidv4 } from 'uuid'
import { dbOne, dbOneOrNone, dbAny, dbNone, dbTx } from 'src/lib/database'

const { getJuspayInstance, getPaymentPageClientId, APIError } = require('src/lib/juspay')

/**
 * Payment Service — Citronics
 *
 * Handles the full HDFC SmartGateway (Juspay) payment lifecycle:
 *   1. Create order session (initiate payment)
 *   2. Verify payment status from gateway (server-side)
 *   3. Confirm payment & generate tickets
 *   4. Handle webhook callbacks
 *
 * Security principles:
 *   - NEVER trust frontend amounts — always re-compute from DB
 *   - ALWAYS verify payment status server-side via Juspay API
 *   - Idempotent operations using idempotency keys
 *   - Tickets are ONLY generated after DB-confirmed payment
 */

const paymentService = {
  // ═══════════════════════════════════════════════════════════════════════════
  //  1. CREATE ORDER SESSION
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Creates pending bookings + payment record, then initiates a Juspay order session.
   * The booking stays 'pending' until payment is verified server-side.
   *
   * @param {number} userId
   * @param {Array<{eventId: number, quantity: number}>} items
   * @param {string} returnUrl - URL to redirect after payment
   * @returns {Promise<{orderId: string, sdkPayload: object, paymentId: number, amount: number}>}
   */
  async createOrderSession(userId, items, returnUrl) {
    if (!userId) throw new Error('userId is required')
    if (!Array.isArray(items) || items.length === 0) throw new Error('items must be a non-empty array')

    // Step 1: Create pending bookings + payment in a single transaction
    const { bookings, grandTotal, paymentId, juspayOrderId, idempotencyKey } = await dbTx(async t => {
      const createdBookings = []
      let total = 0

      // Deduplicate items by eventId, summing quantities for duplicate entries
      const itemMap = new Map()
      for (const item of items) {
        const eid = item.eventId
        const qty = item.quantity
        if (!eid || !qty || qty < 1) continue
        itemMap.set(eid, (itemMap.get(eid) || 0) + qty)
      }
      const dedupedItems = Array.from(itemMap.entries()).map(([eventId, quantity]) => ({ eventId, quantity }))
      if (dedupedItems.length === 0) throw new Error('No valid items provided')

      // Sort by eventId to prevent deadlocks
      const sortedItems = dedupedItems.sort((a, b) => a.eventId - b.eventId)

      for (const item of sortedItems) {
        const { eventId, quantity } = item

        if (!eventId || !quantity || quantity < 1) {
          throw new Error(`Invalid item: eventId=${eventId}, quantity=${quantity}`)
        }

        // Lock event row for consistent availability check
        const event = await t.oneOrNone(`
          SELECT id, name AS title, ticket_price, max_tickets AS seats,
                 registered, status, visibility
          FROM events WHERE id = $1 FOR UPDATE
        `, [eventId])

        if (!event) throw new Error(`Event ${eventId} not found`)
        if (event.status !== 'published') throw new Error(`Event "${event.title}" is not available`)
        if (event.visibility !== 'public') throw new Error(`Event "${event.title}" is not public`)

        const available = Math.max(0, (event.seats || 0) - (event.registered || 0))
        if (available <= 0) throw new Error(`Event "${event.title}" is sold out`)
        if (quantity > available) throw new Error(`Only ${available} spot(s) left for "${event.title}"`)

        const ticketPrice = parseFloat(event.ticket_price) || 0
        const totalAmount = parseFloat((ticketPrice * quantity).toFixed(2))

        // Cancel any stale pending bookings for this event to avoid seat-reservation leaks
        const stalePending = await t.any(`
          SELECT id, quantity FROM bookings
          WHERE user_id = $1 AND event_id = $2 AND status = 'pending'
          FOR UPDATE
        `, [userId, eventId])

        for (const stale of stalePending) {
          await t.none(`
            UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
            WHERE id = $1
          `, [stale.id])

          // Release seats held by the stale booking
          await t.none(`
            UPDATE events SET registered = GREATEST(0, registered - $1), updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
          `, [stale.quantity, eventId])
        }

        // Create pending booking (15 min expiry)
        const booking = await t.one(`
          INSERT INTO bookings (user_id, event_id, quantity, price_at_booking, total_amount, status, expires_at)
          VALUES ($1, $2, $3, $4, $5, 'pending', CURRENT_TIMESTAMP + INTERVAL '15 minutes')
          RETURNING id, event_id, quantity, price_at_booking, total_amount
        `, [userId, eventId, quantity, ticketPrice, totalAmount])

        // Reserve seats (increment registered count)
        await t.none(`
          UPDATE events SET registered = registered + $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [quantity, eventId])

        createdBookings.push({
          bookingId: booking.id,
          eventId: booking.event_id,
          eventTitle: event.title,
          quantity: booking.quantity,
          pricePerTicket: parseFloat(booking.price_at_booking),
          totalAmount: parseFloat(booking.total_amount)
        })

        total += parseFloat(booking.total_amount)
      }

      const grandTotalFinal = parseFloat(total.toFixed(2))
      const orderId = `CIT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
      const idempKey = uuidv4()

      // Create payment record linked to the FIRST booking (primary)
      // For multi-event orders, we link to the first booking but store grandTotal
      const payment = await t.one(`
        INSERT INTO payments (booking_id, user_id, amount, gateway, idempotency_key, juspay_order_id, status)
        VALUES ($1, $2, $3, 'HDFC_JUSPAY', $4, $5, 'pending')
        RETURNING id
      `, [createdBookings[0].bookingId, userId, grandTotalFinal, idempKey, orderId])

      // If multiple bookings, store all booking IDs in raw_payload for reference
      if (createdBookings.length > 1) {
        await t.none(`
          UPDATE payments SET raw_payload = $1 WHERE id = $2
        `, [JSON.stringify({ bookingIds: createdBookings.map(b => b.bookingId) }), payment.id])
      }

      return {
        bookings: createdBookings,
        grandTotal: grandTotalFinal,
        paymentId: payment.id,
        juspayOrderId: orderId,
        idempotencyKey: idempKey
      }
    })

    // Step 2: Create Juspay order session
    try {
      const juspay = getJuspayInstance()
      const paymentPageClientId = getPaymentPageClientId()

      // Fetch user info for Juspay
      const user = await dbOneOrNone(`
        SELECT u.id, u.name, u.email, u.phone
        FROM users u WHERE u.id = $1
      `, [userId])

      const sessionPayload = {
        order_id: juspayOrderId,
        amount: grandTotal,
        payment_page_client_id: paymentPageClientId,
        customer_id: `cit-user-${userId}`,
        customer_email: user?.email || undefined,
        customer_phone: user?.phone || undefined,
        action: 'paymentPage',
        return_url: returnUrl,
        currency: 'INR'
      }

      const sessionResponse = await juspay.orderSession.create(sessionPayload)

      // Remove internal http field
      if (sessionResponse?.http) delete sessionResponse.http

      // Store SDK payload in the payment record
      await dbNone(`
        UPDATE payments
        SET sdk_payload = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [JSON.stringify(sessionResponse), paymentId])

      return {
        orderId: juspayOrderId,
        sdkPayload: sessionResponse,
        paymentId,
        amount: grandTotal,
        bookings
      }
    } catch (error) {
      // If Juspay session creation fails, cancel bookings and payment
      console.error('[PaymentService] Juspay session creation failed:', error)

      await _cancelPendingPayment(paymentId)

      if (error instanceof APIError) {
        throw new Error(`Payment gateway error: ${error.message}`)
      }
      throw new Error('Failed to initialize payment. Please try again.')
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  2. VERIFY PAYMENT STATUS (SERVER-SIDE — the core security check)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Verifies payment status directly from Juspay's API — NEVER trusts frontend.
   * Updates payment + booking records based on actual gateway status.
   * Generates tickets only on confirmed payment.
   *
   * @param {string} juspayOrderId - The order_id sent to Juspay
   * @returns {Promise<{status: string, payment: object, tickets?: Array}>}
   */
  async verifyAndProcessPayment(juspayOrderId) {
    if (!juspayOrderId) throw new Error('orderId is required')

    // 1. Look up our payment record
    const payment = await dbOneOrNone(`
      SELECT p.id, p.booking_id, p.amount, p.status, p.juspay_order_id, p.raw_payload
      FROM payments p WHERE p.juspay_order_id = $1
    `, [juspayOrderId])

    if (!payment) throw new Error('Payment record not found')

    // Already processed — return current status (idempotent)
    if (payment.status === 'success') {
      const rawTickets = await dbAny(`
        SELECT t.id, t.qr_code, t.created_at, t.check_in_at,
               b.event_id, b.status AS booking_status, b.price_at_booking,
               e.name AS event_title, e.venue, e.start_time, e.end_time,
               u.name AS attendee_name, u.email AS attendee_email
        FROM tickets t
        JOIN bookings b ON b.id = t.booking_id
        JOIN events e ON e.id = b.event_id
        JOIN users u ON u.id = b.user_id
        WHERE t.booking_id IN (
          SELECT id FROM bookings WHERE id = $1
          UNION
          SELECT unnest(CASE
            WHEN $2::jsonb IS NOT NULL AND $2::jsonb ? 'bookingIds'
            THEN ARRAY(SELECT jsonb_array_elements_text($2::jsonb->'bookingIds'))::bigint[]
            ELSE ARRAY[$1]::bigint[]
          END)
        )
      `, [payment.booking_id, payment.raw_payload || null])

      // Map to camelCase — full ticket object for PDF generation
      const tickets = rawTickets.map(t => ({
        ticketId: t.id,
        qrCode: t.qr_code,
        issuedAt: t.created_at,
        checkInAt: t.check_in_at,
        eventId: t.event_id,
        eventTitle: t.event_title,
        venue: t.venue,
        startTime: t.start_time,
        endTime: t.end_time,
        bookingStatus: t.booking_status,
        priceAtBooking: t.price_at_booking ? parseFloat(t.price_at_booking) : 0,
        attendeeName: t.attendee_name,
        attendeeEmail: t.attendee_email,
        orderId: juspayOrderId
      }))

      return {
        status: 'success',
        message: 'Payment already verified and confirmed',
        payment: { id: payment.id, amount: parseFloat(payment.amount), status: payment.status },
        tickets
      }
    }

    if (payment.status === 'failed') {
      return {
        status: 'failed',
        message: 'Payment was previously marked as failed',
        payment: { id: payment.id, amount: parseFloat(payment.amount), status: payment.status }
      }
    }

    // 2. Query Juspay for actual status — this is the source of truth
    let gatewayStatus
    try {
      const juspay = getJuspayInstance()
      gatewayStatus = await juspay.order.status(juspayOrderId)
      if (gatewayStatus?.http) delete gatewayStatus.http
    } catch (error) {
      console.error('[PaymentService] Juspay status check failed:', error)
      if (error instanceof APIError) {
        throw new Error(`Payment verification failed: ${error.message}`)
      }
      throw new Error('Unable to verify payment status. Please try again.')
    }

    const orderStatus = gatewayStatus.status
    const transactionId = gatewayStatus.txn_id || gatewayStatus.transaction_id || null

    // 3. CRITICAL — verify charged amount matches our DB amount (defence-in-depth)
    const gatewayAmount = parseFloat(gatewayStatus.amount)
    const expectedAmount = parseFloat(payment.amount)

    if (orderStatus === 'CHARGED' && gatewayAmount !== expectedAmount) {
      console.error(
        `[PaymentService] AMOUNT MISMATCH! orderId=${juspayOrderId} expected=${expectedAmount} gateway=${gatewayAmount}`
      )
      // Store evidence but do NOT confirm — flag for manual review
      await dbNone(`
        UPDATE payments
        SET gateway_status = 'AMOUNT_MISMATCH',
            gateway_response_message = $1,
            raw_payload = COALESCE(raw_payload, '{}'::jsonb) || $2::jsonb,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [
        `Expected ${expectedAmount}, gateway returned ${gatewayAmount}`,
        JSON.stringify({ amountMismatch: true, expected: expectedAmount, received: gatewayAmount, gatewayResponse: gatewayStatus }),
        payment.id
      ])

      return {
        status: 'failed',
        message: 'Payment amount mismatch detected. Please contact support.',
        payment: { id: payment.id, amount: expectedAmount, status: 'pending' }
      }
    }

    // 4. Process based on gateway status
    switch (orderStatus) {
      case 'CHARGED': {
        // Payment successful — confirm bookings + generate tickets
        const result = await _confirmPaymentAndGenerateTickets(
          payment.id,
          payment.booking_id,
          payment.raw_payload,
          transactionId,
          gatewayStatus,
          juspayOrderId
        )
        return {
          status: 'success',
          message: 'Payment confirmed successfully',
          ...result
        }
      }

      case 'PENDING':
      case 'PENDING_VBV':
      case 'NEW': {
        // Still processing — update raw payload but don't change status
        await dbNone(`
          UPDATE payments
          SET raw_payload = COALESCE(raw_payload, '{}'::jsonb) || $1::jsonb,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [JSON.stringify({ lastCheck: gatewayStatus }), payment.id])

        return {
          status: 'pending',
          message: 'Payment is still being processed',
          payment: { id: payment.id, amount: parseFloat(payment.amount), status: 'pending' }
        }
      }

      case 'AUTHORIZATION_FAILED':
      case 'AUTHENTICATION_FAILED':
      case 'JUSPAY_DECLINED': {
        // Payment failed
        await _failPayment(payment.id, payment.booking_id, payment.raw_payload, transactionId, gatewayStatus, orderStatus)

        return {
          status: 'failed',
          message: `Payment ${orderStatus.toLowerCase().replace(/_/g, ' ')}`,
          payment: { id: payment.id, amount: parseFloat(payment.amount), status: 'failed' }
        }
      }

      default: {
        // Unknown status — log and treat as pending
        console.warn(`[PaymentService] Unknown gateway status: ${orderStatus}`)
        await dbNone(`
          UPDATE payments
          SET raw_payload = COALESCE(raw_payload, '{}'::jsonb) || $1::jsonb,
              gateway_status = $2,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
        `, [JSON.stringify({ lastCheck: gatewayStatus }), orderStatus, payment.id])

        return {
          status: 'pending',
          message: `Payment status: ${orderStatus}`,
          payment: { id: payment.id, amount: parseFloat(payment.amount), status: 'pending' }
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  3. GET PAYMENT STATUS (for polling from frontend)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Returns current payment status without re-querying Juspay.
   * Use verifyAndProcessPayment() for authoritative status check.
   */
  async getPaymentStatus(juspayOrderId) {
    const payment = await dbOneOrNone(`
      SELECT p.id, p.booking_id, p.amount, p.status, p.juspay_order_id,
             p.transaction_id, p.gateway_status, p.paid_at
      FROM payments p WHERE p.juspay_order_id = $1
    `, [juspayOrderId])

    if (!payment) return null

    return {
      paymentId: payment.id,
      orderId: payment.juspay_order_id,
      amount: parseFloat(payment.amount),
      status: payment.status,
      transactionId: payment.transaction_id,
      gatewayStatus: payment.gateway_status,
      paidAt: payment.paid_at
    }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  4. GET USER TICKETS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Fetch all tickets for a user (for their dashboard / post-payment view).
   */
  async getUserTickets(userId) {
    const rows = await dbAny(`
      SELECT
        t.id,
        t.qr_code,
        t.check_in_at,
        t.created_at AS issued_at,
        b.id AS booking_id,
        b.event_id,
        b.quantity,
        b.price_at_booking,
        b.total_amount,
        b.status AS booking_status,
        e.name AS event_title,
        e.description AS event_description,
        e.venue,
        e.start_time,
        e.end_time,
        e.images,
        u.name AS attendee_name,
        u.email AS attendee_email,
        u.phone AS attendee_phone,
        p.juspay_order_id AS order_id,
        p.transaction_id
      FROM tickets t
      JOIN bookings b ON b.id = t.booking_id
      JOIN events e ON e.id = b.event_id
      JOIN users u ON u.id = b.user_id
      LEFT JOIN payments p ON p.booking_id = b.id AND p.status = 'success'
      WHERE b.user_id = $1
      ORDER BY t.created_at DESC
    `, [userId])

    return rows.map(r => ({
      ticketId: r.id,
      qrCode: r.qr_code,
      checkInAt: r.check_in_at,
      issuedAt: r.issued_at,
      bookingId: r.booking_id,
      eventId: r.event_id,
      quantity: r.quantity,
      priceAtBooking: parseFloat(r.price_at_booking),
      totalAmount: parseFloat(r.total_amount),
      bookingStatus: r.booking_status,
      eventTitle: r.event_title,
      eventDescription: r.event_description,
      venue: r.venue,
      startTime: r.start_time,
      endTime: r.end_time,
      images: r.images,
      attendeeName: r.attendee_name,
      attendeeEmail: r.attendee_email,
      attendeePhone: r.attendee_phone,
      orderId: r.order_id,
      transactionId: r.transaction_id
    }))
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  4b. VERIFY TICKET (QR code scan)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Verify a ticket by QR code UUID and return its details.
   * Used by staff to verify tickets at the event entrance.
   */
  async verifyTicket(qrCode) {
    const row = await dbOneOrNone(`
      SELECT
        t.id AS ticket_id,
        t.qr_code,
        t.check_in_at,
        t.created_at AS issued_at,
        b.id AS booking_id,
        b.event_id,
        b.quantity,
        b.status AS booking_status,
        e.name AS event_title,
        e.venue,
        e.start_time,
        e.end_time,
        u.name AS attendee_name,
        u.email AS attendee_email
      FROM tickets t
      JOIN bookings b ON b.id = t.booking_id
      JOIN events e ON e.id = b.event_id
      JOIN users u ON u.id = b.user_id
      WHERE t.qr_code = $1
    `, [qrCode])

    if (!row) return null

    return {
      ticketId: row.ticket_id,
      qrCode: row.qr_code,
      checkedIn: !!row.check_in_at,
      checkInAt: row.check_in_at,
      issuedAt: row.issued_at,
      bookingId: row.booking_id,
      eventId: row.event_id,
      bookingStatus: row.booking_status,
      eventTitle: row.event_title,
      venue: row.venue,
      startTime: row.start_time,
      endTime: row.end_time,
      attendeeName: row.attendee_name,
      attendeeEmail: row.attendee_email
    }
  },

  /**
   * Check in a ticket by QR code. Marks check_in_at and check_in_by.
   */
  async checkInTicket(qrCode, staffUserId) {
    const ticket = await dbOneOrNone(`
      SELECT t.id, t.check_in_at, b.status AS booking_status
      FROM tickets t
      JOIN bookings b ON b.id = t.booking_id
      WHERE t.qr_code = $1
    `, [qrCode])

    if (!ticket) throw new Error('Ticket not found')
    if (ticket.booking_status !== 'confirmed') throw new Error('Booking is not confirmed')
    if (ticket.check_in_at) throw new Error('Ticket already checked in')

    await dbNone(`
      UPDATE tickets SET check_in_at = CURRENT_TIMESTAMP, check_in_by = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [staffUserId, ticket.id])

    return { ticketId: ticket.id, checkedIn: true }
  },

  // ═══════════════════════════════════════════════════════════════════════════
  //  5. EXPIRE STALE PENDING BOOKINGS (cron / cleanup)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Cancel expired pending bookings and release their reserved seats.
   * Should be called periodically (e.g., every 5 minutes).
   */
  async expireStaleBookings() {
    return dbTx(async t => {
      // Find expired pending bookings
      const expired = await t.any(`
        SELECT id, event_id, quantity FROM bookings
        WHERE status = 'pending' AND expires_at < CURRENT_TIMESTAMP
        FOR UPDATE
      `)

      if (expired.length === 0) return { expired: 0 }

      for (const booking of expired) {
        // Cancel booking
        await t.none(`
          UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1
        `, [booking.id])

        // Release seats
        await t.none(`
          UPDATE events SET registered = GREATEST(0, registered - $1), updated_at = CURRENT_TIMESTAMP WHERE id = $2
        `, [booking.quantity, booking.event_id])

        // Mark associated payment as failed
        await t.none(`
          UPDATE payments SET status = 'failed', gateway_status = 'EXPIRED',
            gateway_response_message = 'Booking expired before payment completion',
            updated_at = CURRENT_TIMESTAMP
          WHERE booking_id = $1 AND status = 'pending'
        `, [booking.id])
      }

      console.log(`[PaymentService] Expired ${expired.length} stale booking(s)`)
      return { expired: expired.length }
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  PRIVATE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Confirm payment, update bookings to 'confirmed', generate tickets.
 * All in a single transaction.
 */
async function _confirmPaymentAndGenerateTickets(paymentId, primaryBookingId, rawPayload, transactionId, gatewayResponse, orderId) {
  return dbTx(async t => {
    // Determine all booking IDs for this payment
    let bookingIds = [primaryBookingId]
    if (rawPayload && typeof rawPayload === 'object' && rawPayload.bookingIds) {
      bookingIds = rawPayload.bookingIds.map(id => parseInt(id, 10))
    }

    // Update payment to success — only if not already in a terminal state
    const paymentUpdated = await t.oneOrNone(`
      UPDATE payments SET
        status = 'success',
        transaction_id = $1,
        gateway_status = 'CHARGED',
        gateway_response_code = $2,
        gateway_response_message = $3,
        payment_method = $4,
        payment_method_type = $5,
        raw_payload = COALESCE(raw_payload, '{}'::jsonb) || $6::jsonb,
        paid_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $7 AND status NOT IN ('success', 'failed', 'refunded')
      RETURNING id
    `, [
      transactionId,
      gatewayResponse.payment?.resp_code || null,
      gatewayResponse.payment?.resp_message || null,
      gatewayResponse.payment?.payment_method || null,
      gatewayResponse.payment?.payment_method_type || null,
      JSON.stringify({ verifiedResponse: gatewayResponse }),
      paymentId
    ])

    // If payment was already in a terminal state, skip ticket generation
    if (!paymentUpdated) {
      return {
        payment: { id: paymentId, status: 'already_processed', transactionId },
        tickets: []
      }
    }

    // Confirm bookings and generate tickets
    const allTickets = []

    for (const bookingId of bookingIds) {
      // Update booking status
      await t.none(`
        UPDATE bookings SET
          status = 'confirmed',
          expires_at = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND status = 'pending'
      `, [bookingId])

      // Get booking details for ticket generation
      const booking = await t.oneOrNone(`
        SELECT b.id, b.event_id, b.quantity, b.user_id, b.price_at_booking,
               e.name AS event_title, e.venue, e.start_time, e.end_time,
               u.name AS attendee_name, u.email AS attendee_email
        FROM bookings b
        JOIN events e ON e.id = b.event_id
        JOIN users u ON u.id = b.user_id
        WHERE b.id = $1
      `, [bookingId])

      if (!booking) continue

      // Generate one ticket per quantity unit
      for (let i = 0; i < booking.quantity; i++) {
        const qrCode = uuidv4()
        const ticket = await t.one(`
          INSERT INTO tickets (booking_id, qr_code)
          VALUES ($1, $2)
          RETURNING id, qr_code, created_at
        `, [bookingId, qrCode])

        allTickets.push({
          ticketId: ticket.id,
          qrCode: ticket.qr_code,
          issuedAt: ticket.created_at,
          checkInAt: null,
          eventId: booking.event_id,
          eventTitle: booking.event_title,
          venue: booking.venue,
          startTime: booking.start_time,
          endTime: booking.end_time,
          bookingStatus: 'confirmed',
          priceAtBooking: booking.price_at_booking ? parseFloat(booking.price_at_booking) : 0,
          attendeeName: booking.attendee_name,
          attendeeEmail: booking.attendee_email,
          orderId: orderId || null
        })
      }
    }

    return {
      payment: { id: paymentId, status: 'success', transactionId },
      tickets: allTickets
    }
  })
}

/**
 * Mark payment as failed and cancel associated bookings, releasing seats.
 */
async function _failPayment(paymentId, primaryBookingId, rawPayload, transactionId, gatewayResponse, gatewayStatus) {
  return dbTx(async t => {
    let bookingIds = [primaryBookingId]
    if (rawPayload && typeof rawPayload === 'object' && rawPayload.bookingIds) {
      bookingIds = rawPayload.bookingIds.map(id => parseInt(id, 10))
    }

    // Update payment — only if not already in a terminal state
    const paymentUpdated = await t.oneOrNone(`
      UPDATE payments SET
        status = 'failed',
        transaction_id = $1,
        gateway_status = $2,
        gateway_response_code = $3,
        gateway_response_message = $4,
        raw_payload = COALESCE(raw_payload, '{}'::jsonb) || $5::jsonb,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $6 AND status NOT IN ('success', 'failed', 'refunded')
      RETURNING id
    `, [
      transactionId,
      gatewayStatus,
      gatewayResponse.payment?.resp_code || null,
      gatewayResponse.payment?.resp_message || null,
      JSON.stringify({ failedResponse: gatewayResponse }),
      paymentId
    ])

    if (!paymentUpdated) return // Already in terminal state

    // Cancel bookings and release seats
    for (const bookingId of bookingIds) {
      const booking = await t.oneOrNone(`
        SELECT id, event_id, quantity FROM bookings WHERE id = $1 AND status = 'pending'
      `, [bookingId])

      if (booking) {
        await t.none(`
          UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1
        `, [bookingId])

        await t.none(`
          UPDATE events SET registered = GREATEST(0, registered - $1), updated_at = CURRENT_TIMESTAMP WHERE id = $2
        `, [booking.quantity, booking.event_id])
      }
    }
  })
}

/**
 * Cancel a pending payment and all its bookings (e.g., when Juspay session creation fails).
 */
async function _cancelPendingPayment(paymentId) {
  try {
    await dbTx(async t => {
      const payment = await t.oneOrNone(`
        SELECT id, booking_id, raw_payload FROM payments WHERE id = $1 AND status = 'pending'
      `, [paymentId])

      if (!payment) return

      let bookingIds = [payment.booking_id]
      if (payment.raw_payload && typeof payment.raw_payload === 'object' && payment.raw_payload.bookingIds) {
        bookingIds = payment.raw_payload.bookingIds.map(id => parseInt(id, 10))
      }

      // Cancel payment — only if still pending
      await t.none(`
        UPDATE payments SET status = 'failed', gateway_status = 'SESSION_CREATION_FAILED',
          gateway_response_message = 'Failed to create Juspay order session',
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND status = 'pending'
      `, [paymentId])

      // Cancel bookings and release seats
      for (const bookingId of bookingIds) {
        const booking = await t.oneOrNone(`
          SELECT id, event_id, quantity FROM bookings WHERE id = $1 AND status = 'pending'
        `, [bookingId])

        if (booking) {
          await t.none(`
            UPDATE bookings SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = $1
          `, [bookingId])

          await t.none(`
            UPDATE events SET registered = GREATEST(0, registered - $1), updated_at = CURRENT_TIMESTAMP WHERE id = $2
          `, [booking.quantity, booking.event_id])
        }
      }
    })
  } catch (err) {
    console.error('[PaymentService] Failed to cancel pending payment:', err)
  }
}

export default paymentService
