(() => {
  const DEFAULT_SHORTCUTS = {
    fullscreen: { key: "F11", label: "Ecran complet (Fullscreen)", desc: "Comută modul ecran complet" },
    home: { key: "F1", label: "Acasă", desc: "Deschide pagina principală" },
    gallery: { key: "F2", label: "Galerie", desc: "Deschide galeria foto & video" },
    anniversary: { key: "F3", label: "Aniversări", desc: "Deschide pagina de aniversări" },
    map: { key: "F4", label: "Hartă", desc: "Deschide harta amintirilor" },
    myplan: { key: "F5", label: "MyPlan", desc: "Deschide planurile voastre" },
    toggleTheme: { key: "F10", label: "Comută tema de culoare", desc: "Comută între temele de culoare" },
    toggleAppearance: { key: "F12", label: "Comută aspectul", desc: "Comută între modul întunecat și deschis" },
    arrowsNav: { key: "Arrows", label: "Navigare cu Săgețile + Enter", desc: "Selectare elemente pe pagină cu săgețile, Enter deschide/apasă" },
    addContent: { key: "Alt+N", label: "Adaugă conținut nou", desc: "Deschide modalul de adăugare poze / plan / rețetă" },
    easterEgg: { key: "Alt+F1", label: "Force Random Crash", desc: "Forțează un crash cu o eroare amuzantă" },
    closeApp: { key: "Alt+F4", label: "Închidere aplicație", desc: "Închide fereastra aplicației" }
  };

  const STORAGE_KEY = "busuioc_shortcuts";

  function getShortcuts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULT_SHORTCUTS);
      const custom = JSON.parse(raw);
      const merged = structuredClone(DEFAULT_SHORTCUTS);
      Object.keys(merged).forEach((id) => {
        if (custom[id] && custom[id].key) {
          merged[id].key = custom[id].key;
        }
      });
      // F12 era scurtătura implicită veche pentru teme; acum rămâne pentru aspect.
      if (merged.toggleTheme.key === "F12") merged.toggleTheme.key = DEFAULT_SHORTCUTS.toggleTheme.key;
      return merged;
    } catch {
      return structuredClone(DEFAULT_SHORTCUTS);
    }
  }

  function saveShortcuts(shortcuts) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(shortcuts));
    } catch (e) {
      console.error("Eroare la salvarea scurtăturilor:", e);
    }
  }

  function getEventCombo(e) {
    const parts = [];
    if (e.ctrlKey) parts.push("Ctrl");
    if (e.altKey) parts.push("Alt");
    if (e.shiftKey) parts.push("Shift");
    if (e.metaKey) parts.push("Meta");

    const key = e.key === " " ? "Space" : e.key;
    if (!["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
      parts.push(key.length === 1 ? key.toUpperCase() : key);
    }
    return parts.join("+");
  }

  // Easter Egg Crash Overlay
  function triggerEasterEggCrash() {
    if (document.getElementById("easterEggCrashOverlay")) return;

    const crashMessages = [
      "CRITICAL_BUSUIOC_OVERFLOW: Inima Adrianei și a lui Ștefan s-a umplut cu prea multe amintiri calde.",
      "KERNEL_ROMANTIC_PANIC: S-a depășit limita maximă admisă de zâmbete pe secundă.",
      "EXCEPTION_LOVE_NOT_FOUND: Eroare gravă — Nivelul de fericire a depășit capacitatea procesorului.",
      "SYSTEM_THREAD_BUSUIOC_NOT_EQUAL: Pătrunjelul a preluat controlul complet asupra aplicației.",
      "FATAL_WEDDING_COUNTDOWN_OVERLOAD: Cronometrul aniversar a explodat cu felicitări!"

    ];

    const randomMsg = crashMessages[Math.floor(Math.random() * crashMessages.length)];

    const overlay = document.createElement("div");
    overlay.id = "easterEggCrashOverlay";
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 999999;
      background: #0b0719; color: #f43f5e;
      font-family: 'Segoe UI', Consolas, monospace;
      padding: 3rem 2rem; display: flex; flex-direction: column;
      justify-content: center; align-items: center; text-align: center;
      box-shadow: inset 0 0 100px rgba(244, 63, 94, 0.2);
      animation: crashFadeIn 0.3s ease-out;
    `;

    overlay.innerHTML = `
      <div style="font-size: 5rem; margin-bottom: 1rem;">:(</div>
      <h1 style="font-size: 2.2rem; color: #fff; margin-bottom: 1rem; font-family: var(--font-display, serif);">A apărut o eroare neașteptată în Busuioc App</h1>
      <p style="font-size: 1.1rem; color: #fda4af; max-width: 650px; line-height: 1.6; margin-bottom: 2rem; background: rgba(244,63,94,0.1); padding: 1.2rem; border-radius: 12px; border: 1px solid rgba(244,63,94,0.3);">
        <strong>${randomMsg}</strong>
      </p>
      <p style="font-size: 0.9rem; color: #94a3b8; margin-bottom: 2rem;">
        Cod eroare: <span style="color: #fb7185;">0xBUSUIOC_ERROR_888</span>
        
        Daca e cod eroare 0xBUSUIOC_ERROR_888 atunci e fals xd
      </p>
      <button type="button" id="closeCrashBtn" style="
        padding: 0.85rem 1.8rem; border-radius: 999px; border: none;
        background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
        color: #fff; font-weight: 800; font-size: 1rem; cursor: pointer;
        box-shadow: 0 8px 25px rgba(244, 63, 94, 0.4); transition: transform 0.2s;
      ">Repornește sistemul</button>
    `;

    document.body.appendChild(overlay);
    document.getElementById("closeCrashBtn")?.addEventListener("click", () => {
      overlay.remove();
    });
  }

  // Arrow Key Navigation + Enter Simulation
  let focusedIndex = -1;
  function getNavigableElements() {
    const selector = ".gallery-card, .plan-card, .recipe-card, .timeline-card, .location-list__item, .settings-card, .nav__link, .btn, .chip";
    return Array.from(document.querySelectorAll(selector)).filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && getComputedStyle(el).visibility !== "hidden";
    });
  }

  function handleArrowNav(direction) {
    const elements = getNavigableElements();
    if (!elements.length) return;

    if (focusedIndex >= 0 && elements[focusedIndex]) {
      elements[focusedIndex].classList.remove("keyboard-focus-active");
    }

    if (direction === "next" || direction === "down") {
      focusedIndex = (focusedIndex + 1) % elements.length;
    } else if (direction === "prev" || direction === "up") {
      focusedIndex = (focusedIndex - 1 + elements.length) % elements.length;
    }

    const target = elements[focusedIndex];
    if (target) {
      target.classList.add("keyboard-focus-active");
      target.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function handleEnterClick() {
    const elements = getNavigableElements();
    if (focusedIndex >= 0 && elements[focusedIndex]) {
      elements[focusedIndex].click();
    }
  }

  // Global Keyboard Listener
  document.addEventListener("keydown", (e) => {
    // Ignore key combinations if user is inside form inputs (unless modifier shortcuts like Alt+N, Alt+F1, F11, etc.)
    const isEditingInput = ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    
    const combo = getEventCombo(e);
    const shortcuts = getShortcuts();

    // În aplicația desktop, Alt+F4 închide fereastra curentă.
    if (combo === shortcuts.closeApp.key || (e.altKey && e.key === "F4")) {
      e.preventDefault();
      window.close();
      return;
    }

    // Check Easter Egg (Alt+F1)
    if (combo === shortcuts.easterEgg.key || (e.altKey && e.key === "F1")) {
      e.preventDefault();
      triggerEasterEggCrash();
      return;
    }

    // Check Add Content (Alt+N / Alt+A)
    if (combo === shortcuts.addContent.key || (e.altKey && (e.key === "n" || e.key === "N" || e.key === "a" || e.key === "A"))) {
      e.preventDefault();
      const importBtn = document.getElementById("btnImportPhoto") || document.getElementById("createPlan") || document.getElementById("addRecipe");
      if (importBtn) {
        importBtn.click();
      } else {
        location.href = "galerie.html";
      }
      return;
    }

    if (isEditingInput && !["F11", "F10", "F12", "F1", "F2", "F3", "F4", "F5"].includes(e.key)) {
      return;
    }

    // Fullscreen (F11)
    if (combo === shortcuts.fullscreen.key || e.key === "F11") {
      e.preventDefault();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
      return;
    }

    // Page Navigation (F1 - F5)
    if (combo === shortcuts.home.key || e.key === "F1") { e.preventDefault(); location.href = "index.html"; return; }
    if (combo === shortcuts.gallery.key || e.key === "F2") { e.preventDefault(); location.href = "galerie.html"; return; }
    if (combo === shortcuts.anniversary.key || e.key === "F3") { e.preventDefault(); location.href = "aniversari.html"; return; }
    if (combo === shortcuts.map.key || e.key === "F4") { e.preventDefault(); location.href = "harta.html"; return; }
    if (combo === shortcuts.myplan.key || e.key === "F5") { e.preventDefault(); location.href = "myplan.html"; return; }

    // Toggle colour palette (F10)
    if (combo === shortcuts.toggleTheme.key || e.key === "F10") {
      e.preventDefault();
      if (window.ThemeManager) {
        const palettes = ["violet", "blue", "red", "pink", "white", "turquoise", "yellow"];
        const current = window.ThemeManager.getPalette();
        const next = palettes[(palettes.indexOf(current) + 1) % palettes.length];
        window.ThemeManager.setPalette(next);
      }
      return;
    }

    // Toggle appearance (F12)
    if (combo === shortcuts.toggleAppearance.key || e.key === "F12") {
      e.preventDefault();
      if (window.ThemeManager) {
        const current = window.ThemeManager.getTheme();
        window.ThemeManager.setAppearance(current === "dark" ? "light" : "dark");
      }
      return;
    }

    // Arrow Key Navigation
    if (!isEditingInput && ["ArrowDown", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      handleArrowNav("next");
      return;
    }
    if (!isEditingInput && ["ArrowUp", "ArrowLeft"].includes(e.key)) {
      e.preventDefault();
      handleArrowNav("prev");
      return;
    }
    if (!isEditingInput && e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      handleEnterClick();
      return;
    }
  });

  window.BusuiocShortcuts = {
    DEFAULT_SHORTCUTS,
    getShortcuts,
    saveShortcuts,
    getEventCombo,
    triggerEasterEggCrash
  };
})();
