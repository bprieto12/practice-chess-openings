/** Plausible wrong answers for "write the move", built from common notation mistakes. */
export function makeDistractors(
  san: string,
  move: { from: string; to: string; piece: string; captured?: string; promotion?: string },
  random: () => number = Math.random,
): string[] {
  const out = new Set<string>();
  const add = (s: string) => {
    if (s && s !== san) out.add(s);
  };
  const suffix = san.match(/[+#]$/)?.[0] ?? "";
  const core = san.replace(/[+#]$/, "");

  if (core.startsWith("O-O")) {
    add(core === "O-O" ? "O-O-O" + suffix : "O-O" + suffix);
    add(`K${move.to}`);
    add(`${move.from}-${move.to}`);
    add("0-0-0-0");
  }
  if (core.includes("x")) add(core.replace("x", "") + suffix);
  if (suffix) add(core);
  else add(core + "+");
  if (suffix === "#") add(core + "+");
  if (move.piece === "p") {
    add("P" + core + suffix);
    if (move.captured) {
      add(core.slice(1) + suffix); // "xd5"
      add(`${move.from[0]}${move.to}${suffix}`); // "ed5"
    }
    if (move.promotion) {
      add(core.replace("=", "") + suffix);
      add(core.replace(/=[QRBN]/, "=N") + suffix);
    }
  } else if (!core.startsWith("O-O")) {
    const letter = core[0];
    for (const l of ["N", "B", "R", "Q", "K"]) if (l !== letter) add(l + core.slice(1) + suffix);
    // Disambiguation removed, or the wrong one.
    const m = core.match(/^([KQRBN])([a-h1-8])(x?)([a-h][1-8])$/);
    if (m) {
      add(`${m[1]}${m[3]}${m[4]}${suffix}`);
      const alt = /[a-h]/.test(m[2]) ? String.fromCharCode(((m[2].charCodeAt(0) - 97 + 3) % 8) + 97) : String(((Number(m[2]) + 2) % 8) + 1);
      add(`${m[1]}${alt}${m[3]}${m[4]}${suffix}`);
    } else {
      add(`${letter}${move.from}${move.to}${suffix}`);
    }
  }
  add(`${move.from}-${move.to}`);
  add(move.to);

  const list = [...out];
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list.slice(0, 3);
}
