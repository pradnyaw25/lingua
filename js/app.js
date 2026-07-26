// Shared helpers: build the top nav and mark the active page.
(function () {
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

  const pages = [
    { href: "index.html", label: "Library" },
    { href: "vocab.html", label: "Frequency Words" },
    { href: "flashcards.html", label: "Flashcards" },
    { href: "about.html", label: "About" }
  ];
  const here = location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll("[data-nav]").forEach((nav) => {
    nav.innerHTML = pages
      .map((p) => {
        const active = p.href === here ? ' class="active"' : "";
        return `<a href="${p.href}"${active}>${p.label}</a>`;
      })
      .join("");
  });
})();

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
