import { useMemo } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  PlayCircle,
  Timer,
  TrendingUp,
  TrendingDown,
  Activity,
  Info,
  ArrowLeft,
  Target,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, MasteryChip } from '@/components/ui/Badge';
import { getTopicById, getChapterByTopic } from '@/data/subjects';
import { getMasteryByTopic } from '@/data/mastery';
import { ATTEMPTS } from '@/data/attempts';
import { getQuestionsByTopic } from '@/data/questions';
import { getMasteryBand } from '@/types';

export function TopicDetail() {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();

  const topic = topicId ? getTopicById(topicId) : undefined;
  const chapter = topicId ? getChapterByTopic(topicId) : undefined;
  const mastery = topicId ? getMasteryByTopic(topicId) : undefined;
  const topicQuestions = topicId ? getQuestionsByTopic(topicId) : [];

  const topicAttempts = useMemo(
    () => ATTEMPTS.filter((a) => a.topicId === topicId).slice(0, 5),
    [topicId]
  );

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

  const score = mastery?.attemptsCount ? mastery.score : null;
  const band = getMasteryBand(score);
  const questionsAvailable = topicQuestions.length;
  const bankThin = questionsAvailable < 5;

  // Engine difficulty bias hint (per spec §5.5.2)
  const difficultyHint =
    score === null
      ? "We'll start easy and calibrate as you go."
      : score >= 80
      ? "Engine will skew toward harder, JEE-Advanced-level questions."
      : score >= 50
      ? 'Engine will mix difficulties — balanced session.'
      : 'Engine will skew toward fundamentals to rebuild confidence.';

  return (
    <div className="container-page py-6 sm:py-8 space-y-5">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5 focus-ring rounded px-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="min-w-0">
          <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5 flex-wrap">
            <Link to="/topics" className="hover:text-brand-700 hover:underline">Physics</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/topics" className="hover:text-brand-700 hover:underline">{chapter.name}</Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{topic.name}</h1>
          <div className="text-sm text-slate-600 mt-1.5 flex items-center gap-2 flex-wrap">
            <Badge tone="neutral">Class {chapter.classLevel}</Badge>
            <span>·</span>
            <span>{topic.questionCount} questions in bank</span>
            <span>·</span>
            <span>{questionsAvailable} loaded for prototype</span>
          </div>
        </div>

        {/* Mastery summary */}
        <div className="flex flex-col items-end">
          <div className="text-xs font-medium text-slate-500 mb-1">Your mastery</div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tabular-nums text-slate-900">
              {score ?? '—'}
            </span>
            {score !== null && <span className="text-sm text-slate-500">/100</span>}
          </div>
          {mastery?.attemptsCount ? (
            <div className="text-xs text-slate-500 mt-0.5">
              from {mastery.attemptsCount} attempt{mastery.attemptsCount > 1 ? 's' : ''}
            </div>
          ) : (
            <div className="text-xs text-slate-500 mt-0.5">not yet attempted</div>
          )}
        </div>
      </div>

      {/* Engine hint */}
      <Card className="bg-brand-50 border-brand-200">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-brand-700 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-brand-900">Adaptive picks: </span>
            <span className="text-brand-800">{difficultyHint}</span>
          </div>
        </div>
      </Card>

      {/* Bank thinness warning */}
      {bankThin && (
        <Card className="bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <span className="font-semibold">Bank still being built. </span>
              Only {questionsAvailable} questions loaded for this prototype. Quiz will be short.
            </div>
          </div>
        </Card>
      )}

      {/* Launch buttons */}
      <div className="grid sm:grid-cols-2 gap-3">
        <Card padding="lg" hover className="border-2 border-brand-200">
          <div className="flex items-start gap-3 mb-4">
            <div className="inline-flex w-10 h-10 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Practice mode</h3>
              <p className="text-sm text-slate-600 mt-0.5">
                No time limit. Stopwatch counts up. Solutions revealed after each question.
              </p>
            </div>
          </div>
          <Link to={`/quiz/practice/${topic.id}`}>
            <Button fullWidth disabled={questionsAvailable === 0}>
              Start Practice ({Math.min(questionsAvailable, 10)} Qs)
            </Button>
          </Link>
        </Card>

        <Card padding="lg" hover>
          <div className="flex items-start gap-3 mb-4">
            <div className="inline-flex w-10 h-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Timer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Test mode</h3>
              <p className="text-sm text-slate-600 mt-0.5">
                Countdown timer. Real exam pressure. Auto-submit on expiry.
              </p>
            </div>
          </div>
          <Link to={`/quiz/test/${topic.id}`}>
            <Button fullWidth variant="secondary" disabled={questionsAvailable === 0}>
              Start Topic Test ({Math.min(questionsAvailable, 10)} Qs · 15 min)
            </Button>
          </Link>
        </Card>
      </div>

      {/* Recent attempts on this topic */}
      <Card>
        <CardHeader>
          <CardTitle>Recent attempts on this topic</CardTitle>
          <CardDescription>
            Mastery uses the last 3 attempts (rolling average per spec §5.5.1)
          </CardDescription>
        </CardHeader>
        {topicAttempts.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-500">
            No attempts yet. Start your first one above.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 -mx-1">
            {topicAttempts.map((a, idx) => (
              <li key={a.id}>
                <Link
                  to={`/report/${a.id}`}
                  className="flex items-center gap-3 py-3 px-1 hover:bg-slate-50 rounded-md transition-colors group"
                >
                  <div className="text-xs font-mono font-semibold text-slate-400 w-6 text-right">
                    #{topicAttempts.length - idx}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 flex items-center gap-2 flex-wrap">
                      {a.correct}/{a.totalQuestions} correct
                      <Badge tone={a.mode === 'test' ? 'amber' : 'neutral'}>
                        {a.mode === 'test' ? 'Test' : 'Practice'}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {new Date(a.completedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                  </div>
                  <MasteryChip
                    score={a.attemptScore0to100}
                    band={getMasteryBand(a.attemptScore0to100)}
                  />
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Mastery stats sidebar */}
      {score !== null && (
        <div className="grid sm:grid-cols-3 gap-3">
          <StatCard
            icon={<Target className="w-5 h-5" />}
            label="Current band"
            value={
              band === 'strong'
                ? 'Strong (80+)'
                : band === 'mid'
                ? 'Mid (60–79)'
                : band === 'low'
                ? 'Low (40–59)'
                : 'Weak (<40)'
            }
            tone={band === 'empty' ? undefined : band}
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Best attempt"
            value={`${Math.max(...topicAttempts.map((a) => a.attemptScore0to100), 0)}/100`}
          />
          <StatCard
            icon={<TrendingDown className="w-5 h-5" />}
            label="Last attempt"
            value={`${topicAttempts[0]?.attemptScore0to100 ?? '—'}/100`}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: 'weak' | 'low' | 'mid' | 'strong';
}) {
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div
          className={
            tone === 'weak'
              ? 'inline-flex w-9 h-9 items-center justify-center rounded-lg bg-red-100 text-red-700'
              : tone === 'low'
              ? 'inline-flex w-9 h-9 items-center justify-center rounded-lg bg-orange-100 text-orange-700'
              : tone === 'mid'
              ? 'inline-flex w-9 h-9 items-center justify-center rounded-lg bg-yellow-100 text-yellow-700'
              : tone === 'strong'
              ? 'inline-flex w-9 h-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700'
              : 'inline-flex w-9 h-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700'
          }
        >
          {icon}
        </div>
        <div>
          <div className="text-xs text-slate-500">{label}</div>
          <div className="font-semibold text-slate-900">{value}</div>
        </div>
      </div>
    </Card>
  );
}
