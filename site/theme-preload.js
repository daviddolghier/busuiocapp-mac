(() => {
  try {
    const mode = localStorage.getItem("appearance") || localStorage.getItem("theme") || "auto";
    document.documentElement.dataset.theme = mode === "auto" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : mode;
    document.documentElement.dataset.palette = localStorage.getItem("palette") || "violet";
  } catch { /* The regular theme script applies the default after loading. */ }
})();
