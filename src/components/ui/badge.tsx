import type { HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-black/8 bg-[#f3f4ef] px-2.5 py-1 text-[11px] font-medium leading-none text-[#596056]",
        className,
      )}
      {...props}
    />
  )
}
