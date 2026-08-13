import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  askCeilingPoints,
  committedRecruits,
  currentRoster,
  depthTargets,
  phoenixFocusIds,
  type RosterPlayer,
} from "@/data/sidelineContext"

type DepthPerson = {
  id: string
  name: string
  rating: number
  kind: "selected" | "committed" | "roster" | "graduating"
  focus?: boolean
}

type DepthSlot = {
  id: string
  label: string
  players: DepthPerson[]
}

const FORMATIONS = ["4-3-3", "4-4-2", "3-5-2"] as const
const FOCUS = new Set<string>(phoenixFocusIds)

function shortName(name: string, id: string) {
  // Focus players: first name so they match the summary + ask chart labels
  if (FOCUS.has(id)) {
    return name.trim().split(/\s+/)[0] ?? name
  }
  const parts = name.trim().split(/\s+/)
  return parts[parts.length - 1] ?? name
}

function toPerson(
  p: RosterPlayer,
  kind: DepthPerson["kind"],
  ratingOverride?: number,
): DepthPerson {
  return {
    id: p.id,
    name: shortName(p.name, p.id),
    rating: ratingOverride ?? p.rating,
    kind,
    focus: FOCUS.has(p.id),
  }
}

/** Compact field depth chart matching the earlier screenshot aesthetic (1–5 scale). */
export function FieldDepthChart({ className }: { className?: string }) {
  const [formation, setFormation] =
    useState<(typeof FORMATIONS)[number]>("4-3-3")
  const [view, setView] = useState<"field" | "list">("field")

  const slots = slotsForFormation(formation)
  const selectedCount = depthTargets.length

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="text-[15px] font-semibold tracking-tight text-[#1d1d1f]">
            Depth chart · {formation}
          </h3>
          <p className="mt-0.5 text-[12px] text-[#6b7280]">
            {selectedCount} recruits selected · ranked by coach rating (1–5)
          </p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Segmented
          options={FORMATIONS.map((f) => ({ id: f, label: f }))}
          value={formation}
          onChange={(v) => setFormation(v as (typeof FORMATIONS)[number])}
        />
        <Segmented
          options={[
            { id: "field", label: "Field" },
            { id: "list", label: "List" },
          ]}
          value={view}
          onChange={(v) => setView(v as "field" | "list")}
        />
      </div>

      {view === "field" ? (
        <div className="relative mx-auto aspect-[3/4] w-full max-w-[480px] overflow-hidden rounded-2xl border border-[#c5d4bc] bg-[#d9e6d1] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
          <FieldLines />
          <div className="absolute inset-[3.5%] z-10">
            {/* Attack line — LW / ST / RW */}
            <PlacedSlot
              slot={slots.lw}
              className="absolute left-0 top-[2%] w-[31%]"
            />
            <PlacedSlot
              slot={slots.st}
              className="absolute left-1/2 top-[1%] w-[31%] -translate-x-1/2"
            />
            <PlacedSlot
              slot={slots.rw}
              className="absolute right-0 top-[2%] w-[31%]"
            />

            {/* Midfield — CM above DM */}
            <PlacedSlot
              slot={slots.cm}
              className="absolute left-[18%] top-[26%] w-[30%]"
            />
            <PlacedSlot
              slot={slots.dm}
              className="absolute right-[18%] top-[34%] w-[30%]"
            />

            {/* Back line — LB / CB / RB */}
            <PlacedSlot
              slot={slots.lb}
              className="absolute left-0 top-[54%] w-[31%]"
            />
            <PlacedSlot
              slot={slots.cb}
              className="absolute left-1/2 top-[52%] w-[32%] -translate-x-1/2"
            />
            <PlacedSlot
              slot={slots.rb}
              className="absolute right-0 top-[54%] w-[31%]"
            />

            {/* Keeper */}
            <PlacedSlot
              slot={slots.gk}
              className="absolute bottom-[1%] left-1/2 w-[34%] -translate-x-1/2"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-1.5 rounded-2xl border border-[#e5e7eb] bg-white p-2">
          {depthTargets.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-lg px-2.5 py-2 text-[12px]"
            >
              <span className="flex items-center gap-2">
                <StatusDot kind="selected" />
                <span
                  className={cn(
                    "font-medium text-[#1d1d1f]",
                    FOCUS.has(p.id) && "font-semibold",
                  )}
                >
                  {p.name}
                </span>
                <span className="text-[#8e8e93]">{p.pos}</span>
              </span>
              <span className="tabular-nums text-[#6b7280]">
                {p.rating.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-[#6b7280]">
        <LegendItem kind="selected" label="Selected recruit" />
        <LegendItem kind="committed" label="Committed recruit" />
        <LegendItem kind="roster" label="Current roster" />
        <LegendItem kind="graduating" label="Graduating Sr" />
      </div>
    </div>
  )
}

function slotsForFormation(
  formation: (typeof FORMATIONS)[number],
): Record<string, DepthSlot> {
  const nora = depthTargets.find((p) => p.id === "nora")!
  const avery = depthTargets.find((p) => p.id === "avery")!
  const taylor = depthTargets.find((p) => p.id === "taylor")!
  const sofia = depthTargets.find((p) => p.id === "sofia")!
  const elise = depthTargets.find((p) => p.id === "elise")!
  const samira = depthTargets.find((p) => p.id === "samira")!
  const park = committedRecruits.find((p) => p.id === "park")!
  const wells = committedRecruits.find((p) => p.id === "wells")!
  const holt = currentRoster.find((p) => p.id === "holt")!
  const kent = currentRoster.find((p) => p.id === "kent")!
  const keane = currentRoster.find((p) => p.id === "keane")!
  const alden = currentRoster.find((p) => p.id === "alden")!

  const rileyCeil = askCeilingPoints.find((p) => p.id === "riley")
  const harperCeil = askCeilingPoints.find((p) => p.id === "harper")

  // Shared pool; formation only reshuffles emphasis for the prototype
  const base = {
    st: {
      id: "st",
      label: "Striker",
      players: [toPerson(avery, "selected"), toPerson(samira, "selected")],
    },
    lw: {
      id: "lw",
      label: "Left Wing",
      players: [
        {
          id: "harper",
          name: "Quinn",
          rating: harperCeil?.ceiling ?? 2.8,
          kind: "selected" as const,
        },
        toPerson(wells, "committed"),
      ],
    },
    rw: {
      id: "rw",
      label: "Right Wing",
      players: [
        {
          id: "nina",
          name: "Okonkwo",
          rating: 3.5,
          kind: "selected" as const,
        },
      ],
    },
    cm: {
      id: "cm",
      label: "Center Mid",
      players: [
        toPerson(park, "committed"),
        {
          id: "riley",
          name: "Thompson",
          rating: rileyCeil?.ceiling ?? 3.2,
          kind: "selected" as const,
        },
      ],
    },
    dm: {
      id: "dm",
      label: "Def. Mid",
      players: [
        {
          id: "sam",
          name: "Rivera",
          rating: 3.8,
          kind: "selected" as const,
        },
        toPerson(holt, "roster"),
      ],
    },
    lb: {
      id: "lb",
      label: "Left Back",
      players: [toPerson(elise, "selected"), toPerson(kent, "graduating")],
    },
    cb: {
      id: "cb",
      label: "Center Back",
      players: [
        toPerson(sofia, "selected"),
        toPerson(holt, "roster"),
        {
          id: "camila",
          name: "Ruiz",
          rating: 3.6,
          kind: "selected" as const,
        },
        {
          id: "extra1",
          name: "Brooks",
          rating: 3.1,
          kind: "roster" as const,
        },
        {
          id: "extra2",
          name: "Patel",
          rating: 2.9,
          kind: "roster" as const,
        },
      ],
    },
    rb: {
      id: "rb",
      label: "Right Back",
      players: [toPerson(wells, "committed")],
    },
    gk: {
      id: "gk",
      label: "Goalkeeper",
      players: [
        toPerson(nora, "selected"),
        toPerson(taylor, "selected"),
        toPerson(keane, "roster"),
        toPerson(alden, "roster"),
      ],
    },
  }

  if (formation === "4-4-2") {
    return {
      ...base,
      st: {
        ...base.st,
        players: [
          ...base.st.players,
          { id: "second-st", name: "Haddad", rating: 4.5, kind: "selected" as const },
        ].slice(0, 3),
      },
      dm: { ...base.dm, label: "Center Mid" },
    }
  }

  if (formation === "3-5-2") {
    return {
      ...base,
      lb: { ...base.lb, label: "L Wing-Back" },
      rb: { ...base.rb, label: "R Wing-Back" },
      cm: {
        ...base.cm,
        players: [...base.cm.players, ...base.dm.players].slice(0, 3),
      },
    }
  }

  return base
}

function PlacedSlot({
  slot,
  className,
}: {
  slot: DepthSlot
  className?: string
}) {
  return (
    <div className={className}>
      <SlotCard slot={slot} />
    </div>
  )
}

function SlotCard({ slot }: { slot: DepthSlot }) {
  // Keep focus players visible even when a slot has more than 2 names
  const focusPlayers = slot.players.filter((p) => p.focus)
  const others = slot.players.filter((p) => !p.focus)
  const visible = [...focusPlayers, ...others].slice(0, 2)
  const overflow = Math.max(0, slot.players.length - visible.length)
  const hasSelected = slot.players.some((p) => p.kind === "selected")
  const hasFocus = slot.players.some((p) => p.focus)

  return (
    <div
      className={cn(
        "rounded-lg border bg-white/95 px-1.5 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.06)]",
        hasFocus
          ? "border-[#2f6bff] ring-1 ring-[#2f6bff]/25"
          : hasSelected
            ? "border-[#2f6bff]"
            : "border-black/8",
      )}
    >
      <div className="mb-0.5 text-[8px] font-medium uppercase tracking-[0.08em] text-[#8e8e93]">
        {slot.label}
      </div>
      <ul className="space-y-0.5">
        {visible.map((p) => (
          <li key={p.id} className="flex items-center gap-1 text-[10px] leading-tight">
            <StatusDot kind={p.kind} />
            <span
              className={cn(
                "min-w-0 flex-1 truncate",
                p.focus || p.kind === "selected"
                  ? "font-semibold text-[#1d1d1f]"
                  : p.kind === "graduating"
                    ? "text-[#a1a1a6]"
                    : "text-[#3a3a3c]",
              )}
            >
              {p.name}
            </span>
            <span className="shrink-0 tabular-nums text-[#6b7280]">
              {p.rating.toFixed(1)}
            </span>
          </li>
        ))}
      </ul>
      {overflow > 0 && (
        <div className="mt-0.5 text-[9px] text-[#8e8e93]">+{overflow} more</div>
      )}
    </div>
  )
}

function StatusDot({ kind }: { kind: DepthPerson["kind"] }) {
  return (
    <span
      className={cn(
        "h-1.5 w-1.5 shrink-0 rounded-full",
        kind === "selected" && "bg-[#2f6bff]",
        kind === "committed" && "bg-[#0d9488]",
        kind === "roster" && "bg-[#6b7280]",
        kind === "graduating" && "bg-[#d1d5db]",
      )}
      aria-hidden
    />
  )
}

function LegendItem({
  kind,
  label,
}: {
  kind: DepthPerson["kind"]
  label: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        kind === "graduating" && "text-[#a1a1a6]",
      )}
    >
      <StatusDot kind={kind} />
      {label}
    </span>
  )
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div className="inline-flex rounded-full bg-[#efefef] p-0.5">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onChange(opt.id)}
          className={cn(
            "pressable rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors duration-150",
            value === opt.id
              ? "bg-white text-[#1d1d1f] shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
              : "text-[#6b7280] hover:text-[#3a3a3c]",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function FieldLines() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
      viewBox="0 0 68 105"
      preserveAspectRatio="none"
      aria-hidden
    >
      <rect
        x="1.5"
        y="1.5"
        width="65"
        height="102"
        rx="2"
        fill="none"
        stroke="white"
        strokeWidth="0.7"
      />
      <line x1="1.5" y1="52.5" x2="66.5" y2="52.5" stroke="white" strokeWidth="0.55" />
      <circle cx="34" cy="52.5" r="9" fill="none" stroke="white" strokeWidth="0.55" />
      <circle cx="34" cy="52.5" r="0.8" fill="white" />
      {/* Top penalty (attack) */}
      <rect x="13" y="1.5" width="42" height="16" fill="none" stroke="white" strokeWidth="0.55" />
      <rect x="22" y="1.5" width="24" height="6" fill="none" stroke="white" strokeWidth="0.55" />
      {/* Bottom penalty (GK) */}
      <rect x="13" y="87.5" width="42" height="16" fill="none" stroke="white" strokeWidth="0.55" />
      <rect x="22" y="97.5" width="24" height="6" fill="none" stroke="white" strokeWidth="0.55" />
    </svg>
  )
}
