(() => {
  const dialog = document.getElementById("settings-dialog"), title = document.getElementById("dialog-title"), body = document.getElementById("dialog-body"), actions = document.getElementById("dialog-actions"), toast = document.getElementById("toast");
  const preferences = () => Object.fromEntries(Object.keys(localStorage).map((key) => [key, localStorage.getItem(key)]));
  const notice = (message) => { toast.textContent = message; toast.classList.add("show"); setTimeout(() => toast.classList.remove("show"), 3500); };
  const close = () => dialog.close();
  document.getElementById("dialog-close").addEventListener("click", close);
  dialog.addEventListener("click", (event) => { if (event.target === dialog) close(); });
  function openModal({ heading, text = "", options = [], buttons = [] }) {
    title.textContent = heading; body.innerHTML = text ? `<p>${text}</p>` : "";
    if (options.length) { const list = document.createElement("div"); list.className = "dialog-options"; options.forEach((option) => { const button = document.createElement("button"); button.className = "dialog-option"; button.type = "button"; button.innerHTML = `<span>${option.icon ? `<i class="bi ${option.icon}"></i> ` : ""}${option.label}</span>${option.selected ? '<i class="bi bi-check-circle-fill check"></i>' : ""}`; button.addEventListener("click", () => { option.action(); close(); }); list.appendChild(button); }); body.appendChild(list); }
    actions.innerHTML = ""; buttons.forEach((item) => { const button = document.createElement("button"); button.type = "button"; button.className = `dialog-action ${item.variant || ""}`; button.textContent = item.label; button.addEventListener("click", () => { item.action?.(); if (!item.keepOpen) close(); }); actions.appendChild(button); }); dialog.showModal();
  }
  document.getElementById("palette-settings").addEventListener("click", () => openModal({ heading: "Temă de culoare", options: [["violet", "Violet (principală)"], ["blue", "Albastru"], ["red", "Roșiatic"], ["pink", "Roz"], ["white", "Alb simplu"], ["turquoise", "Turcoaz"], ["yellow", "Galben"]].map(([value, label]) => ({ label, selected: ThemeManager.getPalette() === value, action: () => ThemeManager.setPalette(value) })), buttons: [{ label: "Anulează" }] }));
  document.getElementById("appearance-settings").addEventListener("click", () => openModal({ heading: "Aspect", options: [["light", "Deschis"], ["dark", "Întunecat"], ["auto", "Automat"]].map(([value, label]) => ({ label, selected: ThemeManager.getTheme() === value, action: () => ThemeManager.setAppearance(value) })), buttons: [{ label: "Anulează" }] }));
  const formatBytes = (bytes) => `${(Math.max(0, bytes || 0) / 1024 / 1024).toFixed(2)}MB`;
  document.getElementById("clear-cache").addEventListener("click", async () => {
    try {
      const size = await window.mediaLibrary.getCacheSize();
      const formatted = formatBytes(size);
      openModal({ heading: "Curățare cache", text: `<strong style="display:block;font-size:1.4rem;color:var(--text);text-align:center;padding:.8rem 0">Salvează ${formatted}</strong>`, buttons: [{ label: "Anulează" }, { label: `Curăță ${formatted}`, variant: "dialog-action--primary", action: async () => { const cleared = await window.mediaLibrary.clearCache(); notice(`Au fost eliberați ${formatBytes(cleared)}.`); } }] });
    } catch { notice("Cache-ul nu a putut fi analizat."); }
  });
  const recipeStatus = document.getElementById("recipes-setting-status");
  const refreshRecipeStatus = () => { recipeStatus.textContent = BusuiocFeatures.recipesEnabled() ? "Activată — apare în navigare" : "Dezactivată — ascunsă din navigare"; };
  const musicStatus = document.getElementById("music-setting-status");
  const refreshMusicStatus = () => { musicStatus.textContent = BusuiocFeatures.musicEnabled() ? "Activată — apare în navigare" : "Dezactivată — ascunsă din navigare"; };
  refreshRecipeStatus();
  refreshMusicStatus();
  document.getElementById("recipes-settings").addEventListener("click", () => openModal({ heading: "Extensia Rețete", text: "Oprită, pagina de rețete nu mai apare în bara de navigare.", options: [{ label: "Activată", selected: BusuiocFeatures.recipesEnabled(), action: () => { BusuiocFeatures.setRecipesEnabled(true); refreshRecipeStatus(); } }, { label: "Dezactivată", selected: !BusuiocFeatures.recipesEnabled(), action: () => { BusuiocFeatures.setRecipesEnabled(false); refreshRecipeStatus(); } }], buttons: [{ label: "Închide" }] }));
  document.getElementById("music-settings").addEventListener("click", () => openModal({ heading: "Extensia Music Player", text: "Oprită, playerul nu mai apare în bara de navigare.", options: [{ label: "Activată", selected: BusuiocFeatures.musicEnabled(), action: () => { BusuiocFeatures.setMusicEnabled(true); refreshMusicStatus(); } }, { label: "Dezactivată", selected: !BusuiocFeatures.musicEnabled(), action: () => { BusuiocFeatures.setMusicEnabled(false); refreshMusicStatus(); } }], buttons: [{ label: "Închide" }] }));
  document.getElementById("create-backup").addEventListener("click", async () => { const result = await window.mediaLibrary.createBackup(preferences()); if (!result?.canceled) notice("Backup creat cu succes."); });
  const crcTableClient = Array.from({ length: 256 }, (_, i) => {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
    return c >>> 0;
  });

  function crc32Client(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ crcTableClient[(c ^ buf[i]) & 0xff];
    return (c ^ 0xffffffff) >>> 0;
  }

  function createZipBlob(entries) {
    let offset = 0;
    const parts = [], central = [];
    const encoder = new TextEncoder();
    for (const entry of entries) {
      const nameBytes = encoder.encode(entry.name.replace(/\\/g, "/"));
      const dataBytes = entry.data instanceof Uint8Array ? entry.data : new Uint8Array(entry.data);
      const crc = crc32Client(dataBytes);

      const local = new Uint8Array(30 + nameBytes.length);
      const view = new DataView(local.buffer);
      view.setUint32(0, 0x04034b50, true);
      view.setUint16(4, 20, true);
      view.setUint32(14, crc, true);
      view.setUint32(18, dataBytes.length, true);
      view.setUint32(22, dataBytes.length, true);
      view.setUint16(26, nameBytes.length, true);
      local.set(nameBytes, 30);
      parts.push(local, dataBytes);

      const header = new Uint8Array(46 + nameBytes.length);
      const hView = new DataView(header.buffer);
      hView.setUint32(0, 0x02014b50, true);
      hView.setUint16(4, 20, true);
      hView.setUint16(6, 20, true);
      hView.setUint32(16, crc, true);
      hView.setUint32(20, dataBytes.length, true);
      hView.setUint32(24, dataBytes.length, true);
      hView.setUint16(28, nameBytes.length, true);
      hView.setUint32(42, offset, true);
      header.set(nameBytes, 46);
      central.push(header);
      offset += local.length + dataBytes.length;
    }

    let centralSize = 0;
    central.forEach((c) => centralSize += c.length);

    const end = new Uint8Array(22);
    const eView = new DataView(end.buffer);
    eView.setUint32(0, 0x06054b50, true);
    eView.setUint16(8, entries.length, true);
    eView.setUint16(10, entries.length, true);
    eView.setUint32(12, centralSize, true);
    eView.setUint32(16, offset, true);

    return new Blob([...parts, ...central, end], { type: "application/zip" });
  }

  async function fetchOrLoadBytes(url) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        return new Uint8Array(buf);
      }
    } catch { /* fetch fails on file:// scheme in Chromium */ }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width || 800;
          canvas.height = img.naturalHeight || img.height || 600;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
          const base64 = dataUrl.split(",")[1];
          const binary = atob(base64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          resolve(bytes);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = (err) => reject(err);
      img.src = url;
    });
  }

  async function downloadUrlsAsZip(urls, zipFilename) {
    notice("Pregătire fișiere pentru descărcare...");
    const entries = [];
    const usedNames = new Set();
    for (const url of urls) {
      try {
        const bytes = await fetchOrLoadBytes(url);
        if (!bytes || !bytes.length) continue;
        let rawName = url.split("/").pop() || "media";
        if (usedNames.has(rawName.toLowerCase())) {
          const parts = rawName.split(".");
          const ext = parts.length > 1 ? `.${parts.pop()}` : "";
          const name = parts.join(".");
          rawName = `${name}_${Date.now().toString().slice(-4)}${ext}`;
        }
        usedNames.add(rawName.toLowerCase());
        entries.push({ name: rawName, data: bytes });
      } catch (e) {
        console.warn("Eroare la descărcare url:", url, e);
      }
    }
    if (!entries.length) {
      throw new Error("Nu s-au găsit fișiere pentru descărcat.");
    }
    const zipBlob = createZipBlob(entries);
    const link = document.createElement("a");
    link.href = URL.createObjectURL(zipBlob);
    link.download = zipFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(link.href), 10000);
    return entries.length;
  }

  const exportMediaBtn = document.getElementById("export-media-zip");
  if (exportMediaBtn) {
    exportMediaBtn.addEventListener("click", async () => {
      try {
        if (window.mediaLibrary?.exportMediaZip) {
          const result = await window.mediaLibrary.exportMediaZip();
          if (result) {
            if (result.canceled) return; // User canceled save dialog
            if (result.empty) {
              notice("Nu există fotografii sau videoclipuri de descărcat.");
              return;
            }
            notice(`Arhivă media cu ${result.count} fișiere descărcată cu succes.`);
            return;
          }
        }
        // Fallback for browser mode only
        const seedItems = window.SEED_MEDIA || window.JourneyMap?.SEED_MEDIA || [];
        const mediaUrls = seedItems
          .map((item) => item.src)
          .filter((src) => src && typeof src === "string" && !src.includes("/food/"));
        if (!mediaUrls.length) {
          throw new Error("Nu există fotografii sau videoclipuri de descărcat.");
        }
        const count = await downloadUrlsAsZip(mediaUrls, `Busuioc-Media-${new Date().toISOString().slice(0, 10)}.zip`);
        notice(`Arhivă media cu ${count} fișiere descărcată cu succes.`);
      } catch (error) {
        notice(error.message || "Descărcarea arhivei media a eșuat.");
      }
    });
  }

  const exportFoodBtn = document.getElementById("export-food-zip");
  if (exportFoodBtn) {
    exportFoodBtn.addEventListener("click", async () => {
      try {
        if (window.mediaLibrary?.exportFoodZip) {
          const result = await window.mediaLibrary.exportFoodZip();
          if (result) {
            if (result.canceled) return; // User canceled save dialog
            if (result.empty) {
              notice("Nu există poze cu mâncare de descărcat.");
              return;
            }
            notice(`Arhivă mâncare cu ${result.count} imagini descărcată cu succes.`);
            return;
          }
        }
        // Fallback for browser mode only
        const foodUrls = [
          "images/food/cartofi-prajiti.jpg",
          "images/food/placinte-cu-branza.jpg",
          "images/food/spaghetti-bolognese.jpg",
          "images/food/napolitana.jpg",
          "images/food/spaghetti-carbonara.jpg",
          "images/food/pancake-americane.jpg",
          "images/food/clatite.jpg",
          "images/food/pelimeni.jpg",
          "images/food/zeama-de-pui.jpg",
          "images/food/omleta-mega.jpg",
          "images/food/shakshuka.jpg",
          "images/food/tzatziki.jpg"
        ];
        const count = await downloadUrlsAsZip(foodUrls, `Busuioc-Mancare-${new Date().toISOString().slice(0, 10)}.zip`);
        notice(`Arhivă mâncare cu ${count} imagini descărcată cu succes.`);
      } catch (error) {
        notice(error.message || "Descărcarea arhivei mâncare a eșuat.");
      }
    });
  }
  document.getElementById("import-backup").addEventListener("click", async () => { try { const picked = await window.mediaLibrary.chooseBackup(); if (picked?.canceled) return; openModal({ heading: "Importă backup", text: `Sigur importați acest backup? Conține ${picked.mediaCount} fișiere media.`, buttons: [{ label: "Anulează" }, { label: "Continuă", variant: "dialog-action--primary", action: () => setTimeout(() => chooseRestore(picked), 0) }] }); } catch (error) { notice(error.message || "Backupul nu este valid."); } });
  function chooseRestore(picked) { openModal({ heading: "Cum importăm backupul?", text: "Rescrierea înlocuiește datele actuale. Combinarea păstrează datele existente și adaugă doar ce lipsește.", buttons: [{ label: "Anulează" }, { label: "Combină", variant: "dialog-action--primary", action: () => restore(picked, "merge") }, { label: "Rescrie tot", variant: "dialog-action--danger", action: () => restore(picked, "overwrite") }] }); }
  async function restore(picked, mode) { try { const result = await window.mediaLibrary.restoreBackup({ filePath: picked.path, mode }); if (mode === "overwrite") localStorage.clear(); Object.entries(result.preferences || {}).forEach(([key, value]) => { if (mode === "overwrite" || localStorage.getItem(key) === null) localStorage.setItem(key, value); }); ThemeManager.applyTheme(); notice("Backup importat. Galeria va fi actualizată la următoarea deschidere."); } catch (error) { notice(error.message || "Importul backupului a eșuat."); } }
  document.getElementById("reset-all").addEventListener("click", () => openModal({ heading: "Resetează tot?", text: "Sunteți sigur că resetați tot? Aceasta include fotografiile salvate, cum sunt poziționate și setările dvs!", buttons: [{ label: "Anulează" }, { label: "Da, continuă", variant: "dialog-action--danger", action: () => setTimeout(askBackupBeforeReset, 0) }] }));
  function askBackupBeforeReset() { openModal({ heading: "Creezi un backup înainte?", text: "După resetare, datele nu mai pot fi recuperate.", buttons: [{ label: "Nu, resetează", variant: "dialog-action--danger", action: resetEverything }, { label: "Da, creează backup", variant: "dialog-action--primary", action: async () => { const result = await window.mediaLibrary.createBackup(preferences()); if (!result?.canceled) await resetEverything(); } }] }); }
  async function resetEverything() { await window.mediaLibrary.resetEverything(); localStorage.clear(); location.href = "index.html"; }

  // Shortcuts Settings Modal
  const shortcutsBtn = document.getElementById("shortcuts-settings");
  if (shortcutsBtn) {
    shortcutsBtn.addEventListener("click", openShortcutsModal);
  }

  function openShortcutsModal() {
    const shortcuts = window.BusuiocShortcuts ? window.BusuiocShortcuts.getShortcuts() : {};
    
    title.textContent = "Scurtături de tastatură (Shortcuts)";
    body.innerHTML = `
      <p style="margin-bottom:1rem; font-size:0.9rem; color:var(--muted);">Apasă pe orice scurtătură pentru a-i schimba combinația de taste.</p>
      <div class="shortcuts-grid" style="display:grid; gap:0.6rem; max-height:55vh; overflow-y:auto; padding-right:0.3rem;">
        ${Object.entries(shortcuts).map(([id, item]) => `
          <button type="button" class="dialog-option shortcut-item" data-shortcut-id="${id}" style="display:flex; justify-content:space-between; align-items:center; width:100%;">
            <div style="display:flex; flex-direction:column; gap:0.15rem; text-align:left;">
              <strong>${item.label}</strong>
              <small style="color:var(--muted); font-size:0.78rem;">${item.desc}</small>
            </div>
            <span class="chip chip--soft" style="font-family:monospace; font-weight:800; font-size:0.85rem; pointer-events:none;">${item.key}</span>
          </button>
        `).join("")}
      </div>
    `;

    actions.innerHTML = "";
    
    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.className = "dialog-action dialog-action--danger";
    resetBtn.textContent = "Resetează la implicite";
    resetBtn.addEventListener("click", () => {
      localStorage.removeItem("busuioc_shortcuts");
      notice("Scurtăturile au fost resetate la valorile implicite.");
      openShortcutsModal();
    });

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "dialog-action";
    closeBtn.textContent = "Închide";
    closeBtn.addEventListener("click", close);

    actions.appendChild(resetBtn);
    actions.appendChild(closeBtn);

    body.querySelectorAll(".shortcut-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.shortcutId;
        startRebindShortcut(id, shortcuts[id]);
      });
    });

    dialog.showModal();
  }

  function startRebindShortcut(id, shortcutItem) {
    title.textContent = `Modifică scurtătura: ${shortcutItem.label}`;
    body.innerHTML = `
      <div style="text-align:center; padding:1.5rem 1rem;">
        <i class="bi bi-keyboard" style="font-size:3rem; color:var(--accent-light); display:block; margin-bottom:0.75rem;"></i>
        <h3>Apasă noua combinație de taste...</h3>
        <p style="color:var(--muted); font-size:0.9rem; margin-top:0.5rem;">De exemplu: Ctrl+Alt+S, F8, Alt+H. Tasta Escape anulează.</p>
        <div id="rebindKeyDisplay" style="margin-top:1.5rem; font-size:1.4rem; font-weight:800; font-family:monospace; color:var(--accent-light); min-height:2rem;">
          Așteptare taste...
        </div>
      </div>
    `;

    actions.innerHTML = "";
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "dialog-action";
    cancelBtn.textContent = "Anulează";
    cancelBtn.addEventListener("click", openShortcutsModal);
    actions.appendChild(cancelBtn);

    function onKeyDownCapture(e) {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === "Escape" && !e.ctrlKey && !e.altKey && !e.shiftKey) {
        document.removeEventListener("keydown", onKeyDownCapture, true);
        openShortcutsModal();
        return;
      }

      const combo = window.BusuiocShortcuts ? window.BusuiocShortcuts.getEventCombo(e) : "";
      if (combo && !["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
        document.removeEventListener("keydown", onKeyDownCapture, true);
        const shortcuts = window.BusuiocShortcuts.getShortcuts();
        if (shortcuts[id]) {
          shortcuts[id].key = combo;
          window.BusuiocShortcuts.saveShortcuts(shortcuts);
          notice(`Scurtătură salvată: ${shortcutItem.label} → ${combo}`);
        }
        openShortcutsModal();
      } else {
        const display = document.getElementById("rebindKeyDisplay");
        if (display && combo) display.textContent = combo + "...";
      }
    }

    document.addEventListener("keydown", onKeyDownCapture, true);
  }
})();
