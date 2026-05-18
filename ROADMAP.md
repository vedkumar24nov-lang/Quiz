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
| 2026-05-09 | Admin v1.2 — Support Tickets (general feedback inbox) | **General-purpose feedback channel for students AND authors → admin.** QuestionFlag (shipped in Admin v1) only handles "this specific question is broken." Tickets are the broader inbox: bugs, feature requests, account help, content gaps that aren't tied to one question. New `SupportTicket` type with `category` (5 enum: bug / content / feature-request / account-help / other), `status` (4 enum: open / in-progress / resolved / closed), opener snapshot (id + name + email + role — survives later user deletion), `pageContext` (auto-attached URL the user was on, opt-in via checkbox in the compose modal), `adminReply` (single-note for v1; threading later), and `handledBy` audit. New `ticketsStore` (Zustand+persist v1, frontend-only — same pattern as flags) with `openTicket` / `updateTicketStatus` / `reopenTicket` / `deleteForever` + four selectors (`useTickets`, `useTicketsByOpener`, `useOpenTickets`, `useTicketById`) all properly wrapped in `useMemo` to avoid the infinite-loop trap. New label maps `TICKET_CATEGORY_LABELS` + `TICKET_STATUS_LABELS` for consistent copy. **Student/author side — `/support` page**: dual-purpose. Top of page = "New ticket" CTA + filter chips by status (All / Open / In progress / Resolved / Closed with live counts); body = the user's own ticket list (filtered to their `openerId`). Each row shows status badge + category badge + subject + body preview + page-context code chip if attached + the admin's reply in an emerald "Admin reply" panel when present. Closed tickets get **Reopen** + **Delete-from-history** actions. Compose modal: 5-card category picker + subject (≥5 chars) + details textarea (≥10 chars) + opt-in "attach the page I was on" checkbox (auto-checked when not on `/support` itself, so reporting a quiz bug includes the quiz URL by default). Validation summary appears inline. Page also accepts `?new=1` query param to auto-open the compose modal — useful for "Help" links from anywhere. **Admin side — `/admin/tickets`**: tabbed queue (Open / In progress / Resolved / Closed / All) with badge counts; each row shows opener name + role icon (GraduationCap/PenSquare/ShieldCheck) + subject + body + page-context + the admin's prior reply. Admin actions: **Mark in progress** / **Mark resolved** / **Close** — each opens a reply modal (status pre-selected, body pre-filled with prior reply if any) so the admin can leave a contextualised note before saving. Resolved + Closed tickets get a Delete-forever option. **Surfaces:** Sidebar — admin gets a fourth "Support Tickets" item (`LifeBuoy` icon) in the Admin tools section with a live open-count badge alongside Review Queue and Question Flags; AuthorShell now shows a **Help & Feedback** link below all sections (everyone sees it — authors raise tickets too, not just students); student-side Header gets a **Help** entry in both desktop secondary nav and mobile bottom nav (now `grid-cols-5`). **Routes:** `/support` (any signed-in user) + `/admin/tickets` (admin only) wired in App.tsx. **Architecture decisions confirmed by user:** single admin reply note (not threaded — faster to ship, can expand later) + dedicated `/support` page with history (vs a one-off modal — students/authors can see admin replies over time). **Backend changes:** zero — tickets stay frontend-only for v1, same as flags. Type-check clean both ends. Dev servers verified up on :4000 + :5173. **Net: every role now has a feedback channel into admin's inbox** — questions go via Flags, everything else via Tickets. |
| 2026-05-08 | Admin v1.1 — user management refactor: Add/Remove + self-signup | **Two big shifts in how users get into the system, both per user direction.** **(1) Promote/Demote out, Add/Remove in.** AdminUsers' per-row Promote/Demote buttons gone — replaced with a single header **"Add user"** CTA (`UserPlus` icon) and a per-row **Remove** button (`Trash2`, opens a confirm modal that warns the deletion is permanent and that audit log entries are preserved via the cached actor name). New Add-user modal: full name + email + role-as-3-card-picker (student/author/admin, with one-line explanation of what each role unlocks) + optional bio. Email is regex-validated on the client; server re-validates and returns 409 on duplicates. Default role in the picker is `author` since that's the common admin-side onboarding case (students self-signup; see #2). New backend route **POST /api/admin/users** mirroring the signup service but with admin-chosen role; new **DELETE /api/admin/users/:id** with a self-deletion guard ("You can't delete your own account"). New `IUserRepository.delete(id): Promise<boolean>` + SQLite impl. Old PUT-role endpoint kept on the backend (harmless, useful later) but no UI for it. **(2) Self-signup landed.** New backend route **POST /api/auth/signup** that creates a `student` user (the only role available via self-signup — anyone needing author/admin gets it via Add-user) and returns a session in the same shape as login. New `AuthService.signUp` + `createUser` methods (with shared name/email validation + dup detection); the admin route delegates to `createUser`. New `signUp` action on the frontend `authStore` (sets the user + token, throws on failure so the UI can show the error). SignIn page reshaped: a "Sign in / Create account" pill toggle at the top of the page, the existing one-click dummy-user list lives under "Sign in", and "Create account" reveals a 2-field form (full name + email) that auto-logs the new student in and redirects to `/dashboard`. Empty-state on the sign-in tab now invites the first user to "create the first one" rather than dead-ending on a backend that has no seeded users. **Net result for the admin:** zero manual onboarding for students — they appear automatically in `/admin/users` the moment they sign up. Admin only does explicit Add for non-student onboarding (a new author joining the team) and Remove for offboarding. Smoke-tested end-to-end: signup → 201 with session, duplicate email → 409, admin add → 201, admin delete → 204, self-delete → 400, non-admin hits → 403. Type-check clean both ends. |
| 2026-05-08 | Admin v1 — publish review queue + user management + question flags | **Admin role becomes load-bearing**: until today admin was just "author with two extra publish toggles." Now admin has three dedicated tools, all gated by `role === 'admin'` and surfaced as an "Admin tools" section inside the existing AuthorShell sidebar (`ShieldCheck` header, emerald accent) with live unread-count badges. URLs use `/admin/*`. **(1) `/admin/review` — AdminReviewQueue.** Aggregates every unpublished Track + every unpublished non-empty Exam + every custom (non-system) Paper Pattern into one feed sorted newest-first, with filter chips (All / Tracks / Exams / Patterns) and per-row Approve / Reject actions. Reject opens a sticky modal that captures a free-text feedback note, emits a new `'reject'` audit entry tagged on the source entity (so the author sees the rejection — and the admin's note — in `/author/history`); rejected patterns also archive (custom patterns can be restored + edited). Each queue row shows entity-specific context: Tracks display kind/class-stream/subject-count + an "Empty syllabus" warning, Exams show Q-count + pattern-or-Custom badge, Patterns show duration + Q-count + marking. **(2) `/admin/users` — AdminUsers.** First real admin power that needs the backend: new `IUserRepository.updateRole` + SQLite impl, new `/api/admin/users` GET (list everyone) + `/api/admin/users/:id/role` PUT (gated by `requireRole('admin')`, refuses self-role-change so an admin can't lock themselves out). Page lists every user with avatar / role badge / Class chip / archetype bio; per-row Promote / Demote buttons walk the role ladder (student ↔ author ↔ admin) with a confirm modal explaining what each transition unlocks. New `apiSend(path, method, body)` helper added to `lib/api.ts` for PUT/PATCH/DELETE. Optimistic UI: post-PUT the page swaps the user in local state immediately + shows an emerald success toast (or red error toast on failure, with retry hint). **(3) `/admin/flags` — AdminFlags.** New `QuestionFlag` type + `flagsStore` (Zustand+persist v1) + `useFlags`/`useOpenFlags`/`useFlagsForQuestion` selectors + `FLAG_REASON_LABELS` map (six reasons: wrong-answer, unclear-stem, typo, bad-image, off-syllabus, other). Page is a tabbed queue (Open / Resolved / Dismissed / All) with per-row context: status badge, reason badge, student attribution, the question stem (or a "Question deleted" warning that falls back to the snapshot stored at flag time), the student's optional note, and any prior admin resolver-note. Resolve / Dismiss open a small modal capturing the resolver's note; the row remembers everything for the audit trail. Dismissed/resolved flags can be reopened or deleted-forever. **Closes the student quality loop.** **(4) Student-side flag wiring.** The "Report this question" button on the Report page's Wrong Answered tab (which has been a no-op placeholder since S1.3 — buyer fix ST-3) now opens a real **FlagQuestionModal** (six-reason picker as 2-col grid + free-text note + send), files a flag via `flagsStore.addFlag()` with a stem snapshot, and the button collapses into a green "Reported — thanks" state so the student knows it landed. Admins immediately see the flag in `/admin/flags` with a live count badge in the sidebar. **(5) Architecture choices.** Same shell as Author Console, separate URLs for clarity. Backend changes minimal — flags + review queue stay frontend-only (Zustand+persist), only user role management hits the DB. Seven new lucide icons (ShieldCheck, Users, Flag, Inbox, etc.) in AuthorShell. New `'reject'` AuditAction + verb/icon/tone in AuthorHistory's ACTION_META. Type-checks clean (frontend + backend). Smoke-test: `GET /api/admin/users` as Ravi (author) → 403 "This endpoint requires role: admin"; as Meera (admin) → returns full user list. Admin nav section invisible to authors; Tier-1 done. **Deferred to future rounds:** invite-new-user / suspend-user (Tier 1.5), platform-health dashboard (Tier 2.5), mastery engine config + bulk ops + CSV export (Tier 3). |
| 2026-05-08 | B-series refinement #3 — Exam (curated test paper) entity + tabbed Exam page | **Brought back the curated-test-paper concept under a clearer model: "Exam" is now a specific test paper, distinct from "Track" (syllabus container) and "Paper Pattern" (formerly ExamFormat — duration / Q-count / marking template).** New `Exam` type: `{ id, trackId, name, description, paperPatternId \| null, custom* (durationMinutes / totalQuestions / markingMcq / markingNumerical), questionIds[], isPublished, archivedAt }`. New `examsStore` (Zustand+persist v1, audit-wired) with full CRUD + ordering. **Sidebar:** "Exam Formats" → **"Exam"** (`ClipboardList` icon). New **`/author/exam`** tabbed parent page (React Router `<Outlet />`) with two sub-routes: **`/patterns`** (the existing AuthorFormats UI, relabeled "Paper Pattern" everywhere — "New format" → "New pattern", banner copy explains a pattern locks duration/Q-count/marking on an Exam) and **`/list`** (new AuthorExamList: cards showing track + pattern badge + Q-count progress "5/30" + duration + marking summary + admin-only Publish toggle + warning chips for incomplete / unavailable questions). **`/author/formats` legacy alias** redirects to `/author/exam/patterns`. New **AuthorExamBuilder** (`/author/exam/new` and `/author/exam/:examId`) — single scrollable page with three numbered sections: (1) **Basics** — Track + Name + Description; (2) **Source** — two cards "Use a paper pattern" (locks duration / Q-count / marking) vs "Custom" (unlocks them as editable fields with MCQ + optional Numerical marking); (3) **Questions** — ordered list with reorder/remove + two add buttons. **"Write new question"** opens the existing `QuestionFormModal` and saves to the global question bank AND appends the new id; **"Pick from bank"** opens new **`BankPickerModal`** with cascading subject → chapter → topic filters + difficulty/type pills + search, **track-scoped** (questions outside the exam's track don't appear) — multi-select with already-added rows shown disabled. Live counter "5/30" with amber warning when pattern requires a fixed Q-count and you haven't matched it; save button disabled until counts match. Sticky save bar shows pattern-locked vs custom marking summary; post-save lands on `/author/exam/list`. **Audit:** revived `'exam'` AuditEntityType (no longer deprecated) — every exam create/update/publish/archive/add-question/remove-question/reorder logs to `/author/history`. **Student side:** new **`/exams`** route (`StudentExams` page) listing every published, non-archived exam with at least one resolvable question — cards filtered by Track (when >1 track has exams), each showing track badge, pattern label or "Custom" badge, Q-count, duration, marking summary, "Start" CTA. Added "Exams" to top-nav (desktop secondary row) and bottom mobile nav (now `grid-cols-4`). **`/quiz/exam/:examId`** wired into `TestQuiz` — branches on params, resolves `exam.questionIds` against `questionsStore` (skips archived/deleted), header shows track name + Q-count, exit nav routes back to `/exams`, auto-grades on submit because every Question carries `correctAnswer`. Type-checks clean; HMR through both dev servers running. |
| 2026-05-08 | B-series refinement #2 — Exam → Track rename + TestTemplate removal | **Renamed the top-of-tree entity Exam → Track and removed TestTemplate entirely (exams now fulfill that role — see refinement #3).** New `Track` type with `kind: 'class-stream' \| 'competitive'` plus optional `classLevel` + `stream` fields for class-stream tracks. **Seeded 4 tracks**: JEE Main + NEET (UG) (competitive — wrap the existing PCM + NEET subjects), Class 11 PCM + Class 12 PCB (class-stream — empty syllabus for authors to populate). Subject.examId → Subject.trackId. **`hierarchyStore`** persist v3→v4 migrator reshapes legacy `exams[]` localStorage state into `tracks[]` defaulting to `kind: 'competitive'` (best-guess for old records). **Deleted entirely**: `templatesStore.ts`, `pages/author/AuthorTests.tsx`, `pages/author/AuthorTestBuilder.tsx`, `pages/author/AuthorExams.tsx`, `data/exams.ts`. Legacy `/author/tests/*` and `/quiz/test-template/:id` routes removed. Custom Test Builder lost its "Author-curated tests" section (replaced cleanly by the new student `/exams` page in refinement #3). New **`/author/tracks`** page (`AuthorTracks`) with kind picker (two cards: Class stream vs Competitive), conditional classLevel + stream inputs, and the same publish gating + Paper Pattern selector as the old AuthorExams. Sidebar: "Exams" → "Tracks" (`Compass` icon). All consumers updated: AuthorTopics (track selector + chips), AuthorQuestions (cascading filter track → subject → chapter → topic with breadcrumbs), QuestionFormModal (cascading picker uses tracks), AuthorImports + `lib/importValidation.ts` (track-aware topic resolution), AuthorDashboard (counts grid drops `testTemplates`, adds `tracks`), AuthorHistory (`'track'` icon added; `'exam'` + `'template'` kept as legacy aliases for older audit entries). Backend `/api/author/stats` returns `tracks: 4` shape. **Type alias `LegacyExamAlias = Track`** kept transiently so old code that named the type `Exam` still compiles during migration; refinement #3 reused the name `Exam` for the new curated-test-paper entity (no clash since `LegacyExamAlias` is the only export). Type-checks clean; both dev servers up. |
| 2026-05-04 | B-series refinement #1 — ExamFormat as a first-class entity | **Flaw closed:** AuthorExams asked for an exam name with no way to specify the paper format. Now: every exam has a `formatId` pointing to a reusable `ExamFormat` (duration · totalQuestions · MCQ marking · numerical marking · isSystem flag). **6 system formats seeded**: JEE Main (75 Q · 180 min · MCQ +4/−1 · Num +4/0), JEE Advanced placeholder, NEET (UG) (180 Q · 200 min · MCQ +4/−1, no numerical), GATE (65 Q · 180 min · MCQ +1/−⅓ · Num +1/0), Topic Test default, Custom Quiz default. New **`formatsStore`** (Zustand+persist, audit-wired) with `addFormat`, `updateFormat`, `archiveFormat`, `restoreFormat`, `restoreSystemFormat` (reverts a system format back to its seeded values — the safety net for fat-fingered edits per Decision (a)), `resetAll`. New **`/author/formats`** page with list, create/edit modal (name, description, duration, total Q-count, MCQ correct/wrong, optional numerical correct/wrong), `Restore default` button visible on system formats only when they've diverged from seed. New **"Exam Formats"** sidebar nav item with `Layers` icon between Exams and Topics. **AuthorExams** create/edit modal gains a format dropdown + "Manage formats →" inline link, plus a stats preview card showing the picked format's spec. **AuthorTestBuilder** replaces the old 2-option markingScheme picker with a full format selector (cards showing system/custom badge + marking math + suggested duration/Q-count); switching exam auto-picks the new exam's default format. **TestTemplate** type adds `formatId` (required); legacy `markingScheme` deprecated but kept for v1→v2 migration. **`hierarchyStore`** persist v2→v3 migrator backfills `formatId` for any existing persisted exam by name match (`inferFormatIdFromExamName`). **`templatesStore`** persist v1→v2 migrator derives `formatId` from old `markingScheme`. **AuditEntityType** gains `'examFormat'` (with `Layers` icon in AuthorHistory). **AuthorDashboard** counts grid expands from 7 → 8 cells with new "Formats" count. Build clean: 517KB raw / 137KB gzip. **Deferred (separate flaw):** wiring the format's marking math into `quizStore.submit()` — today's scoring is still difficulty-weighted regardless of format. Will surface as a follow-up flaw fix when the user notices. |
| 2026-05-04 | B7 (Audit trail — B series fully closed 🎉) | **Every author write is now recorded.** New `AuditEntry` type + `auditStore` (Zustand+persist, 1000-entry cap) + `auditLog()` helper that auto-captures actor from authStore. **Wired into all three content stores**: hierarchyStore (exam/subject/chapter/topic/subtopic — every add/update/archive/restore/reorder/move + reset-seed), questionsStore (add/update/archive/restore/delete + reset-seed), templatesStore (add/update/archive/restore/delete + addQuestionToTemplate/removeQuestionFromTemplate/reorderQuestionInTemplate + reset). Special-cased publish/unpublish actions on exam + template updates so the history reads cleanly. **`/author/history` page** (replaces placeholder): chronological list grouped by date (Today / Yesterday / 23 May 2026), per-entry row shows actor + role + verb + entity badge + label + time, expand-to-see-details panel showing JSON of `details` field (changed keys, direction, from/to for moves, etc.). Filter bar: search (entity name + actor + type + action), entity-type chips (all 7), action chips (all 12), actor chips (auto-populated from distinct actors). Admin-only "Clear all" button (with permanent-delete confirm). Bundle: 498KB raw / 133KB gzip. **B series fully done — A1–A10 powers all live except A2/A3/A4/A6/A8 (intentionally dropped).** |
| 2026-05-04 | B6 (Test template editor — closes the author→student loop) | **Authors can hand-pick questions into a named test; students see published templates inside Custom Test and launch them in one click.** New `TestTemplate` type with `examId`, ordered `questionIds[]`, `durationMinutes`, `markingScheme: 'jee-main' \| 'topic'`, `isPublished` (admin-gated), `archivedAt`. New `templatesStore` (Zustand+persist) with full CRUD + question ordering inside templates (add/remove/reorder). **`/author/tests`** list page — per-template cards showing exam · Q-count · duration · marking scheme · publish toggle (admin-only) · archive/restore · "Empty"/"All Qs missing"/"N missing" warning badges. **`/author/tests/new` + `/author/tests/:id`** full-page builder with side-by-side layout: left = filterable question pool (exam-scoped, search + difficulty + type chips, click + to add); right = selected ordered list (Q1, Q2... with up/down arrows, X to remove). Top metadata bar: name · exam · duration · description · marking-scheme picker (Difficulty-weighted vs JEE Main +4/−1). Switching exams clears selection (with confirm) — templates are exam-scoped by design. **`TestQuiz` page** taught to handle BOTH `/quiz/test/:topicId` (existing) and `/quiz/test-template/:templateId` (new) — branch on params, resolve `template.questionIds` against `questionsStore` (skipping archived/deleted), use template's duration + marking scheme + name, exit navigates back to `/custom-test` for templates. **`CustomTestBuilder`** gets an "Author-curated tests" section above the existing builder — only shows templates that are published, not archived, AND have ≥1 resolvable question (no broken tests reach students). Each card: name · exam · Q-count (with "(N unavailable)" if some are missing) · duration · marking scheme · one-click launch. Build: 483KB raw / 130KB gzip. **The author→student loop is now closed**: Ravi creates a test → Meera publishes it → Vedant sees it in Custom Test → takes it → lands on the regular Report. |
| 2026-05-04 | B5 (Bulk CSV/JSON import) | **`/author/imports` is fully functional.** New utilities: `lib/csv.ts` — small RFC-4180-ish CSV parser (~80 LOC, no dep) handling quoted fields, escaped `""`, CRLF, blank lines + a `toCsv` writer for the sample template; `lib/importValidation.ts` — `validateRows()` resolves topic by `topicId` (preferred) or `topicName` (fallback, errors on ambiguity), normalises difficulty/type/format case-insensitively, accepts MCQ correctAnswer as A/B/C/D, 0-3, 1-4, or option text, dup-detects within the CSV via stem hash, reports per-row errors+warnings + builds `QuestionDraft`s for valid rows. **`AuthorImports` page**: drag-and-drop file zone + click-to-browse + inline-paste textarea (auto-detects CSV vs JSON by first char), "Download CSV template" button (writes a 2-row sample with both MCQ + numerical examples), expandable format-reference table listing every column + requirements, validation results card with `valid/warning/error/duplicates` summary chips + status filter chips, per-row table with status icon + resolved topic breadcrumb + stem preview + inline error/warning lists, "Import N valid rows" action that batches into `questionsStore.addQuestion()`, post-import success card with "See them in Questions →" link. JSON import auto-supported (array of objects with same column names, coerced to strings). Build: 456KB raw / 124KB gzip. |
| 2026-05-04 | B3 finish + B4 (Subject CRUD + Question CRUD with image upload) | **Author can now manage Subjects (B3 finish) and Questions (B4) end-to-end.** **B3 finish**: AuthorTopics gained per-subject action menu (Edit name / Move left / Move right / Archive / Restore) revealed on hover, plus a "+ Add subject" pill at the end of the tab strip. New `SubjectFormModal` (name-only, scoped to the active exam). `showArchived` toggle now also surfaces archived subjects (italic, "archived" badge). All wired to the exam-aware `addSubject`/`updateSubject`/`archiveSubject`/`restoreSubject`/`reorderSubject` store methods from C1. **B4**: New `Question.archivedAt` + `Question.imageDataUrl` + `createdAt` + `updatedAt` optional fields. New `questionsStore` (Zustand + persist) seeded from `/data/questions.ts` with `addQuestion`/`updateQuestion`/`archiveQuestion`/`restoreQuestion`/`deleteForever`/`resetToSeed`. **`AuthorQuestions` page** (replaces placeholder) — search bar (stem/solution/topic) + cascading exam→subject→chapter→topic filters + difficulty + type + archived chips, question cards with image thumbnails + intrinsic tags + breadcrumb (`Exam › Subject › Chapter › Topic`) + edit/archive/restore actions. **`QuestionFormModal`** — full editor with sectioned form: cascading topic picker (Exam→Subject→Chapter→Topic→optional Subtopic) with auto-snap-to-first when parent changes, MCQ/numerical format toggle, 4 option editor with radio-button correct-marker (or numerical input), Difficulty + Type pill groups, image upload with base64 conversion + 200KB warning + remove/replace, Solution textarea, optional estimated-solve-time, **live preview toggle** showing exactly what students will see (tags, image, options with correct highlighted, solution panel), validation summary listing what's missing. **AuthorDashboard counts go live** — exams/subjects/chapters/topics/subtopics/questions now read directly from the local stores so author edits reflect instantly (the backend stub still serves the placeholder `testTemplates: 0`). Build: 434KB raw / 119KB gzip. |
| 2026-05-04 | C1 (Multi-exam pivot — foundation) | **Product is no longer JEE-only — multi-exam from day 1.** Hierarchy bumped to 5 levels: Exam → Subject → Chapter → Topic → Subtopic. Each exam owns its syllabus (Decision Q1=a — JEE Physics ≠ NEET Physics). Decisions locked: Q1=a (exam owns subjects), Q2=b (multi-exam students supported, Option B), Q3=b (authors create exams; admin gates publishing). **Frontend types**: new `Exam` interface with `isPublished` + `archivedAt`; `Subject.examId` required. **Frontend data**: new `exams.ts` with seeded JEE Main (wraps existing 3 subjects + 75 topics + 150 subtopics) and NEET (UG) (placeholder syllabus — Physics/Chem/Biology shells). **hierarchyStore**: full refactor to `exams[]` root with all original chapter/topic/subtopic CRUD preserved + new exam-level + subject-level CRUD (add/update/archive/restore/reorder). Persist version bumped to v2; v1 state migrated to fresh seed. **Author sidebar**: new "Exams" nav item above "Topics". **AuthorExams page**: list with reorder + archive + restore + create/edit modal. Publish toggle (admin-only — author sees disabled with tooltip explaining why). **AuthorTopics**: exam selector pills above subject tabs; switching exam snaps the active subject to the new exam's first. Empty-state when an exam has no subjects yet. **AuthorDashboard**: Exams count chip added to the 7-column counts grid. **Backend `/api/author/stats`**: now reports exams + correct subject/chapter/topic/subtopic counts across both seeded exams. Build clean: 401KB raw / 111KB gzip. Student-side multi-exam UX (exam picker, mixed dashboard) deferred to C2. |
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
