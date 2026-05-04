import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Clock,
  Flame,
  TrendingDown,
  TrendingUp,
  Zap,
  History,
  PlayCircle,
  Sliders,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge, MasteryChip } from '@/components/ui/Badge';
import { getRecentAttempts } from '@/data/attempts';
import { MASTERY } from '@/data/mastery';
import { getMasteryBand } from '@/types';
import { getSubjectById } from '@/data/subjects';
import { useActiveSubjectId } from '@/store/subjectStore';
import { cn } from '@/lib/cn';
import { useMemo } from 'react';

function formatRelativeTime(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function formatDuration(s: number): string {
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${mm}:${ss.toString().padStart(2, '0')}`;
}

export function Dashboard() {
  const activeSubjectId = useActiveSubjectId();
  const subject = getSubjectById(activeSubjectId)!;

  // Topics belonging to active subject
  const subjectTopicIds = useMemo(
    () => new Set(subject.chapters.flatMap((ch) => ch.topics.map((t) => t.id))),
    [subject]
  );

  // Recent attempts stay CROSS-SUBJECT — JEE prep is multi-subject by nature
  const recent = getRecentAttempts(5);
  const lastAttempt = recent[0];

  // Mastery widgets scope to active subject
  const subjectMastery = useMemo(
    () => MASTERY.filter((m) => subjectTopicIds.has(m.topicId)),
    [subjectTopicIds]
  );
  const weakest = useMemo(
    () =>
      [...subjectMastery]
        .filter((m) => m.attemptsCount > 0)
        .sort((a, b) => a.score - b.score)
        .slice(0, 5),
    [subjectMastery]
  );
  const strongest = useMemo(
    () =>
      [...subjectMastery]
        .filter((m) => m.attemptsCount > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3),
    [subjectMastery]
  );

  const totalAttempted = subjectMastery.filter((m) => m.attemptsCount > 0).length;
  const totalTopics = subjectMastery.length;
  const overallMastery = Math.round(
    subjectMastery.filter((m) => m.attemptsCount > 0).reduce((s, m) => s + m.score, 0) /
      Math.max(1, totalAttempted)
  );

  return (
    <div className="container-page py-6 sm:py-8 space-y-6">
      {/* Greeting */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Good evening, Vedant
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            <span className="font-semibold text-brand-700">{subject.name}:</span> drilled {totalAttempted} of{' '}
            {totalTopics} topics · avg mastery{' '}
            <span className="font-semibold text-slate-900">
              {totalAttempted ? `${overallMastery}/100` : '—'}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/custom-test">
            <Button variant="secondary" leftIcon={<Sliders className="w-4 h-4" />}>
              Custom test
            </Button>
          </Link>
          <Link to="/topics">
            <Button variant="secondary" rightIcon={<ChevronRight className="w-4 h-4" />}>
              All topics
            </Button>
          </Link>
        </div>
      </div>

      {/* Resume / quick-start hero card (Karthik-friendly) */}
      {lastAttempt && (
        <Card padding="lg" className="bg-gradient-to-br from-brand-600 to-brand-800 text-white border-0">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-sm font-medium text-brand-100 mb-1 flex items-center gap-1.5">
                <Zap className="w-4 h-4" />
                Pick up where you left off
              </div>
              <h2 className="text-xl sm:text-2xl font-bold leading-tight">
                {lastAttempt.topicName}
              </h2>
              <p className="text-brand-100 text-sm mt-1">
                {lastAttempt.chapterName} · last attempt {formatRelativeTime(lastAttempt.completedAt)} · scored{' '}
                {lastAttempt.attemptScore0to100}/100
              </p>
            </div>
            <div className="flex gap-2">
              <Link to={`/topic/${lastAttempt.topicId}`}>
                <Button variant="secondary" size="lg" leftIcon={<PlayCircle className="w-5 h-5" />}>
                  Drill again
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}

      {/* Weak / Strong sections */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Weakest topics — actionable */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>
                  <span className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-mastery-weak" />
                    Weakest topics
                  </span>
                </CardTitle>
                <CardDescription>One-click drill on what needs most work</CardDescription>
              </div>
            </div>
          </CardHeader>
          <ul className="divide-y divide-slate-100 -mx-1">
            {weakest.map((m) => (
              <li key={m.topicId}>
                <Link
                  to={`/topic/${m.topicId}`}
                  className="flex items-center gap-3 py-3 px-1 hover:bg-slate-50 rounded-md transition-colors group"
                >
                  <MasteryChip score={m.score} band={getMasteryBand(m.score)} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{m.topicName}</div>
                    <div className="text-xs text-slate-500 truncate">{m.chapterName}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        {/* Strongest topics — keep momentum */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle>
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-mastery-strong" />
                    Strongest topics
                  </span>
                </CardTitle>
                <CardDescription>Keep these sharp — engine will skew harder</CardDescription>
              </div>
            </div>
          </CardHeader>
          <ul className="divide-y divide-slate-100 -mx-1">
            {strongest.map((m) => (
              <li key={m.topicId}>
                <Link
                  to={`/topic/${m.topicId}`}
                  className="flex items-center gap-3 py-3 px-1 hover:bg-slate-50 rounded-md transition-colors group"
                >
                  <MasteryChip score={m.score} band={getMasteryBand(m.score)} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">{m.topicName}</div>
                    <div className="text-xs text-slate-500 truncate">{m.chapterName}</div>
                  </div>
                  <Badge tone="success">Strong</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Mini-heatmap preview by chapter */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle>{subject.name} mastery heatmap (preview)</CardTitle>
              <CardDescription>Each cell is a topic. Color = mastery band.</CardDescription>
            </div>
            <Link to="/heatmap" className="text-sm font-semibold text-brand-700 hover:text-brand-800 inline-flex items-center gap-0.5">
              Full heatmap
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </CardHeader>
        <div className="space-y-2.5">
          {subject.chapters.slice(0, 5).map((ch) => (
            <div key={ch.id} className="flex items-center gap-3">
              <div className="w-40 sm:w-48 text-xs font-medium text-slate-700 truncate flex-shrink-0">
                {ch.name}
              </div>
              <div className="flex gap-1 flex-1">
                {ch.topics.map((t) => {
                  const m = MASTERY.find((x) => x.topicId === t.id);
                  const band = getMasteryBand(m?.attemptsCount ? m.score : null);
                  return (
                    <Link
                      key={t.id}
                      to={`/topic/${t.id}`}
                      title={`${t.name} — ${m?.attemptsCount ? `${m.score}/100` : 'Not attempted'}`}
                      className={cn(
                        'h-7 sm:h-9 flex-1 rounded-md transition-all hover:scale-105 hover:ring-2 hover:ring-offset-1 hover:ring-brand-400',
                        band === 'weak' && 'bg-mastery-weak',
                        band === 'low' && 'bg-mastery-low',
                        band === 'mid' && 'bg-mastery-mid',
                        band === 'strong' && 'bg-mastery-strong',
                        band === 'empty' && 'bg-mastery-empty'
                      )}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
          <span>Legend:</span>
          <LegendDot color="bg-mastery-weak" label="<40 weak" />
          <LegendDot color="bg-mastery-low" label="40–59" />
          <LegendDot color="bg-mastery-mid" label="60–79" />
          <LegendDot color="bg-mastery-strong" label="80+ strong" />
          <LegendDot color="bg-mastery-empty" label="not attempted" />
        </div>
      </Card>

      {/* Recent attempts (cross-subject) */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              Recent attempts
            </span>
          </CardTitle>
          <CardDescription>Across all subjects — your full JEE prep activity.</CardDescription>
        </CardHeader>
        <ul className="divide-y divide-slate-100 -mx-1">
          {recent.map((a) => (
            <li key={a.id}>
              <Link
                to={`/report/${a.id}`}
                className="flex items-center gap-3 py-3 px-1 hover:bg-slate-50 rounded-md transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate flex items-center gap-2 flex-wrap">
                    {a.topicName}
                    <Badge tone={a.mode === 'test' ? 'amber' : 'neutral'}>
                      {a.mode === 'test' ? 'Test' : 'Practice'}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {a.correct}/{a.totalQuestions} correct
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(a.totalTimeSeconds)}
                    </span>
                    <span>{formatRelativeTime(a.completedAt)}</span>
                  </div>
                </div>
                <MasteryChip score={a.attemptScore0to100} band={getMasteryBand(a.attemptScore0to100)} />
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('w-3 h-3 rounded', color)} />
      {label}
    </span>
  );
}
