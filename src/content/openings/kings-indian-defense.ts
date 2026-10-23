import type { Opening } from "../../lib/types";
import { line, type M } from "./helpers";

const kidStem: M[] = [
  ["d4", "White takes the center."],
  ["Nf6", "Develops and stops e4 for now."],
  ["c4", "Grabs more space."],
  ["g6", "Black prepares the fianchetto. This is the King's Indian."],
];

const kidNc3Stem: M[] = [
  ...kidStem,
  ["Nc3", "Develops and supports e4."],
  ["Bg7", "The bishop takes the long diagonal."],
  ["e4", "White builds a big pawn center."],
  ["d6", "Black lets White have the center and plans to hit it later with ...e5."],
];

export const kingsIndianDefense: Opening = {
  id: "kings-indian-defense",
  name: "King's Indian Defense",
  eco: ["E97", "E81", "E69"],
  naturalSide: "b",
  difficulty: "intermediate",
  summary:
    "A fighting defense. Black lets White build a big center, then hits it with ...e5. Often White attacks on the queenside while Black storms the kingside.",
  lines: [
    line(
      "classical",
      "Classical (Mar del Plata)",
      [
        ...kidNc3Stem,
        ["Nf3", "Develops."],
        ["O-O", "Black castles."],
        ["Be2", "Develops."],
        ["e5", "Black's key break: hits d4."],
        ["O-O", "White castles."],
        ["Nc6", "Adds pressure on d4."],
        ["d5", "White closes the center and gains queenside space."],
        ["Ne7", "The knight retreats and gets ready to support ...f5."],
        ["Ne1", "The knight heads for d3 to support c5."],
        ["Nd7", "Clears the way for ...f5."],
        ["f3", "Defends e4."],
        ["f5", "Black's kingside attack begins."],
        ["Be3", "Develops."],
        ["f4", "Gains space and kicks the bishop."],
        ["Bf2", "The bishop retreats."],
        ["g5", "The pawn storm continues. White attacks on the queenside, Black on the kingside."],
      ],
      [
        "Black hits the center with ...e5. When White plays d5, Black plays ...f5.",
        "A race: White attacks on the queenside, Black on the kingside.",
      ],
    ),
    line(
      "samisch",
      "Sämisch (5.f3)",
      [
        ...kidNc3Stem,
        ["f3", "The Sämisch: White makes the center rock-solid."],
        ["O-O", "Black castles."],
        ["Be3", "Develops."],
        ["e5", "Black hits the center."],
        ["d5", "White closes the center."],
        ["c6", "Black challenges the center from the queenside."],
        ["Qd2", "Develops."],
        ["cxd5", "Black opens the c-file."],
        ["cxd5", "White recaptures."],
        ["a6", "Prepares ...b5."],
        ["Bd3", "Develops."],
        ["Nbd7", "Develops."],
        ["Nge2", "Develops."],
        ["Nh5", "Prepares ...f5."],
        ["O-O", "White castles."],
        ["f5", "Black's kingside play begins."],
      ],
      [
        "Hit the center with ...e5. When White closes it, open the c-file with ...c6.",
        "...Nh5 and ...f5 start Black's kingside play.",
      ],
    ),
    line(
      "fianchetto",
      "Fianchetto (g3)",
      [
        ...kidStem,
        ["Nf3", "Develops."],
        ["Bg7", "The bishop takes the long diagonal."],
        ["g3", "The Fianchetto: White's bishop on g2 fights for the long diagonal."],
        ["O-O", "Black castles."],
        ["Bg2", "The bishop takes the long diagonal."],
        ["d6", "Prepares ...e5."],
        ["O-O", "White castles."],
        ["Nbd7", "Develops and supports ...e5."],
        ["Nc3", "Develops."],
        ["e5", "Black hits the center."],
        ["e4", "White builds the center."],
        ["c6", "Black controls d5."],
        ["h3", "Takes g4 away from Black's knight and bishop."],
        ["Qb6", "The queen eyes d4 and b2."],
        ["Re1", "Defends e4."],
        ["exd4", "Black opens the long diagonal."],
        ["Nxd4", "White recaptures."],
        ["Re8", "Black's rook attacks e4."],
      ],
      [
        "The fight is over the long diagonal.",
        "Black's plan: ...e5, ...c6, then pressure on e4.",
      ],
    ),
  ],
};
