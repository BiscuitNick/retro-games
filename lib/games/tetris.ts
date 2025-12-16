export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export const TETROMINOES: Record<TetrominoType, { shape: number[][]; color: string }> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: 'bg-cyan-500',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: 'bg-blue-500',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: 'bg-orange-500',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: 'bg-yellow-500',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: 'bg-green-500',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: 'bg-purple-500',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: 'bg-red-500',
  },
};

export type CellValue = { type: TetrominoType; color: string } | null;
export type Board = CellValue[][];

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null)
  );
}

export function getRandomTetrominoType(): TetrominoType {
  const types = Object.keys(TETROMINOES) as TetrominoType[];
  return types[Math.floor(Math.random() * types.length)];
}

export function checkCollision(
  board: Board,
  shape: number[][],
  position: { x: number; y: number }
): boolean {
  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const boardX = position.x + x;
        const boardY = position.y + y;

        // Check bounds
        if (
          boardX < 0 ||
          boardX >= BOARD_WIDTH ||
          boardY >= BOARD_HEIGHT
        ) {
          return true;
        }

        // Check if cell is occupied (only if within vertical bounds)
        // We allow y < 0 for spawning above board, but collision checks usually happen when moving down/sideways into valid space
        if (boardY >= 0 && board[boardY][boardX]) {
          return true;
        }
      }
    }
  }
  return false;
}

export function rotateMatrix(matrix: number[][]): number[][] {
  const N = matrix.length;
  const rotated = matrix.map((row, i) =>
    row.map((val, j) => matrix[N - 1 - j][i])
  );
  return rotated;
}
