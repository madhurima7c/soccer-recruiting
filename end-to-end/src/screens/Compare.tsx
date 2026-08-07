import React, { useMemo, useState } from 'react'
import { Eye, EyeOff, GitCompareArrows, Play, Plus, Save, Trash2, X } from 'lucide-react'
import { useStore } from '../store'
import type { Person, Position, SnapshotPlacement, WhatIfSnapshot } from '../types'
import { POSITIONS } from '../types'
import {
  AuthorLine, Avatar, BenchmarkBars, Btn, Card, ComplianceBadge, FitGateStrip,
  PipelineBadge, RatingSparkline, SectionLabel, TierChip, WhySeeing,
} from '../lib/ui'
import PitchView from './PitchView'

const YEARS = [2026, 2027, 2028, 2029]

// deterministic per-staff "independent rating" for the reveal (seeded demo data)
function seededRating(personId: string, staffId: string) {
  let h = 0
  const s = personId + staffId
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return 2 + (h % 30) / 10 // 2.0 – 4.9
}

function CompareColumn({ p, onRemove, revealed }: { p: Person; onRemove: () => void; revealed: boolean }) {
  const captures = useStore(s => s.captures.filter(c => c.personId === p.id))
  const staff = useStore(s => s.staff.filter(m => m.access !== 'read-only'))
  const chipCounts = useMemo(() => {
    const m = new Map<string, number>()
    captures.forEach(c => c.chips?.forEach(ch => m.set(ch, (m.get(ch) ?? 0) + 1)))
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [captures])
  const quotes = captures.filter(c => c.text || c.draftText).slice(0, 2)

  return (
    <div
      draggable
      onDragStart={e => e.dataTransfer.setData('personId', p.id)}
      className="flex w-64 shrink-0 cursor-grab flex-col gap-3 rounded-xl border border-stone-200 bg-white p-3 active:cursor-grabbing"
    >
      <div>
        <div className="flex items-start justify-between">
          <div className="text-sm font-bold text-stone-900">{p.name}</div>
          <button onClick={onRemove}><X size={14} className="text-stone-400 hover:text-stone-700" /></button>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          {p.lifecycle === 'recruit' ? <TierChip tierId={p.tierId} small /> : <span className="rounded-full bg-stone-800 px-2 py-0.5 text-[10px] font-bold text-white">ROSTER #{p.jersey}</span>}
          <PipelineBadge p={p} />
          <span className="text-[11px] text-stone-500">{p.positions.join('/')} · ’{String(p.classYear).slice(2)}</span>
        </div>
      </div>

      <BenchmarkBars p={p} compact />

      <div>
        <SectionLabel>Tags (staff vocabulary)</SectionLabel>
        {chipCounts.length ? (
          <div className="flex flex-wrap gap-1">
            {chipCounts.map(([ch, n]) => (
              <span key={ch} className="rounded-full bg-teal-50 px-2 py-0.5 font-semibold text-teal-800" style={{ fontSize: 10 + Math.min(n, 3) * 2 }}>{ch}{n > 1 && <span className="ml-0.5 text-teal-500">×{n}</span>}</span>
            ))}
          </div>
        ) : <div className="text-[11px] text-stone-400">{p.lifecycle === 'rosterPlayer' ? `IDP: ${p.idp?.focus ?? 'no active IDP'}` : 'No tags yet'}</div>}
      </div>

      <div>
        <SectionLabel>Attributed quotes</SectionLabel>
        {quotes.length ? quotes.map(q => (
          <div key={q.id} className="mb-1.5 rounded-lg bg-stone-50 p-2">
            <p className="text-xs italic text-stone-700">“{(q.text ?? q.draftText)!.slice(0, 110)}{(q.text ?? q.draftText)!.length > 110 ? '…' : ''}”</p>
            <div className="mt-1"><AuthorLine staffId={q.authorId} at={q.at} /></div>
          </div>
        )) : <div className="text-[11px] text-stone-400">{p.lifecycle === 'rosterPlayer' ? '2 seasons of training data on file' : 'No quotes yet — capture at the next viewing'}</div>}
      </div>

      <FitGateStrip p={p} compact />

      <div className="flex aspect-video items-center justify-center rounded-lg bg-stone-800 text-stone-400">
        <Play size={22} /><span className="ml-1 text-[10px]">{p.videos[0]?.requestedFrom ? 'video requested…' : p.videos[0]?.platform ?? 'no video'}</span>
      </div>

      <div>
        <SectionLabel>Staff ratings {revealed ? '(revealed)' : '(independent)'}</SectionLabel>
        {revealed ? (
          <div className="relative mt-3 mb-1 h-1 rounded bg-stone-200">
            {[1, 3, 5].map(n => <span key={n} className="absolute -top-4 text-[9px] text-stone-400" style={{ left: `${((n - 1) / 4) * 100}%` }}>{n}</span>)}
            {staff.filter(m => m.access === 'full').map(m => {
              const v = seededRating(p.id, m.id)
              return <span key={m.id} title={`${m.name}: ${v.toFixed(1)}/5`} className="absolute -top-[6px] flex h-3.5 w-3.5 -translate-x-1/2 items-center justify-center rounded-full text-[7px] font-bold text-white" style={{ left: `${((v - 1) / 4) * 100}%`, background: m.color }}>{m.initials[0]}</span>
            })}
          </div>
        ) : <div className="flex items-center gap-1 text-[11px] text-stone-400"><EyeOff size={12} /> Hidden until everyone rates — no anchoring</div>}
      </div>
    </div>
  )
}

function DepthChart({ placements, onDrop, diffSlots }: {
  placements: SnapshotPlacement[]
  onDrop: (slot: string, personId: string) => void
  diffSlots?: Set<string>
}) {
  const people = useStore(s => s.people)
  const roster = people.filter(p => p.lifecycle === 'rosterPlayer')
  return (
    <div className="overflow-auto rounded-xl border border-stone-200 bg-white">
      <table className="w-full min-w-[560px] text-xs">
        <thead>
          <tr className="bg-stone-50 text-[10px] uppercase tracking-wide text-stone-500">
            <th className="px-2 py-2 text-left font-bold">Pos</th>
            {YEARS.map(y => <th key={y} className="px-2 py-2 text-left font-bold">Class of {y}{y === 2026 && <span className="ml-1 rounded bg-red-100 px-1 text-red-700">graduating</span>}</th>)}
          </tr>
        </thead>
        <tbody>
          {POSITIONS.map(pos => (
            <tr key={pos} className="border-t border-stone-100">
              <td className="px-2 py-1.5 font-bold text-stone-700">{pos}</td>
              {YEARS.map(y => {
                const slot = `${pos}-${y}`
                const players = roster.filter(p => p.positions[0] === pos && p.classYear === y)
                const placed = placements.filter(pl => pl.slot === slot).map(pl => people.find(x => x.id === pl.personId)!)
                const gap = !players.length && !placed.length
                return (
                  <td
                    key={y}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { const pid = e.dataTransfer.getData('personId'); if (pid) onDrop(slot, pid) }}
                    className={`px-2 py-1.5 align-top ${y === 2026 ? 'bg-red-50/60' : ''} ${gap ? 'bg-stone-50' : ''}`}
                  >
                    {players.map(p => (
                      <div key={p.id} className={`mb-0.5 rounded px-1.5 py-0.5 ${p.graduating ? 'bg-red-100 text-red-800 line-through decoration-red-400' : 'bg-stone-100 text-stone-700'}`} title={p.graduating ? 'Graduating — the waterfall' : `${p.eligibilityRemaining} yrs eligibility left`}>
                        {p.name.split(' ').map((w, i, a) => i === a.length - 1 ? w : w[0] + '.').join(' ')}
                      </div>
                    ))}
                    {placed.map(p => (
                      <div key={p.id} className={`mb-0.5 rounded border-2 px-1.5 py-0.5 font-semibold ${diffSlots?.has(slot) ? 'border-amber-400 bg-amber-50 text-amber-900' : 'border-teal-500 bg-teal-50 text-teal-900'}`} title="What-if placement">
                        + {p.name.split(' ').map((w, i, a) => i === a.length - 1 ? w : w[0] + '.').join(' ')}
                      </div>
                    ))}
                    {gap && <div className="rounded border border-dashed border-stone-300 px-1.5 py-0.5 text-center text-[10px] text-stone-400">drop here</div>}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SnapshotCard({ s, other, onView, viewing }: { s: WhatIfSnapshot; other?: WhatIfSnapshot; onView: () => void; viewing: boolean }) {
  const people = useStore(s2 => s2.people)
  const updateSnapshot = useStore(s2 => s2.updateSnapshot)
  const deleteSnapshot = useStore(s2 => s2.deleteSnapshot)
  const changed = other ? s.placements.filter(p => !other.placements.some(o => o.slot === p.slot && o.personId === p.personId)) : []
  return (
    <Card className={`p-3 ${viewing ? 'ring-2 ring-teal-500' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-bold text-stone-800">{s.name}</div>
        <div className="flex gap-1">
          <button onClick={onView} title="Show on depth chart" className="rounded p-1 text-stone-400 hover:bg-stone-100"><Eye size={14} /></button>
          <button onClick={() => deleteSnapshot(s.id)} className="rounded p-1 text-stone-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
        </div>
      </div>
      <div className="mt-1 space-y-0.5">
        {s.placements.map((pl, i) => {
          const p = people.find(x => x.id === pl.personId)
          const target = pl.intent?.kind === 'replace' ? people.find(x => x.id === pl.intent?.targetId) : undefined
          const isDiff = other && changed.includes(pl)
          return (
            <div key={i} className={`rounded px-1.5 py-0.5 text-xs ${isDiff ? 'bg-amber-100 font-semibold text-amber-900' : 'text-stone-600'}`}>
              {pl.slot}: {p?.name}{isDiff && ' ◆'}
              {pl.intent && <span className="ml-1 text-[10px] text-stone-400">{pl.intent.kind === 'replace' ? `⇄ replaces ${target?.name ?? '?'}` : '+ adds depth'}</span>}
            </div>
          )
        })}
        {!s.placements.length && <div className="text-xs text-stone-400">no placements</div>}
      </div>
      {/* coach-entered resource math — plainly displayed, never optimized by the machine */}
      <div className="mt-2 grid grid-cols-3 gap-1.5 border-t border-stone-100 pt-2">
        {([['spotsUsed', 'spots used', '/ 28'], ['scholarshipEquiv', 'schol.-equiv', '/ 14'], ['eligibilityYears', 'elig. yrs added', '']] as const).map(([k, label, denom]) => (
          <label key={k} className="text-center">
            <input
              type="number" step="0.1" value={s[k]}
              onChange={e => updateSnapshot(s.id, { [k]: parseFloat(e.target.value) || 0 })}
              className="w-full rounded border border-stone-200 px-1 py-0.5 text-center text-sm font-bold tabular-nums text-stone-800"
            />
            <span className="text-[9px] font-bold uppercase text-stone-400">{label} {denom}</span>
          </label>
        ))}
      </div>
      <div className="mt-1 text-[10px] italic text-stone-400">Coach-entered numbers — displayed, never computed as advice.</div>
    </Card>
  )
}

function CriteriaMirror() {
  const mirror = useStore(s => s.mirror.filter(m => !m.dismissed))
  const dismissMirror = useStore(s => s.dismissMirror)
  const people = useStore(s => s.people)
  const navigate = useStore(s => s.navigate)
  const [openId, setOpenId] = useState<string | null>(null)
  return (
    <Card className="border-violet-200 p-3">
      <div className="flex items-center justify-between">
        <SectionLabel>Criteria mirror — your revealed patterns</SectionLabel>
        <WhySeeing sources={['Computed only from your own tiering, tags, captures, and journal entries', 'Descriptions, never recommendations — it describes your model back to you', 'The mirror speaks when consulted, in the office. It pushes nothing.']} label="how this works" />
      </div>
      <div className="space-y-2">
        {mirror.map(m => (
          <div key={m.id} className="rounded-lg border border-violet-100 bg-violet-50/50 p-2.5">
            <p className="text-xs text-stone-800">{m.text}</p>
            <div className="mt-1.5 flex items-center gap-3">
              <button onClick={() => setOpenId(openId === m.id ? null : m.id)} className="text-[11px] font-semibold text-violet-700 underline decoration-dotted underline-offset-2">{m.provenance.label}</button>
              <button onClick={() => dismissMirror(m.id)} className="text-[11px] text-stone-400 hover:text-stone-600">Not a real pattern</button>
            </div>
            {openId === m.id && (
              <div className="mt-2 space-y-1 rounded-lg bg-white p-2">
                {m.provenance.personIds.map(pid => {
                  const p = people.find(x => x.id === pid)
                  return p ? (
                    <button key={pid} onClick={() => navigate('profile', pid)} className="flex w-full items-center gap-2 rounded px-1 py-0.5 text-left text-xs text-stone-700 hover:bg-stone-50">
                      <span className="font-semibold hover:underline">{p.name}</span>
                      <TierChip tierId={p.tierId} small />
                      <span className="text-stone-400">{p.positions.join('/')}</span>
                    </button>
                  ) : null
                })}
              </div>
            )}
          </div>
        ))}
        {!mirror.length && <div className="text-xs text-stone-400">All observations dismissed. The mirror stays quiet until new patterns accumulate.</div>}
      </div>
    </Card>
  )
}

export default function Compare() {
  const people = useStore(s => s.people)
  const snapshots = useStore(s => s.snapshots)
  const saveSnapshot = useStore(s => s.saveSnapshot)
  const toast = useStore(s => s.toast)
  const [selected, setSelected] = useState<string[]>(['r-torres', 'r-reyes', 'p-harper-osei'])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [revealed, setRevealed] = useState(false)
  const [draft, setDraft] = useState<SnapshotPlacement[]>([])
  const [draftName, setDraftName] = useState('Scenario A')
  const [viewSnapId, setViewSnapId] = useState<string | null>(null)
  const [railPos, setRailPos] = useState<Position>('CM')
  const [depthView, setDepthView] = useState<'pitch' | 'grid'>('pitch')

  const chosen = selected.map(id => people.find(p => p.id === id)!).filter(Boolean)
  const viewSnap = snapshots.find(s => s.id === viewSnapId)
  const shownPlacements = viewSnap ? viewSnap.placements : draft

  const railRecruits = people.filter(p => p.lifecycle === 'recruit' && p.positions.includes(railPos) && p.tierId !== 'red')
    .sort((a, b) => (a.tierId ?? '').localeCompare(b.tierId ?? ''))
  const railDevelop = people.filter(p => p.lifecycle === 'rosterPlayer' && !p.graduating && (p.positions.includes(railPos) || !!p.idp))
    .filter(p => p.idp).slice(0, 4)

  const gradsByPos = POSITIONS.map(pos => ({ pos, n: people.filter(p => p.lifecycle === 'rosterPlayer' && p.graduating && p.positions[0] === pos).length })).filter(x => x.n > 0)

  const otherSnap = (s: WhatIfSnapshot) => snapshots.find(x => x.id !== s.id)

  return (
    <div className="flex h-full">
      <div className="min-w-0 flex-1 overflow-auto p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-stone-900">Comparison canvas</h1>
            <div className="text-xs text-stone-500">Recruits and roster players in identical columns — “is she actually an upgrade?” is a fair question here.</div>
          </div>
          <div className="flex items-center gap-2">
            <Btn onClick={() => setRevealed(r => !r)}>
              <span className="flex items-center gap-1.5">{revealed ? <EyeOff size={14} /> : <Eye size={14} />} {revealed ? 'Hide' : 'Reveal'} staff ratings</span>
            </Btn>
            <Btn variant="primary" onClick={() => setPickerOpen(true)} disabled={chosen.length >= 4}>
              <span className="flex items-center gap-1"><Plus size={14} /> Add person</span>
            </Btn>
          </div>
        </div>

        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {chosen.map(p => (
            <CompareColumn key={p.id} p={p} revealed={revealed} onRemove={() => setSelected(s => s.filter(x => x !== p.id))} />
          ))}
          {!chosen.length && <div className="rounded-xl border border-dashed border-stone-300 p-10 text-sm text-stone-400">Add 2–4 people to compare.</div>}
        </div>

        {/* depth chart — the roster is always in the room (Law 4) */}
        <div className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <SectionLabel>Squad depth · graduation waterfall</SectionLabel>
                <div className="-mt-2 flex rounded-lg border border-stone-200 p-0.5">
                  <button onClick={() => setDepthView('pitch')} className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${depthView === 'pitch' ? 'bg-stone-800 text-white' : 'text-stone-500'}`}>Pitch planner</button>
                  <button onClick={() => setDepthView('grid')} className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${depthView === 'grid' ? 'bg-stone-800 text-white' : 'text-stone-500'}`}>Grid</button>
                </div>
              </div>
              <div className="-mt-1 text-[11px] text-stone-500">
                {gradsByPos.map(g => `${g.n} ${g.pos}${g.n > 1 ? 's' : ''}`).join(', ')} graduating — drag any card (columns above or rail →) onto a position to build a what-if.
              </div>
            </div>
            <div className="flex items-center gap-2">
              {viewSnap && <span className="rounded-full bg-teal-100 px-2 py-1 text-xs font-semibold text-teal-800">viewing “{viewSnap.name}” <button className="ml-1" onClick={() => setViewSnapId(null)}>×</button></span>}
              {!viewSnap && draft.length > 0 && (
                <>
                  <input value={draftName} onChange={e => setDraftName(e.target.value)} className="w-32 rounded-lg border border-stone-300 px-2 py-1 text-sm" />
                  <Btn variant="primary" onClick={() => {
                    const elig = draft.reduce((acc, pl) => {
                      const p = people.find(x => x.id === pl.personId)
                      const m = p?.school?.match(/\((\d) yrs? elig/)
                      return acc + (m ? parseInt(m[1]) : 4)
                    }, 0)
                    saveSnapshot({ name: draftName, placements: draft, spotsUsed: 22 + draft.length, scholarshipEquiv: 9.9, eligibilityYears: elig })
                    setDraft([]); setDraftName(snapshots.length === 0 ? 'Scenario B' : `Scenario ${String.fromCharCode(67 + snapshots.length - 1)}`)
                  }}>
                    <span className="flex items-center gap-1"><Save size={14} /> Save what-if snapshot</span>
                  </Btn>
                  <Btn onClick={() => setDraft([])}>Clear</Btn>
                </>
              )}
            </div>
          </div>
          {depthView === 'pitch' ? (
            <PitchView
              draft={draft}
              setDraft={setDraft}
              viewSnap={viewSnap ?? null}
              onAddToCanvas={id => setSelected(s => s.includes(id) || s.length >= 4 ? s : [...s, id])}
            />
          ) : (
            <DepthChart
              placements={shownPlacements}
              onDrop={(slot, pid) => {
                if (viewSnap) { toast('Viewing a saved snapshot', ['Close it (×) to edit a new draft']); return }
                const person = people.find(p => p.id === pid)
                if (!person || person.lifecycle === 'rosterPlayer') { toast('Roster players already live on the chart'); return }
                setDraft(d => [...d.filter(x => x.personId !== pid), { slot, personId: pid }])
              }}
              diffSlots={viewSnap && otherSnap(viewSnap) ? new Set(viewSnap.placements.filter(p => !otherSnap(viewSnap)!.placements.some(o => o.slot === p.slot && o.personId === p.personId)).map(p => p.slot)) : undefined}
            />
          )}
        </div>

        {/* snapshots side by side */}
        {snapshots.length > 0 && (
          <div className="mt-5">
            <SectionLabel><span className="flex items-center gap-1.5"><GitCompareArrows size={13} /> What-if snapshots — scenario memory replaces short-term memory</span></SectionLabel>
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-3">
              {snapshots.map(s => (
                <SnapshotCard key={s.id} s={s} other={otherSnap(s)} viewing={viewSnapId === s.id} onView={() => setViewSnapId(viewSnapId === s.id ? null : s.id)} />
              ))}
            </div>
            <div className="mt-1 text-[10px] text-stone-400">◆ amber = cells that differ from the other scenario (the what-if diff)</div>
          </div>
        )}
      </div>

      {/* right rail: candidates + develop-vs-recruit + criteria mirror */}
      <div className="w-80 shrink-0 space-y-4 overflow-auto border-l border-stone-200 bg-stone-50 p-4">
        <div>
          <SectionLabel>Candidate rail</SectionLabel>
          <div className="mb-2 flex flex-wrap gap-1">
            {POSITIONS.map(pos => (
              <button key={pos} onClick={() => setRailPos(pos)} className={`rounded px-2 py-0.5 text-xs font-bold ${railPos === pos ? 'bg-stone-800 text-white' : 'bg-white text-stone-500 border border-stone-200'}`}>{pos}</button>
            ))}
          </div>
          <div className="space-y-1.5">
            {railRecruits.map(p => (
              <div key={p.id} draggable onDragStart={e => e.dataTransfer.setData('personId', p.id)}
                className="flex cursor-grab items-center justify-between rounded-lg border border-stone-200 bg-white px-2 py-1.5 active:cursor-grabbing">
                <div>
                  <div className="text-xs font-semibold text-stone-800">{p.name}</div>
                  <div className="text-[10px] text-stone-500">{p.pipeline} ’{String(p.classYear).slice(2)} · {p.club?.split(' (')[0]}</div>
                </div>
                <div className="flex items-center gap-1">
                  <TierChip tierId={p.tierId} small />
                  <button onClick={() => setSelected(s => s.includes(p.id) || s.length >= 4 ? s : [...s, p.id])} title="Add to canvas" className="rounded bg-stone-100 px-1.5 text-xs text-stone-600 hover:bg-stone-200">+</button>
                </div>
              </div>
            ))}
            {!railRecruits.length && <div className="text-xs text-stone-400">No active recruits at {railPos}.</div>}
          </div>
        </div>

        <div>
          <SectionLabel>Develop, don’t recruit? (IDP arcs)</SectionLabel>
          <div className="space-y-1.5">
            {railDevelop.map(p => (
              <div key={p.id} className="rounded-lg border border-stone-200 bg-white px-2 py-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-stone-800">{p.name} <span className="font-normal text-stone-400">#{p.jersey} · {p.positions[0]} ’{String(p.classYear).slice(2)}</span></div>
                    <div className="text-[10px] text-stone-500">IDP: {p.idp!.focus}</div>
                  </div>
                  <div className="h-8 w-20">
                    <svg viewBox="0 0 80 32" className="h-full w-full">
                      <polyline fill="none" stroke="#0f766e" strokeWidth="2" points={p.idp!.trajectory.map((v, i) => `${4 + i * 18},${28 - (v / 5) * 24}`).join(' ')} />
                    </svg>
                  </div>
                </div>
                <button onClick={() => setSelected(s => s.includes(p.id) || s.length >= 4 ? s : [...s, p.id])} className="mt-1 text-[10px] font-semibold text-teal-700">compare her against the recruits →</button>
              </div>
            ))}
          </div>
          <div className="mt-1 text-[10px] italic text-stone-400">For some staffs, not recruiting is the recruiting decision.</div>
        </div>

        <CriteriaMirror />
      </div>

      {/* person picker */}
      {pickerOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/30 p-6" onClick={() => setPickerOpen(false)}>
          <div className="max-h-[70vh] w-96 overflow-auto rounded-2xl bg-white p-4 shadow-2xl" onClick={e => e.stopPropagation()}>
            <input autoFocus placeholder="Search recruits and roster…" value={search} onChange={e => setSearch(e.target.value)} className="mb-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            {people.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) && !selected.includes(p.id)).slice(0, 12).map(p => (
              <button key={p.id} onClick={() => { setSelected(s => [...s, p.id]); setPickerOpen(false); setSearch('') }} className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-stone-50">
                <span className="text-sm text-stone-800">{p.name}</span>
                <span className="text-[10px] text-stone-400">{p.lifecycle === 'rosterPlayer' ? `roster · ${p.positions[0]}` : `${p.pipeline} · ${p.positions[0]} ’${String(p.classYear).slice(2)}`}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
