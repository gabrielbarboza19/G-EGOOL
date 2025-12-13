// === Datos de marcadores ===
window.markers = [];
window.selectedMarkerIndex = null;
window.triangleIndicator = null;

// === GUARDAR ===
window.saveMarkers = function () {
  localStorage.setItem('gfmaps_markers', JSON.stringify(markers));
};

// === CARGAR ===
window.loadMarkers = function () {
  const data = localStorage.getItem('gfmaps_markers');
  if (data) markers = JSON.parse(data);
};

// === BORRAR ===
window.clearAllMarkers = function () {
  markers = [];
  localStorage.removeItem('gfmaps_markers');

  if (triangleIndicator) {
    triangleIndicator.remove();
    triangleIndicator = null;
  }

  selectedMarkerIndex = null;
  redrawMarkers();
};

// === CREAR MARCADOR ===
window.createMarker = function (x, y) {
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
};

// === SELECCIONAR MARCADOR ===
window.selectMarker = function (index) {
  if (selectedMarkerIndex === index) {
    selectedMarkerIndex = null;

    if (triangleIndicator) {
      triangleIndicator.remove();
      triangleIndicator = null;
    }

    markerModal.classList.add("hidden");
    return;
  }

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

  smoothPan(200);
  openMarkerModal(m);
};

// === CLICK FUERA DESMARCA ===
window.addEventListener("click", e => {
  if (!markerModal.classList.contains("hidden")) return;
  if (!e.target.classList.contains("marker")) {
    selectedMarkerIndex = null;

    if (triangleIndicator) {
      triangleIndicator.remove();
      triangleIndicator = null;
    }

    markerModal.classList.add("hidden");
    redrawMarkers();
  }
});
window.deleteMarkerById = function(id) {
    const markers = loadMarkers().filter(m => m.id !== id);
    saveMarkers(markers);

    renderAllMarkers();
    document.getElementById("markerViewModal").classList.add("hidden");
};
