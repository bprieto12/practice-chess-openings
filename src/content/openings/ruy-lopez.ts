import type { Opening } from "../../lib/types";
import { line, openGameStem, type M } from "./helpers";

const ruyStem: M[] = [
  ...openGameStem,
  ["Bb5", "The Spanish bishop attacks the c6 knight, which defends e5. Pressure on e5 is the idea of the whole opening."],
];

const morphyStem: M[] = [
  ...ruyStem,
  ["a6", "The Morphy Defense: Black asks the bishop right away whether it wants to trade on c6 or retreat."],
];

export const ruyClosedChigorin = line(
  "closed-chigorin",
  "Closed Ruy Lopez: Chigorin",
  [
    ...morphyStem,
    ["Ba4", "White keeps the bishop and the pin-like pressure on c6."],
    ["Nf6", "Develops and attacks e4."],
    ["O-O", "White castles and doesn't mind e4 being attacked yet. If ...Nxe4, Re1 wins it back."],
    ["Be7", "A calm developing move that prepares to castle. This leads to the Closed Ruy Lopez."],
    ["Re1", "Defends e4 with the rook, so now White really does threaten Bxc6 and Nxe5."],
    ["b5", "Black ends the pressure on c6 by kicking the bishop for good."],
    ["Bb3", "The bishop retreats to a great diagonal, aiming at f7."],
    ["d6", "Supports e5 and opens the c8 bishop's diagonal."],
    ["c3", "Makes a retreat square on c2 for the bishop and prepares d4."],
    ["O-O", "Black's king is safe. Both sides now prepare for a long maneuvering battle."],
    ["h3", "Stops ...Bg4, which would pin the f3 knight and weaken White's grip on d4."],
    ["Na5", "The Chigorin plan: the knight hits the b3 bishop and clears the way for ...c5."],
    ["Bc2", "The bishop retreats but stays on the important b1-h7 diagonal."],
    ["c5", "Black gains queenside space and puts pressure on d4 before White plays it."],
    ["d4", "White finally takes the center."],
    ["Qc7", "Defends e5 a second time and connects Black's pieces."],
    ["Nbd2", "The knight heads for f1 and g3, the standard Ruy Lopez knight maneuver."],
    ["Nc6", "The knight comes back to the center to pressure d4."],
  ],
  [
    "White's main idea is pressure on e5. Black usually answers with ...a6, ...b5 and ...d6.",
    "White plays c3 and h3 before d4, building a stable center.",
    "Black's ...Na5 and ...c5 are the classic counterplay on the queenside.",
  ],
);

export const ruyLopez: Opening = {
  id: "ruy-lopez",
  name: "Ruy Lopez",
  eco: ["C60", "C65", "C67", "C68", "C69", "C84", "C99"],
  naturalSide: "w",
  difficulty: "intermediate",
  summary:
    "Also called the Spanish Opening, the Ruy Lopez is played at every level. White's bishop pressures the knight that defends e5, building slow, lasting pressure. Positions are rich and strategic.",
  lines: [
    ruyClosedChigorin,
    line(
      "exchange",
      "Exchange Variation",
      [
        ...morphyStem,
        ["Bxc6", "White trades the bishop for the knight to damage Black's pawns."],
        ["dxc6", "Recaptures toward the center. This opens the d-file and frees Black's light-squared bishop."],
        ["O-O", "White castles, and now threatens Nxe5, since the e5 pawn has lost its defender."],
        ["f6", "Defends e5 with a pawn. It looks odd, but it's a solid setup."],
        ["d4", "White opens the center while Black's king is still in the middle."],
        ["exd4", "Black takes."],
        ["Nxd4", "The knight recaptures in the center."],
        ["c5", "Kicks the knight and grabs space."],
        ["Nb3", "The knight retreats. Now the d-file is open between the queens."],
        ["Qxd1", "Black trades queens. Black has the two bishops, but in the endgame White's healthier pawns count."],
        ["Rxd1", "The rook recaptures on the open d-file."],
        ["Bg4", "Develops with tempo by attacking the d1 rook."],
        ["f3", "Blocks the attack and supports e4."],
        ["Be6", "The bishop drops back to a good central square, eyeing the b3 knight and c4."],
        ["Nc3", "Develops the last minor piece."],
        ["Bd6", "Develops and gets ready to castle queenside."],
        ["Be3", "Develops and eyes the c5 pawn."],
        ["b6", "Black solidifies c5. Black has the bishop pair, and White has the better pawn structure."],
      ],
      [
        "White gives up the bishop pair to give Black doubled c-pawns.",
        "White's dream is an endgame where the kingside pawn majority makes a passed pawn.",
        "Black wants active pieces and uses the two bishops to make up for the pawns.",
      ],
    ),
    line(
      "berlin",
      "Berlin Defense",
      [
        ...ruyStem,
        ["Nf6", "The Berlin Defense: Black counterattacks e4 at once instead of playing ...a6."],
        ["O-O", "White castles and offers the e4 pawn. White can win it back by force."],
        ["Nxe4", "Black takes the pawn."],
        ["d4", "Opens the center while Black's king is still on e8."],
        ["Nd6", "The knight hits the b5 bishop and defends from d6."],
        ["Bxc6", "White trades rather than retreat."],
        ["dxc6", "Recapturing toward the center keeps the d-file open for Black."],
        ["dxe5", "White wins back the pawn and kicks the knight."],
        ["Nf5", "The knight retreats to a good square, and the queens are about to come off."],
        ["Qxd8+", "White trades queens with check, and Black's king loses the right to castle."],
        ["Kxd8", "This is the famous Berlin endgame. Black's king is fine in the center with the queens off."],
        ["Nc3", "Develops, eyeing d5 and e4."],
        ["Ke8", "The king steps back to connect with the kingside rook."],
        ["h3", "A useful move: stops ...Ng4 or ...Bg4 and gives the king air."],
        ["h5", "Black stops g4, which would kick the f5 knight."],
        ["Bf4", "Develops and guards the e5 pawn."],
        ["Be7", "Develops and prepares ...Rh6 or ...Be6."],
        ["Rad1", "White takes the open d-file."],
        ["Be6", "Black develops the last minor piece and challenges along the d-file."],
      ],
      [
        "Black gets a queenless middlegame that is famously hard to crack, so it's a drawing weapon at top level.",
        "White's assets are the e5 pawn and the kingside majority. Black has the bishop pair and solidity.",
        "Black's king is safe in the center once the queens are gone.",
      ],
    ),
  ],
};
