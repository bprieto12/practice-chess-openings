# Practice Chess Openings — Product & Technical Spec

**Status:** v0.3, v1 implemented (hosting pending) · **Last updated:** 2026-10-22 · **Owner:** Brenden Prieto
**URL:** https://practice-chess-openings.spixionic.com

---

## 1. Overview

A mobile-friendly web app for learning chess openings. Users pick an opening and a color, then learn its main lines on an interactive board in three ways:

1. **Guided walkthrough.** The app steps through a line move by move and explains each move.
2. **Practice drill.** The user plays their side's moves from memory and the app plays the opponent's replies.
3. **Spaced-repetition review.** Moves the user gets wrong come back more often, until they stick.

A separate **Notation module** teaches algebraic notation, so users can follow moves from books, videos and websites.

### 1.1 Goals
- A beginner-to-intermediate player can learn the first 8–12 moves of a handful of openings and remember them.
- A user with no notation knowledge can read a line like `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6` and play it on a board.
- Works well on a phone in portrait, and also on tablet and desktop.
- No sign-up, no backend, works offline after the first visit.

### 1.2 Non-goals (v1)
- Playing full games, or a chess engine/AI opponent beyond the scripted opening lines.
- User accounts, cloud sync, social features.
- A full opening database (hundreds of ECO entries). This can come later (see §12).
- Users writing or importing their own repertoires. Also later (see §12).
- Monetization.

### 1.3 Target users
- **Beginners** who know how the pieces move but not openings or notation.
- **Improving club players** who want to memorize a small repertoire for White and for Black.

---

## 2. Core concepts & terminology

| Term | Meaning |
|---|---|
| **Opening** | A named opening, e.g. "Italian Game". It has a starting move sequence and one or more lines. |
| **Line** | One specific move sequence from the starting position to the end of the lesson, e.g. "Giuoco Piano main line". 8–12 full moves (16–24 plies). |
| **Ply** | A single move by one side. "Move 3" for both sides is 2 plies. |
| **Move tree** | All of an opening's lines merged into one tree. Lines that share moves share nodes. |
| **Study color** | The side the user is learning (White or Black). It sets board orientation and which moves the user must play in drills. |
| **User node** | A position in the tree where it is the study color's turn. These are what the user is tested on. |
| **Card** | A spaced-repetition item: one user node + study color. |

---

## 3. Information architecture

```
Home
├── Openings (library)
│   └── Opening detail
│       ├── Choose color: White / Black
│       ├── Choose line (or "All lines")
│       └── Mode: Learn (walkthrough) · Practice (drill)
├── Review (spaced repetition queue)
├── Notation (module)
│   ├── Lesson list (1–8)
│   └── Lesson → exercises
└── Settings
```

**Navigation:** a bottom tab bar on mobile (Home · Openings · Review · Notation · Settings) and a top nav on screens ≥ 1024px. On phones and tablets, board screens (Learn, Practice, a running Review session, notation lessons) hide the tab bar so the board gets the room and nothing covers the controls. Each of these screens has its own way back: a back link, or "End session" in Review.

**Routes** (hash or history routing; the app is a static SPA):

| Route | Screen |
|---|---|
| `/` | Home: continue where you left off, review count due, quick links |
| `/openings` | Opening library |
| `/openings/:openingId` | Opening detail |
| `/openings/:openingId/learn?color=w&line=:lineId` | Guided walkthrough |
| `/openings/:openingId/practice?color=b&line=:lineId\|all` | Practice drill |
| `/review` | Review session |
| `/notation` | Notation lesson list |
| `/notation/:lessonId` | Notation lesson |
| `/settings` | Settings |

---

## 4. Features

### 4.1 Opening library

- A grid/list of opening cards. Each shows the name, first moves in SAN (e.g. `1. e4 e5 2. Nf3 Nc6 3. Bc4`), a small static board thumbnail, difficulty (Beginner / Intermediate), and a progress indicator.
- **Filters:** "For White" / "For Black" / All, plus first move (1. e4, 1. d4, other).
- **Search** by name.
- Each opening has a **natural side**: the side that chooses it, e.g. White for the London System, Black for the Caro-Kann. The library groups by it. Every opening can still be studied from either color.

#### v1 curated opening set (proposed: 14)

| # | Opening | Natural side | First moves | Lines (approx.) |
|---|---|---|---|---|
| 1 | Italian Game (Giuoco Piano) | White | 1. e4 e5 2. Nf3 Nc6 3. Bc4 | 3 |
| 2 | Ruy Lopez | White | 1. e4 e5 2. Nf3 Nc6 3. Bb5 | 3 |
| 3 | Scotch Game | White | 1. e4 e5 2. Nf3 Nc6 3. d4 | 2 |
| 4 | Queen's Gambit | White | 1. d4 d5 2. c4 | 3 |
| 5 | London System | White | 1. d4 … 2. Bf4 | 3 |
| 6 | English Opening | White | 1. c4 | 2 |
| 7 | Sicilian Defense | Black | 1. e4 c5 | 4 (Open, Alapin, Closed, Smith-Morra) |
| 8 | French Defense | Black | 1. e4 e6 | 3 (Advance, Exchange, Winawer/Classical) |
| 9 | Caro-Kann Defense | Black | 1. e4 c6 | 3 (Advance, Exchange, Classical) |
| 10 | Scandinavian Defense | Black | 1. e4 d5 | 2 |
| 11 | Open Game as Black (1…e5) | Black | 1. e4 e5 | 3 (vs Italian, Ruy, Scotch) |
| 12 | Queen's Gambit Declined | Black | 1. d4 d5 2. c4 e6 | 3 |
| 13 | Slav Defense | Black | 1. d4 d5 2. c4 c6 | 2 |
| 14 | King's Indian Defense | Black | 1. d4 Nf6 2. c4 g6 | 3 |

> This list is confirmed for v1. Each line goes 8–12 full moves deep (16–24 plies). Claude writes the move explanations, key ideas and summaries (see §8).

### 4.2 Opening detail

- Name, short description (2–4 sentences: the idea of the opening, typical plans, who it suits).
- **Color selector:** a segmented control `White | Black`. It defaults to the opening's natural side. Choosing the other side shows a note: "You'll learn how to face this opening."
- **Line list:** each line's name, its move sequence (collapsed past the shared stem), and a per-line mastery indicator for the selected color.
- Primary actions: **Learn** (walkthrough) and **Practice** (drill). Practice offers "This line" or "All lines (random)".

### 4.3 Board (shared component)

Used by every board-based screen.

- Renders a standard 8×8 board with pieces and **coordinates on the edges** (files a–h, ranks 1–8). Coordinates can be turned off in Settings, except inside the Notation module.
- **Orientation** follows the study color: Black at the bottom when studying Black. A manual "flip board" button is also available.
- **Input:** drag-and-drop **and** tap-to-select-then-tap-target. Tap-to-move is the main input on mobile. A selected piece highlights its legal destination squares.
- **Promotion** picker when a pawn reaches the last rank.
- **Highlights:** last move (from/to squares), check, a hint square, and arrows for showing the correct move.
- **Animation:** 150–250 ms piece movement, disabled when `prefers-reduced-motion` is set.
- **Sound (optional, off by default):** move, capture, error.
- The board is always square, sized to `min(viewport width − 32px, available height − controls, 640px)`.
- **Legality** comes from chess.js. Illegal moves snap back silently. Legal moves go to the mode controller to judge.

### 4.4 Mode: Guided walkthrough ("Learn")

The goal is for the user to see the line and understand why each move is played.

- The board starts at the initial position. A **move list** shows the line in SAN with move numbers. The current move is highlighted, and tapping any move jumps to it.
- **Controls:** `⏮ Start`, `◀ Back`, `▶ Next`, `⏭ End`. Swipe left/right on the board area also steps on mobile. On desktop, ← and → keys step.
- Each move has an **explanation panel** below the board (on mobile) or beside it (on desktop). Example: *"3. Bc4 — The bishop aims at f7, the weakest square in Black's camp, because only the king defends it."*
- Moves by the study color are visually emphasized in the move list, so the user can see "your moves".
- **Branch points:** where the opponent has multiple lines in the tree, the panel says "Black can also play 3…Nf6 (Two Knights). See line X." and links to it.
- **End of line:** a summary card with the key ideas and typical plans, plus buttons for "Practice this line" and "Next line".
- Optional **"Quiz me" toggle:** before each of the study color's moves, the app pauses with "What does White play here?" and waits for a board move before revealing it. Not scored. It bridges Learn and Practice.

### 4.5 Mode: Practice drill

The goal is to recall the study color's moves without help.

- The app plays the opponent's moves automatically, with a 400 ms delay. If the user is White, they move first.
- **On the user's turn**, they make a move on the board:
  - **Correct** (matches a book move at this node): brief green flash on the destination square, then the opponent replies.
  - **Legal but not in the line:** the move is shown, then undone with a short shake and a red flash. Message: "Not the move in this line."
    - 1st miss → **hint**: highlight the piece to move.
    - 2nd miss → **show answer**: an arrow shows the correct move, which the user must then play to continue.
  - The node is recorded as **failed** if any miss happened, otherwise **passed**. This feeds spaced repetition (§4.6).
- **Opponent branching:** if the opponent has several continuations at a node, and the user chose "All lines", the app picks one. It weights toward lines the user is weakest on or hasn't seen recently.
- **User-side alternatives:** if the tree has more than one acceptable move for the study color at a node (rare in a curated repertoire), any of them is accepted. A note says which line it leads to.
- **End of line:** a result screen with accuracy (correct first-try / total user moves), the moves missed (tap to view), and buttons for "Retry", "Next line" and "Back to opening".
- "Show explanation" can be opened after each move, but is hidden by default.

### 4.6 Spaced-repetition review

The goal is long-term retention with minimal time spent.

**Card unit:** one **user node** (a position where the study color must move) + study color, within one opening. Cards are keyed by `openingId + normalizedFen + color`, so transpositions between lines of the same opening share a card. The opening is part of the key because the same position can have a different book move in different openings: after 1.e4 e5 2.Nf3 Nc6, the Italian plays Bc4 and the Ruy Lopez plays Bb5.

**When cards are created:** the first time a user completes a Practice run of a line, every user node in that line becomes a card. Lines only seen in Learn mode don't create cards.

**Scheduling:** a simplified SM-2 algorithm, per card:

- State: `{ ease: 2.5, intervalDays: 0, reps: 0, due: timestamp, lapses: 0 }`
- **Pass** (correct first try): `reps += 1`. The interval goes 1 day → 3 days → `round(interval × ease)` after that. Ease +0.05 (max 3.0).
- **Fail** (any miss): `reps = 0`, `interval = 10 minutes` (comes back in the same session), `ease −= 0.2` (min 1.3), `lapses += 1`.
- A small amount of jitter (±10%) on intervals > 3 days spreads out reviews.

**Review session flow:**
- The Review tab shows a badge with the number of cards due.
- A session shows up to 20 due cards (setting: 10/20/50), most overdue first.
- Each card **replays the line from the start up to the card's position** quickly (about 150 ms per ply), so the user sees the context. Then it waits for the user's move. The same correct/miss/hint rules from Practice apply.
- After the answer, a short explanation is shown and the next card loads.
- Session summary: cards reviewed, accuracy, the next due time.

**Mastery indicator** (shown in the library and the line list), per line and color:
- *New*: never practiced
- *Learning*: has cards with interval < 7 days
- *Mastered*: all of the line's cards have interval ≥ 21 days

### 4.7 Notation module

The goal is for the user to read and write standard algebraic notation (SAN) and follow PGN move lists.

Eight short lessons. Each has 1–3 screens of explanation with interactive board examples, followed by exercises. Lessons unlock in order, though "skip ahead" is allowed. Each exercise set requires 80% to mark the lesson complete.

| # | Lesson | Teaches | Exercise types |
|---|---|---|---|
| 1 | **The board's coordinates** | Files a–h, ranks 1–8, square names; light square on the right (h1 / a8) | *Find the square* (tap the named square, timed and untimed), *Name the square* (a square is highlighted; pick its name from 4 options) |
| 2 | **Naming the pieces** | K, Q, R, B, N (why N, not K), pawns have no letter | Match the piece to its letter |
| 3 | **Writing a move** | `Nf3`, `e4`, `Bc4`: piece letter + destination square | *Play the move* (given SAN, make it on the board), *Write the move* (a move is animated; pick or type its SAN) |
| 4 | **Captures** | `x`: `Bxf7`, `exd5` (a pawn capture uses its file letter) | Play/Write the move |
| 5 | **Check, checkmate, castling** | `+`, `#`, `O-O`, `O-O-O` | Play/Write the move |
| 6 | **Promotion & disambiguation** | `e8=Q`; `Nbd2`, `R1e2` when two pieces can reach the same square | Play/Write the move, with positions set up so disambiguation is needed |
| 7 | **Move numbers & reading a game** | `1. e4 e5 2. Nf3`; `3...a6` for a Black move on its own; reading a move list | *Follow along*: a short game (about 10 moves) is given as text; the user plays every move for both sides |
| 8 | **Annotations & other formats** | `!`, `?`, `!!`, `??`, `!?`, `?!`; a short look at PGN files, figurine notation (♘f3), and long algebraic (`g1-f3`) so it's recognizable | Multiple-choice identification; a final *read a famous miniature* exercise (e.g. Légal's Mate or the Opera Game) |

**Exercise mechanics:**
- *Find the square*: the board shows no coordinates, to make the exercise harder (optional toggle). Streak counter. In timed mode, 30 seconds and a best score kept per lesson.
- *Write the move*: on mobile, multiple choice by default (4 options, distractors made by common mistakes: missing `x`, wrong piece letter, missing disambiguation). Optional "type it" mode with a custom on-screen keypad (K Q R B N a–h 1–8 x + # = O-O).
- Instant feedback with a 1-sentence explanation for wrong answers.

**Notation integration elsewhere:** in Learn mode, tapping an unfamiliar symbol in the move list (e.g. `x`, `+`) shows a tooltip with a link to the matching notation lesson.

### 4.8 Home

- "Continue" card: the last opening/line/mode the user was in.
- "Review: N cards due" button (hidden if none).
- If the Notation module isn't started: a prompt saying "New to chess notation? Start here."
- Quick links to the library.

### 4.9 Settings

- Board theme (3 color sets: classic green, brown, blue-gray) and piece set (1–2 open-licensed sets).
- Show coordinates (on/off).
- Sounds (on/off).
- Animation speed (normal / fast / off).
- Auto-play speed for the opponent in drills.
- Review session size.
- Theme: system / light / dark.
- **Data:** export progress (download JSON), import progress (upload JSON), reset all progress (with confirmation). This replaces accounts as the backup option.
- About / credits / licenses.

---

## 5. Mobile & responsive design

**Breakpoints:**
- **< 640px (phone, portrait):** single column. Board at full width (16px gutters). Below it, controls, then the explanation/move-list panel, which scrolls. Bottom tab bar.
- **640–1023px (large phone landscape / tablet):** in landscape, the board is on the left at full height and the panel is on the right. In portrait, the phone layout with a larger board.
- **≥ 1024px (desktop):** board at max 640px, side panel 360–420px, top or left nav.

**Mobile requirements:**
- Touch targets ≥ 44×44px. Board squares on a 320px-wide screen are about 36px, so tap-to-move uses the whole square and gives a highlight on press.
- No horizontal page scroll at any width ≥ 320px.
- While a board interaction is in progress, page scrolling is prevented (`touch-action: none` on the board), but the page scrolls normally elsewhere.
- Respect safe-area insets (iPhone notch/home bar).
- The board and main controls stay on screen without scrolling on a 375×667 viewport (iPhone SE size).
- **PWA:** web app manifest + service worker. Installable to the home screen, and fully usable offline once loaded, since all content is bundled.

---

## 6. Accessibility

- WCAG 2.1 AA color contrast for UI. Board highlight colors are distinguishable for common color-vision deficiencies, and correct/incorrect feedback uses an icon/text as well as color.
- Full keyboard play on desktop: arrow keys move a focus cursor across squares, Enter/Space selects, Esc cancels.
- Screen reader: each square has an accessible label ("e4, white knight"). Moves are announced via an `aria-live` region ("Black played knight to c6"). The move list is real text.
- Respect `prefers-reduced-motion` and `prefers-color-scheme`.

---

## 7. Technical architecture

### 7.1 Stack

| Concern | Choice | Notes |
|---|---|---|
| Framework | **React 18 + TypeScript** | |
| Build | **Vite** | Static output, deployable to any static host |
| Chess rules | **chess.js** (BSD-2) | Move legality, SAN generation/parsing, FEN |
| Board UI | **react-chessboard** (MIT) | Supports drag + click-to-move, arrows, custom square styles. *Avoid chessground for now: it's GPL-3.0, which would require the app to be GPL.* |
| Routing | React Router | |
| State | Zustand (or React context + reducer) | Small app; avoid Redux |
| Styling | CSS Modules or Tailwind | Pick one in M0 |
| Persistence | `localStorage` behind a storage module, versioned schema | IndexedDB only if data outgrows about 2MB (unlikely) |
| PWA | `vite-plugin-pwa` | |
| Testing | Vitest + React Testing Library; Playwright for e2e incl. mobile viewports | |
| Lint/format | ESLint + Prettier | |
| Hosting | Static host (provider TBD, §13) at `practice-chess-openings.spixionic.com` | No server. The subdomain is a CNAME record at the spixionic.com DNS provider pointing to the host; HTTPS is required (needed for the PWA service worker). |

### 7.2 Source layout (proposed)

```
src/
  app/            # routes, layout, nav
  components/
    board/        # Board wrapper, highlights, arrows, promotion dialog
    movelist/
    ui/           # buttons, segmented control, cards, sheets
  features/
    openings/     # library, detail
    learn/        # walkthrough controller + screen
    practice/     # drill controller + screen
    review/       # SRS scheduler + session
    notation/     # lessons, exercises
    settings/
  content/
    openings/     # one file per opening (see §8)
    notation/     # lesson content
  lib/
    tree.ts       # build move tree from lines, lookups by FEN
    srs.ts        # scheduling (pure functions)
    storage.ts    # versioned localStorage read/write, export/import
    fen.ts        # FEN normalization
scripts/
  validate-content.ts   # build-time check of all opening lines
```

### 7.3 Key modules

- **Tree builder** (`lib/tree.ts`): takes an opening's lines and replays each with chess.js to merge them into a tree of nodes `{ fen, san, uci, comment, children, lineIds }`. It also indexes nodes by normalized FEN, used for transpositions and SRS cards.
- **Mode controllers:** pure, testable state machines (no React), one each for Learn, Practice and Review. They take board events (`userMove(uci)`) and emit state (`position`, `highlights`, `arrows`, `message`, `status`). React screens only render that state.
- **SRS** (`lib/srs.ts`): pure functions `schedule(card, result, now) → card` and `dueCards(cards, now)`. Fully unit tested with fixed clocks.
- **Storage** (`lib/storage.ts`): one key `cot:v1` holding the whole progress object. Writes are debounced. It includes a `schemaVersion` and migration functions. Every read/write is wrapped in try/catch, and if storage is unavailable (private mode) the app falls back to in-memory storage with a banner.

---

## 8. Content model

Openings are authored as TypeScript (or JSON) files in `src/content/openings/`. Moves are written in SAN, and a build-time script validates every line with chess.js, so a typo fails the build.

```ts
// src/content/openings/italian-game.ts
export const italianGame: Opening = {
  id: "italian-game",
  name: "Italian Game",
  eco: ["C50", "C53", "C54"],
  naturalSide: "w",
  difficulty: "beginner",
  summary: "White develops quickly and aims the bishop at f7...",
  lines: [
    {
      id: "giuoco-piano-main",
      name: "Giuoco Piano: Main Line (c3 & d4)",
      moves: [
        { san: "e4",  comment: "Controls the center and opens lines for the queen and bishop." },
        { san: "e5" },
        { san: "Nf3", comment: "Develops with tempo: attacks the e5 pawn." },
        { san: "Nc6", comment: "Defends e5 and develops." },
        { san: "Bc4", comment: "Targets f7, the weakest square in Black's camp." },
        { san: "Bc5" },
        { san: "c3",  comment: "Prepares d4 to take the full center." },
        // ...
      ],
      keyIdeas: [
        "White builds a big center with c3 and d4.",
        "Black must strike back at the center quickly, often with ...d5 or ...Nf6.",
      ],
    },
    // more lines...
  ],
};
```

**Types:**

```ts
type Color = "w" | "b";

interface Opening {
  id: string;
  name: string;
  eco?: string[];
  naturalSide: Color;
  difficulty: "beginner" | "intermediate";
  summary: string;
  lines: Line[];
}

interface Line {
  id: string;
  name: string;
  moves: { san: string; comment?: string; commentForBlack?: string }[];
  keyIdeas: string[];
}
```

`commentForBlack` is an optional override when the explanation should read differently from Black's point of view. Otherwise `comment` is used for both colors.

**Validation script checks:** every SAN is legal in sequence; line IDs are unique; within one opening, two lines that reach the same position never disagree on the study side's move unless that's intended (warning, not error); comments are under 280 characters.

**Content authorship:** Claude writes all opening explanations (per-move comments, key ideas, summaries) and the notation lessons. Lines follow established mainline theory, and the validation script guarantees every move is legal. Explanations should be written for a beginner: plain language, one idea per comment, and the *why* behind each move, not just the move.

**Notation lessons** are authored similarly in `src/content/notation/` as typed data: explanation screens (markdown text + optional FEN/arrows) and exercise definitions (`{ type, fen?, prompt, answer, distractors? }`).

---

## 9. Persisted data model

```ts
interface ProgressStore {
  schemaVersion: 1;
  settings: Settings;
  lastVisited?: { route: string; at: number };
  lines: Record<string /* `${openingId}/${lineId}/${color}` */, {
    learnCompletedAt?: number;
    practiceRuns: number;
    bestAccuracy?: number;    // 0..1
    lastPracticedAt?: number;
  }>;
  cards: Record<string /* `${openingId}|${normalizedFen}|${color}` */, {
    openingId: string;
    lineIds: string[];        // lines that pass through this node
    ease: number;
    intervalDays: number;
    reps: number;
    lapses: number;
    due: number;              // epoch ms
    lastReviewedAt?: number;
  }>;
  notation: Record<string /* lessonId */, {
    completed: boolean;
    bestScore: number;        // 0..1
    bestTimedScore?: number;  // squares found in 30s
  }>;
}
```

**Normalized FEN** = the first four FEN fields (pieces, side to move, castling, en passant), with no move counters, so transpositions match.

Estimated size: about 14 openings × 3 lines × 10 user nodes × 2 colors ≈ 840 cards max × ~150 bytes ≈ 125KB. That fits easily in localStorage.

---

## 10. Non-functional requirements

- **Performance:** initial JS bundle < 250KB gzipped; Lighthouse mobile performance ≥ 90; a move responds within 50ms on a mid-range phone.
- **Offline:** everything works offline after the first load.
- **Browser support:** the last 2 versions of Safari iOS, Chrome Android, Chrome, Firefox, Safari, Edge.
- **Privacy:** no tracking by default. If analytics are added, they must be cookieless and aggregate (e.g. Plausible), with no personal data.
- **Licensing:** piece set and sounds must be open-licensed (e.g. cburnett pieces, CC BY-SA, with attribution in About).

---

## 11. Testing strategy

- **Unit:** tree builder, SRS scheduling, FEN normalization, storage migrations, and each mode controller (scripted move sequences → expected states).
- **Content:** the `validate-content` script runs in CI and on `npm run build`.
- **Component:** board interaction (tap-to-move, promotion), move list navigation.
- **E2E (Playwright):** projects for iPhone SE, Pixel 7 and desktop Chrome. Core flows: learn a line as Black, practice with one mistake → hint → answer, complete a review session, complete Notation lesson 1.
- **Manual:** a real-device pass on iOS Safari and Android Chrome before each release.

---

## 12. Milestones

| Milestone | Scope | Exit criteria |
|---|---|---|
| **M0: Scaffold** | Vite + React + TS, routing, layout with responsive nav, lint/test setup, deploy pipeline, subdomain DNS | Empty app live at practice-chess-openings.spixionic.com over HTTPS; CI green |
| **M1: Board + Learn** | Board component (tap + drag, orientation, highlights), content model + validation script, 3 openings authored, library, opening detail, color selector, walkthrough mode | Can learn a full line as White or Black on a phone |
| **M2: Practice** | Drill controller, hint/answer flow, results screen, line progress persisted | Can drill any line; progress survives reload |
| **M3: Review (SRS)** | Card creation, scheduler, review session, due badge, mastery indicators | Failed cards reappear same session; passed cards are scheduled correctly (unit tests) |
| **M4: Notation module** | Lessons 1–8, exercise types, notation tooltips in move lists | A new user can finish all 8 lessons on a phone |
| **M5: Content + polish** | All 14 openings authored and reviewed, settings, themes, dark mode, PWA/offline, accessibility pass, export/import | Lighthouse targets met; e2e suite green on mobile viewports |

**Later (post-v1):**
- Browsable ECO database (named openings without explanations) using an open dataset such as lichess `chess-openings` (CC0).
- Custom repertoires: import a PGN, or build one by playing moves.
- "Opponent deviates" practice: the opponent plays common non-book moves, and the user learns how to punish them.
- Optional accounts + cloud sync.
- Engine evaluation bar (Stockfish WASM) in Learn mode.

---

## 13. Open questions

1. **Hosting provider:** Cloudflare Pages, Netlify, Vercel or GitHub Pages. All are free for a static site and support a custom subdomain. Recommendation: Cloudflare Pages, or whichever one manages the spixionic.com DNS. The app uses history routing, so the host must serve `index.html` for unknown paths (`public/_redirects` covers Netlify and Cloudflare Pages).

v1 shipped with these defaults, which can be revisited:
- **Analytics:** none.
- **Sound:** none (the Settings toggle from §4.9 was left out).
- **Gamification:** none in v1.
- **Branding:** plain, with a simple green theme and a pawn icon.

### Resolved
- **Opening list:** the 14 openings in §4.1 are confirmed.
- **Content authorship:** Claude writes the explanations.
- **Line depth:** 8–12 full moves per line.
- **Name & domain:** "Practice Chess Openings" at `practice-chess-openings.spixionic.com`.
