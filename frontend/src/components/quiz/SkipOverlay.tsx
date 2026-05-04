import { useEffect, useState } from 'react';
import { Brain, BookX, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/cn';
import type { SkipReason } from '@/types';

const SKIP_TIMER_SECONDS = 15;

const REASONS: Array<{
  reason: Exclude<SkipReason, 'Ran out of time'>;
  icon: React.ReactNode;
  blurb: string;
  tone: string;
}> = [
  {
    reason: 'Forgot the formula',
    icon: <BookX className="w-5 h-5" />,
    blurb: "I knew this — just blanked on the formula",
    tone: 'border-amber-300 hover:bg-amber-50 hover:border-amber-400 text-amber-900',
  },
  {
    reason: 'Conceptual gap',
    icon: <Brain className="w-5 h-5" />,
    blurb: "I don't really understand this concept",
    tone: 'border-red-300 hover:bg-red-50 hover:border-red-400 text-red-900',
  },
  {
    reason: 'Misread the question',
    icon: <AlertCircle className="w-5 h-5" />,
    blurb: 'I read it wrong; I could have solved it',
    tone: 'border-blue-300 hover:bg-blue-50 hover:border-blue-400 text-blue-900',
  },
  {
    reason: 'Will come back to it',
    icon: <Clock className="w-5 h-5" />,
    blurb: 'Triaging — plan to revisit later in this quiz',
    tone: 'border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-900',
  },
];

interface SkipOverlayProps {
  open: boolean;
  onTag: (reason: SkipReason) => void;
  onAutoTimeout: () => void;
}

export function SkipOverlay({ open, onTag, onAutoTimeout }: SkipOverlayProps) {
  const [secondsLeft, setSecondsLeft] = useState(SKIP_TIMER_SECONDS);

  useEffect(() => {
    if (!open) {
      setSecondsLeft(SKIP_TIMER_SECONDS);
      return;
    }
    setSecondsLeft(SKIP_TIMER_SECONDS);
    const interval = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(interval);
          // Auto-tag handled by parent via onAutoTimeout
          setTimeout(() => onAutoTimeout(), 0);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [open, onAutoTimeout]);

  if (!open) return null;

  const progressPercent = (secondsLeft / SKIP_TIMER_SECONDS) * 100;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="skip-title"
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl shadow-2xl animate-slide-up">
        {/* Header with countdown */}
        <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h3 id="skip-title" className="text-lg font-bold text-slate-900">
                Why are you skipping?
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Soft prompt — tag for a richer post-quiz heatmap. (Stopwatch is paused.)
              </p>
            </div>
            <div className="flex flex-col items-end">
              <div className="font-mono font-bold text-2xl text-slate-900 tabular-nums">
                {secondsLeft}s
              </div>
              <div className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">
                auto-tag in
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full transition-all duration-1000 ease-linear',
                secondsLeft > 5 ? 'bg-brand-500' : 'bg-amber-500'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Reason grid */}
        <div className="p-5 sm:p-6 grid sm:grid-cols-2 gap-2.5">
          {REASONS.map((r) => (
            <button
              key={r.reason}
              onClick={() => onTag(r.reason)}
              className={cn(
                'text-left rounded-lg border-2 p-4 transition-all bg-white focus-ring',
                r.tone
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">{r.icon}</div>
                <div>
                  <div className="font-semibold text-sm">{r.reason}</div>
                  <div className="text-xs mt-0.5 opacity-80">{r.blurb}</div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer note */}
        <div className="px-5 sm:px-6 pb-4 text-xs text-slate-500">
          If you don't pick one, we'll auto-tag <strong>Conceptual gap</strong>. You can always change it in the report.
        </div>
      </div>
    </div>
  );
}
