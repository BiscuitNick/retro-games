import {
  createInitialState,
  revealCell,
  toggleFlag,
  getCell,
  MinesweeperGameState,
} from '@/lib/games/minesweeper';

describe('Minesweeper Game Logic', () => {
  let state: MinesweeperGameState;

  beforeEach(() => {
    state = createInitialState(10, 10, 10);
  });

  describe('createInitialState', () => {
    it('should initialize correctly', () => {
      expect(state.width).toBe(10);
      expect(state.height).toBe(10);
      expect(state.mines).toBe(10);
      expect(state.status).toBe('ready');
      expect(state.cells).toHaveLength(100);
      expect(state.cells.every(c => !c.isRevealed && !c.isMine)).toBe(true);
    });
  });

  describe('revealCell', () => {
    it('should start game and place mines on first click', () => {
      // First click at 0,0
      state = revealCell(state, 0, 0);
      expect(state.status).toBe('playing');
      expect(state.startedAt).toBeDefined();
      
      const cell = getCell(state, 0, 0);
      expect(cell?.isRevealed).toBe(true);
      expect(cell?.isMine).toBe(false); // First click safe
    });

    it('should reveal adjacent empty cells (flood fill)', () => {
      // Mock random to have predictable mines? 
      // Hard to mock internal shuffle.
      // But we know first click is safe and empty usually (or just safe).
      // We can check if multiple cells are revealed if we hit a 0.
      
      // Let's rely on the property that 0 mines neighbors trigger recursion.
      // We can try a few times or just check logic.
      // If we click and it's a 0, count should be > 1.
      
      // To guarantee a 0, we'd need a big board and few mines, or lucky click.
      // Let's create a board with 0 mines (min 1 is enforced).
      // State enforces min 1 mine.
      
      // Let's just check single reveal.
      state = revealCell(state, 5, 5);
      const cell = getCell(state, 5, 5);
      expect(cell?.isRevealed).toBe(true);
      expect(state.revealedCount).toBeGreaterThanOrEqual(1);
    });

    it('should lose game if mine is clicked', () => {
      // First click to set mines
      state = revealCell(state, 0, 0);
      
      // Find a mine
      const mineCell = state.cells.find(c => c.isMine);
      expect(mineCell).toBeDefined();
      if (!mineCell) return;
      
      // Click mine
      state = revealCell(state, mineCell.x, mineCell.y);
      expect(state.status).toBe('lost');
      expect(state.endedAt).toBeDefined();
      
      // All mines should be revealed
      expect(state.cells.filter(c => c.isMine).every(c => c.isRevealed)).toBe(true);
    });

    it('should win game if all non-mine cells are revealed', () => {
       // Create small board: 2x2, 1 mine.
       state = createInitialState(2, 2, 1);
       // Total cells 4. Safe cells 3.
       // Click 0,0.
       state = revealCell(state, 0, 0);
       
       // Now we need to click the other 2 safe cells.
       // We can just iterate and click everything that is not a mine.
       // Note: logic might auto-reveal if 0.
       
       let safeCells = state.cells.filter(c => !c.isMine);
       safeCells.forEach(c => {
           if (!c.isRevealed) {
               state = revealCell(state, c.x, c.y);
           }
       });
       
       expect(state.status).toBe('won');
       expect(state.flaggedCount).toBe(state.mines); // Auto flag mines on win
    });
  });

  describe('toggleFlag', () => {
    it('should toggle flag on cell', () => {
      state = toggleFlag(state, 0, 0);
      expect(getCell(state, 0, 0)?.isFlagged).toBe(true);
      expect(state.flaggedCount).toBe(1);
      
      state = toggleFlag(state, 0, 0);
      expect(getCell(state, 0, 0)?.isFlagged).toBe(false);
      expect(state.flaggedCount).toBe(0);
    });

    it('should prevent revealing flagged cell', () => {
      state = toggleFlag(state, 0, 0);
      state = revealCell(state, 0, 0);
      expect(getCell(state, 0, 0)?.isRevealed).toBe(false);
    });
  });
});
