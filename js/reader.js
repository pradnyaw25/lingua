// Parallel reader: sentence-aligned columns with synced highlighting, plus
// click-a-word translation in the target column (popover fed by window.DICT).
(function () {
  const texts = window.TEXTS || [];
  const params = new URLSearchParams(location.search);
  let current = texts.find((t) => t.id === params.get("id")) || texts[0];
  let activeDict = {}; // set per render to DICT[text.lang]

  const selectEl = document.getElementById("text-select");
  const grid = document.getElementById("parallel");
  const headEl = document.getElementById("text-head");

  // ---- Tokenizer (keep in lock-step with tokenize() in scripts/build_dictionary.py) ----
  const WORD_RE = /[\p{L}][\p{L}'’-]*/gu;
  const ELIDE_RE = /^(qu|[ldjnmtsc])(['’])(.+)$/i;
  const ELIDE_SET = new Set(["l", "d", "j", "n", "m", "t", "s", "c", "qu"]);

  function norm(w) {
    return w.toLowerCase().replace(/[’`]/g, "'");
  }
  function splitElision(w) {
    const m = ELIDE_RE.exec(w);
    if (m && ELIDE_SET.has(m[1].toLowerCase())) return [m[1] + m[2], m[3]];
    return [w];
  }

  // ---- Word-translation popover (one shared element) ----
  const pop = document.createElement("div");
  pop.className = "wordpop";
  pop.style.display = "none";
  document.body.appendChild(pop);

  function closePop() {
    pop.style.display = "none";
    grid.querySelectorAll(".tok.sel").forEach((n) => n.classList.remove("sel"));
  }
  function showPop(anchor, word, gloss) {
    pop.innerHTML = "";
    const w = document.createElement("div");
    w.className = "wp-word";
    w.textContent = word;
    const g = document.createElement("div");
    g.className = "wp-gloss" + (gloss ? "" : " none");
    g.textContent = gloss || "— not in dictionary";
    pop.appendChild(w);
    pop.appendChild(g);
    pop.style.display = "block";

    const r = anchor.getBoundingClientRect();
    const maxLeft = window.scrollX + document.documentElement.clientWidth - pop.offsetWidth - 8;
    let left = r.left + window.scrollX;
    if (left > maxLeft) left = Math.max(window.scrollX + 8, maxLeft);
    pop.style.left = left + "px";
    pop.style.top = r.bottom + window.scrollY + 6 + "px";

    grid.querySelectorAll(".tok.sel").forEach((n) => n.classList.remove("sel"));
    anchor.classList.add("sel");
  }
  document.addEventListener("click", (e) => {
    if (!pop.contains(e.target) && !e.target.classList.contains("tok")) closePop();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePop(); });
  window.addEventListener("scroll", closePop, true);

  function lookup(w) {
    let g = activeDict[w];
    if (!g && w.includes("'")) g = activeDict[w.split("'").pop()]; // e.g. l'arbre -> arbre
    return g;
  }

  // Render a sentence into clickable word tokens (target column only).
  function renderTokens(container, text) {
    let last = 0, m;
    WORD_RE.lastIndex = 0;
    while ((m = WORD_RE.exec(text)) !== null) {
      if (m.index > last) container.appendChild(document.createTextNode(text.slice(last, m.index)));
      for (const part of splitElision(m[0])) {
        const span = document.createElement("span");
        span.className = "tok";
        span.textContent = part;
        span.dataset.w = norm(part);
        span.addEventListener("click", (e) => {
          e.stopPropagation(); // don't pin the sentence
          showPop(span, part, lookup(span.dataset.w));
        });
        container.appendChild(span);
      }
      last = WORD_RE.lastIndex;
    }
    if (last < text.length) container.appendChild(document.createTextNode(text.slice(last)));
  }

  // Populate the text picker, grouped by language.
  const byLang = {};
  texts.forEach((t) => { (byLang[t.langLabel] = byLang[t.langLabel] || []).push(t); });
  Object.keys(byLang).forEach((label) => {
    const group = document.createElement("optgroup");
    group.label = label;
    byLang[label].forEach((t) => {
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = t.title;
      group.appendChild(opt);
    });
    selectEl.appendChild(group);
  });

  function highlight(index, on) {
    grid.querySelectorAll('[data-i="' + index + '"]').forEach((n) => n.classList.toggle("active", on));
  }

  function render(text) {
    current = text;
    activeDict = (window.DICT && window.DICT[text.lang]) || {};
    selectEl.value = text.id;
    history.replaceState(null, "", "?id=" + encodeURIComponent(text.id));
    closePop();

    headEl.innerHTML =
      '<h1>' + text.title + '</h1>' +
      '<p class="meta">' + text.langLabel + ' · ' + (text.level || "") +
      ' · <span>' + text.source + '</span></p>';

    grid.innerHTML = "";
    grid.appendChild(el("div", { class: "col-head target-head", text: text.langLabel }, []));
    grid.appendChild(el("div", { class: "col-head en-head", text: "English" }, []));

    text.pairs.forEach((pair, i) => {
      const t = el("div", { class: "sent target", "data-i": i }, []);
      renderTokens(t, pair.target); // clickable words
      const e = el("div", { class: "sent en", "data-i": i, text: pair.en }, []);
      [t, e].forEach((node) => {
        node.addEventListener("mouseenter", () => highlight(i, true));
        node.addEventListener("mouseleave", () => {
          if (!node.classList.contains("sticky")) highlight(i, false);
        });
        node.addEventListener("click", () => {
          const already = node.classList.contains("active");
          grid.querySelectorAll(".sent.active").forEach((n) => n.classList.remove("active", "sticky"));
          if (!already) {
            grid.querySelectorAll('[data-i="' + i + '"]').forEach((n) => n.classList.add("active", "sticky"));
          }
        });
      });
      grid.appendChild(t);
      grid.appendChild(e);
    });
  }

  selectEl.addEventListener("change", () => render(texts.find((t) => t.id === selectEl.value)));

  // Toolbar toggles.
  document.getElementById("btn-swap").addEventListener("click", (e) => {
    grid.classList.toggle("swap");
    e.target.classList.toggle("on");
  });
  document.getElementById("btn-hide-en").addEventListener("click", (e) => {
    grid.classList.toggle("hide-en");
    e.target.classList.toggle("on");
    e.target.textContent = grid.classList.contains("hide-en") ? "Show English" : "Hide English (self-test)";
  });
  document.getElementById("font-size").addEventListener("change", (e) => {
    grid.classList.remove("fs-s", "fs-l");
    if (e.target.value !== "m") grid.classList.add("fs-" + e.target.value);
  });

  if (current) render(current);
  else grid.innerHTML = '<p class="empty">No texts loaded.</p>';
})();
