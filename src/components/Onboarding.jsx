import { useState } from 'react';
import { Check, ArrowUpRight } from 'lucide-react';
import { getAllIntegrations } from '../lib/integrations';

const POSITIONS = ['Striker', 'Winger', 'Attacking Mid', 'Center Mid', 'Defensive Mid', 'Center Back', 'Fullback', 'Goalkeeper'];
const STYLES = ['High press', 'Possession', 'Direct', 'Counter-attack', 'Set-piece focus'];
const PREFS = ['High competition', 'Leadership', 'Culture fit', 'Development upside', 'Academic fit', 'Budget-friendly'];

const STEPS = 8;

function ProgressBar({ step }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: STEPS }).map((_, i) => (
        <span
          key={i}
          className={`h-1 w-6 rounded-full transition ${i <= step ? 'bg-ink' : 'bg-neutral-300'}`}
        />
      ))}
    </div>
  );
}

function TogglePill({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`pill ${active ? 'pill-active' : 'hover:border-neutral-400'}`}
    >
      {active && <Check className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

function toggle(arr, item) {
  return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
}

export default function Onboarding({ profile, onUpdate, onComplete }) {
  const [step, setStep] = useState(profile.step || 0);

  function patch(fields) {
    onUpdate({ ...profile, ...fields, step });
  }

  function next() {
    const n = Math.min(step + 1, STEPS - 1);
    setStep(n);
    onUpdate({ ...profile, step: n });
    if (n === STEPS - 1) {
      onComplete({ ...profile, step: n, onboardingComplete: true, personalizationComplete: false });
    }
  }

  function prev() {
    const n = Math.max(step - 1, 0);
    setStep(n);
    onUpdate({ ...profile, step: n });
  }

  function connect(id) {
    const integrations = {
      ...profile.integrations,
      [id]: {
        connected: !profile.integrations?.[id]?.connected,
        connectedAt: new Date().toISOString(),
      },
    };
    patch({ integrations });
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-[#efefef]">
      <header className="flex items-center justify-between px-8 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
          <span className="text-sm font-bold">RM</span>
        </div>
        <ProgressBar step={step} />
        <div className="w-16" />
      </header>

      <main className={`mx-auto flex w-full flex-1 flex-col justify-center px-6 pb-32 pt-4 ${step === 6 ? 'max-w-5xl' : 'max-w-xl'}`}>
        {step === 0 && (
          <div className="space-y-6 text-center">
            <p className="text-sm text-muted">Let&apos;s build your coaching context.</p>
            <h1 className="text-2xl font-medium leading-snug text-ink">
              RosterMind learns your program so every answer fits your budget, style, and roster—not generic advice.
            </h1>
            <p className="text-sm text-muted">
              Takes ~3 minutes. You can connect Hudl, Wyscout, ECNL, and email later in this flow.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <p className="text-center text-sm text-muted">Where are you coaching?</p>
            <div className="card space-y-4">
              <input
                className="input-field"
                placeholder="College name (e.g. University of Washington)"
                value={profile.college}
                onChange={(e) => patch({ college: e.target.value })}
              />
              <input
                className="input-field"
                placeholder="Conference (e.g. Pac-12, Ivy League)"
                value={profile.conference}
                onChange={(e) => patch({ conference: e.target.value })}
              />
              <div className="flex flex-wrap gap-2">
                {['D1', 'D2', 'D3', 'NAIA'].map((d) => (
                  <TogglePill
                    key={d}
                    label={d}
                    active={profile.division === d}
                    onClick={() => patch({ division: d })}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <p className="text-center text-sm text-muted">Current team composition</p>
            <div className="card space-y-5">
              <label className="block text-sm">
                <span className="text-muted">Roster size</span>
                <input
                  type="range"
                  min={22}
                  max={35}
                  value={profile.rosterSize}
                  onChange={(e) => patch({ rosterSize: Number(e.target.value) })}
                  className="mt-2 w-full"
                />
                <span className="font-medium">{profile.rosterSize} players</span>
              </label>
              <input
                className="input-field"
                placeholder="Primary formation (e.g. 4-3-3)"
                value={profile.formation}
                onChange={(e) => patch({ formation: e.target.value })}
              />
              <label className="block text-sm">
                <span className="text-muted">Graduates / departures this cycle</span>
                <input
                  type="range"
                  min={0}
                  max={12}
                  value={profile.gradLosses}
                  onChange={(e) => patch({ gradLosses: Number(e.target.value) })}
                  className="mt-2 w-full"
                />
                <span className="font-medium">{profile.gradLosses} leaving</span>
              </label>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <p className="text-center text-sm text-muted">Budget & roster-filling requirements</p>
            <p className="text-center text-sm text-ink/80">
              Okay, the practical stuff—what can you spend, and what holes are you filling?
            </p>
            <div className="card">
              <div className="flex items-center gap-4">
                <span className="text-lg text-muted">$</span>
                <input
                  type="number"
                  className="input-field max-w-[100px] text-lg font-medium"
                  value={profile.budgetK}
                  onChange={(e) => patch({ budgetK: Number(e.target.value) || 0 })}
                />
                <span className="text-sm text-muted">K / year · scholarship budget</span>
              </div>
              <input
                type="range"
                min={40}
                max={250}
                value={profile.budgetK}
                onChange={(e) => patch({ budgetK: Number(e.target.value) })}
                className="mt-6 w-full"
              />
            </div>
            <p className="text-center text-sm text-muted">What positions are you recruiting?</p>
            <div className="flex flex-wrap justify-center gap-2">
              {POSITIONS.map((p) => (
                <TogglePill
                  key={p}
                  label={p}
                  active={profile.positionsNeeded.includes(p)}
                  onClick={() => patch({ positionsNeeded: toggle(profile.positionsNeeded, p) })}
                />
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <p className="text-center text-sm text-muted">Coaching style & player preferences</p>
            <p className="text-center text-sm text-ink/80">How do you play—and who fits?</p>
            <div className="space-y-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted">System</p>
              <div className="flex flex-wrap justify-center gap-2">
                {STYLES.map((s) => (
                  <TogglePill
                    key={s}
                    label={s}
                    active={profile.coachingStyle.includes(s)}
                    onClick={() => patch({ coachingStyle: toggle(profile.coachingStyle, s) })}
                  />
                ))}
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted">Player traits you prioritize</p>
              <div className="flex flex-wrap justify-center gap-2">
                {PREFS.map((p) => (
                  <TogglePill
                    key={p}
                    label={p}
                    active={profile.playerPrefs.includes(p)}
                    onClick={() => patch({ playerPrefs: toggle(profile.playerPrefs, p) })}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <p className="text-center text-sm text-muted">A little about you</p>
            <p className="text-center text-sm text-ink/80">
              Optional, but it helps RosterMind understand constraints outside the touchline—relocating family, dual-career household, etc.
            </p>
            <textarea
              className="input-field min-h-[140px] resize-none"
              placeholder="Brief family background (e.g. partner works in Seattle, two kids in elementary school…)"
              value={profile.familyBackground}
              onChange={(e) => patch({ familyBackground: e.target.value })}
            />
          </div>
        )}

        {step === 6 && (
          <div className="space-y-6">
            <p className="text-center text-sm text-muted">Connect your tools</p>
            <p className="text-center text-sm text-ink/80">
              We&apos;ll scrape Hudl, Wyscout, and ECNL for recruiting intel—and pull email context from Gmail or Outlook.
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {getAllIntegrations(profile).map((item) => {
                const connected = profile.integrations?.[item.id]?.connected;
                return (
                  <article key={item.id} className="card flex flex-col">
                    <div className="mb-3 flex items-start justify-between">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium uppercase text-muted">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="mt-2 flex-1 text-sm text-muted">{item.desc}</p>
                    <button
                      type="button"
                      onClick={() => connect(item.id)}
                      className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition ${
                        connected
                          ? 'border-green-600 bg-green-50 text-green-800'
                          : 'border-line hover:border-ink/30'
                      }`}
                    >
                      {connected ? (
                        <>
                          <Check className="h-4 w-4" /> Connected
                        </>
                      ) : (
                        <>
                          Connect <ArrowUpRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-6 text-center">
            <p className="text-sm text-muted">You&apos;re set.</p>
            <h2 className="text-xl font-medium">
              {profile.college || 'Your program'} · ${profile.budgetK}k · {profile.positionsNeeded.length || 'No'} position targets
            </h2>
            <p className="text-sm text-muted">
              {Object.values(profile.integrations || {}).filter((i) => i?.connected).length} integrations connected.
              Open the workspace to chat, generate PDFs, and review today&apos;s snapshot.
            </p>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#efefef] via-[#efefef] to-transparent pb-8 pt-16">
        <div className="flex justify-center gap-3">
          {step > 0 && (
            <button type="button" onClick={prev} className="btn-secondary">
              Previous
            </button>
          )}
          <button type="button" onClick={next} className="btn-primary">
            {step === STEPS - 1 ? 'Enter workspace' : 'Next step'}
          </button>
        </div>
      </footer>
      <div className="pointer-events-none fixed bottom-0 left-1/2 h-40 w-[600px] -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
    </div>
  );
}
