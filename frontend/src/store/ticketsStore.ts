import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  SupportTicket,
  TicketCategory,
  TicketStatus,
  TicketAuthorRole,
} from '@/types';

export interface TicketDraft {
  category: TicketCategory;
  subject: string;
  body: string;
  pageContext?: string;
  openerId: string | null;
  openerName: string | null;
  openerEmail: string | null;
  openerRole: TicketAuthorRole | null;
}

interface TicketsState {
  tickets: SupportTicket[];

  openTicket: (draft: TicketDraft) => string;
  /** Admin updates status (in-progress / resolved / closed) and optionally posts a reply note. */
  updateTicketStatus: (
    id: string,
    status: TicketStatus,
    adminId: string,
    adminName: string,
    adminReply?: string
  ) => void;
  /** Opener can reopen their own ticket if admin's reply didn't satisfy them. */
  reopenTicket: (id: string) => void;
  deleteForever: (id: string) => void;
  resetAll: () => void;
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `tkt-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `tkt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export const useTicketsStore = create<TicketsState>()(
  persist(
    (set) => ({
      tickets: [],

      openTicket: (draft) => {
        const id = makeId();
        const ts = nowIso();
        set((state) => ({
          tickets: [
            {
              id,
              openerId: draft.openerId,
              openerName: draft.openerName,
              openerEmail: draft.openerEmail,
              openerRole: draft.openerRole,
              category: draft.category,
              subject: draft.subject,
              body: draft.body,
              pageContext: draft.pageContext,
              status: 'open',
              openedAt: ts,
              updatedAt: ts,
            },
            ...state.tickets,
          ],
        }));
        return id;
      },

      updateTicketStatus: (id, status, adminId, adminName, adminReply) =>
        set((state) => ({
          tickets: state.tickets.map((t) => {
            if (t.id !== id) return t;
            const ts = nowIso();
            return {
              ...t,
              status,
              adminReply: adminReply !== undefined ? adminReply : t.adminReply,
              handledBy: adminId,
              handledByName: adminName,
              updatedAt: ts,
              resolvedAt:
                status === 'resolved' || status === 'closed' ? ts : t.resolvedAt,
            };
          }),
        })),

      reopenTicket: (id) =>
        set((state) => ({
          tickets: state.tickets.map((t) => {
            if (t.id !== id) return t;
            const { resolvedAt: _r, ...rest } = t;
            return { ...rest, status: 'open', updatedAt: nowIso() };
          }),
        })),

      deleteForever: (id) =>
        set((state) => ({
          tickets: state.tickets.filter((t) => t.id !== id),
        })),

      resetAll: () => set({ tickets: [] }),
    }),
    {
      name: 'preplab-tickets',
      version: 1,
    }
  )
);

export const useTickets = () => useTicketsStore((s) => s.tickets);

export const useTicketsByOpener = (openerId: string | null | undefined) => {
  const tickets = useTicketsStore((s) => s.tickets);
  return useMemo(
    () => (openerId ? tickets.filter((t) => t.openerId === openerId) : []),
    [tickets, openerId]
  );
};

export const useOpenTickets = () => {
  const tickets = useTicketsStore((s) => s.tickets);
  return useMemo(
    () => tickets.filter((t) => t.status === 'open' || t.status === 'in-progress'),
    [tickets]
  );
};

export const useTicketById = (id: string | undefined) =>
  useTicketsStore((s) => (id ? s.tickets.find((t) => t.id === id) : undefined));

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  bug: 'Bug or broken feature',
  content: 'Question / content issue',
  'feature-request': 'Feature request',
  'account-help': 'Account help',
  other: 'Other',
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  'in-progress': 'In progress',
  resolved: 'Resolved',
  closed: 'Closed',
};
