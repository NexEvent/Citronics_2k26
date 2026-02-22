import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { dbOneOrNone } from 'src/lib/database'

/**
 * NextAuth Configuration — Citronics
 *
 * Roles: Owner | Admin | Head | Student
 * Head users carry `eventIds` (assigned event IDs) in the JWT.
 * Student users carry their `userId` for CASL field-level checks.
 */
const nextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentials

          // Fetch user — include password_hash and role
          const user = await dbOneOrNone(
            `SELECT id, email, password_hash, first_name, last_name, role, status
             FROM   users
             WHERE  LOWER(email) = LOWER($1)`,
            [email]
          )

          if (!user) throw new Error('Invalid email or password')

          if (user.status !== 'active') throw new Error('Account is not active. Contact support.')

          // bcrypt comparison against hashed password
          const valid = await bcrypt.compare(password, user.password_hash)
          if (!valid) throw new Error('Invalid email or password')

          // For Head: fetch assigned event IDs so CASL can scope their access
          let eventIds = []
          if (user.role === 'Head') {
            const rows = await dbOneOrNone(
              `SELECT COALESCE(array_agg(event_id), '{}') AS event_ids
               FROM   event_heads
               WHERE  user_id = $1`,
              [user.id]
            )
            eventIds = rows?.event_ids ?? []
          }

          return {
            id:        user.id,
            email:     user.email,
            firstName: user.first_name,
            lastName:  user.last_name,
            role:      user.role,
            eventIds,             // populated for Head, [] for others
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
    async jwt({ token, user }) {
      if (user) {
        token.id        = user.id
        token.email     = user.email
        token.firstName = user.firstName
        token.lastName  = user.lastName
        token.role      = user.role
        token.eventIds  = user.eventIds  // Head: assigned event IDs; others: []
      }
      return token
    },

    async session({ session, token }) {
      session.user.id        = token.id
      session.user.email     = token.email
      session.user.firstName = token.firstName
      session.user.lastName  = token.lastName
      session.user.role      = token.role
      session.user.eventIds  = token.eventIds ?? []
      return session
    }
  },

  pages: {
    signIn: '/login',
    error: '/login'
  }
}

export default nextAuthConfig
