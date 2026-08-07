// Rival-lens engine: aggregate MY potential configuration (roster + a saved
// scenario's placed recruits) into team-level axes, diff it against a rival's
// profile, and turn the one axis the rival exploits into concrete, explainable
// suggestions: who is exposed, and which recruits on the board answer it.
// Everything is arithmetic over data the staff can see — no black-box scores.
import {
  RADAR_AXES, GK_AXES, ROSTER, RECRUITS, radarOf, recruitById, traitsOf,
  type Position, type Recruit, type RivalTeam,
} from '@/data/seed'
import { sharedSignals, type MatchSignal } from '@/lib/match'

// Criteria pool — the 6 base percentile axes plus two computed from the
// QUALITATIVE layer (this is where coach-specific criteria plug in).
export const AXIS_POOL: string[] = [...RADAR_AXES, 'Press resistance', 'Work rate']
export const DEFAULT_AXES: string[] = [...RADAR_AXES]

const isGK = (position: Position) => position === 'GK'

// my outfield people for a given scenario (roster + placed outfield recruits)
function outfield(placements: string[]): { id: string; position: Position }[] {
  const roster = ROSTER.filter(p => !isGK(p.position)).map(p => ({ id: p.id, position: p.position }))
  const placed = placements
    .map(id => recruitById(id))
    .filter((r): r is Recruit => !!r && !isGK(r.position))
    .map(r => ({ id: r.id, position: r.position }))
  return [...roster, ...placed]
}

const avg = (ns: number[]) => ns.length ? ns.reduce((a, b) => a + b, 0) / ns.length : 0

function baseAxisValue(axisIdx: number, ids: { id: string }[]): number {
  return Math.round(avg(ids.map(({ id }) => radarOf(id)?.[axisIdx]).filter((v): v is number => v !== undefined)))
}

// Press resistance = Security averaged over the players who actually build up
// (CB / DM / CM). Work rate = share of players your staff flagged as engines
// or read 4+ on Motor — a countable, human-entered signal scaled to 0–100.
function pressResistance(ids: { id: string; position: Position }[]): number {
  const build = ids.filter(p => ['CB', 'DM', 'CM'].includes(p.position))
  const secIdx = RADAR_AXES.indexOf('Security')
  return baseAxisValue(secIdx, build)
}
function workRate(ids: { id: string; position: Position }[]): number {
  const qualifies = (id: string) => {
    const t = traitsOf(id)
    if (t.strengths.includes('engine')) return true
    const reads = RECRUITS.find(r => r.id === id)?.dimReads ?? ROSTER.find(p => p.id === id)?.dimReads ?? []
    return reads.some(r => r.dim === 'Motor' && r.score >= 4)
  }
  return Math.round((ids.filter(p => qualifies(p.id)).length / Math.max(ids.length, 1)) * 100)
}

export function myTeamAxes(activeAxes: string[], placements: string[]): number[] {
  const ids = outfield(placements)
  return activeAxes.map(axis => {
    const idx = RADAR_AXES.indexOf(axis as typeof RADAR_AXES[number])
    if (idx >= 0) return baseAxisValue(idx, ids)
    if (axis === 'Press resistance') return pressResistance(ids)
    if (axis === 'Work rate') return workRate(ids)
    return 0
  })
}

export function rivalAxes(rival: RivalTeam, activeAxes: string[]): number[] {
  return activeAxes.map(axis => {
    const idx = RADAR_AXES.indexOf(axis as typeof RADAR_AXES[number])
    if (idx >= 0) return rival.axes[idx]
    return rival.extra[axis as 'Press resistance' | 'Work rate'] ?? 0
  })
}

// My unit profiles (average percentile across the line) for the dumbbells.
export function myUnits(placements: string[]): { DEF: number; MID: number; ATT: number } {
  const ids = outfield(placements)
  const byUnit: Record<'DEF' | 'MID' | 'ATT', Position[]> = { DEF: ['CB', 'FB'], MID: ['DM', 'CM'], ATT: ['W', 'F'] }
  const mean = (id: string) => avg(radarOf(id) ?? [])
  const out = {} as { DEF: number; MID: number; ATT: number }
  ;(Object.keys(byUnit) as ('DEF' | 'MID' | 'ATT')[]).forEach(u => {
    out[u] = Math.round(avg(ids.filter(p => byUnit[u].includes(p.position)).map(p => mean(p.id))))
  })
  return out
}

export interface LeanRow { axis: string; mine: number; theirs: number; diff: number; flagged: boolean }
export function leanRows(activeAxes: string[], placements: string[], rival: RivalTeam): LeanRow[] {
  const mine = myTeamAxes(activeAxes, placements)
  const theirs = rivalAxes(rival, activeAxes)
  return activeAxes.map((axis, i) => {
    const diff = mine[i] - theirs[i]
    // flagged when we're behind on the axis the rival exploits (or its counter)
    const flagged = (axis === rival.threatAxis || counterAxisOf(rival) === axis) && diff < -5
    return { axis, mine: mine[i], theirs: theirs[i], diff, flagged }
  })
}

// which of MY axes counters this rival's identity
function counterAxisOf(rival: RivalTeam): string {
  if (rival.threatAxis === 'Aerial') return 'Aerial'
  if (rival.threatAxis === 'Security') return 'Press resistance'
  return rival.threatAxis
}

// Positions that answer each threat axis
const DEFENSE_OF: Record<string, Position[]> = {
  Aerial: ['GK', 'CB'],
  Security: ['CB', 'DM', 'CM'],
  Defending: ['CB', 'FB', 'DM', 'CM'],
}

export interface Exposure {
  playerId: string
  name: string
  position: Position
  axisLabel: string       // label in that player's own axis system (GK differs)
  value: number
  graduating: boolean
}

// Who on MY current configuration is most exposed to this rival's threat axis
export function mostExposed(rival: RivalTeam, placements: string[]): Exposure | null {
  const positions = DEFENSE_OF[rival.threatAxis] ?? ['CB']
  const candidates: Exposure[] = []
  const consider = (id: string, name: string, position: Position, graduating: boolean) => {
    const radar = radarOf(id)
    if (!radar) return
    if (isGK(position)) {
      if (rival.threatAxis !== 'Aerial') return
      const idx = GK_AXES.indexOf('Command')
      candidates.push({ playerId: id, name, position, axisLabel: 'Command', value: radar[idx], graduating })
    } else {
      const idx = RADAR_AXES.indexOf(rival.threatAxis === 'Security' ? 'Security' : rival.threatAxis as typeof RADAR_AXES[number])
      if (idx < 0) return
      candidates.push({ playerId: id, name, position, axisLabel: rival.threatAxis, value: radar[idx], graduating })
    }
  }
  ROSTER.filter(p => positions.includes(p.position)).forEach(p => consider(p.id, p.name, p.position, p.graduating))
  placements.map(id => recruitById(id)).forEach(r => {
    if (r && positions.includes(r.position)) consider(r.id, r.name, r.position, false)
  })
  if (!candidates.length) return null
  return candidates.sort((a, b) => a.value - b.value)[0]
}

export interface RecruitAnswer {
  recruit: Recruit
  axisLabel: string
  value: number
  delta: number            // vs the exposed player
  signals: MatchSignal[]   // shared evidence with the player they'd relieve
  competes: boolean        // staff flagged competitor/driven — "cold Tuesday night" test
}

// Recruits on the board who answer the exposure — same position group,
// sorted by the threat axis value. Evidence attached, film still decides.
export function boardAnswers(rival: RivalTeam, exposed: Exposure, exclude: string[]): RecruitAnswer[] {
  const pool = RECRUITS.filter(r => r.position === exposed.position && !exclude.includes(r.id))
  return pool
    .map(r => {
      const radar = radarOf(r.id)
      const idx = isGK(r.position)
        ? GK_AXES.indexOf('Command')
        : RADAR_AXES.indexOf(rival.threatAxis === 'Security' ? 'Security' : rival.threatAxis as typeof RADAR_AXES[number])
      const value = radar?.[idx] ?? 0
      const t = traitsOf(r.id)
      return {
        recruit: r,
        axisLabel: exposed.axisLabel,
        value,
        delta: value - exposed.value,
        signals: sharedSignals(exposed.playerId, r.id),
        competes: t.character.some(c => ['competitor', 'driven', 'fearless'].includes(c)),
      }
    })
    .sort((a, b) => b.value - a.value)
}
