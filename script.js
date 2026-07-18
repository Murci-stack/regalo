const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll(".reveal");
const giftLink = document.querySelector("#gift-link");
const giftCard = document.querySelector(".gift-card");
const openingMessage = document.querySelector("#opening-message");
const confettiLayer = document.querySelector("#confetti");
const backgroundMusic = document.querySelector("#background-music");
const musicToggle = document.querySelector("#music-toggle");
const musicLabel = document.querySelector(".music-toggle__label");
const surpriseLink = document.querySelector(".soft-button");
const musicVolume = 0.42;
let volumeFrame;

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 },
  );

  revealItems.forEach((item) => observer.observe(item));
}

function launchConfetti(amount = 90) {
  if (reducedMotion || !confettiLayer) return;

  const colors = ["#f8d38d", "#f5bdc8", "#ffffff", "#d65b72", "#e4b85c", "#a9c49f"];
  const fragment = document.createDocumentFragment();

  for (let index = 0; index < amount; index += 1) {
    const piece = document.createElement("span");
    const left = Math.random() * 100;
    const duration = 2.4 + Math.random() * 2.2;
    const delay = Math.random() * 0.55;
    const drift = `${-9 + Math.random() * 18}vw`;
    const rotation = `${Math.random() * 360}deg`;

    piece.className = "confetti__piece";
    piece.style.left = `${left}%`;
    piece.style.background = colors[index % colors.length];
    piece.style.animationDelay = `${delay}s`;
    piece.style.setProperty("--fall-duration", `${duration}s`);
    piece.style.setProperty("--drift", drift);
    piece.style.setProperty("--rotation", rotation);
    piece.style.width = `${0.45 + Math.random() * 0.55}rem`;
    piece.style.height = `${0.65 + Math.random() * 0.75}rem`;

    piece.addEventListener("animationend", () => piece.remove(), { once: true });
    fragment.appendChild(piece);
  }

  confettiLayer.appendChild(fragment);
}

function updateMusicControl(isPlaying) {
  if (!musicToggle || !musicLabel) return;

  musicToggle.classList.toggle("is-playing", isPlaying);
  musicToggle.setAttribute("aria-pressed", String(isPlaying));
  musicToggle.setAttribute("aria-label", isPlaying ? "Pausar música" : "Reproducir música");
  musicLabel.textContent = isPlaying ? "Pausar música" : "Poner música";
}

function fadeInMusic() {
  if (!backgroundMusic) return;

  window.cancelAnimationFrame(volumeFrame);
  backgroundMusic.volume = 0;
  const startedAt = performance.now();
  const duration = 1800;

  function raiseVolume(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    backgroundMusic.volume = musicVolume * progress;

    if (progress < 1 && !backgroundMusic.paused) {
      volumeFrame = window.requestAnimationFrame(raiseVolume);
    }
  }

  volumeFrame = window.requestAnimationFrame(raiseVolume);
}

async function playMusic() {
  if (!backgroundMusic) return;

  try {
    await backgroundMusic.play();
    updateMusicControl(true);
    fadeInMusic();
  } catch {
    updateMusicControl(false);
  }
}

function pauseMusic() {
  if (!backgroundMusic) return;

  window.cancelAnimationFrame(volumeFrame);
  backgroundMusic.pause();
  updateMusicControl(false);
}

musicToggle?.addEventListener("click", () => {
  if (backgroundMusic?.paused) {
    playMusic();
  } else {
    pauseMusic();
  }
});

surpriseLink?.addEventListener("click", () => {
  if (backgroundMusic?.paused) playMusic();
});

backgroundMusic?.addEventListener("play", () => updateMusicControl(true));
backgroundMusic?.addEventListener("pause", () => updateMusicControl(false));
backgroundMusic?.addEventListener("error", () => {
  if (musicToggle) musicToggle.hidden = true;
});

giftLink?.addEventListener("click", (event) => {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

  event.preventDefault();
  giftCard?.classList.add("is-opening");
  if (openingMessage) openingMessage.textContent = "Abriendo tu regalo… ♥";
  launchConfetti();

  const delay = reducedMotion ? 50 : 850;
  window.setTimeout(() => {
    window.location.assign(giftLink.href);
  }, delay);
});

window.setTimeout(() => launchConfetti(72), reducedMotion ? 0 : 500);
window.setTimeout(() => launchConfetti(44), reducedMotion ? 0 : 2100);
