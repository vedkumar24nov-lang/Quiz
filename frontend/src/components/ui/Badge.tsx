import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { Difficulty, QuestionType, MasteryBand } from '@/types';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'amber';

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

const toneClasses: Record<Tone, string> = {
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  brand: 'bg-brand-50 text-brand-700 border-brand-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
  amber: 'bg-orange-50 text-orange-700 border-orange-200',
};

export function Badge({ children, tone = 'neutral', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-md border',
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

// Specialized: difficulty badge
const difficultyTone: Record<Difficulty, Tone> = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'danger',
};
export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <Badge tone={difficultyTone[difficulty]}>{difficulty}</Badge>;
}

// Specialized: type badge
export function TypeBadge({ type }: { type: QuestionType }) {
  return <Badge tone="brand">{type}</Badge>;
}

// Specialized: mastery score chip
const bandClasses: Record<MasteryBand, string> = {
  weak: 'bg-mastery-weak text-white',
  low: 'bg-mastery-low text-white',
  mid: 'bg-mastery-mid text-slate-900',
  strong: 'bg-mastery-strong text-white',
  empty: 'bg-mastery-empty text-slate-500',
};
export function MasteryChip({ score, band }: { score: number; band: MasteryBand }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center font-mono font-semibold text-xs px-2 py-0.5 rounded',
        bandClasses[band]
      )}
    >
      {band === 'empty' ? '—' : score}
    </span>
  );
}
