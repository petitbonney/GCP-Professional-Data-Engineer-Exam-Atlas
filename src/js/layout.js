// ---- star layout: services on staggered ellipse rings, pushed outward until no card overlaps ----
let EX = 1.3,
  angles = [];
// Open cards are pinned where their header was when opened ("anchor"); closed cards flow from
// their home ring position and are pushed outward until nothing overlaps. Closing a card drops its
// anchor, so with everything closed the map returns exactly to its home layout.
function computeTargets(primaryId) {
  const st = svg.getBoundingClientRect();
  EX = Math.min(1.7, Math.max(1, st.width / Math.max(1, st.height)));
  const G = 0.9;
  let gaps = 0,
    last = null;
  const slot = [];
  services.forEach((s, i) => {
    if (s.dom !== last) {
      if (last) {
        gaps++;
      }
      last = s.dom;
    }
    slot.push(i + gaps * G);
  });
  const total = services.length + (gaps + 1) * G;
  angles = services.map((s, i) => -Math.PI / 2 + ((slot[i] + G / 2) / total) * Math.PI * 2);
  const P = services.map((s, i) => ({
    s,
    a: angles[i],
    r: 170 + (i % 2) * 80,
    w: cardW(s, s.open ? 1 : 0),
    h: cardH(s, s.open ? 1 : 0),
    pin: false,
  }));
  for (const p of P) {
    if (p.s.open && p.s.anchor) {
      p.pin = true;
      p.fx = p.s.anchor.left + p.w / 2;
      p.fy = p.s.anchor.y;
      p.r = Math.hypot(p.fx / EX, p.fy);
      p.a = Math.atan2(p.fy, p.fx / EX);
    }
  }
  const pos = (p) => (p.pin ? [p.fx, p.fy] : [p.r * EX * Math.cos(p.a), p.r * Math.sin(p.a)]);
  const M = 10;
  const overlap = (A, B) => {
    const [ax, ay] = pos(A),
      [bx, by] = pos(B);
    const ox = Math.min(ax + A.w / 2, bx + B.w / 2) - Math.max(ax - A.w / 2, bx - B.w / 2) + M;
    const oy =
      Math.min(ay - HH / 2 + A.h, by - HH / 2 + B.h) - Math.max(ay - HH / 2, by - HH / 2) + M;
    return ox > 0 && oy > 0 ? Math.min(ox, oy) : 0;
  };
  const unpin = (p) => {
    p.pin = false;
  }; // r and a already describe its current spot
  for (let it = 0; it < 4000; it++) {
    let moved = false;
    for (let i = 0; i < P.length; i++) {
      const A = P[i];
      if (!A.pin) {
        const [ax, ay] = pos(A);
        if (Math.hypot(ax, ay) < HUB + 40 + (A.w / 2) * Math.abs(Math.cos(A.a))) {
          A.r += 4;
          moved = true;
        }
      }
      for (let j = i + 1; j < P.length; j++) {
        const B = P[j],
          o = overlap(A, B);
        if (!o) {
          continue;
        }
        moved = true;
        if (A.pin && B.pin) {
          // two open cards collide: the one just clicked stays, the other one gives way
          unpin(A.s.id === primaryId ? B : B.s.id === primaryId ? A : A.r >= B.r ? A : B);
        }
        if (A.pin || B.pin) {
          const other = A.pin ? B : A;
          other.r += o * 0.5 + 1;
        } else {
          const [out, inn] = A.r >= B.r ? [A, B] : [B, A];
          out.r += o * 0.5 + 0.5;
          if (it < 300) {
            inn.r = Math.max(150, inn.r - o * 0.1);
          }
        }
      }
    }
    if (!moved) {
      break;
    }
  }
  const T = {};
  for (const p of P) {
    const [x, y] = pos(p);
    T[p.s.id] = { x, y, t: p.s.open ? 1 : 0 };
    if (p.s.open) {
      p.s.anchor = { left: x - p.w / 2, y };
    } // open cards keep this spot from now on
  }
  return T;
}
