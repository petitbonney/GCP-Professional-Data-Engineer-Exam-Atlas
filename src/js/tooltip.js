// ---- acronym tooltips: one shared bubble for every [data-tip], shown after a short delay (native titles are slow) ----
const tip = document.createElement("div");
tip.className = "tip";
tip.setAttribute("role", "tooltip");
tip.hidden = true;
document.body.appendChild(tip);
let tipFor = null,
  tipTimer;
function hideTip() {
  clearTimeout(tipTimer);
  tipFor = null;
  tip.hidden = true;
}
function showTip(el) {
  tip.textContent = el.dataset.tip;
  tip.hidden = false;
  // above the element, centred and kept on screen; below it when there is no room above
  const r = el.getBoundingClientRect(),
    t = tip.getBoundingClientRect();
  const x = Math.max(6, Math.min(innerWidth - t.width - 6, r.left + r.width / 2 - t.width / 2));
  const y = r.top - t.height - 6 >= 6 ? r.top - t.height - 6 : r.bottom + 6;
  tip.style.left = `${x}px`;
  tip.style.top = `${y}px`;
}
document.addEventListener("mouseover", (e) => {
  const el = e.target.closest("[data-tip]");
  if (el === tipFor) {
    return;
  }
  hideTip();
  if (el) {
    tipFor = el;
    tipTimer = setTimeout(() => showTip(el), 100);
  }
});
document.addEventListener("mouseout", (e) => {
  if (tipFor && !tipFor.contains(e.relatedTarget)) {
    hideTip();
  }
});
// the map moves under the cursor while panning or zooming: drop the bubble rather than leave it stranded
["pointerdown", "wheel", "scroll"].forEach((t) => document.addEventListener(t, hideTip, true));
