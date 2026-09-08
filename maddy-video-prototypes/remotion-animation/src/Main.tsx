import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { AiGeneratingReveal } from "./components/AiGeneratingReveal";
import { ProfileMorph, morphEase } from "./components/ProfileMorph";
import {
  CANVAS,
  GRAY,
  MINI_CARD_ZOOMED,
  TIMING,
  ZOOM,
} from "./constants";
import { getMorphEndRect } from "./zoomUtils";

const asset = (p: string) => staticFile(`assets/kit-v2/${p}`);

export const Main: React.FC = () => {
  const frame = useCurrentFrame();

  const zoomProg = interpolate(
    frame,
    [TIMING.zoomStart, TIMING.zoomEnd],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );

  const zoomScale = interpolate(zoomProg, [0, 1], [1, ZOOM.scale]);

  const morphRaw = interpolate(
    frame,
    [TIMING.morphStart, TIMING.morphEnd],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const morphT = morphEase(morphRaw);

  const contentT = interpolate(
    frame,
    [TIMING.morphStart + 4, TIMING.morphEnd - 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const frame2Opacity = interpolate(
    frame,
    [TIMING.zoomEnd - 18, TIMING.zoomEnd],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const frame1ZoomOpacity = 1 - frame2Opacity;

  const dashboardBeforeMorph =
    frame < TIMING.morphStart
      ? 1
      : interpolate(frame, [TIMING.morphStart, TIMING.morphStart + 8], [1, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

  const aiActive =
    frame >= TIMING.aiTextStart && frame < TIMING.zoomStart;

  const useCleanBase = frame < TIMING.aiTextEnd + 3;

  const finalFrameOpacity = interpolate(
    frame,
    [TIMING.morphEnd - 12, TIMING.morphEnd],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const showMorph = frame >= TIMING.morphStart && finalFrameOpacity < 0.98;

  const zoomTransform = `scale(${zoomScale})`;
  const zoomOrigin = `${ZOOM.originX}px ${ZOOM.originY}px`;

  const morphStartRect = MINI_CARD_ZOOMED;
  const morphEndRect = getMorphEndRect();

  return (
    <AbsoluteFill style={{ backgroundColor: GRAY, overflow: "hidden" }}>
      {/* Phase 1: frame-1 zooms into mini card (top-left anchored) */}
      {dashboardBeforeMorph > 0.005 && frame1ZoomOpacity > 0.005 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: dashboardBeforeMorph * frame1ZoomOpacity,
            transform: zoomTransform,
            transformOrigin: zoomOrigin,
          }}
        >
          <Img
            src={useCleanBase ? asset("frame-1-clean.png") : asset("frame-1.png")}
            style={{ width: CANVAS.width, height: CANVAS.height, display: "block" }}
          />
        </div>
      )}

      {/* Phase 2: crossfade to frame-2 — card stays in place, no extra transform */}
      {dashboardBeforeMorph > 0.005 && frame2Opacity > 0.005 && (
        <Img
          src={asset("frame-2.png")}
          style={{
            position: "absolute",
            inset: 0,
            width: CANVAS.width,
            height: CANVAS.height,
            opacity: dashboardBeforeMorph * frame2Opacity,
            display: "block",
          }}
        />
      )}

      {aiActive && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: zoomTransform,
            transformOrigin: zoomOrigin,
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <AiGeneratingReveal
            frameSrc={asset("frame-1.png")}
            active={aiActive}
          />
        </div>
      )}

      {/* Mini card expands into full profile — starts exactly at frame-2 card */}
      {showMorph && (
        <ProfileMorph
          morphT={morphT}
          contentT={contentT}
          startRect={morphStartRect}
          endRect={morphEndRect}
          frame4Src={asset("frame-4.png")}
        />
      )}

      {finalFrameOpacity > 0.005 && (
        <Img
          src={asset("frame-4.png")}
          style={{
            position: "absolute",
            inset: 0,
            width: CANVAS.width,
            height: CANVAS.height,
            opacity: finalFrameOpacity,
            zIndex: 40,
            display: "block",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
