import { describe, expect, it } from "vitest";
import { emptyProgress, exportJson, importJson, migrate } from "./storage";

describe("storage", () => {
  it("round-trips through export/import", () => {
    const data = emptyProgress();
    data.lines["a/b/w"] = { practiceRuns: 2, bestAccuracy: 0.5 };
    expect(importJson(exportJson(data))).toEqual(data);
  });

  it("fills in missing fields", () => {
    const m = migrate({ schemaVersion: 1, settings: { showCoordinates: false } });
    expect(m?.settings.showCoordinates).toBe(false);
    expect(m?.settings.boardTheme).toBe("green");
    expect(m?.cards).toEqual({});
  });

  it("rejects unknown data", () => {
    expect(migrate({ foo: 1 })).toBeNull();
    expect(() => importJson("not json")).toThrow();
    expect(() => importJson("{}")).toThrow();
  });
});
