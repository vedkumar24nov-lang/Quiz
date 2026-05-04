import type { MasteryEntry, Difficulty } from '@/types';
import { getAllTopics, getChapterByTopic } from './subjects';

// Dummy mastery scores — represents Vedant's state after ~2 weeks of use.
// Mix of strong, mid, low, weak, and never-attempted topics so the heatmap shows variety.

const RAW_SCORES: Record<string, { score: number; attempts: number; daysAgo: number }> = {
  'tp-dimensional-analysis': { score: 84, attempts: 4, daysAgo: 3 },
  'tp-significant-figures': { score: 72, attempts: 2, daysAgo: 5 },
  'tp-error-analysis': { score: 65, attempts: 3, daysAgo: 8 },

  'tp-motion-1d': { score: 78, attempts: 5, daysAgo: 2 },
  'tp-motion-2d': { score: 58, attempts: 3, daysAgo: 6 },
  'tp-relative-velocity': { score: 45, attempts: 2, daysAgo: 12 },

  'tp-newtons-laws': { score: 81, attempts: 4, daysAgo: 1 },
  'tp-friction': { score: 67, attempts: 3, daysAgo: 4 },
  'tp-circular-motion': { score: 52, attempts: 2, daysAgo: 9 },

  'tp-moment-of-inertia': { score: 64, attempts: 3, daysAgo: 1 },
  'tp-torque': { score: 71, attempts: 2, daysAgo: 4 },
  'tp-angular-momentum': { score: 38, attempts: 1, daysAgo: 14 },

  'tp-laws-thermo': { score: 55, attempts: 2, daysAgo: 7 },
  'tp-carnot-cycle': { score: 32, attempts: 2, daysAgo: 11 },
  // tp-kinetic-theory: never attempted

  'tp-coulombs-law': { score: 88, attempts: 5, daysAgo: 2 },
  'tp-electric-field': { score: 76, attempts: 3, daysAgo: 5 },
  'tp-capacitors': { score: 42, attempts: 2, daysAgo: 10 },

  'tp-ohms-law': { score: 69, attempts: 3, daysAgo: 6 },
  // tp-circuits: never attempted

  'tp-magnetic-field': { score: 35, attempts: 2, daysAgo: 13 },
  // tp-electromagnetic-induction: never attempted

  'tp-ray-optics': { score: 73, attempts: 3, daysAgo: 4 },
  'tp-wave-optics': { score: 28, attempts: 1, daysAgo: 16 },

  'tp-photoelectric': { score: 91, attempts: 4, daysAgo: 3 },
  // tp-atoms-nuclei: never attempted

  // ─── Chemistry ───
  'tp-mole-concept': { score: 86, attempts: 4, daysAgo: 2 },
  'tp-stoichiometry': { score: 74, attempts: 3, daysAgo: 5 },

  'tp-bohr-model': { score: 68, attempts: 3, daysAgo: 4 },
  'tp-quantum-numbers': { score: 41, attempts: 2, daysAgo: 9 },
  // tp-electronic-config: never attempted

  'tp-covalent-vsepr': { score: 79, attempts: 3, daysAgo: 3 },
  'tp-hybridization': { score: 58, attempts: 2, daysAgo: 7 },

  'tp-first-law-enthalpy': { score: 62, attempts: 2, daysAgo: 6 },
  'tp-entropy-gibbs': { score: 34, attempts: 1, daysAgo: 12 },

  'tp-le-chatelier': { score: 71, attempts: 3, daysAgo: 4 },
  'tp-acid-base-ph': { score: 89, attempts: 5, daysAgo: 2 },
  // tp-solubility-product: never attempted

  'tp-alkanes': { score: 55, attempts: 2, daysAgo: 8 },
  'tp-alkenes-alkynes': { score: 48, attempts: 2, daysAgo: 10 },
  'tp-aromatic-compounds': { score: 30, attempts: 1, daysAgo: 14 },

  'tp-colligative-properties': { score: 65, attempts: 2, daysAgo: 6 },
  // tp-raoults-law: never attempted

  'tp-galvanic-cells': { score: 73, attempts: 3, daysAgo: 5 },
  'tp-nernst-equation': { score: 38, attempts: 1, daysAgo: 13 },

  'tp-rate-laws': { score: 66, attempts: 2, daysAgo: 7 },
  // tp-arrhenius: never attempted

  'tp-werner-theory': { score: 80, attempts: 3, daysAgo: 4 },
  'tp-crystal-field': { score: 25, attempts: 1, daysAgo: 16 },
  // tp-isomerism-complexes: never attempted

  // ─── Mathematics ───
  'tp-domain-range': { score: 82, attempts: 4, daysAgo: 2 },
  'tp-composition-functions': { score: 70, attempts: 3, daysAgo: 5 },
  'tp-inverse-functions': { score: 58, attempts: 2, daysAgo: 8 },

  'tp-trig-identities': { score: 75, attempts: 4, daysAgo: 3 },
  'tp-trig-equations': { score: 49, attempts: 2, daysAgo: 9 },

  'tp-argand-plane': { score: 67, attempts: 3, daysAgo: 6 },
  'tp-quadratic-roots': { score: 84, attempts: 4, daysAgo: 2 },

  'tp-ap-gp': { score: 78, attempts: 3, daysAgo: 4 },
  // tp-special-series: never attempted

  'tp-permutations-combinations': { score: 53, attempts: 2, daysAgo: 7 },
  'tp-binomial-expansion': { score: 36, attempts: 2, daysAgo: 11 },

  'tp-parabola': { score: 71, attempts: 3, daysAgo: 5 },
  'tp-ellipse': { score: 44, attempts: 2, daysAgo: 10 },
  // tp-hyperbola: never attempted

  'tp-matrix-operations': { score: 88, attempts: 5, daysAgo: 2 },
  'tp-determinants-cofactors': { score: 72, attempts: 3, daysAgo: 4 },
  // tp-system-linear-equations: never attempted

  'tp-limits': { score: 81, attempts: 4, daysAgo: 3 },
  'tp-continuity': { score: 64, attempts: 3, daysAgo: 5 },
  'tp-tangents-normals': { score: 27, attempts: 1, daysAgo: 15 },

  'tp-indefinite-integrals': { score: 76, attempts: 4, daysAgo: 3 },
  'tp-definite-integrals': { score: 60, attempts: 2, daysAgo: 6 },
  // tp-area-under-curves: never attempted

  'tp-vector-algebra': { score: 69, attempts: 3, daysAgo: 5 },
  'tp-lines-planes-3d': { score: 32, attempts: 1, daysAgo: 13 },
};

export const MASTERY: MasteryEntry[] = getAllTopics().map((topic) => {
  const raw = RAW_SCORES[topic.id];
  const chapter = getChapterByTopic(topic.id);
  const lastDate = raw
    ? new Date(Date.now() - raw.daysAgo * 24 * 60 * 60 * 1000).toISOString()
    : null;
  return {
    topicId: topic.id,
    topicName: topic.name,
    chapterId: chapter?.id ?? '',
    chapterName: chapter?.name ?? '',
    score: raw?.score ?? 0,
    attemptsCount: raw?.attempts ?? 0,
    lastAttemptedAt: lastDate,
  };
});

export function getMasteryByTopic(topicId: string): MasteryEntry | undefined {
  return MASTERY.find((m) => m.topicId === topicId);
}

export function getWeakestTopics(limit = 5): MasteryEntry[] {
  return [...MASTERY]
    .filter((m) => m.attemptsCount > 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
}

export function getStrongestTopics(limit = 3): MasteryEntry[] {
  return [...MASTERY]
    .filter((m) => m.attemptsCount > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Deterministic per-difficulty-band mastery derivation.
// In v1 (S4) this comes from real per-band aggregates from the engine.
// For the prototype: Easy slightly higher, Hard slightly lower than topic mastery.
// Hash on topicId so values are stable across renders.
function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

export function getBandMasteryByTopic(
  topicId: string,
  difficulty: Difficulty
): number | null {
  const m = getMasteryByTopic(topicId);
  if (!m || m.attemptsCount === 0) return null;

  const seed = hashCode(topicId + difficulty);
  const noise = (seed % 11) - 5; // ±5
  const bias = difficulty === 'Easy' ? +9 : difficulty === 'Hard' ? -12 : 0;
  return clamp(Math.round(m.score + bias + noise), 0, 100);
}
