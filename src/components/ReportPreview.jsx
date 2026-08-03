function BarChart({ title, rows }) {
  const max = Math.max(...rows.flatMap((r) => r.values), 1);
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</p>
      <div className="mt-3 space-y-2">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex justify-between text-[11px] text-ink">
              <span>{row.label}</span>
            </div>
            <div className="flex gap-1">
              {row.values.map((v, i) => (
                <div key={i} className="flex-1">
                  <div
                    className="rounded-sm bg-gradient-to-t from-orange-500 to-orange-300"
                    style={{ height: `${(v / max) * 56 + 8}px` }}
                  />
                  <p className="mt-0.5 text-center text-[9px] text-muted">{row.names?.[i] || v}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetBars({ segments }) {
  const total = segments.reduce((s, x) => s + x.value, 0);
  return (
    <div className="rounded-xl border border-line bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Budget allocation</p>
      <div className="mt-3 flex h-8 overflow-hidden rounded-lg">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className="flex items-center justify-center text-[9px] font-medium text-white"
            style={{ width: `${(seg.value / total) * 100}%`, backgroundColor: seg.color }}
            title={`${seg.label}: $${seg.value}k`}
          >
            {seg.value > 15 ? `$${seg.value}k` : ''}
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-3">
        {segments.map((seg) => (
          <span key={seg.label} className="flex items-center gap-1 text-[10px] text-muted">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: seg.color }} />
            {seg.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ReportPreview({ reportData }) {
  if (!reportData) return null;

  if (reportData.kind === 'player-compare') {
    const { playerA, playerB, bars, narrative, recommendation } = reportData;
    return (
      <div className="mt-3 space-y-3 rounded-xl border border-line bg-surface p-4">
        <p className="text-xs font-semibold text-ink">{playerA.name} vs {playerB.name}</p>
        <BarChart
          title="Attribute comparison (1–10)"
          rows={bars}
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg bg-white p-3 text-xs text-ink border border-line">
            <p className="font-medium text-orange-600">{playerA.name}</p>
            <p className="mt-1 text-muted">OVR {playerA.ovr} · ${playerA.cost}k</p>
          </div>
          <div className="rounded-lg bg-white p-3 text-xs text-ink border border-line">
            <p className="font-medium text-purple-600">{playerB.name}</p>
            <p className="mt-1 text-muted">OVR {playerB.ovr} · ${playerB.cost}k</p>
          </div>
        </div>
        {narrative?.map((p, i) => (
          <p key={i} className="text-xs leading-relaxed text-muted">{p}</p>
        ))}
        {recommendation && (
          <p className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-ink">
            <span className="font-semibold">Recommendation: </span>{recommendation}
          </p>
        )}
      </div>
    );
  }

  if (reportData.kind === 'rival-strategy') {
    return (
      <div className="mt-3 space-y-3 rounded-xl border border-line bg-surface p-4">
        <BudgetBars segments={reportData.budgetSegments} />
        <div className="rounded-xl border border-line bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Rival gap index</p>
          <div className="mt-3 space-y-2">
            {reportData.gapBars.map((g) => (
              <div key={g.label}>
                <div className="flex justify-between text-[11px]">
                  <span>{g.label}</span>
                  <span className="text-muted">{g.score}/100</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-neutral-100">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-orange-400 to-purple-500"
                    style={{ width: `${g.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        {reportData.narrative?.map((p, i) => (
          <p key={i} className="text-xs leading-relaxed text-muted">{p}</p>
        ))}
      </div>
    );
  }

  return null;
}
