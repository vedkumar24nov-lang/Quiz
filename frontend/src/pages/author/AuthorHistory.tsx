import { useMemo, useState } from 'react';
import {
  History,
  Search,
  Plus,
  Pencil,
  Archive,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowUpDown,
  Move,
  Trash2,
  AlertTriangle,
  Sparkles,
  GraduationCap,
  Compass,
  FolderTree,
  FileQuestion,
  ListChecks,
  Layers,
  ChevronDown,
  ChevronRight,
  User as UserIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useAuthUser } from '@/store/authStore';
import { useAuditEntries, useAuditStore } from '@/store/auditStore';
import type { AuditEntry, AuditEntityType, AuditAction } from '@/types';
import { cn } from '@/lib/cn';

const ENTITY_FILTERS: Array<AuditEntityType | 'all'> = [
  'all',
  'track',
  'examFormat',
  'subject',
  'chapter',
  'topic',
  'subtopic',
  'question',
  // Legacy types — older entries logged before the rename. Kept so they
  // remain filterable and don't crash if persisted entries reference them.
  'exam',
  'template',
];

const ACTION_FILTERS: Array<AuditAction | 'all'> = [
  'all',
  'create',
  'update',
  'archive',
  'restore',
  'reorder',
  'move',
  'delete',
  'publish',
  'unpublish',
  'add-child',
  'remove-child',
  'reset-seed',
];

const ENTITY_ICONS: Record<AuditEntityType, React.ReactNode> = {
  track: <Compass className="w-3.5 h-3.5" />,
  examFormat: <Layers className="w-3.5 h-3.5" />,
  subject: <FolderTree className="w-3.5 h-3.5" />,
  chapter: <FolderTree className="w-3.5 h-3.5" />,
  topic: <FolderTree className="w-3.5 h-3.5" />,
  subtopic: <FolderTree className="w-3.5 h-3.5" />,
  question: <FileQuestion className="w-3.5 h-3.5" />,
  // Legacy aliases — render older audit entries without crashing.
  exam: <GraduationCap className="w-3.5 h-3.5" />,
  template: <ListChecks className="w-3.5 h-3.5" />,
};

const ACTION_META: Record<
  AuditAction,
  { verb: string; icon: React.ReactNode; tone: 'create' | 'update' | 'archive' | 'restore' | 'publish' | 'delete' | 'neutral' }
> = {
  create: { verb: 'created', icon: <Plus className="w-3.5 h-3.5" />, tone: 'create' },
  update: { verb: 'updated', icon: <Pencil className="w-3.5 h-3.5" />, tone: 'update' },
  archive: { verb: 'archived', icon: <Archive className="w-3.5 h-3.5" />, tone: 'archive' },
  restore: { verb: 'restored', icon: <RotateCcw className="w-3.5 h-3.5" />, tone: 'restore' },
  reorder: { verb: 'reordered', icon: <ArrowUpDown className="w-3.5 h-3.5" />, tone: 'neutral' },
  move: { verb: 'moved', icon: <Move className="w-3.5 h-3.5" />, tone: 'neutral' },
  delete: { verb: 'deleted', icon: <Trash2 className="w-3.5 h-3.5" />, tone: 'delete' },
  publish: { verb: 'published', icon: <CheckCircle2 className="w-3.5 h-3.5" />, tone: 'publish' },
  unpublish: { verb: 'unpublished', icon: <XCircle className="w-3.5 h-3.5" />, tone: 'archive' },
  reject: { verb: 'rejected', icon: <XCircle className="w-3.5 h-3.5" />, tone: 'delete' },
  'add-child': { verb: 'added question to', icon: <Plus className="w-3.5 h-3.5" />, tone: 'create' },
  'remove-child': { verb: 'removed question from', icon: <XCircle className="w-3.5 h-3.5" />, tone: 'archive' },
  'reset-seed': { verb: 'reset to seed', icon: <Sparkles className="w-3.5 h-3.5" />, tone: 'neutral' },
};

export function AuthorHistory() {
  const entries = useAuditEntries();
  const clear = useAuditStore((s) => s.clear);
  const user = useAuthUser();

  const [query, setQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState<AuditEntityType | 'all'>('all');
  const [actionFilter, setActionFilter] = useState<AuditAction | 'all'>('all');
  const [actorFilter, setActorFilter] = useState<string>('all'); // actor id, or 'all'
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const canClear = user?.role === 'admin';

  // Distinct actors that have at least one entry
  const distinctActors = useMemo(() => {
    const seen = new Map<string, { id: string; name: string; role: string | null }>();
    for (const e of entries) {
      if (!e.actorId) continue;
      if (!seen.has(e.actorId)) {
        seen.set(e.actorId, {
          id: e.actorId,
          name: e.actorName ?? 'Unknown',
          role: e.actorRole,
        });
      }
    }
    return [...seen.values()];
  }, [entries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return entries.filter((e) => {
      if (entityFilter !== 'all' && e.entityType !== entityFilter) return false;
      if (actionFilter !== 'all' && e.action !== actionFilter) return false;
      if (actorFilter !== 'all' && e.actorId !== actorFilter) return false;
      if (q) {
        const hay = `${e.entityLabel} ${e.actorName ?? ''} ${e.entityType} ${e.action}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [entries, query, entityFilter, actionFilter, actorFilter]);

  // Group by date
  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  function clearFilters() {
    setQuery('');
    setEntityFilter('all');
    setActionFilter('all');
    setActorFilter('all');
  }
  const filtersActive =
    !!query ||
    entityFilter !== 'all' ||
    actionFilter !== 'all' ||
    actorFilter !== 'all';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <History className="w-6 h-6 text-amber-600" />
            Edit History
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Every author write recorded. <span className="font-semibold text-slate-900">{entries.length}</span> entries (newest first).
          </p>
        </div>
        {canClear && entries.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => setClearConfirmOpen(true)}
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Filter bar */}
      {entries.length > 0 && (
        <Card padding="md" className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search entity name, actor, type, action…"
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

          <div className="flex items-start gap-3 flex-wrap text-xs">
            <FilterRow label="Entity" value={entityFilter} onChange={(v) => setEntityFilter(v as AuditEntityType | 'all')} options={ENTITY_FILTERS} />
            <FilterRow label="Action" value={actionFilter} onChange={(v) => setActionFilter(v as AuditAction | 'all')} options={ACTION_FILTERS} />
            {distinctActors.length > 1 && (
              <ActorFilterRow
                actors={distinctActors}
                value={actorFilter}
                onChange={setActorFilter}
              />
            )}
          </div>
        </Card>
      )}

      {/* Result count */}
      {entries.length > 0 && (
        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-900">{filtered.length}</span> of {entries.length} entries
        </div>
      )}

      {/* Empty / list */}
      {entries.length === 0 ? (
        <Card padding="lg" className="text-center">
          <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
            <History className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-600 font-semibold">No history yet.</p>
          <p className="text-xs text-slate-500 mt-1">
            Author edits (creating an exam, adding a topic, archiving a question, etc.) will show up here.
          </p>
        </Card>
      ) : filtered.length === 0 ? (
        <Card padding="lg" className="text-center">
          <p className="text-sm text-slate-500">No entries match these filters.</p>
        </Card>
      ) : (
        <div className="space-y-5">
          {grouped.map((group) => (
            <section key={group.dateKey} className="space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wide text-slate-500 sticky top-14 bg-slate-50 py-1 z-10">
                {group.label}
                <span className="ml-2 font-normal text-slate-400">
                  ({group.entries.length} {group.entries.length === 1 ? 'entry' : 'entries'})
                </span>
              </h2>
              <Card padding="none">
                <ul className="divide-y divide-slate-100">
                  {group.entries.map((entry) => (
                    <EntryRow key={entry.id} entry={entry} />
                  ))}
                </ul>
              </Card>
            </section>
          ))}
        </div>
      )}

      {/* Clear-all confirm */}
      <Modal
        open={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        title="Clear all history?"
        description="Deletes every audit entry. This is permanent and only affects your local browser. The recorded changes themselves (created topics, edited questions, etc.) are NOT undone."
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setClearConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => {
                clear();
                setClearConfirmOpen(false);
              }}
            >
              Clear history
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3 text-sm text-slate-700">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p>Use this only when the log gets too noisy. Once cleared, there's no undo.</p>
        </div>
      </Modal>
    </div>
  );
}

// ─── Date grouping ─────────────────────────────────────────────────────────

function groupByDate(entries: AuditEntry[]): Array<{
  dateKey: string;
  label: string;
  entries: AuditEntry[];
}> {
  const today = new Date();
  const todayKey = formatDateKey(today);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday);

  const groups = new Map<string, AuditEntry[]>();
  for (const e of entries) {
    const key = formatDateKey(new Date(e.timestamp));
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(e);
  }

  return [...groups.entries()].map(([dateKey, items]) => {
    let label = dateKey;
    if (dateKey === todayKey) label = 'Today';
    else if (dateKey === yesterdayKey) label = 'Yesterday';
    else {
      const d = new Date(dateKey);
      label = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    return { dateKey, label, entries: items };
  });
}

function formatDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ─── Entry row ────────────────────────────────────────────────────────────

function EntryRow({ entry }: { entry: AuditEntry }) {
  const [expanded, setExpanded] = useState(false);
  const action = ACTION_META[entry.action];
  const time = new Date(entry.timestamp).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const toneClasses = {
    create: 'bg-emerald-100 text-emerald-700',
    update: 'bg-blue-100 text-blue-700',
    archive: 'bg-amber-100 text-amber-700',
    restore: 'bg-emerald-100 text-emerald-700',
    publish: 'bg-emerald-100 text-emerald-700',
    delete: 'bg-red-100 text-red-700',
    neutral: 'bg-slate-100 text-slate-700',
  };
  const hasDetails = entry.details && Object.keys(entry.details).length > 0;

  return (
    <li className="px-4 py-3 hover:bg-slate-50/50">
      <div className="flex items-start gap-3">
        {/* Action icon */}
        <div
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center',
            toneClasses[action.tone]
          )}
        >
          {action.icon}
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm text-slate-900">
              <span className="font-semibold">{entry.actorName ?? 'Unknown'}</span>
              {entry.actorRole && (
                <span className="ml-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  ({entry.actorRole})
                </span>
              )}{' '}
              <span className="text-slate-600">{action.verb}</span>{' '}
              <Badge tone="neutral">
                <span className="inline-flex items-center gap-1">
                  {ENTITY_ICONS[entry.entityType]}
                  {entry.entityType}
                </span>
              </Badge>{' '}
              <span className="font-semibold text-slate-900">"{entry.entityLabel}"</span>
            </span>
          </div>

          {/* Details preview */}
          {hasDetails && (
            <div className="mt-1.5">
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-[11px] text-slate-500 hover:text-slate-900 inline-flex items-center gap-0.5 focus-ring rounded"
              >
                {expanded ? (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    Hide details
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    Show details
                  </>
                )}
              </button>
              {expanded && (
                <pre className="mt-1.5 p-2 bg-slate-100 rounded text-[11px] text-slate-700 overflow-x-auto font-mono whitespace-pre-wrap">
                  {JSON.stringify(entry.details, null, 2)}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Time */}
        <span className="flex-shrink-0 text-[11px] text-slate-400 font-mono whitespace-nowrap">
          {time}
        </span>
      </div>
    </li>
  );
}

// ─── Filter rows ──────────────────────────────────────────────────────────

function FilterRow({
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
      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mr-1">
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

function ActorFilterRow({
  actors,
  value,
  onChange,
}: {
  actors: Array<{ id: string; name: string; role: string | null }>;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mr-1 inline-flex items-center gap-1">
        <UserIcon className="w-3 h-3" />
        Actor:
      </span>
      <button
        onClick={() => onChange('all')}
        className={cn(
          'px-2 h-6 rounded text-[11px] font-semibold transition-colors focus-ring',
          value === 'all'
            ? 'bg-slate-900 text-white'
            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
        )}
      >
        All
      </button>
      {actors.map((a) => (
        <button
          key={a.id}
          onClick={() => onChange(a.id)}
          className={cn(
            'px-2 h-6 rounded text-[11px] font-semibold transition-colors focus-ring inline-flex items-center gap-1',
            value === a.id
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          )}
        >
          {a.name}
          {a.role && (
            <span className="text-[9px] opacity-70">({a.role})</span>
          )}
        </button>
      ))}
    </div>
  );
}
