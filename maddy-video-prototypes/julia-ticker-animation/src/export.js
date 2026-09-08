import { CANVAS, DURATION } from "./constants.js";
import { renderFrame } from "./render.js";

const stage = document.getElementById("stage");

window.__juliaTickerExport = {
  canvas: CANVAS,
  duration: DURATION,
  setFrame(frame) {
    renderFrame(stage, Math.max(0, Math.min(DURATION - 1, Math.round(frame))));
  },
};
