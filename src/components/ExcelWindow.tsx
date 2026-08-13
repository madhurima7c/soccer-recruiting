import type { CSSProperties } from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"
import {
  excelSheets,
  rowsForSheet,
  type ExcelSheetKind,
  type ScheduleRow,
} from "@/data/excelSchedules"

type ExcelWindowProps = {
  sheetId: ExcelSheetKind
  /** DOM id used by Flow 1 annotate targeting — defaults to "sheet" */
  windowId?: string
  onClose?: () => void
  style?: CSSProperties
  className?: string
  delay?: number
  zIndex?: number
  onFocus?: () => void
  /** Row indices (0-based) highlighted as selected — Kit “working” cue */
  selectedRows?: number[]
  contextHighlight?: "selected" | "hovered" | null
}

const COLUMNS: { key: keyof ScheduleRow | "row"; label: string; width: string }[] = [
  { key: "row", label: "#", width: "36px" },
  { key: "date", label: "Date", width: "100px" },
  { key: "time", label: "Time", width: "88px" },
  { key: "event", label: "Event", width: "160px" },
  { key: "type", label: "Event type", width: "140px" },
  { key: "age", label: "Age", width: "80px" },
  { key: "division", label: "Division", width: "120px" },
  { key: "club", label: "Club", width: "120px" },
  { key: "team", label: "Team", width: "140px" },
  { key: "field", label: "Field", width: "90px" },
  { key: "watch", label: "Players to watch", width: "180px" },
  { key: "notes", label: "Staff notes", width: "160px" },
]

export function ExcelWindow({
  sheetId,
  windowId = "sheet",
  onClose,
  style,
  className,
  delay = 0.7,
  zIndex = 34,
  onFocus,
  selectedRows = [],
  contextHighlight = null,
}: ExcelWindowProps) {
  const reduce = useReducedMotion()
  const meta = excelSheets.find((s) => s.id === sheetId)!
  const rows = rowsForSheet(sheetId)
  const showField = rows.some((r) => r.field)
  const selected = new Set(selectedRows)

  const visibleCols = COLUMNS.filter((c) => c.key !== "field" || showField)

  return (
    <motion.div
      data-window-id={windowId}
      className={cn(
        "absolute flex h-[420px] w-[680px] flex-col overflow-hidden rounded-xl border bg-[#ffffff] text-[#1a1a1a] shadow-[0_24px_60px_rgba(0,0,0,0.18)]",
        contextHighlight === "selected"
          ? "border-[3px] border-[#34d0bd] shadow-[inset_0_0_0_3px_rgba(52,208,189,0.22)]"
          : contextHighlight === "hovered"
            ? "border-[3px] border-[#34d0bd] shadow-[inset_0_0_0_2px_rgba(52,208,189,0.2)]"
            : "border-black/10",
        className,
      )}
      style={{ ...style, zIndex }}
      onMouseDown={onFocus}
      initial={
        reduce
          ? false
          : { opacity: 0, transform: "scale(0.97) translateY(14px)" }
      }
      animate={{ opacity: 1, transform: "scale(1) translateY(0)" }}
      transition={{
        duration: reduce ? 0 : 0.36,
        delay: reduce ? 0 : delay,
        ease: [0.32, 0.72, 0, 1],
      }}
    >
      {/* Title bar */}
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-[#e2e2e2] bg-[#f5f5f5] px-3">
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
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="rounded bg-[#217346] px-1.5 py-0.5 text-[10px] font-semibold text-white">
            Excel
          </span>
          <span className="truncate text-[12px] font-medium text-[#1a1a1a]">{meta.filename}</span>
        </div>
      </div>

      {/* Ribbon-ish */}
      <div className="flex h-8 shrink-0 items-center gap-2 border-b border-[#e2e2e2] bg-[#fafafa] px-3 text-[11px] text-[#6b6b6b]">
        <span className="rounded bg-[#eef6f0] px-2 py-0.5 text-[#217346]">
          Sheet1 · {meta.title}
        </span>
        <span className="truncate text-[#8e8e93]">{meta.subtitle}</span>
        <span className="ml-auto tabular-nums text-[#8e8e93]">{rows.length} rows</span>
      </div>

      {/* Grid */}
      <div className="min-h-0 flex-1 overflow-auto bg-white">
        <table className="w-max min-w-full border-collapse text-left text-[11px] text-[#1a1a1a]">
          <thead>
            <tr className="bg-[#f7f7f7] text-[10px] uppercase tracking-[0.05em] text-[#6b6b6b]">
              {visibleCols.map((col) => (
                <th
                  key={col.key}
                  className="sticky top-0 z-10 border-b border-r border-[#e4e4e4] bg-[#f7f7f7] px-2 py-1.5 font-semibold"
                  style={{ minWidth: col.width }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const isSelected = selected.has(i)
              return (
              <tr
                key={`${sheetId}-${i}`}
                className={cn(
                  "transition-colors duration-150 hover:bg-[#f4faf6]",
                  isSelected && "bg-[#eef6f0] hover:bg-[#e8f5ee]",
                )}
              >
                {visibleCols.map((col) => {
                  const raw =
                    col.key === "row"
                      ? String(i + 1)
                      : (row[col.key as keyof ScheduleRow] ?? "—")
                  const isWatch = col.key === "watch"
                  const hot =
                    isWatch &&
                    typeof raw === "string" &&
                    (raw.includes("PRIMARY") || raw.includes("Nora") || raw.includes("Final"))

                  return (
                    <td
                      key={col.key}
                      className={cn(
                        "border-b border-r border-[#eee] px-2 py-1.5 align-top",
                        col.key === "row" &&
                          !isSelected &&
                          "bg-[#fafafa] text-center text-[#8e8e93]",
                        col.key === "row" &&
                          isSelected &&
                          "bg-[#e8f5ee] text-center font-medium text-[#217346]",
                        hot && !isSelected && "font-medium text-[#c96a00]",
                        isSelected && "border-[#34d0bd]/30",
                      )}
                      style={{ minWidth: col.width, maxWidth: col.width }}
                    >
                      <span className="line-clamp-2">{raw}</span>
                    </td>
                  )
                })}
              </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}
