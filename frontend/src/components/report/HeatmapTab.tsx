import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getQuestionById } from '@/data/questions';
import type { Attempt, Difficulty, QuestionType } from '@/types';
import { cn } from '@/lib/cn';

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const TYPES: QuestionType[] = ['Recall', 'Conceptual', 'Analytical', 'Application'];

interface HeatmapTabProps {
  attempt: Attempt;
}

export function HeatmapTab({ attempt }: HeatmapTabProps) {
  // Build difficulty × type matrix from this attempt
  const matrix: Record<Difficulty, Record<QuestionType, { correct: number; total: number }>> =
    Object.fromEntries(
      DIFFICULTIES.map((d) => [
        d,
        Object.fromEntries(TYPES.map((t) => [t, { correct: 0, total: 0 }])),
      ])
    ) as never;

  for (const ans of attempt.answers) {
    const q = getQuestionById(ans.questionId);
    if (!q) continue;
    matrix[q.difficulty][q.type].total += 1;
    if (ans.isCorrect) matrix[q.difficulty][q.type].correct += 1;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>This attempt's heatmap</CardTitle>
          <CardDescription>
            Difficulty × cognitive type. Empty cells mean no questions of that combination.
          </CardDescription>
        </CardHeader>

        <div className="overflow-x-auto scrollbar-thin">
          <div className="min-w-[480px]">
            {/* Header row */}
            <div className="grid grid-cols-[100px_repeat(4,1fr)] gap-1 mb-1">
              <div></div>
              {TYPES.map((t) => (
                <div
                  key={t}
                  className="text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wide text-center pb-2"
                >
                  {t}
                </div>
              ))}
            </div>
            {/* Body rows */}
            {DIFFICULTIES.map((d) => (
              <div key={d} className="grid grid-cols-[100px_repeat(4,1fr)] gap-1 mb-1">
                <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide self-center">
                  {d}
                </div>
                {TYPES.map((t) => {
                  const cell = matrix[d][t];
                  const pct = cell.total === 0 ? null : Math.round((cell.correct / cell.total) * 100);
                  const tone =
                    pct === null
                      ? 'empty'
                      : pct >= 80
                      ? 'strong'
                      : pct >= 60
                      ? 'mid'
                      : pct >= 40
                      ? 'low'
                      : 'weak';
                  return (
                    <div
                      key={t}
                      title={
                        cell.total === 0
                          ? `${d} ${t}: no questions`
                          : `${d} ${t}: ${cell.correct}/${cell.total} (${pct}%)`
                      }
                      className={cn(
                        'h-12 sm:h-14 rounded-md flex flex-col items-center justify-center transition-all',
                        tone === 'empty' && 'bg-slate-100 text-slate-400',
                        tone === 'weak' && 'bg-mastery-weak text-white',
                        tone === 'low' && 'bg-mastery-low text-white',
                        tone === 'mid' && 'bg-mastery-mid text-slate-900',
                        tone === 'strong' && 'bg-mastery-strong text-white'
                      )}
                    >
                      {cell.total === 0 ? (
                        <span className="text-xs">—</span>
                      ) : (
                        <>
                          <span className="text-sm font-bold tabular-nums">{pct}%</span>
                          <span className="text-[10px] opacity-75">
                            {cell.correct}/{cell.total}
                          </span>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Diagnostic insight */}
        <div className="mt-5 pt-5 border-t border-slate-100">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
            Patterns to notice
          </div>
          <ul className="text-sm text-slate-700 space-y-1.5 list-disc list-inside">
            {generatePatterns(matrix).map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      </Card>

      {/* CTA to topic-wide heatmap */}
      <Card className="bg-brand-50 border-brand-200">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm text-brand-900">
            <Badge tone="brand">Tip</Badge>{' '}
            <span className="ml-1">
              See how this attempt fits into your full Physics mastery picture.
            </span>
          </div>
          <Link
            to="/heatmap"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1"
          >
            Open full heatmap
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </Card>
    </div>
  );
}

function generatePatterns(
  matrix: Record<Difficulty, Record<QuestionType, { correct: number; total: number }>>
): string[] {
  const patterns: string[] = [];

  // Find weakest cell (lowest pct with at least 2 questions)
  let weakest: { d: Difficulty; t: QuestionType; pct: number } | null = null;
  let strongest: { d: Difficulty; t: QuestionType; pct: number } | null = null;
  for (const d of DIFFICULTIES) {
    for (const t of TYPES) {
      const cell = matrix[d][t];
      if (cell.total < 2) continue;
      const pct = (cell.correct / cell.total) * 100;
      if (!weakest || pct < weakest.pct) weakest = { d, t, pct };
      if (!strongest || pct > strongest.pct) strongest = { d, t, pct };
    }
  }

  if (weakest && weakest.pct < 50) {
    patterns.push(
      `Weakest combo: ${weakest.d} + ${weakest.t} at ${Math.round(weakest.pct)}%. Targeted drill on this combination would lift mastery fastest.`
    );
  }
  if (strongest && strongest.pct >= 80) {
    patterns.push(
      `Strongest combo: ${strongest.d} + ${strongest.t} at ${Math.round(strongest.pct)}%. This is solid — engine will skew this combination harder next time.`
    );
  }

  // Hard total
  const hardTotal = TYPES.reduce((s, t) => s + matrix.Hard[t].total, 0);
  const hardCorrect = TYPES.reduce((s, t) => s + matrix.Hard[t].correct, 0);
  if (hardTotal >= 2) {
    const hardPct = Math.round((hardCorrect / hardTotal) * 100);
    if (hardPct < 30) {
      patterns.push(
        `Hard questions overall: ${hardCorrect}/${hardTotal} (${hardPct}%). Practice fundamentals before attempting Hard-band drills.`
      );
    }
  }

  if (patterns.length === 0) {
    patterns.push('Distribution looks balanced. Keep drilling — patterns become clearer over more attempts.');
  }

  return patterns;
}
