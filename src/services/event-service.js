import { dbAny, dbOneOrNone } from 'src/lib/database'

/**
 * Event Service — Citronics
 *
 * All queries powering public event pages and the home page.
 * Follows the same pattern as dashboard-service.js
 *
 * Naming convention:
 *   getAll*()     → list queries (dbAny)
 *   get*ById()    → single-row lookups (dbOneOrNone)
 */
const eventService = {
  // ── Departments ────────────────────────────────────────────────────────────

  /**
   * All departments ordered by name.
   * Used for filter dropdowns on events page and home events section.
   */
  async getAllDepartments() {
    return dbAny(`
      SELECT id, name, description
      FROM departments
      ORDER BY name ASC
    `)
  },

  /**
   * Single department by ID.
   */
  async getDepartmentById(id) {
    return dbOneOrNone(`
      SELECT id, name, description
      FROM departments
      WHERE id = $1
    `, [id])
  },

  // ── Events ─────────────────────────────────────────────────────────────────

  /**
   * Published events with department info.
   * Supports optional filtering by department ID.
   *
   * @param {object} opts
   * @param {number} [opts.departmentId] - Filter by department ID (omit for all)
   * @param {string} [opts.search]       - Search in name, tagline, venue
   * @param {string} [opts.sort]         - 'newest' | 'oldest' | 'popular'
   * @param {number} [opts.limit]        - Max results (default 50)
   * @param {number} [opts.offset]       - Offset for pagination (default 0)
   */
  async getPublishedEvents({ departmentId, search, sort = 'newest', limit = 50, offset = 0 } = {}) {
    const conditions = [`e.status = 'published'`, `e.visibility = 'public'`]
    const params = []
    let paramIndex = 1

    // Department filter
    if (departmentId) {
      conditions.push(`d.id = $${paramIndex}`)
      params.push(departmentId)
      paramIndex++
    }

    // Search filter
    if (search && search.trim()) {
      conditions.push(`(
        e.name ILIKE $${paramIndex}
        OR e.tagline ILIKE $${paramIndex}
        OR e.venue ILIKE $${paramIndex}
      )`)
      params.push(`%${search.trim()}%`)
      paramIndex++
    }

    // Sort
    let orderBy = 'e.start_time DESC'
    if (sort === 'oldest') orderBy = 'e.start_time ASC'
    if (sort === 'popular') orderBy = 'e.registered DESC NULLS LAST'

    // Limit & offset
    const limitClause = `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const where = conditions.join(' AND ')

    return dbAny(`
      SELECT
        e.id,
        e.name          AS title,
        e.tagline,
        e.description,
        e.start_time,
        e.end_time,
        e.venue,
        e.max_tickets   AS seats,
        e.registered,
        e.prize,
        e.tags,
        e.featured,
        e.status,
        e.images,
        e.ticket_price,
        e.brief,
        e.team_size,
        e.rules,
        e.rounds,
        e.document_url,
        d.id            AS "departmentId",
        d.name          AS "departmentName"
      FROM events e
      LEFT JOIN departments d ON d.id = e.department_id
      WHERE ${where}
      ORDER BY e.featured DESC, ${orderBy}
      ${limitClause}
    `, params)
  },

  /**
   * Count of published events (for pagination).
   */
  async countPublishedEvents({ departmentId, search } = {}) {
    const conditions = [`e.status = 'published'`, `e.visibility = 'public'`]
    const params = []
    let paramIndex = 1

    if (departmentId) {
      conditions.push(`d.id = $${paramIndex}`)
      params.push(departmentId)
      paramIndex++
    }

    if (search && search.trim()) {
      conditions.push(`(
        e.name ILIKE $${paramIndex}
        OR e.tagline ILIKE $${paramIndex}
        OR e.venue ILIKE $${paramIndex}
      )`)
      params.push(`%${search.trim()}%`)
    }

    const where = conditions.join(' AND ')

    const row = await dbOneOrNone(`
      SELECT COUNT(*)::int AS total
      FROM events e
      LEFT JOIN departments d ON d.id = e.department_id
      WHERE ${where}
    `, params)

    return row?.total || 0
  },

  /**
   * Single event by ID with full details + department info.
   * Only returns publicly visible (published) events.
   */
  async getEventById(id) {
    return dbOneOrNone(`
      SELECT
        e.id,
        e.name          AS title,
        e.tagline,
        e.description,
        e.start_time,
        e.end_time,
        e.venue,
        e.max_tickets   AS seats,
        e.registered,
        e.prize,
        e.tags,
        e.featured,
        e.status,
        e.images,
        e.ticket_price,
        e.brief,
        e.team_size,
        e.rules,
        e.rounds,
        e.document_url,
        e.created_at,
        d.id            AS "departmentId",
        d.name          AS "departmentName"
      FROM events e
      LEFT JOIN departments d ON d.id = e.department_id
      WHERE e.id = $1
        AND e.status = 'published'
        AND e.visibility = 'public'
    `, [id])
  },

  /**
   * Featured events (for home page hero / highlights).
   * Returns max 6 featured published events.
   */
  async getFeaturedEvents(limit = 6) {
    return dbAny(`
      SELECT
        e.id,
        e.name          AS title,
        e.tagline,
        e.start_time,
        e.venue,
        e.max_tickets   AS seats,
        e.registered,
        e.prize,
        e.tags,
        e.featured,
        e.images,
        e.ticket_price,
        d.id            AS "departmentId",
        d.name          AS "departmentName"
      FROM events e
      LEFT JOIN departments d ON d.id = e.department_id
      WHERE e.featured = TRUE
        AND e.status = 'published'
        AND e.visibility = 'public'
      ORDER BY e.start_time ASC
      LIMIT $1
    `, [limit])
  },

  /**
   * Validate cart: fetch fresh event data for a list of event IDs.
   * Returns ticket_price, availability, and metadata from the DB.
   * Only returns published, public events.
   *
   * @param {number[]} eventIds - Array of event IDs to validate
   */
  async getEventsByIds(eventIds) {
    if (!eventIds || eventIds.length === 0) return []

    // Build parameterized IN clause
    const placeholders = eventIds.map((_, i) => `$${i + 1}`).join(', ')

    return dbAny(`
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
        d.name          AS "departmentName"
      FROM events e
      LEFT JOIN departments d ON d.id = e.department_id
      WHERE e.id IN (${placeholders})
        AND e.status = 'published'
        AND e.visibility = 'public'
    `, eventIds)
  },

}

export default eventService
