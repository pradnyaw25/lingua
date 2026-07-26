// Shared helpers: build the top nav and mark the active page.
(function () {
  const pages = [
    { href: "index.html", label: "Library" },
    { href: "vocab.html", label: "Frequency Words" },
    { href: "flashcards.html", label: "Flashcards" }
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
