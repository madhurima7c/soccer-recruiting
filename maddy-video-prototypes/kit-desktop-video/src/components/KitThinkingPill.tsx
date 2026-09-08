import { interpolate, useCurrentFrame } from "remotion";
import { KIT_PANEL, KIT_THINKING_STATES } from "../constants";

type KitThinkingPillProps = {
  spinStartFrame: number;
  spinEndFrame: number;
  opacity?: number;
};

/** Figma 3355:1046 — AI thinking pill, right-aligned under Kit panel */
export const KitThinkingPill: React.FC<KitThinkingPillProps> = ({
  spinStartFrame,
  spinEndFrame,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();

  if (opacity <= 0.01) return null;
  if (frame < spinStartFrame || frame > spinEndFrame) return null;

  const span = spinEndFrame - spinStartFrame;
  const stateDuration = span / KIT_THINKING_STATES.length;
  const stateIndex = Math.min(
    KIT_THINKING_STATES.length - 1,
    Math.floor((frame - spinStartFrame) / stateDuration),
  );
  const stateLocal = (frame - spinStartFrame) % stateDuration;
  const label = KIT_THINKING_STATES[stateIndex];

  const textOpacity =
    stateLocal < 8
      ? interpolate(stateLocal, [0, 8], [0, 1], { extrapolateRight: "clamp" })
      : stateLocal > stateDuration - 8
        ? interpolate(
            stateLocal,
            [stateDuration - 8, stateDuration],
            [1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        : 1;

  return (
    <div
      style={{
        position: "absolute",
        left: KIT_PANEL.x,
        top: KIT_PANEL.y + KIT_PANEL.h + 32,
        width: KIT_PANEL.w,
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 43,
        pointerEvents: "none",
        opacity,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 25.701,
          height: 92,
          padding: "32.126px 51.402px",
          borderRadius: 55,
          background: "rgba(161,192,188,0.23)",
          boxSizing: "border-box",
        }}
      >
        <span
          style={{
            fontSize: 55.786,
            fontWeight: 600,
            lineHeight: 1,
            color: "#34d0bd",
            fontFamily: "Inter, system-ui, sans-serif",
            flexShrink: 0,
            width: 37.793,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✦
        </span>
        <span
          style={{
            fontSize: 35.339,
            fontWeight: 500,
            lineHeight: "53.008px",
            color: "#181a1b",
            fontFamily: "Inter, system-ui, sans-serif",
            whiteSpace: "nowrap",
            opacity: textOpacity,
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );
};
