import { Img, staticFile } from "remotion";
import { TOOLBAR_CANVAS, TOOLBAR_CHIPS, type ToolbarChipId } from "../constants";
import { ToolbarChip } from "./SelectionScene";

const asset = (p: string) => staticFile(`assets/parts/${p}`);

type ToolbarCanvas = { x: number; y: number; w: number; h: number };

type ToolbarProps = {
  canvas?: ToolbarCanvas;
  slideY?: number;
  opacity?: number;
  chips?: ToolbarChipId[];
  useSelectionActive?: boolean;
  useSelectionPress?: number;
  useSelectionPressY?: number;
};

/** Figma KitSurface — CSS-built toolbar with optional selection chips */
export const Toolbar: React.FC<ToolbarProps> = ({
  canvas = TOOLBAR_CANVAS,
  slideY = 0,
  opacity = 1,
  chips = [],
  useSelectionActive = false,
  useSelectionPress = 1,
  useSelectionPressY = 0,
}) => {
  const chipItems = TOOLBAR_CHIPS.filter((c) => chips.includes(c.id));

  return (
    <div
      style={{
        position: "absolute",
        left: canvas.x,
        top: canvas.y + slideY,
        width: canvas.w,
        height: canvas.h,
        opacity,
        borderRadius: 22,
        background: "#181a1b",
        border: "1.514px solid rgba(255,255,255,0.12)",
        boxShadow: "0px 42px 121px rgba(0,0,0,0.32)",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        gap: 18,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 15, flexShrink: 0 }}>
        <div
          style={{
            width: 48.44,
            height: 48.44,
            borderRadius: 999,
            background: "#0a0a0a",
            boxShadow: "0px 12px 33px rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Img
            src={asset("kit-ball.png")}
            style={{ width: 42.39, height: 42.39, objectFit: "contain" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Img src={asset("toolbar-icon-draw.svg")} style={{ width: 21.19, height: 21.19 }} />
          <span
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 21.19,
              fontWeight: 500,
              color: "rgba(255,255,255,0.85)",
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}
          >
            Draw + Select
          </span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", justifyContent: "center", minWidth: 0 }}>
        {chipItems.length > 0 ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {chipItems.map((chip) => (
              <ToolbarChip key={chip.id} chip={chip} />
            ))}
          </div>
        ) : (
          <div
            style={{
              border: "1.514px dashed rgba(255,255,255,0.15)",
              borderRadius: 21,
              padding: "7.5px 16.5px",
            }}
          >
            <span
              style={{
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 15.14,
                fontWeight: 400,
                color: "rgba(255,255,255,0.8)",
                whiteSpace: "nowrap",
                lineHeight: 1,
              }}
            >
              Select any window
            </span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <div style={{ opacity: 0.3, padding: 12 }}>
          <Img src={asset("toolbar-icon-undo.svg")} style={{ width: 24.22, height: 24.22 }} />
        </div>
        <span
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: 16.65,
            fontWeight: 400,
            color: "rgba(255,255,255,0.55)",
            padding: "12px 18px",
            whiteSpace: "nowrap",
          }}
        >
          Cancel
        </span>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            background: "#34d0bd",
            opacity: useSelectionActive ? 1 : 0.5,
            borderRadius: 10,
            padding: "12px 24px",
            transform: `scale(${useSelectionPress}) translateY(${useSelectionPressY}px)`,
            transformOrigin: "center center",
          }}
        >
          <Img src={asset("toolbar-icon-check.svg")} style={{ width: 21.19, height: 21.19 }} />
          <span
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: 16.65,
              fontWeight: 500,
              color: "#181a1b",
              whiteSpace: "nowrap",
              lineHeight: 1,
            }}
          >
            Use selection
          </span>
        </div>
      </div>
    </div>
  );
};
