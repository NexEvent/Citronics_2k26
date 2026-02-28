import checkoutService from 'src/services/checkout-service'

/**
 * POST /api/checkout/verify
 *
 * Verifies an existing user's identity by phone + password.
 * Only returns userId after a successful bcrypt password match.
 * Used when a returning user is detected via phone lookup.
 *
 * Security: Returns the same generic error whether phone is missing
 * or password is wrong — prevents phone enumeration.
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  try {
    const { phone, password } = req.body

    if (!phone || typeof phone !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ success: false, message: 'phone and password are required' })
    }

    const clean = phone.trim().replace(/[\s\-+()]/g, '').slice(-10)
    if (!/^\d{10}$/.test(clean)) {
      return res.status(400).json({ success: false, message: 'Invalid phone number' })
    }

    if (password.length < 1) {
      return res.status(400).json({ success: false, message: 'Password is required' })
    }

    const result = await checkoutService.verifyUserByPhone(clean, password)

    if (!result) {
      // Generic message — don't reveal whether phone or password was wrong
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' })
    }

    return res.status(200).json({ success: true, data: { userId: result.userId } })
  } catch (error) {
    console.error('[POST /api/checkout/verify]', error)
    return res.status(500).json({ success: false, message: 'Internal server error' })
  }
}
