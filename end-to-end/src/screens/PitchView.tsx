import React, { useMemo, useState } from 'react'
import { ArrowLeftRight, Columns3, ExternalLink, Plus, Star, X } from 'lucide-react'
import { useStore } from '../store'
import type { Capture, MetricKey, Person, Position, SnapshotPlacement, StaffMember, WhatIfSnapshot } from '../types'
import { METRIC_LABELS, POSITIONS } from '../types'
import { AuthorLine, BenchmarkBars, Btn, RatingSparkline, SectionLabel, TierChip, WhySeeing } from '../lib/ui'

// ── The pitch planner: The-Athletic-style squad depth as an interactive lens over the same
//    Person spine. The tool shows the shape of the squad; the judgment call stays the coach's. ──

const SEASONS = [2026, 2027, 2028, 2029]
export const seasonLabel = (s: number) => `${s}–${String(s + 1).slice(2)}`

// display-only layout: groups with 3+ bodies split across mirrored boxes (noted in DECISIONS)
interface Spot { pos: Position; side?: 'L' | 'R'; x: number; y: number }
const SPOTS: Spot[] = [
  { pos: 'F', x: 50, y: 9 },
  { pos: 'W', side: 'L', x: 17, y: 20 }, { pos: 'W', side: 'R', x: 83, y: 20 },
  { pos: 'CM', side: 'L', x: 32, y: 38 }, { pos: 'CM', side: 'R', x: 68, y: 38 },
  { pos: 'DM', x: 50, y: 54 },
  { pos: 'FB', side: 'L', x: 14, y: 66 }, { pos: 'FB', side: 'R', x: 86, y: 66 },
  { pos: 'CB', side: 'L', x: 35, y: 78 }, { pos: 'CB', side: 'R', x: 65, y: 78 },
  { pos: 'GK', x: 50, y: 91 },
]

// seasons a person is available: [from, to] inclusive season-start years
export function span(p: Person): { from: number; to: number } {
  if (p.lifecycle === 'rosterPlayer') return { from: 2026, to: p.classYear - 1 }
  const m = p.school?.match(/\((\d+)\s*yrs?\s*elig/)
  const years = p.pipeline === 'Transfer' ? (m ? parseInt(m[1]) : 2) : p.pipeline === 'JuCo' ? 2 : 4
  const from = p.pipeline === 'Transfer' ? 2026 : p.classYear
  return { from, to: from + years - 1 }
}

type Lens = { id: string; label: string; kind: 'runway' | 'dim' | 'metric' }
const METRIC_LENSES: MetricKey[] = ['duelsWonPct', 'passAccPct', 'progRunsP90', 'goalsP90']

// attributed reads on a dimension: roster → spring-review staffDims; recruits → latest capture per author.
// Pure function so every surface (pitch lens, comparison reveal) reads from the SAME records — no forked truths.
export function dimReads(dim: string, p: Person, captures: Capture[], staff: StaffMember[]): { score: number; initials: string; name: string; source: string }[] {
  if (p.lifecycle === 'rosterPlayer') {
    return (p.staffDims ?? []).filter(d => d.name === dim).map(d => {
      const m = staff.find(x => x.id === d.by)
      return { score: d.score, initials: m?.initials ?? '?', name: m?.name ?? '?', source: 'spring review' }
    })
  }
  const seen = new Set<string>()
  const out: { score: number; initials: string; name: string; source: string }[] = []
  captures.filter(c => c.personId === p.id && c.dims?.some(d => d.name === dim))
    .sort((a, b) => b.at.localeCompare(a.at))
    .forEach(c => {
      if (seen.has(c.authorId)) return
      seen.add(c.authorId)
      const m = staff.find(x => x.id === c.authorId)
      const d = c.dims!.find(x => x.name === dim)!
      out.push({ score: d.score, initials: m?.initials ?? '?', name: m?.name ?? '?', source: 'live capture' })
    })
  return out
}

function useDimReads(dim: string) {
  const captures = useStore(s => s.captures)
  const staff = useStore(s => s.staff)
  return (p: Person) => dimReads(dim, p, captures, staff)
}

function MetricMiniBar({ p, k }: { p: Person; k: MetricKey }) {
  const tpl = useStore(s => s.templates.find(t => t.id === p.templateId))
  if (!p.stats || !tpl) return <span className="text-[9px] text-white/40">no stats</span>
  const v = p.stats[k], t = tpl.values[k], max = Math.max(v, t) * 1.25
  return (
    <span className="inline-flex items-center gap-1" title={`${METRIC_LABELS[k]}: ${v} · template (${tpl.name}): ${t}`}>
      <span className="relative inline-block h-1.5 w-10 rounded bg-white/15 align-middle">
        <span className="absolute inset-y-0 left-0 rounded bg-white/70" style={{ width: `${(v / max) * 100}%` }} />
        <span className="absolute inset-y-[-2px] w-px bg-violet-400" style={{ left: `${(t / max) * 100}%` }} />
      </span>
      <span className="text-[9px] tabular-nums text-white/70">{v}</span>
    </span>
  )
}

function PlayerCardModal({ p, onClose, onAddToCanvas }: { p: Person; onClose: () => void; onAddToCanvas: (id: string) => void }) {
  const navigate = useStore(s => s.navigate)
  const staff = useStore(s => s.staff)
  const sp = span(p)
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-6" onClick={onClose}>
      <div className="max-h-[80vh] w-96 overflow-auto rounded-2xl bg-white p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <div className="text-base font-bold text-stone-900">{p.name}</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-stone-500">
              {p.lifecycle === 'recruit' ? <TierChip tierId={p.tierId} small /> : <span className="rounded bg-stone-800 px-1.5 py-0.5 text-[9px] font-bold text-white">#{p.jersey}</span>}
              {p.positions.join('/')} · available {seasonLabel(sp.from)} → {seasonLabel(sp.to)}
            </div>
          </div>
          <button onClick={onClose}><X size={16} className="text-stone-400" /></button>
        </div>
        <div className="mt-3"><BenchmarkBars p={p} compact /></div>
        {(p.staffDims?.length || p.lifecycle === 'recruit') && (
          <div className="mt-3">
            <SectionLabel>Attributed reads</SectionLabel>
            {p.staffDims?.map((d, i) => {
              const m = staff.find(x => x.id === d.by)
              return <div key={i} className="text-xs text-stone-600">{d.name}: <b>{d.score}/5</b> — {m?.name}, spring review</div>
            })}
            {p.lifecycle === 'recruit' && <div className="text-[11px] text-stone-400">Recruit reads come from live captures — open the profile for the full timeline.</div>}
          </div>
        )}
        {p.lifecycle === 'recruit' && p.ratingsAcrossViewings.length > 0 && (
          <div className="mt-3">
            <SectionLabel>Trend across viewings</SectionLabel>
            <RatingSparkline p={p} width={200} height={36} />
          </div>
        )}
        {p.idp && <div className="mt-3 rounded-lg bg-teal-50 p-2 text-xs text-teal-900">IDP: {p.idp.focus} — the develop-instead branch.</div>}
        <div className="mt-4 flex gap-2">
          <Btn variant="primary" className="!text-xs" onClick={() => { onAddToCanvas(p.id); onClose() }}>
            <span className="flex items-center gap-1"><Columns3 size={13} /> Add to comparison canvas</span>
          </Btn>
          <Btn className="!text-xs" onClick={() => navigate('profile', p.id)}>
            <span className="flex items-center gap-1"><ExternalLink size={13} /> Full profile</span>
          </Btn>
        </div>
      </div>
    </div>
  )
}

function IntentModal({ pos, person, season, onPick, onClose }: {
  pos: Position; person: Person; season: number
  onPick: (intent: SnapshotPlacement['intent']) => void; onClose: () => void
}) {
  const people = useStore(s => s.people)
  // replace-candidates are judged against the recruit's ARRIVAL horizon, not just the scrubbed season —
  // an HS ’27 placement should offer the players who'll be gone by the time she lands
  const horizon = Math.max(season, span(person).from)
  const leaving = people.filter(x => x.lifecycle === 'rosterPlayer' && x.positions[0] === pos && span(x).to <= horizon)
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-6" onClick={onClose}>
      <div className="w-96 rounded-2xl bg-white p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="text-base font-bold text-stone-900">How does this placement read?</div>
        <div className="mt-1 text-xs text-stone-500">{person.name} → {pos}. Your call, recorded with the scenario — is she replacing someone or strengthening the group?</div>
        <div className="mt-4 space-y-2">
          {leaving.map(l => (
            <button key={l.id} onClick={() => onPick({ kind: 'replace', targetId: l.id })}
              className="flex w-full items-center gap-2 rounded-lg border border-stone-200 p-2.5 text-left hover:bg-stone-50">
              <ArrowLeftRight size={15} className="shrink-0 text-red-600" />
              <span className="text-sm text-stone-800">Replaces <b>{l.name}</b><span className="ml-1 text-[11px] text-stone-400">{span(l).to < 2026 ? 'left spring ’26' : `final season ${seasonLabel(span(l).to)}`}</span></span>
            </button>
          ))}
          <button onClick={() => onPick({ kind: 'depth' })}
            className="flex w-full items-center gap-2 rounded-lg border border-stone-200 p-2.5 text-left hover:bg-stone-50">
            <Plus size={15} className="shrink-0 text-teal-700" />
            <span className="text-sm text-stone-800">Adds depth — strengthens the group</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PitchView({ draft, setDraft, viewSnap, onAddToCanvas, diffSlots }: {
  draft: SnapshotPlacement[]
  setDraft: React.Dispatch<React.SetStateAction<SnapshotPlacement[]>>
  viewSnap: WhatIfSnapshot | null
  onAddToCanvas: (id: string) => void
  diffSlots?: Set<string>
}) {
  const people = useStore(s => s.people)
  const program = useStore(s => s.program)
  const updateProgram = useStore(s => s.updateProgram)
  const toast = useStore(s => s.toast)
  const [season, setSeason] = useState(2026)
  const [lensId, setLensId] = useState('runway')
  const [cardFor, setCardFor] = useState<Person | null>(null)
  const [intentFor, setIntentFor] = useState<{ pos: Position; person: Person } | null>(null)

  const placements = viewSnap ? viewSnap.placements : draft

  const lenses: Lens[] = useMemo(() => {
    const all: Lens[] = [
      { id: 'runway', label: 'Eligibility runway', kind: 'runway' },
      ...program.dimensions.map(d => ({ id: d, label: d, kind: 'dim' as const })),
      ...METRIC_LENSES.map(k => ({ id: k, label: METRIC_LABELS[k], kind: 'metric' as const })),
    ]
    // coach-pinned season focus sorts first (after runway)
    return all.sort((a, b) => {
      const rank = (l: Lens) => l.id === 'runway' ? 0 : program.seasonFocus.includes(l.id) ? 1 : 2
      return rank(a) - rank(b)
    })
  }, [program.dimensions, program.seasonFocus])
  const lens = lenses.find(l => l.id === lensId) ?? lenses[0]
  const readsFor = useDimReads(lens.kind === 'dim' ? lens.id : program.dimensions[0])

  const togglePin = (id: string) => {
    const cur = program.seasonFocus
    const next = cur.includes(id) ? cur.filter(x => x !== id) : cur.length >= 3 ? cur : [...cur, id]
    updateProgram({ seasonFocus: next })
  }

  // per-spot player stacks for the selected season
  const stacks = useMemo(() => {
    const byPos = new Map<string, { present: Person[]; ghosts: Person[]; placed: { p: Person; pl: SnapshotPlacement; arrived: boolean }[] }>()
    POSITIONS.forEach(pos => {
      const roster = people.filter(p => p.lifecycle === 'rosterPlayer' && p.positions[0] === pos)
      const present = roster.filter(p => span(p).from <= season && span(p).to >= season)
        .sort((a, b) => span(b).to - span(a).to)
      // just-departed seniors ghost only in the first season view (the hole they leave)
      const ghosts = season === 2026 ? roster.filter(p => span(p).to === 2025) : []
      const placed = placements
        .filter(pl => pl.slot.startsWith(`${pos}-`))
        .map(pl => ({ p: people.find(x => x.id === pl.personId)!, pl }))
        .filter(x => x.p && span(x.p).to >= season)
        .map(x => ({ ...x, arrived: span(x.p).from <= season }))
      byPos.set(pos, { present, ghosts, placed })
    })
    return byPos
  }, [people, placements, season])

  // descriptive composition facts (counts and sums only — no scores, no verdicts)
  const facts = useMemo(() => POSITIONS.map(pos => {
    const st = stacks.get(pos)!
    const runway = (list: Person[]) => list.reduce((a, p) => a + Math.max(0, span(p).to - season + 1), 0)
    const arrivedPlaced = st.placed.filter(x => x.arrived).map(x => x.p)
    return {
      pos,
      now: st.present.length,
      leavingAfter: st.present.filter(p => span(p).to === season).length,
      placed: st.placed.length,
      runwayBase: runway(st.present),
      runwayWith: runway(st.present) + runway(arrivedPlaced),
    }
  }), [stacks, season])

  const handleDrop = (pos: Position, personId: string) => {
    if (viewSnap) { toast('Viewing a saved snapshot', ['Close it to edit a new draft']); return }
    const person = people.find(p => p.id === personId)
    if (!person) return
    if (person.lifecycle === 'rosterPlayer') { toast('Roster players already live on the pitch'); return }
    if (!person.positions.includes(pos)) {
      toast(`${person.name} is a ${person.positions.join('/')}`, [`Drop her on her own position — the pitch reflects, it doesn’t reassign`])
      return
    }
    setIntentFor({ pos, person })
  }

  const commitPlacement = (intent: SnapshotPlacement['intent']) => {
    if (!intentFor) return
    const { pos, person } = intentFor
    const slot = `${pos}-${person.classYear}`
    setDraft(d => [...d.filter(x => x.personId !== person.id), { slot, personId: person.id, intent }])
    const arrives = span(person).from
    toast(`${person.name} placed at ${pos}`, [
      intent?.kind === 'replace' ? `Marked: replaces ${people.find(p => p.id === intent.targetId)?.name}` : 'Marked: adds depth',
      arrives > season ? `Arrives ${seasonLabel(arrives)} — scrub the seasons to see her land` : `Available now (${seasonLabel(season)})`,
    ])
    setIntentFor(null)
  }

  const lensAnnotation = (p: Person) => {
    if (lens.kind === 'runway') return null // runway shows inline as +N
    if (lens.kind === 'metric') return <MetricMiniBar p={p} k={lens.id as MetricKey} />
    const reads = readsFor(p)
    if (!reads.length) return <span className="text-[9px] italic text-amber-300/80" title="No attributed read on this dimension yet — an evaluation gap, not a zero">not yet assessed</span>
    return (
      <span className="inline-flex items-center gap-1.5">
        {reads.map((r, i) => (
          <span key={i} className="text-[9px] text-white/80" title={`${r.name} — ${r.source}`}>
            <b className="text-[11px] text-white">{r.score}</b>/5 <span className="text-white/50">{r.initials}</span>
          </span>
        ))}
        {reads.length > 1 && <span className="text-[8px] text-orange-300" title="Two attributed reads, shown side by side — never averaged">divergent</span>}
      </span>
    )
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3">
      {/* controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wide text-stone-400">Season</span>
          {SEASONS.map(s => (
            <button key={s} onClick={() => setSeason(s)}
              className={`rounded-full px-2.5 py-1 text-xs font-bold ${season === s ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'}`}>
              {seasonLabel(s)}
            </button>
          ))}
          <span className="ml-1 text-[10px] text-stone-400">scrub to watch the waterfall — who’s gone, who arrives</span>
        </div>
        <WhySeeing sources={[
          'Roster + placements from your own board — the same Person records as everywhere else',
          'Runway = seasons of eligibility left; dimension reads are attributed staff entries (spring review / live captures)',
          'The pitch shows the shape of the squad. It never says which shape is better — that call is yours.',
        ]} label="what this view is" />
      </div>

      {/* criteria lens row — the coach's seasonal criteria, pinnable */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-stone-400">Lens</span>
        {lenses.map(l => (
          <span key={l.id} className={`inline-flex items-center overflow-hidden rounded-full border text-xs ${lensId === l.id ? 'border-teal-700 bg-teal-700 text-white' : 'border-stone-200 bg-white text-stone-600'}`}>
            <button onClick={() => setLensId(l.id)} className="px-2.5 py-1 font-semibold">{l.label}</button>
            {l.id !== 'runway' && (
              <button onClick={() => togglePin(l.id)} title={program.seasonFocus.includes(l.id) ? 'Unpin from season focus' : 'Pin as a season-focus criterion (max 3)'}
                className={`pr-2 ${program.seasonFocus.includes(l.id) ? (lensId === l.id ? 'text-amber-300' : 'text-amber-500') : (lensId === l.id ? 'text-white/40' : 'text-stone-300')}`}>
                <Star size={11} fill={program.seasonFocus.includes(l.id) ? 'currentColor' : 'none'} />
              </button>
            )}
          </span>
        ))}
        <span className="text-[10px] text-stone-400">★ = this season’s focus criteria (coach-defined, max 3)</span>
      </div>

      {/* the pitch */}
      <div className="relative mx-auto mt-3 aspect-[4/5] w-full max-w-2xl overflow-hidden rounded-xl bg-stone-900">
        {/* pitch markings */}
        <svg viewBox="0 0 100 125" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          <g stroke="rgba(255,255,255,0.18)" strokeWidth="0.35" fill="none">
            <rect x="4" y="3" width="92" height="119" />
            <line x1="4" y1="62.5" x2="96" y2="62.5" />
            <circle cx="50" cy="62.5" r="9" />
            <rect x="26" y="3" width="48" height="16" />
            <rect x="38" y="3" width="24" height="6" />
            <rect x="26" y="106" width="48" height="16" />
            <rect x="38" y="116" width="24" height="6" />
            <path d="M 40 19 A 10 10 0 0 0 60 19" />
            <path d="M 40 106 A 10 10 0 0 1 60 106" />
          </g>
        </svg>

        {SPOTS.map((spot, si) => {
          const st = stacks.get(spot.pos)!
          const mirrored = SPOTS.filter(s2 => s2.pos === spot.pos).length > 1
          const sideIdx = spot.side === 'R' ? 1 : 0
          const pick = <T,>(arr: T[]) => (mirrored ? arr.filter((_, i) => i % 2 === sideIdx) : arr)
          const present = pick(st.present)
          const ghosts = pick(st.ghosts)
          const placed = pick(st.placed)
          return (
            <div key={si}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { const pid = e.dataTransfer.getData('personId'); if (pid) handleDrop(spot.pos, pid) }}
              className="absolute -translate-x-1/2 -translate-y-2 rounded-lg p-1 text-center hover:bg-white/5"
              style={{ left: `${spot.x}%`, top: `${spot.y}%`, minWidth: '19%' }}
            >
              <div className="mx-auto mb-1 inline-block rounded border border-red-400/90 px-1.5 py-px text-[10px] font-bold tracking-wide text-red-300">
                {spot.pos}{mirrored && <span className="ml-0.5 text-red-400/50">{spot.side}</span>}
              </div>
              {ghosts.map(p => (
                <div key={p.id} className="text-[11px] font-medium text-red-400/80 line-through decoration-red-400/60" title="Graduated spring ’26 — the hole they leave">
                  {p.name.split(' ').map((w, i, a) => i === a.length - 1 ? w : w[0] + '.').join(' ')}
                </div>
              ))}
              {present.map(p => {
                const left = span(p).to - season + 1
                const final = span(p).to === season
                return (
                  <div key={p.id} className="leading-tight">
                    <button onClick={() => setCardFor(p)}
                      className={`text-[12px] font-semibold hover:underline ${final ? 'text-amber-300' : 'text-white'}`}
                      title={final ? 'Final season — leaving after this year' : `${left} seasons of eligibility left`}>
                      {p.name.split(' ').map((w, i, a) => i === a.length - 1 ? w : w[0] + '.').join(' ')}
                      <span className={`ml-1 text-[10px] ${final ? 'text-amber-300/80' : 'text-white/50'}`}>+{left}</span>
                      {p.idp && <span className="ml-0.5 text-[9px] text-teal-300" title={`IDP: ${p.idp.focus}`}>↗</span>}
                    </button>
                    {lens.kind !== 'runway' && <div className="-mt-0.5">{lensAnnotation(p)}</div>}
                  </div>
                )
              })}
              {placed.map(({ p, pl, arrived }) => (
                <div key={p.id} className="leading-tight">
                  <span className={`inline-flex items-center gap-1 text-[12px] font-bold ${arrived ? 'text-teal-300' : 'text-teal-300/50 italic'}`}>
                    <button onClick={() => setCardFor(p)} className="hover:underline" title={pl.intent?.kind === 'replace' ? `Replaces ${people.find(x => x.id === pl.intent?.targetId)?.name}` : 'Adds depth'}>
                      {pl.intent?.kind === 'replace' ? '⇄' : '+'} {p.name.split(' ').map((w, i, a) => i === a.length - 1 ? w : w[0] + '.').join(' ')}
                      {arrived
                        ? <span className="ml-1 text-[10px] text-teal-300/70">+{span(p).to - season + 1}</span>
                        : <span className="ml-1 text-[10px]">arrives {seasonLabel(span(p).from)}</span>}
                    </button>
                    {!viewSnap && <button onClick={() => setDraft(d => d.filter(x => x.personId !== p.id))} title="Remove placement" className="text-white/40 hover:text-white"><X size={10} /></button>}
                  </span>
                  {lens.kind !== 'runway' && arrived && <div className="-mt-0.5">{lensAnnotation(p)}</div>}
                </div>
              ))}
              {!present.length && !placed.length && !ghosts.length && (
                <div className="rounded border border-dashed border-white/25 px-1 py-0.5 text-[9px] text-white/40">nobody — drop a candidate</div>
              )}
            </div>
          )
        })}
      </div>

      {/* legend */}
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px]">
        <span className="text-stone-600"><b className="text-stone-900">Name +N</b> = seasons of eligibility left</span>
        <span className="font-semibold text-red-500 line-through">graduated</span>
        <span className="font-semibold text-amber-500">final season</span>
        <span className="font-semibold text-teal-600">⇄ replaces · + adds depth (your call, saved with the scenario)</span>
        <span className="italic text-teal-600/70">arrives later</span>
        <span className="text-teal-600">↗ active IDP</span>
      </div>

      {/* composition facts — descriptive only */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-stone-400">
              <th className="px-2 py-1 text-left font-bold">Group</th>
              <th className="px-2 py-1 text-left font-bold">Bodies in {seasonLabel(season)}</th>
              <th className="px-2 py-1 text-left font-bold">Leaving after</th>
              <th className="px-2 py-1 text-left font-bold">Placed (what-if)</th>
              <th className="px-2 py-1 text-left font-bold">Eligibility runway (yrs)</th>
            </tr>
          </thead>
          <tbody>
            {facts.map(f => (
              <tr key={f.pos} className={`border-t border-stone-100 ${f.now === 0 && f.placed === 0 ? 'bg-red-50' : ''}`}>
                <td className="px-2 py-1 font-bold text-stone-700">{f.pos}</td>
                <td className="px-2 py-1 tabular-nums">{f.now}{f.now === 0 && <span className="ml-1 font-semibold text-red-600">gap</span>}</td>
                <td className="px-2 py-1 tabular-nums">{f.leavingAfter > 0 ? <span className="font-semibold text-amber-600">{f.leavingAfter}</span> : '—'}</td>
                <td className="px-2 py-1 tabular-nums">{f.placed > 0 ? <span className="font-semibold text-teal-700">{f.placed}</span> : '—'}</td>
                <td className="px-2 py-1 tabular-nums">{f.runwayWith !== f.runwayBase ? <span>{f.runwayBase} <span className="font-semibold text-teal-700">→ {f.runwayWith}</span></span> : f.runwayBase}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-1 text-[10px] italic text-stone-400">Counts and sums only — the table shows what changes, never whether it’s better. That judgment is the staff’s.</div>
      </div>

      {cardFor && <PlayerCardModal p={cardFor} onClose={() => setCardFor(null)} onAddToCanvas={onAddToCanvas} />}
      {intentFor && <IntentModal pos={intentFor.pos} person={intentFor.person} season={season} onPick={commitPlacement} onClose={() => setIntentFor(null)} />}
    </div>
  )
}
