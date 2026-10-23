import { Chess } from "chess.js";
import { normalizeFen, START_FEN } from "./fen";
import type { Color, Opening } from "./types";

export interface TreeNode {
  /** Path of SAN moves from the start, joined by spaces ("" for the root). */
  id: string;
  fen: string;
  normFen: string;
  /** Number of plies played to reach this node. */
  ply: number;
  san?: string;
  from?: string;
  to?: string;
  comment?: string;
  commentForBlack?: string;
  parentId?: string;
  childIds: string[];
  /** Lines that pass through this node. */
  lineIds: string[];
}

export interface MoveTree {
  openingId: string;
  rootId: string;
  nodes: Map<string, TreeNode>;
  /** Normalized FEN -> node ids reaching that position (transpositions share a key). */
  byFen: Map<string, string[]>;
  /** Line id -> node ids along the line, root first. */
  linePaths: Map<string, string[]>;
}

export class ContentError extends Error {}

/** Replays every line with chess.js and merges them into one tree. Throws ContentError on illegal moves. */
export function buildTree(opening: Opening): MoveTree {
  const root: TreeNode = {
    id: "",
    fen: START_FEN,
    normFen: normalizeFen(START_FEN),
    ply: 0,
    childIds: [],
    lineIds: [],
  };
  const nodes = new Map<string, TreeNode>([["", root]]);
  const byFen = new Map<string, string[]>([[root.normFen, [""]]]);
  const linePaths = new Map<string, string[]>();

  for (const line of opening.lines) {
    const chess = new Chess();
    let node = root;
    const path = [root.id];
    root.lineIds.push(line.id);
    line.moves.forEach((m, i) => {
      let move;
      try {
        move = chess.move(m.san);
      } catch {
        throw new ContentError(
          `${opening.id}/${line.id}: illegal move "${m.san}" at ply ${i + 1} (after ${path.at(-1) || "start"})`,
        );
      }
      if (move.san !== m.san) {
        throw new ContentError(
          `${opening.id}/${line.id}: move "${m.san}" at ply ${i + 1} should be written "${move.san}"`,
        );
      }
      const id = node.id ? `${node.id} ${move.san}` : move.san;
      let child = nodes.get(id);
      if (!child) {
        const fen = chess.fen();
        child = {
          id,
          fen,
          normFen: normalizeFen(fen),
          ply: i + 1,
          san: move.san,
          from: move.from,
          to: move.to,
          parentId: node.id,
          childIds: [],
          lineIds: [],
        };
        nodes.set(id, child);
        node.childIds.push(id);
        const list = byFen.get(child.normFen) ?? [];
        list.push(id);
        byFen.set(child.normFen, list);
      }
      child.comment ??= m.comment;
      child.commentForBlack ??= m.commentForBlack;
      child.lineIds.push(line.id);
      path.push(id);
      node = child;
    });
    linePaths.set(line.id, path);
  }

  return { openingId: opening.id, rootId: "", nodes, byFen, linePaths };
}

export function getNode(tree: MoveTree, id: string): TreeNode {
  const n = tree.nodes.get(id);
  if (!n) throw new Error(`Unknown node ${id}`);
  return n;
}

/** Side to move at a node. */
export function turnAt(node: TreeNode): Color {
  return node.ply % 2 === 0 ? "w" : "b";
}

export function commentFor(node: TreeNode, color: Color): string | undefined {
  return color === "b" ? (node.commentForBlack ?? node.comment) : node.comment;
}

/** Children of a node restricted to the given lines. */
export function childrenIn(tree: MoveTree, node: TreeNode, lineIds: readonly string[]): TreeNode[] {
  return node.childIds
    .map((id) => getNode(tree, id))
    .filter((c) => c.lineIds.some((l) => lineIds.includes(l)));
}

/** Book moves (SAN) at any node reaching this position, across the whole opening. */
export function bookMovesAtFen(tree: MoveTree, normFen: string): TreeNode[] {
  const out: TreeNode[] = [];
  const seen = new Set<string>();
  for (const id of tree.byFen.get(normFen) ?? []) {
    for (const cid of getNode(tree, id).childIds) {
      const c = getNode(tree, cid);
      if (!seen.has(c.san!)) {
        seen.add(c.san!);
        out.push(c);
      }
    }
  }
  return out;
}

/** Nodes along a line where the study color is to move (the positions it is tested on). */
export function userNodesInLine(tree: MoveTree, lineId: string, color: Color): TreeNode[] {
  const path = tree.linePaths.get(lineId) ?? [];
  // The last node has no move after it, so it is not a test position.
  return path
    .slice(0, -1)
    .map((id) => getNode(tree, id))
    .filter((n) => turnAt(n) === color);
}

const cache = new Map<string, MoveTree>();
export function treeFor(opening: Opening): MoveTree {
  let t = cache.get(opening.id);
  if (!t) {
    t = buildTree(opening);
    cache.set(opening.id, t);
  }
  return t;
}
