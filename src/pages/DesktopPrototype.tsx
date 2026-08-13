import { useCallback, useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import {
  Battery,
  Search,
  Wifi,
  Bluetooth,
  LayoutGrid,
} from "lucide-react"
import { MailWindow } from "@/components/MailWindow"
import { BrowserWindow } from "@/components/BrowserWindow"
import { ExcelWindow } from "@/components/ExcelWindow"
import { SidelineEdgePill } from "@/components/SidelineEdgePill"
import { SidelineCursor } from "@/components/SidelineCursor"
import { SidelineToolWindow } from "@/components/SidelineToolWindow"
import { SidePanel } from "@/components/SidePanel"
import type { ExcelSheetKind } from "@/data/excelSchedules"
import { cn } from "@/lib/utils"

type WindowId =
  | "mail"
  | "browser"
  | "excel-national"
  | "excel-phoenix"
  | "excel-playoffs"
  | "sideline"

const BASE_Z = 40

/** Windows cascade a bit faster, then Sideline appears into the mess */
const OPEN_DELAY = {
  mail: 0.45,
  browser: 2.0,
  national: 3.6,
  phoenix: 5.2,
  playoffs: 6.8,
  focusPlayoffsMs: 7600,
  /** Entire Sideline edge UI mounts after the last window settles */
  sidelineAppearMs: 7800,
  /** Hey bubble — seconds after the pill mounts */
  offerAfterAppear: 2.8,
  /** Ball motion — seconds after the pill mounts */
  ballMotionAfterAppear: 0.35,
} as const

/** Adjacent Phoenix rows Sideline selects (reads like a drag-select) */
const PHOENIX_SELECT_STEPS: number[][] = [
  [1],
  [1, 2],
  [1, 2, 3],
  [1, 2, 3, 4],
]

/** Inbox messages the ball opens while scanning (ends on Nora) */
const MAIL_SCAN_IDS = ["2", "3", "4", "1"] as const

const MENU_LEFT = [
  "Mail",
  "File",
  "Edit",
  "View",
  "Mailbox",
  "Message",
  "Window",
  "Help",
] as const

const DOCK_APPS = [
  { id: "finder", label: "Finder", gradient: "linear-gradient(180deg,#6ec6ff,#1a7fd4)" },
  { id: "safari", label: "Safari", gradient: "linear-gradient(180deg,#58c4ff,#1474e6)" },
  { id: "mail", label: "Mail", gradient: "linear-gradient(180deg,#7ec8ff,#2f6feb)" },
  { id: "calendar", label: "Calendar", special: "calendar" as const },
  {
    id: "assistant",
    label: "Sideline",
    special: "assistant" as const,
  },
  { id: "settings", label: "System Settings", gradient: "linear-gradient(180deg,#9aa3ad,#5c6670)" },
] as const

export default function DesktopPrototype() {
  const [time, setTime] = useState(() => formatMenuTime(new Date()))
  const [mailOpen, setMailOpen] = useState(true)
  const [browserOpen, setBrowserOpen] = useState(true)
  const [excelOpen, setExcelOpen] = useState<Record<ExcelSheetKind, boolean>>({
    "national-events": true,
    "phoenix-weekend": true,
    "playoffs-finals": true,
  })
  const [sidePanelOpen, setSidePanelOpen] = useState(false)
  const [sidelineOpen, setSidelineOpen] = useState(false)
  const [agentWorking, setAgentWorking] = useState(false)
  const [edgeHidden, setEdgeHidden] = useState(false)
  const [sidelineReady, setSidelineReady] = useState(false)
  const [scenario, setScenario] = useState("both-keepers")
  const [phoenixSelectedRows, setPhoenixSelectedRows] = useState<number[]>([])
  const [mailSelectedId, setMailSelectedId] = useState("1")
  /** Newest at end → highest z-index */
  const [stack, setStack] = useState<WindowId[]>([
    "mail",
    "browser",
    "excel-national",
    "excel-phoenix",
    "excel-playoffs",
  ])
  const reduceMotion = useReducedMotion()

  const zFor = useCallback(
    (id: WindowId) => {
      const idx = stack.indexOf(id)
      return idx === -1 ? BASE_Z : BASE_Z + (idx + 1) * 10
    },
    [stack],
  )

  const focusWindow = useCallback((id: WindowId) => {
    setStack((prev) => [...prev.filter((w) => w !== id), id])
  }, [])

  const agentPhaseRef = useRef<"mail" | "excel" | null>(null)

  const startAgent = useCallback(() => {
    setEdgeHidden(true)
    setAgentWorking(true)
    setPhoenixSelectedRows([])
    setMailSelectedId("1")
    setSidePanelOpen(false)
    setSidelineOpen(false)
    agentPhaseRef.current = null
    focusWindow("mail")
  }, [focusWindow])

  const finishAgent = useCallback(() => {
    setAgentWorking(false)
    setSidePanelOpen(true)
  }, [])

  const handleAgentProgress = useCallback(
    (progress: number) => {
      if (progress <= 0) {
        setPhoenixSelectedRows([])
        return
      }

      // 0–45%: scroll/open inbox, linger on Nora
      if (progress < 0.45) {
        if (agentPhaseRef.current !== "mail") {
          agentPhaseRef.current = "mail"
          focusWindow("mail")
        }
        setPhoenixSelectedRows([])
        const mailStep = Math.min(
          MAIL_SCAN_IDS.length - 1,
          Math.floor((progress / 0.45) * MAIL_SCAN_IDS.length),
        )
        setMailSelectedId(MAIL_SCAN_IDS[mailStep] ?? "1")
        return
      }

      // 45%+: move to Excel and grow an adjacent selection
      if (agentPhaseRef.current !== "excel") {
        agentPhaseRef.current = "excel"
        focusWindow("excel-phoenix")
        setMailSelectedId("1")
      }
      const excelT = (progress - 0.45) / 0.55
      const step = Math.min(
        PHOENIX_SELECT_STEPS.length - 1,
        Math.floor(excelT * PHOENIX_SELECT_STEPS.length),
      )
      setPhoenixSelectedRows(PHOENIX_SELECT_STEPS[step] ?? [])
    },
    [focusWindow],
  )

  const expandToFullTool = useCallback(() => {
    setSidePanelOpen(false)
    setSidelineOpen(true)
    setStack((prev) => [...prev.filter((w) => w !== "sideline"), "sideline"])
  }, [])

  const collapseToSidebar = useCallback(() => {
    setSidelineOpen(false)
    setSidePanelOpen(true)
  }, [])

  const closeSideline = useCallback(() => {
    setSidelineOpen(false)
    setSidePanelOpen(false)
    setPhoenixSelectedRows([])
    setEdgeHidden(false)
  }, [])

  // After cascade opens, force newest Excel to front so Mail can't cover it
  useEffect(() => {
    const t = window.setTimeout(() => {
      focusWindow("excel-playoffs")
    }, OPEN_DELAY.focusPlayoffsMs)
    return () => window.clearTimeout(t)
  }, [focusWindow])

  // Sideline edge UI only after every desktop window has landed
  useEffect(() => {
    if (reduceMotion) {
      setSidelineReady(true)
      return
    }
    const t = window.setTimeout(() => {
      setSidelineReady(true)
    }, OPEN_DELAY.sidelineAppearMs)
    return () => window.clearTimeout(t)
  }, [reduceMotion])

  useEffect(() => {
    const tick = () => setTime(formatMenuTime(new Date()))
    tick()
    const id = window.setInterval(tick, 30_000)
    return () => window.clearInterval(id)
  }, [])

  const sidelineActive = sidePanelOpen || sidelineOpen || agentWorking

  return (
    <div className="relative h-full w-full overflow-hidden text-white">
      <Wallpaper />

      {/* Menu bar */}
      <header className="absolute inset-x-0 top-0 z-[90] flex h-8 items-center justify-between bg-white/50 px-3 text-[12px] text-black/80 backdrop-blur-2xl">
        <div className="flex items-center gap-3.5">
          <span className="text-[14px] leading-none" aria-hidden>
            
          </span>
          {(sidelineActive
            ? (["Sideline", "File", "Edit", "View", "Window", "Help"] as const)
            : MENU_LEFT
          ).map((item, i) => (
            <span
              key={item}
              className={i === 0 ? "font-semibold" : "opacity-75 hidden sm:inline"}
            >
              {item}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2.5 opacity-80">
          <Bluetooth className="hidden h-3.5 w-3.5 md:block" strokeWidth={2} />
          <span className="hidden text-[11px] tabular-nums md:inline">100%</span>
          <Battery className="h-3.5 w-3.5" strokeWidth={2} />
          <Wifi className="h-3.5 w-3.5" strokeWidth={2} />
          <Search className="h-3.5 w-3.5" strokeWidth={2} />
          <LayoutGrid className="hidden h-3.5 w-3.5 sm:block" strokeWidth={2} />
          <span className="ml-1 tabular-nums">{time}</span>
        </div>
      </header>

      {/* Widgets */}
      <div className="absolute left-5 top-12 z-[15] grid w-[340px] grid-cols-2 gap-3 opacity-90">
        <CalendarWidget />
        <WeatherWidget />
        <PhotosWidget />
      </div>

      {mailOpen && (
        <MailWindow
          delay={OPEN_DELAY.mail}
          zIndex={zFor("mail")}
          onFocus={() => focusWindow("mail")}
          onClose={() => setMailOpen(false)}
          selectedId={mailSelectedId}
          onSelectedIdChange={setMailSelectedId}
        />
      )}
      {browserOpen && (
        <BrowserWindow
          delay={OPEN_DELAY.browser}
          zIndex={zFor("browser")}
          onFocus={() => focusWindow("browser")}
          onClose={() => setBrowserOpen(false)}
        />
      )}

      {excelOpen["national-events"] && (
        <ExcelWindow
          sheetId="national-events"
          delay={OPEN_DELAY.national}
          className="left-[26%] top-[10%]"
          zIndex={zFor("excel-national")}
          onFocus={() => focusWindow("excel-national")}
          onClose={() =>
            setExcelOpen((s) => ({ ...s, "national-events": false }))
          }
        />
      )}
      {excelOpen["phoenix-weekend"] && (
        <ExcelWindow
          sheetId="phoenix-weekend"
          delay={OPEN_DELAY.phoenix}
          className="left-[32%] top-[18%]"
          zIndex={zFor("excel-phoenix")}
          onFocus={() => focusWindow("excel-phoenix")}
          selectedRows={phoenixSelectedRows}
          onClose={() =>
            setExcelOpen((s) => ({ ...s, "phoenix-weekend": false }))
          }
        />
      )}
      {excelOpen["playoffs-finals"] && (
        <ExcelWindow
          sheetId="playoffs-finals"
          delay={OPEN_DELAY.playoffs}
          className="left-[38%] top-[26%]"
          zIndex={zFor("excel-playoffs")}
          onFocus={() => focusWindow("excel-playoffs")}
          onClose={() =>
            setExcelOpen((s) => ({ ...s, "playoffs-finals": false }))
          }
        />
      )}

      <SidelineCursor
        active={agentWorking}
        onComplete={finishAgent}
        onProgress={handleAgentProgress}
      />

      <SidePanel
        open={sidePanelOpen && !sidelineOpen}
        expanded={false}
        expandOpensFullTool
        desktopSummary
        showExpandButton={false}
        selectedScenario={scenario}
        onSelectScenario={setScenario}
        onExpand={expandToFullTool}
        onCollapse={() => {}}
        onClose={closeSideline}
        zIndex={260}
        title="Sideline"
        subtitle="Columbia WSOC · Phoenix Fall · coach stays in control"
        promptEyebrow="From your match grid"
        promptBody="Nora Ellison and Avery Collins light up on the Phoenix sheet. Want a depth read before you expand the full staff view?"
      />

      {sidelineOpen && (
        <SidelineToolWindow
          zIndex={Math.max(zFor("sideline"), 270)}
          onFocus={() => focusWindow("sideline")}
          onClose={collapseToSidebar}
        />
      )}

      {!edgeHidden && sidelineReady && (
        <SidelineEdgePill
          aware={mailOpen || browserOpen || Object.values(excelOpen).some(Boolean)}
          onAcceptHelp={startAgent}
          offerDelay={OPEN_DELAY.offerAfterAppear}
          motionDelay={OPEN_DELAY.ballMotionAfterAppear}
        />
      )}

      {/* Dock */}
      <nav
        className="absolute bottom-3 left-1/2 z-[90] flex -translate-x-1/2 items-end gap-1.5 overflow-visible rounded-[26px] border border-white/30 bg-white/20 px-2.5 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
        aria-label="Dock"
      >
        {DOCK_APPS.map((app) => {
          const isCalendar = "special" in app && app.special === "calendar"
          const isAssistant = "special" in app && app.special === "assistant"

          const tile = (
            <button
              type="button"
              title={app.label}
              onClick={() => {
                if (app.id === "mail") {
                  setMailOpen(true)
                  focusWindow("mail")
                }
                if (app.id === "safari") {
                  setBrowserOpen(true)
                  focusWindow("browser")
                }
                if (app.id === "assistant") {
                  if (sidelineOpen) {
                    focusWindow("sideline")
                    return
                  }
                  if (sidePanelOpen) return
                  if (!edgeHidden) return
                  setSidePanelOpen(true)
                }
              }}
              className={cn(
                "pressable flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden shadow-[0_8px_18px_rgba(0,0,0,0.22)]",
                isAssistant ? "rounded-full bg-white ring-2 ring-white/50" : "rounded-[14px]",
              )}
              style={{
                background: isCalendar
                  ? "#fff"
                  : isAssistant
                    ? "#fff"
                    : "gradient" in app
                      ? app.gradient
                      : "#888",
              }}
            >
              {isCalendar ? (
                <CalendarDockFace />
              ) : isAssistant ? (
                <AssistantDockIcon />
              ) : (
                <DockGlyph id={app.id} />
              )}
            </button>
          )

          if (isAssistant) {
            return (
              <motion.div
                key={app.id}
                className="relative z-20 origin-bottom"
                initial={false}
                animate={
                  reduceMotion
                    ? { transform: "translateY(0px)" }
                    : {
                        transform: [
                          "translateY(0px)",
                          "translateY(-10px)",
                          "translateY(0px)",
                        ],
                      }
                }
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        duration: 0.8,
                        delay: 1.2,
                        times: [0, 0.45, 1],
                        ease: [0.23, 1, 0.32, 1],
                      }
                }
              >
                {tile}
              </motion.div>
            )
          }

          return (
            <div key={app.id} className="relative">
              {tile}
            </div>
          )
        })}
        <div className="mx-1 h-10 w-px shrink-0 self-center bg-white/35" />
        <button
          type="button"
          title="Trash"
          className="dock-item pressable flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-b from-[#dfe3e8] to-[#9aa3ad] shadow-[0_8px_18px_rgba(0,0,0,0.22)] transition-transform duration-150"
          style={{ transitionTimingFunction: "var(--ease-out)" }}
        >
          <TrashGlyph />
        </button>
      </nav>
    </div>
  )
}

function Wallpaper() {
  return (
    <div className="absolute inset-0" aria-hidden>
      <img
        src="/desktop-wallpaper.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(255,255,255,0.18)_100%)]" />
    </div>
  )
}

function CalendarWidget() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()
  const monthName = today.toLocaleString("en-US", { month: "long" })
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array.from({ length: firstDow }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="rounded-[22px] border border-white/25 bg-white/18 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
      <div className="mb-2 text-[13px] font-semibold text-red-300">{monthName}</div>
      <div className="grid grid-cols-7 gap-y-1 text-center text-[10px] text-white/55">
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-y-1 text-center text-[11px]">
        {cells.map((day, i) => (
          <div
            key={i}
            className={
              day === today.getDate()
                ? "mx-auto flex h-5 w-5 items-center justify-center rounded-full bg-[#0a84ff] font-medium"
                : "h-5 leading-5 text-white/90"
            }
          >
            {day ?? ""}
          </div>
        ))}
      </div>
    </div>
  )
}

function WeatherWidget() {
  return (
    <div className="flex flex-col justify-between rounded-[22px] border border-white/25 bg-white/18 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
      <div>
        <div className="text-[12px] text-white/75">Seattle</div>
        <div className="mt-1 text-[34px] font-light leading-none tracking-tight">53°</div>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div className="text-[11px] text-white/80">Partly Cloudy</div>
        <CloudSun />
      </div>
      <div className="mt-2 text-[10px] text-white/55">H:58° L:47°</div>
    </div>
  )
}

function PhotosWidget() {
  return (
    <div className="col-span-1 overflow-hidden rounded-[22px] border border-white/25 bg-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl">
      <div
        className="aspect-square w-full"
        style={{
          background: `
            radial-gradient(circle at 35% 30%, rgba(255,255,255,0.35), transparent 40%),
            linear-gradient(145deg, #2a2a2a 0%, #6a6a6a 40%, #1c1c1c 100%)
          `,
        }}
      >
        <div className="flex h-full items-end p-2.5">
          <span className="rounded-full bg-black/35 px-2 py-0.5 text-[10px] backdrop-blur-sm">
            Photos
          </span>
        </div>
      </div>
    </div>
  )
}

function CalendarDockFace() {
  const now = new Date()
  return (
    <div className="flex h-full w-full flex-col items-center justify-center rounded-[14px] bg-white text-[#e23d28]">
      <div className="text-[8px] font-semibold uppercase leading-none tracking-wide">
        {now.toLocaleString("en-US", { weekday: "short" })}
      </div>
      <div className="text-[20px] font-semibold leading-none text-[#222]">
        {now.getDate()}
      </div>
    </div>
  )
}

function AssistantDockIcon() {
  return (
    <img
      src="/kit-ball.png"
      alt=""
      className="h-[82%] w-[82%] max-w-none object-contain"
      draggable={false}
    />
  )
}

function DockGlyph({ id }: { id: string }) {
  if (id === "finder") {
    return (
      <span className="relative h-8 w-8 overflow-hidden rounded-full bg-gradient-to-b from-[#c8ecff] to-[#7ec8f5]">
        <span className="absolute inset-x-2 top-2 h-3 rounded-full bg-[#1a5a8a]/30" />
        <span className="absolute inset-x-1.5 bottom-1.5 h-4 rounded-t-full bg-[#fff]/90" />
      </span>
    )
  }
  if (id === "safari") {
    return (
      <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/95">
        <span className="absolute inset-1 rounded-full border-2 border-[#1a6fd4]" />
        <span className="h-0 w-0 rotate-[28deg] border-x-[5px] border-b-[10px] border-x-transparent border-b-[#e23d28]" />
      </span>
    )
  }
  if (id === "mail") {
    return (
      <span className="flex h-7 w-8 items-center justify-center rounded-[4px] bg-white/95">
        <span className="h-0 w-0 border-x-[10px] border-t-[7px] border-x-transparent border-t-[#3b82f6]" />
      </span>
    )
  }
  if (id === "settings") {
    return (
      <span className="relative flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-white/80">
        <span className="h-2.5 w-2.5 rounded-full bg-white/80" />
      </span>
    )
  }
  return <span className="h-3 w-3 rounded-full bg-white/80" />
}

function TrashGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6 text-[#4a5560]" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 7h16" />
      <path d="M9 7V5h6v2" />
      <path d="M6 7l1 13h10l1-13" />
    </svg>
  )
}

function CloudSun() {
  return (
    <svg viewBox="0 0 48 32" className="h-8 w-12" aria-hidden>
      <circle cx="34" cy="12" r="8" fill="#ffd24a" />
      <ellipse cx="20" cy="20" rx="14" ry="9" fill="rgba(255,255,255,0.92)" />
      <ellipse cx="30" cy="18" rx="10" ry="7" fill="rgba(255,255,255,0.85)" />
    </svg>
  )
}

function formatMenuTime(date: Date) {
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}
