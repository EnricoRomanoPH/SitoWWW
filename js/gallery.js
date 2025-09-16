// gallery.js - lazy loading avanzato con IntersectionObserver
let currentIndex = 0;
let imagesList = [];

// piccola immagine placeholder (data-uri) per evitare richieste inutili
const PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSI5Ij48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlIi8+PC9zdmc+';

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

      images.forEach((item, index) => {
        // supporta sia array di stringhe che array di oggetti { src, thumbnail, alt, large }
        const src = (typeof item === 'string') ? item : (item.src || item.url || '');
        const thumb = (typeof item === 'object' && (item.thumbnail || item.thumb)) ? (item.thumbnail) : null;
        const alt = (typeof item === 'object') ? (item.alt || item.title || '') : '';
        const toShow = thumb || src; // prima carichiamo la thumb (se presente), altrimenti la src

        const img = document.createElement('img');
        img.dataset.src = toShow;            // caricato quando entra in viewport
        if (typeof item === 'object' && item.large) img.dataset.large = item.large; // opzionale: versione full-size per lightbox
        img.dataset.index = index;
        img.alt = alt;
        img.className = 'gallery-thumb';
        img.loading = 'lazy';                // buon fallback per browser moderni
        img.src = PLACEHOLDER;               // placeholder inline per evitare request inutili
        img.addEventListener('click', () => openLightbox(index));
        img.onerror = () => { 
          // fallback se la thumb non esiste
          img.src = PLACEHOLDER;
        };
        container.appendChild(img);
      });

      // IntersectionObserver: carica le immagini quando stanno per entrare nella viewport
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
        }, { rootMargin: '300px 0px', threshold: 0.01 }); // rootMargin per caricare un po' prima

        document.querySelectorAll(`#${containerId} img`).forEach(img => observer.observe(img));
      } else {
        // fallback: carica tutto subito
        document.querySelectorAll(`#${containerId} img`).forEach(img => {
          if (img.dataset.src) img.src = img.dataset.src;
        });
      }

    })
    .catch(err => console.error("Errore nel caricamento della gallery:", err));
}

function openLightbox(index) {
  currentIndex = index;
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const caption = document.getElementById("lightbox-caption");

  // scegli la versione large (se disponibile) altrimenti usa la src/oggetto
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
  lightboxImg.src = ''; // svuota per mostrare il loader se vuoi
  if (altText) lightboxImg.alt = altText;

  // carica immagine e mostra
  // se largeSrc è vuoto, prova a usare imagesList[currentIndex] come stringa
  const toLoad = largeSrc || (typeof item === 'string' ? item : (item.src || ''));
  if (toLoad) {
    // opzionale: puoi mostrare uno spinner qui aggiungendo una classe
    lightboxImg.src = toLoad;
  } else {
    lightboxImg.src = PLACEHOLDER;
  }

  // opzionale: caption dal JSON se presente
  if (typeof item === 'object' && (item.caption || item.title)) {
    caption.textContent = item.caption || item.title;
    caption.style.display = 'block';
  } else {
    caption.style.display = 'none';
  }
}

// ---------- controlli lightbox (chiusura, frecce, overlay, tastiera) ----------
document.addEventListener('click', (e) => {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  const target = e.target;

  // clic su overlay (fuori immagine) chiude
  if (target.id === 'lightbox' || target.classList.contains('lightbox')) {
    lightbox.style.display = 'none';
  }
});

// close button
document.getElementById("close")?.addEventListener("click", () => {
  document.getElementById("lightbox").style.display = "none";
});

// prev / next
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

// tastiera: Esc per chiudere, frecce per navigare
document.addEventListener('keydown', (e) => {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox || lightbox.style.display !== 'flex') return;
  if (e.key === 'Escape') {
    lightbox.style.display = 'none';
  } else if (e.key === 'ArrowLeft') {
    document.getElementById('prev')?.click();
  } else if (e.key === 'ArrowRight') {
    document.getElementById('next')?.click();
  }
});
