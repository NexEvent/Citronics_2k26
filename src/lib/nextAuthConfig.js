import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { dbOneOrNone, dbTx } from 'src/lib/database'

/**
 * Generate a unique 8-char alphanumeric referral code: CITRO-XXXXX → e.g. "CIT-A3K9Z"
 */
function generateReferralCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I/O/0/1 to avoid confusion

  let code = 'CIT-'
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return code
}

/**
 * Get a unique referral code (retries if collision)
 */
async function getUniqueReferralCode() {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateReferralCode()
    const exists = await dbOneOrNone('SELECT 1 FROM students WHERE referral_code = $1', [code])
    if (!exists) return code
  }
  // Fallback — extremely unlikely
  return 'CIT-' + Date.now().toString(36).slice(-5).toUpperCase()
}

/**
 * NextAuth Configuration — Citronics
 *
 * Providers: Credentials + Google OAuth
 * Roles: admin | organizer | student
 * Students carry their `userId` for CASL field-level checks.
 */
const nextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),

    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentials

          // Fetch user from new schema
          const user = await dbOneOrNone(
            `SELECT id, name, email, phone, password_hash, role, verified
             FROM   users
             WHERE  LOWER(email) = LOWER($1)`,
            [email]
          )

          if (!user) throw new Error('Invalid email or password')
          if (!user.password_hash) throw new Error('This account uses Google sign-in. Please use the Google button.')

          // bcrypt comparison
          const valid = await bcrypt.compare(password, user.password_hash)
          if (!valid) throw new Error('Invalid email or password')

          // For students — fetch student details
          let studentInfo = null
          if (user.role === 'student') {
            studentInfo = await dbOneOrNone(
              `SELECT student_id, college, city, referral_code FROM students WHERE user_id = $1`,
              [user.id]
            )
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            verified: user.verified,
            college: studentInfo?.college || null,
            city: studentInfo?.city || null,
            referralCode: studentInfo?.referral_code || null
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw new Error(error.message || 'Authentication failed')
        }
      }
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 hours
  },

  callbacks: {
    /**
     * signIn callback — handles Google OAuth user creation
     */
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          const existing = await dbOneOrNone(
            'SELECT id, role, verified FROM users WHERE LOWER(email) = LOWER($1)',
            [user.email]
          )

          if (existing) {
            // Existing user → mark verified (Google = verified email)
            if (!existing.verified) {
              await dbOneOrNone('UPDATE users SET verified = true WHERE id = $1 RETURNING id', [existing.id])
            }
            user.id = existing.id
            user.role = existing.role
            user.verified = true
          } else {
            // New user → auto-create student account
            const referralCode = await getUniqueReferralCode()

            const result = await dbTx(async t => {
              const newUser = await t.one(
                `INSERT INTO users (name, email, password_hash, role, verified)
                 VALUES ($1, $2, NULL, 'student', true)
                 RETURNING id, name, email, role`,
                [user.name || user.email.split('@')[0], user.email.toLowerCase()]
              )

              await t.none(
                `INSERT INTO students (user_id, college, city, referral_code)
                 VALUES ($1, $2, $3, $4)`,
                [newUser.id, 'Not specified', 'Not specified', referralCode]
              )

              return newUser
            })

            user.id = result.id
            user.role = result.role
            user.verified = true
          }

          return true
        } catch (err) {
          console.error('Google signIn error:', err)

          return false
        }
      }

      return true
    },

    async jwt({ token, user, account }) {
      // Initial sign-in
      if (user) {
        if (account?.provider === 'google') {
          // Fetch full profile from DB for Google users
          const dbUser = await dbOneOrNone(
            `SELECT u.id, u.name, u.email, u.phone, u.role, u.verified,
                    s.college, s.city, s.referral_code
             FROM users u
             LEFT JOIN students s ON s.user_id = u.id
             WHERE u.id = $1`,
            [user.id]
          )

          if (dbUser) {
            token.id = dbUser.id
            token.name = dbUser.name
            token.email = dbUser.email
            token.phone = dbUser.phone || null
            token.role = dbUser.role
            token.verified = dbUser.verified
            token.college = dbUser.college || null
            token.city = dbUser.city || null
            token.referralCode = dbUser.referral_code || null
          }
        } else {
          // Credentials login
          token.id = user.id
          token.name = user.name
          token.email = user.email
          token.phone = user.phone
          token.role = user.role
          token.verified = user.verified
          token.college = user.college
          token.city = user.city
          token.referralCode = user.referralCode
        }
      }

      return token
    },

    async session({ session, token }) {
      session.user.id = token.id
      session.user.name = token.name
      session.user.email = token.email
      session.user.phone = token.phone
      session.user.role = token.role
      session.user.verified = token.verified
      session.user.college = token.college
      session.user.city = token.city
      session.user.referralCode = token.referralCode

      return session
    }
  },

  pages: {
    signIn: '/login',
    error: '/login'
  }
}

export default nextAuthConfig
