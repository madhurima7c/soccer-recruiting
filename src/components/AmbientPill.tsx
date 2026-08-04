import { motion, useReducedMotion } from "motion/react"
import { SoccerBallIcon } from "./SoccerBallIcon"
import { cn } from "@/lib/utils"

type AmbientPillProps = {
  mode: "idle" | "working" | "panel" | "expanded"
  onOpen: () => void
}

export function AmbientPill({ mode, onOpen }: AmbientPillProps) {
  const reduce = useReducedMotion()
  const working = mode === "working"
  const hidden = mode === "panel" || mode === "expanded"

  return (
    <motion.button
      type="button"
      aria-label="Open recruiting assistant"
      onClick={onOpen}
      className={cn(
        "pressable fixed right-4 top-1/2 z-50 flex w-14 -translate-y-1/2 flex-col items-center gap-2.5 rounded-full bg-[#141414] px-2.5 py-3.5 text-white shadow-[0_12px_40px_rgba(0,0,0,0.28)]",
        hidden && "pointer-events-none",
      )}
      initial={false}
      animate={{
        opacity: hidden ? 0 : 1,
        x: hidden ? 24 : 0,
        scale: hidden ? 0.95 : 1,
      }}
      transition={{ duration: reduce ? 0 : 0.22, ease: [0.23, 1, 0.32, 1] }}
    >
      <motion.span
        className="relative flex h-8 w-8 items-center justify-center text-ink"
        animate={
          reduce || !working
            ? { x: 0, y: 0, rotate: 0 }
            : {
                x: [0, 3, -2, 2, 0],
                y: [0, -4, 1, -2, 0],
                rotate: [0, 18, -12, 8, 0],
              }
        }
        transition={
          working && !reduce
            ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0.2 }
        }
      >
        <SoccerBallIcon className="h-7 w-7" />
      </motion.span>

      <span className="flex flex-col items-center gap-1.5">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full transition-colors duration-200",
            working ? "bg-emerald-400" : "bg-white/35",
          )}
        />
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full transition-colors duration-200",
            working ? "bg-emerald-400/70" : "bg-white/20",
          )}
        />
      </span>
    </motion.button>
  )
}
