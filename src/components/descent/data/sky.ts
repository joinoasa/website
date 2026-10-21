import type { Layer } from '../types';

export const sky: Layer = {
  id: 'sky',
  name: 'Sky',
  range: '20 km to treetops',
  gauge: '20 km',
  dark: false,
  intro: 'Aircraft and airships that relay, map, search and watch, some for weeks at a time.',
  examples: [
    ['Atmospheric satellites', 'solar gliders that stay aloft for weeks, soaring through the night.'],
    ['Solar blimps', 'steerable, heavy-lift platforms for repeaters and sensors over disaster areas.'],
    ['Solar fixed-wing', 'long-range survey aircraft and roving relays.'],
    ['VTOL aircraft', 'take off like a drone, fly like a plane.'],
    ['Quadcopter teams', 'thermal search grids, mapping and supply drops.'],
    ['Relay drones', 'extend the range of smaller drones with weaker radios.'],
    ['Storm hunters', 'tough drones that collect data inside storms.'],
  ],
  nodes: [
    { id: 'blimp', x: 300, y: 350, label: 'Solar blimp', icon: 'blimp', domain: 'air', hub: true },
    { id: 'glider', x: 115, y: 150, label: 'Perma glider', icon: 'glider', domain: 'air' },
    { id: 'wing', x: 485, y: 160, label: 'Solar wing', icon: 'wing', domain: 'air' },
    { id: 'vtol', x: 490, y: 500, label: 'VTOL', icon: 'vtol', domain: 'air', motion: 'hover' },
    { id: 'quad', x: 120, y: 470, label: 'Search drone', icon: 'quad', domain: 'air', motion: 'hover', labelDx: -65 },
    { id: 'relay', x: 215, y: 610, label: 'Relay drone', icon: 'quad', domain: 'air', motion: 'hover' },
  ],
  links: [['blimp', 'glider'], ['blimp', 'wing'], ['blimp', 'vtol'], ['blimp', 'quad'], ['quad', 'relay'], ['relay', 'vtol']],
  pulses: [['blimp', 'glider'], ['blimp', 'vtol'], ['quad', 'relay']],
  threadTop: 'mesh',
  threadBottom: 'mesh',
};
