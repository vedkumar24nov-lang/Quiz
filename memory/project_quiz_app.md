---
name: JEE Quiz App project
description: JEE-prep quiz app — Phase 1 (Discovery) complete as of 2026-05-01; ready for Phase 2 (Design). Spec at REQUIREMENTS.md
type: project
---

JEE prep quiz app for Class 11/12 students in India. Three planned phases: Discovery → Design (with dummy data) → Development (real data + launch). Phase 1 closed on 2026-05-01 with all 25 open questions resolved.

**Why:** Vedant noticed that JEE prep apps test recall but don't help students who can memorize but freeze on application/competency questions. The app's differentiators are: question-type tagging visible during the quiz, a post-test report that breaks down performance by question *type* (not just topic), and adaptive difficulty driven by per-topic mastery scores.

**Locked-in v1 scope:** Physics only (NCERT 11 + 12). Responsive web app. Google sign-in. Online-only. JEE Main format + Topic + Custom test formats; JEE Advanced and other subjects punted to v2/v3. Question bank: PYQs + self-authored, ~150–200 per topic.

**Locked-in core mechanics:** Practice mode (stopwatch, per-question solution reveal, blocking skip-tag overlay with 15s countdown) vs Test mode (countdown timer, no in-quiz tagging, post-submission report with skip-reason tagging). Mastery score 0–100 per topic, rolling average of last 3 attempts, weighted +3/+4/+5 correct (E/M/H) and −2 wrong, no decay. Adaptive difficulty driven by mastery bands (80+ harder, 50–80 balanced, <50 easier).

**How to apply:** Spec lives in `REQUIREMENTS.md` at the repo root. Phase 2 (Design) starts next — pages, components, dummy data flows. Don't reopen Phase 1 decisions unless Vedant explicitly asks; treat the doc as the source of truth.
