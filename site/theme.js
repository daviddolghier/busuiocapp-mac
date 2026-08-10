(() => {
  const MODES = ["light", "dark", "auto"];
  const PALETTES = ["violet", "blue", "red", "pink", "white", "turquoise", "yellow"];
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  function mode() { return localStorage.getItem("appearance") || localStorage.getItem("theme") || "auto"; }
  function palette() { return localStorage.getItem("palette") || "violet"; }
  function apply() {
    const saved = mode();
    document.documentElement.dataset.theme = saved === "auto" ? (media.matches ? "dark" : "light") : saved;
    document.documentElement.dataset.palette = palette();
    const icon = document.getElementById("theme-icon");
    if (icon) icon.className = `bi bi-${saved === "dark" ? "sun" : saved === "light" ? "moon-stars" : "circle-half"}`;
  }
  function setAppearance(value) { if (MODES.includes(value)) { localStorage.setItem("appearance", value); apply(); } }
  function setPalette(value) { if (PALETTES.includes(value)) { localStorage.setItem("palette", value); apply(); } }
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("theme-toggle")?.addEventListener("click", (event) => { event.preventDefault(); setAppearance(MODES[(MODES.indexOf(mode()) + 1) % MODES.length]); });
    apply();
  });
  media.addEventListener("change", () => mode() === "auto" && apply());
  window.ThemeManager = { getTheme: mode, getPalette: palette, setTheme: setAppearance, setAppearance, setPalette, applyTheme: apply };
})();
