# Pigorithm Frontend

Web dashboard for the Pigorithm livestock-monitoring platform. Built with
Next.js (App Router), TypeScript and Tailwind CSS, from the Claude Design file
`Pigorithm.dc.html`. It talks to the NestJS API in `../pigorithm_backend`.

## Requirements

- Node.js 22 LTS
- A running Pigorithm API (local or deployed) whose `CORS_ORIGINS` includes
  this app's origin

## Configuration

| Variable | Example | Notes |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000/api/v1` | **Required.** The API's versioned root. Public: it is inlined into the browser bundle at build time, so set it before `next build` and never put secrets in it. A missing or invalid value fails with a clear configuration error; there is no fallback URL. |

Copy `.env.example` to `.env.local` for local development. For the deployed
app, set `NEXT_PUBLIC_API_URL=https://pigorithm.onrender.com/api/v1` in the
host's build environment. `.env*` files other than `.env.example` are
gitignored.

The backend must allow this app's origin: locally
`CORS_ORIGINS=http://localhost:3001`, and on Render the deployed frontend's
origin once it exists.

## Commands

```bash
npm install
npm run dev         # http://localhost:3001 (the API uses 3000)
npm run typecheck
npm run lint
npm test            # Vitest unit and component tests
npm run build && npm start
```

## Authentication

The app uses the backend's existing JWT flow (`/auth/login`, `/auth/refresh`,
`/auth/logout`): a 15-minute access token and a 7-day refresh token that the
backend rotates on every refresh.

- The **refresh token** never reaches browser JavaScript. Small route handlers
  in `src/app/api/auth/{login,refresh,logout}` call the backend server-side and
  keep it in an `httpOnly`, `SameSite=Strict` cookie scoped to `/api/auth`
  (`Secure` in production). They reject cross-origin POSTs.
- The **access token** is held in memory only (`src/lib/auth/session.ts`) and
  sent as `Authorization: Bearer` directly to the API. After a reload it is
  restored through `/api/auth/refresh`. Refreshes are de-duplicated, and
  serialised across tabs with the Web Locks API, because a refresh token works
  only once.
- A non-secret `pigorithm_session=1` cookie lets `src/proxy.ts` send signed-out
  visitors to `/login` before protected pages render. The backend still
  authorises every request.
- On a 401 the API client refreshes once and retries. If that fails, the user
  is signed out and returned to login with a "session ended" note.

Trade-offs: the auth routes need the Next.js server (no static export), and
the backend records the frontend server's IP address for login and refresh
sessions (the browser's User-Agent is forwarded).

Onboarding uses separate existing endpoints: `POST /auth/register` (creates
the user only), then sign-in, then `POST /farms`, which makes the creator the
farm's ACTIVE OWNER in one transaction. Users without a farm are sent to
`/onboarding`; users with one go to the dashboard.

## Structure

```
src/
  proxy.ts                 redirects signed-out visitors away from app pages
  app/
    (auth)/login, register sign-in and step 1 of onboarding
    onboarding/            step 2: create the first farm
    (app)/                 the guarded app (sidebar + top bar shell)
    api/auth/*             login / refresh / logout route handlers
  components/              views per page, layout, auth forms, shared UI
  lib/
    api/config.ts          the only place the API base URL is read
    api/client.ts          fetch wrapper: JSON, bearer auth, errors, 401 retry
    api/endpoints.ts       typed endpoint wrappers; api/types.ts mirrors the DTOs
    auth/                  session store, AuthProvider, routing rules
```

## Data shown

Pages use only what the API provides: pigs, collars, gateways, the user's farms
and memberships. Data the API doesn't expose yet (telemetry readings, health
status, alerts, medical cases, analytics, settings, member names) is shown as
"—" or an explicit "not available yet" state, never as sample values.
