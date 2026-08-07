import React, { useMemo, useState } from 'react'
import { PhoneCall, Search, Video } from 'lucide-react'
import { useStore } from '../store'
import type { Person } from '../types'
import { AuthorLine, Avatar, Card, ComplianceBadge, PipelineBadge, RatingSparkline, SectionLabel, TierChip } from '../lib/ui'
import { CallCaptureModal } from './RecruitProfile'

export default function RecruitsList() {
  const people = useStore(s => s.people)
  const device = useStore(s => s.device)
  const navigate = useStore(s => s.navigate)
  const feed = useStore(s => s.feed)
  const [q, setQ] = useState('')
  const [group, setGroup] = useState<'recruits' | 'roster'>('recruits')
  const [callFor, setCallFor] = useState<Person | null>(null)

  const list = useMemo(() =>
    people
      .filter(p => (group === 'recruits' ? p.lifecycle === 'recruit' : p.lifecycle === 'rosterPlayer'))
      .filter(p => `${p.name} ${p.positions.join()} ${p.club ?? ''}`.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name)),
    [people, group, q])

  const chaseList = people.filter(p => p.lifecycle === 'recruit' && p.videos.some(v => v.requestedFrom))
  const isPhone = device === 'phone'

  return (
    <div className={`mx-auto flex max-w-5xl gap-5 ${isPhone ? 'p-3' : 'p-5'}`}>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h1 className={`font-bold text-stone-900 ${isPhone ? 'text-base' : 'text-xl'}`}>People — one spine, two lifecycles</h1>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex rounded-lg border border-stone-200 bg-white p-0.5">
            <button onClick={() => setGroup('recruits')} className={`rounded-md px-3 py-1 text-xs font-bold ${group === 'recruits' ? 'bg-stone-800 text-white' : 'text-stone-500'}`}>Recruits</button>
            <button onClick={() => setGroup('roster')} className={`rounded-md px-3 py-1 text-xs font-bold ${group === 'roster' ? 'bg-stone-800 text-white' : 'text-stone-500'}`}>Roster</button>
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5">
            <Search size={14} className="text-stone-400" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search…" className="w-full bg-transparent text-sm outline-none" />
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          {list.map(p => (
            <Card key={p.id} className="flex items-center justify-between gap-2 px-3 py-2" onClick={() => navigate('profile', p.id)}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold text-stone-800">{p.name}</span>
                  {p.lifecycle === 'recruit' ? <TierChip tierId={p.tierId} small /> : <span className="rounded bg-stone-800 px-1.5 py-0.5 text-[9px] font-bold text-white">#{p.jersey}</span>}
                  <PipelineBadge p={p} />
                </div>
                <div className="text-[11px] text-stone-500">{p.positions.join('/')} · ’{String(p.classYear).slice(2)} · {p.club?.split(' (')[0] ?? p.hometown}{p.graduating && ' · graduating'}</div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!isPhone && p.lifecycle === 'recruit' && <RatingSparkline p={p} width={80} height={26} />}
                {p.lifecycle === 'recruit' && <ComplianceBadge p={p} />}
                {p.lifecycle === 'recruit' && p.contactable && (
                  <button
                    onClick={e => { e.stopPropagation(); setCallFor(p) }}
                    title="Log a call (one capture → timeline + feed + outbox)"
                    className="rounded-full bg-teal-700 p-2 text-white hover:bg-teal-800"
                  ><PhoneCall size={isPhone ? 16 : 13} /></button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {device === 'desktop' && (
        <div className="w-72 shrink-0 space-y-4">
          <div>
            <SectionLabel>Staff activity feed (shared by default)</SectionLabel>
            <div className="space-y-1.5">
              {feed.slice(0, 8).map(f => (
                <div key={f.id} className="rounded-lg border border-stone-200 bg-white p-2">
                  <AuthorLine staffId={f.authorId} at={f.at} />
                  <p className="mt-1 text-xs text-stone-700">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
          {chaseList.length > 0 && (
            <div>
              <SectionLabel><span className="flex items-center gap-1"><Video size={12} /> Video chase list</span></SectionLabel>
              <div className="space-y-1.5">
                {chaseList.map(p => {
                  const v = p.videos.find(x => x.requestedFrom)!
                  return (
                    <button key={p.id} onClick={() => navigate('profile', p.id)} className="w-full rounded-lg border border-amber-200 bg-amber-50 p-2 text-left">
                      <div className="text-xs font-bold text-amber-900">{p.name}</div>
                      <div className="text-[10px] text-amber-800">requested from {v.requestedFrom} · nudged 5/26</div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {callFor && <CallCaptureModal p={callFor} onClose={() => setCallFor(null)} />}
    </div>
  )
}
