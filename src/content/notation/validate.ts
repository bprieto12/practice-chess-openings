import { Chess } from "chess.js";
import type { NotationLesson, PositionSpec } from "./types";

export function positionFrom(spec: PositionSpec): Chess {
  const c = spec.fen ? new Chess(spec.fen) : new Chess();
  for (const m of spec.setup ?? []) c.move(m);
  return c;
}

/** Returns a list of error strings (empty if all lessons are valid). */
export function validateLessons(lessons: NotationLesson[]): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const l of lessons) {
    if (ids.has(l.id)) errors.push(`notation: duplicate lesson id ${l.id}`);
    ids.add(l.id);
    const where = (i: number) => `notation/${l.id} exercise ${i + 1}`;
    l.screens.forEach((s, i) => {
      if (s.fen || s.setup) {
        try {
          positionFrom(s);
        } catch (e) {
          errors.push(`notation/${l.id} screen ${i + 1}: ${(e as Error).message}`);
        }
      }
    });
    l.exercises.forEach((ex, i) => {
      try {
        if (ex.type === "play-move" || ex.type === "write-move") {
          const c = positionFrom(ex);
          const m = c.move(ex.san);
          if (m.san !== ex.san) errors.push(`${where(i)}: "${ex.san}" should be written "${m.san}"`);
          if (ex.type === "write-move") {
            for (const d of ex.distractors ?? []) if (d === ex.san) errors.push(`${where(i)}: distractor equals answer`);
          }
        } else if (ex.type === "follow-game") {
          const c = new Chess();
          for (const san of ex.moves) {
            const m = c.move(san);
            if (m.san !== san) errors.push(`${where(i)}: "${san}" should be written "${m.san}"`);
          }
        } else if (ex.type === "choice") {
          if (!ex.options.includes(ex.answer)) errors.push(`${where(i)}: answer not among options`);
        }
      } catch (e) {
        errors.push(`${where(i)}: ${(e as Error).message}`);
      }
    });
  }
  return errors;
}
