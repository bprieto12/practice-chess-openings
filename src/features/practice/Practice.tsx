import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { Board, type BoardMove } from "../../components/Board";
import { IconFlip } from "../../components/icons";
import { MoveList } from "../../components/MoveList";
import { BackLink, FeedbackBanner, ProgressBar, RichText } from "../../components/ui";
import { getOpening } from "../../content/openings";
import { moveNumberLabel } from "../../lib/fen";
import {
  chooseChild,
  practiceAccuracy,
  practiceOpponentMove,
  practiceUserMove,
  startPractice,
  type PracticeState,
} from "../../lib/trainer";
import { commentFor, getNode, treeFor, userNodesInLine, type TreeNode } from "../../lib/tree";
import { colorName, type Color, type Opening } from "../../lib/types";
import { lineKey, useApp } from "../../store";
import { NotFoundOpening, parseColor } from "../openings/Detail";

export function Practice() {
  const { openingId = "" } = useParams();
  const opening = getOpening(openingId);
  const [params] = useSearchParams();
  const [run, setRun] = useState(0);
  if (!opening) return <NotFoundOpening />;
  const color = parseColor(params.get("color"), opening.naturalSide);
  const lineParam = params.get("line") ?? "all";
  const line = opening.lines.find((l) => l.id === lineParam);
  const lineIds = line ? [line.id] : opening.lines.map((l) => l.id);
  return (
    <PracticeView
      key={`${lineParam}-${color}-${run}`}
      opening={opening}
      lineIds={lineIds}
      all={!line}
      color={color}
      onRetry={() => setRun((r) => r + 1)}
    />
  );
}

function PracticeView({
  opening,
  lineIds,
  all,
  color,
  onRetry,
}: {
  opening: Opening;
  lineIds: string[];
  all: boolean;
  color: Color;
  onRetry: () => void;
}) {
  const tree = treeFor(opening);
  const settings = useApp((s) => s.settings);
  const linesProgress = useApp((s) => s.lines);
  const recordPractice = useApp((s) => s.recordPractice);
  const setLastVisited = useApp((s) => s.setLastVisited);
  const location = useLocation();

  const [state, setState] = useState<PracticeState>(() => startPractice(tree, lineIds, color));
  const [orientation, setOrientation] = useState<"white" | "black">(color === "w" ? "white" : "black");
  const [showExplain, setShowExplain] = useState(false);
  const recorded = useRef(false);

  const node = getNode(tree, state.nodeId);
  const pathNodes = state.path.map((id) => getNode(tree, id));
  const sans = pathNodes.slice(1).map((n) => n.san!);
  const title = all ? "All lines" : opening.lines.find((l) => l.id === lineIds[0])!.name;

  useEffect(() => {
    setLastVisited(location.pathname + location.search, `Practice: ${opening.name}, ${title}`);
  }, [location.pathname, location.search, opening.name, title, setLastVisited]);

  // Favor lines the user is weakest on or hasn't practiced recently.
  const weight = useMemo(() => {
    return (child: TreeNode) => {
      const ls = child.lineIds.filter((l) => state.lineIds.includes(l));
      if (ls.length === 0) return 0;
      const scores = ls.map((l) => {
        const p = linesProgress[lineKey(opening.id, l, color)];
        if (!p || !p.practiceRuns) return 3;
        const days = p.lastPracticedAt ? (Date.now() - p.lastPracticedAt) / 86_400_000 : 7;
        return 1 + (1 - (p.bestAccuracy ?? 0)) * 2 + Math.min(days, 7) / 7;
      });
      return scores.reduce((a, b) => a + b, 0) / scores.length;
    };
  }, [linesProgress, opening.id, color, state.lineIds]);

  // The opponent replies automatically after a short delay.
  useEffect(() => {
    if (state.phase !== "opponent") return;
    const t = setTimeout(
      () => setState((s) => practiceOpponentMove(tree, s, (children) => chooseChild(children, weight))),
      settings.opponentDelayMs,
    );
    return () => clearTimeout(t);
  }, [state.phase, state.nodeId, tree, weight, settings.opponentDelayMs]);

  useEffect(() => {
    setShowExplain(false);
  }, [state.nodeId]);

  const finishedLineId = state.phase === "done" ? state.lineIds[0] : undefined;
  const accuracy = practiceAccuracy(state);

  useEffect(() => {
    if (state.phase !== "done" || recorded.current || !finishedLineId) return;
    recorded.current = true;
    recordPractice({
      openingId: opening.id,
      lineId: finishedLineId,
      color,
      accuracy,
      results: state.results.map((r) => ({ normFen: r.normFen, lineIds: r.lineIds, passed: r.passed })),
    });
  }, [state.phase, finishedLineId, accuracy, state.results, recordPractice, opening.id, color]);

  function onMove(m: BoardMove): boolean {
    const nextState = practiceUserMove(tree, state, m.san);
    setState(nextState);
    return nextState.nodeId !== state.nodeId;
  }

  const userTotal = all ? undefined : userNodesInLine(tree, lineIds[0], color).length;
  const lastComment = node.san ? commentFor(node, color) : undefined;
  const finishedLine = finishedLineId ? opening.lines.find((l) => l.id === finishedLineId) : undefined;
  const idx = finishedLine ? opening.lines.indexOf(finishedLine) : -1;
  const nextLine = !all && idx >= 0 ? opening.lines[idx + 1] : undefined;
  const missed = state.results.filter((r) => !r.passed);

  return (
    <div className="stack">
      <BackLink to={`/openings/${opening.id}?color=${color}`}>{opening.name}</BackLink>
      <header>
        <h1 style={{ fontSize: "1.3rem" }}>{title}</h1>
        <p className="muted small" style={{ margin: 0 }}>
          Practice · you play {colorName(color)}
        </p>
      </header>
      <div className="trainer">
        <div className="trainer__board">
          <Board
            id="practice-board"
            position={node.fen}
            orientation={orientation}
            movableColor={state.phase === "user" ? color : undefined}
            onMove={state.phase === "user" ? onMove : undefined}
            lastMove={node.from ? { from: node.from, to: node.to! } : undefined}
            hintSquare={state.hintSquare}
            correctSquare={state.correctSquare}
            arrows={state.answer ? [[state.answer.from, state.answer.to]] : undefined}
            shakeKey={state.missCount}
            announcement={node.san ? `${colorName(node.ply % 2 === 1 ? "w" : "b")} played ${node.san}` : undefined}
          />
        </div>
        <div className="trainer__panel">
          {userTotal !== undefined && state.phase !== "done" && (
            <ProgressBar value={state.results.length / userTotal} label="Line progress" />
          )}
          {state.phase === "user" && state.feedback?.tone !== "bad" && (
            <div className="feedback feedback--info" role="status">
              Your move. What does {colorName(color)} play?
            </div>
          )}
          {state.phase === "opponent" && (
            <div className="feedback feedback--info" role="status">
              {colorName(color === "w" ? "b" : "w")} is thinking…
            </div>
          )}
          {state.phase !== "done" && <FeedbackBanner feedback={state.feedback} />}

          {state.phase !== "done" && node.san && (
            <div className="card">
              {showExplain ? (
                <>
                  <div className="explain__move">
                    {moveNumberLabel(node.ply - 1)} {node.san}
                  </div>
                  {lastComment && <RichText text={lastComment} />}
                </>
              ) : (
                <button className="btn btn--block" onClick={() => setShowExplain(true)}>
                  Show explanation for {moveNumberLabel(node.ply - 1)} {node.san}
                </button>
              )}
            </div>
          )}

          {state.phase === "done" && (
            <div className="card stack" role="status">
              <h2 style={{ margin: 0 }}>Line complete</h2>
              {all && finishedLine && <p style={{ margin: 0 }}>You played the {finishedLine.name} line.</p>}
              <div className="result-stat">
                <div>
                  <div className="stat">{Math.round(accuracy * 100)}%</div>
                  <div className="small muted">correct first try</div>
                </div>
                <div>
                  <div className="stat">
                    {state.results.length - missed.length}/{state.results.length}
                  </div>
                  <div className="small muted">moves</div>
                </div>
              </div>
              {missed.length > 0 && (
                <div>
                  <strong>Moves to review</strong>
                  <ul style={{ margin: "4px 0 0", paddingLeft: 20 }}>
                    {missed.map((r) => {
                      const i = state.path.indexOf(r.nodeId);
                      const played = getNode(tree, state.path[i + 1]);
                      return (
                        <li key={r.nodeId}>
                          <span className="san">
                            {moveNumberLabel(played.ply - 1)} {played.san}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              <p className="small muted" style={{ margin: 0 }}>
                These positions are now in your Review queue.
              </p>
              <div className="row">
                <button className="btn btn--primary" onClick={onRetry}>
                  {all ? "Another line" : "Retry"}
                </button>
                {nextLine && (
                  <Link className="btn" to={`/openings/${opening.id}/practice?color=${color}&line=${nextLine.id}`}>
                    Next line
                  </Link>
                )}
                {finishedLine && (
                  <Link className="btn" to={`/openings/${opening.id}/learn?color=${color}&line=${finishedLine.id}`}>
                    Review in Learn mode
                  </Link>
                )}
              </div>
            </div>
          )}

          <MoveList sans={sans} current={sans.length} userColor={color} />
          <div className="row">
            <button className="btn" onClick={() => setOrientation((o) => (o === "white" ? "black" : "white"))} aria-label="Flip board">
              <IconFlip /> Flip
            </button>
            {state.phase !== "done" && (
              <button className="btn" onClick={onRetry}>
                Restart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
