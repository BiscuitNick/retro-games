export type MinesweeperStatus = "ready" | "playing" | "won" | "lost";

export interface MinesweeperCell {
  x: number;
  y: number;
  isMine: boolean;
  adjacentMines: number;
  isRevealed: boolean;
  isFlagged: boolean;
}

export interface MinesweeperGameState {
  width: number;
  height: number;
  mines: number;
  cells: MinesweeperCell[];
  status: MinesweeperStatus;
  revealedCount: number;
  flaggedCount: number;
  startedAt: number | null;
  endedAt: number | null;
}

function clampMines(width: number, height: number, mines: number) {
  const max = Math.max(1, width * height - 1);
  return Math.max(1, Math.min(mines, max));
}

function indexOfCell(x: number, y: number, width: number) {
  return y * width + x;
}

function inBounds(x: number, y: number, width: number, height: number) {
  return x >= 0 && x < width && y >= 0 && y < height;
}

export function getCell(
  state: MinesweeperGameState,
  x: number,
  y: number
): MinesweeperCell | null {
  if (!inBounds(x, y, state.width, state.height)) return null;
  return state.cells[indexOfCell(x, y, state.width)];
}

export function createInitialState(
  width: number = 10,
  height: number = 10,
  mines: number = 15
): MinesweeperGameState {
  const safeWidth = Math.max(2, Math.floor(width));
  const safeHeight = Math.max(2, Math.floor(height));
  const safeMines = clampMines(safeWidth, safeHeight, Math.floor(mines));

  const cells: MinesweeperCell[] = [];
  for (let y = 0; y < safeHeight; y++) {
    for (let x = 0; x < safeWidth; x++) {
      cells.push({
        x,
        y,
        isMine: false,
        adjacentMines: 0,
        isRevealed: false,
        isFlagged: false,
      });
    }
  }

  return {
    width: safeWidth,
    height: safeHeight,
    mines: safeMines,
    cells,
    status: "ready",
    revealedCount: 0,
    flaggedCount: 0,
    startedAt: null,
    endedAt: null,
  };
}

function getNeighborCoords(
  x: number,
  y: number,
  width: number,
  height: number
): Array<{ x: number; y: number }> {
  const coords: Array<{ x: number; y: number }> = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (inBounds(nx, ny, width, height)) coords.push({ x: nx, y: ny });
    }
  }
  return coords;
}

function computeAdjacentCounts(cells: MinesweeperCell[], width: number, height: number) {
  for (const cell of cells) {
    if (cell.isMine) {
      cell.adjacentMines = 0;
      continue;
    }
    let count = 0;
    for (const n of getNeighborCoords(cell.x, cell.y, width, height)) {
      if (cells[indexOfCell(n.x, n.y, width)].isMine) count++;
    }
    cell.adjacentMines = count;
  }
}

function shuffle<T>(items: T[]) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function placeMines(
  state: MinesweeperGameState,
  firstX: number,
  firstY: number
): MinesweeperGameState {
  const { width, height, mines } = state;
  const firstIndex = indexOfCell(firstX, firstY, width);

  const excluded = new Set<number>([
    firstIndex,
    ...getNeighborCoords(firstX, firstY, width, height).map((c) =>
      indexOfCell(c.x, c.y, width)
    ),
  ]);

  const candidates: number[] = [];
  for (let i = 0; i < width * height; i++) {
    if (!excluded.has(i)) candidates.push(i);
  }

  const nextCells = state.cells.map((c) => ({ ...c, isMine: false, adjacentMines: 0 }));
  const shuffled = shuffle(candidates);
  const mineCount = Math.min(mines, shuffled.length);

  for (let i = 0; i < mineCount; i++) {
    nextCells[shuffled[i]].isMine = true;
  }

  computeAdjacentCounts(nextCells, width, height);
  return { ...state, cells: nextCells };
}

function revealFloodFill(state: MinesweeperGameState, startIndex: number) {
  const { width, height } = state;
  const nextCells = state.cells.map((c) => ({ ...c }));
  let revealedCount = state.revealedCount;

  const queue: number[] = [startIndex];
  const visited = new Set<number>();

  while (queue.length > 0) {
    const idx = queue.shift()!;
    if (visited.has(idx)) continue;
    visited.add(idx);

    const cell = nextCells[idx];
    if (cell.isRevealed || cell.isFlagged) continue;
    if (cell.isMine) continue;

    cell.isRevealed = true;
    revealedCount++;

    if (cell.adjacentMines !== 0) continue;

    for (const n of getNeighborCoords(cell.x, cell.y, width, height)) {
      queue.push(indexOfCell(n.x, n.y, width));
    }
  }

  return { nextCells, revealedCount };
}

export function revealCell(
  state: MinesweeperGameState,
  x: number,
  y: number
): MinesweeperGameState {
  if (!inBounds(x, y, state.width, state.height)) return state;
  if (state.status === "lost" || state.status === "won") return state;

  const idx = indexOfCell(x, y, state.width);
  const cell = state.cells[idx];
  if (cell.isRevealed || cell.isFlagged) return state;

  let nextState = state;
  if (state.status === "ready") {
    nextState = placeMines(state, x, y);
    nextState = { ...nextState, status: "playing", startedAt: Date.now(), endedAt: null };
  }

  const clickedCell = nextState.cells[idx];
  if (clickedCell.isMine) {
    const revealed = nextState.cells.map((c) =>
      c.isMine ? { ...c, isRevealed: true } : { ...c }
    );
    return { ...nextState, cells: revealed, status: "lost", endedAt: Date.now() };
  }

  const { nextCells, revealedCount } = revealFloodFill(nextState, idx);
  const totalSafe = nextState.width * nextState.height - nextState.mines;

  if (revealedCount >= totalSafe) {
    const finalCells = nextCells.map((c) =>
      c.isMine ? { ...c, isFlagged: true } : c
    );
    return {
      ...nextState,
      cells: finalCells,
      revealedCount,
      flaggedCount: nextState.mines,
      status: "won",
      endedAt: Date.now(),
    };
  }

  return { ...nextState, cells: nextCells, revealedCount };
}

export function toggleFlag(
  state: MinesweeperGameState,
  x: number,
  y: number
): MinesweeperGameState {
  if (!inBounds(x, y, state.width, state.height)) return state;
  if (state.status === "lost" || state.status === "won") return state;

  const idx = indexOfCell(x, y, state.width);
  const cell = state.cells[idx];
  if (cell.isRevealed) return state;

  const nextCells = state.cells.map((c, i) =>
    i === idx ? { ...c, isFlagged: !c.isFlagged } : c
  );
  const flaggedCount = state.flaggedCount + (cell.isFlagged ? -1 : 1);
  return { ...state, cells: nextCells, flaggedCount };
}

export function resetGame(
  width: number = 10,
  height: number = 10,
  mines: number = 15
): MinesweeperGameState {
  return createInitialState(width, height, mines);
}

