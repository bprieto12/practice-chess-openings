import type { Opening } from "../../lib/types";
import { line, openGameStem, type M } from "./helpers";

const italianStem: M[] = [
  ...openGameStem,
  ["Bc4", "The Italian bishop aims at f7, the weakest square in Black's camp because only the king defends it."],
];

const giuocoStem: M[] = [
  ...italianStem,
  ["Bc5", "The Giuoco Piano (\"quiet game\"). Black mirrors White and points the bishop at f2."],
  ["c3", "Prepares d4 to build a big pawn center. It also gives the queen a path to b3 later."],
  ["Nf6", "Develops and hits e4, so White has to think about defending that pawn."],
];

export const giuocoPianissimo = line(
  "giuoco-pianissimo",
  "Giuoco Pianissimo (slow d3)",
  [
    ...giuocoStem,
    ["d3", "The slow, modern approach: White calmly defends e4 and keeps d4 in reserve for later."],
    ["d6", "Black also supports the center and opens the c8 bishop's diagonal."],
    ["O-O", "King safety first. The rook on f1 can now join the game."],
    ["O-O", "Black castles too. Both kings are safe, and the middlegame maneuvering begins."],
    ["a4", "Grabs space on the queenside and stops ...b5, which would chase the c4 bishop."],
    ["a6", "Makes a retreat square for the c5 bishop so a4-a5 or b4 won't trap it."],
    ["Re1", "Puts the rook behind the e4 pawn and prepares to reroute the b1 knight via d2 and f1."],
    ["Ba7", "Tucks the bishop away on the long diagonal, where it still eyes f2 but is safe from attack."],
    ["h3", "Takes g4 away from Black's bishop and knight so neither can pin or harass the f3 knight."],
    ["h6", "The same idea for Black: no Bg5 pin on the f6 knight."],
    ["Nbd2", "The knight heads for f1 and then g3, a classic Italian maneuver toward the kingside."],
    ["Re8", "Black's rook supports e5 and prepares ...Be6 without worrying about the e-file."],
    ["b4", "Gains more queenside space and keeps Black's pieces cramped."],
    ["Be6", "Offers to trade White's best bishop. Trading reduces White's pressure on f7."],
    ["Bxe6", "White accepts the trade before Black can capture on c4 and damage the queenside pawns."],
    ["Rxe6", "Black recaptures with the rook, which can later swing along the sixth rank."],
  ],
  [
    "Both sides build slowly: d3/d6, castle, then improve pieces before breaking in the center.",
    "White's knight tour b1-d2-f1-g3 is the typical plan to add kingside pressure.",
    "Moves like h3, h6, a4 and a6 take away squares from the opponent's pieces before the fight starts.",
  ],
);

export const italianGame: Opening = {
  id: "italian-game",
  name: "Italian Game",
  eco: ["C50", "C53", "C54", "C55", "C58", "C59"],
  naturalSide: "w",
  difficulty: "beginner",
  summary:
    "One of the oldest openings. White develops quickly, castles early, and aims the bishop at Black's weakest square, f7. It teaches the basic principles: control the center, develop pieces, and get the king safe.",
  lines: [
    line(
      "giuoco-piano-main",
      "Giuoco Piano: Main Line (c3 & d4)",
      [
        ...giuocoStem,
        ["d4", "White strikes in the center at once, attacking the e5 pawn and the c5 bishop's diagonal."],
        ["exd4", "Black must take. Otherwise White pushes d5 or captures on e5 with a strong center."],
        ["cxd4", "White gets the ideal pawn center on d4 and e4. Now Black needs to attack it."],
        ["Bb4+", "Black's bishop has to move anyway, and it gives check so White must react."],
        ["Bd2", "Blocks the check and offers a trade of bishops."],
        ["Bxd2+", "Black trades. The pressure on White's center then comes from the pieces."],
        ["Nbxd2", "Recaptures with the b1 knight, so the f3 knight keeps guarding the center."],
        ["d5", "Black's key break: hits e4 and the c4 bishop at the same time. Without it, Black is cramped."],
        ["exd5", "White takes. Leaving the pawn on e4 to be captured would give up the center."],
        ["Nxd5", "The knight recaptures and sits on a strong central square."],
        ["Qb3", "White's queen eyes the d5 knight and the b7 pawn at the same time."],
        ["Nce7", "Defends the d5 knight a second time and prepares ...c6 to make it rock-solid."],
        ["O-O", "White castles. The isolated d4 pawn gives White active play but can become a target."],
        ["O-O", "Black castles too. Both kings are safe."],
        ["Rfe1", "The rook takes the open e-file and eyes the e7 knight."],
        ["c6", "Black cements the knight on d5. Black is solid, and White has more space and activity."],
      ],
      [
        "White builds a big center with c3 and d4. Black must hit back with ...d5 or the center rolls over Black.",
        "After the trades, White usually has an isolated d4 pawn: active pieces now, a weakness later.",
        "Black's knight on d5 is the key defensive piece. ...Nce7 and ...c6 keep it there.",
      ],
    ),
    giuocoPianissimo,
    line(
      "two-knights-ng5",
      "Two Knights Defense: 4.Ng5",
      [
        ...italianStem,
        ["Nf6", "The Two Knights Defense. Black ignores f7 for a moment and counterattacks e4."],
        ["Ng5", "White goes straight for f7 with both knight and bishop. Black must defend it now."],
        ["d5", "The only good defense: block the bishop's view of f7 with a pawn."],
        ["exd5", "White wins the pawn back and the d5 pawn still blocks Black's play."],
        ["Na5", "Black must avoid ...Nxd5 here (that allows the Fried Liver Attack). The knight hits the c4 bishop instead."],
        ["Bb5+", "The bishop moves out of attack with check."],
        ["c6", "Blocks the check and attacks d5 and b5. Black gives a pawn for fast development."],
        ["dxc6", "White grabs a pawn."],
        ["bxc6", "Black recaptures toward the center. Black is a pawn down but develops quickly."],
        ["Be2", "The bishop retreats to safety. It looks passive, but it keeps the extra pawn."],
        ["h6", "Kicks the g5 knight before it settles. Black is gaining time."],
        ["Nf3", "The knight retreats. Other squares are worse."],
        ["e4", "Black kicks the knight again. Black's space and quick development make up for the pawn."],
        ["Ne5", "The knight jumps to a central outpost, the best square it has."],
        ["Bd6", "Develops while challenging the e5 knight."],
        ["d4", "White supports the knight. Black can capture en passant."],
        ["exd3", "Black takes en passant: the e4 pawn captures on d3 as if White's pawn had moved only one square."],
        ["Nxd3", "White recaptures. White is still a pawn up, but Black's pieces are more active."],
        ["Qc7", "Connects Black's pieces and eyes the h2 pawn. Black is ready to castle and attack."],
      ],
      [
        "4.Ng5 attacks f7 at once. Black must answer ...d5, and must not recapture on d5 with the knight.",
        "Black gives a pawn for fast development and attacking chances. White must defend carefully.",
        "Know the trap: 5...Nxd5? 6.Nxf7! (the Fried Liver) is very dangerous for Black.",
      ],
    ),
  ],
};
