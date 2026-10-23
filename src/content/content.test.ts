import { describe, expect, it } from "vitest";
import { notationLessons } from "./notation";
import { validateLessons } from "./notation/validate";

describe("notation content", () => {
  it("is valid", () => {
    expect(validateLessons(notationLessons)).toEqual([]);
  });
});
