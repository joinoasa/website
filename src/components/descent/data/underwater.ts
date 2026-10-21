import type { Layer } from '../types';

export const underwater: Layer = {
  id: 'underwater',
  name: 'Underwater',
  range: 'Below the surface',
  gauge: '−200 m',
  dark: true,
  intro: 'Where radio fails, tethers and sound carry the encrypted link.',
  examples: [
    ['Autonomous subs', 'survey riverbeds, harbors and lakes.'],
    ['Tethered ROVs', 'strong, light fiber tethers carry power and encrypted data.'],
    ['Acoustic links', 'encrypted, sound-based data where radio can’t reach.'],
    ['Reef and wetland robots', 'replant coral and remove invasive species.'],
    ['Robotic fish', 'quiet swimmers that don’t disturb wildlife.'],
    ['Underwater inspection', 'bridge supports, dams and levees below the waterline.'],
  ],
  nodes: [
    { id: 'sub', x: 300, y: 350, label: 'Autonomous sub', icon: 'sub', domain: 'water', hub: true },
    { id: 'rov', x: 125, y: 230, label: 'Tethered ROV', icon: 'rov', domain: 'water', motion: 'hover', labelAbove: false, labelDx: -40 },
    { id: 'fish', x: 480, y: 210, label: 'Robotic fish', icon: 'fish', domain: 'water', motion: 'hover' },
    { id: 'reef', x: 450, y: 545, label: 'Reef robot', icon: 'reefbot', domain: 'water', labelAbove: true, labelDx: 45 },
    { id: 'sensor', x: 150, y: 545, label: 'Seabed sensor', icon: 'seabed', domain: 'water', labelAbove: true, labelDx: -75 },
  ],
  links: [['sub', 'fish', 'acoustic'], ['sub', 'reef', 'acoustic'], ['sub', 'sensor', 'acoustic'], ['sub', 'rov', 'acoustic']],
  threadTop: 'acoustic',
  threadBottom: 'none',
};
