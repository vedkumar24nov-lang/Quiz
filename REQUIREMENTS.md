# JEE Prep Quiz App — Requirements Document

> **Phase:** Discovery → Design (Phase 1 complete; ready for Phase 2)
> **Status:** v1.1 — added explicit answer formats (§5.3) + v2 Resources Library roadmap (§10)
> **Author:** Vedant Kumar (Class 11, JEE aspirant)

---

## 1. Vision

A quiz app built **by a JEE aspirant, for JEE aspirants**, designed not just to test memory but to develop the **conceptual thinking and application skills** that JEE actually rewards. The app exists to bridge the gap a lot of students fall into: knowing the theory, but freezing on competency-based problems.

## 2. Target User

- **Primary:** Class 11 and 12 students in India preparing for JEE (Main + Advanced).
- **Profile:** Students who can memorize formulas and definitions but struggle to apply them in unfamiliar problem framings.
- **Goal of the user:** Identify weak topics, drill them with the right difficulty, and build exam-day stamina.

## 3. Problem Statement

Most JEE prep platforms throw a wall of questions at the student without:
- Telling them *what kind* of thinking each question demands (conceptual vs analytical vs memory-recall).
- Adapting to the student's current level — easy questions when they're shaky, harder ones once they've mastered the basics.
- Showing them, after the test, *where* their thinking broke down (not just what they got wrong).

This app is built to fix exactly those three gaps.

## 4. Development Phases

| Phase | Goal | Status |
|---|---|---|
| **1. Discovery** | Convert rough requirements into a clean, complete spec. Brainstorm features. | In progress |
| **2. Design** | Build pages and components with dummy data. Each element must serve learning, not just look good. | Pending |
| **3. Development** | Wire up real data, polish, launch. | Pending |

---

## 5. Core Functional Requirements

### 5.1 Subject → Chapter → Topic Hierarchy

The app's content is organized in three levels so a student can drill down to exactly the topic they're weak in:

- **Subjects:** Physics, Chemistry, Mathematics
- **Chapters:** Per Class 11 / 12 NCERT + JEE syllabus (e.g., *Rotational Motion*, *Thermodynamics*, *Coordination Compounds*, *Conic Sections*)
- **Topics:** Sub-units within a chapter (e.g., under *Rotational Motion* → *Moment of Inertia*, *Torque*, *Angular Momentum*)

A student can launch a quiz at the **topic** level (most granular) or roll up to chapter / full-subject quizzes.

### 5.2 Two Quiz Modes

#### Practice Mode
- **No time limit.**
- A **stopwatch counts up** from the moment Q1 is shown until the student submits.
- Goal: understand the concept, not race the clock.
- **Per-question solution reveal:** after the student submits an answer to a question, a *"Show solution"* button becomes available inline. They can view the worked solution before moving on, or skip and review all solutions in the post-submission report.

#### Test Mode

A test runs against a **format template** that defines its duration, question count, and marking scheme. The student picks a format when launching the test, and marks per question come from that format — not from a global app-wide setting.

**Built-in format templates (v1):**

- **JEE Main** — 3 hours, 75 questions (25 each across Physics / Chemistry / Maths). MCQ: +4 / −1. Numerical (integer-answer): +4 / 0.
- **JEE Advanced** — Out of v1 scope; planned for v2 (Advanced has too many edge cases — multi-correct partial marking, paragraph questions — to do well in v1).
- **Topic test** — Single chapter or topic. Configurable duration and question count. Default marking scheme: difficulty-weighted (Easy +3, Medium +4, Hard +5 for correct; −2 flat for wrong).
- **Custom** — Student configures duration and question count. Default marking scheme: same difficulty-weighted scheme as Topic test (Easy +3 / Medium +4 / Hard +5; wrong −2). v1 keeps it that simple — no per-section timers or partial-marking rules.

**Common rules across formats:**

- **Countdown timer** runs for the format's full duration; auto-submit on expiry.
- **Negative marking** behavior is determined entirely by the chosen format's scheme.
- **Practice mode never applies negative marking**, regardless of which format was used to generate the question set.

Goal: simulate real exam pressure including the "should I attempt or skip?" judgment that real JEE demands.

### 5.3 Question Tags and Answer Formats (visible during the quiz)

Every question carries **two badges** above the question stem — one for difficulty, one for cognitive type. The dimensions are orthogonal: a question can be *Hard + Conceptual*, *Easy + Application*, etc.

**Difficulty tags:**
- **Easy** — straightforward, single-step.
- **Medium** — multi-step but standard.
- **Hard** — challenging multi-step or JEE-Advanced level.

**Type tags:**
- **Recall** — tests memory of facts or formulas.
- **Conceptual** — tests depth of understanding, not calculation.
- **Analytical** — requires reasoning across concepts.
- **Application (competency-based)** — real-world or unfamiliar framing.

These tags also drive the report's heatmap and the "Wrong Answered Questions" review section (§5.4) — the student doesn't have to label their own mistakes, the question metadata does the analytical work.

**Answer formats (v1):**

The app supports two answer-input formats, mirroring JEE Main:

- **MCQ (single-correct)** — four options shown; exactly one is correct.
- **Numerical / fill-in-the-blank (integer-answer)** — the student types a single integer or short numerical value into an input field (e.g., `42`, `1.5`).

Multi-correct MCQ and matrix-match formats (used in JEE Advanced) are out of v1 scope (§8).

### 5.4 Post-Submission Report

After the student submits a quiz, the app generates a detailed report with:

1. **Attempt summary**
   - Total questions, attempted, correct, wrong, left blank.
   - Total score (with negative marking in test mode — TBD).
   - Total time taken.

2. **Per-question breakdown**
   - Time spent on each question.
   - Whether it was correct / wrong / skipped.
   - Both the **difficulty tag** and the **type tag** for the question (e.g., `Q12 — Hard, Analytical`; `Q19 — Medium, Conceptual`).
   - Helps the student see patterns: *"I got all the Recall questions right but bombed every Hard + Analytical one — I need to work on application, not theory."*

3. **Strengths & weaknesses heatmap**
   - Visual breakdown by **topic**, **difficulty**, **question type**, and **skip-reason tag**.
   - Color-coded (e.g., green = strong, red = weak).
   - Wrong-answer signal comes from the question's intrinsic difficulty + type tags — no self-tagging required there. Patterns like *"most of my wrong answers were Hard + Conceptual"* fall out automatically.
   - Skip-reason aggregation reveals patterns like *"60% of my Mechanics skips are 'Conceptual gap' — that topic needs theory revision."*
   - Tells the student where to focus next session.

4. **Post-submission review sections** (in the report)

   The report has two dedicated review sections, accessible as side-tabs or scroll sections:

   - **"Wrong Answered Questions"** — every wrong answer listed for review. For each question, the report shows:
     - The student's answer vs the correct answer.
     - The question's **intrinsic tags** — difficulty (*Easy / Medium / Hard*) and type (*Conceptual / Analytical / Competency-based / Recall*) from §5.3.
     - **No self-tagging by the student** — the intrinsic tags are the signal. The student doesn't need to label their own mistakes; the pattern emerges from the question metadata directly.

   - **"Skipped Questions"** (test mode only — practice mode handles this inline via §5.6.1)
     - Every skipped question listed.
     - For each, the student can pick a tag from the skip-reason list (§5.6.1: *Forgot the formula / Conceptual gap / Misread / Will come back to it*).
     - **Tagging is optional with a visible nudge** — e.g., a *"you've tagged 3/20 — tag the rest for a richer heatmap"* prompt. Not blocking, but visibly incomplete until done.

### 5.5 Mastery Score and Adaptive Difficulty

These are two halves of one mechanism: the **mastery score** is the engine that measures what the student knows; the **adaptive difficulty** is the output that uses that score to pick the next question.

#### 5.5.1 Per-topic mastery score (the engine)

Every topic the student has attempted gets a **mastery score from 0–100** that the app maintains over time.

**Update formula (v1):**

After each attempt on a topic, compute that attempt's contribution:

- **Per-question delta** — same difficulty-weighted scheme used by Topic / Custom test marks:
  - Correct: Easy **+3**, Medium **+4**, Hard **+5**
  - Wrong: **−2** (flat, regardless of difficulty)
  - Skipped: 0
- **Attempt score** = `max(0, points_earned / max_possible_points × 100)`. Negative totals (very poor performance) are capped at 0.
- **Topic mastery** = simple average of the **last 3 attempts'** attempt scores. First and second attempts use whatever attempts exist.

**Other behavior:**

- **No automatic decay over time** — the score stays at whatever the last attempt left it until the student attempts the topic again. Keeps v1 simple; revisit if stale scores become a problem.
- **Aggregates upward:** chapter mastery is derived from its topics; subject mastery from its chapters. Lets the student see weak spots at any zoom level.
- **Visible to the student** — shown openly per topic, chapter, and subject. Not hidden as an internal signal.
- **Format-independent** — the mastery formula uses the difficulty-weighted scheme regardless of which format template the student picked. Test marks shown to the student still follow the format's own scheme (JEE Main = +4/−1, etc.); only the mastery update uses the unified weighting.

#### 5.5.2 Adaptive difficulty (driven by mastery)

The app picks the next question's difficulty based on the topic's current mastery score:

- **High mastery (e.g., 80+):** bias toward harder, competency / JEE-Advanced-level questions.
- **Mid mastery (50–80):** balanced mix across difficulties.
- **Low mastery (<50):** bias toward easier, fundamentals questions to rebuild confidence.

- **Scenario A — High performer:** Student scored 96/100 on Topic X. Mastery jumps. Next attempt skews harder.
- **Scenario B — Struggling:** Student scored poorly. Mastery drops. Next attempt skews easier.

Exact difficulty mix, update formula, and decay rate are TBD — see Section 7.

### 5.6 Skip-Reason Tagging

Skip-tagging works *differently* in practice vs test mode, by design — the goal is reflection in practice, real exam simulation in test.

#### 5.6.1 Practice Mode — in-quiz tagging

When the student tries to move past a question with no answer selected, a **blocking overlay** appears with the available skip-reason tags. The student must pick one to proceed.

- **Tag list (v1 candidate — see §7):**
  - **Forgot the formula**
  - **Conceptual gap** — don't actually understand this concept
  - **Misread the question**
  - **Will come back to it** — just triaging, plan to revisit
- **15-second visible countdown** on the overlay. If the student doesn't pick a tag within 15 seconds, the overlay closes automatically and the question is auto-tagged **"Conceptual gap"** (the strongest default — if the student can't even articulate why they're skipping, they likely don't know it).
- **Stopwatch pauses** while the overlay is open, so reflection time isn't counted in total quiz time.
- **Auto-remove on successful revisit:** if the student returns to the question and answers it *correctly* before submitting, the skip tag is removed.
- **Tag changes on incorrect revisit:** if the student returns and answers *wrongly*, the original skip tag is removed; the question is simply shown as a wrong answer in the report, alongside its intrinsic difficulty + type tags (§5.4 item 4 — no self-tagging on wrong answers).

#### 5.6.2 Test Mode — no in-quiz tagging

To simulate real JEE conditions, **there is no skip overlay in test mode**. The student skips silently and continues, exactly like the actual JEE Main / Advanced. The countdown timer never pauses.

- All unanswered questions appear in the post-submission report's **"Skipped Questions"** section (§5.4 item 4) where the student can tag them retrospectively.
- Questions the student never reached because the timer ran out are silently auto-tagged **"Ran out of time"** in the report.

**Why this matters:**

Skip patterns reveal more than scores. A student who keeps skipping with *"Conceptual gap"* on Thermodynamics knows exactly which topic needs revision. A student whose skips are mostly *"Will come back to it"* is mismanaging time, not lacking knowledge. The post-quiz report (§5.4) aggregates these tags into the heatmap.

---

## 6. Suggested Additions (still under discussion)

> ✅ **Already promoted to Section 5 (locked in):**
> - Negative marking in test mode → §5.2
> - Skip-reason tagging in practice mode → §5.6.1 (in-quiz, blocking overlay with 15-second timer)
> - No in-quiz tagging in test mode → §5.6.2 (preserves real JEE simulation)
> - Post-submission review sections in the report → §5.4 (item 4) — Wrong Answered (intrinsic metadata only, no self-tags) + Skipped Questions (test mode, optional self-tagging with nudge)
> - Mastery score per topic → §5.5.1 (engine for adaptive difficulty)
>
> ❌ **Rejected (out of scope for v1):**
> - Confidence rating per question — adds friction during a quiz; not worth the trade-off.
> - Spaced repetition / Revisit queue — initially accepted, later dropped to keep v1 focused on the core quiz + report + adaptive loop.
>
> The items below are still open. Not requirements yet — let's go through them and decide.

### 6.1 Question metadata — go beyond difficulty
In addition to the difficulty/type tag, consider tagging each question with:
- **PYQ flag** (Previous Year Question) — and which year + JEE Main / Advanced.
- **NCERT-based** vs **beyond-NCERT**.
- **Estimated solve time** (e.g., "JEE expects ~2 min on this") so the student can compare their actual time.

### 6.2 Mark for review / flag during quiz
Standard JEE-interface feature — let the student flag a question and come back to it. Trains real exam navigation.

### 6.3 Solution + concept link after each question
In practice mode (and in the post-test report), every question should have:
- Step-by-step solution.
- Link back to the **concept / topic** it tests, so the student can revise the underlying theory.

### 6.4 Custom quiz builder
Let the student build their own quiz: pick 1+ chapters, choose number of questions, choose difficulty mix (e.g., 40% medium, 40% hard, 20% PYQ). Useful right before a school test.

### 6.5 Daily streak / consistency tracker
Small dopamine loop. Helps a 16-year-old build a daily habit. Optional but cheap to add.

### 6.6 Time-per-question target vs actual
JEE Main averages ~2.4 min/question. The report should highlight questions where the student spent **>2x the target** — those are the bottlenecks to work on, even if they got them right.

### 6.7 Bookmark / "save for later"
Student can bookmark interesting or tough questions to revisit, independent of the wrong-answer queue.

### 6.8 Dark mode
Most JEE students study late at night. Cheap to support, big quality-of-life win.

---

## 7. Open Questions — All Resolved

All Phase 1 open questions are now closed. Resolutions are summarized below; the substance is reflected in §§5, 8, and 9.

1. ~~**Question-type taxonomy**~~ — ✅ resolved: two orthogonal dimensions per question — **Difficulty** (Easy / Medium / Hard) and **Type** (Recall / Conceptual / Analytical / Application). See §5.3.
2. ~~**Negative marking — default behavior**~~ — ✅ resolved: determined by the chosen format template (§5.2). Practice mode never applies it.
3. ~~**Solutions in practice mode**~~ — ✅ resolved: per-question reveal — *"Show solution"* button becomes available after the student submits an answer to that question (§5.2 Practice Mode).
4. ~~**Adaptive algorithm specifics**~~ — ✅ resolved: rolling window of the **last 3 attempts**; mastery shifts smoothly per the difficulty-weighted formula in §5.5.1; difficulty bands per §5.5.2 (80+ harder, 50–80 balanced, <50 easier).
5. ~~**Scope of v1 — subjects**~~ — ✅ resolved: **Physics only** in v1; Chemistry and Maths in v2/v3. See §9.
6. ~~**Question bank source**~~ — ✅ resolved: JEE PYQ datasets (publicly available) + self-authored questions; target ~150–200 per topic. See §9.
7. ~~**Authentication**~~ — ✅ resolved: **Google sign-in only** for v1. See §9.
8. ~~**Platform**~~ — ✅ resolved: **responsive web app** for v1 (works on phone + laptop). Native mobile in v2 if traction. See §9.
9. ~~**Offline mode**~~ — ✅ resolved: out of scope for v1 (§8); v1 is online-only.
10. ~~**Heatmap visualization style**~~ — ✅ resolved: **topic-grid heatmap** as primary (rows = chapters/topics, columns = difficulty bands, cells colored by mastery). Calendar/streak heatmap is a v2 add. See §9.
11. ~~**Negative marking on numerical questions**~~ — ✅ resolved: handled by the format template (§5.2).
12. ~~**Skip-reason tag list**~~ — ✅ resolved: locked at *Forgot the formula / Conceptual gap / Misread the question / Will come back to it* for v1 (§5.6.1).
13. ~~**Post-submission tagging — required or skippable?**~~ — ✅ resolved: optional with visual nudge (option c). Applies only to the *Skipped Questions* section.
14. ~~**Spaced repetition — opt-in or default-on?**~~ — ✅ resolved: feature dropped from v1.
15. ~~**Spaced repetition — graduation rule**~~ — ✅ resolved: feature dropped from v1.
16. ~~**Spaced repetition mixing**~~ — ✅ resolved: feature dropped from v1.
17. ~~**Mastery score visibility**~~ — ✅ resolved: visible to the student.
18. ~~**Mastery decay rate**~~ — ✅ resolved: no automatic decay in v1.
19. ~~**Mastery weighting by difficulty**~~ — ✅ resolved: yes, weighted. Per-question deltas: Easy correct **+3**, Medium correct **+4**, Hard correct **+5**, any wrong **−2**. Attempt scores normalized to 0–100; topic mastery is the rolling average of the last 3 attempts. See §5.5.1.
20. ~~**JEE Advanced format details**~~ — ✅ resolved: out of v1 scope; planned for v2 (§8).
21. ~~**Custom format scope**~~ — ✅ resolved: minimal v1 — duration, total question count, and the difficulty-weighted marking scheme above. No per-section timers, no partial-marking rules. See §5.2.
22. ~~**Timer-pause in test mode**~~ — ✅ resolved: no in-quiz tagging in test mode (§5.6.2); timer never pauses there.
23. ~~**Anti-stalling on the skip-tag overlay**~~ — ✅ resolved: 15-second visible countdown on the overlay; auto-tag = *"Conceptual gap"* on expiry (§5.6.1).
24. ~~**Wrong-answer reflection**~~ — ✅ resolved: post-submission "Wrong Answered Questions" section in the report (§5.4 item 4) — intrinsic difficulty + type tags shown; no self-tagging.
25. ~~**Revisit-then-wrong behavior**~~ — ✅ resolved: original skip tag is removed; question is shown as a wrong answer in the report (§5.6.1).

---

## 8. Non-Goals (for v1)

To keep scope realistic, the following are **explicitly out of scope** for v1:

- **JEE Advanced format** — Advanced marking has too many edge cases (multi-correct partial marks, paragraph questions); v2.
- ~~Subjects beyond Physics~~ — **moved into v1 scope** (2026-05-02). All three subjects (Physics, Chemistry, Mathematics) now ship in v1.
- **Offline mode** — adaptive engine and mastery scores need server sync; v2.
- **Native mobile app** — responsive web only in v1; native in v2 if traction.
- Live classes / video content.
- Peer leaderboards / social features.
- Doubt-solving chat with mentors.
- AI-generated questions.
- Paid plans / monetization.

These can be revisited after v1 ships.

---

## 9. v1 Implementation Strategy

Strategic decisions that constrain *how* v1 gets built. These aren't user-facing features but they shape every later choice.

### 9.1 Subject scope
**All three JEE subjects: Physics, Chemistry, Mathematics.** Class 11 + 12 NCERT chapters across all three. Earlier "Physics only" v1 plan was reversed mid-Phase-3 (2026-05-02) — it had created a misleading "JEE Main mock" experience and was flagged in the buyer challenge (Mrs. Sharma PA-2, Aditya ST-8). Honest framing wins: a JEE prep app must cover the JEE syllabus.

> **Historical note:** v1 was originally scoped to Physics only because the adaptive engine needed proving on a clean subject before scaling. That decision was reversed because (a) the question bank can be built per-subject in parallel, (b) "JEE app that's actually one subject" is a brand liability, and (c) the per-subject mastery loop is the same regardless of subject — Physics doesn't actually validate anything Chemistry or Maths wouldn't.

### 9.2 Question bank
**Two-pronged approach:**
- **JEE PYQs** — publicly available; scrape or license existing PYQ datasets. Already tagged by year and exam (Main vs Advanced), useful as seed content.
- **Self-authored** — fill gaps by chapter/topic/difficulty/type so adaptive logic has something to work with at every level.

**Target:** ~150–200 questions per topic minimum. **This is the longest pole** — sourcing must run in parallel with design, not after.

### 9.3 Authentication
**Google sign-in only** for v1. Lowest friction, universal among Indian students, no password management overhead. Email/password and phone OTP can come in later versions.

### 9.4 Platform
**Responsive web app.** Single codebase, works on phone and laptop, fastest to ship. Native mobile in v2 if traction warrants.

### 9.5 Heatmap visualization
**Topic-grid heatmap** as the primary visualization — rows = chapters/topics, columns = difficulty bands, cells colored by mastery score. Familiar pattern (LeetCode-style). A calendar-style activity heatmap (GitHub-style streaks) is a v2 dashboard add.

---

## 10. v2 Roadmap

Features discussed and accepted in concept but explicitly deferred to v2. Captured here so they aren't lost when v1 ships.

### 10.1 Resources Library

A study-companion section of the app where students consume curated study material alongside the quiz mechanic. Two resource types, each with its own learning flow.

#### Conceptual resources

Books and reference PDFs the student reads to understand concepts.

- **Flow:** read the book → solve questions on the concepts covered → continue reading → after the book is finished, the app generates a **test based on the book's content** to check understanding.
- **Test generation:** the app analyzes the book content and builds the quiz itself (the student doesn't pick a topic — the test is tied to that specific book).
- **Question formats:** MCQ + Numerical/fill-in-the-blank (same as §5.3).

#### Practice resources

PDFs / practice sheets the student uses to drill specific topics.

- **Pre-labeled metadata:** every practice resource shows its **topic** and **total question count** before the student opens it, so they can plan their study time accordingly.

#### Common behaviors

- **Persistent progress bar** per resource. The student can open and close a resource freely; their position is preserved. Example: leaves at 60% page, returns later, resumes from 60%. Progress bar tracks actual consumption, not just whether the file was opened.
- **Source of content (when v2 ships):** NCERT (free, legally distributable) + self-authored material. No copyrighted reference books or coaching sheets.
- **During the design phase (Phase 2):** dummy PDFs and placeholder progress states are used for mockups — real content is uploaded later.

#### v2 open questions (to revisit when v2 starts)

- **OQ-R1:** "App analyzes book content" — metadata-driven test generation (book pre-tagged with topics → test pulls from existing question bank), or AI/LLM-driven content extraction (LLM reads the book and generates new questions)?
- **OQ-R2:** Practice resource interaction — solve on paper and check a key inside the PDF, or import the sheet's questions into the in-app quiz UI (which means digitizing each sheet into the question schema)?
- **OQ-R3:** Discoverability — auto-suggest resources based on weak mastery scores, or free-browse only?
- **OQ-R4:** Progress tracking granularity — page number, scroll position, or chapter/section?
