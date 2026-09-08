import { BTN, RAIL, asset } from "./constants.js";

/** Figma railrow-Julia Smith — single horizontal profile strip */
export function renderJuliaRail({ btnPressed = false } = {}) {
  return `
    <div class="rail" style="
      width:${RAIL.width}px;
      height:${RAIL.height}px;
      border-width:${RAIL.border}px;
      border-radius:${RAIL.radius}px;
      padding:${RAIL.padY}px ${RAIL.padX}px;
    ">
      <div class="rail-row">
        <div class="rail-identity" style="width:${RAIL.identityWidth}px">
          <img class="rail-avatar" src="${asset("avatar-julia.png")}" width="${230.84}" height="${230.84}" alt="">
          <div class="rail-name-block">
            <p class="rail-name">
              Julia Smith · <span class="rail-pos">GK</span>
            </p>
            <p class="rail-sub">#11 · Central HS · 5′7″</p>
          </div>
        </div>

        <div class="rail-meta">
          <div class="rail-meta-col">
            <p class="rail-label">ELIGIBILITY</p>
            <p class="rail-value">NCAA EC registered</p>
          </div>
          <div class="rail-meta-col">
            <p class="rail-label">CORE COURSES</p>
            <p class="rail-value">10/7 complete</p>
          </div>
        </div>

        <button class="rail-btn${btnPressed ? " rail-btn-pressed" : ""}" type="button" style="
          width:${BTN.width}px;
          height:${BTN.height}px;
          border-radius:${BTN.radius}px;
        ">
          Make Offer
        </button>
      </div>
    </div>`;
}

/** Screen-space button rect after rail translate + scale */
export function getMakeOfferButtonRect(railLeft, railTop, scale) {
  const btnLocalX = RAIL.width - RAIL.padX - BTN.width;
  const btnLocalY = RAIL.padY + (230.84 - BTN.height) / 2;
  const x = railLeft + btnLocalX * scale;
  const y = railTop + btnLocalY * scale;
  const w = BTN.width * scale;
  const h = BTN.height * scale;
  return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
}
