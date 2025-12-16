export type Grid = boolean[][];

export interface LifeGameState {
  grid: Grid;
  generation: number;
  isRunning: boolean;
  speed: "slow" | "medium" | "fast";
  gridSize: { width: number; height: number };
}

export const SPEED_MS: Record<LifeGameState["speed"], number> = {
  slow: 500,
  medium: 200,
  fast: 50,
};

export function createEmptyGrid(width: number, height: number): Grid {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => false)
  );
}

export function createRandomGrid(width: number, height: number, density: number = 0.3): Grid {
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => Math.random() < density)
  );
}

export function createInitialState(
  gridWidth: number = 40,
  gridHeight: number = 30
): LifeGameState {
  return {
    grid: createEmptyGrid(gridWidth, gridHeight),
    generation: 0,
    isRunning: false,
    speed: "medium",
    gridSize: { width: gridWidth, height: gridHeight },
  };
}

function countNeighbors(grid: Grid, x: number, y: number): number {
  const height = grid.length;
  const width = grid[0].length;
  let count = 0;

  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;

      const ny = (y + dy + height) % height;
      const nx = (x + dx + width) % width;

      if (grid[ny][nx]) count++;
    }
  }

  return count;
}

export function nextGeneration(grid: Grid): Grid {
  const height = grid.length;
  const width = grid[0].length;

  return grid.map((row, y) =>
    row.map((cell, x) => {
      const neighbors = countNeighbors(grid, x, y);

      if (cell) {
        // Cell is alive: survives with 2 or 3 neighbors
        return neighbors === 2 || neighbors === 3;
      } else {
        // Cell is dead: becomes alive with exactly 3 neighbors
        return neighbors === 3;
      }
    })
  );
}

export function toggleCell(grid: Grid, x: number, y: number): Grid {
  return grid.map((row, ry) =>
    row.map((cell, rx) => (rx === x && ry === y ? !cell : cell))
  );
}

export function stepGeneration(state: LifeGameState): LifeGameState {
  return {
    ...state,
    grid: nextGeneration(state.grid),
    generation: state.generation + 1,
  };
}

export function setCell(state: LifeGameState, x: number, y: number): LifeGameState {
  return {
    ...state,
    grid: toggleCell(state.grid, x, y),
  };
}

export function clearGrid(state: LifeGameState): LifeGameState {
  return {
    ...state,
    grid: createEmptyGrid(state.gridSize.width, state.gridSize.height),
    generation: 0,
  };
}

export function randomizeGrid(state: LifeGameState, density: number = 0.3): LifeGameState {
  return {
    ...state,
    grid: createRandomGrid(state.gridSize.width, state.gridSize.height, density),
    generation: 0,
  };
}

export function setSpeed(state: LifeGameState, speed: LifeGameState["speed"]): LifeGameState {
  return { ...state, speed };
}

export function toggleRunning(state: LifeGameState): LifeGameState {
  return { ...state, isRunning: !state.isRunning };
}

// Preset Patterns
export interface Pattern {
  name: string;
  cells: [number, number][];
}

export const PATTERNS: Pattern[] = [
  {
    name: "Glider",
    cells: [
      [1, 0],
      [2, 1],
      [0, 2],
      [1, 2],
      [2, 2],
    ],
  },
  {
    name: "Blinker",
    cells: [
      [0, 1],
      [1, 1],
      [2, 1],
    ],
  },
  {
    name: "Beacon",
    cells: [
      [0, 0],
      [1, 0],
      [0, 1],
      [3, 2],
      [2, 3],
      [3, 3],
    ],
  },
  {
    name: "Pulsar",
    cells: [
      [2, 0], [3, 0], [4, 0], [8, 0], [9, 0], [10, 0],
      [0, 2], [5, 2], [7, 2], [12, 2],
      [0, 3], [5, 3], [7, 3], [12, 3],
      [0, 4], [5, 4], [7, 4], [12, 4],
      [2, 5], [3, 5], [4, 5], [8, 5], [9, 5], [10, 5],
      [2, 7], [3, 7], [4, 7], [8, 7], [9, 7], [10, 7],
      [0, 8], [5, 8], [7, 8], [12, 8],
      [0, 9], [5, 9], [7, 9], [12, 9],
      [0, 10], [5, 10], [7, 10], [12, 10],
      [2, 12], [3, 12], [4, 12], [8, 12], [9, 12], [10, 12],
    ],
  },
  {
    name: "Gosper Glider Gun",
    cells: [
      [24, 0],
      [22, 1], [24, 1],
      [12, 2], [13, 2], [20, 2], [21, 2], [34, 2], [35, 2],
      [11, 3], [15, 3], [20, 3], [21, 3], [34, 3], [35, 3],
      [0, 4], [1, 4], [10, 4], [16, 4], [20, 4], [21, 4],
      [0, 5], [1, 5], [10, 5], [14, 5], [16, 5], [17, 5], [22, 5], [24, 5],
      [10, 6], [16, 6], [24, 6],
      [11, 7], [15, 7],
      [12, 8], [13, 8],
    ],
  },
];

export function applyPattern(
  state: LifeGameState,
  pattern: Pattern,
  offsetX: number = 5,
  offsetY: number = 5
): LifeGameState {
  const newGrid = createEmptyGrid(state.gridSize.width, state.gridSize.height);

  pattern.cells.forEach(([x, y]) => {
    const px = x + offsetX;
    const py = y + offsetY;
    if (px >= 0 && px < state.gridSize.width && py >= 0 && py < state.gridSize.height) {
      newGrid[py][px] = true;
    }
  });

  return {
    ...state,
    grid: newGrid,
    generation: 0,
  };
}
