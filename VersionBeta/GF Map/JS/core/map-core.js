// === URLs de recursos ===
window.IMAGE_URL = '../img_gfmaps/Mapa de Gran Fortuna.png';
window.MARKER_URL = '../img_gfmaps/icon_marker.png';
window.TRIANGLE_URL = '../img_gfmaps/triangulo.gif';

// === elementos ===
window.viewport = document.getElementById('viewport');
window.img = document.getElementById('baseImg');
window.canvas = document.getElementById('layer');
window.ctx = canvas.getContext('2d');

// === estado de transformaciones ===
window.scale = 0.135;
window.MIN_SCALE = 0.1;
window.MAX_SCALE = 8;
window.ZOOM_STEP = 1.1;

window.translateX = 0;
window.translateY = 0;

let isPanning = false;
let lastX = 0, lastY = 0;

// === DPI ===
window.dpr = Math.max(1, window.devicePixelRatio || 1);

// === CENTRAR MAPA ===
window.centerMap = function (w, h) {
  const rect = document.body.getBoundingClientRect();
  translateX = 150;
  translateY = (rect.height - h * scale) / 2;
  applyTransform();
};

// === APLICAR TRANSFORMACIONES ===
window.applyTransform = function () {
  viewport.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
};

// === SCREEN → WORLD ===
window.screenToWorld = function (x, y) {
  return {
    x: (x - translateX) / scale,
    y: (y - translateY) / scale
  };
};

// === ZOOM CON RUEDA ===
window.addEventListener('wheel', e => {
  e.preventDefault();

  const mouseX = e.clientX;
  const mouseY = e.clientY;
  const worldBefore = screenToWorld(mouseX, mouseY);

  const factor = e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP;
  const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor));
  if (newScale === scale) return;

  scale = newScale;

  translateX = mouseX - worldBefore.x * scale;
  translateY = mouseY - worldBefore.y * scale;

  applyTransform();
  redrawMarkers();
});

// === SCROLL SUAVE ===
window.smoothPan = function (dx, duration = 300) {
  const startX = translateX;
  const targetX = translateX + dx;
  const startTime = performance.now();

  function animate(time) {
    const progress = Math.min((time - startTime) / duration, 1);
    const eased =
      progress < 0.5
        ? 2 * progress * progress
        : -1 + (4 - 2 * progress) * progress;

    translateX = startX + (targetX - startX) * eased;
    applyTransform();
    redrawMarkers();

    if (progress < 1) requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
};

// === MOUSE DOWN ===
window.addEventListener('mousedown', e => {
  if (e.button === 0) {
    isPanning = true;
    lastX = e.clientX;
    lastY = e.clientY;
  }

  if (e.button === 2) {
    const world = screenToWorld(e.clientX, e.clientY);
    createMarker(world.x, world.y);
  }
});

// === MOUSE MOVE ===
window.addEventListener('mousemove', e => {
  if (!isPanning) return;

  const dx = e.clientX - lastX;
  const dy = e.clientY - lastY;

  translateX += dx;
  translateY += dy;

  applyTransform();
  redrawMarkers();

  lastX = e.clientX;
  lastY = e.clientY;
});

// === MOUSE UP ===
window.addEventListener('mouseup', () => {
  isPanning = false;
});

// === PREVENIR CLICK DERECHO ===
window.addEventListener('contextmenu', e => e.preventDefault());