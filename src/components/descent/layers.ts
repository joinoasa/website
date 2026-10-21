// Content and scene data for the home page "Descent": space to underwater.
// Scene coordinates use a 600 x 700 viewBox. Every layer's hub sits at (300, 350)
// so the mesh "thread" lines up from layer to layer. Each layer's data lives in
// data/<id>.ts so layer packages never share a file.
import type { Layer } from './types';
import { space } from './data/space';
import { sky } from './data/sky';
import { mountains } from './data/mountains';
import { ground } from './data/ground';
import { sea } from './data/sea';
import { underwater } from './data/underwater';

export type { Layer, SceneNode, LinkKind, Domain, Motion, GlyphName } from './types';
export const layers: Layer[] = [space, sky, mountains, ground, sea, underwater];
