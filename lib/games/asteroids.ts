export interface Vector2D {
  x: number;
  y: number;
}

export interface Ship {
  position: Vector2D;
  velocity: Vector2D;
  rotation: number; // in radians
  isThrusting: boolean;
}

export interface Bullet {
  position: Vector2D;
  velocity: Vector2D;
  lifetime: number;
}

export interface Asteroid {
  position: Vector2D;
  velocity: Vector2D;
  size: "large" | "medium" | "small";
  vertices: Vector2D[];
}

export interface AsteroidsGameState {
  ship: Ship;
  bullets: Bullet[];
  asteroids: Asteroid[];
  score: number;
  lives: number;
  isGameOver: boolean;
  isPaused: boolean;
  wave: number;
  canvasSize: { width: number; height: number };
  isInvulnerable: boolean;
  invulnerableTimer: number;
}

// Constants
export const SHIP_SIZE = 20;
export const ROTATION_SPEED = 0.1;
export const THRUST_POWER = 0.15;
export const FRICTION = 0.99;
export const MAX_SPEED = 8;
export const BULLET_SPEED = 10;
export const BULLET_LIFETIME = 60;
export const ASTEROID_SPEEDS = { large: 1, medium: 2, small: 3 };
export const ASTEROID_SIZES = { large: 40, medium: 20, small: 10 };
export const ASTEROID_POINTS = { large: 20, medium: 50, small: 100 };
export const INVULNERABLE_TIME = 180; // frames (3 seconds at 60fps)

export function createShip(canvasWidth: number, canvasHeight: number): Ship {
  return {
    position: { x: canvasWidth / 2, y: canvasHeight / 2 },
    velocity: { x: 0, y: 0 },
    rotation: -Math.PI / 2, // pointing up
    isThrusting: false,
  };
}

function generateAsteroidVertices(size: number): Vector2D[] {
  const vertices: Vector2D[] = [];
  const numVertices = 8 + Math.floor(Math.random() * 4);

  for (let i = 0; i < numVertices; i++) {
    const angle = (i / numVertices) * Math.PI * 2;
    const radius = size * (0.7 + Math.random() * 0.3);
    vertices.push({
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
    });
  }

  return vertices;
}

export function createAsteroid(
  x: number,
  y: number,
  size: Asteroid["size"],
  velocityX?: number,
  velocityY?: number
): Asteroid {
  const speed = ASTEROID_SPEEDS[size];
  const angle = Math.random() * Math.PI * 2;

  return {
    position: { x, y },
    velocity: {
      x: velocityX ?? Math.cos(angle) * speed,
      y: velocityY ?? Math.sin(angle) * speed,
    },
    size,
    vertices: generateAsteroidVertices(ASTEROID_SIZES[size]),
  };
}

export function createInitialAsteroids(
  count: number,
  canvasWidth: number,
  canvasHeight: number,
  shipPosition: Vector2D
): Asteroid[] {
  const asteroids: Asteroid[] = [];
  const minDistance = 150;

  for (let i = 0; i < count; i++) {
    let x: number, y: number;
    do {
      x = Math.random() * canvasWidth;
      y = Math.random() * canvasHeight;
    } while (
      Math.hypot(x - shipPosition.x, y - shipPosition.y) < minDistance
    );

    asteroids.push(createAsteroid(x, y, "large"));
  }

  return asteroids;
}

export function createInitialState(
  canvasWidth: number = 800,
  canvasHeight: number = 600
): AsteroidsGameState {
  const ship = createShip(canvasWidth, canvasHeight);

  return {
    ship,
    bullets: [],
    asteroids: createInitialAsteroids(4, canvasWidth, canvasHeight, ship.position),
    score: 0,
    lives: 3,
    isGameOver: false,
    isPaused: false,
    wave: 1,
    canvasSize: { width: canvasWidth, height: canvasHeight },
    isInvulnerable: true,
    invulnerableTimer: INVULNERABLE_TIME,
  };
}

function wrapPosition(pos: Vector2D, width: number, height: number): Vector2D {
  let { x, y } = pos;

  if (x < 0) x = width;
  if (x > width) x = 0;
  if (y < 0) y = height;
  if (y > height) y = 0;

  return { x, y };
}

function updateShip(ship: Ship, canvasSize: { width: number; height: number }): Ship {
  let { velocity } = ship;

  // Apply thrust
  if (ship.isThrusting) {
    velocity = {
      x: velocity.x + Math.cos(ship.rotation) * THRUST_POWER,
      y: velocity.y + Math.sin(ship.rotation) * THRUST_POWER,
    };
  }

  // Apply friction
  velocity = {
    x: velocity.x * FRICTION,
    y: velocity.y * FRICTION,
  };

  // Limit speed
  const speed = Math.hypot(velocity.x, velocity.y);
  if (speed > MAX_SPEED) {
    velocity = {
      x: (velocity.x / speed) * MAX_SPEED,
      y: (velocity.y / speed) * MAX_SPEED,
    };
  }

  // Update position with wrapping
  const newPosition = wrapPosition(
    {
      x: ship.position.x + velocity.x,
      y: ship.position.y + velocity.y,
    },
    canvasSize.width,
    canvasSize.height
  );

  return {
    ...ship,
    position: newPosition,
    velocity,
  };
}

function updateBullets(
  bullets: Bullet[],
  canvasSize: { width: number; height: number }
): Bullet[] {
  return bullets
    .map((bullet) => ({
      ...bullet,
      position: wrapPosition(
        {
          x: bullet.position.x + bullet.velocity.x,
          y: bullet.position.y + bullet.velocity.y,
        },
        canvasSize.width,
        canvasSize.height
      ),
      lifetime: bullet.lifetime - 1,
    }))
    .filter((bullet) => bullet.lifetime > 0);
}

function updateAsteroids(
  asteroids: Asteroid[],
  canvasSize: { width: number; height: number }
): Asteroid[] {
  return asteroids.map((asteroid) => ({
    ...asteroid,
    position: wrapPosition(
      {
        x: asteroid.position.x + asteroid.velocity.x,
        y: asteroid.position.y + asteroid.velocity.y,
      },
      canvasSize.width,
      canvasSize.height
    ),
  }));
}

function checkCollision(
  point: Vector2D,
  asteroid: Asteroid
): boolean {
  const distance = Math.hypot(
    point.x - asteroid.position.x,
    point.y - asteroid.position.y
  );
  return distance < ASTEROID_SIZES[asteroid.size];
}

function splitAsteroid(asteroid: Asteroid): Asteroid[] {
  if (asteroid.size === "small") return [];

  const newSize = asteroid.size === "large" ? "medium" : "small";
  const newAsteroids: Asteroid[] = [];

  for (let i = 0; i < 2; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = ASTEROID_SPEEDS[newSize];
    newAsteroids.push(
      createAsteroid(
        asteroid.position.x,
        asteroid.position.y,
        newSize,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      )
    );
  }

  return newAsteroids;
}

export function update(state: AsteroidsGameState): AsteroidsGameState {
  if (state.isGameOver || state.isPaused) return state;

  let { ship, bullets, asteroids, score, lives, isInvulnerable, invulnerableTimer } = state;

  // Update invulnerability
  if (isInvulnerable) {
    invulnerableTimer--;
    if (invulnerableTimer <= 0) {
      isInvulnerable = false;
    }
  }

  // Update positions
  ship = updateShip(ship, state.canvasSize);
  bullets = updateBullets(bullets, state.canvasSize);
  asteroids = updateAsteroids(asteroids, state.canvasSize);

  // Check bullet-asteroid collisions
  const newAsteroids: Asteroid[] = [];
  const bulletsToRemove = new Set<number>();

  asteroids.forEach((asteroid) => {
    let hit = false;

    bullets.forEach((bullet, bulletIndex) => {
      if (!hit && checkCollision(bullet.position, asteroid)) {
        hit = true;
        bulletsToRemove.add(bulletIndex);
        score += ASTEROID_POINTS[asteroid.size];
      }
    });

    if (hit) {
      newAsteroids.push(...splitAsteroid(asteroid));
    } else {
      newAsteroids.push(asteroid);
    }
  });

  bullets = bullets.filter((_, index) => !bulletsToRemove.has(index));
  asteroids = newAsteroids;

  // Check ship-asteroid collision
  if (!isInvulnerable) {
    for (const asteroid of asteroids) {
      if (checkCollision(ship.position, asteroid)) {
        lives--;
        if (lives <= 0) {
          return {
            ...state,
            ship,
            bullets,
            asteroids,
            score,
            lives: 0,
            isGameOver: true,
          };
        }
        // Respawn ship
        ship = createShip(state.canvasSize.width, state.canvasSize.height);
        isInvulnerable = true;
        invulnerableTimer = INVULNERABLE_TIME;
        break;
      }
    }
  }

  // Check for wave completion
  let wave = state.wave;
  if (asteroids.length === 0) {
    wave++;
    asteroids = createInitialAsteroids(
      3 + wave,
      state.canvasSize.width,
      state.canvasSize.height,
      ship.position
    );
  }

  return {
    ...state,
    ship,
    bullets,
    asteroids,
    score,
    lives,
    wave,
    isInvulnerable,
    invulnerableTimer,
  };
}

export function rotateLeft(state: AsteroidsGameState): AsteroidsGameState {
  if (state.isGameOver || state.isPaused) return state;
  return {
    ...state,
    ship: {
      ...state.ship,
      rotation: state.ship.rotation - ROTATION_SPEED,
    },
  };
}

export function rotateRight(state: AsteroidsGameState): AsteroidsGameState {
  if (state.isGameOver || state.isPaused) return state;
  return {
    ...state,
    ship: {
      ...state.ship,
      rotation: state.ship.rotation + ROTATION_SPEED,
    },
  };
}

export function setThrusting(state: AsteroidsGameState, isThrusting: boolean): AsteroidsGameState {
  if (state.isGameOver || state.isPaused) return state;
  return {
    ...state,
    ship: {
      ...state.ship,
      isThrusting,
    },
  };
}

export function fireBullet(state: AsteroidsGameState): AsteroidsGameState {
  if (state.isGameOver || state.isPaused) return state;
  if (state.bullets.length >= 5) return state; // Limit bullets

  const { ship } = state;
  const bullet: Bullet = {
    position: {
      x: ship.position.x + Math.cos(ship.rotation) * SHIP_SIZE,
      y: ship.position.y + Math.sin(ship.rotation) * SHIP_SIZE,
    },
    velocity: {
      x: Math.cos(ship.rotation) * BULLET_SPEED,
      y: Math.sin(ship.rotation) * BULLET_SPEED,
    },
    lifetime: BULLET_LIFETIME,
  };

  return {
    ...state,
    bullets: [...state.bullets, bullet],
  };
}

export function togglePause(state: AsteroidsGameState): AsteroidsGameState {
  if (state.isGameOver) return state;
  return { ...state, isPaused: !state.isPaused };
}

export function resetGame(canvasWidth: number, canvasHeight: number): AsteroidsGameState {
  return createInitialState(canvasWidth, canvasHeight);
}

// Get ship triangle points for rendering
export function getShipPoints(ship: Ship): Vector2D[] {
  const { position, rotation } = ship;
  const size = SHIP_SIZE;

  return [
    // Nose
    {
      x: position.x + Math.cos(rotation) * size,
      y: position.y + Math.sin(rotation) * size,
    },
    // Left wing
    {
      x: position.x + Math.cos(rotation + 2.5) * size * 0.7,
      y: position.y + Math.sin(rotation + 2.5) * size * 0.7,
    },
    // Back center
    {
      x: position.x + Math.cos(rotation + Math.PI) * size * 0.4,
      y: position.y + Math.sin(rotation + Math.PI) * size * 0.4,
    },
    // Right wing
    {
      x: position.x + Math.cos(rotation - 2.5) * size * 0.7,
      y: position.y + Math.sin(rotation - 2.5) * size * 0.7,
    },
  ];
}

// Get thrust flame points for rendering
export function getThrustPoints(ship: Ship): Vector2D[] {
  const { position, rotation } = ship;
  const size = SHIP_SIZE;

  return [
    {
      x: position.x + Math.cos(rotation + 2.7) * size * 0.5,
      y: position.y + Math.sin(rotation + 2.7) * size * 0.5,
    },
    {
      x: position.x + Math.cos(rotation + Math.PI) * size * (0.8 + Math.random() * 0.4),
      y: position.y + Math.sin(rotation + Math.PI) * size * (0.8 + Math.random() * 0.4),
    },
    {
      x: position.x + Math.cos(rotation - 2.7) * size * 0.5,
      y: position.y + Math.sin(rotation - 2.7) * size * 0.5,
    },
  ];
}
