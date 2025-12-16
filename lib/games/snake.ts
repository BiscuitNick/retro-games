export type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";
export type Position = { x: number; y: number };

export interface SnakeGameState {
  snake: Position[];
  food: Position;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  isGameOver: boolean;
  isPaused: boolean;
  gridSize: { width: number; height: number };
  speed: number;
}

export const INITIAL_SPEED = 150;
export const SPEED_INCREMENT = 5;
export const MIN_SPEED = 50;

export function createInitialState(
  gridWidth: number = 20,
  gridHeight: number = 20
): SnakeGameState {
  const centerX = Math.floor(gridWidth / 2);
  const centerY = Math.floor(gridHeight / 2);

  const initialSnake: Position[] = [
    { x: centerX, y: centerY },
    { x: centerX - 1, y: centerY },
    { x: centerX - 2, y: centerY },
  ];

  return {
    snake: initialSnake,
    food: generateFood(initialSnake, gridWidth, gridHeight),
    direction: "RIGHT",
    nextDirection: "RIGHT",
    score: 0,
    isGameOver: false,
    isPaused: false,
    gridSize: { width: gridWidth, height: gridHeight },
    speed: INITIAL_SPEED,
  };
}

export function generateFood(
  snake: Position[],
  gridWidth: number,
  gridHeight: number
): Position {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * gridWidth),
      y: Math.floor(Math.random() * gridHeight),
    };
  } while (snake.some((segment) => segment.x === food.x && segment.y === food.y));
  return food;
}

export function getOppositeDirection(direction: Direction): Direction {
  const opposites: Record<Direction, Direction> = {
    UP: "DOWN",
    DOWN: "UP",
    LEFT: "RIGHT",
    RIGHT: "LEFT",
  };
  return opposites[direction];
}

export function isValidDirectionChange(
  currentDirection: Direction,
  newDirection: Direction
): boolean {
  return newDirection !== getOppositeDirection(currentDirection);
}

export function moveSnake(state: SnakeGameState): SnakeGameState {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  const { snake, food, nextDirection, gridSize } = state;
  const head = snake[0];

  // Calculate new head position
  const newHead: Position = { ...head };
  switch (nextDirection) {
    case "UP":
      newHead.y -= 1;
      break;
    case "DOWN":
      newHead.y += 1;
      break;
    case "LEFT":
      newHead.x -= 1;
      break;
    case "RIGHT":
      newHead.x += 1;
      break;
  }

  // Check wall collision
  if (
    newHead.x < 0 ||
    newHead.x >= gridSize.width ||
    newHead.y < 0 ||
    newHead.y >= gridSize.height
  ) {
    return { ...state, isGameOver: true };
  }

  // Check self collision (excluding tail if not eating)
  const willEat = newHead.x === food.x && newHead.y === food.y;
  const bodyToCheck = willEat ? snake : snake.slice(0, -1);
  if (bodyToCheck.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
    return { ...state, isGameOver: true };
  }

  // Create new snake
  const newSnake = [newHead, ...snake];
  if (!willEat) {
    newSnake.pop();
  }

  // Calculate new state
  const newScore = willEat ? state.score + 10 : state.score;
  const newSpeed = willEat
    ? Math.max(MIN_SPEED, state.speed - SPEED_INCREMENT)
    : state.speed;
  const newFood = willEat
    ? generateFood(newSnake, gridSize.width, gridSize.height)
    : food;

  return {
    ...state,
    snake: newSnake,
    food: newFood,
    direction: nextDirection,
    score: newScore,
    speed: newSpeed,
  };
}

export function setDirection(
  state: SnakeGameState,
  direction: Direction
): SnakeGameState {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  if (isValidDirectionChange(state.direction, direction)) {
    return { ...state, nextDirection: direction };
  }

  return state;
}

export function togglePause(state: SnakeGameState): SnakeGameState {
  if (state.isGameOver) {
    return state;
  }
  return { ...state, isPaused: !state.isPaused };
}

export function resetGame(
  gridWidth: number = 20,
  gridHeight: number = 20
): SnakeGameState {
  return createInitialState(gridWidth, gridHeight);
}

export function getDirectionFromKey(key: string): Direction | null {
  const keyMap: Record<string, Direction> = {
    ArrowUp: "UP",
    ArrowDown: "DOWN",
    ArrowLeft: "LEFT",
    ArrowRight: "RIGHT",
    w: "UP",
    W: "UP",
    s: "DOWN",
    S: "DOWN",
    a: "LEFT",
    A: "LEFT",
    d: "RIGHT",
    D: "RIGHT",
  };
  return keyMap[key] || null;
}

export function getDirectionFromSwipe(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): Direction | null {
  const dx = endX - startX;
  const dy = endY - startY;
  const minSwipeDistance = 30;

  if (Math.abs(dx) < minSwipeDistance && Math.abs(dy) < minSwipeDistance) {
    return null;
  }

  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? "RIGHT" : "LEFT";
  } else {
    return dy > 0 ? "DOWN" : "UP";
  }
}
