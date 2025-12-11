// === GF MAPS — Versión con selección, hover y triángulo ===

const IMAGE_URL = '../img_gfmaps/Mapa de Gran Fortuna.png';
const MARKER_URL = '../img_gfmaps/icon_marker.png';
const TRIANGLE_URL = '../img_gfmaps/triangulo.gif';

// límites y zoom
const MIN_SCALE = 0.1;
const MAX_SCALE = 8;
const ZOOM_STEP = 1.1;

// elementos
const viewport = document.getElementById('viewport');
const img = document.getElementById('baseImg');
const canvas = document.getElementById('layer');
const ctx = canvas.getContext('2d');

// estado
let scale = 0.14;
let translateX = 0;
let translateY = 0;
let isPanning = false;
let lastX = 0, lastY = 0;

// marcadores guardados
let markers = [];
let selectedMarkerIndex = null;
let triangleIndicator = null;

// DPI
const dpr = Math.max(1, window.devicePixelRatio || 1);

// === Cargar imagen de mapa ===
img.onload = () => {
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  img.width = w;
  img.height = h;

  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  centerMap(w, h);
  loadMarkers();
  redrawMarkers();
};
img.src = IMAGE_URL;

// === Centrar mapa al inicio ===
function centerMap(w, h) {
  const rect = document.body.getBoundingClientRect();
  translateX = (rect.width - w * scale) / 2;
  translateY = (rect.height - h * scale) / 2;
  applyTransform();
}

// === Aplicar transformaciones ===
function applyTransform() {
  viewport.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

// === Convertir pantalla → mundo ===
function screenToWorld(x, y) {
  return {
    x: (x - translateX) / scale,
    y: (y - translateY) / scale
  };
}

// === Mouse Down ===
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

// === Mouse Move ===
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

// === Mouse Up ===
window.addEventListener('mouseup', () => {
  isPanning = false;
});

// === Zoom ===
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

// === Crear marcador ===
function createMarker(x, y) {
  markers.push({ x, y });
  saveMarkers();
  redrawMarkers();
}

// === Seleccionar marcador ===
function selectMarker(index) {
  selectedMarkerIndex = index;

  if (!triangleIndicator) {
    triangleIndicator = document.createElement('img');
    triangleIndicator.src = TRIANGLE_URL;
    triangleIndicator.className = 'selected-indicator';
    viewport.appendChild(triangleIndicator);
  }

  const m = markers[index];
  const screenX = m.x;
  const screenY = m.y;

  triangleIndicator.style.left = screenX + 'px';
  triangleIndicator.style.top = (screenY - 30) + 'px';

  openMarkerEditor(index);
}

// === Abrir editor (por ahora solo placeholder) ===
function openMarkerEditor(index) {
  console.log("Abrir modal del marcador:", index);
}

// === Redibujar marcadores ===
function redrawMarkers() {
  // eliminar marcadores anteriores
  viewport.querySelectorAll('.marker').forEach(m => m.remove());

  // dibujar nuevos
  markers.forEach((m, index) => {
    const marker = document.createElement('img');
    marker.src = MARKER_URL;
    marker.className = 'marker';

    marker.style.left = m.x + 'px';
    marker.style.top = m.y + 'px';

    // click izquierdo en marcador
    marker.onclick = (e) => {
      e.stopPropagation();
      selectMarker(index);
    };

    viewport.appendChild(marker);
  });

  // reposicionar triángulo si existe
  if (triangleIndicator && selectedMarkerIndex !== null) {
    const m = markers[selectedMarkerIndex];
    triangleIndicator.style.left = m.x + 'px';
    triangleIndicator.style.top = (m.y - 30) + 'px';
  }
}

// === Guardar ===
function saveMarkers() {
  localStorage.setItem('gfmaps_markers', JSON.stringify(markers));
}

// === Cargar ===
function loadMarkers() {
  const data = localStorage.getItem('gfmaps_markers');
  if (data) markers = JSON.parse(data);
}

// === Borrar todos los marcadores ===
function clearAllMarkers() {
  markers = [];
  localStorage.removeItem('gfmaps_markers');

  if (triangleIndicator) {
    triangleIndicator.remove();
    triangleIndicator = null;
    selectedMarkerIndex = null;
  }

  redrawMarkers();
}

// bloquear menú del click derecho
window.addEventListener('contextmenu', e => e.preventDefault());
