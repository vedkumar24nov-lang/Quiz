# PrepLab — Project Conventions

> Read this first. Companion docs: [REQUIREMENTS.md](REQUIREMENTS.md) · [PERSONAS_AND_CAPABILITIES.md](PERSONAS_AND_CAPABILITIES.md) · [USER_JOURNEYS.md](USER_JOURNEYS.md) · [ROADMAP.md](ROADMAP.md)

---

## What this project is

A JEE prep quiz app for Indian Class 11 + 12 students. Three subjects (Physics, Chemistry, Mathematics). Adaptive difficulty driven by per-topic mastery scores. Detailed post-quiz reports with skip-reason analytics.

The product hypothesis: students don't just need more questions — they need to know *what kind* of thinking each question demands and *where* their thinking breaks down.

---

## Tech stack (locked)

### Frontend (`frontend/`)
- **React 18** with TypeScript (strict)
- **Vite 6** (dev server, build, HMR)
- **Tailwind CSS 3** (utility-first styling, mobile-first)
- **React Router 6** (SPA routing)
- **Zustand** (lightweight global state)
- **lucide-react** (icons)

### Backend (`backend/`)
- **Node.js 22+**
- **Express** (HTTP server)
- **TypeScript** (strict)
- **Drizzle ORM** (type-safe queries — works against SQLite, Postgres, MySQL via the same API)
- **@libsql/client** (pure-JS SQLite — no native compile, runs against a local file or remote Turso)
- **tsx** (dev runner)

### Why these choices
- **React + Vite + Tailwind**: industry standard, fast feedback loop, minimal config, great mobile-first ergonomics. Latest stable versions.
- **SQLite via libsql + Drizzle**: zero-config local dev, **swappable** — change `db/client.ts` and the same repository code talks to Postgres or Turso later. No native build step (avoids Windows `node-gyp` pain).
- **Repository pattern**: services and routes never touch Drizzle directly. They depend on `IUserRepository`, `IQuestionRepository`, etc. Swapping the DB means writing a new concrete repository — no service or route changes.

---

## Folder structure

```
Quiz/
├── CLAUDE.md                       ← this file
├── REQUIREMENTS.md                 ← product spec
├── PERSONAS_AND_CAPABILITIES.md    ← user personas + permissions
├── USER_JOURNEYS.md                ← end-to-end flows
├── ROADMAP.md                      ← stage-by-stage build plan + progress log
├── memory/                         ← Claude memory (don't edit by hand)
│
├── frontend/                       ← React + Vite + Tailwind SPA
│   ├── package.json
│   ├── vite.config.ts              ← proxies /api → backend during dev
│   ├── tsconfig*.json
│   ├── tailwind.config.js
│   ├── index.html
│   ├── .env.example
│   └── src/
│       ├── App.tsx                 ← router + layout shell
│       ├── main.tsx                ← entry
│       ├── pages/                  ← top-level routed pages
│       ├── components/             ← reusable UI (ui/, layout/, auth/, quiz/, report/)
│       ├── store/                  ← Zustand stores (auth, quiz session, active subject)
│       ├── data/                   ← static dummy data (subjects, questions, attempts, mastery)
│       ├── lib/                    ← cn(), api fetch wrapper
│       └── types/                  ← shared TS types
│
└── backend/                        ← Express + SQLite (Drizzle)
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    ├── data/                       ← preplab.db (gitignored)
    └── src/
        ├── index.ts                ← Express entrypoint, bootstraps + listens
        ├── config.ts               ← env vars
        ├── db/
        │   ├── client.ts           ← Drizzle client (the ONLY DB-specific file)
        │   ├── schema.ts           ← Drizzle table definitions
        │   └── seed.ts             ← seeds dummy users
        ├── domain/
        │   └── types.ts            ← User, AuthenticatedSession, etc. (DB-agnostic)
        ├── repositories/
        │   ├── IUserRepository.ts  ← interface — services depend on THIS
        │   ├── sqlite/             ← concrete implementations
        │   └── index.ts            ← composition root (picks impl by config.dbDriver)
        ├── services/               ← business logic (uses repositories)
        ├── middleware/             ← auth (X-User-Id header), error handling
        └── routes/                 ← Express route handlers (thin — delegate to services)
```

---

## How to run (dev)

You'll need **two terminals**:

### Terminal 1 — backend
```bash
cd backend
npm install              # first time only
npm run seed             # first time only — creates SQLite + dummy users
npm run dev              # starts Express on http://localhost:4000
```

### Terminal 2 — frontend
```bash
cd frontend
npm install              # first time only
npm run dev              # starts Vite on http://localhost:5173
```

Open **http://localhost:5173/** — sign-in page lists every seeded user; click one to log in.

### Backend scripts
| Script | What it does |
|---|---|
| `npm run dev` | Starts backend with auto-reload (`tsx watch`) |
| `npm run build` | Compiles to `dist/` |
| `npm run start` | Runs the compiled build |
| `npm run seed` | Idempotent — seeds dummy users if DB is empty |
| `npm run reset` | **Destructive** — deletes the DB file and re-seeds |

### Frontend scripts
| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server with HMR |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Serves the production build locally |

---

## Architecture rules (don't break these)

### 1. Repositories are the wrapper layer
Services and routes **must not** import Drizzle, libsql, or any DB-specific type. They use the `IFooRepository` interface from `@/repositories`. The composition root in `repositories/index.ts` picks the concrete implementation based on `config.dbDriver`.

To add Postgres later:
1. Add `repositories/postgres/PostgresUserRepository.ts` implementing `IUserRepository`
2. Add a branch in `repositories/index.ts` for `case 'postgres'`
3. Update `db/client.ts` to use `drizzle-orm/node-postgres` for the postgres driver
4. **Zero service or route changes**

### 2. Domain types are DB-agnostic
The shape of `User`, `Attempt`, `Question`, etc. lives in `backend/src/domain/types.ts`. Drizzle's `$inferSelect` types stay inside repositories — they get mapped to domain types before crossing the boundary.

### 3. Frontend talks to backend only via `/api/*`
The `lib/api.ts` wrapper handles all fetches. It sends `X-User-Id` automatically. No component should `fetch()` directly.

### 4. Vite proxy in dev, same-origin in prod
Dev: Vite proxies `/api/*` to `http://localhost:4000` (config in `vite.config.ts`).
Prod (eventually): backend serves the built frontend OR they share an origin via reverse proxy. Frontend code uses `/api/*` paths either way — no env var per environment.

### 5. Auth is dev-grade for now
v1 = one-click login by userId. The "token" is the user ID, sent as `X-User-Id`. **Not production auth** — clearly marked in the code. Real auth (Google OAuth or password + JWT) lands in a later stage. The `AuthenticatedSession` shape stays the same so the swap is backward-compatible.

### 6. No comments unless the WHY is non-obvious
Code self-documents via good names. Comments only for:
- A hidden constraint or invariant
- A workaround for a specific bug or platform issue
- Behavior that would surprise a reader (e.g. "stopwatch pauses on skip overlay per spec §5.6.1")

Don't write what the code does. Don't reference the current task or callers — that belongs in commits/PRs.

### 7. Mobile-first
Karthik (P9 from PERSONAS) is phone-only with 10–15 min sessions. Test on a 5-inch screen. Bottom nav appears below `md` breakpoint.

---

## Frontend conventions

- **Path alias `@/`** maps to `frontend/src/` (set in `vite.config.ts` + `tsconfig.app.json`)
- **Styling**: Tailwind utilities only. Brand colors in `tailwind.config.js` under `theme.extend.colors.brand` and mastery band colors under `colors.mastery`. Use `cn()` from `@/lib/cn` to compose class names.
- **State**: Zustand stores live in `src/store/`. Use selectors (`useAuthUser`) instead of grabbing the whole store object.
- **Routing**: All routes in `App.tsx`. Protect authed routes with `<ProtectedRoute>`.
- **Icons**: `lucide-react` only. Don't add another icon library.

## Backend conventions

- **Path alias `@/`** maps to `backend/src/`
- **Async**: `async/await` throughout. No callbacks. No `.then()`.
- **Errors**: throw with optional `(err as any).status = 4xx` — the centralized handler in `index.ts` formats the response.
- **Env**: read via `config.ts` — never `process.env.X` directly elsewhere.
- **No business logic in routes**: routes are 5-line thin wrappers around services. If you write a `for` loop in a route, move it to a service.

---

## Default ports

| Service | URL |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| Backend (Express) | http://localhost:4000 |
| Backend health | http://localhost:4000/api/health |

---

## When you're stuck

1. **Backend not responding?** Check the seed ran (`backend/data/preplab.db` exists). Run `npm run seed` from `backend/`.
2. **CORS error in browser?** Make sure backend `.env` has `CORS_ORIGIN=http://localhost:5173`. Restart backend after edits.
3. **`/api/*` returns Vite's HTML instead of JSON?** Backend isn't running on the expected port. Start it.
4. **Login button doesn't load users?** Open DevTools → Network → check `/api/auth/dummy-users` — usually a backend-not-running issue.
5. **TypeScript complains about `import.meta.env`?** Make sure `frontend/src/vite-env.d.ts` exists and lists the env vars you're using.

---

## Decision log (key calls — don't relitigate without reason)

| ID | Decision | Why |
|---|---|---|
| **A1** | React + Vite + Tailwind for frontend (latest stable) | Industry standard, fast iteration, minimal config |
| **A2** | SQLite via libsql + Drizzle for backend | Zero-config local dev, no native compile (Windows-friendly), swappable to Postgres/Turso |
| **A3** | Repository pattern wrapping all DB access | Services + routes are DB-agnostic; swapping DB is an additive change |
| **A4** | Domain types separate from Drizzle row types | Prevents ORM types leaking into business logic |
| **A5** | Frontend proxies `/api/*` to backend in dev | Same code paths in dev and prod; no environment-specific URL logic |
| **A6** | One-click dummy login (userId-as-token) for v1 | Lets us iterate on every flow without typing passwords; clearly marked as dev-only |
| **A7** | All 3 JEE subjects in v1 (Physics + Chem + Maths) | Reversed earlier "Physics-only" call — see ROADMAP D-1 + REQUIREMENTS §9.1 |
