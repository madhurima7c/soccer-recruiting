import { useEffect, useState } from 'react'
import { TooltipProvider, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/theme-provider'
import { DepthChartScreen } from '@/screens/DepthChart'
import { CompareScreen } from '@/screens/Compare'
import { CompanionScreen } from '@/screens/Companion'
import { RivalLensScreen } from '@/screens/RivalLens'
import { STAFF, PROGRAM, NOW_LABEL } from '@/data/seed'
import { StaffAvatar } from '@/components/viz'
import {
  Moon, Sun, LayoutDashboard, PanelRight, GitCompareArrows, Users, CalendarDays, Settings, Home, ChevronDown, Swords,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Surface = 'depth' | 'compare' | 'rival' | 'companion'

const NAV: { id: Surface | null; label: string; icon: React.ReactNode }[] = [
  { id: null, label: 'Dashboard', icon: <Home className="h-4 w-4" /> },
  { id: null, label: 'Roster', icon: <Users className="h-4 w-4" /> },
  { id: 'depth', label: 'Recruiting Board', icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: 'compare', label: 'Compare & saved', icon: <GitCompareArrows className="h-4 w-4" /> },
  { id: 'rival', label: 'Rival lens', icon: <Swords className="h-4 w-4" /> },
  { id: 'companion', label: 'Sheet companion', icon: <PanelRight className="h-4 w-4" /> },
  { id: null, label: 'Schedule', icon: <CalendarDays className="h-4 w-4" /> },
  { id: null, label: 'Settings', icon: <Settings className="h-4 w-4" /> },
]

const TITLES: Record<Surface, string> = {
  depth: 'Recruiting Board',
  compare: 'Compare & saved views',
  rival: 'Rival lens',
  companion: 'Sheet companion',
}

const surfaceFromHash = (): Surface => {
  const h = window.location.hash.replace('#', '')
  return h === 'compare' || h === 'companion' || h === 'rival' ? h : 'depth'
}

export default function App() {
  // hash-routed so each surface is directly addressable
  // (e.g. http://localhost:5200/#companion — used for html.to.design imports)
  const [surface, setSurfaceState] = useState<Surface>(surfaceFromHash)
  const [compareSeed, setCompareSeed] = useState<string[]>([])
  const { theme, setTheme } = useTheme()

  const setSurface = (s: Surface) => {
    window.location.hash = s
    setSurfaceState(s)
  }
  useEffect(() => {
    const onHash = () => setSurfaceState(surfaceFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background text-foreground">
        {/* ── Sidebar ── */}
        <aside className="hidden w-52 shrink-0 flex-col border-r bg-muted/20 p-3 md:flex">
          <div className="mb-4 flex items-center gap-2 px-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-xs font-bold text-background">iQ</div>
            <span className="text-sm font-semibold">RecruitIQ</span>
          </div>
          <nav className="space-y-0.5">
            {NAV.map(item =>
              item.id ? (
                <button
                  key={item.label}
                  onClick={() => setSurface(item.id!)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] font-medium transition-colors',
                    surface === item.id ? 'bg-background shadow-xs' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {item.icon} {item.label}
                </button>
              ) : (
                <Tooltip key={item.label}>
                  <TooltipTrigger
                    render={<span className="flex w-full cursor-default items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-muted-foreground/50" />}
                  >
                    {item.icon} {item.label}
                  </TooltipTrigger>
                  <TooltipContent side="right">Not in this prototype</TooltipContent>
                </Tooltip>
              ),
            )}
          </nav>
          <div className="mt-auto space-y-2 px-1">
            <div className="flex -space-x-1.5">
              {STAFF.map(s => <StaffAvatar key={s.id} staffId={s.id} size="md" />)}
            </div>
            <p className="text-[10px] text-muted-foreground">Cascadia State · Women's Soccer</p>
          </div>
        </aside>

        {/* ── Main ── */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex shrink-0 items-center gap-3 border-b px-4 py-2.5">
            <div className="leading-tight">
              <h1 className="text-base font-semibold">Women's Soccer · {TITLES[surface]}</h1>
              <p className="text-[11px] text-muted-foreground">{PROGRAM.season}</p>
            </div>
            <button className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium text-muted-foreground">
              2026 season <ChevronDown className="h-3 w-3" />
            </button>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="font-mono text-[10px]">Demo · {NOW_LABEL}</Badge>
              <Button
                variant="ghost" size="icon" className="h-7 w-7"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </header>

          <main className="min-h-0 flex-1 p-4">
            {surface === 'depth' && (
              <DepthChartScreen onOpenCompare={ids => { setCompareSeed(ids); setSurface('compare') }} />
            )}
            {surface === 'compare' && <CompareScreen initialIds={compareSeed} />}
            {surface === 'rival' && <RivalLensScreen />}
            {surface === 'companion' && <CompanionScreen />}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
