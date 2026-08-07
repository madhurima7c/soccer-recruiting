import React, { useMemo } from 'react'
import { Download } from 'lucide-react'
import { useStore } from '../store'
import { Btn, Card, SectionLabel, fmtDate } from '../lib/ui'

const TARGETS = ['ARMS', 'Teamworks', 'Jump Forward', 'Win One'] as const

export default function Outbox() {
  const events = useStore(s => s.complianceEvents)
  const people = useStore(s => s.people)
  const program = useStore(s => s.program)
  const toggle = useStore(s => s.toggleComplianceDone)
  const setTarget = useStore(s => s.setComplianceTarget)
  const toast = useStore(s => s.toast)

  const groups = useMemo(() => {
    const m = new Map<string, typeof events>()
    events.forEach(e => m.set(e.type, [...(m.get(e.type) ?? []), e]))
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]))
  }, [events])
  const pending = events.filter(e => !e.done).length

  return (
    <div className="mx-auto max-w-4xl p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Compliance outbox</h1>
          <div className="text-xs text-stone-500">
            Every loggable event captured anywhere accumulates here, pre-formatted. One weekly sitting instead of per-event re-entry.
            <span className="ml-1 font-semibold text-stone-600">No AI touches this surface.</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-stone-500">Format for</label>
          <select value={program.complianceTarget} onChange={e => setTarget(e.target.value as any)} className="rounded-lg border border-stone-300 bg-white px-2 py-1.5 text-sm font-semibold">
            {TARGETS.map(t => <option key={t}>{t}</option>)}
          </select>
          <Btn onClick={() => toast(`compliance-events-${program.complianceTarget.toLowerCase().replace(' ', '')}.csv exported`, ['(Simulated) — grouped the way the target system wants it'])}>
            <span className="flex items-center gap-1.5"><Download size={14} /> Export CSV</span>
          </Btn>
        </div>
      </div>

      <div className="mt-3 rounded-lg bg-stone-800 px-4 py-2 text-sm text-white">
        <b>{pending}</b> item{pending !== 1 && 's'} not yet filed to <b>{program.complianceTarget}</b> — check off as you enter them side-by-side.
      </div>

      <div className="mt-4 space-y-5">
        {groups.map(([type, list]) => (
          <div key={type}>
            <SectionLabel>{type} events ({list.filter(e => !e.done).length} pending)</SectionLabel>
            <Card>
              {list.sort((a, b) => b.at.localeCompare(a.at)).map(e => {
                const p = people.find(x => x.id === e.personId)
                return (
                  <label key={e.id} className={`flex cursor-pointer items-center gap-3 border-b border-stone-100 px-4 py-2.5 last:border-0 ${e.done ? 'opacity-50' : ''}`}>
                    <input type="checkbox" checked={e.done} onChange={() => toggle(e.id)} className="h-4 w-4 accent-teal-700" />
                    <div className="min-w-0 flex-1">
                      <div className={`text-sm font-medium text-stone-800 ${e.done ? 'line-through' : ''}`}>{p?.name} — {e.detail}</div>
                      <div className="text-[11px] text-stone-400">{fmtDate(e.at)} · formatted for {program.complianceTarget}</div>
                    </div>
                  </label>
                )
              })}
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}
