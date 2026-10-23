import type { Opening } from "../../lib/types";
import { caroKannDefense } from "./caro-kann-defense";
import { englishOpening } from "./english-opening";
import { frenchDefense } from "./french-defense";
import { italianGame } from "./italian-game";
import { kingsIndianDefense } from "./kings-indian-defense";
import { londonSystem } from "./london-system";
import { openGameBlack } from "./open-game-black";
import { queensGambit } from "./queens-gambit";
import { queensGambitDeclined } from "./queens-gambit-declined";
import { ruyLopez } from "./ruy-lopez";
import { scandinavianDefense } from "./scandinavian-defense";
import { scotchGame } from "./scotch-game";
import { sicilianDefense } from "./sicilian-defense";
import { slavDefense } from "./slav-defense";

export const openings: Opening[] = [
  italianGame,
  ruyLopez,
  scotchGame,
  queensGambit,
  londonSystem,
  englishOpening,
  sicilianDefense,
  frenchDefense,
  caroKannDefense,
  scandinavianDefense,
  openGameBlack,
  queensGambitDeclined,
  slavDefense,
  kingsIndianDefense,
];

export function getOpening(id: string): Opening | undefined {
  return openings.find((o) => o.id === id);
}
