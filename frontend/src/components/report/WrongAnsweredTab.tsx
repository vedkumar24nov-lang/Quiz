import { useEffect, useState } from 'react';
import { XCircle, Eye, EyeOff, Flag, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge, DifficultyBadge, TypeBadge } from '@/components/ui/Badge';
import { getQuestionById } from '@/data/questions';
import { useFlagsStore, useFlagsForQuestion, FLAG_REASON_LABELS } from '@/store/flagsStore';
import { useAuthUser } from '@/store/authStore';
import type { Attempt, Difficulty, FlagReason, QuestionType } from '@/types';
import { cn } from '@/lib/cn';

interface WrongAnsweredTabProps {
  attempt: Attempt;
}

export function WrongAnsweredTab({ attempt }: WrongAnsweredTabProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<QuestionType | 'all'>('all');

  const wrongs = attempt.answers
    .map((ans) => {
      const q = getQuestionById(ans.questionId);
      return q && ans.isCorrect === false ? { ans, q } : null;
    })
    .filter((x): x is { ans: Attempt['answers'][number]; q: NonNullable<ReturnType<typeof getQuestionById>> } => !!x);

  const filtered = wrongs.filter((row) => {
    if (difficultyFilter !== 'all' && row.q.difficulty !== difficultyFilter) return false;
    if (typeFilter !== 'all' && row.q.type !== typeFilter) return false;
    return true;
  });

  if (wrongs.length === 0) {
    return (
      <Card padding="lg" className="text-center">
        <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-3">
          <XCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No wrong answers</h3>
        <p className="text-sm text-slate-600 mt-1">
          Strong run. Engine will skew harder next attempt.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              Wrong Answered ({wrongs.length})
            </span>
          </CardTitle>
          <CardDescription>
            Tags are intrinsic to the question — no self-tagging needed. Patterns surface from the metadata.
          </CardDescription>
        </CardHeader>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <FilterGroup
            label="Difficulty"
            options={['all', 'Easy', 'Medium', 'Hard']}
            value={difficultyFilter}
            onChange={(v) => setDifficultyFilter(v as Difficulty | 'all')}
            countFn={(opt) =>
              opt === 'all' ? wrongs.length : wrongs.filter((w) => w.q.difficulty === opt).length
            }
          />
          <FilterGroup
            label="Type"
            options={['all', 'Recall', 'Conceptual', 'Analytical', 'Application']}
            value={typeFilter}
            onChange={(v) => setTypeFilter(v as QuestionType | 'all')}
            countFn={(opt) =>
              opt === 'all' ? wrongs.length : wrongs.filter((w) => w.q.type === opt).length
            }
          />
        </div>
      </Card>

      {/* Wrong answer list */}
      {filtered.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-sm text-slate-500">No wrongs match this filter combination.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((row, idx) => (
            <WrongAnswerCard key={row.ans.questionId} row={row} number={idx + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function WrongAnswerCard({
  row,
  number,
}: {
  row: { ans: Attempt['answers'][number]; q: NonNullable<ReturnType<typeof getQuestionById>> };
  number: number;
}) {
  const [showSolution, setShowSolution] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const { ans, q } = row;
  const me = useAuthUser();
  const addFlag = useFlagsStore((s) => s.addFlag);
  const existingFlags = useFlagsForQuestion(q.id);
  const myOpenFlag = existingFlags.find(
    (f) => f.studentId === (me?.id ?? null) && f.status === 'open'
  );

  const studentText =
    q.format === 'mcq' && q.options && ans.studentAnswer !== null
      ? q.options[Number(ans.studentAnswer)]
      : String(ans.studentAnswer);

  const correctText =
    q.format === 'mcq' && q.options
      ? q.options[Number(q.correctAnswer)]
      : String(q.correctAnswer);

  return (
    <Card padding="lg">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-red-100 text-red-700 flex items-center justify-center font-mono text-sm font-bold">
          {number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <DifficultyBadge difficulty={q.difficulty} />
            <TypeBadge type={q.type} />
            <Badge tone="neutral">{q.format === 'mcq' ? 'MCQ' : 'Numerical'}</Badge>
            <span className="text-xs text-slate-500 ml-auto">{ans.timeSpentSeconds}s spent</span>
          </div>
          <p className="text-sm sm:text-base text-slate-900 leading-relaxed mb-3 whitespace-pre-wrap">
            {q.stem}
          </p>
        </div>
      </div>

      {/* Your answer vs correct */}
      <div className="grid sm:grid-cols-2 gap-2 mb-3 ml-0 sm:ml-11">
        <div className="rounded-lg border-2 border-red-200 bg-red-50 p-3">
          <div className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-1">
            Your answer
          </div>
          <div className="text-sm font-medium text-red-900">{studentText}</div>
        </div>
        <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-3">
          <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">
            Correct answer
          </div>
          <div className="text-sm font-medium text-emerald-900">{correctText}</div>
        </div>
      </div>

      {/* Solution toggle */}
      <div className="ml-0 sm:ml-11 flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setShowSolution((v) => !v)}
          className="text-sm font-semibold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1.5 focus-ring rounded px-1"
        >
          {showSolution ? (
            <>
              <EyeOff className="w-4 h-4" />
              Hide solution
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Show solution
            </>
          )}
        </button>
        <span className="text-slate-300">·</span>
        {/* Buyer fix ST-3: "Report this question" — student-driven flag */}
        {myOpenFlag ? (
          <span
            className="text-xs text-emerald-700 inline-flex items-center gap-1"
            title="Admin will see your flag in the Question Flags queue"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Reported — thanks
          </span>
        ) : (
          <button
            onClick={() => setFlagOpen(true)}
            className="text-xs text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 focus-ring rounded px-1"
            title="Tell the content team something looks wrong with this question"
          >
            <Flag className="w-3.5 h-3.5" />
            Report this question
          </button>
        )}
      </div>

      <FlagQuestionModal
        open={flagOpen}
        onClose={() => setFlagOpen(false)}
        onSubmit={(reason, note) => {
          addFlag({
            questionId: q.id,
            studentId: me?.id ?? null,
            studentName: me?.name ?? null,
            reason,
            note: note.trim() || undefined,
            stemSnapshot: q.stem,
          });
          setFlagOpen(false);
        }}
      />

      {showSolution && (
        <div className="ml-0 sm:ml-11 mt-3 p-4 bg-brand-50 border border-brand-200 rounded-lg animate-fade-in">
          <div className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-2">
            Worked solution
          </div>
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
            {q.solution}
          </p>
        </div>
      )}
    </Card>
  );
}

function FlagQuestionModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: FlagReason, note: string) => void;
}) {
  const [reason, setReason] = useState<FlagReason>('wrong-answer');
  const [note, setNote] = useState('');

  // Reset form whenever the modal transitions from closed → open.
  useEffect(() => {
    if (open) {
      setReason('wrong-answer');
      setNote('');
    }
  }, [open]);

  const reasons: FlagReason[] = [
    'wrong-answer',
    'unclear-stem',
    'typo',
    'bad-image',
    'off-syllabus',
    'other',
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Report this question"
      description="Tell the content team what looks off. An admin reviews every flag in the Question Flags queue, fixes (or archives) the question, and the next student gets a better experience."
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            leftIcon={<Flag className="w-3.5 h-3.5" />}
            onClick={() => onSubmit(reason, note)}
          >
            Send report
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            What's wrong?
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {reasons.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={cn(
                  'text-left rounded-md border-2 p-2.5 text-xs transition-all focus-ring',
                  reason === r
                    ? 'border-brand-500 bg-brand-50 text-brand-900 font-semibold'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300'
                )}
              >
                {FLAG_REASON_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="block text-xs font-semibold text-slate-700 mb-1.5">
            Anything else? <span className="text-slate-400 font-normal">(optional)</span>
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. The correct answer should be C — the formula in the solution gives 0.25, not 0.30."
            rows={3}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-brand-500 resize-none"
          />
        </label>
      </div>
    </Modal>
  );
}

function FilterGroup({
  label,
  options,
  value,
  onChange,
  countFn,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  countFn: (opt: string) => number;
}) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      <span className="text-xs text-slate-500 mr-1">{label}:</span>
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn(
            'px-2.5 h-7 rounded-md text-xs font-medium transition-colors focus-ring',
            value === opt
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          )}
        >
          {opt} ({countFn(opt)})
        </button>
      ))}
    </div>
  );
}
