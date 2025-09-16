let currentIndex = 0;
let imagesList = [];

function loadGallery(jsonFile, containerId) {
  fetch(jsonFile)
    .then(response => response.json())
    .then(images => {
      imagesList = images; // salva la lista globale
      const container = document.getElementById(containerId);
      images.forEach((imgPath, index) => {
        const img = document.createElement("img");
        img.src = imgPath;
        img.alt = "foto";
        img.loading = "lazy"; // 🚀 Lazy loading
        img.addEventListener("click", () => openLightbox(index));
        container.appendChild(img);
      });
    })
    .catch(err => console.error("Errore nel caricamento:", err));
}

function openLightbox(index) {
  currentIndex = index;
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  lightbox.style.display = "flex";
  lightboxImg.src = imagesList[currentIndex];
}

// Chiudi lightbox
document.getElementById("close")?.addEventListener("click", () => {
  document.getElementById("lightbox").style.display = "none";
});

// Freccia indietro
document.getElementById("prev")?.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + imagesList.length) % imagesList.length;
  document.getElementById("lightbox-img").src = imagesList[currentIndex];
});

// Freccia avanti
document.getElementById("next")?.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % imagesList.length;
  document.getElementById("lightbox-img").src = imagesList[currentIndex];
});
