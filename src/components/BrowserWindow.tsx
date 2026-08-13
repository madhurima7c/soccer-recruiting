import { motion, useReducedMotion } from "motion/react"
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Share,
  Plus,
  Sidebar,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ecnlEvents, ecnlNav } from "@/data/ecnl"

type BrowserWindowProps = {
  onClose?: () => void
  zIndex?: number
  onFocus?: () => void
  delay?: number
  className?: string
  contextHighlight?: "selected" | "hovered" | null
}

export function BrowserWindow({
  onClose,
  zIndex = 32,
  onFocus,
  delay = 2.4,
  className,
  contextHighlight = null,
}: BrowserWindowProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      data-window-id="browser"
      className={cn(
        "absolute right-[3%] top-[34%] flex h-[460px] w-[500px] flex-col overflow-hidden rounded-xl border bg-[#ffffff] text-[#1a1a1a] shadow-[0_28px_70px_rgba(0,0,0,0.18)]",
        contextHighlight === "selected"
          ? "border-[3px] border-[#34d0bd] shadow-[inset_0_0_0_3px_rgba(52,208,189,0.22)]"
          : contextHighlight === "hovered"
            ? "border-[3px] border-[#34d0bd] shadow-[inset_0_0_0_2px_rgba(52,208,189,0.2)]"
            : "border-black/10",
        className,
      )}
      style={{ zIndex }}
      onMouseDown={onFocus}
      initial={
        reduce
          ? false
          : { opacity: 0, transform: "scale(0.97) translateY(12px)" }
      }
      animate={{ opacity: 1, transform: "scale(1) translateY(0)" }}
      transition={{
        duration: reduce ? 0 : 0.4,
        delay: reduce ? 0 : delay,
        ease: [0.32, 0.72, 0, 1],
      }}
    >
      {/* Safari chrome */}
      <div className="flex h-12 shrink-0 items-center gap-3 border-b border-[#e2e2e2] bg-[#f5f5f5] px-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="pressable h-3 w-3 rounded-full bg-[#ff5f57]"
          />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex items-center gap-2 text-[#6b6b6b]">
          <Sidebar className="h-4 w-4" />
          <ArrowLeft className="h-4 w-4 opacity-40" />
          <ArrowRight className="h-4 w-4 opacity-40" />
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-[12px] shadow-sm ring-1 ring-[#e2e2e2]">
          <Shield className="h-3 w-3 shrink-0 text-[#34c759]" />
          <span className="truncate text-[#555]">
            theecnl.com/sports/ecnl-girls/schedule/2025-26
          </span>
          <RotateCw className="ml-auto h-3.5 w-3.5 shrink-0 text-[#8e8e93]" />
        </div>
        <Share className="h-4 w-4 text-[#6b6b6b]" />
        <Plus className="h-4 w-4 text-[#6b6b6b]" />
      </div>

      {/* Tab strip */}
      <div className="flex h-8 shrink-0 items-end gap-1 border-b border-[#e2e2e2] bg-[#e8e8e8] px-3">
        <div className="flex h-7 max-w-[220px] items-center gap-2 rounded-t-md bg-white px-3 text-[11px] text-[#1a1a1a]">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#2f9e45]" />
          <span className="truncate">2025-26 ECNL Girls Schedule</span>
        </div>
      </div>

      {/* Page content */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-white">
        <EcnlSiteHeader />
        <div className="px-5 py-5">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8e8e93]">
            ECNL Girls · National Events
          </div>
          <h1 className="text-[22px] font-bold tracking-tight text-[#1a1a1a]">
            2025-26 ECNL Girls Event Schedule
          </h1>
          <p className="mt-1 max-w-xl text-[12px] leading-relaxed text-[#6b6b6b]">
            Official national event calendar for college recruiting weekends.
            Phoenix Fall / Spring highlighted for Columbia scouting plans.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
            {["All Events", "U15–U18/19", "Recruitable", "ECNLTV"].map(
              (chip, i) => (
                <span
                  key={chip}
                  className={cn(
                    "rounded-full px-2.5 py-1 font-medium",
                    i === 0
                      ? "bg-[#0a84ff] text-white"
                      : "bg-[#f3f3f3] text-[#6b6b6b]",
                  )}
                >
                  {chip}
                </span>
              ),
            )}
          </div>

          <div className="mt-5">
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#8e8e93]">
              Scheduled Games
            </div>
            <div className="overflow-hidden rounded-lg border border-[#e2e2e2]">
              {ecnlEvents.map((event, index) => (
                <div
                  key={event.id}
                  className={cn(
                    "grid grid-cols-[1fr_auto] gap-3 border-b border-[#ebebeb] px-3 py-3 last:border-b-0",
                    event.highlight
                      ? "bg-[#eef6f0]"
                      : index % 2 === 0
                        ? "bg-white"
                        : "bg-[#fafafa]",
                  )}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[13px] font-semibold text-[#1a1a1a]">
                        {event.name}
                      </span>
                      <span className="rounded bg-[#f3f3f3] px-1.5 py-0.5 text-[10px] font-medium text-[#6b6b6b]">
                        {event.ages}
                      </span>
                      {event.tv && (
                        <span className="rounded bg-[#0a84ff] px-1.5 py-0.5 text-[10px] font-medium text-white">
                          ECNLTV
                        </span>
                      )}
                      {event.highlight && (
                        <span className="rounded bg-[#2f9e45] px-1.5 py-0.5 text-[10px] font-medium text-white">
                          Scouting target
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-[11px] text-[#8e8e93]">
                      {event.location}
                      {event.location !== event.city ? ` · ${event.city}` : ""}
                    </div>
                  </div>
                  <div className="shrink-0 text-right text-[11px] tabular-nums text-[#6b6b6b]">
                    <div className="font-medium">{event.start}</div>
                    <div className="text-[#8e8e93]">{event.end}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 border-t border-[#ebebeb] pt-4 text-[10px] text-[#8e8e93]">
            Source structure referenced from theecnl.com · Elite Club National
            League
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function EcnlSiteHeader() {
  return (
    <div className="bg-[#0a1f3d] text-white">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[10px] font-bold tracking-wide">
            ECNL
          </div>
          <div>
            <div className="text-[12px] font-bold leading-tight">
              Elite Club National League
            </div>
            <div className="text-[10px] text-white/65">Official Athletics Site</div>
          </div>
        </div>
        <div className="hidden text-[10px] text-white/70 sm:block">
          TGS Login · Get The App
        </div>
      </div>
      <div className="flex gap-1 overflow-x-auto border-t border-white/10 bg-[#061528] px-2 py-1.5">
        {ecnlNav.map((item, i) => (
          <span
            key={item}
            className={cn(
              "shrink-0 rounded px-2.5 py-1 text-[11px] font-medium",
              i === 1 ? "bg-white/15 text-white" : "text-white/75",
            )}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
