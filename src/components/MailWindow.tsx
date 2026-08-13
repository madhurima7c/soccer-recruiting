import { useEffect, useRef, useState } from "react"
import { motion, useReducedMotion } from "motion/react"
import { Search, Trash2, Archive, Reply, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { mailFolders, mailMessages, type MailMessage } from "@/data/mail"

type MailWindowProps = {
  onClose?: () => void
  zIndex?: number
  onFocus?: () => void
  delay?: number
  className?: string
  /** Controlled selection for Kit “working” demo */
  selectedId?: string
  onSelectedIdChange?: (id: string) => void
  /** Kit annotate/select highlight — stays with this window’s stacking order */
  contextHighlight?: "selected" | "hovered" | null
}

export function MailWindow({
  onClose,
  zIndex = 30,
  onFocus,
  delay = 0.5,
  className,
  selectedId: controlledId,
  onSelectedIdChange,
  contextHighlight = null,
}: MailWindowProps) {
  const reduce = useReducedMotion()
  const [internalId, setInternalId] = useState(mailMessages[0]?.id ?? "")
  const selectedId = controlledId ?? internalId
  const selected = mailMessages.find((m) => m.id === selectedId) ?? mailMessages[0]
  const unread = mailMessages.filter((m) => m.unread).length
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!controlledId) return
    const el = listRef.current?.querySelector(`[data-mail-id="${controlledId}"]`)
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" })
  }, [controlledId])

  const select = (id: string) => {
    if (controlledId === undefined) setInternalId(id)
    onSelectedIdChange?.(id)
  }

  return (
    <motion.div
      data-window-id="mail"
      className={cn(
        "absolute left-[1%] top-[6%] flex h-[540px] w-[720px] flex-col overflow-hidden rounded-xl border bg-[#ffffff] text-[#1a1a1a] shadow-[0_30px_80px_rgba(0,0,0,0.18)]",
        contextHighlight === "selected"
          ? "border-[3px] border-[#34d0bd] shadow-[inset_0_0_0_3px_rgba(52,208,189,0.22)]"
          : contextHighlight === "hovered"
            ? "border-[3px] border-[#34d0bd] shadow-[inset_0_0_0_2px_rgba(52,208,189,0.2)]"
            : "border-black/10",
        className,
      )}
      style={{ zIndex }}
      onMouseDown={onFocus}
      initial={
        reduce
          ? false
          : { opacity: 0, transform: "scale(0.97) translateY(10px)" }
      }
      animate={{ opacity: 1, transform: "scale(1) translateY(0)" }}
      transition={{
        duration: reduce ? 0 : 0.38,
        delay: reduce ? 0 : delay,
        ease: [0.32, 0.72, 0, 1],
      }}
    >
      {/* Title bar */}
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
        <div className="flex-1 text-center text-[13px] font-medium text-[#1a1a1a]">
          Inbox — Recruiting
        </div>
        <div className="w-16" />
      </div>

      {/* Toolbar */}
      <div className="flex h-10 shrink-0 items-center gap-3 border-b border-[#e2e2e2] bg-[#fafafa] px-3 text-[#6b6b6b]">
        <Archive className="h-4 w-4" />
        <Trash2 className="h-4 w-4" />
        <Reply className="h-4 w-4" />
        <MoreHorizontal className="h-4 w-4" />
        <div className="ml-auto flex items-center gap-2 rounded-md bg-[#f3f3f3] px-2.5 py-1 text-[12px] text-[#6b6b6b] ring-1 ring-[#ebebeb]">
          <Search className="h-3.5 w-3.5" />
          <span>Search Mail</span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-[150px] shrink-0 flex-col border-r border-[#e2e2e2] bg-[#f3f3f3] px-2 py-3">
          <div className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#8e8e93]">
            Favorites
          </div>
          {mailFolders.map((folder) => (
            <div
              key={folder.id}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[13px]",
                folder.id === "inbox"
                  ? "bg-[#0a84ff] text-white"
                  : "text-[#1a1a1a]",
              )}
            >
              <span>{folder.label}</span>
              {folder.count != null && (
                <span
                  className={cn(
                    "tabular-nums text-[11px]",
                    folder.id === "inbox" ? "text-white/85" : "text-[#8e8e93]",
                  )}
                >
                  {folder.count}
                </span>
              )}
            </div>
          ))}
          <div className="mt-auto px-2 pt-3 text-[11px] leading-snug text-[#8e8e93]">
            {unread} unread · filters sorting by ECNL / GA keywords
          </div>
        </aside>

        <div className="flex w-[260px] shrink-0 flex-col border-r border-[#e2e2e2] bg-[#fafafa]">
          <div className="flex items-center justify-between border-b border-[#e2e2e2] px-3 py-2">
            <span className="text-[13px] font-semibold text-[#1a1a1a]">Inbox</span>
            <span className="rounded-full bg-[#ff3b30] px-2 py-0.5 text-[10px] font-medium text-white">
              {unread} new
            </span>
          </div>
          <div ref={listRef} className="min-h-0 flex-1 overflow-y-auto">
            {mailMessages.map((msg) => (
              <MailRow
                key={msg.id}
                message={msg}
                selected={msg.id === selected.id}
                onSelect={() => select(msg.id)}
              />
            ))}
            <div className="border-t border-[#e2e2e2] px-3 py-4 text-center text-[11px] text-[#8e8e93]">
              + 600 more from Athlete One / tournament week…
            </div>
          </div>
        </div>

        <section className="flex min-w-0 flex-1 flex-col bg-white">
          {selected && <ReadingPane message={selected} />}
        </section>
      </div>
    </motion.div>
  )
}

function MailRow({
  message,
  selected,
  onSelect,
}: {
  message: MailMessage
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      data-mail-id={message.id}
      onClick={onSelect}
      className={cn(
        "pressable w-full border-b border-[#ebebeb] px-3 py-2.5 text-left transition-colors duration-150",
        selected ? "bg-[#e8f1ff]" : "hover:bg-[#f4f4f5]",
      )}
    >
      <div className="flex items-start gap-2">
        <span
          className={cn(
            "mt-1.5 h-2 w-2 shrink-0 rounded-full",
            message.unread ? "bg-[#0a84ff]" : "bg-transparent",
          )}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span
              className={cn(
                "truncate text-[13px]",
                message.unread ? "font-semibold text-[#1a1a1a]" : "font-medium text-[#6b6b6b]",
              )}
            >
              {message.from}
            </span>
            <span className="shrink-0 text-[11px] text-[#8e8e93]">{message.time}</span>
          </div>
          <div
            className={cn(
              "truncate text-[12px]",
              message.unread ? "font-medium text-[#1a1a1a]" : "text-[#6b6b6b]",
            )}
          >
            {message.subject}
          </div>
          <div className="mt-0.5 truncate text-[11px] text-[#8e8e93]">
            {message.preview}
          </div>
          {message.tag && (
            <span className="mt-1 inline-flex rounded bg-[#f3f3f3] px-1.5 py-0.5 text-[10px] text-[#6b6b6b]">
              {message.tag}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

function ReadingPane({ message }: { message: MailMessage }) {
  return (
    <>
      <div className="border-b border-[#e2e2e2] px-6 py-4">
        <h2 className="text-[20px] font-semibold leading-snug tracking-tight text-[#1a1a1a]">
          {message.subject}
        </h2>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0a84ff] text-[12px] font-semibold text-white">
            {initials(message.from)}
          </span>
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-[#1a1a1a]">{message.from}</div>
            <div className="truncate text-[11px] text-[#8e8e93]">
              {message.email} · To: recruiting@wsoc.edu
            </div>
          </div>
          <div className="ml-auto text-[11px] text-[#8e8e93]">{message.time}</div>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5 text-[13px] leading-relaxed text-[#3a3a3c]">
        <p className="whitespace-pre-wrap">
          {message.preview}
          {"\n\n"}
          Happy to send club coach contacts, transcript, and full film whenever
          helpful. We know the inbox gets flooded after showcases — grateful for
          any time you can give this.
          {"\n\n"}
          Best,{"\n"}
          {message.from.split("(")[0].trim()}
        </p>
        <div className="mt-6 rounded-lg border border-dashed border-[#d0d0d0] bg-[#fafafa] px-4 py-3 text-[12px] text-[#6b6b6b]">
          2 attachments · Highlight.mp4 · Transcript.pdf
        </div>
      </div>
    </>
  )
}

function initials(name: string) {
  const clean = name.replace(/\(.*?\)/g, "").trim()
  const parts = clean.split(/\s+/).filter(Boolean)
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?"
}
