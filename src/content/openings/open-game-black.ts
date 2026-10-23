import type { Opening } from "../../lib/types";
import { giuocoPianissimo } from "./italian-game";
import { ruyClosedChigorin } from "./ruy-lopez";
import { scotchMieses } from "./scotch-game";

export const openGameBlack: Opening = {
  id: "open-game-black",
  name: "Open Game as Black (1...e5)",
  eco: ["C45", "C50", "C84"],
  naturalSide: "b",
  difficulty: "beginner",
  summary:
    "A complete 1...e5 repertoire for Black against White's three most common third moves: the Italian (3.Bc4), the Ruy Lopez (3.Bb5) and the Scotch (3.d4). Black fights for the center with classical development.",
  lines: [
    { ...giuocoPianissimo, id: "vs-italian", name: "vs Italian (3.Bc4)" },
    { ...ruyClosedChigorin, id: "vs-ruy-lopez", name: "vs Ruy Lopez (3.Bb5)" },
    { ...scotchMieses, id: "vs-scotch", name: "vs Scotch (3.d4)" },
  ],
};
