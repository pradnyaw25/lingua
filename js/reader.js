// Parallel reader: renders a sentence-aligned two-column view with synced highlighting.
(function () {
  const texts = window.TEXTS || [];
  const params = new URLSearchParams(location.search);
  let current = texts.find((t) => t.id === params.get("id")) || texts[0];

  const selectEl = document.getElementById("text-select");
  const grid = document.getElementById("parallel");
  const headEl = document.getElementById("text-head");

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
    grid.querySelectorAll('[data-i="' + index + '"]').forEach((n) =>
      n.classList.toggle("active", on)
    );
  }

  function render(text) {
    current = text;
    selectEl.value = text.id;
    history.replaceState(null, "", "?id=" + encodeURIComponent(text.id));

    headEl.innerHTML =
      '<h1>' + text.title + '</h1>' +
      '<p class="meta">' + text.langLabel + ' · ' + (text.level || "") +
      ' · <span>' + text.source + '</span></p>';

    grid.innerHTML = "";
    grid.appendChild(el("div", { class: "col-head target-head", text: text.langLabel }, []));
    grid.appendChild(el("div", { class: "col-head en-head", text: "English" }, []));

    text.pairs.forEach((pair, i) => {
      const t = el("div", { class: "sent target", "data-i": i, text: pair.target }, []);
      const e = el("div", { class: "sent en", "data-i": i, text: pair.en }, []);
      [t, e].forEach((node) => {
        node.addEventListener("mouseenter", () => highlight(i, true));
        node.addEventListener("mouseleave", () => {
          if (!node.classList.contains("sticky")) highlight(i, false);
        });
        node.addEventListener("click", () => {
          const already = node.classList.contains("active");
          grid.querySelectorAll(".sent.active").forEach((n) => {
            n.classList.remove("active", "sticky");
          });
          if (!already) {
            grid.querySelectorAll('[data-i="' + i + '"]').forEach((n) =>
              n.classList.add("active", "sticky")
            );
          }
        });
      });
      grid.appendChild(t);
      grid.appendChild(e);
    });
  }

  selectEl.addEventListener("change", () => {
    render(texts.find((t) => t.id === selectEl.value));
  });

  // Toolbar toggles.
  document.getElementById("btn-swap").addEventListener("click", (e) => {
    grid.classList.toggle("swap");
    e.target.classList.toggle("on");
  });
  document.getElementById("btn-hide-en").addEventListener("click", (e) => {
    grid.classList.toggle("hide-en");
    e.target.classList.toggle("on");
    e.target.textContent = grid.classList.contains("hide-en")
      ? "Show English" : "Hide English (self-test)";
  });
  document.getElementById("font-size").addEventListener("change", (e) => {
    grid.classList.remove("fs-s", "fs-l");
    if (e.target.value !== "m") grid.classList.add("fs-" + e.target.value);
  });

  if (current) render(current);
  else grid.innerHTML = '<p class="empty">No texts loaded.</p>';
})();
