# File Structure

> Every folder has a job. Don't put files in the wrong place.

---

## Root

```
template/
├── docs/               ← You are here (developer docs)
├── public/             ← Static assets served as-is
│   ├── locales/en/     ← i18n string files, one JSON per domain
│   ├── images/         ← Static images (logos, icons, placeholders)
│   ├── manifest.json   ← PWA manifest
│   ├── sw.js           ← Service worker (written by hand, not generated)
│   └── offline.html    ← Standalone offline fallback page
├── src/                ← All application code
├── styles/             ← Global CSS (minimal — prefer MUI sx prop)
├── schema.sql          ← PostgreSQL DDL — the canonical DB schema
├── next.config.js      ← Next.js config (headers, images, webpack)
├── package.json
└── .env.example        ← Copy to .env.local, never commit .env.local
```

---

## `src/` — Application Code

```
src/
├── @core/              ← Reusable, domain-agnostic building blocks
│   ├── components/     ← Generic UI components (icon, spinner, scroll-to-top…)
│   ├── context/        ← App-wide React contexts (settings/theme)
│   ├── hooks/          ← Generic reusable hooks (useBgColor, useSettings)
│   ├── layouts/        ← Shell layout (AppBar + Sidebar + Main content)
│   ├── styles/         ← MUI style overrides, scrollbar styles
│   ├── theme/          ← MUI theme: palette, typography, breakpoints, overrides
│   └── utils/          ← Pure utilities (emotion cache, hex-to-rgba…)
│
├── components/         ← App-specific shared components (used across pages)
│   ├── FileUpload/     ← Drag-and-drop file upload dialog
│   └── PWAPrompts/     ← Install prompt + update notification
│
├── configs/
│   ├── acl.js          ← CASL ability builder + default ACL object
│   ├── auth.js         ← NextAuth provider options
│   ├── i18n.js         ← i18next init (static English resources)
│   └── themeConfig.js  ← App-wide constants (name, nav sizes, formats…)
│
├── context/
│   └── AuthContext.js  ← Thin wrapper that exposes session to older code
│
├── hooks/
│   └── useAuth.js      ← Convenience hook: returns { user, session, signOut }
│
├── layouts/
│   ├── UserLayout.js           ← Default layout used by authenticated pages
│   └── components/acl/Can.js   ← CASL <Can> component + AbilityContext
│
├── lib/
│   └── nextAuthConfig.js  ← NextAuth callbacks, JWT, session config
│
├── pages/              ← Next.js file-system routing
│   ├── _app.js         ← App bootstrap (providers, guards, NProgress)
│   ├── _document.js    ← HTML shell (manifest link, PWA meta tags)
│   ├── index.js        ← Redirects / to /dashboard
│   ├── 401.js / 404.js / 500.js
│   ├── login/
│   ├── dashboard/
│   ├── events/         ← index, [id], create, [id]/edit
│   ├── tickets/
│   ├── speakers/
│   ├── venues/
│   ├── registrations/
│   ├── schedule/
│   ├── analytics/
│   ├── settings/
│   └── api/            ← Next.js API routes (see api-conventions.md)
│       ├── auth/
│       ├── events/
│       ├── tickets/
│       ├── speakers/
│       ├── venues/
│       ├── registrations/
│       └── uploads/
│
├── services/           ← All database access (pg-promise). No DB calls elsewhere.
│   ├── dbConnection.js         ← Singleton pg-promise instance
│   ├── dashboard-service.js
│   ├── events-service.js
│   ├── tickets-service.js
│   ├── speakers-service.js
│   ├── venues-service.js
│   └── registrations-service.js
│
├── store/
│   ├── index.js        ← configureStore
│   └── slices/         ← One file per domain
│       ├── dashboardSlice.js
│       ├── eventsSlice.js
│       ├── ticketsSlice.js
│       ├── speakersSlice.js
│       ├── venuesSlice.js
│       ├── registrationsSlice.js
│       └── analyticsSlice.js
│
└── views/              ← Page-level UI. Each page/ file imports from here.
    ├── dashboard/
    ├── events/
    ├── tickets/
    ├── speakers/
    ├── venues/
    ├── registrations/
    ├── schedule/
    └── analytics/
```

---

## Naming Rules

| Thing | Convention | Example |
|-------|-----------|---------|
| React component file | PascalCase | `EventCard.js` |
| Hook file | camelCase, prefixed `use` | `useEventFilters.js` |
| Service file | kebab-case, suffixed `-service` | `events-service.js` |
| Redux slice | camelCase, suffixed `Slice` | `eventsSlice.js` |
| API route folder | kebab-case, plural nouns | `pages/api/events/` |
| Utility function | camelCase | `formatEventDate.js` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_TICKET_QTY` |

---

## Where Does New Code Go?

| Scenario | Location |
|----------|----------|
| New page | `src/pages/<domain>/` + matching view in `src/views/<domain>/` |
| New API endpoint | `src/pages/api/<domain>/` + matched service function |
| New DB query | `src/services/<domain>-service.js` |
| New Redux state | `src/store/slices/<domain>Slice.js` |
| New reusable UI component | `src/components/` (app) or `src/@core/components/` (generic) |
| New reusable hook | `src/hooks/` (app) or `src/@core/hooks/` (generic) |

---

> **Rule:** If you're not sure where something goes, ask: *"Is this generic or domain-specific?"*  
> Generic → `@core/`. Domain-specific → the feature folder.
