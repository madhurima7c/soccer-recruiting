import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import AssistantPrototype from "@/pages/AssistantPrototype"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AssistantPrototype />
  </StrictMode>,
)
