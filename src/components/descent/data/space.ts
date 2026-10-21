import type { Layer } from '../types';

export const space: Layer = {
  id: 'space',
  name: 'Space',
  range: '400 km to 20 km',
  gauge: '400 km',
  dark: true,
  intro: 'Balloons and small satellites will carry the network above the sky.',
  examples: [
    ['High-altitude balloons', 'carry sensors and an OASA link to the edge of space. A project chapters can take on, following FAA rules.'],
    ['CubeSats', 'small satellites that test encrypted links in orbit.'],
    ['Laser links', 'narrow beams between satellites, aircraft and ground stations that are hard to intercept.'],
    ['Space-ready autonomy', 'robots that keep working with long delays and no one at the controls.'],
  ],
  nodes: [
    { id: 'sat', x: 300, y: 350, label: 'CubeSat', icon: 'cubesat', domain: 'air', hub: true },
    { id: 'sat2', x: 485, y: 170, label: 'CubeSat', icon: 'cubesat', domain: 'air' },
    { id: 'balloon', x: 130, y: 520, label: 'High-altitude balloon', icon: 'balloon', domain: 'air', motion: 'hover' },
  ],
  links: [['sat', 'sat2', 'laser'], ['sat', 'balloon']],
  pulses: [['sat', 'sat2'], ['sat', 'balloon']],
  threadTop: 'none',
  threadBottom: 'mesh',
};
