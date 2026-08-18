import { Img, staticFile, useCurrentFrame } from "remotion";
import { CANVAS, SELECTION_TOOLBAR } from "../constants";

const asset = (p: string) => staticFile(`assets/parts/${p}`);

type Rect = { x: number; y: number; w: number; h: number };

export const clusterBounds = (windows: Rect[]) => {
  const minX = Math.min(...windows.map((w) => w.x));
  const minY = Math.min(...windows.map((w) => w.y));
  const maxX = Math.max(...windows.map((w) => w.x + w.w));
  const maxY = Math.max(...windows.map((w) => w.y + w.h));
  return { minX, minY, maxX, maxY, w: maxX - minX, h: maxY - minY };
};

/** Pan needed to center a window cluster on the canvas (below toolbar). */
export const clusterCenterPan = (windows: Rect[]) => {
  if (windows.length === 0) return { x: 0, y: 0 };
  const b = clusterBounds(windows);
  const cx = (b.minX + b.maxX) / 2;
  const cy = (b.minY + b.maxY) / 2;
  const contentTop = SELECTION_TOOLBAR.y + SELECTION_TOOLBAR.h;
  const contentCenterY = contentTop + (CANVAS.height - contentTop) / 2;
  return {
    x: CANVAS.width / 2 - cx,
    y: contentCenterY - cy,
  };
};

type Chip = { id: string; label: string; icon: string };

export const ToolbarChip: React.FC<{ chip: Chip }> = ({ chip }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 9,
      background: "rgba(255,255,255,0.08)",
      borderRadius: 21,
      padding: "9px 15px 9px 12px",
      flexShrink: 0,
    }}
  >
    <Img src={asset(chip.icon)} style={{ width: 33, height: 33, objectFit: "contain" }} />
    <span
      style={{
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: 18,
        fontWeight: 500,
        color: "rgba(255,255,255,0.85)",
        whiteSpace: "nowrap",
        lineHeight: 1,
      }}
    >
      {chip.label}
    </span>
  </div>
);

/** Black ball that orbits selected windows during AI processing */
export const ProcessingBall: React.FC<{
  x: number;
  y: number;
  size?: number;
  spinning?: boolean;
}> = ({ x, y, size = 102, spinning = false }) => {
  const frame = useCurrentFrame();
  const pulse = 0.96 + Math.sin(frame * 0.2) * 0.04;
  const spinDeg = spinning ? frame * 5.5 : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        zIndex: 200,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 999,
          background: "#0a0a0a",
          boxShadow: "0 16px 48px rgba(0,0,0,0.45), 0 6px 18px rgba(0,0,0,0.28)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${pulse})`,
          overflow: "hidden",
        }}
      >
        <Img
          src={asset("kit-ball.png")}
          style={{
            width: size * 0.83,
            height: size * 0.83,
            objectFit: "contain",
            transform: `rotate(${spinDeg}deg)`,
          }}
        />
      </div>
    </div>
  );
};

export type { Rect };
