// Matchmaking mirror — similarity by SHARED, HUMAN-ENTERED evidence.
// Never a composite score, never a verdict (Law 1). Every suggestion carries
// the exact signals it rests on, in coach language, so "why am I seeing this?"
// is always answerable in one glance.
import {
  RECRUITS, ROSTER, traitsOf, staffById,
  type Position, type Recruit, type Player,
} from '@/data/seed'

export interface MatchSubject {
  id: string
  name: string
  position: Position
  kind: 'recruit' | 'roster'
  graduating?: boolean
}

export interface MatchSignal {
  kind: 'character' | 'strength' | 'read' | 'timeline'
  text: string
}

export interface Match {
  subject: MatchSubject
  signals: MatchSignal[]
}

export function asSubject(p: Recruit | Player, kind: 'recruit' | 'roster'): MatchSubject {
  return {
    id: p.id, name: p.name, position: p.position, kind,
    graduating: kind === 'roster' ? (p as Player).graduating : undefined,
  }
}

const label = (t: string) => t.replace(/-/g, ' ')

// Shared signals between two people, built from staff vocabulary + reads.
export function sharedSignals(aId: string, bId: string): MatchSignal[] {
  const a = traitsOf(aId), b = traitsOf(bId)
  const signals: MatchSignal[] = []

  for (const c of a.character) {
    if (b.character.includes(c)) {
      signals.push({ kind: 'character', text: `Both described as “${label(c)}” in staff notes` })
    }
  }
  for (const s of a.strengths) {
    if (b.strengths.includes(s)) {
      signals.push({ kind: 'strength', text: `Both flagged for ${label(s)}` })
    }
  }

  // Attributed dimension reads: both read 4+ on the same dimension
  const ra = RECRUITS.find(r => r.id === aId)?.dimReads ?? ROSTER.find(r => r.id === aId)?.dimReads ?? []
  const rb = RECRUITS.find(r => r.id === bId)?.dimReads ?? ROSTER.find(r => r.id === bId)?.dimReads ?? []
  const highA = new Map(ra.filter(r => r.score >= 4).map(r => [r.dim, r]))
  for (const read of rb.filter(r => r.score >= 4)) {
    const other = highA.get(read.dim)
    if (other) {
      const who = [...new Set([staffById(other.by).initials, staffById(read.by).initials])].join(' · ')
      signals.push({ kind: 'read', text: `Staff read both 4+ on ${read.dim} (${who})` })
    }
  }

  // Timeline overlap (recruit ↔ recruit only)
  const recA = RECRUITS.find(r => r.id === aId)
  const recB = RECRUITS.find(r => r.id === bId)
  if (recA && recB && recA.arrives === recB.arrives) {
    signals.push({ kind: 'timeline', text: `Both arrive ${recA.arrives} (${recA.eligYears} & ${recB.eligYears} seasons)` })
  }

  return signals
}

// Recruits similar to a target person (recruit or roster player), same
// position group, ranked by how much shared evidence exists. minSignals
// keeps the list honest — no evidence, no suggestion.
export function similarRecruits(targetId: string, opts?: { exclude?: string[]; minSignals?: number; limit?: number }): Match[] {
  const { exclude = [], minSignals = 2, limit = 3 } = opts ?? {}
  const target =
    RECRUITS.find(r => r.id === targetId) ?? ROSTER.find(p => p.id === targetId)
  if (!target) return []

  return RECRUITS
    .filter(r => r.id !== targetId && !exclude.includes(r.id) && r.position === target.position)
    .map(r => ({ subject: asSubject(r, 'recruit'), signals: sharedSignals(targetId, r.id) }))
    .filter(m => m.signals.length >= minSignals)
    .sort((x, y) => y.signals.length - x.signals.length)
    .slice(0, limit)
}

// The reverse question a coach actually asks: "who leaving looks like this kid?"
export function resemblesDeparting(recruitId: string): Match[] {
  const recruit = RECRUITS.find(r => r.id === recruitId)
  if (!recruit) return []
  return ROSTER
    .filter(p => p.graduating && p.position === recruit.position)
    .map(p => ({ subject: asSubject(p, 'roster'), signals: sharedSignals(recruitId, p.id) }))
    .filter(m => m.signals.length >= 2)
    .sort((x, y) => y.signals.length - x.signals.length)
}
