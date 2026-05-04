import { useState, useEffect } from 'react';
import { Check, X, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, DifficultyBadge, TypeBadge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import type { Question, AttemptAnswer } from '@/types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  existingAnswer: AttemptAnswer | undefined;
  allowSolutionReveal: boolean; // Practice = true, Test = false
  onAnswer: (answer: string | number) => void;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  existingAnswer,
  allowSolutionReveal,
  onAnswer,
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(
    existingAnswer && question.format === 'mcq' && existingAnswer.studentAnswer !== null
      ? Number(existingAnswer.studentAnswer)
      : null
  );
  const [numericInput, setNumericInput] = useState<string>(
    existingAnswer && question.format === 'numerical' && existingAnswer.studentAnswer !== null
      ? String(existingAnswer.studentAnswer)
      : ''
  );
  const [showSolution, setShowSolution] = useState(false);

  // Reset on question change
  useEffect(() => {
    setSelectedOption(
      existingAnswer && question.format === 'mcq' && existingAnswer.studentAnswer !== null
        ? Number(existingAnswer.studentAnswer)
        : null
    );
    setNumericInput(
      existingAnswer && question.format === 'numerical' && existingAnswer.studentAnswer !== null
        ? String(existingAnswer.studentAnswer)
        : ''
    );
    setShowSolution(false);
  }, [question.id, existingAnswer, question.format]);

  const isAnswered = existingAnswer !== undefined && existingAnswer.studentAnswer !== null;
  const correctIdx = Number(question.correctAnswer);

  function handleMcqClick(idx: number) {
    if (isAnswered) return;
    setSelectedOption(idx);
    onAnswer(idx);
  }

  function handleNumericSubmit() {
    if (isAnswered || !numericInput.trim()) return;
    const num = parseFloat(numericInput);
    if (Number.isNaN(num)) return;
    onAnswer(num);
  }

  return (
    <Card padding="lg" className="animate-slide-up">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <DifficultyBadge difficulty={question.difficulty} />
          <TypeBadge type={question.type} />
          <Badge tone="neutral">
            {question.format === 'mcq' ? 'MCQ' : 'Numerical'}
          </Badge>
        </div>
        <div className="text-xs text-slate-500 font-mono whitespace-nowrap">
          Q {questionNumber} / {totalQuestions}
        </div>
      </div>

      {/* Stem */}
      <div className="text-base sm:text-lg text-slate-900 leading-relaxed mb-6 whitespace-pre-wrap">
        {question.stem}
      </div>

      {/* Answer area */}
      {question.format === 'mcq' ? (
        <div className="space-y-2">
          {question.options?.map((opt, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = isAnswered && idx === correctIdx;
            const isWrong = isAnswered && isSelected && idx !== correctIdx;
            return (
              <button
                key={idx}
                onClick={() => handleMcqClick(idx)}
                disabled={isAnswered}
                className={cn(
                  'w-full text-left rounded-lg border-2 p-3.5 sm:p-4 transition-all focus-ring',
                  'flex items-center gap-3',
                  !isAnswered &&
                    'border-slate-200 bg-white hover:border-brand-400 hover:bg-brand-50/30 cursor-pointer',
                  isAnswered && !isSelected && !isCorrect && 'border-slate-200 bg-slate-50/50 opacity-60',
                  isCorrect && 'border-emerald-500 bg-emerald-50',
                  isWrong && 'border-red-500 bg-red-50'
                )}
              >
                <div
                  className={cn(
                    'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center font-semibold text-sm',
                    !isAnswered && 'border-slate-300 text-slate-600',
                    isCorrect && 'border-emerald-600 bg-emerald-600 text-white',
                    isWrong && 'border-red-600 bg-red-600 text-white',
                    isAnswered && !isSelected && !isCorrect && 'border-slate-300 text-slate-500'
                  )}
                >
                  {isCorrect ? (
                    <Check className="w-4 h-4" strokeWidth={3} />
                  ) : isWrong ? (
                    <X className="w-4 h-4" strokeWidth={3} />
                  ) : (
                    String.fromCharCode(65 + idx)
                  )}
                </div>
                <span className="flex-1 text-sm sm:text-base text-slate-900">{opt}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block">
            <div className="text-xs font-medium text-slate-700 mb-1.5">Enter your numerical answer</div>
            <input
              type="number"
              inputMode="decimal"
              step="any"
              value={numericInput}
              onChange={(e) => setNumericInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNumericSubmit();
              }}
              disabled={isAnswered}
              placeholder="e.g. 42 or 1.5"
              className={cn(
                'w-full h-14 px-4 text-2xl font-mono font-semibold border-2 rounded-lg focus-ring',
                !isAnswered && 'border-slate-300 focus:border-brand-500 bg-white',
                isAnswered &&
                  existingAnswer?.isCorrect &&
                  'border-emerald-500 bg-emerald-50 text-emerald-900',
                isAnswered &&
                  existingAnswer?.isCorrect === false &&
                  'border-red-500 bg-red-50 text-red-900'
              )}
            />
          </label>
          {!isAnswered && (
            <Button onClick={handleNumericSubmit} disabled={!numericInput.trim()}>
              Submit answer
            </Button>
          )}
          {isAnswered && existingAnswer?.isCorrect === false && (
            <div className="text-sm text-slate-700">
              <span className="font-semibold">Correct answer:</span>{' '}
              <span className="font-mono">{String(question.correctAnswer)}</span>
            </div>
          )}
        </div>
      )}

      {/* Solution reveal — Practice mode only, after answering */}
      {allowSolutionReveal && isAnswered && (
        <div className="mt-5 pt-5 border-t border-slate-200">
          <button
            onClick={() => setShowSolution((v) => !v)}
            className="text-sm font-semibold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1.5 focus-ring rounded px-1"
          >
            {showSolution ? (
              <>
                <EyeOff className="w-4 h-4" />
                Hide solution
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Show solution
              </>
            )}
          </button>
          {showSolution && (
            <div className="mt-3 p-4 bg-brand-50 border border-brand-200 rounded-lg animate-fade-in">
              <div className="text-xs font-semibold text-brand-700 uppercase tracking-wide mb-2">
                Worked solution
              </div>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {question.solution}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
