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
  document.getElementById("palette-settings").addEventListener("click", () => openModal({ heading: "Temă de culoare", options: [["violet", "Violet (principală)"], ["red", "Roșiatic"], ["white", "Alb simplu"], ["pink", "Roz"]].map(([value, label]) => ({ label, selected: ThemeManager.getPalette() === value, action: () => ThemeManager.setPalette(value) })), buttons: [{ label: "Anulează" }] }));
  document.getElementById("appearance-settings").addEventListener("click", () => openModal({ heading: "Aspect", options: [["light", "Deschis"], ["dark", "Întunecat"], ["auto", "Automat"]].map(([value, label]) => ({ label, selected: ThemeManager.getTheme() === value, action: () => ThemeManager.setAppearance(value) })), buttons: [{ label: "Anulează" }] }));
  const recipeStatus = document.getElementById("recipes-setting-status");
  const refreshRecipeStatus = () => { recipeStatus.textContent = BusuiocFeatures.recipesEnabled() ? "Activată — apare în navigare" : "Dezactivată — ascunsă din navigare"; };
  refreshRecipeStatus();
  document.getElementById("recipes-settings").addEventListener("click", () => openModal({ heading: "Extensia Rețete", text: "Oprită, pagina de rețete nu mai apare în bara de navigare.", options: [{ label: "Activată", selected: BusuiocFeatures.recipesEnabled(), action: () => { BusuiocFeatures.setRecipesEnabled(true); refreshRecipeStatus(); } }, { label: "Dezactivată", selected: !BusuiocFeatures.recipesEnabled(), action: () => { BusuiocFeatures.setRecipesEnabled(false); refreshRecipeStatus(); } }], buttons: [{ label: "Închide" }] }));
  document.getElementById("create-backup").addEventListener("click", async () => { const result = await window.mediaLibrary.createBackup(preferences()); if (!result?.canceled) notice("Backup creat cu succes."); });
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
