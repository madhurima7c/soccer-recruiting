import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "@/index.css"
import DesktopPrototype from "@/pages/DesktopPrototype"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <DesktopPrototype />
  </StrictMode>,
)
