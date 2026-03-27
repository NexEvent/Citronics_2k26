import { dbAny, dbOneOrNone, dbOne, dbNone } from 'src/lib/database'
import bcrypt from 'bcryptjs'

const DATA_CUTOFF_DATE = new Date('2026-03-16T11:59:00+05:30')

const getEffectiveFromDate = dateFrom => {
  if (dateFrom && dateFrom > DATA_CUTOFF_DATE) return dateFrom

  return DATA_CUTOFF_DATE
}

/**
 * Admin Service — Citronics Admin Portal
 *
 * Uses JOINs to minimize API calls. Serves:
 *  - Dashboard stats (single combined query)
 *  - Events with department name + booking counts
 *  - Users with student info
 *  - Analytics with revenue / booking trends
 *  - Payment / transaction data
 *
 * All methods support date range filtering via `dateFrom` and `dateTo` options
 */
const adminService = {
  // ── User Management ────────────────────────────────────────────────────────

  /**
   * Get all users with pagination, filtering, and student info via JOIN
   */
  async getAllUsers(opts = {}) {
    const { limit = 20, offset = 0, role = null, search = '', canSeeAdmins = true, dateFrom = null, dateTo = null } = opts
    const effectiveDateFrom = getEffectiveFromDate(dateFrom)
    let query = `
      SELECT u.id, u.name, u.email, u.phone, u.role, u.verified, u.created_at,
             s.college, s.city, s.student_id
      FROM users u
      LEFT JOIN students s ON s.user_id = u.id
      WHERE 1=1
    `
    const params = []
    let p = 1

    if (!canSeeAdmins) {
      query += ` AND u.role NOT IN ('admin', 'owner')`
    }
    if (role) {
      query += ` AND u.role = $${p++}`
      params.push(role)
    }
    if (search) {
      query += ` AND (LOWER(u.name) LIKE LOWER($${p}) OR LOWER(u.email) LIKE LOWER($${p + 1}))`
      params.push(`%${search}%`, `%${search}%`)
      p += 2
    }
    query += ` AND u.created_at >= $${p++}`
    params.push(effectiveDateFrom)
    if (dateTo) {
      query += ` AND u.created_at <= $${p++}`
      params.push(dateTo)
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${p++} OFFSET $${p++}`
    params.push(limit, offset)

    return dbAny(query, params)
  },

  /**
   * Get total count of users
   */
  async getUsersCount(opts = {}) {
    const { role = null, search = '', canSeeAdmins = true, dateFrom = null, dateTo = null } = opts
    const effectiveDateFrom = getEffectiveFromDate(dateFrom)
    let query = `SELECT COUNT(*)::int as count FROM users WHERE 1=1`
    const params = []
    let p = 1

    if (!canSeeAdmins) {
      query += ` AND role NOT IN ('admin', 'owner')`
    }
    if (role) {
      query += ` AND role = $${p++}`
      params.push(role)
    }
    if (search) {
      query += ` AND (LOWER(name) LIKE LOWER($${p}) OR LOWER(email) LIKE LOWER($${p + 1}))`
      params.push(`%${search}%`, `%${search}%`)
      p += 2
    }
    query += ` AND created_at >= $${p++}`
    params.push(effectiveDateFrom)
    if (dateTo) {
      query += ` AND created_at <= $${p++}`
      params.push(dateTo)
    }

    const result = await dbOneOrNone(query, params)

    return result?.count || 0
  },

  /**
   * Get single user by ID with booking summary
   */
  async getUserById(id) {
    return dbOneOrNone(
      `SELECT u.id, u.name, u.email, u.phone, u.role, u.verified,
              u.created_at, u.updated_at,
              s.college, s.city, s.student_id,
              COALESCE(bk.booking_count, 0)::int AS booking_count,
              COALESCE(bk.total_spent, 0)::numeric AS total_spent
       FROM users u
       LEFT JOIN students s ON s.user_id = u.id
       LEFT JOIN LATERAL (
         SELECT COUNT(*)::int AS booking_count, SUM(total_amount) AS total_spent
         FROM bookings WHERE user_id = u.id AND status = 'confirmed'
       ) bk ON true
       WHERE u.id = $1`,
      [id]
    )
  },

  /**
   * Create new user (admin only — created by Owner)
   */
  async createUser(data) {
    const { name, email, password, phone, role } = data

    if (!['admin', 'owner'].includes(role)) {
      throw new Error('Invalid role. Only admin can be created.')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    return dbOne(
      `INSERT INTO users (name, email, phone, password_hash, role, verified)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, name, email, phone, role, verified, created_at`,
      [name, email.toLowerCase(), phone || null, hashedPassword, role]
    )
  },

  /**
   * Update user details
   */
  async updateUser(id, data) {
    const { name, email, phone, role } = data
    const updates = []
    const params = [id]
    let p = 2

    if (name !== undefined) { updates.push(`name = $${p++}`); params.push(name) }
    if (email !== undefined) { updates.push(`email = LOWER($${p++})`); params.push(email) }
    if (phone !== undefined) { updates.push(`phone = $${p++}`); params.push(phone) }
    if (role !== undefined && ['admin', 'owner'].includes(role)) {
      updates.push(`role = $${p++}`)
      params.push(role)
    }
    if (updates.length === 0) return null

    updates.push(`updated_at = CURRENT_TIMESTAMP`)

    return dbOneOrNone(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $1
       RETURNING id, name, email, phone, role, verified, created_at, updated_at`,
      params
    )
  },

  async deleteUser(id) {
    return dbNone(`DELETE FROM users WHERE id = $1`, [id])
  },

  async changePassword(userId, newPassword) {
    const hashed = await bcrypt.hash(newPassword, 10)

    return dbOne(
      `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id`,
      [hashed, userId]
    )
  },

  // ── Event Management (with JOINs) ─────────────────────────────────────────

  /**
   * Get all events with department name, booking count, and revenue in a single query
   */
  async getAllEventsAdmin(opts = {}) {
    const { limit = 20, offset = 0, status = null, search = '', departmentId = null, managerId = null, dateFrom = null, dateTo = null } = opts
    let query = `
      SELECT e.id, e.name, e.description, e.start_time, e.end_time, e.venue,
             e.max_tickets, e.ticket_price, e.status, e.visibility,
             e.department_id, e.created_by, e.created_at,
             d.name AS department_name,
             COALESCE(bs.booking_count, 0)::int AS booking_count,
             COALESCE(bs.revenue, 0)::numeric AS revenue
      FROM events e
      LEFT JOIN departments d ON d.id = e.department_id
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS booking_count, SUM(total_amount) AS revenue
        FROM bookings WHERE event_id = e.id AND status = 'confirmed'
      ) bs ON true
      WHERE 1=1
    `
    const params = []
    let p = 1

    // Admin scoping — only see events they manage
    if (managerId) { query += ` AND e.manager_id = $${p++}`; params.push(managerId) }
    if (status) { query += ` AND e.status = $${p++}`; params.push(status) }
    if (departmentId) { query += ` AND e.department_id = $${p++}`; params.push(departmentId) }
    if (search) { query += ` AND LOWER(e.name) LIKE LOWER($${p++})`; params.push(`%${search}%`) }
    if (dateFrom) { query += ` AND e.created_at >= $${p++}`; params.push(dateFrom) }
    if (dateTo) { query += ` AND e.created_at <= $${p++}`; params.push(dateTo) }

    query += ` ORDER BY e.created_at DESC LIMIT $${p++} OFFSET $${p++}`
    params.push(limit, offset)

    return dbAny(query, params)
  },

  /**
   * Get total count of events
   */
  async getEventsCountAdmin(opts = {}) {
    const { status = null, search = '', departmentId = null, managerId = null, dateFrom = null, dateTo = null } = opts
    let query = `SELECT COUNT(*)::int as count FROM events WHERE 1=1`
    const params = []
    let p = 1

    // Admin scoping
    if (managerId) { query += ` AND manager_id = $${p++}`; params.push(managerId) }
    if (status) { query += ` AND status = $${p++}`; params.push(status) }
    if (departmentId) { query += ` AND department_id = $${p++}`; params.push(departmentId) }
    if (search) { query += ` AND LOWER(name) LIKE LOWER($${p++})`; params.push(`%${search}%`) }
    if (dateFrom) { query += ` AND created_at >= $${p++}`; params.push(dateFrom) }
    if (dateTo) { query += ` AND created_at <= $${p++}`; params.push(dateTo) }

    const result = await dbOneOrNone(query, params)

    return result?.count || 0
  },

  /**
   * Get single event with department name, booking + revenue info
   */
  async getEventById(id) {
    return dbOneOrNone(
      `SELECT e.*, d.name AS department_name,
              COALESCE(bs.booking_count, 0)::int AS booking_count,
              COALESCE(bs.revenue, 0)::numeric AS revenue,
              COALESCE(bs.tickets_sold, 0)::int AS tickets_sold
       FROM events e
       LEFT JOIN departments d ON d.id = e.department_id
       LEFT JOIN LATERAL (
         SELECT COUNT(*)::int AS booking_count,
                SUM(total_amount) AS revenue,
                SUM(quantity)::int AS tickets_sold
         FROM bookings WHERE event_id = e.id AND status = 'confirmed'
       ) bs ON true
       WHERE e.id = $1`,
      [id]
    )
  },

  /**
   * Create new event
   */
  async createEvent(data) {
    const { name, description, startTime, endTime, venue, maxTickets, ticketPrice, departmentId, createdBy, managerId } = data

    return dbOne(
      `INSERT INTO events (name, description, start_time, end_time, venue, max_tickets,
                           ticket_price, department_id, created_by, manager_id, status, visibility)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'draft', 'public')
       RETURNING id, name, status, created_at`,
      [name, description, startTime, endTime, venue, maxTickets, ticketPrice, departmentId, createdBy, managerId]
    )
  },

  /**
   * Update event
   */
  async updateEvent(id, data) {
    const { name, description, startTime, endTime, venue, maxTickets, ticketPrice, departmentId, status, visibility } = data
    const updates = []
    const params = [id]
    let p = 2

    if (name !== undefined) { updates.push(`name = $${p++}`); params.push(name) }
    if (description !== undefined) { updates.push(`description = $${p++}`); params.push(description) }
    if (startTime !== undefined) { updates.push(`start_time = $${p++}`); params.push(startTime) }
    if (endTime !== undefined) { updates.push(`end_time = $${p++}`); params.push(endTime) }
    if (venue !== undefined) { updates.push(`venue = $${p++}`); params.push(venue) }
    if (maxTickets !== undefined) { updates.push(`max_tickets = $${p++}`); params.push(maxTickets) }
    if (ticketPrice !== undefined) { updates.push(`ticket_price = $${p++}`); params.push(ticketPrice) }
    if (departmentId !== undefined) { updates.push(`department_id = $${p++}`); params.push(departmentId) }
    if (status !== undefined && ['draft', 'published', 'active', 'cancelled', 'completed'].includes(status)) {
      updates.push(`status = $${p++}`); params.push(status)
    }
    if (visibility !== undefined && ['public', 'private', 'invite_only', 'college_only'].includes(visibility)) {
      updates.push(`visibility = $${p++}`); params.push(visibility)
    }
    if (updates.length === 0) return null

    updates.push(`updated_at = CURRENT_TIMESTAMP`)

    return dbOneOrNone(
      `UPDATE events SET ${updates.join(', ')} WHERE id = $1 RETURNING id, name, status, updated_at`,
      params
    )
  },

  async deleteEvent(id) {
    return dbNone(`DELETE FROM events WHERE id = $1`, [id])
  },

  // ── Dashboard Stats (single combined query) ───────────────────────────────

  async getDashboardStats(managerId = null, dateFrom = null, dateTo = null) {
    const effectiveDateFrom = getEffectiveFromDate(dateFrom)

    if (managerId) {
      const params = [managerId, effectiveDateFrom]
      const toCond = dateTo ? ' AND created_at <= $3' : ''
      const bookingToCond = dateTo ? ' AND booked_at <= $3' : ''
      if (dateTo) params.push(dateTo)

      const row = await dbOneOrNone(`
        SELECT
          (SELECT COUNT(*)::int FROM events
           WHERE manager_id = $1 AND created_at >= $2${toCond}) AS total_events,
          (SELECT COUNT(*)::int FROM events
           WHERE manager_id = $1 AND status IN ('published','active') AND created_at >= $2${toCond}) AS active_events,
          (SELECT COUNT(*)::int FROM bookings
           WHERE status = 'confirmed'
             AND booked_at >= $2${bookingToCond}
             AND event_id IN (SELECT id FROM events WHERE manager_id = $1)) AS total_bookings,
          (SELECT COALESCE(SUM(total_amount),0)::numeric FROM bookings
           WHERE status = 'confirmed'
             AND booked_at >= $2${bookingToCond}
             AND event_id IN (SELECT id FROM events WHERE manager_id = $1)) AS total_revenue
      `, params)

      return {
        totalUsers: null,
        totalEvents: row?.total_events || 0,
        activeEvents: row?.active_events || 0,
        totalBookings: row?.total_bookings || 0,
        totalRevenue: parseFloat(row?.total_revenue) || 0
      }
    }

    const params = [effectiveDateFrom]
    const toCond = dateTo ? ' AND created_at <= $2' : ''
    const bookingToCond = dateTo ? ' AND booked_at <= $2' : ''
    if (dateTo) params.push(dateTo)

    const row = await dbOneOrNone(`
      SELECT
        (SELECT COUNT(*)::int FROM users WHERE created_at >= $1${toCond}) AS total_users,
        (SELECT COUNT(*)::int FROM events WHERE created_at >= $1${toCond}) AS total_events,
        (SELECT COUNT(*)::int FROM events WHERE status IN ('published','active') AND created_at >= $1${toCond}) AS active_events,
        (SELECT COUNT(*)::int FROM bookings WHERE status = 'confirmed' AND booked_at >= $1${bookingToCond}) AS total_bookings,
        (SELECT COALESCE(SUM(total_amount),0)::numeric FROM bookings WHERE status = 'confirmed' AND booked_at >= $1${bookingToCond}) AS total_revenue
    `, params)

    return {
      totalUsers: row?.total_users || 0,
      totalEvents: row?.total_events || 0,
      activeEvents: row?.active_events || 0,
      totalBookings: row?.total_bookings || 0,
      totalRevenue: parseFloat(row?.total_revenue) || 0
    }
  },

  // ── Analytics (combined) ───────────────────────────────────────────────────

  /**
   * Full analytics payload in minimal queries — used by /api/admin/analytics
   */
  async getAnalytics(period = 30, managerId = null, dateFrom = null, dateTo = null) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period)
    const analyticsFromDate = getEffectiveFromDate(dateFrom || startDate)
    const analyticsToDate = dateTo || null

    // ── Overview ───────────────────────────────────────────────────────────
    let overviewQuery, overviewParams

    if (managerId) {
      const createdToCond = analyticsToDate ? ' AND created_at <= $3' : ''
      const bookedToCond = analyticsToDate ? ' AND booked_at <= $3' : ''
      overviewQuery = `
        SELECT
          (SELECT COUNT(*)::int FROM events WHERE manager_id = $2 AND created_at >= $1${createdToCond}) AS total_events,
          (SELECT COUNT(*)::int FROM events WHERE status IN ('active','published') AND manager_id = $2 AND created_at >= $1${createdToCond}) AS active_events,
          (SELECT COUNT(*)::int FROM bookings WHERE booked_at >= $1${bookedToCond} AND status='confirmed'
             AND event_id IN (SELECT id FROM events WHERE manager_id = $2)) AS total_bookings,
          (SELECT COALESCE(SUM(total_amount),0)::numeric FROM bookings WHERE booked_at >= $1${bookedToCond} AND status='confirmed'
             AND event_id IN (SELECT id FROM events WHERE manager_id = $2)) AS total_revenue,
          (SELECT COUNT(*)::int FROM users WHERE created_at >= $1${createdToCond}) AS new_users
      `
      overviewParams = analyticsToDate ? [analyticsFromDate, managerId, analyticsToDate] : [analyticsFromDate, managerId]
    } else {
      const createdToCond = analyticsToDate ? ' AND created_at <= $2' : ''
      const bookedToCond = analyticsToDate ? ' AND booked_at <= $2' : ''
      overviewQuery = `
        SELECT
          (SELECT COUNT(*)::int FROM events WHERE created_at >= $1${createdToCond}) AS total_events,
          (SELECT COUNT(*)::int FROM events WHERE status IN ('active','published') AND created_at >= $1${createdToCond}) AS active_events,
          (SELECT COUNT(*)::int FROM bookings WHERE booked_at >= $1${bookedToCond} AND status='confirmed') AS total_bookings,
          (SELECT COALESCE(SUM(total_amount),0)::numeric FROM bookings WHERE booked_at >= $1${bookedToCond} AND status='confirmed') AS total_revenue,
          (SELECT COUNT(*)::int FROM users WHERE created_at >= $1${createdToCond}) AS new_users
      `
      overviewParams = analyticsToDate ? [analyticsFromDate, analyticsToDate] : [analyticsFromDate]
    }

    const overview = await dbOneOrNone(overviewQuery, overviewParams)

    // ── Events by status ─────────────────────────────────────────────────
    const eventsByStatusParams = managerId
      ? (analyticsToDate ? [analyticsFromDate, managerId, analyticsToDate] : [analyticsFromDate, managerId])
      : (analyticsToDate ? [analyticsFromDate, analyticsToDate] : [analyticsFromDate])
    const eventsByStatusQuery = managerId
      ? `SELECT status, COUNT(*)::int AS count FROM events
         WHERE created_at >= $1 AND manager_id = $2${analyticsToDate ? ' AND created_at <= $3' : ''}
         GROUP BY status ORDER BY count DESC`
      : `SELECT status, COUNT(*)::int AS count FROM events
         WHERE created_at >= $1${analyticsToDate ? ' AND created_at <= $2' : ''}
         GROUP BY status ORDER BY count DESC`
    const eventsByStatus = await dbAny(eventsByStatusQuery, eventsByStatusParams)

    // ── Top events ───────────────────────────────────────────────────────
    const topEventsQuery = managerId
      ? `SELECT e.id, e.name, e.status,
               COUNT(*)::int AS bookings,
               COALESCE(SUM(b.total_amount),0)::numeric AS revenue
         FROM bookings b
         JOIN events e ON e.id = b.event_id
         WHERE b.status='confirmed'
           AND b.booked_at >= $1${analyticsToDate ? ' AND b.booked_at <= $3' : ''}
           AND e.manager_id = $2
         GROUP BY e.id, e.name, e.status
         HAVING COALESCE(SUM(b.total_amount),0) > 0
         ORDER BY revenue DESC NULLS LAST LIMIT 10`
      : `SELECT e.id, e.name, e.status,
               COUNT(*)::int AS bookings,
               COALESCE(SUM(b.total_amount),0)::numeric AS revenue
         FROM bookings b
         JOIN events e ON e.id = b.event_id
         WHERE b.status='confirmed'
           AND b.booked_at >= $1${analyticsToDate ? ' AND b.booked_at <= $2' : ''}
         GROUP BY e.id, e.name, e.status
         HAVING COALESCE(SUM(b.total_amount),0) > 0
         ORDER BY revenue DESC NULLS LAST LIMIT 10`

    const topEventsParams = managerId
      ? (analyticsToDate ? [analyticsFromDate, managerId, analyticsToDate] : [analyticsFromDate, managerId])
      : (analyticsToDate ? [analyticsFromDate, analyticsToDate] : [analyticsFromDate])
    const topEvents = await dbAny(topEventsQuery, topEventsParams)

    // ── Department stats ─────────────────────────────────────────────────
    const departmentStatsParams = managerId
      ? (analyticsToDate ? [analyticsFromDate, managerId, analyticsToDate] : [analyticsFromDate, managerId])
      : (analyticsToDate ? [analyticsFromDate, analyticsToDate] : [analyticsFromDate])
    const departmentStatsQuery = managerId
      ? `SELECT d.id, d.name, COUNT(e.id)::int AS event_count
         FROM departments d LEFT JOIN events e ON e.department_id = d.id
           AND e.created_at >= $1 AND e.manager_id = $2${analyticsToDate ? ' AND e.created_at <= $3' : ''}
         GROUP BY d.id, d.name ORDER BY event_count DESC LIMIT 10`
      : `SELECT d.id, d.name, COUNT(e.id)::int AS event_count
         FROM departments d LEFT JOIN events e ON e.department_id = d.id
           AND e.created_at >= $1${analyticsToDate ? ' AND e.created_at <= $2' : ''}
         GROUP BY d.id, d.name ORDER BY event_count DESC LIMIT 10`

    const departmentStatsResult = await dbAny(departmentStatsQuery, departmentStatsParams)

    // ── Booking trend ────────────────────────────────────────────────────
    const bookingTrend = managerId
      ? await dbAny(`SELECT DATE(booked_at) AS date, COUNT(*)::int AS count FROM bookings
                     WHERE booked_at >= $1${analyticsToDate ? ' AND booked_at <= $3' : ''} AND status='confirmed'
                       AND event_id IN (SELECT id FROM events WHERE manager_id = $2)
                     GROUP BY DATE(booked_at) ORDER BY date`, analyticsToDate ? [analyticsFromDate, managerId, analyticsToDate] : [analyticsFromDate, managerId])
      : await dbAny(`SELECT DATE(booked_at) AS date, COUNT(*)::int AS count FROM bookings
                     WHERE booked_at >= $1${analyticsToDate ? ' AND booked_at <= $2' : ''} AND status='confirmed'
                     GROUP BY DATE(booked_at) ORDER BY date`, analyticsToDate ? [analyticsFromDate, analyticsToDate] : [analyticsFromDate])

    // ── Revenue trend ────────────────────────────────────────────────────
    const revenueTrend = managerId
      ? await dbAny(`SELECT DATE(booked_at) AS date, COALESCE(SUM(total_amount),0)::numeric AS amount FROM bookings
                     WHERE booked_at >= $1${analyticsToDate ? ' AND booked_at <= $3' : ''} AND status='confirmed'
                       AND event_id IN (SELECT id FROM events WHERE manager_id = $2)
                     GROUP BY DATE(booked_at) ORDER BY date`, analyticsToDate ? [analyticsFromDate, managerId, analyticsToDate] : [analyticsFromDate, managerId])
      : await dbAny(`SELECT DATE(booked_at) AS date, COALESCE(SUM(total_amount),0)::numeric AS amount FROM bookings
                     WHERE booked_at >= $1${analyticsToDate ? ' AND booked_at <= $2' : ''} AND status='confirmed'
                     GROUP BY DATE(booked_at) ORDER BY date`, analyticsToDate ? [analyticsFromDate, analyticsToDate] : [analyticsFromDate])

    // ── Recent transactions ──────────────────────────────────────────────
    const recentTransactionsParams = managerId
      ? (analyticsToDate ? [managerId, analyticsFromDate, analyticsToDate] : [managerId, analyticsFromDate])
      : (analyticsToDate ? [analyticsFromDate, analyticsToDate] : [analyticsFromDate])
    const recentTransactionsQuery = managerId
      ? `SELECT b.id, b.total_amount, b.status, b.booked_at AS created_at,
                u.name AS user_name, u.email AS user_email, e.name AS event_name
         FROM bookings b JOIN users u ON u.id = b.user_id JOIN events e ON e.id = b.event_id
         WHERE e.manager_id = $1
           AND b.booked_at >= $2${analyticsToDate ? ' AND b.booked_at <= $3' : ''}
         ORDER BY b.booked_at DESC LIMIT 20`
      : `SELECT b.id, b.total_amount, b.status, b.booked_at AS created_at,
                u.name AS user_name, u.email AS user_email, e.name AS event_name
         FROM bookings b JOIN users u ON u.id = b.user_id JOIN events e ON e.id = b.event_id
         WHERE b.booked_at >= $1${analyticsToDate ? ' AND b.booked_at <= $2' : ''}
         ORDER BY b.booked_at DESC LIMIT 20`

    const recentTransactionsResult = await dbAny(recentTransactionsQuery, recentTransactionsParams)

    return {
      overview: {
        totalEvents: overview?.total_events || 0,
        activeEvents: overview?.active_events || 0,
        totalBookings: overview?.total_bookings || 0,
        totalRevenue: parseFloat(overview?.total_revenue) || 0,
        newUsers: overview?.new_users || 0
      },
      eventsByStatus,
      topEvents,
      departmentStats: departmentStatsResult,
      bookingTrend,
      revenueTrend,
      recentTransactions: recentTransactionsResult
    }
  },

  /**
   * Payments with tickets — used by admin payments view
   * Returns bookings joined with user info, event info, ticket counts, and payment details
   */
  async getPaymentsWithTickets(opts = {}) {
    const { limit = 50, offset = 0, status = null, managerId = null, search = '', dateFrom = null, dateTo = null } = opts
    const effectiveDateFrom = getEffectiveFromDate(dateFrom)
    let query = `
      SELECT b.id, b.quantity, b.total_amount, b.status, b.booked_at,
             u.id AS user_id, u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
             e.id AS event_id, e.name AS event_name,
             COUNT(t.id)::int AS tickets_generated,
             COUNT(t.check_in_at)::int AS tickets_checked_in,
             pmt.transaction_id, pmt.juspay_order_id, pmt.gateway, pmt.status AS gateway_status, pmt.paid_at
      FROM bookings b
      JOIN users u ON u.id = b.user_id
      JOIN events e ON e.id = b.event_id
      LEFT JOIN tickets t ON t.booking_id = b.id
      LEFT JOIN LATERAL (
        SELECT transaction_id, juspay_order_id, gateway, status, paid_at
        FROM payments
        WHERE booking_id = b.id
        ORDER BY CASE status WHEN 'success' THEN 0 WHEN 'pending' THEN 1 WHEN 'refunded' THEN 2 ELSE 3 END, created_at DESC
        LIMIT 1
      ) pmt ON TRUE
    `
    const params = []
    const conditions = []
    let p = 1

    if (managerId) {
      conditions.push(`e.manager_id = $${p++}`)
      params.push(managerId)
    }
    if (status) {
      conditions.push(`b.status = $${p++}`)
      params.push(status)
    }
    if (search) {
      conditions.push(`(LOWER(u.name) LIKE LOWER($${p}) OR LOWER(u.email) LIKE LOWER($${p + 1}) OR LOWER(e.name) LIKE LOWER($${p + 2}))`)
      params.push(`%${search}%`, `%${search}%`, `%${search}%`)
      p += 3
    }
    conditions.push(`b.booked_at >= $${p++}`)
    params.push(effectiveDateFrom)
    if (dateTo) {
      conditions.push(`b.booked_at <= $${p++}`)
      params.push(dateTo)
    }

    if (conditions.length > 0) query += ` WHERE ${conditions.join(' AND ')}`
    query += ` GROUP BY b.id, u.id, u.name, u.email, u.phone, e.id, e.name,
               pmt.transaction_id, pmt.juspay_order_id, pmt.gateway, pmt.status, pmt.paid_at`
    query += ` ORDER BY b.booked_at DESC LIMIT $${p++} OFFSET $${p++}`
    params.push(limit, offset)

    return dbAny(query, params)
  },

  /**
   * Payment summary stats for KPI cards
   */
  async getPaymentStats(managerId = null, dateFrom = null, dateTo = null) {
    const effectiveDateFrom = getEffectiveFromDate(dateFrom)
    const conditions = ['1=1']
    const params = []
    let pIdx = 1
    let managerParamPosition = null
    let fromParamPosition = null
    let toParamPosition = null

    if (managerId) {
      managerParamPosition = pIdx
      conditions.push(`b.event_id IN (SELECT id FROM events WHERE manager_id = $${pIdx++})`)
      params.push(managerId)
    }
    fromParamPosition = pIdx
    conditions.push(`b.booked_at >= $${pIdx++}`)
    params.push(effectiveDateFrom)
    if (dateTo) {
      toParamPosition = pIdx
      conditions.push(`b.booked_at <= $${pIdx++}`)
      params.push(dateTo)
    }

    const whereClause = conditions.join(' AND ')

    // For tickets subquery, we need to rebuild the conditions
    const ticketConditions = managerId
      ? `bk.event_id IN (SELECT id FROM events WHERE manager_id = $${managerParamPosition})`
      : '1=1'
    const ticketDateCond = [`bk.booked_at >= $${fromParamPosition}`]
    if (toParamPosition) ticketDateCond.push(`bk.booked_at <= $${toParamPosition}`)
    const ticketWhere = [ticketConditions, ...ticketDateCond, 'bk.status = \'confirmed\''].filter(Boolean).join(' AND ')

    const row = await dbOneOrNone(`
      SELECT
        COUNT(*)::int AS total_payments,
        COUNT(*) FILTER (WHERE b.status = 'confirmed')::int AS successful_payments,
        COUNT(*) FILTER (WHERE b.status = 'pending')::int AS pending_payments,
        COUNT(*) FILTER (WHERE b.status = 'cancelled')::int AS failed_payments,
        COALESCE(SUM(b.total_amount) FILTER (WHERE b.status = 'confirmed'), 0)::numeric AS total_revenue,
        COALESCE(AVG(b.total_amount) FILTER (WHERE b.status = 'confirmed'), 0)::numeric AS avg_order_value,
        (SELECT COUNT(*)::int FROM tickets t JOIN bookings bk ON bk.id = t.booking_id WHERE ${ticketWhere}) AS total_tickets,
        (SELECT COUNT(*)::int FROM tickets t JOIN bookings bk ON bk.id = t.booking_id WHERE t.check_in_at IS NOT NULL AND ${ticketWhere}) AS checked_in_tickets
      FROM bookings b
      WHERE ${whereClause}
    `, params)

    return {
      totalPayments: row?.total_payments || 0,
      successfulPayments: row?.successful_payments || 0,
      pendingPayments: row?.pending_payments || 0,
      failedPayments: row?.failed_payments || 0,
      totalRevenue: parseFloat(row?.total_revenue) || 0,
      avgOrderValue: Math.round(parseFloat(row?.avg_order_value) || 0),
      totalTickets: row?.total_tickets || 0,
      checkedInTickets: row?.checked_in_tickets || 0
    }
  },

  /**
   * Get top performing events (used by payments view)
   */
  async getTopEvents(limit = 10, managerId = null) {
    const query = managerId
      ? `SELECT e.id, e.name, e.status,
               COUNT(DISTINCT b.id) FILTER (WHERE b.status='confirmed')::int AS total_bookings,
               COALESCE(SUM(b.total_amount) FILTER (WHERE b.status='confirmed'),0)::numeric AS revenue
         FROM events e LEFT JOIN bookings b ON e.id = b.event_id
         WHERE e.manager_id = $2
         GROUP BY e.id, e.name, e.status
         ORDER BY revenue DESC NULLS LAST LIMIT $1`
      : `SELECT e.id, e.name, e.status,
               COUNT(DISTINCT b.id) FILTER (WHERE b.status='confirmed')::int AS total_bookings,
               COALESCE(SUM(b.total_amount) FILTER (WHERE b.status='confirmed'),0)::numeric AS revenue
         FROM events e LEFT JOIN bookings b ON e.id = b.event_id
         GROUP BY e.id, e.name, e.status
         ORDER BY revenue DESC NULLS LAST LIMIT $1`

    return dbAny(query, managerId ? [limit, managerId] : [limit])
  }
}

export default adminService
