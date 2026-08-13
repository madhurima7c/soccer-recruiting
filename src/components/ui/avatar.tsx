import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const colors = ["#d7e8f0", "#f0ddd0", "#dce9d4", "#e7dcf0", "#f1e5b9"]

export function Avatar({
  name,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { name: string }) {
  const index = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % colors.length
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)

  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/80 text-[11px] font-semibold text-[#273027] shadow-sm",
        className,
      )}
      style={{ background: colors[index] }}
      aria-label={name}
      {...props}
    >
      {initials}
    </span>
  )
}
