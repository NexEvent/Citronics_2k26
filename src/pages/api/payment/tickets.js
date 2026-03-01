import paymentService from 'src/services/payment-service'

/**
 * GET /api/payment/tickets?userId=xxx
 *
 * Fetch all tickets for a user. Used in the dashboard/post-payment view.
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { userId } = req.query

    if (!userId || isNaN(parseInt(userId, 10))) {
      return res.status(400).json({ success: false, message: 'Valid userId query param is required' })
    }

    const tickets = await paymentService.getUserTickets(parseInt(userId, 10))

    return res.status(200).json({ success: true, data: { tickets } })
  } catch (error) {
    console.error('[GET /api/payment/tickets]', error)
    return res.status(500).json({ success: false, message: 'Failed to fetch tickets' })
  }
}
