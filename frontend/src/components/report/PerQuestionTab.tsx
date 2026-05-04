import { useState } from 'react';
import { CheckCircle2, XCircle, SkipForward, ArrowUpDown, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge, DifficultyBadge, TypeBadge } from '@/components/ui/Badge';
import { getQuestionById } from '@/data/questions';
import type { Attempt } from '@/types';
import { cn } from '@/lib/cn';

type SortKey = 'index' | 'time' | 'difficulty';

interface PerQuestionTabProps {
  attempt: Attempt;
}

export function PerQuestionTab({ attempt }: PerQuestionTabProps) {
  const [sortKey, setSortKey] = useState<SortKey>('index');
  const [filterStatus, setFilterStatus] = useState<'all' | 'correct' | 'wrong' | 'skipped'>(
    'all'
  );

  const enriched = attempt.answers
    .map((ans, idx) => {
      const q = getQuestionById(ans.questionId);
      return q ? { ans, q, idx: idx + 1 } : null;
    })
    .filter((x): x is { ans: Attempt['answers'][number]; q: ReturnType<typeof getQuestionById> & object; idx: number } => !!x);

  const filtered = enriched.filter((row) => {
    if (filterStatus === 'all') return true;
    const status =
      row.ans.studentAnswer === null ? 'skipped' : row.ans.isCorrect ? 'correct' : 'wrong';
    return status === filterStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'index') return a.idx - b.idx;
    if (sortKey === 'time') return b.ans.timeSpentSeconds - a.ans.timeSpentSeconds;
    // difficulty: Easy < Medium < Hard
    const order = { Easy: 0, Medium: 1, Hard: 2 } as const;
    return order[a.q.difficulty] - order[b.q.difficulty];
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Per-question breakdown</CardTitle>
          <CardDescription>
            Every question with its tags and time. Sort to spot patterns.
          </CardDescription>
        </CardHeader>

        {/* Filter + sort row */}
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1">
            {(['all', 'correct', 'wrong', 'skipped'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setFilterStatus(opt)}
                className={cn(
                  'px-3 h-8 rounded-md text-xs font-semibold capitalize transition-colors focus-ring',
                  filterStatus === opt
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                {opt} {opt !== 'all' && `(${countByStatus(enriched, opt)})`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Sort by:</span>
            {(['index', 'time', 'difficulty'] as const).map((opt) => (
              <button
                key={opt}
                onClick={() => setSortKey(opt)}
                className={cn(
                  'px-2.5 h-8 rounded-md text-xs font-medium capitalize transition-colors focus-ring inline-flex items-center gap-1',
                  sortKey === opt
                    ? 'bg-brand-50 text-brand-700'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                {opt === 'index' ? 'Order' : opt}
                {sortKey === opt && <ArrowUpDown className="w-3 h-3" />}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Card padding="none">
        {sorted.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            No questions match this filter.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sorted.map(({ ans, q, idx }) => {
              const status =
                ans.studentAnswer === null
                  ? 'skipped'
                  : ans.isCorrect
                  ? 'correct'
                  : 'wrong';
              return (
                <li key={ans.questionId} className="px-4 py-3 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* Status icon + Q# */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-1">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-md flex items-center justify-center',
                          status === 'correct' && 'bg-emerald-100 text-emerald-700',
                          status === 'wrong' && 'bg-red-100 text-red-700',
                          status === 'skipped' && 'bg-amber-100 text-amber-700'
                        )}
                      >
                        {status === 'correct' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : status === 'wrong' ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <SkipForward className="w-4 h-4" />
                        )}
                      </div>
                      <span className="text-[10px] font-mono font-semibold text-slate-500">
                        Q{idx}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1.5">
                        <DifficultyBadge difficulty={q.difficulty} />
                        <TypeBadge type={q.type} />
                        <Badge tone="neutral">{q.format === 'mcq' ? 'MCQ' : 'Numerical'}</Badge>
                        {ans.skipReason && <Badge tone="amber">{ans.skipReason}</Badge>}
                        <span className="text-xs text-slate-500 ml-auto inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {ans.timeSpentSeconds}s
                        </span>
                      </div>
                      <div className="text-sm text-slate-800 line-clamp-2">{q.stem}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

function countByStatus(
  rows: Array<{ ans: Attempt['answers'][number] }>,
  status: 'correct' | 'wrong' | 'skipped'
): number {
  return rows.filter((r) => {
    const s = r.ans.studentAnswer === null ? 'skipped' : r.ans.isCorrect ? 'correct' : 'wrong';
    return s === status;
  }).length;
}
