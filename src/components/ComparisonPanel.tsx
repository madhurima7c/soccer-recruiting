import { motion } from "motion/react"
import {
  constraints,
  recruits,
  scenarios,
  type Scenario,
} from "@/data/recruits"
import { cn } from "@/lib/utils"
import { DepthChart } from "./DepthChart"
import { StaffThoughts } from "./StaffThoughts"
import { AlertTriangle, Sparkles } from "lucide-react"

type ComparisonPanelProps = {
  selectedId: string
  onSelect: (id: string) => void
}

export function ComparisonPanel({ selectedId, onSelect }: ComparisonPanelProps) {
  const selected = scenarios.find((s) => s.id === selectedId) ?? scenarios[0]
  const highlightIds = selected.players

  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-auto p-4">
      <header className="rounded-2xl bg-ink px-4 py-3 text-white">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <p className="text-[15px] leading-snug">
            Two keepers I like, one wants 80%.{" "}
            <span className="text-accent">Take both and skip the striker?</span>
          </p>
          <div className="ml-auto flex shrink-0 gap-1.5 text-[10px]">
            <span className="rounded bg-white/10 px-2 py-1">6 slots</span>
            <span className="rounded bg-white/10 px-2 py-1">1–5 scale</span>
          </div>
        </div>
      </header>

      <section>
        <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
          Pick a pair
        </div>
        <div className="grid gap-2 md:grid-cols-3">
          {scenarios.map((scenario, index) => (
            <ScenarioCard
              key={scenario.id}
              scenario={scenario}
              selected={scenario.id === selectedId}
              index={index}
              onSelect={() => onSelect(scenario.id)}
            />
          ))}
        </div>
      </section>

      <section className="grid min-h-0 gap-4 lg:grid-cols-[1.35fr_0.9fr]">
        <div className="space-y-3">
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
            Risk vs desire
          </div>
          <ScatterPlot highlightIds={highlightIds} />
          <DepthChart highlightIds={highlightIds} compact />
        </div>

        <div className="space-y-4">
          <ConstraintsList scenario={selected} />
          <StaffThoughts />
        </div>
      </section>
    </div>
  )
}

function ScenarioCard({
  scenario,
  selected,
  index,
  onSelect,
}: {
  scenario: Scenario
  selected: boolean
  index: number
  onSelect: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      className={cn(
        "pressable rounded-2xl border bg-white p-3 text-left shadow-[0_1px_0_rgba(0,0,0,0.03)] transition-[border-color,background-color,box-shadow] duration-200",
        selected
          ? "border-accent ring-1 ring-accent/30"
          : "border-line hover:border-[#bdbdb8]",
      )}
      initial={{ opacity: 0, transform: "translateY(8px) scale(0.98)" }}
      animate={{ opacity: 1, transform: "translateY(0) scale(1)" }}
      transition={{
        duration: 0.28,
        delay: index * 0.05,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-[11px] uppercase tracking-[0.07em] text-muted">
            Scenario
          </div>
          <div className="mt-1 text-[14px] font-medium leading-tight">
            {scenario.title}
          </div>
        </div>
        <div className="text-[22px] font-medium tabular-nums leading-none">
          {scenario.score.toFixed(2)}
        </div>
      </div>
      <p className="mt-2 text-[12px] text-muted">{scenario.subtitle}</p>
      <div className="mt-3 flex gap-3 text-[11px] text-[#444]">
        <span>Predicted {scenario.predicted}/5</span>
        <span>Lose list {scenario.loseList}/5</span>
      </div>
      {scenario.warning && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-accent">
          <AlertTriangle className="h-3 w-3" />
          {scenario.warning}
        </div>
      )}
    </motion.button>
  )
}

function ScatterPlot({ highlightIds }: { highlightIds: string[] }) {
  return (
    <div className="relative h-48 overflow-hidden rounded-2xl border border-line bg-white p-3">
      <div className="absolute inset-x-10 inset-y-8 border-l border-b border-[#e6e6e2]" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.08em] text-muted">
        Scholarship ask →
      </div>
      <div className="absolute top-1/2 left-2 -translate-y-1/2 -rotate-90 text-[10px] uppercase tracking-[0.08em] text-muted">
        Desire
      </div>
      {recruits.map((r) => {
        const hot = highlightIds.includes(r.id)
        const left = 12 + r.scholarshipAsk * 0.72
        const bottom = 14 + r.desire * 14
        return (
          <div
            key={r.id}
            className={cn(
              "absolute -translate-x-1/2 translate-y-1/2 rounded-full transition-[width,height,background-color,box-shadow] duration-200",
              hot
                ? "z-10 h-3.5 w-3.5 bg-accent shadow-[0_0_0_4px_rgba(232,93,4,0.18)]"
                : "h-2.5 w-2.5 bg-[#c5c5c0]",
            )}
            style={{ left: `${left}%`, bottom: `${bottom}%` }}
            title={`${r.name} (${r.position})`}
          >
            {hot && (
              <span className="absolute left-4 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-medium text-ink">
                {r.name} ({r.position})
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ConstraintsList({ scenario }: { scenario: Scenario }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-3">
      <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
        What binds us
      </div>
      <ul className="space-y-2">
        {constraints.map((item) => {
          const warn = item.id === "st" && scenario.id === "both-keepers"
          return (
            <li
              key={item.id}
              className={cn(
                "flex items-center justify-between rounded-xl px-2.5 py-2 text-[13px]",
                warn ? "bg-accent-soft text-accent" : "bg-panel-soft",
              )}
            >
              <span className="flex items-center gap-1.5">
                {warn && <AlertTriangle className="h-3.5 w-3.5" />}
                {item.label}
              </span>
              <span className="tabular-nums text-[12px] opacity-80">{item.value}</span>
            </li>
          )
        })}
      </ul>
      <div className="mt-3 border-t border-line pt-3">
        <div className="mb-1.5 text-[11px] uppercase tracking-[0.08em] text-muted">
          Current slots
        </div>
        <div className="flex flex-wrap gap-1.5">
          {scenario.players.map((id) => {
            const player = recruits.find((r) => r.id === id)
            if (!player) return null
            return (
              <span
                key={id}
                className="rounded-full bg-ink px-2.5 py-1 text-[11px] text-white"
              >
                {player.name} {player.scholarshipAsk}%
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
