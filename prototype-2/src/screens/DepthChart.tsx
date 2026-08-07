// Recruiting Board v3 — matches the Figma direction:
//   stat tiles → tabs (Depth & needs / Roster) → pitch center with the radar
//   beside it and depth bars below → right rail: VIEW (scenario) + RECRUITS.
// Filled groups are black dots; thinning groups get an orange dashed ring;
// placed recruits land as green chips. Recruits drag onto the pitch (or use
// the Place button — same result).
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  POSITION_LABELS, PITCH_SPOTS, PROGRAM, ROSTER, RECRUITS, TIERS,
  quantOf, radarOf, radarAxesFor, recruitById, statusOf, tierById,
  type Position, type Recruit,
} from '@/data/seed'
import { saveScenario } from '@/store'
import { InfoTip, StatTile, RadarChart, RadarLegend, DepthBars, gapPositions } from '@/components/charts'
import { LawNote, RatingSparkline, RunwayBar, RunwayLegend, StaffAvatar } from '@/components/viz'
import { RecruitSheet } from '@/components/RecruitSheet'
import {
  GraduationCap, Search, X, Plus, Check, GitCompareArrows, BookmarkPlus, Undo2, UserRound,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ORANGE = '#EA580C'
const GREEN = '#16A34A'

const STATUS_STYLE: Record<'green' | 'amber' | 'blue' | 'gray', string> = {
  green: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  blue: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  gray: 'bg-muted text-muted-foreground',
}
export function StatusBadge({ r }: { r: Recruit }) {
  const s = statusOf(r)
  return <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', STATUS_STYLE[s.tone])}>{s.label}</span>
}

function groupSummary(pos: Position) {
  const players = ROSTER.filter(p => p.position === pos)
  const graduating = players.filter(p => p.graduating).length
  return { players, graduating, returning: players.length - graduating }
}

// ── Pitch — light, minimal, mock-style ───────────────────────────────────────
function PitchView({ selected, onSelect, placements, onRemovePlacement, onDropRecruit }: {
  selected: Position | null
  onSelect: (p: Position) => void
  placements: string[]
  onRemovePlacement: (id: string) => void
  onDropRecruit: (id: string) => void
}) {
  const gaps = useMemo(() => new Set(gapPositions()), [])
  const used = new Map<Position, number>()
  const placed = placements.map(id => {
    const r = recruitById(id)!
    const spots = PITCH_SPOTS.filter(s => s.pos === r.position)
    const idx = used.get(r.position) ?? 0
    used.set(r.position, idx + 1)
    return { r, spot: spots[Math.min(idx, spots.length - 1)], offset: Math.floor(idx / spots.length) }
  })

  return (
    <div
      className="relative aspect-[3/4] w-full max-w-95 shrink-0 overflow-hidden rounded-xl border bg-muted/20"
      onDragOver={e => e.preventDefault()}
      onDrop={e => { const id = e.dataTransfer.getData('text/plain'); if (id) onDropRecruit(id) }}
    >
      {/* markings — thin, recessive */}
      <div className="absolute inset-4 rounded-sm border border-foreground/20" />
      <div className="absolute left-4 right-4 top-1/2 border-t border-foreground/20" />
      <div className="absolute left-1/2 top-1/2 h-18 w-18 -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/20" />
      <div className="absolute bottom-4 left-1/2 h-12 w-36 -translate-x-1/2 border border-b-0 border-foreground/20" />
      <div className="absolute top-4 left-1/2 h-12 w-36 -translate-x-1/2 border border-t-0 border-foreground/20" />

      {PITCH_SPOTS.map((spot, i) => {
        const g = groupSummary(spot.pos)
        const isSel = selected === spot.pos
        const isGap = gaps.has(spot.pos)
        return (
          <Tooltip key={i}>
            <TooltipTrigger
              render={
                <button
                  onClick={() => onSelect(spot.pos)}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                  aria-label={`${POSITION_LABELS[spot.pos]}: ${g.returning} returning, ${g.graduating} graduating${isGap ? ' — needs attention' : ''}`}
                />
              }
            >
              <span
                className={cn(
                  'flex h-11 w-11 flex-col items-center justify-center rounded-full text-[10px] font-bold shadow-sm transition-all',
                  isGap
                    ? 'border-2 border-dashed bg-card'
                    : 'bg-foreground text-background',
                  isSel && 'ring-4 ring-foreground/20 scale-110',
                )}
                style={isGap ? { borderColor: ORANGE, color: ORANGE } : undefined}
              >
                {spot.label}
                <span className={cn('font-mono text-[9px] font-medium', isGap ? '' : 'opacity-70')}>
                  {g.returning}{g.graduating > 0 ? `−${g.graduating}` : ''}
                </span>
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              {POSITION_LABELS[spot.pos]} — {g.returning} returning, {g.graduating} graduating
              {isGap && ' · thin next fall: drop a recruit here'}
            </TooltipContent>
          </Tooltip>
        )
      })}

      {placed.map(({ r, spot, offset }, i) => (
        <button
          key={i}
          onClick={() => onRemovePlacement(r.id)}
          className="group absolute z-10 -translate-x-1/2 rounded-full border-2 bg-card px-2 py-0.5 text-[10px] font-bold shadow-sm transition-transform hover:scale-105"
          style={{ left: `${spot.x}%`, top: `calc(${spot.y}% + ${28 + offset * 18}px)`, borderColor: GREEN, color: GREEN }}
          aria-label={`Remove ${r.name} from the chart`}
        >
          {r.name.split(' ').map(w => w[0]).join('')}
          <span className="ml-1 hidden text-[9px] group-hover:inline">✕</span>
        </button>
      ))}
    </div>
  )
}

// ── Radar beside the pitch ───────────────────────────────────────────────────
function RadarPanel({ focusId }: { focusId: string | null }) {
  const r = focusId ? recruitById(focusId) : null
  if (!r) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center">
        <UserRound className="h-5 w-5 text-muted-foreground/50" />
        <p className="max-w-44 text-[11px] text-muted-foreground">Click a recruit to see her shape vs the league at her position.</p>
      </div>
    )
  }
  const axes = radarAxesFor(r.position)
  return (
    <div className="flex w-full flex-col items-center gap-1 rounded-xl border bg-card p-3">
      <div className="flex w-full items-baseline justify-between">
        <span className="text-xs font-semibold">{r.name}</span>
        <span className="font-mono text-[10px] text-muted-foreground">{r.position} · ’{String(r.classYear).slice(2)}</span>
      </div>
      <RadarChart axes={axes} series={[{ label: r.name, values: radarOf(r.id), color: ORANGE }]} size={230} />
      <RadarLegend series={[{ label: r.name.split(' ')[0], values: [], color: ORANGE }]} />
    </div>
  )
}

// ── Roster tab — the plain table view ────────────────────────────────────────
function RosterTable() {
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2 font-medium">#</th>
            <th className="px-3 py-2 font-medium">Player</th>
            <th className="px-3 py-2 font-medium">Pos</th>
            <th className="px-3 py-2 font-medium">Class <InfoTip k="class" /></th>
            <th className="px-3 py-2 font-medium">Hometown</th>
            <th className="px-3 py-2 font-medium">Eligibility <InfoTip k="eligibility" /></th>
          </tr>
        </thead>
        <tbody>
          {[...ROSTER].sort((a, b) => (a.jersey ?? 99) - (b.jersey ?? 99)).map(p => (
            <tr key={p.id} className={cn('border-b last:border-0', p.graduating && 'bg-destructive/5')}>
              <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{p.jersey}</td>
              <td className="px-3 py-2 font-medium">
                {p.name}
                {p.graduating && <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-medium text-destructive"><GraduationCap className="h-3 w-3" /> graduating</span>}
              </td>
              <td className="px-3 py-2 font-mono text-xs">{p.position}</td>
              <td className="px-3 py-2 font-mono text-xs">{p.classYear}</td>
              <td className="px-3 py-2 text-xs text-muted-foreground">{p.hometown}</td>
              <td className="px-3 py-2"><RunwayBar from={2026} years={p.eligibilityLeft} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Recruit card (right rail, mock style) ────────────────────────────────────
function RecruitCard({ r, placed, comparing, onFocus, onOpen, onPlace, onCompare, focused }: {
  r: Recruit; placed: boolean; comparing: boolean; focused: boolean
  onFocus: () => void; onOpen: () => void; onPlace: () => void; onCompare: () => void
}) {
  const q = quantOf(r.id)
  const tier = tierById(r.tierId)
  return (
    <div
      role="button" tabIndex={0}
      draggable
      onDragStart={e => e.dataTransfer.setData('text/plain', r.id)}
      onClick={onFocus}
      onDoubleClick={onOpen}
      onKeyDown={e => e.key === 'Enter' && onOpen()}
      className={cn(
        'w-full cursor-pointer rounded-xl border bg-card p-3 text-left transition-colors hover:border-foreground/30',
        focused && 'border-foreground/40 ring-1 ring-foreground/15',
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
          style={{ backgroundColor: `${tier?.color}18`, color: tier?.color }}
        >
          {r.name.split(' ').map(w => w[0]).join('')}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold">{r.name}</span>
            <StatusBadge r={r} />
          </div>
          <div className="truncate text-[11px] text-muted-foreground">{r.club}</div>
          <div className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-[11px]">
            <span className="text-muted-foreground">Position</span><span className="text-right font-medium">{r.position} · ’{String(r.classYear).slice(2)}</span>
            <span className="text-muted-foreground">Foot <InfoTip k="foot" /></span><span className="text-right font-medium">{q.foot}</span>
            <span className="text-muted-foreground">GPA <InfoTip k="gpa" /></span><span className="text-right font-medium">{r.gpa?.toFixed(1) ?? '—'}</span>
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <RatingSparkline ratings={r.ratings} />
          <span className="flex -space-x-1">
            {[...new Set(r.notes.map(n => n.authorId))].slice(0, 3).map(id => <StaffAvatar key={id} staffId={id} />)}
          </span>
        </span>
        <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
          <Button size="sm" variant="ghost" className="h-6 px-2 text-[10px] text-muted-foreground" onClick={onOpen}>
            Profile
          </Button>
          <Button size="sm" variant={placed ? 'secondary' : 'outline'} className="h-6 gap-1 px-2 text-[10px]" onClick={onPlace}>
            {placed ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />} {placed ? 'On chart' : 'Place'}
          </Button>
          <Button size="sm" variant={comparing ? 'secondary' : 'outline'} className="h-6 gap-1 px-2 text-[10px]" onClick={onCompare}>
            <GitCompareArrows className="h-3 w-3" /> {comparing ? '✓' : 'Compare'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Screen ───────────────────────────────────────────────────────────────────
export function DepthChartScreen({ onOpenCompare }: { onOpenCompare: (ids: string[]) => void }) {
  const [tab, setTab] = useState<'depth' | 'roster'>('depth')
  const [selected, setSelected] = useState<Position | null>(null)
  const [query, setQuery] = useState('')
  const [tierFilter, setTierFilter] = useState<string | null>(null)
  const [open, setOpen] = useState<Recruit | null>(null)
  const [focusId, setFocusId] = useState<string | null>('p1')
  const [placements, setPlacements] = useState<string[]>([])
  const [compareIds, setCompareIds] = useState<string[]>([])
  const [scenarioName, setScenarioName] = useState('')
  const [savedFlash, setSavedFlash] = useState(false)

  const graduating = ROSTER.filter(p => p.graduating).length

  const list = useMemo(() => {
    let rs = [...RECRUITS]
    if (selected) rs = rs.filter(r => r.position === selected)
    if (tierFilter) rs = rs.filter(r => r.tierId === tierFilter)
    if (query) rs = rs.filter(r => (r.name + r.club).toLowerCase().includes(query.toLowerCase()))
    const tierOrder = ['blue', 'green', 'yellow', 'red']
    return rs.sort((a, b) => tierOrder.indexOf(a.tierId) - tierOrder.indexOf(b.tierId))
  }, [selected, tierFilter, query])

  const togglePlacement = (id: string) =>
    setPlacements(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleCompare = (id: string) =>
    setCompareIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : prev.length >= 3 ? prev : [...prev, id])

  const doSave = () => {
    if (!placements.length) return
    saveScenario(scenarioName.trim() || `Scenario · ${placements.length} placed`, placements)
    setScenarioName('')
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2500)
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      {/* ── Stat tiles ── */}
      <div className="grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile label="Total players" value={ROSTER.length}
          sub={`${ROSTER.length - graduating} returning · ${graduating} graduating`} />
        <StatTile label="Scholarships used" info="scholarships"
          value={<>{PROGRAM.scholarshipsUsed} <span className="text-base text-muted-foreground">/ {PROGRAM.scholarshipCap}</span></>}
          sub={`${(PROGRAM.scholarshipCap - PROGRAM.scholarshipsUsed).toFixed(1)} remaining`} />
        <StatTile label="Team avg GPA" info="gpa" value={PROGRAM.teamGPA.toFixed(2)} sub="NCAA eligible" />
        <StatTile label="Graduating ’26" value={graduating} sub={`→ ${gapPositions().length} thin groups to fill`} />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_350px]">
        {/* ── Center ── */}
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-muted p-0.5 self-start">
            {([['depth', 'Depth & needs'], ['roster', 'Roster']] as const).map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)}
                className={cn('rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                  tab === id ? 'bg-background shadow-xs' : 'text-muted-foreground hover:text-foreground')}>
                {label}
              </button>
            ))}
          </div>

          {tab === 'roster' ? <RosterTable /> : (
            <>
              <div className="flex shrink-0 flex-wrap items-start gap-3">
                <PitchView
                  selected={selected}
                  onSelect={p => setSelected(prev => prev === p ? null : p)}
                  placements={placements}
                  onRemovePlacement={togglePlacement}
                  onDropRecruit={id => !placements.includes(id) && setPlacements(prev => [...prev, id])}
                />
                <div className="flex min-w-56 flex-1 flex-col gap-3">
                  <RadarPanel focusId={focusId} />
                  <Card className="shrink-0 gap-2 py-3">
                    <CardContent className="px-3">
                      <div className="mb-2 flex items-center gap-1 text-xs font-semibold">
                        Depth by position <span className="text-muted-foreground font-normal">— now vs fall ’27</span>
                      </div>
                      <DepthBars placements={placements} />
                    </CardContent>
                  </Card>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-4 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-foreground" /> group set</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-2 border-dashed" style={{ borderColor: ORANGE }} /> thin next fall</span>
                <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full border-2" style={{ borderColor: GREEN }} /> placed recruit</span>
                <LawNote>The chart shows shape — the read is yours.</LawNote>
              </div>
              {selected && (
                <Card className="shrink-0 gap-2 py-3">
                  <CardContent className="px-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs font-semibold">{POSITION_LABELS[selected]} — current roster</span>
                      <div className="flex items-center gap-2">
                        <RunwayLegend />
                        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setSelected(null)}><X className="h-3 w-3" /></Button>
                      </div>
                    </div>
                    {groupSummary(selected).players.sort((a, b) => a.classYear - b.classYear).map(p => (
                      <div key={p.id} className={cn('flex items-center gap-3 rounded-md px-2 py-1', p.graduating && 'bg-destructive/5')}>
                        <span className="w-6 font-mono text-xs text-muted-foreground">#{p.jersey}</span>
                        <span className="flex-1 truncate text-sm">{p.name}</span>
                        {p.graduating && <GraduationCap className="h-3 w-3 text-destructive" />}
                        <RunwayBar from={2026} years={p.eligibilityLeft} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        {/* ── Right rail ── */}
        <div className="flex min-h-0 flex-col gap-3">
          <Card className="shrink-0 gap-2 py-3">
            <CardContent className="space-y-2 px-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">This scenario</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-6 gap-1 px-2 text-[10px]"
                    disabled={!placements.length}
                    onClick={() => setPlacements(prev => prev.slice(0, -1))}>
                    <Undo2 className="h-3 w-3" /> Undo
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">Drag a recruit onto the pitch — or use Place.</p>
              {placements.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {placements.map(id => {
                    const r = recruitById(id)!
                    return (
                      <button key={id} onClick={() => togglePlacement(id)}
                        className="flex items-center gap-1 rounded-full border-2 px-2 py-0.5 text-[10px] font-semibold hover:bg-muted"
                        style={{ borderColor: GREEN, color: GREEN }}>
                        {r.name} <X className="h-2.5 w-2.5" />
                      </button>
                    )
                  })}
                </div>
              )}
              <div className="flex gap-1.5">
                <Input placeholder="Name this scenario…" value={scenarioName} onChange={e => setScenarioName(e.target.value)}
                  className="h-7 text-xs" disabled={!placements.length} />
                <Button size="sm" className="h-7 gap-1 px-2 text-[11px]" onClick={doSave} disabled={!placements.length}>
                  <BookmarkPlus className="h-3.5 w-3.5" /> Save
                </Button>
              </div>
              {savedFlash && <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Saved — find it in Compare.</p>}
            </CardContent>
          </Card>

          <div className="flex min-h-0 flex-1 flex-col rounded-xl border bg-muted/10">
            <div className="space-y-2 border-b p-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recruits</h3>
                <span className="text-[11px] text-muted-foreground">{list.length} of {RECRUITS.length}</span>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search name or club…" value={query} onChange={e => setQuery(e.target.value)} className="h-8 pl-8 text-sm" />
              </div>
              <div className="flex flex-wrap gap-1">
                {TIERS.map(t => (
                  <button key={t.id} onClick={() => setTierFilter(prev => prev === t.id ? null : t.id)}
                    className={cn('rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors',
                      tierFilter === t.id ? 'text-white' : 'bg-card text-muted-foreground hover:text-foreground')}
                    style={tierFilter === t.id ? { backgroundColor: t.color, borderColor: t.color } : { borderColor: `${t.color}66` }}>
                    {t.name}
                  </button>
                ))}
                {selected && (
                  <Badge variant="secondary" className="gap-1 text-[10px]">
                    {selected} only <button onClick={() => setSelected(null)}>✕</button>
                  </Badge>
                )}
              </div>
            </div>
            <ScrollArea className="min-h-0 flex-1">
              <div className="space-y-2 p-3">
                {list.map(r => (
                  <RecruitCard key={r.id} r={r}
                    placed={placements.includes(r.id)}
                    comparing={compareIds.includes(r.id)}
                    focused={focusId === r.id}
                    onFocus={() => setFocusId(r.id)}
                    onOpen={() => { setFocusId(r.id); setOpen(r) }}
                    onPlace={() => { setFocusId(r.id); togglePlacement(r.id) }}
                    onCompare={() => toggleCompare(r.id)}
                  />
                ))}
                {list.length === 0 && <p className="p-4 text-center text-xs text-muted-foreground">No recruits match — clear a filter.</p>}
              </div>
            </ScrollArea>
            {compareIds.length > 0 && (
              <div className="flex items-center justify-between gap-2 border-t bg-card p-2.5">
                <span className="text-[11px] text-muted-foreground">{compareIds.length} selected (max 3)</span>
                <Button size="sm" className="h-7 gap-1.5 text-[11px]" onClick={() => onOpenCompare(compareIds)}>
                  <GitCompareArrows className="h-3.5 w-3.5" /> Open in Compare
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <RecruitSheet recruit={open} onClose={() => setOpen(null)} />
    </div>
  )
}
