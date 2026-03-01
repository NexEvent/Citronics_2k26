import { dbOneOrNone, dbAny } from 'src/lib/database'

/**
 * Dashboard Service — Citronics
 * All queries powering the main dashboard KPIs and widgets.
 *
 * Naming convention:
 *   getStats()               → single-row KPI summary (dbOneOrNone)
 *   getUpcomingEvents()      → list queries (dbAny)
 *   getRecentRegistrations() → list queries (dbAny)
 */
const dashboardService = {
  /**
   * Overview KPIs — single row with all headline numbers.
   * COALESCE guards against NULL when tables are empty.
   */
  async getStats() {
    return dbOneOrNone(`
      SELECT
        COALESCE((SELECT COUNT(*)  FROM events),                                          0) AS total_events,
        COALESCE((SELECT COUNT(*)  FROM events  WHERE status = 'published'),               0) AS active_events,
        COALESCE((SELECT COUNT(*)  FROM bookings WHERE status = 'confirmed'),              0) AS total_registrations,
        COALESCE((SELECT COUNT(*)  FROM tickets),                                          0) AS tickets_sold,
        COALESCE((SELECT SUM(amount) FROM payments WHERE status = 'success'),              0) AS total_revenue
    `)
  },

  /**
   * Next 5 upcoming published events, earliest first.
   * Includes venue name and current registration count.
   */
  async getUpcomingEvents() {
    return dbAny(`
      SELECT
        e.id,
        e.name                               AS title,
        e.start_time                         AS event_date,
        e.status,
        e.max_tickets                        AS capacity,
        COALESCE(e.venue, 'TBA')             AS venue_name,
        COALESCE(COUNT(b.id), 0)             AS registrations_count
      FROM       events   e
      LEFT JOIN  bookings b  ON  b.event_id = e.id AND b.status = 'confirmed'
      WHERE  e.start_time >= NOW()
        AND  e.status = 'published'
      GROUP  BY e.id
      ORDER  BY e.start_time ASC
      LIMIT  5
    `)
  },

  /**
   * 10 most recent registrations with attendee + event context.
   */
  async getRecentRegistrations() {
    return dbAny(`
      SELECT
        b.id,
        b.booked_at                           AS created_at,
        b.status                              AS payment_status,
        COALESCE(b.total_amount, 0)           AS amount_paid,
        COALESCE(e.name, 'Unknown')           AS event_title,
        COALESCE(u.name, u.email)             AS attendee_name,
        u.email                               AS attendee_email
      FROM   bookings b
      JOIN   events  e  ON  e.id = b.event_id
      JOIN   users   u  ON  u.id = b.user_id
      ORDER  BY b.booked_at DESC
      LIMIT  10
    `)
  }
}

export default dashboardService
