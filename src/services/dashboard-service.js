import { dbOneOrNone, dbAny } from 'src/lib/database'

/**
 * Dashboard Service — Citronics
 * All queries powering the main dashboard KPIs and widgets.
 *
 * Naming convention:
 *   getStats()               → single-row KPI summary (dbOneOrNone)
 *   getUpcomingEvents()      → list queries (dbAny)
 *   getRecentBookings()      → list queries (dbAny)
 */
const dashboardService = {
  /**
   * Overview KPIs — single row with all headline numbers.
   * COALESCE guards against NULL when tables are empty.
   */
  async getStats() {
    return dbOneOrNone(`
      SELECT
        COALESCE((SELECT COUNT(*) FROM events), 0) AS total_events,
        COALESCE((SELECT COUNT(*) FROM events WHERE status IN ('published', 'active')), 0) AS active_events,
        COALESCE((SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'), 0) AS total_bookings,
        COALESCE((SELECT COUNT(*) FROM tickets), 0) AS tickets_sold,
        COALESCE((SELECT SUM(total_amount) FROM bookings WHERE status = 'confirmed'), 0) AS total_revenue
    `)
  },

  /**
   * Next 5 upcoming published events, earliest first.
   * Includes venue and current booking count.
   */
  async getUpcomingEvents() {
    return dbAny(`
      SELECT
        e.id,
        e.name AS title,
        e.start_time AS event_date,
        e.status,
        e.max_tickets AS capacity,
        COALESCE(e.venue, 'TBA') AS venue_name,
        COALESCE(COUNT(b.id) FILTER (WHERE b.status = 'confirmed'), 0)::int AS bookings_count
      FROM events e
      LEFT JOIN bookings b ON b.event_id = e.id
      WHERE e.start_time >= NOW()
        AND e.status IN ('published', 'active')
      GROUP BY e.id, e.name, e.start_time, e.status, e.max_tickets, e.venue
      ORDER BY e.start_time ASC
      LIMIT 5
    `)
  },

  /**
   * 10 most recent confirmed bookings with attendee + event context.
   */
  async getRecentBookings() {
    return dbAny(`
      SELECT
        b.id,
        b.booked_at AS created_at,
        b.status AS payment_status,
        COALESCE(b.total_amount, 0) AS amount_paid,
        COALESCE(e.name, 'Unknown') AS event_title,
        COALESCE(u.name, u.email) AS attendee_name,
        u.email AS attendee_email
      FROM bookings b
      JOIN events e ON e.id = b.event_id
      JOIN users u ON u.id = b.user_id
      ORDER BY b.booked_at DESC
      LIMIT 10
    `)
  }
}

export default dashboardService
