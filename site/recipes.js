(() => {
  const STORAGE_KEY = "busuioc_recipes";
  const els = {
    grid: document.getElementById("recipesGrid"), search: document.getElementById("recipeSearch"), dialog: document.getElementById("recipeDialog"), form: document.getElementById("recipeForm"), title: document.getElementById("recipeTitle"), category: document.getElementById("recipeCategory"), ingredients: document.getElementById("recipeIngredients"), time: document.getElementById("recipeTime"), steps: document.getElementById("recipeSteps"), toast: document.getElementById("recipeToast"), layout: document.getElementById("toggleLayout"), imagePreview: document.getElementById("recipeImagePreview"), imageName: document.getElementById("recipeImageName"), imageFile: document.getElementById("recipeImageFile"), clearImage: document.getElementById("clearRecipeImage")
  };
  const DEFAULT_RECIPES = [
    { id: "paste-cremoase",
      title: "Paste cremoase cu parmezan",
      category: "main", ingredients: "paste, parmezan, smântână, usturoi, piper",
      time: "25 min",
      image: "images/newphoto/adri and stefan at chisinau convention.jpg",
      steps: "1. Fierbe pastele al dente.\n2. Pregătește sosul cu smântână, usturoi și parmezan.\n3. Amestecă pastele în sos și servește cu piper proaspăt."
    },
    { id: "pancakes",
      title: "Pancakes",
      category: "main",
      ingredients: "făină, ouă, lapte, unt, miere",
      time: "20 min",
      image: "images/newphoto/adri in rochie.jpg",
      steps: "1. Amestecă ingredientele până obții un aluat fin.\n2. Coace clătitele într-o tigaie încinsă.\n3. Servește cu miere și fructe." },
    { id: "limonada",
      title: "Limonadă cu mentă",
      category: "other",
      ingredients: "lămâi, mentă, miere, apă minerală",
      time: "10 min",
      image: "images/newphoto/both admiring sunset at orhei.jpg",
      steps: "1. Stoarce lămâile.\n2. Adaugă miere și mentă.\n3. Completează cu apă minerală și gheață." }
  ];
  DEFAULT_RECIPES.push(
    { id: "orez-legume", title: "Orez cu legume", category: "main", ingredients: "orez, morcov, ardei, mazare, ceapa", time: "35 min", image: "images/newphoto/both at orhei lake.jpg", steps: "1. Caleste ceapa si legumele.\n2. Adauga orezul si apa.\n3. Fierbe la foc mic pana devine pufos." },
    { id: "supa-legume", title: "Supa simpla de legume", category: "main", ingredients: "cartofi, morcov, ceapa, dovlecel, verdeata", time: "40 min", image: "images/newphoto/family photo at convention.jpg", steps: "1. Taie legumele cubulete.\n2. Fierbe-le in apa cu putina sare.\n3. Adauga verdeata la final." },
    { id: "salata-greceasca", title: "Salata greceasca", category: "main", ingredients: "rosii, castravete, masline, feta, ulei de masline", time: "15 min", image: "images/newphoto/both at chisinau, port mall, at a restaurant.jpg", steps: "1. Taie legumele.\n2. Adauga feta si maslinele.\n3. Stropeste cu ulei de masline." },
    { id: "sos-usturoi", title: "Sos de usturoi", category: "other", ingredients: "usturoi, iaurt grecesc, lamaie, sare, marar", time: "5 min", image: "images/newphoto/both taking photo in mirror stefans home.jpg", steps: "1. Zdrobeste usturoiul.\n2. Amesteca-l cu iaurt si lamaie.\n3. Adauga mararul." },
    { id: "cafea-rece", title: "Cafea rece", category: "other", ingredients: "espresso, lapte, gheata, sirop de vanilie", time: "5 min", image: "images/newphoto/both admiring sunset at orhei.jpg", steps: "1. Pune gheata in pahar.\n2. Adauga laptele si espresso-ul racit.\n3. Indulceste dupa gust." },
    { id: "bruschete", title: "Bruschete cu rosii", category: "other", ingredients: "paine, rosii, busuioc, usturoi, ulei de masline", time: "15 min", image: "images/newphoto/both sat down in hotel, bucharest.jpg", steps: "1. Prajeste feliile de paine.\n2. Freaca-le cu usturoi.\n3. Pune rosiile cu busuioc si ulei." }
  );
  let recipes = [];
  let activeCategory = "main";
  let editingId = null;
  let draftImage = "";
  let portrait = localStorage.getItem("busuioc_recipes_layout") === "portrait";
  const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const id = () => `recipe_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const showToast = message => { els.toast.textContent = message; els.toast.classList.add("is-visible"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => els.toast.classList.remove("is-visible"), 2500); };
  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
  const safeImage = recipe => recipe.image || "images/default.png";
  function setPortrait(value) {
    portrait = value;
    localStorage.setItem("busuioc_recipes_layout", portrait ? "portrait" : "expanded");
    els.grid.classList.toggle("recipes-grid--portrait", portrait);
    els.layout.querySelector("i").className = `bi bi-${portrait ? "view-stacked" : "grid-3x3-gap"}`;
    els.layout.querySelector("span").textContent = portrait ? "Aranjare lungă" : "Aranjare portret";
  }
  function render() {
    const query = els.search.value.trim().toLocaleLowerCase("ro");
    const visible = recipes.filter(recipe => recipe.category === activeCategory && `${recipe.title} ${recipe.ingredients}`.toLocaleLowerCase("ro").includes(query));
    els.grid.innerHTML = visible.length ? visible.map(recipe => `<article class="recipe-card" data-recipe-id="${escapeHtml(recipe.id)}"><div class="recipe-card__image"><img src="${escapeHtml(safeImage(recipe))}" alt="${escapeHtml(recipe.title)}" onerror="this.src='images/default.png'" /><span class="recipe-card__time"><i class="bi bi-clock"></i>${escapeHtml(recipe.time || "La alegere")}</span></div><div class="recipe-card__content"><div><p class="recipe-card__kicker">${recipe.category === "main" ? "Rețetă principală" : "Altele"}</p><h2>${escapeHtml(recipe.title)}</h2></div><p class="recipe-card__ingredients"><i class="bi bi-basket2"></i>${escapeHtml(recipe.ingredients)}</p><button class="recipe-card__more" data-action="toggle-details" type="button">Vezi rețeta întreagă <i class="bi bi-arrow-right"></i></button><div class="recipe-card__details"><p>${escapeHtml(recipe.steps || "Adaugă pașii rețetei din Editare.").replace(/\n/g, "<br>")}</p><div class="recipe-card__actions"><button class="icon-btn" data-action="edit" type="button" title="Editează rețeta"><i class="bi bi-pencil"></i></button><button class="icon-btn recipe-card__delete" data-action="delete" type="button" title="Șterge rețeta"><i class="bi bi-trash3"></i></button></div></div></div></article>`).join("") : `<div class="recipes-empty"><i class="bi bi-journal-plus"></i><h2>Nicio rețetă aici încă</h2><p>Adaugă una nouă pentru colecția voastră.</p><button class="btn btn--primary" data-action="add-empty" type="button"><i class="bi bi-plus-lg"></i> Adaugă rețetă</button></div>`;
    setPortrait(portrait);
  }
  function updateImagePicker(image = "", name = "") {
    draftImage = image;
    els.imagePreview.hidden = !image;
    els.imagePreview.src = image || "";
    els.imageName.textContent = image ? (name || "Imagine selectată") : "Opțional — alege direct din calculator.";
    els.clearImage.hidden = !image;
  }
  function openEditor(recipe) {
    editingId = recipe?.id || null;
    document.getElementById("recipeDialogTitle").textContent = recipe ? "Editează rețeta" : "Adaugă o rețetă";
    els.title.value = recipe?.title || ""; els.category.value = recipe?.category || activeCategory; els.ingredients.value = recipe?.ingredients || ""; els.time.value = recipe?.time || ""; els.steps.value = recipe?.steps || "";
    updateImagePicker(recipe?.image || "", recipe?.image ? "Imaginea rețetei" : "");
    els.dialog.showModal(); els.title.focus();
  }
  function closeEditor() { els.dialog.close(); }
  try { recipes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || structuredClone(DEFAULT_RECIPES); } catch { recipes = structuredClone(DEFAULT_RECIPES); }
  if (!localStorage.getItem(STORAGE_KEY)) save();
  document.querySelectorAll(".recipe-tab").forEach(button => button.addEventListener("click", () => { activeCategory = button.dataset.category; document.querySelectorAll(".recipe-tab").forEach(tab => tab.classList.toggle("is-active", tab === button)); render(); }));
  els.search.addEventListener("input", render);
  document.getElementById("addRecipe").onclick = () => openEditor();
  document.getElementById("editRecipes").onclick = () => { setPortrait(false); showToast("Alege o rețetă și apasă creionul pentru editare."); };
  document.getElementById("focusSearch").onclick = () => { document.getElementById("recipeSearchArea").scrollIntoView({ behavior: "smooth", block: "center" }); setTimeout(() => els.search.focus(), 350); };
  els.layout.onclick = () => setPortrait(!portrait);
  document.getElementById("closeRecipeDialog").onclick = closeEditor; document.getElementById("cancelRecipe").onclick = closeEditor;
  async function pickImage() {
    try {
      if (window.mediaLibrary?.importRecipeImage) {
        const result = await window.mediaLibrary.importRecipeImage();
        if (!result?.canceled) updateImagePicker(result.src, result.name);
      } else els.imageFile.click();
    } catch { showToast("Imaginea nu a putut fi importată."); }
  }
  document.getElementById("importRecipeImage").onclick = pickImage;
  els.clearImage.onclick = () => updateImagePicker();
  els.imageFile.addEventListener("change", event => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => updateImagePicker(reader.result, file.name); reader.readAsDataURL(file); });
  els.form.addEventListener("submit", event => { event.preventDefault(); const recipe = { id: editingId || id(), title: els.title.value.trim(), category: els.category.value, ingredients: els.ingredients.value.trim(), time: els.time.value.trim(), image: draftImage, steps: els.steps.value.trim() }; recipes = editingId ? recipes.map(item => item.id === editingId ? recipe : item) : [recipe, ...recipes]; save(); activeCategory = recipe.category; document.querySelectorAll(".recipe-tab").forEach(tab => tab.classList.toggle("is-active", tab.dataset.category === activeCategory)); closeEditor(); render(); showToast("Rețeta a fost salvată."); });
  els.grid.addEventListener("click", event => { const action = event.target.closest("[data-action]")?.dataset.action; const card = event.target.closest("[data-recipe-id]"); if (action === "add-empty") return openEditor(); if (!card) return; const recipe = recipes.find(item => item.id === card.dataset.recipeId); if (action === "edit") return openEditor(recipe); if (action === "delete") { if (confirm(`Ștergi rețeta „${recipe.title}”?`)) { recipes = recipes.filter(item => item.id !== recipe.id); save(); render(); showToast("Rețeta a fost ștearsă."); } return; } if (action === "toggle-details") card.classList.toggle("is-open"); });
  render();
})();
