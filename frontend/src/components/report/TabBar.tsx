import { cn } from '@/lib/cn';

export type ReportTab =
  | 'summary'
  | 'per-question'
  | 'heatmap'
  | 'wrong'
  | 'skipped'
  | 'replay';

interface TabBarProps {
  active: ReportTab;
  onChange: (tab: ReportTab) => void;
  counts?: Partial<Record<ReportTab, number>>;
  showSkipped: boolean; // Test mode → show; Practice → hide (skips handled inline)
}

const TABS: Array<{ id: ReportTab; label: string }> = [
  { id: 'summary', label: 'Summary' },
  { id: 'per-question', label: 'Per Question' },
  { id: 'heatmap', label: 'Heatmap' },
  { id: 'wrong', label: 'Wrong Answered' },
  { id: 'skipped', label: 'Skipped' },
  { id: 'replay', label: 'Replay' },
];

export function TabBar({ active, onChange, counts, showSkipped }: TabBarProps) {
  const visible = TABS.filter((t) => (t.id === 'skipped' ? showSkipped : true));

  return (
    <div className="sticky top-14 z-10 bg-white border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="container-page">
        <div className="flex overflow-x-auto scrollbar-thin gap-1 sm:gap-2 py-1">
          {visible.map((t) => {
            const isActive = active === t.id;
            const count = counts?.[t.id];
            return (
              <button
                key={t.id}
                onClick={() => onChange(t.id)}
                className={cn(
                  'flex-shrink-0 inline-flex items-center gap-1.5 h-10 px-3 sm:px-4 rounded-md text-sm font-semibold transition-colors focus-ring',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                )}
              >
                {t.label}
                {count !== undefined && count > 0 && (
                  <span
                    className={cn(
                      'inline-flex items-center justify-center text-[10px] font-bold tabular-nums px-1.5 h-5 rounded',
                      isActive
                        ? 'bg-brand-200 text-brand-800'
                        : 'bg-slate-200 text-slate-700'
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
