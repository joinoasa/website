import { wave, circ } from '../art';

export const rays = [-1400, -900, -500, -180, 120, 480, 780, 1100, 1500, 2000].map((x) => `M300 250 L${x} 532`).join(' ');
export const rows = [382, 396, 416, 444, 482].map((y) => `M-3000 ${y}H3600`).join(' ');
export const parcels = 'M-180 532 L300 372 L120 532 Z M780 532 L300 372 L1100 532 Z';
export const strata = `${wave(640, 6, 140)} ${wave(720, 8, 180)}`;

const houses: [number, number, number, number][] = [[12, 40, 27, 19], [54, 30, 22, 15], [366, 38, 26, 18]];
export const walls = houses.map(([x, w, h]) => `M${x - w / 2} 372 V${372 - h} H${x + w / 2} V372 Z`).join(' ');
export const roofs = houses.map(([x, w, h, r]) => `M${x - w / 2 - 3} ${372 - h} L${x} ${372 - h - r} L${x + w / 2 + 3} ${372 - h} Z`).join(' ');

const tree = (x: number, r: number, h: number) => `M${x - 1.5} 372 V${372 - h} H${x + 1.5} V372 Z ` + circ(x, Math.round((372 - h - r * 0.7) * 10) / 10, r);
export const trees = ([[-34, 12, 11], [152, 9, 7], [395, 10, 9], [444, 10, 9], [548, 11, 10], [628, 10, 8]] as [number, number, number][])
  .map(([x, r, h]) => tree(x, r, h)).join(' ');
