import {
  createInitialState,
  moveSnake,
  setDirection,
  generateFood,
  SnakeGameState,
  Direction,
} from '@/lib/games/snake';

describe('Snake Game Logic', () => {
  let initialState: SnakeGameState;

  beforeEach(() => {
    initialState = createInitialState(20, 20);
  });

  describe('createInitialState', () => {
    it('should initialize with correct default values', () => {
      expect(initialState.snake).toHaveLength(3);
      expect(initialState.score).toBe(0);
      expect(initialState.isGameOver).toBe(false);
      expect(initialState.isPaused).toBe(false);
      expect(initialState.direction).toBe('RIGHT');
    });

    it('should place snake in center', () => {
      const { x, y } = initialState.snake[0];
      expect(x).toBe(10);
      expect(y).toBe(10);
    });
  });

  describe('moveSnake', () => {
    it('should move the snake in the current direction', () => {
      const nextState = moveSnake(initialState);
      const head = nextState.snake[0];
      // Initial direction is RIGHT
      expect(head.x).toBe(initialState.snake[0].x + 1);
      expect(head.y).toBe(initialState.snake[0].y);
    });

    it('should detect wall collision', () => {
      // Place snake at edge
      initialState.snake[0] = { x: 19, y: 10 };
      initialState.nextDirection = 'RIGHT';
      const nextState = moveSnake(initialState);
      expect(nextState.isGameOver).toBe(true);
    });

    it('should detect self collision', () => {
      // Create a configuration where snake can hit itself
      // e.g. 5 segments
      const snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 11, y: 11 },
        { x: 11, y: 10 }, // U-shape, next move UP hits tail? No, tail moves away.
        { x: 12, y: 10 }
      ];
      // Actually, simple self collision:
      // O->
      // ^ |
      // | |
      // --
      // Hard to setup without moving. 
      // Let's force a self-intersecting state or a move that causes it.
      // If head moves into body.
      initialState.snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 9, y: 11 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
      ];
      // Move DOWN from 10,10 hits 10,11 (which is body index 3)
      initialState.direction = 'RIGHT'; // logic uses nextDirection
      initialState.nextDirection = 'DOWN';
      
      const nextState = moveSnake(initialState);
      expect(nextState.isGameOver).toBe(true);
    });

    it('should grow and increase score when eating food', () => {
      // Place food in front of snake
      const head = initialState.snake[0];
      const food = { x: head.x + 1, y: head.y };
      initialState.food = food;
      
      const nextState = moveSnake(initialState);
      
      expect(nextState.snake).toHaveLength(initialState.snake.length + 1);
      expect(nextState.score).toBe(initialState.score + 10);
      expect(nextState.food).not.toEqual(food); // Should generate new food
    });
  });

  describe('setDirection', () => {
    it('should update direction if valid', () => {
      const nextState = setDirection(initialState, 'UP');
      expect(nextState.nextDirection).toBe('UP');
    });

    it('should ignore opposite direction', () => {
      // Current is RIGHT
      const nextState = setDirection(initialState, 'LEFT');
      expect(nextState.nextDirection).toBe('RIGHT');
    });
  });
});
