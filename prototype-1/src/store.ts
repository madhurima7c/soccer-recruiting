import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { buildSeed, DEFAULT_USER_ID } from './data/seed'
import type {
  Capture, ComplianceEvent, ContactLogEntry, DeviceMode, FeedItem, InboundItem,
  JournalEntry, Person, Screen, WhatIfSnapshot,
} from './types'

let idCounter = 1000
export const uid = (p: string) => `${p}-${idCounter++}-${Math.random().toString(36).slice(2, 7)}`

// prototype clock: the "current date" of the demo world
export const NOW = '2026-07-06T12:00:00'

export interface Toast { id: string; title: string; lines?: string[] }

interface AppState {
  device: DeviceMode
  screen: Screen
  routeId?: string
  currentUserId: string
  demoOpen: boolean
  demoChecked: Record<string, boolean>
  toasts: Toast[]
  offlineQueued: number   // sideline offline simulation

  program: ReturnType<typeof buildSeed>['program']
  staff: ReturnType<typeof buildSeed>['staff']
  templates: ReturnType<typeof buildSeed>['templates']
  people: Person[]
  captures: Capture[]
  contactLogs: ContactLogEntry[]
  complianceEvents: ComplianceEvent[]
  feed: FeedItem[]
  inbound: InboundItem[]
  events: ReturnType<typeof buildSeed>['events']
  journal: JournalEntry[]
  mirror: ReturnType<typeof buildSeed>['mirror']
  snapshots: WhatIfSnapshot[]

  navigate: (screen: Screen, id?: string) => void
  setDevice: (d: DeviceMode) => void
  setUser: (id: string) => void
  toast: (title: string, lines?: string[]) => void
  dismissToast: (id: string) => void
  toggleDemo: () => void
  setDemoChecked: (k: string, v: boolean) => void
  resetDemo: () => void

  retier: (personId: string, tierId: string) => void
  updatePerson: (personId: string, patch: Partial<Person>) => void
  addCapture: (c: Omit<Capture, 'id'>, opts?: { offline?: boolean }) => void
  confirmCapture: (id: string, text: string) => void
  syncOffline: () => void
  logCall: (personId: string, durationMin: number, topics: string[], voiceNote?: string) => void
  postDebriefSummary: (eventId: string) => void
  approveInbound: (id: string, opts?: { mergeInto?: string }) => void
  dismissInbound: (id: string) => void
  snoozeInbound: (id: string) => void
  toggleComplianceDone: (id: string) => void
  setComplianceTarget: (t: 'ARMS' | 'Teamworks' | 'Jump Forward' | 'Win One') => void
  saveSnapshot: (s: Omit<WhatIfSnapshot, 'id' | 'createdAt' | 'authorId'>) => string
  updateSnapshot: (id: string, patch: Partial<WhatIfSnapshot>) => void
  deleteSnapshot: (id: string) => void
  addJournalEntry: (e: Omit<JournalEntry, 'id' | 'at' | 'authorId'>) => void
  dismissMirror: (id: string) => void
  quickAddDiscovery: (jersey: string, teamColor: string, club: string, eventId: string) => string
  updateProgram: (patch: Partial<AppState['program']>) => void
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      device: 'desktop',
      screen: 'board',
      routeId: undefined,
      currentUserId: DEFAULT_USER_ID,
      demoOpen: false,
      demoChecked: {},
      toasts: [],
      offlineQueued: 0,
      ...buildSeed(),

      navigate: (screen, id) => set({ screen, routeId: id }),
      setDevice: (d) => {
        // device change also changes which surface you land on (Law: product surface per context)
        const landing: Record<DeviceMode, Screen> = { desktop: 'board', ipad: 'capture', phone: 'queue' }
        set({ device: d, screen: landing[d], routeId: d === 'ipad' ? 'ev-idcamp' : undefined })
      },
      setUser: (id) => set({ currentUserId: id }),
      toast: (title, lines) => {
        const t = { id: uid('t'), title, lines }
        set(s => ({ toasts: [...s.toasts, t] }))
        setTimeout(() => get().dismissToast(t.id), 6000)
      },
      dismissToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
      toggleDemo: () => set(s => ({ demoOpen: !s.demoOpen })),
      setDemoChecked: (k, v) => set(s => ({ demoChecked: { ...s.demoChecked, [k]: v } })),
      resetDemo: () => set({ ...buildSeed(), demoChecked: {}, offlineQueued: 0, screen: 'board', routeId: undefined, device: 'desktop', currentUserId: DEFAULT_USER_ID }),

      retier: (personId, tierId) => {
        const s = get()
        const p = s.people.find(x => x.id === personId)
        if (!p) return
        const tier = s.program.tiers.find(t => t.id === tierId)
        const author = s.staff.find(st => st.id === s.currentUserId)!
        set(st => ({
          people: st.people.map(x => x.id === personId ? { ...x, tierId } : x),
          feed: [{ id: uid('f'), at: NOW, authorId: s.currentUserId, kind: 'tier' as const, personId, text: `Moved ${p.name} to ${tier?.name} (${tierId}).` }, ...st.feed],
        }))
        get().toast(`${p.name} → ${tier?.name}`, [`Tier change by ${author.name} — visible to all staff`])
      },

      updatePerson: (personId, patch) => set(s => ({ people: s.people.map(p => p.id === personId ? { ...p, ...patch } : p) })),

      addCapture: (c, opts) => {
        const id = uid('c')
        const s = get()
        const p = s.people.find(x => x.id === c.personId)
        set(st => ({
          captures: [{ ...c, id }, ...st.captures],
          offlineQueued: opts?.offline ? st.offlineQueued + 1 : st.offlineQueued,
          feed: c.published ? [{ id: uid('f'), at: NOW, authorId: c.authorId, kind: 'capture' as const, personId: c.personId, text: `Captured on ${p?.name ?? 'unknown player'}${c.eventId ? ' at event' : ''}.` }, ...st.feed] : st.feed,
          complianceEvents: c.eventId
            ? [{ id: uid('ce'), personId: c.personId, at: c.at, type: 'Evaluation' as const, detail: `Live evaluation capture`, done: false }, ...st.complianceEvents]
            : st.complianceEvents,
        }))
      },

      confirmCapture: (id, text) => set(s => ({
        captures: s.captures.map(c => c.id === id ? { ...c, confirmed: true, text, draftText: undefined } : c),
      })),

      syncOffline: () => {
        const n = get().offlineQueued
        set({ offlineQueued: 0 })
        if (n > 0) get().toast(`${n} capture${n > 1 ? 's' : ''} synced`, ['Queued captures are now visible to all staff'])
      },

      logCall: (personId, durationMin, topics, voiceNote) => {
        const s = get()
        const p = s.people.find(x => x.id === personId)
        const author = s.staff.find(st => st.id === s.currentUserId)!
        const at = NOW
        // Law 3: one capture, three destinations
        set(st => ({
          contactLogs: [{ id: uid('cl'), personId, authorId: s.currentUserId, at, type: 'call' as const, detail: `Call — ${durationMin} min. Topics: ${topics.join(', ') || '—'}.${voiceNote ? ' Voice note attached.' : ''}` }, ...st.contactLogs],
          captures: voiceNote ? [{ id: uid('c'), personId, authorId: s.currentUserId, at, kind: 'call' as const, draftText: voiceNote, draftKind: 'voice-transcript' as const, confirmed: false, published: true, durationMin, topics }, ...st.captures] : st.captures,
          feed: [{ id: uid('f'), at, authorId: s.currentUserId, kind: 'call' as const, personId, text: `Logged a ${durationMin}-min call with ${p?.name} — ${topics.join(', ') || 'no topics tagged'}.` }, ...st.feed],
          complianceEvents: [{ id: uid('ce'), personId, at, type: 'Call' as const, detail: `Call, ${durationMin} min (${author.name})`, done: false }, ...st.complianceEvents],
        }))
        get().toast('Call logged once — landed in 3 places', [
          `① ${p?.name}’s timeline`,
          '② Staff activity feed',
          '③ Compliance outbox (pre-formatted)',
        ])
      },

      postDebriefSummary: (eventId) => {
        const s = get()
        const ev = s.events.find(e => e.id === eventId)
        const caps = s.captures.filter(c => c.eventId === eventId)
        const recruits = new Set(caps.map(c => c.personId))
        set(st => ({
          feed: [{ id: uid('f'), at: NOW, authorId: s.currentUserId, kind: 'summary' as const, text: `Posted the ${ev?.name} debrief packet: ${recruits.size} recruits seen, ${caps.length} captures, ${caps.filter(c => !c.confirmed).length} drafts remaining.` }, ...st.feed],
        }))
        get().toast('Debrief summary posted to staff feed')
      },

      approveInbound: (id, opts) => {
        const s = get()
        const item = s.inbound.find(i => i.id === id)
        if (!item) return
        if (opts?.mergeInto) {
          const target = s.people.find(p => p.id === opts.mergeInto)
          set(st => ({
            inbound: st.inbound.map(i => i.id === id ? { ...i, status: 'approved' as const } : i),
            feed: [{ id: uid('f'), at: NOW, authorId: s.currentUserId, kind: 'system' as const, personId: opts.mergeInto, text: `Merged inbound “${item.extracted.name}” into existing recruit ${target?.name}. New video link attached.` }, ...st.feed],
          }))
          get().toast(`Merged into ${target?.name}`, ['No duplicate created — video link attached to existing record'])
          return
        }
        const ex = item.extracted
        const newPerson: Person = {
          id: uid('r'),
          name: ex.name ?? 'Unknown',
          lifecycle: 'recruit',
          positions: [(ex.position as Person['positions'][0]) ?? 'CM'],
          classYear: ex.classYear ?? 2028,
          club: ex.club,
          pipeline: item.sourceType === 'agent' ? 'Transfer' : 'HS',
          tierId: 'yellow',
          funnelStage: 'wideNet',
          fitGates: {
            soccer: { status: 'unknown', note: 'Not yet seen', updated: NOW.slice(0, 10) },
            academic: { status: 'unknown', note: 'Transcript not yet requested', updated: NOW.slice(0, 10) },
            financial: { status: 'unknown', note: 'Not yet discussed', updated: NOW.slice(0, 10) },
          },
          templateId: `tpl-${(ex.position ?? 'cm').toLowerCase()}`,
          ratingsAcrossViewings: [],
          videos: ex.videoLink ? [{ id: uid('v'), title: 'Inbound highlight link', platform: 'Veo', anchors: [] }] : [],
          referralChain: [{ who: item.fromLine.split(' — ')[0], role: `Inbound (${item.sourceType})` }],
          contactable: item.sourceType === 'agent' || (ex.classYear ?? 2028) <= 2028,
          contactableReason: (ex.classYear ?? 2028) >= 2029 ? 'Evaluation only — contact window not open' : 'Contactable',
        }
        set(st => ({
          inbound: st.inbound.map(i => i.id === id ? { ...i, status: 'approved' as const } : i),
          people: [...st.people, newPerson],
          feed: [{ id: uid('f'), at: NOW, authorId: s.currentUserId, kind: 'system' as const, personId: newPerson.id, text: `Approved inbound: ${newPerson.name} (${ex.position ?? '?'}, ${ex.classYear ?? '?'}) added to Wide Net.` }, ...st.feed],
        }))
        get().toast(`${newPerson.name} added to Wide Net`, ['Approval never auto-contacts anyone'])
      },

      dismissInbound: (id) => set(s => ({ inbound: s.inbound.map(i => i.id === id ? { ...i, status: 'dismissed' as const } : i) })),
      snoozeInbound: (id) => {
        set(s => ({ inbound: s.inbound.map(i => i.id === id ? { ...i, status: 'snoozed' as const } : i) }))
        get().toast('Snoozed to the desktop pile')
      },

      toggleComplianceDone: (id) => set(s => ({ complianceEvents: s.complianceEvents.map(e => e.id === id ? { ...e, done: !e.done } : e) })),
      setComplianceTarget: (t) => set(s => ({ program: { ...s.program, complianceTarget: t } })),

      saveSnapshot: (snap) => {
        const id = uid('snap')
        const s = get()
        set(st => ({ snapshots: [...st.snapshots, { ...snap, id, createdAt: NOW, authorId: s.currentUserId }] }))
        get().toast(`Snapshot saved: ${snap.name}`, ['Compare scenarios side by side below the depth chart'])
        return id
      },
      updateSnapshot: (id, patch) => set(s => ({ snapshots: s.snapshots.map(x => x.id === id ? { ...x, ...patch } : x) })),
      deleteSnapshot: (id) => set(s => ({ snapshots: s.snapshots.filter(x => x.id !== id) })),

      addJournalEntry: (e) => {
        const s = get()
        set(st => ({
          journal: [{ ...e, id: uid('j'), at: NOW, authorId: s.currentUserId }, ...st.journal],
          feed: [{ id: uid('f'), at: NOW, authorId: s.currentUserId, kind: 'decision' as const, personId: e.personId, text: `Journaled a ${e.decision} decision.` }, ...st.feed],
          complianceEvents: e.decision === 'offer'
            ? [{ id: uid('ce'), personId: e.personId, at: NOW, type: 'Offer' as const, detail: 'Offer decision journaled — file with compliance', done: false }, ...st.complianceEvents]
            : st.complianceEvents,
        }))
      },

      dismissMirror: (id) => {
        set(s => ({ mirror: s.mirror.map(m => m.id === id ? { ...m, dismissed: true } : m) }))
        get().toast('Observation suppressed', ['Feedback logged — this pattern class won’t resurface'])
      },

      quickAddDiscovery: (jersey, teamColor, club, eventId) => {
        const s = get()
        const id = uid('disc')
        const p: Person = {
          id,
          name: `Unknown #${jersey} (${teamColor}, ${club})`,
          lifecycle: 'recruit',
          positions: ['CM'],
          classYear: 2028,
          club,
          pipeline: 'HS',
          tierId: 'yellow',
          funnelStage: 'wideNet',
          fitGates: {
            soccer: { status: 'unknown', note: 'Discovery — identity resolves later', updated: NOW.slice(0, 10) },
            academic: { status: 'unknown', note: '—', updated: NOW.slice(0, 10) },
            financial: { status: 'unknown', note: '—', updated: NOW.slice(0, 10) },
          },
          templateId: 'tpl-cm',
          ratingsAcrossViewings: [],
          videos: [],
          referralChain: [{ who: s.staff.find(x => x.id === s.currentUserId)?.name ?? '', role: 'Field discovery' }],
          contactable: false,
          contactableReason: 'Identity unresolved — evaluation only',
        }
        set(st => ({
          people: [...st.people, p],
          events: st.events.map(e => e.id === eventId ? { ...e, watchlist: [...e.watchlist, { personId: id, assigneeId: s.currentUserId }] } : e),
        }))
        return id
      },

      updateProgram: (patch) => set(s => ({ program: { ...s.program, ...patch } })),
    }),
    {
      name: 'csu-recruiting-proto-v2',
      partialize: (s) => {
        const { toasts, demoOpen, ...rest } = s as any
        return rest
      },
    },
  ),
)

export const usePerson = (id?: string) => useStore(s => s.people.find(p => p.id === id))
export const useStaffMember = (id: string) => useStore(s => s.staff.find(m => m.id === id))
