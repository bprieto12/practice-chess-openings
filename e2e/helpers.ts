import { expect, type Page } from "@playwright/test";

/** Taps a square on the board with the given id prefix. */
export async function tap(page: Page, boardId: string, square: string) {
  await page.locator(`[aria-describedby="${boardId}-board-desc"] [data-square="${square}"]`).click();
}

/** Plays a move by tapping the from-square, then the to-square. */
export async function move(page: Page, boardId: string, from: string, to: string) {
  await tap(page, boardId, from);
  await tap(page, boardId, to);
}

export async function expectPiece(page: Page, boardId: string, square: string, piece: string) {
  await expect(page.locator(`[aria-describedby="${boardId}-board-desc"] [data-square="${square}"] [data-piece="${piece}"]`)).toBeVisible();
}
