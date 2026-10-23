import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Board, type BoardMove } from "../../components/Board";
import { IconFirst, IconFlip, IconLast, IconNext, IconPrev } from "../../components/icons";
import { MoveList, NotationHint } from "../../components/MoveList";
import { BackLink, FeedbackBanner, RichText } from "../../components/ui";
import { useImmersive } from "../../components/useImmersive";
import { getOpening } from "../../content/openings";
import { moveNumberLabel } from "../../lib/fen";
import type { Feedback } from "../../lib/trainer";
import { commentFor, getNode, treeFor, turnAt } from "../../lib/tree";
import { colorName, type Color } from "../../lib/types";
import { useApp } from "../../store";
import { NotFoundOpening, parseColor } from "../openings/Detail";

export function Learn() {
  const { openingId = "" } = useParams();
  const opening = getOpening(openingId);
  const [params] = useSearchParams();
  if (!opening) return <NotFoundOpening />;
  const color = parseColor(params.get("color"), opening.naturalSide);
  const line = opening.lines.find((l) => l.id === params.get("line")) ?? opening.lines[0];
  const startPly = Number(params.get("ply") ?? 0) || 0;
  // Remount when the line changes so state resets cleanly.
  return <LearnView key={`${line.id}-${color}-${startPly}`} openingId={opening.id} lineId={line.id} color={color} startPly={startPly} />;
}

function LearnView({ openingId, lineId, color, startPly }: { openingId: string; lineId: string; color: Color; startPly: number }) {
  useImmersive();
  const opening = getOpening(openingId)!;
  const line = opening.lines.find((l) => l.id === lineId)!;
  const tree = treeFor(opening);
  const path = useMemo(() => tree.linePaths.get(lineId)!.map((id) => getNode(tree, id)), [tree, lineId]);
  const total = path.length - 1;
  const navigate = useNavigate();
  const location = useLocation();
  const markLearned = useApp((s) => s.markLearned);
  const setLastVisited = useApp((s) => s.setLastVisited);

  const [ply, setPly] = useState(Math.min(startPly, total));
  const [orientation, setOrientation] = useState<"white" | "black">(color === "w" ? "white" : "black");
  const [quiz, setQuiz] = useState(false);
  const [misses, setMisses] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>();
  const [shakeKey, setShakeKey] = useState(0);

  const node = path[ply];
  const next = path[ply + 1];
  const awaitingUser = quiz && !!next && turnAt(node) === color;

  useEffect(() => {
    setLastVisited(location.pathname + location.search, `Learn: ${opening.name}, ${line.name}`);
  }, [location.pathname, location.search, opening.name, line.name, setLastVisited]);

  useEffect(() => {
    if (ply === total) markLearned(openingId, lineId, color);
  }, [ply, total, markLearned, openingId, lineId, color]);

  const go = (p: number) => {
    setPly(Math.max(0, Math.min(total, p)));
    setMisses(0);
    setFeedback(undefined);
  };
  const stepForward = () => {
    if (awaitingUser) return;
    go(ply + 1);
  };

  // Arrow keys step through the line (unless the board itself has focus).
  const keyRef = useRef({ stepForward, go, ply });
  keyRef.current = { stepForward, go, ply };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest(".board__frame") || t.tagName === "INPUT") return;
      if (e.key === "ArrowRight") keyRef.current.stepForward();
      if (e.key === "ArrowLeft") keyRef.current.go(keyRef.current.ply - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Horizontal swipe on the board steps through the line (when not quizzing).
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const onPointerDown = (e: PointerEvent) => (swipe.current = { x: e.clientX, y: e.clientY });
  const onPointerUp = (e: PointerEvent) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || awaitingUser) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) stepForward();
      else go(ply - 1);
    }
  };

  function onUserMove(m: BoardMove): boolean {
    if (!next) return false;
    if (m.san === next.san) {
      setFeedback({ tone: "good", text: `${next.san} is right.` });
      setMisses(0);
      setPly(ply + 1);
      return true;
    }
    const n = misses + 1;
    setMisses(n);
    setShakeKey((k) => k + 1);
    setFeedback(
      n >= 2
        ? { tone: "bad", text: `The move is ${next.san}. Play it on the board.` }
        : { tone: "bad", text: "Not quite. Try again." },
    );
    return false;
  }

  const comment = ply > 0 ? commentFor(node, color) : undefined;
  const parent = ply > 0 ? path[ply - 1] : undefined;
  const alternatives = parent
    ? parent.childIds
        .filter((id) => id !== node.id)
        .map((id) => getNode(tree, id))
        .map((n) => ({ node: n, line: opening.lines.find((l) => n.lineIds.includes(l.id))! }))
    : [];
  const sans = path.slice(1).map((n) => n.san!);
  const lineIndex = opening.lines.findIndex((l) => l.id === lineId);
  const nextLine = opening.lines[lineIndex + 1];
  const q = (lid: string, extra = "") => `?color=${color}&line=${lid}${extra}`;

  return (
    <div className="stack">
      <BackLink to={`/openings/${openingId}?color=${color}`}>{opening.name}</BackLink>
      <header>
        <h1 style={{ fontSize: "1.3rem" }}>{line.name}</h1>
        <p className="muted small" style={{ margin: 0 }}>
          Learn mode · studying as {colorName(color)}
        </p>
      </header>
      <div className="trainer">
        <div className="trainer__board" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
          <Board
            id="learn-board"
            position={node.fen}
            orientation={orientation}
            lastMove={node.from ? { from: node.from, to: node.to! } : undefined}
            movableColor={awaitingUser ? color : undefined}
            onMove={awaitingUser ? onUserMove : undefined}
            arrows={awaitingUser && misses >= 2 ? [[next.from!, next.to!]] : undefined}
            shakeKey={shakeKey}
            announcement={ply > 0 ? `${moveNumberLabel(ply - 1)} ${node.san}` : "Start position"}
          />
        </div>
        <div className="trainer__panel">
          <div className="controls" role="group" aria-label="Move controls">
            <button className="btn btn--icon" onClick={() => go(0)} disabled={ply === 0} aria-label="Start">
              <IconFirst />
            </button>
            <button className="btn btn--icon" onClick={() => go(ply - 1)} disabled={ply === 0} aria-label="Previous move">
              <IconPrev />
            </button>
            <button className="btn btn--icon btn--primary" onClick={stepForward} disabled={ply === total || awaitingUser} aria-label="Next move">
              <IconNext />
            </button>
            <button className="btn btn--icon" onClick={() => go(total)} disabled={ply === total || quiz} aria-label="End">
              <IconLast />
            </button>
          </div>

          <div className="row" style={{ justifyContent: "space-between" }}>
            <label className="row small" style={{ gap: 6, minHeight: 44 }}>
              <input
                type="checkbox"
                checked={quiz}
                onChange={(e) => {
                  setQuiz(e.target.checked);
                  setFeedback(undefined);
                  setMisses(0);
                }}
              />
              Quiz me on {colorName(color)}'s moves
            </label>
            <button className="btn" onClick={() => setOrientation((o) => (o === "white" ? "black" : "white"))} aria-label="Flip board">
              <IconFlip />
            </button>
          </div>

          {awaitingUser && (
            <div className="feedback feedback--info" role="status">
              What does {colorName(color)} play here?
            </div>
          )}
          <FeedbackBanner feedback={feedback} />

          <div className="card explain" aria-live="polite">
            {ply === 0 ? (
              <>
                <div className="explain__move">Start</div>
                <p style={{ margin: 0 }}>
                  {Math.ceil(total / 2)} moves. Press <strong>Next</strong> (or swipe the board) to step through the line.
                  Your moves as {colorName(color)} are in <strong>bold</strong> in the move list.
                </p>
              </>
            ) : (
              <>
                <div className="explain__move">
                  {moveNumberLabel(ply - 1)} {node.san}
                </div>
                {comment && <RichText text={comment} />}
                <NotationHint san={node.san} />
                {alternatives.length > 0 && (
                  <p className="small" style={{ marginTop: 8, marginBottom: 0 }}>
                    {colorName(turnAt(parent!))} can also play{" "}
                    {alternatives.map((a, i) => (
                      <span key={a.node.id}>
                        {i > 0 && ", "}
                        <Link to={`/openings/${openingId}/learn${q(a.line.id, `&ply=${ply}`)}`}>
                          {moveNumberLabel(ply - 1)} {a.node.san} ({a.line.name})
                        </Link>
                      </span>
                    ))}
                    .
                  </p>
                )}
              </>
            )}
          </div>

          <MoveList sans={sans} current={ply} onSelect={quiz ? undefined : go} userColor={color} revealed={quiz ? ply : sans.length} />

          {ply === total && (
            <div className="card stack">
              <h2 style={{ margin: 0 }}>Key ideas</h2>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {line.keyIdeas.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
              <div className="row">
                <button className="btn btn--primary" onClick={() => navigate(`/openings/${openingId}/practice${q(lineId)}`)}>
                  Practice this line
                </button>
                {nextLine && (
                  <Link className="btn" to={`/openings/${openingId}/learn${q(nextLine.id)}`}>
                    Next line
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
