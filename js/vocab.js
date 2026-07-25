// Frequency-word tables with search + "known" tracking (persisted in localStorage).
(function () {
  const vocab = window.VOCAB || {};
  const langs = Object.keys(vocab);
  let activeLang = localStorage.getItem("vocab.lang") || langs[0];
  let query = "";
  let showKnown = "all"; // all | unknown

  const tabsEl = document.getElementById("lang-tabs");
  const searchEl = document.getElementById("vocab-search");
  const filterEl = document.getElementById("known-filter");
  const statsEl = document.getElementById("vocab-stats");
  const bodyEl = document.getElementById("vocab-body");

  function knownKey(lang, word) { return "known:" + lang + ":" + word; }
  function isKnown(lang, word) { return localStorage.getItem(knownKey(lang, word)) === "1"; }
  function setKnown(lang, word, on) {
    if (on) localStorage.setItem(knownKey(lang, word), "1");
    else localStorage.removeItem(knownKey(lang, word));
  }

  // Language tabs.
  langs.forEach((lang) => {
    const btn = el("button", { class: "btn", text: vocab[lang].langLabel }, []);
    btn.addEventListener("click", () => {
      activeLang = lang;
      localStorage.setItem("vocab.lang", lang);
      render();
    });
    btn.dataset.lang = lang;
    tabsEl.appendChild(btn);
  });

  searchEl.addEventListener("input", () => { query = searchEl.value.trim().toLowerCase(); render(); });
  filterEl.addEventListener("change", () => { showKnown = filterEl.value; render(); });

  function render() {
    tabsEl.querySelectorAll("button").forEach((b) =>
      b.classList.toggle("on", b.dataset.lang === activeLang)
    );

    const all = vocab[activeLang].words;
    const knownCount = all.filter((w) => isKnown(activeLang, w.word)).length;
    statsEl.textContent =
      knownCount + " of " + all.length + " marked known · " +
      vocab[activeLang].langLabel;

    const rows = all.filter((w) => {
      if (showKnown === "unknown" && isKnown(activeLang, w.word)) return false;
      if (!query) return true;
      return (w.word + " " + w.en + " " + w.pos).toLowerCase().includes(query);
    });

    bodyEl.innerHTML = "";
    if (!rows.length) {
      bodyEl.innerHTML = '<tr><td colspan="5" class="empty">No words match.</td></tr>';
      return;
    }

    rows.forEach((w) => {
      const known = isKnown(activeLang, w.word);
      const tr = el("tr", known ? { class: "known" } : {}, []);
      tr.appendChild(el("td", { class: "rank", text: String(w.rank) }, []));
      tr.appendChild(el("td", { class: "word", text: w.word }, []));
      tr.appendChild(el("td", { text: w.en }, []));
      tr.appendChild(el("td", { class: "pos", text: w.pos }, []));
      const btn = el("td", {}, []);
      const toggle = el("button", {
        class: "know-btn", title: "Mark as known", text: known ? "✓" : "+"
      }, []);
      toggle.addEventListener("click", () => {
        setKnown(activeLang, w.word, !isKnown(activeLang, w.word));
        render();
      });
      btn.appendChild(toggle);
      tr.appendChild(btn);
      bodyEl.appendChild(tr);
    });
  }

  render();
})();
