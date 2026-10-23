import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import type { Color } from "../lib/types";
import "./MoveList.css";

/**
 * Moves in SAN as numbered pairs. `current` is the number of plies played
 * (0 = start position). Moves past `revealed` are hidden.
 */
export function MoveList({
  sans,
  current,
  onSelect,
  userColor,
  revealed = sans.length,
}: {
  sans: string[];
  current: number;
  onSelect?: (ply: number) => void;
  userColor?: Color;
  revealed?: number;
}) {
  const ref = useRef<HTMLOListElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("[aria-current='true']")?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [current]);

  const rows: { n: number; w?: number; b?: number }[] = [];
  for (let i = 0; i < Math.min(revealed, sans.length); i++) {
    const n = Math.floor(i / 2);
    rows[n] ??= { n: n + 1 };
    if (i % 2 === 0) rows[n].w = i;
    else rows[n].b = i;
  }

  const cell = (i: number | undefined) => {
    if (i === undefined) return <span className="movelist__move movelist__move--empty" />;
    const color: Color = i % 2 === 0 ? "w" : "b";
    const cls = [
      "movelist__move",
      i + 1 === current ? "movelist__move--current" : "",
      userColor === color ? "movelist__move--user" : "",
    ].join(" ");
    return onSelect ? (
      <button type="button" className={cls} aria-current={i + 1 === current} onClick={() => onSelect(i + 1)}>
        {sans[i]}
      </button>
    ) : (
      <span className={cls} aria-current={i + 1 === current}>
        {sans[i]}
      </span>
    );
  };

  return (
    <ol className="movelist" ref={ref} aria-label="Moves">
      {rows.map((r) => (
        <li key={r.n} className="movelist__row">
          <span className="movelist__num">{r.n}.</span>
          {cell(r.w)}
          {cell(r.b)}
        </li>
      ))}
      {rows.length === 0 && <li className="muted small">No moves yet.</li>}
    </ol>
  );
}

const SYMBOLS: { test: (s: string) => boolean; text: string; lesson: string }[] = [
  { test: (s) => s.startsWith("O-O-O"), text: "O-O-O means castling queenside.", lesson: "check-mate-castling" },
  { test: (s) => s.startsWith("O-O") && !s.startsWith("O-O-O"), text: "O-O means castling kingside.", lesson: "check-mate-castling" },
  { test: (s) => s.includes("x"), text: "x means a capture.", lesson: "captures" },
  { test: (s) => s.includes("+"), text: "+ means check.", lesson: "check-mate-castling" },
  { test: (s) => s.includes("#"), text: "# means checkmate.", lesson: "check-mate-castling" },
  { test: (s) => s.includes("="), text: "= shows what a pawn promotes to.", lesson: "promotion-disambiguation" },
  { test: (s) => /^[KQRBN][a-h1-8][x]?[a-h][1-8]/.test(s), text: "The extra letter or number shows which of two pieces moved.", lesson: "promotion-disambiguation" },
];

/** Explains the notation symbols in a move, with links to the matching lesson. */
export function NotationHint({ san }: { san?: string }) {
  if (!san) return null;
  const hits = SYMBOLS.filter((s) => s.test(san));
  if (hits.length === 0) return null;
  return (
    <p className="small muted notation-hint">
      {hits.map((h, i) => (
        <span key={i}>
          {h.text}{" "}
          <Link to={`/notation/${h.lesson}`}>Learn notation</Link>
          {i < hits.length - 1 ? " · " : ""}
        </span>
      ))}
    </p>
  );
}
