import { useState, useMemo, useEffect, useRef } from 'react';
import { Image as ImageIcon, X, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useTracks } from '@/store/hierarchyStore';
import type { Question, Difficulty, QuestionType, AnswerFormat } from '@/types';
import type { QuestionDraft } from '@/store/questionsStore';
import { cn } from '@/lib/cn';

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const TYPES: QuestionType[] = ['Recall', 'Conceptual', 'Analytical', 'Application'];
const FORMATS: { value: AnswerFormat; label: string; help: string }[] = [
  { value: 'mcq', label: 'MCQ (single-correct)', help: '4 options, one is correct' },
  { value: 'numerical', label: 'Numerical / fill-in-the-blank', help: 'Student types a number' },
];

const MAX_IMAGE_BYTES = 200 * 1024; // 200 KB warning threshold (bigger images bloat localStorage)

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  existing?: Question;
  onClose: () => void;
  onSave: (draft: QuestionDraft) => void;
}

export function QuestionFormModal({ open, mode, existing, onClose, onSave }: Props) {
  const tracks = useTracks();

  // ─── Cascading topic-picker state ─────────────────────────────────────
  // We resolve initial cascade from the existing question's topicId by
  // walking the tree backwards.

  const initialContext = useMemo(() => {
    if (!existing) return { trackId: tracks[0]?.id ?? '', subjectId: '', chapterId: '', topicId: '', subtopicId: undefined as string | undefined };
    for (const track of tracks) {
      for (const subj of track.subjects) {
        for (const ch of subj.chapters) {
          const topic = ch.topics.find((t) => t.id === existing.topicId);
          if (topic) {
            return {
              trackId: track.id,
              subjectId: subj.id,
              chapterId: ch.id,
              topicId: topic.id,
              subtopicId: existing.subtopicId,
            };
          }
        }
      }
    }
    return { trackId: tracks[0]?.id ?? '', subjectId: '', chapterId: '', topicId: '', subtopicId: undefined };
  }, [existing, tracks]);

  // Editable fields
  const [trackId, setTrackId] = useState(initialContext.trackId);
  const [subjectId, setSubjectId] = useState(initialContext.subjectId);
  const [chapterId, setChapterId] = useState(initialContext.chapterId);
  const [topicId, setTopicId] = useState(initialContext.topicId);
  const [subtopicId, setSubtopicId] = useState<string | undefined>(initialContext.subtopicId);

  const [stem, setStem] = useState(existing?.stem ?? '');
  const [format, setFormat] = useState<AnswerFormat>(existing?.format ?? 'mcq');
  const [difficulty, setDifficulty] = useState<Difficulty>(existing?.difficulty ?? 'Medium');
  const [qType, setQType] = useState<QuestionType>(existing?.type ?? 'Conceptual');
  const [options, setOptions] = useState<string[]>(
    existing?.options ?? ['', '', '', '']
  );
  const [correctOption, setCorrectOption] = useState<number>(
    existing && existing.format === 'mcq' && typeof existing.correctAnswer !== 'undefined'
      ? Number(existing.correctAnswer)
      : 0
  );
  const [numericAnswer, setNumericAnswer] = useState<string>(
    existing && existing.format === 'numerical' ? String(existing.correctAnswer) : ''
  );
  const [solution, setSolution] = useState(existing?.solution ?? '');
  const [estimatedTime, setEstimatedTime] = useState<string>(
    existing?.estimatedTimeSeconds ? String(existing.estimatedTimeSeconds) : ''
  );
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(existing?.imageDataUrl);
  const [imageError, setImageError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset all fields when the modal goes from closed → open with new context.
  useEffect(() => {
    if (!open) return;
    setTrackId(initialContext.trackId);
    setSubjectId(initialContext.subjectId);
    setChapterId(initialContext.chapterId);
    setTopicId(initialContext.topicId);
    setSubtopicId(initialContext.subtopicId);
    setStem(existing?.stem ?? '');
    setFormat(existing?.format ?? 'mcq');
    setDifficulty(existing?.difficulty ?? 'Medium');
    setQType(existing?.type ?? 'Conceptual');
    setOptions(existing?.options ?? ['', '', '', '']);
    setCorrectOption(
      existing && existing.format === 'mcq' && typeof existing.correctAnswer !== 'undefined'
        ? Number(existing.correctAnswer)
        : 0
    );
    setNumericAnswer(
      existing && existing.format === 'numerical' ? String(existing.correctAnswer) : ''
    );
    setSolution(existing?.solution ?? '');
    setEstimatedTime(existing?.estimatedTimeSeconds ? String(existing.estimatedTimeSeconds) : '');
    setImageDataUrl(existing?.imageDataUrl);
    setImageError(null);
    setShowPreview(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Cascading dropdowns: when an upstream changes, snap downstream to first valid.
  const activeTrack = tracks.find((t) => t.id === trackId);
  const subjects = activeTrack?.subjects.filter((s) => !s.archivedAt) ?? [];
  const activeSubject = subjects.find((s) => s.id === subjectId);
  const chapters = activeSubject?.chapters.filter((c) => !c.archivedAt) ?? [];
  const activeChapter = chapters.find((c) => c.id === chapterId);
  const topics = activeChapter?.topics.filter((t) => !t.archivedAt) ?? [];
  const activeTopic = topics.find((t) => t.id === topicId);
  const subtopics = activeTopic?.subtopics.filter((s) => !s.archivedAt) ?? [];

  // Snap stale references when their parent disappears
  useEffect(() => { if (subjects.length && !activeSubject) setSubjectId(subjects[0].id); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [trackId]);
  useEffect(() => { if (chapters.length && !activeChapter) setChapterId(chapters[0].id); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [subjectId]);
  useEffect(() => { if (topics.length && !activeTopic) setTopicId(topics[0].id); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [chapterId]);
  useEffect(() => { if (!subtopics.find((s) => s.id === subtopicId)) setSubtopicId(undefined); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [topicId]);

  // ─── Image upload ─────────────────────────────────────────────────────

  function handleImageFile(file: File) {
    setImageError(null);
    if (!file.type.startsWith('image/')) {
      setImageError('Please select an image file (PNG, JPG, SVG, GIF).');
      return;
    }
    if (file.size > 1024 * 1024) {
      setImageError('Image is over 1 MB — too large for prototype storage. Compress and try again.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageDataUrl(dataUrl);
      if (file.size > MAX_IMAGE_BYTES) {
        setImageError(
          `Image is ${(file.size / 1024).toFixed(0)} KB — over the recommended 200 KB. Will work but slows local-storage saves. Production storage = S3/CDN URL, not base64.`
        );
      }
    };
    reader.onerror = () => setImageError('Failed to read the file.');
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImageDataUrl(undefined);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // ─── Validation ───────────────────────────────────────────────────────

  const trimmedStem = stem.trim();
  const trimmedSolution = solution.trim();
  const trimmedOptions = options.map((o) => o.trim());

  const validations = {
    topic: !!activeTopic,
    stem: trimmedStem.length >= 5,
    solution: trimmedSolution.length >= 5,
    answer:
      format === 'mcq'
        ? trimmedOptions.every((o) => o.length > 0) &&
          correctOption >= 0 &&
          correctOption < 4
        : numericAnswer.trim() !== '' && !Number.isNaN(parseFloat(numericAnswer)),
  };
  const valid = Object.values(validations).every(Boolean);

  function handleSubmit() {
    if (!valid || !activeTopic) return;
    const draft: QuestionDraft = {
      topicId: activeTopic.id,
      subtopicId,
      difficulty,
      type: qType,
      format,
      stem: trimmedStem,
      options: format === 'mcq' ? trimmedOptions : undefined,
      correctAnswer:
        format === 'mcq' ? correctOption : parseFloat(numericAnswer),
      solution: trimmedSolution,
      estimatedTimeSeconds: estimatedTime ? Number(estimatedTime) : undefined,
      imageDataUrl,
    };
    onSave(draft);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'New question' : `Edit question ${existing?.id ?? ''}`}
      description={
        mode === 'create'
          ? 'Author a question from scratch. Tags + topic + solution are required so the adaptive engine and reports surface it correctly.'
          : undefined
      }
      size="lg"
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview((v) => !v)}
            leftIcon={showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          >
            {showPreview ? 'Hide preview' : 'Preview'}
          </Button>
          <div className="flex-1" />
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!valid}
            title={!valid ? 'Fill all required fields first' : undefined}
          >
            {mode === 'create' ? 'Create question' : 'Save changes'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {showPreview && (
          <QuestionPreview
            stem={trimmedStem || '(no stem yet)'}
            format={format}
            options={trimmedOptions}
            correctOption={correctOption}
            numericAnswer={numericAnswer}
            solution={trimmedSolution || '(no solution yet)'}
            difficulty={difficulty}
            qType={qType}
            imageDataUrl={imageDataUrl}
          />
        )}

        {/* ─── Cascading topic picker ─── */}
        <Section title="Where does this question live?">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Track" required>
              <Select value={trackId} onChange={setTrackId}>
                {tracks.filter((t) => !t.archivedAt).map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Subject" required>
              <Select value={subjectId} onChange={setSubjectId} disabled={subjects.length === 0}>
                {subjects.length === 0 && <option value="">— no subjects —</option>}
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Chapter" required>
              <Select value={chapterId} onChange={setChapterId} disabled={chapters.length === 0}>
                {chapters.length === 0 && <option value="">— no chapters —</option>}
                {chapters.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} (Class {c.classLevel})</option>
                ))}
              </Select>
            </Field>
            <Field label="Topic" required>
              <Select value={topicId} onChange={setTopicId} disabled={topics.length === 0}>
                {topics.length === 0 && <option value="">— no topics —</option>}
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Select>
            </Field>
            <Field label="Subtopic (optional)">
              <Select
                value={subtopicId ?? ''}
                onChange={(v) => setSubtopicId(v || undefined)}
                disabled={subtopics.length === 0}
              >
                <option value="">— topic level —</option>
                {subtopics.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Select>
            </Field>
          </div>
        </Section>

        {/* ─── Tags ─── */}
        <Section title="Intrinsic tags (drive the heatmap + adaptive engine)">
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Difficulty" required>
              <PillGroup value={difficulty} options={DIFFICULTIES} onChange={(v) => setDifficulty(v as Difficulty)} />
            </Field>
            <Field label="Cognitive type" required>
              <PillGroup value={qType} options={TYPES} onChange={(v) => setQType(v as QuestionType)} />
            </Field>
            <Field label="Estimated solve time (sec, optional)">
              <input
                type="number"
                min={0}
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="e.g. 90"
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500 font-mono"
              />
            </Field>
          </div>
        </Section>

        {/* ─── Stem + image ─── */}
        <Section title="Question stem">
          <Field label="Stem text" required>
            <textarea
              value={stem}
              onChange={(e) => setStem(e.target.value)}
              placeholder="Write the question text. Plain text (LaTeX rendering lands later)."
              rows={4}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500 resize-y"
            />
          </Field>

          <Field label="Image / diagram (optional)">
            {imageDataUrl ? (
              <div className="space-y-2">
                <div className="relative inline-block border border-slate-200 rounded-md overflow-hidden bg-slate-50">
                  <img src={imageDataUrl} alt="Question diagram" className="max-h-48 max-w-full block" />
                  <button
                    onClick={clearImage}
                    className="absolute top-1 right-1 w-7 h-7 bg-white rounded-full shadow-md inline-flex items-center justify-center text-slate-700 hover:text-red-700 hover:bg-red-50 focus-ring"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-900 inline-flex items-center gap-1"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  Replace
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-300 hover:border-amber-400 rounded-md p-4 inline-flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-amber-800 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                Upload diagram (≤200 KB recommended)
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageFile(file);
              }}
            />
            {imageError && (
              <div className="mt-2 flex items-start gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{imageError}</span>
              </div>
            )}
          </Field>
        </Section>

        {/* ─── Format + answer ─── */}
        <Section title="Answer">
          <Field label="Answer format" required>
            <div className="grid sm:grid-cols-2 gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFormat(f.value)}
                  className={cn(
                    'text-left rounded-md border-2 p-3 transition-all focus-ring',
                    format === f.value
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-slate-200 bg-white hover:border-amber-300'
                  )}
                >
                  <div className="text-sm font-semibold text-slate-900">{f.label}</div>
                  <div className="text-xs text-slate-600 mt-0.5">{f.help}</div>
                </button>
              ))}
            </div>
          </Field>

          {format === 'mcq' ? (
            <Field label="Options (mark the correct one)" required>
              <div className="space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct-option"
                      checked={correctOption === idx}
                      onChange={() => setCorrectOption(idx)}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                      aria-label={`Mark option ${String.fromCharCode(65 + idx)} as correct`}
                    />
                    <span className="font-mono text-xs font-bold text-slate-500 w-5">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const next = [...options];
                        next[idx] = e.target.value;
                        setOptions(next);
                      }}
                      placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                      className={cn(
                        'flex-1 h-10 px-3 bg-white border rounded-md text-sm focus-ring focus:border-amber-500',
                        correctOption === idx ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-300'
                      )}
                    />
                  </div>
                ))}
              </div>
            </Field>
          ) : (
            <Field label="Correct numerical answer" required>
              <input
                type="number"
                step="any"
                value={numericAnswer}
                onChange={(e) => setNumericAnswer(e.target.value)}
                placeholder="e.g. 42 or 1.5"
                className="w-full h-12 px-3 bg-white border border-slate-300 rounded-md text-base font-mono font-semibold focus-ring focus:border-amber-500"
              />
            </Field>
          )}
        </Section>

        {/* ─── Solution ─── */}
        <Section title="Worked solution">
          <Field label="Solution" required>
            <textarea
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Step-by-step working. Shown to students after they submit."
              rows={4}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500 resize-y"
            />
          </Field>
        </Section>

        {/* ─── Validation summary ─── */}
        {!valid && (
          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3">
            <div className="font-semibold mb-1">Before saving, fix:</div>
            <ul className="list-disc list-inside space-y-0.5">
              {!validations.topic && <li>Pick a topic (track → subject → chapter → topic)</li>}
              {!validations.stem && <li>Stem must be at least 5 characters</li>}
              {!validations.answer && (
                <li>
                  {format === 'mcq'
                    ? 'All four options must be filled and one marked correct'
                    : 'Correct numerical answer required'}
                </li>
              )}
              {!validations.solution && <li>Solution must be at least 5 characters</li>}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Small subcomponents ──────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">{title}</h3>
      {children}
    </section>
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

function Select({
  value,
  onChange,
  disabled,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        'w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500',
        disabled && 'bg-slate-50 text-slate-400 cursor-not-allowed'
      )}
    >
      {children}
    </select>
  );
}

function PillGroup({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex flex-wrap gap-1 bg-slate-100 rounded-md p-0.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            'px-2.5 h-8 rounded text-xs font-semibold transition-all focus-ring',
            value === opt ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Live preview ────────────────────────────────────────────────────────

function QuestionPreview({
  stem,
  format,
  options,
  correctOption,
  numericAnswer,
  solution,
  difficulty,
  qType,
  imageDataUrl,
}: {
  stem: string;
  format: AnswerFormat;
  options: string[];
  correctOption: number;
  numericAnswer: string;
  solution: string;
  difficulty: Difficulty;
  qType: QuestionType;
  imageDataUrl?: string;
}) {
  return (
    <div className="border border-amber-200 bg-amber-50/30 rounded-lg p-4 space-y-3">
      <div className="text-[10px] font-bold uppercase tracking-wide text-amber-800">
        Student preview
      </div>
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-wide bg-white text-slate-700 border border-slate-200 px-1.5 py-0.5 rounded">
          {difficulty}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-wide bg-white text-brand-700 border border-brand-200 px-1.5 py-0.5 rounded">
          {qType}
        </span>
      </div>
      {imageDataUrl && (
        <img src={imageDataUrl} alt="Diagram" className="max-h-40 rounded border border-slate-200" />
      )}
      <p className="text-sm text-slate-900 whitespace-pre-wrap">{stem}</p>
      {format === 'mcq' ? (
        <ol className="space-y-1.5 list-none">
          {options.map((opt, idx) => (
            <li
              key={idx}
              className={cn(
                'text-sm pl-3 pr-2 py-1.5 rounded border',
                idx === correctOption
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-900 font-medium'
                  : 'border-slate-200 bg-white text-slate-700'
              )}
            >
              <span className="font-mono font-bold mr-2">{String.fromCharCode(65 + idx)}.</span>
              {opt || <span className="italic text-slate-400">(empty)</span>}
            </li>
          ))}
        </ol>
      ) : (
        <div className="text-sm">
          <div className="text-xs text-slate-500 mb-1">Numerical answer:</div>
          <div className="font-mono text-base font-semibold text-emerald-800">
            {numericAnswer || <span className="italic text-slate-400">(empty)</span>}
          </div>
        </div>
      )}
      <div className="border-t border-amber-200 pt-3 mt-2">
        <div className="text-xs font-bold uppercase tracking-wide text-amber-800 mb-1">Solution</div>
        <p className="text-sm text-slate-700 whitespace-pre-wrap">{solution}</p>
      </div>
    </div>
  );
}
