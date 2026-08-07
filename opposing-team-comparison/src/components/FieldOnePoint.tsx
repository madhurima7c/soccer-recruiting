// One-point-perspective fields, goals east and west. My field (bottom) is
// editable: drag recruits IN from the bench, drag anyone OUT to remove them —
// removed spots stay visible as open dashed circles you can tap to restore.
// The stroke around every player is the coach's 1–5 score; hover shows the
// number, click opens the profile.
import {
  MY_XI, RIVAL_XI, rosterById, recruitById, coachScoreOf,
  type Position, type RivalTeam,
} from '@/data/seed'
import { cn } from '@/lib/utils'

export const ORANGE = '#EA580C'

// landscape spots — same index order as MY_XI / RIVAL_XI (GK first, CF last)
export const SPOTS: { pos: Position; x: number; y: number; label: string }[] = [
  { pos: 'GK', x: 7,  y: 50, label: 'GK' },
  { pos: 'CB', x: 21, y: 33, label: 'CB' },
  { pos: 'CB', x: 21, y: 67, label: 'CB' },
  { pos: 'FB', x: 31, y: 10, label: 'LB' },
  { pos: 'FB', x: 31, y: 90, label: 'RB' },
  { pos: 'DM', x: 43, y: 50, label: 'DM' },
  { pos: 'CM', x: 56, y: 28, label: 'CM' },
  { pos: 'CM', x: 56, y: 72, label: 'CM' },
  { pos: 'W',  x: 73, y: 12, label: 'LW' },
  { pos: 'W',  x: 73, y: 88, label: 'RW' },
  { pos: 'F',  x: 86, y: 50, label: 'CF' },
]

export type FieldSelection =
  | { kind: 'mine'; id: string }
  | { kind: 'recruit'; id: string }
  | { kind: 'rival'; rivalId: string; index: number }

export function scoreStroke(score?: number): React.CSSProperties {
  switch (score) {
    case 5: return { border: `3px solid ${ORANGE}` }
    case 4: return { border: '3px solid rgba(255,255,255,0.95)' }
    case 3: return { border: '2px solid rgba(255,255,255,0.55)' }
    case 2: return { border: '2px dashed rgba(255,255,255,0.4)' }
    default: return { border: '1px solid rgba(255,255,255,0.25)' }
  }
}

const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

export function Node({ name, sub, score, tilt, x, y, ghost, rivalColor, draggableOut, dragPayload, onClick }: {
  name: string
  sub?: string
  score?: number
  tilt: number
  x: number; y: number
  ghost?: boolean
  rivalColor?: string
  draggableOut?: boolean
  dragPayload?: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      draggable={draggableOut}
      onDragStart={draggableOut ? (e => { e.dataTransfer.setData('text/plain', dragPayload ?? '') }) : undefined}
      aria-label={`${name}${score ? ` — ${rivalColor ? 'scout grade' : 'coach score'} ${score} of 5` : ''}`}
      className={cn('group absolute z-10', draggableOut && 'cursor-grab active:cursor-grabbing')}
      style={{
        left: `${x}%`, top: `${y}%`,
        transform: `translate(-50%, -50%) translateZ(26px) rotateX(${-tilt}deg)`,
        transformStyle: 'preserve-3d',
      }}
    >
      <div className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2 py-1 text-center leading-tight shadow-lg group-hover:block">
        <div className="font-mono text-[11px] font-bold text-neutral-900">
          {score ? `${rivalColor ? 'Scout grade' : 'Coach score'} ${score}/5` : 'Not yet scored'}
        </div>
        {sub && <div className="text-[9px] text-neutral-500">{sub}</div>}
      </div>
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full font-mono text-[9px] font-bold text-white shadow-xl transition-transform group-hover:scale-115',
          rivalColor ? 'bg-neutral-800/90' : 'bg-neutral-900',
        )}
        style={
          ghost ? { border: `3px dashed ${ORANGE}` }
            : rivalColor ? { border: `${(score ?? 0) >= 5 ? 3 : 2}px solid ${rivalColor}` }
              : scoreStroke(score)
        }
      >
        {initials(name)}
      </span>
      <div
        className={cn('mx-auto mt-0.5 max-w-24 truncate text-center text-[10.5px] font-semibold leading-tight', !ghost && 'text-white/90')}
        style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)', ...(ghost ? { color: ORANGE } : {}) }}
      >
        {name.split(' ').slice(-1)[0]}
      </div>
    </button>
  )
}

export function LandscapePlane({ tilt, children, lineOpacity = 0.18, width = 620, height = 300, onDragOver, onDrop, highlight }: {
  tilt: number
  children: React.ReactNode
  lineOpacity?: number
  width?: number
  height?: number
  onDragOver?: (e: React.DragEvent) => void
  onDrop?: (e: React.DragEvent) => void
  highlight?: boolean
}) {
  const line = `rgba(255,255,255,${lineOpacity})`
  return (
    <div
      className="relative rounded-lg"
      style={{
        width, height,
        transform: `rotateX(${tilt}deg)`,
        transformStyle: 'preserve-3d',
        background: 'linear-gradient(180deg, #1b1b1b 0%, #131313 100%)',
        boxShadow: '0 50px 70px -24px rgba(0,0,0,0.85)',
        border: highlight ? `2px dashed ${ORANGE}` : `1px solid ${line}`,
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* landscape markings: goals east & west */}
      <div className="absolute inset-3 rounded-sm" style={{ border: `1px solid ${line}` }} />
      <div className="absolute inset-y-3 left-1/2 w-px" style={{ backgroundColor: line }} />
      <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ border: `1px solid ${line}` }} />
      {/* penalty boxes */}
      <div className="absolute left-3 top-1/2 h-32 w-14 -translate-y-1/2" style={{ borderTop: `1px solid ${line}`, borderRight: `1px solid ${line}`, borderBottom: `1px solid ${line}` }} />
      <div className="absolute right-3 top-1/2 h-32 w-14 -translate-y-1/2" style={{ borderTop: `1px solid ${line}`, borderLeft: `1px solid ${line}`, borderBottom: `1px solid ${line}` }} />
      {/* goals */}
      <div className="absolute left-0 top-1/2 h-14 w-1.5 -translate-x-full -translate-y-1/2 rounded-l-sm bg-white/40" />
      <div className="absolute right-0 top-1/2 h-14 w-1.5 translate-x-full -translate-y-1/2 rounded-r-sm bg-white/40" />
      {children}
    </div>
  )
}

// ── Rival field (read-only) ─────────────────────────────────────────────────
export function RivalField({ rival, tilt, onSelect }: {
  rival: RivalTeam
  tilt: number
  onSelect: (s: FieldSelection) => void
}) {
  return (
    <LandscapePlane tilt={tilt} lineOpacity={0.14} width={560} height={260}>
      {SPOTS.map((spot, i) => {
        const p = RIVAL_XI[rival.id][i]
        return (
          <Node key={i} name={p.name} sub={spot.label} score={p.grade} tilt={tilt}
            x={spot.x} y={spot.y} rivalColor={rival.color}
            onClick={() => onSelect({ kind: 'rival', rivalId: rival.id, index: i })} />
        )
      })}
    </LandscapePlane>
  )
}

// ── My field (editable) ─────────────────────────────────────────────────────
export function MyField({ tilt, placements, removed, dragActive, onSelect, onDropRecruit, onRestore }: {
  tilt: number
  placements: string[]
  removed: string[]
  dragActive: boolean
  onSelect: (s: FieldSelection) => void
  onDropRecruit: (id: string) => void
  onRestore: (id: string) => void
}) {
  // assign placed recruits near their position group
  const used = new Map<Position, number>()
  const placedNodes = placements.map(id => {
    const r = recruitById(id)!
    const spots = SPOTS.filter(s => s.pos === r.position)
    const n = used.get(r.position) ?? 0
    used.set(r.position, n + 1)
    const spot = spots[Math.min(n, spots.length - 1)]
    // offset toward midfield so they don't sit on the starter
    return { r, x: Math.min(spot.x + 7, 94), y: spot.y > 55 ? spot.y - 14 : spot.y + 14 }
  })

  return (
    <LandscapePlane
      tilt={tilt}
      highlight={dragActive}
      onDragOver={e => e.preventDefault()}
      onDrop={e => {
        const raw = e.dataTransfer.getData('text/plain')
        if (raw.startsWith('add:')) onDropRecruit(raw.slice(4))
      }}
    >
      {SPOTS.map((spot, i) => {
        const player = rosterById(MY_XI[i])!
        if (removed.includes(player.id)) {
          return (
            <button
              key={i}
              onClick={() => onRestore(player.id)}
              className="group absolute z-10"
              style={{
                left: `${spot.x}%`, top: `${spot.y}%`,
                transform: `translate(-50%, -50%) translateZ(26px) rotateX(${-tilt}deg)`,
              }}
              aria-label={`Open spot — tap to bring ${player.name} back`}
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed border-white/35 text-[9px] font-bold text-white/50 transition-colors group-hover:border-white/70 group-hover:text-white/80">
                {spot.label}
              </span>
              <div className="mt-0.5 text-center text-[9px] font-medium text-white/40">open · tap to undo</div>
            </button>
          )
        }
        return (
          <Node key={i} name={player.name}
            sub={`${spot.label}${player.graduating ? ' · graduating ’26' : ''} · drag off to remove`}
            score={coachScoreOf(player.id)} tilt={tilt}
            x={spot.x} y={spot.y}
            draggableOut dragPayload={`out:mine:${player.id}`}
            onClick={() => onSelect({ kind: 'mine', id: player.id })} />
        )
      })}
      {placedNodes.map(({ r, x, y }) => (
        <Node key={r.id} name={r.name} sub={`${r.position} · what-if · drag off to remove`}
          score={coachScoreOf(r.id)} tilt={tilt} x={x} y={y} ghost
          draggableOut dragPayload={`out:recruit:${r.id}`}
          onClick={() => onSelect({ kind: 'recruit', id: r.id })} />
      ))}
    </LandscapePlane>
  )
}
