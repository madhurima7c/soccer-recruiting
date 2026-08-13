import { useEffect, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import {
  Calendar,
  Clapperboard,
  Highlighter,
  LayoutGrid,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

type SidelineEdgePillProps = {
  /** Soft signal that Kit is reading open context (mail / ECNL / sheets) */
  aware?: boolean
  onAcceptHelp?: () => void
  /** Draw / annotate rail icon — opens annotation in the agentic flow */
  onAnnotate?: () => void
  /** Moments rail icon — opens Kit Saved Moments desktop */
  onMoments?: () => void
  /** Roster rail icon — opens Kit Player trade-off desktop */
  onRoster?: () => void
  /** Seconds to wait before showing the offer bubble (after desktop cascade) */
  offerDelay?: number
  /** Seconds before the ball starts spinning (after all windows have loaded) */
  motionDelay?: number
  /** Deterministic state used by static prototype captures */
  initialStage?: "offer" | "choices"
}

type Stage = "offer" | "choices" | "dismissed" | "accepted"

type RailAction = "annotate" | "roster" | "moments" | "today"

const RAIL: {
  id: RailAction
  label: string
  Icon: typeof LayoutGrid
}[] = [
  { id: "annotate", label: "Annotate", Icon: Highlighter },
  { id: "roster", label: "Roster plan", Icon: LayoutGrid },
  { id: "moments", label: "Moments", Icon: Clapperboard },
  { id: "today", label: "Today", Icon: Calendar },
]

/**
 * Always-on Kit presence — edge-anchored, soccer ball from Figma.
 * Compact “Need a hand?” offer with tool icon rail (Kit V2).
 */
export function SidelineEdgePill({
  aware = true,
  onAcceptHelp,
  onAnnotate,
  onMoments,
  onRoster,
  offerDelay = 2.8,
  motionDelay = 0.35,
  initialStage = "offer",
}: SidelineEdgePillProps) {
  const reduce = useReducedMotion()
  const [stage, setStage] = useState<Stage>(initialStage)
  // Gate offer mount separately so its delay never leaks into exit / choices
  const [offerReady, setOfferReady] = useState(() => !!reduce || offerDelay <= 0)
  const [motionReady, setMotionReady] = useState(
    () => !!reduce || motionDelay <= 0,
  )
  const [selected, setSelected] = useState<RailAction | null>(null)

  useEffect(() => {
    if (reduce || offerDelay <= 0) {
      setOfferReady(true)
      return
    }
    setOfferReady(false)
    const t = window.setTimeout(() => setOfferReady(true), offerDelay * 1000)
    return () => window.clearTimeout(t)
  }, [offerDelay, reduce])

  useEffect(() => {
    if (reduce || motionDelay <= 0) {
      setMotionReady(true)
      return
    }
    setMotionReady(false)
    const t = window.setTimeout(() => setMotionReady(true), motionDelay * 1000)
    return () => window.clearTimeout(t)
  }, [motionDelay, reduce])

  const showBubble =
    (stage === "offer" && offerReady) || stage === "choices"

  const ballActive =
    aware && motionReady && stage !== "accepted" && !reduce

  const openOffer = () => setStage("offer")

  const openComposer = () => {
    setSelected(null)
    setStage("accepted")
    onAcceptHelp?.()
  }

  const accept = (action: RailAction = "roster") => {
    setSelected(action)
    setStage("accepted")
    if (action === "annotate" && onAnnotate) {
      onAnnotate()
      return
    }
    if (action === "moments" && onMoments) {
      onMoments()
      return
    }
    if (action === "roster" && onRoster) {
      onRoster()
      return
    }
    onAcceptHelp?.()
  }

  return (
    <div className="absolute right-0 top-16 z-[300] flex items-start">
      <AnimatePresence mode="popLayout">
        {showBubble && (
          <motion.div
            key="offer"
            className="relative mr-2 mt-1 w-[206px] overflow-visible rounded-[12px] border border-[#34d0bd] bg-[#181a1b] text-left text-[#f5f5f5] shadow-[0_14px_40px_rgba(0,0,0,0.55)]"
            initial={
              reduce
                ? false
                : { opacity: 0, transform: "translateX(8px) scale(0.96)" }
            }
            animate={{ opacity: 1, transform: "translateX(0) scale(1)" }}
            exit={
              reduce
                ? undefined
                : {
                    opacity: 0,
                    transform: "translateX(6px) scale(0.97)",
                    transition: { duration: 0.15, delay: 0 },
                  }
            }
            transition={{
              duration: reduce ? 0 : 0.22,
              delay: 0,
              ease: [0.23, 1, 0.32, 1],
            }}
            role="status"
          >
            {!reduce && <OfferEdgeChase />}

            <div className="relative z-10 px-4 pb-3 pt-3.5">
              <button
                type="button"
                aria-label="Dismiss"
                className="pressable absolute right-2 top-2 flex items-center justify-center rounded-[5px] bg-white/[0.06] p-[3px] text-white/45 hover:bg-white/10 hover:text-white/70"
                onClick={(e) => {
                  e.stopPropagation()
                  setStage("dismissed")
                }}
              >
                <X className="h-[9px] w-[9px]" strokeWidth={2.25} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  openComposer()
                }}
                className="pressable mx-auto block w-full rounded-md px-1 py-0.5 text-center text-[15px] leading-[22px] tracking-normal text-white transition-colors hover:bg-white/[0.06] hover:text-[#8fefe0]"
              >
                Need a hand?
              </button>

              <div
                className="mx-auto mt-2.5 h-px w-[calc(100%-8px)] bg-white/10"
                aria-hidden
              />

              <div
                className="mt-2.5 flex items-center justify-center gap-1"
                role="toolbar"
                aria-label="Kit tools"
              >
                {RAIL.map(({ id, label, Icon }) => {
                  const isSelected = selected === id
                  return (
                    <button
                      key={id}
                      type="button"
                      title={label}
                      aria-label={label}
                      aria-pressed={isSelected}
                      className={cn(
                        "pressable flex h-8 w-8 items-center justify-center rounded-[12px] text-white transition-colors duration-150",
                        isSelected
                          ? "bg-[#4a4d50]/90"
                          : "bg-transparent hover:bg-white/[0.08]",
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        accept(id)
                      }}
                    >
                      <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                    </button>
                  )
                })}
              </div>
            </div>

            <span
              className="absolute -right-1.5 top-4 h-3 w-3 rotate-45 border-r border-t border-[#34d0bd]/80 bg-[#181a1b]"
              aria-hidden
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label="Open recruiting assistant"
        aria-expanded={showBubble}
        title="Recruiting assistant · reading your context"
        onClick={() => {
          if (stage === "dismissed" || stage === "accepted") {
            openOffer()
            return
          }
          if (stage === "offer" || stage === "choices") {
            // Soft dismiss when bubble is already open
            setStage("dismissed")
            return
          }
          openOffer()
        }}
        className="pressable relative mr-3 flex h-11 w-11 shrink-0 items-center justify-center overflow-visible rounded-full border border-white/12 bg-[#181a1b] text-white shadow-[0_12px_40px_rgba(0,0,0,0.55)] transition-transform duration-150 hover:scale-[1.03]"
        initial={
          reduce
            ? false
            : { opacity: 0, transform: "translateX(16px) scale(0.96)" }
        }
        animate={{ opacity: 1, transform: "translateX(0) scale(1)" }}
        transition={{
          duration: reduce ? 0 : 0.4,
          delay: 0,
          ease: [0.23, 1, 0.32, 1],
        }}
      >
        {/* Orbit arc — CCW, faster than ball; Kit V2 teal → cyan */}
        {ballActive && (
          <motion.span
            className="pointer-events-none absolute inset-[-4px] rounded-full"
            aria-hidden
            style={{
              background:
                "conic-gradient(from 0deg, #34d0bd 0deg, #22d3ee 32deg, #3b82f6 58deg, transparent 58deg)",
              WebkitMask:
                "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))",
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 1.55, repeat: Infinity, ease: "linear" }}
          />
        )}

        <span className="relative z-[1] flex h-9 w-9 items-center justify-center overflow-hidden rounded-full">
          <motion.img
            src="/kit-ball-bold-white.png?v=3"
            alt=""
            draggable={false}
            className="h-9 w-9 object-contain"
            animate={ballActive ? { rotate: 360 } : { rotate: 0 }}
            transition={
              ballActive
                ? {
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "linear",
                  }
                : { duration: 0.25, ease: [0.23, 1, 0.32, 1] }
            }
          />
        </span>
      </motion.button>
    </div>
  )
}

/**
 * Trace the offer bubble rim ~3 times, ending at a sparkle that flashes then fades.
 * Kit V2 teal chase — adapted to dark bubble, no fill wash.
 */
function OfferEdgeChase() {
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-px overflow-hidden rounded-[12px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 3.4,
          times: [0, 0.05, 0.78, 1],
          ease: [0.23, 1, 0.32, 1],
        }}
      >
        <motion.div
          className="absolute left-1/2 top-1/2 h-[240%] w-[240%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, transparent 78%, rgba(52,208,189,0.95) 88%, rgba(255,255,255,0.85) 94%, transparent 100%)",
          }}
          animate={{ rotate: 1080 }}
          transition={{ duration: 3.4, ease: "linear" }}
        />
        <div className="absolute inset-[2px] rounded-[10px] bg-[#181a1b]" />
      </motion.div>

      <motion.span
        aria-hidden
        className="pointer-events-none absolute -right-1.5 -top-1.5 z-20 text-[11px] font-semibold leading-none text-[#8fefe0]"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{
          opacity: [0, 0, 1, 0.35, 1, 0],
          scale: [0.4, 0.4, 1.15, 0.9, 1.2, 0.6],
        }}
        transition={{
          duration: 3.4,
          times: [0, 0.72, 0.78, 0.86, 0.92, 1],
          ease: [0.23, 1, 0.32, 1],
        }}
      >
        ✦
      </motion.span>
    </>
  )
}
