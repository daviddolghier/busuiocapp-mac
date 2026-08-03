(() => {
const { APP_CONFIG, TIMELINE, escapeHtml, escapeAttr, showToast } = window.JourneyMap;

const els = {
  headline: document.getElementById("anniversaryHeadline"),
  lead: document.getElementById("anniversaryLead"),
  status: document.getElementById("anniversaryStatus"),
  statusText: document.getElementById("anniversaryStatusText"),
  timeline: document.getElementById("anniversaryTimeline"),
  celebrationArea: document.getElementById("celebrationArea"),
};

const weddingDate = resolveWeddingDate();
const state = {
  celebrationMode: null,
};

bindRevealObserver();
renderStaticSections();
updateLiveSections();
startAutoRefresh();

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
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
  );

  document.querySelectorAll("[data-reveal]").forEach((el) => observer.observe(el));
}

function renderStaticSections() {
  if (els.timeline) {
    els.timeline.innerHTML = TIMELINE.map((item) => timelineBlock(item)).join("");
  }

  renderCelebrationCard();
}

function updateLiveSections() {
  const now = new Date();
  const isFuture = now < weddingDate;

  if (els.headline) {
    els.headline.textContent = isFuture
      ? "Numărătoarea până la nuntă"
      : getAnniversaryHeadline(now);
  }

  if (els.lead) {
    els.lead.textContent = isFuture
      ? formatCountdownLead(now)
      : formatAnniversaryLead(now);
  }

  if (els.status) {
    els.status.textContent = isFuture
      ? "Pregătim ziua cea mare"
      : isAnniversaryMoment(now)
        ? `ASTĂZI AVEȚI ${durationLabel(breakdownDuration(weddingDate, now))} DE LA CĂSĂTORIE!`
        : `A trecut ${durationLabel(breakdownDuration(weddingDate, now))} de la căsătorie.`;
  }

  if (els.statusText) {
    els.statusText.textContent = isFuture
      ? "Când data se împlinește, pagina trece automat în modul aniversare."
      : isAnniversaryMoment(now)
        ? "FELICITĂRI! Aceasta este ziua voastră specială, să știți că noi vă iubim mult și Iehova la fel!."
        : `Următorul prag: ${getUpcomingMilestone(weddingDate, now).label}.`;
  }

  renderCelebrationCard();
  checkNotify(now);
}

function renderCelebrationCard() {
  if (!els.celebrationArea) {
    return;
  }

  const now = new Date();
  const mode = isAnniversaryMoment(now) ? "anniversary" : "normal";
  if (state.celebrationMode === mode && els.celebrationArea.innerHTML) {
    updateCelebrationText(now);
    return;
  }

  state.celebrationMode = mode;
  els.celebrationArea.innerHTML = isAnniversaryMoment(now)
    ? `
      <article class="celebration-card celebration-card__wide">
        <div class="celebration-intro">
          <span class="celebration-emphasis">ASTĂZI AVEȚI DE LA CĂSĂTORIE!</span>
          <h3 id="celebrationTitle">Felicitări, Adriana și Stefan!</h3>
          <p class="muted" id="celebrationMessage"></p>
          <p class="muted" id="celebrationDuration"></p>
        </div>
        <div class="celebration-card__images">
          <img src="images/cerere casatorie (ialoveni, 17 mai 2026)/adri & stefan sat down on the grass looking at the sky.jpg" alt="Imagine emoționantă din nuntă" loading="lazy" data-lightbox data-lightbox-src="images/cerere casatorie (ialoveni, 17 mai 2026)/adri & stefan sat down on the grass looking at the sky.jpg" data-lightbox-alt="Imagine emoționantă din nuntă" style="cursor:zoom-in;" onerror="this.onerror=null;this.src='images/default.png';" />
          <img src="images/cerere casatorie (ialoveni, 17 mai 2026)/adri happy with stefan sitting down.jpg" alt="Imagine emoționantă din nuntă" loading="lazy" data-lightbox data-lightbox-src="images/cerere casatorie (ialoveni, 17 mai 2026)/adri happy with stefan sitting down.jpg" data-lightbox-alt="Imagine emoționantă din nuntă" style="cursor:zoom-in;" onerror="this.onerror=null;this.src='images/default.png';" />
          <img src="images/cerere casatorie (ialoveni, 17 mai 2026)/adriana holding flowers with stefan.jpg" alt="Imagine emoționantă din nuntă" loading="lazy" data-lightbox data-lightbox-src="images/cerere casatorie (ialoveni, 17 mai 2026)/adriana holding flowers with stefan.jpg" data-lightbox-alt="Imagine emoționantă din nuntă" style="cursor:zoom-in;" onerror="this.onerror=null;this.src='images/default.png';" />
          <img src="images/cerere casatorie (ialoveni, 17 mai 2026)/holding flowers.jpg" alt="Imagine emoționantă din nuntă" loading="lazy" data-lightbox data-lightbox-src="images/cerere casatorie (ialoveni, 17 mai 2026)/holding flowers.jpg" data-lightbox-alt="Imagine emoționantă din nuntă" style="cursor:zoom-in;" onerror="this.onerror=null;this.src='images/default.png';" />
        </div>
      </article>
    `
    : `
      <div class="celebration-intro">
        <h3>În ziua aniversării va apărea mesajul special.</h3>
        <p class="muted" id="celebrationPlaceholder">
          Când data de 24 august vine, pagina arată automat un mesaj de felicitare și imaginile de nuntă.
        </p>
      </div>
    `;

  updateCelebrationText(now);
}

function updateCelebrationText(now) {
  if (!els.celebrationArea) {
    return;
  }

  if (isAnniversaryMoment(now)) {
    const duration = breakdownDuration(weddingDate, now);
    const message = els.celebrationArea.querySelector("#celebrationMessage");
    const durationNode = els.celebrationArea.querySelector("#celebrationDuration");
    const title = els.celebrationArea.querySelector("#celebrationTitle");

    if (title) {
      title.textContent = "Felicitări, Adriana și Stefan!";
    }
    if (message) {
      message.textContent = `Dragii mei! Aveți ${durationLabel(duration)} de când v-ați căsătorit! Felicitări!`;
    }
    if (durationNode) {
      durationNode.textContent = `ASTĂZI AVEȚI ${duration.years} ani, ${duration.days} zile, ${duration.hours} ore, ${duration.minutes} minute și ${duration.seconds} secunde de la căsătorie.`;
    }
  }
}

function timelineBlock(item) {
  return `
    <article class="timeline-card">
      <div class="timeline-card__content">
        <div class="tag-row">
          <span class="tag tag--icon">${item.iconHtml || escapeHtml(item.icon || "")} ${escapeHtml(item.title)}</span>
          <span class="tag">${escapeHtml(item.label)}</span>
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="timeline-card__meta">${escapeHtml(item.summary)}</p>
        <p class="timeline-card__meta">${escapeHtml(item.date)}</p>
      </div>
      <div class="timeline-card__media">
        ${item.images
          .slice(0, 5)
          .map(
            (src) =>
              `<img src="${escapeAttr(src)}" alt="${escapeAttr(item.title)}" loading="lazy"
                   data-lightbox data-lightbox-src="${escapeAttr(src)}" data-lightbox-alt="${escapeAttr(item.title)}"
                   style="cursor:zoom-in;"
                   onerror="this.onerror=null;this.src='images/default.png';" />`,
          )
          .join("")}
      </div>
    </article>
  `;
}

function getUpcomingMilestone(start, now) {
  const years = diffInYears(start, now);
  const months = diffInMonths(start, now);

  if (years < 1) {
    const nextMonth = Math.min(12, months + 1);
    return {
      label: `${nextMonth} lun${nextMonth === 1 ? "ă" : "i"}`,
      date: addMonths(start, nextMonth),
    };
  }

  return {
    label: `${years + 1} an${years + 1 === 1 ? "" : "i"}`,
    date: addYears(start, years + 1),
  };
}

function getAnniversaryHeadline(now) {
  const upcoming = getUpcomingMilestone(weddingDate, now);
  return upcoming.label;
}

function formatCountdownLead(now) {
  const countdown = breakdownCountdown(now, weddingDate);
  return `Mai sunt ${countdown.days} zile, ${countdown.hours} ore, ${countdown.minutes} minute și ${countdown.seconds} secunde până la 24 august 2026, ora 11:20.`;
}

function formatAnniversaryLead(now) {
  const upcoming = getUpcomingMilestone(weddingDate, now);
  return `În ${daysUntil(upcoming.date, now)} zile veți împlini ${upcoming.label.toLowerCase()}.`;
}

function diffInMonths(start, end) {
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (end.getDate() < start.getDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

function diffInYears(start, end) {
  let years = end.getFullYear() - start.getFullYear();
  const anniversary = addYears(start, years);
  if (end < anniversary) {
    years -= 1;
  }
  return Math.max(0, years);
}

function daysUntil(target, now) {
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / 86_400_000));
}

function addMonths(date, amount) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + amount);
  return next;
}

function addYears(date, amount) {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + amount);
  return next;
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

function durationLabel(parts) {
  const yearWord = parts.years === 1 ? "an" : "ani";
  const dayWord = parts.days === 1 ? "zi" : "zile";
  return `${parts.years} ${yearWord}, ${parts.days} ${dayWord}`;
}

function breakdownCountdown(start, end) {
  const diff = Math.max(0, end.getTime() - start.getTime());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function isAnniversaryMoment(now) {
  return (
    now.getMonth() === weddingDate.getMonth() &&
    now.getDate() === weddingDate.getDate() &&
    now.getHours() >= weddingDate.getHours()
  );
}

function startAutoRefresh() {
  setInterval(updateLiveSections, 1000);
}

function checkNotify(now) {
  // Electron's main process sends the Windows system notification for the app.
  if (window.mediaLibrary) {
    return;
  }
  if (!("Notification" in window)) {
    return;
  }

  const enabled = localStorage.getItem("notificationsEnabled") === "1";
  if (!enabled || Notification.permission !== "granted") {
    return;
  }

  if (!isAnniversaryMoment(now)) {
    return;
  }

  const stamp = now.toISOString().slice(0, 10);
  if (localStorage.getItem("lastAnniversaryNotification") === stamp) {
    return;
  }

  const duration = breakdownDuration(weddingDate, now);
  try {
    new Notification("Dragii mei!", {
      body: `Aveți ${durationLabel(duration)} de când v-ați căsătorit! Felicitări!`,
      icon: "images/logo.png",
    });
    localStorage.setItem("lastAnniversaryNotification", stamp);
    showToast("A fost afișată notificarea de aniversare.");
  } catch {
    localStorage.setItem("lastAnniversaryNotification", stamp);
    showToast(`Aveți ${durationLabel(duration)} de când v-ați căsătorit!`);
  }
}
})();
