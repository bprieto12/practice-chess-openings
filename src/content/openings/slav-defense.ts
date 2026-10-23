import type { Opening } from "../../lib/types";
import { line, queensGambitStem, type M } from "./helpers";

const slavStem: M[] = [
  ...queensGambitStem,
  ["c6", "The Slav: Black supports d5 with the c-pawn, so the c8 bishop is not blocked by ...e6."],
];

export const slavDefense: Opening = {
  id: "slav-defense",
  name: "Slav Defense",
  eco: ["D10", "D13", "D18"],
  naturalSide: "b",
  difficulty: "intermediate",
  summary:
    "A solid defense to the Queen's Gambit. Black supports d5 with ...c6 and develops the light-squared bishop actively, before playing ...e6.",
  lines: [
    line(
      "main",
      "Main Line (5...Bf5)",
      [
        ...slavStem,
        ["Nf3", "Develops."],
        ["Nf6", "Develops."],
        ["Nc3", "Develops."],
        ["dxc4", "Now Black takes the pawn, threatening to hold it with ...b5."],
        ["a4", "Stops ...b5, so Black can't keep the pawn."],
        ["Bf5", "The bishop develops before ...e6."],
        ["e3", "Opens the bishop to win back c4."],
        ["e6", "Now Black closes the center, with the bishop already out."],
        ["Bxc4", "White wins back the pawn."],
        ["Bb4", "Pins the c3 knight."],
        ["O-O", "White castles."],
        ["Nbd7", "Develops."],
        ["Qe2", "Prepares e4."],
        ["Bg6", "The bishop steps back out of the way of e4."],
        ["e4", "White builds the center."],
        ["O-O", "Black castles."],
        ["Bd3", "Supports e4."],
        ["Bh5", "Pins the f3 knight."],
        ["e5", "White gains space."],
        ["Nd5", "The knight takes the strong d5 square."],
      ],
      [
        "Get the bishop out to f5 before ...e6.",
        "...Bb4 and ...Nd5 give Black active pieces.",
      ],
    ),
    line(
      "exchange",
      "Exchange Slav",
      [
        ...slavStem,
        ["cxd5", "The Exchange Slav. The position is symmetrical and quiet."],
        ["cxd5", "Black recaptures."],
        ["Nc3", "Develops."],
        ["Nf6", "Develops."],
        ["Bf4", "Develops actively."],
        ["Nc6", "Develops."],
        ["e3", "Supports d4."],
        ["Bf5", "Develops."],
        ["Nf3", "Develops."],
        ["e6", "Solid."],
        ["Bb5", "Pins the c6 knight."],
        ["Nd7", "Prepares ...Rc8 and covers e5."],
        ["O-O", "White castles."],
        ["Be7", "Develops."],
        ["Rc1", "The rook takes the open c-file."],
        ["O-O", "Black castles."],
        ["Bxc6", "White trades."],
        ["bxc6", "Black recaptures and gets a half-open b-file."],
        ["Na4", "The knight heads for c5."],
      ],
      [
        "Symmetrical and quiet. Develop and fight for the c-file.",
        "Black is solid. White's edge is small.",
      ],
    ),
  ],
};
