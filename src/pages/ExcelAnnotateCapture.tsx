import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react"
import { Check, PenLine, RotateCcw, Undo2 } from "lucide-react"
import { DesktopArtboard } from "@/components/DesktopArtboard"
import { cn } from "@/lib/utils"
import {
  rowsForSheet,
  type ExcelSheetKind,
  type ScheduleRow,
} from "@/data/excelSchedules"

type Point = { x: number; y: number }
type CellId = string

const COLUMNS: { key: keyof ScheduleRow | "row"; label: string; width: string }[] = [
  { key: "row", label: "#", width: "40px" },
  { key: "date", label: "Date", width: "110px" },
  { key: "time", label: "Time", width: "96px" },
  { key: "event", label: "Event", width: "180px" },
  { key: "type", label: "Event type", width: "140px" },
  { key: "age", label: "Age", width: "90px" },
  { key: "division", label: "Division", width: "120px" },
  { key: "club", label: "Club", width: "130px" },
  { key: "team", label: "Team", width: "150px" },
  { key: "field", label: "Field", width: "90px" },
  { key: "watch", label: "Players to watch", width: "200px" },
  { key: "notes", label: "Staff notes", width: "180px" },
]

const SHEETS: {
  id: ExcelSheetKind
  windowId: string
  filename: string
  className: string
  zIndex: number
}[] = [
  {
    id: "phoenix-weekend",
    windowId: "sheet-phoenix",
    filename: "ECNL_Phoenix_Fall_Match_Grid.xlsx",
    className: "left-[40px] top-[70px] h-[820px] w-[980px]",
    zIndex: 40,
  },
  {
    id: "playoffs-finals",
    windowId: "sheet-playoffs",
    filename: "ECNL_Playoffs_Finals_Targets.xlsx",
    className: "left-[520px] top-[140px] h-[760px] w-[880px]",
    zIndex: 50,
  },
]

/**
 * Capture-focused prototype: two large Excel sheets + freehand annotation
 * that selects individual cells. Flow 1 remains untouched at /flow1.
 */
export default function ExcelAnnotateCapture() {
  const [paths, setPaths] = useState<Point[][]>([])
  const [selectedCells, setSelectedCells] = useState<CellId[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const drawing = useRef(false)
  const activeStroke = useRef<Point[]>([])

  const clientToLocal = useCallback((clientX: number, clientY: number): Point => {
    const el = surfaceRef.current
    if (!el) return { x: clientX, y: clientY }
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return { x: clientX, y: clientY }
    return {
      x: ((clientX - rect.left) / rect.width) * el.offsetWidth,
      y: ((clientY - rect.top) / rect.height) * el.offsetHeight,
    }
  }, [])

  const localToClient = useCallback((point: Point): Point => {
    const el = surfaceRef.current
    if (!el) return point
    const rect = el.getBoundingClientRect()
    if (el.offsetWidth === 0 || el.offsetHeight === 0) return point
    return {
      x: rect.left + (point.x / el.offsetWidth) * rect.width,
      y: rect.top + (point.y / el.offsetHeight) * rect.height,
    }
  }, [])

  const cellsHitByStroke = useCallback(
    (localPoints: Point[]) => {
      if (localPoints.length < 2) return [] as CellId[]
      const clientPoints = localPoints.map(localToClient)
      const hit = new Set<CellId>()
      const cells = document.querySelectorAll<HTMLElement>("[data-cell-id]")
      cells.forEach((cell) => {
        const id = cell.dataset.cellId
        if (!id) return
        const rect = cell.getBoundingClientRect()
        for (const point of clientPoints) {
          if (
            point.x >= rect.left &&
            point.x <= rect.right &&
            point.y >= rect.top &&
            point.y <= rect.bottom
          ) {
            hit.add(id)
            break
          }
        }
      })
      return [...hit]
    },
    [localToClient],
  )

  const mergeCells = (ids: CellId[]) => {
    if (!ids.length) return
    setSelectedCells((current) => {
      const next = new Set(current)
      ids.forEach((id) => next.add(id))
      return [...next]
    })
  }

  const start = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    drawing.current = true
    activeStroke.current = [clientToLocal(event.clientX, event.clientY)]
    setPaths((current) => [...current, activeStroke.current])
  }

  const move = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drawing.current) return
    const nextPoint = clientToLocal(event.clientX, event.clientY)
    activeStroke.current = [...activeStroke.current, nextPoint]
    setPaths((current) => {
      const next = current.slice()
      next[next.length - 1] = activeStroke.current
      return next
    })
  }

  const end = () => {
    if (!drawing.current) return
    const stroke = activeStroke.current
    drawing.current = false
    activeStroke.current = []
    const hit = cellsHitByStroke(stroke)
    if (hit.length) mergeCells(hit)
  }

  const reset = () => {
    setPaths([])
    setSelectedCells([])
    setToast(null)
  }

  const confirm = () => {
    setToast(
      selectedCells.length
        ? `Captured ${selectedCells.length} cell${selectedCells.length === 1 ? "" : "s"}`
        : "Draw over a few cells first",
    )
  }

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(t)
  }, [toast])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        reset()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const selectedSet = new Set(selectedCells)

  return (
    <DesktopArtboard className="bg-[#c8dceb] font-sans text-[#1a1a1a]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/desktop-wallpaper.png)" }}
        aria-hidden
      />

      <header className="absolute inset-x-0 top-0 z-[200] flex h-6 items-center justify-between px-3 text-[13px] text-black/80">
        <div className="pointer-events-none absolute inset-0 bg-white/45 backdrop-blur-[24px]" />
        <div className="relative flex items-center gap-2">
          <span aria-hidden></span>
          <span className="font-semibold">Excel</span>
          <span className="opacity-70">Annotate capture</span>
        </div>
        <button
          type="button"
          onClick={reset}
          className="pressable relative flex items-center gap-1.5 rounded-full border border-black/10 bg-black/5 px-2 py-0.5 text-[10px] text-black/70 hover:bg-black/10"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </header>

      {SHEETS.map((sheet) => (
        <LargeExcelSheet
          key={sheet.windowId}
          sheetId={sheet.id}
          windowId={sheet.windowId}
          filename={sheet.filename}
          className={sheet.className}
          zIndex={sheet.zIndex}
          selectedCells={selectedSet}
        />
      ))}

      <div
        ref={surfaceRef}
        className="absolute inset-0 z-[300] cursor-crosshair touch-none"
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

      <div className="pointer-events-none absolute inset-x-0 top-10 z-[320] flex justify-center px-4">
        <div className="pointer-events-auto flex w-fit max-w-[calc(100%-24px)] items-center gap-3 rounded-[22px] border border-white/12 bg-[#181a1b] px-3 py-2 text-white shadow-[0_14px_40px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-2 px-1">
            <PenLine className="h-3.5 w-3.5 text-white/85" />
            <div>
              <div className="font-[Geist,Inter,sans-serif] text-[13px] font-medium">
                Draw over cells to select
              </div>
              <div className="text-[10px] text-white/50">
                {selectedCells.length
                  ? `${selectedCells.length} selected · Esc clears`
                  : "One or two strokes is enough for capture"}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPaths((current) => current.slice(0, -1))}
            disabled={!paths.length}
            className="pressable rounded-full p-2 text-white/55 hover:bg-white/10 disabled:opacity-30"
            aria-label="Undo stroke"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={confirm}
            className="pressable flex items-center gap-1.5 rounded-[16px] bg-[#34d0bd] px-4 py-2 text-[11px] font-medium text-[#181a1b] hover:bg-[#4ad9c8]"
          >
            <Check className="h-3.5 w-3.5" /> Use selection
          </button>
        </div>
      </div>

      {toast && (
        <div
          role="status"
          className="absolute bottom-8 left-1/2 z-[330] -translate-x-1/2 rounded-full bg-[#181a1b] px-4 py-2 text-[12px] font-medium text-white shadow-xl"
        >
          {toast}
        </div>
      )}
    </DesktopArtboard>
  )
}

function LargeExcelSheet({
  sheetId,
  windowId,
  filename,
  className,
  zIndex,
  selectedCells,
}: {
  sheetId: ExcelSheetKind
  windowId: string
  filename: string
  className: string
  zIndex: number
  selectedCells: Set<CellId>
}) {
  const rows = rowsForSheet(sheetId)
  const showField = rows.some((r) => r.field)
  const cols = COLUMNS.filter((c) => c.key !== "field" || showField)

  return (
    <div
      data-window-id={windowId}
      className={cn(
        "absolute flex flex-col overflow-hidden rounded-xl border border-black/10 bg-white shadow-[0_24px_60px_rgba(0,0,0,0.18)]",
        className,
      )}
      style={{ zIndex }}
    >
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-[#e2e2e2] bg-[#f5f5f5] px-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="rounded bg-[#217346] px-1.5 py-0.5 text-[10px] font-semibold text-white">
          Excel
        </span>
        <span className="truncate text-[12px] font-medium text-[#1a1a1a]">{filename}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-white">
        <table className="w-max min-w-full border-collapse text-left text-[12px] text-[#1a1a1a]">
          <thead>
            <tr className="bg-[#f7f7f7] text-[10px] uppercase tracking-[0.05em] text-[#6b6b6b]">
              {cols.map((col) => (
                <th
                  key={col.key}
                  className="sticky top-0 z-10 border-b border-r border-[#e4e4e4] bg-[#f7f7f7] px-2.5 py-2 font-semibold"
                  style={{ minWidth: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${windowId}-${rowIndex}`}>
                {cols.map((col) => {
                  const cellId = `${windowId}:${rowIndex}:${col.key}`
                  const selected = selectedCells.has(cellId)
                  const raw =
                    col.key === "row"
                      ? String(rowIndex + 1)
                      : (row[col.key as keyof ScheduleRow] ?? "—")
                  return (
                    <td
                      key={col.key}
                      data-cell-id={cellId}
                      className={cn(
                        "border-b border-r border-[#eee] px-2.5 py-2 align-top transition-colors",
                        col.key === "row" && "bg-[#fafafa] text-center text-[#8e8e93]",
                        selected &&
                          "bg-[#e7fbf7] shadow-[inset_0_0_0_2px_rgba(52,208,189,0.85)]",
                      )}
                      style={{ minWidth: col.width, maxWidth: col.width }}
                    >
                      <span className="line-clamp-2">{raw}</span>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
