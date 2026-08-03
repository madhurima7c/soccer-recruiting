export default function ContextPanel({ profile, onEditContext, onRestartFromOnboarding }) {
  const rows = [
    { label: 'College', value: profile.college || '—' },
    { label: 'Conference / Division', value: `${profile.conference || '—'} · ${profile.division}` },
    { label: 'Formation', value: profile.formation },
    { label: 'Roster', value: `${profile.rosterSize} players · ${profile.gradLosses} grads out` },
    { label: 'Budget', value: `$${profile.budgetK}k scholarship` },
    { label: 'Positions needed', value: profile.positionsNeeded.join(', ') || '—' },
    { label: 'Coaching style', value: profile.coachingStyle.join(', ') || '—' },
    { label: 'Player preferences', value: profile.playerPrefs.join(', ') || '—' },
    { label: 'Personal context', value: profile.familyBackground || '—' },
  ];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Context</h1>
          <p className="mt-2 text-sm text-muted">
            What RosterMind knows about your program—used in every chat and report.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <button
            type="button"
            onClick={onEditContext}
            className="rounded-lg border border-line px-3 py-1.5 text-xs text-ink hover:bg-surface"
          >
            Edit in onboarding
          </button>
          <button
            type="button"
            onClick={onRestartFromOnboarding}
            className="rounded-lg border border-line px-3 py-1.5 text-xs text-muted hover:border-orange-300 hover:text-orange-600"
          >
            Restart from onboarding
          </button>
        </div>
      </div>

      <dl className="mt-8 space-y-3">
        {rows.map((r) => (
          <div key={r.label} className="card">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-muted">{r.label}</dt>
            <dd className="mt-1 text-sm text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
