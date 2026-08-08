(() => {
const journey = window.JourneyMap || {};

const SEED_MEDIA = journey.SEED_MEDIA || [];
const renderMapStage = journey.renderMapStage || (() => "");
const escapeHtml =
  journey.escapeHtml ||
  ((value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;"));
const escapeAttr = journey.escapeAttr || ((value = "") => escapeHtml(value).replaceAll("`", "&#96;"));

const mediaMarkup = (item) => {
  if (item.kind === "video") {
    return `<video muted playsinline controls preload="metadata" poster="${escapeAttr(item.poster || "images/Video.png")}"><source src="${escapeAttr(item.src)}" type="${escapeAttr(item.mimeType || "video/mp4")}" />Browserul nu poate reda acest video.</video>`;
  }
  return `<img src="${escapeAttr(item.src)}" alt="${escapeAttr(item.title)}" loading="lazy" onerror="this.onerror=null;this.src='images/default.png';" />`;
};

const mediaMeta = (item) =>
  [
    item.location ? `<span class="tag"><i class="bi bi-geo-alt-fill"></i> ${escapeHtml(item.location)}</span>` : "",
    item.date ? `<span class="tag"><i class="bi bi-calendar-event"></i> ${escapeHtml(item.date)}</span>` : "",
  ].join("");

const normalizeText = journey.normalizeLocation
  ? (value) => journey.normalizeLocation(value)
  : (value = "") =>
      String(value)
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "");


const SYSTEM_FOLDERS = {
  amintiri: { label: "Amintiri" },
  "cerere-casatorie": { label: "Cerere căsătorie" },
  nunta: { label: "Nuntă (Hidden)", hidden: true },
};

const STORAGE_KEY_USER_FOLDERS = "busuioc_user_folders";
const STORAGE_KEY_CUSTOM_IMAGES = "busuioc_custom_images";
const STORAGE_KEY_FAVORITES = "busuioc_favorites";
const STORAGE_KEY_CINEMATIC_TIMER = "busuioc_cinematic_timer";

function loadUserFolders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER_FOLDERS);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveUserFolders(folders) {
  try {
    localStorage.setItem(STORAGE_KEY_USER_FOLDERS, JSON.stringify([...folders]));
  } catch (e) {
    console.error("Eroare la salvarea folderelor:", e);
  }
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAVORITES);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveFavorites(favSet) {
  try {
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify([...favSet]));
  } catch (e) {
    console.error("Eroare la salvarea favoritelor:", e);
  }
}

function normalizeFolderKey(value = "") {
  const n = normalizeText(value);
  if (n.includes("cerere")) return "cerere-casatorie";
  if (n.includes("nunta") || n.includes("hidden")) return "nunta";
  if (n.includes("newphoto") || n === "amintiri") return "amintiri";
  const trimmed = String(value).trim();
  if (!trimmed) return "amintiri";
  if (trimmed.startsWith("custom:")) return trimmed;
  return `custom:${trimmed}`;
}

function isSystemFolder(key) {
  return Object.hasOwn(SYSTEM_FOLDERS, key);
}

function isUserFolder(key) {
  return String(key).startsWith("custom:");
}

const els = {
  galleryGrid: document.getElementById("galleryGrid"),
  filterRow: document.getElementById("filterRow"),
  mediaModal: document.getElementById("mediaModal"),
  mediaModalBody: document.getElementById("mediaModalBody"),
  galleryMapStage: document.getElementById("galleryMapStage"),
  btnImportPhoto: document.getElementById("btnImportPhoto"),
  btnFavoriteFolder: document.getElementById("btnFavoriteFolder"),
  btnEditMode: document.getElementById("btnEditMode"),
  btnSlideshow: document.getElementById("btnSlideshow"),
  scaleSwitcher: document.getElementById("scaleSwitcher"),
  importModal: document.getElementById("importModal"),
  btnCloseImportModal: document.getElementById("btnCloseImportModal"),
  btnCancelImport: document.getElementById("btnCancelImport"),
  importForm: document.getElementById("importForm"),
  dropzone: document.getElementById("dropzone"),
  fileInput: document.getElementById("fileInput"),
  importPreview: document.getElementById("importPreview"),
  importTitle: document.getElementById("importTitle"),
  importDescription: document.getElementById("importDescription"),
  importLocation: document.getElementById("importLocation"),
  importFolderSelect: document.getElementById("importFolderSelect"),
  newFolderContainer: document.getElementById("newFolderContainer"),
  importNewFolder: document.getElementById("importNewFolder"),
  slideshowModal: document.getElementById("slideshowModal"),
  slideshowStage: document.getElementById("slideshowStage"),
  previousSlide: document.getElementById("previousSlide"),
  nextSlide: document.getElementById("nextSlide"),
  closeSlideshow: document.getElementById("closeSlideshow"),
  slideshowTitle: document.getElementById("slideshowTitle"),
  slideshowDescription: document.getElementById("slideshowDescription"),
  slideshowLocation: document.getElementById("slideshowLocation"),
  slideshowLocationText: document.getElementById("slideshowLocationText"),
  slideshowTag: document.getElementById("slideshowTag"),
  slideshowTagText: document.getElementById("slideshowTagText"),
  slideshowCounter: document.getElementById("slideshowCounter"),
  slideshowFavBtn: document.getElementById("slideshowFavBtn"),
  slideshowTimerSelector: document.getElementById("slideshowTimerSelector"),
  toast: document.getElementById("toast"),
};

const DEFAULT_PAGE_SIZE = 12;

// Load custom user imported photos & JSON metadata from local storage
function loadCustomMedia() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_IMAGES);
    const items = raw ? JSON.parse(raw) : [];
    return items.map((item) => {
      if (item.folder) item.folder = normalizeFolderKey(item.folder);
      return item;
    });
  } catch (e) {
    console.error("Eroare la încărcarea fotografiilor salvate local:", e);
    return [];
  }
}

function saveCustomMedia(items) {
  try {
    const customOnly = items.filter((item) => item.isCustom);
    localStorage.setItem(STORAGE_KEY_CUSTOM_IMAGES, JSON.stringify(customOnly));
  } catch (e) {
    console.error("Eroare la salvarea fotografiilor salvate local:", e);
  }
}

const state = {
  items: [...SEED_MEDIA],
  filter: "all",
  scale: "3x3",
  isEditMode: false,
  openFolders: new Set(),
  folderLimits: new Map(),
  userFolders: new Set(),
  favorites: new Set(),
  slideshowIndex: 0,
  slideshowItems: [],
  slideshowTimerInterval: parseInt(localStorage.getItem(STORAGE_KEY_CINEMATIC_TIMER) || "5", 10),
  slideshowTimerId: null,
  isSlideshowActive: false,
  selectedFile: null,
  selectedFileName: null,
  dragItemId: null,
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}

async function init() {
  try {
    const imported = await window.mediaLibrary?.list?.() || [];
    state.items = [...imported.map((item) => ({ ...item, folder: normalizeFolderKey(item.folder) })), ...SEED_MEDIA];
    const savedState = await window.mediaLibrary?.getGalleryState?.() || { order: [], favorites: [] };
    const positions = new Map((savedState.order || []).map((id, index) => [id, index]));
    state.items.sort((a, b) => (positions.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (positions.get(b.id) ?? Number.MAX_SAFE_INTEGER));

    const loadedFavs = loadFavorites();
    if (Array.isArray(savedState.favorites)) {
      savedState.favorites.forEach((id) => loadedFavs.add(id));
    }
    state.favorites = loadedFavs;
  } catch (error) {
    console.error("Biblioteca persistentă nu a putut fi încărcată:", error);
  }
  state.items.forEach((item) => {
    const key = folderKey(item);
    if (key) state.openFolders.add(key);
    if (isUserFolder(key)) state.userFolders.add(key);
  });
  populateFolderDropdown();
  bindRevealObserver();
  bindFilters();
  bindToolbarControls();
  bindImportModalEvents();
  bindSlideshowEvents();
  render();
}

function showToast(message) {
  if (!els.toast) return;
  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  setTimeout(() => {
    els.toast.classList.remove("is-visible");
  }, 3500);
}

function persistOrder() {
  saveFavorites(state.favorites);
  return window.mediaLibrary?.saveGalleryState?.({
    order: state.items.map((item) => item.id),
    favorites: [...state.favorites],
  })?.catch((error) => console.error("Nu s-a putut salva starea galeriei:", error));
}

function toggleFavorite(id) {
  if (!id) return;
  if (state.favorites.has(id)) {
    state.favorites.delete(id);
    showToast("Eliminat din favorite");
  } else {
    state.favorites.add(id);
    showToast("Adăugat la favorite ❤️");
  }
  saveFavorites(state.favorites);
  persistOrder();
  render();
  if (state.isSlideshowActive) {
    updateSlideshowFavBtn();
  }
}

function bindRevealObserver() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
  );

  document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
}

function bindFilters() {
  const filters = [
    { id: "all", label: "Toate" },
    { id: "favorite", label: "❤️ Favorite" },
    { id: "image", label: "Fotografii" },
    { id: "video", label: "Videoclipuri" },
    { id: "amintiri", label: "Amintiri" },
    { id: "cerere", label: "Cerere" },
    { id: "nunta", label: "Nuntă" },
    { id: "congres", label: "Congrese" },
    { id: "calatorie", label: "Călătorie" },
    { id: "acasă", label: "Acasă" },
  ];

  if (!els.filterRow) return;

  els.filterRow.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;

    state.filter = button.dataset.filter;
    render();
  });

  els.filterRow.innerHTML = filters
    .map(
      (filter) => `
        <button class="chip ${filter.id === state.filter ? "is-active" : ""}" type="button" data-filter="${escapeAttr(filter.id)}">
          ${escapeHtml(filter.label)}
        </button>
      `
    )
    .join("");
}

/* Toolbar: Grid Scale & Edit Mode Controls */
function bindToolbarControls() {
  // Scale switcher
  if (els.scaleSwitcher) {
    els.scaleSwitcher.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-scale]");
      if (!btn) return;
      setScale(btn.dataset.scale);
    });
  }

  // Favorite Folder Button (next to Adaugă)
  if (els.btnFavoriteFolder) {
    els.btnFavoriteFolder.addEventListener("click", () => {
      if (state.filter === "favorite") {
        state.filter = "all";
        els.btnFavoriteFolder.classList.remove("is-active");
      } else {
        state.filter = "favorite";
        els.btnFavoriteFolder.classList.add("is-active");
        showToast("Se afișează doar fotografiile Favorite ❤️");
      }
      render();
    });
  }

  // Edit Mode Button
  if (els.btnEditMode) {
    els.btnEditMode.addEventListener("click", () => {
      state.isEditMode = !state.isEditMode;
      
      // REQUIREMENT: When Edit Mode is enabled, automatically switch scale to 3x3
      if (state.isEditMode) {
        setScale("3x3");
        showToast("Modul Editează activat — trage cardurile pentru a reordona");
      } else {
        showToast("Modul Editează dezactivat");
      }

      els.btnEditMode.classList.toggle("is-active", state.isEditMode);
      render();
    });
  }

  // Import Photo (+) Button
  if (els.btnImportPhoto) {
    els.btnImportPhoto.addEventListener("click", () => {
      openImportModal();
    });
  }
}

function setScale(newScale) {
  state.scale = newScale;
  if (els.scaleSwitcher) {
    els.scaleSwitcher.querySelectorAll("[data-scale]").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.scale === newScale);
    });
  }
  if (els.galleryGrid) {
    els.galleryGrid.className = `gallery-grid scale-${newScale}`;
  }
}

function populateFolderDropdown() {
  if (!els.importFolderSelect) return;

  const folderOptions = Object.entries(SYSTEM_FOLDERS).map(([value, meta]) => ({
    value,
    label: meta.label,
    hidden: meta.hidden || false,
  }));

  state.userFolders.forEach((key) => {
    if (!folderOptions.some((f) => f.value === key)) {
      folderOptions.push({ value: key, label: key.replace(/^custom:/, ""), hidden: false });
    }
  });

  let html = folderOptions
    .map(
      (f) => `<option value="${escapeAttr(f.value)}" ${f.hidden ? "hidden" : ""}>${escapeHtml(f.label)}</option>`
    )
    .join("");

  html += `<option value="__new__">+ Adaugă folder nou...</option>`;
  els.importFolderSelect.innerHTML = html;

  if (!els.importFolderSelect.querySelector(`option[value="amintiri"]`)) {
    els.importFolderSelect.value = "amintiri";
  }
}

function bindImportModalEvents() {
  if (!els.importModal) return;

  const close = () => {
    if (typeof els.importModal.close === "function") {
      els.importModal.close();
    } else {
      els.importModal.style.display = "none";
    }
    resetImportForm();
  };

  els.btnCloseImportModal?.addEventListener("click", close);
  els.btnCancelImport?.addEventListener("click", close);

  // Folder dropdown change for new folder creation
  els.importFolderSelect?.addEventListener("change", (e) => {
    if (e.target.value === "__new__") {
      if (els.newFolderContainer) els.newFolderContainer.style.display = "block";
      if (els.importNewFolder) els.importNewFolder.required = true;
    } else {
      if (els.newFolderContainer) els.newFolderContainer.style.display = "none";
      if (els.importNewFolder) els.importNewFolder.required = false;
    }
  });

  // Dropzone drag and drop
  if (els.dropzone && els.fileInput) {
    ["dragenter", "dragover"].forEach((eventName) => {
      els.dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        els.dropzone.classList.add("is-dragover");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      els.dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        els.dropzone.classList.remove("is-dragover");
      });
    });

    els.dropzone.addEventListener("drop", (e) => {
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleSelectedFile(files[0]);
      }
    });

    els.fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleSelectedFile(e.target.files[0]);
      }
    });
  }

  // Import Form Submit
  els.importForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    processPhotoImport();
  });
}

function openImportModal() {
  resetImportForm();
  populateFolderDropdown();
  if (els.importFolderSelect) {
    els.importFolderSelect.value = "amintiri";
  }
  if (els.importModal) {
    if (typeof els.importModal.showModal === "function") {
      els.importModal.showModal();
    } else {
      els.importModal.style.display = "block";
    }
  }
}

function handleSelectedFile(file) {
  if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
    showToast("Vă rugăm selectați un fișier imagine valid!");
    return;
  }

  state.selectedFile = file;
  state.selectedFileName = file.name || `IMG_${Math.floor(1000 + Math.random() * 9000)}.jpg`;

  if (file.type.startsWith("video/")) {
    if (els.importPreview) {
      els.importPreview.src = "images/Video.png";
      els.importPreview.style.display = "block";
    }
    createVideoPreview(file).then((preview) => {
      if (preview && state.selectedFile === file && els.importPreview) els.importPreview.src = preview;
    });
  } else {
  const reader = new FileReader();
  reader.onload = (e) => {
    if (els.importPreview) {
      els.importPreview.src = e.target.result;
      els.importPreview.style.display = "block";
    }
    // Auto-fill title if empty
    if (els.importTitle && !els.importTitle.value) {
      const cleanName = state.selectedFileName.replace(/\.[^/.]+$/, "").replaceAll("_", " ");
      els.importTitle.value = cleanName;
    }
  };
  reader.readAsDataURL(file);
  }
}

function createVideoPreview(file) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    const finish = (preview = null) => { URL.revokeObjectURL(url); resolve(preview); };
    video.muted = true;
    video.preload = "metadata";
    video.src = url;
    video.addEventListener("loadeddata", () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 360;
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        finish(canvas.toDataURL("image/jpeg", 0.82));
      } catch { finish(); }
    }, { once: true });
    video.addEventListener("error", () => finish(), { once: true });
  });
}

async function processPhotoImport() {
  if (!state.selectedFile) {
    showToast("Selectați o imagine de importat!");
    return;
  }

  let folder = els.importFolderSelect.value;
  if (folder === "__new__") {
    const newName = els.importNewFolder.value.trim();
    if (!newName) {
      showToast("Vă rugăm introduceți un nume pentru noul folder!");
      return;
    }
    folder = normalizeFolderKey(newName);
    if (isSystemFolder(folder)) {
      showToast("Acest nume este rezervat. Alege alt nume.");
      return;
    }
    state.userFolders.add(folder);
  }

  folder = normalizeFolderKey(folder);

  const title = els.importTitle.value.trim() || "Fotografie nouă";
  const description = els.importDescription.value.trim();
  const location = els.importLocation.value.trim();
  const dateStr = new Date().toLocaleDateString("ro-RO", { year: "numeric", month: "long", day: "numeric" });

  const rawFileName = state.selectedFileName || `IMG_${Date.now()}.jpg`;
  const jsonName = rawFileName.replace(/\.[^/.]+$/, "") + ".json";

  // REQUIREMENT: JSON structure formatted as requested
  const jsonMetadata = {
    image: rawFileName,
    title: title,
    description: description,
    location: location,
    folder: folder,
    date: dateStr,
    jsonFile: jsonName,
  };

  const metadata = {
    kind: state.selectedFile.type.startsWith("video/") ? "video" : "image",
    imageName: rawFileName,
    title: title,
    location: location,
    tag: folder,
    description: description,
    date: dateStr,
    folder: folder,
    jsonMetadata,
  };
  let newItem;
  try {
    const bytes = await state.selectedFile.arrayBuffer();
    newItem = await window.mediaLibrary.import({ name: rawFileName, bytes, metadata });
  } catch (error) {
    console.error("Import eșuat:", error);
    showToast("Fișierul nu a putut fi salvat în biblioteca aplicației.");
    return;
  }
  state.items.unshift(newItem);
  state.openFolders.add(folderKey(newItem));
  persistOrder();

  if (typeof els.importModal.close === "function") {
    els.importModal.close();
  } else {
    els.importModal.style.display = "none";
  }

  resetImportForm();
  render();
  showToast(`Fotografia a fost salvată în ${folderLabel(folder)}!`);
}

function resetImportForm() {
  state.selectedFile = null;
  state.selectedFileName = null;
  if (els.importForm) els.importForm.reset();
  if (els.importPreview) {
    els.importPreview.src = "";
    els.importPreview.style.display = "none";
  }
  if (els.newFolderContainer) els.newFolderContainer.style.display = "none";
  if (els.importNewFolder) els.importNewFolder.required = false;
  if (els.importFolderSelect) els.importFolderSelect.value = "amintiri";
}

function folderKey(item) {
  if (!item) return "amintiri";
  if (item.folder) return normalizeFolderKey(item.folder);
  if (item.tag === "Cerere") return "cerere-casatorie";

  if (item.src) {
    const path = String(item.src).replaceAll("\\", "/").toLowerCase();
    if (path.includes("cerere")) return "cerere-casatorie";
    if (path.includes("newphoto")) return "amintiri";
    if (path.includes("nunta") || path.includes("hidden")) return "nunta";
  }
  return "amintiri";
}

function folderLabel(key) {
  if (SYSTEM_FOLDERS[key]) return SYSTEM_FOLDERS[key].label;
  if (isUserFolder(key)) return key.replace(/^custom:/, "");
  return String(key).split("/").pop();
}

function getFolderCategory(item) {
  return folderKey(item);
}

function matchesFilter(item) {
  const filter = state.filter;
  if (filter === "all") return true;
  if (filter === "favorite") return state.favorites.has(item.id);
  if (filter === "image" || filter === "video") return item.kind === filter;

  if (filter === "amintiri" || filter === "cerere" || filter === "nunta") {
    const categoryMap = { amintiri: "amintiri", cerere: "cerere-casatorie", nunta: "nunta" };
    return getFolderCategory(item) === categoryMap[filter];
  }

  const targetTag = normalizeText(filter);
  const itemTag = normalizeText(item.tag || item.folder || "");
  return itemTag.includes(targetTag);
}

function groupByFolder(items) {
  const groups = new Map();

  items.forEach((item) => {
    const key = folderKey(item);
    const current = groups.get(key) || [];
    current.push(item);
    groups.set(key, current);
  });

  return Array.from(groups.entries())
    .map(([key, entries]) => ({
      key,
      label: folderLabel(key),
      items: entries,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, "ro"));
}

function render() {
  const filtered = state.items.filter(matchesFilter);
  const groups = groupByFolder(filtered);

  if (["amintiri", "cerere", "nunta"].includes(state.filter)) {
    groups.forEach((group) => state.openFolders.add(group.key));
  }

  if (els.galleryGrid) {
    els.galleryGrid.className = `gallery-grid scale-${state.scale}`;
    els.galleryGrid.innerHTML = groups.length > 0
      ? groups.map((group) => renderFolder(group)).join("")
      : `<div class="empty-gallery-msg" style="grid-column:1/-1; text-align:center; padding:4rem 1.5rem; color:var(--muted);">
          <i class="bi bi-heartbreak" style="font-size:3rem; color:var(--rose); display:block; margin-bottom:1rem;"></i>
          <h3>Nicio fotografie în această categorie</h3>
          <p>${state.filter === "favorite" ? "Apasă pe inimioara de pe poze pentru a le adăuga la Favorite!" : "Adaugă fotografii folosind butonul Adaugă."}</p>
         </div>`;
  }

  if (els.galleryMapStage) {
    els.galleryMapStage.innerHTML = renderMapStage(filtered);
  }

  bindFolderEvents();
  bindCardEvents();
  bindDragDrop();
  updateFilterState();
}

function updateFilterState() {
  if (!els.filterRow) return;
  els.filterRow.querySelectorAll("[data-filter]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.filter === state.filter);
  });
  if (els.btnFavoriteFolder) {
    els.btnFavoriteFolder.classList.toggle("is-active", state.filter === "favorite");
  }
}

function renderFolder(group) {
  const isOpen = state.openFolders.has(group.key);
  const limit = state.folderLimits.get(group.key) || DEFAULT_PAGE_SIZE;
  const visibleItems = isOpen ? group.items.slice(0, limit) : [];
  const remaining = group.items.length - visibleItems.length;

  const isHiddenFolder = group.key === "nunta";
  const canDeleteFolder = state.isEditMode && isUserFolder(group.key);

  return `
    <section class="gallery-folder ${isOpen ? "is-open" : ""}" data-folder-key="${escapeAttr(group.key)}">
      <div class="gallery-folder__header">
        <button class="gallery-folder__header-main" type="button" data-folder-toggle>
          <div>
            <p class="eyebrow">Folder</p>
            <h3>
              ${escapeHtml(group.label)}
              ${isHiddenFolder ? `<span class="folder-badge-hidden">Hidden</span>` : ""}
            </h3>
            <p class="gallery-folder__meta">${group.items.length} elemente foto & video</p>
          </div>
        </button>
        <div class="gallery-folder__header-actions">
          ${
            canDeleteFolder
              ? `<button type="button" class="folder-delete-btn" data-action="delete-folder" title="Șterge folder"><i class="bi bi-trash-fill"></i></button>`
              : ""
          }
          <button type="button" class="gallery-folder__chevron" data-folder-toggle aria-label="Deschide folder"><i class="bi bi-chevron-down"></i></button>
        </div>
      </div>
      <div class="gallery-folder__body">
        ${
          isOpen
            ? `<div class="gallery-grid--folder">${visibleItems
                .map((item, index) => galleryCard(item, index, group.items.length))
                .join("")}</div>`
            : ""
        }
        ${
          isOpen && remaining > 0
            ? `<div class="gallery-folder__more" style="margin-top:1.25rem; text-align:center;">
                <button class="chip chip--soft" type="button" data-folder-more>Încarcă mai multe (${remaining})</button>
               </div>`
            : ""
        }
      </div>
    </section>
  `;
}

function galleryCard(item, index, totalInGroup) {
  const meta = mediaMeta(item);
  const isFav = state.favorites.has(item.id);

  const editControls = state.isEditMode
    ? `
    <div class="gallery-card__edit-controls">
      <span class="gallery-card__drag-handle" title="Trage pentru a reordona"><i class="bi bi-grip-vertical"></i></span>
      ${item.isCustom ? `<button type="button" class="card-edit-btn card-edit-btn--danger" data-action="delete" title="Șterge fotografia"><i class="bi bi-trash-fill"></i></button>` : ""}
    </div>
  `
    : "";

  const favBtn = `
    <button type="button" class="card-fav-btn ${isFav ? "is-favorite" : ""}" data-action="toggle-favorite" aria-label="${isFav ? "Elimină din favorite" : "Adaugă la favorite"}" title="${isFav ? "Elimină din favorite" : "Adaugă la favorite"}">
      <i class="bi ${isFav ? "bi-heart-fill" : "bi-heart"}"></i>
    </button>
  `;

  return `
    <article class="gallery-card ${state.isEditMode ? "is-editing is-draggable" : ""}" data-item-id="${escapeAttr(item.id)}" ${state.isEditMode ? 'draggable="true"' : ""}>
      ${editControls}
      <div class="gallery-card__media">
        ${favBtn}
        ${item.kind === "video" ? `<span class="video-badge">Video</span>` : ""}
        ${mediaMarkup(item)}
      </div>
      <div class="gallery-card__body">
        <div class="tag-row">
          ${meta || `<span class="tag">${escapeHtml(item.location || "Locație")}</span>`}
        </div>
        <h3>${escapeHtml(item.title || "Fără titlu")}</h3>
        <p class="gallery-card__meta">${escapeHtml(item.description || "")}</p>
      </div>
      <div class="gallery-card__actions">
        ${
          state.isEditMode && item.isCustom
            ? `<button class="mini-btn mini-btn--danger" type="button" data-action="delete"><i class="bi bi-trash-fill"></i> Șterge</button>`
            : `<button class="mini-btn mini-btn--accent" type="button" data-action="view"><i class="bi bi-eye"></i> Vezi</button>`
        }
      </div>
    </article>
  `;
}

function bindFolderEvents() {
  if (!els.galleryGrid) return;

  els.galleryGrid.querySelectorAll("[data-folder-key]").forEach((section) => {
    const key = section.dataset.folderKey;
    const toggles = section.querySelectorAll("[data-folder-toggle]");
    const deleteBtn = section.querySelector("[data-action='delete-folder']");
    const more = section.querySelector("[data-folder-more]");

    toggles.forEach((toggle) => {
      toggle.addEventListener("click", () => {
        if (state.openFolders.has(key)) {
          state.openFolders.delete(key);
        } else {
          state.openFolders.add(key);
        }
        render();
      });
    });

    deleteBtn?.addEventListener("click", (event) => {
      event.stopPropagation();
      deleteUserFolder(key);
    });

    more?.addEventListener("click", () => {
      const current = state.folderLimits.get(key) || DEFAULT_PAGE_SIZE;
      state.folderLimits.set(key, current + DEFAULT_PAGE_SIZE);
      render();
    });
  });
}

async function deleteUserFolder(key) {
  if (!isUserFolder(key)) {
    showToast("Doar folderele create de tine pot fi șterse.");
    return;
  }

  const label = folderLabel(key);
  const count = state.items.filter((item) => folderKey(item) === key && item.isCustom).length;
  if (!confirm(`Sigur doriți să ștergeți folderul „${label}" și ${count} fotografii din el?`)) return;

  const doomed = state.items.filter((item) => folderKey(item) === key && item.isCustom);
  await Promise.all(doomed.map((item) => window.mediaLibrary?.remove?.(item.id)));
  state.items = state.items.filter((item) => !(folderKey(item) === key && item.isCustom));
  state.userFolders.delete(key);
  state.openFolders.delete(key);
  state.folderLimits.delete(key);
  saveUserFolders(state.userFolders);
  persistOrder();
  render();
  showToast(`Folderul „${label}" a fost șters.`);
}

function reorderInFolder(canonicalKey, draggedId, targetId) {
  if (!draggedId || !targetId || draggedId === targetId) return;

  const folderIndices = [];
  state.items.forEach((item, index) => {
    if (folderKey(item) === canonicalKey) folderIndices.push(index);
  });

  const folderIds = folderIndices.map((index) => state.items[index].id);
  const fromPos = folderIds.indexOf(draggedId);
  const toPos = folderIds.indexOf(targetId);
  if (fromPos === -1 || toPos === -1) return;

  const [moved] = folderIds.splice(fromPos, 1);
  folderIds.splice(toPos, 0, moved);

  const reordered = folderIds.map((id) => state.items.find((item) => item.id === id));
  let slot = 0;
  state.items = state.items.map((item) => (folderKey(item) === canonicalKey ? reordered[slot++] : item));
  persistOrder();
  render();
}

function bindDragDrop() {
  if (!els.galleryGrid || !state.isEditMode) return;

  els.galleryGrid.querySelectorAll("[data-folder-key]").forEach((section) => {
    const folderKeyValue = section.dataset.folderKey;
    const cards = section.querySelectorAll(".gallery-card.is-draggable");

    cards.forEach((card) => {
      card.addEventListener("dragstart", (event) => {
        state.dragItemId = card.dataset.itemId;
        card.classList.add("is-dragging");
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", state.dragItemId);
      });

      card.addEventListener("dragend", () => {
        state.dragItemId = null;
        card.classList.remove("is-dragging");
        section.querySelectorAll(".gallery-card").forEach((el) => el.classList.remove("is-drag-over"));
      });

      card.addEventListener("dragover", (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        card.classList.add("is-drag-over");
      });

      card.addEventListener("dragleave", () => {
        card.classList.remove("is-drag-over");
      });

      card.addEventListener("drop", (event) => {
        event.preventDefault();
        card.classList.remove("is-drag-over");
        const draggedId = state.dragItemId || event.dataTransfer.getData("text/plain");
        const targetId = card.dataset.itemId;
        reorderInFolder(folderKeyValue, draggedId, targetId);
      });
    });
  });
}

function bindCardEvents() {
  if (!els.galleryGrid) return;

  els.galleryGrid.querySelectorAll("[data-item-id]").forEach((card) => {
    const itemId = card.dataset.itemId;
    const itemIndex = state.items.findIndex((entry) => entry.id === itemId);
    if (itemIndex === -1) return;

    const item = state.items[itemIndex];

    // Actions inside card
    card.addEventListener("click", (event) => {
      const actionBtn = event.target.closest("[data-action]");
      if (!actionBtn) {
        if (!state.isEditMode) {
          openPreview(item);
        }
        return;
      }

      event.stopPropagation();
      const action = actionBtn.dataset.action;

      if (action === "toggle-favorite") {
        toggleFavorite(item.id);
      } else if (action === "view") {
        openPreview(item);
      } else if (action === "delete") {
        if (!item.isCustom) {
          showToast("Doar fotografiile adăugate de tine pot fi șterse.");
          return;
        }
        if (confirm(`Sigur doriți să ștergeți fotografia „${item.title}"?`)) {
          window.mediaLibrary?.remove?.(item.id);
          state.items.splice(itemIndex, 1);
          persistOrder();
          render();
          showToast("Fotografia a fost ștearsă.");
        }
      }
    });
  });
}

function openPreview(item) {
  if (!item || !els.mediaModal || !els.mediaModalBody) return;

  const isFav = state.favorites.has(item.id);
  const preview = mediaMarkup(item);
  const meta = `${mediaMeta(item)}${item.kind ? `<span class="tag">${escapeHtml(item.kind)}</span>` : ""}`;

  els.mediaModalBody.innerHTML = `
    <div class="modal__preview">${preview}</div>
    <div>
      <div class="tag-row" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          ${meta}
          ${item.folder ? `<span class="tag"><i class="bi bi-folder-fill"></i> ${escapeHtml(folderLabel(item.folder))}</span>` : ""}
        </div>
        <button class="mini-btn ${isFav ? "mini-btn--rose" : "mini-btn--ghost"}" type="button" id="btnPreviewFav" title="${isFav ? "Elimină din favorite" : "Adaugă la favorite"}">
          <i class="bi ${isFav ? "bi-heart-fill" : "bi-heart"}"></i> ${isFav ? "Favorit" : "Favorite"}
        </button>
      </div>
      <h2 style="margin:0.75rem 0 0.4rem;font-family:var(--font-photo);font-size:2.2rem;">${escapeHtml(item.title || "")}</h2>
      <p class="muted" style="line-height:1.6;">${escapeHtml(item.description || "Fără descriere")}</p>
      ${
        item.jsonMetadata
          ? `<details style="margin-top:1rem; font-size:0.8rem; background:rgba(0,0,0,0.3); padding:0.75rem; border-radius:var(--radius-md);">
              <summary style="cursor:pointer; color:var(--accent-light); font-weight:700;">Vezi Fișier JSON Metadate (${escapeHtml(item.jsonMetadata.jsonFile)})</summary>
              <pre style="margin-top:0.5rem; overflow-x:auto; color:#a78bfa;">${escapeHtml(JSON.stringify(item.jsonMetadata, null, 2))}</pre>
            </details>`
          : ""
      }
    </div>
  `;

  document.getElementById("btnPreviewFav")?.addEventListener("click", () => {
    toggleFavorite(item.id);
    openPreview(item);
  });

  if (typeof els.mediaModal.showModal === "function") {
    els.mediaModal.showModal();
  }
}

/* ============================================================
   CINEMATIC MODE (FULLSCREEN SLIDESHOW)
   ============================================================ */

function bindSlideshowEvents() {
  els.btnSlideshow?.addEventListener("click", () => openSlideshow(0));
  els.closeSlideshow?.addEventListener("click", closeSlideshow);
  els.previousSlide?.addEventListener("click", prevSlide);
  els.nextSlide?.addEventListener("click", nextSlide);
  els.slideshowFavBtn?.addEventListener("click", () => {
    const item = state.slideshowItems[state.slideshowIndex];
    if (item) toggleFavorite(item.id);
  });

  els.slideshowTimerSelector?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-timer]");
    if (!btn) return;
    const seconds = parseInt(btn.dataset.timer, 10);
    setSlideshowTimer(seconds);
  });

  document.addEventListener("keydown", handleSlideshowKeydown);
}

function handleSlideshowKeydown(e) {
  if (!state.isSlideshowActive) return;
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    prevSlide();
  } else if (e.key === "ArrowRight" || e.key === " ") {
    e.preventDefault();
    nextSlide();
  } else if (e.key === "Escape") {
    closeSlideshow();
  }
}

function openSlideshow(startIndex = 0) {
  const filtered = state.items.filter(matchesFilter);
  const pool = filtered.length > 0 ? filtered : state.items;

  if (pool.length === 0) {
    showToast("Nu există fotografii de afișat în Modul Cinematic!");
    return;
  }
  state.slideshowItems = pool;
  state.slideshowIndex = Math.max(0, Math.min(startIndex, pool.length - 1));
  state.isSlideshowActive = true;

  updateTimerChipsUI();

  if (els.slideshowModal) {
    if (typeof els.slideshowModal.showModal === "function") {
      try { els.slideshowModal.showModal(); } catch { els.slideshowModal.style.display = "block"; }
    } else {
      els.slideshowModal.style.display = "block";
    }
  }

  renderSlide(state.slideshowIndex);
  resetSlideshowTimer();
}

function renderSlide(index) {
  const item = state.slideshowItems[index];
  if (!item) return;

  if (els.slideshowStage) {
    if (item.kind === "video") {
      els.slideshowStage.innerHTML = `<video autoplay muted playsinline controls poster="${escapeAttr(item.poster || "images/Video.png")}"><source src="${escapeAttr(item.src)}" type="${escapeAttr(item.mimeType || "video/mp4")}" /></video>`;
    } else {
      els.slideshowStage.innerHTML = `<img src="${escapeAttr(item.src)}" alt="${escapeAttr(item.title)}" onerror="this.onerror=null;this.src='images/default.png';" />`;
    }
  }

  if (els.slideshowTitle) els.slideshowTitle.textContent = item.title || "Fără titlu";
  if (els.slideshowDescription) els.slideshowDescription.textContent = item.description || "";
  
  if (els.slideshowLocation && els.slideshowLocationText) {
    if (item.location) {
      els.slideshowLocation.style.display = "inline-flex";
      els.slideshowLocationText.textContent = item.location;
    } else {
      els.slideshowLocation.style.display = "none";
    }
  }

  if (els.slideshowTag && els.slideshowTagText) {
    const tagLabel = item.tag || folderLabel(item.folder);
    if (tagLabel) {
      els.slideshowTag.style.display = "inline-flex";
      els.slideshowTagText.textContent = tagLabel;
    } else {
      els.slideshowTag.style.display = "none";
    }
  }

  if (els.slideshowCounter) {
    els.slideshowCounter.textContent = `${index + 1} / ${state.slideshowItems.length}`;
  }

  updateSlideshowFavBtn();
}

function updateSlideshowFavBtn() {
  if (!els.slideshowFavBtn) return;
  const item = state.slideshowItems[state.slideshowIndex];
  if (!item) return;
  const isFav = state.favorites.has(item.id);
  els.slideshowFavBtn.className = `slideshow-fav-btn ${isFav ? "is-favorite" : ""}`;
  els.slideshowFavBtn.innerHTML = `<i class="bi ${isFav ? "bi-heart-fill" : "bi-heart"}"></i>`;
  els.slideshowFavBtn.title = isFav ? "Elimină din favorite" : "Adaugă la favorite";
}

function nextSlide() {
  if (!state.slideshowItems.length) return;
  state.slideshowIndex = (state.slideshowIndex + 1) % state.slideshowItems.length;
  renderSlide(state.slideshowIndex);
  resetSlideshowTimer();
}

function prevSlide() {
  if (!state.slideshowItems.length) return;
  state.slideshowIndex = (state.slideshowIndex - 1 + state.slideshowItems.length) % state.slideshowItems.length;
  renderSlide(state.slideshowIndex);
  resetSlideshowTimer();
}

function setSlideshowTimer(seconds) {
  state.slideshowTimerInterval = seconds;
  localStorage.setItem(STORAGE_KEY_CINEMATIC_TIMER, String(seconds));
  updateTimerChipsUI();
  resetSlideshowTimer();
  showToast(seconds === 0 ? "Derulare automată oprită (0s)" : `Timp derulare setat la ${seconds} secunde`);
}

function updateTimerChipsUI() {
  if (!els.slideshowTimerSelector) return;
  els.slideshowTimerSelector.querySelectorAll("[data-timer]").forEach((btn) => {
    const sec = parseInt(btn.dataset.timer, 10);
    btn.classList.toggle("is-active", sec === state.slideshowTimerInterval);
  });
}

function resetSlideshowTimer() {
  if (state.slideshowTimerId) {
    clearInterval(state.slideshowTimerId);
    state.slideshowTimerId = null;
  }
  if (state.isSlideshowActive && state.slideshowTimerInterval > 0) {
    state.slideshowTimerId = setInterval(() => {
      nextSlide();
    }, state.slideshowTimerInterval * 1000);
  }
}

function closeSlideshow() {
  if (state.slideshowTimerId) {
    clearInterval(state.slideshowTimerId);
    state.slideshowTimerId = null;
  }
  state.isSlideshowActive = false;
  if (els.slideshowModal) {
    if (typeof els.slideshowModal.close === "function") {
      els.slideshowModal.close();
    } else {
      els.slideshowModal.style.display = "none";
    }
  }
}
})();
