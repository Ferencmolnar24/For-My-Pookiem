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

const noTexts = [
  "No",
  "Are you sure?",
  "Really sure? 🥺",
  "Think again!",
  "Pookie please 🙏",
  "Don't do this to me",
  "I'll be so sad…",
  "Nope, not allowed",
  "Wrong button 😤",
  "Just press yes 💕",
];
let attempts = 0;
let yesScale = 1;

function dodge() {
  attempts++;
  noBtn.textContent = noTexts[Math.min(attempts, noTexts.length - 1)];

  // Grow the Yes button a little every time
  yesScale = Math.min(yesScale + 0.12, 1.9);
  yesBtn.style.transform = `scale(${yesScale})`;

  // First dodge: lift the button out so it can roam the whole screen
  if (!noBtn.classList.contains("runaway")) {
    const r = noBtn.getBoundingClientRect();
    document.body.appendChild(noBtn);
    noBtn.classList.add("runaway");
    noBtn.style.left = r.left + "px";
    noBtn.style.top = r.top + "px";
    noBtn.getBoundingClientRect(); // flush so the first move animates
  }

  const pad = 16;
  const bw = noBtn.offsetWidth;
  const bh = noBtn.offsetHeight;
  const maxX = window.innerWidth - bw - pad;
  const maxY = window.innerHeight - bh - pad;
  const yes = yesBtn.getBoundingClientRect();
  const cur = noBtn.getBoundingClientRect();

  // Pick a spot that's away from where it is now and not on top of Yes
  let x, y, tries = 0;
  do {
    x = pad + Math.random() * Math.max(0, maxX - pad);
    y = pad + Math.random() * Math.max(0, maxY - pad);
    tries++;
    const overlapsYes =
      x < yes.right + 20 && x + bw > yes.left - 20 &&
      y < yes.bottom + 20 && y + bh > yes.top - 20;
    const tooClose = Math.hypot(x - cur.left, y - cur.top) < 140;
    if (!overlapsYes && !tooClose) break;
  } while (tries < 50);

  noBtn.style.left = x + "px";
  noBtn.style.top = y + "px";
}

// Desktop: run away as soon as the mouse gets near
noBtn.addEventListener("pointerenter", (e) => {
  if (e.pointerType === "mouse") dodge();
});
// Phone: run away the moment a finger touches it
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  dodge();
}, { passive: false });
// Anything else (keyboard, a lucky click): still not allowed
noBtn.addEventListener("click", (e) => {
  e.preventDefault();
  dodge();
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
