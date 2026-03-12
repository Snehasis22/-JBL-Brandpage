/* ============================================================
   JBL Tune Beam — Ultra-Premium Cinematic Landing Page v6
   • Autoplay Video Background (Landing Style)
   • 1080p Optimized Canvas Scaling
   • Increased Golden Sparkles (250 particles)
   • Smooth 60fps+ Cinematic Playback
   ============================================================ */

'use strict';

/* ── DOM refs ──────────────────────────────────────────────────── */
const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d', { alpha: false });
const loader = document.getElementById('loader');
const loaderFill = document.getElementById('loader-fill');
const loaderPct = document.getElementById('loader-pct');
const progBar = document.getElementById('progress-bar');
const navbar = document.getElementById('navbar');
const particleCanvas = document.getElementById('particles');
const ptx = particleCanvas ? particleCanvas.getContext('2d') : null;
const vid = document.getElementById('v');

/* ── Config ────────────────────────────────────────────────────── */
const PAR_STR = 12;       // buttery smooth drift
const VIGN_ALPHA = 0.52;     // premium shadow depth
const DPR = Math.min(window.devicePixelRatio || 1, 8); // 8K Ultra-HD target scale

/* ── State ─────────────────────────────────────────────────────── */
let raf = null;
let introDone = false;
let cW = 0, cH = 0;
let mX = 0, mY = 0;           // mouse −1…1
let lastTime = 0;

/* ──────────────────────────────────────────────────────────────
   PARTICLE SYSTEM — floating ambient particles
   ────────────────────────────────────────────────────────────── */
class Particle {
  constructor(w, h) {
    this.reset(w, h, true);
  }
  reset(w, h, init = false) {
    this.x = Math.random() * w;
    this.y = init ? Math.random() * h : -20;
    this.size = Math.random() * 2.5 + 0.5;
    this.speedY = Math.random() * 0.4 + 0.1;
    this.speedX = (Math.random() - 0.5) * 0.2;
    this.opacity = Math.random() * 0.6 + 0.1;
    this.flickerSpeed = Math.random() * 0.03 + 0.01;
    this.flickerPhase = Math.random() * Math.PI * 2;
    this.w = w; this.h = h;
  }
  update(t) {
    this.y += this.speedY;
    this.x += this.speedX + Math.sin(t * 0.0006 + this.flickerPhase) * 0.15;
    if (this.y > this.h + 20 || this.x < -20 || this.x > this.w + 20) {
      this.reset(this.w, this.h);
    }
  }
  draw(ctx, t) {
    const flicker = 0.4 + 0.6 * Math.sin(t * this.flickerSpeed + this.flickerPhase);
    const alpha = this.opacity * flicker;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 200, 100, ${alpha})`;
    ctx.fill();
    // glow
    if (this.size > 1.2) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 153, 0, ${alpha * 0.15})`;
      ctx.fill();
    }
  }
}

let particles = [];
const PARTICLE_COUNT = 250; // Increased golden sparkles

function initParticles() {
  if (!particleCanvas || !ptx) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  particleCanvas.width = w * DPR;
  particleCanvas.height = h * DPR;
  particleCanvas.style.width = w + 'px';
  particleCanvas.style.height = h + 'px';
  ptx.setTransform(DPR, 0, 0, DPR, 0, 0);
  particles = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new Particle(w, h));
  }
}

function drawParticles(t) {
  if (!ptx) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  ptx.clearRect(0, 0, w, h);
  for (const p of particles) {
    p.update(t);
    p.draw(ptx, t);
  }
}

/* ── Preload — Autoplay Support ────── */
async function preload() {
  vid.removeAttribute('src');
  vid.loop = true;
  vid.autoplay = true;
  vid.muted = true;
  vid.setAttribute('playsinline', '');

  const videoPath = 'Jbl earbuds.mp4';

  try {
    const response = await fetch(videoPath);
    if (!response.ok) throw new Error('Video loading failed');

    const contentLength = response.headers.get('Content-Length');
    if (!contentLength) throw new Error('No content length');

    const total = +contentLength;
    const reader = response.body.getReader();
    let receivedLength = 0;
    let chunks = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
      receivedLength += value.length;
      const pct = (receivedLength / total) * 100;
      if (loaderFill) loaderFill.style.width = pct + '%';
      if (loaderPct) loaderPct.textContent = Math.round(pct) + '%';
    }

    const blob = new Blob(chunks, { type: 'video/mp4' });
    vid.src = URL.createObjectURL(blob);

    vid.addEventListener('loadeddata', () => {
      if (introDone) return;
      resize();
      boot();
      doneLoading();
      vid.play();
    }, { once: true });

  } catch (error) {
    console.warn('Fast preload failed, trying direct:', error);
    vid.src = videoPath;
    vid.addEventListener('loadeddata', () => {
      if (introDone) return;
      resize();
      boot();
      doneLoading();
      vid.play();
    }, { once: true });
  }
}

/* ── Loader hide ───────────────────────────────────────────────── */
function doneLoading() {
  setTimeout(() => {
    if (loader) {
      loader.classList.add('out');
      setTimeout(() => { loader.style.display = 'none'; }, 950);
    }
  }, 400);
}

/* ── Canvas resize (Hi‑DPI) ────────────────────────────────────── */
function resize() {
  cW = window.innerWidth;
  cH = window.innerHeight;
  canvas.width = cW * DPR;
  canvas.height = cH * DPR;
  canvas.style.width = cW + 'px';
  canvas.style.height = cH + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  initParticles();
}
window.addEventListener('resize', resize, { passive: true });

/* ── Cinematic intro animation ─────────────────────────────────── */
function boot() {
  if (introDone) return;
  introDone = true;

  canvas.style.opacity = '0';
  canvas.style.transform = 'scale(1.05)';
  canvas.style.filter = 'blur(10px)';
  canvas.style.transition = 'opacity 2s ease, transform 2.5s ease, filter 2s ease';

  requestAnimationFrame(() => {
    setTimeout(() => {
      canvas.style.opacity = '1';
      canvas.style.transform = 'scale(1)';
      canvas.style.filter = 'blur(0px)';
    }, 100);
  });

  const hero = document.getElementById('hero-panel');
  if (hero) setTimeout(() => hero.classList.add('visible'), 800);

  startLoop();
}

/* ── Draw frame — Optimized for 4K Detail ── */
function drawImageCover(src, px, py) {
  if (src.readyState < 2) return;

  const iW = src.videoWidth || 1920;
  const iH = src.videoHeight || 1080;

  /* 4K Cinematic Framing: slight zoom to maintain sharpness and immersive feel */
  const scale = Math.max(cW / iW, cH / iH) * 1.02;
  const w = iW * scale;
  const h = iH * scale;

  const x = (cW - w) / 2 + px;
  const y = (cH - h) / 2 + py;

  ctx.drawImage(src, x, y, w, h);
}

function draw(px = 0, py = 0) {
  ctx.clearRect(0, 0, cW, cH);

  // High-fidelity rendering hints
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  drawImageCover(vid, px, py);

  /* ── Ultra-Premium Cinematic Vignette ── */
  const vgn = ctx.createRadialGradient(
    cW / 2, cH / 2, cH * 0.15,
    cW / 2, cH / 2, cH * 1.0
  );
  vgn.addColorStop(0, 'rgba(0,0,0,0)');
  vgn.addColorStop(0.5, 'rgba(0,0,0,0.05)');
  vgn.addColorStop(1, `rgba(0,0,0,${VIGN_ALPHA})`);
  ctx.fillStyle = vgn;
  ctx.fillRect(0, 0, cW, cH);

  applyGrain();
}

/* ── Film grain ── */
const grainCanvas = document.createElement('canvas');
const grainCtx = grainCanvas.getContext('2d');
let grainGenerated = false;

function generateGrain(w, h) {
  grainCanvas.width = w;
  grainCanvas.height = h;
  const imageData = grainCtx.createImageData(w, h);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.random() * 255;
    data[i] = v; data[i + 1] = v; data[i + 2] = v;
    data[i + 3] = 15;
  }
  grainCtx.putImageData(imageData, 0, 0);
  grainGenerated = true;
}

function applyGrain() {
  if (!grainGenerated) generateGrain(Math.ceil(cW / 4), Math.ceil(cH / 4));
  ctx.globalAlpha = 0.04;
  ctx.drawImage(grainCanvas, 0, 0, cW, cH);
  ctx.globalAlpha = 1;
}

/* ── Main Loop ─────────────────────────────────────────────────── */
function loop(timestamp) {
  const px = mX * PAR_STR;
  const py = mY * PAR_STR;
  draw(px, py);
  drawParticles(timestamp);

  raf = requestAnimationFrame(loop);
}

function startLoop() {
  if (raf) cancelAnimationFrame(raf);
  raf = requestAnimationFrame(loop);
}

/* ── Sub-loops ─────────────────────────────────────────────────── */
window.addEventListener('mousemove', e => {
  mX = (e.clientX / window.innerWidth - 0.5) * 2;
  mY = (e.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });

window.addEventListener('scroll', () => {
  if (!navbar) return;
  const scrolled = window.scrollY > 50;
  navbar.classList.toggle('scrolled', scrolled);

  if (progBar) {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
  }
}, { passive: true });

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.panel').forEach(el => observer.observe(el));

/* ── Boot ──────────────────────────────────────────────────────── */
preload();