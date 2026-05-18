import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuestionFlag, FlagReason } from '@/types';

export interface FlagDraft {
  questionId: string;
  reason: FlagReason;
  note?: string;
  stemSnapshot?: string;
  studentId: string | null;
  studentName: string | null;
}

interface FlagsState {
  flags: QuestionFlag[];

  addFlag: (draft: FlagDraft) => string;
  resolveFlag: (id: string, resolverId: string, resolverNote?: string) => void;
  dismissFlag: (id: string, resolverId: string, resolverNote?: string) => void;
  reopenFlag: (id: string) => void;
  deleteForever: (id: string) => void;

  resetAll: () => void;
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `flag-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `flag-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

export const useFlagsStore = create<FlagsState>()(
  persist(
    (set) => ({
      flags: [],

      addFlag: (draft) => {
        const id = makeId();
        set((state) => ({
          flags: [
            {
              id,
              questionId: draft.questionId,
              studentId: draft.studentId,
              studentName: draft.studentName,
              reason: draft.reason,
              note: draft.note,
              stemSnapshot: draft.stemSnapshot,
              status: 'open',
              createdAt: nowIso(),
            },
            ...state.flags,
          ],
        }));
        return id;
      },

      resolveFlag: (id, resolverId, resolverNote) =>
        set((state) => ({
          flags: state.flags.map((f) =>
            f.id === id
              ? {
                  ...f,
                  status: 'resolved',
                  resolvedAt: nowIso(),
                  resolvedBy: resolverId,
                  resolverNote,
                }
              : f
          ),
        })),

      dismissFlag: (id, resolverId, resolverNote) =>
        set((state) => ({
          flags: state.flags.map((f) =>
            f.id === id
              ? {
                  ...f,
                  status: 'dismissed',
                  resolvedAt: nowIso(),
                  resolvedBy: resolverId,
                  resolverNote,
                }
              : f
          ),
        })),

      reopenFlag: (id) =>
        set((state) => ({
          flags: state.flags.map((f) => {
            if (f.id !== id) return f;
            const { resolvedAt: _a, resolvedBy: _b, resolverNote: _c, ...rest } = f;
            return { ...rest, status: 'open' };
          }),
        })),

      deleteForever: (id) =>
        set((state) => ({ flags: state.flags.filter((f) => f.id !== id) })),

      resetAll: () => set({ flags: [] }),
    }),
    {
      name: 'preplab-flags',
      version: 1,
    }
  )
);

export const useFlags = () => useFlagsStore((s) => s.flags);

export const useOpenFlags = () => {
  const flags = useFlagsStore((s) => s.flags);
  return useMemo(() => flags.filter((f) => f.status === 'open'), [flags]);
};

export const useFlagsForQuestion = (questionId: string) => {
  const flags = useFlagsStore((s) => s.flags);
  return useMemo(() => flags.filter((f) => f.questionId === questionId), [flags, questionId]);
};

export const FLAG_REASON_LABELS: Record<FlagReason, string> = {
  'wrong-answer': 'Wrong answer key',
  'unclear-stem': 'Unclear / ambiguous stem',
  typo: 'Typo or formatting',
  'bad-image': 'Bad image / diagram',
  'off-syllabus': 'Off-syllabus / out of scope',
  other: 'Other',
};
