import { Link } from "react-router-dom";
import { notationLessons } from "../../content/notation";
import { useApp } from "../../store";

export function NotationList() {
  const progress = useApp((s) => s.notation);
  const completed = notationLessons.filter((l) => progress[l.id]?.completed).length;
  const nextUp = notationLessons.find((l) => !progress[l.id]?.completed);
  return (
    <div className="stack">
      <header className="page-header">
        <h1>Chess notation</h1>
        <p>
          Learn to read and write moves like <code>1. e4 e5 2. Nf3</code>, so you can follow books, videos and websites.{" "}
          {completed}/{notationLessons.length} lessons complete.
        </p>
      </header>
      <ol className="plain stack">
        {notationLessons.map((l) => {
          const p = progress[l.id];
          return (
            <li key={l.id}>
              <Link to={`/notation/${l.id}`} className="card card--link row" style={{ justifyContent: "space-between", flexWrap: "nowrap" }}>
                <div>
                  <h2 style={{ fontSize: "1.05rem", marginBottom: 4 }}>
                    {l.number}. {l.title}
                  </h2>
                  <p className="small muted" style={{ margin: 0 }}>
                    {l.summary}
                  </p>
                </div>
                {p?.completed ? (
                  <span className="badge badge--mastered">Done · {Math.round(p.bestScore * 100)}%</span>
                ) : l.id === nextUp?.id ? (
                  <span className="badge badge--learning">Up next</span>
                ) : p ? (
                  <span className="badge">Best {Math.round(p.bestScore * 100)}%</span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
