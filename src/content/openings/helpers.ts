import type { Line, LineMove } from "../../lib/types";

/** [san, comment?, commentForBlack?] */
export type M = [san: string, comment?: string, commentForBlack?: string];

export function line(id: string, name: string, moves: M[], keyIdeas: string[]): Line {
  return {
    id,
    name,
    keyIdeas,
    moves: moves.map(([san, comment, commentForBlack]): LineMove => ({ san, comment, commentForBlack })),
  };
}

// Stems shared by several openings.
export const openGameStem: M[] = [
  ["e4", "Takes space in the center and opens lines for the queen and the light-squared bishop."],
  ["e5", "Black claims an equal share of the center and frees the dark-squared bishop."],
  ["Nf3", "Develops a knight toward the center and attacks the e5 pawn right away."],
  ["Nc6", "Develops while defending e5. Knights belong on c6 and f6 early in most openings."],
];

export const queensGambitStem: M[] = [
  ["d4", "Takes the center with a pawn the queen already protects."],
  ["d5", "Black meets the center head-on and stops White from playing e4 easily."],
  ["c4", "The Queen's Gambit: White offers a wing pawn to pull Black's d5 pawn away from the center."],
];

export const qgdStem: M[] = [
  ...queensGambitStem,
  ["e6", "Declines the gambit. The e6 pawn props up d5 and opens a path for the dark-squared bishop."],
  ["Nc3", "Adds a third attacker on d5 and develops toward the center."],
  ["Nf6", "Defends d5 again and develops toward the kingside."],
];
