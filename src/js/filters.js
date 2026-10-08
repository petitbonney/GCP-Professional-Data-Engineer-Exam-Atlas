// exam strip & legend
const strip = document.getElementById("strip");
strip.innerHTML = SECTIONS.map(
  (s) =>
    `<button type="button" class="sec" data-sec="${s.id}" aria-pressed="false"><b>§${s.id}</b><span>${s.n}</span><em>~${s.w}%</em></button>`,
).join("");
const legend = document.getElementById("legend");
legend.innerHTML = Object.entries(DOMS)
  .map(
    ([k, v]) =>
      `<button type="button" class="chip" data-dom="${k}" aria-pressed="false" style="--dc:var(--${k})"><i></i>${v.n}</button>`,
  )
  .join("") +
  `<button type="button" class="chip gloss-btn" id="glossBtn" aria-pressed="false">Glossary</button>`;
const glossBtn = document.getElementById("glossBtn");
glossBtn.addEventListener("click", () => (glossary ? closeGlossary() : openGlossary()));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && glossary && e.target !== q) {
    closeGlossary();
  }
});
function setFilter(f) {
  filter = f && filter && f.t === filter.t && f.v === filter.v ? null : f;
  document
    .querySelectorAll("[data-sec],[data-dom]")
    .forEach((b) =>
      b.setAttribute(
        "aria-pressed",
        String(
          !!filter &&
          ((filter.t === "sec" && b.dataset.sec === filter.v) ||
            (filter.t === "dom" && b.dataset.dom === filter.v)),
        ),
      ),
    );
  draw();
}
strip.addEventListener("click", (e) => {
  const b = e.target.closest("[data-sec]");
  if (b) {
    setFilter({ t: "sec", v: b.dataset.sec });
  }
});
legend.addEventListener("click", (e) => {
  const b = e.target.closest("[data-dom]");
  if (b) {
    setFilter({ t: "dom", v: b.dataset.dom });
  }
});
