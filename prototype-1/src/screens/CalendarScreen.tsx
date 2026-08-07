import React from 'react'
import { useStore } from '../store'
import { SectionLabel, TierChip } from '../lib/ui'

// gated recruiting timeline: HS track in months, portal track in days — both clocks at once
const HS_MONTHS = ['Jul ’26', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan ’27', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
const GATES = [
  { at: 1, label: 'Aug 1 — visits open (’28 class)', color: '#dc2626' },
  { at: 4, label: 'Nov — early signing day', color: '#7c3aed' },
  { at: 11, label: 'Jun 15 — ’29 contact window', color: '#dc2626' },
]
const PORTAL_DAYS = ['Jul 6', 'Jul 7', 'Jul 8', 'Jul 9', 'Jul 10', 'Jul 11', 'Jul 12', 'Jul 13']

export default function CalendarScreen() {
  const people = useStore(s => s.people)
  const device = useStore(s => s.device)
  const navigate = useStore(s => s.navigate)
  const active = people.filter(p => p.lifecycle === 'recruit' && p.funnelStage && ['contacted', 'offered'].includes(p.funnelStage))
  const hs = active.filter(p => p.pipeline !== 'Transfer')
  const portal = people.filter(p => p.lifecycle === 'recruit' && p.pipeline === 'Transfer' && p.tierId !== 'red')

  const isPhone = device === 'phone'
  return (
    <div className={`mx-auto max-w-5xl ${isPhone ? 'p-3' : 'p-5'}`}>
      <h1 className={`font-bold text-stone-900 ${isPhone ? 'text-base' : 'text-xl'}`}>Recruiting calendar — two clock speeds</h1>
      <div className="text-xs text-stone-500">The HS track runs on months; the portal track runs on days. Both are visible at once because both are true at once.</div>

      <div className="mt-4">
        <SectionLabel>High-school track (months, gated)</SectionLabel>
        <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white p-3">
          <div className="min-w-[760px]">
            <div className="relative flex border-b border-stone-200 pb-1">
              {HS_MONTHS.map((m, i) => <div key={m} className="flex-1 text-center text-[10px] font-bold uppercase text-stone-400">{m}</div>)}
              {GATES.map(g => (
                <div key={g.label} className="absolute top-0 bottom-0 w-0.5" style={{ left: `${((g.at + 0.5) / 12) * 100}%`, background: g.color }} title={g.label} />
              ))}
            </div>
            <div className="flex pt-1 pb-2">
              {GATES.map(g => (
                <div key={g.label} className="absolute" />
              ))}
            </div>
            <div className="space-y-1.5 pt-1">
              {hs.map(p => {
                // pursuit bar: from now to signing (rough demo span keyed to class year)
                const end = p.classYear === 2027 ? 5 : 11
                return (
                  <div key={p.id} className="relative flex h-7 items-center">
                    <button onClick={() => navigate('profile', p.id)} className="absolute z-10 flex items-center gap-1.5 pl-1 text-xs font-semibold text-stone-700 hover:underline">
                      {p.name} <TierChip tierId={p.tierId} small /> <span className="text-[10px] font-normal text-stone-400">{p.funnelStage}</span>
                    </button>
                    <div className="absolute inset-y-1 rounded-full bg-teal-100" style={{ left: 0, width: `${((end + 1) / 12) * 100}%` }} />
                  </div>
                )
              })}
            </div>
            <div className="mt-2 flex gap-4 border-t border-stone-100 pt-1.5">
              {GATES.map(g => <span key={g.label} className="flex items-center gap-1 text-[10px] text-stone-500"><span className="h-2 w-2 rounded-full" style={{ background: g.color }} /> {g.label}</span>)}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <SectionLabel>Portal track (days — the sprint, in its true density)</SectionLabel>
        <div className="overflow-x-auto rounded-xl border border-orange-200 bg-orange-50/50 p-3">
          <div className="min-w-[680px]">
            <div className="flex border-b border-orange-200 pb-1">
              {PORTAL_DAYS.map(d => <div key={d} className="flex-1 text-center text-[10px] font-bold uppercase text-orange-700">{d}</div>)}
            </div>
            <div className="space-y-1.5 pt-2">
              {portal.map((p, i) => (
                <div key={p.id} className="relative flex h-7 items-center">
                  <button onClick={() => navigate('profile', p.id)} className="absolute z-10 flex items-center gap-1.5 pl-1 text-xs font-semibold text-stone-700 hover:underline">
                    {p.name} <TierChip tierId={p.tierId} small /> <span className="text-[10px] font-normal text-stone-500">{p.school}</span>
                  </button>
                  <div className="absolute inset-y-1 rounded-full bg-orange-200" style={{ left: `${(i % 3) * 8}%`, width: `${30 + (i % 4) * 12}%` }} />
                </div>
              ))}
            </div>
            <div className="mt-2 border-t border-orange-100 pt-1.5 text-[10px] text-orange-700">Portal decisions run start-to-finish inside this strip. Same objects, 10× clock speed — no parallel system.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
