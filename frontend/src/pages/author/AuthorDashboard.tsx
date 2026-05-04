import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderTree,
  FileQuestion,
  ListChecks,
  Upload,
  AlertCircle,
  ArrowRight,
  Atom,
  FlaskConical,
  Sigma,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useAuthUser } from '@/store/authStore';
import { apiGet, ApiError } from '@/lib/api';
import { cn } from '@/lib/cn';

interface AuthorStats {
  counts: {
    subjects: number;
    chapters: number;
    topics: number;
    subtopics: number;
    questions: number;
    testTemplates: number;
  };
  health: {
    bankPerSubject: { physics: number; chemistry: number; mathematics: number };
    thinAreas: Array<{
      topicName: string;
      subject: string;
      questionCount: number;
      recommendation: string;
    }>;
  };
  recentActivity: Array<{ id: string; description: string; at: string }>;
}

export function AuthorDashboard() {
  const user = useAuthUser();
  const [stats, setStats] = useState<AuthorStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<AuthorStats>('/api/author/stats')
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Failed to load stats'
        );
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Welcome, {user?.name ?? 'Author'}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          {user?.bio ?? 'Manage subjects, topics, questions, and test templates.'}
        </p>
      </div>

      {/* Counts grid */}
      {loading && (
        <Card padding="lg" className="text-center text-sm text-slate-500">
          Loading stats…
        </Card>
      )}

      {error && (
        <Card padding="lg" className="bg-red-50 border-red-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-900">
              <div className="font-semibold">Couldn't load stats.</div>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {stats && (
        <>
          {/* High-level counts */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <CountCard label="Subjects" value={stats.counts.subjects} />
            <CountCard label="Chapters" value={stats.counts.chapters} />
            <CountCard label="Topics" value={stats.counts.topics} />
            <CountCard label="Subtopics" value={stats.counts.subtopics} />
            <CountCard label="Questions" value={stats.counts.questions} highlight />
            <CountCard label="Test Templates" value={stats.counts.testTemplates} />
          </div>

          {/* Per-subject bank health */}
          <Card padding="lg">
            <h2 className="text-base font-semibold text-slate-900 mb-1">
              Question bank by subject
            </h2>
            <p className="text-sm text-slate-600 mb-4">
              Target ~150–200 published questions per topic for the adaptive engine to work well.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <SubjectBankRow
                icon={<Atom className="w-5 h-5" />}
                label="Physics"
                count={stats.health.bankPerSubject.physics}
                tone="brand"
              />
              <SubjectBankRow
                icon={<FlaskConical className="w-5 h-5" />}
                label="Chemistry"
                count={stats.health.bankPerSubject.chemistry}
                tone="emerald"
              />
              <SubjectBankRow
                icon={<Sigma className="w-5 h-5" />}
                label="Mathematics"
                count={stats.health.bankPerSubject.mathematics}
                tone="purple"
              />
            </div>
          </Card>

          {/* Thin areas — what to author next */}
          {stats.health.thinAreas.length > 0 && (
            <Card padding="lg">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <h2 className="text-base font-semibold text-slate-900">
                  What to author next
                </h2>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Topics with thin question banks. Filling these unblocks the adaptive engine for those students.
              </p>
              <ul className="divide-y divide-slate-100 -mx-1">
                {stats.health.thinAreas.map((area, idx) => (
                  <li key={idx} className="py-3 px-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-7 h-7 rounded-md bg-amber-100 text-amber-800 inline-flex items-center justify-center text-xs font-bold">
                        {area.questionCount}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-slate-900">
                          {area.topicName}{' '}
                          <span className="text-xs font-normal text-slate-500">
                            · {area.subject}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">{area.recommendation}</p>
                      </div>
                      <Link
                        to="/author/questions"
                        className="text-xs font-semibold text-brand-700 hover:text-brand-800 inline-flex items-center gap-0.5 flex-shrink-0"
                      >
                        Author
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-base font-semibold text-slate-900 mb-3">Quick actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <ActionCard
            to="/author/topics"
            icon={<FolderTree className="w-5 h-5" />}
            title="Topics & Subtopics"
            body="Add new topics and subtopics. Reorder to control how cards appear under each chapter."
          />
          <ActionCard
            to="/author/questions"
            icon={<FileQuestion className="w-5 h-5" />}
            title="Author Questions"
            body="Create individual questions with images, solutions, and intrinsic tags."
          />
          <ActionCard
            to="/author/imports"
            icon={<Upload className="w-5 h-5" />}
            title="Bulk Import"
            body="Upload PYQ datasets via CSV — preview, fix errors, publish in one batch."
          />
          <ActionCard
            to="/author/tests"
            icon={<ListChecks className="w-5 h-5" />}
            title="Test Templates"
            body="Hand-pick questions into a test that students can take from Custom Test."
          />
        </div>
      </div>
    </div>
  );
}

function CountCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <Card
      className={cn(
        highlight && 'bg-amber-50 border-amber-200'
      )}
    >
      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{label}</div>
      <div
        className={cn(
          'text-2xl font-bold tabular-nums mt-1',
          highlight ? 'text-amber-900' : 'text-slate-900'
        )}
      >
        {value.toLocaleString()}
      </div>
    </Card>
  );
}

function SubjectBankRow({
  icon,
  label,
  count,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  tone: 'brand' | 'emerald' | 'purple';
}) {
  const toneClasses = {
    brand: 'bg-brand-100 text-brand-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    purple: 'bg-purple-100 text-purple-700',
  };
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200">
      <div
        className={cn(
          'w-10 h-10 rounded-lg inline-flex items-center justify-center',
          toneClasses[tone]
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-slate-900">{label}</div>
        <div className="text-xs text-slate-500">{count} questions in bank</div>
      </div>
    </div>
  );
}

function ActionCard({
  to,
  icon,
  title,
  body,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="block group rounded-xl border border-slate-200 bg-white p-5 hover:border-amber-400 hover:shadow-md transition-all"
    >
      <div className="inline-flex w-10 h-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 mb-3 group-hover:bg-amber-200 transition-colors">
        {icon}
      </div>
      <div className="font-semibold text-slate-900 mb-1 flex items-center justify-between">
        {title}
        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">{body}</p>
    </Link>
  );
}
