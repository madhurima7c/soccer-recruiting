import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { AmbientPill } from "@/components/AmbientPill"
import { ExcelSurface } from "@/components/ExcelSurface"
import { SidePanel } from "@/components/SidePanel"
import { PenLine } from "lucide-react"

type Mode = "idle" | "working" | "panel" | "expanded"

/** Original Excel + soccer-ball assistant prototype (v1) */
export default function AssistantPrototype() {
  const [mode, setMode] = useState<Mode>("idle")
  const [scenario, setScenario] = useState("both-keepers")
  const [annotating, setAnnotating] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (mode !== "working") return
    const t = window.setTimeout(() => setMode("panel"), 1200)
    return () => window.clearTimeout(t)
  }, [mode])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(t)
  }, [toast])

  const openAssistant = () => {
    if (mode === "idle") {
      setMode("working")
      setToast("Reading your recruiting board…")
      return
    }
    setMode("panel")
  }

  return (
    <div className="relative h-full overflow-hidden bg-canvas text-ink">
      <ExcelSurface />

      <AmbientPill mode={mode} onOpen={openAssistant} />

      <SidePanel
        open={mode === "panel" || mode === "expanded"}
        expanded={mode === "expanded"}
        selectedScenario={scenario}
        onSelectScenario={setScenario}
        onExpand={() => setMode("expanded")}
        onCollapse={() => setMode("panel")}
        onClose={() => setMode("idle")}
      />

      <div className="pointer-events-none fixed bottom-5 left-5 z-50 flex items-end gap-2">
        <button
          type="button"
          className="pressable pointer-events-auto inline-flex items-center gap-2 rounded-full border border-line bg-white/95 px-3 py-2 text-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          onClick={() => setAnnotating((v) => !v)}
        >
          <PenLine className="h-3.5 w-3.5" />
          {annotating ? "Annotating" : "Annotate"}
        </button>
      </div>

      <AnimatePresence>
        {annotating && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="absolute left-[28%] top-[34%] h-[72px] w-[220px] rounded-xl border-2 border-[#2f6bff]" />
            <div className="absolute left-[calc(28%+230px)] top-[36%] flex items-center gap-2 rounded-full bg-ink px-3 py-1.5 text-[12px] text-white shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2f6bff] text-[10px]">
                1
              </span>
              weigh both keepers first
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full border border-line bg-white px-4 py-2 text-[13px] shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
            initial={{ opacity: 0, transform: "translate(-50%, 8px) scale(0.97)" }}
            animate={{ opacity: 1, transform: "translate(-50%, 0) scale(1)" }}
            exit={{ opacity: 0, transform: "translate(-50%, 6px) scale(0.97)" }}
            transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
