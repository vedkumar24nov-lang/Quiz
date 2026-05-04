import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { QuestionCard } from '@/components/quiz/QuestionCard';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { getTopicById, getChapterByTopic } from '@/data/subjects';
import { getQuestionsByTopic } from '@/data/questions';
import { useQuizActions, useQuizSession } from '@/store/quizStore';
import { cn } from '@/lib/cn';

const TOPIC_TEST_DURATION_SECONDS = 15 * 60; // 15-minute Topic Test (default per spec §5.2)

export function TestQuiz() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const session = useQuizSession();
  const actions = useQuizActions();

  const [secondsRemaining, setSecondsRemaining] = useState(TOPIC_TEST_DURATION_SECONDS);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);

  const topic = topicId ? getTopicById(topicId) : undefined;
  const chapter = topicId ? getChapterByTopic(topicId) : undefined;

  // Initialize Test session
  useEffect(() => {
    if (!topic || !chapter) return;
    if (session && session.topicId === topic.id && session.mode === 'test') return;

    const questions = getQuestionsByTopic(topic.id);
    if (questions.length === 0) return;

    actions.startSession({
      attemptId: `att-${Date.now()}`,
      topicId: topic.id,
      topicName: topic.name,
      chapterName: chapter.name,
      mode: 'test',
      formatTemplate: 'Topic',
      questions,
      durationLimitSeconds: TOPIC_TEST_DURATION_SECONDS,
    });
    setSecondsRemaining(TOPIC_TEST_DURATION_SECONDS);
  }, [topic, chapter, session, actions]);

  // Countdown ticker
  useEffect(() => {
    if (!session || autoSubmitted) return;
    const interval = setInterval(() => {
      setSecondsRemaining((s) => {
        if (s <= 1) {
          clearInterval(interval);
          setAutoSubmitted(true);
          // auto-submit after one tick
          setTimeout(() => {
            const attempt = actions.submit();
            if (attempt) navigate(`/report/${attempt.id}`);
          }, 50);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [session, autoSubmitted, actions, navigate]);

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
        <p className="text-slate-600">Loading test…</p>
      </div>
    );
  }

  function handleAnswer(answer: string | number) {
    if (!session || !currentQuestion) return;
    actions.recordAnswer(currentQuestion.id, answer);
  }

  function handleManualSubmit() {
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
  const isLastQuestion = session.currentIndex === session.questions.length - 1;

  return (
    <>
      <QuizHeader
        topicName={topic.name}
        modeLabel={`Test mode · Topic Test (${session.questions.length} Qs)`}
        timerSeconds={secondsRemaining}
        isCountdown={true}
        onExit={() => setShowExitConfirm(true)}
      />

      <div className="container-page py-5 sm:py-6 max-w-3xl">
        {/* Question palette — Test-mode style */}
        <div className="grid grid-cols-10 sm:flex sm:flex-wrap gap-1.5 mb-5">
          {session.questions.map((q, idx) => {
            const a = session.answers[q.id];
            const isCurrent = idx === session.currentIndex;
            const status = !a
              ? 'unseen'
              : a.studentAnswer === null
              ? 'skipped'
              : 'answered'; // Test mode hides correctness
            return (
              <button
                key={q.id}
                onClick={() => actions.goToQuestion(idx)}
                className={cn(
                  'w-9 h-9 rounded-md text-xs font-semibold transition-all focus-ring',
                  isCurrent && 'ring-2 ring-brand-500 ring-offset-1',
                  status === 'unseen' && 'bg-slate-100 text-slate-600 hover:bg-slate-200',
                  status === 'answered' && 'bg-brand-600 text-white',
                  status === 'skipped' && 'bg-slate-300 text-slate-700'
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
          allowSolutionReveal={false} /* Test mode never shows mid-quiz solutions */
          onAnswer={handleAnswer}
        />

        {/* Footer nav — Test mode: no Skip button (silent skip per spec §5.6.2) */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <Button
            variant="secondary"
            onClick={() => actions.prev()}
            disabled={session.currentIndex === 0}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={() => setShowSubmitConfirm(true)}
              leftIcon={<Flag className="w-4 h-4" />}
            >
              Submit test
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

        {/* Footer status */}
        <div className="mt-6 text-center text-xs text-slate-500">
          {answered} of {session.questions.length} answered
        </div>
      </div>

      {showExitConfirm && (
        <ConfirmModal
          title="Exit test?"
          body="The test will be lost. To preserve your attempt, submit instead."
          confirmLabel="Exit"
          confirmVariant="danger"
          onCancel={() => setShowExitConfirm(false)}
          onConfirm={handleExit}
        />
      )}

      {showSubmitConfirm && (
        <ConfirmModal
          title="Submit test?"
          body={`You answered ${answered} of ${session.questions.length}. Once submitted, the test is final.`}
          confirmLabel="Submit"
          onCancel={() => setShowSubmitConfirm(false)}
          onConfirm={handleManualSubmit}
        />
      )}

      {/* Auto-submit splash */}
      {autoSubmitted && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 flex items-center justify-center animate-fade-in">
          <div className="bg-white rounded-2xl p-8 text-center shadow-2xl max-w-sm">
            <div className="text-2xl font-bold text-slate-900">Time's up.</div>
            <p className="text-sm text-slate-600 mt-2">
              Submitting your test…
            </p>
          </div>
        </div>
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
