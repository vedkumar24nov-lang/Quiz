# Roadmap — JEE Prep Quiz App (v1 Build)

> **Status:** Phase 1 (Discovery) ✅ done · Phase 2 (Design) ✅ done · **Phase 3 (Development) in progress**
> **Companion docs:** [REQUIREMENTS.md](Quiz/REQUIREMENTS.md) · [PERSONAS_AND_CAPABILITIES.md](Quiz/PERSONAS_AND_CAPABILITIES.md) · [USER_JOURNEYS.md](Quiz/USER_JOURNEYS.md)
> **Approach:** UI-first → interactive prototype → wire up real backend → ship

---

## 📊 Live Progress Tracker

| Stage | Status | Started | Completed | Notes |
|---|---|---|---|---|
| **S0** Foundation | 🟢 Done | 2026-05-02 | 2026-05-02 | Vite 6 + React 18 + TS 5 + Tailwind 3 scaffold; clean build (1.7s, 64KB gzip JS); dev server live |
| **S1** UI Skeleton | 🟢 Done | 2026-05-02 | 2026-05-02 | **All 12 high-fidelity screens shipped** across S1.1, S1.2, S1.3. Full prototype clickable end-to-end. |
| **S2** Interactive Prototype | 🟢 Done | 2026-05-02 | 2026-05-02 | Folded into S1.2 — stopwatches/countdowns/skip-overlay/auto-submit/state-management all live |
| **S3** Backend MVP | 🟡 In Progress | 2026-05-02 | — | **Pivoted to SQLite + Express + Drizzle** (was Supabase). Repository wrapper lets us swap DB later. **S3.1** ✅ auth via backend. **S3.2** seed dummy users ✅. Next: S3.3 migrate other reads (questions, mastery, attempts) to backend |
| **S4** Adaptive Engine | ⚪ Not Started | — | — | Mastery formula + heatmap |
| **S5** Authoring Console | ⚪ Not Started | — | — | Question CRUD |
| **S6** Buyer-Concern Fixes | ⚪ Not Started | — | — | Parent digest, replay tab, etc. |
| **S7** Closed Beta | ⚪ Not Started | — | — | 20–50 real students |
| **S8** Public Launch | ⚪ Not Started | — | — | Open doors |

**Legend:** ⚪ Not Started · 🟡 In Progress · 🟢 Done · 🔴 Blocked

### S3 sub-stage breakdown (post-pivot)

| Sub-stage | Deliverable | Status |
|---|---|---|
| **S3.1 — Backend scaffold + auth + dummy users** | Frontend/backend split. Express + libsql + Drizzle. Repository wrapper (`IUserRepository`). 5 dummy users seeded across roles. One-click login on SignIn. | 🟢 Done 2026-05-04 |
| **S3.2 — Migrate subjects + topics + questions reads to backend** | Repositories + routes for `/api/subjects`, `/api/topics`, `/api/questions/by-topic/:id`. Frontend hooks replace direct `@/data` imports. | ⚪ Next |
| **S3.3 — Migrate attempts + mastery (writes)** | Quiz submit POSTs to `/api/attempts`. Mastery recompute on server. Dashboard reads real persisted data. | ⚪ After S3.2 |
| **S3.4 — Authoring routes (light)** | Author role can CRUD questions via `/api/admin/questions`. Console UI follows in S5. | ⚪ After S3.3 |
| **S3.5 — Polish (loading skeletons, error toasts, request retries)** | Production-feel error handling | ⚪ After S3.4 |

### Pivot note (2026-05-04)

S3 was originally scoped against Supabase. Reversed because:
- **Local dev story**: SQLite + Drizzle = zero external dependency for development. Supabase requires online project, OAuth setup, and managed env vars before the first quiz query works.
- **Wrapper requirement**: user explicitly asked for swappable DB. Repository pattern with libsql now, Postgres later (or Turso, or Supabase) is a one-file change in `db/client.ts` — services and routes don't notice.
- **Build risk**: better-sqlite3 needs native compile (Windows pain). libsql is pure JS — works everywhere.

Supabase code (lib/supabase.ts, AuthCallback page, db/migrations/, SETUP.md) was deleted — it had no business sitting alongside the SQLite path.

### S1 sub-stage breakdown

| Sub-stage | Screens | Status |
|---|---|---|
| **S1.1 — Entry & Dashboard** | Landing, SignIn (mock), Dashboard (with mini-heatmap, weak/strong topics, recent attempts, resume card) | 🟢 Done |
| **S1.2 — Quiz Loop** | Topic browser, Topic detail, Practice mode, Test mode, Skip overlay, Custom Test builder, Report stub | 🟢 Done |
| **S1.3 — Reports & Insights** | Full Heatmap (24 topics × 3 difficulty bands), Post-submission Report (6 tabs: Summary · Per-Q · Heatmap · Wrong · Skipped · Replay) | 🟢 Done |

### Build log (newest at top)

| Date | Stage | What shipped |
|---|---|---|
| 2026-05-04 | B1 + B2 (Author console foundation) | **Subtopic schema + Author console shell + role gating.** Frontend: added `Subtopic` type and 4-level hierarchy (Subject → Chapter → Topic → Subtopic); migrated `subjects.ts` with **150 subtopics across 75 topics** (2 per topic, JEE-syllabus-accurate names like "Parallel & Perpendicular Axis Theorems", "Markovnikov & Anti-Markovnikov Addition", "L'Hôpital's Rule & Indeterminate Forms"). Question type now optionally tags subtopic. Lookup helpers `getAllSubtopics`, `getSubtopicById`, `getTopicBySubtopic` added. Backend: new `requireRole(...)` middleware factory; `/api/author/stats` endpoint (gated, returns counts + bank-health + thin-areas + recent-activity stubs). Frontend: `ProtectedRoute` extended with optional `requireRole` prop showing friendly 403 when wrong role. **`AuthorShell`** — separate sidebar layout with amber branding + 6 nav items (Dashboard, Topics, Questions, Tests, Imports, History) + mobile drawer + "Switch to student app" link. **`AuthorDashboard`** — counts grid, per-subject bank health, "What to author next" thin-areas list, 4 quick-action cards. 5 placeholder pages (Topics, Questions, Tests, Imports, History) flagged with their B-substage. **App.tsx** detects `/author/*` prefix and switches shell. SignIn now redirects authors+admins to `/author/dashboard` instead of `/dashboard`. Student Header gets an "Author Console" link (amber) when role=author/admin. Verified: no auth → 401; Vedant (student) → 403; Ravi (author) + Meera (admin) → 200. Build: 360KB raw / 102KB gzip. |
| 2026-05-04 | S3.1 (post-pivot) | **Project split into `frontend/` + `backend/`.** Backend = **Express + Drizzle ORM + libsql (SQLite)** with repository wrapper pattern. Built: `IUserRepository` interface + `SqliteUserRepository` impl, `db/client.ts` (the only DB-specific file), schema, idempotent `ensureSchema()`, seed script. **5 dummy users seeded** across all 3 roles: Vedant + Asha + Karthik (students), Ravi (author), Meera (admin). Auth: `/api/auth/dummy-users` lists them, `/api/auth/login` accepts `{userId}`, `/api/auth/me` reads `X-User-Id`, `/api/auth/logout` no-op. Frontend: rewrote `authStore` to use backend (no Supabase), built `lib/api.ts` fetch wrapper, **rewrote SignIn with one-click cards grouped by role**. Vite proxy forwards `/api/*` to backend. Bundle dropped 532KB → 329KB (Supabase SDK removed). Wrote `CLAUDE.md` (full conventions doc). All routes 200; end-to-end login works. |
| 2026-05-02 | S3.1 (Supabase-era — superseded by pivot) | **Backend scaffold complete — app stays in demo mode until Supabase env vars are added.** Installed `@supabase/supabase-js`. Created `lib/supabase.ts` with `isSupabaseConfigured` flag (drives demo/live switch). Created `authStore` (Zustand) with both real Google OAuth + demo fallback paths sharing the same `AuthUser` shape. SignIn page reads `isSupabaseConfigured`: shows "Sign in with Google" + honest banner when configured, "Continue in demo mode" + setup hint when not. AuthCallback page handles OAuth redirect with 5s timeout fallback. ProtectedRoute wrapper redirects to `/sign-in` when no user. Header shows real Google avatar + name (or initial fallback for demo) with dropdown for sign out + DEMO badge. App.tsx wraps every authed route in `<ProtectedRoute>` and triggers `hydrate()` on mount. **SQL migrations**: `001_initial_schema.sql` creates 8 tables (`profiles`, `subjects`, `chapters`, `topics`, `questions`, `attempts`, `attempt_answers`, `mastery_scores`) with `tenant_id` everywhere (D-2 lock), full RLS policies (user-scoped reads/writes), auto-profile-creation trigger on auth.users insert. `002_seed_physics.sql` seeds 1 subject, 10 chapters, 26 topics, 15 sample questions — mirrors `src/data/*` exactly. **SETUP.md**: 7-step guide (~20 min) covering Supabase project creation, schema deploy, Google Cloud OAuth setup, env wiring, troubleshooting table. Build: 506KB raw / 140KB gzip (Supabase SDK adds chunk; code-splitting in S3.5). All routes 200 in demo mode. **Ready for Vedant to create the Supabase project and follow SETUP.md.** |
| 2026-05-02 | S1.3 | **Reports & insights layer complete**. Full Heatmap page (24 topics × 3 difficulty bands grid with deterministic per-band mastery derivation, search + class + band filters, click-to-drill cells, stats strip showing overall/attempted/weak/strong counts). Full Report page replaces ReportStub with **6 tabs**: (1) **Summary** — diagnostic-first hero per Neha fix, mastery delta with prev→new arrow, score breakdown, per-difficulty + per-type performance bars; (2) **Per Question** — sortable by order/time/difficulty, filter by correct/wrong/skipped, status-coloured rows; (3) **Heatmap** — difficulty × type matrix scoped to this attempt with auto-generated diagnostic patterns; (4) **Wrong Answered** — intrinsic tags only (no self-tagging per spec §5.4), filter by difficulty + type, your-answer vs correct side-by-side, inline solution reveal, "Report this question" flag per buyer fix ST-3; (5) **Skipped Questions** — pre-tagged for Practice / interactive tagging for Test mode with non-naggy nudge copy per buyer fix ST-9; (6) **Replay walkthrough** — linear Q1→Qn with student answer + correct + always-visible solution per buyer fix ST-4 (Aditya's complaint). TabBar with deep-linkable URL params (?tab=replay etc), sticky bottom nav on Replay. Removed dead ReportStub.tsx + Placeholder.tsx. Build: 295KB raw / 86KB gzip. All routes 200. **S1 (UI Skeleton) is fully done.** |
| 2026-05-02 | S1.2 | **6 new high-fidelity screens + the full quiz loop**: Topic Browser (search + class filter + chapter cards with mastery chips), Topic Detail (mastery summary, engine-band hint, bank-thinness warning, Practice/Test launch buttons, recent attempts), Practice Quiz (live stopwatch, animated question card, MCQ + numerical input, per-Q solution reveal, question palette with status colors, exit + submit confirms), Test Quiz (countdown turning amber/red at thresholds, "Time's up" splash + auto-submit, no skip overlay per spec §5.6.2, no mid-quiz solutions), Skip Overlay (sheet/modal with 4 reason buttons + 15s soft-prompt countdown — copy reframed per buyer fix D-3, NOT "anti-cheat"), Custom Test Builder (chapter multi-select, Q-count + duration sliders, live bank-density indicator), Report Stub (diagnostic-first header per Neha buyer fix, mastery delta with arrow, stats grid, per-Q breakdown with skip reasons; placeholder for S1.3 full report). Plus: Zustand quiz session store with stopwatch pause/resume, mastery formula from spec §5.5.1, sessionStorage persistence so Report can read just-completed attempts. Build: 264KB raw / 79KB gzip. All routes 200. |
| 2026-05-02 | S1.1 | **3 high-fidelity screens live**: Landing (with honest "Physics-only" amber banner per buyer fix D-1), SignIn (mock Google button bouncing to dashboard), Dashboard (greeting card, "pick up where you left off" hero, weak/strong topic lists with one-click drill, mini chapter heatmap with hover-to-drill cells, recent attempts feed with mastery chips). Reusable components: `Button` (4 variants × 3 sizes), `Card`, `Badge` (incl. specialized `DifficultyBadge`, `TypeBadge`, `MasteryChip`). Mobile bottom-nav for ≤md screens (Karthik-friendly). 7 placeholder routes wired so all dashboard links resolve. |
| 2026-05-02 | S0 | Vite 6 + React 18 + TS 5 + Tailwind 3 scaffolded. `@/*` path alias. Brand palette + mastery-band colors in tailwind.config. Inter + JetBrains Mono via Google Fonts. `npm install` clean (143 pkgs, 0 vulns). `tsc -b` clean. `vite build` succeeds in 1.7s (204KB JS uncompressed, 64KB gzipped — well within budget). Dev server confirmed serving on :5173. |
| 2026-05-02 | S0 | Roadmap updated to lock Vite + React + Tailwind stack; foundation scaffold begins. |

---

## How to read this roadmap

Phase 3 (Development) from `REQUIREMENTS.md` is too big to ship in one sprint. This roadmap breaks it into **9 build stages (S0–S8)**, plus a v2 horizon (S9+). Each stage ends with **a thing a real user / stakeholder can see and react to** — no internal-only milestones.

| Concept | What it means |
|---|---|
| **Stage** | A self-contained 2–4 week build chunk |
| **Customer value** | What a real user (student, parent, you-as-founder) can *do* or *see* at the end |
| **Deliverable** | The concrete artifact — pages shipped, features live, etc. |
| **Exit criteria** | "Done" gate — must be true to move to next stage |
| **Demo-able to** | Who you can show this to for feedback |

---

## Guiding principles

1. **Every stage ships something a human can see.** No 6-week "infrastructure" stages with nothing to demo.
2. **UI before backend.** Validate the design in HTML/CSS before writing engine code. Cheaper to throw away a button than a database schema.
3. **Honest scope.** v1 is **Physics-only, B2C-only, online-only** (per buyer-round resolution — see S0).
4. **Buyer findings get fixed before launch, not after.** S6 is dedicated to the unresolved concerns from the buyer challenge.
5. **Don't optimize until you have users.** Stages 1–5 don't need caching, CDN, or scale concerns. Stage 7 onwards may.

---

## Pre-build: Lock these decisions in S0

The buyer challenge surfaced **3 inconsistencies** that must be resolved on paper before code starts. Trying to build around contradictions is the #1 reason solo projects die.

| Decision | Resolution to lock | Affects |
|---|---|---|
| **D-1: Subject scope identity** | ~~v1 marketing + UI says "Physics PrepLab"~~ → **REVERSED 2026-05-02**: v1 now ships **all 3 subjects** (Physics + Chemistry + Maths). UI says "JEE PrepLab". Subject switcher in header. REQUIREMENTS §9.1 updated. | Landing page, dashboard headers, all "JEE Main mock" labels — all updated to reflect 3-subject scope |
| **D-2: B2C vs B2B** | v1 = **B2C-only**. No teacher/institute role, no batch dashboards, no question import for customers. (Mr. Iyer is a v2/v3 conversation.) But: **schema must include `tenant_id` from day 1** so v2 multi-tenancy isn't a rewrite. | Database schema (S3), auth (S3), every list query |
| **D-3: 15s skip-timer rationale** | Drop the "anti-cheat" framing entirely. Reframe copy as: *"Pick a tag — 15s for a soft prompt."* Anti-cheat is a separate problem (S4 if needed). | Skip overlay copy, FAQ, future docs |

---

## Stage 0 — Foundation (1 week)

**Goal:** Set up the workshop before swinging the hammer.

| Item | Detail |
|---|---|
| **Customer value** | None directly — this is investment in build velocity. (The faster you set this up well, the faster every later stage ships.) |
| **Deliverable** | Repo, tech stack chosen, dev environment running, deploy pipeline live, one "Hello World" page reachable on a public URL |
| **Exit criteria** | You can push a code change and see it live on a real URL in under 2 minutes |
| **Demo-able to** | Just yourself / a friend |

### Locked tech stack (v1 build)

| Layer | Choice | Why |
|---|---|---|
| **Build tool** | **Vite (latest)** | Fastest dev server; HMR is instant; minimal config; perfect for SPAs |
| **Frontend framework** | **React 18+** with **TypeScript** | Industry standard; type safety prevents whole classes of bugs |
| **Styling** | **Tailwind CSS (latest)** | Fast iteration; no separate CSS files; mobile-first responsive utilities |
| **Routing** | **React Router (latest)** | SPA navigation; nested routes |
| **State** | **Zustand** (lightweight) for global; React state for local | No Redux boilerplate; fits a solo-dev project |
| **Backend / DB / Auth** *(post-S2)* | **Supabase** (Postgres + Auth + Storage) | Google OAuth built-in (free); Postgres is industry-grade; free tier covers beta |
| **Hosting** | **Vercel** (frontend) + **Supabase Cloud** (backend, post-S3) | Both free at v1 scale; zero devops |
| **Analytics** *(post-S6)* | **Plausible** or **PostHog** (free tier) | Privacy-friendly; tells you what users actually do |
| **Question rendering (LaTeX/Math)** | **KaTeX** (faster than MathJax) | Physics needs math rendering on day 1 |
| **Charts (heatmap, mastery graphs)** | **Recharts** | React-native; clean heatmap support |

> **Stack chosen:** Vite + React + Tailwind (latest versions), per Vedant's call. SPA-first approach — quick to iterate on UI, easy to layer Supabase on top in S3.

### S0 checklist

- [ ] GitHub repo created (private or public, your call)
- [ ] Next.js + TypeScript + Tailwind boilerplate running locally
- [ ] Vercel project deployed and reachable on a URL
- [ ] Supabase project created (no schema yet)
- [ ] One placeholder landing page live
- [ ] `README.md` written (1 paragraph: what is this, how to run)

---

## Stage 1 — UI Skeleton (3–4 weeks) 🎨

**Goal:** Every key screen exists as a clickable HTML mock with **dummy data**. No backend, no logic — just pages that look right.

| Item | Detail |
|---|---|
| **Customer value** | First time the product is *visible*. You can show it to friends, family, or a parent and ask: "Does this look like something you'd use?" — feedback before you've sunk a month into backend code |
| **Deliverable** | Clickable static prototype of all 12 key screens, navigable via real links, with realistic dummy data baked in as JSON |
| **Exit criteria** | A friend can click through the entire app from sign-in → quiz → report → dashboard and the experience feels coherent |
| **Demo-able to** | Friends, family, parents, JEE-aspirant peers (informal user testing) |

### Screens to build in S1

Anchored to journeys in [USER_JOURNEYS.md](Quiz/USER_JOURNEYS.md):

| # | Screen | Drives journey |
|---|---|---|
| 1 | Landing page | Pre-purchase / sign-in entry |
| 2 | Sign-in (mock — just a button that "succeeds") | [J1](Quiz/USER_JOURNEYS.md) |
| 3 | First-run dashboard (empty state) | [J1](Quiz/USER_JOURNEYS.md) |
| 4 | Returning dashboard (with mock heatmap + recent attempts) | [J2](Quiz/USER_JOURNEYS.md), [J5](Quiz/USER_JOURNEYS.md) |
| 5 | Subject → Chapter → Topic browser | [J1](Quiz/USER_JOURNEYS.md), [J2](Quiz/USER_JOURNEYS.md) |
| 6 | Topic landing (mastery + Practice/Test buttons) | [J2](Quiz/USER_JOURNEYS.md) |
| 7 | Quiz UI — Practice mode (with stopwatch, Show solution button) | [J2](Quiz/USER_JOURNEYS.md), [J6](Quiz/USER_JOURNEYS.md) |
| 8 | Quiz UI — Test mode (with countdown, no solution button) | [J3](Quiz/USER_JOURNEYS.md) |
| 9 | Skip overlay (Practice mode) — modal with 4 tags + visible 15s | [J6](Quiz/USER_JOURNEYS.md) |
| 10 | Custom Test builder (chapter picker, sliders) | [J4](Quiz/USER_JOURNEYS.md) |
| 11 | Post-submission report (all 5 tabs: Summary, Per-Q, Heatmap, Wrong, Skipped) | [J3](Quiz/USER_JOURNEYS.md), [J5](Quiz/USER_JOURNEYS.md) |
| 12 | Heatmap detail view (topic-grid, LeetCode-style) | [J2](Quiz/USER_JOURNEYS.md), [J5](Quiz/USER_JOURNEYS.md) |

### S1 working notes

- Use a single `dummyData.ts` file with mock questions, attempts, mastery scores. No DB yet.
- Build mobile-first. Test on your phone *every day* — Karthik (the streak builder) is phone-only.
- Don't worry about animations or polish yet. Polish in S2.
- **Anti-pattern alert:** don't start adding backend "just to test" — keep S1 pure frontend.

### S1 buyer-fix touchpoints

These small copy-level fixes from the buyer challenge cost almost nothing at S1 and are expensive later:

- D-1: Use "Physics PrepLab" (or chosen v1 name) on the landing page from day 1
- D-3: Skip overlay reads "Pick a tag — 15s for a soft prompt." (not "anti-cheat")
- ST-9 fix: post-test nudge reads "You've tagged 3. More tags = sharper heatmap. No pressure." (not naggy)

---

## Stage 2 — Interactive Prototype (2–3 weeks) ⚙️

**Goal:** The frontend *behaves* like a real app. Stopwatches tick, countdowns expire, answers get recorded, reports compute — all in-browser, no backend.

| Item | Detail |
|---|---|
| **Customer value** | A beta tester can take a real quiz end-to-end and feel the actual product loop, even though nothing persists yet |
| **Deliverable** | Fully interactive frontend with state management; quizzes are takeable from a static JSON question bank |
| **Exit criteria** | A user can: launch a Practice quiz → answer/skip questions → trigger the skip overlay → see the auto-tag fire on timeout → submit → see a real report with their actual answers |
| **Demo-able to** | 5–10 friends-and-family for usability testing |

### What gets wired up

| Feature | Behavior |
|---|---|
| **Stopwatch (Practice)** | Counts up; pauses when skip overlay opens (per [§5.6.1](Quiz/REQUIREMENTS.md)) |
| **Countdown (Test)** | Counts down; turns amber at 5min, red at 1min; auto-submits at 0:00 ([J7](Quiz/USER_JOURNEYS.md)) |
| **Skip overlay** | 15s visible countdown; auto-tags *Conceptual gap* on expiry ([J6](Quiz/USER_JOURNEYS.md)) |
| **Answer recording** | Tracks answer + time-per-Q in component state |
| **Report generation** | Computes summary, per-Q breakdown, heatmap inputs from in-memory attempt data |
| **Format templates** | JEE Main / Topic / Custom configurable from a static config object |

### Tech notes

- Use Zustand or React Context for global state (don't reach for Redux; overkill at this stage)
- Question bank = `questions.json` in `/public` — 30–50 hand-written or PYQ-sourced Physics questions across 3–4 topics is enough to test the loop
- All mastery / heatmap math runs client-side for now (this same logic moves server-side in S4)

### S2 buyer-fix touchpoints

- ST-1 fix: Show a "Why this question?" tooltip on each Q in Practice (one sentence) — addresses the black-box concern
- ST-3 fix: Report header leads with **diagnostic insight first**, score second (Neha-friendly tone)

---

## Stage 3 — Backend MVP (3–4 weeks) 🗄️

**Goal:** Real users sign in. Real attempts persist. Real questions live in a database.

| Item | Detail |
|---|---|
| **Customer value** | First time real users can sign up, take a quiz, close the app, come back tomorrow, and see their data still there. This is when the product becomes *real* |
| **Deliverable** | Live web app with Google OAuth, Postgres-backed question bank, persisted attempts, server-side answer validation |
| **Exit criteria** | You sign in as a brand new user, take a quiz, log out, log back in 1 hour later, and your attempt history + report are still there |
| **Demo-able to** | First 5–10 trusted beta users (real Google sign-in, real data) |

### S3 build list

| Item | Detail |
|---|---|
| **Auth** | Supabase Google OAuth wired into Next.js. Sign-in redirect → dashboard |
| **Schema (Postgres)** | Tables: `users`, `subjects`, `chapters`, `topics`, `questions`, `attempts`, `attempt_answers`, `mastery_scores`. Include `tenant_id` everywhere (D-2 future-proofing) |
| **Question seeding** | Move the 30–50 dummy Qs from S2 into the DB |
| **Quiz session API** | Endpoints: start session, submit answer, complete attempt |
| **Server-side validation** | Correct-answer comparison happens server-side at submit (per [§7.2](Quiz/PERSONAS_AND_CAPABILITIES.md)). Client never sees the answer key during the quiz |
| **Attempt history** | Dashboard shows real past attempts |
| **Report generation** | Reports now load from DB, not memory |

### Critical security checkpoint

**Never serve the correct answer to the client during a live quiz.** This is the #1 cheating vector. Validate at submit. Test this explicitly: open DevTools, inspect network tab, confirm answer keys are not in the question payload.

### S3 buyer-fix touchpoints

- D-2 lock: every query is scoped by `tenant_id`, even though v1 has only one tenant. Prevents v2 multi-tenancy from being a rewrite.

---

## Stage 4 — Adaptive Engine + Mastery + Heatmap (2–3 weeks) 🧠

**Goal:** The differentiator. The thing that makes this *not just another quiz app*.

| Item | Detail |
|---|---|
| **Customer value** | The diagnostic moat goes live. Mastery scores update from real attempts. Adaptive difficulty selection picks the next question intelligently. Heatmap renders from real user data. **This is the feature you sell.** |
| **Deliverable** | Working adaptive engine + mastery formula + topic-grid heatmap, all server-driven |
| **Exit criteria** | A user takes 3 quizzes on the same topic, watches their mastery score evolve correctly, and the engine biases the 4th quiz's difficulty per the [§5.5.2](Quiz/REQUIREMENTS.md) bands |
| **Demo-able to** | Beta users who've already tried S3 — they should *feel* the difference |

### S4 build list

| Item | Detail |
|---|---|
| **Mastery formula** | Implement [§5.5.1](Quiz/REQUIREMENTS.md): per-Q weighted deltas, attempt score normalized 0–100, rolling avg of last 3 attempts |
| **Adaptive next-Q selector** | Server endpoint that returns the next question based on current mastery band (high / mid / low) |
| **Bank-thinness handling** | Engine surfaces a "thin bank" flag when needed (per [P5](Quiz/PERSONAS_AND_CAPABILITIES.md) constraints); UI degrades gracefully |
| **Topic-grid heatmap** | LeetCode-style: rows = chapters/topics, cols = difficulty bands, cells colored by mastery |
| **Aggregation** | Chapter mastery from topics; subject mastery from chapters |

### S4 buyer-fix touchpoints

- ST-3 deeper fix: write the actual mastery delta example into the in-app FAQ — show the math, kill the "black box" concern
- Critical: confirm the formula doesn't produce demoralizing swings (e.g., a Hard wrong dropping a strong student from 88 → 64 in one attempt). If it does, add a damping factor or smooth more aggressively. **Test with at least 5 simulated user histories before declaring this stage done.**

---

## Stage 5 — Authoring Console (2 weeks) ✍️

**Goal:** You can scale the question bank without touching SQL.

| Item | Detail |
|---|---|
| **Customer value** | Indirect to students, direct to the product: question bank can grow from ~50 → ~3000+ questions (target ~150–200 per topic per [§9.2](Quiz/REQUIREMENTS.md)). Without this, no ramp. |
| **Deliverable** | Authoring UI that lets Ravi (or you) create, edit, tag, preview, publish, and bulk-import questions |
| **Exit criteria** | You author 10 new questions through the UI in under 30 minutes (no DB access needed) and they appear correctly to a student account |
| **Demo-able to** | Yourself, a content collaborator (if you have one) |

### S5 build list — anchored to [J10](Quiz/USER_JOURNEYS.md), [J11](Quiz/USER_JOURNEYS.md)

| Item | Detail |
|---|---|
| **Single-Q create form** | Stem (Markdown + LaTeX), MCQ/numerical toggle, options, correct, difficulty, type, topic, solution editor |
| **Live preview** | Renders question as student would see it |
| **Bulk CSV import** | Upload PYQ datasets; row-by-row validation; inline error fix |
| **Coverage report** | Shows Q-count per (topic × difficulty × type) so you know where the bank is thin |
| **Author/admin role check** | Only signed-in users with `role = 'author'` reach this UI |

> **Important:** S5 is internal-only. Don't expose it to students. Don't put it on the same domain if possible (use a `/admin` subpath behind role check).

---

## Stage 6 — Buyer-Concern Fixes (1–2 weeks) 🩹

**Goal:** Close the loose ends from the buyer challenge **before** going public. Cheaper to fix now than after launch reviews go negative.

| Item | Detail |
|---|---|
| **Customer value** | Trust. Every fix here is something a buyer specifically said would block their purchase |
| **Deliverable** | A focused 1–2 week sprint addressing the unresolved findings |
| **Exit criteria** | Re-run a mental "buyer challenge" — at least Mrs. Sharma and Aditya say "OK, I'd pay for a trial" |

### S6 fix list (from buyer challenge)

| ID | Fix | Effort |
|---|---|---|
| **PA-1** | Parent weekly digest email (no parent login required; uses parent email captured at signup; sent every Sunday with mastery delta + active days) | 3 days |
| **PA-3** | Smarter test-disconnect handling: preserve answered Qs; only redo unreached Qs; one free retake per month | 2 days |
| **ST-3** | Honest mastery-formula explanation in the FAQ, with worked examples | 1 day |
| **ST-4** | "Replay test with solutions" 6th tab in the post-test report — linear Q1→Qn walkthrough | 2 days |
| **ST-5** | One pause per Test, max 5 minutes, server-locked | 2 days |
| **ST-7** | Minimum bookmark feature: star icon → flat "Saved" list | 2 days |
| **D-1 / PA-2** | Final pass on UI copy: kill any remaining "JEE Main mock" labels; rename to "Physics Mock (JEE Main format)" everywhere | 1 day |

> **Skip these in v1:** ST-6 (peer percentile — needs user volume; punt to S9), CI-* (B2B — out of v1 per D-2).

---

## Stage 7 — Closed Beta (2–4 weeks) 🧪

**Goal:** Real students use it for real prep. You watch what they actually do.

| Item | Detail |
|---|---|
| **Customer value** | First externally-validated value. If 20 students use it for a month and 10 of them keep coming back, you have product-market fit. If 0 do, you've saved yourself the cost of a public launch. |
| **Deliverable** | App invited to ~20–50 trusted students (your school, JEE coaching peers, online forums); active analytics; in-app feedback widget |
| **Exit criteria** | At least 10 users have completed ≥3 quizzes each. You have a list of the top 5 friction points from real usage. |
| **Demo-able to** | The beta cohort + their parents (S6's parent digest is now live) |

### S7 build list

| Item | Detail |
|---|---|
| **In-app feedback widget** | One-click "Was this question OK? / Wrong answer key? / Other" — feeds back to your inbox |
| **Plausible / PostHog analytics** | Track: signup → first quiz, daily active, completion rate, drop-off points |
| **Bank scale-up** | Hit ~1000 published Qs across Physics minimum (use the S5 console heavily) |
| **Bug-fix cycle** | Daily triage of beta feedback; fix-and-redeploy in <24h |

### What "good" looks like at end of S7

- ≥50% of beta users return on Day 7 after first quiz
- ≥30% return on Day 30
- Zero "this answer is wrong" reports left unaddressed
- You can tell a clear story about *which* persona archetype the app is winning with (probably Vedant + Karthik first)

---

## Stage 8 — Public v1 Launch (1–2 weeks) 🚀

**Goal:** Open the doors.

| Item | Detail |
|---|---|
| **Customer value** | Anyone preparing for JEE Physics can sign up and use it |
| **Deliverable** | Public landing page, pricing decision (free? freemium? paid?), launch announcement |
| **Exit criteria** | The app handles 100 concurrent users without falling over |

### S8 build list

| Item | Detail |
|---|---|
| **Landing page polish** | Real screenshots, clear "what this is" pitch (use Aditya's ST-1 framing: *"the overseer that notices weak topics"*) |
| **Pricing decision** | Three reasonable options: (a) free forever — grow audience, monetize in v2; (b) freemium — Practice free, Test mode + heatmap behind a paywall; (c) ₹X/month — riskier but tests willingness to pay. Pick deliberately, not by accident. |
| **Onboarding polish** | First-run experience for non-beta users (no hand-holding from you) |
| **Status page / outage handling** | If Supabase or Vercel goes down, users see a clean message, not a stack trace |
| **Launch channels** | r/JEENEETards, JEE Discord servers, your school batch, JEE Telegram groups, X/Twitter |

> **Honest note:** "launch" is not the end. The real work is the next 90 days of fixing what real users break.

---

## Stage 9+ — Post-v1 Roadmap (v2 horizon) 🗺️

Stages 9 onwards are not for now — but listing them keeps the long game visible.

### S9 — Chemistry rollout
- Reuse all the v1 infrastructure
- Question bank build (the longest pole again)
- Update marketing: "now Physics + Chemistry"

### S10 — Maths rollout
- Same pattern as S9
- After this lands, the app legitimately becomes "JEE Main mock" — at this point, the warning copy can be retired

### S11 — Mobile-app shell (React Native or PWA upgrade)
- Per [§9.4](Quiz/REQUIREMENTS.md): native if traction warrants. PWA may be enough.

### S12 — B2B layer (Mr. Iyer's concerns)
- Teacher persona, batch dashboard, assignment journey, data export, multi-tenant question import, white-label
- Schema is already ready (D-2 lock from S0); now build the UI on top

### S13 — Resources Library (per [§10.1](Quiz/REQUIREMENTS.md))
- Books + practice PDFs with progress tracking
- Open questions OQ-R1 to OQ-R4 from the spec to revisit

### S14 — Spaced repetition / streaks / dark mode
- The §6 features dropped from v1 — revisit based on real beta feedback signal

---

## Cross-cutting commitments

These apply to **every** stage, not just one:

| Commitment | What it means in practice |
|---|---|
| **Test on phone every stage** | Karthik (the streak builder) is phone-only. If it doesn't work one-handed on a 5-inch screen, it's broken. |
| **Real PYQs from S1 onwards** | Don't use Lorem Ipsum questions. Real Physics questions surface real rendering problems (LaTeX, units, super/subscripts) early. |
| **Privacy by default** | Never collect what you don't need. Server-side answer validation. No third-party trackers beyond Plausible. |
| **Document as you go** | When a design decision gets made, write it in `DECISIONS.md` (one paragraph per decision, dated). Future-you will thank present-you. |
| **Talk to one user per week minimum** | From S1 onwards. A friend, a peer, your dad — one fresh pair of eyes per week. |

---

## Risks and mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Question bank too small for adaptive engine to work well** | High | High | Start sourcing PYQs in parallel with S0–S3 (don't wait for S5). Goal: 500 Qs in DB before S4 starts. |
| **Class 11 schoolwork eats build time** | High | High | Realistic scoping: target 1 stage per 4–6 weeks, not 2–3 weeks. Give yourself slack. |
| **Burnout** | Medium | High | Take a clean week off after each stage ships. Non-negotiable. |
| **Tech-stack rabbit hole** | Medium | Medium | Stick with the recommended stack unless you have strong reason to deviate. Don't switch frameworks mid-build. |
| **Engine bug in mastery formula** | Medium | High | Write 5–10 unit tests for the mastery math in S4. Test with simulated histories. |
| **Beta users find it boring** | Medium | High | If S7 retention is bad, **do not push to S8.** Iterate on S6 fixes until retention improves. |
| **Scope creep (e.g., "let me also add Chemistry now")** | High | Medium | Re-read this roadmap monthly. v2 stays in v2. |

---

## Realistic timeline

For a Class 11 student building solo, with school + JEE prep also competing for time:

| Stage | Dev time (focused) | Realistic calendar (with school) |
|---|---|---|
| S0 — Foundation | 1 week | 2 weeks |
| S1 — UI Skeleton | 3–4 weeks | 6–8 weeks |
| S2 — Interactive Prototype | 2–3 weeks | 4–6 weeks |
| S3 — Backend MVP | 3–4 weeks | 6–8 weeks |
| S4 — Adaptive Engine | 2–3 weeks | 4–6 weeks |
| S5 — Authoring Console | 2 weeks | 3–4 weeks |
| S6 — Buyer-Concern Fixes | 1–2 weeks | 2–4 weeks |
| S7 — Closed Beta | 2–4 weeks (calendar, not work) | Same |
| S8 — Public Launch | 1–2 weeks | 2–4 weeks |
| **Total to v1 public launch** | **~17–25 weeks dev** | **~9–14 months calendar** |

> **Don't be discouraged by the 9–14 month range.** That's normal for solo + school. The trick is shipping value at each stage so you don't burn out chasing one giant launch date.

---

## Definition of "value delivered"

Each stage's value, in one sentence:

| Stage | One-sentence value |
|---|---|
| **S0** | "I can deploy code to a real URL in seconds." |
| **S1** | "My friends can click through the whole app and tell me if it makes sense." |
| **S2** | "A real person can take a real quiz and see a real report — even if nothing saves." |
| **S3** | "Users can sign up, take quizzes, and find their data still here tomorrow." |
| **S4** | "The app is now smarter than a flashcard — mastery and adaptive selection actually work." |
| **S5** | "I can scale to thousands of questions without touching the database manually." |
| **S6** | "The buyers who were on the fence will now sign up." |
| **S7** | "20 real students used it for a month, and I know exactly what to fix next." |
| **S8** | "Anyone in India preparing for JEE Physics can use this." |

---

## What to do *right now* (today / this week)

1. Resolve **D-1, D-2, D-3** on paper (15 minutes)
2. Decide tech stack (or accept the recommendation in S0)
3. Start S0: create the GitHub repo, scaffold the Next.js app, push it to Vercel, send yourself the URL
4. Start sourcing PYQs in parallel — open a Google Sheet, target 500 questions across 3–4 Physics topics by end of S3

---

> 💡 **A note on this roadmap itself:** Roadmaps are living documents. Re-read this at the end of every stage. If something has changed (a buyer found a new gap, a feature took twice as long, beta users surfaced a new priority), edit the roadmap *before* starting the next stage. A roadmap that doesn't get updated is a roadmap that's already wrong.
