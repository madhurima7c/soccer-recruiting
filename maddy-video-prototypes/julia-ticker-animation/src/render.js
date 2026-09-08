import { CANVAS, RAIL, TIMING } from "./constants.js";
import { Easing, interpolate } from "./interpolate.js";
import { renderConfetti, renderCursor } from "./confetti.js";
import { getMakeOfferButtonRect, renderJuliaRail } from "./juliaRail.js";

function getCamera(frame) {
  if (frame < TIMING.scrollStart) {
    return {
      scale: 1,
      railLeft: RAIL.leftStart,
      railTop: RAIL.topStart,
    };
  }

  if (frame >= TIMING.scrollEnd) {
    return {
      scale: 1,
      railLeft: RAIL.leftEnd,
      railTop: RAIL.topStart,
    };
  }

  const t = interpolate(
    frame,
    [TIMING.scrollStart, TIMING.scrollEnd],
    [0, 1],
    { easing: Easing.inOutCubic },
  );

  return {
    scale: 1,
    railLeft: RAIL.leftStart + (RAIL.leftEnd - RAIL.leftStart) * t,
    railTop: RAIL.topStart,
  };
}

export function computeFrame(frame) {
  const { scale, railLeft, railTop } = getCamera(frame);
  const btnRect = getMakeOfferButtonRect(railLeft, railTop, scale);

  const clickT = interpolate(
    frame,
    [TIMING.clickStart, TIMING.clickStart + 6, TIMING.clickEnd],
    [0, 1, 0],
    { easing: Easing.linear },
  );
  const btnPressed = clickT > 0.35;

  const showCursor = frame >= TIMING.cursorMoveStart;
  let cursorX = -40;
  let cursorY = -40;
  let cursorPress = false;

  if (showCursor) {
    const moveT = interpolate(
      frame,
      [TIMING.cursorMoveStart, TIMING.cursorMoveEnd],
      [0, 1],
      { easing: Easing.outCubic },
    );
    cursorX = btnRect.cx + 180 + (btnRect.cx + 8 - (btnRect.cx + 180)) * moveT;
    cursorY = btnRect.cy + 120 + (btnRect.cy + 10 - (btnRect.cy + 120)) * moveT;
    cursorPress =
      frame >= TIMING.clickStart && frame <= TIMING.clickEnd && clickT > 0.35;
  }

  const confettiHtml =
    frame >= TIMING.confettiStart ? renderConfetti(frame) : "";

  return {
    frame,
    scale,
    railLeft,
    railTop,
    btnPressed,
    showCursor,
    cursorX,
    cursorY,
    cursorPress,
    confettiHtml,
  };
}

export function renderFrame(stage, frame) {
  const s = computeFrame(frame);

  stage.innerHTML = `
    <div class="stage-bg"></div>
    <div class="rail-viewport">
      <div class="rail-track" style="transform:translate(${s.railLeft}px, ${s.railTop}px) scale(${s.scale})">
        ${renderJuliaRail({ btnPressed: s.btnPressed })}
      </div>
    </div>
    ${s.confettiHtml}
    ${s.showCursor ? renderCursor(s.cursorX, s.cursorY, s.cursorPress) : ""}
  `;
}

export function frameToTime(frame) {
  return frame / CANVAS.fps;
}

export { CANVAS, DURATION, TIMING } from "./constants.js";
