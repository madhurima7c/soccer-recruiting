// Saved what-if views — placements IN and roster players taken OUT —
// persisted to localStorage.
import { useSyncExternalStore } from 'react'
import { NOW_LABEL } from '@/data/seed'

export interface SavedView {
  id: string
  name: string
  savedAt: string
  recruitIds: string[]
  removedIds: string[]
}

const KEY = 'pitchside-v2'

function load(): SavedView[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as SavedView[]
  } catch { /* fresh start */ }
  return [
    { id: 'v-gk', name: 'Air-war plan (GK + 2 CBs in)', savedAt: 'Jul 21, 2026', recruitIds: ['p9', 'p7', 'p8'], removedIds: [] },
    { id: 'v-cm', name: 'Midfield rebuild', savedAt: 'Jul 20, 2026', recruitIds: ['p1', 'p2', 'p10'], removedIds: ['r11'] },
  ]
}

let views: SavedView[] = load()
const listeners = new Set<() => void>()
const emit = () => { localStorage.setItem(KEY, JSON.stringify(views)); listeners.forEach(l => l()) }

export function useViews(): SavedView[] {
  return useSyncExternalStore(cb => { listeners.add(cb); return () => listeners.delete(cb) }, () => views)
}

let n = 0
export function saveView(name: string, recruitIds: string[], removedIds: string[]) {
  views = [{
    id: `v-${Date.now().toString(36)}-${n++}`, name, savedAt: NOW_LABEL,
    recruitIds: [...recruitIds], removedIds: [...removedIds],
  }, ...views]
  emit()
}
export function deleteView(id: string) {
  views = views.filter(v => v.id !== id)
  emit()
}
