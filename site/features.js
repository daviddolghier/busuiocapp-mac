(() => {
  const enabled = () => localStorage.getItem("busuioc_recipes_enabled") !== "false";
  const apply = () => {
    document.querySelectorAll("[data-feature]").forEach((element) => {
      const feature = element.dataset.feature;
      const shouldHide = feature === "recipes" ? !enabled() : localStorage.getItem(`busuioc_${feature}_enabled`) === "false";
      element.hidden = shouldHide;
      element.classList.toggle("is-feature-hidden", shouldHide);
    });
    if (!enabled() && /recipes\.html$/i.test(location.pathname)) location.replace("index.html");
  };
  window.BusuiocFeatures = { recipesEnabled: enabled, setRecipesEnabled(value) { localStorage.setItem("busuioc_recipes_enabled", String(Boolean(value))); apply(); }, apply };
  apply();
})();
