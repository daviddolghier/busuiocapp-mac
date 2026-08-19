(() => {
  const enabled = (feature) => localStorage.getItem(`busuioc_${feature}_enabled`) !== "false";
  const apply = () => {
    document.querySelectorAll("[data-feature]").forEach((element) => {
      const feature = element.dataset.feature;
      const shouldHide = !enabled(feature);
      element.hidden = shouldHide;
      element.classList.toggle("is-feature-hidden", shouldHide);
      if (shouldHide) {
        element.style.setProperty("display", "none", "important");
      } else {
        element.style.removeProperty("display");
      }
    });
    if (!enabled("recipes") && /recipes\.html$/i.test(location.pathname)) location.replace("index.html");
    if (!enabled("music") && /music-player\.html$/i.test(location.pathname)) location.replace("index.html");
  };
  window.BusuiocFeatures = {
    recipesEnabled: () => enabled("recipes"),
    musicEnabled: () => enabled("music"),
    setRecipesEnabled(value) { localStorage.setItem("busuioc_recipes_enabled", String(Boolean(value))); apply(); },
    setMusicEnabled(value) { localStorage.setItem("busuioc_music_enabled", String(Boolean(value))); apply(); },
    apply,
  };
  apply();
})();
