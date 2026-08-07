import React from 'react'
import { CalendarCheck, Flag, ShieldAlert } from 'lucide-react'
import { useStore } from '../store'
import { Avatar, Btn, Card, SectionLabel } from '../lib/ui'

export default function EventsScreen() {
  const events = useStore(s => s.events)
  const people = useStore(s => s.people)
  const staff = useStore(s => s.staff)
  const device = useStore(s => s.device)
  const navigate = useStore(s => s.navigate)
  const captures = useStore(s => s.captures)

  return (
    <div className={`mx-auto max-w-4xl ${device === 'ipad' ? 'p-5' : 'p-5'}`}>
      <h1 className="text-xl font-bold text-stone-900">Events</h1>
      <div className="text-xs text-stone-500">Prep the night before; capture at the field; debrief after. Coverage assignments pre-load each assignee’s iPad offline.</div>
      <div className="mt-4 space-y-4">
        {events.map(ev => {
          const caps = captures.filter(c => c.eventId === ev.id)
          const drafts = caps.filter(c => c.draftText && !c.confirmed).length
          const preGate = ev.watchlist.map(w => people.find(p => p.id === w.personId)).filter(p => p && !p.contactable)
          const byAssignee = new Map<string, string[]>()
          ev.watchlist.forEach(w => byAssignee.set(w.assigneeId, [...(byAssignee.get(w.assigneeId) ?? []), w.personId]))
          return (
            <Card key={ev.id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-base font-bold text-stone-900">
                    <Flag size={16} className={ev.status === 'upcoming' ? 'text-teal-600' : 'text-stone-400'} /> {ev.name}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${ev.status === 'upcoming' ? 'bg-teal-100 text-teal-800' : 'bg-stone-100 text-stone-500'}`}>{ev.status}</span>
                  </div>
                  <div className="text-xs text-stone-500">{ev.dates} · {ev.location} · {ev.fields}</div>
                </div>
                <div className="flex gap-2">
                  {ev.status === 'upcoming' && device === 'ipad' && <Btn variant="primary" onClick={() => navigate('capture', ev.id)}>Open sideline capture</Btn>}
                  {ev.status === 'upcoming' && device !== 'ipad' && <Btn onClick={() => navigate('capture', ev.id)}>Capture (iPad-primary)</Btn>}
                  {ev.status === 'past' && device === 'desktop' && (
                    <Btn variant="primary" onClick={() => navigate('debrief', ev.id)}>
                      <span className="flex items-center gap-1.5"><CalendarCheck size={14} /> Debrief packet{drafts > 0 && <span className="rounded-full bg-white/25 px-1.5 text-xs">{drafts} drafts</span>}</span>
                    </Btn>
                  )}
                </div>
              </div>

              {/* ambient compliance pre-check */}
              {preGate.length > 0 && (
                <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs text-amber-900">
                  <ShieldAlert size={13} /> {preGate.map(p => p!.name.split(' (')[0]).join(', ')}: evaluation is fine; contact is not — the badge says which.
                </div>
              )}

              <div className="mt-3">
                <SectionLabel>Coverage</SectionLabel>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[...byAssignee.entries()].map(([sid, pids]) => {
                    const m = staff.find(x => x.id === sid)
                    return (
                      <div key={sid} className="rounded-lg bg-stone-50 px-3 py-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-stone-700"><Avatar staffId={sid} size={20} /> {m?.name} <span className="font-normal text-stone-400">({pids.length})</span></div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {pids.map(pid => {
                            const p = people.find(x => x.id === pid)
                            return p ? <button key={pid} onClick={() => navigate('profile', pid)} className="rounded bg-white px-1.5 py-0.5 text-[11px] text-stone-600 border border-stone-200 hover:border-stone-400">{p.name}</button> : null
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
