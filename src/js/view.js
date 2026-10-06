// ---- view transform ----
let view = { x: 0, y: 0, k: 1 };
function apply() {
  world.setAttribute("transform", `translate(${view.x},${view.y}) scale(${view.k})`);
}
function extents() {
  let mx = HUB,
    my = HUB;
  for (const s of services) {
    const c = cur[s.id],
      w = cardW(s, c.t),
      h = cardH(s, c.t);
    mx = Math.max(mx, Math.abs(c.x) + w / 2);
    my = Math.max(my, Math.abs(c.y - HH / 2), Math.abs(c.y - HH / 2 + h));
  }
  return [mx, my];
}
function fit() {
  const r = svg.getBoundingClientRect();
  const [mx, my] = extents();
  view.k = Math.max(0.3, Math.min(1, (r.width / 2 - 12) / mx, (r.height / 2 - 12) / my));
  view.x = r.width / 2;
  view.y = r.height / 2;
  apply();
}
function zoomAt(f, cx, cy) {
  const k2 = Math.min(2.5, Math.max(0.2, view.k * f));
  view.x = cx - ((cx - view.x) * k2) / view.k;
  view.y = cy - ((cy - view.y) * k2) / view.k;
  view.k = k2;
  apply();
}
function ensureVisible(s) {
  const r = svg.getBoundingClientRect(),
    c = cur[s.id],
    w = cardW(s, c.t),
    h = cardH(s, c.t),
    m = 44;
  const x0 = (c.x - w / 2) * view.k + view.x,
    x1 = (c.x + w / 2) * view.k + view.x,
    y0 = (c.y - HH / 2) * view.k + view.y,
    y1 = (c.y - HH / 2 + h) * view.k + view.y;
  const visH = innerWidth <= 760 && !panel.hidden ? r.height * 0.42 : r.height;
  let dx = 0,
    dy = 0;
  if (x1 > r.width - m) {
    dx = r.width - m - x1;
  }
  if (x0 + dx < m) {
    dx = m - x0;
  }
  if (y1 > visH - m) {
    dy = visH - m - y1;
  }
  if (y0 + dy < m) {
    dy = m - y0;
  }
  if (dx || dy) {
    view.x += dx;
    view.y += dy;
    apply();
  }
}
