import { adminAuthMiddleware } from 'src/lib/adminAuthMiddleware'
import { dbAny, dbOneOrNone } from 'src/lib/database'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const auth = await adminAuthMiddleware(req, res)
  if (!auth.authenticated) {
    return res.status(401).json({ error: auth.error })
  }

  if (!auth.permissions.canRead) {
    return res.status(403).json({ error: 'Insufficient permissions' })
  }

  try {
    const period = parseInt(req.query.period) || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - period)

    // Overview statistics
    const totalEventsResult = await dbOneOrNone(`
      SELECT COUNT(*)::int as total FROM events
    `)

    const activeEventsResult = await dbOneOrNone(`
      SELECT COUNT(*)::int as total FROM events 
      WHERE status IN ('active', 'published')
    `)

    const bookingsResult = await dbOneOrNone(`
      SELECT COUNT(*)::int as total 
      FROM bookings 
      WHERE booked_at >= $1 AND status = 'confirmed'
    `, [startDate])

    const revenueResult = await dbOneOrNone(`
      SELECT COALESCE(SUM(total_amount), 0)::numeric as total 
      FROM bookings 
      WHERE booked_at >= $1 AND status = 'confirmed'
    `, [startDate])

    const newUsersResult = await dbOneOrNone(`
      SELECT COUNT(*)::int as total 
      FROM users 
      WHERE created_at >= $1
    `, [startDate])

    // Calculate booking rate (average per event)
    const eventsInPeriod = await dbOneOrNone(`
      SELECT COUNT(*)::int as total 
      FROM events 
      WHERE created_at >= $1
    `, [startDate])

    const registrationRate = eventsInPeriod?.total > 0
      ? ((bookingsResult?.total || 0) / eventsInPeriod.total)
      : 0

    // Events by status
    const eventsByStatus = await dbAny(`
      SELECT 
        status,
        COUNT(*)::int as count,
        ROUND((COUNT(*)::numeric / NULLIF((SELECT COUNT(*) FROM events), 0)) * 100, 2) as percentage
      FROM events
      GROUP BY status
      ORDER BY count DESC
    `)

    // Top events by bookings
    const topEvents = await dbAny(`
      SELECT 
        e.id,
        e.name as title,
        e.status,
        e.max_tickets as capacity,
        COUNT(b.id) FILTER (WHERE b.status = 'confirmed')::int as registration_count
      FROM events e
      LEFT JOIN bookings b ON b.event_id = e.id
      GROUP BY e.id, e.name, e.status, e.max_tickets
      ORDER BY registration_count DESC
      LIMIT 10
    `)

    // Department stats
    const departmentStats = await dbAny(`
      SELECT 
        d.id as department_id,
        d.name as department_name,
        COUNT(e.id)::int as event_count
      FROM departments d
      LEFT JOIN events e ON e.department_id = d.id
      GROUP BY d.id, d.name
      ORDER BY event_count DESC
      LIMIT 10
    `)

    // Booking trend (daily counts for the period)
    const registrationTrend = await dbAny(`
      SELECT 
        DATE(booked_at) as date,
        COUNT(*)::int as count
      FROM bookings
      WHERE booked_at >= $1 AND status = 'confirmed'
      GROUP BY DATE(booked_at)
      ORDER BY date
    `, [startDate])

    return res.status(200).json({
      overview: {
        totalEvents: totalEventsResult?.total || 0,
        activeEvents: activeEventsResult?.total || 0,
        totalRegistrations: bookingsResult?.total || 0,
        totalRevenue: parseFloat(revenueResult?.total) || 0,
        newUsers: newUsersResult?.total || 0,
        registrationRate
      },
      eventsByStatus,
      eventsByCategory: [], // No categories table in schema
      topEvents,
      departmentStats,
      registrationTrend
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return res.status(500).json({ error: 'Failed to fetch analytics' })
  }
}