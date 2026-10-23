import type { Card } from "./srs";

export type BoardTheme = "green" | "brown" | "blue";
export type ThemeMode = "system" | "light" | "dark";
export type AnimationSpeed = "normal" | "fast" | "off";

export interface Settings {
  boardTheme: BoardTheme;
  showCoordinates: boolean;
  animationSpeed: AnimationSpeed;
  /** Delay before the opponent replies in drills, ms. */
  opponentDelayMs: number;
  reviewSessionSize: number;
  theme: ThemeMode;
}

export interface LineProgress {
  learnCompletedAt?: number;
  practiceRuns: number;
  bestAccuracy?: number;
  lastPracticedAt?: number;
}

export interface NotationProgress {
  completed: boolean;
  bestScore: number;
  bestTimedScore?: number;
}

export interface ProgressStore {
  schemaVersion: 1;
  settings: Settings;
  lastVisited?: { route: string; label: string; at: number };
  /** Keyed by `${openingId}/${lineId}/${color}`. */
  lines: Record<string, LineProgress>;
  /** Keyed by cardKey(). */
  cards: Record<string, Card>;
  /** Keyed by notation lesson id. */
  notation: Record<string, NotationProgress>;
}

export const STORAGE_KEY = "pco:v1";

export const defaultSettings: Settings = {
  boardTheme: "green",
  showCoordinates: true,
  animationSpeed: "normal",
  opponentDelayMs: 400,
  reviewSessionSize: 20,
  theme: "system",
};

export function emptyProgress(): ProgressStore {
  return { schemaVersion: 1, settings: { ...defaultSettings }, lines: {}, cards: {}, notation: {} };
}

/** Fills in missing fields so older or partial data loads safely. Returns null if it isn't ours. */
export function migrate(raw: unknown): ProgressStore | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Partial<ProgressStore>;
  if (r.schemaVersion !== 1) return null;
  return {
    schemaVersion: 1,
    settings: { ...defaultSettings, ...(r.settings ?? {}) },
    lastVisited: r.lastVisited,
    lines: r.lines ?? {},
    cards: r.cards ?? {},
    notation: r.notation ?? {},
  };
}

export interface LoadResult {
  data: ProgressStore;
  /** False when the browser blocks storage (e.g. some private modes); progress then lasts only this visit. */
  available: boolean;
}

export function load(): LoadResult {
  try {
    const text = window.localStorage.getItem(STORAGE_KEY);
    const data = text ? migrate(JSON.parse(text)) : null;
    // Probe that writes work too.
    window.localStorage.setItem(`${STORAGE_KEY}:probe`, "1");
    window.localStorage.removeItem(`${STORAGE_KEY}:probe`);
    return { data: data ?? emptyProgress(), available: true };
  } catch {
    return { data: emptyProgress(), available: false };
  }
}

export function save(data: ProgressStore): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function exportJson(data: ProgressStore): string {
  return JSON.stringify({ app: "practice-chess-openings", exportedAt: new Date().toISOString(), ...data }, null, 2);
}

export function importJson(text: string): ProgressStore {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("That file isn't valid JSON.");
  }
  const data = migrate(parsed);
  if (!data) throw new Error("That file isn't a Practice Chess Openings progress export.");
  return data;
}
