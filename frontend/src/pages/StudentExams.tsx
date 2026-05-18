import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  Hash,
  Compass,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useExams } from '@/store/examsStore';
import { useTracks } from '@/store/hierarchyStore';
import { useFormats } from '@/store/formatsStore';
import { useQuestionsStore } from '@/store/questionsStore';
import type { Exam } from '@/types';
import { cn } from '@/lib/cn';

function fmtSigned(n: number): string {
  if (n > 0) return `+${trimNum(n)}`;
  if (n < 0) return `−${trimNum(Math.abs(n))}`;
  return '0';
}
function trimNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
}

export function StudentExams() {
  const exams = useExams();
  const tracks = useTracks();
  const formats = useFormats();
  const questions = useQuestionsStore((s) => s.questions);

  const [trackFilter, setTrackFilter] = useState<string>('all');

  const formatById = useMemo(() => new Map(formats.map((f) => [f.id, f])), [formats]);
  const trackById = useMemo(() => new Map(tracks.map((t) => [t.id, t])), [tracks]);
  const liveQuestionIds = useMemo(
    () => new Set(questions.filter((q) => !q.archivedAt).map((q) => q.id)),
    [questions]
  );

  const playable = useMemo(() => {
    return exams
      .filter((e) => e.isPublished && !e.archivedAt)
      .map((e) => {
        const liveCount = e.questionIds.filter((id) => liveQuestionIds.has(id)).length;
        return { exam: e, liveCount };
      })
      .filter((x) => x.liveCount > 0)
      .filter((x) => trackFilter === 'all' || x.exam.trackId === trackFilter);
  }, [exams, liveQuestionIds, trackFilter]);

  const visibleTracks = useMemo(
    () =>
      tracks.filter(
        (t) => !t.archivedAt && exams.some((e) => e.trackId === t.id && e.isPublished && !e.archivedAt)
      ),
    [tracks, exams]
  );

  return (
    <div className="container-page py-6 sm:py-8 max-w-5xl space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-amber-600" />
          Exams
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-prose">
          Author-curated test papers. Each one runs on a strict timer with the marking scheme below — you'll see your score the moment you submit.
        </p>
      </div>

      {/* Track filter (only shown if there are exams in more than one track) */}
      {visibleTracks.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wide text-slate-500 inline-flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" />
            Track
          </span>
          <div className="inline-flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setTrackFilter('all')}
              className={cn(
                'px-3 h-8 rounded-md text-xs font-semibold transition-all focus-ring',
                trackFilter === 'all' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              )}
            >
              All
            </button>
            {visibleTracks.map((t) => (
              <button
                key={t.id}
                onClick={() => setTrackFilter(t.id)}
                className={cn(
                  'px-3 h-8 rounded-md text-xs font-semibold transition-all focus-ring',
                  trackFilter === t.id ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {playable.length === 0 ? (
        <Card padding="lg" className="text-center">
          <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-600 font-semibold">No exams available right now.</p>
          <p className="text-xs text-slate-500 mt-1">
            Authors publish exams from the Author Console — check back soon, or build your own paper from <Link to="/custom-test" className="text-brand-700 hover:underline">Custom Test</Link>.
          </p>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {playable.map(({ exam, liveCount }) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              liveCount={liveCount}
              trackName={trackById.get(exam.trackId)?.name ?? 'Track'}
              durationMinutes={resolveDuration(exam, formatById)}
              patternName={
                exam.paperPatternId
                  ? formatById.get(exam.paperPatternId)?.name ?? null
                  : null
              }
              markingSummary={resolveMarkingSummary(exam, formatById)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ExamCard({
  exam,
  liveCount,
  trackName,
  durationMinutes,
  patternName,
  markingSummary,
}: {
  exam: Exam;
  liveCount: number;
  trackName: string;
  durationMinutes: number;
  patternName: string | null;
  markingSummary: string;
}) {
  return (
    <Link
      to={`/quiz/exam/${exam.id}`}
      className="group block rounded-xl border-2 border-slate-200 bg-white p-4 hover:border-amber-400 hover:shadow-md transition-all focus-ring"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 truncate">{exam.name}</h3>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap mt-1">
            <Badge tone="brand">
              <span className="inline-flex items-center gap-1">
                <Compass className="w-3 h-3" />
                {trackName}
              </span>
            </Badge>
            {patternName ? (
              <Badge tone="neutral">{patternName}</Badge>
            ) : (
              <Badge tone="amber">Custom</Badge>
            )}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
      </div>
      {exam.description && (
        <p className="text-xs text-slate-600 line-clamp-2 mb-3">{exam.description}</p>
      )}
      <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
        <span className="inline-flex items-center gap-1">
          <Hash className="w-3 h-3" />
          {liveCount} {liveCount === 1 ? 'question' : 'questions'}
        </span>
        {durationMinutes > 0 && (
          <>
            <span className="text-slate-300">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {durationMinutes} min
            </span>
          </>
        )}
        <span className="text-slate-300">·</span>
        <span className="font-mono text-[10px]">{markingSummary}</span>
      </div>
    </Link>
  );
}

function resolveDuration(
  exam: Exam,
  formatById: Map<string, ReturnType<typeof useFormats>[number]>
): number {
  if (exam.paperPatternId) {
    return formatById.get(exam.paperPatternId)?.durationMinutes ?? 0;
  }
  return exam.customDurationMinutes ?? 0;
}

function resolveMarkingSummary(
  exam: Exam,
  formatById: Map<string, ReturnType<typeof useFormats>[number]>
): string {
  const mcq = exam.paperPatternId
    ? formatById.get(exam.paperPatternId)?.markingMcq
    : exam.customMarkingMcq;
  const num = exam.paperPatternId
    ? formatById.get(exam.paperPatternId)?.markingNumerical
    : exam.customMarkingNumerical;
  if (!mcq) return 'Marking: —';
  let s = `MCQ ${fmtSigned(mcq.correct)}/${fmtSigned(mcq.wrong)}`;
  if (num) s += ` · Num ${fmtSigned(num.correct)}/${fmtSigned(num.wrong)}`;
  return s;
}
