/**
 * Maps raw CSV/JSON rows from the bulk-import flow into validated `QuestionDraft`s
 * ready for `questionsStore.addQuestion()`.
 *
 * Pipeline: raw row → resolveTopic() → validateAnswer() → ValidationResult.
 * Errors are gathered per-row so the UI can render a table; valid rows can be
 * imported in one batch even when others fail.
 */

import type { Track, Topic, Difficulty, QuestionType, AnswerFormat } from '@/types';
import type { QuestionDraft } from '@/store/questionsStore';

export interface RawRow {
  // Source (one is required)
  topicId?: string;
  topicName?: string;
  subtopicName?: string;

  // Tags (required)
  difficulty?: string;
  type?: string;
  format?: string; // mcq | numerical

  // Content (required)
  stem?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctAnswer?: string;
  solution?: string;

  // Optional
  estimatedTimeSeconds?: string;
  // Allow extra unrecognised columns without failing
  [key: string]: string | undefined;
}

export type RowStatus = 'valid' | 'warning' | 'error';

export interface ValidatedRow {
  rowNumber: number;
  status: RowStatus;
  errors: string[];
  warnings: string[];
  /** Resolved topic for display (when found). */
  resolvedTopicLabel?: string;
  /** Built draft, present only if status === 'valid' (or 'warning'). */
  draft?: QuestionDraft;
  /** Raw stem for table preview, even when invalid. */
  stemPreview?: string;
}

export interface ValidationSummary {
  rows: ValidatedRow[];
  validCount: number;
  warningCount: number;
  errorCount: number;
  duplicatesDetected: number;
}

const DIFFICULTIES = new Set<Difficulty>(['Easy', 'Medium', 'Hard']);
const TYPES = new Set<QuestionType>(['Recall', 'Conceptual', 'Analytical', 'Application']);

/**
 * Topic index built once per validation run, used to resolve `topicName` →
 * topic. When a name appears under multiple chapters/subjects/tracks,
 * resolution becomes ambiguous and that row errors out.
 */
interface TopicIndex {
  byId: Map<string, { topic: Topic; label: string }>;
  byNameLower: Map<string, Array<{ topic: Topic; label: string }>>;
}

function buildTopicIndex(tracks: Track[]): TopicIndex {
  const byId = new Map<string, { topic: Topic; label: string }>();
  const byNameLower = new Map<string, Array<{ topic: Topic; label: string }>>();
  for (const track of tracks) {
    if (track.archivedAt) continue;
    for (const subj of track.subjects) {
      if (subj.archivedAt) continue;
      for (const ch of subj.chapters) {
        if (ch.archivedAt) continue;
        for (const tp of ch.topics) {
          if (tp.archivedAt) continue;
          const label = `${track.name} › ${subj.name} › ${ch.name} › ${tp.name}`;
          byId.set(tp.id, { topic: tp, label });
          const key = tp.name.toLowerCase().trim();
          if (!byNameLower.has(key)) byNameLower.set(key, []);
          byNameLower.get(key)!.push({ topic: tp, label });
        }
      }
    }
  }
  return { byId, byNameLower };
}

function resolveTopic(
  row: RawRow,
  index: TopicIndex
):
  | { ok: true; topic: Topic; label: string }
  | { ok: false; error: string } {
  const id = row.topicId?.trim();
  const name = row.topicName?.trim();
  if (id) {
    const hit = index.byId.get(id);
    if (!hit) return { ok: false, error: `topicId '${id}' not found in any active track.` };
    return { ok: true, topic: hit.topic, label: hit.label };
  }
  if (!name) return { ok: false, error: 'Either topicId or topicName is required.' };
  const matches = index.byNameLower.get(name.toLowerCase()) ?? [];
  if (matches.length === 0) {
    return { ok: false, error: `topicName '${name}' not found.` };
  }
  if (matches.length > 1) {
    const where = matches.map((m) => m.label).join(' / ');
    return {
      ok: false,
      error: `topicName '${name}' is ambiguous — found in: ${where}. Use topicId instead.`,
    };
  }
  return { ok: true, topic: matches[0].topic, label: matches[0].label };
}

function resolveSubtopicId(
  row: RawRow,
  topic: Topic
): { ok: true; subtopicId: string | undefined } | { ok: false; error: string } {
  const name = row.subtopicName?.trim();
  if (!name) return { ok: true, subtopicId: undefined };
  const matches = topic.subtopics.filter(
    (s) => !s.archivedAt && s.name.toLowerCase() === name.toLowerCase()
  );
  if (matches.length === 0) {
    return { ok: false, error: `subtopicName '${name}' not found under topic '${topic.name}'.` };
  }
  return { ok: true, subtopicId: matches[0].id };
}

function normalizeDifficulty(raw: string | undefined): Difficulty | null {
  if (!raw) return null;
  const candidate = raw.trim().charAt(0).toUpperCase() + raw.trim().slice(1).toLowerCase();
  return DIFFICULTIES.has(candidate as Difficulty) ? (candidate as Difficulty) : null;
}

function normalizeType(raw: string | undefined): QuestionType | null {
  if (!raw) return null;
  const candidate = raw.trim().charAt(0).toUpperCase() + raw.trim().slice(1).toLowerCase();
  return TYPES.has(candidate as QuestionType) ? (candidate as QuestionType) : null;
}

function normalizeFormat(raw: string | undefined): AnswerFormat | null {
  if (!raw) return null;
  const v = raw.trim().toLowerCase();
  if (v === 'mcq' || v === 'numerical') return v;
  return null;
}

/**
 * For MCQ format, accept correct answer as A/B/C/D, a/b/c/d, 0/1/2/3,
 * 1/2/3/4 (1-indexed), or the literal option text. Returns the 0-based index.
 */
function resolveMcqCorrect(
  raw: string,
  options: string[]
): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Letter A-D
  if (/^[A-Da-d]$/.test(trimmed)) {
    return trimmed.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
  }
  // 0-indexed digit
  if (/^[0-3]$/.test(trimmed)) return Number(trimmed);
  // 1-indexed digit (treat 1-4 as A-D)
  if (/^[1-4]$/.test(trimmed)) return Number(trimmed) - 1;
  // Match by option text
  const idx = options.findIndex((o) => o.trim() === trimmed);
  if (idx >= 0) return idx;
  return null;
}

export function validateRows(rows: RawRow[], tracks: Track[]): ValidationSummary {
  const index = buildTopicIndex(tracks);
  const stemsSeen = new Map<string, number[]>();
  const validatedRows: ValidatedRow[] = [];

  rows.forEach((row, i) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const rowNumber = i + 2; // +1 for header, +1 for 1-indexed
    const stemPreview = row.stem?.trim();

    // Topic
    const topicResult = resolveTopic(row, index);
    if (!topicResult.ok) {
      errors.push(topicResult.error);
    }

    // Tags
    const difficulty = normalizeDifficulty(row.difficulty);
    if (!difficulty) {
      errors.push(
        `difficulty must be Easy / Medium / Hard (got '${row.difficulty ?? ''}').`
      );
    }
    const type = normalizeType(row.type);
    if (!type) {
      errors.push(
        `type must be Recall / Conceptual / Analytical / Application (got '${row.type ?? ''}').`
      );
    }
    const format = normalizeFormat(row.format);
    if (!format) {
      errors.push(`format must be mcq or numerical (got '${row.format ?? ''}').`);
    }

    // Stem
    if (!stemPreview || stemPreview.length < 5) {
      errors.push('stem is required and must be at least 5 characters.');
    }

    // Solution
    const solution = row.solution?.trim();
    if (!solution || solution.length < 5) {
      errors.push('solution is required and must be at least 5 characters.');
    }

    // Answer (depends on format)
    let mcqOptions: string[] | undefined;
    let mcqCorrectIndex: number | null = null;
    let numericAnswer: number | null = null;

    if (format === 'mcq') {
      const opts = [
        row.optionA ?? '',
        row.optionB ?? '',
        row.optionC ?? '',
        row.optionD ?? '',
      ].map((o) => o.trim());
      if (opts.some((o) => !o)) {
        errors.push('All four options (optionA-D) are required for MCQ.');
      }
      mcqOptions = opts;
      const rawCorrect = (row.correctAnswer ?? '').trim();
      if (!rawCorrect) {
        errors.push('correctAnswer is required.');
      } else {
        mcqCorrectIndex = resolveMcqCorrect(rawCorrect, opts);
        if (mcqCorrectIndex === null) {
          errors.push(
            `correctAnswer '${rawCorrect}' must be A/B/C/D, 0-3, 1-4, or match an option exactly.`
          );
        }
      }
    } else if (format === 'numerical') {
      const rawCorrect = (row.correctAnswer ?? '').trim();
      if (!rawCorrect) {
        errors.push('correctAnswer is required.');
      } else {
        const n = parseFloat(rawCorrect);
        if (Number.isNaN(n)) {
          errors.push(`correctAnswer '${rawCorrect}' is not a valid number.`);
        } else {
          numericAnswer = n;
        }
      }
      // Warn if MCQ-only fields are filled for a numerical question
      if (
        (row.optionA ?? '').trim() ||
        (row.optionB ?? '').trim() ||
        (row.optionC ?? '').trim() ||
        (row.optionD ?? '').trim()
      ) {
        warnings.push('Options ignored for numerical format.');
      }
    }

    // Subtopic (only resolved if topic resolved)
    let subtopicId: string | undefined;
    if (topicResult.ok) {
      const sub = resolveSubtopicId(row, topicResult.topic);
      if (!sub.ok) {
        errors.push(sub.error);
      } else {
        subtopicId = sub.subtopicId;
      }
    }

    // Estimated time
    let estimatedTimeSeconds: number | undefined;
    if (row.estimatedTimeSeconds && row.estimatedTimeSeconds.trim()) {
      const n = Number(row.estimatedTimeSeconds);
      if (!Number.isFinite(n) || n < 0) {
        warnings.push(
          `estimatedTimeSeconds '${row.estimatedTimeSeconds}' ignored (must be a non-negative number).`
        );
      } else {
        estimatedTimeSeconds = n;
      }
    }

    // Duplicate detection (within this CSV) — case-insensitive stem match
    if (stemPreview) {
      const key = stemPreview.toLowerCase();
      const seenAt = stemsSeen.get(key);
      if (seenAt) {
        warnings.push(
          `Duplicate stem — same as row ${seenAt.map((r) => r + 2).join(', ')}.`
        );
      }
      const list = stemsSeen.get(key) ?? [];
      list.push(i);
      stemsSeen.set(key, list);
    }

    let draft: QuestionDraft | undefined;
    if (
      errors.length === 0 &&
      topicResult.ok &&
      difficulty &&
      type &&
      format &&
      stemPreview &&
      solution
    ) {
      draft = {
        topicId: topicResult.topic.id,
        subtopicId,
        difficulty,
        type,
        format,
        stem: stemPreview,
        options: format === 'mcq' ? mcqOptions : undefined,
        correctAnswer:
          format === 'mcq'
            ? mcqCorrectIndex ?? 0
            : numericAnswer ?? 0,
        solution,
        estimatedTimeSeconds,
      };
    }

    const status: RowStatus =
      errors.length > 0 ? 'error' : warnings.length > 0 ? 'warning' : 'valid';

    validatedRows.push({
      rowNumber,
      status,
      errors,
      warnings,
      resolvedTopicLabel: topicResult.ok ? topicResult.label : undefined,
      draft,
      stemPreview,
    });
  });

  return {
    rows: validatedRows,
    validCount: validatedRows.filter((r) => r.status === 'valid').length,
    warningCount: validatedRows.filter((r) => r.status === 'warning').length,
    errorCount: validatedRows.filter((r) => r.status === 'error').length,
    duplicatesDetected: validatedRows.filter((r) =>
      r.warnings.some((w) => w.startsWith('Duplicate stem'))
    ).length,
  };
}

// ─── Sample CSV (for the Download Template button) ─────────────────────────

export const SAMPLE_CSV_HEADERS = [
  'topicName',
  'subtopicName',
  'difficulty',
  'type',
  'format',
  'stem',
  'optionA',
  'optionB',
  'optionC',
  'optionD',
  'correctAnswer',
  'solution',
  'estimatedTimeSeconds',
];

export const SAMPLE_CSV_ROWS: Array<Record<string, string>> = [
  {
    topicName: 'Moment of Inertia',
    subtopicName: 'MoI of Standard Shapes (Rod, Disc, Ring, Sphere)',
    difficulty: 'Easy',
    type: 'Recall',
    format: 'mcq',
    stem: 'The moment of inertia of a thin uniform rod (mass M, length L) about an axis through its centre and perpendicular to its length is:',
    optionA: 'ML²/12',
    optionB: 'ML²/3',
    optionC: 'ML²/2',
    optionD: 'ML²/6',
    correctAnswer: 'A',
    solution: 'For a thin uniform rod, MoI about an axis perpendicular to it through its centre is ML²/12.',
    estimatedTimeSeconds: '60',
  },
  {
    topicName: 'Carnot Cycle',
    subtopicName: '',
    difficulty: 'Medium',
    type: 'Conceptual',
    format: 'numerical',
    stem: 'A Carnot engine operates between 400 K and 300 K. What is its efficiency (as a decimal)?',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '0.25',
    solution: 'η = 1 − T_cold / T_hot = 1 − 300/400 = 0.25.',
    estimatedTimeSeconds: '90',
  },
];
