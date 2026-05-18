import { NavLink, Outlet } from 'react-router-dom';
import { ClipboardList, Layers, FileSignature } from 'lucide-react';
import { cn } from '@/lib/cn';

const TABS = [
  {
    to: '/author/exam/patterns',
    label: 'Paper Patterns',
    icon: Layers,
    hint: 'Reusable duration / marking templates',
  },
  {
    to: '/author/exam/list',
    label: 'Exams',
    icon: FileSignature,
    hint: 'Curated test papers students can take',
  },
];

export function AuthorExam() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-5">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-amber-600" />
          Exam
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-prose">
          Build the paper, then build the test. Patterns define the rules of a paper (duration, marking, Q-count). Exams are concrete papers — author-curated questions students take and get auto-graded on.
        </p>
      </div>

      <div className="border-b border-slate-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <nav className="flex gap-1" aria-label="Exam sub-sections">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 h-11 px-4 text-sm font-semibold border-b-2 -mb-px transition-colors focus-ring rounded-t-md',
                  isActive
                    ? 'border-amber-500 text-amber-900 bg-amber-50/40'
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300'
                )
              }
              title={tab.hint}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <Outlet />
    </div>
  );
}
