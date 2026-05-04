// Core domain types — mirror the schema we'll use in Postgres later (S3)

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type QuestionType = 'Recall' | 'Conceptual' | 'Analytical' | 'Application';
export type AnswerFormat = 'mcq' | 'numerical';

export type SkipReason =
  | 'Forgot the formula'
  | 'Conceptual gap'
  | 'Misread the question'
  | 'Will come back to it'
  | 'Ran out of time';

export interface Subject {
  id: string;
  name: string;
  chapters: Chapter[];
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  classLevel: 11 | 12;
  topics: Topic[];
}

export interface Topic {
  id: string;
  chapterId: string;
  name: string;
  questionCount: number;
  subtopics: Subtopic[];
}

export interface Subtopic {
  id: string;
  topicId: string;
  name: string;
  questionCount?: number;
}

export interface Question {
  id: string;
  topicId: string;
  /** Optional: questions can live at the topic level OR be tagged to a specific subtopic. */
  subtopicId?: string;
  difficulty: Difficulty;
  type: QuestionType;
  format: AnswerFormat;
  stem: string;
  options?: string[]; // MCQ only
  correctAnswer: string | number; // option index for MCQ, number for numerical
  solution: string;
  estimatedTimeSeconds?: number;
}

export interface AttemptAnswer {
  questionId: string;
  studentAnswer: string | number | null; // null = skipped
  isCorrect: boolean | null; // null = skipped
  timeSpentSeconds: number;
  skipReason?: SkipReason;
}

export type QuizMode = 'practice' | 'test';

export interface Attempt {
  id: string;
  topicId: string;
  topicName: string;
  chapterName: string;
  mode: QuizMode;
  formatTemplate?: 'JEE Main' | 'Topic' | 'Custom';
  totalQuestions: number;
  attempted: number;
  correct: number;
  wrong: number;
  skipped: number;
  totalTimeSeconds: number;
  scoreRaw: number; // marks per the format scheme
  scoreMax: number;
  attemptScore0to100: number; // normalized for mastery
  startedAt: string; // ISO
  completedAt: string;
  answers: AttemptAnswer[];
}

export interface MasteryEntry {
  topicId: string;
  topicName: string;
  chapterId: string;
  chapterName: string;
  score: number; // 0-100
  attemptsCount: number;
  lastAttemptedAt: string | null;
}

export type MasteryBand = 'weak' | 'low' | 'mid' | 'strong' | 'empty';

export function getMasteryBand(score: number | null): MasteryBand {
  if (score === null) return 'empty';
  if (score < 40) return 'weak';
  if (score < 60) return 'low';
  if (score < 80) return 'mid';
  return 'strong';
}
