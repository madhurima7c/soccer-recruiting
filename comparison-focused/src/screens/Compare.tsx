// Compare surface — where saved views come back.
//   Left: the library (saved depth scenarios + saved comparisons).
//   Right: the compare canvas — players side by side — with the matchmaking
//   rail: recruits who SHARE EVIDENCE with the people being compared.
// Suggestions are a mirror, not a verdict: every one lists the exact staff
// language it rests on ("both described as leader", "both read 4+ on Motor").
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  ROSTER, POSITIONS, POSITION_LABELS, RADAR_AXES, recruitById, rosterById,
  radarOf, tierById, traitsOf, type Recruit, type Player,
} from '@/data/seed'
import { InfoTip, RadarChart, RadarLegend, type RadarSeries } from '@/components/charts'
import { useSaved, saveComparison, deleteScenario, deleteComparison, type Scenario } from '@/store'
import { similarRecruits, resemblesDeparting } from '@/lib/match'
import { DimReads, LawNote, MiniPitch, RatingSparkline, RunwayBar, SignalChips, SignalCount, TierChip } from '@/components/viz'
import { BookmarkPlus, GraduationCap, Plus, Sparkles, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type PersonKind = { kind: 'recruit'; p: Recruit } | { kind: 'roster'; p: Player }
function personById(id: string): PersonKind | null {
  const r = recruitById(id)
  if (r) return { kind: 'recruit', p: r }
  const pl = rosterById(id)
  if (pl) return { kind: 'roster', p: pl }
  return null
}

// ── Scenario cards + side-by-side shape ──────────────────────────────────────
function scenarioStats(s: Scenario) {
  const rs = s.recruitIds.map(id => recruitById(id)!).filter(Boolean)
  const seasons = rs.reduce((sum, r) => sum + r.eligYears, 0)
  const gradPositions = POSITIONS.filter(p => ROSTER.some(pl => pl.position === p && pl.graduating))
  const covered = gradPositions.filter(p => rs.some(r => r.position === p))
  return { rs, seasons, covered: covered.length, gradTotal: gradPositions.length, byFall27: rs.filter(r => r.arrives <= 2027).length }
}

function ScenarioCard({ s, selected, onToggle }: { s: Scenario; selected: boolean; onToggle: () => void }) {
  const st = scenarioStats(s)
  return (
    <div
      role="button" tabIndex={0}
      onClick={onToggle}
      onKeyDown={e => e.key === 'Enter' && onToggle()}
      className={cn(
        'flex w-full cursor-pointer gap-3 rounded-lg border bg-card p-3 text-left transition-colors',
        selected ? 'border-primary ring-2 ring-primary/30' : 'hover:border-foreground/25',
      )}
    >
      <MiniPitch placedRecruitIds={s.recruitIds} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="truncate text-sm font-medium">{s.name}</span>
          <button
            onClick={e => { e.stopPropagation(); deleteScenario(s.id) }}
            className="text-muted-foreground hover:text-destructive" aria-label="Delete scenario"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="mt-0.5 text-[10px] text-muted-foreground">Saved {s.savedAt}</div>
        <div className="mt-2 space-y-0.5 text-[11px] text-muted-foreground">
          <div><span className="font-mono font-medium text-foreground">{s.recruitIds.length}</span> placed · <span className="font-mono font-medium text-foreground">+{st.seasons}</span> seasons</div>
          <div><span className="font-mono font-medium text-foreground">{st.covered}/{st.gradTotal}</span> graduating groups addressed</div>
        </div>
        {s.note && <p className="mt-1.5 truncate text-[10px] italic text-muted-foreground">“{s.note}”</p>}
      </div>
    </div>
  )
}

function ScenarioSideBySide({ ids }: { ids: string[] }) {
  const { scenarios } = useSaved()
  const pair = ids.map(id => scenarios.find(s => s.id === id)!).filter(Boolean)
  if (pair.length < 2) return null
  return (
    <Card className="shrink-0 gap-3 py-4">
      <CardHeader className="px-4"><CardTitle className="text-sm">Scenario trade-offs, side by side</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 px-4">
        {pair.map(s => {
          const st = scenarioStats(s)
          return (
            <div key={s.id} className="rounded-lg border p-3">
              <div className="flex gap-3">
                <MiniPitch placedRecruitIds={s.recruitIds} className="w-28" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{s.name}</div>
                  <div className="mt-1.5 space-y-1 text-[11px] text-muted-foreground">
                    <div>+{st.seasons} seasons of eligibility</div>
                    <div>{st.covered}/{st.gradTotal} graduating groups addressed</div>
                    <div>{st.byFall27} arrive by fall ’27</div>
                  </div>
                </div>
              </div>
              <Separator className="my-2" />
              <div className="flex flex-wrap gap-1">
                {st.rs.map(r => (
                  <span key={r.id} className="rounded-full border border-dashed px-2 py-0.5 text-[10px] font-medium"
                    style={{ borderColor: tierById(r.tierId)?.color, color: tierById(r.tierId)?.color }}>
                    {r.name} · {r.position} ’{String(r.arrives).slice(2)}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </CardContent>
      <div className="px-4"><LawNote>Same facts, two shapes — which trade-off is right is the staff's call.</LawNote></div>
    </Card>
  )
}

// ── Player column ────────────────────────────────────────────────────────────
function PersonColumn({ id, onRemove }: { id: string; onRemove: () => void }) {
  const found = personById(id)
  if (!found) return null
  const { kind, p } = found
  const t = traitsOf(id)
  const echoes = kind === 'recruit' ? resemblesDeparting(id) : []

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-lg border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{p.name}</div>
          <div className="text-[11px] text-muted-foreground">
            {POSITION_LABELS[p.position]} · ’{String(p.classYear).slice(2)}
            {kind === 'roster' && (p as Player).graduating && <span className="ml-1 font-medium text-destructive">graduating</span>}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {kind === 'recruit'
            ? <TierChip tierId={(p as Recruit).tierId} compact />
            : <Badge variant="secondary" className="text-[9px]">Roster</Badge>}
          <button onClick={onRemove} className="text-muted-foreground hover:text-foreground" aria-label={`Remove ${p.name}`}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div>
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Character</div>
        <div className="flex flex-wrap gap-1">
          {t.character.length ? t.character.map(c => (
            <Badge key={c} variant="outline" className="border-violet-300 text-[10px] font-normal text-violet-700 dark:border-violet-900 dark:text-violet-300">{c.replace(/-/g, ' ')}</Badge>
          )) : <span className="text-[10px] text-muted-foreground">not yet described</span>}
        </div>
      </div>

      <div>
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Strengths</div>
        <div className="flex flex-wrap gap-1">
          {t.strengths.length ? t.strengths.map(s => (
            <Badge key={s} variant="outline" className="border-sky-300 text-[10px] font-normal text-sky-700 dark:border-sky-900 dark:text-sky-300">{s.replace(/-/g, ' ')}</Badge>
          )) : <span className="text-[10px] text-muted-foreground">not yet flagged</span>}
        </div>
      </div>

      <div>
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Staff reads</div>
        <DimReads reads={(kind === 'recruit' ? (p as Recruit).dimReads : (p as Player).dimReads) ?? []} />
      </div>

      <Separator />
      <div className="space-y-1.5 text-[11px] text-muted-foreground">
        {kind === 'recruit' ? (
          <>
            <div className="flex items-center justify-between">
              <span>Ratings ({(p as Recruit).viewings} viewings)</span>
              <RatingSparkline ratings={(p as Recruit).ratings} />
            </div>
            <div className="flex items-center justify-between">
              <span>On campus {(p as Recruit).arrives}–{(p as Recruit).arrives + (p as Recruit).eligYears - 1}</span>
              <RunwayBar from={(p as Recruit).arrives} years={(p as Recruit).eligYears} />
            </div>
            <div>{(p as Recruit).notes.length} attributed notes · {(p as Recruit).club}</div>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <span>Seasons left</span>
            <RunwayBar from={2026} years={(p as Player).eligibilityLeft} />
          </div>
        )}
      </div>

      {echoes.length > 0 && (
        <div className="rounded-md border border-dashed p-2">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
            <GraduationCap className="h-3 w-3" /> Echoes a departing player
          </div>
          {echoes.slice(0, 1).map(m => (
            <div key={m.subject.id} className="mt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium">{m.subject.name}</span>
                <SignalCount n={m.signals.length} />
              </div>
              <div className="mt-1"><SignalChips signals={m.signals} max={2} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Matchmaking rail ─────────────────────────────────────────────────────────
function SuggestionRail({ compareIds, onAdd }: { compareIds: string[]; onAdd: (id: string) => void }) {
  const suggestions = useMemo(() => {
    const seen = new Set<string>()
    return compareIds.flatMap(id => {
      const anchor = personById(id)
      if (!anchor) return []
      return similarRecruits(id, { exclude: compareIds, minSignals: 2, limit: 2 })
        .filter(m => !seen.has(m.subject.id) && (seen.add(m.subject.id), true))
        .map(m => ({ anchorName: anchor.p.name, m }))
    })
  }, [compareIds])

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-lg border bg-muted/20">
      <div className="border-b p-3">
        <div className="flex items-center gap-1.5 text-sm font-semibold">
          <Sparkles className="h-3.5 w-3.5 text-primary" /> Similar recruits
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Found by matching what <span className="font-medium text-foreground">your staff already wrote</span> — traits, reads, timelines. Nothing is scored or ranked.
        </p>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-2.5 p-3">
          {suggestions.length === 0 && (
            <p className="text-[11px] text-muted-foreground">No overlapping evidence yet for this set — more captures will surface matches.</p>
          )}
          {suggestions.map(({ anchorName, m }) => {
            const r = recruitById(m.subject.id)!
            return (
              <div key={m.subject.id} className="rounded-lg border bg-card p-2.5" style={{ borderLeftWidth: 3, borderLeftColor: tierById(r.tierId)?.color }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-xs font-semibold">{r.name}</span>
                  <SignalCount n={m.signals.length} />
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  like <span className="font-medium text-foreground">{anchorName}</span> · {r.position} ’{String(r.classYear).slice(2)} · {r.club}
                </div>
                <div className="mt-1.5"><SignalChips signals={m.signals} max={3} /></div>
                <Button size="sm" variant="outline" className="mt-2 h-6 w-full gap-1 text-[10px]"
                  onClick={() => onAdd(m.subject.id)} disabled={compareIds.length >= 4}>
                  <Plus className="h-3 w-3" /> Add to comparison
                </Button>
              </div>
            )
          })}
        </div>
      </ScrollArea>
      <div className="border-t p-2.5">
        <LawNote>Every match shows its evidence. If the “why” looks wrong, the fix is a better note — not a better algorithm.</LawNote>
      </div>
    </div>
  )
}

// ── Screen ───────────────────────────────────────────────────────────────────
export function CompareScreen({ initialIds }: { initialIds: string[] }) {
  const { scenarios, comparisons } = useSaved()
  const [compareIds, setCompareIds] = useState<string[]>(initialIds.length ? initialIds : comparisons[0]?.personIds ?? [])
  const [scenarioPick, setScenarioPick] = useState<string[]>([])
  const [saveName, setSaveName] = useState('')
  const [savedFlash, setSavedFlash] = useState(false)

  const toggleScenario = (id: string) =>
    setScenarioPick(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev.slice(-1), id])

  const doSave = () => {
    if (compareIds.length < 2) return
    saveComparison(saveName.trim() || compareIds.map(id => personById(id)?.p.name.split(' ')[0]).join(' vs '), compareIds)
    setSaveName('')
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2500)
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
      {/* ── Library ── */}
      <div className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
        <div>
          <h2 className="text-base font-semibold">Saved views</h2>
          <LawNote>Depth scenarios and comparisons live here. Pick two scenarios to see them side by side.</LawNote>
        </div>
        <div className="shrink-0 space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Depth scenarios</h3>
          {scenarios.map(s => (
            <ScenarioCard key={s.id} s={s} selected={scenarioPick.includes(s.id)} onToggle={() => toggleScenario(s.id)} />
          ))}
          {scenarios.length === 0 && <p className="text-[11px] text-muted-foreground">None yet — build one on the depth chart and save it.</p>}
        </div>
        <div className="shrink-0 space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Player comparisons</h3>
          {comparisons.map(c => (
            <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg border bg-card p-2.5">
              <button className="min-w-0 flex-1 text-left" onClick={() => setCompareIds(c.personIds)}>
                <div className="truncate text-xs font-medium">{c.name}</div>
                <div className="text-[10px] text-muted-foreground">{c.personIds.length} players · {c.savedAt}</div>
              </button>
              <button onClick={() => deleteComparison(c.id)} className="text-muted-foreground hover:text-destructive" aria-label="Delete comparison">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Canvas ── */}
      <div className="flex min-h-0 flex-col gap-3 overflow-y-auto pr-1">
        {scenarioPick.length === 2 && <ScenarioSideBySide ids={scenarioPick} />}

        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Compare players</h2>
          <div className="flex items-center gap-1.5">
            <Input placeholder="Name this comparison…" value={saveName} onChange={e => setSaveName(e.target.value)}
              className="h-7 w-44 text-xs" disabled={compareIds.length < 2} />
            <Button size="sm" className="h-7 gap-1 px-2 text-[11px]" onClick={doSave} disabled={compareIds.length < 2}>
              <BookmarkPlus className="h-3.5 w-3.5" /> Save
            </Button>
          </div>
        </div>
        {savedFlash && <p className="-mt-2 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Comparison saved.</p>}

        {compareIds.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            Pick players to compare from the depth workbench, or open a saved comparison.
          </div>
        ) : (
          <>
          {(() => {
            const COLORS = ['#171717', '#EA580C', '#0D9488', '#7C3AED']
            const series: RadarSeries[] = compareIds
              .map((id, i) => ({ id, color: COLORS[i % COLORS.length], values: radarOf(id) }))
              .filter(s => s.values)
              .map(s => ({ label: personById(s.id)?.p.name.split(' ')[0] ?? s.id, values: s.values!, color: s.color }))
            if (series.length < 2) return null
            return (
              <Card className="shrink-0 gap-2 py-3">
                <CardContent className="flex flex-col items-center px-4">
                  <div className="flex w-full items-center gap-1 text-xs font-semibold">
                    Shapes overlaid <InfoTip k="radar" />
                    <span className="ml-auto font-normal text-muted-foreground text-[10px]">percentile vs conference, at each player's own position</span>
                  </div>
                  <RadarChart axes={[...RADAR_AXES]} series={series} size={260} />
                  <RadarLegend series={series} />
                </CardContent>
              </Card>
            )
          })()}
          <div className="flex min-h-0 flex-1 gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              {compareIds.map(id => (
                <PersonColumn key={id} id={id} onRemove={() => setCompareIds(prev => prev.filter(x => x !== id))} />
              ))}
            </div>
            <SuggestionRail compareIds={compareIds} onAdd={id => setCompareIds(prev => prev.length >= 4 ? prev : [...prev, id])} />
          </div>
          </>
        )}
      </div>
    </div>
  )
}
