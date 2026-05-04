import {
  CheckCircle2,
  XCircle,
  SkipForward,
  Clock,
  Trophy,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getQuestionById } from '@/data/questions';
import type { Attempt, Difficulty, QuestionType } from '@/types';
import { cn } from '@/lib/cn';

interface SummaryTabProps {
  attempt: Attempt;
  previousMastery: number | null;
}

function formatDuration(s: number): string {
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}m ${ss.toString().padStart(2, '0')}s`;
}

export function SummaryTab({ attempt, previousMastery }: SummaryTabProps) {
  const accuracy = Math.round((attempt.correct / Math.max(1, attempt.attempted)) * 100);
  const masteryDelta =
    previousMastery !== null ? attempt.attemptScore0to100 - previousMastery : null;

  // Per-difficulty breakdown
  const byDifficulty = (['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => {
    const answers = attempt.answers.filter((a) => {
      const q = getQuestionById(a.questionId);
      return q?.difficulty === d;
    });
    const correct = answers.filter((a) => a.isCorrect === true).length;
    return { difficulty: d, total: answers.length, correct };
  });

  // Per-type breakdown
  const byType = (['Recall', 'Conceptual', 'Analytical', 'Application'] as QuestionType[]).map(
    (t) => {
      const answers = attempt.answers.filter((a) => {
        const q = getQuestionById(a.questionId);
        return q?.type === t;
      });
      const correct = answers.filter((a) => a.isCorrect === true).length;
      return { type: t, total: answers.length, correct };
    }
  );

  return (
    <div className="space-y-5">
      {/* Diagnostic-first hero (Neha buyer fix — insight before score) */}
      <Card padding="lg" className="bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0">
        <div className="flex items-center gap-2 text-brand-100 text-xs font-semibold uppercase tracking-wide mb-2">
          <Trophy className="w-4 h-4" />
          {attempt.mode === 'test' ? 'Test complete' : 'Practice complete'}
          {attempt.formatTemplate && ` · ${attempt.formatTemplate} format`}
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold">{attempt.topicName}</h2>
        <p className="text-brand-100 text-sm mt-1">
          {attempt.chapterName} ·{' '}
          {new Date(attempt.completedAt).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </p>

        <div className="mt-5 grid sm:grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-xs text-brand-100 font-semibold uppercase tracking-wide">
              What this tells us
            </div>
            <div className="text-sm mt-1.5 leading-relaxed">{generateInsight(attempt, byType)}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="text-xs text-brand-100 font-semibold uppercase tracking-wide">
              Mastery score
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              {previousMastery !== null && (
                <>
                  <span className="text-sm text-brand-200 line-through">{previousMastery}</span>
                  <span className="text-brand-200">→</span>
                </>
              )}
              <span className="text-3xl font-extrabold tabular-nums">
                {attempt.attemptScore0to100}
              </span>
              <span className="text-sm text-brand-200">/100</span>
              {masteryDelta !== null && masteryDelta !== 0 && (
                <span
                  className={cn(
                    'text-xs font-semibold ml-1 px-1.5 py-0.5 rounded',
                    masteryDelta > 0
                      ? 'bg-emerald-300/20 text-emerald-100'
                      : 'bg-red-300/20 text-red-100'
                  )}
                >
                  {masteryDelta > 0 ? '↑' : '↓'} {Math.abs(masteryDelta)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Correct" value={attempt.correct} tone="success" />
        <StatCard icon={<XCircle className="w-4 h-4" />} label="Wrong" value={attempt.wrong} tone="danger" />
        <StatCard icon={<SkipForward className="w-4 h-4" />} label="Skipped" value={attempt.skipped} tone="warning" />
        <StatCard icon={<Clock className="w-4 h-4" />} label="Total time" value={formatDuration(attempt.totalTimeSeconds)} tone="neutral" />
      </div>

      {/* Score per format */}
      <Card>
        <CardHeader>
          <CardTitle>Score breakdown</CardTitle>
          <CardDescription>
            Marks earned per the {attempt.formatTemplate ?? 'difficulty-weighted'} scheme · accuracy {accuracy}%
          </CardDescription>
        </CardHeader>
        <div className="grid sm:grid-cols-3 gap-4">
          <ScoreBlock label="Marks earned" value={`${attempt.scoreRaw}`} subtext={`/ ${attempt.scoreMax} possible`} />
          <ScoreBlock label="Accuracy" value={`${accuracy}%`} subtext={`${attempt.correct}/${attempt.attempted} correct`} />
          <ScoreBlock label="Avg time / Q" value={`${Math.round(attempt.totalTimeSeconds / Math.max(1, attempt.totalQuestions))}s`} subtext="across all questions" />
        </div>
      </Card>

      {/* By difficulty */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by difficulty</CardTitle>
          <CardDescription>
            Pattern check: are wrongs clustering in one difficulty?
          </CardDescription>
        </CardHeader>
        <div className="space-y-3">
          {byDifficulty.map((row) => (
            <PerfRow
              key={row.difficulty}
              label={row.difficulty}
              correct={row.correct}
              total={row.total}
              tone={row.difficulty === 'Easy' ? 'success' : row.difficulty === 'Medium' ? 'warning' : 'danger'}
            />
          ))}
        </div>
      </Card>

      {/* By type */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by cognitive type</CardTitle>
          <CardDescription>
            Recall = memory · Conceptual = understanding · Analytical = reasoning · Application = real-world framing
          </CardDescription>
        </CardHeader>
        <div className="space-y-3">
          {byType.map((row) => (
            <PerfRow key={row.type} label={row.type} correct={row.correct} total={row.total} tone="brand" />
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone: 'success' | 'danger' | 'warning' | 'neutral';
}) {
  const toneClasses = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    neutral: 'bg-slate-50 text-slate-700 border-slate-200',
  };
  return (
    <Card className={toneClasses[tone]}>
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide opacity-90">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold tabular-nums mt-1">{value}</div>
    </Card>
  );
}

function ScoreBlock({ label, value, subtext }: { label: string; value: string; subtext: string }) {
  return (
    <div>
      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-bold tabular-nums text-slate-900 mt-1">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{subtext}</div>
    </div>
  );
}

function PerfRow({
  label,
  correct,
  total,
  tone,
}: {
  label: string;
  correct: number;
  total: number;
  tone: 'success' | 'warning' | 'danger' | 'brand';
}) {
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  const barColor = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    brand: 'bg-brand-500',
  }[tone];
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="font-medium text-slate-800">{label}</span>
        <span className="text-slate-500 tabular-nums text-xs">
          {total === 0 ? 'no Qs' : `${correct} / ${total} (${pct}%)`}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function generateInsight(
  attempt: Attempt,
  byType: Array<{ type: QuestionType; total: number; correct: number }>
): string {
  const accuracy = Math.round((attempt.correct / Math.max(1, attempt.attempted)) * 100);

  // Find weakest type with at least 2 questions
  const sortedByType = [...byType]
    .filter((t) => t.total >= 2)
    .map((t) => ({ ...t, pct: t.correct / t.total }))
    .sort((a, b) => a.pct - b.pct);

  const weakestType = sortedByType[0];

  if (accuracy >= 85) {
    return `Strong run on ${attempt.topicName}. Engine will skew harder next attempt.`;
  }
  if (weakestType && weakestType.pct < 0.4 && weakestType.total >= 2) {
    return `Most wrongs cluster in ${weakestType.type} questions (${weakestType.correct}/${weakestType.total}). Check the Wrong Answered tab — patterns are clear.`;
  }
  if (accuracy >= 60) {
    return `Solid effort. Review the wrongs below — patterns reveal where to drill next.`;
  }
  if (accuracy >= 40) {
    return `Mixed results. Most misses are likely Conceptual — revise theory before next drill.`;
  }
  return `Tough one. Mastery dropped — engine will skew easier next time to rebuild fundamentals.`;
}
