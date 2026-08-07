// The rival deck — five full fields in a horizontal, snap-scrolling strip
// directly above my field. Swipe / scroll / arrow through them; whichever
// field is in view IS the team being compared, everywhere on the page.
import { useEffect, useRef } from 'react'
import { RIVALS, type RivalTeam } from '@/data/seed'
import { RivalField, type FieldSelection } from '@/components/FieldOnePoint'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RivalCarousel({ tilt, activeId, onChange, onSelect }: {
  tilt: number
  activeId: string
  onChange: (id: string) => void
  onSelect: (s: FieldSelection) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const idx = RIVALS.findIndex(r => r.id === activeId)

  const scrollToIndex = (i: number) => {
    const el = ref.current
    if (!el) return
    const clamped = Math.max(0, Math.min(RIVALS.length - 1, i))
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' })
  }

  // keep scroll position in sync if activeId is changed externally
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const current = Math.round(el.scrollLeft / el.clientWidth)
    if (current !== idx) scrollToIndex(idx)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  const onScroll = () => {
    const el = ref.current
    if (!el) return
    const i = Math.round(el.scrollLeft / el.clientWidth)
    const r = RIVALS[Math.max(0, Math.min(RIVALS.length - 1, i))]
    if (r && r.id !== activeId) onChange(r.id)
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        onScroll={onScroll}
        className="scrollbar-none flex snap-x snap-mandatory overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {RIVALS.map(r => (
          <div key={r.id} className="flex w-full shrink-0 snap-center flex-col items-center" style={{ perspective: 1300 }}>
            <RivalBanner r={r} />
            <RivalField rival={r} tilt={tilt} onSelect={onSelect} />
          </div>
        ))}
      </div>

      {/* arrows */}
      <button onClick={() => scrollToIndex(idx - 1)} disabled={idx === 0} aria-label="Previous rival"
        className="absolute left-1 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-white/6 p-2 backdrop-blur-md hover:bg-white/15 disabled:opacity-25">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button onClick={() => scrollToIndex(idx + 1)} disabled={idx === RIVALS.length - 1} aria-label="Next rival"
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-xl border border-white/10 bg-white/6 p-2 backdrop-blur-md hover:bg-white/15 disabled:opacity-25">
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* dots */}
      <div className="mt-1.5 flex items-center justify-center gap-1.5">
        {RIVALS.map((r, i) => (
          <button key={r.id} onClick={() => scrollToIndex(i)} aria-label={`Go to ${r.name}`}
            className="rounded-full transition-all"
            style={{
              width: i === idx ? 18 : 6, height: 6,
              backgroundColor: i === idx ? r.color : 'rgba(255,255,255,0.25)',
            }} />
        ))}
      </div>
    </div>
  )
}

function RivalBanner({ r }: { r: RivalTeam }) {
  return (
    <div className="mb-1 flex items-center gap-2.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color }} />
      <span className="text-sm font-semibold">{r.name}</span>
      <span className="text-[10px] text-white/40">{r.record} · {r.formation}</span>
      <span className="flex gap-1">
        {r.styleTags.slice(0, 3).map(t => (
          <span key={t} className={cn('rounded-full border px-1.5 py-0.5 text-[9px]')}
            style={{ borderColor: `${r.color}55`, color: r.color }}>{t}</span>
        ))}
      </span>
    </div>
  )
}
