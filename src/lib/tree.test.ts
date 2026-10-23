import { describe, expect, it } from "vitest";
import { italianGame } from "../content/openings/italian-game";
import { openings } from "../content/openings";
import type { Opening } from "./types";
import { bookMovesAtFen, buildTree, childrenIn, ContentError, getNode, userNodesInLine } from "./tree";

describe("buildTree", () => {
  it("builds every opening without errors", () => {
    for (const o of openings) expect(() => buildTree(o)).not.toThrow();
  });

  it("merges shared prefixes into one node", () => {
    const tree = buildTree(italianGame);
    const afterBc4 = getNode(tree, "e4 e5 Nf3 Nc6 Bc4");
    expect(afterBc4.lineIds.sort()).toEqual(["giuoco-piano-main", "giuoco-pianissimo", "two-knights-ng5"].sort());
    expect(afterBc4.childIds.map((id) => getNode(tree, id).san).sort()).toEqual(["Bc5", "Nf6"]);
  });

  it("throws a ContentError for an illegal move", () => {
    const bad: Opening = {
      ...italianGame,
      lines: [{ id: "x", name: "x", keyIdeas: [], moves: [{ san: "e4" }, { san: "e4" }] }],
    };
    expect(() => buildTree(bad)).toThrow(ContentError);
  });

  it("filters children by line", () => {
    const tree = buildTree(italianGame);
    const node = getNode(tree, "e4 e5 Nf3 Nc6 Bc4");
    expect(childrenIn(tree, node, ["two-knights-ng5"]).map((n) => n.san)).toEqual(["Nf6"]);
  });

  it("lists book moves at a position across lines", () => {
    const tree = buildTree(italianGame);
    const node = getNode(tree, "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6");
    expect(bookMovesAtFen(tree, node.normFen).map((n) => n.san).sort()).toEqual(["d3", "d4"]);
  });

  it("finds the test positions for a color", () => {
    const tree = buildTree(italianGame);
    const line = italianGame.lines[0];
    const white = userNodesInLine(tree, line.id, "w");
    const black = userNodesInLine(tree, line.id, "b");
    expect(white.length + black.length).toBe(line.moves.length);
    expect(white[0].ply).toBe(0);
    expect(black[0].ply).toBe(1);
  });
});
