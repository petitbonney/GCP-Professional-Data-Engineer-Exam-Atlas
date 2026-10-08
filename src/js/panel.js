// ---- panel ----
const panel = document.getElementById("panel");
function md(s) {
  return abbr(esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"));
}
function bullet(b) {
  const m = b.match(/^(Use when|Avoid when)(?: \(([^)]+)\))?:\s*(.*)$/);
  if (m) {
    return `<li class="ua ${m[1].startsWith("Use") ? "use" : "avoid"}"><span class="lab">${m[1]}</span>${m[2] ? "<em>(" + md(m[2]) + ")</em> " : ""}${md(m[3])}</li>`;
  }
  return `<li>${md(b)}</li>`;
}
// glossary view: shown over whatever the panel held; closing it restores that view and its scroll position
let glossary = null; // { key: highlighted acronym or null, scroll: panel scroll before opening }
function openGlossary(key) {
  if (!glossary) {
    glossary = { scroll: panel.scrollTop };
  }
  glossary.key = key || null;
  showPanel();
}
function closeGlossary() {
  const y = glossary.scroll;
  glossary = null;
  showPanel();
  panel.scrollTop = y;
}
function showGlossary() {
  panel.hidden = false;
  panel.style.setProperty("--dc", "var(--accent)");
  const keys = Object.keys(ACRONYMS).sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
  panel.innerHTML = `<div class="crumb sticky"><span>Glossary</span><button type="button" class="back" data-gclose aria-label="Close glossary">Close ✕</button></div>
    <h2>Acronyms</h2>
    <dl class="gloss">${keys.map((k) => `<div data-gl="${esc(k)}"${k === glossary.key ? ' class="on"' : ""}><dt>${esc(k)}</dt><dd>${esc(ACRONYMS[k])}</dd></div>`).join("")}</dl>`;
  const on = panel.querySelector(".gloss .on");
  if (on) {
    on.scrollIntoView({ block: "center" });
  } else {
    panel.scrollTop = 0;
  }
}
function showPanel() {
  glossBtn.setAttribute("aria-pressed", String(!!glossary));
  if (glossary) {
    showGlossary();
    return;
  }
  if (!selected) {
    panel.style.setProperty("--dc", "var(--accent)");
    panel.innerHTML = `<div class="crumb">How to use</div><h2>${abbr("GCP Data Engineer map")}</h2>
      <p class="empty">${services.length} services around GCP in 7 colour groups, ${Object.keys(nodes).length - services.length - 1} concepts. <strong>Click a service</strong> to slide out its concept list and read its notes; click it again to fold it away. Click a concept in the list for its notes.</p>
      <p class="empty">Use the <strong>exam section</strong> buttons to highlight services that map to each part of the official guide, or a <strong>group chip</strong> to focus one area.</p>
      <p class="empty">Names follow the exam guide. 2026 rebrands are noted in the details: Dataproc → Managed Service for Apache Spark, Composer → Managed Service for Apache Airflow, Dataplex → Knowledge Catalog, BigLake → Lakehouse, Vertex AI → Gemini Enterprise Agent Platform.</p>`;
    if (innerWidth <= 760) {
      panel.hidden = true;
    }
    return;
  }
  panel.hidden = false;
  const n = selected,
    svc = n.kind === "svc" ? n : n.parent;
  panel.style.setProperty("--dc", `var(--${n.dom})`);
  let h = `<div class="crumb"><span>${esc(DOMS[n.dom].n)}${n.kind === "con" ? ` › <button type="button" data-go="${svc.id}">${md(svc.label)}</button>` : ""}</span><button type="button" class="close" data-close aria-label="Close details">Close ✕</button></div>
    <h2>${md(n.label)}</h2>`;
  if (n.kind === "svc") {
    h += `<div class="tags">${n.sec.map((s) => `<span class="tag">Exam §${s}</span>`).join("")}</div>`;
  }
  h += `<ul>${n.d.map(bullet).join("")}</ul>`;
  if (n.kind === "svc") {
    h += `<h3>Key concepts</h3><div class="kids">${n.children.map((c) => `<button type="button" class="chip" data-go="${c.id}">${md(c.label)}</button>`).join("")}</div>`;
  } else {
    const sib = svc.children.filter((c) => c !== n);
    if (sib.length) {
      h += `<h3>Also in ${md(svc.label)}</h3><div class="kids">${sib.map((c) => `<button type="button" class="chip" data-go="${c.id}">${md(c.label)}</button>`).join("")}</div>`;
    }
  }
  panel.innerHTML = h;
  panel.scrollTop = 0;
}
panel.addEventListener("click", (e) => {
  const acr = e.target.closest("[data-acr]");
  if (acr) {
    openGlossary(acr.dataset.acr);
    return;
  }
  if (e.target.closest("[data-gclose]")) {
    closeGlossary();
    return;
  }
  const go = e.target.closest("[data-go]");
  if (go) {
    select(nodes[go.dataset.go]);
    return;
  }
  if (e.target.closest("[data-close]")) {
    selected = null;
    draw();
    showPanel();
  }
});
function anchorHere(s) {
  const c = cur[s.id];
  if (c) {
    s.anchor = { left: c.x - cardW(s, c.t) / 2, y: c.y };
  }
}
// open (if needed) and select a node, then bring its card into view
function select(n, fromMap) {
  glossary = null;
  const s = n.kind === "svc" ? n : n.parent;
  selected = n;
  showPanel();
  if (!s.open) {
    anchorHere(s);
    s.open = true;
    relayout(fromMap ? null : () => ensureVisible(s), s.id);
  } else {
    draw();
    if (!fromMap) {
      ensureVisible(s);
    }
  }
}
