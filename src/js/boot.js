let rz;
window.addEventListener("resize", () => {
  services.forEach((s) => delete s.anchor);
  if (innerWidth > 760) {
    panel.hidden = false;
  } else if (!selected) {
    panel.hidden = true;
  }
  clearTimeout(rz);
  rz = setTimeout(() => {
    cur = {};
    relayout(fit);
  }, 200);
});
function boot() {
  measure();
  showPanel();
  relayout();
  fit();
}
function remeasure() {
  measure();
  services.forEach((s) => delete s.anchor);
  cur = {};
  relayout();
  fit();
}
// load the label fonts explicitly before the first measurement (fonts.ready alone can resolve before they are requested)
const fontsLoaded = document.fonts
  ? Promise.race([
    Promise.all([document.fonts.load(FONT_HEAD, "GCP"), document.fonts.load(FONT_ROW, "GCP")]),
    new Promise((r) => setTimeout(r, 2500)),
  ]).catch(() => { })
  : Promise.resolve();
fontsLoaded.then(() => {
  boot();
  if (document.fonts) {
    document.fonts.addEventListener("loadingdone", remeasure);
  }
  // the map may start hidden or at zero size inside the viewer: redo the layout once it has real space
  let lastW = svg.getBoundingClientRect().width;
  new ResizeObserver(() => {
    const w = svg.getBoundingClientRect().width;
    if (w > 0 && lastW === 0) {
      remeasure();
    }
    lastW = w;
  }).observe(svg);
});
