// Recruit detail — opens from the depth workbench or recruits list.
// Everything already lives here (Law 3): identity, fit gates, attributed
// notes chronologically, stats vs a NAMED benchmark, referral provenance.
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  BENCHMARKS, METRIC_LABELS, METRIC_MAX, FUNNEL_LABELS, POSITION_LABELS,
  staffById, quantOf, radarOf, radarAxesFor,
  type MetricKey, type Note, type Recruit, NOW_LABEL,
} from '@/data/seed'
import { InfoTip, RadarChart, RadarLegend } from '@/components/charts'
import { BenchmarkBar, DimReads, FitGate, LawNote, RatingSparkline, RunwayBar, RunwayLegend, StaffAvatar, TierChip } from '@/components/viz'
import { Mic, MessageSquare, ClipboardPen, Phone, Video, Link2, Eye, CalendarClock, GraduationCap, Route } from 'lucide-react'
import { cn } from '@/lib/utils'

const NOTE_ICON: Record<Note['kind'], React.ReactNode> = {
  voice: <Mic className="h-3.5 w-3.5" />,
  text: <MessageSquare className="h-3.5 w-3.5" />,
  sideline: <ClipboardPen className="h-3.5 w-3.5" />,
  call: <Phone className="h-3.5 w-3.5" />,
  'video-anchor': <Video className="h-3.5 w-3.5" />,
}
const NOTE_KIND_LABEL: Record<Note['kind'], string> = {
  voice: 'Voice note', text: 'Note', sideline: 'Sideline capture', call: 'Call log', 'video-anchor': 'Video anchors',
}

function NoteCard({ note }: { note: Note }) {
  const author = staffById(note.authorId)
  return (
    <div className={cn('rounded-lg border bg-card p-3', note.draft && 'border-dashed bg-muted/40')}>
      <div className="flex items-center gap-2">
        <StaffAvatar staffId={note.authorId} />
        <span className="text-xs font-medium">{author.name}</span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          {NOTE_ICON[note.kind]} {NOTE_KIND_LABEL[note.kind]}
        </span>
        <span className="ml-auto text-[11px] text-muted-foreground">{note.at}</span>
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{note.context}</div>
      {note.draft && (
        <Badge variant="outline" className="mt-2 border-amber-400 text-[10px] text-amber-700 dark:text-amber-400">
          Unconfirmed transcript — tap to confirm or edit
        </Badge>
      )}
      <p className={cn('mt-2 text-sm leading-relaxed', note.draft && 'text-muted-foreground italic')}>{note.text}</p>
      {note.chips && note.chips.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {note.chips.map(c => (
            <Badge key={c} variant="secondary" className="text-[10px] font-normal">{c}</Badge>
          ))}
        </div>
      )}
    </div>
  )
}

export function RecruitSheet({ recruit, onClose }: { recruit: Recruit | null; onClose: () => void }) {
  if (!recruit) return null
  const bm = BENCHMARKS[recruit.benchmarkId]
  const metricKeys = (Object.keys(bm.values) as MetricKey[]).filter(
    k => recruit.stats[k] !== undefined && (bm.weights[k] ?? 0) >= 2,
  )

  return (
    <Sheet open={!!recruit} onOpenChange={open => !open && onClose()}>
      <SheetContent side="right" className="w-full gap-0 overflow-hidden p-0 sm:max-w-xl data-[side=right]:sm:max-w-xl">
        {/* Header */}
        <SheetHeader className="space-y-3 border-b bg-muted/30 p-5 pb-4">
          <div className="flex items-start justify-between gap-3 pr-8">
            <div>
              <SheetTitle className="text-xl">{recruit.name}</SheetTitle>
              <SheetDescription className="mt-0.5">
                {POSITION_LABELS[recruit.position]} · Class of {recruit.classYear} · {recruit.club}
              </SheetDescription>
            </div>
            <TierChip tierId={recruit.tierId} />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline">{recruit.pipeline === 'HS' ? 'High school' : recruit.pipeline}</Badge>
            <Badge variant="outline">{FUNNEL_LABELS[recruit.stage]}</Badge>
            {recruit.gpa && <Badge variant="outline" className="font-mono">GPA {recruit.gpa.toFixed(1)}</Badge>}
            <span className={cn('flex items-center gap-1 text-[11px]',
              recruit.contactable ? 'text-muted-foreground' : 'text-amber-700 dark:text-amber-400 font-medium')}>
              <CalendarClock className="h-3.5 w-3.5" /> {recruit.contactNote}
            </span>
          </div>

          {/* Fit gates — persistent on every profile */}
          <div className="grid grid-cols-3 gap-2">
            <FitGate label="Soccer fit" status={recruit.fitGates.soccer} />
            <FitGate label="Academic fit" status={recruit.fitGates.academic} />
            <FitGate label="Financial fit" status={recruit.fitGates.financial} />
          </div>
        </SheetHeader>

        <Tabs defaultValue="notes" className="flex min-h-0 flex-1 flex-col gap-0">
          <TabsList className="mx-5 mt-3 w-fit">
            <TabsTrigger value="notes">Notes ({recruit.notes.length})</TabsTrigger>
            <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
            <TabsTrigger value="fit">Roster fit</TabsTrigger>
          </TabsList>

          {/* ── Notes: the attributed record ── */}
          <TabsContent value="notes" className="min-h-0 flex-1">
            <ScrollArea className="h-full">
              <div className="space-y-3 p-5 pt-3">
                <div className="flex items-center justify-between">
                  <LawNote>Every note is attributed and shared by default; drafts stay visibly unconfirmed until a human touches them.</LawNote>
                </div>
                {recruit.notes.map(n => <NoteCard key={n.id} note={n} />)}
                <Separator />
                <div className="flex items-start gap-2 rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                  <Route className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">Who vouched:</span> {recruit.referral}
                    <div className="mt-0.5">Warm-path provenance travels with the record.</div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ── Evaluation: radar, quant strip, viewings, staff reads, bars ── */}
          <TabsContent value="evaluation" className="min-h-0 flex-1">
            <ScrollArea className="h-full">
              <div className="space-y-5 p-5 pt-3">
                {/* Shape vs league */}
                <div className="flex flex-col items-center rounded-lg border bg-card p-3">
                  <div className="flex w-full items-center gap-1 text-xs font-semibold">
                    Shape vs league <InfoTip k="radar" />
                  </div>
                  <RadarChart
                    axes={radarAxesFor(recruit.position)}
                    series={[{ label: recruit.name, values: radarOf(recruit.id), color: '#EA580C' }]}
                    size={240}
                  />
                  <RadarLegend series={[{ label: recruit.name.split(' ')[0], values: [], color: '#EA580C' }]} />
                </div>

                {/* The season in numbers — every cell explained */}
                {(() => {
                  const q = quantOf(recruit.id)
                  const per90 = (v: number) => q.minutes ? ((v * 90) / q.minutes).toFixed(2) : '—'
                  const cells: { k: string; label: string; value: string }[] = [
                    { k: 'matches', label: 'Matches', value: String(q.matches) },
                    { k: 'minutes', label: 'Minutes', value: q.minutes.toLocaleString() },
                    { k: 'goals', label: 'Goals', value: String(q.goals) },
                    { k: 'xg', label: 'xG', value: `${q.xg.toFixed(1)} (${per90(q.xg)}/90)` },
                    { k: 'foot', label: 'Foot', value: q.foot },
                    { k: 'country', label: 'Country', value: q.country },
                    { k: 'gpa', label: 'GPA', value: recruit.gpa?.toFixed(1) ?? '—' },
                    { k: 'major', label: 'Major', value: q.major ?? '—' },
                  ]
                  return (
                    <div className="grid grid-cols-4 gap-2">
                      {cells.map(c => (
                        <div key={c.k} className="rounded-lg border bg-card p-2">
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">{c.label}<InfoTip k={c.k} /></div>
                          <div className="mt-0.5 truncate font-mono text-xs font-semibold">{c.value}</div>
                        </div>
                      ))}
                    </div>
                  )
                })()}

                <div className="flex items-end justify-between rounded-lg border bg-card p-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Ratings across viewings</div>
                    <div className="mt-1"><RatingSparkline ratings={recruit.ratings} /></div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" /> {recruit.viewings} viewing{recruit.viewings === 1 ? '' : 's'}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Staff reads <InfoTip k="reads" /></h4>
                  <DimReads reads={recruit.dimReads} />
                  <div className="mt-2"><LawNote>Divergent reads render side by side — never averaged. The disagreement is the signal.</LawNote></div>
                </div>

                {metricKeys.length > 0 && (
                  <div>
                    <h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Stats vs. {bm.name}
                    </h4>
                    <p className="mb-3 text-[11px] text-muted-foreground">{bm.source} · coach weights shown open (w1–w5)</p>
                    <div className="space-y-3">
                      {metricKeys.map(k => (
                        <BenchmarkBar
                          key={k}
                          label={METRIC_LABELS[k]}
                          value={recruit.stats[k]!}
                          benchmark={bm.values[k]!}
                          max={METRIC_MAX[k]}
                          weight={bm.weights[k]}
                          unit={k.endsWith('Pct') ? '%' : ''}
                        />
                      ))}
                    </div>
                    <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Link2 className="h-3 w-3" /> Each metric links to its source clips where the platform supports it.
                    </div>
                  </div>
                )}
                {metricKeys.length === 0 && (
                  <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                    No imported stats yet — video and live viewings are the record so far.
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* ── Roster fit: the current roster is always in the room (Law 4) ── */}
          <TabsContent value="fit" className="min-h-0 flex-1">
            <ScrollArea className="h-full">
              <div className="space-y-4 p-5 pt-3">
                <div className="rounded-lg border bg-card p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium">Eligibility runway</span>
                    <RunwayLegend />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Arrives {recruit.arrives} · {recruit.eligYears} season{recruit.eligYears === 1 ? '' : 's'}
                    </span>
                    <RunwayBar from={recruit.arrives} years={recruit.eligYears} />
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded-lg border p-3 text-xs text-muted-foreground">
                  <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <p>
                    Open the depth workbench with <span className="font-medium text-foreground">{POSITION_LABELS[recruit.position]}</span> selected
                    to see this recruit against who's returning and who's leaving. Recruiting is never abstract —
                    it's always relative to the roster.
                  </p>
                </div>
                <LawNote>The tool shows shape — presence, runway, and gaps. Whether this recruit makes the roster better is your call, not the tool's.</LawNote>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between border-t bg-muted/30 px-5 py-3">
          <span className="text-[11px] text-muted-foreground">Last updated {recruit.lastContact ?? '—'} · Demo clock {NOW_LABEL}</span>
          <Button size="sm" variant="outline">Log a contact</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
