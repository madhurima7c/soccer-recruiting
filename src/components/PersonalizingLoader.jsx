import { useState, useEffect, useMemo } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { getAllIntegrations } from '../lib/integrations';

const INTEGRATION_STEPS = {
  hudl: 'Indexing Hudl film and highlight reels',
  wyscout: 'Scraping Wyscout player profiles and comps',
  ecnl: 'Syncing ECNL pipeline and event data',
  excel: 'Importing roster spreadsheets from Excel',
  outlook: 'Reading Microsoft Email recruiting threads',
  gmail: 'Summarizing Gmail recruit conversations',
};

function buildSteps(profile) {
  const steps = [
    { id: 'profile', label: `Loading context for ${profile.college || 'your program'}` },
    { id: 'budget', label: `Applying $${profile.budgetK}k budget · ${profile.gradLosses} grad losses` },
  ];

  if (profile.positionsNeeded?.length) {
    steps.push({
      id: 'needs',
      label: `Mapping needs: ${profile.positionsNeeded.slice(0, 3).join(', ')}`,
    });
  }

  if (profile.coachingStyle?.length) {
    steps.push({
      id: 'style',
      label: `Calibrating for ${profile.coachingStyle.slice(0, 2).join(' + ')} style`,
    });
  }

  const connected = getAllIntegrations(profile).filter((i) => profile.integrations?.[i.id]?.connected);
  for (const item of connected) {
    steps.push({
      id: item.id,
      label: INTEGRATION_STEPS[item.id] || `Connecting ${item.name}`,
    });
  }

  if (!connected.length) {
    steps.push({ id: 'integrations-skip', label: 'Skipping integrations — connect later in settings' });
  }

  if (profile.familyBackground?.trim()) {
    steps.push({ id: 'personal', label: 'Factoring in personal context you shared' });
  }

  steps.push({ id: 'finalize', label: 'Personalizing your workspace' });
  return steps;
}

export default function PersonalizingLoader({ profile, onComplete }) {
  const steps = useMemo(() => buildSteps(profile), [profile]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (activeIndex >= steps.length) {
      const t = setTimeout(() => {
        setDone(true);
        onComplete();
      }, 500);
      return () => clearTimeout(t);
    }

    const delay = steps[activeIndex].id === 'finalize' ? 900 : 650;
    const t = setTimeout(() => setActiveIndex((i) => i + 1), delay);
    return () => clearTimeout(t);
  }, [activeIndex, steps, onComplete]);

  const progress = Math.min(100, Math.round((activeIndex / steps.length) * 100));

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-ink">
      <div className="w-full max-w-md">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="relative mb-6 flex h-16 w-16 items-center justify-center">
            {!done && (
              <Loader2 className="absolute h-16 w-16 animate-spin text-orange-500/30" strokeWidth={1.5} />
            )}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-purple-600 text-sm font-bold text-white">
              RM
            </div>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">
            {done ? 'Ready.' : 'Personalizing your experience'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {done
              ? 'Opening your workspace…'
              : 'Using your integrations and coaching context to tailor RosterMind.'}
          </p>
        </div>

        <div className="mb-8 h-1 overflow-hidden rounded-full bg-neutral-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 via-purple-500 to-orange-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <ul className="space-y-3">
          {steps.map((step, i) => {
            const complete = i < activeIndex;
            const current = i === activeIndex && !done;
            return (
              <li
                key={step.id}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all duration-300 ${
                  current
                    ? 'bg-white ring-1 ring-orange-300 shadow-sm'
                    : complete
                      ? 'text-muted'
                      : 'text-neutral-400'
                }`}
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    complete
                      ? 'bg-green-100 text-green-600'
                      : current
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  {complete ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : current ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                </span>
                <span className={complete ? 'line-through decoration-neutral-300' : ''}>{step.label}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pointer-events-none fixed bottom-0 left-1/2 h-48 w-[500px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-3xl" />
    </div>
  );
}
