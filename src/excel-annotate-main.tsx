import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@/index.css"
import ExcelAnnotateCapture from "@/pages/ExcelAnnotateCapture"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ExcelAnnotateCapture />
  </StrictMode>,
)
