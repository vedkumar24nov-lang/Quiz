import { Link } from 'react-router-dom';
import { Atom, ArrowRight, Brain, Target, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function Landing() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-white" />
        <div className="container-page relative pt-12 pb-16 sm:pt-20 sm:pb-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-xs font-semibold mb-6">
              <Atom className="w-3.5 h-3.5" />
              v1 · JEE PrepLab · Physics · Chemistry · Mathematics
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.05]">
              The quiz app that{' '}
              <span className="text-brand-600">notices</span> what you're weak at.
            </h1>

            <p className="mt-5 text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed">
              Built by a JEE aspirant for JEE aspirants. Every question carries difficulty <em>and</em> cognitive-type tags — so when you get something wrong, you find out <em>why</em>, not just <em>what</em>.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link to="/sign-in">
                <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                  Try the demo
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="secondary">
                  Skip to dashboard
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              No sign-up required for this prototype · Dummy data for now · Real PYQs across all 3 subjects in v1
            </p>
          </div>
        </div>
      </section>

      {/* Why three pillars */}
      <section className="container-page py-12 sm:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 max-w-2xl">
          Three problems most prep apps ignore. We don't.
        </h2>

        <div className="mt-8 grid sm:grid-cols-3 gap-4">
          <Pillar
            icon={<Brain className="w-6 h-6" />}
            title="What kind of mistake?"
            body="Every question is tagged Recall · Conceptual · Analytical · Application. After your quiz, you know if you're missing theory or struggling to apply it."
          />
          <Pillar
            icon={<Target className="w-6 h-6" />}
            title="Right difficulty, every time"
            body="An adaptive engine reads your per-topic mastery (0–100) and picks the next question's difficulty. Hard when you're ready. Easy when you need to rebuild."
          />
          <Pillar
            icon={<Activity className="w-6 h-6" />}
            title="Heatmap, not a wall of scores"
            body="See your weak chapters and topics at a glance. Topic-grid heatmap rows × difficulty bands. Clicking red goes straight to a drill."
          />
        </div>
      </section>

      {/* Subjects covered */}
      <section className="container-page pb-16">
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-5 sm:p-6">
          <p className="font-semibold text-brand-900 text-sm mb-3 uppercase tracking-wide">
            All three JEE subjects covered
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            <SubjectChip label="Physics" topics="26 topics across 10 chapters" />
            <SubjectChip label="Chemistry" topics="24 topics across 10 chapters" />
            <SubjectChip label="Mathematics" topics="25 topics across 10 chapters" />
          </div>
          <p className="mt-4 text-sm text-brand-800">
            Class 11 and Class 12 NCERT-aligned. Switch subjects from the header anytime.
          </p>
        </div>
      </section>
    </>
  );
}

function SubjectChip({ label, topics }: { label: string; topics: string }) {
  return (
    <div className="bg-white rounded-lg border border-brand-200 p-3">
      <div className="font-semibold text-slate-900">{label}</div>
      <div className="text-xs text-slate-600 mt-0.5">{topics}</div>
    </div>
  );
}

function Pillar({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      <div className="inline-flex w-11 h-11 items-center justify-center rounded-lg bg-brand-100 text-brand-700 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{body}</p>
    </div>
  );
}
