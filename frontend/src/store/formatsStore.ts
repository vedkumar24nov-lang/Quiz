import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ExamFormat, MarkingPoints } from '@/types';
import { SEED_EXAM_FORMATS, findSystemFormatById } from '@/data/examFormats';
import { auditLog } from './auditStore';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface FormatDraft {
  name: string;
  description?: string;
  durationMinutes: number;
  totalQuestions: number;
  markingMcq: MarkingPoints;
  markingNumerical: MarkingPoints | null;
}

interface FormatsState {
  formats: ExamFormat[];

  addFormat: (draft: FormatDraft) => string;
  updateFormat: (id: string, patch: Partial<FormatDraft>) => void;
  archiveFormat: (id: string) => void;
  restoreFormat: (id: string) => void;
  /**
   * Reset a system-seeded format back to its original values. The "Restore
   * default" button on system formats calls this — it's the safety net for
   * fat-fingered edits to JEE Main / NEET / etc.
   */
  restoreSystemFormat: (id: string) => void;
  /** Re-seed everything (admin-level reset). */
  resetAll: () => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `fmt-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `fmt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function cloneSeed(): ExamFormat[] {
  // Deep clone — don't let mutations leak back into the imported module
  return JSON.parse(JSON.stringify(SEED_EXAM_FORMATS));
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useFormatsStore = create<FormatsState>()(
  persist(
    (set) => ({
      formats: cloneSeed(),

      addFormat: (draft) => {
        const id = makeId();
        const ts = nowIso();
        set((state) => ({
          formats: [
            ...state.formats,
            {
              ...draft,
              id,
              isSystem: false,
              createdAt: ts,
              updatedAt: ts,
            },
          ],
        }));
        auditLog({
          type: 'examFormat',
          action: 'create',
          id,
          label: draft.name,
        });
        return id;
      },

      updateFormat: (id, patch) =>
        set((state) => {
          const existing = state.formats.find((f) => f.id === id);
          if (existing) {
            auditLog({
              type: 'examFormat',
              action: 'update',
              id,
              label: existing.name,
              details: { changedKeys: Object.keys(patch) },
            });
          }
          return {
            formats: state.formats.map((f) =>
              f.id === id ? { ...f, ...patch, updatedAt: nowIso() } : f
            ),
          };
        }),

      archiveFormat: (id) =>
        set((state) => {
          const existing = state.formats.find((f) => f.id === id);
          if (existing) {
            auditLog({ type: 'examFormat', action: 'archive', id, label: existing.name });
          }
          return {
            formats: state.formats.map((f) =>
              f.id === id ? { ...f, archivedAt: nowIso() } : f
            ),
          };
        }),

      restoreFormat: (id) =>
        set((state) => {
          const existing = state.formats.find((f) => f.id === id);
          if (existing) {
            auditLog({ type: 'examFormat', action: 'restore', id, label: existing.name });
          }
          return {
            formats: state.formats.map((f) => {
              if (f.id !== id) return f;
              const { archivedAt: _omit, ...rest } = f;
              return rest;
            }),
          };
        }),

      restoreSystemFormat: (id) =>
        set((state) => {
          const original = findSystemFormatById(id);
          if (!original) return state;
          auditLog({
            type: 'examFormat',
            action: 'reset-seed',
            id,
            label: original.name,
            details: { restoredFromSeed: true },
          });
          // Replace this format entirely with a fresh copy of the original
          const fresh: ExamFormat = JSON.parse(JSON.stringify(original));
          return {
            formats: state.formats.map((f) => (f.id === id ? fresh : f)),
          };
        }),

      resetAll: () => {
        set({ formats: cloneSeed() });
        auditLog({
          type: 'examFormat',
          action: 'reset-seed',
          id: 'all',
          label: 'Reset all exam formats to seed',
        });
      },
    }),
    {
      name: 'preplab-formats',
      version: 1,
    }
  )
);

// ─── Convenience selectors ─────────────────────────────────────────────────

export const useFormats = () => useFormatsStore((s) => s.formats);

export const useActiveFormats = () => {
  const formats = useFormatsStore((s) => s.formats);
  return useMemo(() => formats.filter((f) => !f.archivedAt), [formats]);
};

export const useFormatById = (id: string | undefined) =>
  useFormatsStore((s) => (id ? s.formats.find((f) => f.id === id) : undefined));

/**
 * Whether a format has diverged from its seeded defaults. Drives the
 * "Restore default" affordance: only enabled when there's something to undo.
 */
export function hasDivergedFromSeed(format: ExamFormat): boolean {
  if (!format.isSystem) return false;
  const original = findSystemFormatById(format.id);
  if (!original) return false;
  // Compare the user-meaningful fields only (skip timestamps).
  return (
    format.name !== original.name ||
    format.description !== original.description ||
    format.durationMinutes !== original.durationMinutes ||
    format.totalQuestions !== original.totalQuestions ||
    format.markingMcq.correct !== original.markingMcq.correct ||
    format.markingMcq.wrong !== original.markingMcq.wrong ||
    JSON.stringify(format.markingNumerical) !== JSON.stringify(original.markingNumerical)
  );
}
