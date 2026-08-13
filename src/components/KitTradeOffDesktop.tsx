import { useEffect, useState } from "react"
import {
  Calendar,
  ChevronDown,
  Clapperboard,
  LayoutGrid,
  MessageCircle,
  Scale,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

type KitTradeOffDesktopProps = {
  onClose: () => void
}

const RAIL = [
  { id: "today", label: "Today", Icon: Calendar },
  { id: "moments", label: "Saved moments", Icon: Clapperboard },
  { id: "ask", label: "Ask", Icon: MessageCircle },
  { id: "roster", label: "Roster plan", Icon: LayoutGrid },
  { id: "recruits", label: "Recruits", Icon: Users },
  { id: "decide", label: "Decide", Icon: Scale },
] as const

type BuildCard = {
  id: string
  title: string
  badge: string
  cost: string
  ceiling: string
  pitch: string
  footer: string
  avatar?: string
  kitMark?: boolean
}

const BUILDS: BuildCard[] = [
  {
    id: "strong-dm",
    title: "Strong D. Midfielder",
    badge: "STRONG PERFORMANCE",
    cost: "$84K",
    ceiling: "4.4",
    pitch: "/kit-tradeoff/pitch-strong.svg",
    footer: "Created by Emma, May 05 ‘26",
    avatar: "/kit-tradeoff/julia.png",
  },
  {
    id: "defensive",
    title: "Defensive Strength",
    badge: "BUDGET SAFE",
    cost: "$62K",
    ceiling: "3.7",
    pitch: "/kit-tradeoff/pitch-budget.svg",
    footer: "Created by Kit",
    kitMark: true,
  },
  {
    id: "forward",
    title: "Forward Talent",
    badge: "HIGH POTENTIAL",
    cost: "$95K",
    ceiling: "4.8",
    pitch: "/kit-tradeoff/pitch-strong.svg",
    footer: "Created by Kit",
    kitMark: true,
  },
]

const POINTS: {
  id: string
  name: string
  pos: string
  ask: number
  ceiling: number
  image: string
  label?: boolean
}[] = [
  { id: "julia", name: "Julia Smith", pos: "GK", ask: 72, ceiling: 4.15, image: "/kit-tradeoff/julia.png", label: true },
  { id: "a", name: "Alden", pos: "GK", ask: 48, ceiling: 3.6, image: "/kit-tradeoff/p6.png" },
  { id: "b", name: "Keane", pos: "GK", ask: 58, ceiling: 3.2, image: "/kit-tradeoff/p7.png" },
  { id: "c", name: "Sutton", pos: "CB", ask: 38, ceiling: 4.0, image: "/kit-tradeoff/p8.png" },
  { id: "d", name: "Reyes", pos: "CB", ask: 64, ceiling: 4.45, image: "/kit-tradeoff/p2.png" },
  { id: "e", name: "Patel", pos: "DM", ask: 55, ceiling: 4.25, image: "/kit-tradeoff/p3.png" },
  { id: "f", name: "Ortiz", pos: "AM", ask: 82, ceiling: 4.55, image: "/kit-tradeoff/p4.png" },
  { id: "g", name: "Lee", pos: "AM", ask: 88, ceiling: 3.85, image: "/kit-tradeoff/p5.png" },
  { id: "h", name: "Brooks", pos: "FB", ask: 44, ceiling: 2.85, image: "/kit-tradeoff/p1.png" },
  { id: "i", name: "Quinn", pos: "ST", ask: 76, ceiling: 3.4, image: "/kit-tradeoff/p6.png" },
]

/**
 * Kit V2 · Player trade-off board (Figma 2849:28937).
 * Opens from the edge-pill Roster icon; Escape returns to the desktop pill.
 */
export function KitTradeOffDesktop({ onClose }: KitTradeOffDesktopProps) {
  const [selected, setSelected] = useState(BUILDS[0].id)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div
      className="absolute inset-0 flex overflow-hidden bg-[#181a1b] text-white"
      role="dialog"
      aria-modal="true"
      aria-label="Player trade-off"
    >
      <aside className="relative flex w-16 shrink-0 flex-col items-center bg-[#111314] py-4 shadow-[8px_0_20px_rgba(0,0,0,0.3)]">
        <img
          src="/kit-ball-bold-white.png?v=3"
          alt=""
          className="mb-5 h-5 w-5 object-contain opacity-90"
        />
        <nav className="flex flex-col gap-3" aria-label="Kit navigation">
          {RAIL.map(({ id, label, Icon }) => {
            const active = id === "roster"
            return (
              <button
                key={id}
                type="button"
                title={label}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "pressable flex h-10 w-10 items-center justify-center rounded-[10px] text-white/70 transition-colors",
                  active ? "bg-[#4a4d50] text-white" : "hover:bg-white/[0.06] hover:text-white",
                )}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
              </button>
            )
          })}
        </nav>
        <img
          src="/kit-tradeoff/profile.png"
          alt=""
          className="mt-auto mb-2 h-7 w-7 rounded-full object-cover"
        />
        <div className="absolute inset-y-0 right-0 w-px bg-white/12" aria-hidden />
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[280px] bg-[radial-gradient(ellipse_at_30%_0%,rgba(42,126,59,0.18),transparent_55%)]"
          aria-hidden
        />

        <header className="relative flex h-[78px] shrink-0 items-center border-b border-[#2e2f30] px-[34px]">
          <h1 className="text-[25px] font-bold leading-none tracking-[-0.02em] text-white">
            Player trade-off
          </h1>
        </header>

        <div className="relative min-h-0 flex-1 overflow-auto px-[34px] py-6">
          <p className="max-w-[1139px] font-[Geist,Inter,sans-serif] text-[28px] font-semibold leading-[38px] tracking-[-0.01em] text-white">
            Position focus ranges from defender to attacking mid, cost from $75K to
            $95K.
            <br />
            <span className="text-[#34d0bd]">✦ </span>
            <span className="underline decoration-solid underline-offset-2">
              Strong D. Midfieldr
            </span>{" "}
            gives you the most ceiling per dollar : 4.4 at $84K, within 0.6 of your
            top build for $11K less.
          </p>

          <div className="mt-8 flex gap-7 pb-8">
            <div className="flex w-[274px] shrink-0 flex-col gap-9">
              {BUILDS.map((build) => {
                const active = selected === build.id
                return (
                  <button
                    key={build.id}
                    type="button"
                    onClick={() => setSelected(build.id)}
                    className={cn(
                      "pressable overflow-hidden rounded-[7px] border bg-white/[0.08] p-2.5 text-left shadow-[0_11px_28px_rgba(0,0,0,0.2)] backdrop-blur-[9px] transition-opacity",
                      active
                        ? "border-[#34d0bd] opacity-100"
                        : "border-white/12 opacity-50 hover:opacity-75",
                    )}
                  >
                    <div className="space-y-1.5">
                      <div className="text-[15px] font-semibold text-white">
                        {build.title}
                      </div>
                      <span className="inline-flex rounded-[10px] bg-white/[0.06] px-2.5 py-0.5 text-[8px] font-semibold text-[#34d0bd]">
                        {build.badge}
                      </span>
                    </div>
                    <div className="my-2 flex h-[136px] items-center justify-center overflow-hidden rounded-md bg-black/20">
                      <img
                        src={build.pitch}
                        alt=""
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                      <div className="text-[9px] font-medium text-white/40">YEAR 1 COST</div>
                      <div className="text-[9px] font-medium text-white/40">CEILING</div>
                      <div className="text-[17px] font-semibold text-white">{build.cost}</div>
                      <div className="text-[17px] font-semibold text-white">{build.ceiling}</div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                      {build.avatar ? (
                        <img
                          src={build.avatar}
                          alt=""
                          className="h-3.5 w-3.5 rounded-full border border-white/20 object-cover"
                        />
                      ) : build.kitMark ? (
                        <span className="text-[13px] font-semibold text-[#34d0bd]">✦</span>
                      ) : null}
                      <span className="text-[10px] text-white/64">{build.footer}</span>
                    </div>
                  </button>
                )
              })}
            </div>

            <TradeOffChart />
          </div>
        </div>
      </div>
    </div>
  )
}

function TradeOffChart() {
  return (
    <div className="relative min-h-[560px] min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04]">
      <div className="absolute inset-y-10 right-[8%] w-[18%] rounded-md bg-[#1f6a33]/25" aria-hidden />
      <div className="absolute right-[9%] top-14 text-[10px] font-semibold tracking-[0.08em] text-white/55">
        PREMIUM ASK
      </div>

      <div className="absolute inset-x-14 top-[52%] border-t border-white/20" aria-hidden />
      <div className="absolute left-16 top-[calc(52%-18px)] text-[10px] font-semibold tracking-[0.06em] text-white/50">
        R. HALVORSEN REPLACEMENT BAR
      </div>

      <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90">
        <button
          type="button"
          className="pressable inline-flex items-center gap-1 text-[12px] font-semibold text-white/80"
        >
          Ceiling <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
        <button
          type="button"
          className="pressable inline-flex items-center gap-1 text-[12px] font-semibold text-white/80"
        >
          Scholarship ask <ChevronDown className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="absolute left-12 top-8 text-[11px] text-white/40">5</div>
      <div className="absolute bottom-10 left-12 text-[11px] text-white/40">0</div>
      <div className="absolute bottom-10 left-16 text-[11px] text-white/40">0%</div>
      <div className="absolute bottom-10 right-10 text-[11px] text-white/40">100%</div>

      <div className="absolute inset-[40px_48px_48px_56px]">
        {POINTS.map((point) => {
          const left = `${point.ask}%`
          const bottom = `${(point.ceiling / 5) * 100}%`
          return (
            <div
              key={point.id}
              className="absolute -translate-x-1/2 translate-y-1/2"
              style={{ left, bottom }}
              title={`${point.name} · ${point.pos} · ${point.ask}% ask · ${point.ceiling} ceiling`}
            >
              <img
                src={point.image}
                alt=""
                className={cn(
                  "rounded-full border-2 object-cover shadow-[0_6px_16px_rgba(0,0,0,0.35)]",
                  point.label
                    ? "h-11 w-11 border-[#34d0bd]"
                    : "h-8 w-8 border-white/25",
                )}
              />
              {point.label && (
                <div className="absolute left-[calc(100%+10px)] top-1/2 flex -translate-y-1/2 items-center gap-2 whitespace-nowrap">
                  <span className="h-px w-8 border-t border-dashed border-white/45" aria-hidden />
                  <span className="text-[12px] font-semibold text-white">
                    {point.name} <span className="text-[#75eadc]">{point.pos}</span>
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
