import { describe, expect, it } from "vitest";
import { DAY, dueCards, lineMastery, newCard, RELEARN_MS, schedule } from "./srs";

const now = 1_700_000_000_000;
const noJitter = () => 0.5;

describe("schedule", () => {
  it("steps through 1 day, 3 days, then interval × ease", () => {
    let c = newCard("o", "w", "fen", ["l"], now);
    c = schedule(c, true, now, noJitter);
    expect(c.intervalDays).toBe(1);
    expect(c.due).toBe(now + DAY);
    c = schedule(c, true, now, noJitter);
    expect(c.intervalDays).toBe(3);
    c = schedule(c, true, now, noJitter);
    expect(c.intervalDays).toBe(Math.round(3 * 2.6));
  });

  it("resets on a fail and brings the card back in 10 minutes", () => {
    let c = newCard("o", "w", "fen", ["l"], now);
    c = schedule(c, true, now, noJitter);
    c = schedule(c, true, now, noJitter);
    c = schedule(c, false, now, noJitter);
    expect(c.reps).toBe(0);
    expect(c.intervalDays).toBe(0);
    expect(c.lapses).toBe(1);
    expect(c.due).toBe(now + RELEARN_MS);
    expect(c.ease).toBeCloseTo(2.6 - 0.2);
  });

  it("keeps ease within bounds", () => {
    let c = newCard("o", "w", "fen", [], now);
    for (let i = 0; i < 20; i++) c = schedule(c, false, now);
    expect(c.ease).toBe(1.3);
    for (let i = 0; i < 40; i++) c = schedule(c, true, now, noJitter);
    expect(c.ease).toBe(3);
  });

  it("applies at most ±10% jitter to longer intervals", () => {
    let c = { ...newCard("o", "w", "fen", [], now), reps: 2, intervalDays: 10 };
    const low = schedule(c, true, now, () => 0).intervalDays;
    const high = schedule(c, true, now, () => 0.999).intervalDays;
    expect(low).toBeGreaterThanOrEqual(22);
    expect(high).toBeLessThanOrEqual(28);
    c = schedule(c, true, now, noJitter);
    expect(c.intervalDays).toBe(25);
  });
});

describe("dueCards / lineMastery", () => {
  it("returns due cards, most overdue first", () => {
    const a = { ...newCard("o", "w", "a", [], now), due: now - 10 };
    const b = { ...newCard("o", "w", "b", [], now), due: now - 100 };
    const c = { ...newCard("o", "w", "c", [], now), due: now + 100 };
    expect(dueCards([a, b, c], now).map((x) => x.normFen)).toEqual(["b", "a"]);
  });

  it("computes mastery", () => {
    const card = (intervalDays: number) => ({ ...newCard("o", "w", "x", [], now), intervalDays });
    expect(lineMastery([undefined, undefined])).toBe("new");
    expect(lineMastery([card(1), undefined])).toBe("learning");
    expect(lineMastery([card(21), card(30)])).toBe("mastered");
    expect(lineMastery([card(21), card(3)])).toBe("learning");
  });
});
