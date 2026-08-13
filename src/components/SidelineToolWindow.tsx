import { motion, useReducedMotion } from "motion/react"
import { X, Share } from "lucide-react"
import { cn } from "@/lib/utils"
import { AskCeilingChart } from "@/components/AskCeilingChart"
import {
  committedRecruits,
  currentRoster,
  depthTargets,
  rivalProjections,
  teamContext,
} from "@/data/sidelineContext"

type SidelineToolWindowProps = {
  zIndex: number
  onFocus: () => void
  onClose?: () => void
}

export function SidelineToolWindow({
  zIndex,
  onFocus,
  onClose,
}: SidelineToolWindowProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      className="absolute inset-3 flex overflow-hidden rounded-2xl border border-black/10 bg-[#f4f5f2] text-[#141414] shadow-[0_28px_80px_rgba(0,0,0,0.4)]"
      style={{ zIndex }}
      onMouseDown={onFocus}
      initial={
        reduce
          ? false
          : { opacity: 0, transform: "scale(0.97) translateY(10px)" }
      }
      animate={{ opacity: 1, transform: "scale(1) translateY(0)" }}
      transition={{
        duration: reduce ? 0 : 0.36,
        ease: [0.32, 0.72, 0, 1],
      }}
    >
      {/* Left: preloaded staff context */}
      <aside className="flex w-[280px] shrink-0 flex-col border-r border-black/8 bg-[#1a1a1a] text-white">
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
            <img
              src="/kit-ball.png"
              alt=""
              className="h-5 w-5 object-contain"
              draggable={false}
            />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold">Sideline</div>
            <div className="truncate text-[10px] text-white/50">
              {teamContext.school} · values loaded
            </div>
          </div>
          <button
            type="button"
            aria-label="Close Sideline"
            onClick={onClose}
            className="pressable rounded-full p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 text-[12px]">
          <section>
            <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">
              Philosophy
            </h3>
            <p className="leading-relaxed text-white/80">{teamContext.philosophy}</p>
          </section>

          <section>
            <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">
              Values
            </h3>
            <ul className="space-y-2">
              {teamContext.values.map((v) => (
                <li key={v.id} className="rounded-lg bg-white/5 px-2.5 py-2">
                  <div className="font-medium text-white">{v.label}</div>
                  <div className="mt-0.5 text-[11px] text-white/55">{v.detail}</div>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">
              Current needs
            </h3>
            <ul className="space-y-1.5">
              {teamContext.needs.map((n) => (
                <li
                  key={n.id}
                  className="flex items-start justify-between gap-2 rounded-lg border border-white/10 px-2.5 py-2"
                >
                  <span>
                    <span className="font-medium">{n.label}</span>
                    <span className="mt-0.5 block text-[11px] text-white/50">
                      {n.detail}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">
              Current roster
            </h3>
            <div className="space-y-1">
              {currentRoster.map((p) => (
                <RosterLine key={p.id} name={p.name} pos={p.pos} meta={p.year} rating={p.rating} />
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/40">
              Already committed
            </h3>
            <div className="space-y-1">
              {committedRecruits.map((p) => (
                <RosterLine key={p.id} name={p.name} pos={p.pos} meta={p.year} rating={p.rating} />
              ))}
            </div>
          </section>
        </div>
      </aside>

      {/* Main: summary document */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-black/8 bg-white px-5 py-3">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.07em] text-[#8e8e93]">
              Staff summary · Phoenix Fall
            </div>
            <h2 className="text-[18px] font-semibold tracking-tight">
              Top recruits to watch — with depth, ask vs ceiling, and rival fit
            </h2>
          </div>
          <button
            type="button"
            className="pressable inline-flex items-center gap-1.5 rounded-full bg-[#141414] px-3 py-1.5 text-[12px] text-white"
          >
            <Share className="h-3.5 w-3.5" />
            Share with staff
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
          <DepthSection />
          <section className="rounded-2xl border border-black/8 bg-white p-4">
            <AskCeilingChart />
          </section>
          <RivalSection />
        </div>
      </div>
    </motion.div>
  )
}

function RosterLine({
  name,
  pos,
  meta,
  rating,
}: {
  name: string
  pos: string
  meta: string
  rating: number
}) {
  return (
    <div className="flex items-center justify-between rounded-md px-1 py-1 text-[12px]">
      <span>
        <span className="font-medium text-white">{name}</span>
        <span className="text-white/45">
          {" "}
          · {pos} · {meta}
        </span>
      </span>
      <RatingPips value={rating} dark />
    </div>
  )
}

function RatingPips({
  value,
  dark,
  compact,
}: {
  value: number
  dark?: boolean
  compact?: boolean
}) {
  return (
    <span className="inline-flex items-center gap-0.5" title={`${value}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "rounded-full",
            compact ? "h-1.5 w-1.5" : "h-1.5 w-1.5",
            i < value
              ? dark
                ? "bg-emerald-400"
                : "bg-[#141414]"
              : dark
                ? "bg-white/20"
                : "bg-black/15",
          )}
        />
      ))}
      {!compact && (
        <span
          className={cn(
            "ml-1 tabular-nums text-[10px]",
            dark ? "text-white/50" : "text-[#6b7280]",
          )}
        >
          {value}/5
        </span>
      )}
    </span>
  )
}

function DepthSection() {
  const columns = [
    { pos: "GK", players: depthTargets.filter((p) => p.pos === "GK") },
    { pos: "CB", players: depthTargets.filter((p) => p.pos === "CB") },
    { pos: "FB", players: depthTargets.filter((p) => p.pos === "FB") },
    { pos: "ST", players: depthTargets.filter((p) => p.pos === "ST") },
  ]

  return (
    <section className="rounded-2xl border border-black/8 bg-white p-4">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h3 className="text-[14px] font-semibold">Projected depth · targets</h3>
          <p className="text-[12px] text-[#6b7280]">
            Ranked out of 5 against your loaded values and positional needs
          </p>
        </div>
        <span className="text-[11px] text-[#8e8e93]">{teamContext.formation}</span>
      </div>
      <div className="relative overflow-hidden rounded-xl border border-[#b7c9ad] bg-[#d7e4cf] p-4">
        <div
          className="pointer-events-none absolute inset-0 opacity-35"
          aria-hidden
        >
          <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect
              x="3"
              y="3"
              width="94"
              height="94"
              rx="3"
              fill="none"
              stroke="white"
              strokeWidth="0.8"
            />
            <line x1="3" y1="50" x2="97" y2="50" stroke="white" strokeWidth="0.6" />
            <circle cx="50" cy="50" r="8" fill="none" stroke="white" strokeWidth="0.6" />
          </svg>
        </div>
        <div className="relative z-10 grid grid-cols-4 gap-3">
          {columns.map((col) => (
            <div key={col.pos} className="flex min-w-0 flex-col gap-2">
              <div className="text-center text-[11px] font-semibold uppercase tracking-[0.06em] text-[#3f5138]">
                {col.pos}
              </div>
              <div className="flex flex-1 flex-col gap-2">
                {col.players.length === 0 && (
                  <div className="rounded-xl border border-dashed border-[#6f8a62]/40 bg-white/40 px-2 py-4 text-center text-[10px] text-[#4d5f45]">
                    Open
                  </div>
                )}
                {col.players.map((p, index) => (
                  <div
                    key={p.id}
                    className={cn(
                      "rounded-xl border bg-white/95 px-2.5 py-2.5 text-center shadow-[0_1px_0_rgba(0,0,0,0.04)]",
                      index === 0
                        ? "border-[#e85d04]/50 ring-1 ring-[#e85d04]/20"
                        : "border-white/70",
                    )}
                  >
                    <div className="truncate text-[12px] font-medium">
                      {p.name.split(" ").pop()}
                    </div>
                    <div className="mt-1.5 flex justify-center">
                      <RatingPips value={p.rating} compact />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function RivalSection() {
  return (
    <section className="rounded-2xl border border-black/8 bg-white p-4">
      <div className="mb-3">
        <h3 className="text-[14px] font-semibold">Projected vs biggest rivals</h3>
        <p className="text-[12px] text-[#6b7280]">
          How these targets grade (1–5) in matchups that matter for Columbia
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {rivalProjections.map((block) => (
          <div
            key={block.rival}
            className="rounded-xl border border-[#e5e7eb] bg-[#fafafa] p-3"
          >
            <div className="text-[13px] font-semibold">{block.rival}</div>
            <div className="text-[11px] text-[#6b7280]">{block.matchup}</div>
            <ul className="mt-3 space-y-2">
              {block.ratings.map((r) => (
                <li key={r.name} className="text-[11px]">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{r.name.split(" ").pop()}</span>
                    <RatingPips value={r.score} />
                  </div>
                  <p className="mt-0.5 text-[#6b7280]">{r.note}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
