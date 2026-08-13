import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Maximize2, Minimize2, X } from "lucide-react"
import { ComparisonPanel } from "./ComparisonPanel"
import { DepthChart } from "./DepthChart"
import { FieldDepthChart } from "./FieldDepthChart"
import { AskCeilingChart } from "./AskCeilingChart"
import { SoccerBallIcon } from "./SoccerBallIcon"
import { cn } from "@/lib/utils"

type SidePanelProps = {
  open: boolean
  expanded: boolean
  selectedScenario: string
  onSelectScenario: (id: string) => void
  onExpand: () => void
  onCollapse: () => void
  onClose: () => void
  /** Override stacking when used on the desktop prototype */
  zIndex?: number
  title?: string
  subtitle?: string
  promptEyebrow?: string
  promptBody?: string
  promptChips?: string[]
  expandLabel?: string
  expandHint?: string
  /** When true, expand uses onExpand only (no ComparisonPanel shell) */
  expandOpensFullTool?: boolean
  /** Desktop: field depth + ask/ceiling, no bottom expand CTA */
  desktopSummary?: boolean
  highlightIds?: string[]
  showExpandButton?: boolean
}

export function SidePanel({
  open,
  expanded,
  selectedScenario,
  onSelectScenario,
  onExpand,
  onCollapse,
  onClose,
  zIndex = 40,
  title = "Recruiting assistant",
  subtitle = "Columbia WSOC · values loaded · coach stays in control",
  promptEyebrow = "From your sheet",
  promptBody = "Two keepers look strong. Want me to map depth and scholarship tradeoffs?",
  promptChips = ["Build depth chart", "Compare asks", "Show staff notes"],
  expandLabel = "Compare scenarios",
  expandHint = "Expand to weigh keepers vs striker with staff notes",
  expandOpensFullTool = false,
  desktopSummary = false,
  highlightIds,
  showExpandButton = true,
}: SidePanelProps) {
  const reduce = useReducedMotion()
  const resolvedHighlights =
    highlightIds ??
    (selectedScenario === "both-keepers"
      ? ["rowe", "delgado"]
      : selectedScenario === "rowe-striker"
        ? ["rowe", "kramer"]
        : ["delgado", "kramer"])

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          key="assistant-shell"
          className={cn(
            "fixed flex flex-col overflow-hidden border border-line bg-panel text-ink shadow-[0_20px_60px_rgba(0,0,0,0.14)]",
            expanded && !expandOpensFullTool
              ? "inset-3 rounded-3xl"
              : desktopSummary
                ? "bottom-3 right-3 top-3 w-[min(540px,94vw)] rounded-[28px]"
                : "bottom-3 right-3 top-3 w-[min(420px,92vw)] rounded-[28px]",
          )}
          style={{ zIndex }}
          initial={{
            opacity: 0,
            transform: "translateX(28px) scale(0.98)",
          }}
          animate={{ opacity: 1, transform: "scale(1) translateX(0) translateY(0)" }}
          exit={{
            opacity: 0,
            transform: "translateX(24px) scale(0.98)",
          }}
          transition={{
            duration: reduce ? 0 : 0.28,
            ease: [0.32, 0.72, 0, 1],
          }}
          layout
        >
          <div className="flex items-center gap-3 border-b border-line px-4 py-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white">
              <SoccerBallIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-ink">{title}</div>
              <div className="truncate text-[11px] text-muted">{subtitle}</div>
            </div>
            <button
              type="button"
              className="pressable rounded-full border border-line p-2 text-muted hover:text-ink"
              onClick={expanded ? onCollapse : onExpand}
              aria-label={expanded ? "Collapse panel" : "Expand panel"}
            >
              {expanded ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              className="pressable rounded-full border border-line p-2 text-muted hover:text-ink"
              onClick={onClose}
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {expanded && !expandOpensFullTool ? (
            <div className="min-h-0 flex-1 overflow-hidden">
              <ComparisonPanel
                selectedId={selectedScenario}
                onSelect={onSelectScenario}
              />
            </div>
          ) : desktopSummary ? (
            <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4 text-ink">
              <PromptChip
                eyebrow={promptEyebrow}
                body={promptBody}
                chips={[]}
              />
              <FieldDepthChart />
              <div className="rounded-2xl border border-black/8 bg-white p-3">
                <AskCeilingChart compact focusIds={["nora", "avery"]} />
              </div>
            </div>
          ) : (
            <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4 text-ink">
              <PromptChip
                eyebrow={promptEyebrow}
                body={promptBody}
                chips={promptChips}
              />
              <DepthChart highlightIds={resolvedHighlights} />
              {showExpandButton && (
                <button
                  type="button"
                  onClick={onExpand}
                  className="pressable w-full rounded-2xl bg-ink px-4 py-3 text-left text-white"
                >
                  <div className="text-[13px] font-medium">{expandLabel}</div>
                  <div className="mt-0.5 text-[12px] text-white/65">{expandHint}</div>
                </button>
              )}
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  )
}

function PromptChip({
  eyebrow,
  body,
  chips,
}: {
  eyebrow: string
  body: string
  chips: string[]
}) {
  return (
    <div className="rounded-2xl border border-line bg-panel-soft px-3 py-3 text-ink">
      <div className="text-[11px] uppercase tracking-[0.08em] text-muted">
        {eyebrow}
      </div>
      <p className="mt-1 text-[14px] leading-snug text-[#1d1d1f]">{body}</p>
      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {chips.map((label) => (
            <span
              key={label}
              className="rounded-full border border-line bg-white px-2.5 py-1 text-[11px] text-[#333]"
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
