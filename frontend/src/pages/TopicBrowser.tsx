import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight, Filter, BookOpen } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge, MasteryChip } from '@/components/ui/Badge';
import { getSubjectById, SUBJECTS } from '@/data/subjects';
import { MASTERY } from '@/data/mastery';
import { getMasteryBand } from '@/types';
import { useActiveSubjectId } from '@/store/subjectStore';
import { cn } from '@/lib/cn';

type ClassFilter = 'all' | 11 | 12;

export function TopicBrowser() {
  const activeSubjectId = useActiveSubjectId();
  const subject = getSubjectById(activeSubjectId)!;
  const [query, setQuery] = useState('');
  const [classFilter, setClassFilter] = useState<ClassFilter>('all');

  const filteredChapters = useMemo(() => {
    return subject.chapters.filter((ch) => {
      if (classFilter !== 'all' && ch.classLevel !== classFilter) return false;
      if (!query.trim()) return true;
      const q = query.toLowerCase();
      if (ch.name.toLowerCase().includes(q)) return true;
      return ch.topics.some((t) => t.name.toLowerCase().includes(q));
    });
  }, [query, classFilter, subject]);

  const totalTopicsShown = filteredChapters.reduce(
    (sum, ch) =>
      sum +
      ch.topics.filter(
        (t) => !query.trim() || t.name.toLowerCase().includes(query.toLowerCase()) ||
        ch.name.toLowerCase().includes(query.toLowerCase())
      ).length,
    0
  );

  return (
    <div className="container-page py-6 sm:py-8 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-brand-600" />
          Browse {subject.name}
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Pick any chapter or topic to start a quiz. Mastery chips show where you stand. Switch subjects from the header.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chapters or topics… e.g. 'Carnot'"
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

      {/* Results count */}
      <div className="text-xs text-slate-500">
        Showing <span className="font-semibold text-slate-900">{totalTopicsShown}</span> topics
        across <span className="font-semibold text-slate-900">{filteredChapters.length}</span> chapters
      </div>

      {/* Chapter list */}
      {filteredChapters.length === 0 ? (
        <Card padding="lg" className="text-center">
          <p className="text-slate-600">No topics match your search.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredChapters.map((chapter) => {
            const visibleTopics = chapter.topics.filter(
              (t) =>
                !query.trim() ||
                t.name.toLowerCase().includes(query.toLowerCase()) ||
                chapter.name.toLowerCase().includes(query.toLowerCase())
            );
            if (visibleTopics.length === 0) return null;

            const chapterMastery = computeChapterMastery(chapter.id);

            return (
              <Card key={chapter.id} padding="none">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-semibold text-slate-900 truncate">{chapter.name}</h2>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2 flex-wrap">
                      <Badge tone="neutral">Class {chapter.classLevel}</Badge>
                      <span>{chapter.topics.length} topics</span>
                      <span>·</span>
                      <span>
                        {chapter.topics.reduce((s, t) => s + t.questionCount, 0)} questions
                      </span>
                    </div>
                  </div>
                  {chapterMastery !== null && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 hidden sm:inline">Chapter mastery</span>
                      <MasteryChip score={chapterMastery} band={getMasteryBand(chapterMastery)} />
                    </div>
                  )}
                </div>

                <ul className="divide-y divide-slate-100">
                  {visibleTopics.map((topic) => {
                    const m = MASTERY.find((x) => x.topicId === topic.id);
                    const score = m?.attemptsCount ? m.score : null;
                    const band = getMasteryBand(score);
                    return (
                      <li key={topic.id}>
                        <Link
                          to={`/topic/${topic.id}`}
                          className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                        >
                          <MasteryChip score={score ?? 0} band={band} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-slate-900 truncate">
                              {topic.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {topic.questionCount} questions
                              {m?.attemptsCount
                                ? ` · ${m.attemptsCount} attempt${m.attemptsCount > 1 ? 's' : ''}`
                                : ' · not yet attempted'}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function computeChapterMastery(chapterId: string): number | null {
  const chapter = SUBJECTS.flatMap((s) => s.chapters).find((c) => c.id === chapterId);
  if (!chapter) return null;
  const scores = chapter.topics
    .map((t) => MASTERY.find((m) => m.topicId === t.id))
    .filter((m): m is NonNullable<typeof m> => !!m && m.attemptsCount > 0)
    .map((m) => m.score);
  if (scores.length === 0) return null;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}
