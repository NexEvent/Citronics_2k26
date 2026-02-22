# EventHub — Developer Documentation

> This folder is the **single source of truth** for how this project is built.  
> Before writing any code, read the relevant doc.

---

## Index

| Doc | What it covers |
|-----|----------------|
| [file-structure.md](./file-structure.md) | Full folder layout and the *why* behind each folder |
| [database.md](./database.md) | DB connection setup, query writing rules, pg-promise patterns |
| [api-conventions.md](./api-conventions.md) | How to write Next.js API routes, handlers, errors |
| [components.md](./components.md) | Component writing rules, naming, props, file placement |
| [state-management.md](./state-management.md) | Redux Toolkit slices, thunks, selectors |
| [auth-and-acl.md](./auth-and-acl.md) | NextAuth session, CASL permissions, guard components |
| [pwa.md](./pwa.md) | Service worker, Web App Manifest, offline strategy |

---

## Quick Rules (TL;DR)

1. **One feature, one slice** — each domain (events, tickets, venues…) owns its Redux slice, API route folder, service file, and view folder.
2. **All DB access goes through `services/`** — no raw `db` calls inside pages or components.
3. **API routes validate first** — every handler checks input with Zod before touching the DB.
4. **Components are dumb by default** — business logic lives in views or hooks, not in `@core` components.
5. **Name things after what they do** — `useEventFilters.js` is better than `useFilters.js`.
6. **No magic numbers** — use constants from `src/configs/` or the Redux slice itself.

---

## Stack at a Glance

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (Pages Router) |
| UI | MUI v6 + Emotion |
| State | Redux Toolkit |
| Auth | NextAuth v4 |
| Permissions | CASL |
| Database | PostgreSQL via pg-promise |
| Form validation | React Hook Form + Zod |
| PWA | Custom Service Worker |
| Localization | react-i18next (English) |
| Charts | Recharts / ApexCharts |
| Calendar | FullCalendar |
