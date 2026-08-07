import React, { useState } from 'react'
import { HelpCircle, Sparkles, X } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useStore } from '../store'
import type { FitGate, MetricKey, Person, Tier } from '../types'
import { METRIC_LABELS } from '../types'

export function Avatar({ staffId, size = 24 }: { staffId: string; size?: number }) {
  const m = useStore(s => s.staff.find(x => x.id === staffId))
  if (!m) return null
  return (
    <span
      title={`${m.name} — ${m.role}`}
      className="inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0"
      style={{ background: m.color, width: size, height: size, fontSize: size * 0.42 }}
    >
      {m.initials}
    </span>
  )
}

export function AuthorLine({ staffId, at }: { staffId: string; at?: string }) {
  const m = useStore(s => s.staff.find(x => x.id === staffId))
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-stone-500">
      <Avatar staffId={staffId} size={18} />
      <span className="font-medium text-stone-600">{m?.name}</span>
      {at && <span>· {fmtDate(at)}</span>}
    </span>
  )
}

export function fmtDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function TierChip({ tierId, small }: { tierId?: string; small?: boolean }) {
  const tier = useStore(s => s.program.tiers.find(t => t.id === tierId))
  if (!tier) return null
  return (
    <span
      title={tier.meaning}
      className={`inline-flex items-center rounded-full font-semibold ${small ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'}`}
      style={{ background: tier.color, color: tier.textColor }}
    >
      {tier.name}
    </span>
  )
}

export function PipelineBadge({ p }: { p: Person }) {
  if (!p.pipeline) return null
  const colors: Record<string, string> = { HS: 'bg-sky-100 text-sky-800', Transfer: 'bg-orange-100 text-orange-800', JuCo: 'bg-teal-100 text-teal-800' }
  return <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${colors[p.pipeline]}`}>{p.pipeline}</span>
}

// ── Law 1: every AI-produced element carries a tap-to-source affordance ──
export function WhySeeing({ sources, label = 'Why am I seeing this?' }: { sources: string[]; label?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-block">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
        className="inline-flex items-center gap-1 text-[11px] text-violet-700 hover:text-violet-900 underline decoration-dotted underline-offset-2"
      >
        <HelpCircle size={12} /> {label}
      </button>
      {open && (
        <span className="absolute left-0 top-5 z-50 block w-72 rounded-lg border border-violet-200 bg-white p-3 shadow-xl" onClick={e => e.stopPropagation()}>
          <span className="mb-1.5 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-violet-700">Sources</span>
            <button onClick={() => setOpen(false)}><X size={12} className="text-stone-400" /></button>
          </span>
          <ul className="space-y-1">
            {sources.map((s, i) => <li key={i} className="text-xs text-stone-700">• {s}</li>)}
          </ul>
          <span className="mt-2 block text-[10px] italic text-stone-400">The tool organizes and reflects — it never recommends.</span>
        </span>
      )}
    </span>
  )
}

export function DraftBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-800">
      <Sparkles size={10} /> AI draft — confirm
    </span>
  )
}

const GATE_STYLE: Record<FitGate['status'], { dot: string; label: string }> = {
  clear: { dot: 'bg-emerald-500', label: 'text-emerald-700' },
  open: { dot: 'bg-amber-400', label: 'text-amber-700' },
  concern: { dot: 'bg-red-500', label: 'text-red-700' },
  unknown: { dot: 'bg-stone-300', label: 'text-stone-500' },
}

export function FitGateStrip({ p, compact }: { p: Person; compact?: boolean }) {
  const gates: [string, FitGate][] = [['Soccer', p.fitGates.soccer], ['Academic', p.fitGates.academic], ['Financial', p.fitGates.financial]]
  return (
    <div className={`grid grid-cols-3 ${compact ? 'gap-1.5' : 'gap-2'}`}>
      {gates.map(([name, g]) => (
        <div key={name} title={g.note} className={`rounded-lg border border-stone-200 bg-white ${compact ? 'px-2 py-1' : 'px-3 py-2'}`}>
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${GATE_STYLE[g.status].dot}`} />
            <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-bold uppercase tracking-wide text-stone-500`}>{name}</span>
          </div>
          {!compact && <div className={`mt-0.5 truncate text-xs ${GATE_STYLE[g.status].label}`}>{g.note}</div>}
          {!compact && <div className="text-[10px] text-stone-400">updated {fmtDate(g.updated)}</div>}
        </div>
      ))}
    </div>
  )
}

// ── Benchmark bars: per-90 vs a NAMED template; weights visible (never a composite) ──
export function BenchmarkBars({ p, metrics, compact }: { p: Person; metrics?: MetricKey[]; compact?: boolean }) {
  const tpl = useStore(s => s.templates.find(t => t.id === p.templateId))
  if (!tpl || !p.stats) return <div className="text-xs text-stone-400">No imported stats yet.</div>
  const keys = metrics ?? (Object.entries(tpl.weights).filter(([, w]) => w >= 3).map(([k]) => k as MetricKey))
  const shown = keys.length ? keys : (Object.keys(tpl.values).slice(0, 6) as MetricKey[])
  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
        <span className="text-[11px] font-semibold text-stone-600">vs. {tpl.name}</span>
        <WhySeeing sources={[tpl.source, 'Weights are coach-defined (1–5), shown next to each bar', 'Imported per-90 data — Wyscout export schema']} label="template source" />
      </div>
      <div className="space-y-1.5">
        {shown.map(k => {
          const v = p.stats![k]
          const t = tpl.values[k]
          const max = Math.max(v, t) * 1.25
          return (
            <div key={k} className="text-xs">
              <div className="flex items-baseline justify-between">
                <span className="text-stone-600">{METRIC_LABELS[k]}
                  <span className="ml-1 rounded bg-stone-100 px-1 text-[9px] font-bold text-stone-500" title="Coach-defined weight for this position (1–5)">w{tpl.weights[k]}</span>
                </span>
                <span className="font-semibold tabular-nums text-stone-800">{v}</span>
              </div>
              <div className={`relative mt-0.5 ${compact ? 'h-1.5' : 'h-2'} w-full rounded bg-stone-100`}>
                <div className="absolute inset-y-0 left-0 rounded bg-stone-700/80" style={{ width: `${(v / max) * 100}%` }} />
                <div title={`Template: ${t}`} className="absolute inset-y-[-2px] w-0.5 bg-violet-500" style={{ left: `${(t / max) * 100}%` }} />
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-1 text-[10px] text-stone-400">▎purple tick = template value · wN = coach weight</div>
    </div>
  )
}

export function RatingSparkline({ p, width = 120, height = 32 }: { p: Person; width?: number; height?: number }) {
  if (!p.ratingsAcrossViewings.length) return <span className="text-[10px] text-stone-400">no viewings yet</span>
  const data = p.ratingsAcrossViewings.map((v, i) => ({ i, v }))
  return (
    <div style={{ width, height }} title={`Staff rating across ${data.length} viewings: ${p.ratingsAcrossViewings.join(' → ')}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 2, bottom: 2, left: 2 }}>
          <ReferenceLine y={3} stroke="#e7e5e4" />
          <Line type="monotone" dataKey="v" stroke="#0f766e" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-stone-500">{children}</div>
}

export function Card({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`rounded-xl border border-stone-200 bg-white shadow-sm ${onClick ? 'cursor-pointer hover:border-stone-300 hover:shadow' : ''} ${className}`}>
      {children}
    </div>
  )
}

export function Btn({ children, onClick, variant = 'default', className = '', disabled }: {
  children: React.ReactNode; onClick?: (e: React.MouseEvent) => void
  variant?: 'default' | 'primary' | 'ghost' | 'danger'; className?: string; disabled?: boolean
}) {
  const styles = {
    default: 'border border-stone-300 bg-white text-stone-700 hover:bg-stone-50',
    primary: 'bg-teal-700 text-white hover:bg-teal-800',
    ghost: 'text-stone-500 hover:bg-stone-100',
    danger: 'border border-red-200 bg-white text-red-700 hover:bg-red-50',
  }
  return (
    <button disabled={disabled} onClick={onClick} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40 ${styles[variant]} ${className}`}>
      {children}
    </button>
  )
}

export function ComplianceBadge({ p, big }: { p: Person; big?: boolean }) {
  return p.contactable ? (
    <span title={p.contactableReason} className={`inline-flex items-center gap-1 rounded-full bg-emerald-100 font-semibold text-emerald-800 ${big ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-[10px]'}`}>
      ✓ contactable
    </span>
  ) : (
    <span title={p.contactableReason} className={`inline-flex items-center gap-1 rounded-full bg-amber-100 font-semibold text-amber-900 ${big ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-[10px]'}`}>
      ⚠ evaluation only
    </span>
  )
}
