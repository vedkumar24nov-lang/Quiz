// Core domain types — mirror the schema we'll use in Postgres later (S3)

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionType = 'Recall' | 'Conceptual' | 'Analytical' | 'Application';
export type AnswerFormat = 'mcq' | 'numerical';

export type SkipReason =
  | 'Forgot the formula'
  | 'Conceptual gap'
  | 'Misread the question'
  | 'Will come back to it'
  | 'Ran out of time';

/**
 * Marking points for one answer category (MCQ or numerical).
 * `correct` is awarded for correct answers, `wrong` is the penalty (negative).
 */
export interface MarkingPoints {
  correct: number;
  wrong: number;
}

/**
 * Reusable definition of a paper format — duration, total Q-count, marking
 * scheme. Decouples "how a test is administered" from "what content the
 * exam covers". Seeded with JEE Main, JEE Advanced, NEET (UG), GATE,
 * Topic Test, Custom Quiz; authors can create more.
 */
export interface ExamFormat {
  id: string;
  name: string;             // e.g. "JEE Main"
  description?: string;
  durationMinutes: number;
  /** Recommended Q-count. 0 = flexible (Topic Test, Custom Quiz). */
  totalQuestions: number;
  markingMcq: MarkingPoints;
  /** Null = format doesn't include numerical questions (e.g., NEET). */
  markingNumerical: MarkingPoints | null;
  /** True for seeded formats — they get the "Restore default" affordance. */
  isSystem: boolean;
  archivedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Top-level curriculum unit. Two kinds:
 *
 * - `class-stream` — covers a specific class + stream's content,
 *    e.g. "Class 11 PCM", "Class 12 PCB", "Class 11 Commerce"
 * - `competitive`  — covers a competitive-exam syllabus that may span
 *    Class 11 + 12, e.g. "JEE Main", "NEET (UG)", "GATE-CS"
 *
 * Each Track owns its Subjects → Chapters → Topics → Subtopics. Two tracks
 * can have a subject named "Physics" with overlapping content — they're
 * still distinct trees (same call as the prior Q1=a exam decision).
 */
export type TrackKind = 'class-stream' | 'competitive';

export interface Track {
  id: string;
  kind: TrackKind;
  name: string;             // e.g. "JEE Main", "Class 11 PCM"
  code?: string;            // e.g. "JEE-MAIN", "11-PCM" — short badge label
  description?: string;
  /** Reference to the ExamFormat this track follows by default for tests. */
  formatId: string;
  /** class-stream only — which NCERT class this track is built for. */
  classLevel?: 11 | 12;
  /** class-stream only — the stream code (free text: PCM, PCB, Commerce, Humanities, …). */
  stream?: string;
  /** Authors prototype tracks privately; admin flips this true to expose them to students. */
  isPublished?: boolean;
  archivedAt?: string;
  subjects: Subject[];
}

// ─── Exam (curated test paper) ────────────────────────────────────────────
// A specific test paper an author has authored. Sits under a Track, uses
// either a Paper Pattern (locked duration / Q-count / marking) or fully
// custom settings, and references an ordered list of questions from the
// global question bank.
//
// Distinct from `Track` (the syllabus container) and from `ExamFormat`
// (the paper-pattern reference template — labelled "Paper Pattern" in UI).

export interface Exam {
  id: string;
  trackId: string;
  name: string;
  description?: string;
  /**
   * If set, the paper pattern locks duration / total Q-count / marking.
   * If null, the Exam is custom and the author defines those via the
   * `custom*` fields below.
   */
  paperPatternId: string | null;

  // Custom-mode fields — required (and used) only when paperPatternId === null.
  customDurationMinutes?: number;
  /** 0 = flexible (no fixed Q-count requirement). */
  customTotalQuestions?: number;
  customMarkingMcq?: MarkingPoints;
  /** null = exam doesn't include numerical questions. */
  customMarkingNumerical?: MarkingPoints | null;

  /** Ordered list of question IDs from the global bank. */
  questionIds: string[];

  /** Authors create unpublished; admin flips this to expose to students. */
  isPublished?: boolean;
  archivedAt?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Subject {
  id: string;
  trackId: string;
  name: string;
  chapters: Chapter[];
  archivedAt?: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  classLevel: 11 | 12;
  topics: Topic[];
  archivedAt?: string; // ISO timestamp; absent = active. Soft-archive per author console design.
}

export interface Topic {
  id: string;
  chapterId: string;
  name: string;
  questionCount: number;
  subtopics: Subtopic[];
  archivedAt?: string;
}

export interface Subtopic {
  id: string;
  topicId: string;
  name: string;
  questionCount?: number;
  archivedAt?: string;
}

export interface Question {
  id: string;
  topicId: string;
  /** Optional: questions can live at the topic level OR be tagged to a specific subtopic. */
  subtopicId?: string;
  difficulty: Difficulty;
  type: QuestionType;
  format: AnswerFormat;
  stem: string;
  options?: string[]; // MCQ only
  correctAnswer: string | number; // option index for MCQ, number for numerical
  solution: string;
  estimatedTimeSeconds?: number;
  /** Optional inline image (base64 data URL) — diagrams, structures, geometry. Prototype-only storage; production = URL to S3/CDN. */
  imageDataUrl?: string;
  /** Soft archive: hidden from active lists, recoverable. Past attempts on this question still resolve. */
  archivedAt?: string;
  /** When/by-whom this question was authored. Populated by the questionsStore. */
  createdAt?: string;
  updatedAt?: string;
}

export interface AttemptAnswer {
  questionId: string;
  studentAnswer: string | number | null; // null = skipped
  isCorrect: boolean | null; // null = skipped
  timeSpentSeconds: number;
  skipReason?: SkipReason;
}

export type QuizMode = 'practice' | 'test';

export interface Attempt {
  id: string;
  topicId: string;
  topicName: string;
  chapterName: string;
  mode: QuizMode;
  formatTemplate?: 'JEE Main' | 'Topic' | 'Custom';
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  totalTimeSeconds: number;
  scoreRaw: number; // marks per the format scheme
  scoreMax: number;
  attemptScore0to100: number; // normalized for mastery
  startedAt: string; // ISO
  completedAt: string;
  answers: AttemptAnswer[];
}

// ─── Audit log (B7 — A7 from author powers) ───────────────────────────────
// Every author write emits an AuditEntry. The /author/history page reads
// these for a chronological "who did what when" view.

export type AuditEntityType =
  | 'track'
  | 'examFormat'
  | 'exam'
  | 'subject'
  | 'chapter'
  | 'topic'
  | 'subtopic'
  | 'question'
  // Deprecated — kept so older persisted audit entries (created when this
  // entity still existed) continue to render without TS errors.
  | 'template';

export type AuditAction =
  | 'create'
  | 'update'
  | 'archive'
  | 'restore'
  | 'reorder'
  | 'move'
  | 'delete'
  | 'publish'
  | 'unpublish'
  /** Admin action — sets isPublished back to false with a feedback note. */
  | 'reject'
  | 'add-child'
  | 'remove-child'
  | 'reset-seed';

export interface AuditEntry {
  id: string;
  timestamp: string; // ISO-8601
  actorId: string | null;
  actorName: string | null;
  actorRole: 'student' | 'author' | 'admin' | null;
  entityType: AuditEntityType;
  entityId: string;
  /** Human-readable label at time of action (e.g. topic name). */
  entityLabel: string;
  action: AuditAction;
  /** Optional context: what changed, where it moved, etc. Free-form. */
  details?: Record<string, unknown>;
}

export interface MasteryEntry {
  topicId: string;
  topicName: string;
  chapterId: string;
  chapterName: string;
  score: number; // 0-100
  attemptsCount: number;
  lastAttemptedAt: string | null;
}

export type MasteryBand = 'weak' | 'low' | 'mid' | 'strong' | 'empty';

export function getMasteryBand(score: number | null): MasteryBand {
  if (score === null) return 'empty';
  if (score < 40) return 'weak';
  if (score < 60) return 'low';
  if (score < 80) return 'mid';
  return 'strong';
}

// ─── Question flags (student-reported quality issues) ─────────────────────
// Students raise a flag from the post-quiz Report when something looks wrong
// with a question. Admins triage flags from /admin/flags. Closes the
// quality-feedback loop so bad questions get fixed instead of slipping by.

export type FlagReason =
  | 'wrong-answer'
  | 'unclear-stem'
  | 'typo'
  | 'bad-image'
  | 'off-syllabus'
  | 'other';

export type FlagStatus = 'open' | 'resolved' | 'dismissed';

export interface QuestionFlag {
  id: string;
  questionId: string;
  /** Student id at time of submission. */
  studentId: string | null;
  studentName: string | null;
  reason: FlagReason;
  /** Optional free-text from the student. */
  note?: string;
  /** Snapshot of the question stem at flag time — survives later edits. */
  stemSnapshot?: string;
  status: FlagStatus;
  createdAt: string;
  /** Set when admin resolves or dismisses. */
  resolvedAt?: string;
  resolvedBy?: string;
  resolverNote?: string;
}

// ─── Support tickets (general issues + feature requests) ──────────────────
// QuestionFlag is for "this specific question is broken." Tickets are the
// general inbox: bugs, feature requests, account help, anything else.
// Students AND authors can open them — admins triage from /admin/tickets.

export type TicketCategory =
  | 'bug'
  | 'content'
  | 'feature-request'
  | 'account-help'
  | 'other';

export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export type TicketAuthorRole = 'student' | 'author' | 'admin';

export interface SupportTicket {
  id: string;
  /** Snapshot of the user who opened the ticket — survives later edits / deletion. */
  openerId: string | null;
  openerName: string | null;
  openerEmail: string | null;
  openerRole: TicketAuthorRole | null;

  category: TicketCategory;
  /** One-line summary. */
  subject: string;
  /** Free-text body. */
  body: string;
  /** Optional URL the user was on when they raised the ticket — helps reproduce bugs. */
  pageContext?: string;

  status: TicketStatus;

  /** Admin's resolution / status update note. Single-note for v1; threading later. */
  adminReply?: string;
  /** Admin who last touched the ticket. */
  handledBy?: string | null;
  handledByName?: string | null;

  openedAt: string;
  updatedAt: string;
  resolvedAt?: string;
}
