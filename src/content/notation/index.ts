import type { NotationLesson } from "./types";

export type { NotationLesson, Exercise, Screen } from "./types";

const OPERA_GAME = [
  "e4", "e5", "Nf3", "d6", "d4", "Bg4", "dxe5", "Bxf3", "Qxf3", "dxe5", "Bc4", "Nf6", "Qb3", "Qe7",
  "Nc3", "c6", "Bg5", "b5", "Nxb5", "cxb5", "Bxb5+", "Nbd7", "O-O-O", "Rd8", "Rxd7", "Rxd7", "Rd1",
  "Qe6", "Bxd7+", "Nxd7", "Qb8+", "Nxb8", "Rd8#",
];

const LEGAL_MATE = ["e4", "e5", "Nf3", "d6", "Bc4", "Bg4", "Nc3", "g6", "Nxe5", "Bxd1", "Bxf7+", "Ke7", "Nd5#"];

export const notationLessons: NotationLesson[] = [
  {
    id: "coordinates",
    number: 1,
    title: "The board's coordinates",
    summary: "Every square has a name, made of a letter and a number.",
    timedChallenge: true,
    screens: [
      {
        title: "Files and ranks",
        text:
          "The columns are called **files** and are lettered `a` to `h`, from White's left to right.\n\nThe rows are called **ranks** and are numbered `1` to `8`, starting from White's side.",
        showBoard: true,
        highlights: ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8"],
      },
      {
        title: "Naming a square",
        text:
          "A square's name is its file, then its rank. The highlighted square is `e4`: file e, rank 4.\n\nThis never changes. `e4` is the same square whether you play White or Black.",
        showBoard: true,
        highlights: ["e4"],
      },
      {
        title: "Setting up the board",
        text:
          "White's pieces start on ranks `1` and `2`, and Black's on ranks `7` and `8`.\n\nThe square in the bottom-right corner, `h1`, is always light: \"light on the right.\"",
        showBoard: true,
        setup: [],
        highlights: ["h1"],
      },
      {
        title: "From Black's side",
        text:
          "When you play Black the board is flipped, and `h8` is in your bottom-left corner. The names stay the same. Only your view changes.",
        showBoard: true,
        setup: [],
        orientation: "black",
        highlights: ["h8", "a8"],
      },
    ],
    exercises: [
      { type: "find-square", count: 10 },
      { type: "name-square", count: 6 },
    ],
  },
  {
    id: "pieces",
    number: 2,
    title: "Naming the pieces",
    summary: "Each piece except the pawn has a capital letter.",
    screens: [
      {
        title: "Piece letters",
        text:
          "`K` King · `Q` Queen · `R` Rook · `B` Bishop · `N` Knight\n\nThe knight is `N` because `K` is already taken by the king.",
        showBoard: true,
        fen: "4k3/8/8/8/8/8/8/RNBQKBNR w - - 0 1",
      },
      {
        title: "Pawns have no letter",
        text: "Pawns don't get a letter. A move with no capital letter is a pawn move: `e4` means a pawn moves to e4.",
        showBoard: true,
        setup: ["e4"],
        highlights: ["e4"],
      },
    ],
    exercises: [{ type: "piece-letter", count: 8 }],
  },
  {
    id: "writing-moves",
    number: 3,
    title: "Writing a move",
    summary: "The piece letter, then the square it moves to.",
    screens: [
      {
        title: "Piece + square",
        text:
          "A move is written as the piece letter followed by the destination square. `Nf3` means \"knight to f3\".\n\nYou don't write the square it came from. There's usually only one knight that can get there.",
        showBoard: true,
        setup: ["e4", "e5", "Nf3"],
        arrows: [["g1", "f3"]],
      },
      {
        title: "Pawn moves",
        text: "For a pawn, write just the destination square. `e4` means \"pawn to e4\", and `c5` means \"pawn to c5\".",
        showBoard: true,
        setup: ["e4", "c5"],
        arrows: [["c7", "c5"]],
      },
    ],
    exercises: [
      { type: "play-move", setup: [], san: "e4" },
      { type: "play-move", setup: ["e4", "e5"], san: "Nf3" },
      { type: "play-move", setup: ["e4", "e5", "Nf3", "Nc6"], san: "Bc4" },
      { type: "play-move", setup: ["e4"], san: "c5" },
      { type: "play-move", setup: ["d4", "d5"], san: "c4" },
      { type: "write-move", setup: ["e4", "e5"], san: "Nf3" },
      { type: "write-move", setup: ["d4", "Nf6"], san: "c4" },
      { type: "write-move", setup: ["e4", "e5", "Nf3", "Nc6"], san: "Bb5" },
      { type: "write-move", setup: ["e4", "c5", "Nf3"], san: "d6" },
      { type: "write-move", setup: ["d4", "d5", "c4", "e6"], san: "Nc3" },
    ],
  },
  {
    id: "captures",
    number: 4,
    title: "Captures",
    summary: "An x means a capture.",
    screens: [
      {
        title: "x marks a capture",
        text: "Put an `x` between the piece and the square when a piece captures. `Bxc6` means \"bishop takes on c6\".",
        showBoard: true,
        setup: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"],
        arrows: [["b5", "c6"]],
      },
      {
        title: "Pawn captures",
        text:
          "When a pawn captures, write the file it came from, then `x`, then the square. `exd5` means \"the e-pawn takes on d5\".",
        showBoard: true,
        setup: ["e4", "d5"],
        arrows: [["e4", "d5"]],
      },
    ],
    exercises: [
      { type: "play-move", setup: ["e4", "d5"], san: "exd5" },
      { type: "play-move", setup: ["e4", "d5", "exd5"], san: "Qxd5" },
      { type: "play-move", setup: ["e4", "e5", "Nf3", "Nc6", "d4"], san: "exd4" },
      { type: "play-move", setup: ["e4", "e5", "Nf3", "Nc6", "d4", "exd4"], san: "Nxd4" },
      { type: "write-move", setup: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"], san: "Bxc6" },
      { type: "write-move", setup: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Bxc6"], san: "dxc6" },
      { type: "write-move", setup: ["d4", "d5", "c4"], san: "dxc4" },
      { type: "write-move", setup: ["e4", "d5"], san: "exd5" },
    ],
  },
  {
    id: "check-mate-castling",
    number: 5,
    title: "Check, checkmate, castling",
    summary: "+ for check, # for checkmate, O-O and O-O-O for castling.",
    screens: [
      {
        title: "Check and checkmate",
        text:
          "Add `+` when a move gives check: `Bxf7+`.\n\nAdd `#` when a move is checkmate: `Qxf7#`. This is the Scholar's Mate.",
        showBoard: true,
        setup: ["e4", "e5", "Bc4", "Nc6", "Qh5", "Nf6", "Qxf7#"],
        arrows: [["h5", "f7"]],
      },
      {
        title: "Castling",
        text:
          "`O-O` is castling kingside (the short side). `O-O-O` is castling queenside (the long side).\n\nThese are capital letter O's. You'll sometimes see zeros (`0-0`) used instead.",
        showBoard: true,
        setup: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5", "O-O"],
        arrows: [["e1", "g1"]],
      },
    ],
    exercises: [
      { type: "play-move", setup: ["e4", "e5", "Nf3", "Nc6", "Bc4", "Bc5"], san: "O-O", prompt: "Castle kingside: tap the king, then g1." },
      { type: "play-move", setup: ["e4", "e5", "Nf3", "d6", "Bc4", "h6"], san: "Bxf7+" },
      { type: "play-move", setup: ["e4", "e5", "Bc4", "Nc6", "Qh5", "Nf6"], san: "Qxf7#" },
      { type: "play-move", setup: ["d4", "d5", "Nc3", "Nc6", "Bf4", "Bf5", "Qd2", "Qd7"], san: "O-O-O", prompt: "Castle queenside: tap the king, then c1." },
      { type: "write-move", setup: ["f3", "e5", "g4"], san: "Qh4#" },
      { type: "write-move", setup: ["e4", "e5", "Nf3", "Nf6", "Bc4", "Bc5", "O-O"], san: "O-O" },
      { type: "write-move", setup: ["e4", "d5", "exd5", "Qxd5", "Nc3"], san: "Qe5+" },
      {
        type: "choice",
        question: "What does `O-O-O` mean?",
        options: ["Castling queenside", "Castling kingside", "Three captures in a row", "A draw"],
        answer: "Castling queenside",
      },
    ],
  },
  {
    id: "promotion-disambiguation",
    number: 6,
    title: "Promotion & disambiguation",
    summary: "=Q for promotion, plus extra letters when two pieces could make the same move.",
    screens: [
      {
        title: "Promotion",
        text: "When a pawn reaches the last rank, write `=` and the new piece: `e8=Q` means \"the pawn moves to e8 and becomes a queen\".",
        showBoard: true,
        fen: "8/4P3/k7/8/8/8/8/4K3 w - - 0 1",
        arrows: [["e7", "e8"]],
      },
      {
        title: "Two pieces, one square",
        text:
          "If two pieces of the same kind can reach a square, add the file they came from: `Nbd2` means \"the knight on the b-file goes to d2\".\n\nIf they're on the same file, use the rank instead: `R1a3`.",
        showBoard: true,
        setup: ["d4", "d5", "Nf3", "Nf6"],
        arrows: [["b1", "d2"]],
        highlights: ["b1", "f3"],
      },
    ],
    exercises: [
      { type: "play-move", fen: "8/4P3/k7/8/8/8/8/4K3 w - - 0 1", san: "e8=Q", prompt: "Promote the pawn to a queen." },
      { type: "play-move", setup: ["d4", "d5", "Nf3", "Nf6"], san: "Nbd2" },
      { type: "play-move", fen: "7k/8/8/8/R7/8/8/R3K3 w - - 0 1", san: "R4a2" },
      { type: "write-move", fen: "3r3k/2P5/8/8/8/8/8/K7 w - - 0 1", san: "cxd8=Q+" },
      { type: "write-move", setup: ["e4", "e5", "Nc3", "Nc6"], san: "Nge2" },
      { type: "write-move", setup: ["d4", "d5", "c4", "e6", "Nc3", "Nf6", "Bg5"], san: "Nbd7" },
      { type: "write-move", fen: "7k/8/8/8/R7/8/8/R3K3 w - - 0 1", san: "R1a3" },
    ],
  },
  {
    id: "reading-games",
    number: 7,
    title: "Move numbers & reading a game",
    summary: "How moves are numbered, and how to follow a whole game.",
    screens: [
      {
        title: "Move numbers",
        text:
          "A \"move\" in chess is one move by White and one by Black. They share a number: `1. e4 e5` means White played e4 and Black answered e5.\n\n`2. Nf3 Nc6` is move two.",
        showBoard: true,
        setup: ["e4", "e5", "Nf3", "Nc6"],
      },
      {
        title: "Black's move on its own",
        text:
          "When a Black move is written on its own, it uses three dots: `3...a6` means \"Black's third move was a6\".",
        showBoard: true,
        setup: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6"],
        arrows: [["a7", "a6"]],
      },
    ],
    exercises: [
      {
        type: "choice",
        question: "In `1. e4 e5 2. Nf3 Nc6 3. Bb5 a6`, what was Black's second move?",
        options: ["Nc6", "Nf3", "e5", "a6"],
        answer: "Nc6",
      },
      {
        type: "choice",
        question: "What does `5...Be7` mean?",
        options: ["Black's fifth move was bishop to e7", "White's fifth move was bishop to e7", "A bishop moved five squares", "Bishop to e7 is a mistake"],
        answer: "Black's fifth move was bishop to e7",
      },
      {
        type: "follow-game",
        title: "Play this opening: 1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7",
        moves: ["e4", "e5", "Nf3", "Nc6", "Bb5", "a6", "Ba4", "Nf6", "O-O", "Be7"],
      },
      {
        type: "follow-game",
        title: "Légal's Mate (1750): 1. e4 e5 2. Nf3 d6 3. Bc4 Bg4 4. Nc3 g6 5. Nxe5 Bxd1 6. Bxf7+ Ke7 7. Nd5#",
        moves: LEGAL_MATE,
      },
    ],
  },
  {
    id: "annotations-formats",
    number: 8,
    title: "Annotations & other formats",
    summary: "! and ? marks, PGN files, figurines and long algebraic.",
    screens: [
      {
        title: "Annotation symbols",
        text:
          "Writers add symbols to judge moves:\n\n`!` good move · `!!` brilliant move · `?` mistake · `??` blunder · `!?` interesting move · `?!` dubious move",
      },
      {
        title: "Other formats",
        text:
          "**PGN** is the standard file format for chess games. It lists the players, event and result, then the moves in the notation you've learned.\n\n**Figurine notation** uses piece symbols instead of letters: `♘f3` is `Nf3`.\n\n**Long algebraic** writes both squares: `Ng1-f3` or `e2-e4`.",
      },
    ],
    exercises: [
      { type: "choice", question: "What does `??` mean?", options: ["A blunder", "A brilliant move", "An interesting move", "Checkmate"], answer: "A blunder" },
      { type: "choice", question: "What does `!?` mean?", options: ["An interesting move", "A mistake", "A blunder", "Check"], answer: "An interesting move" },
      { type: "choice", question: "`♗b5` is the same as…", options: ["Bb5", "Nb5", "b5", "Kb5"], answer: "Bb5" },
      { type: "choice", question: "In long algebraic, `e2-e4` is written in short algebraic as…", options: ["e4", "Pe4", "e2", "Ke4"], answer: "e4" },
      {
        type: "follow-game",
        title: "The Opera Game: Morphy vs Duke Karl & Count Isouard, Paris 1858",
        moves: OPERA_GAME,
      },
    ],
  },
];

export function getLesson(id: string): NotationLesson | undefined {
  return notationLessons.find((l) => l.id === id);
}
