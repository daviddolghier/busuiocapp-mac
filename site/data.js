// sa facem harta.html care va fi harta reala. mai mare, diferita, si mai profesionala. hartile mici din celelalte pagini sunt ok. dar alte butoane care duce la harta sa duca la acest html. restul e bine. poti reactualiza settings la aplicatia propriu zisa nu busuioc family. in loc de emojipune icons. totudi in galerie sunt butoane-sectiuni. shadowul lor violet e broken. fa fix la toate astea pls! vreau sa fie posibil si de importat videouri. vreau totusi sa repet ca nu vreau sa se salveze fotografiile in local host. resetarea setarilor ar sterge tot. sa fie create intrun folder aparte. acolo va fi extra-images cu jsonul lor. mai tarziu vor fi si backupuri intregi, si importari. caci posibil in viitor sa actualizez aplicatia, si ca sa nu se stearga nimic, sa fie extra-images acolo. vreau si mai multe teme. adica acesta violet este principal. in settings vor fi teme si aspect. la aspect vor fi deja light/dark/auto si la teme, temele violet, rosiatic, alb simplu, roz. toate 4 sa aiba si dark mode desigur.

const APP_CONFIG = {
  coupleName: "Adriana & Stefan",
  weddingDate: "2026-08-24T11:20:00+03:00",
  testWeddingDate: "2023-08-24T11:20:00+03:00",
  heroBackgrounds: ["images/bg.jpg"],
  feedbackEmail: "daviddolghier@gmail.com",
  apiBase: "/api",
};

// Helperi simpli pentru a adauga media in acelasi format.
function photo(id, src, title, location, tag, description, date = "") {
  return {
    id,
    kind: "image",
    src,
    title,
    location,
    tag,
    description,
    date,
  };
}

function video(id, src, title, location, tag, description, date = "", poster = "images/Video.png") {
  return {
    id,
    kind: "video",
    src,
    title,
    location,
    tag,
    description,
    date,
    poster,
    mimeType: "video/mp4",
  };
}

// Completezi ulterior datele lipsa daca vrei. Acum sunt puse dupa titlul fisierului.
// ============================================================
// 1) CEREREA DE CASATORIE
// Pune aici poze / video din folderul:
// images/cerere casatorie (ialoveni, 17 mai 2026)/
// ============================================================
const PROPOSAL_MEDIA = [
  photo(
    "proposal-01",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/whole family photo.jpg",
    "Foto de familie",
    "Ialoveni",
    "Cerere",
    "O poză frumoasă cu toată familia",
  ),
  photo(
    "proposal-05",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/lovely photo holding hands.jpg",
    "Ținându-vă de mâini",
    "Ialoveni",
    "Cerere",
    "Fotografie cu mâinile împreunate.",
  ),
  photo(
    "proposal-06",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/holding hands.jpg",
    "Mâini împreunate",
    "Ialoveni",
    "Cerere",
    "Cadru simplu dar emoționant.",
  ),
  photo(
    "proposal-07",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/holding flowers.jpg",
    "Flori în brațe",
    "Ialoveni",
    "Cerere",
    "Imagine cu florile din ziua cererii.",
  ),
  video(
    "proposal-02",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/Video Cerere Casatorie.mp4",
    "Video: Cererea de căsătorie",
    "Ialoveni",
    "Cerere",
    "Videoclipul principal din ziua cererii. Apăsați play să meargă",
  ),
  video(
    "proposal-03",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/Video Giving Flowers.mp4",
    "Video: Oferirea florilor",
    "Ialoveni",
    "Cerere",
    "Moment video cu florile oferite.",
  ),
  video(
    "proposal-04",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/Video Cute Moment.mp4",
    "Video: Moment drăguț",
    "Ialoveni",
    "Cerere",
    "Clip scurt cu un moment cald.",
  ),
  photo(
    "proposal-08",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/holding flowers 2.jpg",
    "Flori în brațe, varianta 2",
    "Ialoveni",
    "Cerere",
    "A doua variantă a imaginii cu florile.",
  ),
  photo(
    "proposal-09",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/happy adriana holding flowers with stefan.jpg",
    "Adriana fericită cu flori",
    "Ialoveni",
    "Cerere",
    "Titlul spune clar ce surprinde fotografia.",
  ),
  photo(
    "proposal-10",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/adriana holding flowers with stefan.jpg",
    "Adriana și Stefan cu flori",
    "Ialoveni",
    "Cerere",
    "Cuplul și florile din momentul cererii.",
  ),
  photo(
    "proposal-11",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/adri happy with stefan sitting down.jpg",
    "Adri fericită, așezați",
    "Ialoveni",
    "Cerere",
    "Un cadru relaxat, cu zâmbete.",
  ),
  photo(
    "proposal-12",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/adri extremely happy.jpg",
    "Adri extrem de fericită",
    "Ialoveni",
    "Cerere",
    "Un moment cu emoție foarte clară.",
  ),
  photo(
    "proposal-13",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/adri & stefan sat down on the grass lovely photo.jpg",
    "Pe iarbă, variantă principală",
    "Ialoveni",
    "Cerere",
    "Cei doi pe iarbă.",
  ),
  photo(
    "proposal-14",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/adri & stefan sat down on the grass lovely photo 2.jpg",
    "Pe iarbă, varianta 2",
    "Ialoveni",
    "Cerere",
    "A doua fotografie din aceeași secvență.",
  ),
  photo(
    "proposal-15",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/adri & stefan sat down on the grass lovely photo 3.jpg",
    "Pe iarbă, varianta 3",
    "Ialoveni",
    "Cerere",
    "A treia fotografie din aceeași secvență.",
  ),
  photo(
    "proposal-16",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/adri & stefan sat down on the grass looking at the sky.jpg",
    "Privesc cerul",
    "Ialoveni",
    "Cerere",
    "O fotografie calmă, cu privirea spre cer.",
  ),
  photo(
    "proposal-17",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/the 2 making a love shaped hand.jpg",
    "Mână în formă de inimă",
    "Ialoveni",
    "Cerere",
    "Un gest simbolic și foarte potrivit pentru moment.",
  ),
  photo(
    "proposal-18",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/the 2 making a love shaped hand 2.jpg",
    "Mână în formă de inimă, 2",
    "Ialoveni",
    "Cerere",
    "Momentul acesta a fost foarte emoționant.",
  ),
  photo(
    "proposal-19",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/the 2 discussing while celebrating.jpg",
    "Discutând și sărbătorind",
    "Ialoveni",
    "Cerere",
    "Un cadru viu și frumos.",
  ),
  photo(
    "proposal-20",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/the 2 discussing and are happy.jpg",
    "Discută și sunt fericiți",
    "Ialoveni",
    "Cerere",
    "Imagine cu zâmbete și emoție bună.",
  ),
  photo(
    "proposal-21",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/the 2 being happy while celebrating.jpg",
    "Fericiți la celebrare",
    "Ialoveni",
    "Cerere",
    "Cei doi se bucură de moment.",
  ),
  photo(
    "proposal-22",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/the 2 arguing as a joke.jpg",
    "Glume și tachinări",
    "Ialoveni",
    "Cerere",
    "O fotografie amuzantă.",
  ),
  photo(
    "proposal-23",
    "images/cerere casatorie (ialoveni, 17 mai 2026)/monotone whiteblack lovely photo.jpg",
    "Alb-negru elegant",
    "Ialoveni",
    "Cerere",
    "Fotografie monocromă, foarte elegantă.",
  ),
];

// ============================================================
// 2) ALTE AMINTIRI / CALATORII / CONGRESE
// Pune aici poze noi din folderul:
// images/newphoto/
// ============================================================
const NEWPHOTO_MEDIA = [
  photo(
    "new-01",
    "images/newphoto/adri and stefan at chisinau convention.jpg",
    "Adri și Stefan la congres, Chișinău",
    "Chișinău",
    "Congres",
    "Fotografie la Arena Chișinău.",
  ),
  photo(
    "new-02",
    "images/newphoto/adri and stefan at chisinau convention 2.jpg",
    "Adri și Stefan la congres, Chișinău (2)",
    "Chișinău",
    "Congres",
    "A doua variantă din aceeași întâlnire.",
  ),
  photo(
    "new-03",
    "images/newphoto/family photo at convention.jpg",
    "Foto de familie la congresul internațional",
    "București",
    "Congres",
    "O fotografie de familie din congres.",
  ),
  photo(
    "new-04",
    "images/newphoto/family photo at convention 2.jpg",
    "Foto de familie la congres, 2",
    "București",
    "Congres",
    "A doua fotografie de familie din congres.",
  ),
  photo(
    "new-05",
    "images/newphoto/both at convention (congres).jpg",
    "La congres România 2026",
    "București",
    "Congres",
    "La congresul internațional din România.",
  ),
  photo(
    "new-06",
    "images/newphoto/both at convention (congres) 2.jpg",
    "La congres, varianta 2",
    "București",
    "Congres",
    "A doua fotografie de la congres.",
  ),
  photo(
    "new-07",
    "images/newphoto/both in bucharest.jpg",
    "Împreună în București",
    "București",
    "Călătorie",
    "Fotografie din București, într-un loc frumos.",
  ),
  photo(
    "new-08",
    "images/newphoto/both at bethel tour (bucharest).jpg",
    "Tur la Betel, București",
    "București",
    "Călătorie",
    "Cadru din turul Betel din București.",
  ),
  photo(
    "new-09",
    "images/newphoto/both sat down in hotel, bucharest.jpg",
    "La hotel, București",
    "București",
    "Călătorie",
    "Așezați la hotel. Tare am mai muncit.",
  ),
  photo(
    "new-10",
    "images/newphoto/both taking selfie at bucharest.jpg",
    "Selfie în București la sala regatului!",
    "București",
    "Călătorie",
    "„We love you! We love you!”",
  ),
  photo(
    "new-11",
    "images/newphoto/both at orhei lake.jpg",
    "La lacul din Orhei",
    "Orhei",
    "Călătorie",
    "Imagine de la parcul public Orhei.",
  ),
  photo(
    "new-12",
    "images/newphoto/both admiring sunset at orhei.jpg",
    "Apus la Orhei",
    "Orhei",
    "Călătorie",
    "Cei doi admiră apusul la Orhei.",
  ),
  photo(
    "new-13",
    "images/newphoto/both in dumbrava veche.jpg",
    "În Dumbrava Veche",
    "Dumbrava Veche",
    "Călătorie",
    "Fotografie din Dumbrava Veche la migdale.",
  ),
  photo(
    "new-14",
    "images/newphoto/both in dumbrava veche 2.jpg",
    "În Dumbrava Veche, varianta 2",
    "Dumbrava Veche",
    "Călătorie",
    "A doua fotografie din Dumbrava Veche.",
  ),
  photo(
    "new-15",
    "images/newphoto/both at a national garden (gradina botanica din chisinau).jpg",
    "În Grădina Botanică din Chișinău",
    "Chișinău",
    "Congres",
    "Trebuie la Grădina Botanică la MAGNOLE!!",
  ),
  photo(
    "new-16",
    "images/newphoto/both at a bethel room.jpg",
    "În camera de la Betel",
    "București",
    "Călătorie",
    "Un moment liniștit de la Betel.",
  ),
  photo(
    "new-17",
    "images/newphoto/both at chisinau, port mall, at a restaurant.jpg",
    "La Port Mall, Chișinău",
    "Chișinău",
    "Călătorie",
    "Ieșire la restaurant în Chișinău la o Pizzzzza!",
  ),
  photo(
    "new-18",
    "images/newphoto/both taking a selfie in adrianas home.jpg",
    "Selfie la casa Adrianei",
    "Orhei",
    "Acasă",
    "La Adri acasă, ca de obicei..",
  ),
  photo(
    "new-19",
    "images/newphoto/both taking selfie in stefans home.jpg",
    "Selfie la casa lui Stefan",
    "Peresecina",
    "Acasă",
    "Fotografie din casa lui Stefan.",
  ),
  photo(
    "new-20",
    "images/newphoto/both taking photo in mirror stefans home.jpg",
    "În oglindă la casa lui Stefan",
    "Peresecina",
    "Acasă",
    "Selfie în oglindă, să dea efect crutâi.",
  ),
  photo(
    "new-21",
    "images/newphoto/funny stefan selfie.jpg",
    "Selfie amuzant cu Stefan",
    "Orhei",
    "Amuzant",
    "Ok..",
  ),
    video(
        "new-22",
        "images/newphoto/Video Funny.mp4",
        "Ștefan ajunge la închisoare",
        "București",
        "Amuzant",
        "Consecințele lui Ștefan de a alege pe adri ca soție."
    ),
  photo(
    "new-23",
    "images/newphoto/funny stefan selfie 2.jpg",
    "Selfie amuzant cu Stefan din nou.",
    "București",
    "Amuzant",
    "Mda.",
  ),
  photo(
    "new-24",
    "images/newphoto/stefan clothing (funny, chisinau).jpg",
    "Stefan..",
    "Chișinău",
    "Pregătire",
    "Adri amenință pe ștefan să-și găsească costum.",
  ),
  photo(
    "new-25",
    "images/newphoto/stefan driving a fake jw org vehicle (bucharest, funny).jpg",
    "Stefan la volan după niște jin.",
    "București",
    "Amuzant",
    "Cadru hazliu din București.",
  ),
  photo(
    "new-26",
    "images/newphoto/selfie a a pool, ialoveni.jpg",
    "Selfie la piscină, Ialoveni",
    "Ialoveni",
    "Călătorie",
    "Fotografie la piscină din Ialoveni, numa selfie, nu ați sărit..",
  ),
  photo(
    "new-27",
    "images/newphoto/the 2 preaching while winter.jpg",
    "Predicând iarna",
    "Orhei",
    "Predicare",
    "Un cadru de iarnă.",
  ),
  photo(
    "new-28",
    "images/newphoto/adris parrot (funny impostor among photos).PNG",
    "Ăăăăm matale ce cauți aici",
    "Orhei",
    "Amuzant",
    "Arhitect de la Adri, Hacker de la David.",
  ),
    photo(
        "new-29",
        "images/newphoto/adri finding dress.jpg",
        "În secret căutăm rochie",
        "Chișinău",
        "Pregătire",
        "Se pregătește surpriza la nuntă."
    ),
    video(
        "new-30",
        "images/newphoto/Video Dressing.mp4",
        "Va fi rochia asta, cea aleasă?",
        "Chișinău",
        "Pregătire",
        "Ștefan was NOT invited"
    ),
    photo(
        "new-31",
        "images/newphoto/adri in rochie.jpg",
        "Adri în rochie de mireasă",
        "Orhei",
        "Amintiri",
        "Adriana în rochie de mireasă — un moment magic."
    ),
    photo(
        "new-32",
        "images/newphoto/adri in rochie 2.jpg",
        "Adri în rochie de mireasă (2)",
        "Orhei",
        "Amintiri",
        "A doua fotografie cu Adriana în rochie de mireasă."
    )
];

// ============================================================
// 3) MEDIA SUPLIMENTARA
// Foloseste acest bloc pentru fisierele din radacina images/
// sau pentru orice element pe care vrei sa-l pui separat.
// ============================================================
const EXTRA_MEDIA = [
  
];

// ============================================================
// 4) PREVIEW RECOMANDAT PE HOMEPAGE
// Shuffle Fisher-Yates pe intreaga colectie -> 8 unice, fara duplicate.
// Include automat toate imaginile noi adaugate in SEED_MEDIA.
// ============================================================
const SEED_MEDIA = [...PROPOSAL_MEDIA, ...NEWPHOTO_MEDIA, ...EXTRA_MEDIA];

function pickFeatured(pool, count) {
  // Filtram elementele valide (cu src definit)
  const valid = pool.filter((item) => item && item.src);
  // Fisher-Yates shuffle pe o copie
  const shuffled = valid.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

const FEATURED_MEDIA = pickFeatured(SEED_MEDIA, 8);


// ============================================================
// 5) TIMELINE
// Editarea aici schimba sectiunea "Aniversari" si timeline-ul.
// ============================================================
const TIMELINE = [
  {
    id: "first-meeting",
    iconHtml: '<i class="fa-solid fa-heart"></i>',
    title: "Primele momente împreună",
    summary: "Primele cadre simple și calde, din casă și din momentele apropiate.",
    images: [
      "images/newphoto/both taking a selfie in adrianas home.jpg",
      "images/newphoto/both taking selfie in stefans home.jpg",
    ],
    date: "",
    label: "Începutul",
  },
  {
    id: "proposal",
    iconHtml: '<i class="fa-regular fa-heart"></i>',
    title: "Cererea",
    summary: "Cadrul cererii, cu flori, gesturi și emoție mare.",
    images: [
      "images/cerere casatorie (ialoveni, 17 mai 2026)/holding flowers.jpg",
      "images/cerere casatorie (ialoveni, 17 mai 2026)/adriana holding flowers with stefan.jpg",
      "images/cerere casatorie (ialoveni, 17 mai 2026)/both hands holding.jpg",
      "images/cerere casatorie (ialoveni, 17 mai 2026)/happy adri & stefan sat down on the grass lovely photo.jpg",
    ],
    date: "17 Mai 2026",
    label: "Da-ul important",
  },
  {
    id: "congress",
    iconHtml: '<i class="bi bi-box2-heart-fill"></i>',
    title: "Congrese",
    summary: "Amintiri de la congrese, cu familie, prieteni și zâmbete bune.",
    images: [
      "images/newphoto/adri and stefan at chisinau convention.jpg",
      "images/newphoto/family photo at convention.jpg",
    ],
    date: "",
    label: "Activități împreună",
  },
  {
    id: "travel",
    iconHtml: '<i class="bi bi-airplane"></i>',
    title: "Călătorii",
    summary: "București, Orhei, Dumbrava Veche și alte locuri din poveste.",
    images: [
      "images/newphoto/both in bucharest.jpg",
      "images/newphoto/both at orhei lake.jpg",
      "images/newphoto/both in dumbrava veche.jpg",
      "images/newphoto/both at chisinau, port mall, at a restaurant.jpg"
    ],
    date: "",
    label: "Drumuri împreună",
  },
  {
    id: "fun",
    iconHtml: '<i class="bi bi-emoji-laughing"></i>',
    title: "Momente amuzante",
    summary: "Și cadre de care vă râdeți.",
    images: [
      "images/newphoto/stefan driving a fake jw org vehicle (bucharest, funny).jpg",
      "images/newphoto/adris parrot (funny impostor among photos).PNG",
    ],
    date: "",
    label: "Zâmbete și glume",
  },
  {
    id: "getting_ready",
    iconHtml: "<i class=\"bi bi-bag-heart\"></i>",
    title: "Pregătirea de nuntă",
    summary: "La căutat costume, decoruri, fotograf...",
    images: [
        "images/newphoto/adri in rochie.jpg",
        "images/newphoto/adri in rochie 2.jpg",
        "images/newphoto/stefan clothing (funny, chisinau).jpg"
    ],
    date: "",
    label: "Organizarea Nunții"
  },
  {
    id: "wedding",
    iconHtml: '<i class="bi bi-hearts"></i>',
    title: "Nunta mult așteptată",
    summary: "De aici viața voastră cu adevărat a început",
    images: [],
    date: "24 August 2026",
    label: "Viață nouă",
  }
];

// ============================================================
// 6) HARTA
// Locatiile din galerie trebuie sa corespunda cu numele de aici.
// ============================================================
const MAP_LOCATIONS = [
  {
    name: "Ialoveni",
    region: "moldova",
    iconHtml: '<i class="bi bi-hearts"></i>',
  },
  {
    name: "Chișinău",
    region: "moldova",
    iconHtml: '<i class="bi bi-hearts"></i>',
  },
  {
    name: "Orhei",
    region: "moldova",
    iconHtml: '<i class="bi bi-hearts"></i>',
  },
  {
    name: "Peresecina",
    region: "moldova",
    iconHtml: '<i class="bi bi-hearts"></i>',
  },
  {
    name: "Dumbrava Veche",
    region: "moldova",
    iconHtml: '<i class="bi bi-hearts"></i>',
  },
  {
    name: "București",
    region: "romania",
    iconHtml: '<i class="bi bi-house-heart-fill"></i>',
  },
];

window.APP_CONFIG = APP_CONFIG;
window.FEATURED_MEDIA = FEATURED_MEDIA;
window.SEED_MEDIA = SEED_MEDIA;
window.PROPOSAL_MEDIA = PROPOSAL_MEDIA;
window.NEWPHOTO_MEDIA = NEWPHOTO_MEDIA;
window.TIMELINE = TIMELINE;
window.MAP_LOCATIONS = MAP_LOCATIONS;

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

function normalizeLocation(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function mediaMeta(item) {
  const bits = [];
  if (item.location) {
    bits.push(`<span class="tag">${escapeHtml(item.location)}</span>`);
  }
  if (item.date) {
    bits.push(`<span class="tag">${escapeHtml(item.date)}</span>`);
  }
  return bits.join("");
}

function mediaImage(src, alt) {
  return `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" loading="lazy" data-lightbox data-lightbox-src="${escapeAttr(src)}" data-lightbox-alt="${escapeAttr(alt)}" onerror="this.onerror=null;this.src='images/default.png';" style="cursor:zoom-in;" />`;
}

function mediaMarkup(item) {
  if (item.kind === "video") {
    return `
      <video muted playsinline controls preload="metadata" poster="${escapeAttr(item.poster || "images/default.png")}">
        <source src="${escapeAttr(item.src)}" type="${escapeAttr(item.mimeType || "video/mp4")}" />
        Browserul tău nu poate reda acest video. Deschide-l direct.
      </video>
    `;
  }

  return mediaImage(item.src, item.title);
}

function groupByLocation(items) {
  return items.reduce((map, item) => {
    if (!item || !item.location) {
      return map;
    }

    const key = normalizeLocation(item.location);
    const current = map.get(key) || [];
    current.push(item);
    map.set(key, current);
    return map;
  }, new Map());
}

function renderMapStage(items) {
  const grouped = groupByLocation(items);

  const regions = [
    {
      id: "romania",
      title: "România",
      iconHtml: '<i class="bi bi-house-heart-fill"></i>',
      subtitle: "București",
    },
    {
      id: "moldova",
      title: "Moldova",
      iconHtml: '<i class="bi bi-hearts"></i>',
      subtitle: "Chișinău, Ialoveni, Orhei, Dumbrava Veche, Peresecina",
    },
  ];

  const regionCards = regions
    .map((region) => {
      const locations = MAP_LOCATIONS.filter((entry) => entry.region === region.id);
      const cards = locations
        .map((location) => {
          const group = grouped.get(normalizeLocation(location.name)) || [];
          const thumbs = group
            .slice(0, 4)
            .map((item) => {
              if (item.kind === "video") {
                return `<img class="map-location-card__thumb" src="${escapeAttr(item.poster || "images/default.png")}" alt="${escapeAttr(item.title)}" loading="lazy" />`;
              }
              return `<img class="map-location-card__thumb" src="${escapeAttr(item.src)}" alt="${escapeAttr(item.title)}" loading="lazy" onerror="this.onerror=null;this.src='images/default.png';" />`;
            })
            .join("");

          return `
            <article class="map-location-card">
              <div class="map-location-card__top">
                <div class="map-location-card__icon">${location.iconHtml || region.iconHtml}</div>
                <div>
                  <h4>${escapeHtml(location.name)}</h4>
                  <p>${group.length} amintiri</p>
                </div>
              </div>
              <div class="map-location-card__thumbs">${thumbs}</div>
            </article>
          `;
        })
        .join("");

      return `
        <section class="map-country map-country--${region.id}">
          <div class="map-country__header">
            <span class="map-country__icon">${region.iconHtml}</span>
            <div>
              <h3>${escapeHtml(region.title)}</h3>
              <p>${escapeHtml(region.subtitle)}</p>
            </div>
          </div>
          <div class="map-country__cards">${cards}</div>
        </section>
      `;
    })
    .join("");

  return `
    <div class="map-label">Locații reale din galerie</div>
    <div class="map-board">${regionCards}</div>
  `;
}

function cardTemplate(item) {
  const media = mediaMarkup(item);
  const meta = mediaMeta(item);

  return `
    <article class="preview-card">
      <div class="preview-card__media">${media}</div>
      <div class="preview-card__body">
        <div class="tag-row">
          <span class="tag">${escapeHtml(item.tag || item.kind)}</span>
          ${meta}
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="gallery-card__meta">${escapeHtml(item.description)}</p>
      </div>
    </article>
  `;
}

function timelineTemplate(item, compact = false) {
  const imgs = item.images.slice(0, compact ? 2 : item.images.length);
  const meta = mediaMeta(item);

  return `
    <article class="timeline-card">
      <div class="timeline-card__content">
        <div class="tag-row">
          <span class="tag tag--icon">${item.iconHtml || ""} ${escapeHtml(item.title)}</span>
          <span class="tag">${escapeHtml(item.label)}</span>
          ${meta}
        </div>
        <h3>${escapeHtml(item.title)}</h3>
        <p class="timeline-card__meta">${escapeHtml(item.summary)}</p>
      </div>
      <div class="timeline-card__media">
        ${imgs.map((src) => mediaImage(src, item.title)).join("")}
      </div>
    </article>
  `;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 2800);
}

// ============================================================
// LIGHTBOX UNIVERSAL
// Funcționează pe orice pagină care include data.js.
// Ascultă click pe orice <img data-lightbox> și deschide modalul.
// ============================================================
function initLightbox() {
  // Injectează dialog-ul dacă nu există deja
  if (!document.getElementById("globalLightbox")) {
    const dialog = document.createElement("dialog");
    dialog.id = "globalLightbox";
    dialog.className = "modal";
    dialog.innerHTML = `
      <form method="dialog" class="modal__surface">
        <button class="modal__close" value="cancel" aria-label="Închide"><i class="bi bi-x-circle-fill"></i></button>
        <div class="modal__body" id="globalLightboxBody"></div>
      </form>
    `;
    document.body.appendChild(dialog);

    // Închide la click pe fundal
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) dialog.close();
    });

    // Închide cu Escape (nativ pe <dialog>)
  }

  // Delegare eveniment — prinde click pe orice imagine cu data-lightbox
  document.addEventListener("click", (e) => {
    const img = e.target.closest("img[data-lightbox]");
    if (!img) return;

    const src = img.dataset.lightboxSrc || img.src;
    const alt = img.dataset.lightboxAlt || img.alt || "";

    const dialog = document.getElementById("globalLightbox");
    const body = document.getElementById("globalLightboxBody");
    if (!dialog || !body) return;

    body.innerHTML = `
      <div class="modal__preview">
        <img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}"
             style="max-width:100%;max-height:80vh;object-fit:contain;border-radius:12px;"
             onerror="this.onerror=null;this.src='images/default.png';" />
      </div>
      ${alt ? `<div style="margin-top:1rem;"><p class="muted" style="text-align:center;">${escapeHtml(alt)}</p></div>` : ""}
    `;

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    }
  });
}

// Inițializează lightbox-ul automat la încărcarea paginii
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLightbox, { once: true });
} else {
  initLightbox();
}

window.JourneyMap = {
  APP_CONFIG,
  FEATURED_MEDIA,
  SEED_MEDIA,
  PROPOSAL_MEDIA,
  NEWPHOTO_MEDIA,
  TIMELINE,
  MAP_LOCATIONS,
  escapeHtml,
  escapeAttr,
  normalizeLocation,
  mediaMeta,
  mediaImage,
  mediaMarkup,
  groupByLocation,
  renderMapStage,
  cardTemplate,
  timelineTemplate,
  showToast,
  initLightbox,
};
