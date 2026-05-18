import { useMemo, useState } from 'react';
import { Search, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { DifficultyBadge, TypeBadge, Badge } from '@/components/ui/Badge';
import { useTracks } from '@/store/hierarchyStore';
import { useQuestionsStore } from '@/store/questionsStore';
import type { Question, Difficulty, QuestionType } from '@/types';
import { cn } from '@/lib/cn';

interface Props {
  open: boolean;
  /** Track this exam belongs to. The picker is locked to questions whose topic resolves under this track. */
  trackId: string;
  /** Question IDs already in the exam — shown as "added" and disabled. */
  alreadyInExam: string[];
  onClose: () => void;
  onConfirm: (questionIds: string[]) => void;
}

const DIFFICULTIES: Array<Difficulty | 'all'> = ['all', 'Easy', 'Medium', 'Hard'];
const TYPES: Array<QuestionType | 'all'> = ['all', 'Recall', 'Conceptual', 'Analytical', 'Application'];

export function BankPickerModal({ open, trackId, alreadyInExam, onClose, onConfirm }: Props) {
  const tracks = useTracks();
  const questions = useQuestionsStore((s) => s.questions);

  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [chapterFilter, setChapterFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const track = tracks.find((t) => t.id === trackId);

  // Topic → location lookup, scoped to this track only
  const trackTopicIds = useMemo(() => {
    if (!track) return new Set<string>();
    const ids = new Set<string>();
    for (const subj of track.subjects) {
      if (subj.archivedAt) continue;
      for (const ch of subj.chapters) {
        if (ch.archivedAt) continue;
        for (const tp of ch.topics) {
          if (tp.archivedAt) continue;
          ids.add(tp.id);
        }
      }
    }
    return ids;
  }, [track]);

  const topicLookup = useMemo(() => {
    const map = new Map<
      string,
      { topicName: string; chapterName: string; subjectName: string; subjectId: string; chapterId: string }
    >();
    if (!track) return map;
    for (const subj of track.subjects) {
      for (const ch of subj.chapters) {
        for (const tp of ch.topics) {
          map.set(tp.id, {
            topicName: tp.name,
            chapterName: ch.name,
            subjectName: subj.name,
            subjectId: subj.id,
            chapterId: ch.id,
          });
        }
      }
    }
    return map;
  }, [track]);

  // Cascading filter options (track-scoped)
  const subjects = (track?.subjects ?? []).filter((s) => !s.archivedAt);
  const chapters = useMemo(() => {
    if (subjectFilter === 'all') return subjects.flatMap((s) => s.chapters.filter((c) => !c.archivedAt));
    const subj = subjects.find((s) => s.id === subjectFilter);
    return subj?.chapters.filter((c) => !c.archivedAt) ?? [];
  }, [subjectFilter, subjects]);
  const topics = useMemo(() => {
    if (chapterFilter === 'all') return chapters.flatMap((c) => c.topics.filter((t) => !t.archivedAt));
    const ch = chapters.find((c) => c.id === chapterFilter);
    return ch?.topics.filter((t) => !t.archivedAt) ?? [];
  }, [chapterFilter, chapters]);

  const alreadySet = useMemo(() => new Set(alreadyInExam), [alreadyInExam]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return questions.filter((qn) => {
      if (qn.archivedAt) return false;
      if (!trackTopicIds.has(qn.topicId)) return false;
      const loc = topicLookup.get(qn.topicId);
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
  }, [questions, trackTopicIds, topicLookup, query, subjectFilter, chapterFilter, topicFilter, difficultyFilter, typeFilter]);

  function toggle(id: string) {
    if (alreadySet.has(id)) return;
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function handleConfirm() {
    if (selected.size === 0) return;
    onConfirm([...selected]);
    setSelected(new Set());
    setQuery('');
    setSubjectFilter('all');
    setChapterFilter('all');
    setTopicFilter('all');
    setDifficultyFilter('all');
    setTypeFilter('all');
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Pick from question bank · ${track?.name ?? 'track'}`}
      description="Filters are locked to this exam's track — questions outside it won't appear. Select as many as you need."
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={selected.size === 0}
            onClick={handleConfirm}
            leftIcon={<Check className="w-3.5 h-3.5" />}
          >
            Add {selected.size > 0 ? selected.size : ''} {selected.size === 1 ? 'question' : 'questions'}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stem, solution, topic name…"
            className="w-full h-9 pl-10 pr-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Select
            label="Subject"
            value={subjectFilter}
            onChange={(v) => {
              setSubjectFilter(v);
              setChapterFilter('all');
              setTopicFilter('all');
            }}
            options={[
              { value: 'all', label: 'All subjects' },
              ...subjects.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />
          <Select
            label="Chapter"
            value={chapterFilter}
            onChange={(v) => {
              setChapterFilter(v);
              setTopicFilter('all');
            }}
            options={[
              { value: 'all', label: 'All chapters' },
              ...chapters.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
          <Select
            label="Topic"
            value={topicFilter}
            onChange={setTopicFilter}
            options={[
              { value: 'all', label: 'All topics' },
              ...topics.map((t) => ({ value: t.id, label: t.name })),
            ]}
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs">
          <Pills label="Difficulty" value={difficultyFilter} options={DIFFICULTIES} onChange={(v) => setDifficultyFilter(v as Difficulty | 'all')} />
          <Pills label="Type" value={typeFilter} options={TYPES} onChange={(v) => setTypeFilter(v as QuestionType | 'all')} />
        </div>

        <div className="text-xs text-slate-500">
          {filtered.length} matching · {selected.size} selected
        </div>

        <div className="border border-slate-200 rounded-md max-h-[420px] overflow-y-auto divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">
              No questions match these filters under {track?.name ?? 'this track'}.
            </div>
          ) : (
            filtered.map((q) => (
              <PickRow
                key={q.id}
                question={q}
                isSelected={selected.has(q.id)}
                isAlreadyAdded={alreadySet.has(q.id)}
                location={topicLookup.get(q.topicId)}
                onToggle={() => toggle(q.id)}
              />
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}

function PickRow({
  question,
  isSelected,
  isAlreadyAdded,
  location,
  onToggle,
}: {
  question: Question;
  isSelected: boolean;
  isAlreadyAdded: boolean;
  location?: { topicName: string; chapterName: string; subjectName: string };
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isAlreadyAdded}
      className={cn(
        'w-full text-left px-3 py-2.5 flex items-start gap-3 transition-colors focus-ring',
        isAlreadyAdded
          ? 'bg-slate-50 opacity-60 cursor-not-allowed'
          : isSelected
          ? 'bg-amber-50/60 hover:bg-amber-50'
          : 'hover:bg-slate-50'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center',
          isAlreadyAdded
            ? 'bg-slate-300 border-slate-300'
            : isSelected
            ? 'bg-amber-600 border-amber-600'
            : 'border-slate-300'
        )}
      >
        {(isSelected || isAlreadyAdded) && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-1">
          <DifficultyBadge difficulty={question.difficulty} />
          <TypeBadge type={question.type} />
          <Badge tone="neutral">{question.format === 'mcq' ? 'MCQ' : 'Numerical'}</Badge>
          {isAlreadyAdded && <Badge tone="neutral">Already added</Badge>}
        </div>
        <p className="text-sm text-slate-900 line-clamp-2">{question.stem}</p>
        {location && (
          <p className="text-[11px] text-slate-500 mt-1 truncate">
            {location.subjectName} <span className="text-slate-300">›</span>{' '}
            {location.chapterName} <span className="text-slate-300">›</span>{' '}
            <span className="text-slate-700 font-medium">{location.topicName}</span>
          </p>
        )}
      </div>
    </button>
  );
}

function Select({
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

function Pills({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
        {label}:
      </span>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
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
