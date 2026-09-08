import {
  CANVAS,
  DURATION,
  MINI_CARD_ZOOMED,
  TIMING,
  ZOOM_ORIGIN,
  ZOOM_PAN,
  ZOOM_SCALE,
  asset,
} from "./constants.js";
import { Easing, interpolate, morphEase } from "./interpolate.js";
import { renderAiGeneratingReveal } from "./aiGeneratingReveal.js";
import { renderProfileMorph } from "./profileMorph.js";

function buildZoomTransform(zoomT) {
  if (zoomT <= 0) return "none";
  const scale = interpolate(zoomT, [0, 1], [1, ZOOM_SCALE]);
  const tx = interpolate(zoomT, [0, 1], [0, ZOOM_PAN.x]);
  const ty = interpolate(zoomT, [0, 1], [0, ZOOM_PAN.y]);
  if (scale === 1 && tx === 0 && ty === 0) return "none";
  return `translate(${tx}px, ${ty}px) scale(${scale})`;
}

export function computeFrame(frame) {
  const zoomT = interpolate(
    frame,
    [TIMING.zoomStart, TIMING.zoomEnd],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );

  const expandRaw = interpolate(
    frame,
    [TIMING.expandStart, TIMING.expandEnd],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );
  const expandT = frame >= TIMING.expandStart ? expandRaw : 0;

  const settleRaw = interpolate(
    frame,
    [TIMING.settleStart, TIMING.settleEnd],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const settleT = frame >= TIMING.settleStart ? morphEase(settleRaw) : 0;

  const profileT = interpolate(
    frame,
    [TIMING.populateStart, TIMING.settleEnd],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const showMorph = frame >= TIMING.expandStart;

  /** AI summary + clips stay visible behind the expanding card until dashboard fade ends */
  const showAiText =
    frame >= TIMING.aiTextStart && frame < TIMING.backgroundFadeEnd;

  /** Zoom transform only during active zoom; after that AI sits at zoomed layout coords */
  const aiZoomActive =
    frame >= TIMING.zoomStart && frame < TIMING.zoomEnd;
  const aiZoomTransform = aiZoomActive ? buildZoomTransform(zoomT) : "none";
  const aiZoomOrigin = aiZoomActive ? `${ZOOM_ORIGIN.x}px ${ZOOM_ORIGIN.y}px` : "";

  const dashboardOpacity = interpolate(
    frame,
    [TIMING.backgroundFadeStart, TIMING.backgroundFadeEnd],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    },
  );

  const zoomOrigin = `${ZOOM_ORIGIN.x}px ${ZOOM_ORIGIN.y}px`;
  const zoomTHeld = frame >= TIMING.zoomEnd ? 1 : zoomT;
  const zoomTransform = buildZoomTransform(zoomTHeld);

  /** Keep zoomed dashboard visible behind the expanding card until fade completes */
  const showFrame1Zoom = dashboardOpacity > 0.005;
  const showFrame2 = false;

  return {
    frame,
    zoomOrigin,
    dashboardOpacity,
    showFrame1Zoom,
    showFrame2,
    frame1Src: asset("frame-1-clean.png"),
    /** Zoomed dashboard without baked AI — vector layer owns the summary text */
    frame2Src: asset("frame-2-clean.png"),
    zoomTransform,
    frame1ZoomOpacity: 1,
    frame2Opacity: 1,
    showAiText,
    aiZoomTransform,
    aiZoomOrigin,
    aiHtml: showAiText ? renderAiGeneratingReveal(frame) : "",
    showMorph,
    morphHtml: showMorph
      ? renderProfileMorph(expandT, settleT, profileT, MINI_CARD_ZOOMED)
      : "",
  };
}

export function renderFrame(stage, frame) {
  const s = computeFrame(frame);

  stage.innerHTML = `
    <div class="stage-bg"></div>

    ${
      s.showFrame1Zoom
        ? `<div class="layer layer-dashboard" style="opacity:${s.dashboardOpacity * s.frame1ZoomOpacity};transform:${s.zoomTransform};transform-origin:${s.zoomOrigin}">
            <img src="${s.frame1Src}" width="${CANVAS.width}" height="${CANVAS.height}" draggable="false">
          </div>`
        : ""
    }

    ${
      s.showFrame2
        ? `<div class="layer layer-dashboard" style="opacity:${s.dashboardOpacity}">
            <img src="${s.frame2Src}" width="${CANVAS.width}" height="${CANVAS.height}" draggable="false">
          </div>`
        : ""
    }

    ${
      s.showAiText
        ? `<div class="layer layer-ai" style="opacity:${s.dashboardOpacity};transform:${s.aiZoomTransform};transform-origin:${s.aiZoomOrigin}">${s.aiHtml}</div>`
        : ""
    }

    ${s.morphHtml ? `<div class="layer layer-morph">${s.morphHtml}</div>` : ""}
  `;
}

export function frameToTime(frame) {
  return frame / CANVAS.fps;
}

export function timeToFrame(time) {
  return Math.round(time * CANVAS.fps);
}

export { DURATION };
