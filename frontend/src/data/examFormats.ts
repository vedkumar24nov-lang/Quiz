import type { ExamFormat } from '@/types';

/**
 * Seeded ExamFormats. Authors can edit any of these in-place; the formatsStore
 * keeps a copy of these originals so a "Restore default" button can revert
 * fat-fingered changes on `isSystem: true` formats.
 *
 * Add new system formats here (and they'll appear after a reset). User-added
 * formats live only in the store, never here.
 */
export const SEED_EXAM_FORMATS: ExamFormat[] = [
  {
    id: 'fmt-jee-main',
    name: 'JEE Main',
    description: 'NTA-conducted entrance for engineering. Three subjects × 25 Qs each (20 MCQ + 5 numerical), 3 hours.',
    durationMinutes: 180,
    totalQuestions: 75,
    markingMcq: { correct: 4, wrong: -1 },
    markingNumerical: { correct: 4, wrong: 0 },
    isSystem: true,
  },
  {
    id: 'fmt-jee-advanced',
    name: 'JEE Advanced',
    description: 'IIT-JEE Advanced — multi-paper structure with multi-correct + paragraph + match-list types. Scaffold here; full marking ships in v2.',
    durationMinutes: 180,
    totalQuestions: 54,
    markingMcq: { correct: 3, wrong: -1 },
    markingNumerical: { correct: 4, wrong: 0 },
    isSystem: true,
  },
  {
    id: 'fmt-neet-ug',
    name: 'NEET (UG)',
    description: 'Undergraduate medical entrance. 180 MCQs across Physics + Chemistry + Biology, 3 hours 20 minutes.',
    durationMinutes: 200,
    totalQuestions: 180,
    markingMcq: { correct: 4, wrong: -1 },
    markingNumerical: null, // NEET has no numerical-input questions
    isSystem: true,
  },
  {
    id: 'fmt-gate',
    name: 'GATE',
    description: 'Graduate Aptitude Test in Engineering. 65 Qs over 3 hours; mix of MCQ, MSQ, and NAT (numerical answer type).',
    durationMinutes: 180,
    totalQuestions: 65,
    markingMcq: { correct: 1, wrong: -1 / 3 },
    markingNumerical: { correct: 1, wrong: 0 },
    isSystem: true,
  },
  {
    id: 'fmt-topic-test',
    name: 'Topic Test (default)',
    description: 'Difficulty-weighted scoring for single-topic drilling. Easy correct +3, Medium +4, Hard +5; any wrong −2.',
    durationMinutes: 15,
    totalQuestions: 0, // 0 = flexible
    markingMcq: { correct: 4, wrong: -2 }, // approximate; real scoring is difficulty-weighted in code
    markingNumerical: { correct: 4, wrong: -2 },
    isSystem: true,
  },
  {
    id: 'fmt-custom-quiz',
    name: 'Custom Quiz (default)',
    description: 'Open-ended quiz format. Difficulty-weighted scoring like Topic Test. Use this for ad-hoc author-curated tests.',
    durationMinutes: 10,
    totalQuestions: 0, // 0 = flexible
    markingMcq: { correct: 4, wrong: -2 },
    markingNumerical: { correct: 4, wrong: -2 },
    isSystem: true,
  },
];

/** Quick lookup of a system format by id (used by the "Restore default" feature). */
export function findSystemFormatById(id: string): ExamFormat | undefined {
  return SEED_EXAM_FORMATS.find((f) => f.id === id);
}

/** Default format ID assigned when an Exam is missing one (migration / new exam). */
export const DEFAULT_FORMAT_ID = 'fmt-custom-quiz';

/**
 * Best-effort match for migrating an Exam without a formatId. Falls back to
 * fmt-custom-quiz when no name match is found.
 */
export function inferFormatIdFromExamName(examName: string): string {
  const n = examName.toLowerCase();
  if (n.includes('jee') && n.includes('advanced')) return 'fmt-jee-advanced';
  if (n.includes('jee')) return 'fmt-jee-main';
  if (n.includes('neet')) return 'fmt-neet-ug';
  if (n.includes('gate')) return 'fmt-gate';
  return DEFAULT_FORMAT_ID;
}
