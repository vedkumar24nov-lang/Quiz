import { create } from 'zustand';
import type {
  Question,
  QuizMode,
  SkipReason,
  AttemptAnswer,
  Attempt,
} from '@/types';

interface ActiveSession {
  attemptId: string;
  topicId: string;
  topicName: string;
  chapterName: string;
  mode: QuizMode;
  formatTemplate?: 'JEE Main' | 'Topic' | 'Custom';
  questions: Question[];
  currentIndex: number;
  answers: Record<string, AttemptAnswer>; // keyed by questionId
  startedAt: number; // ms epoch
  durationLimitSeconds?: number; // Test mode only
  perQuestionStartMs: number; // when current Q became visible
  stopwatchPaused: boolean; // Practice: pauses on skip overlay
  pausedElapsedMs: number; // total ms spent paused
  pauseStartedMs: number | null;
}

interface QuizActions {
  startSession: (params: {
    attemptId: string;
    topicId: string;
    topicName: string;
    chapterName: string;
    mode: QuizMode;
    formatTemplate?: 'JEE Main' | 'Topic' | 'Custom';
    questions: Question[];
    durationLimitSeconds?: number;
  }) => void;
  recordAnswer: (questionId: string, studentAnswer: string | number) => void;
  recordSkip: (questionId: string, reason: SkipReason) => void;
  goToQuestion: (index: number) => void;
  next: () => void;
  prev: () => void;
  pauseStopwatch: () => void;
  resumeStopwatch: () => void;
  submit: () => Attempt | null;
  reset: () => void;
}

interface QuizStore {
  session: ActiveSession | null;
  lastSubmitted: Attempt | null;
  actions: QuizActions;
}

function getElapsedMs(s: ActiveSession): number {
  const total = Date.now() - s.startedAt;
  let pausedMs = s.pausedElapsedMs;
  if (s.stopwatchPaused && s.pauseStartedMs) {
    pausedMs += Date.now() - s.pauseStartedMs;
  }
  return total - pausedMs;
}

function evaluateAnswer(q: Question, studentAnswer: string | number): boolean {
  if (q.format === 'mcq') {
    return Number(studentAnswer) === Number(q.correctAnswer);
  }
  // numerical: tolerant compare (within ±0.01)
  const s = typeof studentAnswer === 'number' ? studentAnswer : parseFloat(String(studentAnswer));
  const c = typeof q.correctAnswer === 'number' ? q.correctAnswer : parseFloat(String(q.correctAnswer));
  if (Number.isNaN(s) || Number.isNaN(c)) return false;
  return Math.abs(s - c) < 0.01;
}

// Per-Q delta per spec §5.5.1: Easy +3, Medium +4, Hard +5; wrong −2; skipped 0
function deltaForAnswer(q: Question, isCorrect: boolean | null): number {
  if (isCorrect === null) return 0;
  if (!isCorrect) return -2;
  if (q.difficulty === 'Easy') return 3;
  if (q.difficulty === 'Medium') return 4;
  return 5;
}
function maxDelta(q: Question): number {
  if (q.difficulty === 'Easy') return 3;
  if (q.difficulty === 'Medium') return 4;
  return 5;
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  session: null,
  lastSubmitted: null,
  actions: {
    startSession: (params) => {
      const now = Date.now();
      set({
        session: {
          attemptId: params.attemptId,
          topicId: params.topicId,
          topicName: params.topicName,
          chapterName: params.chapterName,
          mode: params.mode,
          formatTemplate: params.formatTemplate,
          questions: params.questions,
          currentIndex: 0,
          answers: {},
          startedAt: now,
          durationLimitSeconds: params.durationLimitSeconds,
          perQuestionStartMs: now,
          stopwatchPaused: false,
          pausedElapsedMs: 0,
          pauseStartedMs: null,
        },
        lastSubmitted: null,
      });
    },

    recordAnswer: (questionId, studentAnswer) => {
      const s = get().session;
      if (!s) return;
      const q = s.questions.find((x) => x.id === questionId);
      if (!q) return;
      const isCorrect = evaluateAnswer(q, studentAnswer);
      const timeSpent = Math.floor((Date.now() - s.perQuestionStartMs) / 1000);
      set({
        session: {
          ...s,
          answers: {
            ...s.answers,
            [questionId]: {
              questionId,
              studentAnswer,
              isCorrect,
              timeSpentSeconds: timeSpent,
              skipReason: undefined,
            },
          },
        },
      });
    },

    recordSkip: (questionId, reason) => {
      const s = get().session;
      if (!s) return;
      const timeSpent = Math.floor((Date.now() - s.perQuestionStartMs) / 1000);
      set({
        session: {
          ...s,
          answers: {
            ...s.answers,
            [questionId]: {
              questionId,
              studentAnswer: null,
              isCorrect: null,
              timeSpentSeconds: timeSpent,
              skipReason: reason,
            },
          },
        },
      });
    },

    goToQuestion: (index) => {
      const s = get().session;
      if (!s) return;
      if (index < 0 || index >= s.questions.length) return;
      set({
        session: {
          ...s,
          currentIndex: index,
          perQuestionStartMs: Date.now(),
        },
      });
    },

    next: () => {
      const s = get().session;
      if (!s) return;
      get().actions.goToQuestion(Math.min(s.currentIndex + 1, s.questions.length - 1));
    },

    prev: () => {
      const s = get().session;
      if (!s) return;
      get().actions.goToQuestion(Math.max(s.currentIndex - 1, 0));
    },

    pauseStopwatch: () => {
      const s = get().session;
      if (!s || s.stopwatchPaused) return;
      set({
        session: {
          ...s,
          stopwatchPaused: true,
          pauseStartedMs: Date.now(),
        },
      });
    },

    resumeStopwatch: () => {
      const s = get().session;
      if (!s || !s.stopwatchPaused || !s.pauseStartedMs) return;
      const additionalPause = Date.now() - s.pauseStartedMs;
      set({
        session: {
          ...s,
          stopwatchPaused: false,
          pauseStartedMs: null,
          pausedElapsedMs: s.pausedElapsedMs + additionalPause,
        },
      });
    },

    submit: () => {
      const s = get().session;
      if (!s) return null;

      const answersList: AttemptAnswer[] = s.questions.map(
        (q) =>
          s.answers[q.id] ?? {
            questionId: q.id,
            studentAnswer: null,
            isCorrect: null,
            timeSpentSeconds: 0,
            skipReason:
              s.mode === 'test' ? ('Ran out of time' as SkipReason) : undefined,
          }
      );

      const correct = answersList.filter((a) => a.isCorrect === true).length;
      const wrong = answersList.filter((a) => a.isCorrect === false).length;
      const skipped = answersList.filter((a) => a.isCorrect === null).length;

      const earnedDelta = answersList.reduce((sum, a) => {
        const q = s.questions.find((x) => x.id === a.questionId)!;
        return sum + deltaForAnswer(q, a.isCorrect);
      }, 0);
      const maxPossible = s.questions.reduce((sum, q) => sum + maxDelta(q), 0);
      const attemptScore = Math.max(
        0,
        Math.min(100, Math.round((Math.max(0, earnedDelta) / Math.max(1, maxPossible)) * 100))
      );

      const totalTimeSeconds = Math.floor(getElapsedMs(s) / 1000);

      const attempt: Attempt = {
        id: s.attemptId,
        topicId: s.topicId,
        topicName: s.topicName,
        chapterName: s.chapterName,
        mode: s.mode,
        formatTemplate: s.formatTemplate,
        totalQuestions: s.questions.length,
        attempted: correct + wrong,
        correct,
        wrong,
        skipped,
        totalTimeSeconds,
        scoreRaw: earnedDelta, // dummy: same as mastery delta in this prototype
        scoreMax: maxPossible,
        attemptScore0to100: attemptScore,
        startedAt: new Date(s.startedAt).toISOString(),
        completedAt: new Date().toISOString(),
        answers: answersList,
      };

      // Persist for the report page (S1.3 will read from sessionStorage if present)
      try {
        sessionStorage.setItem(`attempt:${attempt.id}`, JSON.stringify(attempt));
      } catch {
        // ignore storage errors in prototype
      }

      set({ session: null, lastSubmitted: attempt });
      return attempt;
    },

    reset: () => {
      set({ session: null, lastSubmitted: null });
    },
  },
}));

// Selector helpers
export const useQuizSession = () => useQuizStore((s) => s.session);
export const useQuizActions = () => useQuizStore((s) => s.actions);
export const useLastSubmitted = () => useQuizStore((s) => s.lastSubmitted);

export function getSessionElapsedSeconds(session: ActiveSession): number {
  return Math.floor(getElapsedMs(session) / 1000);
}
