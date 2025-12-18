let currentIndex = 0;
let imagesList = [];

const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSI5Ij48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PC9zdmc+';

function renderImage(src, index, container) {
  const itemDiv = document.createElement('div');
  itemDiv.className = 'gallery-item';

  const img = document.createElement('img');
  img.dataset.src = src;
  img.dataset.index = index;
  img.alt = "foto";
  img.className = 'gallery-thumb';
  img.src = PLACEHOLDER;
  img.loading = 'lazy';

  img.onload = () => img.classList.add('loaded');
  img.addEventListener('click', () => openLightbox(index));

  itemDiv.appendChild(img);
  container.appendChild(itemDiv);
  return img;
}

function loadGallery(jsonFile, containerId) {
  fetch(jsonFile)
    .then(res => res.json())
    .then(images => {
      imagesList = images;
      const container = document.getElementById(containerId);
      container.innerHTML = '';

      images.forEach((imgPath, index) => {
        renderImage(imgPath, index, container);
      });

      // Lazy loading con IntersectionObserver
      if ('IntersectionObserver' in window) {
        const lazyObserver = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              const url = img.dataset.src;
              if (url) img.src = url;
              img.removeAttribute('data-src');
              obs.unobserve(img);
            }
          });
        }, { rootMargin: '300px 0px', threshold: 0.01 });

        document.querySelectorAll(`#${containerId} img`).forEach(img => lazyObserver.observe(img));
      } else {
        // fallback se IntersectionObserver non supportato
        document.querySelectorAll(`#${containerId} img`).forEach(img => {
          img.src = img.dataset.src || img.src;
        });
      }

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

// Frecce lightbox
document.getElementById("prev")?.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + imagesList.length) % imagesList.length;
  document.getElementById("lightbox-img").src = imagesList[currentIndex];
});
document.getElementById("next")?.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % imagesList.length;
  document.getElementById("lightbox-img").src = imagesList[currentIndex];
});

// Tastiera
document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox || lightbox.style.display !== 'flex') return;
  if (e.key === 'Escape') lightbox.style.display = 'none';
  else if (e.key === 'ArrowLeft') document.getElementById('prev')?.click();
  else if (e.key === 'ArrowRight') document.getElementById('next')?.click();
});
