window.markerModal = document.getElementById("markerModal");
const modalContent = document.querySelector("#markerModal .modal-content");

const inputTitle = document.getElementById("markerTitle");
const inputDesc = document.getElementById("markerDescription");
const inputImages = document.getElementById("markerImages");
const preview = document.getElementById("imagePreview");
const starBox = document.getElementById("starRating");

let tempMarker = null;
let selectedStars = 0;

// === ABRIR MODAL ===
window.openMarkerModal = function (marker) {
  tempMarker = marker;

  inputTitle.value = marker.title;
  inputDesc.value = marker.description;
  selectedStars = marker.stars || 0;

  paintStars();

  inputImages.value = "";
  preview.innerHTML = "";

  if (marker.images) {
    marker.images.forEach(url => {
      const img = document.createElement("img");
      img.src = url;
      preview.appendChild(img);
    });
  }

  markerModal.classList.remove("hidden");
};

// === CERRAR MANUAL ===
document.getElementById("cancelMarker").onclick = () =>
  markerModal.classList.add("hidden");

// === CERRAR CLICK AFUERA ===
window.addEventListener("click", e => {
  if (!markerModal.classList.contains("hidden")) {
    if (!modalContent.contains(e.target)) {
      markerModal.classList.add("hidden");
    }
  }
});

// === GUARDAR ===
document.getElementById("saveMarker").onclick = () => {
  if (!tempMarker) return;

  tempMarker.title = inputTitle.value.trim();
  tempMarker.description = inputDesc.value.trim();
  tempMarker.stars = selectedStars;

  const newImages = [...inputImages.files].map(f => URL.createObjectURL(f));
  tempMarker.images = [...tempMarker.images, ...newImages];

  saveMarkers();
  redrawMarkers();

  markerModal.classList.add("hidden");
};

// === PREVIEW IMAGENES ===
inputImages.addEventListener("change", () => {
  preview.innerHTML = "";
  [...inputImages.files].forEach(file => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    preview.appendChild(img);
  });
});

// === ESTRELLAS ===
starBox.addEventListener("mousemove", e => {
  const rect = starBox.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const idx = Math.ceil((x / rect.width) * 5);
  paintStars(idx);
});

starBox.addEventListener("mouseleave", () => paintStars());

starBox.addEventListener("click", e => {
  const rect = starBox.getBoundingClientRect();
  const x = e.clientX - rect.left;
  selectedStars = Math.ceil((x / rect.width) * 5);
  paintStars();
});

// === PINTAR ESTRELLAS ===
window.paintStars = function (hover = 0) {
  const count = hover || selectedStars;
  starBox.textContent = "★★★★★".slice(0, count) +
                        "☆☆☆☆☆".slice(count);
};
// === ABRIR VISTA DE MARCADOR ===
window.openMarkerView = function(marker) {
    const modal = document.getElementById("markerViewModal");

    document.getElementById("viewTitle").textContent = marker.title || "Sin título";
    document.getElementById("viewDescription").textContent = marker.description || "Sin descripción";
    document.getElementById("viewCategory").textContent = marker.category || "Sin categoría";
    document.getElementById("viewStars").textContent = "★".repeat(marker.stars || 0);

    const imgBox = document.getElementById("viewImages");
    imgBox.innerHTML = "";

    if (marker.images && marker.images.length) {
        marker.images.forEach(base64 => {
            const img = document.createElement("img");
            img.src = base64;
            img.className = "thumb";
            imgBox.appendChild(img);
        });
    }

    modal.classList.remove("hidden");
};
document.getElementById("closeViewModal").addEventListener("click", () => {
    document.getElementById("markerViewModal").classList.add("hidden");
});
document.getElementById("deleteThisMarker").addEventListener("click", () => {
    if (window.currentOpenedMarker) {
        deleteMarkerById(window.currentOpenedMarker.id);
    }
});
