import { useState, useRef, useMemo, useCallback } from 'react';
import {
  Upload,
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  RotateCcw,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useTracks } from '@/store/hierarchyStore';
import { useQuestionsStore } from '@/store/questionsStore';
import { parseCsv, toCsv } from '@/lib/csv';
import {
  validateRows,
  SAMPLE_CSV_HEADERS,
  SAMPLE_CSV_ROWS,
  type ValidationSummary,
  type RawRow,
} from '@/lib/importValidation';
import { cn } from '@/lib/cn';

type Stage =
  | { kind: 'idle' }
  | { kind: 'parsing' }
  | { kind: 'parseError'; messages: string[] }
  | { kind: 'validated'; sourceLabel: string; summary: ValidationSummary }
  | { kind: 'imported'; importedCount: number; skippedCount: number };

export function AuthorImports() {
  const tracks = useTracks();
  const addQuestion = useQuestionsStore((s) => s.addQuestion);
  const [stage, setStage] = useState<Stage>({ kind: 'idle' });
  const [pasteText, setPasteText] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Parse + validate ────────────────────────────────────────────────

  const ingest = useCallback(
    (text: string, sourceLabel: string) => {
      setStage({ kind: 'parsing' });
      // Detect JSON vs CSV by first non-whitespace char
      const first = text.trimStart()[0];
      let rows: RawRow[];
      const parseErrors: string[] = [];
      if (first === '[' || first === '{') {
        try {
          const parsed = JSON.parse(text);
          if (!Array.isArray(parsed)) {
            setStage({ kind: 'parseError', messages: ['JSON file must be an array of question objects.'] });
            return;
          }
          rows = parsed.map((r) => normalizeJsonRow(r));
        } catch (e) {
          setStage({
            kind: 'parseError',
            messages: ['JSON parse failed: ' + (e instanceof Error ? e.message : String(e))],
          });
          return;
        }
      } else {
        const result = parseCsv(text);
        if (result.errors.length > 0) parseErrors.push(...result.errors);
        rows = result.rows as RawRow[];
      }
      if (rows.length === 0) {
        setStage({
          kind: 'parseError',
          messages: parseErrors.length > 0 ? parseErrors : ['No data rows found.'],
        });
        return;
      }
      const summary = validateRows(rows, tracks);
      setStage({ kind: 'validated', sourceLabel, summary });
    },
    [tracks]
  );

  // ─── File / paste / drag-drop handlers ───────────────────────────────

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => ingest(String(reader.result ?? ''), file.name);
      reader.onerror = () =>
        setStage({ kind: 'parseError', messages: ['Failed to read the file.'] });
      reader.readAsText(file);
    },
    [ingest]
  );

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function downloadSampleCsv() {
    const csv = toCsv(SAMPLE_CSV_HEADERS, SAMPLE_CSV_ROWS);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'preplab-questions-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function reset() {
    setStage({ kind: 'idle' });
    setPasteText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  // ─── Import action ───────────────────────────────────────────────────

  function performImport() {
    if (stage.kind !== 'validated') return;
    let imported = 0;
    let skipped = 0;
    for (const row of stage.summary.rows) {
      if (row.draft) {
        addQuestion(row.draft);
        imported++;
      } else {
        skipped++;
      }
    }
    setStage({ kind: 'imported', importedCount: imported, skippedCount: skipped });
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Upload className="w-6 h-6 text-amber-600" />
            Bulk Import Questions
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-prose">
            Upload a CSV or JSON file (or paste it inline). Preview the validation table, fix errors in your source if needed, then publish the valid rows in one batch.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={downloadSampleCsv}
        >
          Download CSV template
        </Button>
      </div>

      {/* Format reference */}
      <FormatReference />

      {/* Stage-driven content */}
      {stage.kind === 'idle' && (
        <DropZone
          dragOver={dragOver}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onPickFile={() => fileInputRef.current?.click()}
        />
      )}

      {stage.kind === 'idle' && (
        <Card padding="lg">
          <h2 className="text-sm font-semibold text-slate-900 mb-2">Or paste CSV / JSON inline</h2>
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={'Paste rows starting with the header line, e.g.\ntopicName,difficulty,type,format,stem,...'}
            rows={6}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-xs font-mono focus-ring focus:border-amber-500 resize-y"
          />
          <div className="mt-3 flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPasteText('')}
              disabled={!pasteText}
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => ingest(pasteText, 'pasted text')}
              disabled={!pasteText.trim()}
            >
              Validate
            </Button>
          </div>
        </Card>
      )}

      {/* Hidden file input always mounted */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.json,.txt,text/csv,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {stage.kind === 'parsing' && (
        <Card padding="lg" className="text-center text-sm text-slate-500">
          Parsing…
        </Card>
      )}

      {stage.kind === 'parseError' && (
        <Card padding="lg" className="bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-900 flex-1">
              <div className="font-semibold">Couldn't parse the file.</div>
              <ul className="mt-2 list-disc list-inside space-y-1">
                {stage.messages.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
            <button onClick={reset} className="text-xs font-semibold text-red-700 hover:underline">
              Try again
            </button>
          </div>
        </Card>
      )}

      {stage.kind === 'validated' && (
        <ValidationView
          summary={stage.summary}
          sourceLabel={stage.sourceLabel}
          onCancel={reset}
          onImport={performImport}
        />
      )}

      {stage.kind === 'imported' && (
        <Card padding="lg" className="bg-emerald-50 border-emerald-200">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-900 flex-1">
              <div className="font-semibold">Import complete.</div>
              <p className="mt-1">
                <strong>{stage.importedCount}</strong> question
                {stage.importedCount !== 1 && 's'} added to the bank.
                {stage.skippedCount > 0 && (
                  <>
                    {' '}<strong>{stage.skippedCount}</strong> row
                    {stage.skippedCount !== 1 && 's'} with errors were skipped.
                  </>
                )}
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={reset}
                  leftIcon={<Upload className="w-3.5 h-3.5" />}
                >
                  Import more
                </Button>
                <a
                  href="/author/questions"
                  className="text-xs font-semibold text-emerald-800 hover:underline"
                >
                  See them in Questions →
                </a>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

// ─── Format reference panel ────────────────────────────────────────────────

function FormatReference() {
  const [expanded, setExpanded] = useState(false);
  return (
    <Card padding="md" className="bg-slate-50 border-slate-200">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between text-left focus-ring rounded"
      >
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-semibold text-slate-900">Required CSV columns</span>
          <Badge tone="neutral">click to {expanded ? 'collapse' : 'expand'}</Badge>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-500" />
        )}
      </button>
      {expanded && (
        <div className="mt-3 text-xs text-slate-700 space-y-3">
          <p>
            Header row required. Columns can appear in any order. Extra columns are ignored.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-1.5 pr-3 font-semibold">Column</th>
                  <th className="py-1.5 pr-3 font-semibold">Required?</th>
                  <th className="py-1.5 pr-3 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody className="font-mono text-[11px]">
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">topicId</td><td className="py-1.5 pr-3">opt*</td><td className="py-1.5 pr-3 font-sans">Exact match. Preferred when set.</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">topicName</td><td className="py-1.5 pr-3">opt*</td><td className="py-1.5 pr-3 font-sans">Used if topicId missing. Errors if name appears in &gt;1 place.</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">subtopicName</td><td className="py-1.5 pr-3">no</td><td className="py-1.5 pr-3 font-sans">Match within the resolved topic.</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">difficulty</td><td className="py-1.5 pr-3">yes</td><td className="py-1.5 pr-3 font-sans">Easy / Medium / Hard</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">type</td><td className="py-1.5 pr-3">yes</td><td className="py-1.5 pr-3 font-sans">Recall / Conceptual / Analytical / Application</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">format</td><td className="py-1.5 pr-3">yes</td><td className="py-1.5 pr-3 font-sans">mcq / numerical</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">stem</td><td className="py-1.5 pr-3">yes</td><td className="py-1.5 pr-3 font-sans">Min 5 chars.</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">optionA-D</td><td className="py-1.5 pr-3">if mcq</td><td className="py-1.5 pr-3 font-sans">All four required for MCQ.</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">correctAnswer</td><td className="py-1.5 pr-3">yes</td><td className="py-1.5 pr-3 font-sans">MCQ: A/B/C/D, 0-3, 1-4, or option text. Numerical: a number.</td></tr>
                <tr className="border-b border-slate-100"><td className="py-1.5 pr-3">solution</td><td className="py-1.5 pr-3">yes</td><td className="py-1.5 pr-3 font-sans">Min 5 chars.</td></tr>
                <tr><td className="py-1.5 pr-3">estimatedTimeSeconds</td><td className="py-1.5 pr-3">no</td><td className="py-1.5 pr-3 font-sans">Non-negative number.</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500">
            * One of <code>topicId</code> or <code>topicName</code> must be present.
          </p>
        </div>
      )}
    </Card>
  );
}

// ─── Drop zone ─────────────────────────────────────────────────────────────

function DropZone({
  dragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onPickFile,
}: {
  dragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onPickFile: () => void;
}) {
  return (
    <Card
      padding="none"
      className={cn(
        'border-2 border-dashed transition-colors',
        dragOver ? 'border-amber-500 bg-amber-50' : 'border-slate-300 bg-white hover:border-amber-400'
      )}
    >
      <button
        onClick={onPickFile}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className="w-full p-10 sm:p-14 flex flex-col items-center justify-center gap-3 focus-ring rounded-xl"
      >
        <div className="w-12 h-12 inline-flex items-center justify-center rounded-full bg-amber-100 text-amber-700">
          <Upload className="w-6 h-6" />
        </div>
        <div className="text-center">
          <div className="text-base font-semibold text-slate-900">
            Drop a CSV / JSON file here
          </div>
          <div className="text-sm text-slate-600 mt-0.5">
            or <span className="text-amber-700 font-semibold">click to browse</span>
          </div>
        </div>
      </button>
    </Card>
  );
}

// ─── Validation view ───────────────────────────────────────────────────────

function ValidationView({
  summary,
  sourceLabel,
  onCancel,
  onImport,
}: {
  summary: ValidationSummary;
  sourceLabel: string;
  onCancel: () => void;
  onImport: () => void;
}) {
  const [filter, setFilter] = useState<'all' | 'valid' | 'warning' | 'error'>('all');
  const filtered = useMemo(() => {
    if (filter === 'all') return summary.rows;
    return summary.rows.filter((r) => r.status === filter);
  }, [summary, filter]);

  const canImport = summary.validCount + summary.warningCount > 0;

  return (
    <>
      {/* Top summary card */}
      <Card padding="lg" className="space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Validation results
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              From <span className="font-semibold text-slate-700">{sourceLabel}</span> ({summary.rows.length} data rows)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={onCancel}
            >
              Re-upload
            </Button>
            <Button
              size="sm"
              onClick={onImport}
              disabled={!canImport}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              title={
                canImport
                  ? `Import ${summary.validCount + summary.warningCount} rows`
                  : 'Nothing valid to import'
              }
            >
              Import {summary.validCount + summary.warningCount} valid row
              {summary.validCount + summary.warningCount !== 1 && 's'}
            </Button>
          </div>
        </div>

        {/* Counts grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <SummaryChip label="Valid" value={summary.validCount} tone="success" />
          <SummaryChip label="Warnings" value={summary.warningCount} tone="warning" />
          <SummaryChip label="Errors" value={summary.errorCount} tone="danger" />
          <SummaryChip label="Duplicates" value={summary.duplicatesDetected} tone="neutral" />
        </div>

        {/* Status filter chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mr-1">
            Show:
          </span>
          {(['all', 'valid', 'warning', 'error'] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={cn(
                'px-2 h-6 rounded text-[11px] font-semibold transition-colors focus-ring capitalize',
                filter === opt
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              )}
            >
              {opt}
              {opt !== 'all' && (
                <span className="ml-1 opacity-70">
                  (
                  {opt === 'valid' ? summary.validCount
                    : opt === 'warning' ? summary.warningCount
                    : summary.errorCount}
                  )
                </span>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Per-row table */}
      <Card padding="none">
        {filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            No rows match this filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((row) => (
              <RowResult key={row.rowNumber} row={row} />
            ))}
          </div>
        )}
      </Card>
    </>
  );
}

function SummaryChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
}) {
  const toneClasses = {
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-red-50 text-red-800 border-red-200',
    neutral: 'bg-slate-50 text-slate-700 border-slate-200',
  };
  return (
    <div className={cn('rounded-md border p-2.5', toneClasses[tone])}>
      <div className="text-[10px] font-bold uppercase tracking-wide opacity-90">{label}</div>
      <div className="text-xl font-bold tabular-nums mt-0.5">{value}</div>
    </div>
  );
}

function RowResult({ row }: { row: ReturnType<typeof validateRows>['rows'][number] }) {
  const Icon =
    row.status === 'valid'
      ? CheckCircle2
      : row.status === 'warning'
      ? AlertTriangle
      : X;
  const toneText =
    row.status === 'valid'
      ? 'text-emerald-700'
      : row.status === 'warning'
      ? 'text-amber-700'
      : 'text-red-700';
  const toneBg =
    row.status === 'valid'
      ? 'bg-emerald-50'
      : row.status === 'warning'
      ? 'bg-amber-50'
      : 'bg-red-50';

  return (
    <div className="px-4 py-3 hover:bg-slate-50/40">
      <div className="flex items-start gap-3">
        <div className={cn('flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center', toneBg)}>
          <Icon className={cn('w-4 h-4', toneText)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono font-bold text-slate-500">
              row {row.rowNumber}
            </span>
            {row.resolvedTopicLabel && (
              <span className="text-[11px] text-slate-500 truncate">
                → {row.resolvedTopicLabel}
              </span>
            )}
          </div>
          {row.stemPreview && (
            <p className="text-sm text-slate-800 mt-1 line-clamp-1">{row.stemPreview}</p>
          )}
          {(row.errors.length > 0 || row.warnings.length > 0) && (
            <ul className="mt-1.5 space-y-0.5">
              {row.errors.map((e, i) => (
                <li key={`e${i}`} className="text-xs text-red-700 flex items-start gap-1.5">
                  <span className="font-bold">×</span>
                  <span>{e}</span>
                </li>
              ))}
              {row.warnings.map((w, i) => (
                <li key={`w${i}`} className="text-xs text-amber-700 flex items-start gap-1.5">
                  <span className="font-bold">!</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── JSON row normalizer ───────────────────────────────────────────────────
// JSON imports can use the same column names as CSV. Coerce all values to
// strings so the validation pipeline (which expects strings) doesn't choke.

function normalizeJsonRow(raw: unknown): RawRow {
  if (typeof raw !== 'object' || raw === null) return {};
  const result: RawRow = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (v === null || v === undefined) continue;
    result[k] = String(v);
  }
  return result;
}
