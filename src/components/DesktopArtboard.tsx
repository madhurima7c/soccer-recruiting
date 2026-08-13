import { useEffect, useState, type ReactNode } from "react"

/** Capture / Figma frame for the fake macOS desktop + Kit agentic flows. */
export const DESKTOP_FRAME = { width: 1440, height: 1024 } as const

type DesktopArtboardProps = {
  children: ReactNode
  className?: string
}

/**
 * Locks the desktop prototype to a 1440×1024 artboard and scales it to fit
 * the browser viewport (letterboxed), so captures and live review match Figma.
 */
export function DesktopArtboard({ children, className }: DesktopArtboardProps) {
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const update = () => {
      const next = Math.min(
        window.innerWidth / DESKTOP_FRAME.width,
        window.innerHeight / DESKTOP_FRAME.height,
      )
      setScale(next > 0 ? next : 1)
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const stagedWidth = DESKTOP_FRAME.width * scale
  const stagedHeight = DESKTOP_FRAME.height * scale

  return (
    <div className="grid h-full w-full place-items-center overflow-hidden bg-[#0e1410]">
      <div
        className="relative overflow-hidden"
        style={{ width: stagedWidth, height: stagedHeight }}
      >
        <div
          className={className}
          style={{
            width: DESKTOP_FRAME.width,
            height: DESKTOP_FRAME.height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
