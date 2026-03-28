// ============================================
// STATE
// ============================================
let currentSlide = 0;
let isTransitioning = false;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;
const progressBar = document.getElementById('progressBar');
const slideCounter = document.getElementById('slideCounter');
const sideMenu = document.getElementById('sideMenu');
const menuOverlay = document.getElementById('menuOverlay');
const menuList = document.getElementById('menuList');
const keyboardHints = document.getElementById('keyboardHints');

// ============================================
// NAVIGATION (FIXED - double rAF for reliable transitions)
// ============================================
function goToSlide(index) {
  if (index < 0 || index >= totalSlides || index === currentSlide || isTransitioning) return;
  isTransitioning = true;

  const direction = index > currentSlide ? 1 : -1;
  const currentEl = slides[currentSlide];
  const nextEl = slides[index];

  // 1) Immediately hide current slide
  currentEl.classList.remove('active');
  currentEl.style.transition = 'none';
  currentEl.style.opacity = '0';
  currentEl.style.transform = direction > 0 ? 'translateX(-60px)' : 'translateX(60px)';
  currentEl.style.pointerEvents = 'none';

  // 2) Position next slide at starting point (off-screen) with NO transition
  nextEl.style.transition = 'none';
  nextEl.style.opacity = '0';
  nextEl.style.transform = direction > 0 ? 'translateX(60px)' : 'translateX(-60px)';
  nextEl.style.pointerEvents = 'none';

  // 3) Force browser to paint the starting position, then animate in
  // Double rAF guarantees the browser has committed the frame
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // Re-enable transitions
      nextEl.style.transition = '';
      // Animate to final position
      nextEl.classList.add('active');
      nextEl.style.opacity = '';
      nextEl.style.transform = '';
      nextEl.style.pointerEvents = '';

      // Clean up old slide after transition
      setTimeout(() => {
        currentEl.style.transition = '';
        currentEl.style.opacity = '';
        currentEl.style.transform = '';
        currentEl.style.pointerEvents = '';
        isTransitioning = false;
      }, 550);
    });
  });

  currentSlide = index;
  updateUI();
  revealItems();
  closeMenu();
  triggerCanvases(index);
}

function triggerCanvases(index) {
  // Draw canvases when their slide becomes active
  setTimeout(() => {
    if (index === 7) drawComplexPlane();
    if (index === 9) initOpsCalculator();
    if (index === 11) drawFFTWave();
    if (index === 12) drawMandelbrot();
    if (index === 13) drawMandelbrotBuild();
    if (index === 14) drawCryptoDemo();
    if (index === 16) drawRotation();
    if (index === 17) drawFractalTree();
    if (index === 19) drawQAMDemo();
    if (index === 20) drawControlDemo();
  }, 400);
}

function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1); }

function updateUI() {
  const progress = ((currentSlide + 1) / totalSlides) * 100;
  progressBar.style.width = progress + '%';
  slideCounter.textContent = `${currentSlide + 1} / ${totalSlides}`;

  const menuItems = menuList.querySelectorAll('li:not(.separator)');
  menuItems.forEach(li => {
    li.classList.toggle('active', parseInt(li.dataset.slide) === currentSlide);
  });
}

// ============================================
// REVEAL ANIMATION
// ============================================
function revealItems() {
  const activeSlide = slides[currentSlide];
  const items = activeSlide.querySelectorAll('.reveal-item');
  items.forEach((item, i) => {
    setTimeout(() => {
      item.classList.add('visible');
    }, 150 + i * 120);
  });
}

// ============================================
// MENU
// ============================================
function buildMenu() {
  slides.forEach((slide, i) => {
    const title = slide.dataset.title || `Slide ${i + 1}`;
    const speaker = slide.dataset.speaker || '';

    if (title.startsWith('—')) {
      const sep = document.createElement('li');
      sep.className = 'separator';
      sep.textContent = title.replace('— ', '');
      menuList.appendChild(sep);
    }

    const li = document.createElement('li');
    li.dataset.slide = i;
    li.innerHTML = `<span class="menu-num">${String(i + 1).padStart(2, '0')}</span>${title.replace(/^— /, '')}`;
    if (speaker) {
      li.innerHTML += `<span style="margin-left:auto;font-size:0.7rem;color:var(--text-dim)">${speaker.split(' ')[0]}</span>`;
    }
    li.addEventListener('click', () => goToSlide(i));
    menuList.appendChild(li);
  });
}

function toggleMenu() {
  sideMenu.classList.toggle('open');
  menuOverlay.classList.toggle('visible');
}

function closeMenu() {
  sideMenu.classList.remove('open');
  menuOverlay.classList.remove('visible');
}

// ============================================
// KEYBOARD
// ============================================
document.addEventListener('keydown', (e) => {
  // Don't navigate if user is typing in an input
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    if (e.key === 'Escape') e.target.blur();
    return;
  }

  switch (e.key) {
    case 'ArrowRight':
    case ' ':
      e.preventDefault();
      nextSlide();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      prevSlide();
      break;
    case 'm':
    case 'M':
      toggleMenu();
      break;
    case 'f':
    case 'F':
      toggleFullscreen();
      break;
    case 'h':
    case 'H':
      keyboardHints.classList.toggle('hidden');
      break;
    case 'Home':
      e.preventDefault();
      goToSlide(0);
      break;
    case 'End':
      e.preventDefault();
      goToSlide(totalSlides - 1);
      break;
    case 'Escape':
      closeMenu();
      break;
  }
});

// ============================================
// FULLSCREEN
// ============================================
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen();
  }
}

// ============================================
// BUTTON EVENTS
// ============================================
document.getElementById('btnPrev').addEventListener('click', prevSlide);
document.getElementById('btnNext').addEventListener('click', nextSlide);
document.getElementById('btnMenu').addEventListener('click', toggleMenu);
document.getElementById('menuClose').addEventListener('click', closeMenu);
document.getElementById('menuOverlay').addEventListener('click', closeMenu);
document.getElementById('btnFullscreen').addEventListener('click', toggleFullscreen);

// Touch swipe
let touchStartX = 0;
document.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

document.addEventListener('touchend', (e) => {
  const diff = touchStartX - e.changedTouches[0].screenX;
  if (Math.abs(diff) > 60) {
    if (diff > 0) nextSlide();
    else prevSlide();
  }
}, { passive: true });

// ============================================
// CANVAS: Interactive Complex Plane (Slide 7)
// ============================================
let planeA = 3, planeB = 2;

function drawComplexPlane() {
  const canvas = document.getElementById('complexPlane');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const scale = 50;

  // Read input values
  const inputA = document.getElementById('planeInputA');
  const inputB = document.getElementById('planeInputB');
  if (inputA) planeA = parseFloat(inputA.value) || 0;
  if (inputB) planeB = parseFloat(inputB.value) || 0;

  // Clamp to visible range
  const a = Math.max(-3.5, Math.min(3.5, planeA));
  const b = Math.max(-3, Math.min(3, planeB));

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#111738';
  ctx.fillRect(0, 0, w, h);

  // Grid
  ctx.strokeStyle = 'rgba(92, 107, 192, 0.1)';
  ctx.lineWidth = 1;
  for (let i = -4; i <= 4; i++) {
    ctx.beginPath(); ctx.moveTo(cx + i * scale, 0); ctx.lineTo(cx + i * scale, h); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, cy + i * scale); ctx.lineTo(w, cy + i * scale); ctx.stroke();
  }

  // Axes
  ctx.strokeStyle = 'rgba(92, 107, 192, 0.4)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

  // Axis labels
  ctx.fillStyle = '#9fa8da';
  ctx.font = '12px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('Re', w - 15, cy - 8);
  ctx.fillText('Im', cx + 15, 15);

  ctx.font = '10px Inter';
  ctx.fillStyle = '#5c6bc0';
  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    ctx.fillText(i.toString(), cx + i * scale, cy + 14);
    ctx.fillText(i + 'i', cx + 14, cy - i * scale + 4);
  }

  // Point
  const px = cx + a * scale;
  const py = cy - b * scale;

  // Dashed projection lines
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(239, 83, 80, 0.35)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, py); ctx.lineTo(px, py); ctx.stroke();
  ctx.setLineDash([]);

  // Vector
  ctx.strokeStyle = '#7c8cf0';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();

  // Módulo
  const modulo = Math.sqrt(a * a + b * b);
  const midX = (cx + px) / 2;
  const midY = (cy + py) / 2;
  ctx.fillStyle = '#7c8cf0';
  ctx.font = '11px Inter';
  ctx.textAlign = 'center';
  ctx.fillText(`|z| = ${modulo.toFixed(2)}`, midX - 10, midY - 8);

  // Angle arc
  if (a !== 0 || b !== 0) {
    const angle = Math.atan2(b, a);
    ctx.strokeStyle = '#66bb6a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (angle >= 0) ctx.arc(cx, cy, 22, -angle, 0);
    else ctx.arc(cx, cy, 22, 0, -angle);
    ctx.stroke();

    const deg = ((angle * 180) / Math.PI).toFixed(1);
    ctx.fillStyle = '#66bb6a';
    ctx.font = '10px Inter';
    ctx.fillText(`θ=${deg}°`, cx + 35, cy - 12);
  }

  // Point dot
  ctx.fillStyle = '#ef5350';
  ctx.beginPath(); ctx.arc(px, py, 7, 0, Math.PI * 2); ctx.fill();
  ctx.shadowColor = 'transparent';

  // Label
  const sign = b >= 0 ? '+' : '−';
  const bAbs = Math.abs(b);
  ctx.fillStyle = '#ef5350';
  ctx.font = 'bold 12px Inter';
  ctx.textAlign = 'left';
  ctx.fillText(`z = ${a} ${sign} ${bAbs}i`, px + 12, py - 8);

  // Update info display
  const infoEl = document.getElementById('planeInfo');
  if (infoEl) {
    infoEl.innerHTML = `|z| = ${modulo.toFixed(3)} &nbsp;|&nbsp; θ = ${((Math.atan2(b, a) * 180) / Math.PI).toFixed(1)}° &nbsp;|&nbsp; Conjugado: ${a} ${b >= 0 ? '−' : '+'} ${bAbs}i`;
  }
}

function onPlaneInputChange() {
  drawComplexPlane();
}

// ============================================
// CANVAS: Mandelbrot (Slide 12)
// ============================================
function drawMandelbrot() {
  const canvas = document.getElementById('mandelbrotCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const maxIter = 80;
  const imageData = ctx.createImageData(w, h);

  for (let px = 0; px < w; px++) {
    for (let py = 0; py < h; py++) {
      let x0 = (px - w * 0.65) / (w * 0.3);
      let y0 = (py - h * 0.5) / (h * 0.45);
      let x = 0, y = 0, iter = 0;

      while (x * x + y * y <= 4 && iter < maxIter) {
        const xtemp = x * x - y * y + x0;
        y = 2 * x * y + y0;
        x = xtemp;
        iter++;
      }

      const idx = (py * w + px) * 4;
      if (iter === maxIter) {
        imageData.data[idx] = 10;
        imageData.data[idx + 1] = 14;
        imageData.data[idx + 2] = 39;
      } else {
        const t = iter / maxIter;
        imageData.data[idx] = Math.min(255, Math.floor(9 * (1 - t) * t * t * t * 255) + 40);
        imageData.data[idx + 1] = Math.min(255, Math.floor(15 * (1 - t) * (1 - t) * t * t * 255) + 50);
        imageData.data[idx + 2] = Math.min(255, Math.floor(8.5 * (1 - t) * (1 - t) * (1 - t) * t * 255) + 180);
      }
      imageData.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // Setup click interaction
  canvas.onclick = function(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = w / rect.width;
    const scaleY = h / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    const cReal = (mx - w * 0.65) / (w * 0.3);
    const cImag = (my - h * 0.5) / (h * 0.45);
    showMandelbrotIteration(cReal, cImag);
  };
}

function showMandelbrotIteration(cR, cI) {
  const el = document.getElementById('mandelbrotInfo');
  if (!el) return;

  let x = 0, y = 0, iter = 0;
  const maxIter = 80;
  const steps = [];

  while (x * x + y * y <= 4 && iter < maxIter) {
    const mod = Math.sqrt(x * x + y * y);
    if (iter < 5) steps.push(`z${iter} = ${x.toFixed(2)} + ${y.toFixed(2)}i &nbsp;(|z|=${mod.toFixed(2)})`);
    const xt = x * x - y * y + cR;
    y = 2 * x * y + cI;
    x = xt;
    iter++;
  }

  const escaped = iter < maxIter;
  const sign = cI >= 0 ? '+' : '−';
  el.innerHTML = `
    <strong>c = ${cR.toFixed(2)} ${sign} ${Math.abs(cI).toFixed(2)}i</strong> &nbsp;→&nbsp;
    ${escaped ? `<span style="color:#ef5350">Escapó en ${iter} iteraciones</span>` : '<span style="color:#66bb6a">Pertenece al conjunto</span>'}
    <br><small style="color:var(--text-dim)">${steps.join(' → ')}</small>
  `;
}

// ============================================
// INTERACTIVE: Operations Calculator (Slide 9)
// ============================================
let opsInitialized = false;

function initOpsCalculator() {
  if (opsInitialized) { calculateOps(); return; }
  opsInitialized = true;

  // Attach event listeners
  ['opsA1', 'opsB1', 'opsA2', 'opsB2'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calculateOps);
  });

  calculateOps();
}

function calculateOps() {
  const a1 = parseFloat(document.getElementById('opsA1')?.value) || 0;
  const b1 = parseFloat(document.getElementById('opsB1')?.value) || 0;
  const a2 = parseFloat(document.getElementById('opsA2')?.value) || 0;
  const b2 = parseFloat(document.getElementById('opsB2')?.value) || 0;

  // Sum
  setResult('resultSum', a1 + a2, b1 + b2);
  // Sub
  setResult('resultSub', a1 - a2, b1 - b2);
  // Mul: (a1+b1i)(a2+b2i) = (a1a2 - b1b2) + (a1b2 + b1a2)i
  setResult('resultMul', a1 * a2 - b1 * b2, a1 * b2 + b1 * a2);
  // Div: multiply by conjugate
  const denom = a2 * a2 + b2 * b2;
  if (denom === 0) {
    const el = document.getElementById('resultDiv');
    if (el) el.textContent = 'Indefinido (÷0)';
  } else {
    setResult('resultDiv', (a1 * a2 + b1 * b2) / denom, (b1 * a2 - a1 * b2) / denom);
  }
}

function setResult(id, real, imag) {
  const el = document.getElementById(id);
  if (!el) return;
  const r = Math.round(real * 1000) / 1000;
  const im = Math.round(imag * 1000) / 1000;
  const sign = im >= 0 ? '+' : '−';
  el.textContent = `${r} ${sign} ${Math.abs(im)}i`;
}

// ============================================
// CANVAS: Fractal Tree (Slide 16)
// ============================================
let fractalTreeInitialized = false;

const treePalettes = {
  fire:   { trunk: [255, 106, 0],  tip: [238, 9, 121],  dot: [255, 50, 80]   },
  nature: { trunk: [139, 69, 19],  tip: [102, 187, 106], dot: [130, 220, 130] },
  ice:    { trunk: [0, 210, 255],   tip: [146, 141, 255], dot: [180, 180, 255] },
  gold:   { trunk: [247, 151, 30],  tip: [255, 210, 0],   dot: [255, 230, 100] },
  neon:   { trunk: [183, 33, 255],  tip: [33, 212, 253],  dot: [100, 255, 220] },
  mono:   { trunk: [200, 200, 200], tip: [100, 100, 100], dot: [160, 160, 160] },
};

function drawFractalTree() {
  const canvas = document.getElementById('fractalTreeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  const depthSlider = document.getElementById('treeDepthSlider');
  const angleLSlider = document.getElementById('treeAngleLSlider');
  const angleRSlider = document.getElementById('treeAngleRSlider');
  const trunkSlider = document.getElementById('treeTrunkSlider');
  const colorRow = document.getElementById('treeColorRow');
  const conjugateToggle = document.getElementById('treeConjugateToggle');

  let activePalette = 'fire';

  function val(el, fallback) { return parseFloat(el?.value || fallback); }

  function render() {
    const depth = val(depthSlider, 11);
    const angL = val(angleLSlider, 45) * Math.PI / 180;
    const angR = val(angleRSlider, 25) * Math.PI / 180;
    const trunkLen = val(trunkSlider, 108);

    // Update labels
    const dv = document.getElementById('treeDepthVal');
    const lv = document.getElementById('treeAngleLVal');
    const rv = document.getElementById('treeAngleRVal');
    const tv = document.getElementById('treeTrunkVal');
    if (dv) dv.textContent = depth;
    if (lv) lv.textContent = val(angleLSlider, 45) + '°';
    if (rv) rv.textContent = val(angleRSlider, 25) + '°';
    if (tv) tv.textContent = Math.round(trunkLen);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, w, h);

    const pal = treePalettes[activePalette];
    const shrink = 0.72;
    let branchCount = 0;

    function lerpColor(c1, c2, t) {
      return [
        Math.round(c1[0] + (c2[0] - c1[0]) * t),
        Math.round(c1[1] + (c2[1] - c1[1]) * t),
        Math.round(c1[2] + (c2[2] - c1[2]) * t),
      ];
    }

    function drawBranch(x, y, dirX, dirY, len, level) {
      if (level > depth || len < 1) return;

      const endX = x + dirX * len;
      const endY = y + dirY * len;
      const t = level / depth;
      const [r, g, b] = lerpColor(pal.trunk, pal.tip, t);

      // Glow effect for thicker branches
      const lw = Math.max(0.5, (depth - level) * 1.4);
      if (lw > 2) {
        ctx.strokeStyle = `rgba(${r},${g},${b},0.15)`;
        ctx.lineWidth = lw + 4;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(endX, endY); ctx.stroke();
      }

      ctx.strokeStyle = `rgb(${r},${g},${b})`;
      ctx.lineWidth = lw;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(endX, endY); ctx.stroke();
      branchCount++;

      // Dots at tips
      if (level >= depth - 1) {
        const [dr, dg, db] = pal.dot;
        const dotSize = 1.5 + Math.random() * 2.5;
        ctx.fillStyle = `rgba(${dr},${dg},${db},${0.5 + Math.random() * 0.5})`;
        ctx.beginPath(); ctx.arc(endX, endY, dotSize, 0, Math.PI * 2); ctx.fill();
      }

      const newLen = len * shrink;

      // Left branch: rotate by +θ₁ (complex multiplication)
      const cosL = Math.cos(angL), sinL = Math.sin(angL);
      const lDirX = dirX * cosL - dirY * sinL;
      const lDirY = dirX * sinL + dirY * cosL;

      // Right branch: rotate by -θ₂
      const cosR = Math.cos(angR), sinR = Math.sin(angR);
      const rDirX = dirX * cosR + dirY * sinR;
      const rDirY = -dirX * sinR + dirY * cosR;

      drawBranch(endX, endY, lDirX, lDirY, newLen, level + 1);
      drawBranch(endX, endY, rDirX, rDirY, newLen, level + 1);
    }

    const showConjugate = conjugateToggle?.checked || false;
    const treeBaseY = showConjugate ? h * 0.42 : h - 15;

    // Draw main tree
    drawBranch(w / 2, treeBaseY, 0, -1, trunkLen, 0);

    // Draw conjugate reflection (z̄ = a - bi → flip Y)
    if (showConjugate) {
      // Water/mirror line
      ctx.strokeStyle = 'rgba(92, 107, 192, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(40, treeBaseY);
      ctx.lineTo(w - 40, treeBaseY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Label
      ctx.fillStyle = '#5c6bc0';
      ctx.font = 'bold 11px Inter';
      ctx.textAlign = 'right';
      ctx.fillText('z̄ = a − bi (espejo)', w - 45, treeBaseY + 14);

      // Draw reflected tree with lower opacity
      ctx.globalAlpha = 0.4;
      drawBranch(w / 2, treeBaseY, 0, 1, trunkLen, 0);
      ctx.globalAlpha = 1;
    }

    // HUD
    ctx.fillStyle = 'rgba(10, 14, 39, 0.8)';
    ctx.fillRect(0, 0, w, 26);
    ctx.fillStyle = '#66bb6a';
    ctx.font = 'bold 12px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    const hudFormula = showConjugate ? `z̄ = a − bi  (conjugado activo)` : `z' = z + r·e^(iθ)`;
    ctx.fillText(hudFormula, 10, 17);
    ctx.fillStyle = '#9fa8da';
    ctx.font = '11px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(`θ₁=${val(angleLSlider,45)}°  θ₂=${val(angleRSlider,25)}°  |  ramas: ${branchCount.toLocaleString()}`, w - 10, 17);

    const bc = document.getElementById('treeBranchCount');
    const cs = document.getElementById('treeCanvasSize');
    if (bc) bc.textContent = `ramas: ${branchCount.toLocaleString()}`;
    if (cs) cs.textContent = `canvas: ${w}×${h}`;
  }

  render();

  if (!fractalTreeInitialized) {
    fractalTreeInitialized = true;
    [depthSlider, angleLSlider, angleRSlider, trunkSlider].forEach(s => {
      if (s) s.addEventListener('input', render);
    });

    if (conjugateToggle) conjugateToggle.addEventListener('change', render);

    if (colorRow) {
      colorRow.addEventListener('click', function(e) {
        const btn = e.target.closest('.tree-color-btn');
        if (!btn) return;
        colorRow.querySelectorAll('.tree-color-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activePalette = btn.dataset.palette;
        render();
      });
    }
  }
}

// ============================================
// CANVAS: Rotation Demo (Slide 15)
// ============================================
let rotationAnimId = null;

function drawRotation() {
  const canvas = document.getElementById('rotationCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const radius = 120;

  // Cancel any previous animation loop for this canvas
  if (rotationAnimId) cancelAnimationFrame(rotationAnimId);

  let angle = 0;

  function animate() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#111738';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(92, 107, 192, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i < w; i += 40) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(w, i); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(92, 107, 192, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

    // Circle
    ctx.strokeStyle = 'rgba(92, 107, 192, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();

    // Original point
    const origAngle = Math.atan2(2, 3);
    const origX = cx + radius * Math.cos(origAngle);
    const origY = cy - radius * Math.sin(origAngle);

    ctx.strokeStyle = 'rgba(66, 165, 245, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(origX, origY); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#42a5f5';
    ctx.beginPath(); ctx.arc(origX, origY, 5, 0, Math.PI * 2); ctx.fill();
    ctx.font = 'bold 11px Inter'; ctx.textAlign = 'left';
    ctx.fillText('P = 3+2i', origX + 8, origY - 8);

    // Rotated point
    const rotAngle = origAngle + angle;
    const rotX = cx + radius * Math.cos(rotAngle);
    const rotY = cy - radius * Math.sin(rotAngle);

    // Trail arc
    ctx.strokeStyle = 'rgba(239, 83, 80, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, -rotAngle, -origAngle);
    ctx.stroke();

    ctx.strokeStyle = '#ef5350';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(rotX, rotY); ctx.stroke();

    ctx.fillStyle = '#ef5350';
    ctx.beginPath(); ctx.arc(rotX, rotY, 6, 0, Math.PI * 2); ctx.fill();
    ctx.font = 'bold 11px Inter';
    ctx.fillText("P' = P·e^(iθ)", rotX + 10, rotY - 8);

    // Angle arc
    ctx.strokeStyle = '#66bb6a';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 30, -rotAngle, -origAngle); ctx.stroke();

    const labelAngle = origAngle + angle / 2;
    ctx.fillStyle = '#66bb6a';
    ctx.font = 'bold 12px Inter'; ctx.textAlign = 'center';
    ctx.fillText('θ', cx + 42 * Math.cos(labelAngle), cy - 42 * Math.sin(labelAngle));

    const degrees = Math.round((angle * 180) / Math.PI) % 360;
    ctx.fillStyle = '#9fa8da';
    ctx.font = '11px Inter'; ctx.textAlign = 'center';
    ctx.fillText(`θ = ${degrees}°`, cx, h - 15);

    ctx.fillStyle = '#5c6bc0';
    ctx.font = '11px Inter';
    ctx.fillText('Re', w - 15, cy - 8);
    ctx.fillText('Im', cx + 15, 15);

    angle += 0.008;
    if (currentSlide === 16) {
      rotationAnimId = requestAnimationFrame(animate);
    }
  }

  animate();
}

// ============================================
// CANVAS: FFT Wave Decomposition (Slide 11)
// ============================================
// CANVAS: Mandelbrot Progressive Build (Slide 13)
// ============================================
let buildAnimId = null;
let buildTimeoutId = null;
let mbInteractiveCleanup = null;

function drawMandelbrotBuild() {
  const canvas = document.getElementById('mandelbrotBuildCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  if (buildAnimId) cancelAnimationFrame(buildAnimId);
  if (buildTimeoutId) clearTimeout(buildTimeoutId);
  if (mbInteractiveCleanup) { mbInteractiveCleanup(); mbInteractiveCleanup = null; }

  ctx.fillStyle = '#111738';
  ctx.fillRect(0, 0, w, h);

  const infoEl = document.getElementById('buildProgress');
  const statsEl = document.getElementById('buildStats');

  // --- Color function (reused in both phases) ---
  function mandelbrotColor(x0, y0, maxIter) {
    let x = 0, y = 0, iter = 0;
    while (x * x + y * y <= 4 && iter < maxIter) {
      const xt = x * x - y * y + x0;
      y = 2 * x * y + y0;
      x = xt;
      iter++;
    }
    if (iter === maxIter) return [10, 14, 39];
    const t = iter / maxIter;
    return [
      Math.min(255, Math.floor(9 * (1 - t) * t * t * t * 255) + 40),
      Math.min(255, Math.floor(15 * (1 - t) * (1 - t) * t * t * 255) + 50),
      Math.min(255, Math.floor(8.5 * (1 - t) * (1 - t) * (1 - t) * t * 255) + 180)
    ];
  }

  // --- Render full frame at given viewport ---
  function renderFrame(centerX, centerY, zoom, maxIter) {
    const imageData = ctx.createImageData(w, h);
    const spanX = 3.5 / zoom;
    const spanY = spanX * (h / w);
    for (let py = 0; py < h; py++) {
      for (let px = 0; px < w; px++) {
        const x0 = centerX + (px / w - 0.5) * spanX;
        const y0 = centerY + (py / h - 0.5) * spanY;
        const [r, g, b] = mandelbrotColor(x0, y0, maxIter);
        const idx = (py * w + px) * 4;
        imageData.data[idx] = r;
        imageData.data[idx + 1] = g;
        imageData.data[idx + 2] = b;
        imageData.data[idx + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }

  // --- Draw zoom HUD overlay ---
  function drawHUD(centerX, centerY, zoom, maxIter) {
    const zoomLabel = zoom < 1000
      ? `x${zoom.toFixed(0)}`
      : zoom < 1000000
        ? `x${(zoom / 1000).toFixed(1)}K`
        : `x${(zoom / 1000000).toFixed(2)}M`;

    ctx.fillStyle = 'rgba(17, 23, 56, 0.75)';
    ctx.fillRect(0, 0, w, 30);
    ctx.fillStyle = '#66bb6a';
    ctx.font = 'bold 13px JetBrains Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`ZOOM: ${zoomLabel}`, 12, 20);
    ctx.fillStyle = '#9fa8da';
    ctx.font = '11px Inter';
    ctx.textAlign = 'right';
    ctx.fillText(`Iter: ${maxIter} | Centro: (${centerX.toFixed(6)}, ${centerY.toFixed(6)}i)`, w - 12, 20);
  }

  // ============================
  // PHASE 1: Progressive build
  // ============================
  let currentRow = 0;
  const rowsPerFrame = 3;
  let totalInSet = 0;
  let totalEscaped = 0;
  const buildMaxIter = 80;
  const initCx = -0.5, initCy = 0;
  const initSpanX = 3.5, initSpanY = initSpanX * (h / w);

  function renderRows() {
    if (currentSlide !== 13) return;

    for (let batch = 0; batch < rowsPerFrame && currentRow < h; batch++, currentRow++) {
      for (let px = 0; px < w; px++) {
        const x0 = initCx + (px / w - 0.5) * initSpanX;
        const y0 = initCy + (currentRow / h - 0.5) * initSpanY;
        const [r, g, b] = mandelbrotColor(x0, y0, buildMaxIter);

        if (r === 10 && g === 14 && b === 39) totalInSet++;
        else totalEscaped++;

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(px, currentRow, 1, 1);
      }
    }

    const pct = Math.round((currentRow / h) * 100);
    if (infoEl) infoEl.textContent = currentRow < h
      ? `Construyendo... ${pct}% — Fila ${currentRow} de ${h}`
      : '✓ Construcción completa — ¡Explorá con scroll y click!';
    if (statsEl) statsEl.textContent = `En el conjunto: ${totalInSet.toLocaleString()} px | Escaparon: ${totalEscaped.toLocaleString()} px`;

    if (currentRow < h) {
      ctx.strokeStyle = 'rgba(239, 83, 80, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, currentRow);
      ctx.lineTo(w, currentRow);
      ctx.stroke();
      buildAnimId = requestAnimationFrame(renderRows);
    } else {
      // Phase 1 done — enable interactive zoom
      buildTimeoutId = setTimeout(() => {
        if (currentSlide === 13) enableInteractiveZoom();
      }, 800);
    }
  }

  // ============================
  // PHASE 2: Interactive zoom
  // ============================
  function enableInteractiveZoom() {
    let zoomCx = initCx;
    let zoomCy = initCy;
    let zoomLevel = 1;

    function getDynamicIter() {
      return Math.min(500, Math.floor(80 + Math.log2(Math.max(1, zoomLevel)) * 25));
    }

    function redraw() {
      const iter = getDynamicIter();
      renderFrame(zoomCx, zoomCy, zoomLevel, iter);
      drawHUD(zoomCx, zoomCy, zoomLevel, iter);

      const zoomLabel = zoomLevel < 1000
        ? `x${zoomLevel.toFixed(0)}`
        : zoomLevel < 1000000
          ? `x${(zoomLevel / 1000).toFixed(1)}K`
          : `x${(zoomLevel / 1000000).toFixed(2)}M`;

      if (infoEl) infoEl.textContent = `Zoom ${zoomLabel} — Scroll para zoom, click para centrar`;
      if (statsEl) statsEl.textContent = `Click derecho para resetear | Auto-similitud infinita`;
    }

    // Convert pixel position to complex coordinates
    function pixelToComplex(px, py) {
      const spanX = 3.5 / zoomLevel;
      const spanY = spanX * (h / w);
      return {
        re: zoomCx + (px / w - 0.5) * spanX,
        im: zoomCy + (py / h - 0.5) * spanY
      };
    }

    // Wheel zoom — zoom towards mouse position
    function onWheel(e) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (w / rect.width);
      const my = (e.clientY - rect.top) * (h / rect.height);

      const before = pixelToComplex(mx, my);
      const factor = e.deltaY < 0 ? 1.3 : 1 / 1.3;
      zoomLevel = Math.max(1, zoomLevel * factor);

      // Adjust center so the point under the mouse stays in place
      const spanXAfter = 3.5 / zoomLevel;
      const spanYAfter = spanXAfter * (h / w);
      zoomCx = before.re - (mx / w - 0.5) * spanXAfter;
      zoomCy = before.im - (my / h - 0.5) * spanYAfter;

      redraw();
    }

    // Click — center on that point and zoom in
    function onClick(e) {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (w / rect.width);
      const my = (e.clientY - rect.top) * (h / rect.height);

      const target = pixelToComplex(mx, my);
      zoomCx = target.re;
      zoomCy = target.im;
      zoomLevel *= 2.5;

      redraw();
    }

    // Right click — reset
    function onContextMenu(e) {
      e.preventDefault();
      zoomCx = initCx;
      zoomCy = initCy;
      zoomLevel = 1;
      redraw();
    }

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('click', onClick);
    canvas.addEventListener('contextmenu', onContextMenu);

    // Cleanup function for when we leave the slide or re-init
    mbInteractiveCleanup = function() {
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('click', onClick);
      canvas.removeEventListener('contextmenu', onContextMenu);
    };

    // Initial render with HUD
    redraw();
  }

  // Start phase 1
  buildAnimId = requestAnimationFrame(renderRows);
}

// ============================================
// CANVAS: FFT Wave (Slide 11 — unchanged index)
// ============================================
let fftAnimId = null;

function drawFFTWave() {
  const canvas = document.getElementById('fftWaveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  if (fftAnimId) cancelAnimationFrame(fftAnimId);

  let t = 0;

  function animate() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#111738';
    ctx.fillRect(0, 0, w, h);

    const waveArea = w * 0.72;
    const specArea = w - waveArea;
    const midY = h / 2;
    const amp = 22;

    // Frequencies config: freq, amplitude, color, label
    const waves = [
      { f: 1, a: 1.0, color: '#42a5f5', label: 'f=1' },
      { f: 3, a: 0.6, color: '#66bb6a', label: 'f=3' },
      { f: 5, a: 0.35, color: '#ab47bc', label: 'f=5' },
    ];

    // Draw grid lines
    ctx.strokeStyle = 'rgba(92, 107, 192, 0.08)';
    ctx.lineWidth = 1;
    for (let gy = 0; gy < h; gy += 40) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(waveArea, gy); ctx.stroke();
    }

    // Draw zero line
    ctx.strokeStyle = 'rgba(92, 107, 192, 0.2)';
    ctx.lineWidth = 1;

    // Individual waves (top half, stacked)
    const waveH = h * 0.18;
    const waveSpacing = [h * 0.15, h * 0.33, h * 0.51];

    waves.forEach((wave, idx) => {
      const cy = waveSpacing[idx];
      // Zero line for this wave
      ctx.strokeStyle = 'rgba(92, 107, 192, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(10, cy); ctx.lineTo(waveArea - 10, cy); ctx.stroke();

      // Wave
      ctx.strokeStyle = wave.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      for (let x = 10; x < waveArea - 10; x++) {
        const phase = ((x - 10) / (waveArea - 20)) * Math.PI * 6 - t * wave.f * 0.5;
        const y = cy + Math.sin(phase * wave.f) * wave.a * amp;
        if (x === 10) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Label
      ctx.fillStyle = wave.color;
      ctx.font = 'bold 10px Inter';
      ctx.textAlign = 'left';
      ctx.fillText(wave.label, 12, cy - waveH * 0.7);
    });

    // Combined wave (bottom area)
    const sumY = h * 0.78;
    ctx.strokeStyle = 'rgba(92, 107, 192, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(10, sumY); ctx.lineTo(waveArea - 10, sumY); ctx.stroke();

    ctx.strokeStyle = '#ef5350';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = 10; x < waveArea - 10; x++) {
      let ySum = 0;
      waves.forEach(wave => {
        const phase = ((x - 10) / (waveArea - 20)) * Math.PI * 6 - t * wave.f * 0.5;
        ySum += Math.sin(phase * wave.f) * wave.a * amp;
      });
      const y = sumY + ySum;
      if (x === 10) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Sum label
    ctx.fillStyle = '#ef5350';
    ctx.font = 'bold 10px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('Suma', 12, sumY - amp * 1.5);

    // Separator line
    ctx.strokeStyle = 'rgba(92, 107, 192, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(waveArea, 0); ctx.lineTo(waveArea, h); ctx.stroke();
    ctx.setLineDash([]);

    // Spectrum bars on the right
    const barW = 22;
    const barGap = 14;
    const specCx = waveArea + specArea / 2;
    const barBaseY = h * 0.85;
    const maxBarH = h * 0.65;

    ctx.fillStyle = '#9fa8da';
    ctx.font = 'bold 10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Espectro', specCx, 16);

    waves.forEach((wave, idx) => {
      const x = specCx + (idx - 1) * (barW + barGap) - barW / 2;
      // Animated height with subtle pulse
      const pulse = 0.9 + 0.1 * Math.sin(t * 2 + idx);
      const barH = (wave.a * maxBarH * pulse);

      // Bar gradient
      const grad = ctx.createLinearGradient(x, barBaseY, x, barBaseY - barH);
      grad.addColorStop(0, wave.color);
      grad.addColorStop(1, wave.color + '66');
      ctx.fillStyle = grad;
      ctx.fillRect(x, barBaseY - barH, barW, barH);

      // Bar border
      ctx.strokeStyle = wave.color;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, barBaseY - barH, barW, barH);

      // Frequency label
      ctx.fillStyle = wave.color;
      ctx.font = '9px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(wave.label, x + barW / 2, barBaseY + 14);
    });

    // FFT arrow label
    ctx.fillStyle = '#7c8cf0';
    ctx.font = 'bold 9px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('← FFT →', waveArea, h - 6);

    t += 0.03;
    if (currentSlide === 11) {
      fftAnimId = requestAnimationFrame(animate);
    }
  }

  animate();
}

// ============================================
// CANVAS: Encryption Visualization (Slide 13)
// ============================================
let cryptoAnimId = null;

function drawCryptoDemo() {
  const canvas = document.getElementById('cryptoCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const cx = w / 2;
  const cy = h / 2;
  const scale = 45;

  if (cryptoAnimId) cancelAnimationFrame(cryptoAnimId);

  // Original data points (complex numbers)
  const dataPoints = [
    { re: 1.5, im: 2 },
    { re: -1, im: 1.5 },
    { re: 2, im: -1 },
    { re: -2, im: -1.5 },
    { re: 0.5, im: -2.5 },
    { re: -1.5, im: 0.5 },
  ];

  let keyAngle = 0;
  let encrypted = false;
  let blendFactor = 0; // 0 = original, 1 = encrypted
  let lastToggle = performance.now();

  function animate() {
    const now = performance.now();

    // Toggle every 3 seconds
    if (now - lastToggle > 3000) {
      encrypted = !encrypted;
      lastToggle = now;
    }

    // Smooth blend
    const targetBlend = encrypted ? 1 : 0;
    blendFactor += (targetBlend - blendFactor) * 0.04;

    keyAngle += 0.012;
    const keyR = 1.3;
    const keyRe = keyR * Math.cos(keyAngle);
    const keyIm = keyR * Math.sin(keyAngle);

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#111738';
    ctx.fillRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(92, 107, 192, 0.08)';
    ctx.lineWidth = 1;
    for (let i = -5; i <= 5; i++) {
      ctx.beginPath(); ctx.moveTo(cx + i * scale, 0); ctx.lineTo(cx + i * scale, h); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, cy + i * scale); ctx.lineTo(w, cy + i * scale); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(92, 107, 192, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

    ctx.fillStyle = '#9fa8da';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Re', w - 14, cy - 8);
    ctx.fillText('Im', cx + 14, 14);

    // Draw key vector
    const keyPx = cx + keyRe * scale * 1.5;
    const keyPy = cy - keyIm * scale * 1.5;
    ctx.strokeStyle = '#fdd835';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(keyPx, keyPy); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#fdd835';
    ctx.beginPath(); ctx.arc(keyPx, keyPy, 5, 0, Math.PI * 2); ctx.fill();
    ctx.font = 'bold 10px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('Clave z', keyPx + 8, keyPy - 6);

    // Draw data points with blend between original and encrypted positions
    dataPoints.forEach((p, idx) => {
      // Encrypted position: multiply by key (complex multiplication)
      const encRe = p.re * keyRe - p.im * keyIm;
      const encIm = p.re * keyIm + p.im * keyRe;

      const drawRe = p.re + (encRe - p.re) * blendFactor;
      const drawIm = p.im + (encIm - p.im) * blendFactor;

      const px = cx + drawRe * scale;
      const py = cy - drawIm * scale;

      // Trail line from origin to encrypted
      if (blendFactor > 0.1) {
        const origPx = cx + p.re * scale;
        const origPy = cy - p.im * scale;
        ctx.strokeStyle = 'rgba(239, 83, 80, 0.15)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(origPx, origPy); ctx.lineTo(px, py); ctx.stroke();
        ctx.setLineDash([]);
      }

      // Color blend: blue (original) → red (encrypted)
      const r = Math.round(66 + (239 - 66) * blendFactor);
      const g = Math.round(165 + (83 - 165) * blendFactor);
      const b = Math.round(245 + (80 - 245) * blendFactor);
      const color = `rgb(${r}, ${g}, ${b})`;

      ctx.fillStyle = color;
      ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();

      // Glow
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });

    // State label
    const stateText = blendFactor > 0.5 ? 'Datos encriptados' : 'Datos originales';
    const stateColor = blendFactor > 0.5 ? '#ef5350' : '#42a5f5';
    ctx.fillStyle = stateColor;
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(stateText, cx, 20);

    // Equation
    ctx.fillStyle = '#9fa8da';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('P\' = P · z(clave) → rotar + escalar', cx, h - 10);

    if (currentSlide === 14) {
      cryptoAnimId = requestAnimationFrame(animate);
    }
  }

  animate();
}

// ============================================
// CANVAS: QAM Signal Constellation (Slide 17)
// ============================================
let qamAnimId = null;

function drawQAMDemo() {
  const canvas = document.getElementById('qamCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  if (qamAnimId) cancelAnimationFrame(qamAnimId);

  // QAM-16: 4x4 grid
  const constArea = w * 0.5;
  const waveArea = w - constArea;
  const constCx = constArea / 2;
  const constCy = h / 2;
  const spacing = 32;

  // Generate 16 points
  const points = [];
  const binaryLabels = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const i = (col - 1.5) * spacing;
      const q = (1.5 - row) * spacing;
      points.push({ i, q, row, col });
      binaryLabels.push(((row * 4 + col)).toString(2).padStart(4, '0'));
    }
  }

  let activeIdx = 0;
  let frameCount = 0;
  let signalHistory = [];
  const maxHistory = 180;

  function animate() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#111738';
    ctx.fillRect(0, 0, w, h);

    // --- Constellation area ---
    // Grid
    ctx.strokeStyle = 'rgba(92, 107, 192, 0.08)';
    ctx.lineWidth = 1;
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath(); ctx.moveTo(constCx + i * spacing, 10); ctx.lineTo(constCx + i * spacing, h - 10); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(10, constCy + i * spacing); ctx.lineTo(constArea - 10, constCy + i * spacing); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(92, 107, 192, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(10, constCy); ctx.lineTo(constArea - 10, constCy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(constCx, 10); ctx.lineTo(constCx, h - 10); ctx.stroke();

    ctx.fillStyle = '#9fa8da';
    ctx.font = '9px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('I (Real)', constArea - 25, constCy - 6);
    ctx.fillText('Q (Imag)', constCx + 24, 16);

    // Advance active point every 40 frames
    if (frameCount % 40 === 0) {
      activeIdx = (activeIdx + 1) % 16;
    }

    // Draw points
    points.forEach((p, idx) => {
      const px = constCx + p.i;
      const py = constCy - p.q;
      const isActive = idx === activeIdx;

      if (isActive) {
        // Glow ring
        ctx.strokeStyle = '#ef5350';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(px, py, 12, 0, Math.PI * 2); ctx.stroke();

        // Pulse ring
        const pulse = 12 + 4 * Math.sin(frameCount * 0.15);
        ctx.strokeStyle = 'rgba(239, 83, 80, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(px, py, pulse, 0, Math.PI * 2); ctx.stroke();

        ctx.fillStyle = '#ef5350';
        ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();

        // Binary label for active
        ctx.fillStyle = '#ef5350';
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(binaryLabels[idx], px, py - 16);
      } else {
        ctx.fillStyle = '#5c6bc0';
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();

        // Dim binary labels
        ctx.fillStyle = 'rgba(92, 107, 192, 0.4)';
        ctx.font = '7px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(binaryLabels[idx], px, py - 9);
      }
    });

    // Title for constellation
    ctx.fillStyle = '#7c8cf0';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('QAM-16 Constelación', constCx, h - 6);

    // --- Separator ---
    ctx.strokeStyle = 'rgba(92, 107, 192, 0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(constArea, 0); ctx.lineTo(constArea, h); ctx.stroke();
    ctx.setLineDash([]);

    // --- Wave area ---
    const activePoint = points[activeIdx];
    const amplitude = Math.sqrt(activePoint.i * activePoint.i + activePoint.q * activePoint.q) / (spacing * 1.5);
    const phase = Math.atan2(activePoint.q, activePoint.i);

    // Add to signal history
    signalHistory.push({ amp: amplitude, phase: phase });
    if (signalHistory.length > maxHistory) signalHistory.shift();

    const waveStartX = constArea + 20;
    const waveEndX = w - 10;
    const waveMidY = h * 0.45;
    const waveAmp = 60;

    // Wave title
    ctx.fillStyle = '#9fa8da';
    ctx.font = 'bold 10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Señal transmitida', (waveStartX + waveEndX) / 2, 18);

    // Zero line
    ctx.strokeStyle = 'rgba(92, 107, 192, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(waveStartX, waveMidY); ctx.lineTo(waveEndX, waveMidY); ctx.stroke();

    // Draw wave trace
    ctx.strokeStyle = '#42a5f5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const waveLen = waveEndX - waveStartX;
    for (let x = 0; x < waveLen; x++) {
      const histIdx = Math.floor((x / waveLen) * signalHistory.length);
      if (histIdx >= signalHistory.length) break;
      const s = signalHistory[histIdx];
      const y = waveMidY - Math.sin(x * 0.08 + s.phase) * s.amp * waveAmp;
      if (x === 0) ctx.moveTo(waveStartX + x, y);
      else ctx.lineTo(waveStartX + x, y);
    }
    ctx.stroke();

    // Info box
    const infoY = h * 0.78;
    ctx.fillStyle = 'rgba(92, 107, 192, 0.08)';
    ctx.fillRect(waveStartX, infoY, waveEndX - waveStartX, h - infoY - 6);

    ctx.fillStyle = '#9fa8da';
    ctx.font = '10px Inter';
    ctx.textAlign = 'left';
    ctx.fillText(`Símbolo: ${binaryLabels[activeIdx]}`, waveStartX + 8, infoY + 16);
    ctx.fillText(`Amplitud: ${amplitude.toFixed(2)}`, waveStartX + 8, infoY + 30);
    ctx.fillText(`Fase: ${(phase * 180 / Math.PI).toFixed(0)}°`, waveStartX + 8, infoY + 44);

    frameCount++;
    if (currentSlide === 19) {
      qamAnimId = requestAnimationFrame(animate);
    }
  }

  animate();
}

// ============================================
// CANVAS: Control System Damped Oscillation (Slide 18)
// ============================================
let controlAnimId = null;

function drawControlDemo() {
  const canvas = document.getElementById('controlCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  if (controlAnimId) cancelAnimationFrame(controlAnimId);

  let t = 0;
  const duration = 5; // seconds equivalent
  const sigma = -0.5; // damping factor
  const omega = 4; // oscillation frequency
  const setpoint = 1.0;
  let trail = [];

  function dampedResponse(time) {
    if (time < 0) return 0;
    return setpoint * (1 - Math.exp(sigma * time) * (Math.cos(omega * time) - (sigma / omega) * Math.sin(omega * time)));
  }

  function animate() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#111738';
    ctx.fillRect(0, 0, w, h);

    const plotLeft = 50;
    const plotRight = w - 20;
    const plotTop = 40;
    const plotBottom = h - 50;
    const plotW = plotRight - plotLeft;
    const plotH = plotBottom - plotTop;

    // Grid
    ctx.strokeStyle = 'rgba(92, 107, 192, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const x = plotLeft + (plotW / 5) * i;
      ctx.beginPath(); ctx.moveTo(x, plotTop); ctx.lineTo(x, plotBottom); ctx.stroke();
    }
    for (let i = 0; i <= 4; i++) {
      const y = plotTop + (plotH / 4) * i;
      ctx.beginPath(); ctx.moveTo(plotLeft, y); ctx.lineTo(plotRight, y); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = 'rgba(92, 107, 192, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(plotLeft, plotBottom); ctx.lineTo(plotRight, plotBottom); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(plotLeft, plotTop); ctx.lineTo(plotLeft, plotBottom); ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#9fa8da';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Tiempo (t)', (plotLeft + plotRight) / 2, h - 8);
    ctx.save();
    ctx.translate(14, (plotTop + plotBottom) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Respuesta', 0, 0);
    ctx.restore();

    // Y-axis scale
    ctx.fillStyle = '#5c6bc0';
    ctx.font = '9px Inter';
    ctx.textAlign = 'right';
    const yLabels = [0, 0.5, 1.0, 1.5];
    yLabels.forEach(val => {
      const y = plotBottom - (val / 1.5) * plotH;
      ctx.fillText(val.toFixed(1), plotLeft - 6, y + 3);
    });

    // Setpoint (dashed horizontal line)
    const spY = plotBottom - (setpoint / 1.5) * plotH;
    ctx.strokeStyle = '#fdd835';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([8, 5]);
    ctx.beginPath(); ctx.moveTo(plotLeft, spY); ctx.lineTo(plotRight, spY); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#fdd835';
    ctx.font = 'bold 10px Inter';
    ctx.textAlign = 'left';
    ctx.fillText('Setpoint', plotRight - 50, spY - 8);

    // Compute current trail point
    const currentVal = dampedResponse(t);
    const px = plotLeft + (t / duration) * plotW;
    const py = plotBottom - (currentVal / 1.5) * plotH;
    trail.push({ x: px, y: py });

    // Draw oscillation curve (trail)
    if (trail.length > 1) {
      ctx.strokeStyle = '#42a5f5';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(trail[i].x, trail[i].y);
      }
      ctx.stroke();
    }

    // Animated circle (drone/object)
    const objX = Math.min(px, plotRight);
    const objY = plotBottom - (dampedResponse(Math.min(t, duration)) / 1.5) * plotH;

    // Object glow
    ctx.fillStyle = 'rgba(239, 83, 80, 0.2)';
    ctx.beginPath(); ctx.arc(objX, objY, 12, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#ef5350';
    ctx.beginPath(); ctx.arc(objX, objY, 6, 0, Math.PI * 2); ctx.fill();

    // Drone icon (simple)
    ctx.strokeStyle = '#ef5350';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(objX - 10, objY - 2); ctx.lineTo(objX + 10, objY - 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(objX - 8, objY - 6); ctx.lineTo(objX - 4, objY - 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(objX + 8, objY - 6); ctx.lineTo(objX + 4, objY - 2); ctx.stroke();

    // Equation label
    ctx.fillStyle = '#7c8cf0';
    ctx.font = 'bold 11px Inter';
    ctx.textAlign = 'center';
    ctx.fillText('Polos complejos: σ ± ωi → oscilación amortiguada', (plotLeft + plotRight) / 2, 22);

    // Damping envelope (optional visual)
    ctx.strokeStyle = 'rgba(102, 187, 106, 0.25)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    // Upper envelope
    ctx.beginPath();
    for (let tt = 0; tt <= Math.min(t, duration); tt += 0.05) {
      const ex = plotLeft + (tt / duration) * plotW;
      const envVal = setpoint + Math.exp(sigma * tt) * 0.5;
      const ey = plotBottom - (envVal / 1.5) * plotH;
      if (tt === 0) ctx.moveTo(ex, ey);
      else ctx.lineTo(ex, ey);
    }
    ctx.stroke();
    // Lower envelope
    ctx.beginPath();
    for (let tt = 0; tt <= Math.min(t, duration); tt += 0.05) {
      const ex = plotLeft + (tt / duration) * plotW;
      const envVal = setpoint - Math.exp(sigma * tt) * 0.5;
      const ey = plotBottom - (envVal / 1.5) * plotH;
      if (tt === 0) ctx.moveTo(ex, ey);
      else ctx.lineTo(ex, ey);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    t += 0.025;

    // Reset after ~duration seconds of animation
    if (t > duration + 0.5) {
      t = 0;
      trail = [];
    }

    if (currentSlide === 20) {
      controlAnimId = requestAnimationFrame(animate);
    }
  }

  animate();
}

// ============================================
// COVER PARTICLES
// ============================================
function createParticles() {
  const container = document.getElementById('coverParticles');
  if (!container) return;

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    const dx1 = Math.random() * 40 - 20;
    const dy1 = Math.random() * 40 - 20;
    const dx2 = Math.random() * 60 - 30;
    const dy2 = Math.random() * 60 - 30;
    const dx3 = Math.random() * 40 - 20;
    const dy3 = Math.random() * 40 - 20;
    particle.style.cssText = `
      position: absolute;
      width: ${Math.random() * 4 + 2}px;
      height: ${Math.random() * 4 + 2}px;
      background: rgba(92, 107, 192, ${Math.random() * 0.3 + 0.1});
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: float-${i} ${Math.random() * 6 + 4}s ease-in-out infinite;
      animation-delay: ${Math.random() * 4}s;
    `;
    container.appendChild(particle);

    const style = document.createElement('style');
    style.textContent = `
      @keyframes float-${i} {
        0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.5; }
        25% { transform: translate(${dx1}px, ${dy1}px) scale(1.2); opacity: 0.8; }
        50% { transform: translate(${dx2}px, ${dy2}px) scale(0.8); opacity: 0.4; }
        75% { transform: translate(${dx3}px, ${dy3}px) scale(1.1); opacity: 0.7; }
      }
    `;
    document.head.appendChild(style);
  }
}

// ============================================
// INIT
// ============================================
function init() {
  buildMenu();
  updateUI();
  revealItems();
  createParticles();
}

window.goToSlide = goToSlide;
window.onPlaneInputChange = onPlaneInputChange;

init();
