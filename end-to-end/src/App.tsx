import React from 'react'
import {
  LayoutGrid, Users, Columns3, CalendarDays, Inbox, BookOpen, Send, Settings,
  Monitor, Tablet, Smartphone, RotateCcw, ClipboardList, Flag, GraduationCap, X, PhoneCall, BarChart3,
} from 'lucide-react'
import { useStore } from './store'
import type { DeviceMode, Screen } from './types'
import { Avatar } from './lib/ui'
import TierBoard from './screens/TierBoard'
import RecruitProfile from './screens/RecruitProfile'
import SidelineCapture from './screens/SidelineCapture'
import Debrief from './screens/Debrief'
import Compare from './screens/Compare'
import Queue from './screens/Queue'
import Outbox from './screens/Outbox'
import CalendarScreen from './screens/CalendarScreen'
import Journal from './screens/Journal'
import Setup from './screens/Setup'
import EventsScreen from './screens/EventsScreen'
import RecruitsList from './screens/RecruitsList'
import Insights from './screens/Insights'
import DemoDrawer from './screens/DemoDrawer'

// ── Device split is product design: each mode exposes different surfaces (User Flow §4) ──
const NAV: Record<DeviceMode, { screen: Screen; label: string; icon: React.ReactNode }[]> = {
  desktop: [
    { screen: 'board', label: 'Board', icon: <LayoutGrid size={17} /> },
    { screen: 'recruits', label: 'People', icon: <Users size={17} /> },
    { screen: 'compare', label: 'Compare + Depth', icon: <Columns3 size={17} /> },
    { screen: 'insights', label: 'Insights', icon: <BarChart3 size={17} /> },
    { screen: 'events', label: 'Events', icon: <Flag size={17} /> },
    { screen: 'queue', label: 'Inbound (bulk)', icon: <Inbox size={17} /> },
    { screen: 'calendar', label: 'Calendar', icon: <CalendarDays size={17} /> },
    { screen: 'journal', label: 'Journal', icon: <BookOpen size={17} /> },
    { screen: 'outbox', label: 'Compliance Outbox', icon: <Send size={17} /> },
    { screen: 'setup', label: 'Program Setup', icon: <Settings size={17} /> },
  ],
  ipad: [
    { screen: 'capture', label: 'Capture', icon: <Flag size={22} /> },
    { screen: 'board', label: 'Board', icon: <LayoutGrid size={22} /> },
    { screen: 'events', label: 'Events', icon: <ClipboardList size={22} /> },
    { screen: 'recruits', label: 'Recruits', icon: <Users size={22} /> },
  ],
  phone: [
    { screen: 'queue', label: 'Queue', icon: <Inbox size={19} /> },
    { screen: 'recruits', label: 'Recruits', icon: <Users size={19} /> },
    { screen: 'board', label: 'Board', icon: <LayoutGrid size={19} /> },
    { screen: 'calendar', label: 'Calendar', icon: <CalendarDays size={19} /> },
  ],
}

function ScreenRouter() {
  const screen = useStore(s => s.screen)
  const device = useStore(s => s.device)
  // guard: desktop-only surfaces never render off-desktop (Laws + device table)
  if (device !== 'desktop' && (screen === 'outbox' || screen === 'compare' || screen === 'journal' || screen === 'setup' || screen === 'debrief' || screen === 'insights')) {
    return <NotAvailable name={screen} />
  }
  if (device === 'desktop' && screen === 'capture') return <NotAvailable name="Sideline capture" hint="Switch to the iPad frame — capture lives where the player is." />
  switch (screen) {
    case 'board': return <TierBoard />
    case 'profile': return <RecruitProfile />
    case 'capture': return <SidelineCapture />
    case 'debrief': return <Debrief />
    case 'compare': return <Compare />
    case 'queue': return <Queue />
    case 'outbox': return <Outbox />
    case 'calendar': return <CalendarScreen />
    case 'journal': return <Journal />
    case 'setup': return <Setup />
    case 'events': return <EventsScreen />
    case 'recruits': return <RecruitsList />
    case 'insights': return <Insights />
    case 'primer': return <Journal primer />
    default: return <TierBoard />
  }
}

function NotAvailable({ name, hint }: { name: string; hint?: string }) {
  const labels: Record<string, string> = {
    outbox: 'The Compliance Outbox', compare: 'The Comparison Canvas', journal: 'The Decision Journal',
    setup: 'Program Setup', debrief: 'The Debrief Packet', insights: 'Insights',
  }
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center">
      <Monitor size={40} className="mb-3 text-stone-300" />
      <div className="text-lg font-semibold text-stone-600">{labels[name] ?? name} lives on the desktop</div>
      <div className="mt-1 max-w-sm text-sm text-stone-400">{hint ?? 'A deliberate absence, not a missing feature: analysis lives where attention lives; capture lives where the player is.'}</div>
    </div>
  )
}

function Toasts() {
  const toasts = useStore(s => s.toasts)
  const dismiss = useStore(s => s.dismissToast)
  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 z-[90] flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4">
      {toasts.map(t => (
        <div key={t.id} className="toast-in pointer-events-auto rounded-xl border border-teal-200 bg-white p-3 shadow-xl">
          <div className="flex items-start justify-between gap-2">
            <div className="text-sm font-semibold text-stone-800">{t.title}</div>
            <button onClick={() => dismiss(t.id)}><X size={14} className="text-stone-400" /></button>
          </div>
          {t.lines && <ul className="mt-1 space-y-0.5">{t.lines.map((l, i) => <li key={i} className="text-xs text-stone-600">{l}</li>)}</ul>}
        </div>
      ))}
    </div>
  )
}

function DeviceToggle() {
  const device = useStore(s => s.device)
  const setDevice = useStore(s => s.setDevice)
  const opts: { d: DeviceMode; icon: React.ReactNode; label: string }[] = [
    { d: 'desktop', icon: <Monitor size={14} />, label: 'Desktop' },
    { d: 'ipad', icon: <Tablet size={14} />, label: 'iPad (sideline)' },
    { d: 'phone', icon: <Smartphone size={14} />, label: 'Phone (travel)' },
  ]
  return (
    <div className="flex items-center gap-1 rounded-full bg-stone-800 p-1">
      {opts.map(o => (
        <button
          key={o.d}
          onClick={() => setDevice(o.d)}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${device === o.d ? 'bg-white text-stone-900' : 'text-stone-300 hover:text-white'}`}
        >
          {o.icon} {o.label}
        </button>
      ))}
    </div>
  )
}

function UserSwitcher() {
  const staff = useStore(s => s.staff)
  const current = useStore(s => s.currentUserId)
  const setUser = useStore(s => s.setUser)
  return (
    <div className="flex items-center gap-1.5">
      <Avatar staffId={current} size={22} />
      <select
        value={current}
        onChange={e => setUser(e.target.value)}
        className="rounded-md border-none bg-transparent text-xs font-medium text-stone-200 outline-none [&>option]:text-stone-800"
      >
        {staff.map(m => <option key={m.id} value={m.id}>{m.name} · {m.access}</option>)}
      </select>
    </div>
  )
}

export default function App() {
  const device = useStore(s => s.device)
  const screen = useStore(s => s.screen)
  const navigate = useStore(s => s.navigate)
  const resetDemo = useStore(s => s.resetDemo)
  const toggleDemo = useStore(s => s.toggleDemo)
  const program = useStore(s => s.program)

  const frame = {
    desktop: 'w-full h-full max-w-[1500px]',
    ipad: 'w-[840px] h-[95%] max-h-[1120px] rounded-[2rem] border-[10px] border-stone-900 shadow-2xl',
    phone: 'w-[390px] h-[92%] max-h-[820px] rounded-[2.5rem] border-[10px] border-stone-900 shadow-2xl',
  }[device]

  return (
    <div className="flex h-full flex-col bg-stone-300">
      {/* simulator chrome */}
      <div className="flex items-center justify-between gap-4 bg-stone-900 px-4 py-2">
        <div className="flex items-center gap-3">
          <GraduationCap size={18} className="text-teal-400" />
          <div>
            <div className="text-xs font-bold text-white">Unifying Soccer Recruiting — prototype</div>
            <div className="text-[10px] text-stone-400">MHCI+D × Adobe capstone · fictional data · simulated AI</div>
          </div>
        </div>
        <DeviceToggle />
        <div className="flex items-center gap-3">
          <UserSwitcher />
          <button onClick={() => { if (confirm('Reset all demo data to the seeded state?')) resetDemo() }} className="flex items-center gap-1 rounded-full border border-stone-600 px-3 py-1 text-xs text-stone-300 hover:bg-stone-800">
            <RotateCcw size={12} /> Reset demo data
          </button>
          <button onClick={toggleDemo} className="flex items-center gap-1 rounded-full bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-500">
            <ClipboardList size={12} /> Demo script
          </button>
        </div>
      </div>

      {/* the device frame */}
      <div className="flex min-h-0 flex-1 items-center justify-center p-3">
        <div className={`relative flex min-h-0 flex-col overflow-hidden bg-stone-100 ${frame}`}>
          {/* in-app header */}
          {device === 'desktop' && (
            <div className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-2.5">
              <div>
                <div className="text-sm font-bold text-stone-900">{program.name}</div>
                <div className="text-[11px] text-stone-500">{program.division}</div>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-stone-400">
                Values: {program.valuesHierarchy.join(' → ')}
              </div>
            </div>
          )}

          <div className="flex min-h-0 flex-1">
            {/* desktop: sidebar nav */}
            {device === 'desktop' && (
              <nav className="flex w-48 shrink-0 flex-col gap-0.5 border-r border-stone-200 bg-white p-2">
                {NAV.desktop.map(n => (
                  <button
                    key={n.screen}
                    onClick={() => navigate(n.screen)}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors ${screen === n.screen || (screen === 'profile' && n.screen === 'recruits') || (screen === 'debrief' && n.screen === 'events') ? 'bg-teal-50 text-teal-800' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    {n.icon} {n.label}
                  </button>
                ))}
              </nav>
            )}

            {/* main surface */}
            <main className="min-h-0 min-w-0 flex-1 overflow-auto">
              <ScreenRouter />
            </main>
          </div>

          {/* ipad / phone: bottom tab bar */}
          {device !== 'desktop' && (
            <nav className={`flex shrink-0 items-stretch justify-around border-t border-stone-300 bg-white ${device === 'ipad' ? 'py-2' : 'py-1.5'}`}>
              {NAV[device].map(n => (
                <button
                  key={n.screen}
                  onClick={() => navigate(n.screen, n.screen === 'capture' ? 'ev-idcamp' : undefined)}
                  className={`flex flex-col items-center gap-0.5 rounded-lg px-4 py-1 ${screen === n.screen || (screen === 'profile' && n.screen === 'recruits') ? 'text-teal-700' : 'text-stone-400'}`}
                >
                  {n.icon}
                  <span className={`font-semibold ${device === 'ipad' ? 'text-xs' : 'text-[10px]'}`}>{n.label}</span>
                </button>
              ))}
            </nav>
          )}

          <Toasts />
          <DemoDrawer />
        </div>
      </div>
    </div>
  )
}
