// Player profile engine — the reference-style rich profile. Ten plain-term
// radar axes with percentile BANDS (Elite / Above Avg / Average / Below Avg /
// Needs Dev), technical bars, physical measurables, all derived
// deterministically from the player's 6-axis radar + traits so every number
// is stable and internally consistent. Percentiles read vs collegiate
// recruits at the same position.
import { RADAR_AXES, GK_AXES, radarOf, traitsOf, type Position } from '@/data/seed'

// deterministic tiny jitter so derived numbers don't look copy-pasted
function jitter(id: string, salt: number, range = 6): number {
  let h = salt
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 997
  return (h % (range * 2 + 1)) - range
}
const clamp = (v: number) => Math.max(5, Math.min(98, Math.round(v)))

export const TEN_AXES = [
  'Passing', 'Vision', 'Decision Making', 'Tackling', 'Interceptions',
  'Positioning', 'Pace', 'Acceleration', 'Agility', 'Strength',
] as const

export interface Band { label: string; color: string }
export function bandOf(v: number): Band {
  if (v >= 80) return { label: 'Elite', color: '#16A34A' }
  if (v >= 60) return { label: 'Above Avg', color: '#2563EB' }
  if (v >= 40) return { label: 'Average', color: '#F59E0B' }
  if (v >= 20) return { label: 'Below Avg', color: '#EF4444' }
  return { label: 'Needs Dev.', color: '#9CA3AF' }
}
export const BAND_GUIDE = [
  { range: '80–100', label: 'Elite', color: '#16A34A' },
  { range: '60–79', label: 'Above Avg', color: '#2563EB' },
  { range: '40–59', label: 'Average', color: '#F59E0B' },
  { range: '20–39', label: 'Below Avg', color: '#EF4444' },
  { range: '0–19', label: 'Needs Dev.', color: '#9CA3AF' },
]

export interface PlayerProfile {
  axes: string[]            // ten outfield axes, or the six GK axes
  values: number[]
  positionAvg: number[]
  technical: { label: string; explainKey: string; value: number }[]
  physical: {
    paceKmh: number
    split10: number
    split30: number
    strength: number
    agility: number
    distanceKm: number
    hirMeters: number
  }
}

export function profileOf(id: string, position: Position): PlayerProfile | null {
  const r = radarOf(id)
  if (!r) return null
  const t = traitsOf(id)
  const fast = t.strengths.includes('pace') || t.strengths.includes('1v1')
  const engine = t.strengths.includes('engine')
  const physicalTrait = t.strengths.includes('physical') || t.strengths.includes('aerial')

  if (position === 'GK') {
    // GKs keep their own six axes — a 10-axis outfield radar would be noise
    const values = r.map((v, i) => clamp(v + jitter(id, i, 3)))
    return {
      axes: [...GK_AXES],
      values,
      positionAvg: GK_AXES.map((_, i) => clamp(50 + jitter(id + 'avg', i, 8))),
      technical: [
        { label: 'Handling', explainKey: 'firsttouch', value: values[0] },
        { label: 'Distribution', explainKey: 'passingT', value: values[1] },
        { label: 'Decision Making', explainKey: 'decision', value: clamp((values[2] + values[4]) / 2) },
        { label: 'Starting Position', explainKey: 'spatial', value: values[3] },
      ],
      physical: {
        paceKmh: +(27 + values[3] * 0.05).toFixed(1),
        split10: +(1.95 - values[3] * 0.002).toFixed(2),
        split30: +(4.6 - values[3] * 0.004).toFixed(2),
        strength: clamp(55 + jitter(id, 7, 12)),
        agility: clamp(60 + jitter(id, 11, 12)),
        distanceKm: +(5.5 + jitter(id, 13, 4) * 0.1).toFixed(1),
        hirMeters: 350 + Math.abs(jitter(id, 17, 60)) * 2,
      },
    }
  }

  const [, cre, , def, aer, sec] = r
  const pace = clamp((fast ? 78 : 56) + jitter(id, 3, 9))
  const values = [
    clamp(sec + jitter(id, 1, 4)),                    // Passing
    clamp(cre + jitter(id, 2, 4)),                    // Vision
    clamp((cre + sec) / 2 + jitter(id, 4, 5)),        // Decision Making
    clamp(def + jitter(id, 5, 4)),                    // Tackling
    clamp(def + jitter(id, 6, 6)),                    // Interceptions
    clamp((def + sec) / 2 + jitter(id, 8, 5)),        // Positioning
    pace,                                             // Pace
    clamp(pace + jitter(id, 9, 5)),                   // Acceleration
    clamp((fast ? 74 : 58) + jitter(id, 10, 8)),      // Agility
    clamp((physicalTrait ? 74 : 52) + aer * 0.15 + jitter(id, 12, 7)), // Strength
  ]
  return {
    axes: [...TEN_AXES],
    values,
    positionAvg: TEN_AXES.map((_, i) => clamp(50 + jitter(id + 'avg', i, 8))),
    technical: [
      { label: 'First Touch', explainKey: 'firsttouch', value: clamp(sec + jitter(id, 14, 5)) },
      { label: 'Passing', explainKey: 'passingT', value: values[0] },
      { label: 'Decision Making', explainKey: 'decision', value: values[2] },
      { label: 'Spatial Awareness', explainKey: 'spatial', value: values[5] },
    ],
    physical: {
      paceKmh: +(28.5 + values[6] * 0.085).toFixed(1),
      split10: +(1.92 - values[7] * 0.0032).toFixed(2),
      split30: +(4.55 - values[6] * 0.0075).toFixed(2),
      strength: values[9],
      agility: values[8],
      distanceKm: +((engine ? 10.6 : 9.4) + jitter(id, 15, 5) * 0.08).toFixed(1),
      hirMeters: (engine ? 1150 : 900) + Math.abs(jitter(id, 16, 80)) * 2,
    },
  }
}

// axis mean of RADAR_AXES — kept for possible future use
export const OUTFIELD_AXES = RADAR_AXES
