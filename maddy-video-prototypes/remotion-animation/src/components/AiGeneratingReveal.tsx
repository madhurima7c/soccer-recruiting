import { interpolate, useCurrentFrame } from "remotion";
import { AI_STAR, AI_TEXT_BOX, CANVAS, TIMING } from "../constants";

type Props = {
  frameSrc: string;
  active: boolean;
};

/**
 * Reveals baked-in Figma text via horizontal clip — no cover patch, no custom font.
 * Teal star pulses; gradient glow sweeps at the reveal edge.
 */
export const AiGeneratingReveal: React.FC<Props> = ({ frameSrc, active }) => {
  const frame = useCurrentFrame();
  if (!active) return null;

  const progress = interpolate(
    frame,
    [TIMING.aiTextStart, TIMING.aiTextEnd],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const revealW = Math.max(2, AI_TEXT_BOX.w * progress);

  if (frame < TIMING.aiTextStart) return null;
  const starPulse =
    0.65 + Math.sin((frame - TIMING.aiTextStart) * 0.45) * 0.35;
  const starScale = 1 + Math.sin((frame - TIMING.aiTextStart) * 0.55) * 0.12;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: AI_TEXT_BOX.x,
          top: AI_TEXT_BOX.y - 4,
          width: revealW,
          height: AI_TEXT_BOX.h + 16,
          overflow: "hidden",
          zIndex: 12,
        }}
      >
        <img
          src={frameSrc}
          alt=""
          style={{
            position: "absolute",
            left: -AI_TEXT_BOX.x,
            top: -(AI_TEXT_BOX.y - 4),
            width: CANVAS.width,
            height: CANVAS.height,
            display: "block",
          }}
        />
      </div>

      {progress > 0.02 && progress < 0.98 && (
        <div
          style={{
            position: "absolute",
            left: AI_TEXT_BOX.x + revealW - 24,
            top: AI_TEXT_BOX.y - 2,
            width: 48,
            height: AI_TEXT_BOX.h + 8,
            background:
              "linear-gradient(90deg, transparent, rgba(41,209,194,0.5), rgba(220,230,70,0.4), transparent)",
            filter: "blur(8px)",
            opacity: 0.8,
            zIndex: 13,
            pointerEvents: "none",
          }}
        />
      )}

      {frame <= TIMING.aiTextEnd + 4 && (
        <div
          style={{
            position: "absolute",
            left: AI_STAR.x,
            top: AI_STAR.y,
            width: AI_STAR.size,
            height: AI_STAR.size,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${starScale})`,
            zIndex: 14,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: -10,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(52,208,189,${0.5 * starPulse}) 0%, transparent 70%)`,
            }}
          />
          <span
            style={{
              fontSize: 34,
              fontWeight: 600,
              color: "#34d0bd",
              opacity: starPulse,
              textShadow: `0 0 ${14 * starPulse}px rgba(52,208,189,0.85)`,
              fontFamily: "Inter, system-ui, sans-serif",
            }}
          >
            ✦
          </span>
        </div>
      )}
    </>
  );
};
