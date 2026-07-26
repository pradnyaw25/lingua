// Shared helpers: global study language, top nav, and the active-page marker.
(function () {
  const here = location.pathname.split("/").pop() || "index.html";

  // ---- Global study language (French / Spanish) ----
  // Every language-scoped page reads window.LANG. Order of precedence:
  //   ?lang= in the URL  >  the language of the text being read  >  saved choice  >  French.
  const LANGS = [{ code: "fr", label: "Français" }, { code: "es", label: "Español" }];
  const isLang = (v) => v === "fr" || v === "es";
  const save = (v) => { try { localStorage.setItem("lingua.lang", v); localStorage.setItem("vocab.lang", v); } catch (e) {} };
  function pickLang() {
    const params = new URLSearchParams(location.search);
    const q = params.get("lang");
    if (isLang(q)) return q;
    if (here === "reader.html") {
      const id = params.get("id") || "";
      if (isLang(id.slice(0, 2))) return id.slice(0, 2);
    }
    let s; try { s = localStorage.getItem("lingua.lang") || localStorage.getItem("vocab.lang"); } catch (e) {}
    return isLang(s) ? s : "fr";
  }
  window.LANG = pickLang();
  save(window.LANG);

  // Merge auto-generated texts (batch library + daily) in front of the curated library.
  var extra = [].concat(window.DAILY || [], window.GENERATED || []);
  if (extra.length && window.TEXTS) {
    window.TEXTS = extra.concat(window.TEXTS);
  }

  // Curated texts (data/texts.js) predate the section/en_title fields the generator now
  // emits. Tag them here so every text carries an interest section + an English title,
  // which the library filter and cards rely on.
  var CURATED_META = {
    "fr-pixel-1": { section: "Fiction", en: "Pixel, the Cat Who Invested — Episode 1" },
    "es-pixel-1": { section: "Fiction", en: "Pixel, the Cat Who Invested — Episode 1" },
    "fr-pixel-2": { section: "Fiction", en: "Pixel, the Cat Who Invested — Episode 2" },
    "es-pixel-2": { section: "Fiction", en: "Pixel, the Cat Who Invested — Episode 2" },
    "fr-pixel-3": { section: "Fiction", en: "Pixel, the Cat Who Invested — Episode 3" },
    "es-pixel-3": { section: "Fiction", en: "Pixel, the Cat Who Invested — Episode 3" },
    "fr-pixel-4": { section: "Fiction", en: "Pixel, the Cat Who Invested — Episode 4" },
    "es-pixel-4": { section: "Fiction", en: "Pixel, the Cat Who Invested — Episode 4" },
    "fr-au-cafe": { section: "Everyday", en: "At the Café" },
    "es-en-el-cafe": { section: "Everyday", en: "At the Café" },
    "fr-la-valise": { section: "Fiction", en: "The Suitcase" },
    "es-la-maleta": { section: "Fiction", en: "The Suitcase" },
    "fr-application": { section: "Fiction", en: "The App" },
    "es-la-aplicacion": { section: "Fiction", en: "The App" },
    "fr-assistant": { section: "Fiction", en: "The Voice Assistant" },
    "es-el-asistente": { section: "Fiction", en: "The Voice Assistant" },
    "fr-recette": { section: "Food", en: "The Secret Recipe" },
    "es-la-receta": { section: "Food", en: "The Secret Recipe" },
    "fr-corbeau-renard": { section: "Fiction", en: "The Crow and the Fox" },
    "fr-lion-souris": { section: "Fiction", en: "The Lion and the Mouse" },
    "es-liebre-tortuga": { section: "Fiction", en: "The Hare and the Tortoise" },
    "es-viento-sol": { section: "Fiction", en: "The Wind and the Sun" }
  };
  (window.TEXTS || []).forEach(function (t) {
    var c = CURATED_META[t.id];
    if (!t.section) t.section = (c && c.section) || "Everyday";
    if (!t.en_title) t.en_title = (c && c.en) || t.title;
    if (typeof t.new === "undefined") t.new = false;
  });

  // Pages scoped to a single language carry ?lang= so the choice follows you around
  // (and stays shareable); About is language-neutral.
  const pages = [
    { href: "index.html", label: "Library", scoped: true },
    { href: "vocab.html", label: "Frequency Words", scoped: true },
    { href: "flashcards.html", label: "Flashcards", scoped: true },
    { href: "about.html", label: "About", scoped: false }
  ];
  const SCOPED = { "index.html": 1, "vocab.html": 1, "flashcards.html": 1 };
  const withLang = (href) => href + "?lang=" + window.LANG;

  document.querySelectorAll("[data-nav]").forEach((nav) => {
    nav.innerHTML = pages
      .map((p) => {
        const active = p.href === here ? ' class="active"' : "";
        const href = p.scoped ? withLang(p.href) : p.href;
        return `<a href="${href}"${active}>${p.label}</a>`;
      })
      .join("");
  });

  // Carry the active language through the brand link and the reader's "back to library"
  // link too, so leaving a page keeps you in the same language.
  document.querySelectorAll('a[href="index.html"], a[href="vocab.html"], a[href="flashcards.html"]')
    .forEach((a) => { a.setAttribute("href", withLang(a.getAttribute("href"))); });

  // Header language switch — shown on the language-scoped pages.
  if (SCOPED[here]) {
    document.querySelectorAll(".site-header .wrap").forEach((wrap) => {
      if (wrap.querySelector(".lang-switch")) return;
      const sw = document.createElement("div");
      sw.className = "lang-switch";
      LANGS.forEach((l) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "lang-btn" + (l.code === window.LANG ? " on" : "");
        b.textContent = l.label;
        b.addEventListener("click", () => {
          if (l.code === window.LANG) return;
          save(l.code);
          const u = new URL(location.href);
          u.searchParams.set("lang", l.code);
          location.href = u.toString();
        });
        sw.appendChild(b);
      });
      const nav = wrap.querySelector(".nav");
      wrap.insertBefore(sw, nav || null);
    });
  }
})();

// Plain-English names for CEFR levels — not everyone knows the A1/B2 codes.
window.LEVEL_LABELS = {
  A1: "Beginner", A2: "Advanced Beginner", B1: "Intermediate",
  B2: "Upper Intermediate", C1: "Advanced", C2: "Mastery"
};
// "A2 · Advanced Beginner" (falls back to the bare code if unknown).
window.levelText = function (code) {
  const name = window.LEVEL_LABELS[code];
  return name ? code + " · " + name : (code || "");
};

// Per-text "read" state, remembered on this device.
window.isRead = function (id) {
  try { return localStorage.getItem("read:" + id) === "1"; } catch (e) { return false; }
};
window.setRead = function (id, on) {
  try {
    if (on) localStorage.setItem("read:" + id, "1");
    else localStorage.removeItem("read:" + id);
  } catch (e) {}
};

// Tiny helper shared by pages.
window.el = function (tag, attrs, children) {
  const node = document.createElement(tag);
  if (attrs) for (const k in attrs) {
    if (k === "class") node.className = attrs[k];
    else if (k === "text") node.textContent = attrs[k];
    else node.setAttribute(k, attrs[k]);
  }
  (children || []).forEach((c) => node.appendChild(c));
  return node;
};
