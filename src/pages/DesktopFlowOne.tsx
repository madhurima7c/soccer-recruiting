import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import {
  ArrowLeft,
  ArrowRight,
  Battery,
  Check,
  Clock3,
  Database,
  ExternalLink,
  FileSpreadsheet,
  Inbox,
  LayoutGrid,
  Maximize2,
  PanelRightOpen,
  PenLine,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Target,
  Undo2,
  Wifi,
  X,
} from "lucide-react"
import { BrowserWindow } from "@/components/BrowserWindow"
import { DesktopArtboard } from "@/components/DesktopArtboard"
import { ExcelWindow } from "@/components/ExcelWindow"
import { KitSavedMomentsDesktop } from "@/components/KitSavedMomentsDesktop"
import { KitTradeOffDesktop } from "@/components/KitTradeOffDesktop"
import { MailWindow } from "@/components/MailWindow"
import { MessagesWindow } from "@/components/MessagesWindow"
import { SidelineEdgePill } from "@/components/SidelineEdgePill"
import { TopDrawerBrowserWindow } from "@/components/TopDrawerBrowserWindow"
import { cn } from "@/lib/utils"

type Surface =
  | "closed"
  | "composer"
  | "clarify"
  | "annotate"
  | "working"
  | "result"

type WorkPhase = "mail" | "schedule" | "sheet" | "return"
type WindowId =
  | "mail"
  | "browser"
  | "tds"
  | "sheet"
  | "sheetNational"
  | "sheetPlayoffs"
  | "messages"
type Point = { x: number; y: number }

const DEFAULT_SUGGESTIONS = [
  "Help me prepare for ECNL Phoenix",
  "Find gaps in my tournament coverage",
  "Organize the players I should watch",
]

const WORK_COPY: Record<WorkPhase, string> = {
  mail: "Reading recruit emails…",
  schedule: "Checking ECNL context…",
  sheet: "Matching players to roster needs…",
  return: "Preparing your brief…",
}

/** Same opening cadence as /desktop — windows land, then Kit appears */
const OPEN_DELAY = {
  mail: 0.35,
  browser: 1.1,
  tds: 1.55,
  sheetNational: 2.1,
  sheet: 2.7,
  sheetPlayoffs: 3.4,
  messages: 4.0,
  /** Desktop cascade finishes ~3.2s; Kit ball appears shortly after */
  kitAppearMs: 3400,
  /** Offer bubble after ball is on-screen — first Kit popup in the flow */
  offerAfterAppear: 0.55,
  ballMotionAfterAppear: 0.2,
} as const

const CAPTURE =
  typeof window === "undefined"
    ? null
    : new URLSearchParams(window.location.search).get("capture")

const CAPTURE_MODE = CAPTURE !== null
const dly = (v: number) => (CAPTURE_MODE ? 0 : v)

export default function DesktopFlowOne() {
  const reduceMotion = useReducedMotion()
  const [surface, setSurface] = useState<Surface>(() => {
    if (CAPTURE === "composer") return "composer"
    if (CAPTURE === "clarify") return "clarify"
    if (CAPTURE === "annotate") return "annotate"
    if (CAPTURE === "working") return "working"
    if (CAPTURE === "result" || CAPTURE === "sidebar" || CAPTURE === "sidebar-schedule" || CAPTURE === "modal") {
      return "result"
    }
    // offer / choices / default → desktop with edge pill
    return "closed"
  })
  const [input, setInput] = useState(
    CAPTURE && CAPTURE !== "composer" ? "Help me prepare for ECNL Phoenix" : "",
  )
  const [day, setDay] = useState("Friday")
  const [focus, setFocus] = useState("Goalkeeper + center back")
  const [workPhase, setWorkPhase] = useState<WorkPhase>("mail")
  const [activeWindow, setActiveWindow] = useState<WindowId>("messages")
  const [mailSelectedId, setMailSelectedId] = useState("1")
  const [selectedRows, setSelectedRows] = useState<number[]>(
    CAPTURE === "result" || CAPTURE === "sidebar" || CAPTURE === "sidebar-schedule" || CAPTURE === "modal"
      ? [0, 1, 2, 3]
      : [],
  )
  const [sidebarOpen, setSidebarOpen] = useState(
    CAPTURE === "sidebar" || CAPTURE === "sidebar-schedule",
  )
  const [modalOpen, setModalOpen] = useState(CAPTURE === "modal")
  const [contextWindows, setContextWindows] = useState<WindowId[]>(() => {
    // Seed only for post-annotate captures — annotate itself starts with none selected
    if (
      CAPTURE === "result" ||
      CAPTURE === "sidebar" ||
      CAPTURE === "sidebar-schedule" ||
      CAPTURE === "modal" ||
      CAPTURE === "working"
    ) {
      return ["mail", "browser", "sheet", "messages"]
    }
    return []
  })
  const [hoveredContextWindow, setHoveredContextWindow] = useState<WindowId | null>(null)
  const [annotateEntry, setAnnotateEntry] = useState<"clarify" | "offer">("clarify")
  const [introKey, setIntroKey] = useState(0)
  const [kitReady, setKitReady] = useState(() => CAPTURE_MODE)
  const [kitApp, setKitApp] = useState<"moments" | "roster" | null>(null)
  const [time, setTime] = useState(() => formatMenuTime(new Date()))

  const suggestions = useMemo(() => suggestionsFor(input), [input])
  const isWorking = surface === "working"
  const annotating = surface === "annotate"
  const showIntroPill = surface === "closed" && kitReady && kitApp === null

  const focusWindow = useCallback((id: WindowId) => setActiveWindow(id), [])
  const closeKitApp = useCallback(() => setKitApp(null), [])

  const contextHighlightFor = useCallback(
    (id: WindowId): "selected" | "hovered" | null => {
      if (!annotating) return null
      if (contextWindows.includes(id)) return "selected"
      if (hoveredContextWindow === id) return "hovered"
      return null
    },
    [annotating, contextWindows, hoveredContextWindow],
  )

  const reset = useCallback(() => {
    setSurface("closed")
    setInput("")
    setDay("Friday")
    setFocus("Goalkeeper + center back")
    setWorkPhase("mail")
    setActiveWindow("messages")
    setMailSelectedId("1")
    setSelectedRows([])
    setSidebarOpen(false)
    setModalOpen(false)
    setContextWindows([])
    setHoveredContextWindow(null)
    setKitApp(null)
    setIntroKey((key) => key + 1)
  }, [])

  const startWorking = useCallback((windows: WindowId[]) => {
    setContextWindows(windows)
    setSidebarOpen(false)
    setModalOpen(false)
    setSelectedRows([])
    setMailSelectedId("1")
    setWorkPhase(windows.includes("mail") ? "mail" : windows.includes("browser") ? "schedule" : "sheet")
    setActiveWindow(windows[0] ?? "mail")
    setSurface("working")
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => setTime(formatMenuTime(new Date())), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (CAPTURE_MODE || reduceMotion) {
      setKitReady(true)
      return
    }
    setKitReady(false)
    const timer = window.setTimeout(() => setKitReady(true), OPEN_DELAY.kitAppearMs)
    return () => window.clearTimeout(timer)
  }, [introKey, reduceMotion])

  useEffect(() => {
    if (surface !== "working" || CAPTURE === "working") return

    const includeMail = contextWindows.includes("mail")
    const includeBrowser = contextWindows.includes("browser")
    const includeSheet = contextWindows.includes("sheet")
    const phaseTimers: number[] = []
    let t = 0

    if (includeMail) {
      phaseTimers.push(
        window.setTimeout(() => {
          setWorkPhase("mail")
          setActiveWindow("mail")
          setMailSelectedId("19")
        }, reduceMotion ? 250 : 900),
      )
      t = reduceMotion ? 700 : 2700
    }

    if (includeBrowser) {
      phaseTimers.push(
        window.setTimeout(() => {
          setWorkPhase("schedule")
          setActiveWindow("browser")
        }, t || (reduceMotion ? 250 : 900)),
      )
      t = (t || 0) + (reduceMotion ? 450 : 2400)
    }

    if (includeSheet) {
      phaseTimers.push(
        window.setTimeout(() => {
          setWorkPhase("sheet")
          setActiveWindow("sheet")
          setSelectedRows([0, 1])
        }, t || (reduceMotion ? 250 : 900)),
      )
      t = (t || 0) + (reduceMotion ? 350 : 1300)
      phaseTimers.push(
        window.setTimeout(() => setSelectedRows([0, 1, 2, 3]), t),
      )
      t += reduceMotion ? 300 : 1200
    }

    phaseTimers.push(window.setTimeout(() => setWorkPhase("return"), t || (reduceMotion ? 800 : 2000)))
    phaseTimers.push(
      window.setTimeout(
        () => setSurface("result"),
        (t || (reduceMotion ? 800 : 2000)) + (reduceMotion ? 400 : 900),
      ),
    )

    return () => phaseTimers.forEach(window.clearTimeout)
  }, [contextWindows, reduceMotion, surface])

  const zFor = (id: WindowId) => {
    if (activeWindow === id) return 110
    // Messages stays near the front of the pile even when not focused
    if (id === "messages") return 96
    if (id === "sheet") return 88
    if (id === "sheetPlayoffs") return 78
    if (id === "tds") return 76
    if (id === "sheetNational") return 72
    if (id === "browser") return 70
    return 60
  }

  return (
    <DesktopArtboard className="flow1-shell bg-[#c8dceb] font-sans text-white">
      <DesktopBackground />

      <header className="absolute inset-x-0 top-0 z-[180] flex h-6 items-center justify-between px-3 text-[13px] text-black/80 backdrop-blur-[32px]">
        <div className="pointer-events-none absolute inset-0 bg-white/45" />
        <div className="relative flex items-center gap-0.5">
          <span className="px-3.5 text-[13px] leading-none" aria-hidden></span>
          <span className="px-2 font-semibold tracking-[-0.02em]">
            {surface === "closed" ? "Finder" : "Kit"}
          </span>
          {["File", "Edit", "View", "Go", "Window", "Help"].map((item) => (
            <span key={item} className="hidden px-2 tracking-[-0.02em] opacity-75 sm:inline">
              {item}
            </span>
          ))}
        </div>
        <div className="relative flex items-center gap-1.5">
          <button
            type="button"
            onClick={reset}
            className="pressable mr-1 flex items-center gap-1.5 rounded-full border border-black/10 bg-black/5 px-2 py-0.5 text-[10px] text-black/70 hover:bg-black/10"
          >
            <RotateCcw className="h-3 w-3" /> Reset flow
          </button>
          <Battery className="h-3.5 w-3.5 opacity-80" />
          <LayoutGrid className="hidden h-3.5 w-3.5 opacity-80 sm:block" />
          <Search className="h-3.5 w-3.5 opacity-80" />
          <Wifi className="h-3.5 w-3.5 opacity-80" />
          <span className="ml-1 tabular-nums tracking-[-0.02em]">{time}</span>
        </div>
      </header>

      <div className="absolute left-5 top-12 z-20 grid w-[276px] grid-cols-2 gap-3 opacity-95">
        <DesktopWidget icon={Clock3} eyebrow="Friday" value="ECNL Phoenix" detail="Prep window · 2 days" />
        <DesktopWidget icon={Target} eyebrow="Roster need" value="GK + CB" detail="2027 priority" />
      </div>

      <MailWindow
        key={`mail-${introKey}`}
        delay={dly(OPEN_DELAY.mail)}
        className="!left-[20px] !top-[44px]"
        zIndex={zFor("mail")}
        onFocus={() => focusWindow("mail")}
        selectedId={mailSelectedId}
        onSelectedIdChange={setMailSelectedId}
        contextHighlight={contextHighlightFor("mail")}
      />
      <BrowserWindow
        key={`browser-${introKey}`}
        delay={dly(OPEN_DELAY.browser)}
        className="!left-[910px] !right-auto !top-[340px]"
        zIndex={zFor("browser")}
        onFocus={() => focusWindow("browser")}
        contextHighlight={contextHighlightFor("browser")}
      />
      <TopDrawerBrowserWindow
        key={`tds-${introKey}`}
        delay={dly(OPEN_DELAY.tds)}
        className="!left-[820px] !top-[58px]"
        zIndex={zFor("tds")}
        onFocus={() => focusWindow("tds")}
        contextHighlight={contextHighlightFor("tds")}
      />
      <ExcelWindow
        key={`sheet-national-${introKey}`}
        sheetId="national-events"
        windowId="sheetNational"
        delay={dly(OPEN_DELAY.sheetNational)}
        className="!left-[28px] !top-[360px]"
        zIndex={zFor("sheetNational")}
        onFocus={() => focusWindow("sheetNational")}
        contextHighlight={contextHighlightFor("sheetNational")}
      />
      <ExcelWindow
        key={`sheet-${introKey}`}
        sheetId="phoenix-weekend"
        windowId="sheet"
        delay={dly(OPEN_DELAY.sheet)}
        className="!left-[210px] !top-[455px]"
        zIndex={zFor("sheet")}
        onFocus={() => focusWindow("sheet")}
        selectedRows={selectedRows}
        contextHighlight={contextHighlightFor("sheet")}
      />
      <ExcelWindow
        key={`sheet-playoffs-${introKey}`}
        sheetId="playoffs-finals"
        windowId="sheetPlayoffs"
        delay={dly(OPEN_DELAY.sheetPlayoffs)}
        className="!left-[500px] !top-[160px]"
        zIndex={zFor("sheetPlayoffs")}
        onFocus={() => focusWindow("sheetPlayoffs")}
        contextHighlight={contextHighlightFor("sheetPlayoffs")}
      />
      <MessagesWindow
        key={`messages-${introKey}`}
        delay={dly(OPEN_DELAY.messages)}
        className="!left-[820px] !top-[430px]"
        zIndex={zFor("messages")}
        onFocus={() => focusWindow("messages")}
        contextHighlight={contextHighlightFor("messages")}
      />

      <AnimatePresence>
        {workPhase === "schedule" && isWorking && (
          <motion.div
            className="pointer-events-none absolute right-[5%] top-[20%] z-[150] rounded-full border border-white/12 bg-[#181a1b] px-3 py-1.5 text-[11px] font-medium text-[#8fefe0] shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            ECNL Phoenix Fall identified · Nov 14–16
          </motion.div>
        )}
      </AnimatePresence>

      {showIntroPill && (
        <SidelineEdgePill
          key={`pill-${introKey}`}
          aware
          onAcceptHelp={() => setSurface("composer")}
          onAnnotate={() => {
            setAnnotateEntry("offer")
            setContextWindows([])
            setHoveredContextWindow(null)
            setSurface("annotate")
          }}
          onMoments={() => setKitApp("moments")}
          onRoster={() => setKitApp("roster")}
          offerDelay={dly(OPEN_DELAY.offerAfterAppear)}
          motionDelay={dly(OPEN_DELAY.ballMotionAfterAppear)}
          initialStage={CAPTURE === "choices" ? "choices" : "offer"}
        />
      )}

      <AnimatePresence>
        {kitApp === "moments" && (
          <motion.div
            key="kit-moments"
            className="absolute inset-0 z-[420]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            <KitSavedMomentsDesktop onClose={closeKitApp} />
          </motion.div>
        )}
        {kitApp === "roster" && (
          <motion.div
            key="kit-roster"
            className="absolute inset-0 z-[420]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            <KitTradeOffDesktop onClose={closeKitApp} />
          </motion.div>
        )}
      </AnimatePresence>

      <FlowOneKit
        surface={surface}
        workPhase={workPhase}
        input={input}
        suggestions={suggestions}
        day={day}
        focus={focus}
        onInput={setInput}
        onOpen={() => setSurface("composer")}
        onClose={() => setSurface("closed")}
        onSubmit={() => input.trim() && setSurface("clarify")}
        onSuggestion={(suggestion) => setInput(suggestion)}
        onDay={setDay}
        onFocus={setFocus}
        onClarified={() => {
          setAnnotateEntry("clarify")
          setContextWindows([])
          setHoveredContextWindow(null)
          setSurface("annotate")
        }}
      />

      <AnimatePresence>
        {surface === "annotate" && (
          <AnnotationLayer
            selectedWindows={contextWindows}
            onSelectedWindowsChange={setContextWindows}
            onHoverWindow={setHoveredContextWindow}
            onFocusWindow={focusWindow}
            windowZ={zFor}
            onCancel={() => {
              setHoveredContextWindow(null)
              setSurface(annotateEntry === "offer" ? "closed" : "clarify")
            }}
            onConfirm={(windows) => {
              setHoveredContextWindow(null)
              startWorking(windows)
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {surface === "result" && !sidebarOpen && !modalOpen && (
          <ResultCard
            contextWindows={contextWindows}
            onSidebar={() => setSidebarOpen(true)}
            onReview={() => setModalOpen(true)}
            onDismiss={() => setSurface("closed")}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sidebarOpen && (
          <KitSidebar
            contextWindows={contextWindows}
            initialView={CAPTURE === "sidebar-schedule" ? "schedule" : "context"}
            onClose={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modalOpen && <PrepBriefModal onClose={() => setModalOpen(false)} />}
      </AnimatePresence>

      <DesktopDock
        onKit={() => {
          // Always return to Need a hand? as the first Kit popup
          setSurface("closed")
          setSidebarOpen(false)
          setModalOpen(false)
          setIntroKey((key) => key + 1)
        }}
      />
    </DesktopArtboard>
  )
}

function FlowOneKit({
  surface,
  workPhase,
  input,
  suggestions,
  day,
  focus,
  onInput,
  onOpen,
  onClose,
  onSubmit,
  onSuggestion,
  onDay,
  onFocus,
  onClarified,
}: {
  surface: Surface
  workPhase: WorkPhase
  input: string
  suggestions: string[]
  day: string
  focus: string
  onInput: (value: string) => void
  onOpen: () => void
  onClose: () => void
  onSubmit: () => void
  onSuggestion: (value: string) => void
  onDay: (value: string) => void
  onFocus: (value: string) => void
  onClarified: () => void
}) {
  const working = surface === "working"
  // Ball lives in the Kit panel / result card once the flow opens (Aug 8: persistent presence → integrates into chat)
  const showEdge = false

  return (
    <>
      <AnimatePresence>
        {showEdge && (
          <motion.button
            type="button"
            aria-label="Open Kit assistant"
            onClick={onOpen}
            className="pressable absolute right-0 top-[30%] z-[250] -mt-[29px] flex h-[58px] w-[58px] items-center justify-center"
            initial={{ x: 58 }}
            animate={{ x: 0 }}
            exit={{ x: 58 }}
          >
            <KitBall aware bounce tone="dark" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {(surface === "composer" || surface === "clarify") && (
          <motion.section
            className="pointer-events-none absolute inset-0 z-[270] text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="pointer-events-auto absolute bottom-[92px] right-4 w-[400px]">
              <KitSurface className="!rounded-[24px]">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                  <KitBall size="small" tone="dark" />
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="pressable flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-white/45 hover:bg-white/10 hover:text-white/70"
                  >
                    <X className="h-2.5 w-2.5" strokeWidth={2.25} />
                  </button>
                </div>

                {surface === "composer" ? (
                  <div className="flex flex-col gap-3.5 px-3 pb-4 pt-1">
                    <div className="flex flex-wrap gap-2" aria-label="Open context">
                      {[
                        { mark: "M", label: "Mail" },
                        { mark: "X", label: "Excel" },
                        { mark: "S", label: "Safari" },
                      ].map((chip) => (
                        <span
                          key={chip.label}
                          className="inline-flex items-center gap-1.5 rounded-[14px] bg-white/[0.08] py-1.5 pl-2 pr-2.5"
                        >
                          <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[11px] border border-[#34d0bd]/55 bg-[#34d0bd]/18 text-[9px] font-semibold text-[#34d0bd]">
                            {chip.mark}
                          </span>
                          <span className="text-[12px] font-medium text-white/85">{chip.label}</span>
                        </span>
                      ))}
                    </div>

                    <h2 className="font-[Geist,Inter,sans-serif] text-[22px] font-semibold leading-7 tracking-[-0.02em] text-white">
                      I can see your recruiting windows — what should we prep?
                    </h2>

                    <div className="flex flex-col gap-2" aria-label="Dynamic suggestions">
                      {suggestions.map((suggestion, index) => (
                        <motion.button
                          layout
                          key={suggestion}
                          type="button"
                          onClick={() => onSuggestion(suggestion)}
                          className={cn(
                            "pressable flex w-full items-center justify-between gap-4 rounded-[16px] px-3.5 py-3 text-left text-[14px] leading-[19px]",
                            index === 0
                              ? "border-2 border-[#34d0bd] bg-white/[0.08] text-white"
                              : "border border-transparent bg-white/[0.06] text-white/55 hover:bg-white/[0.09] hover:text-white/80",
                          )}
                          initial={{ opacity: 0, x: 12, y: 4 }}
                          animate={{ opacity: 1, x: 0, y: 0 }}
                          transition={{ delay: index * 0.045, ease: [0.23, 1, 0.32, 1] }}
                        >
                          <span className="min-w-0">{suggestion}</span>
                          {index === 0 ? (
                            <span
                              aria-hidden
                              className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center text-[#34d0bd]"
                            >
                              <span className="absolute left-0 top-0.5 font-[Geist,Inter,sans-serif] text-[11px] font-semibold leading-none">
                                ✦
                              </span>
                              <span className="absolute bottom-0 right-0 font-[Geist,Inter,sans-serif] text-[7px] font-semibold leading-none opacity-85">
                                ✦
                              </span>
                            </span>
                          ) : (
                            <ArrowRight className="h-4 w-4 shrink-0 text-white/35" />
                          )}
                        </motion.button>
                      ))}
                    </div>

                    <div className="flex items-end gap-2 rounded-[18px] border-[1.5px] border-[#34d0bd] bg-white/[0.06] p-2.5 pl-3.5">
                      <textarea
                        value={input}
                        onChange={(event) => onInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" && !event.shiftKey) {
                            event.preventDefault()
                            onSubmit()
                          }
                        }}
                        autoFocus
                        rows={1}
                        placeholder="What would you like to prepare?"
                        className="min-h-[34px] flex-1 resize-none bg-transparent py-1.5 text-[16px] leading-[21px] text-white outline-none placeholder:text-white/35"
                      />
                      <button
                        type="button"
                        onClick={onSubmit}
                        disabled={!input.trim()}
                        aria-label="Send"
                        className="pressable flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/12 text-white disabled:cursor-default disabled:text-white/40"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-center gap-2 px-2 pt-1 text-[10px] text-white/45">
                      <ShieldCheck className="h-3.5 w-3.5 opacity-70" /> Kit waits for you before taking action
                    </div>
                  </div>
                ) : (
                  <ClarificationCard
                    day={day}
                    focus={focus}
                    onDay={onDay}
                    onFocus={onFocus}
                    onContinue={onClarified}
                  />
                )}
              </KitSurface>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {working && (
          <>
            <WorkingBall phase={workPhase} />
            <motion.div
              className="pointer-events-none absolute bottom-[90px] left-1/2 z-[255] flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-white/12 bg-[#181a1b] px-4 py-2.5 text-[12px] font-medium text-white shadow-[0_14px_42px_rgba(0,0,0,0.45)]"
              initial={{ y: 8 }}
              animate={{ y: 0 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34d0bd] opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-[#34d0bd]" />
              </span>
              {WORK_COPY[workPhase]}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function ClarificationCard({
  day,
  focus,
  onDay,
  onFocus,
  onContinue,
}: {
  day: string
  focus: string
  onDay: (value: string) => void
  onFocus: (value: string) => void
  onContinue: () => void
}) {
  return (
    <div className="flex flex-col gap-3.5 px-4 pb-4 pt-3">
      <h2 className="font-[Geist,Inter,sans-serif] text-[22px] font-semibold leading-7 tracking-[-0.02em] text-white">
        Two details before I start
      </h2>
      <p className="text-[12px] leading-[17px] text-white/50">
        Your choices shape what Kit looks for.
      </p>
      <ChoiceRow label="Scouting window" values={["Friday", "Full weekend"]} selected={day} onSelect={onDay} />
      <ChoiceRow
        label="Roster priority"
        values={["Goalkeeper + center back", "All priority positions"]}
        selected={focus}
        onSelect={onFocus}
      />
      <button
        type="button"
        onClick={onContinue}
        className="pressable mt-1 flex w-full items-center justify-center gap-2 rounded-[16px] bg-white px-4 py-2.5 text-[12px] font-medium text-[#181a1b] hover:bg-white/90"
      >
        Mark priorities on the sheet <PenLine className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function ChoiceRow({
  label,
  values,
  selected,
  onSelect,
}: {
  label: string
  values: string[]
  selected: string
  onSelect: (value: string) => void
}) {
  return (
    <div className="mb-3">
      <div className="mb-1.5 text-[11px] font-medium text-white/45">{label}</div>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className={cn(
              "pressable rounded-[16px] px-3 py-2 text-[12px] leading-4",
              selected === value
                ? "border-2 border-[#34d0bd] bg-white/[0.08] font-medium text-white"
                : "border border-transparent bg-white/[0.04] text-white/70 hover:bg-white/[0.08]",
            )}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  )
}

function AnnotationLayer({
  selectedWindows,
  onSelectedWindowsChange,
  onHoverWindow,
  onFocusWindow,
  windowZ,
  onCancel,
  onConfirm,
}: {
  selectedWindows: WindowId[]
  onSelectedWindowsChange: (windows: WindowId[]) => void
  onHoverWindow: (id: WindowId | null) => void
  onFocusWindow: (id: WindowId) => void
  windowZ: (id: WindowId) => number
  onCancel: () => void
  onConfirm: (windows: WindowId[]) => void
}) {
  const [paths, setPaths] = useState<Point[][]>([])
  const surfaceRef = useRef<HTMLDivElement>(null)
  const drawing = useRef(false)
  const dragDistance = useRef(0)
  const pointerOrigin = useRef<Point | null>(null)
  const activeStroke = useRef<Point[]>([])
  const selected = new Set(selectedWindows)

  /** Map viewport pointer → artboard-local coords (DesktopArtboard applies CSS scale). */
  const clientToLocal = (clientX: number, clientY: number): Point => {
    const el = surfaceRef.current
    if (!el) return { x: clientX, y: clientY }
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return { x: clientX, y: clientY }
    return {
      x: ((clientX - rect.left) / rect.width) * el.offsetWidth,
      y: ((clientY - rect.top) / rect.height) * el.offsetHeight,
    }
  }

  /** Map artboard-local stroke points back to viewport for hit-testing windows. */
  const localToClient = (point: Point): Point => {
    const el = surfaceRef.current
    if (!el) return point
    const rect = el.getBoundingClientRect()
    if (el.offsetWidth === 0 || el.offsetHeight === 0) return point
    return {
      x: rect.left + (point.x / el.offsetWidth) * rect.width,
      y: rect.top + (point.y / el.offsetHeight) * rect.height,
    }
  }

  const selectWindows = (ids: WindowId[]) => {
    if (!ids.length) return
    const next = [...selectedWindows]
    for (const id of ids) {
      onFocusWindow(id)
      if (!next.includes(id)) next.push(id)
    }
    onSelectedWindowsChange(next)
  }

  const toggleWindow = (id: WindowId) => {
    onFocusWindow(id)
    const next = selected.has(id)
      ? selectedWindows.filter((windowId) => windowId !== id)
      : [...selectedWindows, id]
    onSelectedWindowsChange(next)
  }

  const hitTest = (x: number, y: number) => {
    const ranked = [...WINDOW_TARGETS].sort((a, b) => windowZ(b.id) - windowZ(a.id))
    for (const target of ranked) {
      const el = document.querySelector(`[data-window-id="${target.id}"]`)
      if (!(el instanceof HTMLElement)) continue
      const rect = el.getBoundingClientRect()
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return target.id
      }
    }
    return null
  }

  const windowsCoveredByStroke = (localPoints: Point[]) => {
    const found = new Set<WindowId>()
    if (!localPoints.length) return [] as WindowId[]
    const points = localPoints.map(localToClient)

    // Direct: any stroke point landing on a window
    for (const point of points) {
      const hit = hitTest(point.x, point.y)
      if (hit) found.add(hit)
    }

    // Enclosure: circling a window selects it even if the ink stays on the rim
    const first = points[0]
    const last = points[points.length - 1]
    const closes =
      points.length >= 8 &&
      Math.hypot(last.x - first.x, last.y - first.y) < 56
    if (points.length >= 10 || closes) {
      for (const target of WINDOW_TARGETS) {
        const el = document.querySelector(`[data-window-id="${target.id}"]`)
        if (!(el instanceof HTMLElement)) continue
        const rect = el.getBoundingClientRect()
        const center = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        }
        if (pointInPolygon(center, points)) {
          found.add(target.id)
          continue
        }
        // Soft circle: window center near stroke centroid and inside stroke radius
        let sx = 0
        let sy = 0
        for (const p of points) {
          sx += p.x
          sy += p.y
        }
        const cx = sx / points.length
        const cy = sy / points.length
        let radius = 0
        for (const p of points) {
          radius += Math.hypot(p.x - cx, p.y - cy)
        }
        radius /= points.length
        const dist = Math.hypot(center.x - cx, center.y - cy)
        if (dist < radius * 0.85 && rectOverlapsCircle(rect, cx, cy, radius)) {
          found.add(target.id)
        }
      }
    }

    return [...found]
  }

  const start = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    drawing.current = true
    dragDistance.current = 0
    pointerOrigin.current = { x: event.clientX, y: event.clientY }
    activeStroke.current = [clientToLocal(event.clientX, event.clientY)]
    setPaths((current) => [...current, activeStroke.current])
  }
  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    onHoverWindow(hitTest(event.clientX, event.clientY))

    if (!drawing.current || !pointerOrigin.current) return
    const dx = event.clientX - pointerOrigin.current.x
    const dy = event.clientY - pointerOrigin.current.y
    dragDistance.current = Math.max(dragDistance.current, Math.hypot(dx, dy))
    const nextPoint = clientToLocal(event.clientX, event.clientY)
    activeStroke.current = [...activeStroke.current, nextPoint]
    setPaths((current) => {
      const next = current.slice()
      next[next.length - 1] = activeStroke.current
      return next
    })
  }
  const end = (event: ReactPointerEvent<HTMLDivElement>) => {
    const wasClick = drawing.current && dragDistance.current < 6
    const stroke = activeStroke.current
    drawing.current = false
    pointerOrigin.current = null
    activeStroke.current = []

    if (wasClick) {
      const hit = hitTest(event.clientX, event.clientY)
      if (hit) {
        setPaths((current) => current.slice(0, -1))
        toggleWindow(hit)
      }
      return
    }

    // Draw / circle over windows → select them
    const covered = windowsCoveredByStroke(stroke)
    if (covered.length) selectWindows(covered)
  }

  const canContinue = selectedWindows.length > 0
  const selectedTargets = WINDOW_TARGETS.filter((target) => selected.has(target.id))

  return (
    <motion.div
      className="absolute inset-0 z-[310]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onPointerLeave={() => onHoverWindow(null)}
    >
      <div
        ref={surfaceRef}
        className="absolute inset-0 z-[313] cursor-crosshair touch-none"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <svg className="h-full w-full">
          {paths.map((points, index) => (
            <polyline
              key={index}
              points={points.map((point) => `${point.x},${point.y}`).join(" ")}
              fill="none"
              stroke="#ff5d47"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
      </div>

      {/* Kit V2 annotate chrome — matches Figma 2734:1022 */}
      <div className="pointer-events-none absolute inset-x-0 top-10 z-[315] flex justify-center px-3">
        <div className="pointer-events-auto w-fit max-w-[calc(100%-24px)]">
          <KitSurface className="!rounded-[22px]">
            <div className="flex items-center gap-3 p-2">
              <div className="flex w-[220px] shrink-0 items-center gap-2.5 px-2 py-1">
                <KitBall size="small" tone="dark" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <PenLine className="h-3.5 w-3.5 shrink-0 text-white/85" strokeWidth={2} />
                    <div className="font-[Geist,Inter,sans-serif] text-[14px] font-medium leading-[16.5px] text-white/85">
                      Draw + choose windows
                    </div>
                  </div>
                  <p className="mt-0.5 text-[10px] leading-[13.75px] text-white/50">
                    Hover · click · or draw to include
                  </p>
                </div>
              </div>

              <div className="flex max-h-[4.75rem] min-w-0 flex-wrap content-center items-center justify-center gap-1.5 overflow-hidden">
                {selectedTargets.length === 0 ? (
                  <span className="rounded-[14px] border border-dashed border-white/15 px-2.5 py-1 text-[10px] leading-[15px] text-white/40">
                    No windows selected yet
                  </span>
                ) : (
                  selectedTargets.map((target) => (
                    <button
                      key={target.id}
                      type="button"
                      onClick={() => toggleWindow(target.id)}
                      title="Click to remove"
                      className="pressable inline-flex shrink-0 items-center gap-1.5 rounded-[14px] border-2 border-[#34d0bd] bg-white/[0.08] py-1 pl-1.5 pr-2"
                    >
                      <span className="flex h-[20px] w-[20px] items-center justify-center rounded-[10px] border border-[#34d0bd]/55 bg-[#34d0bd]/18 text-[9px] font-semibold text-[#34d0bd]">
                        {target.mark}
                      </span>
                      <span className="whitespace-nowrap text-[12px] font-medium text-white/85">
                        {target.label}
                      </span>
                    </button>
                  ))
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPaths((current) => current.slice(0, -1))}
                  disabled={!paths.length}
                  className="pressable rounded-full p-2 text-white/55 hover:bg-white/10 disabled:opacity-30"
                  aria-label="Undo"
                >
                  <Undo2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="pressable rounded-[16px] px-3 py-2 text-[11px] leading-[16.5px] text-white/55 hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => onConfirm(selectedWindows)}
                  disabled={!canContinue}
                  className="pressable flex items-center gap-1.5 rounded-[16px] bg-[#34d0bd] px-4 py-2 text-[11px] font-medium leading-[16.5px] text-[#181a1b] hover:bg-[#4ad9c8] disabled:bg-white/15 disabled:text-white/40"
                >
                  <Check className="h-3.5 w-3.5" /> Use selection
                </button>
              </div>
            </div>
          </KitSurface>
        </div>
      </div>
    </motion.div>
  )
}

const WINDOW_TARGETS: { id: WindowId; label: string; mark: string }[] = [
  { id: "mail", label: "Mail", mark: "M" },
  { id: "browser", label: "Safari", mark: "S" },
  { id: "tds", label: "Safari · TopDrawer", mark: "T" },
  { id: "sheetNational", label: "Excel · National", mark: "X" },
  { id: "sheet", label: "Excel · Phoenix", mark: "X" },
  { id: "sheetPlayoffs", label: "Excel · Playoffs", mark: "X" },
  { id: "messages", label: "Messages", mark: "i" },
]

/** Ray-cast point-in-polygon — used when a stroke circles a window. */
function pointInPolygon(point: Point, polygon: Point[]) {
  if (polygon.length < 3) return false
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i]
    const b = polygon[j]
    const intersects =
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y + Number.EPSILON) + a.x
    if (intersects) inside = !inside
  }
  return inside
}

function rectOverlapsCircle(
  rect: DOMRect,
  cx: number,
  cy: number,
  radius: number,
) {
  const nearestX = Math.max(rect.left, Math.min(cx, rect.right))
  const nearestY = Math.max(rect.top, Math.min(cy, rect.bottom))
  return Math.hypot(nearestX - cx, nearestY - cy) <= radius
}

function WorkingBall({ phase }: { phase: WorkPhase }) {
  const position: Record<WorkPhase, { left: string; top: string }> = {
    mail: { left: "25%", top: "36%" },
    schedule: { left: "78%", top: "33%" },
    sheet: { left: "57%", top: "54%" },
    return: { left: "96%", top: "30%" },
  }
  return (
    <motion.div
      className="pointer-events-none absolute z-[245]"
      initial={{ left: "96%", top: "30%", x: -26, y: -26 }}
      animate={{ ...position[phase], x: -26, y: -26 }}
      transition={{ duration: phase === "return" ? 0.7 : 1.05, ease: [0.45, 0, 0.2, 1] }}
    >
      {/* Dark edge-pill look while touring windows — ball spin only, no orbit arc */}
      <KitBall size="working" bounce tone="dark" />
    </motion.div>
  )
}

function KitBall({
  size = "default",
  aware = false,
  bounce = false,
  bare = false,
  tone = "light",
}: {
  size?: "small" | "default" | "working" | "dock"
  aware?: boolean
  bounce?: boolean
  bare?: boolean
  /** light = soft green chip; dark = edge-pill charcoal + white ball */
  tone?: "light" | "dark"
}) {
  const reduceMotion = useReducedMotion()
  const dimensions =
    size === "small"
      ? "h-8 w-8"
      : size === "working"
        ? "h-[54px] w-[54px]"
        : size === "dock"
          ? "h-full w-full"
          : "h-11 w-11"
  const image =
    size === "small"
      ? "h-7 w-7"
      : size === "working"
        ? "h-[42px] w-[42px]"
        : size === "dock"
          ? "h-[82%] w-[82%]"
          : "h-10 w-10"
  const shouldBounce = bounce && !reduceMotion
  const dark = tone === "dark"
  const workingSpin = shouldBounce && size === "working"

  const ball = (
    <motion.img
      src={dark ? "/kit-ball-bold-white.png?v=3" : "/kit-ball.png"}
      alt=""
      draggable={false}
      className={cn("object-contain", image)}
      animate={
        workingSpin
          ? { rotate: 360 }
          : shouldBounce
            ? {
                y: [0, -5, 0, -4, 0],
                rotate: [0, 120, 240, 360, 360],
              }
            : { y: 0, rotate: 0 }
      }
      transition={
        workingSpin
          ? {
              duration: 2.8,
              repeat: Infinity,
              ease: "linear",
            }
          : shouldBounce
            ? {
                duration: 3.6,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.28, 0.55, 0.82, 1],
              }
            : { duration: 0.25 }
      }
    />
  )

  if (bare) {
    return (
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center overflow-hidden",
          dimensions,
        )}
      >
        {ball}
      </span>
    )
  }

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        dark
          ? "bg-[#0a0a0a] shadow-[0_8px_22px_rgba(0,0,0,0.45)]"
          : "border border-[#b9d6bf] bg-[#e3f1e5] shadow-[0_8px_22px_rgba(25,74,37,0.2)]",
        dimensions,
      )}
    >
      {aware && (
        <span
          className={cn(
            "absolute right-0 top-0 z-10 h-2.5 w-2.5 rounded-full border-2 bg-[#34d0bd]",
            dark ? "border-[#0a0a0a]" : "border-[#e3f1e5]",
          )}
        />
      )}
      {ball}
    </span>
  )
}

/** Shared Kit V2 surface: flat charcoal shell — no corner blooms */
function KitSurface({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[20px] border border-white/12 text-white shadow-[0_28px_80px_rgba(0,0,0,0.55)]",
        className,
      )}
      style={{ backgroundColor: "#181a1b" }}
    >
      <div className="relative z-10">{children}</div>
    </div>
  )
}

function windowLabel(id: WindowId) {
  return (
    WINDOW_TARGETS.find((t) => t.id === id)?.label ??
    (id === "mail"
      ? "Mail"
      : id === "browser"
        ? "Safari"
        : id === "tds"
          ? "Safari · TopDrawer"
          : id === "messages"
            ? "Messages"
            : "Excel")
  )
}

function ResultCard({
  contextWindows: _contextWindows,
  onSidebar,
  onReview,
  onDismiss,
}: {
  contextWindows: WindowId[]
  onSidebar: () => void
  onReview: () => void
  onDismiss: () => void
}) {
  return (
    <motion.section
      className="absolute bottom-[88px] right-5 z-[270] w-[400px]"
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8 }}
    >
      <KitSurface className="!rounded-[24px]">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
          <KitBall size="small" tone="dark" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[13px] font-semibold text-white/55">
              Friday priorities
              <Check className="h-3.5 w-3.5 text-[#34d0bd]" />
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss"
            className="pressable flex h-[18px] w-[18px] items-center justify-center rounded-md text-white/45 hover:bg-white/10 hover:text-white/70"
          >
            <X className="h-2.5 w-2.5" strokeWidth={2.25} />
          </button>
        </div>
        <div className="flex flex-col gap-3.5 p-4">
          <div className="flex flex-wrap gap-2">
            <ContextChip mark="M" label="Nora · Mail" />
            <ContextChip mark="F" label="Field 7" />
          </div>

          <p className="font-[Geist,Inter,sans-serif] text-[24px] font-semibold leading-[30px] tracking-normal text-white">
            Crossfire <span className="text-[#34d0bd]">8:00</span>
            {" → Solar "}
            <span className="text-[#34d0bd]">9:30</span>
            {" → Slammers "}
            <span className="text-[#34d0bd]">11:00</span>
            . Nora confirms Solar; ECNL moves a target to{" "}
            <span className="text-[#34d0bd]">Field 7</span>.
          </p>

          <div className="grid grid-cols-3 gap-2">
            <ResultMetric value="4" label="priority players" />
            <ResultMetric value="3" label="matches" />
            <ResultMetric value="1" label="time conflict" attention />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onReview}
              className="pressable flex flex-1 items-center justify-center gap-1.5 rounded-full bg-[#34d0bd] px-3 py-2.5 text-[13px] font-medium text-[#181a1b] hover:bg-[#4ad9c8]"
            >
              <Maximize2 className="h-3.5 w-3.5" /> Review schedule
            </button>
            <button
              type="button"
              onClick={onSidebar}
              className="pressable flex items-center justify-center gap-1.5 rounded-full border border-white/15 bg-white/[0.04] px-3 py-2.5 text-[11px] font-medium text-white/80 hover:bg-white/[0.08]"
            >
              <PanelRightOpen className="h-3.5 w-3.5" /> Details
            </button>
          </div>
        </div>
      </KitSurface>
    </motion.section>
  )
}

function ContextChip({ mark, label }: { mark: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[14px] bg-white/[0.08] py-1.5 pl-2 pr-2.5">
      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-[11px] border border-[#34d0bd]/55 bg-[#34d0bd]/18 text-[9px] font-semibold text-[#34d0bd]">
        {mark}
      </span>
      <span className="text-[12px] font-medium text-white/85">{label}</span>
    </span>
  )
}

function ResultMetric({ value, label, attention = false }: { value: string; label: string; attention?: boolean }) {
  return (
    <div
      className={cn(
        "min-h-[68px] rounded-xl px-2.5 py-3",
        attention
          ? "border-2 border-[#e85c5c] bg-[rgba(61,18,22,0.55)]"
          : "bg-white/[0.06]",
      )}
    >
      <div className="font-[Geist,Inter,sans-serif] text-[28px] font-semibold leading-8 text-white">
        {value}
      </div>
      <div
        className={cn(
          "mt-1 text-[10px] font-medium leading-[13px]",
          attention ? "text-[#ffa0a0]" : "text-white/50",
        )}
      >
        {label}
      </div>
    </div>
  )
}

function KitSidebar({
  contextWindows,
  onClose,
  initialView = "context",
}: {
  contextWindows: WindowId[]
  onClose: () => void
  initialView?: "context" | "schedule"
}) {
  const [view, setView] = useState<"context" | "schedule">(initialView)
  const [shared, setShared] = useState(false)

  const evidence = [
    contextWindows.includes("mail") && {
      icon: Inbox,
      title: "Recruit inbox",
      detail: "Nora confirmed Solar at 9:30; ECNL desk reports a field change.",
    },
    contextWindows.includes("sheet") && {
      icon: FileSpreadsheet,
      title: "Phoenix match grid",
      detail: "Your annotation covers four rows and two roster priority positions.",
    },
    contextWindows.includes("browser") && {
      icon: Database,
      title: "ECNL event page",
      detail: "Event context is active. Hudl Wyscout is connected but wasn’t needed for this task.",
    },
  ].filter(Boolean) as { icon: typeof Inbox; title: string; detail: string }[]

  return (
    <motion.aside
      className="absolute bottom-3 right-3 top-3 z-[285] flex w-[430px] flex-col"
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 30, opacity: 0 }}
    >
      <KitSurface className="flex h-full flex-col !rounded-[26px]">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
          {view === "schedule" ? (
            <button
              type="button"
              onClick={() => setView("context")}
              className="pressable rounded-full p-2 text-white/50 hover:bg-white/10"
              aria-label="Back to details"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <KitBall size="small" tone="dark" />
          )}
          <div className="min-w-0 flex-1">
            {view === "schedule" ? (
              <>
                <div className="text-[11px] font-semibold tracking-[-0.01em] text-[#34d0bd]">Kit</div>
                <div className="font-[Geist,Inter,sans-serif] text-[15px] font-semibold text-white">Friday schedule</div>
                <div className="text-[10px] text-white/50">ECNL Phoenix · built from your annotation</div>
              </>
            ) : (
              <>
              <div className="font-[Geist,Inter,sans-serif] text-[15px] font-semibold text-white">Kit’s working context</div>
                <div className="text-[10px] text-white/50">
                  Friday · ECNL Phoenix · {contextWindows.map(windowLabel).join(" · ")}
                </div>
              </>
            )}
          </div>
          <button type="button" onClick={onClose} className="pressable flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.06] text-white/45 hover:bg-white/10 hover:text-white/70" aria-label="Close sidebar">
            <X className="h-3 w-3" strokeWidth={2.25} />
          </button>
        </div>

        {view === "schedule" ? (
          <>
            <div className="min-h-0 flex-1 overflow-auto px-4 py-4">
              <FridayScheduleBody />
            </div>
            <div className="flex items-center justify-between border-t border-white/10 px-4 py-3">
              <span className="text-[10px] text-white/45">Coach remains in control</span>
              <button
                type="button"
                onClick={() => setShared(true)}
                className={cn(
                  "pressable flex items-center gap-2 rounded-full px-4 py-2.5 text-[11px] font-medium",
                  shared
                    ? "border border-white/20 bg-white/10 text-white"
                    : "bg-white text-[#181a1b] hover:bg-white/90",
                )}
              >
                {shared ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Shared with staff
                  </>
                ) : (
                  <>
                    Share with staff <ExternalLink className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-auto p-4">
              <h2 className="font-[Geist,Inter,sans-serif] text-[18px] font-semibold tracking-[-0.01em] text-white">
                Review the Field 7 conflict
              </h2>
              <div className="mt-3 space-y-2">
                {evidence.map((item) => (
                  <Evidence key={item.title} icon={item.icon} title={item.title} detail={item.detail} />
                ))}
              </div>
              <div className="mt-5 rounded-[16px] border border-[#34d0bd]/40 bg-white/[0.06] p-4">
                <div className="flex items-center gap-2 text-[12px] font-semibold text-[#8fefe0]">
                  <span aria-hidden className="relative inline-flex h-4 w-4 items-center justify-center text-[#34d0bd]">
                    <span className="absolute left-0 top-0.5 text-[11px] font-semibold leading-none">✦</span>
                    <span className="absolute bottom-0 right-0 text-[7px] font-semibold leading-none opacity-80">✦</span>
                  </span>
                  Suggested next step
                </div>
                <p className="mt-2 text-[12px] leading-5 text-white/65">
                  Review the conflict around Field 7, then share the prepared priorities with your staff.
                </p>
                <button
                  type="button"
                  onClick={() => setView("schedule")}
                  className="pressable mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-white px-3 py-2.5 text-[11px] font-medium text-[#181a1b] hover:bg-white/90"
                >
                  Open Friday schedule <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="border-t border-white/10 p-3">
              <div className="flex items-center gap-2 rounded-[16px] border border-white/10 bg-white/[0.04] px-3 py-2 text-[11px] text-white/45">
                <span className="flex-1">Ask a follow-up about this result…</span>
                <Send className="h-3.5 w-3.5" />
              </div>
            </div>
          </>
        )}
      </KitSurface>
    </motion.aside>
  )
}

function Evidence({ icon: Icon, title, detail }: { icon: typeof Inbox; title: string; detail: string }) {
  return (
    <div className="flex gap-3 rounded-[16px] border border-white/10 bg-white/[0.04] p-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] bg-white/10 text-[#34d0bd]">
        <Icon className="h-4 w-4" />
      </span>
      <div>
        <div className="text-[12px] font-medium text-white">{title}</div>
        <p className="mt-0.5 text-[11px] leading-4 text-white/55">{detail}</p>
      </div>
    </div>
  )
}

function FridayScheduleBody() {
  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 rounded-[18px] bg-[#303235] p-1">
        {["Mine", "Staff", "All Games"].map((tab, i) => (
          <span
            key={tab}
            className={cn(
              "flex-1 rounded-[14px] px-2 py-2 text-center text-[11px] font-semibold",
              i === 0 ? "bg-[#4a4d50] text-white" : "text-white/50",
            )}
          >
            {tab}
          </span>
        ))}
      </div>

      <ScheduleSection label="Up next">
        <ScheduleGameCard
          field="Field 3"
          time="8:00 AM"
          home="Crossfire Premier"
          away="Solar Chelsea"
          player="Elise Navarro · FB"
          moments="staff rec"
        />
        <ScheduleGameCard
          field="Field 7"
          time="9:30 AM"
          home="Solar Chelsea"
          away="Slammers FC"
          player="Nora Ellison · GK"
          moments="priority"
          primary
        />
        <ScheduleGameCard
          field="Field 2"
          time="11:00 AM"
          home="Slammers FC"
          away="GA Aspire"
          player="Lila Nguyen · GK"
          moments="compare"
        />
      </ScheduleSection>

      <div className="rounded-2xl border border-[#e85c5c]/40 bg-[#3a1818]/65 p-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold text-[#e85c5c]">
          <Clock3 className="h-3.5 w-3.5" /> One conflict to resolve
        </div>
        <p className="mt-2 text-[11px] leading-4 text-[#f0c0c0]/90">
          The Field 7 update tightens travel time after Crossfire. Kit recommends leaving at halftime.
        </p>
      </div>
    </div>
  )
}

function PrepBriefModal({ onClose }: { onClose: () => void }) {
  const [shared, setShared] = useState(false)
  return (
    <motion.div
      className="absolute inset-0 z-[320] bg-[#07110a]/50 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <motion.section
        className="absolute bottom-[88px] right-5 w-[420px]"
        initial={{ y: 16, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 10, opacity: 0 }}
      >
        <KitSurface className="max-h-[720px] overflow-hidden !rounded-[24px]">
          <div className="flex items-start gap-3 border-b border-white/10 px-5 py-4">
            <KitBall size="small" tone="dark" />
            <div className="min-w-0 flex-1">
              <div className="font-[Geist,Inter,sans-serif] text-[18px] font-semibold tracking-[-0.01em] text-white">
                Friday schedule
              </div>
              <div className="mt-1 text-[11px] text-white/50">ECNL Phoenix · built from your annotation</div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close modal" className="pressable flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.06] text-white/45 hover:bg-white/10 hover:text-white/70">
              <X className="h-3 w-3" strokeWidth={2.25} />
            </button>
          </div>

          <div className="max-h-[520px] overflow-y-auto px-4 py-4">
            <FridayScheduleBody />
          </div>

          <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
            <span className="text-[10px] text-white/45">Coach remains in control</span>
            <button
              type="button"
              onClick={() => setShared(true)}
              className={cn(
                "pressable flex items-center gap-2 rounded-full px-4 py-2.5 text-[11px] font-medium",
                shared
                  ? "border border-white/20 bg-white/10 text-white"
                  : "bg-white text-[#181a1b] hover:bg-white/90",
              )}
            >
              {shared ? (
                <>
                  <Check className="h-3.5 w-3.5" /> Shared with staff
                </>
              ) : (
                <>
                  Share with staff <ExternalLink className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </KitSurface>
      </motion.section>
    </motion.div>
  )
}

function ScheduleSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
        {label}
      </div>
      <div className="space-y-2 border-l border-white/15 pl-3">{children}</div>
    </div>
  )
}

function ScheduleGameCard({
  field,
  time,
  home,
  away,
  player,
  moments,
  primary = false,
}: {
  field: string
  time: string
  home: string
  away: string
  player: string
  moments: string
  primary?: boolean
}) {
  return (
    <div
      className={cn(
        "rounded-[16px] border bg-[#222426] p-3",
        primary ? "border-[#34d0bd]/45 shadow-none" : "border-white/10",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#34d0bd]">{field}</span>
        {primary && (
          <span className="rounded-full border border-[#34d0bd]/45 bg-white/[0.06] px-1.5 py-0.5 text-[8px] font-medium text-[#8fefe0]">Priority</span>
        )}
      </div>
      <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <div className="min-w-0 text-[11px] font-medium text-white">{home}</div>
        <div className="text-center">
          <div className="text-[15px] font-semibold tabular-nums text-white">{time}</div>
          <div className="text-[9px] text-white/45">ECNL</div>
        </div>
        <div className="min-w-0 text-right text-[11px] font-medium text-white">{away}</div>
      </div>
      <div className="mt-2.5 flex items-center gap-2 border-t border-white/8 pt-2 text-[10px] text-white/55">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[8px] font-semibold text-white">
          {player.slice(0, 1)}
        </span>
        <span className="min-w-0 truncate text-white/75">{player}</span>
        <span className="ml-auto shrink-0">{moments}</span>
      </div>
    </div>
  )
}

function DesktopWidget({ icon: Icon, eyebrow, value, detail }: { icon: typeof Clock3; eyebrow: string; value: string; detail: string }) {
  return (
    <div className="rounded-[20px] border border-white/60 bg-white/55 p-3 text-[#1a1a1a] shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-2xl">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] text-black/45">
        <Icon className="h-3 w-3" />
        {eyebrow}
      </div>
      <div className="mt-2 text-[14px] font-semibold">{value}</div>
      <div className="mt-1 text-[10px] text-black/50">{detail}</div>
    </div>
  )
}

function DesktopBackground() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <img
        src="/desktop-wallpaper.png"
        alt=""
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(255,255,255,0.18)_100%)]" />
    </div>
  )
}

const DOCK_ICONS: { src: string; label: string }[] = [
  { src: "/dock/finder.png", label: "Finder" },
  { src: "/dock/safari.png", label: "Safari" },
  { src: "/dock/books.png", label: "Books" },
  { src: "/dock/calendar.png", label: "Calendar" },
  { src: "/dock/figma.png?v=6", label: "Figma" },
  { src: "/dock/notion.png?v=12", label: "Notion" },
]

function DesktopDock({ onKit }: { onKit: () => void }) {
  return (
    <nav
      className="absolute bottom-3 left-1/2 z-[190] flex -translate-x-1/2 items-end gap-1 rounded-[24px] border-[0.5px] border-black/5 bg-white/20 px-1.5 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-[25px]"
      aria-label="Dock"
    >
      {DOCK_ICONS.map(({ src, label }) => (
        <button
          key={label}
          type="button"
          title={label}
          className="dock-item pressable flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] transition-transform"
        >
          <img src={src} alt="" draggable={false} className="pointer-events-none h-12 w-12 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.35)]" />
        </button>
      ))}
      <div className="mx-1.5 h-10 w-px shrink-0 self-center bg-black/30" />
      <button
        type="button"
        onClick={onKit}
        title="Kit"
        className="dock-item pressable flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[14px] transition-transform"
      >
        <img
          src="/dock/kit.png?v=14"
          alt=""
          draggable={false}
          className="pointer-events-none h-12 w-12 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.35)]"
        />
      </button>
      <button
        type="button"
        title="Trash"
        className="dock-item pressable flex h-12 w-12 shrink-0 items-center justify-center transition-transform"
      >
        <img src="/dock/trash.png" alt="" draggable={false} className="pointer-events-none h-10 w-10 object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.35)]" />
      </button>
    </nav>
  )
}

function suggestionsFor(value: string) {
  const text = value.trim().toLowerCase()
  if (!text) return DEFAULT_SUGGESTIONS
  if (/goal|keeper|\bgk\b|center back|\bcb\b/.test(text)) {
    return ["Find GK and CB coverage gaps", "Compare goalkeeper match times", "Highlight position-fit players"]
  }
  if (/mail|email|outreach|message/.test(text)) {
    return ["Match recruit emails to the event grid", "Show who has confirmed their schedule", "Create an outreach shortlist"]
  }
  if (/phoenix|ecnl|tournament|friday|weekend|prepare/.test(text)) {
    return ["Build my Friday scouting priorities", "Find schedule conflicts", "Match roster gaps to attending players"]
  }
  if (/rank|tds|top drawer/.test(text)) {
    return ["Show relevant TDS-ranked players", "Compare rankings with staff notes", "Return to tournament preparation"]
  }
  return ["Use my open windows as context", "Search recruit email and match grid", "Turn this into a scouting brief"]
}

function formatMenuTime(date: Date) {
  return date.toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" })
}
