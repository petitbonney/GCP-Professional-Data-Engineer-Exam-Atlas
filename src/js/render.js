// ---- rendering ----
const esc = (s) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
function matches(s) {
  if (!filter) {
    return true;
  }
  return filter.t === "dom" ? s.dom === filter.v : s.sec.some((x) => x.startsWith(filter.v));
}
let cur = {};
function arcPath(r, a0, a1) {
  const p = (a) => `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`;
  return `M${p(a0)} A${r},${r} 0 ${a1 - a0 > Math.PI ? 1 : 0} 1 ${p(a1)}`;
}
function draw() {
  let h = "";
  // spokes
  for (const s of services) {
    const c = cur[s.id];
    h += `<line class="spoke${matches(s) ? "" : " dim"}" style="--dc:var(--${s.dom})" x1="0" y1="0" x2="${c.x.toFixed(1)}" y2="${c.y.toFixed(1)}"/>`;
  }
  // domain arcs around the hub
  const step = angles.length > 1 ? angles[1] - angles[0] : 0.1;
  const doms = [...new Set(services.map((s) => s.dom))];
  for (const d of doms) {
    const idx = services.map((s, i) => (s.dom === d ? i : -1)).filter((i) => i >= 0);
    const a0 = angles[idx[0]] - step * 0.45,
      a1 = angles[idx[idx.length - 1]] + step * 0.45;
    const dim = filter && filter.t === "dom" && filter.v !== d ? " dim" : "";
    h += `<path class="arc${dim}" style="--dc:var(--${d})" d="${arcPath(HUB + 14, a0, a1)}"><title>${esc(DOMS[d].n)}</title></path>`;
  }
  h += `<g class="hub" aria-hidden="true"><circle r="${HUB}"/><text>GCP</text></g>`;
  // cards: closed first, open on top, selected last
  const order = [...services].sort(
    (a, b) =>
      cur[a.id].t - cur[b.id].t ||
      (selected && (selected === a || selected.parent === a) ? 1 : 0) -
      (selected && (selected === b || selected.parent === b) ? 1 : 0),
  );
  for (const s of order) {
    h += cardSVG(s);
  }
  world.innerHTML = h;
  // the map is rebuilt on every frame: put keyboard focus back on the active header/row
  if (
    focusId &&
    (document.activeElement === document.body ||
      world.contains(document.activeElement) ||
      !document.activeElement)
  ) {
    const el = world.querySelector(`[data-id="${focusId}"]`);
    if (el) {
      el.focus({ preventScroll: true });
    }
  }
}
let focusId = null;
function cardSVG(s) {
  const c = cur[s.id],
    t = c.t,
    w = cardW(s, t),
    hgt = cardH(s, t);
  const own = selected && (selected === s || selected.parent === s);
  const hit = hits.has(s.id);
  const cls = `svc${s.open ? " open" : ""}${selected === s ? " sel" : ""}${hit ? " hit" : ""}${matches(s) ? "" : " dim"}`;
  let g = `<g class="${cls}" style="--dc:var(--${s.dom})" transform="translate(${(c.x - w / 2).toFixed(1)},${(c.y - HH / 2).toFixed(1)})">
    <rect class="card" width="${w.toFixed(1)}" height="${hgt.toFixed(1)}" rx="10"/>
    <g class="head" data-id="${s.id}" tabindex="0" role="button" aria-expanded="${s.open}" aria-label="${esc(s.label)}">
      <rect class="hit-area" width="${w.toFixed(1)}" height="${HH}" rx="10"/>
      <text x="${PAD}" y="${HH / 2}">${esc(s.label)}</text>
      <g class="icon" transform="translate(${(w - PAD - ICON).toFixed(1)},${(HH - ICON) / 2})">
        <rect width="${ICON}" height="${ICON}" rx="4"/>
        <line x1="4" y1="${ICON / 2}" x2="${ICON - 4}" y2="${ICON / 2}"/>${s.open ? "" : `<line x1="${ICON / 2}" y1="4" x2="${ICON / 2}" y2="${ICON - 4}"/>`}
      </g>
    </g>`;
  if (t > 0.01) {
    g += `<clipPath id="cp-${s.id}"><rect width="${w.toFixed(1)}" height="${hgt.toFixed(1)}" rx="10"/></clipPath>
      <g clip-path="url(#cp-${s.id})" opacity="${t.toFixed(2)}"><line class="sep" x1="8" x2="${(w - 8).toFixed(1)}" y1="${HH}" y2="${HH}"/>`;
    s.children.forEach((k, i) => {
      g += `<g class="row${selected === k ? " sel" : ""}${hits.has(k.id) ? " rhit" : ""}" data-id="${k.id}" tabindex="${s.open ? 0 : -1}" role="button" aria-label="${esc(k.label)}" transform="translate(0,${HH + 5 + i * RH})">
        <rect class="rowbg" x="5" width="${(w - 10).toFixed(1)}" height="${RH - 2}" rx="6"/>
        <circle cx="${PAD + 2}" cy="${(RH - 2) / 2}" r="2.5"/><text x="${PAD + 12}" y="${(RH - 2) / 2}">${esc(k.label)}</text></g>`;
    });
    g += `</g>`;
  }
  return g + "</g>";
}

// ---- animation between layouts ----
let anim = null;
function relayout(after, primaryId) {
  const T = computeTargets(primaryId);
  if (anim) {
    cancelAnimationFrame(anim);
  }
  const from = cur,
    ids = Object.keys(T);
  if (reduceMotion || !Object.keys(from).length) {
    cur = T;
    draw();
    after && after();
    return;
  }
  const t0 = performance.now(),
    D = 380,
    ease = (x) => 1 - Math.pow(1 - x, 3);
  const step = (now) => {
    const k = ease(Math.min(1, (now - t0) / D));
    const n = {};
    for (const id of ids) {
      const a = from[id] || T[id],
        b = T[id];
      n[id] = { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, t: a.t + (b.t - a.t) * k };
    }
    cur = n;
    draw();
    if (k < 1) {
      anim = requestAnimationFrame(step);
    } else {
      anim = null;
      after && after();
    }
  };
  anim = requestAnimationFrame(step);
}
