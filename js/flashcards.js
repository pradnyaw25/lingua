// Flashcard sessions over the frequency list or any curated category.
// Flip to reveal, then grade: "Got it" clears the card (optionally marks it known,
// syncing with the vocab table), "Again" re-queues it to the back of the deck.
(function () {
  const vocab = window.VOCAB || {};
  const categories = window.CATEGORIES || {};
  const langs = Object.keys(vocab);

  let lang = localStorage.getItem("vocab.lang") || langs[0];
  let dir = "target"; // "target" = show target word first; "en" = show English first
  let queue = [];
  let started = 0, got = 0;

  const $ = (id) => document.getElementById(id);
  const setupEl = $("fc-setup"), sessionEl = $("fc-session"), doneEl = $("fc-done");
  const langEl = $("fc-lang"), setEl = $("fc-set"), countEl = $("fc-count");
  const dirTargetBtn = $("fc-dir-target"), dirEnBtn = $("fc-dir-en"), markEl = $("fc-mark");
  const cardEl = $("fc-card");

  function setKnown(word, on) {
    const key = "known:" + lang + ":" + word;
    if (on) localStorage.setItem(key, "1"); else localStorage.removeItem(key);
  }

  function setsFor(l) {
    return [{ id: "all", label: "All · top 1000" }]
      .concat((categories[l] || []).map((c) => ({ id: c.id, label: c.label })));
  }
  function wordsFor(id) {
    if (id === "all") {
      return vocab[lang].words.filter((w) => w.en).map((w) => ({ word: w.word, en: w.en }));
    }
    const c = (categories[lang] || []).find((c) => c.id === id);
    return c ? c.words.map((w) => ({ word: w.word, en: w.en })) : [];
  }
  function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---- setup ----
  function buildLangTabs() {
    langEl.innerHTML = "";
    langs.forEach((l) => {
      const b = el("button", { class: "btn", text: vocab[l].langLabel }, []);
      b.classList.toggle("on", l === lang);
      b.addEventListener("click", () => {
        lang = l;
        localStorage.setItem("vocab.lang", l);
        buildLangTabs();
        buildSetOptions();
      });
      langEl.appendChild(b);
    });
    dirTargetBtn.textContent = vocab[lang].langLabel;
  }
  function buildSetOptions() {
    setEl.innerHTML = "";
    setsFor(lang).forEach((s) => {
      const o = document.createElement("option");
      o.value = s.id; o.textContent = s.label;
      setEl.appendChild(o);
    });
    updateCount();
  }
  function updateCount() {
    countEl.textContent = wordsFor(setEl.value).length + " cards";
  }
  setEl.addEventListener("change", updateCount);

  dirTargetBtn.addEventListener("click", () => { dir = "target"; dirTargetBtn.classList.add("on"); dirEnBtn.classList.remove("on"); });
  dirEnBtn.addEventListener("click", () => { dir = "en"; dirEnBtn.classList.add("on"); dirTargetBtn.classList.remove("on"); });

  // ---- session ----
  function show(section) {
    setupEl.classList.toggle("hidden", section !== "setup");
    sessionEl.classList.toggle("hidden", section !== "session");
    doneEl.classList.toggle("hidden", section !== "done");
  }

  function start() {
    queue = shuffle(wordsFor(setEl.value));
    if (!queue.length) return;
    started = queue.length; got = 0;
    show("session");
    renderCard();
  }

  function renderCard() {
    if (!queue.length) return finish();
    const c = queue[0];
    cardEl.classList.remove("flipped");
    const frontIsTarget = dir === "target";
    $("fc-front-lbl").textContent = frontIsTarget ? vocab[lang].langLabel : "English";
    $("fc-back-lbl").textContent = frontIsTarget ? "English" : vocab[lang].langLabel;
    $("fc-front").textContent = frontIsTarget ? c.word : c.en;
    $("fc-back").textContent = frontIsTarget ? c.en : c.word;
    $("fc-progress").textContent = got + " learned · " + queue.length + " left · " + started + " total";
  }

  function grade(knew) {
    if (!queue.length) return;
    const c = queue.shift();
    if (knew) {
      got++;
      if (markEl.checked) setKnown(c.word, true);
    } else {
      queue.push(c); // re-queue to the back
    }
    renderCard();
  }

  function finish() {
    show("done");
    $("fc-summary").textContent =
      "You cleared all " + started + " cards in " +
      vocab[lang].langLabel + " · " + setEl.options[setEl.selectedIndex].text + ".";
  }

  cardEl.addEventListener("click", () => cardEl.classList.toggle("flipped"));
  $("fc-again").addEventListener("click", () => grade(false));
  $("fc-got").addEventListener("click", () => grade(true));
  $("fc-exit").addEventListener("click", () => show("setup"));
  $("fc-start").addEventListener("click", start);
  $("fc-restart").addEventListener("click", start);
  $("fc-new").addEventListener("click", () => show("setup"));

  document.addEventListener("keydown", (e) => {
    if (sessionEl.classList.contains("hidden")) return;
    if (e.key === " " || e.key === "Enter") { e.preventDefault(); cardEl.classList.toggle("flipped"); }
    else if (e.key === "ArrowLeft") grade(false);
    else if (e.key === "ArrowRight") grade(true);
  });

  buildLangTabs();
  buildSetOptions();
  show("setup");
})();
