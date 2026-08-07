// Small visualization primitives. Deliberate absences honored (DECISIONS #14):
// no radar charts, no composite scores, no fit indexes — shape only, the read
// belongs to the coach (Law 1).
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  SEASONS, PITCH_SPOTS, staffById, tierById, recruitById,
  type DimRead, type FitStatus, type Position, FIT_LABEL,
} from '@/data/seed'
import type { MatchSignal } from '@/lib/match'
import { cn } from '@/lib/utils'
import { CheckCircle2, CircleDashed, AlertTriangle, HelpCircle } from 'lucide-react'

// ── Eligibility runway: which of the next 4 seasons a player is present ─────
export function RunwayBar({ from, years, ghost }: { from: number; years: number; ghost?: boolean }) {
  return (
    <div className="flex gap-0.5" aria-label={`On campus ${from}–${from + years - 1}`}>
      {SEASONS.map(season => {
        const present = season >= from && season < from + years
        return (
          <div
            key={season}
            className={cn(
              'h-2 w-3.5 rounded-[2px]',
              present ? (ghost ? 'bg-primary/35 border border-dashed border-primary/60' : 'bg-primary') : 'bg-muted',
            )}
          />
        )
      })}
    </div>
  )
}

export function RunwayLegend() {
  return (
    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
      {SEASONS.map(s => <span key={s} className="w-3.5 text-center">{String(s).slice(2)}</span>)}
    </div>
  )
}

// ── Ratings across viewings: attributed 1–5 trend, never averaged ───────────
export function RatingSparkline({ ratings }: { ratings: number[] }) {
  if (!ratings.length) return <span className="text-xs text-muted-foreground">not yet assessed</span>
  const w = Math.max(ratings.length * 12, 24)
  const pts = ratings.map((r, i) => `${6 + i * 12},${26 - r * 4.4}`).join(' ')
  return (
    <svg width={w} height={28} className="overflow-visible" role="img"
      aria-label={`Ratings across ${ratings.length} viewings: ${ratings.join(', ')}`}>
      <polyline points={pts} fill="none" className="stroke-primary" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {ratings.map((r, i) => (
        <circle key={i} cx={6 + i * 12} cy={26 - r * 4.4} r={2.5} className="fill-primary" />
      ))}
    </svg>
  )
}

// ── Metric vs named benchmark: bar with template tick + weight shown open ───
export function BenchmarkBar({ label, value, benchmark, max, weight, unit }: {
  label: string; value: number; benchmark: number; max: number; weight?: number; unit?: string
}) {
  const vPct = Math.min((value / max) * 100, 100)
  const bPct = Math.min((benchmark / max) * 100, 100)
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2 text-xs">
        <span className="text-muted-foreground">{label}
          {weight ? <span className="ml-1.5 font-mono text-[10px] text-muted-foreground/70">w{weight}</span> : null}
        </span>
        <span className="font-mono font-medium">{value}{unit}</span>
      </div>
      <div className="relative h-2 rounded-full bg-muted">
        <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${vPct}%` }} />
        <Tooltip>
          <TooltipTrigger
            className="absolute -top-0.5 h-3 w-0.5 rounded bg-foreground/70"
            style={{ left: `calc(${bPct}% - 1px)` }}
            aria-label={`Template: ${benchmark}${unit ?? ''}`}
          />
          <TooltipContent side="top">Template: {benchmark}{unit}</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}

// ── Attributed dimension reads — divergence shown, never averaged (Law 1) ───
export function DimReads({ reads }: { reads: DimRead[] }) {
  const byDim = new Map<string, DimRead[]>()
  reads.forEach(r => byDim.set(r.dim, [...(byDim.get(r.dim) ?? []), r]))
  if (!byDim.size) return <p className="text-xs text-muted-foreground">Not yet assessed — an evaluation gap, not a zero.</p>
  return (
    <div className="space-y-2">
      {[...byDim.entries()].map(([dim, rs]) => {
        const divergent = rs.length > 1 && Math.max(...rs.map(r => r.score)) - Math.min(...rs.map(r => r.score)) >= 2
        return (
          <div key={dim} className="flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground w-20 shrink-0">{dim}</span>
            <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
              {rs.map((r, i) => {
                const s = staffById(r.by)
                return (
                  <Tooltip key={i}>
                    <TooltipTrigger className="flex items-center gap-1.5">
                      <span className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(n => (
                          <span key={n} className={cn('h-1.5 w-1.5 rounded-full', n <= r.score ? 'bg-foreground' : 'bg-muted')} />
                        ))}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">{s.initials}</span>
                    </TooltipTrigger>
                    <TooltipContent side="top">{s.name} · {r.on}</TooltipContent>
                  </Tooltip>
                )
              })}
              {divergent && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  divergent
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Tier chip — color never alone, name always visible ──────────────────────
export function TierChip({ tierId, compact }: { tierId?: string; compact?: boolean }) {
  const tier = tierById(tierId)
  if (!tier) return null
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium"
      style={{ borderColor: `${tier.color}55`, color: tier.color, backgroundColor: `${tier.color}14` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tier.color }} />
      {compact ? tier.name.split(' ')[0] : tier.name}
    </span>
  )
}

// ── Fit gates strip — the triple every program named ────────────────────────
const FIT_ICON: Record<FitStatus, React.ReactNode> = {
  clear: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />,
  open: <CircleDashed className="h-3.5 w-3.5 text-sky-600" />,
  concern: <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />,
  unknown: <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />,
}
export function FitGate({ label, status }: { label: string; status: FitStatus }) {
  return (
    <div className="flex items-center gap-1.5 rounded-md border bg-card px-2 py-1.5">
      {FIT_ICON[status]}
      <div className="leading-tight">
        <div className="text-[11px] font-medium">{label}</div>
        <div className="text-[10px] text-muted-foreground">{FIT_LABEL[status]}</div>
      </div>
    </div>
  )
}

// ── Staff avatar ─────────────────────────────────────────────────────────────
export function StaffAvatar({ staffId, size = 'sm' }: { staffId: string; size?: 'sm' | 'md' }) {
  const s = staffById(staffId)
  return (
    <Tooltip>
      <TooltipTrigger>
        <Avatar className={size === 'sm' ? 'h-5 w-5' : 'h-7 w-7'}>
          <AvatarFallback className="text-[9px] font-semibold text-white" style={{ backgroundColor: s.color }}>
            {s.initials}
          </AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent side="top">{s.name} — {s.role}</TooltipContent>
    </Tooltip>
  )
}

// ── Law note — the visible microcopy stance ─────────────────────────────────
export function LawNote({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] italic text-muted-foreground/80">{children}</p>
}

// ── Mini pitch — read-only thumbnail of a formation / scenario ──────────────
// Placed recruits render as tier-colored dots on their position spot;
// `highlight` rings one position group.
export function MiniPitch({ placedRecruitIds = [], highlight, gaps = [], className }: {
  placedRecruitIds?: string[]
  highlight?: Position
  gaps?: Position[]
  className?: string
}) {
  const placedByPos = new Map<Position, string[]>()
  placedRecruitIds.forEach(id => {
    const r = recruitById(id)
    if (r) placedByPos.set(r.position, [...(placedByPos.get(r.position) ?? []), id])
  })
  // hand out one pitch spot per placement within a group
  const spotAssignments: { x: number; y: number; color: string }[] = []
  const used = new Map<Position, number>()
  placedRecruitIds.forEach(id => {
    const r = recruitById(id)
    if (!r) return
    const spots = PITCH_SPOTS.filter(s => s.pos === r.position)
    const idx = used.get(r.position) ?? 0
    const spot = spots[Math.min(idx, spots.length - 1)]
    used.set(r.position, idx + 1)
    spotAssignments.push({ x: spot.x, y: spot.y, color: tierById(r.tierId)?.color ?? '#888' })
  })

  return (
    <div className={cn('relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-md border bg-muted/20', className)}>
      <div className="absolute inset-1 rounded-sm border border-foreground/15" />
      <div className="absolute left-1 right-1 top-1/2 border-t border-foreground/15" />
      {PITCH_SPOTS.map((s, i) => (
        <span
          key={i}
          className={cn(
            'absolute -translate-x-1/2 -translate-y-1/2 rounded-full',
            highlight === s.pos
              ? 'h-2.5 w-2.5 bg-[#16A34A] ring-2 ring-[#16A34A]/30'
              : gaps.includes(s.pos)
                ? 'h-2.5 w-2.5 border-2 border-dashed border-[#EA580C] bg-transparent'
                : 'h-1.5 w-1.5 bg-foreground/70',
          )}
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
        />
      ))}
      {spotAssignments.map((a, i) => (
        <span
          key={`p${i}`}
          className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm dark:border-neutral-900"
          style={{ left: `${a.x}%`, top: `${a.y - 5}%`, backgroundColor: a.color }}
        />
      ))}
    </div>
  )
}

// ── Match signal chips — the WHY of every suggestion, in coach language ─────
const SIGNAL_STYLE: Record<MatchSignal['kind'], string> = {
  character: 'border-violet-300 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/60 dark:text-violet-300',
  strength: 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-300',
  read: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300',
  timeline: 'border-border bg-muted text-muted-foreground',
}
export function SignalChips({ signals, max }: { signals: MatchSignal[]; max?: number }) {
  const shown = max ? signals.slice(0, max) : signals
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((s, i) => (
        <span key={i} className={cn('rounded-full border px-2 py-0.5 text-[10px] leading-tight', SIGNAL_STYLE[s.kind])}>
          {s.text}
        </span>
      ))}
      {max && signals.length > max && (
        <span className="rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">+{signals.length - max} more</span>
      )}
    </div>
  )
}

export function SignalCount({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
      {n} shared signal{n === 1 ? '' : 's'}
    </span>
  )
}
