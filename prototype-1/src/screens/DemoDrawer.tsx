import React from 'react'
import { ClipboardList, X } from 'lucide-react'
import { useStore } from '../store'

const SCENARIOS: { title: string; steps: { k: string; text: string }[] }[] = [
  {
    title: '1 · Sideline capture (Sakuda scenario 1)',
    steps: [
      { k: 's1a', text: 'Switch to iPad frame → Capture opens the ID camp' },
      { k: 's1b', text: 'Tap a recruit → capture with chips + a voice draft' },
      { k: 's1c', text: 'Capture on a second recruit (try scribble or photo)' },
      { k: 's1d', text: '“+ Unknown #” → add #14, blue, Crossfire' },
      { k: 's1e', text: 'See the “captures queued — will sync” offline banner' },
    ],
  },
  {
    title: '2 · Post-event debrief (scenario 2)',
    steps: [
      { k: 's2a', text: 'Desktop → Events → Emerald City Showcase debrief' },
      { k: 's2b', text: 'Confirm 2 AI-draft transcripts (edit one inline)' },
      { k: 's2c', text: 'Resolve the Torres divergence (Dana 5 vs Tommy 2 — attributed, never averaged)' },
      { k: 's2d', text: 'Re-tier one recruit from the packet (color dots)' },
      { k: 's2e', text: 'Post summary to staff feed' },
    ],
  },
  {
    title: '3 · Call capture (scenario 3)',
    steps: [
      { k: 's3a', text: 'Phone frame → Recruits → tap the call button on a contactable recruit' },
      { k: 's3b', text: 'Log duration + topic chips + a voice note' },
      { k: 's3c', text: 'Watch the toast name all three destinations' },
      { k: 's3d', text: 'Desktop → Compliance Outbox → the new call is waiting, pre-formatted' },
    ],
  },
  {
    title: '4 · The thesis: pitch planner + what-if + mirror',
    steps: [
      { k: 's4a', text: 'Desktop → Compare + Depth: pitch shows 6 struck-through grads (2 at CM)' },
      { k: 's4b', text: 'Scrub seasons 2026-27 → 2028-29: watch the CM hole open' },
      { k: 's4c', text: 'Lens on “Compete”: attributed reads per player (initials = who said it)' },
      { k: 's4d', text: 'Drag Torres from the rail onto CM → mark “Replaces Kovač” → save Scenario A' },
      { k: 's4e', text: 'Place Reyes (portal, arrives now) as Scenario B → compare (◆ diff)' },
      { k: 's4f', text: 'Scrub forward: Torres arrives ’27 with +4; Reyes runs out — short vs long term' },
      { k: 's4g', text: 'Click a placed player → “Add to comparison canvas” next to the incumbent' },
      { k: 's4h', text: 'Criteria mirror: drill a provenance list → dismiss one (“Not a real pattern”)' },
    ],
  },
  {
    title: '5 · Inbound screening',
    steps: [
      { k: 's5a', text: 'Phone frame → Queue: screen 4 items (note each visible reason)' },
      { k: 's5b', text: 'Approve “M. Torres” → merge prompt → merge, no duplicate' },
      { k: 's5c', text: 'Snooze the ambiguous one to the desktop pile' },
    ],
  },
]

export default function DemoDrawer() {
  const open = useStore(s => s.demoOpen)
  const toggle = useStore(s => s.toggleDemo)
  const checked = useStore(s => s.demoChecked)
  const setChecked = useStore(s => s.setDemoChecked)
  if (!open) return null
  const total = SCENARIOS.reduce((a, s) => a + s.steps.length, 0)
  const done = Object.values(checked).filter(Boolean).length

  return (
    <div className="absolute inset-y-0 right-0 z-[70] flex w-80 flex-col border-l border-stone-300 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-stone-200 bg-stone-900 px-4 py-3 text-white">
        <div className="flex items-center gap-2 text-sm font-bold"><ClipboardList size={15} /> Demo script <span className="rounded-full bg-white/20 px-2 text-xs">{done}/{total}</span></div>
        <button onClick={toggle}><X size={16} /></button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        {SCENARIOS.map(sc => (
          <div key={sc.title} className="mb-4">
            <div className="mb-1.5 text-xs font-bold text-stone-800">{sc.title}</div>
            <div className="space-y-1">
              {sc.steps.map(st => (
                <label key={st.k} className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1 hover:bg-stone-50">
                  <input type="checkbox" checked={!!checked[st.k]} onChange={e => setChecked(st.k, e.target.checked)} className="mt-0.5 accent-teal-700" />
                  <span className={`text-xs ${checked[st.k] ? 'text-stone-400 line-through' : 'text-stone-600'}`}>{st.text}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <div className="rounded-lg bg-stone-100 p-2 text-[10px] text-stone-500">
          Moderator note: if a Five-Laws question comes up mid-test, the answer is always the same — the tool holds the mirror, never the pen.
        </div>
      </div>
    </div>
  )
}
