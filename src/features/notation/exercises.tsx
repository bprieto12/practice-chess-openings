import { Chess } from "chess.js";
import { useEffect, useMemo, useState } from "react";
import type { BoardPosition } from "react-chessboard/dist/chessboard/types";
import { Board, type BoardMove } from "../../components/Board";
import { FeedbackBanner, RichText } from "../../components/ui";
import type { Exercise } from "../../content/notation";
import { positionFrom } from "../../content/notation/validate";
import { makeDistractors } from "../../lib/distractors";
import type { Feedback } from "../../lib/trainer";

const FILES = "abcdefgh";
const PIECES: { letter: string; type: string; name: string }[] = [
  { letter: "K", type: "K", name: "king" },
  { letter: "Q", type: "Q", name: "queen" },
  { letter: "R", type: "R", name: "rook" },
  { letter: "B", type: "B", name: "bishop" },
  { letter: "N", type: "N", name: "knight" },
  { letter: "No letter", type: "P", name: "pawn" },
];

export const randomSquare = () => `${FILES[Math.floor(Math.random() * 8)]}${Math.floor(Math.random() * 8) + 1}`;

function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

/** One scored step of a lesson. Generated exercise types expand into several items. */
export type Item =
  | { kind: "find-square"; square: string }
  | { kind: "name-square"; square: string; options: string[] }
  | { kind: "piece-letter"; square: string; piece: (typeof PIECES)[number]; color: "w" | "b" }
  | { kind: "play-move"; fen: string; san: string; prompt?: string }
  | { kind: "write-move"; fen: string; san: string; from: string; to: string; options: string[] }
  | { kind: "follow-game"; title: string; moves: string[] }
  | { kind: "choice"; question: string; options: string[]; answer: string; explanation?: string };

export function expand(exercises: Exercise[]): Item[] {
  const items: Item[] = [];
  for (const ex of exercises) {
    switch (ex.type) {
      case "find-square": {
        for (let i = 0; i < ex.count; i++) items.push({ kind: "find-square", square: randomSquare() });
        break;
      }
      case "name-square": {
        for (let i = 0; i < ex.count; i++) {
          const sq = randomSquare();
          const wrong = new Set<string>();
          // Distractors: neighbors and mirrored squares, the usual mix-ups.
          const f = FILES.indexOf(sq[0]);
          const r = Number(sq[1]);
          for (const cand of [`${FILES[7 - f]}${r}`, `${sq[0]}${9 - r}`, `${FILES[(f + 1) % 8]}${r}`, `${sq[0]}${(r % 8) + 1}`, randomSquare()]) {
            if (cand !== sq) wrong.add(cand);
          }
          items.push({ kind: "name-square", square: sq, options: shuffle([sq, ...[...wrong].slice(0, 3)]) });
        }
        break;
      }
      case "piece-letter": {
        const order = shuffle([...PIECES, ...PIECES]).slice(0, ex.count);
        for (const piece of order) {
          let sq = randomSquare();
          // Pawns can't stand on the first or last rank.
          while (piece.type === "P" && (sq[1] === "1" || sq[1] === "8")) sq = randomSquare();
          items.push({ kind: "piece-letter", square: sq, piece, color: Math.random() < 0.5 ? "w" : "b" });
        }
        break;
      }
      case "play-move": {
        items.push({ kind: "play-move", fen: positionFrom(ex).fen(), san: ex.san, prompt: ex.prompt });
        break;
      }
      case "write-move": {
        const c = positionFrom(ex);
        const fen = c.fen();
        const m = c.move(ex.san);
        const distractors = ex.distractors ?? makeDistractors(ex.san, m);
        items.push({ kind: "write-move", fen, san: ex.san, from: m.from, to: m.to, options: shuffle([ex.san, ...distractors.slice(0, 3)]) });
        break;
      }
      case "follow-game":
        items.push({ kind: "follow-game", title: ex.title, moves: ex.moves });
        break;
      case "choice":
        items.push({ kind: "choice", question: ex.question, options: shuffle(ex.options), answer: ex.answer, explanation: ex.explanation });
        break;
    }
  }
  return items;
}

export function itemMax(item: Item) {
  return item.kind === "follow-game" ? item.moves.length : 1;
}

export interface ItemProps<K extends Item["kind"]> {
  item: Extract<Item, { kind: K }>;
  /** Called once the item is finished, with first-try points earned. */
  onComplete: (points: number) => void;
}

function Continue({ onClick, label = "Continue" }: { onClick: () => void; label?: string }) {
  return (
    <button className="btn btn--primary btn--block" onClick={onClick} autoFocus>
      {label}
    </button>
  );
}

function Options({
  options,
  answer,
  picked,
  onPick,
  mono = false,
}: {
  options: string[];
  answer: string;
  picked?: string;
  onPick: (o: string) => void;
  mono?: boolean;
}) {
  return (
    <div className="options" role="group" aria-label="Answers">
      {options.map((o) => {
        const state = picked === undefined ? "" : o === answer ? " option--right" : o === picked ? " option--wrong" : "";
        return (
          <button
            key={o}
            type="button"
            className={`btn option${state}${mono ? " option--mono" : ""}`}
            disabled={picked !== undefined}
            onClick={() => onPick(o)}
          >
            {mono ? o : <RichText text={o} inline />}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------

export function FindSquare({ item, onComplete, hideCoordinates }: ItemProps<"find-square"> & { hideCoordinates: boolean }) {
  const [tapped, setTapped] = useState<string>();
  const right = tapped === item.square;
  useEffect(() => {
    if (!right) return;
    const t = setTimeout(() => onComplete(1), 600);
    return () => clearTimeout(t);
  }, [right, onComplete]);
  return (
    <ExerciseLayout
      prompt={
        <>
          Tap the square <code>{item.square}</code>
        </>
      }
      board={
        <Board
          id="ex-board"
          position={{}}
          showCoordinates={!hideCoordinates}
          onSquareTap={(sq) => tapped === undefined && setTapped(sq)}
          correctSquare={tapped ? item.square : undefined}
          wrongSquare={tapped && !right ? tapped : undefined}
        />
      }
    >
      {tapped && (
        <FeedbackBanner
          feedback={right ? { tone: "good", text: `Yes, that's ${item.square}.` } : { tone: "bad", text: `That was ${tapped}. ${item.square} is shown in green.` }}
        />
      )}
      {tapped && !right && <Continue onClick={() => onComplete(0)} />}
    </ExerciseLayout>
  );
}

export function NameSquare({ item, onComplete }: ItemProps<"name-square">) {
  const [picked, setPicked] = useState<string>();
  return (
    <ExerciseLayout
      prompt="What is the name of the highlighted square?"
      board={<Board id="ex-board" position={{}} showCoordinates={false} highlights={[item.square]} />}
    >
      <Options options={item.options} answer={item.square} picked={picked} onPick={setPicked} mono />
      {picked && (
        <>
          <FeedbackBanner feedback={picked === item.square ? { tone: "good", text: "Correct." } : { tone: "bad", text: `It's ${item.square}.` }} />
          <Continue onClick={() => onComplete(picked === item.square ? 1 : 0)} />
        </>
      )}
    </ExerciseLayout>
  );
}

export function PieceLetter({ item, onComplete }: ItemProps<"piece-letter">) {
  const [picked, setPicked] = useState<string>();
  const position = useMemo<BoardPosition>(
    () => ({ [item.square]: `${item.color}${item.piece.type}` }) as BoardPosition,
    [item],
  );
  const answer = item.piece.letter;
  return (
    <ExerciseLayout prompt="Which letter stands for this piece?" board={<Board id="ex-board" position={position} highlights={[item.square]} />}>
      <Options options={PIECES.map((p) => p.letter)} answer={answer} picked={picked} onPick={setPicked} mono />
      {picked && (
        <>
          <FeedbackBanner
            feedback={
              picked === answer
                ? { tone: "good", text: `Right: the ${item.piece.name}${item.piece.type === "P" ? " has no letter" : ` is ${answer}`}.` }
                : { tone: "bad", text: `That's a ${item.piece.name}: ${item.piece.type === "P" ? "pawns have no letter" : answer}.` }
            }
          />
          <Continue onClick={() => onComplete(picked === answer ? 1 : 0)} />
        </>
      )}
    </ExerciseLayout>
  );
}

export function PlayMove({ item, onComplete }: ItemProps<"play-move">) {
  const [misses, setMisses] = useState(0);
  const [done, setDone] = useState<{ fen: string; from: string; to: string } | null>(null);
  const [feedback, setFeedback] = useState<Feedback>();
  const target = useMemo(() => new Chess(item.fen).move(item.san), [item]);
  const color = item.fen.split(" ")[1] as "w" | "b";

  function onMove(m: BoardMove) {
    if (m.san === item.san) {
      const c = new Chess(item.fen);
      c.move(m.san);
      setDone({ fen: c.fen(), from: m.from, to: m.to });
      setFeedback({ tone: "good", text: `\`${item.san}\` is right.` });
      return true;
    }
    setMisses((n) => n + 1);
    setFeedback({ tone: "bad", text: `You played \`${m.san}\`. Try again: \`${item.san}\`.` });
    return false;
  }

  return (
    <ExerciseLayout
      prompt={
        <>
          {color === "w" ? "White" : "Black"} to move. Play <code>{item.san}</code>
          {item.prompt && <div className="small muted">{item.prompt}</div>}
        </>
      }
      board={
        <Board
          id="ex-board"
          position={done?.fen ?? item.fen}
          orientation={color === "w" ? "white" : "black"}
          movableColor={done ? undefined : color}
          onMove={done ? undefined : onMove}
          lastMove={done ? { from: done.from, to: done.to } : undefined}
          hintSquare={!done && misses >= 1 ? target.from : undefined}
          arrows={!done && misses >= 2 ? [[target.from, target.to]] : undefined}
          shakeKey={misses}
        />
      }
    >
      <FeedbackBanner feedback={feedback} />
      {done && <Continue onClick={() => onComplete(misses === 0 ? 1 : 0)} />}
    </ExerciseLayout>
  );
}

export function WriteMove({ item, onComplete, typing }: ItemProps<"write-move"> & { typing: boolean }) {
  const [shown, setShown] = useState(false);
  const [picked, setPicked] = useState<string>();
  const after = useMemo(() => {
    const c = new Chess(item.fen);
    c.move(item.san);
    return c.fen();
  }, [item]);
  const color = item.fen.split(" ")[1] as "w" | "b";
  return (
    <ExerciseLayout
      prompt="How is this move written?"
      board={
        <Board
          id="ex-board"
          position={shown ? after : item.fen}
          orientation={color === "w" ? "white" : "black"}
          lastMove={shown ? { from: item.from, to: item.to } : undefined}
          arrows={shown ? [[item.from, item.to]] : undefined}
        />
      }
    >
      {!shown && <p className="muted small">Watch the move…</p>}
      {shown && !typing && <Options options={item.options} answer={item.san} picked={picked} onPick={setPicked} mono />}
      {shown && typing && picked === undefined && <Keypad onSubmit={setPicked} />}
      {picked !== undefined && (
        <>
          <FeedbackBanner
            feedback={picked === item.san ? { tone: "good", text: `Correct: \`${item.san}\`.` } : { tone: "bad", text: `It's written \`${item.san}\`${typing ? ` (you wrote \`${picked || "nothing"}\`)` : ""}.` }}
          />
          <Continue onClick={() => onComplete(picked === item.san ? 1 : 0)} />
        </>
      )}
      {shown && picked === undefined && (
        <button className="btn" onClick={() => setShown(false)}>
          Show the move again
        </button>
      )}
      <ReplayEffect shown={shown} setShown={setShown} />
    </ExerciseLayout>
  );
}

/** Plays the move shortly after the item appears, and again after "Show the move again". */
function ReplayEffect({ shown, setShown }: { shown: boolean; setShown: (v: boolean) => void }) {
  useEffect(() => {
    if (shown) return;
    const t = setTimeout(() => setShown(true), 700);
    return () => clearTimeout(t);
  }, [shown, setShown]);
  return null;
}

const KEYS = ["K", "Q", "R", "B", "N", "x", "+", "#", "=", "O-O", "-O", "a", "b", "c", "d", "e", "f", "g", "h", "1", "2", "3", "4", "5", "6", "7", "8"];

function Keypad({ onSubmit }: { onSubmit: (s: string) => void }) {
  const [text, setText] = useState("");
  return (
    <div className="stack">
      <div className="keypad__display" aria-live="polite" aria-label="Your answer">
        {text || <span className="muted">Type the move</span>}
      </div>
      <div className="keypad" role="group" aria-label="Notation keypad">
        {KEYS.map((k) => (
          <button key={k} type="button" className="btn keypad__key" onClick={() => setText((t) => t + k)}>
            {k}
          </button>
        ))}
        <button type="button" className="btn keypad__key" onClick={() => setText((t) => t.slice(0, -1))} aria-label="Delete">
          ⌫
        </button>
      </div>
      <button className="btn btn--primary btn--block" onClick={() => onSubmit(text)} disabled={!text}>
        Check
      </button>
    </div>
  );
}

export function FollowGame({ item, onComplete }: ItemProps<"follow-game">) {
  const [ply, setPly] = useState(0);
  const [missed, setMissed] = useState<Set<number>>(new Set());
  const [misses, setMisses] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>();
  const fens = useMemo(() => {
    const c = new Chess();
    const out = [c.fen()];
    const moves = [];
    for (const m of item.moves) {
      moves.push(c.move(m));
      out.push(c.fen());
    }
    return { out, moves };
  }, [item]);
  const done = ply === item.moves.length;
  const next = fens.moves[ply];
  const last = ply > 0 ? fens.moves[ply - 1] : undefined;
  const turn = ply % 2 === 0 ? "w" : "b";

  function onMove(m: BoardMove) {
    if (m.san === item.moves[ply]) {
      setPly(ply + 1);
      setMisses(0);
      setFeedback(undefined);
      return true;
    }
    setMissed((s) => new Set(s).add(ply));
    setMisses((n) => n + 1);
    setFeedback({ tone: "bad", text: `You played \`${m.san}\`. The next move is \`${item.moves[ply]}\`.` });
    return false;
  }

  return (
    <ExerciseLayout
      prompt={
        <>
          <RichText text={item.title} inline />
          <div className="small muted">Play every move, for both sides.</div>
        </>
      }
      board={
        <Board
          id="ex-board"
          position={fens.out[ply]}
          movableColor={done ? undefined : turn}
          onMove={done ? undefined : onMove}
          lastMove={last ? { from: last.from, to: last.to } : undefined}
          hintSquare={!done && misses >= 1 ? next.from : undefined}
          arrows={!done && misses >= 2 ? [[next.from, next.to]] : undefined}
          shakeKey={missed.size + misses}
        />
      }
    >
      <p className="followgame" aria-label="Game moves">
        {item.moves.map((san, i) => (
          <span key={i} className={`followgame__move${i === ply ? " followgame__move--next" : ""}${i < ply ? " followgame__move--done" : ""}`}>
            {i % 2 === 0 ? `${i / 2 + 1}. ` : ""}
            {san}
          </span>
        ))}
      </p>
      {!done && (
        <div className="feedback feedback--info" role="status">
          Next: {turn === "w" ? "White" : "Black"} plays <code>{item.moves[ply]}</code>
        </div>
      )}
      <FeedbackBanner feedback={feedback} />
      {done && (
        <>
          <FeedbackBanner feedback={{ tone: "good", text: `Game complete. ${item.moves.length - missed.size}/${item.moves.length} moves right first try.` }} />
          <Continue onClick={() => onComplete(item.moves.length - missed.size)} />
        </>
      )}
    </ExerciseLayout>
  );
}

export function Choice({ item, onComplete }: ItemProps<"choice">) {
  const [picked, setPicked] = useState<string>();
  return (
    <ExerciseLayout prompt={<RichText text={item.question} inline />}>
      <Options options={item.options} answer={item.answer} picked={picked} onPick={setPicked} />
      {picked && (
        <>
          <FeedbackBanner
            feedback={
              picked === item.answer
                ? { tone: "good", text: item.explanation ?? "Correct." }
                : { tone: "bad", text: `The answer is: ${item.answer}.${item.explanation ? ` ${item.explanation}` : ""}` }
            }
          />
          <Continue onClick={() => onComplete(picked === item.answer ? 1 : 0)} />
        </>
      )}
    </ExerciseLayout>
  );
}

function ExerciseLayout({ prompt, board, children }: { prompt: React.ReactNode; board?: React.ReactNode; children?: React.ReactNode }) {
  // The prompt sits above the board so it's visible on small phones without scrolling.
  return (
    <div className="stack">
      <div className="card exercise__prompt">{prompt}</div>
      <div className={board ? "trainer" : "stack"}>
        {board && <div className="trainer__board">{board}</div>}
        <div className="trainer__panel">{children}</div>
      </div>
    </div>
  );
}
