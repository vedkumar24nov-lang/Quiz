import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, PlayCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TabBar, type ReportTab } from '@/components/report/TabBar';
import { SummaryTab } from '@/components/report/SummaryTab';
import { PerQuestionTab } from '@/components/report/PerQuestionTab';
import { HeatmapTab } from '@/components/report/HeatmapTab';
import { WrongAnsweredTab } from '@/components/report/WrongAnsweredTab';
import { SkippedQuestionsTab } from '@/components/report/SkippedQuestionsTab';
import { ReplayTab } from '@/components/report/ReplayTab';
import { ATTEMPTS } from '@/data/attempts';
import { getMasteryByTopic } from '@/data/mastery';
import type { Attempt } from '@/types';

function loadAttempt(attemptId: string): Attempt | undefined {
  // First try sessionStorage (just-completed attempts from S1.2 quizzes)
  try {
    const raw = sessionStorage.getItem(`attempt:${attemptId}`);
    if (raw) return JSON.parse(raw) as Attempt;
  } catch {
    // ignore
  }
  // Fallback: dummy historical attempts
  return ATTEMPTS.find((a) => a.id === attemptId);
}

export function Report() {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as ReportTab | null) ?? 'summary';
  const [activeTab, setActiveTab] = useState<ReportTab>(initialTab);

  const attempt = useMemo(() => (attemptId ? loadAttempt(attemptId) : undefined), [attemptId]);
  const previousMastery = attempt
    ? getMasteryByTopic(attempt.topicId)?.score ?? null
    : null;

  // Sync tab to URL so deep-links land on the right tab
  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (activeTab === 'summary') next.delete('tab');
    else next.set('tab', activeTab);
    setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  if (!attempt) {
    return (
      <div className="container-page py-12 text-center">
        <p className="text-slate-600">Attempt not found.</p>
        <Link to="/dashboard" className="text-brand-700 hover:underline">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Counts for tab badges
  const counts: Partial<Record<ReportTab, number>> = {
    wrong: attempt.wrong,
    skipped: attempt.skipped,
  };

  return (
    <div className="container-page py-5 sm:py-6 max-w-4xl">
      {/* Top action bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <Link to="/dashboard">
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Link to={`/topic/${attempt.topicId}`}>
            <Button variant="secondary" size="sm">
              Topic page
            </Button>
          </Link>
          <Link to={`/quiz/practice/${attempt.topicId}`}>
            <Button size="sm" leftIcon={<PlayCircle className="w-4 h-4" />}>
              Drill again
            </Button>
          </Link>
        </div>
      </div>

      <TabBar
        active={activeTab}
        onChange={setActiveTab}
        counts={counts}
        showSkipped={attempt.mode === 'test' || attempt.skipped > 0}
      />

      {/* Tab content */}
      <div className="pt-5 sm:pt-6 animate-fade-in">
        {activeTab === 'summary' && (
          <SummaryTab attempt={attempt} previousMastery={previousMastery} />
        )}
        {activeTab === 'per-question' && <PerQuestionTab attempt={attempt} />}
        {activeTab === 'heatmap' && <HeatmapTab attempt={attempt} />}
        {activeTab === 'wrong' && <WrongAnsweredTab attempt={attempt} />}
        {activeTab === 'skipped' && <SkippedQuestionsTab attempt={attempt} />}
        {activeTab === 'replay' && <ReplayTab attempt={attempt} />}
      </div>
    </div>
  );
}
