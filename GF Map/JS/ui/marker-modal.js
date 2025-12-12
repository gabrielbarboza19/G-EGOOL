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
