// Shared art helpers for the Descent scenes.
const r1 = (v: number) => Math.round(v * 10) / 10;

export function wave(y: number, amp: number, step = 60, from = -1500, to = 2100) {
  let d = `M${from} ${y}`;
  for (let x = from, i = 0; x < to; x += step, i++) d += ` Q${x + step / 2} ${y + (i % 2 ? amp : -amp)} ${x + step} ${y}`;
  return d;
}

export const rand = (n: number) => { const v = Math.sin(n * 12.9898) * 43758.5453; return v - Math.floor(v); };

/** Catmull-Rom spline through points as a cubic bezier path. */
export function smooth(pts: [number, number][], closed = false, k = 1) {
  const p = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  for (let i = 1; i < p.length - 2; i++) {
    const [x0, y0] = p[i - 1], [x1, y1] = p[i], [x2, y2] = p[i + 1], [x3, y3] = p[i + 2];
    const c1 = [x1 + ((x2 - x0) / 6) * k, y1 + ((y2 - y0) / 6) * k];
    const c2 = [x2 - ((x3 - x1) / 6) * k, y2 - ((y3 - y1) / 6) * k];
    d += ` C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(x2)} ${r1(y2)}`;
  }
  return closed ? d + 'Z' : d;
}

/** Flat-bottomed cumulus built from arc bumps. Returns the shadowed base and the lit top. */
export function cloud(cx: number, by: number, w: number, h: number) {
  const mk = (cx: number, by: number, w: number, h: number) => {
    const x0 = cx - w / 2;
    const v = [[0, 0], [0.16, 0.34], [0.38, 0.56], [0.63, 0.5], [0.84, 0.28], [1, 0]].map(([fx, fy]) => [x0 + fx * w, by - fy * h]);
    let d = `M${r1(v[0][0])} ${r1(v[0][1])}`;
    for (let i = 1; i < v.length; i++) {
      const dx = v[i][0] - v[i - 1][0], dy = v[i][1] - v[i - 1][1];
      const rr = r1(Math.hypot(dx, dy) * 0.56);
      d += ` A${rr} ${rr} 0 0 1 ${r1(v[i][0])} ${r1(v[i][1])}`;
    }
    return d + 'Z';
  };
  return { base: mk(cx, by, w, h), top: mk(cx - w * 0.015, by - h * 0.16, w * 0.94, h * 0.86) };
}

/** Offset a skyline polyline downward and relax it toward its moving average. */
export function contour(pts: [number, number][], dy: number, relax: number) {
  const out = pts.map(([x, y], i) => {
    const a = pts[Math.max(0, i - 1)][1], b = pts[Math.min(pts.length - 1, i + 1)][1];
    const avg = (a + y + b) / 3;
    return [x, y + dy + (avg - y) * relax] as [number, number];
  });
  return smooth(out);
}

export const circ = (x: number, y: number, r: number) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;

/** Arc length along a circle of radius r (centre x cx) from xStart to x, for textPath startOffset. */
export const arcOffset = (r: number, cx: number, xStart: number, x: number) => r * (Math.asin((x - cx) / r) - Math.asin((xStart - cx) / r));
