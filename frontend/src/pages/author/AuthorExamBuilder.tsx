import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  Wrench,
  Save,
  Hash,
  Clock,
  Compass,
  ListPlus,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, DifficultyBadge, TypeBadge } from '@/components/ui/Badge';
import { useTracks } from '@/store/hierarchyStore';
import { useActiveFormats } from '@/store/formatsStore';
import { useExamsStore, useExamById, type ExamDraft } from '@/store/examsStore';
import { useQuestionsStore } from '@/store/questionsStore';
import { useAuthUser } from '@/store/authStore';
import { QuestionFormModal } from './QuestionFormModal';
import { BankPickerModal } from './BankPickerModal';
import type { Question, MarkingPoints } from '@/types';
import { cn } from '@/lib/cn';

function fmtSigned(n: number): string {
  if (n > 0) return `+${trimNum(n)}`;
  if (n < 0) return `−${trimNum(Math.abs(n))}`;
  return '0';
}
function trimNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
}

export function AuthorExamBuilder() {
  const { examId } = useParams<{ examId: string }>();
  const isEdit = !!examId;
  const existing = useExamById(examId);
  const navigate = useNavigate();

  const tracks = useTracks();
  const formats = useActiveFormats();
  const user = useAuthUser();
  const addExam = useExamsStore((s) => s.addExam);
  const updateExam = useExamsStore((s) => s.updateExam);
  const addQuestionsToExam = useExamsStore((s) => s.addQuestionsToExam);
  const removeQuestionFromExam = useExamsStore((s) => s.removeQuestionFromExam);
  const reorderQuestionInExam = useExamsStore((s) => s.reorderQuestionInExam);
  const addQuestion = useQuestionsStore((s) => s.addQuestion);
  const allQuestions = useQuestionsStore((s) => s.questions);

  // Local form state — initialized from existing exam (edit) or defaults (create).
  const [trackId, setTrackId] = useState<string>(existing?.trackId ?? tracks[0]?.id ?? '');
  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [source, setSource] = useState<'pattern' | 'custom'>(
    existing ? (existing.paperPatternId ? 'pattern' : 'custom') : 'pattern'
  );
  const [paperPatternId, setPaperPatternId] = useState<string>(
    existing?.paperPatternId ?? formats[0]?.id ?? ''
  );

  const [customDuration, setCustomDuration] = useState<number>(existing?.customDurationMinutes ?? 60);
  const [customTotal, setCustomTotal] = useState<number>(existing?.customTotalQuestions ?? 0);
  const [mcqCorrect, setMcqCorrect] = useState<number>(existing?.customMarkingMcq?.correct ?? 4);
  const [mcqWrong, setMcqWrong] = useState<number>(existing?.customMarkingMcq?.wrong ?? -1);
  const [hasNumerical, setHasNumerical] = useState<boolean>(
    existing ? !!existing.customMarkingNumerical : false
  );
  const [numCorrect, setNumCorrect] = useState<number>(existing?.customMarkingNumerical?.correct ?? 4);
  const [numWrong, setNumWrong] = useState<number>(existing?.customMarkingNumerical?.wrong ?? 0);

  // For create mode, we hold a local question list until first save.
  // For edit mode, we mutate the persisted exam directly so reorder/remove
  // is reflected instantly across the app.
  const [draftQuestionIds, setDraftQuestionIds] = useState<string[]>(existing?.questionIds ?? []);

  const [newQuestionOpen, setNewQuestionOpen] = useState(false);
  const [bankPickerOpen, setBankPickerOpen] = useState(false);

  // Sync draft list with persisted state when in edit mode (so audit-log
  // mutations from elsewhere reflect here too — and so reorder/remove
  // updates don't desync).
  useEffect(() => {
    if (isEdit && existing) {
      setDraftQuestionIds(existing.questionIds);
    }
  }, [isEdit, existing]);

  if (isEdit && !existing) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <p className="text-slate-600">Exam not found.</p>
        <Link to="/author/exam/list" className="text-amber-700 hover:underline">
          Back to Exams
        </Link>
      </div>
    );
  }

  const activeTrack = tracks.find((t) => t.id === trackId);
  const activePattern = formats.find((f) => f.id === paperPatternId);

  const expectedTotal =
    source === 'pattern'
      ? activePattern?.totalQuestions ?? 0
      : customTotal;
  const lockedDuration =
    source === 'pattern' ? activePattern?.durationMinutes ?? 0 : customDuration;
  const lockedMcq: MarkingPoints =
    source === 'pattern' && activePattern
      ? activePattern.markingMcq
      : { correct: mcqCorrect, wrong: mcqWrong };
  const lockedNumerical: MarkingPoints | null =
    source === 'pattern' && activePattern
      ? activePattern.markingNumerical
      : hasNumerical
      ? { correct: numCorrect, wrong: numWrong }
      : null;

  const trimmedName = name.trim();
  const validBasics = !!trackId && trimmedName.length > 0;
  const validSource =
    source === 'pattern'
      ? !!paperPatternId
      : customDuration > 0 && customTotal >= 0;
  const questionCountOk =
    expectedTotal === 0 || draftQuestionIds.length === expectedTotal;
  const valid = validBasics && validSource && questionCountOk;

  const questionsById = useMemo(
    () => new Map(allQuestions.map((q) => [q.id, q])),
    [allQuestions]
  );

  function addQuestionsLocal(ids: string[]) {
    if (isEdit && existing) {
      addQuestionsToExam(existing.id, ids);
    } else {
      setDraftQuestionIds((prev) => {
        const fresh = ids.filter((id) => !prev.includes(id));
        return [...prev, ...fresh];
      });
    }
  }

  function removeQuestionLocal(id: string) {
    if (isEdit && existing) {
      removeQuestionFromExam(existing.id, id);
    } else {
      setDraftQuestionIds((prev) => prev.filter((q) => q !== id));
    }
  }

  function reorderQuestionLocal(id: string, dir: 'up' | 'down') {
    if (isEdit && existing) {
      reorderQuestionInExam(existing.id, id, dir);
    } else {
      setDraftQuestionIds((prev) => {
        const idx = prev.indexOf(id);
        if (idx < 0) return prev;
        const target = dir === 'up' ? idx - 1 : idx + 1;
        if (target < 0 || target >= prev.length) return prev;
        const next = [...prev];
        [next[idx], next[target]] = [next[target], next[idx]];
        return next;
      });
    }
  }

  function handleSave() {
    if (!valid) return;
    const draft: ExamDraft = {
      trackId,
      name: trimmedName,
      description: description.trim() || undefined,
      paperPatternId: source === 'pattern' ? paperPatternId : null,
      customDurationMinutes: source === 'custom' ? customDuration : undefined,
      customTotalQuestions: source === 'custom' ? customTotal : undefined,
      customMarkingMcq: source === 'custom' ? { correct: mcqCorrect, wrong: mcqWrong } : undefined,
      customMarkingNumerical:
        source === 'custom'
          ? hasNumerical
            ? { correct: numCorrect, wrong: numWrong }
            : null
          : undefined,
      questionIds: draftQuestionIds,
      createdBy: user?.id,
    };

    if (isEdit && existing) {
      updateExam(existing.id, draft);
      navigate('/author/exam/list');
    } else {
      addExam(draft);
      navigate('/author/exam/list');
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
      <Link
        to="/author/exam/list"
        className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5 focus-ring rounded px-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Exams
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          {isEdit ? `Edit "${existing?.name}"` : 'Create a new exam'}
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-prose">
          Pick a Track, choose a Paper Pattern (or go custom), then add questions — write new ones inline or pick from the bank. Students get auto-graded on submit.
        </p>
      </div>

      {/* ─── Section 1: Basics ─── */}
      <Card padding="lg" className="space-y-4">
        <SectionHeader number={1} icon={<Compass className="w-4 h-4" />} title="Basics" />

        <Field label="Track" required>
          <select
            value={trackId}
            onChange={(e) => {
              setTrackId(e.target.value);
              if (!isEdit) setDraftQuestionIds([]); // questions are track-scoped
            }}
            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500"
          >
            {tracks.filter((t) => !t.archivedAt).map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          {activeTrack && draftQuestionIds.length > 0 && isEdit && (
            <p className="text-[11px] text-amber-700 mt-1">
              Changing track may make existing questions unselectable in the bank picker.
            </p>
          )}
        </Field>

        <Field label="Exam name" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. JEE Main Mock #3, NEET Practice Paper Aug 2026"
            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Anything students should know before starting — coverage, difficulty, intended audience."
            rows={2}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500 resize-none"
          />
        </Field>
      </Card>

      {/* ─── Section 2: Source ─── */}
      <Card padding="lg" className="space-y-4">
        <SectionHeader number={2} icon={<Layers className="w-4 h-4" />} title="Source" />
        <p className="text-xs text-slate-600 -mt-2">
          A pattern locks duration, Q-count, and marking. Custom lets you set them per-exam.
        </p>

        <div className="grid sm:grid-cols-2 gap-2">
          <SourceCard
            icon={<Layers className="w-4 h-4" />}
            label="Use a paper pattern"
            hint="JEE Main, NEET, or any custom pattern. Settings lock to the pattern."
            active={source === 'pattern'}
            onClick={() => setSource('pattern')}
          />
          <SourceCard
            icon={<Wrench className="w-4 h-4" />}
            label="Custom"
            hint="Set duration / Q-count / marking yourself for this exam."
            active={source === 'custom'}
            onClick={() => setSource('custom')}
          />
        </div>

        {source === 'pattern' ? (
          <div>
            <Field label="Paper pattern" required>
              <select
                value={paperPatternId}
                onChange={(e) => setPaperPatternId(e.target.value)}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500"
              >
                {formats.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} {f.isSystem ? '(system)' : '(custom)'}
                  </option>
                ))}
              </select>
            </Field>
            {activePattern && (
              <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 space-y-1">
                <div className="font-mono">
                  {activePattern.totalQuestions > 0
                    ? `${activePattern.totalQuestions} Q`
                    : 'flexible Q-count'}
                  {' · '}
                  {activePattern.durationMinutes} min
                  {' · '}
                  MCQ {fmtSigned(activePattern.markingMcq.correct)}/{fmtSigned(activePattern.markingMcq.wrong)}
                  {activePattern.markingNumerical
                    ? ` · Num ${fmtSigned(activePattern.markingNumerical.correct)}/${fmtSigned(activePattern.markingNumerical.wrong)}`
                    : ' · no numerical'}
                </div>
                <p className="text-slate-500">
                  These values are locked. Edit the pattern itself in <Link to="/author/exam/patterns" className="text-amber-700 hover:underline">Paper Patterns</Link> if you need to change them.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Duration (minutes)" required>
                <input
                  type="number"
                  min={1}
                  max={600}
                  value={customDuration}
                  onChange={(e) => setCustomDuration(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500 font-mono"
                />
              </Field>
              <Field label="Total questions (0 = flexible)">
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={customTotal}
                  onChange={(e) => setCustomTotal(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500 font-mono"
                />
              </Field>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-2">
                MCQ marking
              </label>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Correct (points)">
                  <input
                    type="number"
                    step="0.5"
                    value={mcqCorrect}
                    onChange={(e) => setMcqCorrect(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500 font-mono"
                  />
                </Field>
                <Field label="Wrong (penalty, use negative)">
                  <input
                    type="number"
                    step="0.25"
                    value={mcqWrong}
                    onChange={(e) => setMcqWrong(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500 font-mono"
                  />
                </Field>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasNumerical}
                onChange={(e) => setHasNumerical(e.target.checked)}
                className="w-4 h-4 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
                This exam includes numerical questions
              </span>
            </label>
            {hasNumerical && (
              <div className="grid sm:grid-cols-2 gap-3 pl-6">
                <Field label="Numerical correct (points)">
                  <input
                    type="number"
                    step="0.5"
                    value={numCorrect}
                    onChange={(e) => setNumCorrect(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500 font-mono"
                  />
                </Field>
                <Field label="Numerical wrong (penalty)">
                  <input
                    type="number"
                    step="0.25"
                    value={numWrong}
                    onChange={(e) => setNumWrong(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500 font-mono"
                  />
                </Field>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ─── Section 3: Questions ─── */}
      <Card padding="lg" className="space-y-4">
        <SectionHeader
          number={3}
          icon={<ListPlus className="w-4 h-4" />}
          title="Questions"
          right={
            <span className="text-xs font-mono tabular-nums text-slate-600">
              {draftQuestionIds.length}
              {expectedTotal > 0 && ` / ${expectedTotal}`}
            </span>
          }
        />

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            onClick={() => setNewQuestionOpen(true)}
            disabled={!validBasics}
            title={!validBasics ? 'Pick a track + name first' : undefined}
          >
            Write new question
          </Button>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setBankPickerOpen(true)}
            disabled={!validBasics}
            title={!validBasics ? 'Pick a track + name first' : undefined}
          >
            Pick from bank
          </Button>
          <span className="text-[11px] text-slate-500 ml-1">
            New questions you write here also land in the global question bank for reuse.
          </span>
        </div>

        {expectedTotal > 0 && draftQuestionIds.length !== expectedTotal && (
          <div className="flex items-start gap-2 text-xs bg-amber-50 border border-amber-200 rounded-md p-2.5 text-amber-900">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              The pattern requires <strong>{expectedTotal}</strong> questions. You have{' '}
              <strong>{draftQuestionIds.length}</strong>. Save will be disabled until they match.
            </span>
          </div>
        )}

        <div className="space-y-1.5">
          {draftQuestionIds.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-500 italic border border-dashed border-slate-300 rounded-md">
              No questions added yet.
            </div>
          ) : (
            draftQuestionIds.map((id, idx) => (
              <QuestionRow
                key={id}
                index={idx + 1}
                question={questionsById.get(id)}
                isFirst={idx === 0}
                isLast={idx === draftQuestionIds.length - 1}
                onMoveUp={() => reorderQuestionLocal(id, 'up')}
                onMoveDown={() => reorderQuestionLocal(id, 'down')}
                onRemove={() => removeQuestionLocal(id)}
              />
            ))
          )}
        </div>
      </Card>

      {/* ─── Save bar ─── */}
      <div className="sticky bottom-4 z-10">
        <Card className="shadow-xl">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm">
              <div className="font-semibold text-slate-900">
                {isEdit ? 'Save your changes' : 'Ready to create the exam?'}
              </div>
              <div className="text-xs text-slate-600 mt-0.5 inline-flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {draftQuestionIds.length}
                  {expectedTotal > 0 && ` / ${expectedTotal}`}
                </span>
                {lockedDuration > 0 && (
                  <>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {lockedDuration} min
                    </span>
                  </>
                )}
                <span className="text-slate-300">·</span>
                <span className="font-mono text-[11px]">
                  MCQ {fmtSigned(lockedMcq.correct)}/{fmtSigned(lockedMcq.wrong)}
                  {lockedNumerical
                    ? ` · Num ${fmtSigned(lockedNumerical.correct)}/${fmtSigned(lockedNumerical.wrong)}`
                    : ''}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => navigate('/author/exam/list')}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!valid}
                leftIcon={<Save className="w-4 h-4" />}
              >
                {isEdit ? 'Save changes' : 'Create exam'}
              </Button>
            </div>
          </div>
          {!valid && (
            <ul className="mt-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded p-2 space-y-0.5">
              {!validBasics && <li>· Pick a track and exam name</li>}
              {!validSource && <li>· Pick a paper pattern (or set custom duration)</li>}
              {validBasics && validSource && !questionCountOk && (
                <li>· Question count must match the pattern's required total</li>
              )}
            </ul>
          )}
        </Card>
      </div>

      {newQuestionOpen && activeTrack && (
        <QuestionFormModal
          open
          mode="create"
          onClose={() => setNewQuestionOpen(false)}
          onSave={(draft) => {
            const newId = addQuestion(draft);
            addQuestionsLocal([newId]);
            setNewQuestionOpen(false);
          }}
        />
      )}

      {bankPickerOpen && activeTrack && (
        <BankPickerModal
          open
          trackId={trackId}
          alreadyInExam={draftQuestionIds}
          onClose={() => setBankPickerOpen(false)}
          onConfirm={(ids) => {
            addQuestionsLocal(ids);
            setBankPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}

function SectionHeader({
  number,
  icon,
  title,
  right,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 justify-between">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 inline-flex items-center justify-center text-xs font-bold">
          {number}
        </div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700 inline-flex items-center gap-1.5">
          {icon}
          {title}
        </h2>
      </div>
      {right}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-600 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}

function SourceCard({
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

function QuestionRow({
  index,
  question,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  index: number;
  question: Question | undefined;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  if (!question) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 rounded-md border border-dashed border-amber-300 bg-amber-50/40">
        <span className="text-xs font-mono text-slate-500 w-7">{index}.</span>
        <span className="flex-1 text-xs text-amber-800 italic">
          Question deleted or archived — remove it from this exam.
        </span>
        <button
          onClick={onRemove}
          className="w-7 h-7 inline-flex items-center justify-center rounded text-slate-500 hover:text-red-700 hover:bg-red-50 focus-ring"
          title="Remove"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-md border border-slate-200 bg-white hover:bg-slate-50">
      <span className="text-xs font-mono text-slate-500 w-7 flex-shrink-0">{index}.</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
          <DifficultyBadge difficulty={question.difficulty} />
          <TypeBadge type={question.type} />
          <Badge tone="neutral">{question.format === 'mcq' ? 'MCQ' : 'Numerical'}</Badge>
        </div>
        <p className="text-sm text-slate-800 line-clamp-1">{question.stem}</p>
      </div>
      <div className="flex items-center gap-0.5 flex-shrink-0">
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="w-7 h-7 inline-flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 focus-ring"
          title="Move up"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="w-7 h-7 inline-flex items-center justify-center rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 focus-ring"
          title="Move down"
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onRemove}
          className="w-7 h-7 inline-flex items-center justify-center rounded text-slate-500 hover:text-red-700 hover:bg-red-50 focus-ring"
          title="Remove"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
