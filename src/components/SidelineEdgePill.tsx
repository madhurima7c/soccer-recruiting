import { useEffect, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

type SidelineEdgePillProps = {
  /** Soft signal that Sideline is reading open context (mail / ECNL / sheets) */
  aware?: boolean
  onAcceptHelp?: () => void
  /** Seconds to wait before showing the offer bubble (after desktop cascade) */
  offerDelay?: number
  /** Seconds before the ball starts rolling (after all windows have loaded) */
  motionDelay?: number
}

type Stage = "offer" | "choices" | "dismissed" | "accepted"

/**
 * Always-on Sideline presence — edge-anchored, soccer ball from shared files.
 * Click opens lightweight choices (not a full app yet).
 */
export function SidelineEdgePill({
  aware = true,
  onAcceptHelp,
  offerDelay = 2.8,
  motionDelay = 0.35,
}: SidelineEdgePillProps) {
  const reduce = useReducedMotion()
  const [stage, setStage] = useState<Stage>("offer")
  // Gate offer mount separately so its delay never leaks into exit / choices
  const [offerReady, setOfferReady] = useState(() => !!reduce || offerDelay <= 0)
  const [motionReady, setMotionReady] = useState(
    () => !!reduce || motionDelay <= 0,
  )

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
    aware && motionReady && stage !== "choices" && !reduce

  const openChoices = () => setStage("choices")

  return (
    <div className="absolute right-0 top-16 z-[300] flex items-start">
      <AnimatePresence mode="popLayout">
        {showBubble && (
          <motion.div
            key={stage}
            className="relative mr-2 mt-1 w-[250px] rounded-2xl rounded-br-md border border-black/10 bg-white text-left text-[#141414] shadow-[0_12px_36px_rgba(0,0,0,0.18)]"
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
            {stage === "offer" && !reduce && <OfferEdgeChase />}

            {stage === "offer" && (
              <div className="relative z-10 px-3.5 py-2.5">
                <div className="flex items-start gap-2">
                  <p className="flex-1 text-[12px] leading-snug">
                    Hey — need some help organizing all of this information?
                  </p>
                  <button
                    type="button"
                    aria-label="Dismiss"
                    className="pressable -mr-1 -mt-0.5 rounded-full p-1 text-black/35 hover:bg-black/5 hover:text-black/70"
                    onClick={(e) => {
                      e.stopPropagation()
                      setStage("dismissed")
                    }}
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            )}

            {stage === "choices" && (
              <div className="relative z-10 p-2.5">
                <div className="mb-2 flex items-center justify-between px-1">
                  <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-black/40">
                    Sideline
                  </span>
                  <button
                    type="button"
                    aria-label="Dismiss"
                    className="pressable rounded-full p-1 text-black/35 hover:bg-black/5 hover:text-black/70"
                    onClick={(e) => {
                      e.stopPropagation()
                      setStage("dismissed")
                    }}
                  >
                    <X className="h-3.5 w-3.5" strokeWidth={2} />
                  </button>
                </div>

                <button
                  type="button"
                  className="pressable w-full rounded-xl bg-[#141414] px-3 py-2.5 text-left text-[12px] leading-snug text-white transition-colors duration-150 hover:bg-[#2a2a2a]"
                  onClick={(e) => {
                    e.stopPropagation()
                    setStage("accepted")
                    onAcceptHelp?.()
                  }}
                >
                  Yes — summarize the top recruits I should watch at the upcoming
                  tournament
                </button>
              </div>
            )}

            <span
              className="absolute -right-1.5 top-4 h-3 w-3 rotate-45 border-r border-t border-black/10 bg-white"
              aria-hidden
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label="Sideline — always on"
        aria-expanded={stage === "choices"}
        title="Sideline · reading your recruiting context"
        onClick={() => {
          if (stage === "dismissed" || stage === "accepted") {
            openChoices()
            return
          }
          if (stage === "offer") {
            openChoices()
            return
          }
          // choices open → clicking ball dismisses softly
          setStage("dismissed")
        }}
        className={cn(
          "pressable flex w-11 flex-col items-center gap-2.5 rounded-l-2xl border border-r-0 border-black/10 bg-white py-3 text-[#141414] shadow-[0_12px_40px_rgba(0,0,0,0.18)]",
          stage === "choices" && "ring-1 ring-black/10",
        )}
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
        <span className="relative flex h-9 w-9 items-center justify-center overflow-visible">
          <motion.img
            src="/assistant-ball.svg"
            alt=""
            draggable={false}
            className="h-8 w-8 object-contain"
            animate={
              ballActive
                ? {
                    transform: [
                      "translateY(0px) rotate(0deg)",
                      "translateY(-5px) rotate(120deg)",
                      "translateY(0px) rotate(240deg)",
                      "translateY(-4px) rotate(360deg)",
                      "translateY(0px) rotate(360deg)",
                    ],
                  }
                : { transform: "translateY(0px) rotate(0deg)" }
            }
            transition={
              ballActive
                ? {
                    duration: 3.6,
                    repeat: Infinity,
                    ease: "easeInOut",
                    times: [0, 0.28, 0.55, 0.82, 1],
                  }
                : { duration: 0.25, ease: [0.23, 1, 0.32, 1] }
            }
          />
        </span>

        <span
          className="rotate-180 text-[8px] font-medium tracking-[0.14em] text-[#141414]/70"
          style={{ writingMode: "vertical-rl" }}
        >
          SIDELINE
        </span>
      </motion.button>
    </div>
  )
}

/** Subtle dark dash that runs the bubble edge 3 times, then fades out. */
function OfferEdgeChase() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -inset-px overflow-hidden rounded-2xl rounded-br-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.75, 0.75, 0] }}
      transition={{
        duration: 3.6,
        times: [0, 0.06, 0.82, 1],
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      <motion.div
        className="absolute left-1/2 top-1/2 h-[220%] w-[220%] -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0 76%, rgba(20,20,20,0.9) 84%, transparent 92%)",
        }}
        animate={{ rotate: 1080 }}
        transition={{ duration: 3.6, ease: "linear" }}
      />
      <div className="absolute inset-[1.5px] rounded-[15px] rounded-br-[5px] bg-white" />
    </motion.div>
  )
}
