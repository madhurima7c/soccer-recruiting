import { useEffect, useState } from "react"
import {
  Calendar,
  ChevronLeft,
  ChevronDown,
  Clapperboard,
  LayoutGrid,
  MessageCircle,
  Scale,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

type KitSavedMomentsDesktopProps = {
  onClose: () => void
}

const FILTERS = [
  { id: "wa", label: "ECNL ‘26", accent: "WA" },
  { id: "phx-a", label: "ECNL ‘26", accent: "PHX" },
  { id: "phx-b", label: "ECNL ‘26", accent: "PHX" },
] as const

const RAIL = [
  { id: "today", label: "Today", Icon: Calendar },
  { id: "moments", label: "Saved moments", Icon: Clapperboard },
  { id: "ask", label: "Ask", Icon: MessageCircle },
  { id: "roster", label: "Roster plan", Icon: LayoutGrid },
  { id: "recruits", label: "Recruits", Icon: Users },
  { id: "decide", label: "Decide", Icon: Scale },
] as const

type TimelineCard =
  | {
      kind: "clip"
      time: string
      tag: string
      note: string
      image: string
      cta?: string
    }
  | {
      kind: "note"
      tone: "coach" | "you" | "duel"
      time: string
      title: string
      note: string
    }

type TimelineLane = {
  date: string
  matches: { home: string; away: string }[]
  cards: (TimelineCard | null)[]
}

const LANES: TimelineLane[] = [
  {
    date: "WED · JUL 16",
    matches: [
      { home: "GA Aspire", away: "FC Dallas" },
      { home: "GA Aspire", away: "FC Dallas" },
    ],
    cards: [
      {
        kind: "clip",
        time: "10:35",
        tag: "Shot",
        note: "Strong first touch in tight space",
        image: "/kit-moments/clip-shot.png",
        cta: "+ Add note at 10:35",
      },
      null,
      {
        kind: "note",
        tone: "coach",
        time: "10:52",
        title: "Coach Martinez",
        note: "Keep on staff watchlist",
      },
      null,
      {
        kind: "note",
        tone: "coach",
        time: "10:52",
        title: "Coach Martinez",
        note: "Keep on staff watchlist",
      },
    ],
  },
  {
    date: "WED · JUL 17",
    matches: [
      { home: "GA Aspire", away: "FC Dallas" },
      { home: "GA Aspire", away: "FC Dallas" },
    ],
    cards: [
      null,
      {
        kind: "clip",
        time: "10:37",
        tag: "Compete",
        note: "Won second ball under pressure",
        image: "/kit-moments/clip-compete.png",
      },
      {
        kind: "note",
        tone: "you",
        time: "10:52",
        title: "Follow up",
        note: "Verify against staff notes",
      },
      null,
      {
        kind: "note",
        tone: "coach",
        time: "10:52",
        title: "Coach Martinez",
        note: "Keep on staff watchlist",
      },
    ],
  },
]

/**
 * Kit V2 · Saved Moments full desktop surface (Figma 2849:28363).
 * Opens from the edge-pill Moments icon; Escape / back returns to the desktop pill.
 */
export function KitSavedMomentsDesktop({ onClose }: KitSavedMomentsDesktopProps) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("wa")

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
      aria-label="Saved moments"
    >
      <aside className="relative flex w-16 shrink-0 flex-col items-center bg-[#111314] py-4 shadow-[8px_0_20px_rgba(0,0,0,0.3)]">
        <img
          src="/kit-ball-bold-white.png?v=3"
          alt=""
          className="mb-5 h-5 w-5 object-contain opacity-90"
        />
        <nav className="flex flex-col gap-3" aria-label="Kit navigation">
          {RAIL.map(({ id, label, Icon }) => {
            const active = id === "moments"
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
          src="/kit-moments/profile.png"
          alt=""
          className="mt-auto mb-2 h-7 w-7 rounded-full object-cover"
        />
        <div className="absolute inset-y-0 right-0 w-px bg-white/12" aria-hidden />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[78px] shrink-0 items-center border-b border-[#2e2f30] px-[34px]">
          <button
            type="button"
            onClick={onClose}
            className="pressable flex items-center gap-0.5 text-left"
            aria-label="Back to desktop"
          >
            <ChevronLeft className="h-6 w-6 text-white/80" strokeWidth={2} />
            <span className="text-[25px] font-bold leading-none tracking-[-0.02em] text-white">
              Saved moments
            </span>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-auto">
          <div className="flex flex-col gap-6 px-[34px] py-6">
            <button
              type="button"
              className="pressable inline-flex w-fit items-center gap-3 rounded-2xl border border-white/12 bg-white/[0.08] p-3"
            >
              <img
                src="/kit-moments/julia-export.png"
                alt=""
                className="h-11 w-11 rounded-[22px] border-2 border-white/20 object-cover"
              />
              <span className="text-[20px] font-semibold leading-none">
                Julia Smith · <span className="text-[#75eadc]">GK</span>
              </span>
              <ChevronDown className="h-5 w-5 text-white/55" />
            </button>

            <p className="max-w-[1088px] font-[Geist,Inter,sans-serif] text-[28px] font-semibold leading-[38px] tracking-[-0.01em] text-white">
              Julia is a composed GK on{" "}
              <span className="text-[#34d0bd]">2</span> coaches’ watchlists, known
              for quick reactions, confident claiming, and strong distribution from
              the back. Here are the snippets that you should watch
              <span className="ml-2 inline-flex align-middle">
                {[0, 1, 2].map((i) => (
                  <img
                    key={i}
                    src="/kit-moments/clip-shot.png"
                    alt=""
                    className={cn(
                      "inline-block h-7 w-11 rounded-[5px] border border-white/40 object-cover shadow-[0_2px_6px_rgba(0,0,0,0.35)]",
                      i === 0 && "-rotate-[4deg]",
                      i === 1 && "relative z-[1] -ml-2 rotate-[5deg]",
                      i === 2 && "-ml-2 -rotate-[4deg]",
                    )}
                  />
                ))}
              </span>
            </p>

            <div className="flex flex-wrap gap-6">
              {FILTERS.map((item) => {
                const active = filter === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFilter(item.id)}
                    className={cn(
                      "pressable rounded-lg px-4 py-2 text-[11px] font-semibold",
                      active
                        ? "border-2 border-[#34d0bd] bg-white/15 shadow-[0_8px_22px_rgba(0,0,0,0.18)]"
                        : "border border-white/12 bg-white/[0.08]",
                    )}
                  >
                    {item.label} · <span className="text-[#75eadc]">{item.accent}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-8 px-[34px] pb-10">
            {LANES.map((lane) => (
              <TimelineRow key={lane.date} lane={lane} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function TimelineRow({ lane }: { lane: TimelineLane }) {
  return (
    <div className="flex gap-4">
      <div className="w-[120px] shrink-0 pt-1">
        <div className="text-[12px] font-semibold text-white">{lane.date}</div>
        <div className="mt-3 space-y-3">
          {lane.matches.map((match, index) => (
            <div key={`${match.home}-${index}`} className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/80">
                <ClubMark label="GA" />
                <span>{match.home}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/55">
                <ClubMark label="FC" muted />
                <span>{match.away}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="min-w-0 flex-1 overflow-x-auto pb-2">
        <div className="relative flex min-w-[900px]">
          <div className="absolute left-0 right-0 top-[23px] h-px bg-white/15" aria-hidden />
          {lane.cards.map((card, index) => (
            <div
              key={index}
              className="relative h-[220px] w-[180px] shrink-0 border-l border-white/[0.08]"
            >
              <span
                className={cn(
                  "absolute left-1/2 top-[19.5px] z-[1] -translate-x-1/2 rounded-full",
                  card ? "h-2 w-2 bg-white" : "h-[5px] w-[5px] bg-white/45",
                )}
                aria-hidden
              />
              {card && (
                <div className="absolute left-[10px] top-[42px] w-[160px]">
                  <MomentCard card={card} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MomentCard({ card }: { card: TimelineCard }) {
  if (card.kind === "clip") {
    return (
      <div className="overflow-hidden rounded-2xl border border-white/20 bg-white/[0.08] shadow-[0_9px_20px_rgba(0,0,0,0.3)]">
        <div className="h-14 overflow-hidden">
          <img src={card.image} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="space-y-3 px-2.5 py-2">
          <div>
            <div className="text-[11px] font-bold text-white">
              {card.time} · {card.tag}
            </div>
            <div className="text-[9px] font-medium text-white/64">{card.note}</div>
          </div>
          {card.cta && (
            <button
              type="button"
              className="pressable flex h-[26px] w-full items-center justify-center rounded-[10px] border border-white/12 bg-white/15 text-[9px] font-bold text-white"
            >
              {card.cta}
            </button>
          )}
        </div>
      </div>
    )
  }

  const label =
    card.tone === "coach" ? "COACH NOTE" : card.tone === "you" ? "NOTE · YOU" : "DUEL"

  return (
    <div className="flex min-h-[112px] flex-col gap-1.5 rounded-[15px] border border-white/[0.08] bg-white/[0.08] p-[11px]">
      <div className="text-[8px] font-bold text-[#34d0bd]">{label}</div>
      <div className="text-[11px] font-bold text-white">
        {card.time} · {card.title}
      </div>
      <div className="text-[9px] font-medium leading-snug text-white/64">{card.note}</div>
    </div>
  )
}

function ClubMark({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 items-center justify-center rounded-full text-[7px] font-bold",
        muted ? "bg-white/10 text-white/55" : "bg-white/15 text-white/85",
      )}
    >
      {label}
    </span>
  )
}
