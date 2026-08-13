import { useEffect, useMemo, useState } from "react"
import {
  ArrowUpRight,
  Bell,
  BookOpen,
  Bookmark,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock3,
  Flag,
  Home,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  Play,
  Plus,
  ScanLine,
  Search,
  Send,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
  X,
} from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type View = "today" | "moments" | "compare" | "workspace"

const navItems = [
  { id: "today" as const, label: "Today", icon: Home },
  { id: "moments" as const, label: "Moments", icon: Bookmark },
  { id: "compare" as const, label: "Compare", icon: Target },
  { id: "workspace" as const, label: "Workspace", icon: Users },
]

const candidates = [
  { id: "alden", name: "Riley Alden", short: "Alden", position: "GK", score: 4.6, support: 22, status: "Need more film", cost: "$48K", x: 78, y: 77 },
  { id: "keane", name: "Nia Keane", short: "Keane", position: "GK", score: 4.2, support: 38, status: "Staff watch", cost: "$36K", x: 61, y: 66 },
  { id: "thorne", name: "Ari Thorne", short: "Thorne", position: "GK", score: 3.8, support: 8, status: "Compare", cost: "$29K", x: 44, y: 51 },
  { id: "sutton", name: "Lena Sutton", short: "Sutton", position: "GK", score: 4.4, support: 64, status: "Ready to advance", cost: "$41K", x: 70, y: 72 },
]

const fieldPlayers = [
  { id: "jordan", name: "Jordan Lee", position: "CM", score: 84, club: "CE", watch: 6, live: 1, color: "plain" },
  { id: "sam", name: "Sam Ortiz", position: "CM", score: 86, club: "GA", watch: 4, live: 0, color: "yellow" },
  { id: "lena", name: "Lena Kim", position: "FW", score: 79, club: "BR", watch: 9, live: 2, color: "green" },
  { id: "mateo", name: "Mateo Rossi", position: "DF", score: 91, club: "IT", watch: 3, live: 1, color: "blue" },
]

const savedMoments = [
  { time: "10:35", player: "Jordan Lee", tag: "Shot", note: "Strong first touch in tight space", author: "You", media: true },
  { time: "10:37", player: "Sam Ortiz", tag: "Compete", note: "Won second ball under pressure", author: "You", media: true },
  { time: "10:52", player: "Jordan Lee", tag: "Staff note", note: "Keep on staff watchlist — press resistance is real", author: "Coach Martinez", media: false },
]

const initialView = (): View => {
  const query = new URLSearchParams(window.location.search).get("view")
  if (query === "today" || query === "moments" || query === "compare" || query === "workspace") return query
  return window.matchMedia("(max-width: 699px)").matches ? "moments" : "today"
}

export default function KitPrototype() {
  const [view, setView] = useState<View>(initialView)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    document.title = `Kit · ${navItems.find((item) => item.id === view)?.label}`
  }, [view])

  useEffect(() => {
    if (!toast) return
    const timeout = window.setTimeout(() => setToast(null), 2400)
    return () => window.clearTimeout(timeout)
  }, [toast])

  return (
    <div className="kit-app flex h-dvh min-h-[620px] overflow-hidden bg-[#f3f4ef] text-[#171a16]">
      <Sidebar view={view} onView={setView} open={sidebarOpen} onToggle={() => setSidebarOpen((value) => !value)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          view={view}
          sidebarOpen={sidebarOpen}
          onSidebar={() => setSidebarOpen((value) => !value)}
          onAssistant={() => setAssistantOpen(true)}
        />

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-24 md:pb-8">
          {view === "today" && <TodayView onView={setView} />}
          {view === "moments" && <MomentsView onLogged={(message) => setToast(message)} />}
          {view === "compare" && <CompareView onToast={setToast} />}
          {view === "workspace" && <WorkspaceView onToast={setToast} />}
        </main>
      </div>

      <MobileNav view={view} onView={setView} onAssistant={() => setAssistantOpen(true)} />
      <Assistant open={assistantOpen} onClose={() => setAssistantOpen(false)} onView={setView} />

      {toast && (
        <div role="status" className="kit-toast fixed bottom-24 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#19231b] px-4 py-2.5 text-sm text-white shadow-xl md:bottom-6">
          <span className="flex size-5 items-center justify-center rounded-full bg-[#4ec268]"><Check className="size-3" /></span>
          {toast}
        </div>
      )}
    </div>
  )
}

function Sidebar({ view, onView, open, onToggle }: { view: View; onView: (view: View) => void; open: boolean; onToggle: () => void }) {
  return (
    <aside className={cn("hidden shrink-0 flex-col border-r border-black/[0.07] bg-[#fafbf8] transition-[width] duration-200 md:flex", open ? "w-[224px]" : "w-[72px]")}> 
      <div className="flex h-[68px] items-center gap-3 px-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#27863d] text-base font-bold text-white">K</div>
        {open && <div className="min-w-0"><div className="font-semibold leading-4">Kit</div><div className="mt-1 truncate text-[11px] text-[#7a8177]">Washington Women’s Soccer</div></div>}
      </div>
      <div className="px-3 pb-2 pt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#989d95]">{open ? "Dashboard" : ""}</div>
      <nav className="flex flex-1 flex-col gap-1 px-2">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" onClick={() => onView(id)} className={cn("kit-pressable flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors", view === id ? "bg-[#e4f1e4] font-medium text-[#1f6c32]" : "text-[#596056] hover:bg-black/[0.04]")} title={!open ? label : undefined}>
            <Icon className="size-4 shrink-0" strokeWidth={1.8} />
            {open && <span>{label}</span>}
          </button>
        ))}
        <div className="mt-3 border-t border-black/[0.06] pt-3">
          <button type="button" className="kit-pressable flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-[#596056] hover:bg-black/[0.04]">
            <BookOpen className="size-4 shrink-0" strokeWidth={1.8} />{open && <span>Team values</span>}
          </button>
          <button type="button" className="kit-pressable flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-[#596056] hover:bg-black/[0.04]">
            <SlidersHorizontal className="size-4 shrink-0" strokeWidth={1.8} />{open && <span>Recruiting context</span>}
          </button>
        </div>
      </nav>
      {open && (
        <div className="m-3 rounded-xl border border-[#d8e7d8] bg-[#edf6ed] p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-[#1f6c32]"><CircleDot className="size-3.5" /> Kit is current</div>
          <p className="mt-1.5 text-[11px] leading-4 text-[#657064]">4 staff notes and 2 new moments have synced.</p>
        </div>
      )}
      <button type="button" onClick={onToggle} className="kit-pressable m-2 flex h-10 items-center justify-center rounded-lg text-[#777e75] hover:bg-black/[0.04]" aria-label={open ? "Collapse sidebar" : "Expand sidebar"}>
        {open ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
      </button>
    </aside>
  )
}

function Topbar({ view, sidebarOpen, onSidebar, onAssistant }: { view: View; sidebarOpen: boolean; onSidebar: () => void; onAssistant: () => void }) {
  const label = navItems.find((item) => item.id === view)?.label
  return (
    <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-black/[0.07] bg-white/90 px-4 backdrop-blur-xl md:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <button type="button" onClick={onSidebar} className="kit-pressable hidden size-9 items-center justify-center rounded-lg text-[#60665e] hover:bg-black/[0.05] md:flex lg:hidden" aria-label="Toggle sidebar">
          {sidebarOpen ? <PanelLeftClose className="size-4" /> : <Menu className="size-4" />}
        </button>
        <div className="flex size-8 items-center justify-center rounded-lg bg-[#27863d] font-bold text-white md:hidden">K</div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">Women’s Soccer · {label}</div>
          <div className="hidden text-[11px] text-[#7a8177] sm:block">26 players · 2026 season</div>
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <button type="button" className="kit-pressable hidden h-9 items-center gap-2 rounded-lg border border-black/[0.08] bg-white px-3 text-xs text-[#60665e] shadow-sm sm:flex"><Search className="size-3.5" /> Search</button>
        <button type="button" className="kit-pressable flex size-9 items-center justify-center rounded-lg text-[#60665e] hover:bg-black/[0.05]" aria-label="Notifications"><Bell className="size-4" /></button>
        <Button size="sm" onClick={onAssistant} className="hidden sm:inline-flex"><Sparkles className="size-3.5" /> Ask Kit</Button>
      </div>
    </header>
  )
}

function MobileNav({ view, onView, onAssistant }: { view: View; onView: (view: View) => void; onAssistant: () => void }) {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 grid h-[64px] grid-cols-5 rounded-2xl border border-black/10 bg-white/95 p-1.5 shadow-[0_12px_40px_rgba(28,36,28,.16)] backdrop-blur-xl md:hidden">
      {navItems.map(({ id, label, icon: Icon }) => (
        <button key={id} type="button" onClick={() => onView(id)} className={cn("kit-pressable flex flex-col items-center justify-center gap-1 rounded-xl text-[9px]", view === id ? "bg-[#e6f1e5] font-semibold text-[#237539]" : "text-[#777e75]")}><Icon className="size-[18px]" /><span>{label}</span></button>
      ))}
      <button type="button" onClick={onAssistant} className="kit-pressable flex flex-col items-center justify-center gap-1 rounded-xl bg-[#27863d] text-[9px] font-semibold text-white"><Sparkles className="size-[18px]" /><span>Ask Kit</span></button>
    </nav>
  )
}

function TodayView({ onView }: { onView: (view: View) => void }) {
  return (
    <div className="mx-auto w-full max-w-[1320px] p-4 sm:p-6 lg:p-8">
      <section className="kit-hero relative overflow-hidden rounded-[24px] border border-[#dbe5d8] bg-[#eaf3e7] p-5 sm:p-7 lg:p-8">
        <div className="relative z-10 max-w-2xl">
          <Badge className="border-[#b9d5bb] bg-white/70 text-[#237539]">Thursday · Aug 6</Badge>
          <h1 className="mt-4 max-w-xl text-[30px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[42px]">A clearer view of who fits—before the room gets loud.</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#5f695e]">Kit brings scouting moments, staff judgment, and roster trade-offs into one shared picture. You still make the call.</p>
          <div className="mt-6 flex flex-wrap gap-2"><Button onClick={() => onView("compare")}>Review goalkeeper decision <ChevronRight className="size-4" /></Button><Button variant="secondary" onClick={() => onView("moments")}>See latest moments</Button></div>
        </div>
        <div className="absolute -bottom-28 -right-16 size-[340px] rounded-full border-[42px] border-white/45" aria-hidden />
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section className="rounded-[20px] border border-black/[0.08] bg-white shadow-[0_1px_2px_rgba(20,30,20,.04)]">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/[0.07] p-5">
              <div><div className="flex items-center gap-2"><h2 className="text-lg font-semibold tracking-tight">Ranking for GK</h2><Badge>U19</Badge></div><p className="mt-1 text-xs text-[#7a8177]">Voting and rankings for goalkeepers · 4 staff members</p></div>
              <div className="flex items-center gap-2"><Badge className="border-[#d3e7d3] bg-[#edf6ed] text-[#237539]">4 notes</Badge><Button size="sm" onClick={() => onView("workspace")}>View discussion</Button></div>
            </div>
            <div className="grid divide-y divide-black/[0.07] sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
              {candidates.map((candidate) => (
                <button key={candidate.id} type="button" onClick={() => onView("compare")} className="kit-pressable group min-h-[210px] p-5 text-left hover:bg-[#fafbf8]">
                  <div className="flex items-center gap-3"><Avatar name={candidate.name} className="size-10" /><div><div className="text-sm font-semibold">{candidate.short}</div><div className="text-[11px] text-[#7a8177]">{candidate.position} · {candidate.score.toFixed(1)} / 5</div></div></div>
                  <div className="mt-8 flex items-end justify-between gap-4"><div><div className="text-[28px] font-medium tracking-tight">{candidate.support}%</div><div className="text-[10px] uppercase tracking-[0.1em] text-[#91978e]">Staff support</div></div><div className="flex h-20 w-8 items-end rounded-t-md bg-[#eef0eb]"><span className="w-full rounded-t-md bg-[#27863d] transition-[height] duration-200" style={{ height: `${Math.max(candidate.support, 10)}%` }} /></div></div>
                  <div className="mt-4 text-[11px] font-medium text-[#566055] group-hover:text-[#237539]">{candidate.status} →</div>
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between"><div><h2 className="text-base font-semibold">Questions shaping the room</h2><p className="mt-0.5 text-xs text-[#7a8177]">What still needs judgment, not more data.</p></div><button type="button" className="text-xs font-medium text-[#237539]">See all</button></div>
            <div className="grid gap-3 lg:grid-cols-3">
              {[
                ["Who changes how we build out?", "3 comparisons ready", "compare"],
                ["What breaks if we take both?", "$100K budget · 4 scenarios", "compare"],
                ["Where does staff judgment split?", "9 notes · 4 votes", "workspace"],
              ].map(([title, meta, destination]) => (
                <button key={title} type="button" onClick={() => onView(destination as View)} className="kit-pressable rounded-2xl border border-black/[0.08] bg-white p-4 text-left shadow-sm hover:border-[#a8cbaa] hover:shadow-md">
                  <div className="flex items-start justify-between gap-3"><MessageSquare className="size-4 text-[#27863d]" /><ArrowUpRight className="size-4 text-[#989d95]" /></div><h3 className="mt-5 text-sm font-semibold leading-5">{title}</h3><p className="mt-1 text-[11px] text-[#7a8177]">{meta}</p>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[20px] border border-black/[0.08] bg-[#1d2a20] p-5 text-white">
            <div className="flex items-center justify-between"><div className="text-xs font-medium text-white/65">Roster pulse</div><LayoutDashboard className="size-4 text-[#7cd58b]" /></div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              {[['23 / 26','spots'],['$100K','budget left'],['4','open needs'],['7','active recruits']].map(([value,label])=><div key={label} className="rounded-xl bg-white/[0.07] p-3"><div className="text-xl font-semibold">{value}</div><div className="mt-1 text-[10px] text-white/55">{label}</div></div>)}
            </div>
            <div className="mt-4 border-t border-white/10 pt-4"><div className="flex items-center justify-between text-xs"><span className="text-white/65">Most fragile position</span><span>Goalkeeper</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[72%] rounded-full bg-[#68ca79]" /></div></div>
          </div>
          <button type="button" onClick={() => onView("moments")} className="kit-pressable w-full rounded-[20px] border border-black/[0.08] bg-white p-5 text-left shadow-sm hover:border-[#a8cbaa]">
            <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-xs font-semibold"><Clock3 className="size-4 text-[#27863d]" /> Latest from Charlotte</div><Badge className="bg-[#ffe9e8] text-[#b5302e]">Live</Badge></div>
            <p className="mt-4 text-sm font-medium">2 moments and 1 staff note are ready to review.</p><p className="mt-1 text-[11px] text-[#7a8177]">Field 7 · GA Aspire vs FC Dallas</p>
          </button>
        </aside>
      </div>
    </div>
  )
}

function MomentsView({ onLogged }: { onLogged: (message: string) => void }) {
  const [selectedPlayer, setSelectedPlayer] = useState("jordan")
  const [selectedTag, setSelectedTag] = useState("Shot")
  const [note, setNote] = useState("")
  const [tab, setTab] = useState<"log" | "saved">("log")
  const selected = fieldPlayers.find((player) => player.id === selectedPlayer) ?? fieldPlayers[0]

  function logMoment() {
    onLogged(`${selected.name} · ${selectedTag} saved to the team timeline`)
    setNote("")
    setTab("saved")
  }

  return (
    <div className="mx-auto grid min-w-0 w-full max-w-[1320px] gap-5 p-0 sm:p-6 lg:grid-cols-[420px_minmax(0,1fr)] lg:p-8">
      <section className="min-h-full min-w-0 w-full overflow-hidden bg-white px-5 pb-8 pt-5 sm:rounded-[24px] sm:border sm:border-black/[0.08] sm:px-6 sm:shadow-sm">
        <div className="flex items-start justify-between"><div><p className="text-xs text-[#7a8177]">ECNL Charlotte · Saturday</p><h1 className="mt-1 text-xl font-semibold">Scout Companion</h1></div><Button variant="secondary" size="icon" aria-label="Scan tournament brochure"><ScanLine className="size-4" /></Button></div>
        <div className="mt-5 grid grid-cols-2 rounded-xl bg-[#f5f5f5] p-1">
          <button type="button" onClick={() => setTab("log")} className={cn("kit-pressable h-8 rounded-lg text-xs font-medium text-[#111111]", tab === "log" && "border border-[#dedede] bg-white shadow-sm")}>Log data</button>
          <button type="button" onClick={() => setTab("saved")} className={cn("kit-pressable h-8 rounded-lg text-xs font-medium text-[#111111]", tab === "saved" && "border border-[#dedede] bg-white shadow-sm")}>Saved moments</button>
        </div>

        {tab === "saved" ? (
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Saved moments</h2><Badge>{savedMoments.length} today</Badge></div>
            {savedMoments.map((moment) => <MomentCard key={`${moment.time}-${moment.player}`} moment={moment} compact />)}
            <Button variant="secondary" className="w-full" onClick={() => setTab("log")}>Log another moment</Button>
          </div>
        ) : (
          <>
            <div className="mt-6"><button type="button" className="text-xs text-[#747b72]">← Fields</button><div className="mt-4 flex items-center gap-2"><Badge className="border-0 bg-[#e32f36] text-white">Live</Badge></div><h2 className="mt-3 text-lg font-semibold">Field 7 · GA Aspire vs FC Dallas</h2></div>
            <div className="mt-5 flex items-center justify-between"><Button variant="secondary" size="sm"><Plus className="size-3.5" /> Add player <ChevronDown className="size-3.5" /></Button><span className="text-[11px] text-[#8a9087]">Swipe to select</span></div>
            <div className="kit-scrollbar -mx-5 mt-5 flex snap-x gap-3 overflow-x-auto px-5 pb-3 sm:-mx-6 sm:px-6">
              {fieldPlayers.map((player) => <PlayerShield key={player.id} player={player} selected={selectedPlayer === player.id} onClick={() => setSelectedPlayer(player.id)} />)}
            </div>
            <div className="mt-2 rounded-2xl border border-[#dedede] bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,.05)]">
              <div className="flex items-center justify-between"><h3 className="text-sm font-semibold">Log moments</h3><Badge className="bg-white">10:15 AM</Badge></div>
              <div className="mt-4 grid grid-cols-4 gap-1.5">{["Shot", "Duel", "Compete", "Flag"].map((tag) => <button key={tag} type="button" onClick={() => setSelectedTag(tag)} className={cn("kit-pressable h-9 rounded-full bg-[#f5f5f5] text-xs font-medium text-[#111111]", selectedTag === tag && "bg-[#ededed] ring-1 ring-[#d4d4d4]")}>{tag}</button>)}</div>
              <label className="mt-3 flex h-12 items-center rounded-xl border border-[#dedede] bg-white px-3"><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a quick note" className="min-w-0 flex-1 bg-transparent text-xs text-[#111111] outline-none placeholder:text-[#8d8d8d]" /><Mic className="size-5 text-[#8d8d8d]" /></label>
              <Button className="mt-3 w-full" onClick={logMoment}><Star className="size-4" /> Log moment</Button>
            </div>
          </>
        )}
      </section>

      <section className="hidden min-h-[700px] overflow-hidden rounded-[24px] border border-black/[0.08] bg-white shadow-sm lg:block">
        <div className="flex items-start justify-between border-b border-black/[0.07] p-6"><div><h2 className="text-xl font-semibold">Player timelines</h2><p className="mt-1 text-xs text-[#7a8177]">SAT · JULY 12 · moments sync from the field</p></div><div className="flex gap-2"><Button variant="secondary" size="sm"><Share2 className="size-3.5" /> Share</Button><Button size="sm">Review moments</Button></div></div>
        <div className="relative h-[590px] overflow-hidden p-6">
          <div className="absolute inset-y-6 left-[220px] right-6 grid grid-cols-4">{["10:15", "10:35", "10:52", "11:10"].map((time) => <div key={time} className="border-l border-black/[0.07] pl-3 text-[10px] font-medium text-[#7a8177]">{time}</div>)}</div>
          {[0, 1].map((row) => {
            const player = fieldPlayers[row]
            return <div key={player.id} className="relative mt-12 h-[190px]"><div className="absolute left-0 top-12 flex w-[190px] items-center gap-3 rounded-xl border border-black/[0.08] bg-white p-3 shadow-sm"><Avatar name={player.name} /><div><div className="text-sm font-semibold">{player.name}</div><div className="text-[10px] text-[#7a8177]">#{row === 0 ? 7 : 10} · {player.position} · {player.score} OVR</div></div></div><div className="absolute left-[220px] right-0 top-[72px] h-px bg-black/30"><span className="absolute left-[32%] top-1/2 size-2 -translate-y-1/2 rounded-full bg-[#27863d]" /><span className="absolute left-[72%] top-1/2 size-2 -translate-y-1/2 rounded-full bg-[#27863d]" /></div>{savedMoments.filter((moment) => moment.player === player.name).map((moment, index) => <div key={moment.time} className="absolute top-[88px] w-[190px]" style={{ left: `${250 + index * 245}px` }}><MomentCard moment={moment} /></div>)}</div>
          })}
        </div>
      </section>
    </div>
  )
}

function PlayerShield({ player, selected, onClick }: { player: typeof fieldPlayers[number]; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn("kit-pressable relative h-[220px] w-[148px] shrink-0 snap-start overflow-hidden border bg-gradient-to-b from-[#fbfbfd] to-[#f2f4f8] p-4 text-left [clip-path:polygon(14%_0,86%_0,100%_12%,100%_78%,50%_100%,0_78%,0_12%)]", selected ? "border-[#237d3b] ring-2 ring-[#237d3b]/15" : "border-[#777b80]")}>
      <div className="text-2xl font-semibold">{player.score}</div><div className="text-[9px] font-semibold">{player.position}</div><Avatar name={player.name} className="mx-auto mt-2 size-11" /><div className="mt-3 text-center text-xs font-semibold">{player.name}</div><div className="mx-auto mt-3 h-px w-16 bg-black/10" /><div className="mt-2 grid grid-cols-2 gap-y-1 text-center text-[8px] text-[#626961]"><span>{player.watch} WCH</span><span>{player.live}× LIVE</span><span>HI INT</span><span>12 ROW</span></div>
    </button>
  )
}

function MomentCard({ moment, compact = false }: { moment: typeof savedMoments[number]; compact?: boolean }) {
  return <div className={cn("rounded-xl border border-black/[0.08] bg-white p-3 shadow-sm", compact ? "w-full" : "w-[190px]")}><div className="flex items-center gap-2 text-[10px] font-semibold"><span>{moment.time}</span><span>·</span><span>{moment.tag}</span>{moment.media && <Play className="ml-auto size-3.5 fill-[#27863d] text-[#27863d]" />}</div><p className="mt-2 text-xs leading-4 text-[#4f574e]">{moment.note}</p><div className="mt-2 text-[9px] text-[#8a9087]">{moment.player} · {moment.author}</div></div>
}

function CompareView({ onToast }: { onToast: (message: string) => void }) {
  const [scenario, setScenario] = useState("balanced")
  const scenarios = [
    { id: "performance", label: "Best performance", name: "Double midfield", cost: "$84K", ceiling: "4.5" },
    { id: "keeper", label: "Best for budget", name: "Goalkeeper first", cost: "$71K", ceiling: "4.0" },
    { id: "balanced", label: "Recommended", name: "Balanced roster", cost: "$76K", ceiling: "4.1" },
    { id: "potential", label: "Long-term", name: "Potential roster", cost: "$73K", ceiling: "4.2" },
  ]
  return (
    <div className="mx-auto w-full max-w-[1320px] p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><Badge>Decision room</Badge><h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">What is shaping your decision?</h1><p className="mt-1 text-sm text-[#70776d]">Compare complete roster scenarios—not players in isolation.</p></div><div className="flex gap-2"><Button variant="secondary" size="sm"><SlidersHorizontal className="size-3.5" /> Weights</Button><Button size="sm" onClick={() => onToast("Balanced roster shared with staff")}><Share2 className="size-3.5" /> Share</Button></div></div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        <section className="rounded-[20px] border border-black/[0.08] bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">Scholarship ask × projected ceiling</h2><p className="mt-1 text-[11px] text-[#7a8177]">Each point is one recruit · benchmark line at 3.5</p></div><Badge className="bg-[#eef6ec] text-[#237539]">$100K budget</Badge></div>
          <div className="relative mt-5 aspect-[1.35/1] min-h-[340px] rounded-xl border border-black/[0.07] bg-[#fbfcf9] sm:aspect-[1.8/1]">
            <div className="absolute bottom-10 left-12 right-5 top-6 border-b border-l border-black/40">
              <div className="absolute inset-x-0 top-[36%] border-t border-dashed border-black/15"><span className="absolute -left-10 -top-2 text-[9px] text-[#8a9087]">3.5</span></div>
              <div className="absolute bottom-0 right-0 top-0 w-[27%] bg-[#f1f2ee]" />
              {candidates.map((candidate) => <button key={candidate.id} type="button" className="kit-point group absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5" style={{ left: `${candidate.x}%`, top: `${100 - candidate.y}%` }} title={`${candidate.name}: ${candidate.cost}`}><span className="size-3 rounded-full border-2 border-[#2ca24c] bg-white shadow-sm group-hover:bg-[#2ca24c]" /><span className="whitespace-nowrap text-[9px] font-medium text-[#4f574e]">{candidate.short}</span></button>)}
              {[['Okafor',48,28],['Rossi',28,17],['Patel',40,52],['Lind',58,65]].map(([name,x,y])=><div key={String(name)} className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5" style={{left:`${x}%`,top:`${y}%`}}><span className="size-2.5 rounded-full border-2 border-[#2ca24c] bg-white"/><span className="text-[9px] text-[#5d655b]">{name}</span></div>)}
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8a9087]">Scholarship ask →</div>
            <div className="absolute left-2 top-1/2 -rotate-90 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#8a9087]">Ceiling →</div>
          </div>
          <div className="kit-scrollbar mt-4 flex snap-x gap-2 overflow-x-auto pb-2">
            {scenarios.map((item) => <button key={item.id} type="button" onClick={() => setScenario(item.id)} className={cn("kit-pressable min-w-[210px] snap-start rounded-xl border p-3 text-left", scenario === item.id ? "border-[#2ca24c] bg-[#f5fbf4] ring-1 ring-[#2ca24c]/15" : "border-black/[0.08] bg-white")}><div className="flex items-center justify-between"><span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#237539]">{item.label}</span>{scenario === item.id && <Check className="size-3.5 text-[#2ca24c]" />}</div><div className="mt-2 text-sm font-semibold">{item.name}</div><div className="mt-3 grid grid-cols-2 gap-2"><Metric label="Year 1 cost" value={item.cost} /><Metric label="Ceiling" value={item.ceiling} /></div></button>)}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[20px] border border-black/[0.08] bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><Trophy className="size-4 text-[#27863d]" /><h2 className="text-sm font-semibold">Kit’s read</h2></div><p className="mt-4 text-sm leading-6 text-[#4f574e]">The balanced roster preserves your goalkeeper floor without closing the door on a second attacking midfielder.</p><Button className="mt-4 w-full" size="sm" onClick={() => onToast("Recommendation added to the decision room")}>Add to decision room</Button></div>
          <div className="rounded-[20px] border border-[#ead8b9] bg-[#fff9ee] p-5"><h2 className="text-sm font-semibold">What breaks</h2><div className="mt-4 space-y-3">{[["Scholarship budget","$24K remaining","ok"],["Goalkeeper depth","2 of 2","ok"],["Attacking cover","1 of 2","warn"],["Roster spots","24 of 26","ok"]].map(([label,value,status])=><div key={label} className="flex items-center justify-between border-b border-black/[0.06] pb-2 text-xs last:border-0"><span className="text-[#686f66]">{label}</span><span className={cn("font-medium",status === "warn" && "text-[#b76c16]")}>{value}</span></div>)}</div></div>
        </aside>
      </div>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-lg bg-[#f2f3ef] p-2"><div className="text-[8px] uppercase tracking-[0.08em] text-[#8a9087]">{label}</div><div className="mt-1 text-lg font-semibold">{value}</div></div> }

function WorkspaceView({ onToast }: { onToast: (message: string) => void }) {
  const [choice, setChoice] = useState("balanced")
  const [note, setNote] = useState("")
  const tally = useMemo(() => choice === "balanced" ? 3 : 2, [choice])
  return (
    <div className="mx-auto w-full max-w-[1180px] p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3"><div><Badge>Shared team workspace</Badge><h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Goalkeeper decision · 2026</h1><p className="mt-1 text-sm text-[#70776d]">The evidence, the opinions, and the trade-offs in one place.</p></div><Button variant="secondary" size="sm"><Share2 className="size-3.5" /> Copy link</Button></div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-4">
          <div className="rounded-[20px] border border-black/[0.08] bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><h2 className="text-base font-semibold">What are we trying to decide?</h2><Badge className="bg-[#fff4dd] text-[#9a641b]">Voting</Badge></div><p className="mt-2 text-sm text-[#60685e]">Which goalkeeper path gives us enough immediate quality without narrowing the rest of the class?</p></div><MessageSquare className="size-5 text-[#27863d]" /></div>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">{[["balanced","Balanced roster","$76K · 4.1 ceiling"],["performance","Double midfield","$84K · 4.5 ceiling"],["keeper","Goalkeeper first","$71K · 4.0 ceiling"]].map(([id,label,meta])=><button key={id} type="button" onClick={() => setChoice(id)} className={cn("kit-pressable rounded-xl border p-3 text-left",choice === id ? "border-[#2ca24c] bg-[#f2faf1]" : "border-black/[0.08]")}><div className="flex items-center justify-between"><span className="text-xs font-semibold">{label}</span>{choice === id && <Check className="size-3.5 text-[#27863d]" />}</div><p className="mt-1 text-[10px] text-[#7a8177]">{meta}</p></button>)}</div>
            <Button className="mt-4" size="sm" onClick={() => onToast(`Vote recorded · ${tally} staff aligned`)}>Record my vote</Button>
          </div>

          <div className="rounded-[20px] border border-black/[0.08] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between"><h2 className="text-base font-semibold">Staff thinking</h2><span className="text-xs text-[#7a8177]">4 notes</span></div>
            <div className="mt-4 space-y-4">{[
              ["Coach Martinez","Head coach","I keep coming back to Sutton’s communication. The number is strong, but the way she resets the back line is the fit for us."],
              ["Renee Clarke","Recruiting coordinator","Alden gives us the higher ceiling. I need one more full match against a high press before I’m ready."],
              ["Sam Patel","Assistant coach","Balanced roster leaves room for the attacking need. I’m comfortable if we keep Keane warm as the second option."],
            ].map(([name,role,text])=><article key={name} className="flex gap-3 border-b border-black/[0.06] pb-4 last:border-0 last:pb-0"><Avatar name={name} /><div className="min-w-0"><div className="flex flex-wrap items-baseline gap-2"><span className="text-xs font-semibold">{name}</span><span className="text-[10px] text-[#8a9087]">{role}</span></div><p className="mt-1.5 text-sm leading-5 text-[#555e53]">{text}</p><div className="mt-2 flex gap-3 text-[10px] text-[#899086]"><span>👍 2</span><span>Reply</span></div></div></article>)}</div>
            <label className="mt-5 flex items-center gap-2 rounded-xl border border-black/10 bg-[#fafbf8] p-2 pl-3"><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add your judgment, not just a score…" className="min-w-0 flex-1 bg-transparent text-xs outline-none" /><Button size="icon" disabled={!note.trim()} onClick={() => { onToast("Note added to the decision"); setNote("") }}><Send className="size-4" /></Button></label>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-[20px] border border-black/[0.08] bg-[#1d2a20] p-5 text-white"><div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Staff alignment</h2><span className="text-2xl font-semibold">75%</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-3/4 rounded-full bg-[#68ca79]" /></div><div className="mt-4 flex -space-x-2">{["Coach Martinez","Renee Clarke","Sam Patel","Alex Moreau"].map((name)=><Avatar key={name} name={name} className="ring-2 ring-[#1d2a20]" />)}</div><p className="mt-4 text-xs leading-5 text-white/60">One open question: does Alden’s upside outweigh the roster flexibility?</p></div>
          <div className="rounded-[20px] border border-black/[0.08] bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><Flag className="size-4 text-[#27863d]" /><h2 className="text-sm font-semibold">Evidence attached</h2></div><div className="mt-4 space-y-2">{[["3 field moments","ECNL Charlotte"],["2 comparison reports","GK benchmark"],["9 staff notes","This season"]].map(([title,meta])=><button key={title} type="button" className="kit-pressable flex w-full items-center justify-between rounded-xl bg-[#f4f5f1] p-3 text-left"><span><span className="block text-xs font-medium">{title}</span><span className="mt-0.5 block text-[10px] text-[#8a9087]">{meta}</span></span><ChevronRight className="size-3.5 text-[#8a9087]" /></button>)}</div></div>
        </aside>
      </div>
    </div>
  )
}

function Assistant({ open, onClose, onView }: { open: boolean; onClose: () => void; onView: (view: View) => void }) {
  const [input, setInput] = useState("")
  const [answer, setAnswer] = useState<string | null>(null)
  function ask(question: string) {
    if (!question.trim()) return
    setAnswer("Sutton currently has the strongest shared signal: 64% staff support, a 4.4 coach score, and the best fit with the back-line communication notes. The balanced scenario keeps $24K available for attacking cover.")
    setInput("")
  }
  return (
    <>
      <button type="button" aria-label="Close Kit assistant" onClick={onClose} className={cn("fixed inset-0 z-[70] bg-black/20 backdrop-blur-[1px] transition-opacity duration-200", open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")} />
      <aside aria-hidden={!open} className={cn("fixed bottom-0 right-0 top-0 z-[80] flex w-full max-w-[420px] flex-col border-l border-black/10 bg-white shadow-2xl transition-transform duration-200 [transition-timing-function:var(--ease-drawer)] max-sm:top-[12%] max-sm:rounded-t-[24px] max-sm:border-l-0 max-sm:border-t", open ? "translate-x-0 max-sm:translate-y-0" : "translate-x-full max-sm:translate-x-0 max-sm:translate-y-full")}>
        <div className="flex items-center gap-3 border-b border-black/[0.07] p-4"><div className="flex size-9 items-center justify-center rounded-xl bg-[#27863d] text-white"><Sparkles className="size-4" /></div><div className="min-w-0 flex-1"><div className="text-sm font-semibold">Ask Kit</div><div className="text-[11px] text-[#7a8177]">Your team context is loaded</div></div><Button variant="ghost" size="icon" onClick={onClose}><X className="size-4" /></Button></div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4"><div className="rounded-2xl bg-[#edf6ed] p-4"><p className="text-sm leading-6 text-[#3f4d40]">I can help your staff see the trade-offs already present in your notes, moments, and roster plan. I won’t make the decision for you.</p></div>
          <div className="mt-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#91978e]">Try asking</div><div className="mt-2 space-y-2">{["Who has the strongest shared signal?","What breaks if we take both keepers?","Where does staff judgment split?"].map((question)=><button key={question} type="button" onClick={() => ask(question)} className="kit-pressable flex w-full items-center justify-between rounded-xl border border-black/[0.08] p-3 text-left text-xs hover:bg-[#fafbf8]"><span>{question}</span><ChevronRight className="size-3.5 text-[#92988f]" /></button>)}</div>
          {answer && <div className="kit-answer mt-5 rounded-2xl border border-[#cfe3ce] bg-white p-4 shadow-sm"><div className="flex items-center gap-2 text-xs font-semibold"><Sparkles className="size-3.5 text-[#27863d]" /> Kit’s read</div><p className="mt-3 text-sm leading-6 text-[#4f594e]">{answer}</p><button type="button" onClick={() => { onView("compare"); onClose() }} className="mt-3 text-xs font-semibold text-[#237539]">Open comparison →</button></div>}
        </div>
        <form onSubmit={(event) => { event.preventDefault(); ask(input) }} className="border-t border-black/[0.07] p-4"><label className="flex items-end gap-2 rounded-2xl border border-black/10 bg-[#fafbf8] p-2 pl-4 focus-within:border-[#70ad78] focus-within:ring-2 focus-within:ring-[#27863d]/10"><textarea rows={1} value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about fit, trade-offs, or staff notes…" className="max-h-28 min-h-9 min-w-0 flex-1 resize-none bg-transparent py-2 text-sm outline-none" /><Button size="icon" type="submit"><Send className="size-4" /></Button></label></form>
      </aside>
    </>
  )
}
