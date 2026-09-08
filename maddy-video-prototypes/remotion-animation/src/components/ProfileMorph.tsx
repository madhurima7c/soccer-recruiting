import { Easing, Img, interpolate } from "remotion";
import { CANVAS, MODAL_FINAL, MODAL_SECTIONS } from "../constants";
import { lerpRect } from "../zoomUtils";

type Rect = { x: number; y: number; w: number; h: number; r: number };

/** Map contentT → scan line Y inside modal (sections reveal sequentially) */
export const getScanY = (contentT: number): number => {
  let y = MODAL_SECTIONS[0].y1;

  for (let i = 1; i < MODAL_SECTIONS.length; i++) {
    const s = MODAL_SECTIONS[i];
    const p = interpolate(contentT, [s.start, s.end], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });
    if (p <= 0) break;
    y = s.y0 + (s.y1 - s.y0) * Math.min(p, 1);
    if (p < 1) break;
  }

  return y;
};

type ProfileMorphProps = {
  morphT: number;
  contentT: number;
  startRect: Rect;
  endRect: Rect;
  frame4Src: string;
};

/** Card expands from zoomed mini row; sections render one-by-one with a scan glow */
export const ProfileMorph: React.FC<ProfileMorphProps> = ({
  morphT,
  contentT,
  startRect,
  endRect,
  frame4Src,
}) => {
  if (morphT <= 0) return null;

  const card = lerpRect(startRect, endRect, morphT);
  const fullScaleX = card.w / MODAL_FINAL.w;
  const fullScaleY = card.h / MODAL_FINAL.h;

  const headerModalH = MODAL_SECTIONS[0].y1;
  /** Early morph: stretch Julia header to fill the mini card */
  const headerFill = morphT < 0.22;
  const scaleX = headerFill ? card.w / MODAL_FINAL.w : fullScaleX;
  const scaleY = headerFill ? card.h / headerModalH : fullScaleY;

  const scanY = getScanY(contentT);
  const scanLineY = headerFill
    ? card.h
    : Math.min(card.h, scanY * fullScaleY);

  const shadowStrength = interpolate(morphT, [0, 0.35, 1], [0.08, 0.26, 0.32], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const imgStyle = {
    position: "absolute" as const,
    left: -MODAL_FINAL.x * scaleX,
    top: -MODAL_FINAL.y * scaleY,
    width: CANVAS.width * scaleX,
    height: CANVAS.height * scaleY,
    display: "block" as const,
  };

  const scanActive =
    !headerFill &&
    contentT > MODAL_SECTIONS[1].start &&
    contentT < MODAL_SECTIONS[MODAL_SECTIONS.length - 1].end + 0.04;

  const scanPulse = 0.7 + Math.sin(contentT * Math.PI * 8) * 0.3;

  return (
    <div
      style={{
        position: "absolute",
        left: card.x,
        top: card.y,
        width: card.w,
        height: card.h,
        borderRadius: card.r,
        overflow: "hidden",
        background: "#181a1b",
        boxShadow: `0 42px 120px rgba(0,0,0,${shadowStrength})`,
        zIndex: 30,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: scanLineY,
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        <Img src={frame4Src} style={imgStyle} />
      </div>

      {scanActive && scanLineY > 4 && (
        <>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: scanLineY - 2,
              width: "100%",
              height: 3,
              background:
                "linear-gradient(90deg, transparent 0%, rgba(52,208,189,0.9) 20%, rgba(120,220,255,0.95) 50%, rgba(52,208,189,0.9) 80%, transparent 100%)",
              opacity: scanPulse,
              zIndex: 3,
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              top: scanLineY - 18,
              width: "100%",
              height: 36,
              background:
                "linear-gradient(180deg, transparent, rgba(52,208,189,0.18), rgba(120,220,255,0.12), transparent)",
              opacity: 0.85,
              zIndex: 2,
              pointerEvents: "none",
            }}
          />
        </>
      )}
    </div>
  );
};

export const morphEase = (t: number) =>
  interpolate(t, [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
