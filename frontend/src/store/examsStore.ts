import { useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Exam, MarkingPoints } from '@/types';
import { auditLog } from './auditStore';

export interface ExamDraft {
  trackId: string;
  name: string;
  description?: string;
  paperPatternId: string | null;
  customDurationMinutes?: number;
  customTotalQuestions?: number;
  customMarkingMcq?: MarkingPoints;
  customMarkingNumerical?: MarkingPoints | null;
  questionIds: string[];
  createdBy?: string;
}

interface ExamsState {
  exams: Exam[];

  addExam: (draft: ExamDraft) => string;
  updateExam: (id: string, patch: Partial<ExamDraft & { isPublished: boolean }>) => void;
  archiveExam: (id: string) => void;
  restoreExam: (id: string) => void;
  deleteForever: (id: string) => void;

  addQuestionToExam: (examId: string, questionId: string) => void;
  addQuestionsToExam: (examId: string, questionIds: string[]) => void;
  removeQuestionFromExam: (examId: string, questionId: string) => void;
  reorderQuestionInExam: (
    examId: string,
    questionId: string,
    direction: 'up' | 'down'
  ) => void;

  resetAll: () => void;
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `exam-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `exam-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function shiftItem<T>(arr: T[], index: number, direction: 'up' | 'down'): T[] {
  const next = [...arr];
  const target = direction === 'up' ? index - 1 : index + 1;
  if (target < 0 || target >= next.length) return arr;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export const useExamsStore = create<ExamsState>()(
  persist(
    (set) => ({
      exams: [],

      addExam: (draft) => {
        const id = makeId();
        const ts = nowIso();
        set((state) => ({
          exams: [
            ...state.exams,
            {
              ...draft,
              id,
              isPublished: false,
              createdAt: ts,
              updatedAt: ts,
            },
          ],
        }));
        auditLog({
          type: 'exam',
          action: 'create',
          id,
          label: draft.name,
          details: {
            trackId: draft.trackId,
            paperPatternId: draft.paperPatternId,
            questionCount: draft.questionIds.length,
          },
        });
        return id;
      },

      updateExam: (id, patch) =>
        set((state) => {
          const existing = state.exams.find((e) => e.id === id);
          if (existing) {
            const isPublishToggle =
              Object.keys(patch).length === 1 && 'isPublished' in patch;
            auditLog({
              type: 'exam',
              action: isPublishToggle
                ? patch.isPublished
                  ? 'publish'
                  : 'unpublish'
                : 'update',
              id,
              label: existing.name,
              details: { changedKeys: Object.keys(patch) },
            });
          }
          return {
            exams: state.exams.map((e) =>
              e.id === id ? { ...e, ...patch, updatedAt: nowIso() } : e
            ),
          };
        }),

      archiveExam: (id) =>
        set((state) => {
          const existing = state.exams.find((e) => e.id === id);
          if (existing) {
            auditLog({ type: 'exam', action: 'archive', id, label: existing.name });
          }
          return {
            exams: state.exams.map((e) =>
              e.id === id ? { ...e, archivedAt: nowIso() } : e
            ),
          };
        }),

      restoreExam: (id) =>
        set((state) => {
          const existing = state.exams.find((e) => e.id === id);
          if (existing) {
            auditLog({ type: 'exam', action: 'restore', id, label: existing.name });
          }
          return {
            exams: state.exams.map((e) => {
              if (e.id !== id) return e;
              const { archivedAt: _omit, ...rest } = e;
              return rest;
            }),
          };
        }),

      deleteForever: (id) =>
        set((state) => {
          const existing = state.exams.find((e) => e.id === id);
          if (existing) {
            auditLog({ type: 'exam', action: 'delete', id, label: existing.name });
          }
          return { exams: state.exams.filter((e) => e.id !== id) };
        }),

      addQuestionToExam: (examId, questionId) =>
        set((state) => {
          const existing = state.exams.find((e) => e.id === examId);
          if (existing && !existing.questionIds.includes(questionId)) {
            auditLog({
              type: 'exam',
              action: 'add-child',
              id: examId,
              label: existing.name,
              details: { questionId },
            });
          }
          return {
            exams: state.exams.map((e) => {
              if (e.id !== examId) return e;
              if (e.questionIds.includes(questionId)) return e;
              return { ...e, questionIds: [...e.questionIds, questionId], updatedAt: nowIso() };
            }),
          };
        }),

      addQuestionsToExam: (examId, questionIds) =>
        set((state) => {
          const existing = state.exams.find((e) => e.id === examId);
          if (!existing) return state;
          const fresh = questionIds.filter((q) => !existing.questionIds.includes(q));
          if (fresh.length === 0) return state;
          auditLog({
            type: 'exam',
            action: 'add-child',
            id: examId,
            label: existing.name,
            details: { added: fresh.length },
          });
          return {
            exams: state.exams.map((e) =>
              e.id !== examId
                ? e
                : { ...e, questionIds: [...e.questionIds, ...fresh], updatedAt: nowIso() }
            ),
          };
        }),

      removeQuestionFromExam: (examId, questionId) =>
        set((state) => {
          const existing = state.exams.find((e) => e.id === examId);
          if (existing && existing.questionIds.includes(questionId)) {
            auditLog({
              type: 'exam',
              action: 'remove-child',
              id: examId,
              label: existing.name,
              details: { questionId },
            });
          }
          return {
            exams: state.exams.map((e) => {
              if (e.id !== examId) return e;
              return {
                ...e,
                questionIds: e.questionIds.filter((q) => q !== questionId),
                updatedAt: nowIso(),
              };
            }),
          };
        }),

      reorderQuestionInExam: (examId, questionId, direction) =>
        set((state) => {
          const existing = state.exams.find((e) => e.id === examId);
          if (existing) {
            auditLog({
              type: 'exam',
              action: 'reorder',
              id: examId,
              label: existing.name,
              details: { questionId, direction },
            });
          }
          return {
            exams: state.exams.map((e) => {
              if (e.id !== examId) return e;
              const idx = e.questionIds.indexOf(questionId);
              if (idx < 0) return e;
              return {
                ...e,
                questionIds: shiftItem(e.questionIds, idx, direction),
                updatedAt: nowIso(),
              };
            }),
          };
        }),

      resetAll: () => {
        set({ exams: [] });
        auditLog({
          type: 'exam',
          action: 'reset-seed',
          id: 'all',
          label: 'Cleared all exams',
        });
      },
    }),
    {
      name: 'preplab-exams',
      version: 1,
    }
  )
);

export const useExams = () => useExamsStore((s) => s.exams);

export const useExamById = (id: string | undefined) =>
  useExamsStore((s) => (id ? s.exams.find((e) => e.id === id) : undefined));

export const useExamsForTrack = (trackId: string) => {
  const exams = useExamsStore((s) => s.exams);
  return useMemo(
    () => exams.filter((e) => e.trackId === trackId && !e.archivedAt),
    [exams, trackId]
  );
};

export const usePublishedExams = () => {
  const exams = useExamsStore((s) => s.exams);
  return useMemo(
    () => exams.filter((e) => !e.archivedAt && e.isPublished),
    [exams]
  );
};

export const usePublishedExamsForTrack = (trackId: string) => {
  const exams = useExamsStore((s) => s.exams);
  return useMemo(
    () => exams.filter((e) => e.trackId === trackId && !e.archivedAt && e.isPublished),
    [exams, trackId]
  );
};
