import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Flag,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useFlags, useFlagsStore, FLAG_REASON_LABELS } from '@/store/flagsStore';
import { useQuestionsStore } from '@/store/questionsStore';
import { useAuthUser } from '@/store/authStore';
import type { FlagStatus, QuestionFlag } from '@/types';
import { cn } from '@/lib/cn';

type Tab = FlagStatus | 'all';

interface ResolveTarget {
  flag: QuestionFlag;
  action: 'resolve' | 'dismiss';
}

export function AdminFlags() {
  const flags = useFlags();
  const questions = useQuestionsStore((s) => s.questions);
  const user = useAuthUser();
  const resolveFlag = useFlagsStore((s) => s.resolveFlag);
  const dismissFlag = useFlagsStore((s) => s.dismissFlag);
  const reopenFlag = useFlagsStore((s) => s.reopenFlag);
  const deleteForever = useFlagsStore((s) => s.deleteForever);

  const [tab, setTab] = useState<Tab>('open');
  const [target, setTarget] = useState<ResolveTarget | null>(null);
  const [resolverNote, setResolverNote] = useState('');

  const questionsById = useMemo(
    () => new Map(questions.map((q) => [q.id, q])),
    [questions]
  );

  const counts = useMemo(
    () => ({
      open: flags.filter((f) => f.status === 'open').length,
      resolved: flags.filter((f) => f.status === 'resolved').length,
      dismissed: flags.filter((f) => f.status === 'dismissed').length,
      total: flags.length,
    }),
    [flags]
  );

  const visible = useMemo(() => {
    if (tab === 'all') return flags;
    return flags.filter((f) => f.status === tab);
  }, [flags, tab]);

  function openResolve(flag: QuestionFlag, action: 'resolve' | 'dismiss') {
    setTarget({ flag, action });
    setResolverNote('');
  }

  function confirmResolve() {
    if (!target || !user) return;
    if (target.action === 'resolve') {
      resolveFlag(target.flag.id, user.id, resolverNote.trim() || undefined);
    } else {
      dismissFlag(target.flag.id, user.id, resolverNote.trim() || undefined);
    }
    setTarget(null);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Flag className="w-6 h-6 text-emerald-600" />
          Question Flags
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-prose">
          Quality reports from students — wrong answer keys, unclear stems, bad images. Triage them here. <strong>Resolve</strong> after fixing the question (or archive it). <strong>Dismiss</strong> when the flag was off-base.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <TabButton active={tab === 'open'} onClick={() => setTab('open')}>
          Open
          {counts.open > 0 && (
            <span className="ml-1.5 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
              {counts.open}
            </span>
          )}
        </TabButton>
        <TabButton active={tab === 'resolved'} onClick={() => setTab('resolved')}>
          Resolved
          <span className="ml-1.5 text-slate-400">{counts.resolved}</span>
        </TabButton>
        <TabButton active={tab === 'dismissed'} onClick={() => setTab('dismissed')}>
          Dismissed
          <span className="ml-1.5 text-slate-400">{counts.dismissed}</span>
        </TabButton>
        <TabButton active={tab === 'all'} onClick={() => setTab('all')}>
          All
          <span className="ml-1.5 text-slate-400">{counts.total}</span>
        </TabButton>
      </div>

      {visible.length === 0 ? (
        <Card padding="lg" className="text-center">
          <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-700 font-semibold">
            {tab === 'open' ? 'No open flags right now.' : 'Nothing in this tab.'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {tab === 'open'
              ? 'Quality is holding. Students can flag questions from the Wrong Answered tab of any Report — those land here.'
              : 'Switch tabs to see other states.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {visible.map((f) => (
            <FlagRow
              key={f.id}
              flag={f}
              question={questionsById.get(f.questionId)}
              onResolve={() => openResolve(f, 'resolve')}
              onDismiss={() => openResolve(f, 'dismiss')}
              onReopen={() => reopenFlag(f.id)}
              onDelete={() => deleteForever(f.id)}
            />
          ))}
        </div>
      )}

      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        title={
          target
            ? target.action === 'resolve'
              ? 'Resolve flag — fix shipped?'
              : 'Dismiss flag — student was off-base?'
            : ''
        }
        description={
          target?.action === 'resolve'
            ? 'Use this when you fixed the question (or archived it). The student who flagged it sees their report stays accurate going forward.'
            : 'Use this when the flag was a misunderstanding. The question stays unchanged and the flag is closed.'
        }
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setTarget(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              variant={target?.action === 'resolve' ? 'primary' : 'secondary'}
              leftIcon={
                target?.action === 'resolve' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )
              }
              onClick={confirmResolve}
            >
              {target?.action === 'resolve' ? 'Resolve' : 'Dismiss'}
            </Button>
          </>
        }
      >
        <label className="block">
          <span className="block text-xs font-semibold text-slate-700 mb-1.5">
            Note <span className="text-slate-400 font-normal">(optional)</span>
          </span>
          <textarea
            value={resolverNote}
            onChange={(e) => setResolverNote(e.target.value)}
            placeholder={
              target?.action === 'resolve'
                ? 'e.g. Fixed answer key from B → C; the original was a typo.'
                : 'e.g. Stem is correct as written — student misread the negative sign.'
            }
            rows={3}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-emerald-500 resize-none"
            autoFocus
          />
        </label>
      </Modal>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center h-11 px-4 text-sm font-semibold border-b-2 -mb-px transition-colors focus-ring rounded-t-md',
        active
          ? 'border-emerald-500 text-emerald-900 bg-emerald-50/40'
          : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
      )}
    >
      {children}
    </button>
  );
}

function FlagRow({
  flag,
  question,
  onResolve,
  onDismiss,
  onReopen,
  onDelete,
}: {
  flag: QuestionFlag;
  question: ReturnType<typeof useQuestionsStore.getState>['questions'][number] | undefined;
  onResolve: () => void;
  onDismiss: () => void;
  onReopen: () => void;
  onDelete: () => void;
}) {
  const isOpen = flag.status === 'open';
  const reasonLabel = FLAG_REASON_LABELS[flag.reason];

  return (
    <Card
      padding="md"
      className={cn(!isOpen && 'opacity-75')}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone={isOpen ? 'amber' : flag.status === 'resolved' ? 'success' : 'neutral'}>
            <span className="inline-flex items-center gap-1">
              <Flag className="w-3 h-3" />
              {flag.status}
            </span>
          </Badge>
          <Badge tone="neutral">{reasonLabel}</Badge>
          <span className="text-xs text-slate-500">
            by <span className="font-semibold text-slate-700">{flag.studentName ?? 'Anonymous'}</span>
          </span>
          <span className="text-xs text-slate-400 ml-auto font-mono">
            {new Date(flag.createdAt).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Question reference */}
        {question ? (
          <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mb-1">
              Question {flag.questionId}
            </div>
            <p className="text-sm text-slate-800 line-clamp-2">{question.stem}</p>
            <Link
              to="/author/questions"
              className="text-[11px] font-semibold text-emerald-700 hover:underline mt-1 inline-block"
            >
              Open in Questions →
            </Link>
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <div className="font-semibold">Question deleted or archived.</div>
              {flag.stemSnapshot && (
                <p className="mt-1 italic line-clamp-2">"{flag.stemSnapshot}"</p>
              )}
            </div>
          </div>
        )}

        {/* Student note */}
        {flag.note && (
          <div className="text-sm text-slate-700">
            <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 mr-1">
              Student note:
            </span>
            "{flag.note}"
          </div>
        )}

        {/* Resolver note */}
        {flag.resolverNote && (
          <div
            className={cn(
              'text-xs rounded-md p-2 border',
              flag.status === 'resolved'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            )}
          >
            <span className="font-bold uppercase tracking-wide text-[10px] mr-1">
              Admin {flag.status}:
            </span>
            {flag.resolverNote}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {isOpen ? (
            <>
              <Button
                size="sm"
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={onResolve}
              >
                Resolve
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<XCircle className="w-3.5 h-3.5" />}
                onClick={onDismiss}
              >
                Dismiss
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                onClick={onReopen}
              >
                Reopen
              </Button>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={onDelete}
                title="Delete forever — only do this for spam flags"
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
