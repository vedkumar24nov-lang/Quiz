import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sliders, Clock, Hash, Check, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PHYSICS } from '@/data/subjects';
import { QUESTIONS } from '@/data/questions';
import { cn } from '@/lib/cn';

const MIN_QS = 5;
const MAX_QS = 200;
const MIN_DURATION = 10;
const MAX_DURATION = 240;

export function CustomTestBuilder() {
  const navigate = useNavigate();
  const [selectedChapterIds, setSelectedChapterIds] = useState<Set<string>>(new Set());
  const [questionCount, setQuestionCount] = useState(20);
  const [durationMinutes, setDurationMinutes] = useState(30);

  // Bank density across selected chapters
  const availableQs = useMemo(() => {
    if (selectedChapterIds.size === 0) return 0;
    return PHYSICS.chapters
      .filter((ch) => selectedChapterIds.has(ch.id))
      .flatMap((ch) => ch.topics.map((t) => t.id))
      .reduce(
        (sum, topicId) => sum + QUESTIONS.filter((q) => q.topicId === topicId).length,
        0
      );
  }, [selectedChapterIds]);

  const advertisedTotal = useMemo(() => {
    if (selectedChapterIds.size === 0) return 0;
    return PHYSICS.chapters
      .filter((ch) => selectedChapterIds.has(ch.id))
      .reduce((sum, ch) => sum + ch.topics.reduce((s, t) => s + t.questionCount, 0), 0);
  }, [selectedChapterIds]);

  const bankShortfall = questionCount > availableQs;

  function toggleChapter(chapterId: string) {
    const next = new Set(selectedChapterIds);
    if (next.has(chapterId)) next.delete(chapterId);
    else next.add(chapterId);
    setSelectedChapterIds(next);
  }

  function handleStart() {
    // For prototype: jump to test mode on the first selected chapter's first topic.
    // S1.3+ will support multi-chapter custom test sessions properly.
    const firstChapter = PHYSICS.chapters.find((ch) => selectedChapterIds.has(ch.id));
    if (!firstChapter) return;
    const firstTopic = firstChapter.topics[0];
    if (!firstTopic) return;
    navigate(`/quiz/test/${firstTopic.id}`);
  }

  const canStart =
    selectedChapterIds.size > 0 &&
    questionCount >= MIN_QS &&
    questionCount <= MAX_QS &&
    durationMinutes >= MIN_DURATION &&
    durationMinutes <= MAX_DURATION;

  return (
    <div className="container-page py-6 sm:py-8 max-w-4xl space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-slate-600 hover:text-slate-900 inline-flex items-center gap-1.5 focus-ring rounded px-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-6 h-6 text-brand-600" />
          Build a Custom Test
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Pick chapters, set duration and question count. Marking: difficulty-weighted (Easy +3 / Medium +4 / Hard +5; wrong −2).
        </p>
      </div>

      {/* Step 1: Chapter picker */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle>1. Pick chapters</CardTitle>
              <CardDescription>
                Select one or more chapters. We'll pull questions from across all selected.
              </CardDescription>
            </div>
            {selectedChapterIds.size > 0 && (
              <Badge tone="brand">{selectedChapterIds.size} selected</Badge>
            )}
          </div>
        </CardHeader>

        <div className="grid sm:grid-cols-2 gap-2">
          {PHYSICS.chapters.map((ch) => {
            const isSelected = selectedChapterIds.has(ch.id);
            const chQs = ch.topics.reduce((s, t) => s + t.questionCount, 0);
            return (
              <button
                key={ch.id}
                onClick={() => toggleChapter(ch.id)}
                className={cn(
                  'text-left rounded-lg border-2 p-3 transition-all focus-ring',
                  isSelected
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/30'
                )}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={cn(
                      'flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center',
                      isSelected ? 'bg-brand-600 border-brand-600' : 'border-slate-300'
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-slate-900 truncate">{ch.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Class {ch.classLevel} · {ch.topics.length} topics · {chQs} Qs
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Step 2: Sliders */}
      <Card>
        <CardHeader>
          <CardTitle>2. Set duration & question count</CardTitle>
          <CardDescription>v1: no per-section timers, no partial-marking rules.</CardDescription>
        </CardHeader>

        <div className="space-y-5">
          {/* Q-count slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="qcount" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Hash className="w-4 h-4" />
                Number of questions
              </label>
              <span className="text-2xl font-mono font-bold tabular-nums text-slate-900">
                {questionCount}
              </span>
            </div>
            <input
              id="qcount"
              type="range"
              min={MIN_QS}
              max={MAX_QS}
              step={5}
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>{MIN_QS}</span>
              <span>{MAX_QS}</span>
            </div>
          </div>

          {/* Duration slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="duration" className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                Duration
              </label>
              <span className="text-2xl font-mono font-bold tabular-nums text-slate-900">
                {durationMinutes >= 60
                  ? `${Math.floor(durationMinutes / 60)}h ${(durationMinutes % 60).toString().padStart(2, '0')}m`
                  : `${durationMinutes}m`}
              </span>
            </div>
            <input
              id="duration"
              type="range"
              min={MIN_DURATION}
              max={MAX_DURATION}
              step={5}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>{MIN_DURATION}m</span>
              <span>{MAX_DURATION}m (4h)</span>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 rounded-md p-3 border border-slate-200">
            That's roughly{' '}
            <span className="font-semibold text-slate-700">
              {Math.round((durationMinutes * 60) / questionCount)}s per question
            </span>{' '}
            — JEE Main averages ~144s per Physics question.
          </div>
        </div>
      </Card>

      {/* Step 3: Bank-density indicator */}
      <Card
        className={cn(
          selectedChapterIds.size === 0 && 'bg-slate-50 border-slate-200',
          selectedChapterIds.size > 0 && bankShortfall && 'bg-amber-50 border-amber-200',
          selectedChapterIds.size > 0 && !bankShortfall && 'bg-emerald-50 border-emerald-200'
        )}
      >
        {selectedChapterIds.size === 0 ? (
          <div className="text-sm text-slate-600">Pick at least one chapter to see bank density.</div>
        ) : bankShortfall ? (
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <span className="font-semibold">Bank shortfall.</span> You asked for{' '}
              {questionCount} Qs, but only{' '}
              <span className="font-mono font-bold">{availableQs}</span> are loaded for the prototype
              ({advertisedTotal} in production bank). Test will run with what's available.
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-emerald-900">
              <span className="font-semibold">Bank ready.</span>{' '}
              <span className="font-mono">{availableQs}</span> questions available across selected chapters
              ({advertisedTotal} total in production bank). Plenty for a {questionCount}-Q test.
            </div>
          </div>
        )}
      </Card>

      {/* Launch */}
      <div className="sticky bottom-20 md:bottom-6 z-10">
        <Card className="shadow-xl">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm">
              <div className="font-semibold text-slate-900">Ready to start?</div>
              <div className="text-xs text-slate-600 mt-0.5">
                {selectedChapterIds.size} chapter{selectedChapterIds.size !== 1 ? 's' : ''} ·{' '}
                {questionCount} Qs · {durationMinutes} min
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/dashboard">
                <Button variant="ghost">Cancel</Button>
              </Link>
              <Button onClick={handleStart} disabled={!canStart}>
                Start Custom Test
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
