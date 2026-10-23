import { Chess } from "chess.js";
import { describe, expect, it } from "vitest";
import { makeDistractors } from "./distractors";

function check(setup: string[], san: string) {
  const c = new Chess();
  for (const m of setup) c.move(m);
  const move = c.move(san);
  const d = makeDistractors(san, move, () => 0.3);
  expect(d).toHaveLength(3);
  expect(new Set(d).size).toBe(3);
  expect(d).not.toContain(san);
  return d;
}

describe("makeDistractors", () => {
  it("works for many kinds of moves", () => {
    check([], "e4");
    check(["e4", "e5"], "Nf3");
    check(["e4", "d5"], "exd5");
    check(["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"], "O-O");
    check(["d4", "d5", "Nf3", "Nf6"], "Nbd2");
    check(["f3", "e5", "g4"], "Qh4#");
  });
});
