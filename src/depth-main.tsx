import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import DepthChartPrototype from "@/pages/DepthChartPrototype"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DepthChartPrototype />
  </StrictMode>,
)
