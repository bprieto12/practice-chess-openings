import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Board, type BoardMove } from "../../components/Board";
import { MoveList } from "../../components/MoveList";
import { FeedbackBanner, ProgressBar, RichText } from "../../components/ui";
import { useImmersive } from "../../components/useImmersive";
import { getOpening } from "../../content/openings";
import { moveNumberLabel } from "../../lib/fen";
import { dueCards } from "../../lib/srs";
import { reviewUserMove, startReviewCard, type ReviewCardState } from "../../lib/trainer";
import { commentFor, getNode, treeFor } from "../../lib/tree";
import { colorName } from "../../lib/types";
import { useApp } from "../../store";
import { useNow } from "../progress";

const REPLAY_MS = 150;

export function Review() {
  const cards = useApp((s) => s.cards);
  const size = useApp((s) => s.settings.reviewSessionSize);
  const now = useNow();
  const [session, setSession] = useState<{ queue: string[]; done: { key: string; passed: boolean }[] } | null>(null);

  const due = useMemo(() => {
    const keyOf = new Map(Object.entries(cards).map(([k, c]) => [c, k]));
    return dueCards(Object.values(cards), now).map((c) => keyOf.get(c)!);
  }, [cards, now]);

  const total = Object.keys(cards).length;
  const nextDue = useMemo(() => {
    const times = Object.values(cards).map((c) => c.due).filter((d) => d > now);
    return times.length ? Math.min(...times) : undefined;
  }, [cards, now]);

  if (session && session.queue.length > 0) {
    return (
      <ReviewCard
        key={`${session.queue[0]}-${session.done.length}`}
        cardKeyId={session.queue[0]}
        position={session.done.length + 1}
        remaining={session.queue.length}
        onDone={(passed) =>
          setSession((s) => {
            if (!s) return s;
            const [head, ...rest] = s.queue;
            // A missed card comes back later in the same session.
            return { queue: passed ? rest : [...rest, head], done: [...s.done, { key: head, passed }] };
          })
        }
        onSkip={() => setSession((s) => (s ? { ...s, queue: s.queue.slice(1) } : s))}
        onEnd={() => setSession((s) => (s ? { ...s, queue: [] } : s))}
      />
    );
  }

  if (session) {
    const right = session.done.filter((d) => d.passed).length;
    return (
      <div className="stack">
        <h1>Session complete</h1>
        <div className="card result-stat">
          <div>
            <div className="stat">{new Set(session.done.map((d) => d.key)).size}</div>
            <div className="small muted">positions reviewed</div>
          </div>
          <div>
            <div className="stat">{session.done.length ? Math.round((right / session.done.length) * 100) : 100}%</div>
            <div className="small muted">correct first try</div>
          </div>
        </div>
        <p className="muted">{nextDueText(due.length, nextDue, now)}</p>
        <div className="row">
          {due.length > 0 && (
            <button className="btn btn--primary" onClick={() => setSession({ queue: due.slice(0, size), done: [] })}>
              Review more ({due.length} due)
            </button>
          )}
          <Link className="btn" to="/openings">
            Back to openings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <header className="page-header">
        <h1>Review</h1>
        <p>Positions you've practiced come back for review, at longer gaps each time you get them right. Positions you miss come back sooner.</p>
      </header>
      {total === 0 ? (
        <div className="card stack">
          <p style={{ margin: 0 }}>Nothing to review yet. Practice a line and its positions will show up here.</p>
          <Link className="btn btn--primary" to="/openings">
            Choose an opening
          </Link>
        </div>
      ) : (
        <div className="card stack">
          <div>
            <div className="stat">{due.length}</div>
            <div className="small muted">positions due · {total} in your deck</div>
          </div>
          {due.length > 0 ? (
            <button className="btn btn--primary btn--block" onClick={() => setSession({ queue: due.slice(0, size), done: [] })}>
              Start review ({Math.min(size, due.length)})
            </button>
          ) : (
            <p className="muted" style={{ margin: 0 }}>
              {nextDueText(0, nextDue, now)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function nextDueText(dueCount: number, nextDue: number | undefined, now: number) {
  if (dueCount > 0) return `${dueCount} more positions are due.`;
  if (!nextDue) return "Nothing else is scheduled.";
  const mins = Math.round((nextDue - now) / 60000);
  if (mins < 60) return `All caught up. The next review is due in ${Math.max(1, mins)} minute${mins === 1 ? "" : "s"}.`;
  const hours = Math.round(mins / 60);
  if (hours < 36) return `All caught up. The next review is due in about ${hours} hour${hours === 1 ? "" : "s"}.`;
  return `All caught up. The next review is due in ${Math.round(hours / 24)} days.`;
}

function ReviewCard({
  cardKeyId,
  position,
  remaining,
  onDone,
  onSkip,
  onEnd,
}: {
  cardKeyId: string;
  position: number;
  remaining: number;
  onDone: (passed: boolean) => void;
  onSkip: () => void;
  onEnd: () => void;
}) {
  useImmersive();
  const card = useApp((s) => s.cards[cardKeyId]);
  const recordReview = useApp((s) => s.recordReview);
  const opening = card ? getOpening(card.openingId) : undefined;
  const tree = opening ? treeFor(opening) : undefined;
  const [state, setState] = useState<ReviewCardState | null>(() =>
    tree && card ? startReviewCard(tree, card.normFen, card.lineIds) : null,
  );
  const [replayed, setReplayed] = useState(0);

  // Content can change between versions; skip cards whose position no longer exists.
  const skipped = useRef(false);
  useEffect(() => {
    if (!state && !skipped.current) {
      skipped.current = true;
      onSkip();
    }
  }, [state, onSkip]);

  // Quickly replay the moves leading to the position for context.
  useEffect(() => {
    if (!state || state.phase !== "replaying") return;
    if (replayed >= state.contextPath.length - 1) {
      setState((s) => (s ? { ...s, phase: "user" } : s));
      return;
    }
    const t = setTimeout(() => setReplayed((r) => r + 1), REPLAY_MS);
    return () => clearTimeout(t);
  }, [state, replayed]);

  if (!state || !tree || !card || !opening) return null;

  const shownId = state.phase === "answered" ? state.answeredNodeId! : state.contextPath[Math.min(replayed, state.contextPath.length - 1)];
  const shown = getNode(tree, shownId);
  const sans = [...state.contextPath.slice(1, replayed + 1), ...(state.answeredNodeId ? [state.answeredNodeId] : [])].map(
    (id) => getNode(tree, id).san!,
  );
  const lineName = opening.lines.find((l) => card.lineIds.includes(l.id))?.name;

  function onMove(m: BoardMove): boolean {
    if (!state || !tree) return false;
    const next = reviewUserMove(tree, state, m.san);
    setState(next);
    if (next.phase === "answered") recordReview(cardKeyId, !!next.passed);
    return next.phase === "answered";
  }

  const answered = state.phase === "answered" ? getNode(tree, state.answeredNodeId!) : undefined;
  const comment = answered ? commentFor(answered, card.color) : undefined;

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 style={{ fontSize: "1.2rem", margin: 0 }}>Review</h1>
        <div className="row">
          <span className="small muted">
            {position} · {remaining} left
          </span>
          <button className="btn" onClick={onEnd}>
            End session
          </button>
        </div>
      </div>
      <ProgressBar value={(position - 1) / (position - 1 + remaining)} label="Session progress" />
      <div className="trainer">
        <div className="trainer__board">
          <Board
            id="review-board"
            position={shown.fen}
            orientation={card.color === "w" ? "white" : "black"}
            movableColor={state.phase === "user" ? card.color : undefined}
            onMove={state.phase === "user" ? onMove : undefined}
            lastMove={shown.from ? { from: shown.from, to: shown.to! } : undefined}
            hintSquare={state.hintSquare}
            correctSquare={state.correctSquare}
            arrows={state.answer ? [[state.answer.from, state.answer.to]] : undefined}
            shakeKey={state.missCount}
          />
        </div>
        <div className="trainer__panel">
          <p className="small muted" style={{ margin: 0 }}>
            {opening.name}
            {lineName ? ` · ${lineName}` : ""} · you play {colorName(card.color)}
          </p>
          {state.phase === "replaying" && (
            <div className="feedback feedback--info" role="status">
              Replaying the moves so far…
            </div>
          )}
          {state.phase === "user" && !state.feedback && (
            <div className="feedback feedback--info" role="status">
              What does {colorName(card.color)} play here?
            </div>
          )}
          <FeedbackBanner feedback={state.feedback} />
          {answered && (
            <div className="card">
              <div className="explain__move">
                {moveNumberLabel(answered.ply - 1)} {answered.san}
              </div>
              {comment && <RichText text={comment} />}
            </div>
          )}
          {state.phase === "answered" && (
            <button className="btn btn--primary btn--block" onClick={() => onDone(!!state.passed)} autoFocus>
              Next
            </button>
          )}
          <MoveList sans={sans} current={sans.length} userColor={card.color} />
          {state.phase === "replaying" && (
            <button className="btn" onClick={() => setReplayed(state.contextPath.length - 1)}>
              Skip replay
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
