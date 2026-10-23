import { Chess } from "chess.js";
import type { Opening } from "./types";

/** Moves every line shares (the opening's defining moves). */
export function commonStem(opening: Opening): string[] {
  const [first, ...rest] = opening.lines;
  const stem: string[] = [];
  for (let i = 0; i < first.moves.length; i++) {
    const san = first.moves[i].san;
    if (rest.some((l) => l.moves[i]?.san !== san)) break;
    stem.push(san);
  }
  return stem;
}

/** The opening's defining moves: the common stem, or at least the first two plies. */
export function definingMoves(opening: Opening): string[] {
  const stem = commonStem(opening);
  return stem.length >= 2 ? stem : opening.lines[0].moves.slice(0, 2).map((m) => m.san);
}

export function fenAfter(sans: string[]): string {
  const c = new Chess();
  for (const s of sans) c.move(s);
  return c.fen();
}

export function firstMoveGroup(opening: Opening): "e4" | "d4" | "other" {
  const m = opening.lines[0].moves[0].san;
  return m === "e4" || m === "d4" ? m : "other";
}
