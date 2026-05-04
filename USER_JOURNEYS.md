# File 2: User Journey Design Document

> **Project:** JEE Prep Quiz App (v1)
> **Phase:** 2 — Design
> **Companion file:** `PERSONAS_AND_CAPABILITIES.md`
> **Source spec:** `REQUIREMENTS.md` v1.1

---

## 1. Journey Overview

End-to-end journeys for every persona that has a UI in v1. Each journey is a sequence of *Entry → Action → System Response → Outcome* stages, with intent, friction risk, and decision points called out.

### 1.1 Master journey index

| ID | Journey | Persona | Type | Frequency |
|---|---|---|---|---|
| J1 | First-time onboarding & first quiz | P1 Student (Vedant) | Onboarding | Once |
| J2 | Daily Practice drill on a weak topic | P1 / P2 | Core | Daily |
| J3 | Full JEE-Main format mock (Test mode) | P1 / P2 | Core | Weekly |
| J4 | Custom Test build & run | P2 Asha | Advanced | Pre-mock |
| J5 | Post-test report deep-dive & re-plan | P2 Asha | Advanced | Weekly |
| J6 | Skip-recovery in Practice (mid-quiz) | P1 | Edge / core sub-flow | Per quiz |
| J7 | Auto-submit recovery in Test | P1 | Failure / edge | Occasional |
| J8 | Mastery growth across a fortnight | P1 | Long-arc | Continuous |
| J9 | Network drop mid-Test | P1 / P2 | Failure | Occasional |
| J10 | Author bulk-imports a PYQ batch | P3 Ravi | Internal | Per content cycle |
| J11 | Author single-question creation | P3 Ravi | Internal | Daily during ramp |
| J12 | Admin investigates engine drift | P4 Meera | Internal | Rare |
| J13 | Admin recompute mastery after bug | P4 Meera | Internal | Rare |
| J14 | Cross-persona: tag-bug fix loop (Author ↔ Engine ↔ Student) | P3 + P5 + P1 | Cross | Trigger-driven |

### 1.2 Persona → journey map

| Persona | Journeys |
|---|---|
| P1 Vedant (primary student) | J1, J2, J3, J6, J7, J8, J9 |
| P2 Asha (returning self-studier) | J2, J3, J4, J5, J9 |
| P3 Ravi (author) | J10, J11, J14 (origin) |
| P4 Meera (admin) | J12, J13 |
| P5 Adaptive Engine (system) | Threads through every student journey; explicit in J8, J14 |

---

## 2. Detailed Journey Flows

Format key for tables: **Stage** = phase label · **User intent** = what the user is *trying* to do · **System** = what the app does · **Decision points** marked ⬥ · **Friction risks** marked ⚠.

---

### 2.1 J1 — First-time onboarding & first quiz (P1)

**Goal:** Get Vedant from landing page to a completed first quiz with a usable mastery score in under 5 minutes.

| # | Stage | User intent | User action | System response | Outcome |
|---|---|---|---|---|---|
| 1 | Entry | "What is this app?" | Lands on `/` | Hero: "Built by a JEE aspirant, for JEE aspirants." Single CTA: *Sign in with Google*. | Decision to sign in |
| 2 | Auth | Sign in fast | Click *Sign in with Google* → Google OAuth | Returns to dashboard | Authenticated |
| 3 | First-run dashboard | "Where do I start?" | Sees empty dashboard with one CTA | Shows: "No quizzes yet. Start your first one." Suggests Physics → Class 11 → first chapter. ⬥ Decision: pick or follow suggestion. | Picks topic |
| 4 | Topic landing | "How long? What format?" | Picks *Moment of Inertia* | Shows: mastery (—), Q-bank size, two big buttons: *Practice* / *Test* | Picks Practice |
| 5 | Quiz config | "How many?" | Picks *Practice* → mini-modal: Q-count (default 10) | Validates; engine reserves 10 Qs at the cold-start band (Easy + Recall mix) | Quiz starts |
| 6 | Quiz | "Solve the questions." | Answers, occasionally skips | For each answered Q: *Show solution* CTA. For skips: blocking overlay with 4 tags + 15s timer (J6). | All Qs handled |
| 7 | Submit | "I'm done." | Clicks *Submit* | If blanks remain, confirmation. Generates report. | Report opens |
| 8 | Report | "How did I do?" | Scrolls report | Attempt summary → per-Q breakdown → topic-grid heatmap → review sections | Insight forms |
| 9 | Re-plan | "What next?" | Sees engine suggestion | "Next attempt biases [easier / harder / balanced] based on this score." | Sets up J2 |

⚠ Friction risks:
- ⚠ Confusion at step 4 if **mastery indicator (—)** isn't clearly explained → tooltip: "No data yet — finish a quiz to see your score."
- ⚠ Step 7 confirmation must be skippable in Test mode (covered in J3) but **must show** in Practice mode for first-timers.

⬥ Decision points: pick suggested topic vs browse · Practice vs Test · submit with blanks vs go back.

**Optimization:** keep step 1→6 within 4 clicks total. Default Q-count = 10 (low commitment).

---

### 2.2 J2 — Daily Practice drill on a weak topic (P1 / P2)

**Goal:** Returning student opens app, picks a weak topic, drills it, leaves with a measurable mastery delta.

| # | Stage | Intent | Action | System | Outcome |
|---|---|---|---|---|---|
| 1 | Entry | "What's weak?" | Opens dashboard | Heatmap visible at top; weakest 3 topics highlighted | Sees red cells |
| 2 | Pick | "Drill that one" | Clicks *Carnot Cycle* (mastery 38) | Topic page shows last 3 attempts + suggested action: *Drill (15 Qs, biased Easy)* | Picks Practice |
| 3 | Quiz | Solve | Goes through 15 Qs | Engine biases <50 mastery → mostly Easy + Easy/Medium Conceptual | Quiz completes |
| 4 | Submit | Finish | Clicks *Submit* | Report generated | Report opens |
| 5 | Report | Diagnose | Reads report | Summary: 12/15. Heatmap: still red on *Hard + Application*. New mastery 51. | Decision next session |
| 6 | Re-plan | Pick next | Closes report | Dashboard refreshes with new mastery | Habit reinforced |

⚠ Friction risks:
- ⚠ Heatmap legibility on phone — must collapse columns or scroll horizontally cleanly.
- ⚠ Mastery delta must be *visible*, not buried — show "38 → 51" prominently in the report header.

⬥ Decision points: drill same topic again · move to a sibling topic · stop for the day.

---

### 2.3 J3 — Full JEE-Main format Test (P1 / P2)

**Goal:** Realistic 3-hour mock that mirrors actual JEE conditions.

| # | Stage | Intent | Action | System | Outcome |
|---|---|---|---|---|---|
| 1 | Entry | "Simulate exam" | Dashboard → *Take a Test* | Test selector: JEE Main / Topic / Custom | Picks JEE Main |
| 2 | Pre-flight | "Confirm format" | Sees: 3h, 75 Qs, +4/−1 MCQ, +4/0 numerical | App warns: "v1 = Physics only — all 75 slots will be Physics." Confirm? | Confirms |
| 3 | Start | "Lock in" | Clicks *Start Test* | Full-screen mode (suggested), countdown 3:00:00, Q1 visible. **No skip overlay.** | Test live |
| 4 | Test | Solve / skip / navigate | Standard JEE-style nav: number palette, mark-for-review (if §6.2 ships), forward/back | Timer is server-authoritative; answer state persists | Progress |
| 5 | Submit | "Finish early" or expiry | Manual *Submit* OR auto at 0:00 | If manual: confirmation. If auto: silent, immediate report. Unreached Qs auto-tagged *Ran out of time*. | Report generated |
| 6 | Report | Diagnose | Scroll | Score per format scheme, per-topic heatmap, Wrong Answered (intrinsic tags), Skipped Questions (with nudge to tag) | Insight |
| 7 | Tag skipped | Optional | Clicks tags on skipped Qs | Heatmap re-renders live as tags are applied | Richer signal |

⚠ Friction risks:
- ⚠ Step 2's "Physics-only warning" must not feel like a bug — explain it's a v1 scope decision.
- ⚠ Step 5 auto-submit must feel **inevitable** (no panic prompt, no *Are you sure*).
- ⚠ Step 7 nudge must not block leaving the report — the tagging is optional.

⬥ Decision points: confirm Physics-only warning · finish early or run timer · tag skips now or later.

**Optimization:** offer "Resume on phone" if test was started on laptop; full-screen mode reminder.

---

### 2.4 J4 — Custom Test build & run (P2 Asha)

**Goal:** Targeted multi-chapter test before a school exam.

| # | Stage | Intent | Action | System | Outcome |
|---|---|---|---|---|---|
| 1 | Entry | "Build my own" | *Take a Test → Custom* | Builder UI: chapter picker (multi), Q-count slider (5–200), duration slider (10–240 min) | Configures |
| 2 | Configure | Pick scope | Selects 3 chapters; 60 Qs; 90 min | Validates: bank density per chapter shown live ("Carnot Cycle: 84 Qs available — fine") | Confirms |
| 3 | Start | Lock in | Clicks *Start Custom Test* | Same Test-mode rules apply. Marking: difficulty-weighted (E+3 / M+4 / H+5; wrong −2). | Test live |
| 4 | Test | Solve | Standard | Same as J3 step 4 | Progress |
| 5 | Submit | Finish | Manual or auto | Report | Insight |

⚠ Friction risks:
- ⚠ Chapter picker on phone must be **searchable** — Physics has many chapters; long list unusable on small screens.
- ⚠ Bank-density indicator at step 2 is essential to prevent "I built a 60-Q test but only got 22 Qs" surprise.

⬥ Decision points: which chapters · narrow vs broad scope · duration realistic for Q-count?

---

### 2.5 J5 — Post-test report deep-dive & re-plan (P2 Asha)

**Goal:** After a test (J3 or J4), turn the report into a study plan.

| # | Stage | Intent | Action | System | Outcome |
|---|---|---|---|---|---|
| 1 | Entry | "What does this mean?" | Opens report | Tabs: Summary · Per-Q · Heatmap · Wrong Answered · Skipped | Tab strip |
| 2 | Heatmap | "Where am I weak?" | Clicks Heatmap | Topic-grid: rows × difficulty. Hover reveals score. ⬥ Decision: drill weakest? | Spots *Magnetism — Hard* red |
| 3 | Wrong Answered | "Why wrong?" | Clicks tab | List filtered by intrinsic tag. Filter chips: difficulty / type. | Sees pattern |
| 4 | Skipped | "What did I avoid?" | Clicks tab | List of skips. Each row: Q stem + tag picker. Nudge: "Tag 4 more for a richer heatmap." | Tags 3 |
| 5 | Plan | Decide | Closes report | Dashboard refreshed with new mastery + suggestions | Plans next session |

⚠ Friction risks:
- ⚠ Five tabs is the upper bound — must be one-tap on phone, not buried in a kebab menu.
- ⚠ Tag picker on Skipped tab should remember last-used tag for fast bulk tagging.

⬥ Decision points: which weakness to attack first · drill now or revise theory first.

**Optimization:** "Drill this weakness" CTA on each red heatmap cell — one click from diagnosis to action.

---

### 2.6 J6 — Skip-recovery in Practice (mid-quiz sub-flow, P1)

**Goal:** Capture *why* the student skipped without breaking flow.

| # | Stage | Intent | Action | System | Outcome |
|---|---|---|---|---|---|
| 1 | Trigger | "Don't know this" | Clicks *Next* with no answer selected | Stopwatch pauses. Blocking overlay: 4 tag buttons + visible 15s countdown. | Overlay open |
| 2 | Choose | Reflect briefly | Picks *Conceptual gap* | Overlay closes. Stopwatch resumes. Q marked skipped + tagged. | Continues |
| 2-alt | Timeout | "I don't know why" | Doesn't pick within 15s | Auto-tags *Conceptual gap*. Overlay closes. Stopwatch resumes. Brief toast: "Auto-tagged Conceptual gap." | Continues |
| 3 | Revisit | "Let me try again" | Returns to skipped Q, answers correctly | Skip tag removed. Q now counted as correct. | Tag cleared |
| 3-alt | Revisit-wrong | Tries but wrong | Returns and answers wrongly | Skip tag removed. Q now a wrong answer in the report. | Treated as wrong |

⚠ Friction risks:
- ⚠ 15s feels short if the student is genuinely thinking. Solution: countdown is **for the tag picker**, not for thinking about the question. Copy must say: "Why are you skipping? Choose one. (15s)" — not "Time left to think."
- ⚠ Toast message after auto-tag must be dismissible and **actionable**: "Change in report" link.

⬥ Decision points: pick a tag, let it auto-tag, or actually go back and answer.

---

### 2.7 J7 — Auto-submit recovery in Test (failure flow, P1)

**Goal:** Make running out of time feel like real JEE — disappointing but informative.

| # | Stage | Intent | Action | System | Outcome |
|---|---|---|---|---|---|
| 1 | Approach | "Time check" | Glances at countdown: 0:05:00 | Timer turns amber at 5 min, red at 1 min | Awareness |
| 2 | Last min | Answer fast | Types into a numerical Q at 0:00:03 | Last keystroke before 0:00:00 honored | Recorded |
| 3 | Expiry | — | Timer hits 0 | Test auto-submits. Quiz UI swaps to a "Submitting…" splash for ≤ 1s, then report. | Auto-submitted |
| 4 | Report | "What happened?" | Opens | Report header: "Time expired at Q72." Q73–75 auto-tagged *Ran out of time*. | Insight |

⚠ Friction risks:
- ⚠ Step 2 "last keystroke before 0" race must be airtight — server cuts answers received after t=0.
- ⚠ Auto-submit splash must be brief — extending beyond 1s feels like a hang.

⬥ Decision points: none — auto-submit is intentionally non-negotiable.

---

### 2.8 J8 — Mastery growth across a fortnight (long-arc, P1)

**Goal:** Show how the loop *compounds* — single attempts feel small, but two weeks reveal a pattern.

| Week | Day | What Vedant does | Engine response | Visible signal |
|---|---|---|---|---|
| 1 | Mon | First Practice on *Moment of Inertia* (10 Qs) | Cold-start band: Easy + Recall heavy. Mastery 0 → 64. | Heatmap cell: orange |
| 1 | Wed | Second Practice (10 Qs) | Engine biases balanced (50–80 band). Mastery 64 → 71 (avg of 64, 78). | Heatmap cell: yellow |
| 1 | Sat | First JEE-Main mock | Touches ~28 topics. Each gets one new attempt score. | Wide heatmap update |
| 2 | Mon | Reviews report, drills *Magnetism — Hard* (red, 32) | Engine biases easy. Mastery 32 → 47. | Topic moves orange |
| 2 | Thu | Custom test (Magnetism + Optics) | New mastery for both. | Heatmap shifts |
| 2 | Sun | Second JEE-Main mock | Compare to Week-1 mock. Visible delta in summary. | "Mock 1 → Mock 2: +12 marks; biggest gain in *Rotational Motion*." |

⚠ Friction risks:
- ⚠ Without a longitudinal view, the student won't *feel* progress. **Optimization:** "Compare last 2 mocks" panel on the dashboard.
- ⚠ Fortnight is too long without intermediate dopamine. Streaks (§6.5) are deferred — design must compensate with the mastery delta visualization.

⬥ Decision points: continuing daily is the intended habit; falling off after one week is the drop-off risk.

---

### 2.9 J9 — Network drop mid-Test (failure flow)

**Goal:** Don't lose the attempt; don't reward dropouts with paused time.

| # | Stage | Intent | Action | System | Outcome |
|---|---|---|---|---|---|
| 1 | Live | Solving | Loses connection at t=45:00 | Client detects offline; banner: "Offline — your answers are saved locally." Timer continues client-side, but **server** is the ultimate authority. | Disconnected, still solving |
| 2 | Reconnect | Comes back | Network returns at t=52:00 | Client replays buffered answers. Server reconciles timer based on real elapsed time (not paused). | State synced |
| 3 | Worst case | Reconnect fails before t=180:00 | Client never reconnects | Server auto-submits at t=180:00 using answers received before disconnect. Banner on next login: "Test auto-submitted at 03:00:00 due to lost connection." | Attempt finalized |

⚠ Friction risks:
- ⚠ Banner copy at step 1 must not promise paused time. Be explicit: "Timer is still running — submit before expiry."
- ⚠ Reconciliation rule (server-authoritative) must be visible to the user as a passing tooltip the first time it's encountered.

⬥ Decision points: keep solving offline (recommended) vs abandon and accept partial.

---

### 2.10 J10 — Author bulk-imports a PYQ batch (P3 Ravi)

| # | Stage | Intent | Action | System | Outcome |
|---|---|---|---|---|---|
| 1 | Entry | "Add 480 Qs" | Authoring console → *Import* | Import wizard | Wizard open |
| 2 | Schema | Validate file | Uploads CSV | Schema check (required columns: stem, options/numeric, correct, difficulty, type, topic, solution). Reports row-by-row pass/fail. | 478 ok, 2 fail |
| 3 | Fix | Resolve errors | Edits 2 rows inline | Re-validates | All ok |
| 4 | Preview | Spot-check render | Picks 10 random rows | Renders LaTeX, units, options | Sanity confirmed |
| 5 | Duplicate check | Avoid double-import | System hashes stems; flags 4 near-duplicates | Reviews each; merges or rejects | Cleaned |
| 6 | Publish | Push live | Clicks *Publish batch* | Bank coverage report updates | Live |

⚠ Friction risks:
- ⚠ Without inline error correction, the author re-uploads files repeatedly — slow.
- ⚠ Duplicate detection threshold (hash + near-match) must be tunable to avoid false positives on similar PYQs across years.

⬥ Decision points: fix vs drop bad rows · merge vs keep duplicates · publish all or hold for review.

---

### 2.11 J11 — Author single-question creation (P3 Ravi)

| # | Stage | Intent | Action | System | Outcome |
|---|---|---|---|---|---|
| 1 | Entry | "Add one Q" | Authoring → *New question* | Form: stem (Markdown + LaTeX), answer format (MCQ / numerical), options, correct, difficulty enum, type enum, topic picker, solution editor | Form open |
| 2 | Author | Write | Fills fields | Live preview pane on the right | Drafted |
| 3 | Validate | Pre-publish | Clicks *Save draft* | Required-fields check; tag completeness check | Saved |
| 4 | Preview | Final check | Clicks *Preview* | Renders as a student would see it | Confirmed |
| 5 | Publish | Go live | Clicks *Publish* | Question enters active pool; coverage report updates | Live |

⚠ Friction risks:
- ⚠ LaTeX preview latency must be sub-second; otherwise authors batch in external tools and lose the in-app advantage.
- ⚠ Topic picker must be searchable (same constraint as J4).

⬥ Decision points: publish now vs save draft · numerical vs MCQ format · which difficulty/type pair.

---

### 2.12 J12 — Admin investigates engine drift (P4 Meera)

| # | Stage | Intent | Action | System | Outcome |
|---|---|---|---|---|---|
| 1 | Signal | "Is something off?" | Opens admin analytics | Sees median mastery jump 62 → 71 in 7 days | Suspect |
| 2 | Diff | "What changed?" | Opens engine config history | Diff view of weight constants | Found tweak |
| 3 | Hypothesis | "Roll back" | Reverts | Engine config rolled back; takes effect on next attempt | Live |
| 4 | Recompute | "Fix history" | Triggers recompute (J13) | See J13 | — |

⚠ Friction risks:
- ⚠ Without config history + diff, admin can't identify the cause.
- ⚠ Rollback must not erase the bug-fix audit trail.

⬥ Decision points: roll back vs hotfix forward · recompute affected users vs leave history as-is.

---

### 2.13 J13 — Admin recompute mastery after bug (P4 Meera)

| # | Stage | Intent | Action | System | Outcome |
|---|---|---|---|---|---|
| 1 | Trigger | Post-rollback | Picks "Recompute affected users" | Confirmation modal: scope + expected user count | Confirms |
| 2 | Run | — | Background job runs | Progress bar; per-user audit entries | Recomputed |
| 3 | Notify | "Tell users" | Toggles in-app banner for affected users | On next login: "Mastery recalculated on YYYY-MM-DD due to a backend fix." | Transparency |

⚠ Friction risks:
- ⚠ Silent recomputes erode trust. Banner is mandatory.
- ⚠ Recompute must be idempotent — running twice yields the same final state.

⬥ Decision points: scope (just affected vs all) · banner copy.

---

### 2.14 J14 — Cross-persona: tag-bug fix loop (P3 + P5 + P1)

**Setup:** A question is mistagged *Easy* but is empirically Hard (95% wrong-rate). The system must let this surface without manual user reports.

| # | Stage | Actor | Action | System | Outcome |
|---|---|---|---|---|---|
| 1 | Detect | Engine (P5) | Aggregates wrong-rate per tag | Outlier flag: "Q#1342 tagged Easy, 95% wrong over 200 attempts" | Flag raised |
| 2 | Surface | Admin (P4) | Opens calibration report | Sees flagged Qs sorted by deviation | Picks #1342 |
| 3 | Hand off | Admin → Author (P3) | Assigns to author for retag | Author sees in queue | Assigned |
| 4 | Fix | Author | Retags Easy → Hard, optionally rewords | Audit entry: tag changed, by whom, when | Updated |
| 5 | Propagate | Engine | Recomputes mastery for users who answered #1342? | **Decision (TBD in design):** retroactive recompute or only forward-effective? | Choose policy |
| 6 | Visible to student (P1) | Student | Views topic mastery | If retroactive applied: tooltip on the score change. Else: silent forward fix. | Trust preserved |

⚠ Friction risks:
- ⚠ Step 5 is a real product call — choosing forward-only is simpler but lets bad data linger; retroactive is the right learning signal but adds complexity.
- ⚠ Without step 6 transparency, students see scores shift mysteriously and lose trust.

⬥ Decision points: retroactive vs forward-only correction; reword vs retag-only.

---

## 3. Journey Mapping Format Reference

For consistency, every journey above follows:

```
Entry  →  Action  →  System Response  →  Outcome
              ⬥ Decision points
              ⚠ Friction risks
```

A summary view:

| Stage label | What it captures |
|---|---|
| **Entry** | What surface the user starts on, and what triggered them |
| **Action** | What the user does next |
| **System Response** | What the app shows or computes |
| **Decision point (⬥)** | Where the user picks among options |
| **Friction risk (⚠)** | Likely points of confusion, abandonment, or error |
| **Outcome** | Concrete state change (data + user understanding) |

---

## 4. Pain Points & Optimization Opportunities

### 4.1 Highest drop-off risks

| Risk point | Journey | Why it hurts | Mitigation |
|---|---|---|---|
| Empty dashboard on first login | J1 step 3 | "What do I do?" → bounce | Strong default suggestion + 1-click start |
| Confusing mastery indicator (—) for first-timers | J1 step 4 | Looks like a bug | Tooltip + sample heatmap on hover |
| Skip overlay 15s timer perceived as anxiety-inducing | J6 | Adds pressure to a Practice mode supposed to be *no pressure* | Copy clarifies it's the *tag picker* timer, not a thinking timer |
| JEE-Main format showing all-Physics Qs | J3 step 2 | Looks like a bug | Pre-flight warning explaining v1 scope |
| Long phone heatmap | J2 step 1, J5 | Hard to scan on small screen | Collapse columns on phone; tap to expand |
| Skipped-questions tagging fatigue | J3 step 7, J5 step 4 | Tagging 20+ skips is tedious | Bulk-tag (multi-select), remember last-used tag, optional with nudge |
| "Did I improve?" invisibility | J8 | Long-arc progress hidden inside individual reports | Dashboard "Compare last 2 mocks" panel |
| Author bulk-import errors mid-batch | J10 | Frustration → re-upload loops | Inline error fix; partial-publish allowed |
| Silent mastery recompute | J13 | Erodes trust | Mandatory banner |

### 4.2 UX/design improvements (cross-journey)

1. **One-click drill from heatmap.** Every red cell on the heatmap is a CTA — "Drill *Magnetism — Hard* now" without going back to the topic picker.
2. **Last-action resume.** Dashboard top card: "Resume *Carnot Cycle* Practice — 6/15 done." Mirrors the v2 Resources Library progress-bar pattern (§10.1).
3. **Format-template glossary.** A small "?" next to *JEE Main* / *Topic test* / *Custom* opens a side panel with the marking scheme; reduces config anxiety.
4. **Mastery delta in report header.** "*Carnot Cycle*: 38 → 51 (+13)." Single most important post-quiz signal.
5. **Sticky timer in Test mode.** Always visible; color shifts at 5-min and 1-min thresholds.
6. **Solution availability symmetry.** Practice mode reveals per-question after submit; Test mode reveals all in the report — make this distinction obvious in onboarding.
7. **Bank-thinness honesty.** Quiet banner in J2 / J3 when adjacent-band substitution kicks in.
8. **Numerical-input keypad on phone.** Default to numeric keyboard for numerical Qs — small UX win, big accuracy gain.

### 4.3 Critical drop-off windows (longitudinal)

- **Day 1 → Day 2**: highest drop-off. First quiz must end with a clear *next* signal.
- **First mock test**: many students bounce after a low score. Report must lead with diagnostic insight, not the score.
- **Three weeks in**: novelty fades. The "compare across mocks" view becomes the retention hook.

---

## 5. Cross-Persona Journey Interactions

### 5.1 Interaction map

| From → To | Touchpoint | Type |
|---|---|---|
| Author (P3) → Student (P1) | Published question reaches student via Engine | Asynchronous, content-driven |
| Engine (P5) → Student (P1) | Next-question pick, mastery update, auto-tag | Real-time, in-quiz |
| Engine (P5) → Author (P3) | Tag-calibration outlier flag | Async dashboard signal |
| Admin (P4) → Engine (P5) | Engine config tuning, recompute | Authoritative override |
| Admin (P4) → Student (P1) | Mastery-recompute banner, account actions | Notification |
| Author (P3) → Admin (P4) | Bulk-import approval gate (if enabled) | Workflow handoff |
| Student (P1) → Author (P3) | (v2) "Report this question" — **out of v1 scope but design must not preclude it** | Future feedback loop |

### 5.2 Handoffs and approvals

| Handoff | Trigger | Approver | SLA target (v1) |
|---|---|---|---|
| Bulk import → publish | Author submits batch | Admin (optional gate, off by default in v1) | Same day |
| Tag-calibration flag → retag | Engine raises outlier | Author | Within 1 week |
| Engine config change | Admin proposal | Admin (single approver in v1) | Immediate |
| Mastery recompute | Bug fix | Admin | Immediate after fix |
| Account revocation | Abuse signal | Admin | Same day |

### 5.3 Shared workflows

- **Question lifecycle:** Author writes → (optional Admin approval) → Engine selects → Student attempts → Engine surfaces calibration outliers → Author retags. The loop is closed; design must support each leg.
- **Mastery lifecycle:** Student attempts → Engine writes mastery → Student sees in heatmap → (rare) Admin recomputes → Student sees banner. Visibility at every step.

---

## 6. Edge Cases in Journeys

### 6.1 Interrupted flows

| Interruption | Where | Recovery |
|---|---|---|
| Tab close mid-Practice | J2 | Stopwatch persists server-side; resume from last submitted Q |
| Tab close mid-Test | J3 | Server-authoritative timer; on return, remaining time reflects real elapsed |
| Browser refresh during skip overlay (Practice) | J6 | Question marked unanswered; on resume, overlay re-appears (no auto-tag from timeout — student gets fresh 15s) |
| Sign-out mid-quiz | Any | Quiz auto-submits with current state in Test; saved as draft in Practice (resumable for 24h) |
| Multi-device session conflict | Any | Most recent device wins; older session shows "Quiz continued elsewhere" |

### 6.2 Invalid inputs

| Input | Behavior |
|---|---|
| Numerical: alphabetic chars | Field rejects; tooltip "Enter a number" |
| Numerical: empty submit | Treated as skipped |
| MCQ: no selection | Treated as skipped (Practice → triggers overlay; Test → silent skip) |
| Custom test: 0 Qs / 0 min | Builder disables *Start* button; inline error |
| Custom test: chapters with zero published Qs | Chapter shown but unselectable; tooltip "No questions yet" |
| Author: missing required field on publish | Inline errors; *Publish* disabled |
| Author: question with options but format = numerical | Validation error |

### 6.3 System failures

| Failure | Handling |
|---|---|
| Engine returns no Q (empty pool) | UI fallback: "Bank not ready for this slice — try a chapter-level quiz." |
| Mastery write fails | Retry; if persistent, queue for batch retry; never lose attempt record |
| Auto-submit job fails | Server retries; if final fail, attempt remains *Live* — visible banner; admin alerted |
| OAuth fails | Graceful "Try again" with retry; no email/password fallback in v1 |
| Recompute job fails mid-run | Resumes from last successful user; idempotent |

### 6.4 Permission conflicts

| Conflict | Resolution |
|---|---|
| Student tries to access author console | 403; redirect to dashboard |
| Author tries to read another user's attempt | Blocked; only own attempts (for QA) and aggregate views |
| Admin overrides student data | Allowed but logged + visible to that user |
| Two admins edit format template simultaneously | Last-write-wins with audit; v2 may add optimistic locking |
| Author edits a question already served | Allowed with confirmation; old attempts retain snapshot semantics |

### 6.5 Boundary cases for the adaptive engine

| Case | Behavior |
|---|---|
| Topic has only one published Q in needed band | Engine substitutes from adjacent band; UI flags |
| Student has only 1 prior attempt on a topic | Mastery = that attempt's score (no avg) |
| Student has 2 prior attempts | Mastery = avg of those 2 |
| Student has 3+ prior attempts | Mastery = avg of last 3 |
| Mastery would compute negative | Clamped to 0 |
| Mastery would exceed 100 | Clamped to 100 |
| All Qs in topic exhausted (last 20 lookback empty) | Repeat-allowed flag; UI banner: "You've seen most of this bank — repeats possible." |

---

## 7. Open Design Decisions for Phase 2

These are **design-time** decisions that affect mockups in Phase 2 and are not resolved by the spec. They block specific journeys above.

| ID | Decision | Affects | Recommendation |
|---|---|---|---|
| D1 | Retroactive vs forward-only mastery correction after a tag fix (J14 step 5) | J14, trust loop | Forward-only in v1; revisit in v2 once a real case occurs |
| D2 | Heatmap mobile layout — collapse columns or horizontal scroll | J2, J5 | Collapse + tap-to-expand cell |
| D3 | Bulk-tag UI on Skipped Questions section | J3 step 7, J5 step 4 | Multi-select + last-used-tag remembered |
| D4 | "Compare last 2 mocks" panel on dashboard | J8 | Ship in v1 — answers the longitudinal-progress drop-off |
| D5 | Pre-flight warning copy for "Physics-only JEE Main" | J3 step 2 | "v1 ships Physics only — all 75 slots will be Physics. Score is comparable to a real Physics-section attempt." |
| D6 | Skip-overlay copy framing the 15s timer | J6 | "Why are you skipping? (15s)" — the timer is for tagging, not thinking |
| D7 | Authoring console scope in v1 — full UI vs basic CRUD + CSV | J10, J11 | Basic CRUD + CSV + preview; defer rich workflow to v2 |
| D8 | Post-test report tabs vs single scrollable page | J5 | Tabs on desktop; vertical sections with sticky tab strip on phone |

---
