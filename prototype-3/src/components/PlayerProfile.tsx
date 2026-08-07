// The player profile — modeled on the reference card. Not just a radar:
// identity → radar with percentile BANDS → technical bars → physical
// measurables → character chips → academics → notes → video. Every section
// collapses; every metric has a plain-language ⓘ; the radar values are
// colored by the percentile-rank guide so "good" needs no decoding.
import { useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  SPOTS, type FieldSelection, ORANGE,
} from '@/components/FieldOnePoint'
import {
  RIVAL_XI, POSITION_LABELS, rosterById, recruitById, rivalById,
  coachScoreOf, quantOf, statusOf, traitsOf, staffById,
} from '@/data/seed'
import { profileOf, bandOf, BAND_GUIDE } from '@/lib/profile'
import { RadarChart, InfoTip } from '@/components/charts'
import { LawNote, StaffAvatar } from '@/components/viz'
import { ChevronDown, Film, GraduationCap, Play, X } from 'lucide-react'
import { cn } from '@/lib/utils'

function Section({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b last:border-0">
      <button onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between py-2.5 text-left text-[13px] font-semibold">
        {title}
        <ChevronDown className={cn('h-3.5 w-3.5 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  )
}

function MetricBar({ label, explainKey, value }: { label: string; explainKey: string; value: number }) {
  const band = bandOf(value)
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="flex w-36 shrink-0 items-center gap-1 text-xs text-muted-foreground">{label}<InfoTip k={explainKey} /></span>
      <div className="relative h-1 flex-1 rounded-full bg-muted">
        <div className="absolute inset-y-0 left-0 rounded-full bg-foreground" style={{ width: `${value}%` }} />
        <span className="absolute -top-1 h-3 w-0.5 bg-foreground/25" style={{ left: '50%' }} title="Position average" />
      </div>
      <span className="w-16 shrink-0 text-right font-mono text-xs">
        <span className="font-bold" style={{ color: band.color }}>{value}</span>
        <span className="text-muted-foreground">/100</span>
      </span>
    </div>
  )
}

function RangeRow({ label, explainKey, value, display }: { label: string; explainKey: string; value: number; display?: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="flex w-36 shrink-0 items-center gap-1 text-xs text-muted-foreground">{label}<InfoTip k={explainKey} /></span>
      <div className="relative h-1 flex-1 rounded-full bg-muted">
        <span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground shadow" style={{ left: `${value}%` }} />
      </div>
      <span className="w-16 shrink-0 text-right font-mono text-xs">{display ?? value}</span>
    </div>
  )
}

function FactRow({ label, value, explainKey }: { label: string; value: React.ReactNode; explainKey?: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-xs">
      <span className="flex items-center gap-1 text-muted-foreground">{label}{explainKey && <InfoTip k={explainKey} />}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

export function PlayerProfile({ selection, compatLine, onClose, onRemovePlacement }: {
  selection: FieldSelection | null
  compatLine?: string       // e.g. "Strong fit vs Mesa Verde — she answers the air problem"
  onClose: () => void
  onRemovePlacement: (id: string) => void
}) {
  const [note, setNote] = useState('')
  if (!selection) return null

  // ── rival player: what our staff knows from film ──
  if (selection.kind === 'rival') {
    const team = rivalById(selection.rivalId)
    const p = RIVAL_XI[selection.rivalId][selection.index]
    const spot = SPOTS[selection.index]
    return (
      <Sheet open onOpenChange={o => !o && onClose()}>
        <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md data-[side=right]:sm:max-w-md">
          <SheetHeader className="border-b bg-muted/30 p-5 pb-4">
            <SheetTitle className="pr-8 text-lg">{p.name}</SheetTitle>
            <SheetDescription>{team.name} · {spot.label} · our scout grade {p.grade}/5</SheetDescription>
          </SheetHeader>
          <div className="space-y-4 p-5">
            <div className="rounded-lg border border-dashed p-3">
              <div className="flex items-center gap-1.5 text-[11px] font-medium">
                <Film className="h-3 w-3 text-muted-foreground" /> From film — {staffById(team.scout.by).name}, {team.scout.on}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {p.note ?? 'No individual note yet — covered in the team film session.'}
              </p>
            </div>
            <LawNote>We only know what our staff has watched — this is our read of her from film, not her program's data.</LawNote>
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  // ── my player / recruit: the full reference-style profile ──
  const roster = selection.kind === 'mine' ? rosterById(selection.id) : undefined
  const recruit = selection.kind === 'recruit' ? recruitById(selection.id) : undefined
  const person = (roster ?? recruit)!
  const t = traitsOf(person.id)
  const q = recruit ? quantOf(recruit.id) : undefined
  const prof = profileOf(person.id, person.position)
  const score = coachScoreOf(person.id)

  return (
    <Sheet open onOpenChange={o => !o && onClose()}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-lg data-[side=right]:sm:max-w-lg">
        <SheetHeader className="border-b bg-muted/30 p-5 pb-3">
          <div className="flex items-start justify-between gap-2 pr-8">
            <div>
              <SheetTitle className="text-lg">
                {roster?.jersey ? `#${roster.jersey} ` : ''}{person.name}
              </SheetTitle>
              <SheetDescription>
                {roster ? `Cascadia State · Class of ${person.classYear}` : `${recruit!.club} · Class of ${person.classYear}`}
              </SheetDescription>
            </div>
            {compatLine
              ? <Badge className="shrink-0 bg-emerald-600 text-white hover:bg-emerald-600">Most compatible</Badge>
              : recruit
                ? <Badge variant="secondary" className="shrink-0">{statusOf(recruit).label}</Badge>
                : roster?.graduating
                  ? <Badge variant="outline" className="shrink-0 gap-1 border-destructive/50 text-destructive"><GraduationCap className="h-3 w-3" /> graduating ’26</Badge>
                  : null}
          </div>
          {compatLine && <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">{compatLine}</p>}
          <div className="mt-1 grid grid-cols-[auto_1fr] gap-x-6 gap-y-0.5 text-xs">
            <span className="text-muted-foreground">Position</span><span className="text-right font-medium">{POSITION_LABELS[person.position]}</span>
            <span className="text-muted-foreground">Foot <InfoTip k="foot" /></span><span className="text-right font-medium">{q?.foot ?? 'Right'}</span>
            <span className="text-muted-foreground">Coach score <InfoTip k="coachscore" /></span>
            <span className="text-right font-mono font-bold" style={{ color: score === 5 ? ORANGE : undefined }}>{score ? `${score}/5` : '—'}</span>
          </div>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          <div className="px-5">
            {prof && (
              <Section title="Player Radar">
                <p className="mb-1 text-[10px] text-muted-foreground">
                  Percentile rank vs collegiate recruits at the same position <InfoTip k="percentile" /> · dashed = position average <InfoTip k="positionavg" />
                </p>
                <div className="flex flex-col items-center">
                  <RadarChart
                    axes={prof.axes} size={300} showMedian={false}
                    axisValues={prof.values}
                    valueColor={v => bandOf(v).color}
                    series={[
                      { label: 'Position average', values: prof.positionAvg, color: '#9CA3AF', dash: true },
                      { label: person.name, values: prof.values, color: '#171717' },
                    ]}
                  />
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-lg border bg-muted/30 px-2 py-1.5">
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Percentile guide</span>
                  {BAND_GUIDE.map(b => (
                    <span key={b.label} className="flex items-center gap-1 text-[9px] text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: b.color }} /> {b.range} {b.label}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {prof && (
              <Section title="Technical Ability & Tactical Awareness">
                {prof.technical.map(m => <MetricBar key={m.label} label={m.label} explainKey={m.explainKey} value={m.value} />)}
                <p className="mt-1 text-[10px] text-muted-foreground">Tick at the middle of each bar = position average. Technique is coachable; awareness takes longer.</p>
              </Section>
            )}

            {prof && (
              <Section title="Physical Attributes">
                <FactRow label="Pace (top speed)" explainKey="pacekmh" value={`${prof.physical.paceKmh} km/h`} />
                <FactRow label="Acceleration" explainKey="accel"
                  value={<span>10m: {prof.physical.split10}s · 30m: {prof.physical.split30}s</span>} />
                <RangeRow label="Strength" explainKey="strengthP" value={prof.physical.strength} />
                <RangeRow label="Agility" explainKey="agilityP" value={prof.physical.agility} />
                <FactRow label="Total distance / match" explainKey="distance" value={`${prof.physical.distanceKm} km`} />
                <FactRow label="High-intensity running" explainKey="hir" value={`${prof.physical.hirMeters.toLocaleString()} m`} />
                <p className="mt-1 text-[10px] text-muted-foreground">The physical base is the hardest thing to add later — technique and tactics can be developed on top of it.</p>
              </Section>
            )}

            <Section title="Psychological & Character Traits">
              {t.character.length || t.strengths.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {t.character.map(c => <Badge key={c} className="bg-foreground text-background hover:bg-foreground">{c.replace(/-/g, ' ')}</Badge>)}
                  {t.strengths.map(s => <Badge key={s} variant="outline">{s.replace(/-/g, ' ')}</Badge>)}
                </div>
              ) : <p className="text-xs text-muted-foreground">Not yet described by the staff.</p>}
              <p className="mt-1.5 text-[10px] text-muted-foreground">Entered by your staff from viewings — mentality and work rate are the hardest things to change.</p>
            </Section>

            <Section title="Academic Performance">
              <FactRow label="GPA" explainKey="gpa" value={(recruit?.gpa ?? 3.4).toFixed(2)} />
              <FactRow label="Eligibility" explainKey="ncaa" value={recruit && !recruit.contactable ? 'Eval only — contact window closed' : 'NCAA Cleared'} />
              {q?.major && <FactRow label="Intended major" explainKey="major" value={q.major} />}
            </Section>

            {recruit && recruit.notes.length > 0 && (
              <Section title={`Staff Notes (${recruit.notes.length})`} defaultOpen={false}>
                <div className="space-y-2">
                  {recruit.notes.slice(0, 3).map(n => (
                    <div key={n.id} className="rounded-lg bg-muted/50 p-2.5 text-xs leading-snug">
                      <span className="flex items-center gap-1.5 font-medium">
                        <StaffAvatar staffId={n.authorId} /> {staffById(n.authorId).name} · {n.at}
                      </span>
                      <p className="mt-1 text-muted-foreground">{n.text}</p>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            <Section title="Video" defaultOpen={false}>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map(i => (
                  <div key={i} className="flex aspect-video items-center justify-center rounded-lg bg-muted">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/80"><Play className="h-3.5 w-3.5 text-background" /></span>
                  </div>
                ))}
              </div>
            </Section>

            <div className="py-3">
              <div className="mb-1.5 text-[13px] font-semibold">Notes</div>
              <Input placeholder="Add your notes…" value={note} onChange={e => setNote(e.target.value)} className="h-8 text-xs" />
            </div>

            {recruit && (
              <div className="pb-5">
                <Button variant="outline" size="sm" className="w-full gap-1.5"
                  onClick={() => { onRemovePlacement(recruit.id); onClose() }}>
                  <X className="h-3.5 w-3.5" /> Remove from my field
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
