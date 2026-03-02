import { dbAny, dbOneOrNone, dbOne, dbNone, dbTx } from 'src/lib/database'
import bcrypt from 'bcryptjs'

/**
 * Admin Service — Citronics Admin Portal
 * 
 * Handles all admin-related database operations:
 * - User management (create, update, delete)
 * - Event management (create, update, delete, publish)
 * - Analytics and statistics
 * - Admin/Executive management
 */
const adminService = {
  // ── User Management ────────────────────────────────────────────────────────

  /**
   * Get all users with pagination and filtering
   * @param {Object} opts - Options
   * @param {number} opts.limit - Number of users to return
   * @param {number} opts.offset - Offset for pagination
   * @param {string} opts.role - Filter by specific role
   * @param {string} opts.search - Search by name or email
   * @param {boolean} opts.canSeeAdmins - If false, excludes admin/owner roles from results
   */
  async getAllUsers(opts = {}) {
    const { limit = 20, offset = 0, role = null, search = '', canSeeAdmins = true } = opts
    let query = `
      SELECT id, name, email, phone, role, verified, created_at
      FROM users
      WHERE 1=1
    `
    const params = []
    let paramCount = 1

    // Role-based visibility: If canSeeAdmins is false, hide admin/owner users
    if (!canSeeAdmins) {
      query += ` AND role NOT IN ('admin', 'owner')`
    }

    if (role) {
      query += ` AND role = $${paramCount++}`
      params.push(role)
    }

    if (search) {
      query += ` AND (LOWER(name) LIKE LOWER($${paramCount++}) OR LOWER(email) LIKE LOWER($${paramCount++}))`
      params.push(`%${search}%`, `%${search}%`)
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`
    params.push(limit, offset)

    return dbAny(query, params)
  },

  /**
   * Get total count of users
   * @param {Object} opts - Options
   * @param {string} opts.role - Filter by specific role
   * @param {string} opts.search - Search by name or email
   * @param {boolean} opts.canSeeAdmins - If false, excludes admin/owner roles from count
   */
  async getUsersCount(opts = {}) {
    const { role = null, search = '', canSeeAdmins = true } = opts
    let query = `SELECT COUNT(*) as count FROM users WHERE 1=1`
    const params = []
    let paramCount = 1

    // Role-based visibility: If canSeeAdmins is false, hide admin/owner users
    if (!canSeeAdmins) {
      query += ` AND role NOT IN ('admin', 'owner')`
    }

    if (role) {
      query += ` AND role = $${paramCount++}`
      params.push(role)
    }

    if (search) {
      query += ` AND (LOWER(name) LIKE LOWER($${paramCount++}) OR LOWER(email) LIKE LOWER($${paramCount++}))`
      params.push(`%${search}%`, `%${search}%`)
    }

    const result = await dbOneOrNone(query, params)
    return result?.count || 0
  },

  /**
   * Get single user by ID
   */
  async getUserById(id) {
    return dbOneOrNone(
      `SELECT id, name, email, phone, role, verified, created_at, updated_at
       FROM users WHERE id = $1`,
      [id]
    )
  },

  /**
   * Create new user (admin/executive)
   */
  async createUser(data) {
    const { name, email, password, phone, role, createdBy } = data

    if (!['admin', 'executive', 'owner'].includes(role)) {
      throw new Error('Invalid role')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    return dbOne(
      `INSERT INTO users (name, email, phone, password_hash, role, verified, created_by)
       VALUES ($1, $2, $3, $4, $5, true, $6)
       RETURNING id, name, email, phone, role, verified, created_at`,
      [name, email.toLowerCase(), phone || null, hashedPassword, role, createdBy]
    )
  },

  /**
   * Update user details
   */
  async updateUser(id, data) {
    const { name, email, phone, role } = data
    const updates = []
    const params = [id]
    let paramCount = 2

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`)
      params.push(name)
    }

    if (email !== undefined) {
      updates.push(`email = LOWER($${paramCount++})`)
      params.push(email)
    }

    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`)
      params.push(phone)
    }

    if (role !== undefined && ['admin', 'executive', 'owner'].includes(role)) {
      updates.push(`role = $${paramCount++}`)
      params.push(role)
    }

    if (updates.length === 0) return null

    updates.push(`updated_at = CURRENT_TIMESTAMP`)

    return dbOneOrNone(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $1 RETURNING id, name, email, phone, role, verified, created_at, updated_at`,
      params
    )
  },

  /**
   * Delete user (only owner can delete admins)
   */
  async deleteUser(id) {
    return dbNone(`DELETE FROM users WHERE id = $1`, [id])
  },

  /**
   * Change user password
   */
  async changePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    return dbOne(
      `UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id`,
      [hashedPassword, userId]
    )
  },

  // ── Event Management ───────────────────────────────────────────────────────

  /**
   * Get all events with admin view (includes drafts, cancelled, etc)
   */
  async getAllEventsAdmin(opts = {}) {
    const { limit = 20, offset = 0, status = null, search = '', departmentId = null } = opts
    let query = `
      SELECT id, name, description, start_time, end_time, venue, max_tickets,
             ticket_price, department_id, status, visibility, created_by, created_at
      FROM events
      WHERE 1=1
    `
    const params = []
    let paramCount = 1

    if (status) {
      query += ` AND status = $${paramCount++}`
      params.push(status)
    }

    if (departmentId) {
      query += ` AND department_id = $${paramCount++}`
      params.push(departmentId)
    }

    if (search) {
      query += ` AND LOWER(name) LIKE LOWER($${paramCount++})`
      params.push(`%${search}%`)
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`
    params.push(limit, offset)

    return dbAny(query, params)
  },

  /**
   * Get total count of events
   */
  async getEventsCountAdmin(opts = {}) {
    const { status = null, search = '', departmentId = null } = opts
    let query = `SELECT COUNT(*) as count FROM events WHERE 1=1`
    const params = []
    let paramCount = 1

    if (status) {
      query += ` AND status = $${paramCount++}`
      params.push(status)
    }

    if (departmentId) {
      query += ` AND department_id = $${paramCount++}`
      params.push(departmentId)
    }

    if (search) {
      query += ` AND LOWER(name) LIKE LOWER($${paramCount++})`
      params.push(`%${search}%`)
    }

    const result = await dbOneOrNone(query, params)
    return result?.count || 0
  },

  /**
   * Get single event with details
   */
  async getEventById(id) {
    return dbOneOrNone(
      `SELECT id, name, description, start_time, end_time, venue, max_tickets,
              ticket_price, department_id, status, visibility, created_by, created_at, updated_at
       FROM events WHERE id = $1`,
      [id]
    )
  },

  /**
   * Create new event
   */
  async createEvent(data) {
    const { name, description, startTime, endTime, venue, maxTickets, ticketPrice, departmentId, createdBy } = data

    return dbOne(
      `INSERT INTO events (name, description, start_time, end_time, venue, max_tickets, 
                           ticket_price, department_id, created_by, status, visibility)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'draft', 'public')
       RETURNING id, name, status, created_at`,
      [name, description, startTime, endTime, venue, maxTickets, ticketPrice, departmentId, createdBy]
    )
  },

  /**
   * Update event
   */
  async updateEvent(id, data) {
    const { name, description, startTime, endTime, venue, maxTickets, ticketPrice, departmentId, status, visibility } = data
    const updates = []
    const params = [id]
    let paramCount = 2

    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`)
      params.push(name)
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`)
      params.push(description)
    }

    if (startTime !== undefined) {
      updates.push(`start_time = $${paramCount++}`)
      params.push(startTime)
    }

    if (endTime !== undefined) {
      updates.push(`end_time = $${paramCount++}`)
      params.push(endTime)
    }

    if (venue !== undefined) {
      updates.push(`venue = $${paramCount++}`)
      params.push(venue)
    }

    if (maxTickets !== undefined) {
      updates.push(`max_tickets = $${paramCount++}`)
      params.push(maxTickets)
    }

    if (ticketPrice !== undefined) {
      updates.push(`ticket_price = $${paramCount++}`)
      params.push(ticketPrice)
    }

    if (departmentId !== undefined) {
      updates.push(`department_id = $${paramCount++}`)
      params.push(departmentId)
    }

    if (status !== undefined && ['draft', 'published', 'active', 'cancelled', 'completed'].includes(status)) {
      updates.push(`status = $${paramCount++}`)
      params.push(status)
    }

    if (visibility !== undefined && ['public', 'private', 'invite_only', 'college_only'].includes(visibility)) {
      updates.push(`visibility = $${paramCount++}`)
      params.push(visibility)
    }

    if (updates.length === 0) return null

    updates.push(`updated_at = CURRENT_TIMESTAMP`)

    return dbOneOrNone(
      `UPDATE events SET ${updates.join(', ')} WHERE id = $1 RETURNING id, name, status, updated_at`,
      params
    )
  },

  /**
   * Delete event
   */
  async deleteEvent(id) {
    return dbNone(`DELETE FROM events WHERE id = $1`, [id])
  },

  // ── Analytics ──────────────────────────────────────────────────────────────

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const [users, events, activeEvents, bookings, revenue] = await Promise.all([
      dbOneOrNone(`SELECT COUNT(*) as count FROM users`),
      dbOneOrNone(`SELECT COUNT(*) as count FROM events`),
      dbOneOrNone(`SELECT COUNT(*) as count FROM events WHERE status IN ('published', 'active')`),
      dbOneOrNone(`SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'`),
      dbOneOrNone(`SELECT SUM(total_amount) as total FROM bookings WHERE status = 'confirmed'`)
    ])

    return {
      totalUsers: parseInt(users?.count) || 0,
      totalEvents: parseInt(events?.count) || 0,
      activeEvents: parseInt(activeEvents?.count) || 0,
      totalBookings: parseInt(bookings?.count) || 0,
      totalRevenue: parseFloat(revenue?.total) || 0
    }
  },

  /**
   * Get event analytics
   */
  async getEventAnalytics(eventId) {
    const event = await dbOneOrNone(`
      SELECT id, name, status, max_tickets
      FROM events WHERE id = $1
    `, [eventId])

    if (!event) return null

    const [bookings, revenue, checkedIn] = await Promise.all([
      dbOneOrNone(`
        SELECT COUNT(*) as count, SUM(quantity) as total_quantity
        FROM bookings WHERE event_id = $1 AND status = 'confirmed'
      `, [eventId]),
      dbOneOrNone(`
        SELECT SUM(total_amount) as total
        FROM bookings WHERE event_id = $1 AND status = 'confirmed'
      `, [eventId]),
      dbOneOrNone(`
        SELECT COUNT(*) as count
        FROM tickets WHERE booking_id IN (
          SELECT id FROM bookings WHERE event_id = $1
        ) AND check_in_at IS NOT NULL
      `, [eventId])
    ])

    return {
      eventId: event.id,
      eventName: event.name,
      status: event.status,
      maxTickets: event.max_tickets,
      totalBookings: bookings?.count || 0,
      ticketsSold: bookings?.total_quantity || 0,
      revenue: revenue?.total || 0,
      checkedIn: checkedIn?.count || 0,
      occupancyRate: event.max_tickets ? Math.round(((bookings?.total_quantity || 0) / event.max_tickets) * 100) : 0
    }
  },

  /**
   * Get top performing events
   */
  async getTopEvents(limit = 10) {
    return dbAny(`
      SELECT e.id, e.name, e.status, 
             COUNT(DISTINCT b.id) as total_bookings,
             SUM(b.total_amount) as revenue
      FROM events e
      LEFT JOIN bookings b ON e.id = b.event_id AND b.status = 'confirmed'
      GROUP BY e.id, e.name, e.status
      ORDER BY revenue DESC NULLS LAST
      LIMIT $1
    `, [limit])
  },

  /**
   * Get user registration trends (last 30 days)
   */
  async getUserRegistrationTrends() {
    return dbAny(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) DESC
    `)
  }
}

export default adminService
