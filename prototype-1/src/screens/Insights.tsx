import React, { useMemo } from 'react'
import { BarChart3, Eye, GraduationCap, Users2, Info } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'
import { useStore } from '../store'
import type { Person, Position } from '../types'
import { POSITIONS } from '../types'
import { Avatar, Card, RatingSparkline, SectionLabel, TierChip } from '../lib/ui'

// ── Insights: descriptive lenses only (Law 1 — mirror, never oracle) ──
// Every number here is a COUNT or a SHAPE of human-entered data. No composite scores,
// no rankings, no fit-indexes, no "you should…". The tool reflects the board's shape;
// the read is the coach's. This is the same stance the pitch planner takes (DECISIONS #17).

const POS_LABEL: Record<Position, string> = {
  GK: 'Goalkeeper', CB: 'Center back', FB: 'Full back', DM: 'Defensive mid', CM: 'Center mid', W: 'Winger', F: 'Forward',
}
const PIPELINE_COLOR: Record<string, string> = { HS: '#0284c7', Transfer: '#ea580c', JuCo: '#0d9488' }

// A single-line stacked bar of counts — descriptive composition, not a scale.
function StackBar({ segments, total }: { segments: { label: string; count: number; color: string }[]; total: number }) {
  return (
    <div className="flex h-6 w-full overflow-hidden rounded-md bg-stone-100">
      {segments.filter(s => s.count > 0).map((s, i) => (
        <div
          key={i}
          title={`${s.label}: ${s.count}`}
          className="flex items-center justify-center text-[10px] font-bold text-white"
          style={{ width: `${(s.count / total) * 100}%`, background: s.color }}
        >
          {s.count / total > 0.07 ? s.count : ''}
        </div>
      ))}
    </div>
  )
}

function Legend2({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-1 text-[10px] text-stone-500">
          <span className="h-2 w-2 rounded-sm" style={{ background: it.color }} /> {it.label}
        </span>
      ))}
    </div>
  )
}

function LawNote({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1.5 text-[11px] italic text-violet-700">
      <Info size={13} className="mt-px shrink-0" /> <span>{children}</span>
    </div>
  )
}

export default function Insights() {
  const people = useStore(s => s.people)
  const captures = useStore(s => s.captures)
  const contactLogs = useStore(s => s.contactLogs)
  const staff = useStore(s => s.staff)
  const program = useStore(s => s.program)
  const navigate = useStore(s => s.navigate)

  const recruits = useMemo(() => people.filter(p => p.lifecycle === 'recruit'), [people])
  const roster = useMemo(() => people.filter(p => p.lifecycle === 'rosterPlayer'), [people])

  // ── 1. Board at a glance — composition across tier / pipeline / class / position ──
  const byTier = program.tiers.map(t => ({ label: t.name, count: recruits.filter(r => r.tierId === t.id).length, color: t.color }))
  const pipelines = ['HS', 'Transfer', 'JuCo'] as const
  const byPipeline = pipelines.map(p => ({ label: p, count: recruits.filter(r => r.pipeline === p).length, color: PIPELINE_COLOR[p] }))
  const classYears = Array.from(new Set(recruits.map(r => r.classYear))).sort()
  const byClass = classYears.map((y, i) => ({ label: `’${String(y).slice(2)}`, count: recruits.filter(r => r.classYear === y).length, color: ['#78716c', '#57534e', '#44403c', '#292524'][i % 4] }))
  const byPosition = POSITIONS.map(pos => ({ pos, count: recruits.filter(r => r.positions[0] === pos).length }))
  const maxPos = Math.max(...byPosition.map(b => b.count), 1)

  // ── 2. Position coverage vs graduation (Law 4 — the roster is always in the room) ──
  const coverage = POSITIONS.map(pos => {
    const onPos = roster.filter(r => r.positions[0] === pos)
    const returning = onPos.filter(r => !r.graduating).length
    const graduating = onPos.filter(r => r.graduating).length
    const board = recruits.filter(r => r.positions[0] === pos)
    const prioritized = board.filter(r => r.tierId === 'blue' || r.tierId === 'green').length
    const wide = board.filter(r => r.tierId === 'yellow').length
    return { pos, returning, graduating, prioritized, wide, boardTotal: board.length }
  })

  // ── 3. Evaluation coverage / gaps (Law 1 — surfaces where you HAVEN'T looked) ──
  const withCoverage = useMemo(() => recruits.map(r => {
    const evaluators = Array.from(new Set(captures.filter(c => c.personId === r.id).map(c => c.authorId)))
    const videoGap = r.videos.some(v => v.requestedFrom)
    return { r, viewings: r.ratingsAcrossViewings.length, evaluators, videoGap }
  }).sort((a, b) => a.viewings - b.viewings), [recruits, captures])
  const seenPlenty = withCoverage.filter(x => x.viewings >= 3).length
  const seenThin = withCoverage.filter(x => x.viewings > 0 && x.viewings < 3).length
  const unseen = withCoverage.filter(x => x.viewings === 0).length
  const videoGaps = withCoverage.filter(x => x.videoGap).length

  // ── 4. Staff activity over time (Law 5 — shared by default, attributed) ──
  const activity = useMemo(() => {
    const acts = [
      ...captures.map(c => ({ authorId: c.authorId, at: c.at, kind: 'capture' as const })),
      ...contactLogs.map(c => ({ authorId: c.authorId, at: c.at, kind: 'contact' as const })),
    ]
    // week buckets, Monday-aligned, from the earliest activity
    const ms = acts.map(a => new Date(a.at).getTime())
    const start = new Date(Math.min(...ms))
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7)) // back to Monday
    start.setHours(0, 0, 0, 0)
    const weekOf = (iso: string) => Math.floor((new Date(iso).getTime() - start.getTime()) / (7 * 864e5))
    const nWeeks = Math.max(...acts.map(a => weekOf(a.at))) + 1
    const weekLabel = (w: number) => {
      const d = new Date(start.getTime() + w * 7 * 864e5)
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
    const weekly = Array.from({ length: nWeeks }, (_, w) => ({
      week: `wk of ${weekLabel(w)}`,
      Captures: acts.filter(a => a.kind === 'capture' && weekOf(a.at) === w).length,
      Contacts: acts.filter(a => a.kind === 'contact' && weekOf(a.at) === w).length,
    }))
    const perStaff = staff.map(m => ({
      m,
      captures: acts.filter(a => a.kind === 'capture' && a.authorId === m.id).length,
      contacts: acts.filter(a => a.kind === 'contact' && a.authorId === m.id).length,
    })).filter(x => x.captures + x.contacts > 0)
    const maxStaff = Math.max(...perStaff.map(x => x.captures + x.contacts), 1)
    return { weekly, perStaff, maxStaff }
  }, [captures, contactLogs, staff])

  return (
    <div className="mx-auto max-w-5xl space-y-5 p-5">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-stone-900"><BarChart3 size={20} /> Insights — the board's shape</h1>
        <p className="mt-1 text-sm text-stone-500">
          Descriptive counts and coverage over human-entered data. No rankings, scores, or fit-indexes — the tool reflects; the read is yours <span className="font-semibold text-violet-700">(Law 1)</span>.
        </p>
      </div>

      {/* ── 1. Board at a glance ── */}
      <Card className="p-4">
        <SectionLabel><span className="flex items-center gap-1.5"><BarChart3 size={13} /> Board at a glance · {recruits.length} recruits</span></SectionLabel>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          <div>
            <div className="mb-1 text-xs font-semibold text-stone-600">By tier</div>
            <StackBar segments={byTier} total={recruits.length} />
            <Legend2 items={byTier} />
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold text-stone-600">By pipeline</div>
            <StackBar segments={byPipeline} total={recruits.length} />
            <Legend2 items={byPipeline} />
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold text-stone-600">By class year</div>
            <StackBar segments={byClass} total={recruits.length} />
            <Legend2 items={byClass} />
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold text-stone-600">By position</div>
            <div className="space-y-1">
              {byPosition.map(b => (
                <div key={b.pos} className="flex items-center gap-2 text-xs">
                  <span className="w-7 shrink-0 font-bold text-stone-500">{b.pos}</span>
                  <div className="h-3 flex-1 rounded bg-stone-100">
                    <div className="h-3 rounded bg-stone-600" style={{ width: `${(b.count / maxPos) * 100}%` }} />
                  </div>
                  <span className="w-4 shrink-0 tabular-nums text-stone-600">{b.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <LawNote>Counts only — the board's composition, not a verdict on it. Which cut matters is a coaching question the chart doesn't answer.</LawNote>
      </Card>

      {/* ── 2. Position coverage vs graduation ── */}
      <Card className="p-4">
        <SectionLabel><span className="flex items-center gap-1.5"><GraduationCap size={13} /> Position coverage — roster departures & board depth, side by side</span></SectionLabel>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-[10px] uppercase tracking-wide text-stone-400">
                <th className="py-1.5 pr-2 font-semibold">Position</th>
                <th className="px-2 font-semibold">Roster next season</th>
                <th className="px-2 font-semibold">Graduating</th>
                <th className="px-2 font-semibold">On the board</th>
              </tr>
            </thead>
            <tbody>
              {coverage.map(c => (
                <tr key={c.pos} className="border-b border-stone-100">
                  <td className="py-2 pr-2">
                    <span className="font-bold text-stone-700">{c.pos}</span>
                    <span className="ml-1.5 text-[10px] text-stone-400">{POS_LABEL[c.pos]}</span>
                  </td>
                  <td className="px-2">
                    <span className="inline-flex items-center gap-1">
                      {Array.from({ length: c.returning }).map((_, i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-emerald-500" />)}
                      {c.returning === 0 && <span className="text-stone-300">—</span>}
                      <span className="ml-1 tabular-nums text-stone-500">{c.returning}</span>
                    </span>
                  </td>
                  <td className="px-2">
                    <span className="inline-flex items-center gap-1">
                      {Array.from({ length: c.graduating }).map((_, i) => <span key={i} className="h-2.5 w-2.5 rounded-full border-2 border-red-400 bg-transparent" />)}
                      {c.graduating === 0 ? <span className="text-stone-300">—</span> : <span className="ml-1 font-semibold tabular-nums text-red-600">−{c.graduating}</span>}
                    </span>
                  </td>
                  <td className="px-2">
                    {c.boardTotal === 0
                      ? <span className="text-stone-300">nobody on the board</span>
                      : <span className="inline-flex items-center gap-1.5">
                          {c.prioritized > 0 && <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800">{c.prioritized} prioritized</span>}
                          {c.wide > 0 && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">{c.wide} wide net</span>}
                        </span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <LawNote>Departures and board depth, laid next to each other — never a computed “need score.” A hollow ring leaving with nobody prioritized behind it is a gap you can see; whether to fill it is yours to decide.</LawNote>
      </Card>

      {/* ── 3. Evaluation coverage / gaps ── */}
      <Card className="p-4">
        <SectionLabel><span className="flex items-center gap-1.5"><Eye size={13} /> Evaluation coverage — where the staff has & hasn't looked</span></SectionLabel>
        <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { n: seenPlenty, label: 'seen live 3+ times', tone: 'text-emerald-700 bg-emerald-50' },
            { n: seenThin, label: 'seen only 1–2 times', tone: 'text-amber-700 bg-amber-50' },
            { n: unseen, label: 'not yet seen live', tone: 'text-stone-600 bg-stone-100' },
            { n: videoGaps, label: 'video still requested', tone: 'text-orange-700 bg-orange-50' },
          ].map((s, i) => (
            <div key={i} className={`rounded-lg px-3 py-2 ${s.tone}`}>
              <div className="text-2xl font-bold tabular-nums">{s.n}</div>
              <div className="text-[11px] font-medium">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="text-[11px] font-semibold text-stone-500">Thinnest coverage first — the evaluation gaps</div>
        <div className="mt-1.5 space-y-1">
          {withCoverage.slice(0, 8).map(({ r, viewings, evaluators, videoGap }) => (
            <div key={r.id} className="flex items-center justify-between gap-2 rounded-lg border border-stone-200 bg-white px-3 py-1.5 hover:border-stone-300" onClick={() => navigate('profile', r.id)} role="button">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-xs font-bold text-stone-800">{r.name}</span>
                <TierChip tierId={r.tierId} small />
                <span className="text-[10px] text-stone-400">{r.positions[0]} · ’{String(r.classYear).slice(2)}</span>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                {videoGap && <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold text-orange-700">video requested</span>}
                <span className="flex items-center gap-1">
                  {evaluators.length > 0
                    ? evaluators.map(id => <Avatar key={id} staffId={id} size={16} />)
                    : <span className="text-[10px] italic text-stone-400">not yet assessed</span>}
                </span>
                <span className={`w-16 text-right text-[11px] font-semibold tabular-nums ${viewings >= 3 ? 'text-emerald-700' : viewings > 0 ? 'text-amber-700' : 'text-stone-400'}`}>
                  {viewings} viewing{viewings === 1 ? '' : 's'}
                </span>
                <RatingSparkline p={r} width={64} height={22} />
              </div>
            </div>
          ))}
        </div>
        <LawNote>Coverage, not quality. This sorts by how often the staff has watched — surfacing who you haven't seen enough, never who's “best.” The sparkline is the rating trend across viewings, attributed and un-averaged.</LawNote>
      </Card>

      {/* ── 4. Staff activity over time ── */}
      <Card className="p-4">
        <SectionLabel><span className="flex items-center gap-1.5"><Users2 size={13} /> Staff activity — captures & contacts, attributed</span></SectionLabel>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <div className="mb-1 text-xs font-semibold text-stone-600">Over time</div>
            <div style={{ width: '100%', height: 160 }}>
              <ResponsiveContainer>
                <BarChart data={activity.weekly} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f4" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#78716c' }} tickLine={false} axisLine={{ stroke: '#e7e5e4' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#a8a29e' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e7e5e4' }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="Captures" stackId="a" fill="#0f766e" isAnimationActive={false} radius={[0, 0, 0, 0]} />
                  <Bar dataKey="Contacts" stackId="a" fill="#c2410c" isAnimationActive={false} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs font-semibold text-stone-600">By staff member</div>
            <div className="space-y-2">
              {activity.perStaff.map(({ m, captures: cap, contacts }) => (
                <div key={m.id} className="text-xs">
                  <div className="mb-0.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Avatar staffId={m.id} size={18} /><span className="font-medium text-stone-700">{m.name}</span></span>
                    <span className="text-[10px] text-stone-400">{m.role.replace(' (capture-only)', '')}</span>
                  </div>
                  <div className="flex h-4 w-full overflow-hidden rounded bg-stone-100">
                    <div title={`${cap} captures`} className="bg-teal-700" style={{ width: `${(cap / activity.maxStaff) * 100}%` }} />
                    <div title={`${contacts} contacts`} className="bg-orange-700" style={{ width: `${(contacts / activity.maxStaff) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <Legend2 items={[{ label: 'Captures', color: '#0f766e' }, { label: 'Contacts (calls/texts/email)', color: '#c2410c' }]} />
          </div>
        </div>
        <LawNote>Whose effort landed where, and when — the “shared by default” ledger (Law 5). Ordered by role, not by volume: this is coverage across the staff, not a leaderboard.</LawNote>
      </Card>
    </div>
  )
}
