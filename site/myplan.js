(() => {
  const els = {
    grid: document.getElementById("plansGrid"),
    dialog: document.getElementById("planDialog"),
    form: document.getElementById("planForm"),
    title: document.getElementById("planTitle"),
    type: document.getElementById("planType"),
    date: document.getElementById("planDate"),
    notes: document.getElementById("planNotes"),
    taskEditor: document.getElementById("taskEditor"),
    attachmentEditor: document.getElementById("attachmentEditor"),
    toast: document.getElementById("planToast"),
  };

  const DEFAULT_PLANS = [
    {
      id: "future-home",
      title: "Casa noastră viitoare",
      type: "Proiect",
      eventDate: "",
      notes: "Un loc al nostru, construit pas cu pas.",
      attachments: [],
      tasks: [
        { id: "home-location", text: "De ales locația", done: false },
        { id: "home-budget", text: "De calculat cheltuiala", done: false },
        { id: "home-style", text: "De adunat idei pentru stilul casei", done: false },
        { id: "home-priorities", text: "De stabilit prioritățile", done: false },
      ],
    },
  ];

  const STORAGE_KEY_PLANS = "busuioc_plans";
  let plans = [];
  let editingId = null;
  let draftTasks = [];
  let draftAttachments = [];

  const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const makeId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const showToast = (message) => {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => els.toast.classList.remove("is-visible"), 2600);
  };

  async function load() {
    try {
      if (window.mediaLibrary?.listPlans) {
        const loaded = await window.mediaLibrary.listPlans();
        if (Array.isArray(loaded) && loaded.length > 0) {
          plans = loaded;
        } else {
          const raw = localStorage.getItem(STORAGE_KEY_PLANS);
          plans = raw ? JSON.parse(raw) : structuredClone(DEFAULT_PLANS);
          if (!raw) {
            await window.mediaLibrary.savePlans(plans);
          }
        }
      } else {
        const raw = localStorage.getItem(STORAGE_KEY_PLANS);
        plans = raw ? JSON.parse(raw) : structuredClone(DEFAULT_PLANS);
      }
    } catch (e) {
      console.warn("Eroare la încărcare planuri Electron:", e);
      try {
        const raw = localStorage.getItem(STORAGE_KEY_PLANS);
        plans = raw ? JSON.parse(raw) : structuredClone(DEFAULT_PLANS);
      } catch {
        plans = structuredClone(DEFAULT_PLANS);
      }
    }
    renderPlans();
  }

  async function persist() {
    try {
      localStorage.setItem(STORAGE_KEY_PLANS, JSON.stringify(plans));
      if (window.mediaLibrary?.savePlans) {
        plans = await window.mediaLibrary.savePlans(plans);
      }
    } catch (e) {
      console.error("Eroare la salvarea planurilor:", e);
    }
    renderPlans();
  }

  function renderPlans() {
    if (!plans.length) {
      els.grid.innerHTML = `<div class="plans-empty"><i class="bi bi-journal-plus"></i><h2>Primul plan vă așteaptă</h2><p>Apăsați „Creează un plan nou” pentru a începe.</p></div>`;
      return;
    }
    els.grid.innerHTML = plans.map((plan) => {
      const done = plan.tasks.filter((task) => task.done).length;
      const date = plan.eventDate ? new Intl.DateTimeFormat("ro-RO", { day: "numeric", month: "long", year: "numeric" }).format(new Date(`${plan.eventDate}T12:00:00`)) : "Fără dată stabilită";
      return `<article class="plan-card" data-plan-id="${escapeHtml(plan.id)}">
        <div class="plan-card__head">
          <div>
            <span class="plan-type"><i class="bi bi-${iconFor(plan.type)}"></i> ${escapeHtml(plan.type)}</span>
            <h2>${escapeHtml(plan.title)}</h2>
            <p class="plan-date"><i class="bi bi-calendar3"></i> ${escapeHtml(date)}</p>
          </div>
          <button class="icon-btn" data-action="edit" title="Editează planul"><i class="bi bi-pencil-square"></i></button>
        </div>
        ${plan.notes ? `<p class="plan-notes">${escapeHtml(plan.notes)}</p>` : ""}
        <div class="plan-progress"><span style="width:${plan.tasks.length ? (done / plan.tasks.length) * 100 : 0}%"></span></div>
        <p class="plan-progress__label">${done} din ${plan.tasks.length} pași realizați</p>
        <ul class="plan-tasks">
          ${plan.tasks.map((task) => `<li class="${task.done ? "is-done" : ""}"><label><input type="checkbox" data-action="toggle-task" data-task-id="${escapeHtml(task.id)}" ${task.done ? "checked" : ""} /><span>${escapeHtml(task.text)}</span></label></li>`).join("") || "<li class=\"plan-tasks__empty\">Adaugă primul pas în editare.</li>"}
        </ul>
        ${plan.attachments.length ? `<div class="plan-files">${plan.attachments.map((file) => `<a href="${escapeHtml(file.src)}" title="Deschide fișierul" target="_blank"><i class="bi bi-paperclip"></i> ${escapeHtml(file.name)}</a>`).join("")}</div>` : ""}
      </article>`;
    }).join("");
  }

  function iconFor(type) {
    return ({ "Călătorie": "airplane", "Eveniment": "calendar-heart", "Proiect": "house-heart", "Aniversare": "balloon-heart", "Personalizat": "stars" })[type] || "stars";
  }

  function renderDraft() {
    els.taskEditor.innerHTML = draftTasks.map((task) => `<div class="draft-task"><input data-task-input="${task.id}" value="${escapeHtml(task.text)}" maxlength="240" placeholder="Ce aveți de făcut?" /><button type="button" class="icon-btn" data-remove-task="${task.id}" title="Șterge"><i class="bi bi-trash3"></i></button></div>`).join("");
    els.attachmentEditor.innerHTML = draftAttachments.length ? draftAttachments.map((file, index) => `<div class="attachment-row"><i class="bi bi-file-earmark"></i><span>${escapeHtml(file.name)}</span><button type="button" class="icon-btn" data-remove-file="${index}" title="Elimină"><i class="bi bi-x-lg"></i></button></div>`).join("") : `<p class="form-hint">Poți atașa orice fișier relevant pentru acest plan.</p>`;
  }

  function openEditor(plan) {
    editingId = plan?.id || null;
    document.getElementById("planDialogTitle").textContent = plan ? "Editează planul" : "Creează un plan nou";
    els.title.value = plan?.title || "";
    els.type.value = plan?.type || "Călătorie";
    els.date.value = plan?.eventDate || "";
    els.notes.value = plan?.notes || "";
    draftTasks = structuredClone(plan?.tasks || []);
    draftAttachments = structuredClone(plan?.attachments || []);
    renderDraft();
    els.dialog.showModal();
    els.title.focus();
  }

  function closeEditor() { els.dialog.close(); }

  document.getElementById("createPlan").onclick = () => openEditor();
  document.getElementById("closePlanDialog").onclick = closeEditor;
  document.getElementById("cancelPlan").onclick = closeEditor;
  document.getElementById("addTask").onclick = () => {
    draftTasks.push({ id: makeId("task"), text: "", done: false });
    renderDraft();
    els.taskEditor.lastElementChild?.querySelector("input")?.focus();
  };

  document.getElementById("importAttachment").onclick = async () => {
    try {
      if (window.mediaLibrary?.importPlanAttachment) {
        const file = await window.mediaLibrary.importPlanAttachment();
        if (!file.canceled) { draftAttachments.push(file); renderDraft(); }
      } else {
        showToast("Atașarea fișierelor funcționează din aplicația desktop Electron.");
      }
    } catch (e) {
      console.error("Eroare atașament:", e);
    }
  };

  els.taskEditor.addEventListener("input", (event) => {
    const id = event.target.dataset.taskInput;
    const task = draftTasks.find((entry) => entry.id === id);
    if (task) task.text = event.target.value;
  });

  els.taskEditor.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-task]");
    if (!button) return;
    draftTasks = draftTasks.filter((task) => task.id !== button.dataset.removeTask);
    renderDraft();
  });

  els.attachmentEditor.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-file]");
    if (!button) return;
    draftAttachments.splice(Number(button.dataset.removeFile), 1);
    renderDraft();
  });

  els.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const plan = {
      id: editingId || makeId("plan"),
      title: els.title.value,
      type: els.type.value,
      eventDate: els.date.value,
      notes: els.notes.value,
      tasks: draftTasks.filter((task) => task.text.trim()),
      attachments: draftAttachments,
    };
    if (editingId) plans = plans.map((entry) => entry.id === editingId ? plan : entry);
    else plans.unshift(plan);
    await persist();
    closeEditor();
    showToast("Plan salvat.");
  });

  els.grid.addEventListener("click", async (event) => {
    const card = event.target.closest("[data-plan-id]");
    if (!card) return;
    const plan = plans.find((entry) => entry.id === card.dataset.planId);
    if (!plan) return;
    if (event.target.closest("[data-action=edit]")) {
      openEditor(plan);
      return;
    }
    const box = event.target.closest("[data-action=toggle-task]");
    if (box) {
      const task = plan.tasks.find((entry) => entry.id === box.dataset.taskId);
      if (task) {
        task.done = box.checked;
        await persist();
      }
    }
  });

  load().catch((err) => {
    console.error("Eroare la încărcare:", err);
    plans = structuredClone(DEFAULT_PLANS);
    renderPlans();
  });
})();
