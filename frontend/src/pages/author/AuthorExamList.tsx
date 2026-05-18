import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileSignature,
  Plus,
  Pencil,
  Archive,
  RotateCcw,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
  Clock,
  Hash,
  AlertTriangle,
  Compass,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useAuthUser } from '@/store/authStore';
import { useExams, useExamsStore } from '@/store/examsStore';
import { useTracks } from '@/store/hierarchyStore';
import { useFormats } from '@/store/formatsStore';
import { useQuestionsStore } from '@/store/questionsStore';
import type { Exam } from '@/types';
import { cn } from '@/lib/cn';

export function AuthorExamList() {
  const navigate = useNavigate();
  const exams = useExams();
  const tracks = useTracks();
  const formats = useFormats();
  const questions = useQuestionsStore((s) => s.questions);
  const archiveExam = useExamsStore((s) => s.archiveExam);
  const restoreExam = useExamsStore((s) => s.restoreExam);
  const updateExam = useExamsStore((s) => s.updateExam);
  const user = useAuthUser();

  const [showArchived, setShowArchived] = useState(false);
  const [archiveConfirm, setArchiveConfirm] = useState<Exam | null>(null);

  const trackById = useMemo(() => new Map(tracks.map((t) => [t.id, t])), [tracks]);
  const formatById = useMemo(() => new Map(formats.map((f) => [f.id, f])), [formats]);
  const liveQuestionIds = useMemo(
    () => new Set(questions.filter((q) => !q.archivedAt).map((q) => q.id)),
    [questions]
  );

  const visible = useMemo(
    () => exams.filter((e) => showArchived || !e.archivedAt),
    [exams, showArchived]
  );

  const canPublish = user?.role === 'admin';

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileSignature className="w-5 h-5 text-amber-600" />
            Exams
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-prose">
            Curated test papers. Each exam belongs to a Track, follows a Paper Pattern (or is custom), and has a hand-picked question list. Published exams appear in the student-side <strong>Exams</strong> section.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchived((v) => !v)}
            className={cn(
              'inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-xs font-semibold border focus-ring',
              showArchived
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            )}
          >
            {showArchived ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {showArchived ? 'Showing archived' : 'Hide archived'}
          </button>
          <Button
            onClick={() => navigate('/author/exam/new')}
            leftIcon={<Plus className="w-4 h-4" />}
            size="sm"
          >
            Create a new exam
          </Button>
        </div>
      </div>

      {!canPublish && (
        <Card className="bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <span className="font-semibold">You can build exams freely.</span> They start
              <strong> unpublished</strong> — only an admin can flip them on for students. Useful for prototyping a mock paper before it's ready for prime time.
            </div>
          </div>
        </Card>
      )}

      {visible.length === 0 ? (
        <Card padding="lg" className="text-center">
          <p className="text-sm text-slate-500">
            {showArchived
              ? 'No archived exams yet.'
              : 'No exams yet. Create the first one — pick a Track, then a Paper Pattern (or custom), then add questions.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {visible.map((exam) => (
            <ExamRow
              key={exam.id}
              exam={exam}
              track={trackById.get(exam.trackId)}
              patternName={
                exam.paperPatternId
                  ? formatById.get(exam.paperPatternId)?.name ?? 'Pattern (deleted)'
                  : null
              }
              liveQuestionCount={
                exam.questionIds.filter((id) => liveQuestionIds.has(id)).length
              }
              expectedQuestionCount={resolveExpectedCount(exam, formatById)}
              durationMinutes={resolveDuration(exam, formatById)}
              canPublish={canPublish}
              onArchive={() => setArchiveConfirm(exam)}
              onRestore={() => restoreExam(exam.id)}
              onTogglePublish={() =>
                updateExam(exam.id, { isPublished: !exam.isPublished })
              }
            />
          ))}
        </div>
      )}

      <Modal
        open={!!archiveConfirm}
        onClose={() => setArchiveConfirm(null)}
        title={archiveConfirm ? `Archive "${archiveConfirm.name}"?` : ''}
        description="Hides the exam from students and the active list. Past attempts on it are preserved. You can restore any time."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setArchiveConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Archive className="w-3.5 h-3.5" />}
              onClick={() => {
                if (archiveConfirm) archiveExam(archiveConfirm.id);
                setArchiveConfirm(null);
              }}
            >
              Archive
            </Button>
          </>
        }
      >
        <div />
      </Modal>
    </div>
  );
}

function resolveExpectedCount(
  exam: Exam,
  formatById: Map<string, ReturnType<typeof useFormats>[number]>
): number {
  if (exam.paperPatternId) {
    const f = formatById.get(exam.paperPatternId);
    return f?.totalQuestions ?? 0;
  }
  return exam.customTotalQuestions ?? 0;
}

function resolveDuration(
  exam: Exam,
  formatById: Map<string, ReturnType<typeof useFormats>[number]>
): number {
  if (exam.paperPatternId) {
    const f = formatById.get(exam.paperPatternId);
    return f?.durationMinutes ?? 0;
  }
  return exam.customDurationMinutes ?? 0;
}

function ExamRow({
  exam,
  track,
  patternName,
  liveQuestionCount,
  expectedQuestionCount,
  durationMinutes,
  canPublish,
  onArchive,
  onRestore,
  onTogglePublish,
}: {
  exam: Exam;
  track: ReturnType<typeof useTracks>[number] | undefined;
  patternName: string | null;
  liveQuestionCount: number;
  expectedQuestionCount: number;
  durationMinutes: number;
  canPublish: boolean;
  onArchive: () => void;
  onRestore: () => void;
  onTogglePublish: () => void;
}) {
  const isArchived = !!exam.archivedAt;
  const total = exam.questionIds.length;
  const broken = total - liveQuestionCount;
  const incomplete = expectedQuestionCount > 0 && total < expectedQuestionCount;

  return (
    <Card padding="none" className={cn('transition-opacity', isArchived && 'opacity-60')}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900 truncate">{exam.name}</h3>
            {track && (
              <Badge tone="brand">
                <span className="inline-flex items-center gap-1">
                  <Compass className="w-3 h-3" />
                  {track.name}
                </span>
              </Badge>
            )}
            {patternName ? (
              <Badge tone="neutral">{patternName}</Badge>
            ) : (
              <Badge tone="amber">Custom</Badge>
            )}
            {exam.isPublished ? (
              <Badge tone="success">Published</Badge>
            ) : (
              <Badge tone="amber">Draft</Badge>
            )}
            {incomplete && <Badge tone="amber">Incomplete</Badge>}
            {broken > 0 && <Badge tone="amber">{broken} unavailable</Badge>}
            {isArchived && <Badge tone="neutral">Archived</Badge>}
          </div>
          {exam.description && (
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{exam.description}</p>
          )}
          <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {total}
              {expectedQuestionCount > 0 ? ` / ${expectedQuestionCount}` : ''} Q
            </span>
            {durationMinutes > 0 && (
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {durationMinutes} min
              </span>
            )}
            <span className="text-slate-300">·</span>
            <Link
              to={`/author/exam/${exam.id}`}
              className="text-brand-700 hover:text-brand-800 hover:underline"
            >
              Open builder →
            </Link>
          </div>
        </div>

        <button
          onClick={onTogglePublish}
          disabled={!canPublish || isArchived || total === 0}
          className={cn(
            'inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-semibold rounded-md border focus-ring',
            (!canPublish || total === 0) && 'opacity-50 cursor-not-allowed',
            exam.isPublished
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          )}
          title={
            !canPublish
              ? 'Only an admin can publish an exam to students'
              : total === 0
              ? 'Add questions before publishing'
              : exam.isPublished
              ? 'Unpublish (hide from students)'
              : 'Publish (show on the student Exams page)'
          }
        >
          {exam.isPublished ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <Circle className="w-3.5 h-3.5" />
          )}
          {exam.isPublished ? 'Published' : 'Draft'}
        </button>

        <div className="flex items-center gap-0.5">
          <Link
            to={`/author/exam/${exam.id}`}
            className={cn(
              'w-8 h-8 inline-flex items-center justify-center rounded-md focus-ring',
              isArchived
                ? 'opacity-40 pointer-events-none text-slate-400'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            )}
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          {isArchived ? (
            <button
              onClick={onRestore}
              className="w-8 h-8 inline-flex items-center justify-center rounded-md text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 focus-ring"
              title="Restore"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onArchive}
              className="w-8 h-8 inline-flex items-center justify-center rounded-md text-slate-500 hover:text-red-700 hover:bg-red-50 focus-ring"
              title="Archive"
            >
              <Archive className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}
