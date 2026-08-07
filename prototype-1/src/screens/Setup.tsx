import React, { useState } from 'react'
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react'
import { useStore } from '../store'
import { Avatar, Btn, Card, SectionLabel } from '../lib/ui'

export default function Setup() {
  const program = useStore(s => s.program)
  const staff = useStore(s => s.staff)
  const updateProgram = useStore(s => s.updateProgram)
  const [newWord, setNewWord] = useState('')

  const moveValue = (i: number, dir: -1 | 1) => {
    const v = [...program.valuesHierarchy]
    const j = i + dir
    if (j < 0 || j >= v.length) return
    ;[v[i], v[j]] = [v[j], v[i]]
    updateProgram({ valuesHierarchy: v })
  }

  return (
    <div className="mx-auto max-w-4xl p-5">
      <h1 className="text-xl font-bold text-stone-900">Program setup — ideology seeding</h1>
      <div className="text-xs text-stone-500">The system proposes nothing; it asks. Your words become the capture chips everywhere. (Seeded for the demo — everything below is editable.)</div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <SectionLabel>Vocabulary — “what do you call the things you look for?”</SectionLabel>
          <div className="space-y-1.5">
            {program.vocabulary.map(v => (
              <div key={v.word} className="flex items-start justify-between gap-2 rounded-lg bg-stone-50 px-3 py-1.5">
                <div>
                  <span className="text-sm font-bold text-teal-800">{v.word}</span>
                  <span className="ml-2 text-xs text-stone-500">{v.meaning}</span>
                </div>
                <button onClick={() => updateProgram({ vocabulary: program.vocabulary.filter(x => x.word !== v.word) })}><X size={13} className="mt-1 text-stone-300 hover:text-red-500" /></button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input value={newWord} onChange={e => setNewWord(e.target.value)} placeholder="add a word…" className="flex-1 rounded-lg border border-stone-300 px-2 py-1.5 text-sm" />
            <Btn onClick={() => { if (newWord.trim()) { updateProgram({ vocabulary: [...program.vocabulary, { word: newWord.trim(), meaning: '' }] }); setNewWord('') } }}>
              <span className="flex items-center gap-1"><Plus size={13} /> Add</span>
            </Btn>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <SectionLabel>Values hierarchy — order what matters</SectionLabel>
            <div className="space-y-1.5">
              {program.valuesHierarchy.map((v, i) => (
                <div key={v} className="flex items-center justify-between rounded-lg bg-stone-50 px-3 py-1.5">
                  <span className="text-sm font-semibold text-stone-700"><span className="mr-2 text-teal-700">{i + 1}.</span>{v}</span>
                  <span className="flex gap-1">
                    <button onClick={() => moveValue(i, -1)} className="rounded p-0.5 text-stone-400 hover:bg-stone-200"><ArrowUp size={13} /></button>
                    <button onClick={() => moveValue(i, 1)} className="rounded p-0.5 text-stone-400 hover:bg-stone-200"><ArrowDown size={13} /></button>
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-1.5 text-[10px] italic text-stone-400">Stored as ideology metadata; shown on the program home; never used to auto-score anyone.</div>
          </Card>

          <Card className="p-4">
            <SectionLabel>Tiers — your whiteboard, your colors</SectionLabel>
            <div className="space-y-1.5">
              {program.tiers.map(t => (
                <div key={t.id} className="flex items-center gap-2 rounded-lg bg-stone-50 px-3 py-1.5">
                  <input type="color" value={t.color} onChange={e => updateProgram({ tiers: program.tiers.map(x => x.id === t.id ? { ...x, color: e.target.value } : x) })} className="h-6 w-8 cursor-pointer rounded border-none bg-transparent" />
                  <input value={t.name} onChange={e => updateProgram({ tiers: program.tiers.map(x => x.id === t.id ? { ...x, name: e.target.value } : x) })} className="w-32 rounded border border-stone-200 bg-white px-2 py-0.5 text-sm font-semibold" />
                  <span className="truncate text-[11px] text-stone-400">{t.meaning}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="mt-4 p-4">
        <SectionLabel>Staff & roles</SectionLabel>
        <div className="grid gap-2 md:grid-cols-2">
          {staff.map(m => (
            <div key={m.id} className="flex items-center gap-3 rounded-lg bg-stone-50 px-3 py-2">
              <Avatar staffId={m.id} size={30} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-stone-800">{m.name}</div>
                <div className="text-[11px] text-stone-500">{m.role}</div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${m.access === 'full' ? 'bg-teal-100 text-teal-800' : m.access === 'capture-only' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-600'}`}>{m.access}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[11px] text-stone-400">Full = coaches · Capture-only = volunteers (can add sightings, can’t re-tier) · Read-only = future extended staff (ideology layer only).</div>
      </Card>
    </div>
  )
}
