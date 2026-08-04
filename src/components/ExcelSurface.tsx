import { excelRows } from "@/data/recruits"

export function ExcelSurface() {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f3f3f3]">
      <div className="flex items-center gap-2 border-b border-[#d0d0d0] bg-[#e8e8e8] px-3 py-2 text-[12px] text-[#444]">
        <span className="rounded bg-[#217346] px-2 py-0.5 font-medium text-white">
          Excel
        </span>
        <span className="font-medium text-ink">Columbia WSOC · Top 28.xlsx</span>
        <span className="ml-auto text-[#777]">ECNL / GA · Spring cycle</span>
      </div>

      <div className="flex items-center gap-1 border-b border-[#d0d0d0] bg-white px-2 py-1.5 text-[11px] text-[#555]">
        {["Home", "Insert", "Data", "Review"].map((tab) => (
          <span
            key={tab}
            className="rounded px-2 py-1 hover:bg-[#f0f0f0]"
          >
            {tab}
          </span>
        ))}
        <span className="ml-3 rounded bg-[#eef6f0] px-2 py-1 text-[#217346]">
          Sheet1 · Recruiting board
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-3">
        <div className="overflow-hidden rounded-md border border-[#cfcfcf] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <table className="w-full border-collapse text-left text-[12px]">
            <thead>
              <tr className="bg-[#f7f7f7] text-[11px] uppercase tracking-[0.06em] text-[#666]">
                <th className="w-10 border-b border-r border-[#e4e4e4] px-2 py-2 text-center">
                  #
                </th>
                <th className="border-b border-r border-[#e4e4e4] px-3 py-2">Name</th>
                <th className="border-b border-r border-[#e4e4e4] px-3 py-2">Pos</th>
                <th className="border-b border-r border-[#e4e4e4] px-3 py-2">Club</th>
                <th className="border-b border-r border-[#e4e4e4] px-3 py-2">Ask</th>
                <th className="border-b border-r border-[#e4e4e4] px-3 py-2">Status</th>
                <th className="border-b border-r border-[#e4e4e4] px-3 py-2">Tech /5</th>
                <th className="border-b border-[#e4e4e4] px-3 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {excelRows.map((row, i) => (
                <tr
                  key={row.name}
                  className="transition-colors duration-150 hover:bg-[#f4faf6]"
                >
                  <td className="border-b border-r border-[#eee] bg-[#fafafa] px-2 py-2 text-center text-[#888]">
                    {i + 1}
                  </td>
                  <td className="border-b border-r border-[#eee] px-3 py-2 font-medium">
                    {row.name}
                  </td>
                  <td className="border-b border-r border-[#eee] px-3 py-2">{row.pos}</td>
                  <td className="border-b border-r border-[#eee] px-3 py-2 text-[#555]">
                    {row.club}
                  </td>
                  <td className="border-b border-r border-[#eee] px-3 py-2">{row.ask}</td>
                  <td className="border-b border-r border-[#eee] px-3 py-2">
                    <StatusChip status={row.status} />
                  </td>
                  <td className="border-b border-r border-[#eee] px-3 py-2">{row.tech}</td>
                  <td className="border-b border-[#eee] px-3 py-2 text-[#666]">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 max-w-xl text-[12px] leading-relaxed text-muted">
          The assistant lives outside Excel — click the soccer ball to open a side panel
          for depth charts and scenario comparison without leaving the sheet.
        </p>
      </div>
    </div>
  )
}

function StatusChip({ status }: { status: string }) {
  const tone =
    status === "Offer out"
      ? "bg-[#fff1e6] text-[#b54708]"
      : status === "Campus visit"
        ? "bg-[#e8f5ee] text-[#2f6b4f]"
        : status === "Elsewhere"
          ? "bg-[#f1f1f1] text-[#777]"
          : "bg-[#eef2f7] text-[#3d4f66]"

  return (
    <span className={`inline-flex rounded px-1.5 py-0.5 text-[11px] ${tone}`}>
      {status}
    </span>
  )
}
