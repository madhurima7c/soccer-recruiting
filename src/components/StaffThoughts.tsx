import { staff, staffThoughts } from "@/data/recruits"
import { cn } from "@/lib/utils"

const byId = Object.fromEntries(staff.map((s) => [s.id, s]))

export function StaffThoughts({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-[12px] font-medium uppercase tracking-[0.08em] text-muted">
          Staff chain of thought
        </h3>
        <div className="flex -space-x-1.5">
          {staff.map((member) => (
            <span
              key={member.id}
              title={`${member.name} · ${member.role}`}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-white bg-[#222] text-[9px] font-medium text-white"
            >
              {member.initials}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {staffThoughts.map((thought, i) => {
          const author = byId[thought.authorId]
          return (
            <article
              key={thought.id}
              className="rounded-xl border border-line bg-panel-soft px-3 py-2.5"
              style={{
                animation: `thought-in 280ms var(--ease-out) both`,
                animationDelay: `${i * 50}ms`,
              }}
            >
              <div className="mb-1 flex items-center gap-2 text-[11px]">
                <span className="font-medium text-ink">{author?.name}</span>
                <span className="text-muted">on {thought.about}</span>
                {thought.rating != null && (
                  <span className="ml-auto rounded bg-white px-1.5 py-0.5 text-ink">
                    {thought.rating}/5
                  </span>
                )}
              </div>
              <p className="text-[13px] leading-snug text-[#333]">{thought.text}</p>
              <div className="mt-1.5 text-[10px] text-muted">{thought.time}</div>
            </article>
          )
        })}
      </div>

      <style>{`
        @keyframes thought-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
