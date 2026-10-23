import { Chess, type Square as CjsSquare } from "chess.js";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Chessboard } from "react-chessboard";
import type { Arrow, BoardPosition, PromotionPieceOption, Square } from "react-chessboard/dist/chessboard/types";
import { useApp } from "../store";
import type { BoardTheme } from "../lib/storage";
import "./Board.css";

export interface BoardMove {
  from: string;
  to: string;
  promotion?: string;
  san: string;
}

export interface BoardProps {
  /** FEN, or a position object for diagrams that aren't legal positions. */
  position: string | BoardPosition;
  orientation?: "white" | "black";
  /** When set, the user may move pieces of this color (only if it's that side's turn). */
  movableColor?: "w" | "b";
  /** Return false to reject a legal move: it's shown briefly, then taken back. */
  onMove?: (move: BoardMove) => boolean;
  /** For exercises that only need a square tap (e.g. "find the square"). */
  onSquareTap?: (square: string) => void;
  lastMove?: { from: string; to: string };
  hintSquare?: string;
  correctSquare?: string;
  wrongSquare?: string;
  highlights?: string[];
  arrows?: [string, string][];
  /** Change this number to replay the "wrong move" shake. */
  shakeKey?: number;
  showCoordinates?: boolean;
  /** Text announced to screen readers when it changes. */
  announcement?: string;
  id?: string;
}

const THEMES: Record<BoardTheme, { light: string; dark: string }> = {
  green: { light: "#eeeed2", dark: "#769656" },
  brown: { light: "#f0d9b5", dark: "#b58863" },
  blue: { light: "#dee3e6", dark: "#8ca2ad" },
};

const FILES = "abcdefgh";
const PIECE_NAMES: Record<string, string> = { p: "pawn", n: "knight", b: "bishop", r: "rook", q: "queen", k: "king" };

function safeChess(position: string | BoardPosition): Chess | null {
  if (typeof position !== "string") return null;
  try {
    return new Chess(position);
  } catch {
    return null;
  }
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export function Board({
  position,
  orientation = "white",
  movableColor,
  onMove,
  onSquareTap,
  lastMove,
  hintSquare,
  correctSquare,
  wrongSquare,
  highlights,
  arrows,
  shakeKey,
  showCoordinates,
  announcement,
  id = "board",
}: BoardProps) {
  const settings = useApp((s) => s.settings);
  const theme = THEMES[settings.boardTheme];
  const coords = showCoordinates ?? settings.showCoordinates;
  const animation =
    settings.animationSpeed === "off" || prefersReducedMotion() ? 0 : settings.animationSpeed === "fast" ? 100 : 200;

  // A rejected move is shown briefly at this position before snapping back.
  const [tempFen, setTempFen] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [promotion, setPromotion] = useState<{ from: string; to: string } | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [shaking, setShaking] = useState(false);
  const tempTimer = useRef<ReturnType<typeof setTimeout>>();

  const shown = tempFen ?? position;
  const chess = useMemo(() => safeChess(position), [position]);
  // Moves are allowed by the rules of the drill; dragging also waits for a rejected move to snap back.
  const allowed = !!onMove && !!chess && !!movableColor && chess.turn() === movableColor;
  const canMove = allowed && !tempFen;

  useEffect(() => {
    setSelected(null);
    setPromotion(null);
  }, [position]);

  useEffect(() => () => clearTimeout(tempTimer.current), []);

  useEffect(() => {
    if (!shakeKey) return;
    setShaking(true);
    const t = setTimeout(() => setShaking(false), 400);
    return () => clearTimeout(t);
  }, [shakeKey]);

  const legalFrom = (sq: string) =>
    chess && allowed ? chess.moves({ square: sq as CjsSquare, verbose: true }) : [];

  function attempt(from: string, to: string, promo?: string): boolean {
    if (!chess || !onMove) return false;
    const candidate = chess
      .moves({ verbose: true })
      .find((m) => m.from === from && m.to === to && (!m.promotion || m.promotion === (promo ?? "q")));
    if (!candidate) return false;
    const accepted = onMove({ from, to, promotion: candidate.promotion, san: candidate.san });
    if (!accepted) {
      const after = new Chess(chess.fen());
      after.move({ from, to, promotion: candidate.promotion });
      setTempFen(after.fen());
      clearTimeout(tempTimer.current);
      tempTimer.current = setTimeout(() => setTempFen(null), 450);
    }
    setSelected(null);
    return accepted;
  }

  function needsPromotion(from: string, to: string) {
    return legalFrom(from).some((m) => m.to === to && m.promotion);
  }

  function handleSquare(sq: string) {
    if (onSquareTap) {
      onSquareTap(sq);
      return;
    }
    if (!allowed || !chess) return;
    if (tempFen) {
      // A tap during the snap-back cancels it so quick players aren't ignored.
      clearTimeout(tempTimer.current);
      setTempFen(null);
    }
    if (selected && selected !== sq) {
      const targets = legalFrom(selected);
      if (targets.some((m) => m.to === sq)) {
        if (needsPromotion(selected, sq)) {
          setPromotion({ from: selected, to: sq });
          return;
        }
        attempt(selected, sq);
        return;
      }
    }
    const piece = chess.get(sq as CjsSquare);
    if (piece && piece.color === movableColor && sq !== selected) setSelected(sq);
    else setSelected(null);
  }

  function onKeyDown(e: KeyboardEvent) {
    const cur = cursor ?? (orientation === "white" ? "e2" : "e7");
    let f = FILES.indexOf(cur[0]);
    let r = Number(cur[1]);
    const flip = orientation === "black" ? -1 : 1;
    switch (e.key) {
      case "ArrowUp": r += flip; break;
      case "ArrowDown": r -= flip; break;
      case "ArrowLeft": f -= flip; break;
      case "ArrowRight": f += flip; break;
      case "Enter":
      case " ":
        e.preventDefault();
        handleSquare(cur);
        setCursor(cur);
        return;
      case "Escape":
        setSelected(null);
        return;
      default:
        return;
    }
    e.preventDefault();
    f = Math.max(0, Math.min(7, f));
    r = Math.max(1, Math.min(8, r));
    setCursor(`${FILES[f]}${r}`);
  }

  const styles = useMemo(() => {
    const s: Record<string, Record<string, string | number>> = {};
    const add = (sq: string | undefined, style: Record<string, string | number>) => {
      if (!sq) return;
      s[sq] = { ...(s[sq] ?? {}), ...style };
    };
    if (lastMove && !tempFen) {
      add(lastMove.from, { backgroundColor: "rgba(255, 213, 0, 0.35)" });
      add(lastMove.to, { backgroundColor: "rgba(255, 213, 0, 0.45)" });
    }
    for (const h of highlights ?? []) add(h, { backgroundColor: "rgba(66, 135, 245, 0.45)" });
    if (chess && chess.inCheck()) {
      const king = chess
        .board()
        .flat()
        .find((p) => p && p.type === "k" && p.color === chess.turn());
      if (king) add(king.square, { background: "radial-gradient(circle, rgba(230,40,40,0.85) 0%, rgba(230,40,40,0.3) 55%, transparent 75%)" });
    }
    if (hintSquare) add(hintSquare, { boxShadow: "inset 0 0 0 4px rgba(66, 135, 245, 0.95)" });
    if (correctSquare) add(correctSquare, { backgroundColor: "rgba(46, 160, 67, 0.6)" });
    if (wrongSquare) add(wrongSquare, { backgroundColor: "rgba(220, 53, 69, 0.55)" });
    if (tempFen && promotion === null) {
      // The rejected move's destination flashes red.
      const diff = diffSquare(position, tempFen);
      if (diff) add(diff, { backgroundColor: "rgba(220, 53, 69, 0.55)" });
    }
    if (selected) {
      add(selected, { backgroundColor: "rgba(20, 85, 30, 0.5)" });
      for (const m of legalFrom(selected)) {
        const capture = !!chess?.get(m.to as CjsSquare);
        add(
          m.to,
          capture
            ? { background: "radial-gradient(transparent 0%, transparent 79%, rgba(20,85,30,0.35) 80%)" }
            : { background: "radial-gradient(rgba(20,85,30,0.35) 22%, transparent 24%)" },
        );
      }
    }
    if (cursor) add(cursor, { outline: "3px solid var(--focus)", outlineOffset: "-3px" });
    return s;
    // legalFrom depends on chess/canMove, both covered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastMove, highlights, chess, hintSquare, correctSquare, wrongSquare, tempFen, selected, cursor, allowed, position, promotion]);

  const arrowList: Arrow[] = (arrows ?? []).map(([a, b]) => [a as Square, b as Square, "rgba(46, 160, 67, 0.85)"]);

  const description = useMemo(() => describe(chess), [chess]);

  return (
    <div className={`board${shaking ? " board--shake" : ""}`}>
      <div
        className="board__frame"
        tabIndex={0}
        role="application"
        aria-label={`Chess board, ${orientation} at the bottom. Use arrow keys to move, Enter to select.`}
        aria-describedby={`${id}-desc`}
        onKeyDown={onKeyDown}
        onBlur={() => setCursor(null)}
      >
        <Chessboard
          id={id}
          position={shown}
          boardOrientation={orientation}
          showBoardNotation={coords}
          animationDuration={animation}
          arePiecesDraggable={canMove}
          isDraggablePiece={({ piece }) => canMove && piece[0] === movableColor}
          onPieceDrop={(from, to) => attempt(from, to)}
          onPieceDragBegin={(_p, sq) => setSelected(sq)}
          onPromotionCheck={(from, to) => needsPromotion(from, to)}
          onPromotionPieceSelect={(piece?: PromotionPieceOption, from?: Square, to?: Square) => {
            const f = from ?? promotion?.from;
            const t = to ?? promotion?.to;
            setPromotion(null);
            if (!piece || !f || !t) return false;
            return attempt(f, t, piece[1].toLowerCase());
          }}
          showPromotionDialog={!!promotion}
          promotionToSquare={(promotion?.to as Square) ?? null}
          onSquareClick={(sq) => handleSquare(sq)}
          customSquareStyles={styles}
          customArrows={arrowList}
          areArrowsAllowed={false}
          customLightSquareStyle={{ backgroundColor: theme.light }}
          customDarkSquareStyle={{ backgroundColor: theme.dark }}
          customBoardStyle={{ borderRadius: "6px", boxShadow: "0 2px 10px rgba(0,0,0,0.18)" }}
        />
      </div>
      <p id={`${id}-desc`} className="sr-only">
        {description}
      </p>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
    </div>
  );
}

function diffSquare(before: string | BoardPosition, after: string): string | undefined {
  if (typeof before !== "string") return undefined;
  try {
    const a = new Chess(before).board().flat();
    const b = new Chess(after).board().flat();
    for (let i = 0; i < 64; i++) {
      const x = a[i];
      const y = b[i];
      if (y && (!x || x.type !== y.type || x.color !== y.color)) return y.square;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function describe(chess: Chess | null): string {
  if (!chess) return "";
  const parts: Record<"w" | "b", string[]> = { w: [], b: [] };
  for (const p of chess.board().flat()) {
    if (p) parts[p.color].push(`${PIECE_NAMES[p.type]} ${p.square}`);
  }
  return `White: ${parts.w.join(", ")}. Black: ${parts.b.join(", ")}. ${chess.turn() === "w" ? "White" : "Black"} to move.`;
}
