import { CANVAS, DURATION, TIMING } from "./constants.js";
import { frameToTime, renderFrame, timeToFrame } from "./render.js";

const stageViewport = document.getElementById("stage-viewport");
const stage = document.getElementById("stage");
const scrubber = document.getElementById("scrubber");
const frameLabel = document.getElementById("frame-label");
const timeLabel = document.getElementById("time-label");
const phaseLabel = document.getElementById("phase-label");
const btnPlay = document.getElementById("btn-play");
const btnRestart = document.getElementById("btn-restart");
const speedSelect = document.getElementById("speed");

let currentFrame = 0;
let playing = false;
let lastTs = 0;
let speed = 1;

scrubber.min = 0;
scrubber.max = DURATION - 1;
scrubber.value = 0;

function getPhase(frame) {
  if (frame < TIMING.aiTextEnd) return "Frame 1 — AI text generating";
  if (frame < TIMING.zoomStart) return "Hold — AI summary complete";
  if (frame < TIMING.zoomEnd) return "Frame 1→2 — zoom into Julia card";
  if (frame < TIMING.expandStart) return "Hold — zoomed dashboard";
  if (frame < TIMING.expandEnd) return "Profile card expanding from dashboard";
  if (frame < TIMING.settleEnd) return "Frame 3–6 — profile populating + center";
  return "Frame 6 — final hold";
}

function fitStage() {
  const pad = 24;
  const controlsH = 120;
  const availW = window.innerWidth - pad * 2;
  const availH = window.innerHeight - controlsH - pad * 2;
  const scale = Math.min(availW / CANVAS.width, availH / CANVAS.height);
  stageViewport.style.width = `${CANVAS.width * scale}px`;
  stageViewport.style.height = `${CANVAS.height * scale}px`;
  stage.style.transform = `scale(${scale})`;
}

function updateUI() {
  scrubber.value = currentFrame;
  frameLabel.textContent = `Frame ${currentFrame} / ${DURATION - 1}`;
  timeLabel.textContent = `${frameToTime(currentFrame).toFixed(2)}s / ${frameToTime(DURATION).toFixed(2)}s`;
  phaseLabel.textContent = getPhase(currentFrame);
  btnPlay.textContent = playing ? "Pause" : "Play";
}

function paint() {
  renderFrame(stage, currentFrame);
  updateUI();
}

function tick(ts) {
  if (!playing) return;
  if (!lastTs) lastTs = ts;
  const dt = (ts - lastTs) / 1000;
  lastTs = ts;
  currentFrame += dt * CANVAS.fps * speed;
  if (currentFrame >= DURATION) {
    currentFrame = DURATION - 1;
    playing = false;
  }
  paint();
  if (playing) requestAnimationFrame(tick);
}

btnPlay.addEventListener("click", () => {
  playing = !playing;
  lastTs = 0;
  updateUI();
  if (playing) requestAnimationFrame(tick);
});

btnRestart.addEventListener("click", () => {
  playing = false;
  currentFrame = 0;
  lastTs = 0;
  paint();
});

const exportDialog = document.getElementById("export-dialog");
const btnExport = document.getElementById("btn-export");
const btnCopyExportCmd = document.getElementById("btn-copy-export-cmd");
const btnCloseExport = document.getElementById("btn-close-export");

btnExport.addEventListener("click", () => exportDialog.showModal());
btnCloseExport.addEventListener("click", () => exportDialog.close());
btnCopyExportCmd.addEventListener("click", async () => {
  await navigator.clipboard.writeText("npm run render");
  btnCopyExportCmd.textContent = "Copied!";
  setTimeout(() => {
    btnCopyExportCmd.textContent = "Copy command";
  }, 1500);
});

scrubber.addEventListener("input", () => {
  playing = false;
  currentFrame = Number(scrubber.value);
  paint();
});

speedSelect.addEventListener("change", () => {
  speed = Number(speedSelect.value);
});

window.addEventListener("resize", fitStage);

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    e.preventDefault();
    btnPlay.click();
  }
  if (e.code === "ArrowLeft") {
    playing = false;
    currentFrame = Math.max(0, currentFrame - 1);
    paint();
  }
  if (e.code === "ArrowRight") {
    playing = false;
    currentFrame = Math.min(DURATION - 1, currentFrame + 1);
    paint();
  }
});

fitStage();
paint();
