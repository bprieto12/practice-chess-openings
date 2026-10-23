import { bookMovesAtFen, childrenIn, getNode, turnAt, type MoveTree, type TreeNode } from "./tree";
import type { Color } from "./types";

export type Tone = "good" | "bad" | "info";

export interface Feedback {
  tone: Tone;
  text: string;
}

export type Judgement =
  | { result: "correct"; node: TreeNode }
  /** A book move from a line outside the current drill: not counted as a miss. */
  | { result: "other-line"; node: TreeNode }
  | { result: "miss"; misses: number; reveal: "hint" | "answer" };

/**
 * Judges a user move against the accepted moves at a position.
 * 1st miss -> hint (highlight the piece), 2nd and later -> show the answer.
 */
export function judgeMove(
  accepted: TreeNode[],
  otherBook: TreeNode[],
  playedSan: string,
  misses: number,
): Judgement {
  const hit = accepted.find((n) => n.san === playedSan);
  if (hit) return { result: "correct", node: hit };
  const other = otherBook.find((n) => n.san === playedSan);
  if (other) return { result: "other-line", node: other };
  const m = misses + 1;
  return { result: "miss", misses: m, reveal: m === 1 ? "hint" : "answer" };
}

export interface TestResult {
  nodeId: string;
  normFen: string;
  lineIds: string[];
  passed: boolean;
}

/** Shared state for any "find the right move" session. */
export interface DrillCore {
  nodeId: string;
  misses: number;
  hintSquare?: string;
  answer?: { from: string; to: string };
  feedback?: Feedback;
  /** Increments on each miss so the UI can replay a shake animation. */
  missCount: number;
  /** The last move the user got right, for a brief green flash. */
  correctSquare?: string;
}

// ---------------------------------------------------------------------------
// Practice drill
// ---------------------------------------------------------------------------

export type PracticePhase = "user" | "opponent" | "done";

export interface PracticeState extends DrillCore {
  lineIds: string[];
  color: Color;
  /** Node ids from the root to the current node. */
  path: string[];
  phase: PracticePhase;
  results: TestResult[];
}

function phaseAt(tree: MoveTree, node: TreeNode, lineIds: string[], color: Color): PracticePhase {
  if (childrenIn(tree, node, lineIds).length === 0) return "done";
  return turnAt(node) === color ? "user" : "opponent";
}

export function startPractice(tree: MoveTree, lineIds: string[], color: Color): PracticeState {
  const root = getNode(tree, tree.rootId);
  return {
    lineIds,
    color,
    nodeId: root.id,
    path: [root.id],
    phase: phaseAt(tree, root, lineIds, color),
    misses: 0,
    missCount: 0,
    results: [],
  };
}

function advance(tree: MoveTree, s: PracticeState, next: TreeNode): PracticeState {
  // Narrow the active lines to those consistent with the moves played so far.
  const lineIds = s.lineIds.filter((l) => next.lineIds.includes(l));
  return {
    ...s,
    lineIds,
    nodeId: next.id,
    path: [...s.path, next.id],
    phase: phaseAt(tree, next, lineIds, s.color),
    misses: 0,
    hintSquare: undefined,
    answer: undefined,
  };
}

export function practiceUserMove(tree: MoveTree, s: PracticeState, san: string): PracticeState {
  if (s.phase !== "user") return s;
  const node = getNode(tree, s.nodeId);
  const accepted = childrenIn(tree, node, s.lineIds);
  const otherBook = node.childIds.map((id) => getNode(tree, id)).filter((c) => !accepted.includes(c));
  const j = judgeMove(accepted, otherBook, san, s.misses);

  if (j.result === "correct") {
    const passed = s.misses === 0;
    const result: TestResult = { nodeId: node.id, normFen: node.normFen, lineIds: node.lineIds, passed };
    const next = advance(tree, s, j.node);
    return {
      ...next,
      results: [...s.results, result],
      correctSquare: j.node.to,
      feedback: passed ? { tone: "good", text: `${j.node.san} is right.` } : { tone: "info", text: `${j.node.san}. Got it.` },
    };
  }
  if (j.result === "other-line") {
    return {
      ...s,
      correctSquare: undefined,
      feedback: {
        tone: "info",
        text: `${san} is a book move, but it belongs to a different line. Play the move from this line.`,
      },
    };
  }
  const target = accepted[0];
  return {
    ...s,
    misses: j.misses,
    missCount: s.missCount + 1,
    correctSquare: undefined,
    hintSquare: target.from,
    answer: j.reveal === "answer" ? { from: target.from!, to: target.to! } : undefined,
    feedback:
      j.reveal === "hint"
        ? { tone: "bad", text: "Not the move in this line. Hint: move the highlighted piece." }
        : { tone: "bad", text: `The move is ${target.san}. Play it to continue.` },
  };
}

/** Weighted random choice among children; `weight` lets the UI favor weaker or less-seen lines. */
export function chooseChild(
  children: TreeNode[],
  weight: (n: TreeNode) => number,
  random: () => number = Math.random,
): TreeNode {
  const ws = children.map((c) => Math.max(0.0001, weight(c)));
  let r = random() * ws.reduce((a, b) => a + b, 0);
  for (let i = 0; i < children.length; i++) {
    r -= ws[i];
    if (r <= 0) return children[i];
  }
  return children[children.length - 1];
}

export function practiceOpponentMove(
  tree: MoveTree,
  s: PracticeState,
  pick: (children: TreeNode[]) => TreeNode = (c) => c[0],
): PracticeState {
  if (s.phase !== "opponent") return s;
  const children = childrenIn(tree, getNode(tree, s.nodeId), s.lineIds);
  return { ...advance(tree, s, pick(children)), correctSquare: undefined };
}

export function practiceAccuracy(s: PracticeState): number {
  if (s.results.length === 0) return 1;
  return s.results.filter((r) => r.passed).length / s.results.length;
}

// ---------------------------------------------------------------------------
// Review (one card at a time)
// ---------------------------------------------------------------------------

export interface ReviewCardState extends DrillCore {
  /** Moves from the root to the card's position, replayed for context. */
  contextPath: string[];
  phase: "replaying" | "user" | "answered";
  passed?: boolean;
  /** Node reached by the user's correct move. */
  answeredNodeId?: string;
}

/** Finds a path to the card's position through one of its lines. */
export function reviewContext(tree: MoveTree, normFen: string, lineIds: string[]): string[] | null {
  for (const lid of lineIds) {
    const path = tree.linePaths.get(lid);
    if (!path) continue;
    const i = path.findIndex((id) => getNode(tree, id).normFen === normFen);
    if (i >= 0) return path.slice(0, i + 1);
  }
  return null;
}

export function startReviewCard(tree: MoveTree, normFen: string, lineIds: string[]): ReviewCardState | null {
  const contextPath = reviewContext(tree, normFen, lineIds);
  if (!contextPath) return null;
  return { contextPath, nodeId: contextPath[contextPath.length - 1], phase: "replaying", misses: 0, missCount: 0 };
}

export function reviewUserMove(tree: MoveTree, s: ReviewCardState, san: string): ReviewCardState {
  if (s.phase !== "user") return s;
  const node = getNode(tree, s.nodeId);
  const accepted = bookMovesAtFen(tree, node.normFen);
  const j = judgeMove(accepted, [], san, s.misses);
  if (j.result === "correct" || j.result === "other-line") {
    const passed = s.misses === 0;
    return {
      ...s,
      phase: "answered",
      passed,
      answeredNodeId: j.node.id,
      correctSquare: j.node.to,
      hintSquare: undefined,
      answer: undefined,
      feedback: passed ? { tone: "good", text: `${j.node.san} is right.` } : { tone: "info", text: `${j.node.san}. Got it.` },
    };
  }
  const target = accepted[0];
  return {
    ...s,
    misses: j.misses,
    missCount: s.missCount + 1,
    hintSquare: target.from,
    answer: j.reveal === "answer" ? { from: target.from!, to: target.to! } : undefined,
    feedback:
      j.reveal === "hint"
        ? { tone: "bad", text: "Not quite. Hint: move the highlighted piece." }
        : { tone: "bad", text: `The move is ${target.san}. Play it to continue.` },
  };
}
