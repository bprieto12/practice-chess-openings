import { create } from "zustand";
import { cardKey, newCard, schedule, type Card } from "./lib/srs";
import * as storage from "./lib/storage";
import type { LineProgress, NotationProgress, ProgressStore, Settings } from "./lib/storage";
import type { Color } from "./lib/types";

interface AppState extends ProgressStore {
  storageAvailable: boolean;
  updateSettings: (patch: Partial<Settings>) => void;
  setLastVisited: (route: string, label: string) => void;
  markLearned: (openingId: string, lineId: string, color: Color) => void;
  /** Records a finished practice run and creates/schedules cards for its test positions. */
  recordPractice: (args: {
    openingId: string;
    lineId: string;
    color: Color;
    accuracy: number;
    results: { normFen: string; lineIds: string[]; passed: boolean }[];
  }) => void;
  recordReview: (key: string, passed: boolean) => void;
  recordNotation: (lessonId: string, score: number, timedScore?: number) => void;
  replaceAll: (data: ProgressStore) => void;
  resetAll: () => void;
}

export const lineKey = (openingId: string, lineId: string, color: Color) => `${openingId}/${lineId}/${color}`;

const initial = typeof window === "undefined" ? { data: storage.emptyProgress(), available: false } : storage.load();

export const useApp = create<AppState>()((set) => ({
  ...initial.data,
  storageAvailable: initial.available,

  updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

  setLastVisited: (route, label) => set({ lastVisited: { route, label, at: Date.now() } }),

  markLearned: (openingId, lineId, color) =>
    set((s) => {
      const k = lineKey(openingId, lineId, color);
      const prev: LineProgress = s.lines[k] ?? { practiceRuns: 0 };
      return { lines: { ...s.lines, [k]: { ...prev, learnCompletedAt: Date.now() } } };
    }),

  recordPractice: ({ openingId, lineId, color, accuracy, results }) =>
    set((s) => {
      const now = Date.now();
      const k = lineKey(openingId, lineId, color);
      const prev: LineProgress = s.lines[k] ?? { practiceRuns: 0 };
      const cards = { ...s.cards };
      for (const r of results) {
        const ck = cardKey(openingId, r.normFen, color);
        const existing = cards[ck];
        if (!existing) {
          // A brand-new card answered correctly starts on the 1-day step; a miss comes back soon.
          cards[ck] = schedule(newCard(openingId, color, r.normFen, r.lineIds, now), r.passed, now);
        } else if (existing.due <= now || !r.passed) {
          // Only let practice move a card when it's due, so drilling a line repeatedly
          // doesn't inflate intervals. A miss always counts.
          cards[ck] = schedule({ ...existing, lineIds: union(existing.lineIds, r.lineIds) }, r.passed, now);
        }
      }
      return {
        cards,
        lines: {
          ...s.lines,
          [k]: {
            ...prev,
            practiceRuns: prev.practiceRuns + 1,
            bestAccuracy: Math.max(prev.bestAccuracy ?? 0, accuracy),
            lastPracticedAt: now,
          },
        },
      };
    }),

  recordReview: (key, passed) =>
    set((s) => {
      const c = s.cards[key];
      if (!c) return {};
      return { cards: { ...s.cards, [key]: schedule(c, passed, Date.now()) } };
    }),

  recordNotation: (lessonId, score, timedScore) =>
    set((s) => {
      const prev: NotationProgress = s.notation[lessonId] ?? { completed: false, bestScore: 0 };
      return {
        notation: {
          ...s.notation,
          [lessonId]: {
            completed: prev.completed || score >= 0.8,
            bestScore: Math.max(prev.bestScore, score),
            bestTimedScore:
              timedScore === undefined ? prev.bestTimedScore : Math.max(prev.bestTimedScore ?? 0, timedScore),
          },
        },
      };
    }),

  replaceAll: (data) => set({ ...data }),
  resetAll: () => set({ ...storage.emptyProgress() }),
}));

function union(a: string[], b: string[]) {
  return [...new Set([...a, ...b])];
}

export function snapshot(s: AppState): ProgressStore {
  return {
    schemaVersion: 1,
    settings: s.settings,
    lastVisited: s.lastVisited,
    lines: s.lines,
    cards: s.cards,
    notation: s.notation,
  };
}

// Debounced persistence.
let timer: ReturnType<typeof setTimeout> | undefined;
useApp.subscribe((s) => {
  if (!s.storageAvailable) return;
  clearTimeout(timer);
  timer = setTimeout(() => storage.save(snapshot(useApp.getState())), 300);
});
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => {
    const s = useApp.getState();
    if (s.storageAvailable) storage.save(snapshot(s));
  });
}

export function cardsList(cards: Record<string, Card>): [string, Card][] {
  return Object.entries(cards);
}
