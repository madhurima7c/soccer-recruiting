import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@/index.css"
import DesktopFlowTwo from "@/pages/DesktopFlowTwo"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DesktopFlowTwo />
  </StrictMode>,
)
