import type { Color } from "./types";

export interface Card {
  openingId: string;
  color: Color;
  normFen: string;
  /** Lines that pass through this position; used to replay context. */
  lineIds: string[];
  ease: number;
  intervalDays: number;
  reps: number;
  lapses: number;
  /** Epoch ms when the card is next due. */
  due: number;
  lastReviewedAt?: number;
}

export const DAY = 24 * 60 * 60 * 1000;
export const MINUTE = 60 * 1000;
export const RELEARN_MS = 10 * MINUTE;
export const MASTERED_DAYS = 21;
export const LEARNING_DAYS = 7;

/**
 * Cards are per opening: the same position can have a different book move in two
 * openings (after 1.e4 e5 2.Nf3 Nc6, the Italian plays Bc4 and the Ruy Lopez Bb5).
 * Within one opening, transpositions share a card.
 */
export const cardKey = (openingId: string, normFen: string, color: Color) =>
  `${openingId}|${normFen}|${color}`;

export function newCard(
  openingId: string,
  color: Color,
  normFen: string,
  lineIds: string[],
  now: number,
): Card {
  return { openingId, color, normFen, lineIds, ease: 2.5, intervalDays: 0, reps: 0, lapses: 0, due: now };
}

/**
 * Simplified SM-2. A pass grows the interval (1d, 3d, then interval × ease);
 * a fail resets it and brings the card back in 10 minutes.
 * `random` is injectable for deterministic tests.
 */
export function schedule(card: Card, passed: boolean, now: number, random: () => number = Math.random): Card {
  if (!passed) {
    return {
      ...card,
      reps: 0,
      intervalDays: 0,
      ease: Math.max(1.3, round2(card.ease - 0.2)),
      lapses: card.lapses + 1,
      due: now + RELEARN_MS,
      lastReviewedAt: now,
    };
  }
  const reps = card.reps + 1;
  let interval: number;
  if (reps === 1) interval = 1;
  else if (reps === 2) interval = 3;
  else interval = Math.round(Math.max(card.intervalDays, 1) * card.ease);
  if (interval > 3) {
    const jitter = 1 + (random() * 0.2 - 0.1);
    interval = Math.max(4, Math.round(interval * jitter));
  }
  return {
    ...card,
    reps,
    intervalDays: interval,
    ease: Math.min(3.0, round2(card.ease + 0.05)),
    due: now + interval * DAY,
    lastReviewedAt: now,
  };
}

export function dueCards(cards: Iterable<Card>, now: number): Card[] {
  return [...cards].filter((c) => c.due <= now).sort((a, b) => a.due - b.due);
}

export type Mastery = "new" | "learning" | "mastered";

/** Mastery of a line from its test-position cards. Undefined cards mean it hasn't been practiced. */
export function lineMastery(cards: (Card | undefined)[]): Mastery {
  if (cards.length === 0 || cards.every((c) => !c)) return "new";
  if (cards.every((c) => c && c.intervalDays >= MASTERED_DAYS)) return "mastered";
  return "learning";
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
