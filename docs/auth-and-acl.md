# Auth & ACL

---

## How Auth Works

We use **NextAuth v4** with a Credentials provider (email + password) backed by our PostgreSQL `users` table.

```
Browser → _app.js (SessionProvider)
                ↓
          AuthGuard / GuestGuard   ← protect routes client-side
                ↓
          API routes → getServerSession()    ← protect routes server-side
```

---

## Configuration

```js
// src/lib/nextAuthConfig.js
import CredentialsProvider from 'next-auth/providers/credentials'
import { verifyUser } from 'src/services/auth-service'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        const user = await verifyUser(credentials.email, credentials.password)
        return user ?? null   // null = deny
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      // On sign-in, copy user fields into the token
      if (user) {
        token.id   = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      // Expose to client
      session.user.id   = token.id
      session.user.role = token.role
      return session
    }
  },

  pages: {
    signIn: '/login',
    error:  '/login'
  },

  session: { strategy: 'jwt' },
  secret:  process.env.NEXTAUTH_SECRET
}
```

---

## Session Shape

After sign-in, `useSession()` / `getServerSession()` returns:

```json
{
  "user": {
    "id":    42,
    "name":  "Bhavya",
    "email": "bhavya@eventhub.com",
    "role":  "admin"
  },
  "expires": "2026-03-22T..."
}
```

---

## Roles

| Role | Who |
|------|-----|
| `admin` | Full access — manage everything |
| `organizer` | Create/edit their own events, manage tickets |
| `staff` | Check-in attendees, view reports |
| `attendee` | Browse events, buy tickets, view own registrations |

---

## CASL Permissions (ACL)

We use **CASL** to check what a user can do on a subject.

### Ability Builder

```js
// src/configs/acl.js
import { AbilityBuilder, createMongoAbility } from '@casl/ability'

const defineAbilityFor = (role) => {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility)

  if (role === 'admin') {
    can('manage', 'all')   // shorthand: full access
  }

  if (role === 'organizer') {
    can(['read', 'create', 'update'], 'Event')
    can(['read', 'create', 'update'], 'Ticket')
    can('read', 'Registration')
    can('read', 'Analytics')
    cannot('delete', 'Event')      // organizers can't hard-delete
  }

  if (role === 'staff') {
    can('read',    'Event')
    can('read',    'Registration')
    can('update',  'Registration')  // for check-in
    can('read',    'Ticket')
  }

  if (role === 'attendee') {
    can('read',   'Event')
    can('create', 'Registration')
    can('read',   'Registration', { attendee_id: context => context.userId })
  }

  return build()
}

// Default when user isn't loaded yet
export const defaultACLObj = { action: 'read', subject: 'Dashboard' }

export const buildAbilityFor = (role) => defineAbilityFor(role)
```

### Checking Permissions in Components

```js
import { useContext } from 'react'
import { AbilityContext } from 'src/layouts/components/acl/Can'

const MyComponent = () => {
  const ability = useContext(AbilityContext)

  return (
    <>
      {ability.can('create', 'Event') && (
        <Button>Create Event</Button>
      )}
    </>
  )
}
```

Or use the `<Can>` component:

```js
import { Can } from 'src/layouts/components/acl/Can'

<Can I="create" a="Event">
  <Button>Create Event</Button>
</Can>
```

### Setting ACL on a Page

Every page can declare its required permission. `AclGuard` reads this and redirects to 401 if the user can't access it.

```js
// src/pages/events/create.js
const CreateEventPage = () => { /* ... */ }

CreateEventPage.acl = {
  action:  'create',
  subject: 'Event'
}

export default CreateEventPage
```

---

## Guard Components

| Component | What it does |
|-----------|-------------|
| `AuthGuard` | Redirects to `/login` if no session |
| `GuestGuard` | Redirects to `/dashboard` if already logged in (for login page) |
| `AclGuard` | Shows 401 if user lacks the page's declared permission |

Usage is automatic via `_app.js`:

```js
const authGuard  = Component.authGuard  ?? true
const guestGuard = Component.guestGuard ?? false
const aclAbilities = Component.acl      ?? defaultACLObj
```

To make a page **public** (no login required):

```js
MyPage.authGuard  = false
MyPage.guestGuard = false
```

---

## Protecting API Routes

Always check the session server-side — client-side guards alone are not enough.

```js
import { getServerSession } from 'next-auth/next'
import { authOptions } from 'src/lib/nextAuthConfig'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session)                return res.status(401).json({ message: 'Unauthorized' })
  if (session.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden' })
  // ...
}
```

---

## Environment Variables Required

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-long-random-secret
```
