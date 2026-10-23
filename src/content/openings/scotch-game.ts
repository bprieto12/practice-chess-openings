import type { Opening } from "../../lib/types";
import { line, openGameStem, type M } from "./helpers";

const scotchStem: M[] = [
  ...openGameStem,
  ["d4", "The Scotch: White opens the center at once instead of slowly building pressure."],
  ["exd4", "Black must take. Defending e5 here leaves Black cramped."],
  ["Nxd4", "White recaptures and has a strong knight in the center plus a free hand for development."],
];

export const scotchMieses = line(
  "mieses",
  "Mieses Variation (4...Nf6)",
  [
    ...scotchStem,
    ["Nf6", "Develops and attacks e4."],
    ["Nxc6", "White trades knights to give Black doubled c-pawns."],
    ["bxc6", "Recapturing toward the center keeps more pawns in the middle."],
    ["e5", "White pushes with tempo and kicks the f6 knight."],
    ["Qe7", "Pins the e5 pawn to White's king and forces White to defend it."],
    ["Qe2", "Defends e5 and breaks the pin. The queen blocks the f1 bishop for now."],
    ["Nd5", "The knight jumps to the center."],
    ["c4", "Attacks the knight and grabs space."],
    ["Ba6", "Black ignores the threat: the c4 pawn is pinned to White's queen, so cxd5 would lose the queen."],
    ["b3", "Defends c4 so Black can't simply win it. White will untangle with g3 and Bg2 to break the pin."],
    ["g6", "Black prepares to fianchetto the bishop on g7, where it will hit e5."],
    ["g3", "White prepares Bg2 too. Once that bishop is out, White can castle and the queen can leave e2."],
    ["Bg7", "The bishop pressures the e5 pawn."],
    ["Bb2", "White defends e5 with the bishop."],
    ["O-O", "Black castles and gets ready for ...Rae8 to hit e5 again."],
    ["Bg2", "White completes development. White's e5 pawn and space face Black's active pieces."],
  ],
  [
    "White's e5 pawn gives space, and Black aims every piece at it.",
    "...Ba6 pinning the c4 pawn to the queen is a key trick for Black.",
    "Both sides often fianchetto their kingside bishops.",
  ],
);

export const scotchGame: Opening = {
  id: "scotch-game",
  name: "Scotch Game",
  eco: ["C45"],
  naturalSide: "w",
  difficulty: "beginner",
  summary:
    "White opens the center on move 3 with d4. Play gets open and direct quickly, with less theory than the Ruy Lopez. It's a good choice if you like clear, active positions.",
  lines: [
    scotchMieses,
    line(
      "classical-bc5",
      "Classical Variation (4...Bc5)",
      [
        ...scotchStem,
        ["Bc5", "Develops with a threat: the bishop attacks the d4 knight."],
        ["Nxc6", "White trades the knight before it gets into trouble."],
        ["Qf6", "An important in-between move: it threatens mate on f2 before Black recaptures."],
        ["Qd2", "Stops the mate and prepares Nc3. The queen looks odd here but is safe."],
        ["dxc6", "Black recaptures, opening the d-file and the c8 bishop."],
        ["Nc3", "Develops toward the center."],
        ["Be6", "Develops and controls d5."],
        ["Na4", "The knight attacks the c5 bishop to win the bishop pair."],
        ["Rd8", "Gains time on White's queen along the d-file."],
        ["Bd3", "Develops and blocks the d-file."],
        ["Bd4", "The bishop sidesteps the knight and sits in the center."],
        ["O-O", "White castles."],
        ["Ne7", "Develops and gets ready to castle."],
        ["c3", "Kicks the bishop on d4."],
        ["b5", "Counterattack: Black hits the a4 knight."],
        ["cxd4", "White takes the bishop."],
        ["bxa4", "Black takes the knight. The material is even, with an unbalanced position."],
      ],
      [
        "...Bc5 and ...Qf6 put early pressure on f2. Watch for mate threats.",
        "White aims for the bishop pair. Black aims for quick development and play on the d-file.",
      ],
    ),
  ],
};
