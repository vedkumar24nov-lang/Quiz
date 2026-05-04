import { useState, useMemo } from 'react';
import { SkipForward, Brain, BookX, AlertCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge, DifficultyBadge, TypeBadge } from '@/components/ui/Badge';
import { getQuestionById } from '@/data/questions';
import type { Attempt, SkipReason } from '@/types';
import { cn } from '@/lib/cn';

interface SkippedQuestionsTabProps {
  attempt: Attempt;
}

const TAGGABLE_REASONS: Array<{ reason: SkipReason; icon: React.ReactNode; tone: string }> = [
  {
    reason: 'Forgot the formula',
    icon: <BookX className="w-4 h-4" />,
    tone: 'border-amber-300 bg-amber-50 text-amber-900',
  },
  {
    reason: 'Conceptual gap',
    icon: <Brain className="w-4 h-4" />,
    tone: 'border-red-300 bg-red-50 text-red-900',
  },
  {
    reason: 'Misread the question',
    icon: <AlertCircle className="w-4 h-4" />,
    tone: 'border-blue-300 bg-blue-50 text-blue-900',
  },
  {
    reason: 'Will come back to it',
    icon: <Clock className="w-4 h-4" />,
    tone: 'border-slate-300 bg-slate-50 text-slate-900',
  },
];

export function SkippedQuestionsTab({ attempt }: SkippedQuestionsTabProps) {
  // For Test mode, allow tagging untagged skips post-submission.
  // (Practice mode skips are pre-tagged in-quiz; this tab still shows them but read-only.)
  const isTestMode = attempt.mode === 'test';

  // Local state for tags (in S3 these would persist back to server)
  const initialTags = useMemo<Record<string, SkipReason | undefined>>(() => {
    const tags: Record<string, SkipReason | undefined> = {};
    for (const a of attempt.answers) {
      if (a.studentAnswer === null) tags[a.questionId] = a.skipReason;
    }
    return tags;
  }, [attempt]);
  const [tagState, setTagState] = useState<Record<string, SkipReason | undefined>>(initialTags);

  const skipped = attempt.answers
    .map((ans) => {
      const q = getQuestionById(ans.questionId);
      return q && ans.studentAnswer === null ? { ans, q } : null;
    })
    .filter((x): x is { ans: Attempt['answers'][number]; q: NonNullable<ReturnType<typeof getQuestionById>> } => !!x);

  if (skipped.length === 0) {
    return (
      <Card padding="lg" className="text-center">
        <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-3">
          <SkipForward className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No skipped questions</h3>
        <p className="text-sm text-slate-600 mt-1">
          You attempted every question in this session.
        </p>
      </Card>
    );
  }

  const taggedCount = Object.values(tagState).filter((t) => t !== undefined).length;
  const untaggedCount = skipped.length - taggedCount;

  function handleTag(questionId: string, reason: SkipReason) {
    setTagState((prev) => ({ ...prev, [questionId]: reason }));
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <SkipForward className="w-5 h-5 text-amber-600" />
              Skipped Questions ({skipped.length})
            </span>
          </CardTitle>
          <CardDescription>
            {isTestMode
              ? 'Tag each one to enrich your heatmap. Patterns reveal whether skips are theory gaps or time pressure.'
              : 'Skip reasons were captured in-quiz. The pattern reveals where to focus revision.'}
          </CardDescription>
        </CardHeader>

        {/* Soft nudge — buyer fix ST-9: non-naggy copy */}
        {isTestMode && untaggedCount > 0 && (
          <div className="bg-brand-50 border border-brand-200 rounded-lg p-3 text-sm text-brand-900">
            <span className="font-semibold">{taggedCount} of {skipped.length} tagged.</span>{' '}
            <span className="text-brand-800">
              More tags = sharper heatmap. No pressure — even 0 is fine.
            </span>
          </div>
        )}
      </Card>

      <div className="space-y-3">
        {skipped.map((row, idx) => {
          const currentTag = tagState[row.ans.questionId];
          return (
            <Card key={row.ans.questionId} padding="md">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center font-mono text-sm font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <DifficultyBadge difficulty={row.q.difficulty} />
                    <TypeBadge type={row.q.type} />
                    {currentTag && <Badge tone="amber">{currentTag}</Badge>}
                  </div>
                  <p className="text-sm text-slate-800 line-clamp-2 mb-3">{row.q.stem}</p>

                  {isTestMode && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1.5">
                        {currentTag ? 'Change tag:' : 'Tag this skip:'}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {TAGGABLE_REASONS.map((r) => {
                          const isActive = currentTag === r.reason;
                          return (
                            <button
                              key={r.reason}
                              onClick={() => handleTag(row.ans.questionId, r.reason)}
                              className={cn(
                                'inline-flex items-center gap-1.5 px-2.5 h-7 text-xs font-medium rounded-md border-2 transition-all focus-ring',
                                isActive
                                  ? r.tone + ' ring-2 ring-offset-1 ring-slate-400'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                              )}
                            >
                              {r.icon}
                              {r.reason}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
