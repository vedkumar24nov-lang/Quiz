import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  SkipForward,
  PlayCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, DifficultyBadge, TypeBadge } from '@/components/ui/Badge';
import { getQuestionById } from '@/data/questions';
import type { Attempt } from '@/types';
import { cn } from '@/lib/cn';

interface ReplayTabProps {
  attempt: Attempt;
}

/**
 * Linear walkthrough Q1→Qn with student answer + correct + solution side-by-side.
 * Per buyer fix ST-4 (Aditya): "After a 3-hour mock, I've forgotten my reasoning.
 * I want to walk Q1→Q75 and see solutions in order, not jump around tabs."
 */
export function ReplayTab({ attempt }: ReplayTabProps) {
  const [index, setIndex] = useState(0);

  const enriched = attempt.answers
    .map((ans) => {
      const q = getQuestionById(ans.questionId);
      return q ? { ans, q } : null;
    })
    .filter((x): x is { ans: Attempt['answers'][number]; q: NonNullable<ReturnType<typeof getQuestionById>> } => !!x);

  if (enriched.length === 0) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-sm text-slate-600">No questions to replay.</p>
      </Card>
    );
  }

  const current = enriched[index];
  const total = enriched.length;
  const status =
    current.ans.studentAnswer === null
      ? 'skipped'
      : current.ans.isCorrect
      ? 'correct'
      : 'wrong';

  const studentText =
    current.q.format === 'mcq' && current.q.options && current.ans.studentAnswer !== null
      ? `${String.fromCharCode(65 + Number(current.ans.studentAnswer))}. ${current.q.options[Number(current.ans.studentAnswer)]}`
      : current.ans.studentAnswer === null
      ? '(skipped)'
      : String(current.ans.studentAnswer);

  const correctText =
    current.q.format === 'mcq' && current.q.options
      ? `${String.fromCharCode(65 + Number(current.q.correctAnswer))}. ${current.q.options[Number(current.q.correctAnswer)]}`
      : String(current.q.correctAnswer);

  return (
    <div className="space-y-4">
      {/* Header card */}
      <Card>
        <div className="flex items-center justify-between gap-3 mb-3">
          <div>
            <CardTitle>
              <span className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-brand-600" />
                Replay walkthrough
              </span>
            </CardTitle>
            <CardDescription>
              Walk through every question Q1→Q{total} with your answer, the correct answer, and solution.
            </CardDescription>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin pb-1">
          {enriched.map((row, i) => {
            const s =
              row.ans.studentAnswer === null
                ? 'skipped'
                : row.ans.isCorrect
                ? 'correct'
                : 'wrong';
            const isCurrent = i === index;
            return (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={cn(
                  'flex-shrink-0 w-7 h-7 rounded text-xs font-bold transition-all focus-ring',
                  isCurrent && 'ring-2 ring-brand-500 ring-offset-1',
                  s === 'correct' && 'bg-emerald-500 text-white',
                  s === 'wrong' && 'bg-red-500 text-white',
                  s === 'skipped' && 'bg-amber-400 text-white'
                )}
                aria-label={`Question ${i + 1}, ${s}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Current question */}
      <Card padding="lg">
        <div className="flex items-center gap-2 flex-wrap mb-3">
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold',
              status === 'correct' && 'bg-emerald-100 text-emerald-800',
              status === 'wrong' && 'bg-red-100 text-red-800',
              status === 'skipped' && 'bg-amber-100 text-amber-800'
            )}
          >
            {status === 'correct' && <CheckCircle2 className="w-3.5 h-3.5" />}
            {status === 'wrong' && <XCircle className="w-3.5 h-3.5" />}
            {status === 'skipped' && <SkipForward className="w-3.5 h-3.5" />}
            <span className="capitalize">{status}</span>
          </div>
          <DifficultyBadge difficulty={current.q.difficulty} />
          <TypeBadge type={current.q.type} />
          <Badge tone="neutral">{current.q.format === 'mcq' ? 'MCQ' : 'Numerical'}</Badge>
          {current.ans.skipReason && <Badge tone="amber">{current.ans.skipReason}</Badge>}
          <span className="text-xs text-slate-500 ml-auto">
            Q {index + 1} / {total} · {current.ans.timeSpentSeconds}s
          </span>
        </div>

        <p className="text-base sm:text-lg text-slate-900 leading-relaxed mb-5 whitespace-pre-wrap">
          {current.q.stem}
        </p>

        {/* Answer comparison */}
        <div className="grid sm:grid-cols-2 gap-2 mb-5">
          <div
            className={cn(
              'rounded-lg border-2 p-3',
              status === 'correct'
                ? 'border-emerald-200 bg-emerald-50'
                : status === 'wrong'
                ? 'border-red-200 bg-red-50'
                : 'border-amber-200 bg-amber-50'
            )}
          >
            <div
              className={cn(
                'text-xs font-semibold uppercase tracking-wide mb-1',
                status === 'correct'
                  ? 'text-emerald-700'
                  : status === 'wrong'
                  ? 'text-red-700'
                  : 'text-amber-700'
              )}
            >
              Your answer
            </div>
            <div
              className={cn(
                'text-sm font-medium',
                status === 'correct'
                  ? 'text-emerald-900'
                  : status === 'wrong'
                  ? 'text-red-900'
                  : 'text-amber-900 italic'
              )}
            >
              {studentText}
            </div>
          </div>
          <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-3">
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">
              Correct answer
            </div>
            <div className="text-sm font-medium text-emerald-900">{correctText}</div>
          </div>
        </div>

        {/* Solution — always visible in replay (different from in-quiz) */}
        <div className="p-4 bg-brand-50 border border-brand-200 rounded-lg">
          <div className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-2">
            Worked solution
          </div>
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
            {current.q.solution}
          </p>
        </div>
      </Card>

      {/* Linear nav */}
      <div className="sticky bottom-20 md:bottom-6 z-10">
        <Card className="shadow-xl">
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              onClick={() => setIndex(Math.max(0, index - 1))}
              disabled={index === 0}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>
            <div className="text-sm font-semibold text-slate-700 tabular-nums">
              {index + 1} / {total}
            </div>
            <Button
              onClick={() => setIndex(Math.min(total - 1, index + 1))}
              disabled={index === total - 1}
              rightIcon={<ChevronRight className="w-4 h-4" />}
            >
              Next
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
