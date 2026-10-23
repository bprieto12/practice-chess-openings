export const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

/** First four FEN fields (placement, side to move, castling, en passant), so transpositions match. */
export function normalizeFen(fen: string): string {
  return fen.split(" ").slice(0, 4).join(" ");
}

export function sideToMove(fen: string): "w" | "b" {
  return fen.split(" ")[1] === "b" ? "b" : "w";
}

/** Move-number prefix for a ply index (0-based): ply 0 -> "1.", ply 1 -> "1...". */
export function moveNumberLabel(ply: number): string {
  const n = Math.floor(ply / 2) + 1;
  return ply % 2 === 0 ? `${n}.` : `${n}...`;
}

/** Formats SAN moves with move numbers: ["e4","e5","Nf3"] -> "1. e4 e5 2. Nf3". */
export function formatMoves(sans: string[], startPly = 0): string {
  return sans
    .map((san, i) => {
      const ply = startPly + i;
      if (ply % 2 === 0) return `${ply / 2 + 1}. ${san}`;
      return i === 0 ? `${moveNumberLabel(ply)} ${san}` : san;
    })
    .join(" ");
}
