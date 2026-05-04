# File 1: User Persona & Capability Framework

> **Project:** JEE Prep Quiz App (v1)
> **Phase:** 2 — Design
> **Scope:** Physics-only, responsive web, Google sign-in, online-only
> **Source spec:** `REQUIREMENTS.md` v1.1

---

## 1. Context Summary

The JEE Prep Quiz App is built by a JEE aspirant for JEE aspirants. Its job is not to test memory but to expose *where* a student's thinking breaks down — through tagged questions (difficulty × type), two distinct quiz modes (Practice vs Test), an adaptive difficulty engine driven by a per-topic mastery score, and a post-submission report with a heatmap and skip-reason analytics. v1 ships Physics only on a responsive web app, with Google sign-in, ~150–200 questions per topic from PYQs + self-authored content.

Phase 2 (Design) builds pages and components with **dummy data**. The personas below are the concrete actors those pages and components must serve.

---

## 2. Persona Catalogue

The student base is **not monolithic**. Two students can share the same UI but use it on completely different rhythms — daily 10-min bursts vs monthly 4-hour cram sessions; speed-first vs depth-first; Practice-only vs Test-heavy. v1 ships **one Student UI**, so it must serve all of these archetypes without forking. Below: 9 distinct student personas (P1, P2, P7–P13), 3 operational personas (P3–P5), 1 deferred (P6).

### 2.1 Student personas (end users)

| ID | Persona | Archetype | Cadence | Session length | Mode bias |
|---|---|---|---|---|---|
| **P1** | **Vedant — The Daily Aspirant** | Primary end user; balanced learner | Daily | 20–60 min | Mixed Practice + Test |
| **P2** | **Asha — The Returning Self-Studier** | Secondary; long planning sessions | Weekly long sessions | 60–120 min | Diagnostic-driven |
| **P7** | **Arjun — The Quick Solver** | Speed-biased; high accuracy, gets bored | Daily | 30–45 min | Test-heavy |
| **P8** | **Sanya — The Methodical Learner** | Depth-biased; reads every solution | Daily (sometimes skips) | 60–90 min | Practice-heavy |
| **P9** | **Karthik — The Streak Builder** | Habit-driven micro-user, time-poor | Daily micro | 10–15 min | Practice |
| **P10** | **Neha — The Test-Phobic Student** | Anxiety-sensitive; theory-strong | Practice daily / Test rarely | 30–60 min | Practice-only by default |
| **P11** | **Rohit — The Cram Sprinter** | Burst-pattern; pre-exam intense user | Monthly baseline → daily burst | 2–4 hr in burst | Test-heavy in burst |
| **P12** | **Pooja — The Coaching Supplement** | Targeted gap-filler alongside coaching | Weekly (post-class) | 30–60 min | Topic-level Practice |
| **P13** | **Aarav — The Drop-In Revisiter** | Sporadic; long gaps then short returns | Monthly with multi-month gaps | Variable | Diagnostic then Practice |

### 2.2 Operational personas (internal)

| ID | Persona | Archetype | Primary Surface | In v1? |
|---|---|---|---|---|
| **P3** | **Ravi — The Content Author / Curator** | Internal Power User | Authoring console (lightweight) | ✅ Yes (operational) |
| **P4** | **Meera — The System / Platform Admin** | Internal Admin | Admin console + analytics | ✅ Yes (minimal) |
| **P5** | **The Adaptive Engine** | System / AI Agent | Backend service consumed by quiz UI | ✅ Yes |

### 2.3 Deferred (out of v1 scope, captured for future-proofing)

| ID | Persona | Archetype | Notes |
|---|---|---|---|
| **P6** | **Priya — The Parent / Guardian (lurker)** | Observer | No separate login in v1; design must not preclude a future read-only share view |

> The 9 student personas all share the **same web UI and the same permissions** (see §4). They differ in *cadence*, *session length*, *mode bias*, *speed*, *risk tolerance*, and *what makes them drop off*. Each one stresses a specific design surface — covered in §3 profiles, illustrated in §8 workflows, and summarized in the §8.A *Design Implications by Persona* matrix.

---

## 3. Persona Profiles

### P1 — Vedant: The JEE Aspirant (Primary)

| Field | Detail |
|---|---|
| **Name / role** | Vedant, Class 11 student preparing for JEE Main 2027 |
| **Archetype** | Primary End User — the spec is literally written in his voice |
| **Background** | Indian high-school student. Strong NCERT theory base. Has done a few mock tests; good at memorization, weaker at unfamiliar problem framings. |
| **Goals** | (1) Find which topics he's actually weak in, not what he assumes. (2) Drill those topics at the right difficulty. (3) Build exam-day stamina via timed tests. |
| **Motivations** | Crack JEE Main; long-term goal of a top engineering seat. Short-term: improve mock-test percentile every two weeks. |
| **Pain points** | Walls of generic questions on existing apps; no insight into *why* he gets things wrong; can't tell if a wrong answer was a concept gap, formula slip, or misread. |
| **Behavioural traits** | Studies late at night; short, frequent sessions on phone; longer sessions on laptop on weekends. Will abandon a flow that needs more than 1 click to start a quiz. |
| **Tech proficiency** | High for his age — comfortable with web apps, Google sign-in, navigation; expects good keyboard shortcuts on laptop and tap-friendly UI on phone. |
| **Devices** | Phone (primary, weekday), laptop (weekend long sessions). |
| **Usage scenarios** | (a) 20-min Practice drill on *Rotational Motion* before bed. (b) Full 3-hour JEE-Main format Test on Sunday. (c) Post-test report review on Monday morning. |

---

### P2 — Asha: The Returning Self-Studier (Secondary)

| Field | Detail |
|---|---|
| **Name / role** | Asha, Class 12 student in a self-study cycle |
| **Archetype** | End User — same surface as P1, different usage rhythm |
| **Background** | Took a year-long coaching break; now revising independently. Has prior mastery in some chapters, totally rusty in others. |
| **Goals** | Diagnose stale chapters fast; rebuild confidence on weak ones before mocks. |
| **Motivations** | JEE Advanced eligibility cutoff; wants signals on which chapters need urgent attention. |
| **Pain points** | Forgets where she left off; needs a fast "what's weak?" view. Doesn't want to re-do mastered chapters. |
| **Behavioural traits** | Long study sessions (60–120 min); reads solutions carefully; uses heatmap as a planning tool. |
| **Tech proficiency** | Medium-high. |
| **Usage scenarios** | (a) Opens dashboard, sorts topics by lowest mastery, attempts those. (b) Custom Test across 3 weak chapters. (c) Reviews "Wrong Answered Questions" filtered by *Hard + Conceptual*. |

> P1 and P2 share the same UI and capabilities. They are distinguished because **their journeys differ** (File 2 §2.4) and the same screen must serve both: low-friction quick-start *and* power planning. The seven student personas that follow (P7–P13) extend this principle further — same UI, sharply different rhythms.

---

### P7 — Arjun: The Quick Solver / Speed Demon

| Field | Detail |
|---|---|
| **Name / role** | Arjun, Class 12, math-strong, fast solver |
| **Archetype** | End User — speed-biased; high-accuracy, low-patience |
| **Background** | Always finishes school tests first. Strong calculator, sharp pattern-matcher. Already comfortable with Easy and most Medium Qs. |
| **Goals** | Spend as little time as possible on Easy; reach Hard / JEE-Advanced-level Qs quickly; push his ceiling. |
| **Motivations** | Bored by content below his level; chasing the *hardest* Qs is the dopamine. |
| **Pain points** | Adaptive engine takes 2–3 attempts to escalate to Hard band — feels like waste. Speed produces silly mistakes (sign errors, unit slips) that he doesn't introspect on because he doesn't read solutions. |
| **Behavioural traits** | 30–45 min sessions; 30–50 Qs at a time; rarely opens *Show solution* after correct answers; submits Test mode 20–30 min before expiry. Prefers keyboard nav over taps. |
| **Tech proficiency** | High; uses keyboard shortcuts; multi-tab workflow. |
| **Devices** | Laptop primary; phone for quick checks only. |
| **Cadence** | Daily, 5–7 days/week. |
| **Usage scenarios** | (a) 40-Q Practice on a familiar topic, mostly Hard band requested. (b) Full JEE Main mock finished in 2:15. (c) Custom Test: *Hard only* on a single weak subtopic. |
| **Stress on design** | Manual difficulty override (or a "skip easy ones" toggle); time-per-Q vs accuracy comparison surfaced honestly so speed-induced slip-ups become visible. |

---

### P8 — Sanya: The Methodical Learner / Deep Solver

| Field | Detail |
|---|---|
| **Name / role** | Sanya, Class 11, careful and thorough |
| **Archetype** | End User — depth-biased; slow, retains well once learned |
| **Background** | Builds mental models slowly; once she gets a concept, it sticks. Strong at NCERT theory; nervous on unfamiliar framings. |
| **Goals** | Truly understand each question; not just answer it. Build a clean conceptual base before chasing speed. |
| **Motivations** | Long-term retention over short-term scores; trusts depth more than volume. |
| **Pain points** | Time pressure makes her freeze. The "time per Q vs target" metric in reports feels like a judgement, not a learning signal. Auto-submit in Test mode is genuinely upsetting. |
| **Behavioural traits** | 60–90 min sessions; only 10–15 Qs; **always** opens *Show solution*; cross-references the concept link before moving on. Will re-attempt the same wrong Q a week later to verify she actually understood. |
| **Tech proficiency** | Medium. |
| **Devices** | Laptop, often with a notebook + NCERT PDF open beside. |
| **Cadence** | Daily, occasionally skips a day to "digest." |
| **Usage scenarios** | (a) 12-Q Practice on Thermodynamics, ~7 min/Q including solution reading. (b) Avoids Test mode unless a school mock is approaching. (c) Re-reviews the Wrong Answered list days after the original quiz. |
| **Stress on design** | Solution viewer must be rich (steps, formulas, optional concept-link) and not penalize time spent on it. Time-per-Q must be presented as data, not verdict. A "review later" or bookmark equivalent helps her come back to wrongs. |

---

### P9 — Karthik: The Streak Builder / Micro-User

| Field | Detail |
|---|---|
| **Name / role** | Karthik, Class 11, schedule-packed (school + offline coaching + family) |
| **Archetype** | End User — habit-driven, micro-session student |
| **Background** | Genuine intent, very little uninterrupted time. Studies in stolen 10–15 min windows: bus, between classes, before bed. |
| **Goals** | Maintain *daily contact* with the syllabus, even if just one short quiz. Avoid the guilt-spiral that comes from missing days. |
| **Motivations** | The daily "I did something" win; fear of falling behind classmates. |
| **Pain points** | Anything that needs >30 seconds of setup gets abandoned. Loses progress when his bus arrives. Long onboarding flows kill him. |
| **Behavioural traits** | 10–15 min daily; 5-Q quizzes preferred; phone-only; one-handed use; often interrupted mid-quiz. |
| **Tech proficiency** | Native mobile user; impatient with slow loads, modal stacks, or anything that breaks one-handed flow. |
| **Devices** | Phone almost exclusively. |
| **Cadence** | Daily, very short. Misses days are a meaningful drop-off risk. |
| **Usage scenarios** | (a) Opens app on the bus → resumes a paused 5-Q Practice from yesterday. (b) Glances at the heatmap to feel "I'm tracking progress." (c) During a 10-min coaching break, knocks out 3 Qs. |
| **Stress on design** | "Resume last quiz" must be the top dashboard card. 5-Q micro-quiz preset. Network-drop tolerance for spotty mobile data. Tap targets sized for one-thumb operation. Streak counter (§6.5 deferred — he'd love it; until then the design must not feel barren). |

---

### P10 — Neha: The Anxious / Test-Phobic Student

| Field | Detail |
|---|---|
| **Name / role** | Neha, Class 12, theory-strong but freezes in timed mode |
| **Archetype** | End User — practice-biased, anxiety-sensitive |
| **Background** | Knows the material cold. School internals: 90+. Mock JEE: 50th percentile. The gap is purely test psychology. |
| **Goals** | Build confidence with timed problems gradually; eventually be able to attempt Test mode without panic. |
| **Motivations** | Dread of the real exam; the app should be a *safe place to fail* before the real one. |
| **Pain points** | Test-mode countdown turning red destroys her focus. Auto-submit feels like punishment. The phrase "Time's up" triggers the same anxiety pattern as a real exam. |
| **Behavioural traits** | 80% Practice / 20% Test (and that 20% is reluctant). Takes Test only just before a school mock. In Practice, opens *Show solution* heavily — even on correct answers, to verify reasoning. Re-attempts the Wrong Answered list 2–3 times to overlearn. |
| **Tech proficiency** | Medium. |
| **Devices** | Mix of phone (Practice) and laptop (Test, when forced). |
| **Cadence** | Practice daily; Test ~once a month. |
| **Usage scenarios** | (a) 40-min Practice on a broad chapter, no time anxiety. (b) Reluctantly takes one short Custom Test (30 min, 15 Qs) the day before a school mock. (c) Re-attempts last week's wrong Qs in Practice to lock in the corrections. |
| **Stress on design** | Test-mode tone matters — countdown copy should be neutral, not "Time's up!"-style alarming. A "Practice with timer" intermediate (Practice rules + visible stopwatch as soft pressure) would bridge her into Test mode. Reports must lead with diagnostic insight, not the score, so a low number doesn't shut her down on first scroll. |

---

### P11 — Rohit: The Cram Sprinter / Pre-Exam Burst User

| Field | Detail |
|---|---|
| **Name / role** | Rohit, Class 12, splits attention between board exams and JEE |
| **Archetype** | End User — burst-pattern student |
| **Background** | Long stretches of inactivity (weeks of board prep, family commitments), then 7–10 days of intense use before each mock or exam window. |
| **Goals** | Rapid weak-spot diagnosis on return; densely cover those weaknesses in the compressed window. |
| **Motivations** | Survive the next deadline; minimize regret on exam day. |
| **Pain points** | After a 6-week gap, his heatmap is stale — he doesn't know if the "65" on Magnetism still reflects his actual mastery or not. Burst weeks are physically exhausting; UI friction at hour 3 is a real cost. |
| **Behavioural traits** | Monthly baseline (1–2 light sessions) → daily 2–4 hour bursts during burst weeks. Mixes Practice + Test heavily during bursts. Skips solutions during bursts to maximize Q-volume. |
| **Tech proficiency** | High. |
| **Devices** | Laptop during bursts; phone during the dormant baseline. |
| **Cadence** | Monthly baseline; bursts ~once every 4–8 weeks. |
| **Usage scenarios** | (a) Returns from 6-week gap → diagnostic mock to refresh mastery before planning. (b) Drills the bottom-5 weakest topics on consecutive days. (c) Day before exam: full JEE-Main format mock for stamina. |
| **Stress on design** | A "return refresher" diagnostic on long gaps. Mastery confidence indicator that ages — e.g., "scored 65 on Magnetism, but last attempt was 6 weeks ago." Burst-week ergonomics: dark mode (§6.8 deferred), low-glare report views, fast keyboard nav. |

---

### P12 — Pooja: The Coaching Supplement User

| Field | Detail |
|---|---|
| **Name / role** | Pooja, Class 11, attends offline coaching (FIITJEE / Allen / Resonance class) |
| **Archetype** | End User — supplementary use, narrow scope |
| **Background** | Coaching gives her structure (lectures, weekly tests, DPPs). The app is a *supplement* — fills gaps coaching missed, drills chapters covered this week, lets her re-test concepts she got wrong on a coaching DPP. |
| **Goals** | Targeted, chapter-level practice between coaching sessions. Avoid redundancy with coaching's own DPPs. |
| **Motivations** | Doesn't want to fall behind in the coaching cohort; uses the app to plug specific weak spots she identifies in coaching. |
| **Pain points** | Doesn't need full mocks (gets those at coaching). Topic browsing must be fast. Worried about doing the *same* PYQs the coaching uses — wants distinct content. |
| **Behavioural traits** | 30–60 min weekly sessions; almost always topic-level Practice; rarely uses Test mode (uses coaching mocks). Often arrives knowing exactly which topic she wants. |
| **Tech proficiency** | Medium-high. |
| **Devices** | Phone for short sessions, laptop for longer ones. |
| **Cadence** | Weekly, ~2–3 sessions a week, usually after coaching classes. |
| **Usage scenarios** | (a) Coaching covered Rotational Motion this week → 30-Q Practice on it. (b) Got a tough Q wrong in coaching DPP → searches for similar Qs in the app. (c) Reviews mastery before the next coaching test to identify weak chapters. |
| **Stress on design** | Topic search / quick-jump must be fast. Practice mode flexibility matters more than Test mode. PYQ tagging (§6.1 deferred) would let her filter coaching-overlap content. Mastery view should be readable without first taking a quiz, since she often arrives just to check. |

---

### P13 — Aarav: The Drop-In Revisiter / Returning Lapsed User

| Field | Detail |
|---|---|
| **Name / role** | Aarav, Class 12, returning after a 2-month gap (board exams, family event, lost motivation, etc.) |
| **Archetype** | End User — sporadic; re-onboarding repeatedly |
| **Background** | Comes back unsure where he left off. Was active 2–3 months ago, has stale mastery scores, doesn't know what he's forgotten. |
| **Goals** | Figure out where he left off; identify what's gone stale; rebuild confidence on a few topics before deciding whether to commit to a daily routine again. |
| **Motivations** | Guilt + intent to restart. Needs a low-friction re-entry that doesn't lecture him about his absence. |
| **Pain points** | Heatmap shows old mastery scores he no longer trusts. Doesn't know if "65" still means he's solid or if he's forgotten everything. The dashboard feels foreign after a long gap. |
| **Behavioural traits** | Monthly visits with multi-month gaps. First session back is exploratory ("what's still here?"); second session, if it happens, is action. Many Aaravs never come back for a second session — that's the design risk. |
| **Tech proficiency** | Medium. |
| **Devices** | Whatever's at hand. |
| **Cadence** | Monthly with multi-month gaps. |
| **Usage scenarios** | (a) Logs in after 8 weeks → app shows "Welcome back. Last quiz: 8 weeks ago. Suggested: refresher diagnostic." (b) Takes a 15-Q diagnostic → fresh mastery anchors replace stale ones. (c) Drills 1–2 of the freshly identified weak topics. |
| **Stress on design** | Re-entry experience matters most. A non-judgmental "welcome back" with a clear suggested action. Mastery freshness indicator (so old scores don't mislead). No streak shaming, no guilt copy. The first session back must end with a *clear win* or he won't return. |

---

### P3 — Ravi: The Content Author / Curator

| Field | Detail |
|---|---|
| **Name / role** | Ravi, internal content author (could be Vedant himself, a friend, or hired help) |
| **Archetype** | Internal Power User — produces and tags the question bank |
| **Background** | Subject knowledge in Physics; familiar with JEE syllabus and PYQ patterns. |
| **Goals** | Hit the ~150–200 questions/topic target; ensure every question carries correct difficulty + type tags; cover all chapters/topics evenly. |
| **Motivations** | Adaptive engine fails without volume + correct tags; this is the longest pole in v1 (§9.2 of spec). |
| **Pain points** | Tagging fatigue; ambiguity between *Conceptual* and *Analytical*; risk of importing PYQs without consistent metadata. |
| **Behavioural traits** | Bulk-imports PYQ datasets, then fills gaps with self-authored items. Reviews preview rendering (LaTeX, units) before publishing. |
| **Tech proficiency** | High; comfortable with CSV/JSON imports, Markdown, basic LaTeX. |
| **Usage scenarios** | (a) Bulk-import PYQs from a CSV. (b) Author a single new question with full metadata. (c) Edit a question whose answer is reported as wrong by users. |

---

### P4 — Meera: The System / Platform Admin

| Field | Detail |
|---|---|
| **Name / role** | Meera, platform admin (likely Vedant + 1 collaborator in v1) |
| **Archetype** | Internal Admin |
| **Background** | Owns deployment, user accounts, format templates, and aggregate health metrics. |
| **Goals** | Keep the app up; spot bugs in mastery scoring; manage format templates (JEE Main, Topic, Custom); revoke abusive accounts if any. |
| **Motivations** | v1 launch reliability; clean signal when something goes wrong. |
| **Pain points** | Can't debug a learning loop without per-user attempt logs; needs visibility into adaptive-engine outcomes. |
| **Behavioural traits** | Lightweight involvement in v1 — most admin tasks are infrequent. |
| **Tech proficiency** | High. |
| **Usage scenarios** | (a) Add a new format template. (b) Read aggregate mastery distributions to validate the adaptive engine. (c) Revoke a Google-signed-in account. |

---

### P5 — The Adaptive Engine (System Agent)

| Field | Detail |
|---|---|
| **Name / role** | Backend service: question selector + mastery updater |
| **Archetype** | System / AI Agent (deterministic in v1 — no LLMs) |
| **Background** | Reads/writes the per-topic mastery score (§5.5.1) and uses it to bias next-question difficulty (§5.5.2). |
| **Goals** | (1) Pick the next question's difficulty band correctly. (2) Update mastery accurately after each attempt. (3) Surface signals (heatmap inputs) to the report layer. |
| **Pain points** | Cold-start (first attempt has no history); thin question bank in some topics; ambiguous tags. |
| **Behavioural traits** | Format-independent mastery formula; uses last-3-attempts rolling average; no automatic decay in v1. |
| **Tech proficiency** | N/A — capability described in §4.5 below. |

---

### P6 — Priya: Parent / Guardian (Out of v1)

Listed for completeness because real-world users will share their dashboards informally. v1 has no parent login or read-only share view; design should not block this in future but **must not** build dedicated UI for it.

---

## 4. Permissions, Powers, and Boundaries

A consolidated grid. "—" means N/A; ✅ allowed; ❌ explicitly disallowed.

> **All 9 student personas (P1, P2, P7–P13) share the same permissions** — the column "Students (all)" applies to every student archetype. Differences between Vedant, Asha, Arjun, Sanya, Karthik, Neha, Rohit, Pooja, and Aarav show up in *cadence*, *session shape*, and *which features they lean on* — not in what they're allowed to do.

| Capability | Students (all) | P3 Author | P4 Admin | P5 Adaptive Engine |
|---|---|---|---|---|
| Sign in (Google) | ✅ | ✅ (admin role) | ✅ (admin role) | — |
| Browse Subject → Chapter → Topic | ✅ | ✅ | ✅ | — |
| Launch Practice Mode quiz | ✅ | ✅ (test/QA) | ✅ (QA) | — |
| Launch Test Mode quiz | ✅ | ✅ (test/QA) | ✅ (QA) | — |
| View own attempt history & report | ✅ | own only | ✅ all (read) | — |
| View **other users'** attempt data | ❌ | ❌ | ✅ aggregate only | reads anonymized signal |
| See own mastery score | ✅ | own | ✅ all (read) | reads/writes |
| See other users' mastery scores | ❌ | ❌ | ✅ aggregate | reads (for adaptive logic, scoped to that user) |
| Tag a skipped question post-submission | ✅ (test mode skip section) | ✅ | ✅ | — |
| Tag a question mid-quiz (skip overlay) | ✅ (practice mode only) | ✅ | ✅ | — |
| Show solution mid-quiz | ✅ (practice mode, after submitting that Q) | ✅ | ✅ | — |
| See solution post-submission | ✅ (any mode) | ✅ | ✅ | — |
| Create/edit/delete a question | ❌ | ✅ | ✅ | — |
| Bulk-import PYQ dataset | ❌ | ✅ | ✅ | — |
| Edit question difficulty/type tags | ❌ | ✅ | ✅ | — |
| Create/edit Format Templates (JEE Main, Topic, Custom) | ❌ uses templates | ❌ | ✅ | — |
| Build a Custom test (pick duration + Q-count) | ✅ | ✅ | ✅ | — |
| Modify mastery formula or weights | ❌ | ❌ | ✅ (admin config) | reads only |
| Override another user's mastery | ❌ | ❌ | ✅ (only for support / bug fix) | ❌ |
| Access aggregate analytics | ❌ | ❌ | ✅ | — |
| Revoke a user account | ❌ | ❌ | ✅ | — |
| Pick the next question | — | — | — | ✅ (deterministic v1 logic) |
| Auto-tag *Conceptual gap* on overlay timeout | — | — | — | ✅ (§5.6.1) |
| Auto-tag *Ran out of time* on test expiry | — | — | — | ✅ (§5.6.2) |
| Auto-submit at countdown 0 (Test mode) | — | — | — | ✅ |
| Negative marking application | — | — | configures via template | applies per format |

### Scope of Authority — student (P1/P2)

- **Owns:** their attempts, answers, skip tags (post-submission for test mode; mid-quiz for practice), bookmarks (if §6.7 ships), choice of format template, Custom test parameters within format-allowed bounds.
- **Cannot own / change:** the question text or tags, the mastery formula, the format-template marking schemes, another user's data.

### Scope of Authority — author (P3)

- **Owns:** the question bank — text, options, correct answer, difficulty, type, chapter/topic linkage, solution markdown, optional metadata (PYQ year, NCERT flag — if §6.1 ships).
- **Cannot own / change:** user accounts, mastery scoring rules, format-template definitions.

### Scope of Authority — admin (P4)

- **Owns:** format templates, mastery-engine parameters, user-account lifecycle, content-publishing approval workflow (if added), aggregate analytics access.
- **Cannot own / change:** the contents of an individual student's *answers* — admin can revoke an account or rerun mastery if needed, but never silently rewrite answer history.

### Scope of Authority — adaptive engine (P5)

- **Owns:** next-question selection per topic; per-topic mastery score (read+write within defined formula); auto-tagging triggers (timeout, expiry).
- **Cannot:** alter the question bank; modify a student's submitted answer; apply automatic mastery decay (out of v1, per §5.5.1); operate when the topic has fewer than the minimum required questions (must surface a "thin bank" signal to the UI).

---

## 5. Actions & Capabilities

Format used per action: **Name** — Description — *Inputs* → *Outputs* — Constraints.

### 5.1 Student (P1 / P2)

#### Core actions

| Action | Description | Inputs | Outputs | Constraints |
|---|---|---|---|---|
| **Sign in** | Authenticate via Google. | Google OAuth | Authenticated session | v1: Google only (§9.3) |
| **Browse hierarchy** | Navigate Subject → Chapter → Topic. | Tap/click | Topic-level entry point with mastery indicator | Physics only in v1 |
| **Start Practice Mode** | Launch a no-time quiz on a topic / chapter / subject. | Topic ID, optional Q-count | Quiz session w/ stopwatch | No countdown; per-question solution reveal |
| **Start Test Mode** | Launch a timed quiz against a Format Template. | Format (JEE Main / Topic / Custom), scope | Quiz session w/ countdown | Format defines duration, Q-count, marking; auto-submit on timer expiry |
| **Answer MCQ** | Pick one of four options. | Option ID | Answer recorded | Single-correct only in v1 (§5.3) |
| **Answer numerical** | Type integer or short numerical value. | Numeric string | Answer recorded | Validate integer/decimal; reject non-numeric |
| **Skip a question (Practice)** | Move past unanswered → triggers blocking skip-tag overlay. | Tag selection (or 15s timeout) | Skip recorded with tag | Stopwatch pauses while overlay open; auto-tag *Conceptual gap* on timeout |
| **Skip a question (Test)** | Move past silently. | None | Skip recorded, no tag | Timer never pauses; tagging happens post-submission |
| **Reveal solution mid-quiz** | After answering, view worked solution before moving on. | Click *Show solution* | Solution rendered inline | Practice mode only |
| **Submit quiz** | End the attempt (or auto-submit on timer). | Confirmation | Post-submission report generated | Confirmation prompt if questions left blank in Practice; auto-submit silent in Test |
| **View report** | Read the post-submission report. | Quiz attempt ID | Attempt summary, per-Q breakdown, heatmap, review sections | All attempts retain reports |
| **Tag skipped questions (post-submission)** | Optionally label each skip in the report. | Tag per skipped Q | Updated heatmap signal | Test mode only; optional with nudge |
| **View per-topic mastery** | See current 0–100 score per topic. | Topic ID | Score + last 3 attempts | Format-independent |
| **View heatmap** | Topic-grid heatmap (rows: chapters/topics × cols: difficulty bands). | Subject filter | Color-coded grid | LeetCode-style (§9.5) |

#### Advanced actions

| Action | Description | Inputs | Outputs | Constraints |
|---|---|---|---|---|
| **Build a Custom test** | Configure duration + Q-count + scope. | Duration (min), Q-count, chapters/topics | Test session | v1: no per-section timers, no partial-marking rules (§5.2) |
| **Filter "Wrong Answered Questions"** | Slice the wrong-answer list by tag. | Difficulty / type filters | Filtered list | Intrinsic tags only — no self-tagging on wrong answers |
| **Filter "Skipped Questions"** | Slice by skip-reason tag. | Tag filter | Filtered list | Test mode only |
| **Re-attempt a topic** | Trigger a fresh adaptive quiz on a weak topic. | Topic ID | Adaptive quiz session | Difficulty band picked by engine |

#### Conditional / restricted actions

| Action | Why conditional | Behavior when blocked |
|---|---|---|
| **Reveal solution mid-quiz** | Practice mode only | Button hidden in Test mode |
| **Tag a wrong answer** | Not allowed by design (§5.4 item 4) | UI shows intrinsic tags only; no input field |
| **Pause Test Mode timer** | Disallowed (§5.6.2) | No pause control rendered |
| **Start a quiz on a topic with too-thin bank** | Question bank below threshold | Show banner: "Bank still being built — try a chapter-level quiz instead" |
| **See another student's data** | Privacy boundary | Not exposed in UI |

#### Automation capabilities (engine-driven, but visible to student)

| Capability | Behavior |
|---|---|
| **Adaptive next-question selection** | Engine picks next Q's difficulty band per current mastery (§5.5.2) |
| **Auto-submit on Test timer expiry** | Quiz auto-finalizes; unreached Qs auto-tagged *Ran out of time* |
| **Auto-tag *Conceptual gap*** | If student fails to pick a skip tag in 15s on the Practice overlay |
| **Auto-remove skip tag on correct revisit** | Practice mode (§5.6.1) |

#### Integration capabilities

- **Google sign-in** (OAuth) — only third-party integration in v1.

---

### 5.2 Content Author (P3)

#### Core actions

| Action | Description | Inputs | Outputs | Constraints |
|---|---|---|---|---|
| **Create question** | Author a new question with full metadata. | Stem, options/numeric answer, correct answer, difficulty, type, topic, solution | Question record | Required fields validated |
| **Edit question** | Modify an existing question. | Question ID + fields | Updated record + audit entry | Edits should not silently invalidate past answers — see §7 |
| **Delete question** | Remove a question from active pool. | Question ID | Soft-deleted record | Past attempts retain the snapshot at attempt time |
| **Tag question** | Set difficulty (Easy/Medium/Hard) and type (Recall/Conceptual/Analytical/Application). | Two enums | Updated record | Both required |
| **Link to topic** | Attach question to one Subject → Chapter → Topic path. | Topic ID | Linked record | Exactly one topic in v1 |
| **Preview render** | View question as a student would (LaTeX, units). | Question ID | Render | Required before publish |
| **Publish / unpublish** | Toggle whether a question enters the active pool. | Question ID, flag | Pool membership | Only published Qs reach students |

#### Advanced actions

| Action | Description | Inputs | Outputs |
|---|---|---|---|
| **Bulk import** | CSV/JSON import of PYQs or self-authored. | File | Created records + import log |
| **Bulk re-tag** | Update tags across a filtered set. | Filter + new tag | Diff log |
| **Coverage report** | View Q-count per (topic × difficulty × type). | Subject | Heatmap of bank density |

#### Conditional / restricted actions

- Cannot publish a question without difficulty AND type tags AND a linked topic AND a correct answer field.
- Cannot edit a question's correct answer once it has been served in any submitted attempt **without** triggering an admin-level confirmation (see §7 misuse cases).

---

### 5.3 Admin (P4)

| Action | Description | Inputs | Outputs |
|---|---|---|---|
| **Manage format templates** | Create/edit/disable JEE Main, Topic, Custom. | Duration, Q-count, marking scheme | Template record |
| **Configure mastery engine** | Tune weights, window size, decay (currently 0). | Numeric params | Engine config |
| **Manage user accounts** | View, suspend, revoke. | User ID | Status change |
| **View aggregate analytics** | Mastery distributions, attempt volume, abandonment. | Date range | Dashboard |
| **Recompute mastery (rare)** | After an engine bug fix, recompute affected users. | User scope | Recompute log |
| **Approve content** (optional gate) | Sign-off on bulk-imported content. | Import batch ID | Publish approval |

---

### 5.4 Adaptive Engine (P5)

| Action | Description | Inputs | Outputs | Constraints |
|---|---|---|---|---|
| **Pick next question** | Choose Q from the published pool for a topic, biased by current mastery band. | Topic, mastery, recent-Q exclusion | Question ID | Avoid repeating Qs from the last N attempts |
| **Update mastery** | Apply per-question delta and recompute rolling avg. | Attempt records | New mastery 0–100 | Format-independent formula |
| **Auto-tag skipped Q (Practice)** | Apply *Conceptual gap* on 15s overlay timeout. | Question ID | Tagged skip | Pause stopwatch during overlay |
| **Auto-tag unreached Qs (Test)** | Apply *Ran out of time*. | Attempt | Tagged skips | On auto-submit |
| **Surface bank-thinness signal** | Tell UI when topic has <N questions for a difficulty band. | Topic ID | Boolean flag | UI degrades gracefully |
| **Aggregate to chapter/subject mastery** | Roll up topic scores. | Topic mastery | Chapter + subject mastery | Read-only derivation |

---

## 6. Decision-Making Authority

| Decision | Decided by | Approval / escalation | Risk |
|---|---|---|---|
| Which topic to drill | Student | None | Low |
| Which format template to use for a Test | Student | None | Low |
| Custom test duration & Q-count | Student | Within template-allowed bounds | Low |
| Skip-reason tag (Practice, mid-quiz) | Student | None — but auto-decided on 15s timeout | Low |
| Skip-reason tag (Test, post-submission) | Student | Optional, with nudge | Low |
| When to submit a Practice quiz | Student | Confirmation if blanks remain | Low |
| When a Test is submitted | System (auto) or Student | None | Medium — auto-submit is irreversible |
| Next question's difficulty | Adaptive Engine | None — deterministic logic | Medium — wrong band degrades learning loop |
| Mastery score after attempt | Adaptive Engine | None | Medium |
| Adding/editing a question | Author | Admin approval if a publish gate is enabled | Medium — wrong tag pollutes adaptive logic |
| Editing a question's correct answer post-serve | Author + Admin | Admin confirmation required | **High** — affects past attempts' correctness |
| Mastery formula change | Admin | Documented config change | **High** — affects every student's score history |
| Format-template marking-scheme change | Admin | Documented config change | **High** — affects every Test using that format |
| Account revocation | Admin | None | Medium |
| Mastery recompute | Admin | Audit log required | High |

---

## 7. Edge Cases, Constraints, and Misuse

### 7.1 Failure scenarios

| Scenario | Expected behavior |
|---|---|
| Network drops mid-Practice | Local stopwatch persists; answers buffered; reconnect resumes from last submitted answer. Practice has no countdown so no time penalty. |
| Network drops mid-Test | Countdown is server-authoritative; on reconnect, remaining time reflects real elapsed seconds, not paused time. Buffered answers replay; if reconnect fails before submit, server auto-submits at expiry using whatever answers it has. |
| Skip overlay (Practice) timeout while student is reading the question | 15s expires → auto-tag *Conceptual gap*; student notified subtly: "Auto-tagged Conceptual gap. You can change it in the report." |
| Topic has zero published Qs | Topic appears greyed-out with "Coming soon" label; no quiz launchable. |
| Topic has too-few Qs for adaptive band | Engine returns from adjacent band; UI banner: "Bank still being built — adaptive logic limited here." |
| Student submits Test with all blanks | Allowed; report still generated; heatmap shows 100% skipped; nudge encourages tagging. |
| Auto-submit fires while student is mid-typing on the last numerical | Last keystroke before timer 0 is honored; nothing typed after expiry counts. |
| Author edits a published question's correct answer | Confirmation modal; old attempts retain their original correctness verdict; new attempts use new answer. |
| Engine bug shipped wrong mastery for a week | Admin triggers recompute; affected users see a one-time banner: "Mastery scores were recalculated on YYYY-MM-DD due to a backend fix." |

### 7.2 Improper usage

| Misuse | Defense |
|---|---|
| Student opens DevTools to read correct answers from network | Server returns options + question; correct-answer comparison happens server-side at submit. Client never receives the key during the quiz. |
| Student rapidly creates accounts to game the adaptive engine | Google sign-in friction + per-account independent mastery (no cross-account leak). Aggregate abuse detection is a v2 problem. |
| Author imports questions with duplicated stems | Import log flags potential duplicates by hash; author resolves before publish. |
| Author uploads copyrighted content | Out of policy. The bank is PYQ + self-authored only (§9.2). |
| Admin overwrites a user's mastery for support | Audit log entry mandatory; visible to that user as a banner. |
| Repeated wrong-tag on a question (e.g., Easy tagged as Hard) | Aggregate "wrong-rate vs difficulty" outlier report flags miscalibrated tags for author review. |

### 7.3 Security & permission boundaries

- Google OAuth only; no password storage.
- Server-side answer validation; no client-trusted scoring.
- Per-user data isolation; no cross-user reads from the student surface.
- Admin actions logged with actor + timestamp + before/after state.

### 7.4 Ethical & system constraints

- **No leaderboards in v1** (§8) — preserves intrinsic motivation; avoids comparison-driven anxiety.
- **No copyrighted content** in the question bank.
- **No AI-generated questions in v1** (§8) — keeps quality controllable.
- **No social features** — student data stays private.

### 7.5 Rate limits / operational limits

| Limit | Value | Reason |
|---|---|---|
| Max active quiz session per user | 1 | Prevents fragmented attempt records |
| Max Custom-test duration | ≤ 4 hours | Practical sanity bound |
| Max Custom-test Q-count | ≤ 200 | Practical sanity bound |
| Min Custom-test Q-count | 5 | Mastery formula needs a meaningful denominator |
| Max bulk-import batch size | 1000 questions | Author-side review still feasible |
| Adaptive next-Q lookback to avoid repeats | last N=20 questions per topic | Reduces immediate repetition |

---

## 8. Example Workflows

### 8.1 Vedant — first-ever 20-min Practice on Rotational Motion

1. Vedant signs in via Google.
2. Lands on dashboard. No mastery scores yet → "Start your first quiz" CTA prominent.
3. Browses Physics → Class 11 → Rotational Motion → *Moment of Inertia*.
4. Taps *Start Practice*. App asks Q-count (default 10).
5. Quiz starts; stopwatch counts up. Q1 is *Easy + Recall* (cold-start default).
6. Answers Q1; *Show solution* button appears. Reads it; moves on.
7. Q4 he doesn't know → tries to skip → blocking overlay appears with 4 tags + 15s countdown.
8. Picks *Conceptual gap*. Stopwatch was paused during overlay.
9. Continues. Submits at Q10.
10. Report opens: 7/10 correct, time 14:32, heatmap shows weakness on *Hard + Conceptual*.
11. Mastery score for *Moment of Inertia* set to 64 (first attempt = first attempt's score).
12. CTA suggests: "Drill *Hard + Conceptual* next?" Vedant defers.

### 8.2 Vedant — Sunday JEE Main mock (full 3 hours)

1. Vedant picks *Test Mode* → *JEE Main* template.
2. App warns: *"v1 ships Physics only — this Test will run all 75 slots from the Physics question pool."* (Acceptable v1 degradation; flagged in §9.1.)
3. Confirms; countdown 3:00:00 starts.
4. Skips Q12 silently. No overlay (Test mode).
5. Hits Q72 with 4 minutes left; auto-submit fires at 0:00. Q73–75 untouched.
6. Report: attempted 70, correct 48, wrong 22; Q73–75 auto-tagged *Ran out of time*.
7. Skipped Questions section: 4 untagged. Nudge: "Tag 4 more for a richer heatmap."
8. Vedant tags 2 as *Will come back to it*, 1 as *Forgot the formula*; leaves 1 untagged.
9. Mastery updates per-topic: each of the ~28 topics touched gets a new attempt score.

### 8.3 Asha — weekly weak-topic planning

1. Asha opens dashboard → heatmap → sorts topics by lowest mastery.
2. Spots *Thermodynamics — Carnot Cycle* at 38.
3. Launches Practice (15 questions). Engine biases toward *Easy + Conceptual* per <50 mastery rule.
4. Scores 12/15. Attempt score 78 → mastery rolls to (38+78+last)/3.
5. Reviews "Wrong Answered Questions" filtered by *Conceptual*; decides to revise Carnot theory.

### 8.4 Ravi — bulk PYQ import

1. Ravi signs in (admin/author role).
2. Opens Authoring console → *Import*.
3. Uploads `pyq_2018_2023_physics.csv` (480 rows).
4. Validation: 478 ok; 2 rows fail (missing topic mapping). Fixes inline.
5. Preview-renders 10 random rows.
6. Publishes batch. Coverage report updates: *Rotational Motion → Hard* now has 22 Qs (up from 9).

### 8.5 Meera — investigates engine drift

1. Aggregate analytics show median mastery jumping from 62 → 71 in a week — suspicious.
2. Meera diffs deployed engine config; finds last week's tweak to weight constants.
3. Reverts; triggers recompute for affected users.
4. Banner shown to those users next session: *"Mastery recalculated on 2026-05-08 due to a backend fix."*

### 8.6 Arjun — pushing past the easy floor (Quick Solver)

1. Arjun launches Practice on *Electrostatics* — a topic where his mastery is already 78.
2. Engine biases balanced (50–80 band): mostly Medium, a few Hard, a couple Easy.
3. Q1 (Easy) — solves in 12 seconds; doesn't open *Show solution* (it was correct).
4. Q3 (Easy) — frustrated by the second easy in a row, wants a difficulty override.
5. Hits the *"Skip easy ones"* toggle (design implication for P7) → engine drops Easy from the queue for this session.
6. Burns through 30 Qs in 22 minutes; 26 correct, 4 wrong.
7. Report: 4 wrongs include 2 *Hard + Analytical* (legit gaps) and 2 *Easy + Recall* (silly slips).
8. Time-per-Q vs accuracy chart highlights the 2 silly slips happened in the bottom 10% of his per-Q time — explicit signal: "you went too fast on these."
9. Mastery: 78 → 84. Next session, engine biases harder (80+ band).

### 8.7 Sanya — slow Practice with deep solutions (Methodical Learner)

1. Sanya launches Practice on *Carnot Cycle* (mastery 51) — 12 Qs, no time pressure.
2. Q1 (Medium, Conceptual) — spends 6 minutes thinking; submits a correct answer.
3. Opens *Show solution* even though correct — wants to verify her reasoning matched the worked solution. Reads for 4 minutes. Notices her approach was different but valid.
4. Q3 (Hard, Conceptual) — gets it wrong. Reads the solution slowly; clicks the concept link (if §6.3 ships) to revisit Carnot theory. Spends 12 minutes total.
5. Submits the quiz after 90 minutes for 12 Qs — 9 correct.
6. Report: per-Q time chart shows 5–12 min/Q. **Critically, the report does not flag this as "too slow."** Instead, the time-per-Q section frames it as "deep-study session" — Sanya doesn't feel judged.
7. Bookmarks (if §6.7 ships) the 3 wrong Qs to re-attempt next week.
8. Mastery: 51 → 64.

### 8.8 Karthik — 11-min commute drill (Streak Builder)

1. 7:42 AM, on the bus. Karthik opens the app on his phone.
2. Dashboard top card: *"Resume yesterday's quiz — 3/5 done"*. One tap.
3. Quiz resumes mid-stream — Q4 of 5 visible, stopwatch picks up where it paused.
4. Solves Q4 (correct), Q5 (wrong with skip overlay → tags *Conceptual gap*).
5. Submits. Report renders in 1 second. Glances at heatmap. Mastery on *Friction*: 62 → 67.
6. Bus pulls in at 7:53. Closes app. Total session: 11 minutes. Streak (mental, since §6.5 deferred): unbroken.
7. Re-opens 14 hours later (10 PM). Dashboard suggests *"Quick 5-Q drill on Magnetism — your weakest topic this week."* One tap. Loop continues.

### 8.9 Neha — reluctant pre-mock Test attempt (Test-Phobic)

1. School mock is in 3 days. Neha forces herself to do one Custom Test in the app first.
2. Builds Custom: 1 chapter (*Optics*), 15 Qs, 30 minutes — deliberately short to limit anxiety.
3. Pre-flight screen: countdown shown in neutral copy ("30:00 remaining"), not red, not flashing.
4. Test runs. At 5 minutes left, the timer turns *amber* (not red) with copy: "5 min remaining."
5. Submits manually with 1:30 to spare; doesn't trigger auto-submit (which would have spiked her anxiety).
6. Report opens — **leads with diagnostic insight, not the score**: "Most wrongs were *Hard + Application* — try targeted Practice on these next." Score is one card down.
7. Score: 11/15. Mastery: 73 → 70 (slight dip from a tougher-than-usual Hard set).
8. Neha doesn't shut down because the report didn't lead with a number. Re-attempts the 4 wrong Qs in Practice mode the next day to overlearn.

### 8.10 Rohit — burst-week return (Cram Sprinter)

1. Mock is in 8 days. Rohit hasn't opened the app in 6 weeks.
2. Logs in. Dashboard shows: *"Welcome back. Last attempt: 6 weeks ago. Most mastery scores are stale (older than 30 days). Suggested: 25-Q diagnostic across your weakest 5 topics to refresh."*
3. Takes the diagnostic. 25 Qs, ~40 min. Result: mastery scores updated; 3 of his "weakest 5" turn out to still be weak (confirmed); 2 are actually fine now.
4. Plans his 7-day burst around the confirmed weak 3 + format simulation.
5. Days 1–3: heavy Practice on *Magnetism*, *Modern Physics*, *Waves* — 2-hour sessions each.
6. Day 4: full JEE Main mock for stamina. Score: 168/300 (Physics-only context). Heatmap reveals new weak spot in *Optics*.
7. Days 5–6: drill *Optics* + revisit Magnetism wrong Qs.
8. Day 7: second full mock. Score: 192/300. Compare-mocks panel shows: "+24 marks vs Day 4; biggest gain in *Modern Physics*."
9. Day 8: real exam. Loop pauses again until next burst.

### 8.11 Pooja — coaching-class supplement (Weekly)

1. Friday evening — coaching class today covered *Rotational Motion*.
2. Pooja opens the app on her laptop. Searches "Rotational Motion" in the topic picker (not browses — she knows what she wants).
3. Topic page shows: 4 sub-topics, current mastery per sub-topic, *Practice* button.
4. Picks *Moment of Inertia* (mastery 52); 30-Q Practice.
5. Engine balanced-band picks; Pooja answers in ~45 minutes.
6. Score: 22/30. Report shows weakness on *Hard + Analytical*. Mastery: 52 → 61.
7. Tomorrow, before her next coaching class, she'll do another 30-Q drill on the next sub-topic. Never takes Test mode — coaching's weekly mock fills that role.

### 8.12 Aarav — coming back after 8 weeks (Drop-In Revisiter)

1. Aarav logs in for the first time in 8 weeks.
2. Dashboard top banner: *"Welcome back, Aarav. Last quiz: 8 weeks ago. Your mastery scores are from before your break — they may not reflect where you are now."* Two CTAs: *"Take a 15-Q refresher diagnostic"* (primary) or *"Skip — go straight to dashboard"* (secondary).
3. Aarav picks the diagnostic. 15 Qs across 5 of his historically-weak topics (engine selects automatically).
4. Score: 9/15. Three topics confirm the old "weak" tag; two are worse than they were; one is unexpectedly strong.
5. Report header reframes the experience: *"You've refreshed mastery on 5 topics. Here's where you stand today."* No mention of the gap, no guilt.
6. Mastery scores updated with current data. Heatmap re-renders.
7. Aarav drills 1 newly-weak topic for 20 minutes, then closes the app — but with a clear win (refreshed sense of where he stands). Probability of a Day-2 return is materially higher because Day 1 ended on a constructive note, not a guilt trip.

---

## 8.A Design Implications by Persona

A scannable summary of which design choices each persona stresses. This is the bridge between "who they are" and "what Phase 2 mockups must support."

| Persona | Key design implication |
|---|---|
| **P1 Vedant** | Balanced defaults; one-click quick-start; clear *next-action* signal at end of report. |
| **P2 Asha** | Heatmap as planning tool; sortable mastery view; "filter Wrong by tag" must work well. |
| **P7 Arjun** | "Skip easy ones" or manual difficulty override; speed-vs-accuracy chart in report; keyboard shortcuts. |
| **P8 Sanya** | Solution viewer richness; time-per-Q framed as data, not verdict; bookmark / re-attempt-later affordance. |
| **P9 Karthik** | "Resume last quiz" as top dashboard card; 5-Q micro-quiz preset; one-thumb mobile ergonomics; offline tolerance. |
| **P10 Neha** | Neutral countdown copy (no "Time's up!" alarm); reports lead with insight, not score; intermediate "Practice with timer" mode would help. |
| **P11 Rohit** | Mastery freshness indicator; "return refresher" diagnostic; compare-last-2-mocks panel; dark mode (deferred §6.8). |
| **P12 Pooja** | Fast topic search / quick-jump; mastery readable without taking a quiz; PYQ tagging (deferred §6.1) to filter coaching overlap. |
| **P13 Aarav** | Non-judgmental re-entry banner; mastery freshness flagging; first-session-back must end with a clear win, no streak shaming. |

> **Cross-persona principle:** the same UI must feel right to both Karthik (5 min, phone, one hand, distracted) and Sanya (90 min, laptop, focused, deep reader). When in doubt, default to **low friction** for the micro-user and let depth-users *opt in* to longer experiences.

---

## 9. Tone & Behavioral Design (AI / Engine voice)

The Adaptive Engine (P5) is an *invisible* agent in v1 — there is no chat interface — but it surfaces messages through the Quiz UI and the Report. Those messages carry a voice. Definition follows so File 2 journeys can reference it.

### 9.1 Voice principles

- **Coaching, not gamified.** Vedant is preparing for a grueling exam; cheerleading feels patronizing. Praise is sparing, specific, and earned.
- **Diagnostic, not evaluative.** "You skipped 60% of Hard + Conceptual — likely a theory gap." *not* "You did poorly."
- **Honest about limits.** When the bank is thin, say so plainly.
- **Indian-English neutral.** Plain, direct, no slang. No emoji.

### 9.2 Tone matrix

| Situation | Tone | Example |
|---|---|---|
| Cold-start (first quiz) | Welcoming, brief | "Starting easy — we'll calibrate as you go." |
| Strong attempt (≥85%) | Specific, restrained | "Strong on *Torque*. Difficulty will rise next attempt." |
| Weak attempt (<40%) | Diagnostic, non-judgmental | "Most misses were *Conceptual*. Revise theory before next drill." |
| Skip-overlay timeout | Matter-of-fact | "Auto-tagged *Conceptual gap* — you can change it in the report." |
| Auto-submit on Test expiry | Neutral | "Time's up. Q73–75 auto-tagged *Ran out of time*." |
| Bank-thinness | Honest | "*Magnetism — Hard* bank is light. Adaptive picks may feel uneven here." |
| Mastery jump | Earned praise | "*Rotational Motion* mastery: 64 → 81. Next quiz biases harder." |

### 9.3 Anti-patterns (do not do)

- ❌ "Great job!! 🎉" — empty praise.
- ❌ "You got 4 wrong" without saying *what kind*.
- ❌ Streak shaming ("Don't break your streak!").
- ❌ Comparisons to other users.
- ❌ Long preambles before showing the report.

---
