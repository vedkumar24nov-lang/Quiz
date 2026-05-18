import { useEffect, useMemo, useState } from 'react';
import {
  LifeBuoy,
  Send,
  Trash2,
  GraduationCap,
  PenSquare,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import {
  useTickets,
  useTicketsStore,
  TICKET_CATEGORY_LABELS,
  TICKET_STATUS_LABELS,
} from '@/store/ticketsStore';
import { useAuthUser } from '@/store/authStore';
import type {
  SupportTicket,
  TicketStatus,
  TicketAuthorRole,
} from '@/types';
import { cn } from '@/lib/cn';

const STATUS_TONE: Record<TicketStatus, 'amber' | 'brand' | 'success' | 'neutral'> = {
  open: 'amber',
  'in-progress': 'brand',
  resolved: 'success',
  closed: 'neutral',
};

const ROLE_ICON: Record<TicketAuthorRole, React.ReactNode> = {
  student: <GraduationCap className="w-3 h-3" />,
  author: <PenSquare className="w-3 h-3" />,
  admin: <ShieldCheck className="w-3 h-3" />,
};

interface ReplyTarget {
  ticket: SupportTicket;
  status: TicketStatus;
}

export function AdminTickets() {
  const tickets = useTickets();
  const me = useAuthUser();
  const updateStatus = useTicketsStore((s) => s.updateTicketStatus);
  const deleteForever = useTicketsStore((s) => s.deleteForever);

  const [tab, setTab] = useState<TicketStatus | 'all'>('open');
  const [replyTarget, setReplyTarget] = useState<ReplyTarget | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (replyTarget) {
      setReplyText(replyTarget.ticket.adminReply ?? '');
    }
  }, [replyTarget]);

  const counts = useMemo(
    () => ({
      open: tickets.filter((t) => t.status === 'open').length,
      'in-progress': tickets.filter((t) => t.status === 'in-progress').length,
      resolved: tickets.filter((t) => t.status === 'resolved').length,
      closed: tickets.filter((t) => t.status === 'closed').length,
      total: tickets.length,
    }),
    [tickets]
  );

  const visible = useMemo(() => {
    if (tab === 'all') return tickets;
    return tickets.filter((t) => t.status === tab);
  }, [tickets, tab]);

  function applyReply() {
    if (!replyTarget || !me) return;
    updateStatus(
      replyTarget.ticket.id,
      replyTarget.status,
      me.id,
      me.name,
      replyText.trim() || undefined
    );
    setReplyTarget(null);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <LifeBuoy className="w-6 h-6 text-emerald-600" />
          Support Tickets
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-prose">
          General help inbox from students and authors — bugs, feature requests, account help, anything that's not a specific question quality issue. <strong>Question Flags</strong> covers the latter; this is everything else.
        </p>
      </div>

      <div className="flex items-center gap-1 border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <Tab
          active={tab === 'open'}
          onClick={() => setTab('open')}
          badge={counts.open}
          activeBadge
        >
          Open
        </Tab>
        <Tab
          active={tab === 'in-progress'}
          onClick={() => setTab('in-progress')}
          badge={counts['in-progress']}
        >
          In progress
        </Tab>
        <Tab active={tab === 'resolved'} onClick={() => setTab('resolved')} badge={counts.resolved}>
          Resolved
        </Tab>
        <Tab active={tab === 'closed'} onClick={() => setTab('closed')} badge={counts.closed}>
          Closed
        </Tab>
        <Tab active={tab === 'all'} onClick={() => setTab('all')} badge={counts.total}>
          All
        </Tab>
      </div>

      {visible.length === 0 ? (
        <Card padding="lg" className="text-center">
          <div className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mb-3">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-700 font-semibold">
            {tab === 'open' ? 'Inbox zero — no open tickets.' : 'Nothing in this tab.'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {tab === 'open'
              ? 'Students and authors raise tickets from /support — those land here.'
              : 'Switch tabs to see other states.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {visible.map((t) => (
            <TicketRow
              key={t.id}
              ticket={t}
              onReply={(status) => setReplyTarget({ ticket: t, status })}
              onDelete={() => deleteForever(t.id)}
            />
          ))}
        </div>
      )}

      <Modal
        open={!!replyTarget}
        onClose={() => setReplyTarget(null)}
        title={
          replyTarget
            ? `Update "${replyTarget.ticket.subject}" → ${TICKET_STATUS_LABELS[replyTarget.status]}`
            : ''
        }
        description="Your reply is visible to the ticket opener on their Help & Feedback page. Empty replies are allowed if the status change speaks for itself."
        size="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setReplyTarget(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              leftIcon={<Send className="w-3.5 h-3.5" />}
              onClick={applyReply}
            >
              Save &amp; notify opener
            </Button>
          </>
        }
      >
        <label className="block">
          <span className="block text-xs font-semibold text-slate-700 mb-1.5">
            Reply to opener <span className="text-slate-400 font-normal">(optional)</span>
          </span>
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={
              replyTarget?.status === 'resolved'
                ? "e.g. Fixed in today's deploy — refresh and the timer should pause as expected. Thanks for the report!"
                : replyTarget?.status === 'in-progress'
                ? 'e.g. Looking into this — should have a fix by EOD tomorrow.'
                : replyTarget?.status === 'closed'
                ? 'e.g. Closing as duplicate of #abc1234. Tracking the fix there.'
                : ''
            }
            rows={5}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm focus-ring focus:border-emerald-500 resize-none"
            autoFocus
          />
        </label>
      </Modal>
    </div>
  );
}

function Tab({
  active,
  onClick,
  badge,
  activeBadge,
  children,
}: {
  active: boolean;
  onClick: () => void;
  badge: number;
  activeBadge?: boolean;
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
      {badge > 0 && (
        <span
          className={cn(
            'ml-1.5 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold',
            activeBadge ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function TicketRow({
  ticket,
  onReply,
  onDelete,
}: {
  ticket: SupportTicket;
  onReply: (status: TicketStatus) => void;
  onDelete: () => void;
}) {
  return (
    <Card padding="md">
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone={STATUS_TONE[ticket.status]}>
            {TICKET_STATUS_LABELS[ticket.status]}
          </Badge>
          <Badge tone="neutral">{TICKET_CATEGORY_LABELS[ticket.category]}</Badge>
          <span className="text-xs text-slate-500 inline-flex items-center gap-1">
            from{' '}
            <span className="font-semibold text-slate-700">
              {ticket.openerName ?? 'Unknown'}
            </span>
            {ticket.openerRole && (
              <span className="inline-flex items-center gap-0.5 text-[10px] uppercase tracking-wide text-slate-400">
                · {ROLE_ICON[ticket.openerRole]} {ticket.openerRole}
              </span>
            )}
          </span>
          <span className="text-xs text-slate-400 ml-auto font-mono">
            {new Date(ticket.openedAt).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </span>
        </div>

        <h3 className="text-sm font-semibold text-slate-900">{ticket.subject}</h3>
        <p className="text-sm text-slate-700 whitespace-pre-wrap line-clamp-4">{ticket.body}</p>

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
            <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              Your reply
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

        {/* Status actions */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          {ticket.status !== 'in-progress' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onReply('in-progress')}
            >
              Mark in progress
            </Button>
          )}
          {ticket.status !== 'resolved' && (
            <Button
              size="sm"
              onClick={() => onReply('resolved')}
            >
              Mark resolved
            </Button>
          )}
          {ticket.status !== 'closed' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReply('closed')}
            >
              Close
            </Button>
          )}
          {(ticket.status === 'resolved' || ticket.status === 'closed') && (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={onDelete}
              title="Hard-delete from the queue. Use sparingly."
            >
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
