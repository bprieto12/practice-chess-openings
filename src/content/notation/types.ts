/** A board position: either a FEN, or moves (SAN) played from the start. */
export interface PositionSpec {
  fen?: string;
  setup?: string[];
}

export interface Screen extends PositionSpec {
  title: string;
  /** Paragraphs separated by blank lines. Supports **bold** and `notation`. */
  text: string;
  highlights?: string[];
  arrows?: [string, string][];
  showBoard?: boolean;
  orientation?: "white" | "black";
}

export type Exercise =
  | { type: "find-square"; count: number }
  | { type: "name-square"; count: number }
  | { type: "piece-letter"; count: number }
  | ({ type: "play-move"; san: string; prompt?: string } & PositionSpec)
  | ({ type: "write-move"; san: string; distractors?: string[] } & PositionSpec)
  | { type: "follow-game"; title: string; moves: string[] }
  | { type: "choice"; question: string; options: string[]; answer: string; explanation?: string };

export interface NotationLesson {
  id: string;
  number: number;
  title: string;
  summary: string;
  screens: Screen[];
  exercises: Exercise[];
  /** Offer the 30-second timed square challenge on this lesson. */
  timedChallenge?: boolean;
}
