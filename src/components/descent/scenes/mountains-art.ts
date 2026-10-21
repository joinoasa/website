import { contour } from '../art';

export const backPts: [number, number][] = [[-3000, 600], [-1500, 600], [-900, 520], [-500, 580], [-200, 500], [90, 470], [170, 540], [240, 430], [330, 520], [430, 400], [520, 470], [600, 420], [800, 480], [1100, 430], [1500, 520], [2100, 470], [3600, 470]];
export const frontPts: [number, number][] = [[-3000, 700], [-1500, 700], [-1000, 640], [-600, 690], [-300, 640], [0, 670], [80, 560], [150, 600], [230, 470], [300, 372], [380, 480], [450, 430], [540, 520], [600, 490], [800, 560], [1200, 520], [2100, 600], [3600, 600]];

export const poly = (p: [number, number][]) => 'M' + p.map(([x, y]) => `${x} ${y}`).join(' L') + ' V1800 H-3000 Z';

export const backRidge = poly(backPts);
export const frontRidge = poly(frontPts);

export const snowBack = 'M430 400 L471 432 L458 427 L449 438 L438 426 L425 437 L414 427 L403 432 Z M600 420 L667 440 L650 437 L640 446 L626 436 L612 447 L598 436 L583 444 L568 440 Z M240 430 L262 450 L253 447 L246 455 L238 446 L229 453 L222 446 Z';
export const snowFront = 'M300 372 L336 420 L326 414 L316 426 L304 411 L291 423 L281 412 L266 420 Z';

const fp = frontPts.filter(([x]) => x > -400);
const bp = backPts.filter(([x]) => x > -400);
export const backContours = [1, 2, 3].map((i) => contour(bp, 20 * i, 0.12 * i)).join(' ');
const fc = Array.from({ length: 12 }, (_, k) => k + 1).map((i) => ({ d: contour(fp, 22 * i, Math.min(0.9, 0.09 * i)), idx: i % 4 === 0 }));
export const minorContours = fc.filter((c) => !c.idx).map((c) => c.d).join(' ');
export const indexContours = fc.filter((c) => c.idx).map((c) => c.d).join(' ');

const r1 = (v: number) => Math.round(v * 10) / 10;
const conifer = (x: number, y: number, s: number) =>
  `M${x} ${r1(y - 22 * s)} L${r1(x + 7 * s)} ${r1(y - 6 * s)} L${r1(x + 4 * s)} ${r1(y - 6 * s)} L${r1(x + 9 * s)} ${r1(y + 4 * s)} L${r1(x - 9 * s)} ${r1(y + 4 * s)} L${r1(x - 4 * s)} ${r1(y - 6 * s)} L${r1(x - 7 * s)} ${r1(y - 6 * s)} Z`;
export const trees = ([[14, 665, 0.9], [34, 660, 1], [52, 650, 0.85], [96, 640, 1], [118, 652, 0.9], [196, 640, 1.1], [222, 622, 0.95], [244, 640, 1], [440, 600, 0.9], [462, 590, 1], [560, 590, 0.9], [584, 575, 1]] as [number, number, number][])
  .map(([x, y, s]) => conifer(x, y, s)).join(' ');

const pylon = (x: number, base: number, h = 62) =>
  `M${x - 9} ${base} L${x - 2} ${base - h} H${x + 2} L${x + 9} ${base} M${x - 7} ${base - 14} L${x + 5} ${base - 26} L${x - 4} ${base - 38} L${x + 3} ${base - 50} M${x + 7} ${base - 14} L${x - 5} ${base - 26} L${x + 4} ${base - 38} L${x - 3} ${base - 50} M${x - 15} ${base - h + 6} H${x + 15} M${x - 11} ${base - h + 16} H${x + 11}`;
export const pylons = `${pylon(400, 466)} ${pylon(610, 494)}`;
export const wires = 'M385 410 Q505 500 625 438 M385 418 Q505 506 625 446 M595 438 Q715 505 835 503';
export const spots = 'M430 392 l-5 8 h10 Z M600 412 l-5 8 h10 Z M240 422 l-5 8 h10 Z';
