// Tiny external store for savable views. Scenarios = named depth-chart
// what-ifs (recruit placements). Comparisons = named side-by-side player sets.
// Persisted to localStorage so saved views survive a reload.
import { useSyncExternalStore } from 'react'
import { NOW_LABEL } from '@/data/seed'

export interface Scenario {
  id: string
  name: string
  savedAt: string
  recruitIds: string[]
  note?: string
}

export interface SavedComparison {
  id: string
  name: string
  savedAt: string
  personIds: string[]   // recruits and/or roster players
}

interface State {
  scenarios: Scenario[]
  comparisons: SavedComparison[]
}

const KEY = 'recruitiq-shadcn-v3'

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as State
  } catch { /* fresh start */ }
  return {
    // pre-seeded examples, so Compare and Rival lens never open empty
    scenarios: [
      {
        id: 'sc-seed-gk', name: 'vs Mesa Verde — GK plan', savedAt: 'Jul 21, 2026',
        recruitIds: ['p9', 'p7', 'p8'], note: 'Tilly in goal, Noor + Greta for the air war',
      },
      {
        id: 'sc-seed', name: 'Fall board — CM rebuild', savedAt: 'Jul 20, 2026',
        recruitIds: ['p1', 'p2', 'p10'], note: 'Rosa + Kiara at the 8, Beatriz for Skye',
      },
    ],
    comparisons: [{
      id: 'cp-seed', name: 'The CM decision', savedAt: 'Jul 21, 2026',
      personIds: ['p1', 'p2', 'r11'],
    }],
  }
}

let state: State = load()
const listeners = new Set<() => void>()

function emit() {
  localStorage.setItem(KEY, JSON.stringify(state))
  listeners.forEach(l => l())
}

export function useSaved(): State {
  return useSyncExternalStore(
    cb => { listeners.add(cb); return () => listeners.delete(cb) },
    () => state,
  )
}

let n = 0
const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${n++}`

export function saveScenario(name: string, recruitIds: string[], note?: string) {
  state = {
    ...state,
    scenarios: [{ id: uid('sc'), name, savedAt: NOW_LABEL, recruitIds: [...recruitIds], note }, ...state.scenarios],
  }
  emit()
}

export function deleteScenario(id: string) {
  state = { ...state, scenarios: state.scenarios.filter(s => s.id !== id) }
  emit()
}

export function saveComparison(name: string, personIds: string[]) {
  state = {
    ...state,
    comparisons: [{ id: uid('cp'), name, savedAt: NOW_LABEL, personIds: [...personIds] }, ...state.comparisons],
  }
  emit()
}

export function deleteComparison(id: string) {
  state = { ...state, comparisons: state.comparisons.filter(c => c.id !== id) }
  emit()
}
