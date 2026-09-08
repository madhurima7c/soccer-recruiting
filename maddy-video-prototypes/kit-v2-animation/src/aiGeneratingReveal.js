import {
  AI_LINES,
  AI_SNIPPET_THUMB,
  AI_SNIPPET_VIDEO,
  AI_SNIPPETS,
  AI_TEXT_BOX,
  AI_TEXT_BOX_ZOOMED,
  TIMING,
  asset,
} from "./constants.js";
import { interpolate } from "./interpolate.js";

function renderWord(word) {
  const cls = word.hl ? "ai-word ai-word-hl" : "ai-word";
  return `<span class="${cls}">${word.text}</span>`;
}

/** Figma 3360:3401–3408 — layered thumb + video crop per clip */
function renderSnippet(index, opacity, scale) {
  const s = AI_SNIPPETS[index];
  const v = s.video;
  const videoTransform = [
    v.flipY ? "scaleY(-1)" : "",
    `rotate(${v.rotate}deg)`,
  ]
    .filter(Boolean)
    .join(" ");

  return `
    <span class="ai-snippet-wrap" style="
      opacity:${opacity};
      transform:scale(${scale});
      margin-left:${s.marginLeft}px;
    ">
      <span class="ai-snippet" style="
        width:${s.w}px;
        height:${s.h}px;
        transform:rotate(${s.rotate}deg);
      ">
        <img class="ai-snippet-thumb" src="${asset(AI_SNIPPET_THUMB)}" alt="" draggable="false">
        <span class="ai-snippet-video-slot" style="
          left:${v.left}px;
          top:${v.top}px;
          width:${v.w}px;
          height:${v.h}px;
        ">
          <span class="ai-snippet-video-inner" style="
            transform:${videoTransform};
            width:${v.imgW}px;
            height:${v.imgH}px;
          ">
            <img class="ai-snippet-video" src="${asset(s.videoSrc ?? AI_SNIPPET_VIDEO)}" alt="" draggable="false">
          </span>
        </span>
      </span>
    </span>`;
}

/** Figma 3360:3398 — single flowing paragraph, ✦ inline with copy */
export function renderAiGeneratingReveal(frame) {
  if (frame < TIMING.aiTextStart || frame >= TIMING.backgroundFadeEnd) return "";

  const typing = frame < TIMING.aiTextEnd;
  const age = frame - TIMING.aiTextStart;
  const typingDuration = TIMING.aiTextEnd - TIMING.aiTextStart;

  const progress = typing
    ? interpolate(age, [TIMING.aiStarLead, typingDuration], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;

  const flatWords = AI_LINES.flat();
  const totalWords = flatWords.length;
  const fullWords = typing ? Math.floor(progress * totalWords) : totalWords;

  const starSpin = age * TIMING.aiStarSpinSpeed;
  const starPulse = 0.68 + Math.sin(age * 0.48) * 0.32;
  const starGlow = typing ? 10 + starPulse * 10 : 6;
  const starHtml = `<span class="ai-star-inline ai-star-loading" style="
    display:inline-block;
    transform:rotate(${typing ? starSpin : 0}deg);
    opacity:${interpolate(age, [0, 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })};
    text-shadow:0 0 ${starGlow}px rgba(52,208,189,${0.45 + starPulse * 0.4});
  ">✦</span>`;

  const watchIndex = flatWords.findIndex((w) => w.text === "watch");
  const snippetWordThresholds = [
    watchIndex - 4,
    watchIndex - 1,
    watchIndex,
  ].map((i) => i + 1);

  const cursorOn =
    typing && progress < 0.995 && Math.sin(frame * 0.35) > -0.15;

  const parts = [starHtml];
  for (let i = 0; i < fullWords; i++) {
    parts.push(" ");
    parts.push(renderWord(flatWords[i]));

    if (i === watchIndex) {
      const snippets = snippetWordThresholds
        .map((threshold, si) => {
          if (fullWords < threshold) return "";
          const pop = typing
            ? interpolate(
                fullWords - threshold,
                [0, 1],
                [0.55, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              )
            : 1;
          const scale = typing
            ? interpolate(
                fullWords - threshold,
                [0, 1],
                [0.82, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              )
            : 1;
          return renderSnippet(si, pop, scale);
        })
        .join("");
      if (snippets) {
        parts.push(`<span class="ai-snippets">${snippets}</span>`);
      }
    }
  }

  const cursor =
    cursorOn && fullWords > 0
      ? `<span class="ai-cursor" style="opacity:0.85"></span>`
      : "";

  const box = frame >= TIMING.zoomEnd ? AI_TEXT_BOX_ZOOMED : AI_TEXT_BOX;

  return `
    <div class="ai-text-block" style="left:${box.x}px;top:${box.y}px;width:${box.w}px">
      <p class="ai-text-flow">${parts.join("")}${cursor}</p>
    </div>
  `;
}
