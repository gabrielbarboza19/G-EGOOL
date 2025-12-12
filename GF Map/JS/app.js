// === GF MAPS — Versión completa con selección + modal + imágenes + estrellas ===

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

// === Modal ===
const modal = document.getElementById("markerModal");
const modalContent = document.querySelector("#markerModal .modal-content");

const inputTitle = document.getElementById("markerTitle");
const inputDesc = document.getElementById("markerDescription");
const inputImages = document.getElementById("markerImages");
const preview = document.getElementById("imagePreview");
const starBox = document.getElementById("starRating");

let tempMarker = null;
let selectedStars = 0;

// estado
let scale = 0.13;
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

  centerMap(w, h);
  loadMarkers();
  redrawMarkers();
};
img.src = IMAGE_URL;

// === Centrar mapa al inicio ===
function centerMap(w, h) {
  const rect = document.body.getBoundingClientRect();
  translateX = 150; // <-- mapa más a la izquierda
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

// === Scroll suave del mapa ===
function smoothPan(dx, duration = 300) {
  const startX = translateX;
  const targetX = translateX + dx;
  const startTime = performance.now();

  function animate(time) {
    const progress = Math.min((time - startTime) / duration, 1);
    const eased = progress < 0.5
      ? 2 * progress * progress
      : -1 + (4 - 2 * progress) * progress;

    translateX = startX + (targetX - startX) * eased;
    applyTransform();
    redrawMarkers();

    if (progress < 1) requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
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
  const marker = {
    x,
    y,
    title: "",
    description: "",
    stars: 0,
    images: []
  };

  markers.push(marker);
  saveMarkers();
  redrawMarkers();

  openMarkerModal(marker);
}

// === Seleccionar marcador ===
function selectMarker(index) {

  // ➤ Si hago click en el marcador ya seleccionado: deseleccionar
  if (selectedMarkerIndex === index) {
    selectedMarkerIndex = null;

    if (triangleIndicator) {
      triangleIndicator.remove();
      triangleIndicator = null;
    }

    modal.classList.add("hidden");
    return;
  }

  // ➤ Seleccionar nuevo marcador
  selectedMarkerIndex = index;

  if (!triangleIndicator) {
    triangleIndicator = document.createElement('img');
    triangleIndicator.src = TRIANGLE_URL;
    triangleIndicator.className = 'selected-indicator';
    viewport.appendChild(triangleIndicator);
  }

  const m = markers[index];
  triangleIndicator.style.left = m.x + 'px';
  triangleIndicator.style.top = (m.y - 30) + 'px';

  // === MOVER MAPA SUAVEMENTE 200px A LA DERECHA ===
  smoothPan(200);

  openMarkerModal(m);
}

// === Modal ===
function openMarkerModal(marker) {
  tempMarker = marker;

  inputTitle.value = marker.title || "";
  inputDesc.value = marker.description || "";
  selectedStars = marker.stars || 0;

  paintStars();

  inputImages.value = "";
  preview.innerHTML = "";

  if (marker.images && marker.images.length > 0) {
    marker.images.forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      preview.appendChild(img);
    });
  }

  modal.classList.remove("hidden");
}

// === Cerrar modal manual ===
document.getElementById("cancelMarker").onclick = () => {
  modal.classList.add("hidden");
};

// === Cerrar modal haciendo click fuera ===
window.addEventListener("click", (e) => {
  if (!modal.classList.contains("hidden")) {
    if (!modalContent.contains(e.target)) {
      modal.classList.add("hidden");
    }
  }
});

// === Guardar datos del marcador ===
document.getElementById("saveMarker").onclick = () => {
  if (!tempMarker) return;

  tempMarker.title = inputTitle.value.trim();
  tempMarker.description = inputDesc.value.trim();
  tempMarker.stars = selectedStars;

  const newImages = [...inputImages.files].map(file =>
    URL.createObjectURL(file)
  );

  tempMarker.images = [...tempMarker.images, ...newImages];

  saveMarkers();
  redrawMarkers();

  modal.classList.add("hidden");
};

// === Previsualizar imágenes ===
inputImages.addEventListener("change", () => {
  preview.innerHTML = "";
  [...inputImages.files].forEach(file => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);
  });
});

// === Estrellas ===
starBox.addEventListener("mousemove", e => {
  const rect = starBox.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const starIndex = Math.ceil((x / rect.width) * 5);
  paintStars(starIndex);
});

starBox.addEventListener("mouseleave", () => paintStars());

starBox.addEventListener("click", e => {
  const rect = starBox.getBoundingClientRect();
  const x = e.clientX - rect.left;
  selectedStars = Math.ceil((x / rect.width) * 5);
  paintStars();
});

function paintStars(hover = 0) {
  const count = hover || selectedStars;
  starBox.textContent = "★★★★★".slice(0, count) + "☆☆☆☆☆".slice(count);
}

// === Redibujar marcadores ===
function redrawMarkers() {
  viewport.querySelectorAll('.marker').forEach(m => m.remove());

  markers.forEach((m, index) => {
    const marker = document.createElement('img');
    marker.src = MARKER_URL;
    marker.className = 'marker';

    marker.style.left = m.x + 'px';
    marker.style.top = m.y + 'px';

    marker.onclick = (e) => {
        e.stopPropagation();
        selectMarker(index);
    };

    viewport.appendChild(marker);
  });

  if (triangleIndicator && selectedMarkerIndex !== null) {
    const m = markers[selectedMarkerIndex];
    triangleIndicator.style.left = m.x + 'px';
    triangleIndicator.style.top = (m.y - 30) + 'px';
  }
}

// === Guardar todos los marcadores ===
function saveMarkers() {
  localStorage.setItem('gfmaps_markers', JSON.stringify(markers));
}

// === Cargar todos los marcadores ===
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

// === Desactivar zoom dentro del panel lateral ===
const sidePanel = document.getElementById("side-panel");

if (sidePanel) {
  sidePanel.addEventListener("wheel", (e) => {
    e.stopPropagation();   // evita que el scroll llegue al zoom del mapa
  }, { passive: false });
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

window.addEventListener('contextmenu', e => e.preventDefault());