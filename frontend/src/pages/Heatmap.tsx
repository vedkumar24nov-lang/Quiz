import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Filter, Search, ArrowUpRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getSubjectById } from '@/data/subjects';
import { MASTERY, getBandMasteryByTopic } from '@/data/mastery';
import { getMasteryBand } from '@/types';
import { useActiveSubjectId } from '@/store/subjectStore';
import type { Difficulty } from '@/types';
import { cn } from '@/lib/cn';

type ClassFilter = 'all' | 11 | 12;
type BandFilter = 'all' | 'weak' | 'low' | 'mid' | 'strong' | 'empty';

const DIFFICULTIES: Difficulty[] = ['Easy', 'Medium', 'Hard'];

export function Heatmap() {
  const activeSubjectId = useActiveSubjectId();
  const subject = getSubjectById(activeSubjectId)!;
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState<ClassFilter>('all');
  const [bandFilter, setBandFilter] = useState<BandFilter>('all');

  const visibleChapters = useMemo(() => {
    return subject.chapters.filter((ch) => {
      if (classFilter !== 'all' && ch.classLevel !== classFilter) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      if (ch.name.toLowerCase().includes(q)) return true;
      return ch.topics.some((t) => t.name.toLowerCase().includes(q));
    });
  }, [query, classFilter, subject]);

  // Aggregate stats — scoped to the active subject's topics
  const subjectTopicIds = useMemo(
    () => new Set(subject.chapters.flatMap((ch) => ch.topics.map((t) => t.id))),
    [subject]
  );
  const subjectMastery = useMemo(
    () => MASTERY.filter((m) => subjectTopicIds.has(m.topicId)),
    [subjectTopicIds]
  );
  const attemptedCount = subjectMastery.filter((m) => m.attemptsCount > 0).length;
  const weakCount = subjectMastery.filter(
    (m) => m.attemptsCount > 0 && m.score < 40
  ).length;
  const strongCount = subjectMastery.filter(
    (m) => m.attemptsCount > 0 && m.score >= 80
  ).length;
  const overallMastery = Math.round(
    subjectMastery
      .filter((m) => m.attemptsCount > 0)
      .reduce((s, m) => s + m.score, 0) / Math.max(1, attemptedCount)
  );

  return (
    <div className="container-page py-6 sm:py-8 space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-brand-600" />
            {subject.name} Mastery Heatmap
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Topic-grid: rows = topics, columns = difficulty bands. Click any cell to drill straight in. Switch subjects from the header.
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatChip
          label="Overall mastery"
          value={attemptedCount ? `${overallMastery}/100` : '—'}
        />
        <StatChip label="Topics attempted" value={`${attemptedCount}/${subjectMastery.length}`} />
        <StatChip label="Weak topics" value={String(weakCount)} tone="weak" />
        <StatChip label="Strong topics" value={String(strongCount)} tone="strong" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chapter or topic…"
            className="w-full h-11 pl-10 pr-3 bg-white border border-slate-300 rounded-lg text-sm focus-ring focus:border-brand-500"
          />
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-lg p-1">
          {(['all', 11, 12] as const).map((opt) => (
            <button
              key={opt}
              onClick={() => setClassFilter(opt)}
              className={cn(
                'px-3 h-9 rounded-md text-sm font-medium transition-colors focus-ring',
                classFilter === opt
                  ? 'bg-brand-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {opt === 'all' ? (
                <span className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5" />
                  All
                </span>
              ) : (
                `Class ${opt}`
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Band filter chips */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wide mr-1">
          Highlight:
        </span>
        {(['all', 'weak', 'low', 'mid', 'strong', 'empty'] as const).map((b) => (
          <button
            key={b}
            onClick={() => setBandFilter(b)}
            className={cn(
              'px-2.5 h-7 rounded-md text-xs font-medium transition-all focus-ring',
              bandFilter === b
                ? 'bg-slate-900 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            )}
          >
            {b === 'all'
              ? 'All bands'
              : b === 'weak'
              ? 'Weak (<40)'
              : b === 'low'
              ? 'Low (40–59)'
              : b === 'mid'
              ? 'Mid (60–79)'
              : b === 'strong'
              ? 'Strong (80+)'
              : 'Not attempted'}
          </button>
        ))}
      </div>

      {/* Heatmap grid */}
      <Card padding="none">
        {/* Column headers */}
        <div className="grid grid-cols-[1fr_repeat(3,minmax(56px,80px))] gap-1 px-4 py-3 border-b border-slate-200 bg-slate-50 sticky top-14 z-10">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
            Topic
          </div>
          {DIFFICULTIES.map((d) => (
            <div
              key={d}
              className="text-xs font-semibold text-slate-600 uppercase tracking-wide text-center"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Body */}
        {visibleChapters.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-500">
            No chapters match your filters.
          </div>
        ) : (
          visibleChapters.map((chapter) => {
            const topics = chapter.topics.filter((t) => {
              if (
                query.trim() &&
                !t.name.toLowerCase().includes(query.toLowerCase()) &&
                !chapter.name.toLowerCase().includes(query.toLowerCase())
              )
                return false;
              if (bandFilter !== 'all') {
                // pass if any band matches
                const m = MASTERY.find((x) => x.topicId === t.id);
                const score = m?.attemptsCount ? m.score : null;
                const overallBand = getMasteryBand(score);
                if (overallBand !== bandFilter) return false;
              }
              return true;
            });
            if (topics.length === 0) return null;
            return (
              <div key={chapter.id} className="border-b border-slate-100 last:border-b-0">
                {/* Chapter header row */}
                <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 flex-wrap">
                  <div className="font-semibold text-sm text-slate-900">{chapter.name}</div>
                  <Badge tone="neutral">Class {chapter.classLevel}</Badge>
                </div>
                {/* Topic rows */}
                {topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="grid grid-cols-[1fr_repeat(3,minmax(56px,80px))] gap-1 px-4 py-2.5 hover:bg-slate-50/50 transition-colors"
                  >
                    <Link
                      to={`/topic/${topic.id}`}
                      className="text-sm text-slate-800 hover:text-brand-700 hover:underline truncate self-center"
                    >
                      {topic.name}
                    </Link>
                    {DIFFICULTIES.map((diff) => {
                      const score = getBandMasteryByTopic(topic.id, diff);
                      const band = getMasteryBand(score);
                      return (
                        <Link
                          key={diff}
                          to={`/topic/${topic.id}`}
                          title={`${topic.name} · ${diff}: ${
                            score !== null ? `${score}/100` : 'not attempted'
                          }`}
                          className={cn(
                            'h-9 rounded-md flex items-center justify-center font-mono text-[11px] font-semibold transition-all hover:scale-105 hover:ring-2 hover:ring-offset-1 hover:ring-brand-400 focus-ring',
                            band === 'weak' && 'bg-mastery-weak text-white',
                            band === 'low' && 'bg-mastery-low text-white',
                            band === 'mid' && 'bg-mastery-mid text-slate-900',
                            band === 'strong' && 'bg-mastery-strong text-white',
                            band === 'empty' && 'bg-mastery-empty text-slate-400'
                          )}
                        >
                          {score === null ? '—' : score}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap pt-1">
        <span className="font-semibold uppercase tracking-wide">Legend:</span>
        <LegendDot color="bg-mastery-weak" label="Weak <40" />
        <LegendDot color="bg-mastery-low" label="Low 40–59" />
        <LegendDot color="bg-mastery-mid" label="Mid 60–79" />
        <LegendDot color="bg-mastery-strong" label="Strong 80+" />
        <LegendDot color="bg-mastery-empty" label="Not attempted" />
      </div>

      {/* CTA bar */}
      <Card className="bg-brand-50 border-brand-200">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm text-brand-900">
            <span className="font-semibold">Tip:</span> click any red cell to drill straight into that topic.
          </div>
          <Link
            to="/topics"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800 inline-flex items-center gap-1"
          >
            Browse topics list
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </Card>
    </div>
  );
}

function StatChip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'weak' | 'strong';
}) {
  return (
    <Card>
      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide">{label}</div>
      <div
        className={cn(
          'text-2xl font-bold tabular-nums mt-1',
          tone === 'weak' && 'text-red-600',
          tone === 'strong' && 'text-emerald-600',
          !tone && 'text-slate-900'
        )}
      >
        {value}
      </div>
    </Card>
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
