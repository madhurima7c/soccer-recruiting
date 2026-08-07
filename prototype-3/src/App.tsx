// PITCHSIDE v2 — built for someone who has never seen a soccer stat.
// Top: swipe through five rival fields; yours sits right underneath.
// Drag recruits in, drag anyone out. Below the fields: the matchup as seven
// plain questions — each with both values, a verdict in words, and an
// expandable "what this means / what to do" with the specific recruit who
// answers it. Black & white; color only ever marks data.
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  RIVALS, rivalById, RECRUITS, coachScoreOf, tierById,
  staffById, NOW_LABEL, POSITION_LABELS,
} from '@/data/seed'
import { compareRows, verdictSummary, type CompareRow } from '@/lib/compare'
import { useViews, saveView, deleteView } from '@/store'
import { MyField, ORANGE, type FieldSelection } from '@/components/FieldOnePoint'
import { RivalCarousel } from '@/components/RivalCarousel'
import { PlayerProfile } from '@/components/PlayerProfile'
import { InfoTip } from '@/components/charts'
import {
  ChevronDown, BookmarkPlus, Trash2, GripVertical, Film, Trash, Undo2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const TILT = 52

// ── one comparison row: question · values · verdict · expandable help ──────
function Row({ row, rivalColor, onTryRecruit, placements }: {
  row: CompareRow
  rivalColor: string
  onTryRecruit: (id: string) => void
  placements: string[]
}) {
  const [open, setOpen] = useState(false)
  const minePct = Math.min((row.mine / row.max) * 100, 100)
  const theirsPct = Math.min((row.theirs / row.max) * 100, 100)
  const verdictStyle =
    row.verdict === 'you' ? 'bg-neutral-900 text-white'
      : row.verdict === 'them' ? 'text-white'
        : 'bg-neutral-200 text-neutral-700'
  return (
    <div className="rounded-xl border bg-white">
      <button onClick={() => setOpen(o => !o)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 p-4 text-left">
        <div className="w-52 shrink-0">
          <div className="flex items-center gap-1 text-sm font-semibold">
            {row.question} <InfoTip k={row.explainKey} />
          </div>
          {row.liveWithWhatIf && (
            <span className="text-[10px] font-medium" style={{ color: ORANGE }}>updates live with your field</span>
          )}
        </div>
        <div className="min-w-40 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-10 shrink-0 text-right text-[10px] font-medium text-muted-foreground">You</span>
            <div className="h-2.5 flex-1 rounded-full bg-neutral-100">
              <div className="h-full rounded-full bg-neutral-900" style={{ width: `${minePct}%` }} />
            </div>
            <span className="w-26 shrink-0 font-mono text-xs font-bold">{row.mine}{row.unit}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-10 shrink-0 text-right text-[10px] font-medium text-muted-foreground">Them</span>
            <div className="h-2.5 flex-1 rounded-full bg-neutral-100">
              <div className="h-full rounded-full" style={{ width: `${theirsPct}%`, backgroundColor: rivalColor }} />
            </div>
            <span className="w-26 shrink-0 font-mono text-xs font-bold">{row.theirs}{row.unit}</span>
          </div>
        </div>
        <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold', verdictStyle)}
          style={row.verdict === 'them' ? { backgroundColor: rivalColor } : undefined}>
          {row.verdictLabel}
        </span>
        <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="grid gap-3 border-t px-4 py-3 md:grid-cols-2">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">What this means</div>
            <p className="mt-1 text-xs leading-relaxed">{row.meaning}</p>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">What to do</div>
            <p className="mt-1 text-xs leading-relaxed">{row.action}</p>
            {row.suggestion && (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-lg border border-dashed p-2">
                <span className="text-xs">{row.suggestion.line}</span>
                {placements.includes(row.suggestion.recruit.id)
                  ? <span className="shrink-0 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-semibold text-white">on your field ✓</span>
                  : (
                    <Button size="sm" className="h-6 shrink-0 px-2 text-[10px]"
                      onClick={() => onTryRecruit(row.suggestion!.recruit.id)}>
                      Add to my field
                    </Button>
                  )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  const views = useViews()
  const [rivalId, setRivalId] = useState(RIVALS[0].id)
  const [placements, setPlacements] = useState<string[]>([])
  const [removed, setRemoved] = useState<string[]>([])
  const [selection, setSelection] = useState<FieldSelection | null>(null)
  const [dragActive, setDragActive] = useState<'add' | 'out' | null>(null)
  const [viewName, setViewName] = useState('')

  const rival = rivalById(rivalId)
  const rows = useMemo(() => compareRows(rival, placements, removed), [rival, placements, removed])
  const summary = verdictSummary(rows)

  const place = (id: string) => setPlacements(prev => prev.includes(id) ? prev : [...prev, id])
  const unplace = (id: string) => setPlacements(prev => prev.filter(x => x !== id))

  const bench = useMemo(() => {
    const order = ['blue', 'green', 'yellow', 'red']
    return RECRUITS.filter(r => !placements.includes(r.id))
      .sort((a, b) => order.indexOf(a.tierId) - order.indexOf(b.tierId))
  }, [placements])

  // the recruit this matchup most wants (for the "Most compatible" badge)
  const topSuggestionId = rows.find(r => r.verdict === 'them' && r.suggestion)?.suggestion?.recruit.id
  const compatLineFor = (sel: FieldSelection | null) =>
    sel && sel.kind !== 'rival' && sel.id === topSuggestionId
      ? `Most compatible for this matchup — she answers your biggest gap vs ${rival.short}.`
      : undefined

  const edited = placements.length > 0 || removed.length > 0

  return (
    <div className="min-h-screen bg-neutral-100 pb-10 text-neutral-900">
      {/* ── slim header ── */}
      <header className="mx-auto flex max-w-330 items-center gap-3 px-2 py-3">
        <span className="text-base font-black tracking-tight">PITCH<span className="font-light text-neutral-500">SIDE</span></span>
        <span className="text-xs text-neutral-500">Cascadia State · Women's Soccer</span>
        <span className="ml-auto rounded-full border px-2.5 py-0.5 font-mono text-[10px] text-neutral-500">{NOW_LABEL}</span>
      </header>

      {/* ── the two fields ── */}
      <div className="mx-auto max-w-330 rounded-3xl bg-neutral-950 px-5 pb-4 pt-4 text-white shadow-2xl">
        <p className="mb-1 text-center text-[10px] uppercase tracking-[0.2em] text-white/35">
          Swipe to change opponent · {RIVALS.findIndex(r => r.id === rivalId) + 1} of {RIVALS.length}
        </p>

        <RivalCarousel tilt={TILT} activeId={rivalId} onChange={setRivalId} onSelect={setSelection} />

        {/* the seam between fields: verdict + views */}
        <div className="my-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 rounded-xl border border-white/10 bg-white/5 px-4 py-2">
          <span className="text-xs">
            <span className="font-bold">Your roster</span>
            <span className="text-white/50"> vs </span>
            <span className="font-bold" style={{ color: rival.color }}>{rival.name}</span>
            <span className="ml-2 text-white/60">
              ahead in <span className="font-bold text-white">{summary.you}</span> ·
              behind in <span className="font-bold" style={{ color: rival.color }}> {summary.them}</span> ·
              even in <span className="font-bold text-white">{summary.even}</span>
            </span>
          </span>
          <span className="hidden h-4 w-px bg-white/15 md:block" />
          <span className="flex items-center gap-1.5 text-[10px] text-white/50">
            Views:
            <button onClick={() => { setPlacements([]); setRemoved([]) }}
              className={cn('rounded-full px-2 py-0.5 font-medium',
                !edited ? 'bg-white text-neutral-900' : 'bg-white/10 hover:bg-white/20')}>
              As-is
            </button>
            {views.map(v => {
              const active = v.recruitIds.join() === placements.join() && v.removedIds.join() === removed.join()
              return (
                <span key={v.id} className="group flex items-center">
                  <button onClick={() => { setPlacements(v.recruitIds); setRemoved(v.removedIds) }}
                    className={cn('rounded-full px-2 py-0.5 font-medium',
                      active ? 'bg-white text-neutral-900' : 'bg-white/10 hover:bg-white/20')}>
                    {v.name}
                  </button>
                  <button onClick={() => deleteView(v.id)} aria-label={`Delete ${v.name}`}
                    className="hidden pl-0.5 text-white/40 hover:text-white group-hover:inline">
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                </span>
              )
            })}
            {edited && (
              <span className="flex items-center gap-1">
                <Input value={viewName} onChange={e => setViewName(e.target.value)} placeholder="Name & save…"
                  className="h-5 w-24 border-white/15 bg-white/5 px-1.5 text-[10px] text-white placeholder:text-white/30" />
                <button
                  onClick={() => { saveView(viewName.trim() || `View · ${NOW_LABEL}`, placements, removed); setViewName('') }}
                  className="rounded-full bg-white p-1 text-neutral-900 hover:bg-white/85" aria-label="Save view">
                  <BookmarkPlus className="h-3 w-3" />
                </button>
              </span>
            )}
          </span>
        </div>

        {/* my field */}
        <div
          className="relative flex justify-center pb-2 pt-1"
          style={{ perspective: 1300 }}
          onDragEnter={e => {
            if (e.dataTransfer.types.includes('text/plain')) setDragActive(prev => prev ?? 'add')
          }}
        >
          <div onDragOver={e => e.preventDefault()}>
            <div className="mb-1 flex items-center justify-center gap-2 text-xs">
              <span className="font-semibold">
                Cascadia State — your roster
                {placements.length > 0 && <span style={{ color: ORANGE }}> + {placements.length} what-if</span>}
              </span>
              {removed.length > 0 && (
                <button onClick={() => setRemoved([])}
                  className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-white/60 hover:text-white">
                  <Undo2 className="h-2.5 w-2.5" /> {removed.length} removed — restore all
                </button>
              )}
            </div>
            <MyField
              tilt={TILT}
              placements={placements}
              removed={removed}
              dragActive={dragActive === 'add'}
              onSelect={setSelection}
              onDropRecruit={id => { place(id); setDragActive(null) }}
              onRestore={id => setRemoved(prev => prev.filter(x => x !== id))}
            />
          </div>

          {/* remove zone — drop anything from the field here */}
          <div
            className="absolute right-2 top-8 flex h-24 w-40 flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-white/25 text-white/50 transition-opacity"
            style={{ opacity: dragActive ? 1 : 0.35 }}
            onDragOver={e => { e.preventDefault(); setDragActive('out') }}
            onDrop={e => {
              const raw = e.dataTransfer.getData('text/plain')
              if (raw.startsWith('out:mine:')) setRemoved(prev => [...new Set([...prev, raw.slice(9)])])
              if (raw.startsWith('out:recruit:')) unplace(raw.slice(12))
              setDragActive(null)
            }}
          >
            <Trash className="h-4 w-4" />
            <span className="px-3 text-center text-[10px] leading-tight">Drag a player here to take her out of the lineup</span>
          </div>
        </div>

        {/* bench tray */}
        <div className="mt-1 rounded-2xl border border-white/10 bg-white/5 p-2.5">
          <div className="mb-1.5 flex items-baseline justify-between px-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
              Recruit bench — drag anyone onto your field
            </span>
            <span className="text-[9px] text-white/35">
              ring around a player = your staff's 1–5 score <InfoTip k="coachscore" className="text-white/35" />
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'thin' }}>
            {bench.map(r => {
              const score = coachScoreOf(r.id)
              const tier = tierById(r.tierId)
              const isTop = r.id === topSuggestionId
              return (
                <div
                  key={r.id}
                  draggable
                  onDragStart={e => { e.dataTransfer.setData('text/plain', `add:${r.id}`); setDragActive('add') }}
                  onDragEnd={() => setDragActive(null)}
                  onClick={() => setSelection({ kind: 'recruit', id: r.id })}
                  className={cn(
                    'flex w-44 shrink-0 cursor-grab items-center gap-2 rounded-xl border bg-neutral-900 p-2 active:cursor-grabbing',
                    isTop ? 'border-emerald-500' : 'border-white/10',
                  )}
                >
                  <GripVertical className="h-3 w-3 shrink-0 text-white/25" />
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-800 font-mono text-[9px] font-bold"
                    style={score === 5 ? { border: `2.5px solid ${ORANGE}` } : score === 4 ? { border: '2.5px solid rgba(255,255,255,0.9)' } : score === 3 ? { border: '2px solid rgba(255,255,255,0.5)' } : { border: '2px dashed rgba(255,255,255,0.3)' }}>
                    {r.name.split(' ').map(w => w[0]).join('')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[11px] font-semibold">{r.name}</div>
                    <div className="flex items-center gap-1 text-[9px] text-white/45">
                      {POSITION_LABELS[r.position]} · ’{String(r.classYear).slice(2)}
                      <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: tier?.color }} />
                    </div>
                    {isTop && <div className="text-[8.5px] font-semibold text-emerald-400">best fit vs {rival.short}</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── the matchup, in plain English ── */}
      <div className="mx-auto mt-5 max-w-330 space-y-2 px-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2 px-1">
          <h2 className="text-base font-bold">The matchup, in plain English</h2>
          <p className="text-[11px] text-neutral-500">
            Seven questions that decide the game. Tap any row for what it means and what to do — hover ⓘ anywhere a term appears.
          </p>
        </div>
        {rows.map(row => (
          <Row key={row.id} row={row} rivalColor={rival.color}
            onTryRecruit={place} placements={placements} />
        ))}

        {/* the film reminder */}
        <div className="flex items-start gap-2.5 rounded-xl border border-dashed bg-white p-4">
          <Film className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
          <div className="text-xs leading-relaxed text-neutral-600">
            <span className="font-semibold text-neutral-900">{staffById(rival.scout.by).name}'s film note on {rival.name}:</span>{' '}
            “{rival.scout.note}”
            <div className="mt-1 text-[10px] text-neutral-400">
              Numbers get you to the right questions faster — film and the staff's judgment answer them. Nothing here signs a player.
            </div>
          </div>
        </div>
      </div>

      <PlayerProfile
        selection={selection}
        compatLine={compatLineFor(selection)}
        onClose={() => setSelection(null)}
        onRemovePlacement={unplace}
      />
    </div>
  )
}
