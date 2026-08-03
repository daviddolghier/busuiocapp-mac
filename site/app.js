(() => {
const { APP_CONFIG, SEED_MEDIA, FEATURED_MEDIA, TIMELINE, MAP_LOCATIONS } = window.JourneyMap || {};
const JourneyMap = window.JourneyMap || {};

const els = {
  scrollDown: document.getElementById("scrollDown"),
  heroArrow: document.getElementById("heroArrow"),
  previewGallery: document.getElementById("previewGallery"),
  mapStage: document.getElementById("mapStage"),
  timelinePreview: document.getElementById("timelinePreview"),
  counterYears: document.getElementById("counterYears"),
  counterDays: document.getElementById("counterDays"),
  counterHours: document.getElementById("counterHours"),
  counterMinutes: document.getElementById("counterMinutes"),
  counterSeconds: document.getElementById("counterSeconds"),
  counterNote: document.getElementById("counterNote"),
  counterHeading: document.getElementById("counterHeading"),
  notifyBtn: document.getElementById("notifyBtn"),
  feedbackForm: document.getElementById("feedbackForm"),
  toast: document.getElementById("toast"),
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  weddingDate: resolveWeddingDate(),
};

bindRevealObserver();
bindScrolling();
setHeroBackground();
renderSeedContent();
startCounter();
bindNotifications();
checkAnniversaryNotification();

function resolveWeddingDate() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("date")) {
    return new Date(params.get("date"));
  }
  if (params.get("test") === "1") {
    return new Date(APP_CONFIG.testWeddingDate);
  }
  return new Date(APP_CONFIG.weddingDate);
}

function bindRevealObserver() {
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
      {
        threshold: 0.16,
        rootMargin: "0px 0px -8% 0px",
      },
  );

  document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
}

function bindScrolling() {
  const target = document.getElementById("countdown");
  const smoothScroll = () => target?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth", block: "start" });

  els.scrollDown?.addEventListener("click", smoothScroll);
  els.heroArrow?.addEventListener("click", smoothScroll);
}

async function setHeroBackground() {
  const hero = document.querySelector(".hero");
  if (!hero) {
    return;
  }

  for (const src of APP_CONFIG.heroBackgrounds) {
    if (await imageExists(src)) {
      hero.style.backgroundImage = `linear-gradient(135deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.05)), url("${src}")`;
      return;
    }
  }
}

function imageExists(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

function seedWithFallback(items) {
  return items.slice(0, 8);
}

function renderSeedContent() {
  if (els.previewGallery) {
    const previewItems = seedWithFallback((FEATURED_MEDIA || SEED_MEDIA).filter((item) => item.kind === "image" || item.kind === "video"));
    els.previewGallery.innerHTML = previewItems.map((item) => JourneyMap.cardTemplate(item)).join("");
  }

  if (els.mapStage) {
    els.mapStage.innerHTML = JourneyMap.renderMapStage(SEED_MEDIA);
  }

  if (els.timelinePreview) {
    els.timelinePreview.innerHTML = TIMELINE.map((item) => JourneyMap.timelineTemplate(item, true)).join("");
  }
}

function startCounter() {
  const tick = () => {
    const now = new Date();
    const diff = now.getTime() - state.weddingDate.getTime();

    if (diff < 0) {
      if (els.counterHeading) {
        els.counterHeading.textContent = "Până la nuntă mai este:";
      }
      const before = breakdownCountdown(now, state.weddingDate);
      setCounter(before, `Până la ziua cea mare mai sunt ${before.days} zile.`);
      return;
    }

    if (els.counterHeading) {
      els.counterHeading.textContent = "Felicitări! Sunteți căsătoriți de:";
    }
    const span = breakdownDuration(state.weddingDate, now);
    setCounter(span, `De la 24 august 2026, au trecut ${span.years} ani și ${span.days} zile.`);
  };

  tick();
  setInterval(tick, 1000);
}

function setCounter(parts, note) {
  if (!els.counterYears) return;
  els.counterYears.textContent = String(parts.years);
  els.counterDays.textContent = String(parts.days);
  els.counterHours.textContent = String(parts.hours);
  els.counterMinutes.textContent = String(parts.minutes);
  els.counterSeconds.textContent = String(parts.seconds);
  if (els.counterNote) {
    els.counterNote.textContent = note;
  }
}

function breakdownDuration(start, end) {
  let cursor = new Date(start);
  let years = 0;

  while (addYears(cursor, 1) <= end) {
    cursor = addYears(cursor, 1);
    years += 1;
  }

  let days = 0;
  while (addDays(cursor, 1) <= end) {
    cursor = addDays(cursor, 1);
    days += 1;
  }

  const remainder = end.getTime() - cursor.getTime();
  return {
    years,
    days,
    hours: Math.floor(remainder / 3_600_000),
    minutes: Math.floor((remainder % 3_600_000) / 60_000),
    seconds: Math.floor((remainder % 60_000) / 1000),
  };
}

function breakdownCountdown(start, end) {
  const diff = Math.max(0, end.getTime() - start.getTime());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { years: 0, days, hours, minutes, seconds };
}

function addYears(date, amount) {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + amount);
  return next;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function bindNotifications() {
  if (!els.notifyBtn) {
    return;
  }

  els.notifyBtn.addEventListener("click", async () => {
    if (!("Notification" in window)) {
      showToast("Browserul nu suportă notificările.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      showToast("Notificările au fost activate.");
      localStorage.setItem("notificationsEnabled", "1");
      checkAnniversaryNotification(true);
      return;
    }

    showToast("Notificările nu au fost activate.");
  });
}

function isAnniversaryMoment(now) {
  const start = state.weddingDate;
  return (
      now.getMonth() === start.getMonth() &&
      now.getDate() === start.getDate() &&
      now.getHours() >= start.getHours()
  );
}

function checkAnniversaryNotification(force = false) {
  const enabled = localStorage.getItem("notificationsEnabled") === "1";
  const canNotify = force || enabled;
  const now = new Date();

  if (!canNotify || !("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  if (isAnniversaryMoment(now)) {
    const parts = breakdownDuration(state.weddingDate, now);
    const title = "Dragii mei!";
    const body = `Aveți ${parts.years} ani, ${parts.days} zile de când v-ați căsătorit. Felicitări!`;

    try {
      new Notification(title, {
        body,
        icon: "images/logo.png",
      });
      showToast("Mesaj de aniversare trimis prin notificare.");
    } catch {
      showToast(body);
    }
  }
}

function showToast(message) {
  if (!els.toast) {
    return;
  }

  els.toast.textContent = message;
  els.toast.classList.add("is-visible");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    els.toast.classList.remove("is-visible");
  }, 2800);
}

function escapeHtml(value = "") {
  return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
}

function escapeAttr(value = "") {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

window.JourneyMap = Object.assign(window.JourneyMap || {}, {
  APP_CONFIG,
  FEATURED_MEDIA,
  SEED_MEDIA,
  TIMELINE,
  MAP_LOCATIONS,
  showToast,
  escapeHtml,
  escapeAttr,
});
})();
