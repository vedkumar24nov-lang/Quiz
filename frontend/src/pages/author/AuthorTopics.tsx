import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  Move,
  RotateCcw,
  Eye,
  EyeOff,
  AlertTriangle,
  Archive,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useHierarchyStore, useTracks } from '@/store/hierarchyStore';
import { Link, useSearchParams } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Subject, Chapter, Topic, Subtopic } from '@/types';

// ─── Page ──────────────────────────────────────────────────────────────────

export function AuthorTopics() {
  // Two-level navigation: pick a track first, then a subject within it.
  // Subjects are scoped to the selected track so JEE Physics ≠ NEET Physics.
  const tracks = useTracks();
  const resetToSeed = useHierarchyStore((s) => s.resetToSeed);
  const addSubject = useHierarchyStore((s) => s.addSubject);
  const updateSubject = useHierarchyStore((s) => s.updateSubject);
  const archiveSubject = useHierarchyStore((s) => s.archiveSubject);
  const restoreSubject = useHierarchyStore((s) => s.restoreSubject);
  const reorderSubject = useHierarchyStore((s) => s.reorderSubject);

  const visibleTracks = useMemo(() => tracks.filter((t) => !t.archivedAt), [tracks]);

  // Honor `?track=<id>` in the URL — used by AuthorTracks' "Save + open
  // syllabus" affordance so a freshly-created track lands here pre-selected.
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTrackParam = searchParams.get('track');
  const [activeTrackId, setActiveTrackId] = useState<string>(() => {
    if (initialTrackParam && visibleTracks.some((t) => t.id === initialTrackParam)) {
      return initialTrackParam;
    }
    return visibleTracks[0]?.id ?? '';
  });

  // Strip the `?track=` param after first read so back-navigation doesn't
  // trap the user on the same preselection.
  useEffect(() => {
    if (!initialTrackParam) return;
    const next = new URLSearchParams(searchParams);
    next.delete('track');
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subjects within the active track. Archived ones surface only when
  // `showArchived` is on (parallels how chapters/topics/subtopics work).
  const [showArchived, setShowArchived] = useState(false);
  const subjects = useMemo(() => {
    const track = visibleTracks.find((t) => t.id === activeTrackId) ?? visibleTracks[0];
    if (!track) return [];
    return track.subjects.filter((s) => showArchived || !s.archivedAt);
  }, [visibleTracks, activeTrackId, showArchived]);

  const activeTrack = useMemo(
    () => visibleTracks.find((t) => t.id === activeTrackId) ?? visibleTracks[0],
    [visibleTracks, activeTrackId]
  );

  const [activeSubjectId, setActiveSubjectId] = useState<string>(subjects[0]?.id ?? '');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // Subject CRUD modals
  type SubjectModal =
    | { kind: 'closed' }
    | { kind: 'create' }
    | { kind: 'edit'; subjectId: string; currentName: string };
  const [subjectModal, setSubjectModal] = useState<SubjectModal>({ kind: 'closed' });
  const [subjectArchiveConfirm, setSubjectArchiveConfirm] = useState<{ id: string; name: string } | null>(null);

  // When the exam changes, snap the active subject back to the first one in
  // that exam (otherwise the previous subject pointer becomes invalid).
  const activeSubject = useMemo(() => {
    const found = subjects.find((s) => s.id === activeSubjectId);
    return found ?? subjects[0];
  }, [subjects, activeSubjectId]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Topics &amp; Subtopics
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-prose">
            Manage the syllabus tree for each subject. Add chapters, topics, and subtopics; reorder them; or move topics between chapters within the same subject.
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
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-xs font-semibold border bg-white text-slate-600 border-slate-300 hover:bg-slate-50 focus-ring"
            title="Discard all edits and reload from the seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to seed
          </button>
        </div>
      </div>

      {/* Track selector — top-level filter. Subjects below scope to the chosen track. */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold uppercase tracking-wide text-slate-500 inline-flex items-center gap-1">
          <Compass className="w-3.5 h-3.5" />
          Track
        </span>
        {visibleTracks.length === 0 ? (
          <span className="text-xs text-slate-500">
            No active tracks.{' '}
            <Link to="/author/tracks" className="text-amber-700 hover:underline font-semibold">
              Create one →
            </Link>
          </span>
        ) : (
          <>
            <div className="inline-flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
              {visibleTracks.map((track) => {
                const isActive = track.id === activeTrackId;
                return (
                  <button
                    key={track.id}
                    onClick={() => {
                      setActiveTrackId(track.id);
                      // Snap subject pointer to first subject in the new track
                      const first = track.subjects.find((s) => !s.archivedAt);
                      if (first) setActiveSubjectId(first.id);
                    }}
                    className={cn(
                      'px-3 h-8 rounded-md text-xs font-semibold transition-all focus-ring inline-flex items-center gap-1.5',
                      isActive
                        ? 'bg-white text-amber-800 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    )}
                    title={
                      track.kind === 'class-stream'
                        ? `Class ${track.classLevel ?? '?'} ${track.stream ?? ''}`.trim()
                        : 'Competitive exam'
                    }
                  >
                    {track.name}
                    {track.code && (
                      <span className="text-[10px] font-mono text-slate-400">{track.code}</span>
                    )}
                  </button>
                );
              })}
            </div>
            <Link
              to="/author/tracks"
              className="text-xs font-semibold text-slate-500 hover:text-amber-700 inline-flex items-center gap-0.5 ml-1"
            >
              Manage tracks →
            </Link>
          </>
        )}
      </div>

      {/* Subject tabs (scoped to active track) — with per-subject action menu + add button */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-slate-200">
        {subjects.length === 0 ? (
          <div className="px-4 py-3 text-sm text-slate-500 italic">
            This track has no subjects yet — add one to start building the syllabus.
          </div>
        ) : null}
        {subjects.map((subj, idx) => {
          const isActive = subj.id === activeSubject?.id;
          const isArchived = !!subj.archivedAt;
          return (
            <SubjectTab
              key={subj.id}
              subject={subj}
              isActive={isActive}
              isFirst={idx === 0}
              isLast={idx === subjects.length - 1}
              onSelect={() => setActiveSubjectId(subj.id)}
              onEdit={() =>
                setSubjectModal({ kind: 'edit', subjectId: subj.id, currentName: subj.name })
              }
              onArchive={() => setSubjectArchiveConfirm({ id: subj.id, name: subj.name })}
              onRestore={() => restoreSubject(subj.id)}
              onMoveLeft={() => reorderSubject(subj.id, 'up')}
              onMoveRight={() => reorderSubject(subj.id, 'down')}
              isArchived={isArchived}
            />
          );
        })}

        {/* Add-subject pill */}
        {activeTrack && (
          <button
            onClick={() => setSubjectModal({ kind: 'create' })}
            className="ml-1 inline-flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-amber-700 hover:text-amber-900 hover:bg-amber-50 rounded-md focus-ring"
            title={`Add a subject to ${activeTrack.name}`}
          >
            <Plus className="w-3.5 h-3.5" />
            Add subject
          </button>
        )}
      </div>

      {/* Tree */}
      {activeSubject && (
        <SubjectTree subject={activeSubject} showArchived={showArchived} />
      )}

      {/* Subject create/edit modal */}
      <SubjectFormModal
        open={subjectModal.kind !== 'closed'}
        mode={subjectModal.kind === 'edit' ? 'edit' : 'create'}
        trackName={activeTrack?.name ?? ''}
        defaultName={subjectModal.kind === 'edit' ? subjectModal.currentName : ''}
        onClose={() => setSubjectModal({ kind: 'closed' })}
        onSave={(name) => {
          if (subjectModal.kind === 'create' && activeTrack) {
            addSubject(activeTrack.id, { name });
          } else if (subjectModal.kind === 'edit') {
            updateSubject(subjectModal.subjectId, { name });
          }
          setSubjectModal({ kind: 'closed' });
        }}
      />

      {/* Subject archive confirm */}
      <Modal
        open={!!subjectArchiveConfirm}
        onClose={() => setSubjectArchiveConfirm(null)}
        title={subjectArchiveConfirm ? `Archive "${subjectArchiveConfirm.name}"?` : ''}
        description="Hides this subject and all its chapters/topics/subtopics from active lists. Past student attempts on its questions are preserved. You can restore it any time."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setSubjectArchiveConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Archive className="w-3.5 h-3.5" />}
              onClick={() => {
                if (subjectArchiveConfirm) archiveSubject(subjectArchiveConfirm.id);
                setSubjectArchiveConfirm(null);
              }}
            >
              Archive
            </Button>
          </>
        }
      >
        <div />
      </Modal>

      {/* Reset confirm */}
      <Modal
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        title="Reset to seed?"
        description="All edits made in the Author Console will be discarded. This affects only your browser — no data has been pushed to a backend yet."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setResetConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                resetToSeed();
                setResetConfirmOpen(false);
              }}
            >
              Discard edits
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 text-sm text-slate-700">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>
            Useful when you want to start over from the original 30 chapters / 75 topics / 150 subtopics. There's no undo on this action.
          </p>
        </div>
      </Modal>
    </div>
  );
}

// ─── Subject tree ──────────────────────────────────────────────────────────
// Within each subject, chapters are grouped into a Class 11 section and a
// Class 12 section so the syllabus split is visually obvious. Reordering and
// adding chapters happen inside the relevant section; moving a chapter
// between classes is done by editing its class level.

function SubjectTree({ subject, showArchived }: { subject: Subject; showArchived: boolean }) {
  const visibleChapters = showArchived
    ? subject.chapters
    : subject.chapters.filter((c) => !c.archivedAt);

  const class11 = visibleChapters.filter((c) => c.classLevel === 11);
  const class12 = visibleChapters.filter((c) => c.classLevel === 12);

  return (
    <div className="space-y-6">
      <ClassSection
        subject={subject}
        classLevel={11}
        chapters={class11}
        showArchived={showArchived}
      />
      <ClassSection
        subject={subject}
        classLevel={12}
        chapters={class12}
        showArchived={showArchived}
      />
    </div>
  );
}

function ClassSection({
  subject,
  classLevel,
  chapters,
  showArchived,
}: {
  subject: Subject;
  classLevel: 11 | 12;
  chapters: Chapter[];
  showArchived: boolean;
}) {
  const addChapter = useHierarchyStore((s) => s.addChapter);
  const [addOpen, setAddOpen] = useState(false);

  const palette = classLevel === 11
    ? {
        ring: 'ring-1 ring-blue-200',
        headerBg: 'bg-blue-50',
        labelText: 'text-blue-900',
        accentText: 'text-blue-700',
        addBorder: 'hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50/50',
      }
    : {
        ring: 'ring-1 ring-violet-200',
        headerBg: 'bg-violet-50',
        labelText: 'text-violet-900',
        accentText: 'text-violet-700',
        addBorder: 'hover:border-violet-400 hover:text-violet-700 hover:bg-violet-50/50',
      };

  return (
    <section className={cn('rounded-xl bg-white p-3 sm:p-4 space-y-2', palette.ring)}>
      {/* Section header */}
      <div className={cn('flex items-center gap-3 px-3 py-2 rounded-lg', palette.headerBg)}>
        <div className={cn('flex items-baseline gap-2', palette.labelText)}>
          <span className="text-xs font-bold uppercase tracking-wider">Class</span>
          <span className="text-2xl font-bold tabular-nums leading-none">{classLevel}</span>
        </div>
        <span className={cn('text-xs font-medium', palette.accentText)}>
          {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}
        </span>
      </div>

      {/* Chapters */}
      {chapters.length === 0 ? (
        <p className="text-xs text-slate-500 italic px-3 py-2">
          No Class {classLevel} chapters yet. Add the first one below.
        </p>
      ) : (
        <div className="space-y-2">
          {chapters.map((chapter, idx) => (
            <ChapterRow
              key={chapter.id}
              chapter={chapter}
              subject={subject}
              showArchived={showArchived}
              isFirst={idx === 0}
              isLast={idx === chapters.length - 1}
            />
          ))}
        </div>
      )}

      {/* Add chapter (class-scoped) */}
      <button
        onClick={() => setAddOpen(true)}
        className={cn(
          'w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-lg border-2 border-dashed border-slate-300 text-slate-500 text-sm font-semibold transition-colors focus-ring',
          palette.addBorder
        )}
      >
        <Plus className="w-4 h-4" />
        Add Class {classLevel} chapter
      </button>

      <ChapterFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title={`New Class ${classLevel} chapter`}
        defaultValue={{ name: '', classLevel }}
        onSubmit={(payload) => addChapter(subject.id, payload)}
      />
    </section>
  );
}

// ─── Chapter row ───────────────────────────────────────────────────────────

function ChapterRow({
  chapter,
  subject,
  showArchived,
  isFirst,
  isLast,
}: {
  chapter: Chapter;
  subject: Subject;
  showArchived: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  const updateChapter = useHierarchyStore((s) => s.updateChapter);
  const archiveChapter = useHierarchyStore((s) => s.archiveChapter);
  const restoreChapter = useHierarchyStore((s) => s.restoreChapter);
  const reorderChapter = useHierarchyStore((s) => s.reorderChapter);
  const addTopic = useHierarchyStore((s) => s.addTopic);

  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [addTopicOpen, setAddTopicOpen] = useState(false);

  const visibleTopics = showArchived
    ? chapter.topics
    : chapter.topics.filter((t) => !t.archivedAt);

  const isArchived = !!chapter.archivedAt;

  return (
    <div
      className={cn(
        'rounded-lg border bg-white',
        isArchived ? 'border-slate-200 bg-slate-50/40 opacity-70' : 'border-slate-200'
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex-shrink-0 w-7 h-7 inline-flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-ring"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-900">{chapter.name}</span>
            <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wide text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              Class {chapter.classLevel}
            </span>
            <span className="text-xs text-slate-500">
              {visibleTopics.length} {visibleTopics.length === 1 ? 'topic' : 'topics'}
            </span>
            {isArchived && (
              <span className="text-[10px] font-bold uppercase tracking-wide text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                Archived
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <RowAction
            icon={ArrowUp}
            label="Move up"
            onClick={() => reorderChapter(chapter.id, 'up')}
            disabled={isFirst || isArchived}
          />
          <RowAction
            icon={ArrowDown}
            label="Move down"
            onClick={() => reorderChapter(chapter.id, 'down')}
            disabled={isLast || isArchived}
          />
          <RowAction
            icon={Pencil}
            label="Edit"
            onClick={() => setEditOpen(true)}
            disabled={isArchived}
          />
          {isArchived ? (
            <RowAction
              icon={RotateCcw}
              label="Restore"
              onClick={() => restoreChapter(chapter.id)}
              tone="amber"
            />
          ) : (
            <RowAction
              icon={Trash2}
              label="Archive"
              onClick={() => setArchiveOpen(true)}
              tone="danger"
            />
          )}
        </div>
      </div>

      {/* Topics list */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/40 px-3 py-3 space-y-1.5">
          {visibleTopics.length === 0 && (
            <p className="text-xs text-slate-500 italic px-1">No topics yet.</p>
          )}
          {visibleTopics.map((tp, idx) => (
            <TopicRow
              key={tp.id}
              topic={tp}
              chapter={chapter}
              subject={subject}
              showArchived={showArchived}
              isFirst={idx === 0}
              isLast={idx === visibleTopics.length - 1}
            />
          ))}
          {!isArchived && (
            <button
              onClick={() => setAddTopicOpen(true)}
              className="w-full inline-flex items-center justify-center gap-1.5 h-9 rounded-md border border-dashed border-slate-300 text-slate-500 hover:border-amber-400 hover:text-amber-700 hover:bg-white text-xs font-semibold transition-colors focus-ring"
            >
              <Plus className="w-3.5 h-3.5" />
              Add topic
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <ChapterFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit chapter"
        defaultValue={{ name: chapter.name, classLevel: chapter.classLevel }}
        onSubmit={(payload) => updateChapter(chapter.id, payload)}
      />
      <ConfirmModal
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        title="Archive chapter?"
        description={`"${chapter.name}" and all its topics + subtopics will be hidden from students. You can restore it later from this same page (toggle "Showing archived").`}
        confirmLabel="Archive"
        onConfirm={() => archiveChapter(chapter.id)}
      />
      <TopicFormModal
        open={addTopicOpen}
        onClose={() => setAddTopicOpen(false)}
        title="New topic"
        onSubmit={(payload) => addTopic(chapter.id, payload)}
      />
    </div>
  );
}

// ─── Topic row ─────────────────────────────────────────────────────────────

function TopicRow({
  topic,
  chapter,
  subject,
  showArchived,
  isFirst,
  isLast,
}: {
  topic: Topic;
  chapter: Chapter;
  subject: Subject;
  showArchived: boolean;
  isFirst: boolean;
  isLast: boolean;
}) {
  const updateTopic = useHierarchyStore((s) => s.updateTopic);
  const archiveTopic = useHierarchyStore((s) => s.archiveTopic);
  const restoreTopic = useHierarchyStore((s) => s.restoreTopic);
  const reorderTopic = useHierarchyStore((s) => s.reorderTopic);
  const moveTopic = useHierarchyStore((s) => s.moveTopic);
  const addSubtopic = useHierarchyStore((s) => s.addSubtopic);

  const [expanded, setExpanded] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);
  const [addSubtopicOpen, setAddSubtopicOpen] = useState(false);

  const visibleSubtopics = showArchived
    ? topic.subtopics
    : topic.subtopics.filter((s) => !s.archivedAt);

  const isArchived = !!topic.archivedAt;

  // Other chapters in the same subject (move-target options).
  const moveTargets = subject.chapters.filter(
    (c) => c.id !== chapter.id && !c.archivedAt
  );

  return (
    <div
      className={cn(
        'rounded-md border bg-white',
        isArchived ? 'border-slate-200 opacity-70' : 'border-slate-200'
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 px-2.5 py-2">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex-shrink-0 w-6 h-6 inline-flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-ring"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-slate-900">{topic.name}</span>
            <span className="text-[11px] text-slate-400">
              {visibleSubtopics.length} sub · {topic.questionCount} Q
            </span>
            {isArchived && (
              <span className="text-[10px] font-bold uppercase tracking-wide text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                Archived
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-0.5">
          <RowAction
            icon={ArrowUp}
            label="Move up"
            onClick={() => reorderTopic(topic.id, 'up')}
            disabled={isFirst || isArchived}
            small
          />
          <RowAction
            icon={ArrowDown}
            label="Move down"
            onClick={() => reorderTopic(topic.id, 'down')}
            disabled={isLast || isArchived}
            small
          />
          <RowAction
            icon={Move}
            label="Move to chapter"
            onClick={() => setMoveOpen(true)}
            disabled={isArchived || moveTargets.length === 0}
            small
          />
          <RowAction
            icon={Pencil}
            label="Edit"
            onClick={() => setEditOpen(true)}
            disabled={isArchived}
            small
          />
          {isArchived ? (
            <RowAction
              icon={RotateCcw}
              label="Restore"
              onClick={() => restoreTopic(topic.id)}
              tone="amber"
              small
            />
          ) : (
            <RowAction
              icon={Trash2}
              label="Archive"
              onClick={() => setArchiveOpen(true)}
              tone="danger"
              small
            />
          )}
        </div>
      </div>

      {/* Subtopics */}
      {expanded && (
        <div className="border-t border-slate-100 bg-white px-2.5 py-2 space-y-1">
          {visibleSubtopics.length === 0 && (
            <p className="text-xs text-slate-500 italic px-1">No subtopics yet.</p>
          )}
          {visibleSubtopics.map((st, idx) => (
            <SubtopicRow
              key={st.id}
              subtopic={st}
              topic={topic}
              chapter={chapter}
              subject={subject}
              isFirst={idx === 0}
              isLast={idx === visibleSubtopics.length - 1}
            />
          ))}
          {!isArchived && (
            <button
              onClick={() => setAddSubtopicOpen(true)}
              className="w-full inline-flex items-center justify-center gap-1.5 h-8 rounded border border-dashed border-slate-300 text-slate-500 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50/40 text-[11px] font-semibold transition-colors focus-ring"
            >
              <Plus className="w-3 h-3" />
              Add subtopic
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <TopicFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit topic"
        defaultValue={{ name: topic.name }}
        onSubmit={(payload) => updateTopic(topic.id, payload)}
      />
      <ConfirmModal
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        title="Archive topic?"
        description={`"${topic.name}" and its subtopics will be hidden from students. Restore later via "Showing archived" toggle.`}
        confirmLabel="Archive"
        onConfirm={() => archiveTopic(topic.id)}
      />
      <MoveModal
        open={moveOpen}
        onClose={() => setMoveOpen(false)}
        title={`Move "${topic.name}" to a different chapter`}
        description={`Targets shown are chapters in ${subject.name}. Cross-subject moves aren't supported.`}
        targets={moveTargets.map((c) => ({
          id: c.id,
          label: c.name,
          sublabel: `Class ${c.classLevel}`,
        }))}
        onConfirm={(targetId) => moveTopic(topic.id, targetId)}
      />
      <SubtopicFormModal
        open={addSubtopicOpen}
        onClose={() => setAddSubtopicOpen(false)}
        title="New subtopic"
        onSubmit={(payload) => addSubtopic(topic.id, payload)}
      />
    </div>
  );
}

// ─── Subtopic row ──────────────────────────────────────────────────────────

function SubtopicRow({
  subtopic,
  topic,
  chapter,
  subject,
  isFirst,
  isLast,
}: {
  subtopic: Subtopic;
  topic: Topic;
  chapter: Chapter;
  subject: Subject;
  isFirst: boolean;
  isLast: boolean;
}) {
  const updateSubtopic = useHierarchyStore((s) => s.updateSubtopic);
  const archiveSubtopic = useHierarchyStore((s) => s.archiveSubtopic);
  const restoreSubtopic = useHierarchyStore((s) => s.restoreSubtopic);
  const reorderSubtopic = useHierarchyStore((s) => s.reorderSubtopic);
  const moveSubtopic = useHierarchyStore((s) => s.moveSubtopic);

  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [moveOpen, setMoveOpen] = useState(false);

  const isArchived = !!subtopic.archivedAt;

  // All other topics in the same subject (move-target options).
  const moveTargets = subject.chapters
    .filter((c) => !c.archivedAt)
    .flatMap((c) =>
      c.topics
        .filter((t) => t.id !== topic.id && !t.archivedAt)
        .map((t) => ({
          id: t.id,
          label: t.name,
          sublabel: `${c.name} · Class ${c.classLevel}`,
        }))
    );

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 rounded',
        isArchived ? 'bg-slate-50/60 opacity-70' : 'hover:bg-slate-50'
      )}
    >
      <span className="flex-shrink-0 w-1 h-1 rounded-full bg-slate-300" />
      <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-700">{subtopic.name}</span>
        {isArchived && (
          <span className="text-[9px] font-bold uppercase tracking-wide text-amber-800 bg-amber-100 px-1 py-px rounded">
            Archived
          </span>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        <RowAction
          icon={ArrowUp}
          label="Move up"
          onClick={() => reorderSubtopic(subtopic.id, 'up')}
          disabled={isFirst || isArchived}
          small
        />
        <RowAction
          icon={ArrowDown}
          label="Move down"
          onClick={() => reorderSubtopic(subtopic.id, 'down')}
          disabled={isLast || isArchived}
          small
        />
        <RowAction
          icon={Move}
          label="Move to topic"
          onClick={() => setMoveOpen(true)}
          disabled={isArchived || moveTargets.length === 0}
          small
        />
        <RowAction
          icon={Pencil}
          label="Edit"
          onClick={() => setEditOpen(true)}
          disabled={isArchived}
          small
        />
        {isArchived ? (
          <RowAction
            icon={RotateCcw}
            label="Restore"
            onClick={() => restoreSubtopic(subtopic.id)}
            tone="amber"
            small
          />
        ) : (
          <RowAction
            icon={Trash2}
            label="Archive"
            onClick={() => setArchiveOpen(true)}
            tone="danger"
            small
          />
        )}
      </div>

      {/* Modals */}
      <SubtopicFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit subtopic"
        defaultValue={{ name: subtopic.name }}
        onSubmit={(payload) => updateSubtopic(subtopic.id, payload)}
      />
      <ConfirmModal
        open={archiveOpen}
        onClose={() => setArchiveOpen(false)}
        title="Archive subtopic?"
        description={`"${subtopic.name}" will be hidden from students. Restore later via "Showing archived" toggle.`}
        confirmLabel="Archive"
        onConfirm={() => archiveSubtopic(subtopic.id)}
      />
      <MoveModal
        open={moveOpen}
        onClose={() => setMoveOpen(false)}
        title={`Move "${subtopic.name}" to a different topic`}
        description={`Targets shown are topics in ${subject.name}. Currently in: ${chapter.name} · ${topic.name}.`}
        targets={moveTargets}
        onConfirm={(targetId) => moveSubtopic(subtopic.id, targetId)}
      />
    </div>
  );
}

// ─── Reusable: row action button ───────────────────────────────────────────

function RowAction({
  icon: Icon,
  label,
  onClick,
  disabled,
  tone = 'default',
  small = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  tone?: 'default' | 'danger' | 'amber';
  small?: boolean;
}) {
  const toneClasses = {
    default: 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
    danger: 'text-slate-500 hover:bg-red-50 hover:text-red-700',
    amber: 'text-amber-700 hover:bg-amber-100 hover:text-amber-800',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center rounded transition-colors focus-ring',
        small ? 'w-7 h-7' : 'w-8 h-8',
        disabled
          ? 'text-slate-300 cursor-not-allowed'
          : toneClasses[tone]
      )}
    >
      <Icon className={cn(small ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
    </button>
  );
}

// ─── Form modals ───────────────────────────────────────────────────────────

function ChapterFormModal({
  open,
  onClose,
  title,
  defaultValue,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  defaultValue?: { name: string; classLevel: 11 | 12 };
  onSubmit: (payload: { name: string; classLevel: 11 | 12 }) => void;
}) {
  const [name, setName] = useState(defaultValue?.name ?? '');
  const [classLevel, setClassLevel] = useState<11 | 12>(defaultValue?.classLevel ?? 11);

  // Reset fields whenever the modal opens for a new entry.
  useResetWhenOpened(open, () => {
    setName(defaultValue?.name ?? '');
    setClassLevel(defaultValue?.classLevel ?? 11);
  });

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ name: trimmed, classLevel });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={!name.trim()}>
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormField label="Chapter name">
          <input
            autoFocus
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rotational Motion"
            className="w-full h-10 px-3 text-sm border border-slate-300 rounded-md focus-ring"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />
        </FormField>
        <FormField label="Class level">
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
        </FormField>
      </div>
    </Modal>
  );
}

function TopicFormModal({
  open,
  onClose,
  title,
  defaultValue,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  defaultValue?: { name: string };
  onSubmit: (payload: { name: string }) => void;
}) {
  const [name, setName] = useState(defaultValue?.name ?? '');

  useResetWhenOpened(open, () => setName(defaultValue?.name ?? ''));

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ name: trimmed });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={!name.trim()}>
            Save
          </Button>
        </>
      }
    >
      <FormField label="Topic name">
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Moment of Inertia"
          className="w-full h-10 px-3 text-sm border border-slate-300 rounded-md focus-ring"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
        />
      </FormField>
    </Modal>
  );
}

function SubtopicFormModal({
  open,
  onClose,
  title,
  defaultValue,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  defaultValue?: { name: string };
  onSubmit: (payload: { name: string }) => void;
}) {
  const [name, setName] = useState(defaultValue?.name ?? '');

  useResetWhenOpened(open, () => setName(defaultValue?.name ?? ''));

  function handleSubmit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ name: trimmed });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={!name.trim()}>
            Save
          </Button>
        </>
      }
    >
      <FormField label="Subtopic name">
        <input
          autoFocus
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Parallel & Perpendicular Axis Theorems"
          className="w-full h-10 px-3 text-sm border border-slate-300 rounded-md focus-ring"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
        />
      </FormField>
    </Modal>
  );
}

function MoveModal({
  open,
  onClose,
  title,
  description,
  targets,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  targets: Array<{ id: string; label: string; sublabel?: string }>;
  onConfirm: (targetId: string) => void;
}) {
  const [selected, setSelected] = useState<string>('');

  useResetWhenOpened(open, () => setSelected(''));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!selected}
            onClick={() => {
              onConfirm(selected);
              onClose();
            }}
          >
            Move
          </Button>
        </>
      }
    >
      {targets.length === 0 ? (
        <p className="text-sm text-slate-500 italic">No valid targets — nothing to move to.</p>
      ) : (
        <div className="space-y-1 max-h-72 overflow-y-auto">
          {targets.map((t) => {
            const isSelected = selected === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelected(t.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md border transition-colors focus-ring',
                  isSelected
                    ? 'bg-amber-50 border-amber-400'
                    : 'bg-white border-slate-200 hover:bg-slate-50'
                )}
              >
                <div className="text-sm font-semibold text-slate-900">{t.label}</div>
                {t.sublabel && (
                  <div className="text-xs text-slate-500 mt-0.5">{t.sublabel}</div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}

function ConfirmModal({
  open,
  onClose,
  title,
  description,
  confirmLabel = 'Confirm',
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3 text-sm text-slate-700">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p>This is a soft archive — data is preserved and you can restore it later.</p>
      </div>
    </Modal>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-700 mb-1">{label}</span>
      {children}
    </label>
  );
}

// Reset form fields whenever a modal transitions from closed to open. Using
// `open` as the only dep so a re-rendered defaultValue object doesn't keep
// stomping the user's in-progress edits.
function useResetWhenOpened(open: boolean, reset: () => void) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (open) reset();
  }, [open]);
}

// ─── Subject tab (per-subject controls inside the tab strip) ────────────────

function SubjectTab({
  subject,
  isActive,
  isFirst,
  isLast,
  isArchived,
  onSelect,
  onEdit,
  onArchive,
  onRestore,
  onMoveLeft,
  onMoveRight,
}: {
  subject: Subject;
  isActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  isArchived: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  const activeChapterCount = subject.chapters.filter((c) => !c.archivedAt).length;

  return (
    <div ref={ref} className="relative inline-flex items-stretch group">
      <button
        onClick={onSelect}
        className={cn(
          'pl-4 pr-2 h-10 text-sm font-semibold border-b-2 transition-colors -mb-px focus-ring inline-flex items-center gap-2',
          isActive
            ? 'border-amber-500 text-amber-900'
            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300',
          isArchived && 'italic text-slate-400'
        )}
      >
        {subject.name}
        <span className="text-[11px] font-normal text-slate-400">
          {activeChapterCount} ch
        </span>
        {isArchived && (
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 bg-slate-100 px-1 py-0.5 rounded">
            archived
          </span>
        )}
      </button>
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className={cn(
          'pr-2 h-10 inline-flex items-center text-slate-400 hover:text-slate-700 -mb-px border-b-2',
          isActive ? 'border-amber-500' : 'border-transparent',
          'opacity-0 group-hover:opacity-100 focus:opacity-100',
          menuOpen && 'opacity-100'
        )}
        aria-label="Subject actions"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 z-30 bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden animate-fade-in">
          <MenuItem onClick={() => { setMenuOpen(false); onEdit(); }} icon={<Pencil className="w-3.5 h-3.5" />}>
            Edit name
          </MenuItem>
          <MenuItem
            onClick={() => { setMenuOpen(false); onMoveLeft(); }}
            icon={<ArrowUp className="w-3.5 h-3.5 -rotate-90" />}
            disabled={isFirst}
          >
            Move left
          </MenuItem>
          <MenuItem
            onClick={() => { setMenuOpen(false); onMoveRight(); }}
            icon={<ArrowDown className="w-3.5 h-3.5 -rotate-90" />}
            disabled={isLast}
          >
            Move right
          </MenuItem>
          <div className="border-t border-slate-100" />
          {isArchived ? (
            <MenuItem
              onClick={() => { setMenuOpen(false); onRestore(); }}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              tone="emerald"
            >
              Restore
            </MenuItem>
          ) : (
            <MenuItem
              onClick={() => { setMenuOpen(false); onArchive(); }}
              icon={<Archive className="w-3.5 h-3.5" />}
              tone="red"
            >
              Archive
            </MenuItem>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  onClick,
  icon,
  children,
  disabled,
  tone = 'neutral',
}: {
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
  disabled?: boolean;
  tone?: 'neutral' | 'red' | 'emerald';
}) {
  const toneClasses = {
    neutral: 'text-slate-700 hover:bg-slate-50',
    red: 'text-red-700 hover:bg-red-50',
    emerald: 'text-emerald-700 hover:bg-emerald-50',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full text-left flex items-center gap-2 px-3 py-2 text-sm focus-ring',
        toneClasses[tone],
        disabled && 'opacity-40 cursor-not-allowed hover:bg-transparent'
      )}
    >
      {icon}
      {children}
    </button>
  );
}

// ─── Subject form modal (create + edit) ────────────────────────────────────

function SubjectFormModal({
  open,
  mode,
  trackName,
  defaultName,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  trackName: string;
  defaultName: string;
  onClose: () => void;
  onSave: (name: string) => void;
}) {
  const [name, setName] = useState(defaultName);
  useResetWhenOpened(open, () => setName(defaultName));

  const trimmed = name.trim();
  const valid = trimmed.length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? `New subject in ${trackName}` : 'Rename subject'}
      description={
        mode === 'create'
          ? "Top of this track's syllabus. You'll add chapters under it next."
          : undefined
      }
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={() => valid && onSave(trimmed)} disabled={!valid}>
            {mode === 'create' ? 'Add subject' : 'Save'}
          </Button>
        </>
      }
    >
      <FormField label="Subject name">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Physics, Chemistry, Biology"
          autoFocus
          className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && valid) onSave(trimmed);
          }}
        />
      </FormField>
    </Modal>
  );
}
