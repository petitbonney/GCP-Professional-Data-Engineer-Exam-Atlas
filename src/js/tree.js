// ---- build tree ----
const nodes = {};
const services = [];
const root = { id: "root", label: "GCP", kind: "root" };
nodes.root = root;
for (const [id, label, dom, sec, d, cs] of S) {
  const svc = { id, label, dom, sec, d, kind: "svc", children: [], open: false };
  cs.forEach(([cl, cd], i) => {
    const c = { id: id + "-" + i, label: cl, dom, d: cd, kind: "con", parent: svc };
    svc.children.push(c);
    nodes[c.id] = c;
  });
  nodes[id] = svc;
  services.push(svc);
}
let selected = null,
  filter = null,
  hits = new Set();
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
