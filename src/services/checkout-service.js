import bcrypt from 'bcryptjs'
import { dbOneOrNone, dbTx } from 'src/lib/database'

/**
 * Checkout Service — Citronics
 *
 * Handles secure checkout: cart validation, user+student registration,
 * and booking creation. All pricing is DB-sourced — never trust frontend.
 *
 * 3-layer pattern: UI → API → Service → DB
 */
const checkoutService = {
  // ── Validate Checkout Items ──────────────────────────────────────────────────

  /**
   * Validate a list of checkout items against the database.
   * For each item, fetch event, validate published + public,
   * calculate availability, and return backend-computed summary.
   *
   * @param {Array<{eventId: number, quantity: number}>} items
   * @returns {Promise<{validItems: Array, errors: Array}>}
   */
  async validateCheckoutItems(items) {
    const validItems = []
    const errors = []

    for (const item of items) {
      const { eventId, quantity } = item

      if (!eventId || !quantity || quantity < 1) {
        errors.push({ eventId, message: 'Invalid eventId or quantity' })
        continue
      }

      const event = await dbOneOrNone(`
        SELECT
          e.id,
          e.name          AS title,
          e.ticket_price,
          e.max_tickets   AS seats,
          e.registered,
          e.start_time,
          e.end_time,
          e.venue,
          e.images,
          e.status,
          e.visibility,
          d.name          AS "departmentName"
        FROM events e
        LEFT JOIN departments d ON d.id = e.department_id
        WHERE e.id = $1
      `, [eventId])

      if (!event) {
        errors.push({ eventId, message: 'Event not found' })
        continue
      }

      if (event.status !== 'published') {
        errors.push({ eventId, message: 'Event is not available for booking' })
        continue
      }

      if (event.visibility !== 'public') {
        errors.push({ eventId, message: 'Event is not publicly accessible' })
        continue
      }

      const available = Math.max(0, (event.seats || 0) - (event.registered || 0))

      if (available <= 0) {
        errors.push({ eventId, message: 'Event is sold out' })
        continue
      }

      const validQty = Math.min(quantity, available)
      const ticketPrice = parseFloat(event.ticket_price) || 0
      const totalAmount = parseFloat((ticketPrice * validQty).toFixed(2))

      validItems.push({
        eventId: event.id,
        title: event.title,
        ticketPrice,
        quantity: validQty,
        requestedQuantity: quantity,
        quantityCapped: validQty < quantity,
        totalAmount,
        available,
        venue: event.venue,
        startTime: event.start_time,
        endTime: event.end_time,
        image: event.images?.[0] || null,
        departmentName: event.departmentName
      })
    }

    // Compute grand total
    const grandTotal = validItems.reduce((sum, item) => sum + item.totalAmount, 0)

    return { validItems, errors, grandTotal: parseFloat(grandTotal.toFixed(2)) }
  },

  // ── Register User + Student ──────────────────────────────────────────────────

  /**
   * Create user and student records inside a transaction.
   * Password is hashed before storage. student_id is auto-generated.
   *
   * @param {object} data
   * @param {string} data.name
   * @param {string} data.email
   * @param {string} data.phone
   * @param {string} data.password
   * @param {string} data.college
   * @param {string} data.city
   * @param {string} [data.referredBy] - referral code of referring student
   * @returns {Promise<{userId: number}>}
   */
  async registerUserAndStudent({ name, email, phone, password, college, city, referredBy }) {
    // Hash password (CPU-bound, safe outside transaction)
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    // Resolve referral code (read-only, safe outside transaction)
    let referredByUserId = null
    if (referredBy && referredBy.trim()) {
      const referrer = await dbOneOrNone(
        'SELECT user_id FROM students WHERE referral_code = $1',
        [referredBy.trim().toUpperCase()]
      )
      if (referrer) referredByUserId = referrer.user_id
    }

    try {
      const result = await dbTx(async t => {
        // ── Uniqueness checks INSIDE transaction to prevent race conditions ──
        if (phone) {
          const existingPhone = await t.oneOrNone('SELECT id FROM users WHERE phone = $1', [phone])
          if (existingPhone) {
            throw Object.assign(
              new Error('An account with this phone number already exists'),
              { code: 'PHONE_EXISTS', userId: existingPhone.id }
            )
          }
        }

        const existing = await t.oneOrNone('SELECT id FROM users WHERE email = $1', [email])
        if (existing) {
          throw Object.assign(
            new Error('An account with this email already exists'),
            { code: 'EMAIL_EXISTS' }
          )
        }

        // Insert user
        const user = await t.one(`
          INSERT INTO users (name, email, phone, password_hash, role)
          VALUES ($1, $2, $3, $4, 'student')
          RETURNING id
        `, [name, email.toLowerCase(), phone || null, passwordHash])

        // Generate student_id (CIT-XXXX format)
        const studentId = `CIT-${String(user.id).padStart(4, '0')}`

        // Generate a unique referral code for this student
        const referralCode = _generateReferralCode()

        // Insert student
        await t.none(`
          INSERT INTO students (user_id, student_id, college, city, referred_by, referral_code)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [user.id, studentId, college, city, referredByUserId, referralCode])

        // studentId and referralCode are stored in DB only — not exposed to frontend
        return { userId: user.id }
      })

      return result
    } catch (err) {
      // Re-throw our typed business errors as-is
      if (err.code === 'PHONE_EXISTS' || err.code === 'EMAIL_EXISTS') throw err

      // Graceful fallback for DB-level unique constraint violations (concurrent inserts)
      if (err.code === '23505') {
        const detail = (err.detail || err.constraint || '').toLowerCase()
        if (detail.includes('phone')) {
          throw Object.assign(new Error('An account with this phone number already exists'), { code: 'PHONE_EXISTS' })
        }
        if (detail.includes('email')) {
          throw Object.assign(new Error('An account with this email already exists'), { code: 'EMAIL_EXISTS' })
        }
      }

      throw err
    }
  },

  // ── Create Booking ───────────────────────────────────────────────────────────

  /**
   * Create confirmed bookings for a user. Re-validates everything from DB.
   * Uses a transaction — all-or-nothing.
   *
   * @param {number} userId
   * @param {Array<{eventId: number, quantity: number}>} items
   * @returns {Promise<{bookings: Array, grandTotal: number}>}
   */
  async createBookings(userId, items) {
    return dbTx(async t => {
      const bookings = []
      let grandTotal = 0

      // Sort by eventId to guarantee consistent lock ordering and prevent deadlocks
      const sortedItems = [...items].sort((a, b) => a.eventId - b.eventId)

      for (const item of sortedItems) {
        const { eventId, quantity } = item

        // Re-fetch event inside transaction
        const event = await t.oneOrNone(`
          SELECT
            id,
            name AS title,
            ticket_price,
            max_tickets AS seats,
            registered,
            status,
            visibility
          FROM events
          WHERE id = $1
          FOR UPDATE
        `, [eventId])

        if (!event) throw new Error(`Event ${eventId} not found`)
        if (event.status !== 'published') throw new Error(`Event "${event.title}" is not available`)
        if (event.visibility !== 'public') throw new Error(`Event "${event.title}" is not public`)

        const available = Math.max(0, (event.seats || 0) - (event.registered || 0))
        if (available <= 0) throw new Error(`Event "${event.title}" is sold out`)
        if (quantity > available) throw new Error(`Only ${available} spot(s) left for "${event.title}"`)

        const ticketPrice = parseFloat(event.ticket_price) || 0
        const totalAmount = parseFloat((ticketPrice * quantity).toFixed(2))

        // Check for existing confirmed booking
        const existingBooking = await t.oneOrNone(`
          SELECT id FROM bookings
          WHERE user_id = $1 AND event_id = $2 AND status = 'confirmed'
        `, [userId, eventId])

        if (existingBooking) {
          throw new Error(`You already have a confirmed booking for "${event.title}"`)
        }

        // Insert booking
        const booking = await t.one(`
          INSERT INTO bookings (user_id, event_id, quantity, price_at_booking, total_amount, status)
          VALUES ($1, $2, $3, $4, $5, 'confirmed')
          RETURNING id, event_id, quantity, price_at_booking, total_amount, status, booked_at
        `, [userId, eventId, quantity, ticketPrice, totalAmount])

        // Update registered count on event
        await t.none(`
          UPDATE events
          SET registered = registered + $1, updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [quantity, eventId])

        bookings.push({
          bookingId: booking.id,
          eventId: booking.event_id,
          eventTitle: event.title,
          quantity: booking.quantity,
          pricePerTicket: parseFloat(booking.price_at_booking),
          totalAmount: parseFloat(booking.total_amount),
          status: booking.status,
          bookedAt: booking.booked_at
        })

        grandTotal += parseFloat(booking.total_amount)
      }

      return { bookings, grandTotal: parseFloat(grandTotal.toFixed(2)) }
    })
  },

  // ── Verify User By Phone ───────────────────────────────────────────────────

  /**
   * Verify a user's identity by phone + password.
   * Returns { userId } on success, null if phone not found or password wrong.
   * Never reveals which part failed (prevents enumeration).
   */
  async verifyUserByPhone(phone, password) {
    const user = await dbOneOrNone(
      'SELECT id, password_hash FROM users WHERE phone = $1',
      [phone]
    )
    if (!user) return null
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return null
    return { userId: user.id }
  },

  // ── Find User By Phone ───────────────────────────────────────────────────────

  /**
   * Look up an existing user by phone number (primary identity).
   * Returns user info if found, null otherwise.
   */
  async findUserByPhone(phone) {
    const clean = phone?.trim().replace(/[\s\-+()]/g, '').slice(-10)
    return dbOneOrNone(`
      SELECT u.id, u.name, u.email, u.phone, u.role,
             s.college, s.city
      FROM users u
      LEFT JOIN students s ON s.user_id = u.id
      WHERE u.phone = $1
    `, [clean])
  }
}

// ── Private Helpers ───────────────────────────────────────────────────────────

function _generateReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export default checkoutService
