/**
 * Build-time content check: every line must be legal, IDs unique, comments short,
 * and lines 8-12 full moves deep. Run with `npm run validate`.
 */
import { openings } from "../src/content/openings/index";
import { buildTree, getNode, turnAt } from "../src/lib/tree";
import { notationLessons } from "../src/content/notation/index";
import { validateLessons } from "../src/content/notation/validate";

const errors: string[] = [];
const warnings: string[] = [];

const openingIds = new Set<string>();
for (const o of openings) {
  if (openingIds.has(o.id)) errors.push(`Duplicate opening id ${o.id}`);
  openingIds.add(o.id);

  const lineIds = new Set<string>();
  for (const l of o.lines) {
    if (lineIds.has(l.id)) errors.push(`${o.id}: duplicate line id ${l.id}`);
    lineIds.add(l.id);
    const plies = l.moves.length;
    if (plies < 16 || plies > 24) errors.push(`${o.id}/${l.id}: ${plies} plies (want 16-24, i.e. 8-12 moves)`);
    l.moves.forEach((m, i) => {
      if (!m.comment) errors.push(`${o.id}/${l.id}: ply ${i + 1} (${m.san}) has no comment`);
      for (const c of [m.comment, m.commentForBlack]) {
        if (c && c.length > 280) errors.push(`${o.id}/${l.id}: comment on ${m.san} is ${c.length} chars (max 280)`);
      }
    });
    if (l.keyIdeas.length === 0) errors.push(`${o.id}/${l.id}: no key ideas`);
  }

  try {
    const tree = buildTree(o);
    // Warn when lines disagree on the natural side's move in the same position.
    for (const [fen, ids] of tree.byFen) {
      const node = getNode(tree, ids[0]);
      if (turnAt(node) !== o.naturalSide) continue;
      const moves = new Set(ids.flatMap((id) => getNode(tree, id).childIds.map((c) => getNode(tree, c).san)));
      if (moves.size > 1) warnings.push(`${o.id}: lines branch on ${o.naturalSide === "w" ? "White" : "Black"}'s move (${[...moves].join(" / ")}) at ${fen}`);
    }
  } catch (e) {
    errors.push((e as Error).message);
  }
}

errors.push(...validateLessons(notationLessons));

for (const w of warnings) console.warn(`warn: ${w}`);
if (errors.length) {
  for (const e of errors) console.error(`error: ${e}`);
  console.error(`\n${errors.length} content error(s).`);
  process.exit(1);
}
const lines = openings.reduce((n, o) => n + o.lines.length, 0);
console.log(`Content OK: ${openings.length} openings, ${lines} lines, ${notationLessons.length} notation lessons.`);
