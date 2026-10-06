// search
const q = document.getElementById("q"),
  results = document.getElementById("results");
const index = Object.values(nodes)
  .filter((n) => n.kind !== "root")
  .map((n) => ({
    n,
    label: n.label.toLowerCase(),
    text: (n.d || []).join(" ").replace(/\*\*/g, "").toLowerCase(),
  }));
function runSearch() {
  const v = q.value.trim().toLowerCase();
  hits = new Set();
  if (v.length < 2) {
    results.hidden = true;
    draw();
    return;
  }
  const found = index
    .filter((i) => i.label.includes(v) || i.text.includes(v))
    .sort(
      (a, b) =>
        b.label.includes(v) - a.label.includes(v) ||
        (a.n.kind === "svc" ? -1 : 1) - (b.n.kind === "svc" ? -1 : 1),
    );
  found.forEach((f) => {
    hits.add(f.n.id);
    if (f.n.kind === "con") {
      hits.add(f.n.parent.id);
    }
  });
  results.innerHTML = found.length
    ? found
      .slice(0, 14)
      .map(
        (f) =>
          `<button type="button" data-hit="${f.n.id}">${esc(f.n.label)}<small>${f.n.kind === "svc" ? DOMS[f.n.dom].n : esc(f.n.parent.label)}</small></button>`,
      )
      .join("")
    : `<button type="button" disabled>No match for “${esc(q.value.trim())}”</button>`;
  results.hidden = false;
  draw();
}
q.addEventListener("input", runSearch);
q.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const f = results.querySelector("[data-hit]");
    if (f) {
      f.click();
    }
  }
  if (e.key === "Escape") {
    q.value = "";
    runSearch();
  }
});
results.addEventListener("click", (e) => {
  const b = e.target.closest("[data-hit]");
  if (!b) {
    return;
  }
  results.hidden = true;
  select(nodes[b.dataset.hit]);
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".search")) {
    results.hidden = true;
  }
});
