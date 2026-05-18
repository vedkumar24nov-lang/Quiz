import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  LifeBuoy,
  Plus,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useAuthUser } from '@/store/authStore';
import {
  useTicketsByOpener,
  useTicketsStore,
  TICKET_CATEGORY_LABELS,
  TICKET_STATUS_LABELS,
} from '@/store/ticketsStore';
import type {
  SupportTicket,
  TicketCategory,
  TicketStatus,
} from '@/types';
import { cn } from '@/lib/cn';

const STATUS_TONE: Record<TicketStatus, 'amber' | 'brand' | 'success' | 'neutral'> = {
  open: 'amber',
  'in-progress': 'brand',
  resolved: 'success',
  closed: 'neutral',
};

export function Support() {
  const me = useAuthUser();
  const myTickets = useTicketsByOpener(me?.id);
  const openTicket = useTicketsStore((s) => s.openTicket);
  const reopenTicket = useTicketsStore((s) => s.reopenTicket);
  const deleteForever = useTicketsStore((s) => s.deleteForever);
  const location = useLocation();

  const [composeOpen, setComposeOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | TicketStatus>('all');

  // Allow other pages to open the compose modal via ?new=1 in the URL.
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === '1') setComposeOpen(true);
  }, [location.search]);

  const counts = useMemo(
    () => ({
      total: myTickets.length,
      open: myTickets.filter((t) => t.status === 'open').length,
      inProgress: myTickets.filter((t) => t.status === 'in-progress').length,
      resolved: myTickets.filter((t) => t.status === 'resolved').length,
      closed: myTickets.filter((t) => t.status === 'closed').length,
    }),
    [myTickets]
  );

  const visible = useMemo(() => {
    if (filter === 'all') return myTickets;
    return myTickets.filter((t) => t.status === filter);
  }, [myTickets, filter]);

  return (
    <div className="container-page py-6 sm:py-8 max-w-4xl space-y-5">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-brand-600" />
            Help &amp; Feedback
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-prose">
            Report a bug, ask for help, or request a feature. An admin reads every ticket and replies right here. Use <strong>"Report this question"</strong> on a Report page instead if it's a specific question that's broken.
          </p>
        </div>
        <Button
          leftIcon={<Plus className="w-4 h-4" />}
          size="sm"
          onClick={() => setComposeOpen(true)}
        >
          New ticket
        </Button>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <FilterChip
          active={filter === 'all'}
          label={`All (${counts.total})`}
          onClick={() => setFilter('all')}
        />
        <FilterChip
          active={filter === 'open'}
          label={`Open (${counts.open})`}
          onClick={() => setFilter('open')}
        />
        <FilterChip
          active={filter === 'in-progress'}
          label={`In progress (${counts.inProgress})`}
          onClick={() => setFilter('in-progress')}
        />
        <FilterChip
          active={filter === 'resolved'}
          label={`Resolved (${counts.resolved})`}
          onClick={() => setFilter('resolved')}
        />
        <FilterChip
          active={filter === 'closed'}
          label={`Closed (${counts.closed})`}
          onClick={() => setFilter('closed')}
        />
      </div>

      {visible.length === 0 ? (
        <Card padding="lg" className="text-center">
          <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-brand-100 text-brand-700 mb-3">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-700 font-semibold">
            {myTickets.length === 0 ? "You haven't opened any tickets yet." : 'No tickets in this view.'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {myTickets.length === 0
              ? 'Hit "New ticket" if something\'s wrong, missing, or annoying. Admin will see it.'
              : 'Try a different filter.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {visible.map((t) => (
            <TicketRow
              key={t.id}
              ticket={t}
              onReopen={() => reopenTicket(t.id)}
              onDelete={() => deleteForever(t.id)}
            />
          ))}
        </div>
      )}

      {composeOpen && me && (
        <ComposeTicketModal
          openerName={me.name}
          openerEmail={me.email}
          pageHint={location.pathname === '/support' ? undefined : location.pathname}
          onClose={() => setComposeOpen(false)}
          onSubmit={(draft) => {
            openTicket({
              ...draft,
              openerId: me.id,
              openerName: me.name,
              openerEmail: me.email,
              openerRole: me.role,
            });
            setComposeOpen(false);
          }}
        />
      )}
    </div>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-2.5 h-8 rounded-md text-xs font-semibold border focus-ring transition-colors',
        active
          ? 'bg-brand-50 text-brand-900 border-brand-300'
          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
      )}
    >
      {label}
    </button>
  );
}

function TicketRow({
  ticket,
  onReopen,
  onDelete,
}: {
  ticket: SupportTicket;
  onReopen: () => void;
  onDelete: () => void;
}) {
  const isClosed = ticket.status === 'resolved' || ticket.status === 'closed';
  return (
    <Card padding="md">
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone={STATUS_TONE[ticket.status]}>
            {TICKET_STATUS_LABELS[ticket.status]}
          </Badge>
          <Badge tone="neutral">{TICKET_CATEGORY_LABELS[ticket.category]}</Badge>
          <span className="text-xs text-slate-400 ml-auto font-mono">
            opened {new Date(ticket.openedAt).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-slate-900">{ticket.subject}</h3>
        <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-3">{ticket.body}</p>

        {ticket.pageContext && (
          <div className="text-[11px] text-slate-500">
            <span className="font-bold uppercase tracking-wide">Page:</span>{' '}
            <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">
              {ticket.pageContext}
            </code>
          </div>
        )}

        {ticket.adminReply && (
          <div className="rounded-md p-2.5 bg-emerald-50 border border-emerald-200">
            <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Admin reply
              {ticket.handledByName && (
                <span className="font-normal normal-case text-emerald-600 ml-1">
                  · {ticket.handledByName}
                </span>
              )}
            </div>
            <p className="text-sm text-emerald-900 mt-0.5 whitespace-pre-wrap">
              {ticket.adminReply}
            </p>
          </div>
        )}

        {isClosed && (
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={onReopen}
              title="Not satisfied? Reopen and the admin will see it again."
            >
              Reopen
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={onDelete}
              title="Delete this ticket from your history. Admin's record is unaffected."
            >
              Delete
            </Button>
          </div>
        )}

        {!isClosed && ticket.status === 'in-progress' && (
          <div className="text-[11px] text-brand-700 inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Admin is working on this.
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── Compose modal ─────────────────────────────────────────────────────────

function ComposeTicketModal({
  openerName,
  openerEmail,
  pageHint,
  onClose,
  onSubmit,
}: {
  openerName: string;
  openerEmail: string;
  pageHint?: string;
  onClose: () => void;
  onSubmit: (draft: {
    category: TicketCategory;
    subject: string;
    body: string;
    pageContext?: string;
  }) => void;
}) {
  const [category, setCategory] = useState<TicketCategory>('bug');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [includePage, setIncludePage] = useState(!!pageHint);

  const trimmedSubject = subject.trim();
  const trimmedBody = body.trim();
  const valid = trimmedSubject.length >= 5 && trimmedBody.length >= 10;

  function handleSubmit() {
    if (!valid) return;
    onSubmit({
      category,
      subject: trimmedSubject,
      body: trimmedBody,
      pageContext: includePage && pageHint ? pageHint : undefined,
    });
  }

  const categories: TicketCategory[] = [
    'bug',
    'content',
    'feature-request',
    'account-help',
    'other',
  ];

  return (
    <Modal
      open
      onClose={onClose}
      title="Open a support ticket"
      description={`Filed as ${openerName} (${openerEmail}). An admin will read this and reply on the Help & Feedback page.`}
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            leftIcon={<Send className="w-3.5 h-3.5" />}
            onClick={handleSubmit}
            disabled={!valid}
          >
            Send ticket
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Category <span className="text-red-600">*</span>
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={cn(
                  'text-left rounded-md border-2 p-2.5 text-xs transition-all focus-ring',
                  category === c
                    ? 'border-brand-500 bg-brand-50 text-brand-900 font-semibold'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300'
                )}
              >
                {TICKET_CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="block text-xs font-semibold text-slate-700 mb-1.5">
            Subject <span className="text-red-600">*</span>
          </span>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="One-line summary of what's going on."
            className="w-full h-10 px-3 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-brand-500"
            autoFocus
          />
        </label>

        <label className="block">
          <span className="block text-xs font-semibold text-slate-700 mb-1.5">
            Details <span className="text-red-600">*</span>
          </span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What were you trying to do? What happened? What did you expect? Steps to reproduce help a lot for bugs."
            rows={5}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-brand-500 resize-none"
          />
        </label>

        {pageHint && (
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includePage}
              onChange={(e) => setIncludePage(e.target.checked)}
              className="w-4 h-4 mt-0.5 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs text-slate-700">
              Attach the page I was on:{' '}
              <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">
                {pageHint}
              </code>
              <span className="block text-[11px] text-slate-500 mt-0.5">
                Helps admin reproduce bugs faster. Uncheck if it's not relevant.
              </span>
            </span>
          </label>
        )}

        {!valid && (subject || body) && (
          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-2.5 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <ul className="space-y-0.5">
              {trimmedSubject.length < 5 && <li>Subject needs at least 5 characters.</li>}
              {trimmedBody.length < 10 && <li>Details need at least 10 characters.</li>}
            </ul>
          </div>
        )}
      </div>
    </Modal>
  );
}
