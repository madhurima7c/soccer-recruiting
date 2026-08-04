import { useEffect, useRef } from "react"
import { motion, useReducedMotion } from "motion/react"

type SidelineCursorProps = {
  active: boolean
  onComplete?: () => void
  /** Fired as the ball progresses (0→1) so the desktop can drive mail + Excel */
  onProgress?: (progress: number) => void
}

const LABELS = [
  "Scrolling inbox…",
  "Opening Maya Chen…",
  "Moving to match grid…",
  "Selecting watch rows…",
  "Building depth chart…",
]

const DURATION_MS = 9800

/**
 * Visible “working” cursor — reads mail first, then selects adjacent Excel cells.
 */
export function SidelineCursor({
  active,
  onComplete,
  onProgress,
}: SidelineCursorProps) {
  const reduce = useReducedMotion()
  const done = useRef(false)

  useEffect(() => {
    if (!active) {
      done.current = false
      onProgress?.(0)
      return
    }
    done.current = false
    const ms = reduce ? 1800 : DURATION_MS
    const start = performance.now()
    let raf = 0

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      onProgress?.(t)
      if (t < 1) {
        raf = requestAnimationFrame(tick)
      }
    }
    raf = requestAnimationFrame(tick)

    const t = window.setTimeout(() => {
      if (done.current) return
      done.current = true
      onProgress?.(1)
      onComplete?.()
    }, ms)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(t)
    }
  }, [active, reduce, onComplete, onProgress])

  if (!active) return null

  const duration = reduce ? 1.6 : 9.5

  return (
    <>
      <motion.div
        className="pointer-events-none fixed z-[280]"
        style={{ width: 64, height: 64, marginLeft: -32, marginTop: -32 }}
        initial={{ left: "92vw", top: "18vh", opacity: 0, scale: 0.9 }}
        animate={{
          // Edge → Mail list → reading pane → Excel grid → linger on selection
          left: ["92vw", "22vw", "28vw", "36vw", "50vw", "54vw", "58vw"],
          top: ["18vh", "26vh", "38vh", "32vh", "36vh", "48vh", "52vh"],
          opacity: 1,
          scale: 1,
        }}
        transition={{
          duration,
          ease: [0.45, 0, 0.2, 1],
          times: [0, 0.12, 0.28, 0.42, 0.55, 0.75, 1],
        }}
      >
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_12px_40px_rgba(0,0,0,0.45)] ring-4 ring-white/40"
          animate={
            reduce
              ? undefined
              : {
                  y: [0, -10, 0, -8, 0],
                  rotate: [0, 120, 240, 360, 360],
                }
          }
          transition={
            reduce
              ? undefined
              : { duration: 1.1, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <img
            src="/assistant-ball.svg"
            alt=""
            className="h-11 w-11 object-contain"
            draggable={false}
          />
        </motion.div>
      </motion.div>

      <motion.div
        className="pointer-events-none fixed bottom-28 left-1/2 z-[280] -translate-x-1/2 rounded-full border border-white/25 bg-[#141414] px-5 py-2.5 text-[13px] font-medium text-white shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <LabelCycle labels={LABELS} duration={duration} />
      </motion.div>
    </>
  )
}

function LabelCycle({
  labels,
  duration,
}: {
  labels: string[]
  duration: number
}) {
  return (
    <span className="relative inline-block min-w-[240px] text-center">
      {labels.map((label, i) => (
        <motion.span
          key={label}
          className="absolute inset-x-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0, 1, 1, 0] }}
          transition={{
            duration,
            times: [
              0,
              Math.max(0, i / labels.length - 0.01),
              i / labels.length + 0.02,
              (i + 0.9) / labels.length,
              Math.min(1, (i + 1) / labels.length + 0.02),
            ],
            ease: "linear",
          }}
        >
          {label}
        </motion.span>
      ))}
      <span className="invisible">{labels[0]}</span>
    </span>
  )
}
