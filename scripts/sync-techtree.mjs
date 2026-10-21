// Brings the derived cells of source/OASA-techtree.md up to date.
//   node scripts/sync-techtree.mjs           dry run: prints what would change
//   node scripts/sync-techtree.mjs --write   rewrites the file
// Only two cells in node rows change: Unlocks (derived from Requires and the moonshot lists)
// and the 🟢/🔒 status. Requires, names, sciences, 🟡/✅, other sections and the
// "(see Roots)" cross-reference row are never touched. After --write, copy the file to the
// owner's master copy so both stay byte-identical.

import { readFileSync, writeFileSync } from 'node:fs';
import { SRC, parseTechtree, deriveTree } from './build-techtree.mjs';

const write = process.argv.includes('--write');
const md = readFileSync(SRC, 'utf8');
const { errors, rows } = deriveTree(parseTechtree(md));
if (errors.length) {
  console.error(`sync: refusing to run, ${errors.length} error(s)`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

const lines = md.split('\n');
let unlockChanges = 0;
let statusChanges = 0;
const dropped = [];
for (const r of rows) {
  const changed = [];
  const rawParts = lines[r.line].split('|');
  if (r.oldUnlocks !== r.newUnlocks) {
    unlockChanges++;
    changed.push(`Unlocks: ${r.oldUnlocks}  ->  ${r.newUnlocks}`);
    rawParts[4] = ` ${r.newUnlocks} `;
    for (const id of r.oldIds) if (!r.newIds.includes(id)) dropped.push(`${r.id}->${id}`);
  }
  if (r.oldEmoji !== r.newEmoji) {
    statusChanges++;
    changed.push(`Status: ${r.oldEmoji} -> ${r.newEmoji}`);
    rawParts[6] = ` ${r.newEmoji} `;
  }
  if (changed.length) {
    console.log(`${r.id}: ${changed.join('; ')}`);
    lines[r.line] = rawParts.join('|');
  }
}
console.log(`\nsync: ${unlockChanges} Unlocks cell(s), ${statusChanges} status cell(s) ${write ? 'written' : 'would change (dry run, pass --write)'}`);
if (dropped.length) console.log(`claims with no matching Requires or moonshot key node, removed: ${dropped.join(', ')}`);
if (write && (unlockChanges || statusChanges)) writeFileSync(SRC, lines.join('\n'));
