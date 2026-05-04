import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, SkipForward, Flag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { SkipOverlay } from '@/components/quiz/SkipOverlay';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { getTopicById, getChapterByTopic } from '@/data/subjects';
import { getQuestionsByTopic } from '@/data/questions';
import { useQuizActions, useQuizSession, getSessionElapsedSeconds } from '@/store/quizStore';
import type { SkipReason } from '@/types';
import { cn } from '@/lib/cn';

export function PracticeQuiz() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const session = useQuizSession();
  const actions = useQuizActions();

  const [skipOverlayOpen, setSkipOverlayOpen] = useState(false);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  const topic = topicId ? getTopicById(topicId) : undefined;
  const chapter = topicId ? getChapterByTopic(topicId) : undefined;

  // Initialize session if not already running for this topic
  useEffect(() => {
    if (!topic || !chapter) return;
    if (session && session.topicId === topic.id && session.mode === 'practice') return;

    const questions = getQuestionsByTopic(topic.id);
    if (questions.length === 0) return;

    actions.startSession({
      attemptId: `att-${Date.now()}`,
      topicId: topic.id,
      topicName: topic.name,
      chapterName: chapter.name,
      mode: 'practice',
      questions,
    });
  }, [topic, chapter, session, actions]);

  // Tick the elapsed clock every second
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(() => {
      setElapsedSec(getSessionElapsedSeconds(session));
    }, 250);
    return () => clearInterval(interval);
  }, [session]);

  // Pause stopwatch when overlay opens; resume on close
  useEffect(() => {
    if (!session) return;
    if (skipOverlayOpen) actions.pauseStopwatch();
    else actions.resumeStopwatch();
  }, [skipOverlayOpen, session, actions]);

  const currentQuestion = useMemo(() => {
    if (!session) return null;
    return session.questions[session.currentIndex];
  }, [session]);

  const currentAnswer = useMemo(() => {
    if (!session || !currentQuestion) return undefined;
    return session.answers[currentQuestion.id];
  }, [session, currentQuestion]);

  if (!topic || !chapter) {
    return (
      <div className="container-page py-12 text-center">
        <p className="text-slate-600">Topic not found.</p>
        <Link to="/topics" className="text-brand-700 hover:underline">
          Back to Topics
        </Link>
      </div>
    );
  }

  if (!session || !currentQuestion) {
    return (
      <div className="container-page py-12 text-center">
        <p className="text-slate-600">Loading quiz…</p>
      </div>
    );
  }

  function handleAnswer(answer: string | number) {
    if (!session || !currentQuestion) return;
    actions.recordAnswer(currentQuestion.id, answer);
  }

  function handleSkipClick() {
    setSkipOverlayOpen(true);
  }

  function handleSkipTag(reason: SkipReason) {
    if (!session || !currentQuestion) return;
    actions.recordSkip(currentQuestion.id, reason);
    setSkipOverlayOpen(false);
    actions.next();
  }

  function handleSkipAutoTimeout() {
    if (!session || !currentQuestion) return;
    actions.recordSkip(currentQuestion.id, 'Conceptual gap');
    setSkipOverlayOpen(false);
    actions.next();
  }

  function handleSubmit() {
    const attempt = actions.submit();
    if (attempt) navigate(`/report/${attempt.id}`);
  }

  function handleExit() {
    setShowExitConfirm(false);
    actions.reset();
    navigate(`/topic/${topic!.id}`);
  }

  const answered = Object.values(session.answers).filter(
    (a) => a.studentAnswer !== null
  ).length;
  const skipped = Object.values(session.answers).filter(
    (a) => a.studentAnswer === null
  ).length;
  const isLastQuestion = session.currentIndex === session.questions.length - 1;
  const blanksCount = session.questions.length - answered - skipped;

  return (
    <>
      <QuizHeader
        topicName={topic.name}
        modeLabel="Practice mode · stopwatch"
        timerSeconds={elapsedSec}
        isCountdown={false}
        isPaused={session.stopwatchPaused}
        onExit={() => setShowExitConfirm(true)}
      />

      <div className="container-page py-5 sm:py-6 max-w-3xl">
        {/* Progress dots / palette */}
        <div className="flex items-center gap-1.5 mb-5 overflow-x-auto scrollbar-thin pb-1">
          {session.questions.map((q, idx) => {
            const a = session.answers[q.id];
            const isCurrent = idx === session.currentIndex;
            const status = !a
              ? 'unseen'
              : a.studentAnswer === null
              ? 'skipped'
              : a.isCorrect
              ? 'correct'
              : 'wrong';
            return (
              <button
                key={q.id}
                onClick={() => actions.goToQuestion(idx)}
                className={cn(
                  'flex-shrink-0 w-8 h-8 rounded-md text-xs font-semibold transition-all focus-ring',
                  isCurrent && 'ring-2 ring-brand-500 ring-offset-1',
                  status === 'unseen' && 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  status === 'correct' && 'bg-emerald-500 text-white',
                  status === 'wrong' && 'bg-red-500 text-white',
                  status === 'skipped' && 'bg-amber-400 text-white'
                )}
                aria-label={`Question ${idx + 1}, ${status}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <QuestionCard
          question={currentQuestion}
          questionNumber={session.currentIndex + 1}
          totalQuestions={session.questions.length}
          existingAnswer={currentAnswer}
          allowSolutionReveal={true}
          onAnswer={handleAnswer}
        />

        {/* Footer nav */}
        <div className="mt-5 flex items-center justify-between gap-3 flex-wrap">
          <Button
            variant="secondary"
            onClick={() => actions.prev()}
            disabled={session.currentIndex === 0}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {!currentAnswer || currentAnswer.studentAnswer === null ? (
              <Button
                variant="ghost"
                onClick={handleSkipClick}
                leftIcon={<SkipForward className="w-4 h-4" />}
              >
                Skip
              </Button>
            ) : null}

            {isLastQuestion ? (
              <Button
                onClick={() => setShowSubmitConfirm(true)}
                leftIcon={<Flag className="w-4 h-4" />}
              >
                Submit quiz
              </Button>
            ) : (
              <Button
                onClick={() => actions.next()}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next
              </Button>
            )}
          </div>
        </div>

        {/* Footer status */}
        <div className="mt-6 text-center text-xs text-slate-500">
          {answered} answered · {skipped} skipped · {blanksCount} unseen
        </div>
      </div>

      <SkipOverlay
        open={skipOverlayOpen}
        onTag={handleSkipTag}
        onAutoTimeout={handleSkipAutoTimeout}
      />

      {/* Exit confirm */}
      {showExitConfirm && (
        <ConfirmModal
          title="Exit quiz?"
          body="Your progress in this session will be lost. (Real attempts will autosave once the backend lands in S3.)"
          confirmLabel="Exit quiz"
          confirmVariant="danger"
          onCancel={() => setShowExitConfirm(false)}
          onConfirm={handleExit}
        />
      )}

      {/* Submit confirm */}
      {showSubmitConfirm && (
        <ConfirmModal
          title="Submit quiz?"
          body={
            blanksCount > 0
              ? `You have ${blanksCount} unseen question${blanksCount > 1 ? 's' : ''}. Submit anyway?`
              : 'You\'ve seen every question. Ready to see your report?'
          }
          confirmLabel="Submit"
          onCancel={() => setShowSubmitConfirm(false)}
          onConfirm={handleSubmit}
        />
      )}
    </>
  );
}

function ConfirmModal({
  title,
  body,
  confirmLabel,
  confirmVariant = 'primary',
  onCancel,
  onConfirm,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  confirmVariant?: 'primary' | 'danger';
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md shadow-2xl animate-slide-up p-6">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{body}</p>
        <div className="mt-5 flex gap-2 justify-end">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant={confirmVariant} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
