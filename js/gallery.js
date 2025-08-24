const galleryContainer = document.getElementById('gallery');

// Carica JSON delle immagini
fetch('data/images.json')
  .then(response => response.json())
  .then(data => {
    for (const [category, images] of Object.entries(data)) {
      const folderDiv = document.createElement('div');
      folderDiv.className = 'category';
      const title = document.createElement('h2');
      title.textContent = category.charAt(0).toUpperCase() + category.slice(1);
      folderDiv.appendChild(title);

      images.forEach(imgName => {
        const img = document.createElement('img');
        img.src = `images/${category}/${imgName}`;
        img.alt = imgName;
        folderDiv.appendChild(img);
      });

      galleryContainer.appendChild(folderDiv);
    }
  })
  .catch(err => console.error("Errore nel caricamento delle immagini:", err));
