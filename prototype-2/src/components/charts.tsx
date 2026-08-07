// Graphic-heavy, digestible: radar (shape of a player), grouped depth bars
// (now vs next fall), stat tiles, and InfoTip — the ⓘ that explains every
// data point in coach language (EXPLAIN map). Rule: if a number can't be
// explained in one sentence, it doesn't ship.
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { EXPLAIN, POSITIONS, ROSTER, recruitById, type Position } from '@/data/seed'
import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── ⓘ — one-sentence explanation for any data point ─────────────────────────
export function InfoTip({ k, className }: { k: string; className?: string }) {
  const text = EXPLAIN[k]
  if (!text) return null
  return (
    <Tooltip>
      <TooltipTrigger
        render={<span className={cn('inline-flex cursor-help align-middle text-muted-foreground/60 hover:text-muted-foreground', className)} />}
        aria-label={`What does ${k} mean?`}
      >
        <Info className="h-3 w-3" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-64 leading-snug">{text}</TooltipContent>
    </Tooltip>
  )
}

// ── Stat tile (the top row of the board) ─────────────────────────────────────
export function StatTile({ label, value, sub, info }: {
  label: string; value: React.ReactNode; sub?: string; info?: string
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">{label}{info && <InfoTip k={info} />}</div>
      <div className="mt-1 font-mono text-2xl font-semibold tracking-tight">{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  )
}

// ── Radar chart — up to 3 overlaid series, hand-rolled SVG ───────────────────
export interface RadarSeries { label: string; values: number[]; color: string }
export function RadarChart({ axes, series, size = 220, showMedian = true }: {
  axes: string[]; series: RadarSeries[]; size?: number; showMedian?: boolean
}) {
  const cx = size / 2, cy = size / 2
  const R = size / 2 - 34
  const n = axes.length
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2
  const pt = (i: number, v: number) => {
    const r = (v / 100) * R
    return [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))] as const
  }
  const ring = (v: number) => axes.map((_, i) => pt(i, v).join(',')).join(' ')
  const poly = (values: number[]) => values.map((v, i) => pt(i, v).join(',')).join(' ')

  return (
    <svg width={size} height={size} role="img"
      aria-label={`Radar: ${series.map(s => s.label).join(' vs ')} across ${axes.join(', ')}`}>
      {[25, 50, 75, 100].map(v => (
        <polygon key={v} points={ring(v)} fill="none"
          className={v === 50 && showMedian ? 'stroke-foreground/25' : 'stroke-border'}
          strokeWidth={v === 50 && showMedian ? 1.2 : 1} strokeDasharray={v === 50 && showMedian ? '3 3' : undefined} />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pt(i, 100)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} className="stroke-border" strokeWidth={1} />
      })}
      {series.map((s, si) => (
        <g key={si}>
          <polygon points={poly(s.values)} fill={s.color} fillOpacity={0.16} stroke={s.color} strokeWidth={2} strokeLinejoin="round" />
          {s.values.map((v, i) => {
            const [x, y] = pt(i, v)
            return <circle key={i} cx={x} cy={y} r={2.5} fill={s.color} />
          })}
        </g>
      ))}
      {axes.map((a, i) => {
        const [x, y] = pt(i, 118)
        return (
          <text key={a} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
            className="fill-muted-foreground" fontSize={9.5}>
            {a}
          </text>
        )
      })}
    </svg>
  )
}

export function RadarLegend({ series }: { series: RadarSeries[] }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
      {series.map(s => (
        <span key={s.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} /> {s.label}
        </span>
      ))}
      <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span className="h-0 w-3 border-t border-dashed border-foreground/40" /> league median
        <InfoTip k="radar" />
      </span>
    </div>
  )
}

// ── Depth bars — roster count now vs next fall, per position ────────────────
// Black = this fall (2026). Orange = fall 2027 after graduation, plus any
// placed recruits arriving by then. The graphic answer to "where are we thin?"
export function DepthBars({ placements = [], accent = '#EA580C' }: { placements?: string[]; accent?: string }) {
  const arriving = placements.map(id => recruitById(id)!).filter(r => r.arrives <= 2027)
  const max = 4
  return (
    <div className="space-y-1.5">
      {POSITIONS.map(pos => {
        const now = ROSTER.filter(p => p.position === pos).length
        const next = ROSTER.filter(p => p.position === pos && p.eligibilityLeft >= 2).length
          + arriving.filter(r => r.position === pos).length
        return (
          <div key={pos} className="flex items-center gap-2">
            <span className="w-6 shrink-0 font-mono text-[10px] font-medium text-muted-foreground">{pos}</span>
            <div className="flex flex-1 flex-col gap-0.5">
              <Tooltip>
                <TooltipTrigger render={<span className="block h-2 rounded-sm bg-foreground" style={{ width: `${(now / max) * 100}%` }} />} />
                <TooltipContent side="top">{pos}: {now} on roster this fall (2026)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger render={<span className={cn('block h-2 rounded-sm', next === 0 && 'outline-1 outline-dashed outline-destructive')} style={{ width: `${Math.max((next / max) * 100, 2)}%`, backgroundColor: accent }} />} />
                <TooltipContent side="top">{pos}: {next} projected fall 2027 (after graduation{arriving.some(r => r.position === pos) ? ' + placed arrivals' : ''})</TooltipContent>
              </Tooltip>
            </div>
            <span className="w-10 shrink-0 text-right font-mono text-[10px] text-muted-foreground">{now}→{next}</span>
          </div>
        )
      })}
      <div className="flex items-center gap-3 pt-1 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm bg-foreground" /> 2026 (now)</span>
        <span className="flex items-center gap-1"><span className="h-2 w-3 rounded-sm" style={{ backgroundColor: accent }} /> fall 2027</span>
      </div>
    </div>
  )
}

// ── Bullet stat — headline number + band with a conference-median tick ─────
// (the solar-dashboard tile pattern: big value, thin scale, one read)
export function BulletStat({ label, value, unit, min, max, median, invert, read, info, accent = '#EA580C' }: {
  label: string; value: number; unit?: string
  min: number; max: number; median: number
  invert?: boolean          // true when LOWER = more extreme (e.g. PPDA)
  read: string              // the one-line coach read
  info?: string
  accent?: string
}) {
  const pct = (v: number) => Math.min(Math.max(((v - min) / (max - min)) * 100, 0), 100)
  const extreme = invert ? value < median : value > median
  return (
    <div className="rounded-xl border bg-card p-3.5">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">{label}{info && <InfoTip k={info} />}</div>
      <div className="mt-0.5 font-mono text-xl font-semibold tracking-tight">
        {value}{unit && <span className="ml-0.5 text-sm font-normal text-muted-foreground">{unit}</span>}
      </div>
      <div className="relative mt-2 h-1.5 rounded-full bg-muted">
        <div className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${pct(value)}%`, backgroundColor: extreme ? accent : 'var(--foreground)' }} />
        <Tooltip>
          <TooltipTrigger render={<span className="absolute -top-1 h-3.5 w-0.5 rounded bg-foreground/50" style={{ left: `calc(${pct(median)}% - 1px)` }} />} />
          <TooltipContent side="top">Conference median: {median}{unit}</TooltipContent>
        </Tooltip>
      </div>
      <div className="mt-1 flex justify-between font-mono text-[9px] text-muted-foreground"><span>{min}</span><span>{max}</span></div>
      <p className={cn('mt-1 text-[11px] leading-snug', extreme ? 'font-medium' : 'text-muted-foreground')}>{read}</p>
    </div>
  )
}

// ── Tornado / diverging bars — the style LEAN (mine minus theirs) ──────────
export function LeanBars({ rows, mineColor = '#171717', rivalColor }: {
  rows: { axis: string; mine: number; theirs: number; diff: number; flagged: boolean }[]
  mineColor?: string
  rivalColor: string
}) {
  const maxAbs = Math.max(...rows.map(r => Math.abs(r.diff)), 20)
  return (
    <div className="space-y-1">
      {rows.map(r => (
        <div key={r.axis} className="grid grid-cols-[92px_1fr_1fr_40px] items-center gap-1.5">
          <span className={cn('truncate text-[10px]', r.flagged ? 'font-semibold text-destructive' : 'text-muted-foreground')}>
            {r.flagged && '⚠ '}{r.axis}
          </span>
          {/* they lead (bar grows left) */}
          <div className="flex h-3 justify-end rounded-l-sm bg-muted/60">
            {r.diff < 0 && (
              <Tooltip>
                <TooltipTrigger render={<span className="h-full rounded-l-sm" style={{ width: `${(Math.abs(r.diff) / maxAbs) * 100}%`, backgroundColor: rivalColor }} />} />
                <TooltipContent side="top">{r.axis}: them {r.theirs} vs you {r.mine} — they lead by {Math.abs(r.diff)}</TooltipContent>
              </Tooltip>
            )}
          </div>
          {/* I lead (bar grows right) */}
          <div className="h-3 rounded-r-sm bg-muted/60">
            {r.diff > 0 && (
              <Tooltip>
                <TooltipTrigger render={<span className="block h-full rounded-r-sm" style={{ width: `${(r.diff / maxAbs) * 100}%`, backgroundColor: mineColor }} />} />
                <TooltipContent side="top">{r.axis}: you {r.mine} vs them {r.theirs} — you lead by {r.diff}</TooltipContent>
              </Tooltip>
            )}
          </div>
          <span className={cn('text-right font-mono text-[10px]', r.flagged ? 'font-bold text-destructive' : 'text-muted-foreground')}>
            {r.diff > 0 ? `+${r.diff}` : r.diff}
          </span>
        </div>
      ))}
      <div className="grid grid-cols-[92px_1fr_1fr_40px] gap-1.5 pt-0.5 text-[9px] text-muted-foreground">
        <span /><span className="text-right">◂ they lead</span><span>you lead ▸</span><span />
      </div>
    </div>
  )
}

// ── Dumbbell — my unit vs their unit, per line ──────────────────────────────
export function UnitDumbbells({ mine, theirs, rivalColor }: {
  mine: { DEF: number; MID: number; ATT: number }
  theirs: { DEF: number; MID: number; ATT: number }
  rivalColor: string
}) {
  const rows = (['DEF', 'MID', 'ATT'] as const)
  return (
    <div className="space-y-2.5">
      {rows.map(u => {
        const a = mine[u], b = theirs[u]
        const lo = Math.min(a, b), hi = Math.max(a, b)
        return (
          <div key={u} className="flex items-center gap-2">
            <span className="w-8 shrink-0 font-mono text-[10px] font-medium text-muted-foreground">{u}</span>
            <div className="relative h-4 flex-1">
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
              <div className="absolute top-1/2 h-0.5 -translate-y-1/2 bg-foreground/30" style={{ left: `${lo}%`, width: `${hi - lo}%` }} />
              <Tooltip>
                <TooltipTrigger render={<span className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground" style={{ left: `${a}%` }} />} />
                <TooltipContent side="top">Your {u}: {a}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger render={<span className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ left: `${b}%`, backgroundColor: rivalColor }} />} />
                <TooltipContent side="top">Their {u}: {b}</TooltipContent>
              </Tooltip>
            </div>
            <span className="w-12 shrink-0 text-right font-mono text-[10px] text-muted-foreground">{a}·{b}</span>
          </div>
        )
      })}
    </div>
  )
}

// convenience: is a position group thinning next fall?
export function gapPositions(): Position[] {
  return POSITIONS.filter(pos => {
    const next = ROSTER.filter(p => p.position === pos && p.eligibilityLeft >= 2).length
    const grad = ROSTER.some(p => p.position === pos && p.graduating)
    return grad && next <= 1
  })
}
