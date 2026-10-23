export type Color = "w" | "b";

export interface LineMove {
  san: string;
  comment?: string;
  /** Override used when studying as Black, if the idea reads differently from Black's side. */
  commentForBlack?: string;
}

export interface Line {
  id: string;
  name: string;
  moves: LineMove[];
  keyIdeas: string[];
}

export interface Opening {
  id: string;
  name: string;
  eco?: string[];
  naturalSide: Color;
  difficulty: "beginner" | "intermediate";
  summary: string;
  lines: Line[];
}

export const colorName = (c: Color) => (c === "w" ? "White" : "Black");
export const otherColor = (c: Color): Color => (c === "w" ? "b" : "w");
