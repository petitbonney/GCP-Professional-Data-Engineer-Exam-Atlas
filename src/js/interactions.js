// ---- interactions ----
function activate(t) {
  const g = t.closest(".head, .row");
  if (!g) {
    return;
  }
  const n = nodes[g.dataset.id];
  if (n.kind === "svc") {
    if (n.open) {
      n.open = false;
      delete n.anchor;
      if (selected && (selected === n || selected.parent === n)) {
        selected = null;
      }
      showPanel();
      relayout();
    } else {
      select(n, true);
    }
  } else {
    // deselecting a concept falls back to its service's notes
    if (selected === n) {
      selected = n.parent;
      showPanel();
      draw();
    } else {
      select(n, true);
    }
  }
  focusId = n.id;
  const el = world.querySelector(`[data-id="${n.id}"]`);
  if (el) {
    el.focus({ preventScroll: true });
  }
}
let drag = null,
  moved = 0;
const ptrs = new Map();
let pinch = null;
const stage = document.getElementById("stage");
stage.addEventListener("pointerdown", (e) => {
  if (!e.target.closest(".head, .row")) {
    focusId = null;
  }
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (ptrs.size === 2) {
    const [a, b] = [...ptrs.values()];
    pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) };
    drag = null;
    return;
  }
  drag = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
  moved = 0;
});
stage.addEventListener("pointermove", (e) => {
  if (!ptrs.has(e.pointerId)) {
    return;
  }
  ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch && ptrs.size === 2) {
    const [a, b] = [...ptrs.values()];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    const r = svg.getBoundingClientRect();
    zoomAt(d / pinch.d, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
    pinch.d = d;
    moved = 99;
    return;
  }
  if (!drag) {
    return;
  }
  const dx = e.clientX - drag.x,
    dy = e.clientY - drag.y;
  moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
  if (moved > 4) {
    stage.classList.add("dragging");
    if (!stage.hasPointerCapture(e.pointerId)) {
      stage.setPointerCapture(e.pointerId);
    }
    view.x = drag.vx + dx;
    view.y = drag.vy + dy;
    apply();
  }
});
function endPtr(e) {
  ptrs.delete(e.pointerId);
  if (ptrs.size < 2) {
    pinch = null;
  }
  drag = null;
  stage.classList.remove("dragging");
}
stage.addEventListener("pointerup", endPtr);
stage.addEventListener("pointercancel", endPtr);
stage.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const r = svg.getBoundingClientRect();
    zoomAt(Math.exp(-e.deltaY * 0.0015), e.clientX - r.left, e.clientY - r.top);
  },
  { passive: false },
);
world.addEventListener("click", (e) => {
  if (moved > 4) {
    return;
  }
  activate(e.target);
});
world.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    activate(e.target);
    return;
  }
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") {
    return;
  }
  // Up/Down walk through an open concept list (header = position -1)
  const g = e.target.closest(".head, .row");
  if (!g) {
    return;
  }
  const n = nodes[g.dataset.id],
    s = n.kind === "svc" ? n : n.parent;
  if (!s.open) {
    return;
  }
  e.preventDefault();
  const list = s.children;
  let i = (n.kind === "svc" ? -1 : list.indexOf(n)) + (e.key === "ArrowDown" ? 1 : -1);
  i = Math.max(-1, Math.min(list.length - 1, i));
  const target = i < 0 ? s : list[i];
  selected = target;
  focusId = target.id;
  showPanel();
  draw();
  const el = world.querySelector(`[data-id="${target.id}"]`);
  if (el) {
    el.focus({ preventScroll: true });
  }
});

document.getElementById("expand").onclick = () => {
  services.forEach((s) => {
    s.open = true;
    delete s.anchor;
  });
  relayout(fit);
};
document.getElementById("collapse").onclick = () => {
  services.forEach((s) => {
    s.open = false;
    delete s.anchor;
  });
  selected = null;
  showPanel();
  relayout(fit);
};
document.getElementById("fit").onclick = fit;
const mid = () => {
  const r = svg.getBoundingClientRect();
  return [r.width / 2, r.height / 2];
};
document.getElementById("zin").onclick = () => zoomAt(1.25, ...mid());
document.getElementById("zout").onclick = () => zoomAt(0.8, ...mid());
