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
    <button class="location-list__item" data-place="${encodeURIComponent(name)}">
      <span><i class="bi bi-geo-alt-fill"></i></span><div><strong>${name}</strong><small>${items.length} amintiri</small></div><i class="bi bi-chevron-right"></i>
    </button>`);
  document.querySelector(`[data-place="${encodeURIComponent(name)}"]`).addEventListener("click", () => {
    map.flyTo(coords, 12); marker.openPopup();
  });
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
