import { Link } from 'react-router-dom';
import { X, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/cn';

interface QuizHeaderProps {
  topicName: string;
  modeLabel: string;
  /** seconds — for Practice this is elapsed (counting up); for Test this is remaining */
  timerSeconds: number;
  /** if true, render countdown styling */
  isCountdown: boolean;
  /** Practice mode pause indicator */
  isPaused?: boolean;
  /** Click X — show confirmation in calling page */
  onExit: () => void;
}

function formatTime(seconds: number): string {
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  if (mm >= 60) {
    const hh = Math.floor(mm / 60);
    return `${hh}:${(mm % 60).toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
  }
  return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
}

export function QuizHeader({
  topicName,
  modeLabel,
  timerSeconds,
  isCountdown,
  isPaused,
  onExit,
}: QuizHeaderProps) {
  // Color shifts for countdown
  const dangerLevel = isCountdown
    ? timerSeconds <= 60
      ? 'critical'
      : timerSeconds <= 5 * 60
      ? 'warning'
      : 'normal'
    : 'normal';

  return (
    <div className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="container-page h-14 flex items-center justify-between gap-3">
        {/* Left: exit + topic */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onExit}
            className="w-9 h-9 rounded-md hover:bg-slate-100 inline-flex items-center justify-center text-slate-600 focus-ring"
            aria-label="Exit quiz"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="min-w-0">
            <div className="text-xs text-slate-500 leading-none">{modeLabel}</div>
            <div className="font-semibold text-sm text-slate-900 truncate leading-tight mt-0.5">
              {topicName}
            </div>
          </div>
        </div>

        {/* Right: timer */}
        <div className="flex items-center gap-2">
          {isPaused && (
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded inline-flex items-center gap-1">
              <Pause className="w-3 h-3" />
              Paused
            </span>
          )}
          {!isPaused && !isCountdown && (
            <Play className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <div
            className={cn(
              'font-mono font-bold tabular-nums text-lg sm:text-xl px-3 py-1 rounded-md',
              dangerLevel === 'critical' && 'text-white bg-red-600 animate-pulse-slow',
              dangerLevel === 'warning' && 'text-amber-900 bg-amber-100',
              dangerLevel === 'normal' && 'text-slate-900 bg-slate-100'
            )}
          >
            {formatTime(timerSeconds)}
          </div>
        </div>
      </div>
    </div>
  );
}

export { formatTime };
