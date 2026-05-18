import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  Compass,
  ClipboardList,
  Layers,
  CheckCircle2,
  XCircle,
  Clock,
  Hash,
  School,
  GraduationCap,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useTracks, useHierarchyStore } from '@/store/hierarchyStore';
import { useExamsStore } from '@/store/examsStore';
import { useFormatsStore } from '@/store/formatsStore';
import { useAuthUser } from '@/store/authStore';
import { auditLog } from '@/store/auditStore';
import type { Track, Exam, ExamFormat } from '@/types';
import { cn } from '@/lib/cn';

type QueueItem =
  | { kind: 'track'; track: Track; submittedAt: string }
  | { kind: 'exam'; exam: Exam; submittedAt: string }
  | { kind: 'pattern'; format: ExamFormat; submittedAt: string };

type RejectTarget = { item: QueueItem; defaultName: string };

export function AdminReviewQueue() {
  const tracks = useTracks();
  const exams = useExamsStore((s) => s.exams);
  const formats = useFormatsStore((s) => s.formats);
  const updateTrack = useHierarchyStore((s) => s.updateTrack);
  const updateExam = useExamsStore((s) => s.updateExam);
  const updateFormat = useFormatsStore((s) => s.updateFormat);
  const archiveFormat = useFormatsStore((s) => s.archiveFormat);
  const user = useAuthUser();

  const [rejectTarget, setRejectTarget] = useState<RejectTarget | null>(null);
  const [filter, setFilter] = useState<'all' | 'tracks' | 'exams' | 'patterns'>('all');

  // Build the unified queue. A "pending" item is one that's:
  //  - not archived
  //  - not yet published (or, for patterns: a custom non-system pattern that
  //    hasn't been touched by an admin — proxy: hasn't been viewed yet)
  // Patterns have no isPublished; admin's job there is QA on author-created
  // custom patterns. System patterns are always trusted.
  const queue: QueueItem[] = useMemo(() => {
    const items: QueueItem[] = [];
    for (const t of tracks) {
      if (t.archivedAt || t.isPublished) continue;
      items.push({ kind: 'track', track: t, submittedAt: t.archivedAt ?? '' });
    }
    for (const e of exams) {
      if (e.archivedAt || e.isPublished) continue;
      if (e.questionIds.length === 0) continue; // empty exams can't be reviewed yet
      items.push({ kind: 'exam', exam: e, submittedAt: e.updatedAt ?? e.createdAt ?? '' });
    }
    for (const f of formats) {
      if (f.archivedAt || f.isSystem) continue;
      items.push({ kind: 'pattern', format: f, submittedAt: f.updatedAt ?? f.createdAt ?? '' });
    }
    // Newest first
    return items.sort((a, b) => (b.submittedAt ?? '').localeCompare(a.submittedAt ?? ''));
  }, [tracks, exams, formats]);

  const filtered = useMemo(() => {
    if (filter === 'all') return queue;
    if (filter === 'tracks') return queue.filter((q) => q.kind === 'track');
    if (filter === 'exams') return queue.filter((q) => q.kind === 'exam');
    return queue.filter((q) => q.kind === 'pattern');
  }, [queue, filter]);

  const counts = useMemo(
    () => ({
      tracks: queue.filter((q) => q.kind === 'track').length,
      exams: queue.filter((q) => q.kind === 'exam').length,
      patterns: queue.filter((q) => q.kind === 'pattern').length,
    }),
    [queue]
  );

  function approve(item: QueueItem) {
    if (item.kind === 'track') {
      updateTrack(item.track.id, { isPublished: true });
    } else if (item.kind === 'exam') {
      updateExam(item.exam.id, { isPublished: true });
    } else {
      // Patterns don't have isPublished; "approving" just means the pattern
      // stays active. Log it as a publish for audit visibility.
      auditLog({
        type: 'examFormat',
        action: 'publish',
        id: item.format.id,
        label: item.format.name,
        details: { reviewedBy: user?.name ?? null },
      });
      // Touch updatedAt so it leaves the queue (pending heuristic uses updatedAt).
      updateFormat(item.format.id, {});
    }
  }

  function reject(item: QueueItem, note: string) {
    const trimmed = note.trim();
    const detailNote = trimmed || 'No reason provided.';
    if (item.kind === 'track') {
      // Track is already isPublished:false, so just emit a reject audit entry
      // with the note. The author will see it under their /author/history.
      auditLog({
        type: 'track',
        action: 'reject',
        id: item.track.id,
        label: item.track.name,
        details: { note: detailNote },
      });
    } else if (item.kind === 'exam') {
      auditLog({
        type: 'exam',
        action: 'reject',
        id: item.exam.id,
        label: item.exam.name,
        details: { note: detailNote },
      });
    } else {
      // For custom patterns, "reject" archives them so they leave the active
      // pool. Author can restore + edit.
      archiveFormat(item.format.id);
      auditLog({
        type: 'examFormat',
        action: 'reject',
        id: item.format.id,
        label: item.format.name,
        details: { note: detailNote },
      });
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Inbox className="w-6 h-6 text-emerald-600" />
            Review Queue
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-prose">
            Everything authors have created but haven't pushed live. <strong>Approve</strong> to publish for students. <strong>Reject</strong> to send it back with a note — the author sees the rejection in their Edit History.
          </p>
        </div>
      </div>

      {/* Counts + filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <FilterChip
          active={filter === 'all'}
          label={`All (${queue.length})`}
          onClick={() => setFilter('all')}
        />
        <FilterChip
          active={filter === 'tracks'}
          label={`Tracks (${counts.tracks})`}
          icon={<Compass className="w-3 h-3" />}
          onClick={() => setFilter('tracks')}
        />
        <FilterChip
          active={filter === 'exams'}
          label={`Exams (${counts.exams})`}
          icon={<ClipboardList className="w-3 h-3" />}
          onClick={() => setFilter('exams')}
        />
        <FilterChip
          active={filter === 'patterns'}
          label={`Patterns (${counts.patterns})`}
          icon={<Layers className="w-3 h-3" />}
          onClick={() => setFilter('patterns')}
        />
      </div>

      {filtered.length === 0 ? (
        <Card padding="lg" className="text-center">
          <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-700 font-semibold">Nothing pending in this view.</p>
          <p className="text-xs text-slate-500 mt-1">
            {filter === 'all'
              ? 'All caught up — students are seeing everything authors have shipped.'
              : 'Try a different filter.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => (
            <QueueRow
              key={
                item.kind === 'track'
                  ? `track:${item.track.id}`
                  : item.kind === 'exam'
                  ? `exam:${item.exam.id}`
                  : `pattern:${item.format.id}`
              }
              item={item}
              onApprove={() => approve(item)}
              onReject={() =>
                setRejectTarget({
                  item,
                  defaultName:
                    item.kind === 'track'
                      ? item.track.name
                      : item.kind === 'exam'
                      ? item.exam.name
                      : item.format.name,
                })
              }
            />
          ))}
        </div>
      )}

      <RejectModal
        target={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={(note) => {
          if (rejectTarget) reject(rejectTarget.item, note);
          setRejectTarget(null);
        }}
      />
    </div>
  );
}

function FilterChip({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 h-8 rounded-md text-xs font-semibold border focus-ring transition-colors',
        active
          ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
          : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function QueueRow({
  item,
  onApprove,
  onReject,
}: {
  item: QueueItem;
  onApprove: () => void;
  onReject: () => void;
}) {
  const submittedAt = item.submittedAt;
  const subtitle = submittedAt
    ? `Last edited ${new Date(submittedAt).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      })}`
    : 'Last edited — unknown';

  return (
    <Card padding="md" className="hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          {item.kind === 'track' && <TrackBody track={item.track} />}
          {item.kind === 'exam' && <ExamBody exam={item.exam} />}
          {item.kind === 'pattern' && <PatternBody format={item.format} />}
          <div className="text-[11px] text-slate-400 mt-1.5">{subtitle}</div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<XCircle className="w-3.5 h-3.5" />}
            onClick={onReject}
          >
            Reject
          </Button>
          <Button
            size="sm"
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            onClick={onApprove}
          >
            Approve
          </Button>
        </div>
      </div>
    </Card>
  );
}

function TrackBody({ track }: { track: Track }) {
  const isClassStream = track.kind === 'class-stream';
  const subjectCount = track.subjects.filter((s) => !s.archivedAt).length;
  const topicCount = track.subjects.reduce(
    (n, s) =>
      n + s.chapters.reduce((m, c) => m + c.topics.filter((t) => !t.archivedAt).length, 0),
    0
  );
  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge tone="brand">
          <span className="inline-flex items-center gap-1">
            <Compass className="w-3 h-3" />
            Track
          </span>
        </Badge>
        <h3 className="font-semibold text-slate-900 truncate inline-flex items-center gap-1.5">
          {isClassStream ? (
            <School className="w-4 h-4 text-violet-600" />
          ) : (
            <GraduationCap className="w-4 h-4 text-amber-600" />
          )}
          {track.name}
        </h3>
        {track.code && <Badge tone="neutral">{track.code}</Badge>}
        <Badge tone={isClassStream ? 'amber' : 'brand'}>
          {isClassStream ? 'Class stream' : 'Competitive'}
        </Badge>
      </div>
      {track.description && (
        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{track.description}</p>
      )}
      <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-3 flex-wrap">
        <span>{subjectCount} subjects</span>
        <span>·</span>
        <span>{topicCount} topics</span>
        {topicCount === 0 && (
          <Badge tone="amber">
            <span className="inline-flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Empty syllabus
            </span>
          </Badge>
        )}
        <span>·</span>
        <Link to="/author/topics" className="text-brand-700 hover:underline">
          Open syllabus →
        </Link>
      </div>
    </>
  );
}

function ExamBody({ exam }: { exam: Exam }) {
  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge tone="brand">
          <span className="inline-flex items-center gap-1">
            <ClipboardList className="w-3 h-3" />
            Exam
          </span>
        </Badge>
        <h3 className="font-semibold text-slate-900 truncate">{exam.name}</h3>
        {exam.paperPatternId ? (
          <Badge tone="neutral">Pattern-based</Badge>
        ) : (
          <Badge tone="amber">Custom</Badge>
        )}
      </div>
      {exam.description && (
        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{exam.description}</p>
      )}
      <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1">
          <Hash className="w-3 h-3" />
          {exam.questionIds.length} Q
        </span>
        <span>·</span>
        <Link to={`/author/exam/${exam.id}`} className="text-brand-700 hover:underline">
          Open builder →
        </Link>
      </div>
    </>
  );
}

function PatternBody({ format }: { format: ExamFormat }) {
  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge tone="brand">
          <span className="inline-flex items-center gap-1">
            <Layers className="w-3 h-3" />
            Pattern
          </span>
        </Badge>
        <h3 className="font-semibold text-slate-900 truncate">{format.name}</h3>
        <Badge tone="amber">Custom</Badge>
      </div>
      {format.description && (
        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{format.description}</p>
      )}
      <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-3 flex-wrap">
        <span className="inline-flex items-center gap-1">
          <Hash className="w-3 h-3" />
          {format.totalQuestions === 0 ? 'flexible' : `${format.totalQuestions} Q`}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {format.durationMinutes} min
        </span>
        <span>·</span>
        <Link to="/author/exam/patterns" className="text-brand-700 hover:underline">
          Open in patterns →
        </Link>
      </div>
    </>
  );
}

function RejectModal({
  target,
  onClose,
  onConfirm,
}: {
  target: RejectTarget | null;
  onClose: () => void;
  onConfirm: (note: string) => void;
}) {
  const [note, setNote] = useState('');

  // Reset note when the modal opens for a different target.
  useEffect(() => {
    if (target) setNote('');
  }, [target]);

  return (
    <Modal
      open={!!target}
      onClose={onClose}
      title={target ? `Reject "${target.defaultName}"?` : ''}
      description="The author keeps editing access and your note shows up in their Edit History so they know what to fix."
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<XCircle className="w-3.5 h-3.5" />}
            onClick={() => onConfirm(note)}
          >
            Send rejection
          </Button>
        </>
      }
    >
      <label className="block">
        <span className="block text-xs font-semibold text-slate-700 mb-1.5">
          Note for the author <span className="text-slate-400 font-normal">(optional but kind)</span>
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. The Q-count doesn't match the pattern, please add 5 more Hard questions before re-submitting."
          rows={4}
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-emerald-500 resize-none"
          autoFocus
        />
      </label>
    </Modal>
  );
}
