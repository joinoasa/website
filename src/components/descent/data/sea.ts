import type { Layer } from '../types';

export const sea: Layer = {
  id: 'sea',
  name: 'Sea',
  range: 'Rivers, lakes and coasts',
  gauge: 'Sea level',
  dark: false,
  intro: 'Boats and buoys that work the water day and night on solar power.',
  examples: [
    ['Solar boats', 'survey rivers, lakes and coasts around the clock.'],
    ['Buoys', 'floating mesh nodes and weather stations.'],
    ['Cleanup boats', 'skim algae and debris, then return to base to unload.'],
    ['Drone carriers', 'boats that launch scout drones and recover them.'],
    ['Invasive species patrol', 'spot invasive plants and animals in rivers and lakes.'],
    ['Water sampling', 'collect samples at set points on a schedule.'],
  ],
  nodes: [
    { id: 'buoy', x: 300, y: 350, label: 'Buoy', icon: 'buoy', domain: 'water', motion: 'bob', hub: true, labelAbove: true },
    { id: 'solar', x: 100, y: 350, label: 'Solar boat', icon: 'boat', domain: 'water', motion: 'bob', labelAbove: true },
    { id: 'clean', x: 200, y: 350, label: 'Cleanup boat', icon: 'cleanup', domain: 'water', motion: 'bob' },
    { id: 'carrier', x: 495, y: 350, label: 'Drone carrier', icon: 'carrier', domain: 'water', motion: 'bob', labelAbove: false },
    { id: 'scout', x: 430, y: 150, label: 'Scout drone', icon: 'quad', domain: 'air', motion: 'hover' },
  ],
  links: [['solar', 'clean'], ['clean', 'buoy'], ['buoy', 'carrier'], ['carrier', 'scout'], ['buoy', 'scout']],
  pulses: [['buoy', 'scout'], ['clean', 'buoy'], ['carrier', 'scout']],
  threadTop: 'mesh',
  threadBottom: 'acoustic',
};
