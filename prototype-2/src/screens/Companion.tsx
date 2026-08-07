// Sheet companion v3 — the Excel mock: a Wyscout-style spreadsheet on the
// left, the RecruitIQ panel docked right. Click a row → the panel populates
// the mini depth chart (her spot green, thin groups orange), her card, her
// radar + the depth bars, and SIMILAR CANDIDATES — whose rows also light up
// back in the sheet. The panel reads; it never rewrites, ranks, or scores.
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  POSITION_LABELS, RECRUITS, quantOf, radarOf, radarAxesFor, statusOf, tierById, staffById,
  type Recruit, NOW_LABEL,
} from '@/data/seed'
import { similarRecruits, resemblesDeparting } from '@/lib/match'
import { LawNote, MiniPitch, SignalChips, SignalCount, StaffAvatar } from '@/components/viz'
import { InfoTip, RadarChart, DepthBars, gapPositions } from '@/components/charts'
import {
  RefreshCw, AlertTriangle, ExternalLink, ChevronDown, CheckCircle2,
  MessageSquare, Sparkles, GraduationCap, FileSpreadsheet,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ORANGE = '#EA580C'

// Wyscout-style columns; ⓘ key ties each to the data guide
const COLS: { letter: string; header: string; k?: string; mapped: boolean }[] = [
  { letter: 'A', header: 'Status', k: 'status', mapped: true },
  { letter: 'B', header: 'Player', mapped: true },
  { letter: 'C', header: 'Team / Club', mapped: true },
  { letter: 'D', header: 'Pos', mapped: true },
  { letter: 'E', header: 'Class', k: 'class', mapped: true },
  { letter: 'F', header: 'Matches', k: 'matches', mapped: true },
  { letter: 'G', header: 'Min', k: 'minutes', mapped: true },
  { letter: 'H', header: 'Goals', k: 'goals', mapped: true },
  { letter: 'I', header: 'xG', k: 'xg', mapped: true },
  { letter: 'J', header: 'Country', k: 'country', mapped: true },
  { letter: 'K', header: 'GPA', k: 'gpa', mapped: true },
  { letter: 'L', header: 'Coach Notes', mapped: false },
]

const STATUS_CELL: Record<'green' | 'amber' | 'blue' | 'gray', string> = {
  green: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  amber: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  blue: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
  gray: 'bg-muted text-muted-foreground',
}

const MISSING_GRAD = new Set(['p8'])

function CandidateMini({ r, signals, onSelect }: { r: Recruit; signals: number; onSelect: () => void }) {
  const q = quantOf(r.id)
  const s = statusOf(r)
  const tier = tierById(r.tierId)
  return (
    <div
      role="button" tabIndex={0}
      onClick={onSelect}
      onKeyDown={e => e.key === 'Enter' && onSelect()}
      className="cursor-pointer rounded-lg border p-2.5 transition-colors hover:border-foreground/30"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[10px] font-bold"
          style={{ backgroundColor: `${tier?.color}18`, color: tier?.color }}>
          {r.name.split(' ').map(w => w[0]).join('')}
        </div>
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold">{r.name}</div>
          <div className="truncate text-[10px] text-muted-foreground">{r.club}</div>
        </div>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10px]">
        <span className="font-mono font-medium">{r.position} · ’{String(r.classYear).slice(2)}</span>
        <span className={cn('rounded-full px-1.5 py-0.5 font-semibold', STATUS_CELL[s.tone])}>{s.label}</span>
      </div>
      <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>GPA {r.gpa?.toFixed(1) ?? '—'} · {q.foot}</span>
        <SignalCount n={signals} />
      </div>
    </div>
  )
}

export function CompanionScreen() {
  const [selectedId, setSelectedId] = useState<string | null>('p1')
  const selected = RECRUITS.find(r => r.id === selectedId) ?? null

  const matches = useMemo(
    () => selectedId ? similarRecruits(selectedId, { minSignals: 2, limit: 4 }) : [],
    [selectedId],
  )
  const matchIds = useMemo(() => new Set(matches.map(m => m.subject.id)), [matches])
  const echoes = selected ? resemblesDeparting(selected.id) : []
  const gaps = useMemo(() => gapPositions(), [])
  const mappedCount = COLS.filter(c => c.mapped).length

  return (
    <div className="flex h-full min-h-0 overflow-hidden rounded-xl border shadow-sm">
      {/* ── Spreadsheet ── */}
      <div className="flex min-w-0 flex-1 flex-col bg-card">
        <div className="flex items-center gap-3 border-b px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-emerald-600 text-white"><FileSpreadsheet className="h-4 w-4" /></div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-medium">2027 Board — Master</span>
              <Badge variant="outline" className="h-4 px-1 font-mono text-[9px]">.XLSX</Badge>
            </div>
            <div className="flex gap-3 text-[11px] text-muted-foreground">
              {['File', 'Edit', 'View', 'Insert', 'Format', 'Data', 'Tools', 'Extensions'].map(m => (
                <span key={m} className={cn('cursor-default', m === 'Extensions' && 'rounded bg-muted px-1 font-medium text-foreground')}>{m}</span>
              ))}
            </div>
          </div>
          {matchIds.size > 0 && (
            <span className="ml-auto hidden shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-sky-300 bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-800 lg:flex dark:border-sky-900 dark:bg-sky-950/60 dark:text-sky-300">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" /> {matchIds.size} similar to {selected?.name.split(' ')[0]}
            </span>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full border-collapse text-xs">
            <thead className="sticky top-0 z-10">
              <tr className="bg-muted/80 backdrop-blur">
                <th className="w-8 border-r border-b px-1 py-1.5"></th>
                {COLS.map(c => (
                  <th key={c.letter} className="whitespace-nowrap border-r border-b px-2 py-1.5 text-left font-medium text-muted-foreground">
                    <span className="mr-1 font-mono text-[9px]">{c.letter}</span>{c.header}
                    {c.k && <InfoTip k={c.k} className="ml-1" />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECRUITS.map((r, i) => {
                const q = quantOf(r.id)
                const s = statusOf(r)
                const isSel = selectedId === r.id
                const isMatch = matchIds.has(r.id)
                return (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className={cn(
                      'cursor-pointer border-b transition-colors hover:bg-muted/40',
                      isSel && 'bg-primary/8 ring-1 ring-inset ring-primary',
                      isMatch && 'bg-sky-50 dark:bg-sky-950/40',
                    )}
                  >
                    <td className="relative border-r bg-muted/50 px-1 py-1.5 text-center font-mono text-[10px] text-muted-foreground">
                      {isMatch && <span className="absolute left-0.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-sky-500" />}
                      {i + 2}
                    </td>
                    <td className="border-r px-2 py-1.5">
                      <span className={cn('whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-semibold', STATUS_CELL[s.tone])}>{s.label}</span>
                    </td>
                    <td className="whitespace-nowrap border-r px-2 py-1.5 font-medium">{r.name}</td>
                    <td className="max-w-36 truncate border-r px-2 py-1.5">{r.club}</td>
                    <td className="border-r px-2 py-1.5 font-mono">{r.position}</td>
                    <td className={cn('border-r px-2 py-1.5 font-mono', MISSING_GRAD.has(r.id) && 'bg-amber-100 dark:bg-amber-950')}>
                      {MISSING_GRAD.has(r.id) ? '' : r.classYear}
                    </td>
                    <td className="border-r px-2 py-1.5 text-right font-mono">{q.matches}</td>
                    <td className="border-r px-2 py-1.5 text-right font-mono">{q.minutes.toLocaleString()}</td>
                    <td className="border-r px-2 py-1.5 text-right font-mono">{q.goals}</td>
                    <td className="border-r px-2 py-1.5 text-right font-mono">{q.xg.toFixed(1)}</td>
                    <td className="border-r px-2 py-1.5">{q.country}</td>
                    <td className="border-r px-2 py-1.5 text-right font-mono">{r.gpa?.toFixed(1) ?? ''}</td>
                    <td className="max-w-40 truncate px-2 py-1.5 text-muted-foreground">
                      {r.notes[0]?.chips?.slice(0, 2).join(', ') ?? ''}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center gap-1 border-t bg-muted/40 px-2 py-1 text-[11px]">
          <span className="rounded-t border border-b-0 bg-card px-3 py-1 font-medium">DM Template</span>
          <span className="px-3 py-1 text-muted-foreground">DM Shortlist</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>

      {/* ── RecruitIQ panel ── */}
      <div className="flex w-88 shrink-0 flex-col border-l bg-card">
        <div className="border-b p-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground text-[10px] font-bold text-background">iQ</div>
            <span className="text-sm font-semibold">RecruitIQ</span>
            <div className="ml-auto text-right leading-tight">
              <div className="text-[10px] font-medium">2027 Board — Master.xlsx</div>
              <div className="flex items-center justify-end gap-1 text-[9px] text-muted-foreground">
                <CheckCircle2 className="h-2.5 w-2.5 text-emerald-600" /> Synced at 9:42 AM <RefreshCw className="h-2.5 w-2.5" />
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-4 p-3">
            {/* Mini depth chart — selected green, thin groups orange */}
            <div className="flex flex-col items-center gap-1.5 rounded-lg border p-3">
              <MiniPitch
                className="w-40"
                highlight={selected?.position}
                gaps={gaps}
                placedRecruitIds={[]}
              />
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-[9px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#16A34A]" /> her spot</span>
                <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full border-2 border-dashed" style={{ borderColor: ORANGE }} /> thin next fall</span>
                <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-foreground/70" /> set</span>
              </div>
            </div>

            {selected && (
              <>
                {/* Player card */}
                <div className="rounded-lg border p-3" style={{ borderLeftWidth: 3, borderLeftColor: tierById(selected.tierId)?.color }}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                      style={{ backgroundColor: `${tierById(selected.tierId)?.color}18`, color: tierById(selected.tierId)?.color }}>
                      {selected.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold">{selected.name}</span>
                        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold', STATUS_CELL[statusOf(selected).tone])}>
                          {statusOf(selected).label}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">{selected.club}</div>
                      <div className="mt-1 flex flex-wrap gap-x-3 text-[10px] text-muted-foreground">
                        <span className="font-medium text-foreground">{POSITION_LABELS[selected.position]}</span>
                        <span>’{String(selected.classYear).slice(2)}</span>
                        <span>GPA {selected.gpa?.toFixed(1) ?? '—'} <InfoTip k="gpa" /></span>
                        <span>{selected.eligYears} yr{selected.eligYears === 1 ? '' : 's'} <InfoTip k="eligibility" /></span>
                      </div>
                    </div>
                  </div>
                  {!selected.contactable && (
                    <div className="mt-2 flex items-center gap-1.5 rounded-md bg-amber-50 p-2 text-[10px] font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      <AlertTriangle className="h-3 w-3 shrink-0" /> {selected.contactNote}
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <MessageSquare className="h-3 w-3" /> {selected.notes.length} attributed notes
                    <span className="flex -space-x-1">
                      {[...new Set(selected.notes.map(n => n.authorId))].slice(0, 3).map(id => <StaffAvatar key={id} staffId={id} />)}
                    </span>
                    {selected.notes[0] && (
                      <span className="ml-1 truncate italic">“{staffById(selected.notes[0].authorId).name.split(' ')[0]}: {selected.notes[0].text.slice(0, 42)}…”</span>
                    )}
                  </div>
                </div>

                {/* Charts row: shape + depth */}
                <div className="grid grid-cols-2 items-start gap-2">
                  <div className="flex flex-col items-center rounded-lg border p-1.5">
                    <div className="flex w-full items-center gap-1 px-1 pt-0.5 text-[10px] font-semibold">Shape <InfoTip k="radar" /></div>
                    <RadarChart axes={radarAxesFor(selected.position)}
                      series={[{ label: selected.name, values: radarOf(selected.id), color: ORANGE }]} size={155} />
                  </div>
                  <div className="rounded-lg border p-2.5">
                    <div className="mb-1.5 text-[10px] font-semibold">Depth — now vs ’27</div>
                    <DepthBars />
                  </div>
                </div>

                {/* Similar candidates */}
                <div>
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-sky-600 dark:text-sky-400" /> Similar candidates <InfoTip k="signals" />
                  </div>
                  {matches.length ? (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        {matches.map(m => (
                          <CandidateMini key={m.subject.id} r={RECRUITS.find(x => x.id === m.subject.id)!}
                            signals={m.signals.length} onSelect={() => setSelectedId(m.subject.id)} />
                        ))}
                      </div>
                      {matches[0] && (
                        <div className="mt-2"><SignalChips signals={matches[0].signals} max={2} /></div>
                      )}
                      <p className="mt-1.5 text-[10px] text-muted-foreground">Their rows are highlighted in the sheet ←</p>
                    </>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      No one on this sheet shares 2+ signals with {selected.name.split(' ')[0]} yet.
                    </p>
                  )}
                  {echoes.length > 0 && (
                    <div className="mt-2 rounded-md border border-dashed p-2">
                      <div className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground">
                        <GraduationCap className="h-3 w-3" /> Echoes a departing player
                      </div>
                      {echoes.slice(0, 1).map(m => (
                        <div key={m.subject.id} className="mt-1 flex items-center justify-between text-[11px]">
                          <span className="font-medium">{m.subject.name} — graduates ’26</span>
                          <SignalCount n={m.signals.length} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />
                <Button size="sm" variant="outline" className="h-7 w-full gap-1.5 text-xs">
                  Open full profile in RecruitIQ <ExternalLink className="h-3 w-3" />
                </Button>
                <LawNote>
                  The panel reads your sheet — it never rewrites it, ranks the rows, or scores a player.
                </LawNote>
              </>
            )}
          </div>
        </ScrollArea>

        <div className="border-t p-2.5 text-[10px] text-muted-foreground">
          Read-only · {mappedCount} of {COLS.length} columns mapped · synced {NOW_LABEL} · Works in Sheets & Excel
        </div>
      </div>
    </div>
  )
}
