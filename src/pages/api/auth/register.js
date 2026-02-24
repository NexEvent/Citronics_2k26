import bcrypt from 'bcryptjs'
import { dbOneOrNone, dbTx } from 'src/lib/database'

/**
 * Generate a unique 9-char referral code: CIT-XXXXX
 */
function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'CIT-'
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return code
}

async function getUniqueReferralCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateReferralCode()
    const exists = await dbOneOrNone('SELECT 1 FROM students WHERE referral_code = $1', [code])
    if (!exists) return code
  }

  return 'CIT-' + Date.now().toString(36).slice(-5).toUpperCase()
}

/**
 * POST /api/auth/register
 *
 * Registers a new student account with auto-generated referral code.
 * Creates a row in `users` (role = 'student') and a row in `students`.
 *
 * Body: { name, email, phone, password, studentId?, college, city, referralCode? }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name, email, phone, password, studentId, college, city, referralCode } = req.body

    // ── Validation ──────────────────────────────────────────────────────────
    if (!name?.trim()) return res.status(400).json({ error: 'Name is required' })
    if (!email?.trim()) return res.status(400).json({ error: 'Email is required' })
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })
    if (!college?.trim()) return res.status(400).json({ error: 'College name is required' })
    if (!city?.trim()) return res.status(400).json({ error: 'City is required' })

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) return res.status(400).json({ error: 'Invalid email format' })

    if (phone && !/^\+?[\d\s-]{7,20}$/.test(phone)) {
      return res.status(400).json({ error: 'Invalid phone number' })
    }

    // ── Check duplicates ────────────────────────────────────────────────────
    const existingEmail = await dbOneOrNone(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    )
    if (existingEmail) return res.status(409).json({ error: 'An account with this email already exists' })

    if (phone?.trim()) {
      const existingPhone = await dbOneOrNone(
        'SELECT id FROM users WHERE phone = $1',
        [phone.trim()]
      )
      if (existingPhone) return res.status(409).json({ error: 'An account with this phone number already exists' })
    }

    if (studentId?.trim()) {
      const existingSid = await dbOneOrNone(
        'SELECT user_id FROM students WHERE student_id = $1',
        [studentId.trim()]
      )
      if (existingSid) return res.status(409).json({ error: 'This student ID is already registered' })
    }

    // ── Resolve referral ────────────────────────────────────────────────────
    let referredByUserId = null
    if (referralCode?.trim()) {
      // referralCode can be: CIT-XXXXX code, email, or student_id
      const referrer = await dbOneOrNone(
        `SELECT s.user_id
         FROM   students s
         JOIN   users u ON u.id = s.user_id
         WHERE  s.referral_code = $1 OR s.student_id = $1 OR LOWER(u.email) = LOWER($1)`,
        [referralCode.trim()]
      )
      if (!referrer) return res.status(400).json({ error: 'Invalid referral code' })
      referredByUserId = referrer.user_id
    }

    // ── Hash password ───────────────────────────────────────────────────────
    const passwordHash = await bcrypt.hash(password, 12)

    // ── Generate unique referral code ───────────────────────────────────────
    const myReferralCode = await getUniqueReferralCode()

    // ── Insert in transaction ───────────────────────────────────────────────
    const result = await dbTx(async t => {
      const user = await t.one(
        `INSERT INTO users (name, email, phone, password_hash, role, verified)
         VALUES ($1, $2, $3, $4, 'student', false)
         RETURNING id, name, email, role`,
        [name.trim(), email.trim().toLowerCase(), phone?.trim() || null, passwordHash]
      )

      await t.none(
        `INSERT INTO students (user_id, student_id, college, city, referred_by, referral_code)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [user.id, studentId?.trim() || null, college.trim(), city.trim(), referredByUserId, myReferralCode]
      )

      return { ...user, referralCode: myReferralCode }
    })

    return res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
        referralCode: result.referralCode
      }
    })
  } catch (err) {
    console.error('Registration error:', err)

    return res.status(500).json({ error: 'Something went wrong. Please try again.' })
  }
}
