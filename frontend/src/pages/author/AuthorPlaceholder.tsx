import { Link } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';

interface AuthorPlaceholderProps {
  title: string;
  comingInSubstage: string;
  description: string;
}

export function AuthorPlaceholder({ title, comingInSubstage, description }: AuthorPlaceholderProps) {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="inline-flex w-14 h-14 items-center justify-center rounded-xl bg-amber-100 text-amber-700 mb-5">
        <Construction className="w-7 h-7" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      <p className="text-sm text-amber-700 font-semibold mt-1">Coming in {comingInSubstage}</p>
      <p className="text-slate-600 mt-4 leading-relaxed">{description}</p>
      <Link
        to="/author/dashboard"
        className="inline-flex items-center gap-1.5 mt-8 px-4 py-2 text-sm font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-md focus-ring"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>
    </div>
  );
}
