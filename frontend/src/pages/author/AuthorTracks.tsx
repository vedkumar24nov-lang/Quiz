import { useMemo, useState } from 'react';
import {
  Compass,
  Plus,
  Pencil,
  Archive,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
  RotateCcw,
  AlertTriangle,
  Layers,
  GraduationCap,
  School,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useHierarchyStore, useTracks } from '@/store/hierarchyStore';
import { useActiveFormats } from '@/store/formatsStore';
import { useAuthUser } from '@/store/authStore';
import { DEFAULT_FORMAT_ID } from '@/data/examFormats';
import { cn } from '@/lib/cn';
import type { Track, TrackKind } from '@/types';

function fmtSigned(n: number): string {
  if (n > 0) return `+${trimNum(n)}`;
  if (n < 0) return `−${trimNum(Math.abs(n))}`;
  return '0';
}
function trimNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
}

interface TrackPayload {
  name: string;
  kind: TrackKind;
  code?: string;
  description?: string;
  formatId: string;
  classLevel?: 11 | 12;
  stream?: string;
}

type ModalMode = { kind: 'closed' } | { kind: 'create' } | { kind: 'edit'; track: Track };

export function AuthorTracks() {
  const navigate = useNavigate();
  const tracks = useTracks();
  const user = useAuthUser();
  const addTrack = useHierarchyStore((s) => s.addTrack);
  const updateTrack = useHierarchyStore((s) => s.updateTrack);
  const archiveTrack = useHierarchyStore((s) => s.archiveTrack);
  const restoreTrack = useHierarchyStore((s) => s.restoreTrack);
  const reorderTrack = useHierarchyStore((s) => s.reorderTrack);

  const [showArchived, setShowArchived] = useState(false);
  const [modal, setModal] = useState<ModalMode>({ kind: 'closed' });
  const [archiveConfirm, setArchiveConfirm] = useState<Track | null>(null);

  const visibleTracks = useMemo(
    () => tracks.filter((t) => showArchived || !t.archivedAt),
    [tracks, showArchived]
  );

  const canPublish = user?.role === 'admin';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-6 h-6 text-amber-600" />
            Tracks
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-prose">
            The top of the syllabus tree. A track is either a <strong>class-stream</strong> (Class 11 PCM, Class 12 PCB, …) or a <strong>competitive exam</strong> (JEE Main, NEET, GATE, …). Each track owns its own subjects, chapters, topics, and subtopics.
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
            onClick={() => setModal({ kind: 'create' })}
            leftIcon={<Plus className="w-4 h-4" />}
            size="sm"
          >
            New track
          </Button>
        </div>
      </div>

      {!canPublish && (
        <Card className="bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <span className="font-semibold">You can create and edit tracks freely.</span>{' '}
              New tracks are <strong>unpublished by default</strong> — only an admin can flip them on for students. Useful when prototyping a new exam ("BITSAT 2027") or a new class stream ("Class 11 Commerce").
            </div>
          </div>
        </Card>
      )}

      {visibleTracks.length === 0 ? (
        <Card padding="lg" className="text-center">
          <p className="text-sm text-slate-500">
            {showArchived
              ? 'No archived tracks yet.'
              : 'No tracks yet. Add the first one to start defining a syllabus.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {visibleTracks.map((track, idx) => (
            <TrackRow
              key={track.id}
              track={track}
              isFirst={idx === 0}
              isLast={idx === visibleTracks.length - 1}
              canPublish={canPublish}
              onEdit={() => setModal({ kind: 'edit', track })}
              onArchive={() => setArchiveConfirm(track)}
              onRestore={() => restoreTrack(track.id)}
              onReorder={(dir) => reorderTrack(track.id, dir)}
              onTogglePublish={() =>
                updateTrack(track.id, { isPublished: !track.isPublished })
              }
            />
          ))}
        </div>
      )}

      {modal.kind !== 'closed' && (
        <TrackFormModal
          open
          mode={modal.kind}
          existing={modal.kind === 'edit' ? modal.track : undefined}
          onClose={() => setModal({ kind: 'closed' })}
          onSave={(payload, andOpenSyllabus) => {
            if (modal.kind === 'create') {
              const id = addTrack(payload);
              setModal({ kind: 'closed' });
              if (andOpenSyllabus) navigate(`/author/topics?track=${id}`);
            } else {
              updateTrack(modal.track.id, payload);
              setModal({ kind: 'closed' });
              if (andOpenSyllabus) navigate(`/author/topics?track=${modal.track.id}`);
            }
          }}
        />
      )}

      <Modal
        open={!!archiveConfirm}
        onClose={() => setArchiveConfirm(null)}
        title={archiveConfirm ? `Archive "${archiveConfirm.name}"?` : ''}
        description="The track (and all its subjects/chapters/topics) will be hidden from the active list. Past student attempts on its questions are preserved. You can restore it any time."
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
                if (archiveConfirm) archiveTrack(archiveConfirm.id);
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

// ─── Row ───────────────────────────────────────────────────────────────────

function TrackRow({
  track,
  isFirst,
  isLast,
  canPublish,
  onEdit,
  onArchive,
  onRestore,
  onReorder,
  onTogglePublish,
}: {
  track: Track;
  isFirst: boolean;
  isLast: boolean;
  canPublish: boolean;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onReorder: (direction: 'up' | 'down') => void;
  onTogglePublish: () => void;
}) {
  const isArchived = !!track.archivedAt;
  const subjectCount = track.subjects.filter((s) => !s.archivedAt).length;
  const chapterCount = track.subjects.reduce(
    (n, s) => n + s.chapters.filter((c) => !c.archivedAt).length,
    0
  );
  const topicCount = track.subjects.reduce(
    (n, s) =>
      n +
      s.chapters.reduce(
        (m, c) => m + c.topics.filter((t) => !t.archivedAt).length,
        0
      ),
    0
  );

  const isClassStream = track.kind === 'class-stream';

  return (
    <Card
      padding="none"
      className={cn(
        'transition-opacity',
        isArchived && 'opacity-60'
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => onReorder('up')}
            disabled={isFirst || isArchived}
            className="w-6 h-5 inline-flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent focus-ring"
            title="Move up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onReorder('down')}
            disabled={isLast || isArchived}
            className="w-6 h-5 inline-flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent focus-ring"
            title="Move down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-slate-900 truncate inline-flex items-center gap-1.5">
              {isClassStream ? (
                <School className="w-4 h-4 text-violet-600" />
              ) : (
                <GraduationCap className="w-4 h-4 text-amber-600" />
              )}
              {track.name}
            </h2>
            {track.code && <Badge tone="neutral">{track.code}</Badge>}
            <Badge tone={isClassStream ? 'amber' : 'brand'}>
              {isClassStream ? 'Class stream' : 'Competitive'}
            </Badge>
            {isClassStream && track.classLevel && (
              <Badge tone="neutral">Class {track.classLevel}</Badge>
            )}
            {isClassStream && track.stream && (
              <Badge tone="neutral">{track.stream}</Badge>
            )}
            {track.isPublished ? (
              <Badge tone="success">Published</Badge>
            ) : (
              <Badge tone="amber">Draft</Badge>
            )}
            {isArchived && <Badge tone="neutral">Archived</Badge>}
          </div>
          {track.description && (
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{track.description}</p>
          )}
          <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-3 flex-wrap">
            <span>{subjectCount} subjects</span>
            <span>·</span>
            <span>{chapterCount} chapters</span>
            <span>·</span>
            <span>{topicCount} topics</span>
            <span>·</span>
            <Link
              to="/author/topics"
              className="text-brand-700 hover:text-brand-800 hover:underline"
            >
              Open syllabus →
            </Link>
          </div>
        </div>

        <button
          onClick={onTogglePublish}
          disabled={!canPublish || isArchived}
          className={cn(
            'inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-semibold rounded-md border focus-ring',
            !canPublish && 'opacity-50 cursor-not-allowed',
            track.isPublished
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          )}
          title={
            !canPublish
              ? 'Only an admin can publish a track to students'
              : track.isPublished
              ? 'Unpublish (hide from students)'
              : 'Publish (show in student track picker)'
          }
        >
          {track.isPublished ? (
            <CheckCircle2 className="w-3.5 h-3.5" />
          ) : (
            <Circle className="w-3.5 h-3.5" />
          )}
          {track.isPublished ? 'Published' : 'Draft'}
        </button>

        <div className="flex items-center gap-0.5">
          <button
            onClick={onEdit}
            disabled={isArchived}
            className="w-8 h-8 inline-flex items-center justify-center rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent focus-ring"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
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

// ─── Form modal ────────────────────────────────────────────────────────────

function TrackFormModal({
  open,
  mode,
  existing,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  existing?: Track;
  onClose: () => void;
  onSave: (payload: TrackPayload, andOpenSyllabus: boolean) => void;
}) {
  const formats = useActiveFormats();
  const [name, setName] = useState(existing?.name ?? '');
  const [kind, setKind] = useState<TrackKind>(existing?.kind ?? 'competitive');
  const [code, setCode] = useState(existing?.code ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [formatId, setFormatId] = useState<string>(
    existing?.formatId ?? formats[0]?.id ?? DEFAULT_FORMAT_ID
  );
  const [classLevel, setClassLevel] = useState<11 | 12>(existing?.classLevel ?? 11);
  const [stream, setStream] = useState(existing?.stream ?? '');

  const selectedFormat = formats.find((f) => f.id === formatId);
  const trimmedName = name.trim();
  const trimmedStream = stream.trim();
  const valid =
    trimmedName.length > 0 &&
    !!formatId &&
    (kind === 'competitive' || (!!classLevel && trimmedStream.length > 0));

  function handleSubmit(andOpenSyllabus: boolean) {
    if (!valid) return;
    onSave(
      {
        name: trimmedName,
        kind,
        code: code.trim() || undefined,
        description: description.trim() || undefined,
        formatId,
        classLevel: kind === 'class-stream' ? classLevel : undefined,
        stream: kind === 'class-stream' ? trimmedStream : undefined,
      },
      andOpenSyllabus
    );
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'New track' : `Edit "${existing?.name}"`}
      description={
        mode === 'create'
          ? 'A track sits at the top of the syllabus tree. Pick a kind: a class-stream (Class 11 PCM, Class 12 PCB) or a competitive exam (JEE Main, NEET, GATE).'
          : undefined
      }
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSubmit(true)}
            disabled={!valid}
            title="Save and jump to Topics & Subtopics with this track preselected"
          >
            {mode === 'create' ? 'Create + add subjects' : 'Save + open syllabus'}
          </Button>
          <Button size="sm" onClick={() => handleSubmit(false)} disabled={!valid}>
            {mode === 'create' ? 'Create track' : 'Save changes'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
            Kind <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <KindOption
              icon={<School className="w-4 h-4" />}
              label="Class stream"
              hint="e.g. Class 11 PCM, Class 12 PCB"
              active={kind === 'class-stream'}
              onClick={() => setKind('class-stream')}
            />
            <KindOption
              icon={<GraduationCap className="w-4 h-4" />}
              label="Competitive exam"
              hint="e.g. JEE Main, NEET, GATE"
              active={kind === 'competitive'}
              onClick={() => setKind('competitive')}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
            Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={kind === 'class-stream' ? 'e.g. Class 11 PCM' : 'e.g. NEET (UG), GATE-CS, BITSAT'}
            autoFocus
            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
            Short code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder={kind === 'class-stream' ? 'e.g. 11-PCM' : 'e.g. NEET, GATE-CS'}
            maxLength={16}
            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500 font-mono uppercase"
          />
          <p className="text-xs text-slate-500 mt-1">
            Used in chips and badges. Optional — defaults to no badge.
          </p>
        </div>

        {kind === 'class-stream' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Class <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-2">
                {[11, 12].map((cl) => (
                  <button
                    key={cl}
                    type="button"
                    onClick={() => setClassLevel(cl as 11 | 12)}
                    className={cn(
                      'flex-1 h-10 rounded-md border text-sm font-semibold focus-ring',
                      classLevel === cl
                        ? 'bg-amber-50 border-amber-400 text-amber-900'
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    Class {cl}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
                Stream <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={stream}
                onChange={(e) => setStream(e.target.value.toUpperCase())}
                placeholder="e.g. PCM, PCB, Commerce"
                maxLength={24}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500 font-mono uppercase"
              />
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide inline-flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Default test format <span className="text-red-600">*</span>
            </label>
            <Link
              to="/author/formats"
              className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 hover:underline"
            >
              Manage formats →
            </Link>
          </div>
          <select
            value={formatId}
            onChange={(e) => setFormatId(e.target.value)}
            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500"
          >
            {formats.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} {f.isSystem ? '(system)' : '(custom)'}
              </option>
            ))}
          </select>
          {selectedFormat && (
            <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 space-y-1">
              <div className="font-mono">
                {selectedFormat.totalQuestions > 0 ? `${selectedFormat.totalQuestions} Q` : 'flexible Q-count'}
                {' · '}
                {selectedFormat.durationMinutes} min
                {' · '}
                MCQ {fmtSigned(selectedFormat.markingMcq.correct)}/{fmtSigned(selectedFormat.markingMcq.wrong)}
                {selectedFormat.markingNumerical
                  ? ` · Num ${fmtSigned(selectedFormat.markingNumerical.correct)}/${fmtSigned(selectedFormat.markingNumerical.wrong)}`
                  : ' · no numerical'}
              </div>
              {selectedFormat.description && (
                <p className="text-slate-500">{selectedFormat.description}</p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Who is this track for? Any context students should know."
            rows={3}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500 resize-none"
          />
        </div>
      </div>
    </Modal>
  );
}

function KindOption({
  icon,
  label,
  hint,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'text-left rounded-md border-2 p-3 transition-all focus-ring',
        active ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white hover:border-amber-300'
      )}
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        {icon}
        {label}
      </div>
      <div className="text-xs text-slate-600 mt-0.5">{hint}</div>
    </button>
  );
}
