import { recruits } from "@/data/recruits"
import { cn } from "@/lib/utils"

const columns = [
  { pos: "GK", ids: ["rowe", "delgado"] },
  { pos: "CB", ids: ["samsani"] },
  { pos: "FB", ids: ["doran"] },
  { pos: "ST", ids: ["kramer", "guin"] },
]

const byId = Object.fromEntries(recruits.map((r) => [r.id, r]))

type DepthChartProps = {
  highlightIds?: string[]
  compact?: boolean
}

export function DepthChart({ highlightIds = [], compact }: DepthChartProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[#b7c9ad] bg-field",
        compact ? "p-3" : "p-4",
      )}
    >
      <FieldLines />
      <div className="relative z-10 mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.08em] text-[#4d5f45]">
        <span>Depth · 4-3-3</span>
        <span>Starter → depth</span>
      </div>
      <div className="relative z-10 grid grid-cols-4 gap-2">
        {columns.map((col) => (
          <div key={col.pos} className="flex flex-col gap-2">
            <div className="text-center text-[11px] font-medium text-[#3f5138]">
              {col.pos}
            </div>
            {col.ids.map((id, index) => {
              const player = byId[id]
              if (!player) return null
              const hot = highlightIds.includes(id)
              return (
                <div
                  key={id}
                  className={cn(
                    "rounded-xl border bg-white/90 px-2 py-2 text-center shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-[border-color,transform,background-color] duration-200",
                    hot
                      ? "border-accent bg-accent-soft"
                      : "border-white/70",
                    index === 0 && "ring-1 ring-black/5",
                  )}
                >
                  <div className="text-[12px] font-medium text-ink">{player.name}</div>
                  <div className="mt-0.5 text-[10px] text-muted">
                    {player.scholarshipAsk}% · {player.technical}/5
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function FieldLines() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <rect
        x="4"
        y="4"
        width="92"
        height="92"
        rx="4"
        fill="none"
        stroke="#6f8a62"
        strokeWidth="0.8"
      />
      <line x1="50" y1="4" x2="50" y2="96" stroke="#6f8a62" strokeWidth="0.6" />
      <circle cx="50" cy="50" r="12" fill="none" stroke="#6f8a62" strokeWidth="0.6" />
      <rect
        x="4"
        y="28"
        width="14"
        height="44"
        fill="none"
        stroke="#6f8a62"
        strokeWidth="0.6"
      />
      <rect
        x="82"
        y="28"
        width="14"
        height="44"
        fill="none"
        stroke="#6f8a62"
        strokeWidth="0.6"
      />
    </svg>
  )
}
