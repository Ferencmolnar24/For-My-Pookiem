// ---------- page navigation ----------
function showPage(id) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "instant" });
}

document.querySelectorAll("[data-next]").forEach((btn) => {
  btn.addEventListener("click", () => showPage(btn.dataset.next));
});

// ---------- photo fallback (shows a heart if a photo is missing) ----------
document.querySelectorAll(".polaroid img").forEach((img) => {
  const swap = () => {
    const ph = document.createElement("div");
    ph.className = "placeholder";
    ph.textContent = "💗";
    img.replaceWith(ph);
  };
  if (img.complete && img.naturalWidth === 0) swap();
  else img.addEventListener("error", swap);
});

// ---------- floating hearts ----------
const heartsBox = document.querySelector(".hearts");
const heartChars = ["💗", "💕", "💖", "💞", "❤️", "🩷"];
for (let i = 0; i < 18; i++) {
  const s = document.createElement("span");
  s.textContent = heartChars[i % heartChars.length];
  s.style.left = Math.random() * 100 + "vw";
  s.style.fontSize = 14 + Math.random() * 22 + "px";
  s.style.animationDuration = 8 + Math.random() * 10 + "s";
  s.style.animationDelay = -Math.random() * 18 + "s";
  heartsBox.appendChild(s);
}

// ---------- the Yes / No question ----------
const yesBtn = document.getElementById("yes-btn");
const noBtn = document.getElementById("no-btn");
const noLabel = noBtn.querySelector(".label");

// What the No button says each time she tries it. It loops back to the start
// once it runs out, so she can keep going forever.
const noTexts = [
  "Are you sure, pookie?",
  "Pookiecham, think again 🥺",
  "Kicsim, pleeease",
  "Cutiepatootiem, that's the wrong button",
  "Malikacham, I'm begging you 🙏",
  "Pookie, the Yes button misses you",
  "Nope, try again",
  "Error 404: \"No\" not found",
  "This button is broken, use the pink one",
  "You can't catch me 😜",
  "Wrong answer, cutiepatootiem",
  "Your finger slipped, right?",
];
let attempts = 0;
let yesScale = 1;

// Space the creature's eyes, arms and legs need around the button
const EDGE = { top: 18, bottom: 26, side: 14 };

function nextText() {
  noLabel.textContent = noTexts[attempts % noTexts.length];
  attempts++;
  yesScale = Math.min(yesScale + 0.12, 1.9);
  yesBtn.style.transform = `scale(${yesScale})`;
}

// Lift the button out of the card so it can roam the whole screen
function liftOut() {
  if (noBtn.classList.contains("runaway")) return;
  const r = noBtn.getBoundingClientRect();
  document.body.appendChild(noBtn);
  noBtn.classList.add("runaway");
  noBtn.style.left = r.left + "px";
  noBtn.style.top = r.top + "px";
  noBtn.getBoundingClientRect(); // flush so the first move animates
}

// A random spot that's away from where it is now and not on top of Yes
function pickSpot(extra) {
  const pad = 12;
  const bw = noBtn.offsetWidth;
  const bh = noBtn.offsetHeight;
  const minX = pad + extra.side, maxX = window.innerWidth - bw - pad - extra.side;
  const minY = pad + extra.top, maxY = window.innerHeight - bh - pad - extra.bottom;
  const yes = yesBtn.getBoundingClientRect();
  const cur = noBtn.getBoundingClientRect();
  let x, y;
  for (let tries = 0; tries < 60; tries++) {
    x = minX + Math.random() * Math.max(0, maxX - minX);
    y = minY + Math.random() * Math.max(0, maxY - minY);
    const overlapsYes =
      x < yes.right + 24 && x + bw > yes.left - 24 &&
      y < yes.bottom + 30 && y + bh > yes.top - 30;
    const tooClose = Math.hypot(x - cur.left, y - cur.top) < 150;
    if (!overlapsYes && !tooClose) break;
  }
  return { x, y, dx: x - cur.left, dy: y - cur.top };
}

// ----- computer: the button just jumps away -----
function jump() {
  nextText();
  liftOut();
  const { x, y } = pickSpot({ top: 0, bottom: 0, side: 0 });
  noBtn.style.left = x + "px";
  noBtn.style.top = y + "px";
}

// ----- phone: the button grows eyes and legs and walks off -----
let walkTimer = null;
let sprouting = false;

function becomeCreature() {
  noBtn.insertAdjacentHTML(
    "beforeend",
    `<span class="eyes"><span class="eye"><span class="pupil"></span></span><span class="eye"><span class="pupil"></span></span></span>
     <span class="arm arm-l"></span><span class="arm arm-r"></span>
     <span class="legs"><span class="leg"></span><span class="leg"></span></span>`
  );
  noBtn.classList.add("creature", "sprouting");
}

function look(dx, dy) {
  const len = Math.hypot(dx, dy) || 1;
  noBtn.style.setProperty("--px", (dx / len) * 4 + "px");
  noBtn.style.setProperty("--py", (dy / len) * 3 + "px");
}

function walk() {
  if (sprouting) return;
  nextText();
  liftOut();

  const first = !noBtn.classList.contains("creature");
  if (first) {
    becomeCreature();
    sprouting = true;
  }

  // Let the legs pop out first, then start walking
  setTimeout(() => {
    sprouting = false;
    noBtn.classList.remove("sprouting");
    const { x, y, dx, dy } = pickSpot(EDGE);
    const ms = Math.min(1400, Math.max(650, Math.hypot(dx, dy) * 2.4));
    look(dx, dy);
    noBtn.style.transition = `left ${ms}ms linear, top ${ms}ms linear`;
    noBtn.classList.add("walking");
    noBtn.style.left = x + "px";
    noBtn.style.top = y + "px";

    clearTimeout(walkTimer);
    walkTimer = setTimeout(() => {
      noBtn.classList.remove("walking");
      // Once it stops, it glances over at the Yes button 👀
      const b = noBtn.getBoundingClientRect();
      const yes = yesBtn.getBoundingClientRect();
      look(yes.left + yes.width / 2 - (b.left + b.width / 2), yes.top + yes.height / 2 - (b.top + b.height / 2));
    }, ms);
  }, first ? 450 : 0);
}

// Computer: run away as soon as the mouse gets near
noBtn.addEventListener("pointerenter", (e) => {
  if (e.pointerType === "mouse") jump();
});
// Phone: the moment a finger touches it, it grows legs and walks off
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  walk();
}, { passive: false });
// Anything else (keyboard, a lucky click): still not allowed
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  jump();
});

yesBtn.addEventListener("click", () => {
  noBtn.remove();
  showPage("page-4");
  celebrate();
});

// ---------- heart burst on the final page ----------
function celebrate() {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  for (let i = 0; i < 40; i++) {
    const h = document.createElement("span");
    h.className = "burst";
    h.textContent = heartChars[i % heartChars.length];
    const angle = Math.random() * Math.PI * 2;
    const dist = 120 + Math.random() * Math.max(cx, cy);
    h.style.left = cx + "px";
    h.style.top = cy + "px";
    h.style.setProperty("--dx", Math.cos(angle) * dist + "px");
    h.style.setProperty("--dy", Math.sin(angle) * dist + "px");
    h.style.setProperty("--rot", (Math.random() * 120 - 60) + "deg");
    h.style.animationDelay = Math.random() * 0.3 + "s";
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 2200);
  }
}
