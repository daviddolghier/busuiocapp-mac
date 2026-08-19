const knownLocations = {
  "Ialoveni": [46.943, 28.782], "Chișinău": [47.0105, 28.8638], "Orhei": [47.3849, 28.8245],
  "Peresecina": [47.2519, 28.7596], "Dumbrava Veche": [47.231083, 28.65875], "București": [44.4268, 26.1025],
};

const library = window.mediaLibrary;
const seed = window.JourneyMap?.SEED_MEDIA || [];
let map;
let allBounds = [];

function normalized(value = "") {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function thumbnail(item) {
  return item.kind === "video"
    ? `<video muted preload="metadata" src="${item.src}"></video>`
    : `<img src="${item.src}" alt="">`;
}

function sidebarPhotos(items) {
  return items.slice(0, 3).map((item) => `<button class="location-list__photo" type="button" data-preview-src="${encodeURIComponent(item.src)}" data-preview-kind="${item.kind || "image"}" aria-label="Previzualizează amintirea">${thumbnail(item)}</button>`).join("");
}

function showPreview(source, kind) {
  let dialog = document.getElementById("mapPreviewDialog");
  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "mapPreviewDialog";
    dialog.className = "map-preview-dialog";
    dialog.innerHTML = `<div class="map-preview-dialog__surface"><button type="button" class="map-preview-dialog__close" aria-label="Închide"><i class="bi bi-x-lg"></i></button><div class="map-preview-dialog__media"></div></div>`;
    document.body.appendChild(dialog);
    dialog.querySelector(".map-preview-dialog__close").onclick = () => dialog.close();
    dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  }
  dialog.querySelector(".map-preview-dialog__media").innerHTML = kind === "video" ? `<video src="${source}" controls autoplay></video>` : `<img src="${source}" alt="Previzualizare amintire">`;
  dialog.showModal();
}

async function coordinatesFor(location) {
  const local = Object.entries(knownLocations).find(([name]) => normalized(name) === normalized(location));
  if (local) return local[1];

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(location)}`);
    const result = await response.json();
    if (result?.[0]) return [Number(result[0].lat), Number(result[0].lon)];
  } catch (error) {
    console.warn("Locația nu a putut fi găsită pe hartă:", location, error);
  }
  return null;
}

function fitAllLocations() {
  map.invalidateSize();
  if (allBounds.length === 1) {
    map.flyTo(allBounds[0], 12);
  } else if (allBounds.length > 1) {
    map.fitBounds(allBounds, { padding: [55, 55], maxZoom: 12 });
  } else {
    map.flyTo([46.5, 28.1], 7);
  }
}

function addPlace(name, items, coords) {
  const marker = L.marker(coords, {
    icon: L.divIcon({
      className: "journey-marker-wrap",
      html: `<span class="journey-marker"><i class="bi bi-heart-fill"></i><b>${items.length}</b></span>`,
      iconSize: [48, 48], iconAnchor: [24, 24],
    }),
  }).addTo(map).bindPopup(`
    <article class="map-popup"><p>${name}</p><h3>${items.length} amintiri</h3>
    <div>${items.slice(0, 4).map(thumbnail).join("")}</div>
    <a href="galerie.html">Deschide galeria <i class="bi bi-arrow-right"></i></a></article>`);

  allBounds.push(coords);
  document.getElementById("locationList").insertAdjacentHTML("beforeend", `
    <article class="location-list__entry"><button class="location-list__item" data-place="${encodeURIComponent(name)}">
      <span><i class="bi bi-geo-alt-fill"></i></span><div><strong>${name}</strong><small>${items.length} amintiri</small></div><i class="bi bi-chevron-right location-list__chevron"></i>
    </button><div class="location-list__photos" hidden>${sidebarPhotos(items)}</div></article>`);
  const entry = document.querySelector(`[data-place="${encodeURIComponent(name)}"]`).closest(".location-list__entry");
  entry.querySelector(".location-list__item").addEventListener("click", () => {
    // Hide all other open photo panels
    document.querySelectorAll(".location-list__photos").forEach((panel) => {
      if (panel !== entry.querySelector(".location-list__photos")) {
        panel.hidden = true;
        panel.closest(".location-list__entry")?.querySelector(".location-list__item")?.classList.remove("is-active");
        panel.closest(".location-list__entry")?.querySelector(".location-list__chevron")?.classList.remove("is-open");
      }
    });
    // Toggle current
    const photos = entry.querySelector(".location-list__photos");
    const isOpen = !photos.hidden;
    photos.hidden = isOpen;
    entry.querySelector(".location-list__item").classList.toggle("is-active", !isOpen);
    entry.querySelector(".location-list__chevron").classList.toggle("is-open", !isOpen);
    // Always fly to location
    map.flyTo(coords, 12);
    marker.openPopup();
  });
  entry.querySelectorAll("[data-preview-src]").forEach((button) => button.addEventListener("click", () => showPreview(decodeURIComponent(button.dataset.previewSrc), button.dataset.previewKind)));
}

async function initMap() {
  const extra = await library?.list?.().catch(() => []) || [];
  const byLocation = [...extra, ...seed].reduce((groups, item) => {
    const name = String(item.location || "").trim();
    if (!name) return groups;
    const existing = Object.keys(groups).find((key) => normalized(key) === normalized(name)) || name;
    (groups[existing] ||= []).push(item);
    return groups;
  }, {});

  map = L.map("realMap", { zoomControl: false }).setView([46.5, 28.1], 7);
  L.control.zoom({ position: "bottomright" }).addTo(map);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap" }).addTo(map);

  // Căutarea este secvențială pentru a nu trimite cereri excesive serviciului de hărți.
  for (const [name, items] of Object.entries(byLocation)) {
    const coords = await coordinatesFor(name);
    if (coords) addPlace(name, items, coords);
  }

  document.getElementById("locationCount").textContent = `${allBounds.length} locuri`;
  document.getElementById("fitMap").addEventListener("click", fitAllLocations);
  fitAllLocations();
}

initMap();
