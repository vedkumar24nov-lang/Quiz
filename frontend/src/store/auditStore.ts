import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuditEntry, AuditAction, AuditEntityType } from '@/types';
import { useAuthStore } from './authStore';

// ─── Cap ───────────────────────────────────────────────────────────────────
// LocalStorage gets unhappy past a few MB. Each entry is ~500 bytes when it
// has details, so 1000 entries ≈ 500KB — comfortable.
const MAX_ENTRIES = 1000;

// ─── State ─────────────────────────────────────────────────────────────────

interface AuditState {
  entries: AuditEntry[];
  log: (entry: Omit<AuditEntry, 'id' | 'timestamp' | 'actorId' | 'actorName' | 'actorRole'>) => void;
  clear: () => void;
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `aud-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `aud-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export const useAuditStore = create<AuditState>()(
  persist(
    (set) => ({
      entries: [],

      log: (partial) =>
        set((state) => {
          // Pull actor from authStore at log time. If no one's signed in
          // (shouldn't happen in author flow), record as anonymous.
          const user = useAuthStore.getState().user;
          const entry: AuditEntry = {
            id: makeId(),
            timestamp: new Date().toISOString(),
            actorId: user?.id ?? null,
            actorName: user?.name ?? null,
            actorRole: user?.role ?? null,
            ...partial,
          };
          // Newest first; cap retention.
          const next = [entry, ...state.entries];
          if (next.length > MAX_ENTRIES) next.length = MAX_ENTRIES;
          return { entries: next };
        }),

      clear: () => set({ entries: [] }),
    }),
    {
      name: 'preplab-audit',
      version: 1,
    }
  )
);

// ─── Helper ────────────────────────────────────────────────────────────────
// Stores call this from inside their mutators. Centralises the
// useAuditStore.getState().log() boilerplate and gives a tighter call-site.

export function auditLog(args: {
  type: AuditEntityType;
  action: AuditAction;
  id: string;
  label: string;
  details?: Record<string, unknown>;
}) {
  useAuditStore.getState().log({
    entityType: args.type,
    action: args.action,
    entityId: args.id,
    entityLabel: args.label,
    details: args.details,
  });
}

// ─── Selectors ─────────────────────────────────────────────────────────────

export const useAuditEntries = () => useAuditStore((s) => s.entries);
