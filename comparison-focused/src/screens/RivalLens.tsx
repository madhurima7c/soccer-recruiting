// Rival lens — "my potential configuration vs their current state."
// Pick one of your saved depth scenarios (roster + placed recruits), pick a
// rival, and the surface answers three questions with three graphics:
//   1. How strong is my (potential) team?  → hexagon overlay, coach-pickable axes
//   2. What's missing vs their style?      → bullet stats, unit dumbbells, lean tornado
//   3. What do I do about it?              → exposure card: who's exposed, which
//      recruits on the board answer it, with evidence. Film still decides.
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  RIVALS, rivalById, CONF_MEDIAN, POSITION_LABELS,
  recruitById, statusOf, tierById, staffById,
} from '@/data/seed'
import { useSaved } from '@/store'
import {
  AXIS_POOL, DEFAULT_AXES, myTeamAxes, rivalAxes, myUnits, leanRows,
  mostExposed, boardAnswers,
} from '@/lib/rival'
import { InfoTip, RadarChart, BulletStat, LeanBars, UnitDumbbells } from '@/components/charts'
import { LawNote, MiniPitch, SignalChips, SignalCount, StaffAvatar } from '@/components/viz'
import { Swords, ShieldAlert, ArrowRight, GraduationCap, Flame, Film } from 'lucide-react'
import { cn } from '@/lib/utils'

const MINE = '#171717'

const STATUS_CELL: Record<'green' | 'amber' | 'blue' | 'gray', string> = {
  green: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  blue: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  gray: 'bg-muted text-muted-foreground',
}

export function RivalLensScreen() {
  const { scenarios } = useSaved()
  const [scenarioId, setScenarioId] = useState<string>('as-is')
  const [rivalId, setRivalId] = useState<string>('mesaverde')
  const [overlays, setOverlays] = useState<string[]>([])
  const [axes, setAxes] = useState<string[]>(DEFAULT_AXES)

  const placements = useMemo(
    () => scenarioId === 'as-is' ? [] : scenarios.find(s => s.id === scenarioId)?.recruitIds ?? [],
    [scenarioId, scenarios],
  )
  const rival = rivalById(rivalId)
  const mine = useMemo(() => myTeamAxes(axes, placements), [axes, placements])
  const lean = useMemo(() => leanRows(axes, placements, rival), [axes, placements, rival])
  const units = useMemo(() => myUnits(placements), [placements])
  const exposed = useMemo(() => mostExposed(rival, placements), [rival, placements])
  const answers = useMemo(
    () => exposed ? boardAnswers(rival, exposed, []).slice(0, 3) : [],
    [rival, exposed],
  )

  const toggleAxis = (a: string) => {
    setAxes(prev => prev.includes(a)
      ? (prev.length > 3 ? prev.filter(x => x !== a) : prev)   // keep at least 3 corners
      : [...prev.slice(1), a])                                  // swap oldest corner out
  }
  const toggleOverlay = (id: string) =>
    setOverlays(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const radarSeries = [
    { label: 'My XI' + (placements.length ? ' (what-if)' : ''), values: mine, color: MINE },
    { label: rival.short, values: rivalAxes(rival, axes), color: rival.color },
    ...overlays.filter(id => id !== rivalId).map(id => {
      const r = rivalById(id)
      return { label: r.short, values: rivalAxes(r, axes), color: r.color }
    }),
  ]

  // one-line bullet reads, relative to this rival
  const s = rival.stats
  const reads = {
    possession: s.possession >= 55 ? 'They make you chase — your block defends long stretches.'
      : s.possession <= 45 ? 'They don\'t want the ball — expect a broken, direct game.' : 'Even share — midfield duels decide it.',
    ppda: s.ppda <= 8 ? 'Aggressive press — your back line gets no time on the ball.'
      : s.ppda >= 12 ? 'Passive press — you\'ll be allowed to build from deep.' : 'Selective press — watch their triggers.',
    crosses: s.crossesP90 >= 20 ? 'The game arrives in your box in the air. GK command decides it.'
      : 'Wide service is not their weapon.',
    setpiece: s.setPiecePct >= 25 ? 'Restarts are a primary weapon — every foul near the box is a chance.'
      : 'Set pieces are incidental for them.',
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-y-auto pr-1">
      {/* ── Controls: my config vs rival ── */}
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">My configuration</span>
          <Select value={scenarioId} onValueChange={v => v && setScenarioId(v)}>
            <SelectTrigger className="h-8 w-56 text-xs">
              <SelectValue>
                {scenarioId === 'as-is' ? 'Roster as-is (no recruits)' : scenarios.find(sc => sc.id === scenarioId)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="as-is">Roster as-is (no recruits)</SelectItem>
              {scenarios.map(sc => (
                <SelectItem key={sc.id} value={sc.id}>{sc.name} · {sc.recruitIds.length} placed</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Swords className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center gap-1.5">
          {RIVALS.map(r => (
            <button
              key={r.id}
              onClick={() => setRivalId(r.id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                rivalId === r.id ? 'text-white' : 'bg-card text-muted-foreground hover:text-foreground',
              )}
              style={rivalId === r.id ? { backgroundColor: r.color, borderColor: r.color } : { borderColor: `${r.color}66` }}
            >
              {r.name}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-muted-foreground">
          overlay:
          {RIVALS.filter(r => r.id !== rivalId).map(r => (
            <button key={r.id} onClick={() => toggleOverlay(r.id)}
              className={cn('rounded-full border px-2 py-0.5 font-medium',
                overlays.includes(r.id) ? 'text-white' : 'text-muted-foreground')}
              style={overlays.includes(r.id) ? { backgroundColor: r.color, borderColor: r.color } : { borderColor: `${r.color}66` }}>
              {r.short}
            </button>
          ))}
        </div>
      </div>

      {placements.length > 0 && (
        <div className="flex shrink-0 flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
          What-if includes:
          {placements.map(id => {
            const r = recruitById(id)!
            return (
              <span key={id} className="rounded-full border-2 px-2 py-0.5 text-[10px] font-semibold"
                style={{ borderColor: '#16A34A', color: '#16A34A' }}>
                {r.name} · {r.position}
              </span>
            )
          })}
          <InfoTip k="teamshape" />
        </div>
      )}

      {/* ── Their style, in four headline stats ── */}
      <div className="grid shrink-0 grid-cols-2 gap-3 xl:grid-cols-4">
        <BulletStat label="Possession" value={s.possession} unit="%" min={35} max={65}
          median={CONF_MEDIAN.possession} read={reads.possession} info="possession" accent={rival.color} />
        <BulletStat label="Press intensity (PPDA)" value={s.ppda} min={4} max={16} invert
          median={CONF_MEDIAN.ppda} read={reads.ppda} info="ppda" accent={rival.color} />
        <BulletStat label="Crosses / 90" value={s.crossesP90} min={5} max={30}
          median={CONF_MEDIAN.crossesP90} read={reads.crosses} info="crossesP90" accent={rival.color} />
        <BulletStat label="Goals from set pieces" value={s.setPiecePct} unit="%" min={5} max={40}
          median={CONF_MEDIAN.setPiecePct} read={reads.setpiece} info="setpiece" accent={rival.color} />
      </div>

      {/* ── Shape comparison + rival dossier ── */}
      <div className="grid shrink-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_380px]">
        <Card className="shrink-0 gap-2 py-3">
          <CardContent className="px-4">
            <div className="flex items-center gap-1 text-xs font-semibold">
              Team shape — my {placements.length ? 'what-if' : 'roster'} vs {rival.short}
              <InfoTip k="teamshape" />
              <span className="ml-auto flex items-center gap-1 font-normal text-[10px] text-muted-foreground">
                opposition-adjusted percentiles <InfoTip k="oppadjusted" />
              </span>
            </div>
            <div className="flex flex-wrap items-start justify-center gap-x-6">
              <div className="flex flex-col items-center">
                <RadarChart axes={axes} series={radarSeries} size={290} />
                <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                  {radarSeries.map(sr => (
                    <span key={sr.label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sr.color }} /> {sr.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="max-w-56 pt-4">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                  Your criteria — swap the corners <InfoTip k="criteria" />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {AXIS_POOL.map(a => (
                    <button key={a} onClick={() => toggleAxis(a)}
                      className={cn('rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors',
                        axes.includes(a) ? 'border-foreground bg-foreground text-background' : 'text-muted-foreground hover:text-foreground')}>
                      {a}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
                  Every staff weighs different things — pick the corners that match how <em>you</em> define the matchup.
                  “Press resistance” and “Work rate” come from your own captures and reads.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rival dossier — what "analysis of the other team" looks like */}
        <Card className="shrink-0 gap-2 py-3" style={{ borderTopWidth: 3, borderTopColor: rival.color }}>
          <CardContent className="space-y-3 px-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="text-sm font-semibold">{rival.name}</div>
                <div className="text-[11px] text-muted-foreground">{rival.record} · {rival.formation}</div>
              </div>
              <div className="flex flex-wrap justify-end gap-1">
                {rival.styleTags.map(t => (
                  <Badge key={t} variant="outline" className="text-[9px]" style={{ borderColor: `${rival.color}66`, color: rival.color }}>{t}</Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Units — you vs them <InfoTip k="units" />
              </div>
              <UnitDumbbells mine={units} theirs={rival.units} rivalColor={rival.color} />
            </div>

            <div className="rounded-lg p-2.5" style={{ backgroundColor: `${rival.color}10` }}>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: rival.color }}>
                <ShieldAlert className="h-3.5 w-3.5" /> The axis that decides it: {rival.threatAxis}
              </div>
              <p className="mt-1 text-[11px] leading-snug">{rival.threatWhy}</p>
            </div>

            <div className="rounded-lg border border-dashed p-2.5">
              <div className="flex items-center gap-1.5">
                <Film className="h-3 w-3 text-muted-foreground" />
                <StaffAvatar staffId={rival.scout.by} />
                <span className="text-[11px] font-medium">{staffById(rival.scout.by).name} · film session · {rival.scout.on}</span>
              </div>
              <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{rival.scout.note}</p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {rival.scout.tags.map(t => <Badge key={t} variant="secondary" className="text-[9px] font-normal">{t}</Badge>)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── The lean ── */}
      <Card className="shrink-0 gap-2 py-3">
        <CardContent className="px-4">
          <div className="mb-2 flex items-center gap-1 text-xs font-semibold">
            Where your squad leans — you minus them, per criterion <InfoTip k="lean" />
          </div>
          <LeanBars rows={lean} rivalColor={rival.color} />
          {lean.some(l => l.flagged) && (
            <p className="mt-2 text-[11px] font-medium text-destructive">
              ⚠ You trail on {lean.filter(l => l.flagged).map(l => l.axis).join(' and ')} — exactly what {rival.short} exploits. That's a lean pointing the wrong way for this fixture.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Suggestions: exposure → board answers ── */}
      {exposed && (
        <Card className="shrink-0 gap-2 py-3">
          <CardContent className="px-4">
            <div className="flex flex-wrap items-start gap-4">
              {/* who is exposed */}
              <div className="min-w-60 flex-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                  <Flame className="h-3.5 w-3.5" style={{ color: rival.color }} />
                  Most exposed vs {rival.short}: {POSITION_LABELS[exposed.position]}
                </div>
                <div className="mt-2 flex items-center gap-3 rounded-lg border p-3">
                  <MiniPitch highlight={exposed.position} className="w-16" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      {exposed.name}
                      {exposed.graduating && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-destructive">
                          <GraduationCap className="h-3 w-3" /> graduating
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      Lowest {exposed.axisLabel} at the positions this threat lands on
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-2 w-32 rounded-full bg-muted">
                        <div className="h-full rounded-full bg-destructive/70" style={{ width: `${exposed.value}%` }} />
                      </div>
                      <span className="font-mono text-xs font-semibold">{exposed.axisLabel} {exposed.value}</span>
                    </div>
                  </div>
                </div>
                <p className="mt-2 text-[10px] leading-snug text-muted-foreground">
                  "Exposed" is arithmetic, not a verdict: lowest {exposed.axisLabel} percentile among {(exposed.position === 'GK' ? 'goalkeepers' : POSITION_LABELS[exposed.position] + 's')} in this configuration, against a rival whose identity attacks that axis.
                </p>
              </div>

              <ArrowRight className="mt-10 hidden h-4 w-4 shrink-0 text-muted-foreground xl:block" />

              {/* board answers */}
              <div className="min-w-72 flex-[1.4]">
                <div className="flex items-center gap-1 text-xs font-semibold">
                  On your board — better matches for this matchup <InfoTip k="pipeline" />
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {answers.map(a => {
                    const tier = tierById(a.recruit.tierId)
                    const st = statusOf(a.recruit)
                    return (
                      <div key={a.recruit.id} className="rounded-lg border p-2.5" style={{ borderLeftWidth: 3, borderLeftColor: tier?.color }}>
                        <div className="flex items-center justify-between gap-1">
                          <span className="truncate text-xs font-semibold">{a.recruit.name}</span>
                          {placements.includes(a.recruit.id)
                            ? <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-semibold text-white">in this what-if ✓</span>
                            : <span className={cn('rounded-full px-1.5 py-0.5 text-[9px] font-semibold', STATUS_CELL[st.tone])}>{st.label}</span>}
                        </div>
                        <div className="mt-0.5 text-[10px] text-muted-foreground">{a.recruit.club} · ’{String(a.recruit.classYear).slice(2)}</div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="h-2 flex-1 rounded-full bg-muted">
                            <div className="h-full rounded-full" style={{ width: `${a.value}%`, backgroundColor: a.delta > 0 ? '#16A34A' : 'var(--muted-foreground)' }} />
                          </div>
                          <span className="font-mono text-[10px] font-semibold">{a.value}</span>
                        </div>
                        <div className="mt-0.5 text-[10px] text-muted-foreground">
                          {a.axisLabel}: {a.delta > 0 ? <span className="font-semibold text-emerald-700 dark:text-emerald-400">+{a.delta} vs {exposed.name.split(' ')[0]}</span> : `${a.delta} vs ${exposed.name.split(' ')[0]}`}
                        </div>
                        {a.competes && (
                          <div className="mt-1 flex items-center gap-1 text-[9px] font-medium text-muted-foreground">
                            <Flame className="h-2.5 w-2.5" /> staff-flagged competitor — cold-Tuesday-night type
                          </div>
                        )}
                        {a.signals.length > 0 && (
                          <div className="mt-1.5">
                            <SignalCount n={a.signals.length} />
                            <div className="mt-1"><SignalChips signals={a.signals} max={1} /></div>
                          </div>
                        )}
                        <Button size="sm" variant="outline" className="mt-2 h-6 w-full text-[10px]">Open profile</Button>
                      </div>
                    )
                  })}
                  {answers.length === 0 && (
                    <p className="col-span-3 rounded-lg border border-dashed p-3 text-[11px] text-muted-foreground">
                      No one at {POSITION_LABELS[exposed.position]} on the board yet — this gap goes to the shortlist matrix.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Separator className="my-3" />
            <LawNote>
              Needs in coach language → criteria → shortlist → film. Data surfaces players faster than rivals can; it never signs one.
              Percentiles here are opposition-adjusted <InfoTip k="oppadjusted" /> — a stat line from a weaker league is projected to your level, not taken at face value.
            </LawNote>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

