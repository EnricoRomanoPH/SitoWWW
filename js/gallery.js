// gallery.js - Lazy loading avanzato con rendering progressivo
let currentIndex = 0;
let imagesList = [];

const INITIAL_RENDER = 6; // prime 6 immagini renderizzate subito
const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSI5Ij48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PC9zdmc+';

// funzione per creare una singola immagine
function renderImage(item, index, container) {
  const src = (typeof item === 'string') ? item : (item.src || item.url || '');
  const thumb = (typeof item === 'object' && (item.thumbnail || item.thumb)) ? item.thumbnail : null;
  const alt = (typeof item === 'object') ? (item.alt || item.title || '') : '';
  const toShow = thumb || src;

  const img = document.createElement('img');
  img.dataset.src = toShow;
  if (typeof item === 'object' && item.large) img.dataset.large = item.large;
  img.dataset.index = index;
  img.alt = alt;
  img.className = 'gallery-thumb';
  img.loading = 'lazy';
  img.src = PLACEHOLDER;

  // effetto dissolvenza
  img.onload = () => img.classList.add("loaded");
  img.onerror = () => { img.src = PLACEHOLDER; };
  img.addEventListener('click', () => openLightbox(index));

  container.appendChild(img);
  return img;
}

// carica la galleria
function loadGallery(jsonFile, containerId) {
  fetch(jsonFile)
    .then(response => {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    })
    .then(images => {
      imagesList = images;
      const container = document.getElementById(containerId);
      if (!container) return console.error('Contenitore non trovato:', containerId);
      container.innerHTML = '';

      // render prime INITIAL_RENDER immagini
      let nextIndex = 0;
      for (let i = 0; i < Math.min(INITIAL_RENDER, images.length); i++) {
        renderImage(images[i], i, container);
        nextIndex++;
      }

      // sentinel per caricare immagini successive
      const sentinel = document.createElement('div');
      sentinel.style.height = '1px';
      container.appendChild(sentinel);

      const loadObserver = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && nextIndex < images.length) {
          renderImage(images[nextIndex], nextIndex, container);
          nextIndex++;
        }
      }, { rootMargin: '200px 0px' });

      loadObserver.observe(sentinel);

      // IntersectionObserver per lazy loading immagini
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target;
              const url = img.dataset.src;
              if (url) {
                img.src = url;
                img.removeAttribute('data-src');
              }
              obs.unobserve(img);
            }
          });
        }, { rootMargin: '300px 0px', threshold: 0.01 });

        document.querySelectorAll(`#${containerId} img`).forEach(img => observer.observe(img));
      } else {
        document.querySelectorAll(`#${containerId} img`).forEach(img => {
          if (img.dataset.src) img.src = img.dataset.src;
        });
      }
    })
    .catch(err => console.error("Errore nel caricamento della gallery:", err));
}

// LIGHTBOX
function openLightbox(index) {
  currentIndex = index;
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const caption = document.getElementById("lightbox-caption");

  const item = imagesList[currentIndex];
  let largeSrc = '';
  let altText = '';
  if (typeof item === 'string') {
    largeSrc = item;
  } else if (typeof item === 'object') {
    largeSrc = item.large || item.src || item.url || '';
    altText = item.alt || item.title || '';
  }

  lightbox.style.display = "flex";
  lightboxImg.src = '';
  if (altText) lightboxImg.alt = altText;

  const toLoad = largeSrc || (typeof item === 'string' ? item : (item.src || ''));
  lightboxImg.onload = () => { lightboxImg.classList.add("loaded"); };
  lightboxImg.classList.remove("loaded");
  lightboxImg.src = toLoad;

  if (typeof item === 'object' && (item.caption || item.title)) {
    caption.textContent = item.caption || item.title;
    caption.style.display = 'block';
  } else {
    caption.style.display = 'none';
  }
}

// chiudi lightbox clic overlay o X
document.addEventListener('click', (e) => {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  const target = e.target;
  if (target.id === 'lightbox' || target.classList.contains('lightbox')) {
    lightbox.style.display = 'none';
  }
});
document.getElementById("close")?.addEventListener("click", () => {
  document.getElementById("lightbox").style.display = "none";
});

// frecce
document.getElementById("prev")?.addEventListener("click", () => {
  if (!imagesList.length) return;
  currentIndex = (currentIndex - 1 + imagesList.length) % imagesList.length;
  openLightbox(currentIndex);
});
document.getElementById("next")?.addEventListener("click", () => {
  if (!imagesList.length) return;
  currentIndex = (currentIndex + 1) % imagesList.length;
  openLightbox(currentIndex);
});

// tastiera
document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox || lightbox.style.display !== 'flex') return;
  if (e.key === 'Escape') lightbox.style.display = 'none';
  else if (e.key === 'ArrowLeft') document.getElementById('prev')?.click();
  else if (e.key === 'ArrowRight') document.getElementById('next')?.click();
});
