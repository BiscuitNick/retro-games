import {
  createEmptyBoard,
  checkCollision,
  rotateMatrix,
  TETROMINOES,
  BOARD_WIDTH,
  BOARD_HEIGHT,
} from '@/lib/games/tetris';

describe('Tetris Game Logic', () => {
  describe('createEmptyBoard', () => {
    it('should create board with correct dimensions', () => {
      const board = createEmptyBoard();
      expect(board).toHaveLength(BOARD_HEIGHT);
      expect(board[0]).toHaveLength(BOARD_WIDTH);
      expect(board.every(row => row.every(cell => cell === null))).toBe(true);
    });
  });

  describe('rotateMatrix', () => {
    it('should rotate matrix 90 degrees clockwise', () => {
      const matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
      ];
      const expected = [
        [7, 4, 1],
        [8, 5, 2],
        [9, 6, 3]
      ];
      expect(rotateMatrix(matrix)).toEqual(expected);
    });
  });

  describe('checkCollision', () => {
    const board = createEmptyBoard();
    const shape = TETROMINOES.O.shape; // 2x2 box

    it('should return false for valid position', () => {
      expect(checkCollision(board, shape, { x: 0, y: 0 })).toBe(false);
    });

    it('should return true when out of bounds (left/right)', () => {
      expect(checkCollision(board, shape, { x: -1, y: 0 })).toBe(true);
      expect(checkCollision(board, shape, { x: BOARD_WIDTH, y: 0 })).toBe(true);
    });

    it('should return true when out of bounds (bottom)', () => {
      expect(checkCollision(board, shape, { x: 0, y: BOARD_HEIGHT })).toBe(true);
    });

    it('should return true when colliding with existing block', () => {
      board[5][5] = { type: 'I', color: 'blue' };
      // Shape is 2x2. If we place it at 4,4, it covers 4,4; 5,4; 4,5; 5,5.
      // 5,5 is occupied.
      expect(checkCollision(board, shape, { x: 4, y: 4 })).toBe(true);
    });
  });
});
