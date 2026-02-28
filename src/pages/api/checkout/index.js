import checkoutService from 'src/services/checkout-service'

/**
 * /api/checkout
 * Unified checkout endpoint — all checkout operations in one route.
 *
 * POST   → Validate checkout items
 * PUT    → Register user + student
 * PATCH  → Confirm booking
 *
 * All pricing is DB-sourced. Frontend must send ONLY eventId + quantity.
 * Password is hashed before storage. No authentication logic.
 */

export default async function handler(req, res) {
  switch (req.method) {
    // ── GET — Look up user by phone number ──────────────────────────────────
    case 'GET': {
      try {
        const { phone } = req.query
        if (!phone || typeof phone !== 'string') {
          return res.status(400).json({ success: false, message: 'phone query parameter is required' })
        }
        const clean = phone.trim().replace(/[\s\-+()]/g, '').slice(-10)
        if (!/^\d{10}$/.test(clean)) {
          return res.status(400).json({ success: false, message: 'Invalid phone number' })
        }
        const user = await checkoutService.findUserByPhone(clean)
        if (user) {
          // Return only a masked name — no userId until password is verified
          const maskedName = user.name
            ? user.name.split(' ').map(w => w.charAt(0) + '*'.repeat(Math.max(0, w.length - 1))).join(' ')
            : ''
          return res.status(200).json({ success: true, exists: true, data: { maskedName } })
        }
        return res.status(200).json({ success: true, exists: false })
      } catch (error) {
        console.error('[GET /api/checkout]', error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
      }
    }

    // ── POST — Validate checkout items ─────────────────────────────────────
    case 'POST': {
      try {
        const { items } = req.body

        if (!Array.isArray(items) || items.length === 0) {
          return res
            .status(400)
            .json({ success: false, message: 'items must be a non-empty array of { eventId, quantity }' })
        }

        // Sanitize: only eventId (int) + quantity (int), cap at 20
        const sanitized = items
          .map(item => ({
            eventId: parseInt(item.eventId, 10),
            quantity: Math.max(1, parseInt(item.quantity, 10) || 1)
          }))
          .filter(item => !isNaN(item.eventId) && item.eventId > 0)
          .slice(0, 20)

        if (sanitized.length === 0) {
          return res.status(400).json({ success: false, message: 'No valid items provided' })
        }

        const result = await checkoutService.validateCheckoutItems(sanitized)

        return res.status(200).json({ success: true, data: result })
      } catch (error) {
        console.error('[POST /api/checkout]', error)
        return res.status(500).json({ success: false, message: 'Internal server error' })
      }
    }

    // ── PUT — Register user + student ───────────────────────────────────────
    case 'PUT': {
      try {
        const { name, email, phone, password, college, city, referredBy } = req.body

        const errors = []

        if (!name || typeof name !== 'string' || name.trim().length < 2) {
          errors.push('Full name is required (min 2 characters)')
        }
        if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
          errors.push('A valid email address is required')
        }
        if (!phone || typeof phone !== 'string' || !/^\d{10}$/.test(phone.trim().replace(/[\s\-+()]/g, '').slice(-10))) {
          errors.push('A valid 10-digit phone number is required')
        }
        if (!password || typeof password !== 'string' || password.length < 6) {
          errors.push('Password must be at least 6 characters')
        }
        if (!college || typeof college !== 'string' || college.trim().length < 2) {
          errors.push('College name is required')
        }
        if (!city || typeof city !== 'string' || city.trim().length < 2) {
          errors.push('City is required')
        }

        if (errors.length > 0) {
          return res.status(400).json({ success: false, message: errors.join('. '), errors })
        }

        const cleanPhone = phone.trim().replace(/[\s\-+()]/g, '').slice(-10)

        const result = await checkoutService.registerUserAndStudent({
          name: name.trim(),
          email: email.trim(),
          phone: cleanPhone,
          password,
          college: college.trim(),
          city: city.trim(),
          referredBy: referredBy?.trim() || null
        })

        return res.status(201).json({
          success: true,
          data: { userId: result.userId }
        })
      } catch (error) {
        console.error('[PUT /api/checkout]', error)

        if (error.code === 'PHONE_EXISTS') {
          return res.status(409).json({ success: false, message: error.message, code: 'PHONE_EXISTS', userId: error.userId })
        }
        if (error.code === 'EMAIL_EXISTS') {
          return res.status(409).json({ success: false, message: error.message, code: 'EMAIL_EXISTS' })
        }

        return res.status(500).json({ success: false, message: 'Internal server error' })
      }
    }

    // ── PATCH — Confirm booking ─────────────────────────────────────────────
    case 'PATCH': {
      try {
        const { userId, items } = req.body

        if (!userId || isNaN(parseInt(userId, 10))) {
          return res.status(400).json({ success: false, message: 'Valid userId is required' })
        }

        if (!Array.isArray(items) || items.length === 0) {
          return res
            .status(400)
            .json({ success: false, message: 'items must be a non-empty array of { eventId, quantity }' })
        }

        const sanitized = items
          .map(item => ({
            eventId: parseInt(item.eventId, 10),
            quantity: Math.max(1, parseInt(item.quantity, 10) || 1)
          }))
          .filter(item => !isNaN(item.eventId) && item.eventId > 0)

        if (sanitized.length === 0) {
          return res.status(400).json({ success: false, message: 'No valid items provided' })
        }

        const result = await checkoutService.createBookings(parseInt(userId, 10), sanitized)

        return res.status(201).json({ success: true, data: result })
      } catch (error) {
        console.error('[PATCH /api/checkout]', error)

        if (
          error.message &&
          (error.message.includes('not found') ||
            error.message.includes('not available') ||
            error.message.includes('sold out') ||
            error.message.includes('spot(s) left') ||
            error.message.includes('already have a confirmed'))
        ) {
          return res.status(400).json({ success: false, message: error.message })
        }

        return res.status(500).json({ success: false, message: 'Internal server error' })
      }
    }

    // ── Method not allowed ──────────────────────────────────────────────────
    default: {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH'])
      return res.status(405).json({ success: false, message: `Method ${req.method} not allowed` })
    }
  }
}
