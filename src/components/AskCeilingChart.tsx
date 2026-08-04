import { cn } from "@/lib/utils"
import { askCeilingPoints } from "@/data/sidelineContext"

type AskCeilingChartProps = {
  compact?: boolean
  className?: string
  /** When set, only these ids get accent dots + labels (keeps summary aligned) */
  focusIds?: readonly string[]
}

/** Shared ask (% scholarship) vs ceiling (1–5) scatter. */
export function AskCeilingChart({
  compact,
  className,
  focusIds,
}: AskCeilingChartProps) {
  const focus = focusIds ? new Set(focusIds) : null

  return (
    <div className={cn(className)}>
      <div className={compact ? "mb-2" : "mb-3"}>
        <h3 className="text-[14px] font-semibold text-[#1d1d1f]">Ask vs ceiling</h3>
        <p className="text-[12px] text-[#6b7280]">
          {focus
            ? "Named recruits highlighted · scholarship ask → · ceiling ↑ (1–5)"
            : "Scholarship ask → · projected impact ↑ (1–5)"}
        </p>
      </div>
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#fafafa]",
          compact ? "h-48" : "h-64",
        )}
      >
        <div className="pointer-events-none absolute inset-0 grid grid-cols-2 grid-rows-2 text-[9px] font-medium uppercase tracking-[0.06em] text-[#9ca3af]">
          <div className="border-b border-r border-[#e5e7eb] p-1.5">
            High ceiling · lean ask
          </div>
          <div className="border-b border-[#e5e7eb] p-1.5 text-right text-[#e85d04]">
            Premium · high ceiling
          </div>
          <div className="self-end border-r border-[#e5e7eb] p-1.5">
            Low ceiling · lean ask
          </div>
          <div className="self-end p-1.5 text-right">Premium · lower return</div>
        </div>
        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-[0.08em] text-[#9ca3af]">
          Scholarship ask →
        </div>
        <div className="absolute top-1/2 left-1.5 -translate-y-1/2 -rotate-90 text-[9px] uppercase tracking-[0.08em] text-[#9ca3af]">
          Ceiling
        </div>
        <div className="pointer-events-none absolute inset-x-8 top-1/2 border-t border-dashed border-[#d1d5db]" />
        <div className="pointer-events-none absolute inset-y-6 left-1/2 border-l border-dashed border-[#d1d5db]" />

        {askCeilingPoints.map((p) => {
          const left = 12 + p.ask * 0.72
          const bottom = 12 + (p.ceiling / 5) * 72
          const emphasized = focus ? focus.has(p.id) : !!p.highlight
          const secondary = focus ? !!p.highlight && !focus.has(p.id) : false
          // One label only — never both focus + highlight branches
          const showLabel = emphasized && (!!focus || !compact)

          return (
            <div
              key={p.id}
              className={cn(
                "absolute -translate-x-1/2 translate-y-1/2 rounded-full",
                emphasized
                  ? "z-10 h-3.5 w-3.5 bg-[#e85d04] shadow-[0_0_0_3px_rgba(232,93,4,0.22)]"
                  : secondary
                    ? "z-[5] h-2.5 w-2.5 bg-[#e85d04]/45"
                    : "h-2 w-2 bg-[#c5c5c0]",
              )}
              style={{ left: `${left}%`, bottom: `${bottom}%` }}
              title={`${p.name} (${p.pos}) · ${p.ask}% ask · ${p.ceiling}/5 ceiling`}
            >
              {showLabel && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-semibold text-[#141414]">
                  {p.name}
                  {!compact ? ` ${p.ask}%` : ""}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
