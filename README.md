# Practice Chess Openings

A mobile-friendly web app for learning chess openings and chess notation. It will be hosted at https://practice-chess-openings.spixionic.com. See [SPEC.md](SPEC.md) for the full product spec.

## Development

```sh
npm install
npm run dev          # local dev server
npm test             # unit tests (Vitest)
npm run test:e2e     # end-to-end tests (Playwright: iPhone SE, Pixel 7, desktop)
npm run validate     # check all opening and notation content
npm run build        # validate + type-check + production build into dist/
```

The first e2e run needs browsers installed: `npx playwright install chromium webkit`.

## Content

- Openings: `src/content/openings/`. Each file holds one opening, with lines of SAN moves and a comment per move. Shared move sequences ("stems") are defined once and spread into the lines that use them.
- Notation lessons: `src/content/notation/index.ts`.

`npm run validate` (also run by `npm run build`) replays every line with chess.js. It fails on an illegal or wrongly written move, a missing comment, or a line outside 8–12 moves. Its warnings mark positions where lines branch on the opening side's own move; these are expected.

## Deploying

`npm run build` outputs a static site in `dist/`. Any static host works. Point the `practice-chess-openings` CNAME at it, and make sure unknown paths serve `index.html` (`public/_redirects` handles Netlify and Cloudflare Pages).
