import { motion, useReducedMotion } from "motion/react"
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  RotateCw,
  Share,
  Shield,
  Sidebar,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  tdsCommitments,
  tdsHeadlines,
  tdsNav,
  tdsTeamRank,
  tdsWomenTop25,
} from "@/data/topDrawer"

type TopDrawerBrowserWindowProps = {
  onClose?: () => void
  zIndex?: number
  onFocus?: () => void
  delay?: number
  contextHighlight?: "selected" | "hovered" | null
  className?: string
}

/** Safari chrome + TopDrawerSoccer.com page mock — matches other macOS desktop windows. */
export function TopDrawerBrowserWindow({
  onClose,
  zIndex = 74,
  onFocus,
  delay = 1.5,
  contextHighlight = null,
  className,
}: TopDrawerBrowserWindowProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      data-window-id="tds"
      className={cn(
        "absolute left-[46%] top-[8%] flex h-[440px] w-[500px] flex-col overflow-hidden rounded-xl border bg-[#ffffff] text-[#1a1a1a] shadow-[0_28px_70px_rgba(0,0,0,0.18)]",
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
      {/* Safari chrome — same language as BrowserWindow / ECNL */}
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
          <span className="truncate text-[#555]">topdrawersoccer.com</span>
          <RotateCw className="ml-auto h-3.5 w-3.5 shrink-0 text-[#8e8e93]" />
        </div>
        <Share className="h-4 w-4 text-[#6b6b6b]" />
        <Plus className="h-4 w-4 text-[#6b6b6b]" />
      </div>

      <div className="flex h-8 shrink-0 items-end gap-1 border-b border-[#e2e2e2] bg-[#e8e8e8] px-3">
        <div className="flex h-7 max-w-[240px] items-center gap-2 rounded-t-md bg-white px-3 text-[11px] text-[#1a1a1a]">
          <span className="h-2.5 w-2.5 rounded-sm bg-[#c41230]" />
          <span className="truncate">TopDrawerSoccer</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto bg-white">
        <TdsHeader />
        <div className="grid gap-4 bg-[#f4f4f4] px-3 py-3 text-[#1a1a1a] sm:grid-cols-[1.35fr_0.9fr]">
          <div className="space-y-3">
            <div>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#c41230]">
                Headlines
              </div>
              <div className="space-y-2 rounded-lg border border-black/8 bg-white p-3">
                {tdsHeadlines.map((story) => (
                  <article
                    key={story.id}
                    className="border-b border-black/6 pb-2 last:border-b-0 last:pb-0"
                  >
                    <div className="text-[9px] font-semibold uppercase tracking-wide text-[#888]">
                      {story.kicker}
                    </div>
                    <h2 className="text-[13px] font-bold leading-snug text-[#1a1a1a]">
                      {story.title}
                    </h2>
                    <p className="mt-0.5 text-[11px] leading-snug text-[#555]">
                      {story.blurb}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#c41230]">
                Girls commitments
              </div>
              <div className="overflow-hidden rounded-lg border border-black/8 bg-white">
                {tdsCommitments.map((c, i) => (
                  <div
                    key={c.name}
                    className={cn(
                      "grid grid-cols-[1fr_auto] gap-2 px-3 py-2 text-[11px]",
                      i % 2 === 0 ? "bg-white" : "bg-[#fafafa]",
                    )}
                  >
                    <div>
                      <span className="font-semibold text-[#1a1a1a]">{c.name}</span>
                      <span className="text-[#777]">
                        {" "}
                        · {c.pos} · ’{c.classYear.slice(2)}
                      </span>
                    </div>
                    <div className="font-medium text-[#c41230]">{c.school}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-3">
            <div className="overflow-hidden rounded-lg border border-black/8 bg-white">
              <div className="bg-[#c41230] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Women’s Top 25
              </div>
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-b border-black/6 bg-[#fafafa] text-left text-[9px] uppercase text-[#777]">
                    <th className="px-3 py-1.5 font-semibold">#</th>
                    <th className="px-1 py-1.5 font-semibold">Team</th>
                    <th className="px-3 py-1.5 text-right font-semibold">Rec</th>
                  </tr>
                </thead>
                <tbody>
                  {tdsWomenTop25.map((row) => (
                    <tr
                      key={row.rank}
                      className="border-b border-black/5 last:border-b-0"
                    >
                      <td className="px-3 py-1.5 font-semibold tabular-nums text-[#c41230]">
                        {row.rank}
                      </td>
                      <td className="px-1 py-1.5 font-medium">{row.name}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums text-[#666]">
                        {row.record}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="overflow-hidden rounded-lg border border-black/8 bg-white">
              <div className="bg-[#1a1a1a] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Girls TeamRank · #1s
              </div>
              <div className="divide-y divide-black/5">
                {tdsTeamRank.map((row) => (
                  <div key={row.age} className="px-3 py-2 text-[11px]">
                    <div className="text-[9px] font-bold text-[#c41230]">{row.age}</div>
                    <div className="font-medium leading-snug text-[#1a1a1a]">
                      {row.club}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </motion.div>
  )
}

function TdsHeader() {
  return (
    <div className="border-b border-[#e2e2e2] bg-white">
      <div className="flex items-center justify-between gap-3 px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#c41230] text-[9px] font-black leading-none text-white">
            TDS
          </div>
          <div>
            <div className="text-[13px] font-black tracking-tight text-[#1a1a1a]">
              TopDrawerSoccer
            </div>
            <div className="text-[9px] uppercase tracking-[0.14em] text-[#888]">
              Club · College · Recruiting
            </div>
          </div>
        </div>
        <div className="hidden text-[10px] text-[#666] sm:block">
          Sign in · Premium
        </div>
      </div>
      <div className="flex gap-0.5 overflow-x-auto bg-[#c41230] px-1.5 py-1">
        {tdsNav.map((item, i) => (
          <span
            key={item}
            className={cn(
              "shrink-0 px-2.5 py-1 text-[11px] font-semibold",
              i === 0 ? "bg-black/20 text-white" : "text-white/90",
            )}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
