import type { GlyphName } from './glyphs';

export type { GlyphName };
export type LinkKind = 'mesh' | 'laser' | 'tether' | 'acoustic';
export type Domain = 'air' | 'land' | 'water';
export type Motion = 'bob' | 'hover' | 'sway';

export interface SceneNode {
  id: string; x: number; y: number; label: string; icon: GlyphName; domain: Domain;
  hub?: boolean; labelAbove?: boolean; labelDx?: number; motion?: Motion;
}

export interface Layer {
  id: string;
  name: string;
  range: string;
  gauge: string;
  dark: boolean;
  intro: string;
  examples: [string, string][];
  nodes: SceneNode[];
  links: [string, string, LinkKind?][];
  pulses?: [string, string][]; // from -> to; each must match a link in either orientation
  threadTop?: LinkKind | 'none';
  threadBottom?: LinkKind | 'none';
}
