import { describe, expect, it } from "vitest";
import { italianGame } from "../content/openings/italian-game";
import { sicilianDefense } from "../content/openings/sicilian-defense";
import { buildTree, getNode } from "./tree";
import {
  chooseChild,
  practiceAccuracy,
  practiceOpponentMove,
  practiceUserMove,
  reviewUserMove,
  startPractice,
  startReviewCard,
} from "./trainer";

const tree = buildTree(italianGame);
const main = italianGame.lines[0];

describe("practice drill", () => {
  it("plays a whole line as White with no mistakes", () => {
    let s = startPractice(tree, [main.id], "w");
    expect(s.phase).toBe("user");
    for (const m of main.moves) {
      if (s.phase === "user") s = practiceUserMove(tree, s, m.san);
      else s = practiceOpponentMove(tree, s);
    }
    expect(s.phase).toBe("done");
    expect(practiceAccuracy(s)).toBe(1);
    expect(s.results.length).toBe(Math.ceil(main.moves.length / 2));
  });

  it("starts with the opponent's move when playing Black", () => {
    const s = startPractice(tree, [main.id], "b");
    expect(s.phase).toBe("opponent");
    const next = practiceOpponentMove(tree, s);
    expect(getNode(tree, next.nodeId).san).toBe("e4");
    expect(next.phase).toBe("user");
  });

  it("gives a hint, then the answer, and records a fail", () => {
    let s = startPractice(tree, [main.id], "w");
    s = practiceUserMove(tree, s, "d4");
    expect(s.misses).toBe(1);
    expect(s.hintSquare).toBe("e2");
    expect(s.answer).toBeUndefined();
    expect(s.feedback?.tone).toBe("bad");
    s = practiceUserMove(tree, s, "c4");
    expect(s.answer).toEqual({ from: "e2", to: "e4" });
    expect(s.missCount).toBe(2);
    s = practiceUserMove(tree, s, "e4");
    expect(s.results[0].passed).toBe(false);
    expect(s.phase).toBe("opponent");
  });

  it("doesn't count a book move from another line as a miss", () => {
    let s = startPractice(tree, ["giuoco-pianissimo"], "w");
    for (const san of ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "c3", "Nf6"]) {
      s = s.phase === "user" ? practiceUserMove(tree, s, san) : practiceOpponentMove(tree, s);
    }
    const before = s.nodeId;
    s = practiceUserMove(tree, s, "d4");
    expect(s.nodeId).toBe(before);
    expect(s.misses).toBe(0);
    expect(s.feedback?.tone).toBe("info");
  });

  it("narrows to the branch the opponent picks in all-lines mode", () => {
    const sic = buildTree(sicilianDefense);
    let s = startPractice(sic, sicilianDefense.lines.map((l) => l.id), "b");
    s = practiceOpponentMove(sic, s); // e4
    s = practiceUserMove(sic, s, "c5");
    s = practiceOpponentMove(sic, s, (children) => children.find((c) => c.san === "c3")!);
    expect(s.lineIds).toEqual(["alapin"]);
  });

  it("chooses children by weight", () => {
    const sic = buildTree(sicilianDefense);
    const node = getNode(sic, "e4 c5");
    const children = node.childIds.map((id) => getNode(sic, id));
    const pick = chooseChild(children, (c) => (c.san === "d4" ? 1 : 0), () => 0.99);
    expect(pick.san).toBe("d4");
  });
});

describe("review card", () => {
  it("replays context and accepts any book move at the position", () => {
    const node = getNode(tree, "e4 e5 Nf3 Nc6 Bc4 Bc5 c3 Nf6");
    let s = startReviewCard(tree, node.normFen, ["giuoco-pianissimo"])!;
    expect(s.contextPath.at(-1)).toBe(node.id);
    s = { ...s, phase: "user" };
    const answered = reviewUserMove(tree, s, "d4");
    expect(answered.phase).toBe("answered");
    expect(answered.passed).toBe(true);
  });

  it("fails after a miss", () => {
    const node = getNode(tree, "e4 e5");
    let s = { ...startReviewCard(tree, node.normFen, [main.id])!, phase: "user" as const };
    s = { ...reviewUserMove(tree, s, "a3"), phase: "user" };
    const answered = reviewUserMove(tree, s, "Nf3");
    expect(answered.passed).toBe(false);
  });

  it("returns null for a position that isn't in the lines", () => {
    expect(startReviewCard(tree, "nope", [main.id])).toBeNull();
  });
});
