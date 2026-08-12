/* Kit · Log Moment — Joi-style sheet interaction + Field 7 flow
   GSAP powers all motion. The sheet handles BOTH its own drag and the
   scrolling of the cards inside it, so the two never fight. */

/* =========================================================
   0 · HAPTICS
   Android/desktop: Vibration API.
   iOS 17.4+: toggling a `switch` checkbox fires a system haptic —
   the only web hook available (iOS never shipped navigator.vibrate).
   Requires Settings ▸ Sounds & Haptics ▸ System Haptics = on, and a
   real device. Impact styles/intensity need the native port.
   ========================================================= */
let hapticSwitch = null;
(function initHaptics() {
  const label = document.createElement("label");
  label.setAttribute("aria-hidden", "true");
  label.style.cssText = "position:absolute;left:-9999px;top:0;width:1px;height:1px;opacity:0;pointer-events:none;";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.setAttribute("switch", "");
  label.appendChild(input);
  document.body.appendChild(label);
  hapticSwitch = label;
})();

function haptic(ms = 8) {
  if (navigator.vibrate) navigator.vibrate(ms);
  if (hapticSwitch) { try { hapticSwitch.click(); } catch (e) {} }
}

const phone = document.getElementById("phone");
phone.addEventListener("scroll", () => { phone.scrollTop = 0; phone.scrollLeft = 0; });

/* =========================================================
   1 · THE SHEET — pull down to reveal the day summary
   ========================================================= */
const sheet = document.getElementById("sheet");
const sheetBg = document.getElementById("sheet-bg");
const grabber = document.getElementById("sheet-grabber");
const summary = document.getElementById("summary");
const helloComma = document.getElementById("hello-comma");
const timelineEl = document.querySelector(".timeline");
const inner = document.getElementById("timeline-inner");

const SHEET_UP = 196;        // collapsed: sheet sits under "Hello Coach Emma"
let SHEET_DOWN = 460;        // open: full summary revealed (measured below)

function layoutSheet() {
  summary.style.visibility = "hidden";
  gsap.set(summary, { autoAlpha: 1 });
  const heroBottom = summary.getBoundingClientRect().bottom - phone.getBoundingClientRect().top;
  SHEET_DOWN = Math.min(heroBottom + 26, phone.clientHeight - 200);
  gsap.set(summary, { clearProps: "all" });
  summary.style.visibility = "hidden";
}
layoutSheet();

/* ---- summary reveal: scrubbed while dragging, staggered on release ---- */
const lines = ["#s1", "#s2", "#s3"];
const reveal = gsap.timeline({ paused: true })
  .set(summary, { visibility: "visible" }, 0)
  .fromTo(helloComma, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.28, ease: "none" }, 0.02)
  .fromTo(lines,
    { autoAlpha: 0, y: 26 },
    { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.14 }, 0.05)
  .fromTo("#cluster1 img",
    { autoAlpha: 0, x: -14, scale: 0.7 },
    { autoAlpha: 1, x: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)", stagger: 0.06 }, 0.22)
  .fromTo("#cluster2 img",
    { autoAlpha: 0, x: -14, scale: 0.7 },
    { autoAlpha: 1, x: 0, scale: 1, duration: 0.4, ease: "back.out(1.7)", stagger: 0.06 }, 0.4);

/* ---- the container: invisible at rest, draws in from the sides + top ---- */
const panel = { e: 0 };
function applyPanel() {
  const e = panel.e;
  gsap.set(sheetBg, {
    autoAlpha: e,
    left: 10 * e,
    right: 10 * e,
    top: -22 * (1 - e),
    borderRadius: (26 * e) + "px " + (26 * e) + "px 0 0",
  });
  gsap.set(grabber, { autoAlpha: e });
}
function scrubPanel(p) { panel.e = gsap.utils.clamp(0, 1, p * 2.2); applyPanel(); }
function settlePanel(open) {
  gsap.to(panel, { e: open ? 1 : 0, duration: 0.32, ease: "power2.out", onUpdate: applyPanel });
}
applyPanel();

let sheetOpen = false;
let crossed = false;
let rawSheetY = SHEET_UP;
gsap.set(sheet, { y: SHEET_UP });

function progressFor(y) {
  return gsap.utils.clamp(0, 1, (y - SHEET_UP) / (SHEET_DOWN - SHEET_UP));
}
function applySheet() {
  let y = rawSheetY;
  if (y < SHEET_UP) y = SHEET_UP - (SHEET_UP - y) * 0.35;          // rubber band
  else if (y > SHEET_DOWN) y = SHEET_DOWN + (y - SHEET_DOWN) * 0.35;
  gsap.set(sheet, { y });
  const p = progressFor(y);
  reveal.progress(p);
  scrubPanel(p);
  if (p > 0) summary.style.visibility = "visible";
  const past = p > 0.5;
  if (past !== crossed) { crossed = past; haptic(12); }
}

/* ---- inner card scrolling (manual, so it can hand off to the drag) ---- */
let contentY = 0;
function minContentY() {
  const visibleBottom = phone.clientHeight - gsap.getProperty(sheet, "y");
  const contentBottom = inner.offsetTop + inner.offsetHeight;
  return Math.min(0, visibleBottom - contentBottom - 28);
}
function setContentY(v) {
  contentY = gsap.utils.clamp(minContentY(), 0, v);
  gsap.set(inner, { y: contentY });
}

function settle(open) {
  sheetOpen = open;
  rawSheetY = open ? SHEET_DOWN : SHEET_UP;
  haptic(open ? 10 : 6);
  gsap.to(sheet, {
    y: rawSheetY,
    duration: 0.55,
    ease: open ? "power4.out" : "power3.inOut",
    onComplete() { setContentY(contentY); },   // re-clamp for the new viewport
  });
  settlePanel(open);
  if (open) {
    reveal.play();
  } else {
    gsap.to(reveal, { progress: 0, duration: 0.32, ease: "power2.inOut",
      onComplete: () => { summary.style.visibility = "hidden"; } });
  }
}

/* ---- one gesture: routes between sheet drag and card scroll ---- */
(function attachSheetGesture() {
  const DRAG_THRESHOLD = 8;
  let tracked = false, engaged = false, pointerId = null;
  let startPointerY = 0, lastMoveY = 0, lastT = 0, velocity = 0, mode = "sheet";

  function applyDelta(d) {
    if (d > 0) {                                   // ── dragging DOWN
      if (contentY < 0) {                          // scroll cards back to top first
        const use = Math.min(d, -contentY);
        setContentY(contentY + use);
        d -= use; mode = "content";
      }
      if (d > 0) { rawSheetY += d; applySheet(); mode = "sheet"; }
    } else if (d < 0) {                            // ── dragging UP
      let up = -d;
      const sheetRoom = rawSheetY - SHEET_UP;
      if (sheetRoom > 0) {                         // close the sheet first
        const use = Math.min(up, sheetRoom);
        rawSheetY -= use; applySheet();
        up -= use; mode = "sheet";
      }
      if (up > 0) { setContentY(contentY - up); mode = "content"; }
    }
  }

  sheet.addEventListener("pointerdown", e => {
    if (e.target.closest("input, button")) return;
    tracked = true; engaged = false;
    pointerId = e.pointerId;
    startPointerY = lastMoveY = e.clientY;
    lastT = performance.now(); velocity = 0;
    gsap.killTweensOf([sheet, inner]);
  });

  sheet.addEventListener("pointermove", e => {
    if (!tracked || e.pointerId !== pointerId) return;
    if (!engaged) {
      if (Math.abs(e.clientY - startPointerY) < DRAG_THRESHOLD) return;  // still a tap
      engaged = true;
      try { sheet.setPointerCapture(pointerId); } catch (err) {}
      lastMoveY = e.clientY;
      haptic(4);
    }
    const now = performance.now();
    velocity = (e.clientY - lastMoveY) / Math.max(1, now - lastT);
    lastT = now;
    applyDelta(e.clientY - lastMoveY);
    lastMoveY = e.clientY;
  });

  function release(e) {
    if (!tracked || (e && e.pointerId !== pointerId)) return;
    tracked = false;
    if (!engaged) return;                          // it was a tap — let the click through
    engaged = false;
    if (mode === "content") {
      const target = gsap.utils.clamp(minContentY(), 0, contentY + velocity * 220);
      gsap.to(inner, { y: target, duration: 0.8, ease: "power2.out",
        onUpdate() { contentY = gsap.getProperty(inner, "y"); } });
      settle(progressFor(gsap.getProperty(sheet, "y")) > 0.5);
    } else {
      const p = progressFor(gsap.getProperty(sheet, "y"));
      const open = velocity > 0.35 ? true : velocity < -0.35 ? false : p > 0.5;
      settle(open);
    }
  }
  sheet.addEventListener("pointerup", release);
  sheet.addEventListener("pointercancel", release);
})();

/* =========================================================
   1b · AVATAR CLUSTERS → PLAYER PILLS
   ========================================================= */
const PLAYERDB = {
  julia:  { name: "Julia Smith", pos: "FW", team: "GA Aspire",     img: "assets/julia.jpg" },
  sam:    { name: "Sam Ortiz",   pos: "CM", team: "GA Aspire",     img: "assets/sam.png" },
  jordan: { name: "Jordan Lee",  pos: "CM", team: "GA Aspire",     img: "assets/jordan.jpg" },
  debra:  { name: "Debra",       pos: "FW", team: "Carolina ECNL", img: "assets/debra.jpg" },
  grace:  { name: "Grace",       pos: "MF", team: "Carolina ECNL", img: "assets/grace.jpg" },
  maya:   { name: "Maya",        pos: "FW", team: "West Coast FC", img: "assets/maya.png" },
};

document.querySelectorAll(".av-cluster[data-players]").forEach(cluster => {
  const keys = cluster.dataset.players.split(",");
  const stackedHTML = cluster.innerHTML;
  let expanded = false;

  cluster.addEventListener("click", e => {
    e.stopPropagation();                       // never triggers the card navigation
    haptic(8);
    const namesEl = cluster.parentElement.querySelector(".mc-watch-names");
    if (!expanded) {
      cluster.classList.add("expanded");
      cluster.innerHTML = keys.map(k => {
        const p = PLAYERDB[k];
        return `<span class="player-pill"><img src="${p.img}" alt="">${p.name}<span class="pp-meta">· ${p.pos} · ${p.team}</span></span>`;
      }).join("");
      if (namesEl) namesEl.style.display = "none";
      gsap.fromTo(cluster.querySelectorAll(".player-pill"),
        { autoAlpha: 0, x: -12, scale: 0.85 },
        { autoAlpha: 1, x: 0, scale: 1, duration: 0.38, ease: "back.out(1.7)", stagger: 0.05 });
      retargetOpenSheet();
    } else {
      gsap.to(cluster.querySelectorAll(".player-pill"), {
        autoAlpha: 0, scale: 0.85, duration: 0.18, ease: "power2.in", stagger: 0.03,
        onComplete() {
          cluster.classList.remove("expanded");
          cluster.innerHTML = stackedHTML;
          if (namesEl) namesEl.style.display = "";
          gsap.fromTo(cluster.querySelectorAll("img"),
            { autoAlpha: 0, x: -8 },
            { autoAlpha: 1, x: 0, duration: 0.3, ease: "power2.out", stagger: 0.04 });
          retargetOpenSheet();
        }
      });
    }
    expanded = !expanded;
  });
});

/* when pills change the summary height, the open sheet follows */
function retargetOpenSheet() {
  if (!sheetOpen) return;
  const heroBottom = summary.getBoundingClientRect().bottom - phone.getBoundingClientRect().top;
  SHEET_DOWN = Math.min(heroBottom + 26, phone.clientHeight - 150);
  rawSheetY = SHEET_DOWN;
  gsap.to(sheet, { y: SHEET_DOWN, duration: 0.45, ease: "power3.out",
    onComplete() { setContentY(contentY); } });
}

/* =========================================================
   2 · FIELD 7 — page transition
   ========================================================= */
const screenToday = document.getElementById("screen-today");
const screenField = document.getElementById("screen-field");

document.getElementById("card-field7").addEventListener("click", () => {
  haptic(10);
  screenField.scrollTop = 0;
  gsap.timeline()
    .to(screenToday, { x: -80, autoAlpha: 0.4, duration: 0.5, ease: "power3.inOut" }, 0)
    .fromTo(screenField, { x: "100%" }, { x: 0, duration: 0.55, ease: "power4.out" }, 0.04)
    .add(() => enterField(), 0.18);
});
document.getElementById("back").addEventListener("click", () => {
  haptic(6);
  gsap.timeline()
    .to(screenField, { x: "100%", duration: 0.5, ease: "power3.inOut" }, 0)
    .to(screenToday, { x: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out" }, 0.05);
});

/* =========================================================
   3 · PLAYER CAROUSEL
   ========================================================= */
const PLAYERS = [
  { name: "Julia Smith", pos: "FW", img: "assets/julia.jpg",
    grad: "2027", gpa: "3.92", height: "5’7”", jersey: "#11", hs: "Central HS", position: "FW" },
  { name: "Sam Ortiz", pos: "CM", img: "assets/sam.png",
    grad: "2028", gpa: "3.75", height: "5’5”", jersey: "#10", hs: "Westlake HS", position: "CM" },
  { name: "Jordan Lee", pos: "CM", img: "assets/jordan.jpg",
    grad: "2027", gpa: "3.88", height: "5’6”", jersey: "#7", hs: "Liberty HS", position: "CM" },
];
const carousel = document.getElementById("carousel");
const dots = document.getElementById("dots");
const lpPlayer = document.getElementById("lp-player");
let selectedIdx = 0;

function cardHTML(p, i) {
  const photo = p.img ? `<img src="${p.img}" alt="">` : `<span class="p-sil">${p.jersey}</span>`;
  return `<div class="p-card${i === selectedIdx ? " selected" : ""}" data-i="${i}">
    <div class="p-head">${photo}
      <div><div class="p-name">${p.name}</div><div class="p-pos">${p.pos}</div></div>
    </div>
    <div class="p-grid">
      <div class="p-cell"><span>GRAD</span><b>${p.grad}</b></div>
      <div class="p-cell"><span>GPA</span><b>${p.gpa}</b></div>
      <div class="p-cell"><span>HEIGHT</span><b>${p.height}</b></div>
      <div class="p-cell"><span>JERSEY</span><b>${p.jersey}</b></div>
      <div class="p-cell"><span>HS</span><b>${p.hs}</b></div>
      <div class="p-cell"><span>POSITION</span><b>${p.position}</b></div>
    </div>
  </div>`;
}
function renderCarousel() {
  carousel.innerHTML = PLAYERS.map(cardHTML).join("");
  dots.innerHTML = PLAYERS.map((_, i) => `<i class="${i === selectedIdx ? "on" : ""}"></i>`).join("");
  document.getElementById("watch-count").textContent = PLAYERS.length;
  carousel.querySelectorAll(".p-card").forEach(el => {
    el.addEventListener("click", () => selectPlayer(+el.dataset.i));
  });
}
function selectPlayer(i) {
  selectedIdx = i;
  haptic(6);
  carousel.querySelectorAll(".p-card").forEach((el, j) => el.classList.toggle("selected", j === i));
  dots.querySelectorAll("i").forEach((el, j) => el.classList.toggle("on", j === i));
  lpPlayer.textContent = PLAYERS[i].name;
  gsap.fromTo(lpPlayer, { y: 6, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.3, ease: "power2.out" });
}
renderCarousel();

let fieldEntered = false;
function enterField() {
  if (fieldEntered) return;
  fieldEntered = true;
  gsap.fromTo("#screen-field .p-card",
    { autoAlpha: 0, x: 40 },
    { autoAlpha: 1, x: 0, duration: 0.5, ease: "power3.out", stagger: 0.08, delay: 0.1 });
  gsap.fromTo(".log-panel", { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power3.out", delay: 0.28 });
}

/* live minute ticker */
let minute = 34;
setInterval(() => {
  minute++;
  document.getElementById("min-a").textContent = minute;
  document.getElementById("min-b").textContent = minute;
}, 45000);

/* =========================================================
   4 · LOG MOMENT
   ========================================================= */
const chips = document.getElementById("chips");
chips.addEventListener("click", e => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  chip.classList.toggle("on");
  haptic(5);
  gsap.fromTo(chip, { scale: 0.92 }, { scale: 1, duration: 0.25, ease: "back.out(3)" });
});

const logBtn = document.getElementById("log-btn");
const note = document.getElementById("note");

logBtn.addEventListener("click", () => {
  const tags = [...chips.querySelectorAll(".chip.on")].map(c => c.textContent);
  const moment = {
    player: PLAYERS[selectedIdx].name,
    matchMinute: minute + "’",
    tags,
    note: note.value.trim(),
    field: "Field 7",
    match: "GA Aspire vs FC Dallas",
    ts: new Date().toISOString(),
  };
  const store = JSON.parse(localStorage.getItem("kit-moments") || "[]");
  store.push(moment);
  localStorage.setItem("kit-moments", JSON.stringify(store));

  haptic(18);
  gsap.fromTo(logBtn, { scale: 0.96 }, { scale: 1, duration: 0.35, ease: "back.out(2.5)" });

  const msg = document.getElementById("logged-msg");
  gsap.timeline()
    .fromTo(msg, { autoAlpha: 0, y: 6 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" })
    .to(msg, { autoAlpha: 0, y: -4, duration: 0.35, ease: "power2.in" }, "+=1.9");

  gsap.delayedCall(2.4, () => {
    note.value = "";
    chips.querySelectorAll(".chip.on").forEach(c => c.classList.remove("on"));
  });
});

/* =========================================================
   5 · ADD PLAYER (jersey-first)
   ========================================================= */
const scrim = document.getElementById("modal-scrim");
const addSheet = document.getElementById("add-sheet");
const jersey = document.getElementById("jersey");
const pname = document.getElementById("pname");
let pickedTeam = "GA Aspire";

function openAdd() {
  haptic(8);
  scrim.style.pointerEvents = "auto";
  gsap.to(scrim, { autoAlpha: 1, duration: 0.3 });
  gsap.to(addSheet, { y: 0, duration: 0.55, ease: "power4.out", startAt: { y: "105%" } });
  setTimeout(() => jersey.focus({ preventScroll: true }), 350);
}
function closeAdd() {
  scrim.style.pointerEvents = "none";
  gsap.to(scrim, { autoAlpha: 0, duration: 0.3 });
  gsap.to(addSheet, { y: "105%", duration: 0.45, ease: "power3.in" });
}
document.getElementById("add-player").addEventListener("click", openAdd);
scrim.addEventListener("click", closeAdd);
document.querySelectorAll(".team-pick").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".team-pick").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    pickedTeam = btn.dataset.team;
    haptic(5);
  });
});
document.getElementById("add-confirm").addEventListener("click", () => {
  const num = jersey.value.trim();
  if (!num) { gsap.fromTo(jersey, { x: -6 }, { x: 0, duration: 0.35, ease: "elastic.out(1, .35)" }); haptic(20); return; }
  const nm = pname.value.trim();
  PLAYERS.push({
    name: nm || `#${num} · ${pickedTeam.split(" ")[0]}`,
    pos: nm ? "—" : "look up later",
    img: null,
    grad: "—", gpa: "—", height: "—", jersey: `#${num}`,
    hs: pickedTeam, position: "—",
  });
  haptic(14);
  closeAdd();
  renderCarousel();
  selectPlayer(PLAYERS.length - 1);
  const newCard = carousel.querySelector(`.p-card[data-i="${PLAYERS.length - 1}"]`);
  gsap.fromTo(newCard, { autoAlpha: 0, scale: 0.85, x: 30 }, { autoAlpha: 1, scale: 1, x: 0, duration: 0.5, ease: "back.out(1.6)" });
  newCard.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  jersey.value = ""; pname.value = "";
});

window.addEventListener("resize", () => { layoutSheet(); setContentY(contentY); });
