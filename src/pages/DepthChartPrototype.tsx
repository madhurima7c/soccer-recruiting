import { useEffect, useMemo, useRef, useState } from "react"
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Play,
  Share2,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  CLASS_YEARS,
  FORMATIONS,
  LIKELIHOOD_LABEL,
  LIKELIHOOD_MARK,
  LIKELIHOOD_SHORT,
  eligibleForSlot,
  getFormation,
  getLikelihood,
  players,
  type DepthPlayer,
  type Formation,
  type FormationId,
  type FormationSlot,
  type RecruitClassYear,
  type RecruitLikelihood,
} from "@/data/depthChart"

type ViewMode = "field" | "list"

export default function DepthChartPrototype() {
  const [year, setYear] = useState<RecruitClassYear>("2029")
  const [formationId, setFormationId] = useState<FormationId>("4-3-3")
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const view = new URLSearchParams(window.location.search).get("view")
    return view === "list" ? "list" : "field"
  })
  /** Coach overrides — otherwise highest-rated eligible wins */
  const [manualPicks, setManualPicks] = useState<Record<string, string>>({})
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null)
  /** Raise hovered card above neighbors so expand chevrons stay clickable */
  const [frontSlotId, setFrontSlotId] = useState<string | null>(null)
  const yearFormationRef = useRef({ year, formationId })
  const [shareOpen, setShareOpen] = useState(false)
  const [positionShare, setPositionShare] = useState<{
    slot: FormationSlot
    depth: DepthPlayer[]
  } | null>(null)
  /** Deep-link: open position share modal once slot depth is ready */
  const [pendingPositionShare, setPendingPositionShare] = useState<string | null>(
    null,
  )
  const [copied, setCopied] = useState(false)

  // Capture / deep-link: ?view=list|field&slot=<slotId>&formation=…&share=1&sharePosition=<slotId>
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const view = params.get("view")
    const slot = params.get("slot")
    const formation = params.get("formation")
    const share = params.get("share")
    const sharePosition = params.get("sharePosition")
    if (view === "list" || view === "field") setViewMode(view)
    if (slot) setActiveSlotId(slot)
    if (formation === "4-3-3" || formation === "4-4-2" || formation === "3-5-2") {
      setFormationId(formation)
    }
    if (share === "1" || share === "true") setShareOpen(true)
    if (sharePosition) setPendingPositionShare(sharePosition)
  }, [])

  const formation = useMemo(() => getFormation(formationId), [formationId])

  const yearPlayers = useMemo(
    () =>
      players
        .filter((p) => p.classYear === year)
        .sort((a, b) => b.coachRating - a.coachRating),
    [year],
  )

  /** Depth list + selected starter per formation slot */
  const slotState = useMemo(
    () => resolveSlotState(formation, yearPlayers, manualPicks),
    [formation, yearPlayers, manualPicks],
  )

  // Open single-position share once depth for that slot is resolved
  useEffect(() => {
    if (!pendingPositionShare) return
    const slot = formation.slots.find((s) => s.id === pendingPositionShare)
    const depth = slotState[pendingPositionShare]?.depth
    if (!slot || !depth) return
    setPositionShare({ slot, depth })
    setPendingPositionShare(null)
  }, [pendingPositionShare, formation.slots, slotState])

  const selectedCount = useMemo(
    () => Object.values(slotState).filter((s) => s.selected).length,
    [slotState],
  )

  const proposedLineup = useMemo(() => {
    return formation.slots
      .map((slot) => {
        const selected = slotState[slot.id]?.selected
        return selected ? { slot, player: selected } : null
      })
      .filter(Boolean) as { slot: FormationSlot; player: DepthPlayer }[]
  }, [formation, slotState])

  const lineupText = useMemo(
    () => buildLineupExport(year, formation, proposedLineup, manualPicks),
    [year, formation, proposedLineup, manualPicks],
  )

  // Reset overrides when class year or formation changes (not on initial mount)
  useEffect(() => {
    const prev = yearFormationRef.current
    if (prev.year === year && prev.formationId === formationId) return
    yearFormationRef.current = { year, formationId }
    setManualPicks({})
    setActiveSlotId(null)
  }, [year, formationId])

  useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(t)
  }, [copied])

  // Clearer Figma frame names when capturing an expanded position
  useEffect(() => {
    const slot = formation.slots.find((s) => s.id === activeSlotId)
    if (slot && viewMode === "field") {
      document.title = `Field · #${slot.positionNumber} ${slot.abbrev} open`
    } else if (viewMode === "list") {
      document.title = "List · Depth by position"
    } else {
      document.title = "Field · Depth chart"
    }
  }, [activeSlotId, formation.slots, viewMode])

  function selectPlayer(slotId: string, playerId: string) {
    const depth = slotState[slotId]?.depth ?? []
    const autoTop = depth[0]
    setActiveSlotId(slotId)
    setManualPicks((prev) => {
      const next = { ...prev }
      // Tapping the auto #1 clears the override
      if (autoTop && playerId === autoTop.id) {
        delete next[slotId]
      } else {
        next[slotId] = playerId
      }
      return next
    })
  }

  const positionShareText = useMemo(() => {
    if (!positionShare) return ""
    return buildPositionExport(year, formationId, positionShare.slot, positionShare.depth)
  }, [positionShare, year, formationId])

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
      setCopied(true)
    }
  }

  async function copyLineup() {
    await copyText(lineupText)
  }

  function downloadText(text: string, filename: string) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  function downloadLineup() {
    downloadText(lineupText, `washington-wsoc-lineup-${year}-${formationId}.txt`)
  }

  async function nativeShareText(title: string, text: string) {
    if (!navigator.share) {
      setShareOpen(true)
      return
    }
    try {
      await navigator.share({ title, text })
    } catch {
      /* cancelled */
    }
  }

  async function nativeShare() {
    await nativeShareText(
      `UW WSOC · Class of ${year} · ${formationId}`,
      lineupText,
    )
  }

  function openPositionShare(slot: FormationSlot, depth: DepthPlayer[]) {
    setPositionShare({ slot, depth })
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white text-[#1a1c19]">
      <header className="shrink-0 border-b border-black/[0.06] bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex w-full max-w-[1140px] items-start justify-between gap-4">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight text-[#1a1c19]">
              Top Recruits by Class Year
            </h1>
            <p className="mt-0.5 text-[13px] text-[#7a8174]">
              {selectedCount} positions filled · ranked by coach rating · tap to
              override
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="pressable inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white px-3.5 py-2 text-[13px] font-medium text-[#1a1c19] hover:bg-[#f7f7f7]"
            >
              <Share2 className="size-3.5" strokeWidth={2} />
              Share lineup
            </button>
            <button
              type="button"
              onClick={downloadLineup}
              className="pressable inline-flex items-center gap-1.5 rounded-full bg-[#1a1c19] px-3.5 py-2 text-[13px] font-medium text-white"
            >
              <Download className="size-3.5" strokeWidth={2} />
              Export
            </button>
          </div>
        </div>

        <div className="mx-auto mt-3 flex w-full max-w-[1140px] flex-wrap items-center gap-3">
          <YearSelect value={year} onChange={setYear} />
          <FormationPills value={formationId} onChange={setFormationId} />
          <ViewToggle value={viewMode} onChange={setViewMode} />
          <LikelihoodLegend />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-auto bg-white px-4 py-4 sm:px-6">
        {viewMode === "list" ? (
          <ListView
            year={year}
            formation={formation}
            slotState={slotState}
            activeSlotId={activeSlotId}
            onSelect={selectPlayer}
            onFocusSlot={setActiveSlotId}
            onSharePosition={openPositionShare}
          />
        ) : (
          <div className="mx-auto flex h-full w-full max-w-[1140px] items-center justify-center">
            {/*
              Attack-at-top depth chart. Slightly wider than 5∶6 for card label room.
              Border lives on an inner shell so aspect-ratio isn’t skewed (keeps circle round).
            */}
            <div
              className="relative max-h-full max-w-full overflow-visible"
              style={{ aspectRatio: "6 / 7", height: "100%", width: "auto" }}
            >
              {/* No HTML green fill — rounded SVG rect is the only pitch surface,
                  so square element corners stay transparent and don’t poke past the radius. */}
              <div className="pointer-events-none absolute inset-0">
                <FieldMarkings />
              </div>
              <div className="absolute inset-0 overflow-visible">
                <div className="absolute inset-[2%] top-[3%] z-10 overflow-visible">
                  {formation.slots.map((slot, i) => {
                    const state = slotState[slot.id]
                    const depth = state?.depth ?? []
                    const selectedId = state?.selected?.id ?? null
                    const isManual = Boolean(manualPicks[slot.id])
                    const expanded = activeSlotId === slot.id
                    const inFront = frontSlotId === slot.id

                    return (
                      <div
                        key={slot.id}
                        className="absolute"
                        style={{
                          left: slot.left,
                          top: slot.top,
                          width: expanded ? "34%" : slot.width,
                          minWidth: expanded ? 220 : undefined,
                          zIndex: expanded ? 80 : inFront ? 40 : 10 + i,
                          // While one card is open, siblings must not steal row clicks
                          pointerEvents:
                            activeSlotId && !expanded ? "none" : "auto",
                        }}
                        onPointerEnter={() => {
                          if (!activeSlotId) setFrontSlotId(slot.id)
                        }}
                      >
                        <PositionCard
                          slot={slot}
                          depth={depth}
                          selectedId={selectedId}
                          isManual={isManual}
                          expanded={expanded}
                          onToggle={() =>
                            setActiveSlotId((id) =>
                              id === slot.id ? null : slot.id,
                            )
                          }
                          onSelect={(playerId) =>
                            selectPlayer(slot.id, playerId)
                          }
                          onShare={() => openPositionShare(slot, depth)}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {shareOpen && (
        <ShareModal
          title="Share proposed lineup"
          subtitle={`Class of ${year} · ${formationId} · ${proposedLineup.length} spots`}
          text={lineupText}
          copied={copied}
          onCopy={copyLineup}
          onDownload={downloadLineup}
          onNativeShare={nativeShare}
          onClose={() => setShareOpen(false)}
        />
      )}

      {positionShare && (
        <ShareModal
          title={`Share ${positionShare.slot.label}`}
          subtitle={`Class of ${year} · #${positionShare.slot.positionNumber} ${positionShare.slot.abbrev} · ${positionShare.depth.length} recruits`}
          text={positionShareText}
          copied={copied}
          onCopy={() => copyText(positionShareText)}
          onDownload={() =>
            downloadText(
              positionShareText,
              `washington-wsoc-${year}-${positionShare.slot.abbrev}.txt`,
            )
          }
          onNativeShare={() =>
            nativeShareText(
              `UW WSOC · ${positionShare.slot.label} · ${year}`,
              positionShareText,
            )
          }
          onClose={() => setPositionShare(null)}
        />
      )}

      {copied && !shareOpen && !positionShare && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#1a1c19] px-4 py-2 text-[13px] font-medium text-white shadow-lg">
          Copied
        </div>
      )}
    </div>
  )
}

/**
 * Auto-pick highest-rated eligible recruit per slot.
 * Manual overrides win; a player can only start in one slot.
 */
function resolveSlotState(
  formation: Formation,
  yearPlayers: DepthPlayer[],
  manualPicks: Record<string, string>,
) {
  const claimed = new Set<string>()
  const result: Record<
    string,
    { depth: DepthPlayer[]; selected: DepthPlayer | null }
  > = {}

  // Honor manual picks first (formation order)
  for (const slot of formation.slots) {
    const depth = eligibleForSlot(yearPlayers, slot)
    const overrideId = manualPicks[slot.id]
    const override = overrideId
      ? depth.find((p) => p.id === overrideId)
      : undefined
    if (override && !claimed.has(override.id)) {
      claimed.add(override.id)
      result[slot.id] = { depth, selected: override }
    } else {
      result[slot.id] = { depth, selected: null }
    }
  }

  // Fill remaining with highest-rated unclaimed
  for (const slot of formation.slots) {
    if (result[slot.id].selected) continue
    const pick =
      result[slot.id].depth.find((p) => !claimed.has(p.id)) ?? null
    if (pick) claimed.add(pick.id)
    result[slot.id] = { ...result[slot.id], selected: pick }
  }

  return result
}

function YearSelect({
  value,
  onChange,
}: {
  value: RecruitClassYear
  onChange: (y: RecruitClassYear) => void
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onDoc)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative z-30 inline-flex">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="pressable inline-flex items-center gap-1.5 rounded-lg bg-[#f0f0f0] p-0.5"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Class year"
      >
        <span className="inline-flex items-center gap-1.5 rounded-md bg-[#1a1c19] py-1.5 pl-3 pr-2.5 text-[12px] font-semibold text-white">
          Class of {value}
          <ChevronDown
            className={cn(
              "size-3.5 text-white/80 transition-transform duration-150",
              open && "rotate-180",
            )}
            strokeWidth={2.5}
            aria-hidden
          />
        </span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute left-0 top-[calc(100%+4px)] z-50 min-w-full overflow-hidden rounded-lg border border-black/10 bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          {CLASS_YEARS.map((y) => (
            <li key={y} role="option" aria-selected={y === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(y)
                  setOpen(false)
                }}
                className={cn(
                  "pressable flex w-full items-center px-3 py-2 text-left text-[12px] font-semibold",
                  y === value
                    ? "bg-[#1a1c19] text-white"
                    : "text-[#1a1c19] hover:bg-[#f5f5f5]",
                )}
              >
                Class of {y}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FormationPills({
  value,
  onChange,
}: {
  value: FormationId
  onChange: (id: FormationId) => void
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-[#f0f0f0] p-0.5">
      {FORMATIONS.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onChange(f.id)}
          className={cn(
            "pressable rounded-md px-3 py-1.5 text-[12px] font-semibold tabular-nums transition-colors duration-150",
            value === f.id
              ? "bg-[#1a1c19] text-white"
              : "text-[#6b7168] hover:text-[#1a1c19]",
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}

function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode
  onChange: (v: ViewMode) => void
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-[#f0f0f0] p-0.5">
      {(["field", "list"] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={cn(
            "pressable rounded-md px-3 py-1.5 text-[12px] font-semibold capitalize transition-colors duration-150",
            value === mode
              ? "bg-[#1a1c19] text-white"
              : "text-[#6b7168] hover:text-[#1a1c19]",
          )}
        >
          {mode}
        </button>
      ))}
    </div>
  )
}

/** Collapsed preview + Notion-style depth table on expand */
function PositionCard({
  slot,
  depth,
  selectedId,
  isManual,
  expanded,
  onToggle,
  onSelect,
  onShare,
}: {
  slot: FormationSlot
  depth: DepthPlayer[]
  selectedId: string | null
  isManual: boolean
  expanded: boolean
  onToggle: () => void
  onSelect: (playerId: string) => void
  onShare: () => void
}) {
  const selected = depth.find((p) => p.id === selectedId) ?? null
  const depthCount = Math.max(0, depth.length - 1)

  return (
    <div
      className={cn(
        "rounded-[8px] border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-[box-shadow,border-color] duration-150",
        expanded
          ? "overflow-visible shadow-[0_6px_20px_rgba(0,0,0,0.1)]"
          : "overflow-hidden",
        isManual ? "border-[#3D7A4A]" : "border-black/10",
      )}
    >
      <div className="flex items-center gap-0.5 border-b border-black/[0.06] px-1 py-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
          className="pressable flex min-w-0 flex-1 items-center gap-0.5 text-left"
          aria-expanded={expanded}
        >
          <span className="flex items-center gap-0.5 whitespace-nowrap text-[10px] font-bold uppercase leading-none tracking-[0.02em] text-[#111827]">
            <span className="shrink-0 tabular-nums">#{slot.positionNumber}</span>
            <span className="shrink-0 font-bold text-[#6B7280]">·</span>
            <span className="shrink-0">{slot.abbrev}</span>
            {depthCount > 0 && !expanded && (
              <span className="shrink-0 text-[8px] font-semibold normal-case tracking-normal text-[#9CA3AF]">
                +{depthCount}
              </span>
            )}
          </span>
        </button>

        {depth.length > 0 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onShare()
            }}
            className="pressable inline-flex size-4 shrink-0 items-center justify-center self-center rounded text-[#9CA3AF] hover:bg-black/[0.05] hover:text-[#3D7A4A]"
            aria-label={`Share ${slot.label} recruits`}
            title="Share position list"
          >
            <Share2 className="size-2.5" strokeWidth={2.25} />
          </button>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
          }}
          className={cn(
            "pressable relative z-10 inline-flex size-4 shrink-0 items-center justify-center self-center rounded transition-colors duration-150",
            expanded
              ? "bg-[#3D7A4A] text-white"
              : "bg-[#ececec] text-[#3a3a3c] ring-1 ring-black/10 hover:bg-[#3D7A4A] hover:text-white hover:ring-[#3D7A4A]",
          )}
          aria-label={expanded ? "Collapse depth" : "Expand depth"}
          aria-expanded={expanded}
        >
          {expanded ? (
            <ChevronUp className="size-2.5" strokeWidth={2.75} />
          ) : (
            <ChevronDown className="size-2.5" strokeWidth={2.75} />
          )}
        </button>
      </div>

      {!expanded && selected && (
        <div className="flex items-center px-1 py-1">
          <div className="flex min-w-0 flex-1 items-center gap-1 rounded-[5px] border border-[#3D7A4A] bg-[#3D7A4A]/[0.03] px-1 py-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggle()
              }}
              className="pressable flex min-w-0 flex-1 items-center gap-1 text-left"
            >
              <LikelihoodMark player={selected} size="sm" />
              <PlayerPhoto
                id={selected.id}
                name={selected.lastName}
                hue={selected.hue}
                size={14}
              />
              <span className="flex min-w-0 flex-1 items-center gap-0.5 overflow-hidden">
                <span className="shrink-0 whitespace-nowrap text-[10px] leading-none text-[#1F2937]">
                  <JerseyNumber n={selected.clubNumber} />
                </span>
                <span className="min-w-0 truncate text-[10px] font-semibold leading-none text-[#1F2937]">
                  {displayLast(selected)}
                </span>
                <span className="shrink-0 whitespace-nowrap text-[10px] font-semibold leading-none tabular-nums text-[#3D7A4A]">
                  {formatRating(selected.coachRating)}★
                </span>
              </span>
            </button>
          </div>
        </div>
      )}

      {!expanded && !selected && (
        <div className="flex items-center px-2 py-1.5 text-[10px] leading-none text-[#9CA3AF]">
          No recruits
        </div>
      )}

      {expanded && (
        <div className="overflow-hidden rounded-b-[8px] bg-white">
          <NotionPlayerTable
            players={depth}
            selectedId={selectedId}
            compact
            onSelect={onSelect}
          />
        </div>
      )}
    </div>
  )
}

/** Notion database–style rows — tap a row to start that recruit */
function NotionPlayerTable({
  players,
  selectedId,
  compact,
  onSelect,
}: {
  players: DepthPlayer[]
  selectedId: string | null
  compact?: boolean
  onSelect: (playerId: string) => void
}) {
  if (players.length === 0) {
    return (
      <div className="px-2 py-3 text-[11px] text-[#9B9A97]">
        No eligible recruits
      </div>
    )
  }

  return (
    <div className="border-t border-black/[0.06]">
      <div
        className={cn(
          "flex items-center justify-between gap-2 border-b border-black/[0.06] bg-[#fbfbfa] px-1.5 text-[10px] font-medium leading-none text-[#9B9A97]",
          compact ? "py-1.5" : "py-2",
        )}
      >
        <span>Tap a name to start</span>
        <span className="tabular-nums">{players.length}</span>
      </div>

      <ul role="listbox" aria-label="Eligible recruits">
        {players.map((player) => {
          const selected = player.id === selectedId
          return (
            <li key={player.id} role="option" aria-selected={selected}>
              <div
                className={cn(
                  "grid items-center gap-1 border-b border-black/[0.04] px-1.5 transition-colors duration-100 last:border-b-0",
                  compact
                    ? "grid-cols-[minmax(0,1fr)_auto] py-1"
                    : "grid-cols-[minmax(0,1fr)_auto] py-1.5",
                  selected
                    ? "bg-[#3D7A4A]/12"
                    : "hover:bg-[#f5f5f5]",
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelect(player.id)}
                  className="pressable flex min-w-0 items-center gap-1.5 self-center py-0.5 text-left"
                  aria-pressed={selected}
                >
                  <span
                    className={cn(
                      "inline-flex size-3.5 shrink-0 items-center justify-center rounded-full border transition-colors duration-100",
                      selected
                        ? "border-[#3D7A4A] bg-[#3D7A4A] text-white"
                        : "border-[#C4C4C0] bg-white text-transparent",
                    )}
                    aria-hidden
                  >
                    <Check className="size-2.5" strokeWidth={3} />
                  </span>
                  <LikelihoodMark player={player} size={compact ? "sm" : "md"} />
                  <PlayerPhoto
                    id={player.id}
                    name={player.lastName}
                    hue={player.hue}
                    size={compact ? 18 : 22}
                  />
                  <span className="min-w-0 flex-1 truncate">
                    <span
                      className={cn(
                        "leading-none text-[#37352F]",
                        compact ? "text-[11px]" : "text-[13px]",
                        selected ? "font-semibold" : "font-medium",
                      )}
                    >
                      <JerseyNumber n={player.clubNumber} />
                      {displayLast(player)}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block truncate leading-none text-[#787774]",
                        compact ? "text-[9px]" : "text-[11px]",
                      )}
                    >
                      {formatRating(player.coachRating)}★
                      <span className="mx-1 text-[#C4C4C0]">·</span>
                      {compact ? shortClub(player.club) : player.club}
                    </span>
                  </span>
                  {selected && (
                    <span className="shrink-0 rounded px-1 py-0.5 text-[9px] font-semibold uppercase tracking-[0.04em] text-[#3D7A4A]">
                      Start
                    </span>
                  )}
                </button>
                <div className="flex items-center self-center pl-0.5">
                  <HighlightsLink
                    href={player.highlightsUrl}
                    name={displayLast(player)}
                    size={compact ? "sm" : "md"}
                  />
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function ListView({
  year,
  formation,
  slotState,
  activeSlotId,
  onSelect,
  onFocusSlot,
  onSharePosition,
}: {
  year: RecruitClassYear
  formation: Formation
  slotState: Record<
    string,
    { depth: DepthPlayer[]; selected: DepthPlayer | null }
  >
  activeSlotId: string | null
  onSelect: (slotId: string, playerId: string) => void
  onFocusSlot: (slotId: string) => void
  onSharePosition: (slot: FormationSlot, depth: DepthPlayer[]) => void
}) {
  return (
    <div className="mx-auto h-full max-w-[1140px] overflow-auto rounded-[12px] border border-black/8 bg-white p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      <div className="mb-3 flex items-baseline justify-between gap-2 px-1">
        <p className="text-[13px] text-[#787774]">
          Class of {year} · {formation.label} · Notion-style board
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {formation.slots.map((slot) => {
          const state = slotState[slot.id]
          const depth = state?.depth ?? []
          const selectedId = state?.selected?.id ?? null
          const active = activeSlotId === slot.id

          return (
            <section
              key={slot.id}
              className={cn(
                "overflow-hidden rounded-[8px] border bg-white transition-colors duration-150",
                active ? "border-[#3D7A4A]" : "border-black/8",
              )}
              onClick={() => onFocusSlot(slot.id)}
            >
              <div className="flex items-center gap-2 border-b border-black/[0.06] px-2.5 py-2">
                <span className="inline-flex size-5 items-center justify-center rounded bg-[#3D7A4A]/12 text-[10px] font-bold tabular-nums text-[#3D7A4A]">
                  {slot.positionNumber}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-[#37352F]">
                    {slot.abbrev}
                    <span className="ml-1.5 text-[12px] font-normal text-[#9B9A97]">
                      {slot.label}
                    </span>
                  </div>
                </div>
                <span className="text-[11px] tabular-nums text-[#9B9A97]">
                  {depth.length}
                </span>
                {depth.length > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSharePosition(slot, depth)
                    }}
                    className="pressable inline-flex size-7 items-center justify-center rounded-md text-[#9B9A97] hover:bg-[#f7f6f3] hover:text-[#3D7A4A]"
                    aria-label={`Share ${slot.label}`}
                    title="Share position list"
                  >
                    <Share2 className="size-3.5" strokeWidth={2} />
                  </button>
                )}
              </div>

              <NotionPlayerTable
                players={depth}
                selectedId={selectedId}
                onSelect={(playerId) => onSelect(slot.id, playerId)}
              />
            </section>
          )
        })}
      </div>
    </div>
  )
}

function displayLast(player: DepthPlayer) {
  if (player.firstName === "N.") return `${player.lastName} N.`
  return player.lastName
}

function formatRating(rating: number) {
  return Number.isInteger(rating) ? `${rating}.0` : rating.toFixed(1)
}

function JerseyNumber({ n }: { n: number }) {
  if (!n) return null
  return (
    <span className="mr-1 inline-block font-bold leading-none tabular-nums text-[#111827]">
      #{n}
    </span>
  )
}

/** Play control for highlight reels — icon only, muted so rating stays primary */
function HighlightsLink({
  href,
  name,
  size = "md",
}: {
  href: string
  name: string
  size?: "sm" | "md"
}) {
  return (
    <a
      href={href}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "pressable inline-flex shrink-0 items-center justify-center self-center rounded-full bg-[#D1D5DB] text-[#4B5563] transition-colors duration-150 hover:bg-[#9CA3AF] hover:text-white",
        size === "sm" ? "size-5" : "size-6",
      )}
      aria-label={`Watch highlight reel for ${name}`}
      title="Watch highlight reel"
    >
      <Play
        className={cn(
          size === "sm" ? "size-2" : "size-2.5",
          "fill-current",
        )}
        strokeWidth={0}
      />
    </a>
  )
}

function LikelihoodMark({
  player,
  size = "sm",
}: {
  player: DepthPlayer
  size?: "sm" | "md"
}) {
  const likelihood = getLikelihood(player)
  const label = LIKELIHOOD_LABEL[likelihood]
  const short = LIKELIHOOD_SHORT[likelihood]

  return (
    <>
      <span className="sr-only">{label}. </span>
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-[3px] font-bold leading-none tabular-nums",
          size === "sm" ? "size-3.5 text-[9px]" : "size-4 text-[10px]",
        )}
        style={{
          color: LIKELIHOOD_MARK.color,
          backgroundColor: LIKELIHOOD_MARK.background,
          boxShadow: `inset 0 0 0 1px ${LIKELIHOOD_MARK.border}`,
        }}
        title={label}
        aria-hidden
      >
        {short}
      </span>
    </>
  )
}

function LikelihoodLegend() {
  const items: RecruitLikelihood[] = ["committed", "interested", "limited"]
  return (
    <div
      className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#6b7168]"
      role="group"
      aria-label="Recruit likelihood key"
    >
      {items.map((key) => (
        <span key={key} className="inline-flex items-center gap-1.5">
          <span
            className="inline-flex size-3.5 items-center justify-center rounded-[3px] text-[9px] font-bold leading-none"
            style={{
              color: LIKELIHOOD_MARK.color,
              backgroundColor: LIKELIHOOD_MARK.background,
              boxShadow: `inset 0 0 0 1px ${LIKELIHOOD_MARK.border}`,
            }}
            aria-hidden
          >
            {LIKELIHOOD_SHORT[key]}
          </span>
          <span>{LIKELIHOOD_LABEL[key]}</span>
        </span>
      ))}
    </div>
  )
}

function shortClub(club: string) {
  return club
    .replace("Bay Area", "Bay")
    .replace("San Diego", "SD")
    .replace("Charlotte", "CLT")
    .replace("Portland", "PDX")
    .replace("Chicago", "CHI")
    .replace("Atlanta", "ATL")
    .replace("Phoenix", "PHX")
    .replace("Dallas", "DAL")
    .replace("Denver", "DEN")
    .replace("Boston", "BOS")
    .replace("Seattle", "SEA")
    .replace("Premier", "Prem")
    .replace("United", "Utd")
}

function buildLineupExport(
  year: RecruitClassYear,
  formation: Formation,
  lineup: { slot: FormationSlot; player: DepthPlayer }[],
  manualPicks: Record<string, string>,
) {
  const lines = [
    `Washington Women's Soccer · Recruiting`,
    `Proposed lineup · Class of ${year} · ${formation.label}`,
    `Generated ${new Date().toLocaleDateString()}`,
    ``,
    `STARTING XI (auto highest-rated · coach overrides marked *)`,
    `────────────────────────────────────────`,
  ]
  for (const { slot, player } of lineup) {
    const star = manualPicks[slot.id] ? "*" : " "
    lines.push(
      `${star}#${slot.positionNumber} ${slot.abbrev.padEnd(3)}  ${player.lastName.padEnd(14)}  ${formatRating(player.coachRating)}★  ${LIKELIHOOD_LABEL[getLikelihood(player)].padEnd(10)}  ${player.club} #${player.clubNumber}`,
    )
  }
  const empty = formation.slots.filter(
    (s) => !lineup.some((l) => l.slot.id === s.id),
  )
  if (empty.length) {
    lines.push(``)
    lines.push(`OPEN SPOTS`)
    lines.push(`────────────────────────────────────────`)
    for (const s of empty) {
      lines.push(`#${s.positionNumber} ${s.abbrev} — no eligible recruit`)
    }
  }
  lines.push(``)
  lines.push(`Share with staff · Washington WSOC recruiting board`)
  return lines.join("\n")
}

function buildPositionExport(
  year: RecruitClassYear,
  formationId: FormationId,
  slot: FormationSlot,
  depth: DepthPlayer[],
) {
  const lines = [
    `Washington Women's Soccer · Recruiting`,
    `Top recruits · #${slot.positionNumber} ${slot.abbrev} ${slot.label}`,
    `Class of ${year} · ${formationId}`,
    `Generated ${new Date().toLocaleDateString()}`,
    ``,
    `RANKED BY COACH RATING`,
    `────────────────────────────────────────`,
  ]
  depth.forEach((player, i) => {
    lines.push(
      `${String(i + 1).padStart(2)}.  #${String(player.clubNumber).padEnd(3)} ${player.lastName.padEnd(14)}  ${formatRating(player.coachRating)}★  ${LIKELIHOOD_LABEL[getLikelihood(player)].padEnd(10)}  ${player.club}`,
    )
  })
  if (depth.length === 0) {
    lines.push(`(no eligible recruits this class year)`)
  }
  lines.push(``)
  lines.push(`Share with staff · Washington WSOC recruiting board`)
  return lines.join("\n")
}

function ShareModal({
  title,
  subtitle,
  text,
  copied,
  onCopy,
  onDownload,
  onNativeShare,
  onClose,
}: {
  title: string
  subtitle: string
  text: string
  copied: boolean
  onCopy: () => void
  onDownload: () => void
  onNativeShare: () => void
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2
              id="share-modal-title"
              className="text-[17px] font-semibold tracking-tight text-[#1a1c19]"
            >
              {title}
            </h2>
            <p className="mt-0.5 text-[13px] text-[#7a8174]">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="pressable rounded-full p-1.5 text-[#9CA3AF] hover:bg-black/5 hover:text-[#1a1c19]"
            aria-label="Close"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>

        <div className="mb-4 max-h-[220px] overflow-auto rounded-xl bg-[#f5f5f5] p-3 font-mono text-[11px] leading-relaxed text-[#3a3a3c]">
          <pre className="whitespace-pre-wrap">{text}</pre>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="pressable inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#3d7a4a] px-4 py-2.5 text-[13px] font-medium text-white"
          >
            {copied ? (
              <>
                <Check className="size-3.5" strokeWidth={2.5} />
                Copied for staff chat
              </>
            ) : (
              <>
                <Copy className="size-3.5" strokeWidth={2} />
                Copy to clipboard
              </>
            )}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onDownload}
              className="pressable inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-2.5 text-[13px] font-medium text-[#1a1c19]"
            >
              <Download className="size-3.5" strokeWidth={2} />
              Download .txt
            </button>
            <button
              type="button"
              onClick={onNativeShare}
              className="pressable inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-black/10 bg-white px-3 py-2.5 text-[13px] font-medium text-[#1a1c19]"
            >
              <Share2 className="size-3.5" strokeWidth={2} />
              Device share
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const FEMALE_PLAYER_PHOTOS = [
  "https://randomuser.me/api/portraits/women/12.jpg",
  "https://randomuser.me/api/portraits/women/24.jpg",
  "https://randomuser.me/api/portraits/women/33.jpg",
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/women/47.jpg",
  "https://randomuser.me/api/portraits/women/52.jpg",
  "https://randomuser.me/api/portraits/women/65.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/women/72.jpg",
  "https://randomuser.me/api/portraits/women/79.jpg",
  "https://randomuser.me/api/portraits/women/85.jpg",
  "https://randomuser.me/api/portraits/women/90.jpg",
  "https://randomuser.me/api/portraits/women/8.jpg",
  "https://randomuser.me/api/portraits/women/17.jpg",
  "https://randomuser.me/api/portraits/women/21.jpg",
  "https://randomuser.me/api/portraits/women/29.jpg",
  "https://randomuser.me/api/portraits/women/36.jpg",
  "https://randomuser.me/api/portraits/women/41.jpg",
  "https://randomuser.me/api/portraits/women/56.jpg",
  "https://randomuser.me/api/portraits/women/63.jpg",
  "https://randomuser.me/api/portraits/women/11.jpg",
  "https://randomuser.me/api/portraits/women/19.jpg",
  "https://randomuser.me/api/portraits/women/26.jpg",
  "https://randomuser.me/api/portraits/women/31.jpg",
  "https://randomuser.me/api/portraits/women/38.jpg",
  "https://randomuser.me/api/portraits/women/45.jpg",
  "https://randomuser.me/api/portraits/women/50.jpg",
  "https://randomuser.me/api/portraits/women/58.jpg",
  "https://randomuser.me/api/portraits/women/61.jpg",
  "https://randomuser.me/api/portraits/women/74.jpg",
  "https://randomuser.me/api/portraits/women/81.jpg",
  "https://randomuser.me/api/portraits/women/88.jpg",
]

function photoUrlFor(id: string) {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return FEMALE_PLAYER_PHOTOS[hash % FEMALE_PLAYER_PHOTOS.length]
}

function PlayerPhoto({
  id,
  name,
  hue,
  size,
}: {
  id: string
  name: string
  hue: number
  size: number
}) {
  return (
    <span
      className="relative inline-block shrink-0 overflow-hidden rounded-full bg-[#E5E7EB] ring-1 ring-black/5"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <img
        src={photoUrlFor(id)}
        alt=""
        width={size}
        height={size}
        className="size-full object-cover"
        onError={(e) => {
          const el = e.currentTarget
          el.style.display = "none"
          const fallback = el.nextElementSibling as HTMLElement | null
          if (fallback) fallback.style.display = "flex"
        }}
      />
      <span
        className="absolute inset-0 hidden items-center justify-center font-semibold text-white/95"
        style={{
          fontSize: Math.max(9, size * 0.36),
          background: `linear-gradient(145deg, hsl(${hue} 42% 52%), hsl(${hue} 38% 38%))`,
        }}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    </span>
  )
}

function FieldMarkings() {
  // Portrait pitch: viewBox width:height = 6:7 (matches container aspect).
  // preserveAspectRatio meet keeps x/y units equal → center circle stays circular.
  // Corner radius ~16px on a ~540px-wide pitch → ~1.8 viewBox units.
  const stroke = "rgba(255,255,255,0.78)"
  const frame = "#D5DDD0"
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 60 70"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {/* Rounded fill + frame — only painted pixels; outside radius is transparent */}
      <rect
        x="0.35"
        y="0.35"
        width="59.3"
        height="69.3"
        rx="1.8"
        ry="1.8"
        fill="#E5EDE4"
        stroke={frame}
        strokeWidth="0.7"
      />
      <rect
        x="1.6"
        y="1.6"
        width="56.8"
        height="66.8"
        rx="1.1"
        fill="none"
        stroke={stroke}
        strokeWidth="0.3"
      />
      <line
        x1="1.6"
        y1="35"
        x2="58.4"
        y2="35"
        stroke={stroke}
        strokeWidth="0.24"
      />
      <circle
        cx="30"
        cy="35"
        r="6.2"
        fill="none"
        stroke={stroke}
        strokeWidth="0.24"
      />
      <circle cx="30" cy="35" r="0.4" fill={stroke} />
      {/* Attacking third (top) */}
      <rect
        x="10"
        y="1.6"
        width="40"
        height="10.5"
        fill="none"
        stroke={stroke}
        strokeWidth="0.24"
      />
      <rect
        x="16.5"
        y="1.6"
        width="27"
        height="4.2"
        fill="none"
        stroke={stroke}
        strokeWidth="0.24"
      />
      {/* Defending third (bottom) */}
      <rect
        x="10"
        y="57.9"
        width="40"
        height="10.5"
        fill="none"
        stroke={stroke}
        strokeWidth="0.24"
      />
      <rect
        x="16.5"
        y="64.2"
        width="27"
        height="4.2"
        fill="none"
        stroke={stroke}
        strokeWidth="0.24"
      />
    </svg>
  )
}
