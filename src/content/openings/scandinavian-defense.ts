import type { Opening } from "../../lib/types";
import { line, type M } from "./helpers";

const scandiStem: M[] = [
  ["e4", "White takes the center."],
  ["d5", "The Scandinavian: Black attacks e4 at once."],
  ["exd5", "White takes."],
  ["Qxd5", "The queen recaptures. It's out early, but White has to waste a move to chase it."],
  ["Nc3", "Develops with tempo by attacking the queen."],
];

export const scandinavianDefense: Opening = {
  id: "scandinavian-defense",
  name: "Scandinavian Defense",
  eco: ["B01"],
  naturalSide: "b",
  difficulty: "beginner",
  summary:
    "Black challenges e4 right away and recaptures with the queen. The positions are simple and easy to learn. Black aims for a solid setup with ...c6, ...Bf5 and ...e6.",
  lines: [
    line(
      "qa5",
      "Main Line (3...Qa5)",
      [
        ...scandiStem,
        ["Qa5", "The queen goes to a safe square and pins the c3 knight."],
        ["d4", "Takes the center."],
        ["Nf6", "Develops."],
        ["Nf3", "Develops."],
        ["c6", "Gives the queen a retreat square on c7 and makes Black solid."],
        ["Bc4", "Develops actively."],
        ["Bf5", "The bishop develops outside the pawn chain."],
        ["Bd2", "Unpins the knight and sets up tricks like Nd5."],
        ["e6", "Solid. Black prepares ...Bb4."],
        ["Qe2", "Prepares to castle queenside."],
        ["Bb4", "Pins the knight again."],
        ["O-O-O", "White castles queenside."],
        ["Nbd7", "Develops."],
        ["a3", "Asks the bishop to decide."],
        ["Bxc3", "Black trades."],
        ["Bxc3", "White recaptures."],
        ["Qc7", "The queen retreats. Black is solid."],
      ],
      [
        "Setup: ...Qa5, ...Nf6, ...c6, ...Bf5, ...e6. Simple and solid.",
        "Watch for tricks on the queen: Nd5, or b4 with Bd2.",
      ],
    ),
    line(
      "qd6",
      "Modern Line (3...Qd6)",
      [
        ...scandiStem,
        ["Qd6", "The queen sits on d6, where it's hard to attack."],
        ["d4", "Takes the center."],
        ["Nf6", "Develops."],
        ["Nf3", "Develops."],
        ["a6", "Stops Nb5, which would hit the queen."],
        ["g3", "Prepares Bg2."],
        ["Bg4", "Develops actively."],
        ["Bg2", "The bishop takes the long diagonal."],
        ["Nc6", "Develops and hits d4."],
        ["O-O", "White castles."],
        ["e6", "Solid."],
        ["h3", "Asks the bishop."],
        ["Bh5", "Keeps the pin."],
        ["Be3", "Develops."],
        ["Be7", "Develops and prepares to castle."],
        ["a3", "Keeps the bishop out of b4."],
        ["O-O", "Black castles."],
        ["Re1", "White prepares d5 or Ne5."],
      ],
      [
        "On d6 the queen is hard to attack and controls e5.",
        "...a6 is important: it stops Nb5.",
      ],
    ),
  ],
};
