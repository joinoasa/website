import type { Layer } from '../types';

export const mountains: Layer = {
  id: 'mountains',
  name: 'Mountains',
  range: 'Peaks and ridgelines',
  gauge: '3,000 m',
  dark: false,
  intro: 'High ground covers whole valleys. Robots go where crews can’t easily reach.',
  examples: [
    ['Summit towers', 'solar mesh nodes on high ground that cover whole valleys.'],
    ['Kite and aerostat relays', 'cheap height for radios and cameras.'],
    ['Wildfire watch', 'thermal drones and blimps acting as modern fire towers.'],
    ['Power line robots', 'inspect lines across steep, remote terrain.'],
    ['Legged robots', 'climb rough slopes where wheels can’t go.'],
    ['Avalanche search', 'drones that find beacons and phones to guide ski patrol.'],
  ],
  nodes: [
    { id: 'tower', x: 300, y: 350, label: 'Summit tower', icon: 'tower', domain: 'land', hub: true, labelAbove: true },
    { id: 'kite', x: 120, y: 160, label: 'Kite relay', icon: 'kite', domain: 'air', motion: 'sway' },
    { id: 'fire', x: 480, y: 165, label: 'Fire watch', icon: 'flame', domain: 'air' },
    { id: 'line', x: 500, y: 455, label: 'Line robot', icon: 'linebot', domain: 'land' },
    { id: 'legs', x: 150, y: 520, label: 'Legged robot', icon: 'legged', domain: 'land' },
  ],
  links: [['tower', 'kite'], ['tower', 'fire'], ['tower', 'line'], ['tower', 'legs'], ['fire', 'line'], ['kite', 'legs', 'tether']],
  pulses: [['tower', 'kite'], ['tower', 'line'], ['fire', 'line']],
  threadTop: 'mesh',
  threadBottom: 'mesh',
};
