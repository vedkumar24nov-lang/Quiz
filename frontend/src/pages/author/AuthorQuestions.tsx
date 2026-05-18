import { useMemo, useState } from 'react';
import {
  FileQuestion,
  Plus,
  Search,
  Pencil,
  Archive,
  RotateCcw,
  Eye,
  EyeOff,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge, DifficultyBadge, TypeBadge } from '@/components/ui/Badge';
import { useTracks } from '@/store/hierarchyStore';
import { useQuestionsStore } from '@/store/questionsStore';
import { QuestionFormModal } from './QuestionFormModal';
import type { Question, Difficulty, QuestionType } from '@/types';
import { cn } from '@/lib/cn';

type ModalState =
  | { kind: 'closed' }
  | { kind: 'create' }
  | { kind: 'edit'; question: Question };

const DIFFICULTIES: Array<Difficulty | 'all'> = ['all', 'Easy', 'Medium', 'Hard'];
const TYPES: Array<QuestionType | 'all'> = ['all', 'Recall', 'Conceptual', 'Analytical', 'Application'];

export function AuthorQuestions() {
  const tracks = useTracks();
  const questions = useQuestionsStore((s) => s.questions);
  const addQuestion = useQuestionsStore((s) => s.addQuestion);
  const updateQuestion = useQuestionsStore((s) => s.updateQuestion);
  const archiveQuestion = useQuestionsStore((s) => s.archiveQuestion);
  const restoreQuestion = useQuestionsStore((s) => s.restoreQuestion);
  const resetToSeed = useQuestionsStore((s) => s.resetToSeed);

  // ─── Filter state ────────────────────────────────────────────────────
  const [query, setQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [chapterFilter, setChapterFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all');
  const [showArchived, setShowArchived] = useState(false);
  const [modal, setModal] = useState<ModalState>({ kind: 'closed' });
  const [archiveConfirm, setArchiveConfirm] = useState<Question | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  // ─── Build a topic → location lookup for fast list rendering ──────────
  const topicLookup = useMemo(() => {
    const map = new Map<
      string,
      { topicName: string; chapterName: string; subjectName: string; trackName: string; trackId: string; subjectId: string; chapterId: string }
    >();
    for (const track of tracks) {
      for (const subj of track.subjects) {
        for (const ch of subj.chapters) {
          for (const tp of ch.topics) {
            map.set(tp.id, {
              topicName: tp.name,
              chapterName: ch.name,
              subjectName: subj.name,
              trackName: track.name,
              trackId: track.id,
              subjectId: subj.id,
              chapterId: ch.id,
            });
          }
        }
      }
    }
    return map;
  }, [tracks]);

  // ─── Cascading filter options ────────────────────────────────────────
  const filterableTracks = tracks.filter((t) => !t.archivedAt);
  const filterableSubjects = useMemo(() => {
    if (trackFilter === 'all') return filterableTracks.flatMap((t) => t.subjects.filter((s) => !s.archivedAt));
    const track = filterableTracks.find((t) => t.id === trackFilter);
    return track?.subjects.filter((s) => !s.archivedAt) ?? [];
  }, [trackFilter, filterableTracks]);
  const filterableChapters = useMemo(() => {
    if (subjectFilter === 'all') return filterableSubjects.flatMap((s) => s.chapters.filter((c) => !c.archivedAt));
    const subj = filterableSubjects.find((s) => s.id === subjectFilter);
    return subj?.chapters.filter((c) => !c.archivedAt) ?? [];
  }, [subjectFilter, filterableSubjects]);
  const filterableTopics = useMemo(() => {
    if (chapterFilter === 'all') return filterableChapters.flatMap((c) => c.topics.filter((t) => !t.archivedAt));
    const ch = filterableChapters.find((c) => c.id === chapterFilter);
    return ch?.topics.filter((t) => !t.archivedAt) ?? [];
  }, [chapterFilter, filterableChapters]);

  // ─── Apply filters ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return questions.filter((qn) => {
      if (!showArchived && qn.archivedAt) return false;
      const loc = topicLookup.get(qn.topicId);
      if (trackFilter !== 'all' && loc?.trackId !== trackFilter) return false;
      if (subjectFilter !== 'all' && loc?.subjectId !== subjectFilter) return false;
      if (chapterFilter !== 'all' && loc?.chapterId !== chapterFilter) return false;
      if (topicFilter !== 'all' && qn.topicId !== topicFilter) return false;
      if (difficultyFilter !== 'all' && qn.difficulty !== difficultyFilter) return false;
      if (typeFilter !== 'all' && qn.type !== typeFilter) return false;
      if (q) {
        const matches =
          qn.stem.toLowerCase().includes(q) ||
          qn.solution.toLowerCase().includes(q) ||
          loc?.topicName.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    });
  }, [questions, query, trackFilter, subjectFilter, chapterFilter, topicFilter, difficultyFilter, typeFilter, showArchived, topicLookup]);

  const totalQuestions = questions.filter((q) => !q.archivedAt).length;

  function clearFilters() {
    setQuery('');
    setTrackFilter('all');
    setSubjectFilter('all');
    setChapterFilter('all');
    setTopicFilter('all');
    setDifficultyFilter('all');
    setTypeFilter('all');
  }
  const filtersActive =
    !!query ||
    trackFilter !== 'all' ||
    subjectFilter !== 'all' ||
    chapterFilter !== 'all' ||
    topicFilter !== 'all' ||
    difficultyFilter !== 'all' ||
    typeFilter !== 'all';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <FileQuestion className="w-6 h-6 text-amber-600" />
            Questions
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-prose">
            <span className="font-semibold text-slate-900">{totalQuestions}</span> active questions across all tracks. Author new ones, edit existing, attach diagrams, archive/restore.
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
            Reset
          </button>
          <Button
            onClick={() => setModal({ kind: 'create' })}
            leftIcon={<Plus className="w-4 h-4" />}
            size="sm"
          >
            New question
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      <Card padding="md" className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stem, solution, topic name…"
              className="w-full h-9 pl-10 pr-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500"
            />
          </div>
          {filtersActive && (
            <button
              onClick={clearFilters}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Cascading exam → subject → chapter → topic */}
        <div className="grid sm:grid-cols-4 gap-2">
          <FilterSelect
            label="Track"
            value={trackFilter}
            onChange={(v) => {
              setTrackFilter(v);
              setSubjectFilter('all');
              setChapterFilter('all');
              setTopicFilter('all');
            }}
            options={[
              { value: 'all', label: 'All tracks' },
              ...filterableTracks.map((t) => ({ value: t.id, label: t.name })),
            ]}
          />
          <FilterSelect
            label="Subject"
            value={subjectFilter}
            onChange={(v) => {
              setSubjectFilter(v);
              setChapterFilter('all');
              setTopicFilter('all');
            }}
            options={[
              { value: 'all', label: 'All subjects' },
              ...filterableSubjects.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
          <FilterSelect
            label="Chapter"
            value={chapterFilter}
            onChange={(v) => {
              setChapterFilter(v);
              setTopicFilter('all');
            }}
            options={[
              { value: 'all', label: 'All chapters' },
              ...filterableChapters.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <FilterSelect
            label="Topic"
            value={topicFilter}
            onChange={setTopicFilter}
            options={[
              { value: 'all', label: 'All topics' },
              ...filterableTopics.map((t) => ({ value: t.id, label: t.name })),
            ]}
          />
        </div>

        {/* Tag filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <ChipFilter label="Difficulty" value={difficultyFilter} onChange={(v) => setDifficultyFilter(v as Difficulty | 'all')} options={DIFFICULTIES} />
          <ChipFilter label="Type" value={typeFilter} onChange={(v) => setTypeFilter(v as QuestionType | 'all')} options={TYPES} />
        </div>
      </Card>

      {/* Result count */}
      <div className="text-xs text-slate-500">
        Showing <span className="font-semibold text-slate-900">{filtered.length}</span> of {questions.length} questions
        {showArchived && (
          <>
            {' '}({questions.filter((q) => !!q.archivedAt).length} archived)
          </>
        )}
      </div>

      {/* Question list */}
      {filtered.length === 0 ? (
        <Card padding="lg" className="text-center">
          <p className="text-sm text-slate-500">
            {filtersActive
              ? 'No questions match the current filters.'
              : 'No questions yet. Author the first one.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((q) => (
            <QuestionRow
              key={q.id}
              question={q}
              location={topicLookup.get(q.topicId)}
              onEdit={() => setModal({ kind: 'edit', question: q })}
              onArchive={() => setArchiveConfirm(q)}
              onRestore={() => restoreQuestion(q.id)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {modal.kind !== 'closed' && (
        <QuestionFormModal
          open
          mode={modal.kind === 'edit' ? 'edit' : 'create'}
          existing={modal.kind === 'edit' ? modal.question : undefined}
          onClose={() => setModal({ kind: 'closed' })}
          onSave={(draft) => {
            if (modal.kind === 'create') {
              addQuestion(draft);
            } else {
              updateQuestion(modal.question.id, draft);
            }
            setModal({ kind: 'closed' });
          }}
        />
      )}

      {/* Archive confirm */}
      <Modal
        open={!!archiveConfirm}
        onClose={() => setArchiveConfirm(null)}
        title="Archive question?"
        description="The question is hidden from active lists and from the adaptive engine. Past attempts on it are preserved. You can restore it any time."
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
                if (archiveConfirm) archiveQuestion(archiveConfirm.id);
                setArchiveConfirm(null);
              }}
            >
              Archive
            </Button>
          </>
        }
      >
        <div className="text-sm text-slate-700 line-clamp-3 italic">
          "{archiveConfirm?.stem}"
        </div>
      </Modal>

      {/* Reset confirm */}
      <Modal
        open={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        title="Reset all questions?"
        description="Discards every authored / edited / archived question and reloads the original seed (45 dummy questions). Affects only your browser."
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
              Discard everything
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 text-sm text-slate-700">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>There's no undo on this action.</p>
        </div>
      </Modal>
    </div>
  );
}

// ─── Filter sub-components ────────────────────────────────────────────────

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-2.5 bg-white border border-slate-300 rounded-md text-xs focus-ring focus:border-amber-500"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function ChipFilter({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}:
      </span>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            'px-2 h-6 rounded text-[11px] font-semibold transition-colors focus-ring',
            value === opt
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          )}
        >
          {opt === 'all' ? 'All' : opt}
        </button>
      ))}
    </div>
  );
}

// ─── Question row ────────────────────────────────────────────────────────

function QuestionRow({
  question,
  location,
  onEdit,
  onArchive,
  onRestore,
}: {
  question: Question;
  location?: { topicName: string; chapterName: string; subjectName: string; trackName: string };
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
}) {
  const isArchived = !!question.archivedAt;
  return (
    <Card
      padding="md"
      className={cn(
        'transition-opacity hover:shadow-md',
        isArchived && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Optional thumbnail */}
        {question.imageDataUrl && (
          <img
            src={question.imageDataUrl}
            alt=""
            className="flex-shrink-0 w-14 h-14 sm:w-20 sm:h-20 object-cover rounded border border-slate-200"
          />
        )}

        <div className="flex-1 min-w-0">
          {/* Tags row */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2">
            <DifficultyBadge difficulty={question.difficulty} />
            <TypeBadge type={question.type} />
            <Badge tone="neutral">{question.format === 'mcq' ? 'MCQ' : 'Numerical'}</Badge>
            {question.imageDataUrl && (
              <Badge tone="brand">
                <span className="inline-flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  Image
                </span>
              </Badge>
            )}
            {isArchived && <Badge tone="neutral">Archived</Badge>}
            <span className="text-[11px] text-slate-400 font-mono ml-auto">{question.id}</span>
          </div>

          {/* Stem preview */}
          <p className="text-sm text-slate-900 line-clamp-2">{question.stem}</p>

          {/* Location breadcrumb */}
          {location ? (
            <p className="text-[11px] text-slate-500 mt-1.5 truncate">
              {location.trackName} <span className="text-slate-300">›</span>{' '}
              {location.subjectName} <span className="text-slate-300">›</span>{' '}
              {location.chapterName} <span className="text-slate-300">›</span>{' '}
              <span className="text-slate-700 font-medium">{location.topicName}</span>
            </p>
          ) : (
            <p className="text-[11px] text-amber-700 mt-1.5 italic">
              ⚠ Topic not found — was the topic deleted?
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-end gap-1.5">
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
      </div>
    </Card>
  );
}
