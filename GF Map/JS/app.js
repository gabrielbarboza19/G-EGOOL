// === CARGAR IMAGEN DEL MAPA ===
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

// Empezar carga
img.src = IMAGE_URL;

// Desactivar zoom en el panel lateral
const sidePanel = document.getElementById("side-panel");

if (sidePanel) {
  sidePanel.addEventListener("wheel", e => {
    e.stopPropagation();
  }, { passive: false });
}
