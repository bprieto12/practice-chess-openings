import { Link } from "react-router-dom";
import { openings } from "../content/openings";
import { useApp } from "../store";
import { useDueCount } from "./progress";

export function Home() {
  const lastVisited = useApp((s) => s.lastVisited);
  const notation = useApp((s) => s.notation);
  const due = useDueCount();
  const notationStarted = Object.keys(notation).length > 0;
  const white = openings.filter((o) => o.naturalSide === "w");
  const black = openings.filter((o) => o.naturalSide === "b");

  return (
    <div className="stack">
      <header className="page-header">
        <h1>Practice Chess Openings</h1>
        <p>Learn the main lines of popular openings on an interactive board, then drill them until they stick.</p>
      </header>

      {lastVisited && (
        <Link to={lastVisited.route} className="card card--link">
          <div className="small muted">Continue where you left off</div>
          <strong>{lastVisited.label}</strong>
        </Link>
      )}

      {due > 0 && (
        <Link to="/review" className="btn btn--primary btn--block">
          Review: {due} position{due === 1 ? "" : "s"} due
        </Link>
      )}

      {!notationStarted && (
        <Link to="/notation" className="card card--link">
          <strong>New to chess notation?</strong>
          <div className="small muted">Start here. Learn to read moves like 1. e4 e5 2. Nf3 in eight short lessons.</div>
        </Link>
      )}

      <section className="stack">
        <h2>Openings for White</h2>
        <div className="chips">
          {white.map((o) => (
            <Link key={o.id} to={`/openings/${o.id}`} className="chip" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
              {o.name}
            </Link>
          ))}
        </div>
        <h2>Openings for Black</h2>
        <div className="chips">
          {black.map((o) => (
            <Link key={o.id} to={`/openings/${o.id}`} className="chip" style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
              {o.name}
            </Link>
          ))}
        </div>
        <Link to="/openings" className="btn">
          Browse all openings
        </Link>
      </section>

      <section className="card stack">
        <h2 style={{ margin: 0 }}>How it works</h2>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>
            <strong>Learn</strong>: step through a line with an explanation for every move.
          </li>
          <li>
            <strong>Practice</strong>: play your side from memory while the app plays the other side.
          </li>
          <li>
            <strong>Review</strong>: positions come back at longer gaps as you remember them, and sooner when you don't.
          </li>
        </ol>
      </section>
    </div>
  );
}
