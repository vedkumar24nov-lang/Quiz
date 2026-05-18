import { useMemo, useState } from 'react';
import {
  Layers,
  Plus,
  Pencil,
  Archive,
  RotateCcw,
  Eye,
  EyeOff,
  AlertTriangle,
  RefreshCw,
  Clock,
  Hash,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import {
  useFormats,
  useFormatsStore,
  hasDivergedFromSeed,
  type FormatDraft,
} from '@/store/formatsStore';
import type { ExamFormat, MarkingPoints } from '@/types';
import { cn } from '@/lib/cn';

type ModalMode = { kind: 'closed' } | { kind: 'create' } | { kind: 'edit'; format: ExamFormat };

export function AuthorFormats() {
  const formats = useFormats();
  const addFormat = useFormatsStore((s) => s.addFormat);
  const updateFormat = useFormatsStore((s) => s.updateFormat);
  const archiveFormat = useFormatsStore((s) => s.archiveFormat);
  const restoreFormat = useFormatsStore((s) => s.restoreFormat);
  const restoreSystemFormat = useFormatsStore((s) => s.restoreSystemFormat);

  const [showArchived, setShowArchived] = useState(false);
  const [modal, setModal] = useState<ModalMode>({ kind: 'closed' });
  const [archiveConfirm, setArchiveConfirm] = useState<ExamFormat | null>(null);
  const [restoreConfirm, setRestoreConfirm] = useState<ExamFormat | null>(null);

  const visible = useMemo(
    () => formats.filter((f) => showArchived || !f.archivedAt),
    [formats, showArchived]
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            Paper Patterns
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-prose">
            Reusable paper definitions — duration + total questions + marking scheme. Authors pick a pattern when creating an Exam (e.g. "JEE Main → 75 Q / 3 hr / +4/−1") and the picked pattern <strong>locks</strong> those values. <strong>System patterns</strong> can be reset to their seeded defaults if an edit broke something.
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
            New pattern
          </Button>
        </div>
      </div>

      {/* Pattern list */}
      {visible.length === 0 ? (
        <Card padding="lg" className="text-center">
          <p className="text-sm text-slate-500">
            {showArchived ? 'No archived patterns yet.' : 'No patterns — that shouldn\'t happen. Try the reset.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {visible.map((format) => (
            <FormatRow
              key={format.id}
              format={format}
              onEdit={() => setModal({ kind: 'edit', format })}
              onArchive={() => setArchiveConfirm(format)}
              onRestore={() => restoreFormat(format.id)}
              onRestoreToSeed={() => setRestoreConfirm(format)}
            />
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {modal.kind !== 'closed' && (
        <FormatFormModal
          open
          mode={modal.kind === 'edit' ? 'edit' : 'create'}
          existing={modal.kind === 'edit' ? modal.format : undefined}
          onClose={() => setModal({ kind: 'closed' })}
          onSave={(payload) => {
            if (modal.kind === 'create') {
              addFormat(payload);
            } else {
              updateFormat(modal.format.id, payload);
            }
            setModal({ kind: 'closed' });
          }}
        />
      )}

      {/* Archive confirm */}
      <Modal
        open={!!archiveConfirm}
        onClose={() => setArchiveConfirm(null)}
        title={archiveConfirm ? `Archive "${archiveConfirm.name}"?` : ''}
        description="The pattern is hidden from active lists. Tracks and Exams already pointing to it keep working — they just can't be re-selected. You can restore any time."
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
                if (archiveConfirm) archiveFormat(archiveConfirm.id);
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

      {/* Restore-to-seed confirm (system patterns only) */}
      <Modal
        open={!!restoreConfirm}
        onClose={() => setRestoreConfirm(null)}
        title={restoreConfirm ? `Restore "${restoreConfirm.name}" to defaults?` : ''}
        description="Replaces every field of this system pattern with its original seeded values. Useful when an edit broke something. There's no undo."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setRestoreConfirm(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => {
                if (restoreConfirm) restoreSystemFormat(restoreConfirm.id);
                setRestoreConfirm(null);
              }}
            >
              Restore defaults
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 text-sm text-slate-700">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>Any custom edits to this pattern will be lost.</p>
        </div>
      </Modal>
    </div>
  );
}

// ─── Row ───────────────────────────────────────────────────────────────────

function FormatRow({
  format,
  onEdit,
  onArchive,
  onRestore,
  onRestoreToSeed,
}: {
  format: ExamFormat;
  onEdit: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onRestoreToSeed: () => void;
}) {
  const isArchived = !!format.archivedAt;
  const diverged = hasDivergedFromSeed(format);

  return (
    <Card padding="none" className={cn('transition-opacity', isArchived && 'opacity-60')}>
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold text-slate-900 truncate">{format.name}</h2>
            {format.isSystem ? (
              <Badge tone="neutral">System</Badge>
            ) : (
              <Badge tone="amber">Custom</Badge>
            )}
            {format.isSystem && diverged && <Badge tone="amber">Edited</Badge>}
            {isArchived && <Badge tone="neutral">Archived</Badge>}
          </div>
          {format.description && (
            <p className="text-xs text-slate-600 mt-1 line-clamp-2">{format.description}</p>
          )}
          <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Hash className="w-3 h-3" />
              {format.totalQuestions === 0
                ? 'flexible Q-count'
                : `${format.totalQuestions} questions`}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format.durationMinutes} min
            </span>
            <span className="text-slate-300">·</span>
            <span className="font-mono text-[11px]">
              MCQ {fmtSigned(format.markingMcq.correct)}/{fmtSigned(format.markingMcq.wrong)}
              {format.markingNumerical
                ? ` · Num ${fmtSigned(format.markingNumerical.correct)}/${fmtSigned(format.markingNumerical.wrong)}`
                : ' · no numerical'}
            </span>
          </div>
        </div>

        {/* Restore-to-default (system + diverged only) */}
        {format.isSystem && diverged && !isArchived && (
          <button
            onClick={onRestoreToSeed}
            className="inline-flex items-center gap-1 h-8 px-2.5 text-xs font-semibold rounded-md border bg-white text-amber-800 border-amber-300 hover:bg-amber-50 focus-ring"
            title="Restore this format to its seeded defaults"
          >
            <RefreshCw className="w-3 h-3" />
            Restore default
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          {!isArchived && (
            <button
              onClick={onEdit}
              className="w-8 h-8 inline-flex items-center justify-center rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus-ring"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
          )}
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

function FormatFormModal({
  open,
  mode,
  existing,
  onClose,
  onSave,
}: {
  open: boolean;
  mode: 'create' | 'edit';
  existing?: ExamFormat;
  onClose: () => void;
  onSave: (payload: FormatDraft) => void;
}) {
  const [name, setName] = useState(existing?.name ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [durationMinutes, setDurationMinutes] = useState<number>(existing?.durationMinutes ?? 60);
  const [totalQuestions, setTotalQuestions] = useState<number>(existing?.totalQuestions ?? 0);
  const [mcqCorrect, setMcqCorrect] = useState<number>(existing?.markingMcq.correct ?? 4);
  const [mcqWrong, setMcqWrong] = useState<number>(existing?.markingMcq.wrong ?? -1);
  const [hasNumerical, setHasNumerical] = useState<boolean>(!!existing?.markingNumerical);
  const [numCorrect, setNumCorrect] = useState<number>(
    existing?.markingNumerical?.correct ?? 4
  );
  const [numWrong, setNumWrong] = useState<number>(existing?.markingNumerical?.wrong ?? 0);

  const trimmedName = name.trim();
  const valid =
    trimmedName.length > 0 && durationMinutes > 0 && totalQuestions >= 0;

  function handleSubmit() {
    if (!valid) return;
    const markingMcq: MarkingPoints = { correct: mcqCorrect, wrong: mcqWrong };
    const markingNumerical: MarkingPoints | null = hasNumerical
      ? { correct: numCorrect, wrong: numWrong }
      : null;
    onSave({
      name: trimmedName,
      description: description.trim() || undefined,
      durationMinutes,
      totalQuestions,
      markingMcq,
      markingNumerical,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={mode === 'create' ? 'New paper pattern' : `Edit "${existing?.name}"`}
      description={
        mode === 'create'
          ? 'Define a reusable paper pattern. Authors will pick this when creating an Exam — duration / Q-count / marking lock to these values.'
          : existing?.isSystem
          ? 'Editing a system pattern. There\'s a "Restore default" button on the row when you\'ve diverged.'
          : undefined
      }
      size="lg"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!valid}>
            {mode === 'create' ? 'Create pattern' : 'Save changes'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <FormField label="Name" required>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. JEE Main, NEET (UG), Custom Mock"
            autoFocus
            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500"
          />
        </FormField>

        <FormField label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Format context — number of papers, special rules, recommended use case."
            rows={2}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500 resize-none"
          />
        </FormField>

        <div className="grid sm:grid-cols-2 gap-3">
          <FormField label="Duration (minutes)" required>
            <input
              type="number"
              min={1}
              max={600}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500 font-mono"
            />
          </FormField>
          <FormField label="Total questions (0 = flexible)">
            <input
              type="number"
              min={0}
              max={500}
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(Number(e.target.value))}
              className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500 font-mono"
            />
          </FormField>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-slate-700 mb-2">
            MCQ marking
          </label>
          <div className="grid sm:grid-cols-2 gap-3">
            <FormField label="Correct answer (points)">
              <input
                type="number"
                step="0.5"
                value={mcqCorrect}
                onChange={(e) => setMcqCorrect(Number(e.target.value))}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500 font-mono"
              />
            </FormField>
            <FormField label="Wrong answer (penalty, use negative)">
              <input
                type="number"
                step="0.25"
                value={mcqWrong}
                onChange={(e) => setMcqWrong(Number(e.target.value))}
                className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500 font-mono"
              />
            </FormField>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hasNumerical}
              onChange={(e) => setHasNumerical(e.target.checked)}
              className="w-4 h-4 text-amber-600 focus:ring-amber-500"
            />
            <span className="text-xs font-bold uppercase tracking-wide text-slate-700">
              This format includes numerical questions
            </span>
          </label>
          {hasNumerical && (
            <div className="grid sm:grid-cols-2 gap-3 mt-2 pl-6">
              <FormField label="Numerical correct (points)">
                <input
                  type="number"
                  step="0.5"
                  value={numCorrect}
                  onChange={(e) => setNumCorrect(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500 font-mono"
                />
              </FormField>
              <FormField label="Numerical wrong (penalty)">
                <input
                  type="number"
                  step="0.25"
                  value={numWrong}
                  onChange={(e) => setNumWrong(Number(e.target.value))}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-amber-500 font-mono"
                />
              </FormField>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function FormField({
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

// ─── Helpers ──────────────────────────────────────────────────────────────

function fmtSigned(n: number): string {
  if (n > 0) return `+${trimNum(n)}`;
  if (n < 0) return `−${trimNum(Math.abs(n))}`;
  return '0';
}
function trimNum(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, '');
}
