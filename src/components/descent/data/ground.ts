import type { Layer } from '../types';

export const ground: Layer = {
  id: 'ground',
  name: 'Ground',
  range: 'Fields, streets and below',
  gauge: '0 m',
  dark: false,
  intro: 'Farms, towns and the infrastructure under our feet.',
  examples: [
    ['Mobile hives', 'trucks and trailers that launch drones while driving or parked.'],
    ['Farm robots', 'scouting, soil sensing and feral hog alerts on the map.'],
    ['Snow robots', 'clear sidewalks and streets on their own.'],
    ['City robots', 'litter pickup and help for neighbors with limited mobility.'],
    ['Inspection crawlers', 'pipes, sewers and water mains below the street.'],
    ['Road patrol', 'potholes, pavement wear and clogged storm drains.'],
    ['Sensor nodes', 'air quality, weather and leak detection on utility poles.'],
  ],
  nodes: [
    { id: 'hive', x: 300, y: 350, label: 'Mobile hive', icon: 'hive', domain: 'land', hub: true, labelAbove: true },
    { id: 'rover', x: 110, y: 350, label: 'Farm rover', icon: 'rover', domain: 'land', labelAbove: true, labelDx: -60 },
    { id: 'snow', x: 490, y: 350, label: 'Snow robot', icon: 'snowbot', domain: 'land', labelAbove: true },
    { id: 'scout', x: 165, y: 150, label: 'Scout drone', icon: 'quad', domain: 'air', motion: 'hover' },
    { id: 'pole', x: 420, y: 170, label: 'Pole sensor', icon: 'pole', domain: 'land' },
    { id: 'crawler', x: 455, y: 585, label: 'Pipe crawler', icon: 'crawler', domain: 'land' },
  ],
  links: [['hive', 'rover'], ['hive', 'snow'], ['hive', 'scout'], ['hive', 'pole'], ['scout', 'rover'], ['hive', 'crawler', 'tether']],
  pulses: [['hive', 'scout'], ['hive', 'snow'], ['hive', 'crawler']],
  threadTop: 'mesh',
  threadBottom: 'mesh',
};
