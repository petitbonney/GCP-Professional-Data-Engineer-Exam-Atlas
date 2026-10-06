// ---- measuring ----
const world = document.getElementById("world"),
  svg = document.getElementById("svg");
const HH = 34,
  RH = 26,
  PAD = 12,
  ICON = 16,
  HUB = 56;
// Label widths: canvas measurement works even while the page is hidden; SVG measurement is used too
// when available, and the larger value wins so text never runs into the icon.
const FONT_HEAD = '700 13.5px "Schibsted Grotesk", "Segoe UI", system-ui, sans-serif';
const FONT_ROW = '500 12.5px "Schibsted Grotesk", "Segoe UI", system-ui, sans-serif';
const cv = document.createElement("canvas").getContext("2d");
function tw(t, cls) {
  cv.font = cls === "head" ? FONT_HEAD : FONT_ROW;
  let w = cv.measureText(t).width;
  try {
    const ns = "http://www.w3.org/2000/svg";
    const g = document.createElementNS(ns, "g");
    g.setAttribute("class", cls);
    g.setAttribute("visibility", "hidden");
    const tx = document.createElementNS(ns, "text");
    tx.textContent = t;
    g.appendChild(tx);
    svg.appendChild(g);
    w = Math.max(w, tx.getComputedTextLength() || 0);
    g.remove();
  } catch (e) { }
  return w;
}
function measure() {
  for (const s of services) {
    s.hw = Math.ceil(PAD + tw(s.label, "head") + 14 + ICON + PAD);
    let m = 0;
    for (const c of s.children) {
      m = Math.max(m, tw(c.label, "row"));
    }
    s.cw = Math.max(s.hw, Math.ceil(m + PAD * 2 + 20));
    s.dh = s.children.length * RH + 10;
  }
}
const cardW = (s, t) => s.hw + (s.cw - s.hw) * t;
const cardH = (s, t) => HH + s.dh * t;
