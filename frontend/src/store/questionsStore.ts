import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Question } from '@/types';
import { QUESTIONS as SEED_QUESTIONS } from '@/data/questions';
import { auditLog } from './auditStore';

// Stem preview is the most useful label for an audit entry — IDs are opaque.
function shortLabel(stem: string): string {
  const trimmed = stem.trim();
  return trimmed.length <= 80 ? trimmed : trimmed.slice(0, 77) + '…';
}

// ─── Types ─────────────────────────────────────────────────────────────────

export type QuestionDraft = Omit<Question, 'id' | 'createdAt' | 'updatedAt' | 'archivedAt'>;

interface QuestionsState {
  questions: Question[];

  addQuestion: (draft: QuestionDraft) => string;
  updateQuestion: (id: string, patch: Partial<QuestionDraft>) => void;
  archiveQuestion: (id: string) => void;
  restoreQuestion: (id: string) => void;
  deleteForever: (id: string) => void;

  resetToSeed: () => void;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `q-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `q-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function seedQuestions(): Question[] {
  // Clone so mutations don't leak back into the imported module.
  return JSON.parse(JSON.stringify(SEED_QUESTIONS));
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useQuestionsStore = create<QuestionsState>()(
  persist(
    (set) => ({
      questions: seedQuestions(),

      addQuestion: (draft) => {
        const id = makeId();
        const ts = nowIso();
        set((state) => ({
          questions: [
            ...state.questions,
            {
              ...draft,
              id,
              createdAt: ts,
              updatedAt: ts,
            },
          ],
        }));
        auditLog({
          type: 'question',
          action: 'create',
          id,
          label: shortLabel(draft.stem),
          details: {
            difficulty: draft.difficulty,
            type: draft.type,
            format: draft.format,
            topicId: draft.topicId,
          },
        });
        return id;
      },

      updateQuestion: (id, patch) =>
        set((state) => {
          const existing = state.questions.find((q) => q.id === id);
          if (existing) {
            auditLog({
              type: 'question',
              action: 'update',
              id,
              label: shortLabel(patch.stem ?? existing.stem),
              details: { changedKeys: Object.keys(patch) },
            });
          }
          return {
            questions: state.questions.map((q) =>
              q.id === id ? { ...q, ...patch, updatedAt: nowIso() } : q
            ),
          };
        }),

      archiveQuestion: (id) =>
        set((state) => {
          const existing = state.questions.find((q) => q.id === id);
          if (existing) {
            auditLog({
              type: 'question',
              action: 'archive',
              id,
              label: shortLabel(existing.stem),
            });
          }
          return {
            questions: state.questions.map((q) =>
              q.id === id ? { ...q, archivedAt: nowIso() } : q
            ),
          };
        }),

      restoreQuestion: (id) =>
        set((state) => {
          const existing = state.questions.find((q) => q.id === id);
          if (existing) {
            auditLog({
              type: 'question',
              action: 'restore',
              id,
              label: shortLabel(existing.stem),
            });
          }
          return {
            questions: state.questions.map((q) => {
              if (q.id !== id) return q;
              const { archivedAt: _omit, ...rest } = q;
              return rest;
            }),
          };
        }),

      deleteForever: (id) =>
        set((state) => {
          const existing = state.questions.find((q) => q.id === id);
          if (existing) {
            auditLog({
              type: 'question',
              action: 'delete',
              id,
              label: shortLabel(existing.stem),
            });
          }
          return { questions: state.questions.filter((q) => q.id !== id) };
        }),

      resetToSeed: () => {
        set({ questions: seedQuestions() });
        auditLog({
          type: 'question',
          action: 'reset-seed',
          id: 'all',
          label: 'Reset question bank to seed',
        });
      },
    }),
    {
      name: 'preplab-questions',
      version: 1,
    }
  )
);

// ─── Convenience selectors ─────────────────────────────────────────────────

export const useQuestions = () => useQuestionsStore((s) => s.questions);

export const useActiveQuestions = () => {
  const questions = useQuestionsStore((s) => s.questions);
  return useMemo(() => questions.filter((q) => !q.archivedAt), [questions]);
};

export const useQuestionsByTopic = (topicId: string) => {
  const questions = useQuestionsStore((s) => s.questions);
  return useMemo(
    () => questions.filter((q) => q.topicId === topicId && !q.archivedAt),
    [questions, topicId]
  );
};

export const useQuestionById = (id: string) =>
  useQuestionsStore((s) => s.questions.find((q) => q.id === id));
