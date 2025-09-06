function loadGallery(jsonFile, containerId) {
  fetch(jsonFile)
    .then(response => response.json())
    .then(images => {
      const container = document.getElementById(containerId);
      images.forEach(imgPath => {
        const img = document.createElement("img");
        img.src = imgPath;
        img.alt = "foto";
        img.addEventListener("click", () => openLightbox(imgPath));
        container.appendChild(img);
      });
    })
    .catch(err => console.error("Errore nel caricamento:", err));
}

function openLightbox(src) {
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  lightbox.style.display = "flex";
  lightboxImg.src = src;
}

document.getElementById("close")?.addEventListener("click", () => {
  document.getElementById("lightbox").style.display = "none";
});
