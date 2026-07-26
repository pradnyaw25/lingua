// Frequency-word tables with quick-access categories, search, and "known" tracking.
// "All" is the frequency list (data/vocab.js); the other chips are curated thematic
// sets from window.CATEGORIES (Numbers, Questions, Adjectives, Verbs, Colors, …).
(function () {
  const vocab = window.VOCAB || {};
  const categories = window.CATEGORIES || {};
  const langs = Object.keys(vocab);

  // Language is chosen globally in the site header (window.LANG); fall back gracefully.
  let activeLang = (window.LANG && vocab[window.LANG]) ? window.LANG : langs[0];
  let activeCat = "all";
  let query = "";
  let showKnown = "all"; // all | unknown

  const tabsEl = document.getElementById("lang-tabs");
  const barEl = document.getElementById("cat-bar");
  const searchEl = document.getElementById("vocab-search");
  const filterEl = document.getElementById("known-filter");
  const statsEl = document.getElementById("vocab-stats");
  const bodyEl = document.getElementById("vocab-body");
  const tableEl = bodyEl.closest("table");

  function knownKey(lang, word) { return "known:" + lang + ":" + word; }
  function isKnown(lang, word) { return localStorage.getItem(knownKey(lang, word)) === "1"; }
  function setKnown(lang, word, on) {
    if (on) localStorage.setItem(knownKey(lang, word), "1");
    else localStorage.removeItem(knownKey(lang, word));
  }

  // Language is set in the header now, so the in-page tabs are gone.
  if (tabsEl) tabsEl.style.display = "none";

  // A category resolves to { label, lean, words:[{word,en,pos?,rank?}] }.
  function resolveCategory(id) {
    if (id === "all") {
      return { label: "Frequency · top 1000", lean: false, words: vocab[activeLang].words };
    }
    const cat = (categories[activeLang] || []).find((c) => c.id === id);
    return { label: cat ? cat.label : id, lean: true, words: cat ? cat.words : [] };
  }

  function chip(id, label, icon) {
    const b = el("button", { class: "chip", text: (icon ? icon + " " : "") + label }, []);
    b.dataset.cat = id;
    b.addEventListener("click", () => {
      activeCat = id;
      query = ""; searchEl.value = "";
      render();
    });
    return b;
  }

  function buildBar() {
    barEl.innerHTML = "";
    barEl.appendChild(chip("all", "All", ""));
    (categories[activeLang] || []).forEach((c) => barEl.appendChild(chip(c.id, c.label, c.icon)));
  }

  searchEl.addEventListener("input", () => { query = searchEl.value.trim().toLowerCase(); render(); });
  filterEl.addEventListener("change", () => { showKnown = filterEl.value; render(); });

  function render() {
    tabsEl.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.lang === activeLang));
    barEl.querySelectorAll(".chip").forEach((b) => b.classList.toggle("on", b.dataset.cat === activeCat));

    const cat = resolveCategory(activeCat);
    tableEl.classList.toggle("lean", cat.lean);

    const knownCount = cat.words.filter((w) => isKnown(activeLang, w.word)).length;
    statsEl.textContent =
      knownCount + " of " + cat.words.length + " marked known · " +
      cat.label + " · " + vocab[activeLang].langLabel;

    const rows = cat.words.filter((w) => {
      if (showKnown === "unknown" && isKnown(activeLang, w.word)) return false;
      if (!query) return true;
      return (w.word + " " + w.en + " " + (w.pos || "")).toLowerCase().includes(query);
    });

    bodyEl.innerHTML = "";
    if (!rows.length) {
      bodyEl.innerHTML = '<tr><td colspan="5" class="empty">No words match.</td></tr>';
      return;
    }

    rows.forEach((w, i) => {
      const known = isKnown(activeLang, w.word);
      const tr = el("tr", known ? { class: "known" } : {}, []);
      // rank column: real rank in "all"/pos views, sequential otherwise (hidden when lean)
      tr.appendChild(el("td", { class: "rank", text: String(w.rank || i + 1) }, []));
      tr.appendChild(el("td", { class: "word", text: w.word }, []));
      tr.appendChild(el("td", { text: w.en }, []));
      tr.appendChild(el("td", { class: "pos", text: w.pos || "" }, []));
      const cell = el("td", {}, []);
      const toggle = el("button", { class: "know-btn", title: "Mark as known", text: known ? "✓" : "+" }, []);
      toggle.addEventListener("click", () => { setKnown(activeLang, w.word, !isKnown(activeLang, w.word)); render(); });
      cell.appendChild(toggle);
      tr.appendChild(cell);
      bodyEl.appendChild(tr);
    });
  }

  buildBar();
  render();
})();
