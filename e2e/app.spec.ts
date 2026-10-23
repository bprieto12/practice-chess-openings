import { expect, test } from "@playwright/test";
import { expectPiece, move, tap } from "./helpers";

test("home loads and links to openings", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Practice Chess Openings" })).toBeVisible();
  await page.getByRole("link", { name: "Browse all openings" }).click();
  await expect(page.getByRole("heading", { name: "Openings", exact: true })).toBeVisible();
  await expect(page.locator(".opening-card")).toHaveCount(14);
});

test("no horizontal page scroll", async ({ page }) => {
  for (const path of ["/", "/openings", "/openings/italian-game", "/openings/italian-game/learn?color=b&line=giuoco-piano-main", "/notation/coordinates", "/settings"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});

test("learn a line as Black", async ({ page }) => {
  await page.goto("/openings/italian-game?color=b");
  await expect(page.getByText("You'll learn how to face it as Black.")).toBeVisible();
  await page.getByRole("link", { name: "Learn" }).first().click();
  // Black at the bottom: a8 is the bottom-right square's rank... just check e4 after one step.
  await page.getByRole("button", { name: "Next move" }).click();
  await expectPiece(page, "learn", "e4", "wP");
  await expect(page.locator(".explain__move")).toHaveText("1. e4");
  await page.getByRole("button", { name: "End" }).click();
  await expect(page.getByRole("heading", { name: "Key ideas" })).toBeVisible();
});

test("practice: a mistake gives a hint, then the answer", async ({ page }) => {
  await page.goto("/openings/italian-game/practice?color=w&line=giuoco-piano-main");
  await expect(page.getByText("Your move. What does White play?")).toBeVisible();
  await move(page, "practice", "d2", "d4");
  await expect(page.getByText("Hint: move the highlighted piece.")).toBeVisible();
  await expectPiece(page, "practice", "d2", "wP");
  await move(page, "practice", "c2", "c4");
  await expect(page.getByText("The move is e4. Play it to continue.")).toBeVisible();
  await expectPiece(page, "practice", "c2", "wP"); // wrong move snaps back
  await move(page, "practice", "e2", "e4");
  await expectPiece(page, "practice", "e5", "bP");
});

test("practice a full line, then review", async ({ page }) => {
  await page.clock.install();
  await page.goto("/openings/scandinavian-defense/practice?color=b&line=qd6");
  const moves: [string, string][] = [
    ["d7", "d5"], ["d8", "d5"], ["d5", "d6"], ["g8", "f6"], ["a7", "a6"], ["c8", "g4"],
    ["b8", "c6"], ["e7", "e6"], ["g4", "h5"], ["f8", "e7"], ["e8", "g8"],
  ];
  for (const [from, to] of moves) {
    await expect(page.getByText("Your move. What does Black play?")).toBeVisible();
    await move(page, "practice", from, to);
  }
  await expect(page.getByRole("heading", { name: "Line complete" })).toBeVisible();
  await expect(page.locator(".stat").first()).toHaveText("100%");

  // New cards are due in a day. Jump ahead, then review one.
  await page.clock.fastForward("25:00:00");
  await page.getByRole("link", { name: /Review/ }).first().click();
  await expect(page.locator(".stat").first()).toHaveText("11");
  await page.getByRole("button", { name: /Start review/ }).click();
  await expect(page.getByText("What does Black play here?")).toBeVisible();
});

test("notation lesson 1: find a square", async ({ page }) => {
  await page.goto("/notation/coordinates");
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Start exercises" }).click();
  const target = (await page.locator(".exercise__prompt code").textContent())!;
  await tap(page, "ex", target);
  await expect(page.getByText(`Yes, that's ${target}.`)).toBeVisible();
});

test("notation: play a written move", async ({ page }) => {
  await page.goto("/notation/writing-moves");
  for (let i = 0; i < 1; i++) await page.getByRole("button", { name: "Next" }).click();
  await page.getByRole("button", { name: "Start exercises" }).click();
  await move(page, "ex", "e2", "e4");
  await expect(page.getByText("is right.")).toBeVisible();
});

test("settings: theme switch applies", async ({ page }) => {
  await page.goto("/settings");
  await page.getByRole("button", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("navigation works when scrollTo returns a Promise (newer browsers)", async ({ page }) => {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" || m.text().includes("useEffect must not return")) problems.push(m.text());
  });
  await page.addInitScript(() => {
    const original = window.scrollTo.bind(window);
    window.scrollTo = ((...args: Parameters<typeof window.scrollTo>) => {
      original(...args);
      return Promise.resolve();
    }) as typeof window.scrollTo;
  });
  await page.goto("/");
  await page.getByRole("link", { name: "Browse all openings" }).click();
  await page.getByRole("link", { name: /Italian Game/ }).first().click();
  await page.getByRole("link", { name: "Learn" }).first().click();
  await page.getByRole("button", { name: "Next move" }).click();
  await page.goto("/notation/coordinates");
  await expect(page.getByRole("heading", { name: "The board's coordinates" })).toBeVisible();
  expect(problems).toEqual([]);
});
