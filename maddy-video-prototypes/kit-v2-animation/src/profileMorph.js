import {
  CARD_SHELL,
  MODAL_EXPANDED,
  MODAL_FINAL,
  expandRectTopLeft,
  lerpRect,
} from "./constants.js";
import { interpolate } from "./interpolate.js";
import {
  renderProfileVectorCard,
  scaleProfileToCard,
} from "./profileVectorCard.js";

export function renderProfileMorph(
  expandT,
  settleT,
  profileT,
  startRect,
) {
  const growT = Math.max(expandT, 0.0001);
  const isPopulating = profileT > 0.001 && expandT >= 0.999;

  const expanded = expandRectTopLeft(startRect, MODAL_EXPANDED, growT);
  const card = settleT > 0
    ? lerpRect(MODAL_EXPANDED, MODAL_FINAL, settleT)
    : isPopulating
      ? MODAL_EXPANDED
      : expanded;

  const shadowStrength = interpolate(
    Math.max(growT, settleT),
    [0, 0.35, 1],
    [0.08, 0.22, 0.34],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const scale = scaleProfileToCard(card);
  const contentT = isPopulating ? profileT : 0;

  const shellShadow = interpolate(
    expandT,
    [0, 0.35, 1],
    [0.04, 0.18, shadowStrength],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return `
    <div class="morph-card" style="left:${card.x}px;top:${card.y}px;width:${card.w}px;height:${card.h}px;border-radius:${card.r}px;box-shadow:0 42px 120px rgba(0,0,0,${shellShadow});background:${CARD_SHELL}">
      <div class="pf-scaler">
        <div class="pf-scaler-inner" style="transform:scale(${scale});transform-origin:top left">
          ${renderProfileVectorCard(contentT)}
        </div>
      </div>
    </div>`;
}
