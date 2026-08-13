import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

type MessagesWindowProps = {
  onClose?: () => void
  zIndex?: number
  onFocus?: () => void
  delay?: number
  className?: string
  contextHighlight?: "selected" | "hovered" | null
}

const THREAD = [
  {
    from: "them" as const,
    text: "Heads up — field change for Flight 3. ECNL desk moved us to Field 7 at 9:30.",
    time: "8:14 AM",
  },
  {
    from: "me" as const,
    text: "Got it. Nora’s Solar match was Field 4 — still good?",
    time: "8:16 AM",
  },
  {
    from: "them" as const,
    text: "Solar stays Field 4. Priority is GK/CB look at 9:30 then Avery’s CB group at 11.",
    time: "8:17 AM",
  },
  {
    from: "me" as const,
    text: "I’ll mark both on the Phoenix grid. Can you send the updated sheet from the desk?",
    time: "8:18 AM",
  },
  {
    from: "them" as const,
    text: "Forwarding now. Also — Northwestern is on Avery this weekend. Stay light in conversations.",
    time: "8:19 AM",
  },
]

/**
 * Fake Messages window — coach ↔ assistant coach thread about tournament logistics.
 */
export function MessagesWindow({
  onClose,
  zIndex = 70,
  onFocus,
  delay = 1.2,
  className,
  contextHighlight = null,
}: MessagesWindowProps) {
  const reduce = useReducedMotion()

  return (
    <motion.div
      data-window-id="messages"
      className={cn(
        "absolute left-[58%] top-[50%] flex h-[380px] w-[400px] flex-col overflow-hidden rounded-xl border bg-[#ffffff] text-[#1a1a1a] shadow-[0_28px_70px_rgba(0,0,0,0.18)]",
        contextHighlight === "selected"
          ? "border-[3px] border-[#34d0bd] shadow-[inset_0_0_0_3px_rgba(52,208,189,0.22)]"
          : contextHighlight === "hovered"
            ? "border-[3px] border-[#34d0bd] shadow-[inset_0_0_0_2px_rgba(52,208,189,0.22)]"
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
        duration: reduce ? 0 : 0.36,
        delay: reduce ? 0 : delay,
        ease: [0.32, 0.72, 0, 1],
      }}
    >
      <div className="flex h-11 shrink-0 items-center gap-3 border-b border-[#e2e2e2] bg-[#f5f5f5] px-3">
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
        <div className="min-w-0 flex-1 text-center">
          <div className="truncate text-[13px] font-semibold text-[#1a1a1a]">Coach Delgado</div>
          <div className="text-[10px] text-[#8e8e93]">Crossfire · iMessage</div>
        </div>
        <div className="w-14" />
      </div>

      <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto bg-[#f5f5f7] px-3 py-3">
        <div className="pb-1 text-center text-[10px] text-[#8e8e93]">Today 8:14 AM</div>
        {THREAD.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex",
              msg.from === "me" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-[18px] px-3 py-2 text-[13px] leading-snug",
                msg.from === "me"
                  ? "rounded-br-md bg-[#0a84ff] text-white"
                  : "rounded-bl-md bg-[#e9e9eb] text-[#1a1a1a]",
              )}
            >
              {msg.text}
              <div
                className={cn(
                  "mt-1 text-right text-[9px] tabular-nums",
                  msg.from === "me" ? "text-white/70" : "text-[#8e8e93]",
                )}
              >
                {msg.time}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-[#e2e2e2] bg-[#fafafa] px-3 py-2.5">
        <div className="flex-1 rounded-full border border-[#e2e2e2] bg-white px-3 py-1.5 text-[12px] text-[#8e8e93]">
          iMessage
        </div>
        <span className="text-[12px] font-medium text-[#0a84ff]">Send</span>
      </div>
    </motion.div>
  )
}
