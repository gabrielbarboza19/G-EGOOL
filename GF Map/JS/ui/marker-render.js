// === REDIBUJAR MARCADORES ===
window.redrawMarkers = function () {
  viewport.querySelectorAll('.marker').forEach(m => m.remove());

  markers.forEach((m, index) => {
    const img = document.createElement('img');
    img.src = MARKER_URL;
    img.className = 'marker';

    img.style.left = m.x + 'px';
    img.style.top = m.y + 'px';

    img.onclick = e => {
      e.stopPropagation();
      selectMarker(index);
    };

    viewport.appendChild(img);
  });

  if (triangleIndicator && selectedMarkerIndex !== null) {
    const m = markers[selectedMarkerIndex];
    triangleIndicator.style.left = m.x + 'px';
    triangleIndicator.style.top = (m.y - 30) + 'px';
  }
};
markerElement.addEventListener("click", () => {
    window.currentOpenedMarker = m;
    openMarkerView(m);
});
