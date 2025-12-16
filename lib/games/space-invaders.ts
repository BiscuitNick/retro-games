export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;
export const PLAYER_WIDTH = 40;
export const PLAYER_HEIGHT = 20;
export const ALIEN_WIDTH = 30;
export const ALIEN_HEIGHT = 20;
export const BULLET_WIDTH = 4;
export const BULLET_HEIGHT = 10;
export const BULLET_SPEED = 7;
export const ALIEN_SPEED_X = 1; // Base speed
export const ALIEN_DROP_Y = 20;

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Entity extends Position, Size {}

export type AlienType = 1 | 2 | 3;

export interface Alien extends Entity {
  id: string;
  type: AlienType;
  scoreValue: number;
}

export interface Bullet extends Entity {
  id: string;
  owner: 'player' | 'alien';
}

export interface Player extends Entity {
  lives: number;
}

export interface ShieldBlock extends Entity {
    id: string;
    health: number;
}

export function checkCollision(a: Entity, b: Entity): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function createAliens(rows: number = 5, cols: number = 11): Alien[] {
  const aliens: Alien[] = [];
  const startX = 50;
  const startY = 50;
  const paddingX = 15;
  const paddingY = 15;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      let type: AlienType = 1;
      let scoreValue = 10;
      
      if (r === 0) { type = 3; scoreValue = 30; }
      else if (r < 3) { type = 2; scoreValue = 20; }
      
      aliens.push({
        id: `alien-${r}-${c}`,
        x: startX + c * (ALIEN_WIDTH + paddingX),
        y: startY + r * (ALIEN_HEIGHT + paddingY),
        width: ALIEN_WIDTH,
        height: ALIEN_HEIGHT,
        type,
        scoreValue,
      });
    }
  }
  return aliens;
}

export function createShields(): ShieldBlock[] {
    const shields: ShieldBlock[] = [];
    const shieldCount = 4;
    const shieldWidth = 60;
    const shieldHeight = 40;
    const spacing = (GAME_WIDTH - (shieldCount * shieldWidth)) / (shieldCount + 1);
    const y = GAME_HEIGHT - 120;

    for(let i=0; i<shieldCount; i++) {
        const x = spacing + i * (shieldWidth + spacing);
        // Break shield into smaller blocks for granular destruction?
        // For MVP, just big blocks with health or simple collision check?
        // Let's do a simple block for now, maybe with health.
        shields.push({
            id: `shield-${i}`,
            x, 
            y,
            width: shieldWidth,
            height: shieldHeight,
            health: 10
        });
    }
    return shields;
}
