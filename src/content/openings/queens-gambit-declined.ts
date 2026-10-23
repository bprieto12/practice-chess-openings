import type { Opening } from "../../lib/types";
import { line, qgdStem } from "./helpers";
import { qgdExchange } from "./queens-gambit";

export const queensGambitDeclined: Opening = {
  id: "queens-gambit-declined",
  name: "Queen's Gambit Declined",
  eco: ["D37", "D35", "D56"],
  naturalSide: "b",
  difficulty: "beginner",
  summary:
    "Black's most classical answer to the Queen's Gambit: hold the d5 pawn with ...e6. Black gets a rock-solid position. The main challenge is developing the c8 bishop, and freeing moves like ...Ne4, ...c5 and ...dxc4 solve it.",
  lines: [
    line(
      "lasker",
      "Lasker Defense (vs 4.Bg5)",
      [
        ...qgdStem,
        ["Bg5", "Pins the f6 knight."],
        ["Be7", "Breaks the pin."],
        ["e3", "Supports d4."],
        ["O-O", "Black castles."],
        ["Nf3", "Develops."],
        ["h6", "Asks the bishop to decide."],
        ["Bh4", "Keeps the pin."],
        ["Ne4", "The Lasker Defense: Black trades pieces to free the position."],
        ["Bxe7", "White trades bishops."],
        ["Qxe7", "The queen recaptures."],
        ["cxd5", "White releases the tension."],
        ["Nxc3", "Black trades knights first."],
        ["bxc3", "White recaptures toward the center."],
        ["exd5", "Black has a solid d5 pawn and an open diagonal for the c8 bishop."],
        ["Qb3", "Attacks d5 and b7."],
        ["Rd8", "Defends d5."],
        ["c4", "White hits d5."],
        ["dxc4", "Black takes and frees the position."],
      ],
      [
        "Trade pieces with ...Ne4 to ease Black's cramped position.",
        "After the trades, Black's c8 bishop is free.",
      ],
    ),
    { ...qgdExchange, id: "exchange", name: "vs Exchange (4.cxd5)" },
    line(
      "vs-bf4",
      "vs 5.Bf4",
      [
        ...qgdStem,
        ["Nf3", "Develops."],
        ["Be7", "Develops and prepares to castle."],
        ["Bf4", "The bishop takes an active square."],
        ["O-O", "Black castles."],
        ["e3", "Supports d4."],
        ["c5", "Black strikes at the center, the most active plan."],
        ["dxc5", "White takes."],
        ["Bxc5", "The bishop recaptures with tempo."],
        ["a3", "Prepares b4."],
        ["Nc6", "Develops."],
        ["Qc2", "Develops and eyes h7."],
        ["Qa5", "Black pins the c3 knight and eyes the queenside."],
        ["Rd1", "The rook takes the d-file."],
        ["Rd8", "Black's rook takes the d-file too."],
      ],
      [
        "...c5 is the main freeing move against Bf4.",
        "Black's pieces get active with ...Qa5 and ...Rd8.",
      ],
    ),
  ],
};
