import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Chessboard } from "react-chessboard";
import { openings } from "../../content/openings";
import { formatMoves } from "../../lib/fen";
import { definingMoves, fenAfter, firstMoveGroup } from "../../lib/opening-info";
import type { Opening } from "../../lib/types";
import { useApp } from "../../store";
import { useOpeningProgress } from "../progress";

type SideFilter = "all" | "w" | "b";
type MoveFilter = "all" | "e4" | "d4" | "other";

export function Library() {
  const [side, setSide] = useState<SideFilter>("all");
  const [first, setFirst] = useState<MoveFilter>("all");
  const [query, setQuery] = useState("");

  const list = useMemo(
    () =>
      openings.filter(
        (o) =>
          (side === "all" || o.naturalSide === side) &&
          (first === "all" || firstMoveGroup(o) === first) &&
          o.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [side, first, query],
  );

  const chip = <T extends string>(value: T, current: T, set: (v: T) => void, label: string) => (
    <button type="button" className="chip" aria-pressed={value === current} onClick={() => set(value)}>
      {label}
    </button>
  );

  return (
    <div className="stack">
      <header className="page-header">
        <h1>Openings</h1>
        <p>Pick an opening to learn its main lines. Every opening can be studied as White or Black.</p>
      </header>
      <input
        className="input"
        type="search"
        placeholder="Search openings"
        aria-label="Search openings"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="chips" role="group" aria-label="Filter by side">
        {chip<SideFilter>("all", side, setSide, "All")}
        {chip<SideFilter>("w", side, setSide, "For White")}
        {chip<SideFilter>("b", side, setSide, "For Black")}
      </div>
      <div className="chips" role="group" aria-label="Filter by first move">
        {chip<MoveFilter>("all", first, setFirst, "Any first move")}
        {chip<MoveFilter>("e4", first, setFirst, "1. e4")}
        {chip<MoveFilter>("d4", first, setFirst, "1. d4")}
        {chip<MoveFilter>("other", first, setFirst, "Other")}
      </div>
      {list.length === 0 && <p className="muted">No openings match.</p>}
      <div className="grid">
        {list.map((o) => (
          <OpeningCard key={o.id} opening={o} />
        ))}
      </div>
    </div>
  );
}

function OpeningCard({ opening }: { opening: Opening }) {
  const moves = useMemo(() => definingMoves(opening), [opening]);
  const fen = useMemo(() => fenAfter(moves), [moves]);
  const progress = useOpeningProgress(opening);
  const boardTheme = useApp((s) => s.settings.boardTheme);
  const colors = { green: ["#eeeed2", "#769656"], brown: ["#f0d9b5", "#b58863"], blue: ["#dee3e6", "#8ca2ad"] }[boardTheme];

  return (
    <Link to={`/openings/${opening.id}`} className="card card--link opening-card">
      <div className="opening-card__thumb" aria-hidden="true">
        <Chessboard
          id={`thumb-${opening.id}`}
          position={fen}
          arePiecesDraggable={false}
          showBoardNotation={false}
          animationDuration={0}
          boardOrientation={opening.naturalSide === "w" ? "white" : "black"}
          customLightSquareStyle={{ backgroundColor: colors[0] }}
          customDarkSquareStyle={{ backgroundColor: colors[1] }}
        />
      </div>
      <div className="opening-card__body">
        <h2>{opening.name}</h2>
        <p className="small">
          <span className="san">{formatMoves(moves)}</span>
        </p>
        <div className="row small">
          <span className="badge">{opening.naturalSide === "w" ? "For White" : "For Black"}</span>
          <span className="badge">{opening.difficulty === "beginner" ? "Beginner" : "Intermediate"}</span>
          <span className="muted">
            {opening.lines.length} lines
            {progress.mastered + progress.learning > 0 && ` · ${progress.mastered} mastered`}
          </span>
        </div>
      </div>
    </Link>
  );
}
