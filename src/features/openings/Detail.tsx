import { Link, useParams, useSearchParams } from "react-router-dom";
import { getOpening } from "../../content/openings";
import { BackLink, MasteryBadge, Segmented } from "../../components/ui";
import { formatMoves } from "../../lib/fen";
import { commonStem, definingMoves } from "../../lib/opening-info";
import { colorName, type Color, type Line, type Opening } from "../../lib/types";
import { lineKey, useApp } from "../../store";
import { useLineMastery } from "../progress";

export function parseColor(v: string | null, fallback: Color): Color {
  return v === "w" || v === "b" ? v : fallback;
}

export function OpeningDetail() {
  const { openingId = "" } = useParams();
  const opening = getOpening(openingId);
  const [params, setParams] = useSearchParams();
  if (!opening) return <NotFoundOpening />;
  const color = parseColor(params.get("color"), opening.naturalSide);
  const stem = commonStem(opening);

  return (
    <div className="stack">
      <BackLink to="/openings">All openings</BackLink>
      <header className="page-header">
        <h1>{opening.name}</h1>
        <p className="san" style={{ display: "inline-block" }}>
          {formatMoves(definingMoves(opening))}
        </p>
      </header>
      <p>{opening.summary}</p>

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <strong>Study as</strong>
          <Segmented<Color>
            label="Study color"
            value={color}
            onChange={(c) => setParams({ color: c }, { replace: true })}
            options={[
              { value: "w", label: "White" },
              { value: "b", label: "Black" },
            ]}
          />
        </div>
        {color !== opening.naturalSide && (
          <p className="small muted" style={{ margin: 0 }}>
            This is a {colorName(opening.naturalSide)} opening. You'll learn how to face it as {colorName(color)}.
          </p>
        )}
        <Link className="btn btn--primary btn--block" to={`/openings/${opening.id}/practice?color=${color}&line=all`}>
          Practice all lines (random)
        </Link>
      </div>

      <h2>Lines</h2>
      <ul className="plain stack">
        {opening.lines.map((l) => (
          <li key={l.id}>
            <LineItem opening={opening} line={l} color={color} stemLength={stem.length} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function LineItem({ opening, line, color, stemLength }: { opening: Opening; line: Line; color: Color; stemLength: number }) {
  const mastery = useLineMastery(opening, line.id, color);
  const progress = useApp((s) => s.lines[lineKey(opening.id, line.id, color)]);
  const rest = line.moves.slice(stemLength).map((m) => m.san);
  const preview = formatMoves(rest.slice(0, 8), stemLength);
  const q = `?color=${color}&line=${line.id}`;
  return (
    <div className="card line-item">
      <div className="line-item__head">
        <h3 style={{ margin: 0 }}>{line.name}</h3>
        <MasteryBadge mastery={mastery} />
      </div>
      <p className="small" style={{ margin: 0 }}>
        <span className="san">
          {stemLength > 0 ? "… " : ""}
          {preview}
          {rest.length > 8 ? " …" : ""}
        </span>
      </p>
      <p className="small muted" style={{ margin: 0 }}>
        {Math.ceil(line.moves.length / 2)} moves
        {progress?.practiceRuns ? ` · practiced ${progress.practiceRuns}×` : ""}
        {progress?.bestAccuracy !== undefined ? ` · best ${Math.round(progress.bestAccuracy * 100)}%` : ""}
      </p>
      <div className="row">
        <Link className="btn" to={`/openings/${opening.id}/learn${q}`}>
          Learn
        </Link>
        <Link className="btn btn--primary" to={`/openings/${opening.id}/practice${q}`}>
          Practice
        </Link>
      </div>
    </div>
  );
}

export function NotFoundOpening() {
  return (
    <div className="card">
      <h1>Opening not found</h1>
      <p>
        <Link to="/openings">Back to openings</Link>
      </p>
    </div>
  );
}
