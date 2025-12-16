export type BreakoutStatus = "ready" | "playing" | "paused" | "won" | "lost";

export interface BreakoutBrick {
  x: number;
  y: number;
  width: number;
  height: number;
  isAlive: boolean;
}

export interface BreakoutGameState {
  width: number;
  height: number;
  status: BreakoutStatus;
  score: number;
  lives: number;
  paddle: { x: number; y: number; width: number; height: number; speed: number };
  ball: { x: number; y: number; radius: number; vx: number; vy: number; isLaunched: boolean };
  bricks: BreakoutBrick[];
}

export interface BreakoutInputState {
  left: boolean;
  right: boolean;
}

export interface BreakoutOptions {
  width?: number;
  height?: number;
  lives?: number;
  paddleWidth?: number;
  paddleHeight?: number;
  paddleSpeed?: number;
  ballRadius?: number;
  ballSpeed?: number;
  brickRows?: number;
  brickCols?: number;
  brickPadding?: number;
  brickOffsetTop?: number;
  brickOffsetLeft?: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function createBricks(
  width: number,
  rows: number,
  cols: number,
  brickPadding: number,
  brickOffsetTop: number,
  brickOffsetLeft: number
): BreakoutBrick[] {
  const available = width - brickOffsetLeft * 2 - brickPadding * (cols - 1);
  const brickWidth = Math.floor(available / cols);
  const brickHeight = 18;

  const bricks: BreakoutBrick[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      bricks.push({
        x: brickOffsetLeft + c * (brickWidth + brickPadding),
        y: brickOffsetTop + r * (brickHeight + brickPadding),
        width: brickWidth,
        height: brickHeight,
        isAlive: true,
      });
    }
  }
  return bricks;
}

export function createInitialState(options: BreakoutOptions = {}): BreakoutGameState {
  const width = options.width ?? 480;
  const height = options.height ?? 320;
  const lives = options.lives ?? 3;

  const paddleWidth = options.paddleWidth ?? 90;
  const paddleHeight = options.paddleHeight ?? 14;
  const paddleSpeed = options.paddleSpeed ?? 8;

  const ballRadius = options.ballRadius ?? 8;
  const ballSpeed = options.ballSpeed ?? 4.5;

  const brickRows = options.brickRows ?? 5;
  const brickCols = options.brickCols ?? 8;
  const brickPadding = options.brickPadding ?? 10;
  const brickOffsetTop = options.brickOffsetTop ?? 40;
  const brickOffsetLeft = options.brickOffsetLeft ?? 24;

  const paddleY = height - 28;
  const paddleX = Math.floor((width - paddleWidth) / 2);

  const ballX = paddleX + paddleWidth / 2;
  const ballY = paddleY - ballRadius - 1;

  return {
    width,
    height,
    status: "ready",
    score: 0,
    lives,
    paddle: { x: paddleX, y: paddleY, width: paddleWidth, height: paddleHeight, speed: paddleSpeed },
    ball: { x: ballX, y: ballY, radius: ballRadius, vx: ballSpeed, vy: -ballSpeed, isLaunched: false },
    bricks: createBricks(width, brickRows, brickCols, brickPadding, brickOffsetTop, brickOffsetLeft),
  };
}

function resetBallOnPaddle(state: BreakoutGameState): BreakoutGameState {
  const { paddle, ball } = state;
  return {
    ...state,
    ball: {
      ...ball,
      x: paddle.x + paddle.width / 2,
      y: paddle.y - ball.radius - 1,
      isLaunched: false,
    },
    status: "ready",
  };
}

export function launchBall(state: BreakoutGameState): BreakoutGameState {
  if (state.status === "won" || state.status === "lost") return state;
  if (state.ball.isLaunched) return state;
  return { ...state, status: "playing", ball: { ...state.ball, isLaunched: true } };
}

export function togglePause(state: BreakoutGameState): BreakoutGameState {
  if (state.status === "won" || state.status === "lost") return state;
  if (state.status === "paused") return { ...state, status: state.ball.isLaunched ? "playing" : "ready" };
  if (state.status === "playing") return { ...state, status: "paused" };
  return state;
}

export function resetGame(options: BreakoutOptions = {}): BreakoutGameState {
  return createInitialState(options);
}

function circleIntersectsRect(
  cx: number,
  cy: number,
  radius: number,
  rx: number,
  ry: number,
  rw: number,
  rh: number
) {
  const closestX = clamp(cx, rx, rx + rw);
  const closestY = clamp(cy, ry, ry + rh);
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= radius * radius;
}

export function stepGame(state: BreakoutGameState, input: BreakoutInputState): BreakoutGameState {
  if (state.status !== "playing") {
    if (state.status === "ready") {
      const next = movePaddle(state, input);
      if (!next.ball.isLaunched) {
        return {
          ...next,
          ball: {
            ...next.ball,
            x: next.paddle.x + next.paddle.width / 2,
            y: next.paddle.y - next.ball.radius - 1,
          },
        };
      }
      return next;
    }
    return state;
  }

  let next = movePaddle(state, input);
  next = moveBall(next);
  next = handleCollisions(next);
  return next;
}

function movePaddle(state: BreakoutGameState, input: BreakoutInputState): BreakoutGameState {
  const { paddle, width } = state;
  const direction = (input.left ? -1 : 0) + (input.right ? 1 : 0);
  if (direction === 0) return state;

  const nextX = clamp(paddle.x + direction * paddle.speed, 0, width - paddle.width);
  return { ...state, paddle: { ...paddle, x: nextX } };
}

function moveBall(state: BreakoutGameState): BreakoutGameState {
  const { ball } = state;
  if (!ball.isLaunched) return state;
  return { ...state, ball: { ...ball, x: ball.x + ball.vx, y: ball.y + ball.vy } };
}

function handleCollisions(state: BreakoutGameState): BreakoutGameState {
  const { width, height, ball, paddle } = state;

  let nextBall = { ...ball };
  let nextBricks = state.bricks;
  let nextScore = state.score;

  // Wall collisions
  if (nextBall.x - nextBall.radius <= 0) {
    nextBall.x = nextBall.radius;
    nextBall.vx *= -1;
  } else if (nextBall.x + nextBall.radius >= width) {
    nextBall.x = width - nextBall.radius;
    nextBall.vx *= -1;
  }

  if (nextBall.y - nextBall.radius <= 0) {
    nextBall.y = nextBall.radius;
    nextBall.vy *= -1;
  }

  // Bottom: lose a life
  if (nextBall.y - nextBall.radius > height) {
    const nextLives = state.lives - 1;
    if (nextLives <= 0) {
      return { ...state, ball: nextBall, lives: 0, status: "lost" };
    }
    return resetBallOnPaddle({ ...state, ball: nextBall, lives: nextLives });
  }

  // Paddle collision
  if (
    circleIntersectsRect(
      nextBall.x,
      nextBall.y,
      nextBall.radius,
      paddle.x,
      paddle.y,
      paddle.width,
      paddle.height
    ) &&
    nextBall.vy > 0
  ) {
    const hit = (nextBall.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
    const maxAngle = Math.PI / 3; // 60deg
    const angle = clamp(hit, -1, 1) * maxAngle;
    const speed = Math.hypot(nextBall.vx, nextBall.vy);

    nextBall.vx = speed * Math.sin(angle);
    nextBall.vy = -Math.abs(speed * Math.cos(angle));
    nextBall.y = paddle.y - nextBall.radius - 1;
  }

  // Brick collisions
  const updatedBricks = nextBricks.map((b) => ({ ...b }));
  let hitBrick = false;
  for (const brick of updatedBricks) {
    if (!brick.isAlive) continue;
    if (
      circleIntersectsRect(
        nextBall.x,
        nextBall.y,
        nextBall.radius,
        brick.x,
        brick.y,
        brick.width,
        brick.height
      )
    ) {
      brick.isAlive = false;
      nextScore += 10;
      hitBrick = true;
      break;
    }
  }

  if (hitBrick) {
    nextBall.vy *= -1;
    nextBricks = updatedBricks;
  }

  const remaining = nextBricks.some((b) => b.isAlive);
  if (!remaining) {
    return { ...state, ball: nextBall, bricks: nextBricks, score: nextScore, status: "won" };
  }

  return { ...state, ball: nextBall, bricks: nextBricks, score: nextScore };
}

export function getBreakoutKeyIntent(key: string) {
  if (key === " " || key === "Spacebar") return "PRIMARY" as const;
  if (key === "Escape") return "PAUSE" as const;
  if (key === "r" || key === "R") return "RESET" as const;
  if (key === "ArrowLeft" || key === "a" || key === "A") return "LEFT" as const;
  if (key === "ArrowRight" || key === "d" || key === "D") return "RIGHT" as const;
  return null;
}

