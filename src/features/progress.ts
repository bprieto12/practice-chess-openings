import { useEffect, useMemo, useState } from "react";
import { cardKey, dueCards, lineMastery, type Mastery } from "../lib/srs";
import { treeFor, userNodesInLine } from "../lib/tree";
import type { Color, Opening } from "../lib/types";
import { useApp } from "../store";

/** Current time, refreshed every 30 seconds so "due" counts stay fresh. */
export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function useDueCount() {
  const cards = useApp((s) => s.cards);
  const now = useNow();
  return useMemo(() => dueCards(Object.values(cards), now).length, [cards, now]);
}

export function useLineMastery(opening: Opening, lineId: string, color: Color): Mastery {
  const cards = useApp((s) => s.cards);
  return useMemo(() => masteryOf(opening, lineId, color, cards), [opening, lineId, color, cards]);
}

export function masteryOf(
  opening: Opening,
  lineId: string,
  color: Color,
  cards: ReturnType<typeof useApp.getState>["cards"],
): Mastery {
  const tree = treeFor(opening);
  const nodes = userNodesInLine(tree, lineId, color);
  return lineMastery(nodes.map((n) => cards[cardKey(opening.id, n.normFen, color)]));
}

/** Counts of mastered/learning lines across both colors. */
export function useOpeningProgress(opening: Opening) {
  const cards = useApp((s) => s.cards);
  return useMemo(() => {
    let mastered = 0;
    let learning = 0;
    for (const l of opening.lines) {
      const m = masteryOf(opening, l.id, opening.naturalSide, cards);
      if (m === "mastered") mastered++;
      else if (m === "learning") learning++;
    }
    return { mastered, learning, total: opening.lines.length };
  }, [opening, cards]);
}
