import gsap from "gsap";

export function qs(sel) {
  return document.querySelector(sel);
}

export function fitStage(stage, w, h) {
  const controls = 56;
  const vw = window.innerWidth;
  const vh = window.innerHeight - controls;
  const scale = Math.min(vw / w, vh / h, 1);
  const wrap = stage.parentElement;
  wrap.style.width = `${w * scale}px`;
  wrap.style.height = `${h * scale}px`;
  stage.style.transform = `scale(${scale})`;
  stage.style.transformOrigin = "top left";
}

export function setStep(labelEl, text) {
  if (labelEl) labelEl.textContent = text;
}

export function moveCursor(cursor, x, y, duration = 0.8) {
  return gsap.to(cursor, { left: x, top: y, duration, ease: "cubic-bezier(0.22, 1, 0.36, 1)" });
}

export function clickCursor(cursor) {
  return gsap.timeline()
    .call(() => { cursor.classList.add("is-clicking", "is-hand"); })
    .to({}, { duration: 0.45, onComplete: () => cursor.classList.remove("is-clicking", "is-hand") });
}

export function resetScene(els) {
  gsap.set([
    els.desktopFrame, els.popover, els.toolbar, els.selectionWindows,
    els.kitBall, els.kitScene, els.scheduleScene, els.aiIconGlow, els.aiOptionGlow, els.cursor,
    ...els.selWindows,
    ...document.querySelectorAll(".window"),
  ], { opacity: 0, clearProps: "transform,filter,clipPath,scale,x,y" });
  gsap.set(els.desktopFrame, { opacity: 1, scale: 1 });
  gsap.set(els.selectionToolbar, { opacity: 0, y: -70 });
  els.kitBall.classList.remove("is-magic");
}
