/* Kit · Log Moment — Joi-style sheet + Field 7 flow */

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
const phoneShell = document.getElementById("phone-shell");
const PHONE_W = 402;
const PHONE_H = 874;

function fitPhone() {
  const pad = 32;
  const scale = Math.min(
    (window.innerWidth - pad) / PHONE_W,
    (window.innerHeight - pad) / PHONE_H,
    1
  );
  phone.style.transform = `scale(${scale})`;
  phoneShell.style.width = `${PHONE_W * scale}px`;
  phoneShell.style.height = `${PHONE_H * scale}px`;
}

fitPhone();

phone.addEventListener("scroll", () => { phone.scrollTop = 0; phone.scrollLeft = 0; });

/* =========================================================
   1 · THE SHEET — peek at bottom; pull up for schedule; pull down for summary
   ========================================================= */
const sheet = document.getElementById("sheet");
const sheetBg = document.getElementById("sheet-bg");
const grabber = document.getElementById("sheet-grabber");
const hero = document.querySelector(".hero");
const daystrip = document.querySelector(".daystrip");
const inner = document.getElementById("timeline-inner");

const PEEK_HEIGHT = 280;
const SHEET_GAP = 20; /* space between calendar and sheet when expanded */
let SHEET_PEEK = 0;
let SHEET_EXPAND = 120;

function layoutSheet() {
  const stripBottom = daystrip.getBoundingClientRect().bottom - phone.getBoundingClientRect().top;
  SHEET_PEEK = phone.clientHeight - PEEK_HEIGHT;
  SHEET_EXPAND = stripBottom + SHEET_GAP;
}

layoutSheet();

gsap.set([sheetBg, grabber], { autoAlpha: 1 });
gsap.set(hero, { autoAlpha: 1 });

let sheetOpen = false;
let rawSheetY = 0;

function scheduleProgress(y) {
  if (y <= SHEET_EXPAND) return 1;
  if (y >= SHEET_PEEK) return 0;
  return (SHEET_PEEK - y) / (SHEET_PEEK - SHEET_EXPAND);
}

function applySheet() {
  let y = rawSheetY;
  const minY = SHEET_EXPAND;
  const maxY = SHEET_PEEK + 48;
  if (y < minY) y = minY - (minY - y) * 0.2;
  else if (y > maxY) y = maxY + (y - maxY) * 0.35;
  gsap.set(sheet, { y });

  const prog = scheduleProgress(y);
  const heroAlpha = gsap.utils.clamp(0, 1, (y - SHEET_EXPAND) / Math.max(1, SHEET_PEEK - SHEET_EXPAND));
  gsap.set(hero, { autoAlpha: heroAlpha, pointerEvents: heroAlpha > 0.2 ? "auto" : "none" });
}

let contentY = 0;
function minContentY() {
  const y = gsap.getProperty(sheet, "y");
  const visibleBottom = phone.clientHeight - y;
  const contentBottom = inner.offsetTop + inner.offsetHeight + 40;
  return Math.min(0, visibleBottom - contentBottom);
}
function setContentY(v) {
  contentY = gsap.utils.clamp(minContentY(), 0, v);
  gsap.set(inner, { y: contentY });
}

function settle(open) {
  sheetOpen = open;
  rawSheetY = open ? SHEET_EXPAND : SHEET_PEEK;
  if (open) { contentY = 0; gsap.set(inner, { y: 0 }); }
  haptic(open ? 10 : 6);
  gsap.to(sheet, {
    y: rawSheetY,
    duration: 0.55,
    ease: open ? "power4.out" : "power3.inOut",
    onUpdate: applySheet,
    onComplete() { applySheet(); setContentY(contentY); },
  });
}

rawSheetY = SHEET_PEEK;
gsap.set(sheet, { y: SHEET_PEEK });
applySheet();

(function attachSheetGesture() {
  const DRAG_THRESHOLD = 8;
  let tracked = false, engaged = false, pointerId = null;
  let startPointerY = 0, lastMoveY = 0, lastT = 0, velocity = 0, mode = "sheet";

  function applyDelta(d) {
    if (d > 0) {
      if (contentY < 0) {
        const use = Math.min(d, -contentY);
        setContentY(contentY + use);
        d -= use; mode = "content";
      }
      if (d > 0) { rawSheetY += d; applySheet(); mode = "sheet"; }
    } else if (d < 0) {
      let up = -d;
      const sheetRoom = rawSheetY - SHEET_EXPAND;
      if (sheetRoom > 0) {
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
      if (Math.abs(e.clientY - startPointerY) < DRAG_THRESHOLD) return;
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
    if (!engaged) return;
    engaged = false;
    if (mode === "content") {
      const target = gsap.utils.clamp(minContentY(), 0, contentY + velocity * 220);
      gsap.to(inner, { y: target, duration: 0.8, ease: "power2.out",
        onUpdate() { contentY = gsap.getProperty(inner, "y"); } });
      const y = gsap.getProperty(sheet, "y");
      settle(scheduleProgress(y) > 0.45);
    } else {
      const y = gsap.getProperty(sheet, "y");
      let expand;
      if (velocity > 0.35) expand = false;
      else if (velocity < -0.35) expand = true;
      else expand = scheduleProgress(y) > 0.45;
      settle(expand);
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
    e.stopPropagation();
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

function retargetOpenSheet() {
  if (!sheetOpen) return;
  layoutSheet();
  rawSheetY = SHEET_EXPAND;
  gsap.to(sheet, { y: SHEET_EXPAND, duration: 0.45, ease: "power3.out",
    onUpdate: applySheet,
    onComplete() { applySheet(); setContentY(contentY); } });
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
    grad: "2027", gpa: "3.92", height: "5\u20197\u2033", jersey: "#11", hs: "Central HS", position: "FW" },
  { name: "Sam Ortiz", pos: "CM", img: "assets/sam.png",
    grad: "2028", gpa: "3.75", height: "5\u20195\u2033", jersey: "#10", hs: "Westlake HS", position: "CM" },
  { name: "Jordan Lee", pos: "CM", img: "assets/jordan.jpg",
    grad: "2027", gpa: "3.88", height: "5\u20196\u2033", jersey: "#7", hs: "Liberty HS", position: "CM" },
];
const carousel = document.getElementById("carousel");
const carouselWrap = document.getElementById("carousel-wrap");
const dots = document.getElementById("dots");
let selectedIdx = 0;

function updateCarouselInset() {
  carouselWrap.classList.toggle("is-scrolled", carousel.scrollLeft > 6);
}

carousel.addEventListener("scroll", updateCarouselInset, { passive: true });

function metricRow(a, b) {
  return `<div class="p-row">
    <div class="p-cell"><span>${a.label}</span><b>${a.val}</b></div>
    <div class="p-cell"><span>${b.label}</span><b>${b.val}</b></div>
  </div>`;
}

function cardHTML(p, i) {
  const photo = p.img ? `<img src="${p.img}" alt="">` : `<span class="p-sil">${p.jersey}</span>`;
  return `<div class="p-card${i === selectedIdx ? " selected" : ""}" data-i="${i}">
    <div class="p-head">${photo}
      <div><div class="p-name">${p.name}</div><div class="p-pos">${p.pos}</div></div>
    </div>
    <div class="p-divider"></div>
    <div class="p-grid">
      ${metricRow({ label: "GRAD", val: p.grad }, { label: "GPA", val: p.gpa })}
      ${metricRow({ label: "HEIGHT", val: p.height }, { label: "JERSEY", val: p.jersey })}
      ${metricRow({ label: "HS", val: p.hs }, { label: "POSITION", val: p.position })}
    </div>
  </div>`;
}

function renderDots() {
  dots.innerHTML = PLAYERS.map((_, i) => {
    if (i === selectedIdx) {
      return `<img src="assets/figma/live-dot.svg" alt="" class="on">`;
    }
    return `<img src="assets/figma/dot-inactive.svg" alt="" class="dot-inactive">`;
  }).join("");
}

function renderCarousel() {
  carousel.innerHTML = PLAYERS.map(cardHTML).join("");
  carousel.scrollLeft = 0;
  renderDots();
  document.getElementById("watch-count").textContent = PLAYERS.length;
  carousel.querySelectorAll(".p-card").forEach(el => {
    el.addEventListener("click", () => selectPlayer(+el.dataset.i));
  });
  updateCarouselInset();
}

function selectPlayer(i) {
  selectedIdx = i;
  haptic(6);
  carousel.querySelectorAll(".p-card").forEach((el, j) => el.classList.toggle("selected", j === i));
  renderDots();
  updateCarouselInset();
  gsap.fromTo(".log-panel", { boxShadow: "0 0 0 rgba(52,208,189,0)" }, {
    boxShadow: "0 0 0 rgba(52,208,189,0)",
    duration: 0.45, yoyo: true, repeat: 1,
  });
  document.querySelector(".log-panel")?.scrollIntoView({ behavior: "smooth", block: "end" });
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

let minute = 34;
setInterval(() => {
  minute++;
  document.getElementById("min-a").textContent = minute;
  document.getElementById("min-b").textContent = minute;
}, 45000);

/* =========================================================
   4 · LOG MOMENT
   ========================================================= */
const chipsRoot = document.getElementById("chips");
chipsRoot.addEventListener("click", e => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  chip.classList.toggle("on");
  chip.setAttribute("aria-pressed", chip.classList.contains("on"));
  haptic(5);
  gsap.fromTo(chip, { scale: 0.92 }, { scale: 1, duration: 0.25, ease: "back.out(3)" });
});
document.querySelectorAll(".chip").forEach(c => c.setAttribute("aria-pressed", "false"));

const logBtn = document.getElementById("log-btn");
const note = document.getElementById("note");

logBtn.addEventListener("click", () => {
  const tags = [...chipsRoot.querySelectorAll(".chip.on")].map(c => c.textContent);
  const moment = {
    player: PLAYERS[selectedIdx].name,
    matchMinute: minute + "\u2019",
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
    document.querySelectorAll(".chip.on").forEach(c => {
      c.classList.remove("on");
      c.setAttribute("aria-pressed", "false");
    });
  });
});

/* =========================================================
   5 · ADD PLAYER
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

window.addEventListener("resize", () => {
  fitPhone();
  layoutSheet();
  rawSheetY = sheetOpen ? SHEET_EXPAND : SHEET_PEEK;
  gsap.set(sheet, { y: rawSheetY });
  applySheet();
  setContentY(contentY);
});
