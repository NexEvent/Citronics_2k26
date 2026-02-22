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
        COALESCE((SELECT COUNT(*)  FROM events),                                0) AS total_events,
        COALESCE((SELECT COUNT(*)  FROM events  WHERE status = 'published'),    0) AS active_events,
        COALESCE((SELECT COUNT(*)  FROM registrations),                         0) AS total_registrations,
        COALESCE((SELECT COUNT(*)  FROM tickets WHERE status = 'sold'),         0) AS tickets_sold,
        COALESCE((SELECT SUM(amount_paid)
                    FROM registrations
                   WHERE payment_status = 'paid'),                              0) AS total_revenue
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
        e.title,
        e.event_date,
        e.status,
        e.capacity,
        COALESCE(v.name,       'TBA')  AS venue_name,
        COALESCE(COUNT(r.id),  0)      AS registrations_count
      FROM       events        e
      LEFT JOIN  venues        v  ON  v.id = e.venue_id
      LEFT JOIN  registrations r  ON  r.event_id = e.id
      WHERE  e.event_date >= NOW()
        AND  e.status = 'published'
      GROUP  BY e.id, v.name
      ORDER  BY e.event_date ASC
      LIMIT  5
    `)
  },

  /**
   * 10 most recent registrations with attendee + event context.
   */
  async getRecentRegistrations() {
    return dbAny(`
      SELECT
        r.id,
        r.created_at,
        r.payment_status,
        COALESCE(r.amount_paid, 0)            AS amount_paid,
        COALESCE(e.title,       'Unknown')    AS event_title,
        COALESCE(u.first_name || ' ' || u.last_name, u.email) AS attendee_name,
        u.email                               AS attendee_email
      FROM   registrations r
      JOIN   events  e  ON  e.id = r.event_id
      JOIN   users   u  ON  u.id = r.user_id
      ORDER  BY r.created_at DESC
      LIMIT  10
    `)
  }
}

export default dashboardService
