import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Board } from "../../components/Board";
import { BackLink, ProgressBar, RichText } from "../../components/ui";
import { useImmersive } from "../../components/useImmersive";
import { getLesson, notationLessons, type NotationLesson } from "../../content/notation";
import { positionFrom } from "../../content/notation/validate";
import { useApp } from "../../store";
import { Choice, expand, FindSquare, FollowGame, itemMax, NameSquare, PieceLetter, PlayMove, randomSquare, WriteMove, type Item } from "./exercises";
import "./notation.css";

export function NotationLessonPage() {
  const { lessonId = "" } = useParams();
  const lesson = getLesson(lessonId);
  if (!lesson) {
    return (
      <div className="card">
        <h1>Lesson not found</h1>
        <Link to="/notation">Back to lessons</Link>
      </div>
    );
  }
  return <LessonView key={lesson.id} lesson={lesson} />;
}

type Phase = { kind: "learn"; screen: number } | { kind: "practice"; run: number } | { kind: "result"; score: number } | { kind: "timed" };

function LessonView({ lesson }: { lesson: NotationLesson }) {
  useImmersive();
  const [phase, setPhase] = useState<Phase>({ kind: "learn", screen: 0 });
  const progress = useApp((s) => s.notation[lesson.id]);
  const recordNotation = useApp((s) => s.recordNotation);
  const setLastVisited = useApp((s) => s.setLastVisited);
  const next = notationLessons.find((l) => l.number === lesson.number + 1);

  useEffect(() => {
    setLastVisited(`/notation/${lesson.id}`, `Notation ${lesson.number}: ${lesson.title}`);
  }, [lesson, setLastVisited]);

  return (
    <div className="stack">
      <BackLink to="/notation">Notation lessons</BackLink>
      <header>
        <p className="small muted" style={{ margin: 0 }}>
          Lesson {lesson.number} of {notationLessons.length}
        </p>
        <h1 style={{ fontSize: "1.4rem" }}>{lesson.title}</h1>
      </header>

      {phase.kind === "learn" && (
        <Screens
          lesson={lesson}
          index={phase.screen}
          onIndex={(i) => setPhase({ kind: "learn", screen: i })}
          onStart={() => setPhase({ kind: "practice", run: 0 })}
          bestScore={progress?.bestScore}
        />
      )}

      {phase.kind === "practice" && (
        <Exercises
          key={phase.run}
          lesson={lesson}
          onFinish={(score) => {
            recordNotation(lesson.id, score);
            setPhase({ kind: "result", score });
          }}
        />
      )}

      {phase.kind === "result" && (
        <div className="card stack" role="status">
          <div className="stat">{Math.round(phase.score * 100)}%</div>
          {phase.score >= 0.8 ? (
            <p style={{ margin: 0 }}>
              <strong>Lesson complete!</strong> You scored 80% or more.
            </p>
          ) : (
            <p style={{ margin: 0 }}>You need 80% to complete this lesson. Have another go.</p>
          )}
          <div className="row">
            <button className="btn" onClick={() => setPhase({ kind: "practice", run: Date.now() })}>
              Try again
            </button>
            {lesson.timedChallenge && (
              <button className="btn" onClick={() => setPhase({ kind: "timed" })}>
                30-second challenge
              </button>
            )}
            {next && phase.score >= 0.8 && (
              <Link className="btn btn--primary" to={`/notation/${next.id}`}>
                Next lesson
              </Link>
            )}
            {!next && phase.score >= 0.8 && (
              <Link className="btn btn--primary" to="/openings">
                Start learning openings
              </Link>
            )}
          </div>
        </div>
      )}

      {phase.kind === "timed" && (
        <TimedChallenge
          best={progress?.bestTimedScore}
          onFinish={(n) => recordNotation(lesson.id, progress?.bestScore ?? 0, n)}
          onExit={() => setPhase({ kind: "learn", screen: 0 })}
        />
      )}
    </div>
  );
}

function Screens({
  lesson,
  index,
  onIndex,
  onStart,
  bestScore,
}: {
  lesson: NotationLesson;
  index: number;
  onIndex: (i: number) => void;
  onStart: () => void;
  bestScore?: number;
}) {
  const s = lesson.screens[index];
  const fen = useMemo(() => (s.fen || s.setup ? positionFrom(s).fen() : undefined), [s]);
  const last = index === lesson.screens.length - 1;
  const content = (
    <div className="trainer__panel">
      <div className="card">
        <h2>{s.title}</h2>
        <RichText text={s.text} />
      </div>
      <div className="row">
        <button className="btn" onClick={() => onIndex(index - 1)} disabled={index === 0}>
          Back
        </button>
        {!last ? (
          <button className="btn btn--primary" onClick={() => onIndex(index + 1)}>
            Next
          </button>
        ) : (
          <button className="btn btn--primary" onClick={onStart}>
            Start exercises
          </button>
        )}
        <span className="small muted">
          {index + 1}/{lesson.screens.length}
        </span>
      </div>
      {index === 0 && bestScore !== undefined && (
        <button className="btn" onClick={onStart}>
          Skip to exercises (best so far {Math.round(bestScore * 100)}%)
        </button>
      )}
    </div>
  );
  if (!s.showBoard) return <div className="stack">{content}</div>;
  return (
    <div className="trainer">
      <div className="trainer__board">
        <Board
          id="lesson-board"
          position={fen ?? {}}
          orientation={s.orientation ?? "white"}
          highlights={s.highlights}
          arrows={s.arrows}
          showCoordinates
        />
      </div>
      {content}
    </div>
  );
}

function Exercises({ lesson, onFinish }: { lesson: NotationLesson; onFinish: (score: number) => void }) {
  const items = useMemo<Item[]>(() => expand(lesson.exercises), [lesson]);
  const max = useMemo(() => items.reduce((n, i) => n + itemMax(i), 0), [items]);
  const [index, setIndex] = useState(0);
  const [points, setPoints] = useState(0);
  const [hideCoords, setHideCoords] = useState(true);
  const [typing, setTyping] = useState(false);

  const complete = useCallback(
    (p: number) => {
      const total = points + p;
      if (index + 1 >= items.length) onFinish(max ? total / max : 1);
      else {
        setPoints(total);
        setIndex(index + 1);
      }
    },
    [points, index, items.length, max, onFinish],
  );

  const item = items[index];
  const hasFind = items.some((i) => i.kind === "find-square");
  const hasWrite = items.some((i) => i.kind === "write-move");
  const key = `${index}`;

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <span className="small muted">
          Exercise {index + 1} of {items.length}
        </span>
        {hasFind && item.kind === "find-square" && (
          <label className="row small" style={{ gap: 6 }}>
            <input type="checkbox" checked={!hideCoords} onChange={(e) => setHideCoords(!e.target.checked)} />
            Show coordinates (easier)
          </label>
        )}
        {hasWrite && item.kind === "write-move" && (
          <label className="row small" style={{ gap: 6 }}>
            <input type="checkbox" checked={typing} onChange={(e) => setTyping(e.target.checked)} />
            Type the answer
          </label>
        )}
      </div>
      <ProgressBar value={index / items.length} label="Lesson progress" />
      {item.kind === "find-square" && <FindSquare key={key} item={item} onComplete={complete} hideCoordinates={hideCoords} />}
      {item.kind === "name-square" && <NameSquare key={key} item={item} onComplete={complete} />}
      {item.kind === "piece-letter" && <PieceLetter key={key} item={item} onComplete={complete} />}
      {item.kind === "play-move" && <PlayMove key={key} item={item} onComplete={complete} />}
      {item.kind === "write-move" && <WriteMove key={key} item={item} onComplete={complete} typing={typing} />}
      {item.kind === "follow-game" && <FollowGame key={key} item={item} onComplete={complete} />}
      {item.kind === "choice" && <Choice key={key} item={item} onComplete={complete} />}
    </div>
  );
}

const TIMED_SECONDS = 30;

function TimedChallenge({ best, onFinish, onExit }: { best?: number; onFinish: (n: number) => void; onExit: () => void }) {
  const [running, setRunning] = useState(false);
  const [endsAt, setEndsAt] = useState(0);
  const [left, setLeft] = useState(TIMED_SECONDS);
  const [target, setTarget] = useState(randomSquare);
  const [score, setScore] = useState(0);
  const [flash, setFlash] = useState<{ sq: string; ok: boolean }>();
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const l = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setLeft(l);
      if (l === 0) {
        setRunning(false);
        setFinished(true);
      }
    }, 200);
    return () => clearInterval(t);
  }, [running, endsAt]);

  useEffect(() => {
    if (finished) onFinish(score);
    // Only when the run finishes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const start = () => {
    setScore(0);
    setFinished(false);
    setTarget(randomSquare());
    setEndsAt(Date.now() + TIMED_SECONDS * 1000);
    setLeft(TIMED_SECONDS);
    setRunning(true);
  };

  const tap = (sq: string) => {
    if (!running) return;
    const ok = sq === target;
    setFlash({ sq, ok });
    if (ok) {
      setScore((s) => s + 1);
      let n = randomSquare();
      while (n === target) n = randomSquare();
      setTarget(n);
    }
  };

  return (
    <div className="trainer">
      <div className="trainer__board">
        <Board
          id="timed-board"
          position={{}}
          showCoordinates={false}
          onSquareTap={tap}
          correctSquare={flash?.ok ? flash.sq : undefined}
          wrongSquare={flash && !flash.ok ? flash.sq : undefined}
        />
      </div>
      <div className="trainer__panel">
        <div className="card stack">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="stat">{score}</div>
              <div className="small muted">squares found</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="stat">{left}s</div>
              <div className="small muted">best: {best ?? "–"}</div>
            </div>
          </div>
          {running ? (
            <div className="timed__target" aria-live="polite">
              Tap <code>{target}</code>
            </div>
          ) : (
            <>
              {finished && <p style={{ margin: 0 }}>Time's up! You found {score} squares.</p>}
              <button className="btn btn--primary" onClick={start}>
                {finished ? "Play again" : "Start (30 seconds)"}
              </button>
            </>
          )}
        </div>
        <button className="btn" onClick={onExit}>
          Back to lesson
        </button>
      </div>
    </div>
  );
}
