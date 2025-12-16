export interface Vector2D {
  x: number;
  y: number;
}

export interface Tank {
  position: Vector2D;
  angle: number; // barrel angle in degrees (0-180)
  power: number; // 0-100
  health: number;
  isPlayer: boolean;
}

export interface Projectile {
  position: Vector2D;
  velocity: Vector2D;
  active: boolean;
}

export interface Explosion {
  position: Vector2D;
  radius: number;
  frame: number;
  maxFrames: number;
}

export interface BarrackGameState {
  terrain: number[]; // height values for each x position
  player: Tank;
  enemies: Tank[];
  projectile: Projectile | null;
  explosions: Explosion[];
  wind: number; // -10 to 10
  currentTurn: "player" | "enemy";
  isGameOver: boolean;
  isPaused: boolean;
  score: number;
  level: number;
  canvasSize: { width: number; height: number };
  isAiming: boolean;
  isFiring: boolean;
}

// Constants
export const GRAVITY = 0.15;
export const WIND_FACTOR = 0.02;
export const MAX_POWER = 100;
export const EXPLOSION_RADIUS = 30;
export const TANK_WIDTH = 30;
export const TANK_HEIGHT = 15;
export const BARREL_LENGTH = 25;
export const DAMAGE_RADIUS = 40;
export const MAX_HEALTH = 100;

function generateTerrain(width: number, height: number): number[] {
  const terrain: number[] = [];
  const baseHeight = height * 0.6;
  const amplitude = height * 0.2;

  // Generate smooth terrain using sine waves
  for (let x = 0; x < width; x++) {
    const noise1 = Math.sin(x * 0.01) * amplitude * 0.5;
    const noise2 = Math.sin(x * 0.03) * amplitude * 0.3;
    const noise3 = Math.sin(x * 0.07) * amplitude * 0.2;

    terrain.push(Math.floor(baseHeight + noise1 + noise2 + noise3));
  }

  return terrain;
}

function findSafePosition(terrain: number[], startX: number, width: number): Vector2D {
  // Find a relatively flat area
  let bestX = startX;
  let minVariance = Infinity;

  for (let x = Math.max(50, startX - 100); x < Math.min(width - 50, startX + 100); x++) {
    const range = 20;
    let variance = 0;
    for (let i = -range; i <= range; i++) {
      if (x + i >= 0 && x + i < terrain.length) {
        variance += Math.abs(terrain[x + i] - terrain[x]);
      }
    }
    if (variance < minVariance) {
      minVariance = variance;
      bestX = x;
    }
  }

  return { x: bestX, y: terrain[bestX] - TANK_HEIGHT };
}

export function createInitialState(
  canvasWidth: number = 800,
  canvasHeight: number = 500,
  level: number = 1
): BarrackGameState {
  const terrain = generateTerrain(canvasWidth, canvasHeight);

  const playerPos = findSafePosition(terrain, 100, canvasWidth);
  const player: Tank = {
    position: playerPos,
    angle: 45,
    power: 50,
    health: MAX_HEALTH,
    isPlayer: true,
  };

  // Create enemies based on level
  const enemyCount = Math.min(level, 3);
  const enemies: Tank[] = [];
  const spacing = (canvasWidth - 200) / (enemyCount + 1);

  for (let i = 0; i < enemyCount; i++) {
    const enemyX = canvasWidth - 100 - i * spacing;
    const enemyPos = findSafePosition(terrain, enemyX, canvasWidth);
    enemies.push({
      position: enemyPos,
      angle: 135,
      power: 40 + Math.random() * 30,
      health: MAX_HEALTH,
      isPlayer: false,
    });
  }

  return {
    terrain,
    player,
    enemies,
    projectile: null,
    explosions: [],
    wind: Math.floor(Math.random() * 21) - 10,
    currentTurn: "player",
    isGameOver: false,
    isPaused: false,
    score: 0,
    level,
    canvasSize: { width: canvasWidth, height: canvasHeight },
    isAiming: false,
    isFiring: false,
  };
}

export function adjustAngle(state: BarrackGameState, delta: number): BarrackGameState {
  if (state.isGameOver || state.isPaused || state.currentTurn !== "player" || state.isFiring) {
    return state;
  }

  const newAngle = Math.max(0, Math.min(180, state.player.angle + delta));
  return {
    ...state,
    player: { ...state.player, angle: newAngle },
  };
}

export function adjustPower(state: BarrackGameState, delta: number): BarrackGameState {
  if (state.isGameOver || state.isPaused || state.currentTurn !== "player" || state.isFiring) {
    return state;
  }

  const newPower = Math.max(10, Math.min(MAX_POWER, state.player.power + delta));
  return {
    ...state,
    player: { ...state.player, power: newPower },
  };
}

export function fire(state: BarrackGameState): BarrackGameState {
  if (state.isGameOver || state.isPaused || state.projectile !== null || state.isFiring) {
    return state;
  }

  const tank = state.currentTurn === "player" ? state.player : state.enemies[0];
  if (!tank || tank.health <= 0) return state;

  const angleRad = (tank.angle * Math.PI) / 180;
  const speed = tank.power * 0.15;

  const barrelEndX = tank.position.x + Math.cos(angleRad) * BARREL_LENGTH;
  const barrelEndY = tank.position.y - Math.sin(angleRad) * BARREL_LENGTH;

  const projectile: Projectile = {
    position: { x: barrelEndX, y: barrelEndY },
    velocity: {
      x: Math.cos(angleRad) * speed,
      y: -Math.sin(angleRad) * speed,
    },
    active: true,
  };

  return {
    ...state,
    projectile,
    isFiring: true,
  };
}

function deformTerrain(terrain: number[], centerX: number, radius: number): number[] {
  const newTerrain = [...terrain];

  for (let x = Math.max(0, centerX - radius); x < Math.min(terrain.length, centerX + radius); x++) {
    const distance = Math.abs(x - centerX);
    if (distance < radius) {
      const depth = Math.sqrt(radius * radius - distance * distance) * 0.5;
      newTerrain[x] = Math.min(terrain.length, newTerrain[x] + depth);
    }
  }

  return newTerrain;
}

function checkTankHit(projectilePos: Vector2D, tank: Tank): boolean {
  const dx = projectilePos.x - tank.position.x;
  const dy = projectilePos.y - tank.position.y;
  return Math.abs(dx) < TANK_WIDTH / 2 && Math.abs(dy) < TANK_HEIGHT;
}

function calculateDamage(distance: number): number {
  if (distance > DAMAGE_RADIUS) return 0;
  return Math.floor((1 - distance / DAMAGE_RADIUS) * 50);
}

export function update(state: BarrackGameState): BarrackGameState {
  if (state.isGameOver || state.isPaused) return state;

  let { projectile, terrain, player, enemies, explosions, score, wind, currentTurn, isFiring } = state;

  // Update explosions
  explosions = explosions
    .map((exp) => ({ ...exp, frame: exp.frame + 1 }))
    .filter((exp) => exp.frame < exp.maxFrames);

  // Update projectile
  if (projectile && projectile.active) {
    // Apply physics
    projectile = {
      ...projectile,
      position: {
        x: projectile.position.x + projectile.velocity.x,
        y: projectile.position.y + projectile.velocity.y,
      },
      velocity: {
        x: projectile.velocity.x + wind * WIND_FACTOR,
        y: projectile.velocity.y + GRAVITY,
      },
    };

    const px = Math.floor(projectile.position.x);
    const py = projectile.position.y;

    // Check bounds
    if (px < 0 || px >= terrain.length || py > state.canvasSize.height + 50) {
      projectile = null;
      isFiring = false;
      currentTurn = currentTurn === "player" ? "enemy" : "player";
    }
    // Check terrain collision
    else if (py >= terrain[px]) {
      explosions.push({
        position: { x: px, y: terrain[px] },
        radius: EXPLOSION_RADIUS,
        frame: 0,
        maxFrames: 30,
      });

      terrain = deformTerrain(terrain, px, EXPLOSION_RADIUS);

      // Check damage to tanks
      const hitPos = { x: px, y: terrain[px] };

      // Damage player
      const playerDist = Math.hypot(hitPos.x - player.position.x, hitPos.y - player.position.y);
      const playerDamage = calculateDamage(playerDist);
      if (playerDamage > 0) {
        player = { ...player, health: Math.max(0, player.health - playerDamage) };
      }

      // Damage enemies
      enemies = enemies.map((enemy) => {
        const dist = Math.hypot(hitPos.x - enemy.position.x, hitPos.y - enemy.position.y);
        const damage = calculateDamage(dist);
        if (damage > 0) {
          const newHealth = Math.max(0, enemy.health - damage);
          if (newHealth === 0 && enemy.health > 0) {
            score += 100;
          }
          return { ...enemy, health: newHealth };
        }
        return enemy;
      });

      projectile = null;
      isFiring = false;
      currentTurn = currentTurn === "player" ? "enemy" : "player";
    }
    // Check direct tank hits
    else {
      // Check player hit
      if (checkTankHit(projectile.position, player)) {
        explosions.push({
          position: { ...projectile.position },
          radius: EXPLOSION_RADIUS,
          frame: 0,
          maxFrames: 30,
        });
        player = { ...player, health: Math.max(0, player.health - 40) };
        projectile = null;
        isFiring = false;
        currentTurn = currentTurn === "player" ? "enemy" : "player";
      }

      // Check enemy hits
      for (let i = 0; i < enemies.length; i++) {
        if (projectile && checkTankHit(projectile.position, enemies[i])) {
          explosions.push({
            position: { ...projectile.position },
            radius: EXPLOSION_RADIUS,
            frame: 0,
            maxFrames: 30,
          });
          const newHealth = Math.max(0, enemies[i].health - 40);
          if (newHealth === 0 && enemies[i].health > 0) {
            score += 100;
          }
          enemies = enemies.map((e, idx) =>
            idx === i ? { ...e, health: newHealth } : e
          );
          projectile = null;
          isFiring = false;
          currentTurn = currentTurn === "player" ? "enemy" : "player";
          break;
        }
      }
    }
  }

  // Remove dead enemies
  const aliveEnemies = enemies.filter((e) => e.health > 0);

  // Check game over conditions
  let isGameOver = false;
  if (player.health <= 0) {
    isGameOver = true;
  } else if (aliveEnemies.length === 0) {
    // Level complete - for now just end the game
    isGameOver = true;
    score += 500; // Bonus for completing level
  }

  // Enemy AI turn
  if (currentTurn === "enemy" && !isFiring && aliveEnemies.length > 0 && !isGameOver) {
    const enemy = aliveEnemies[0];
    // Simple AI: aim roughly at player with some randomness
    const dx = player.position.x - enemy.position.x;
    const dy = player.position.y - enemy.position.y;
    const targetAngle = Math.atan2(-dy, dx) * (180 / Math.PI);
    const adjustedAngle = Math.max(0, Math.min(180, targetAngle + (Math.random() - 0.5) * 20));

    enemies = enemies.map((e, i) =>
      i === 0 ? { ...e, angle: adjustedAngle, power: 50 + Math.random() * 30 } : e
    );

    // Fire after a short delay (handled by returning state that will trigger fire on next update)
    return {
      ...state,
      terrain,
      player,
      enemies,
      projectile,
      explosions,
      score,
      currentTurn,
      isFiring: true,
      isGameOver,
    };
  }

  // Auto-fire for enemy after setting up
  if (currentTurn === "enemy" && isFiring && !projectile && aliveEnemies.length > 0) {
    const enemy = aliveEnemies[0];
    const angleRad = (enemy.angle * Math.PI) / 180;
    const speed = enemy.power * 0.15;

    projectile = {
      position: {
        x: enemy.position.x + Math.cos(angleRad) * BARREL_LENGTH,
        y: enemy.position.y - Math.sin(angleRad) * BARREL_LENGTH,
      },
      velocity: {
        x: Math.cos(angleRad) * speed,
        y: -Math.sin(angleRad) * speed,
      },
      active: true,
    };
  }

  return {
    ...state,
    terrain,
    player,
    enemies: aliveEnemies.length > 0 ? enemies : [],
    projectile,
    explosions,
    score,
    currentTurn,
    isFiring,
    isGameOver,
  };
}

export function togglePause(state: BarrackGameState): BarrackGameState {
  if (state.isGameOver) return state;
  return { ...state, isPaused: !state.isPaused };
}

export function resetGame(canvasWidth: number, canvasHeight: number): BarrackGameState {
  return createInitialState(canvasWidth, canvasHeight, 1);
}
