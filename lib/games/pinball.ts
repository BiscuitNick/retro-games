export interface Vector {
  x: number;
  y: number;
}

export const add = (v1: Vector, v2: Vector): Vector => ({ x: v1.x + v2.x, y: v1.y + v2.y });
export const sub = (v1: Vector, v2: Vector): Vector => ({ x: v1.x - v2.x, y: v1.y - v2.y });
export const mul = (v: Vector, s: number): Vector => ({ x: v.x * s, y: v.y * s });
export const dot = (v1: Vector, v2: Vector): number => v1.x * v2.x + v1.y * v2.y;
export const mag = (v: Vector): number => Math.sqrt(v.x * v.x + v.y * v.y);
export const normalize = (v: Vector): Vector => {
  const m = mag(v);
  return m === 0 ? { x: 0, y: 0 } : { x: v.x / m, y: v.y / m };
};
export const dist = (v1: Vector, v2: Vector): number => mag(sub(v1, v2));

export interface Ball {
  pos: Vector;
  vel: Vector;
  radius: number;
}

export interface LineSegment {
  p1: Vector;
  p2: Vector;
  normal?: Vector; // Precalculated normal
}

export interface Bumper {
  pos: Vector;
  radius: number;
  score: number;
}

export interface Flipper {
  pivot: Vector;
  length: number;
  angle: number;
  restAngle: number;
  activeAngle: number;
  angularVelocity: number;
  side: 'left' | 'right';
  isPressed: boolean;
}

export interface GameState {
  ball: Ball;
  walls: LineSegment[];
  bumpers: Bumper[];
  flippers: { left: Flipper; right: Flipper };
  score: number;
  lives: number;
  gravity: number;
}

// Physics Constants
export const GRAVITY = 0.2;
export const FRICTION = 0.99;
export const RESTITUTION = 0.7; // Bounciness
export const FLIPPER_SPEED = 0.2;
export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 600;

export function createInitialState(): GameState {
  return {
    ball: {
      pos: { x: 380, y: 500 }, // Plunger lane
      vel: { x: 0, y: 0 },
      radius: 8,
    },
    walls: [
      // Outer walls
      { p1: { x: 0, y: 0 }, p2: { x: 400, y: 0 } }, // Top
      { p1: { x: 400, y: 0 }, p2: { x: 400, y: 600 } }, // Right
      { p1: { x: 400, y: 600 }, p2: { x: 0, y: 600 } }, // Bottom
      { p1: { x: 0, y: 600 }, p2: { x: 0, y: 0 } }, // Left
      
      // Plunger lane wall
      { p1: { x: 360, y: 200 }, p2: { x: 360, y: 600 } },
      
      // Slopes near flippers
      { p1: { x: 0, y: 450 }, p2: { x: 120, y: 520 } },
      { p1: { x: 360, y: 450 }, p2: { x: 240, y: 520 } },
    ],
    bumpers: [
      { pos: { x: 100, y: 150 }, radius: 20, score: 100 },
      { pos: { x: 260, y: 150 }, radius: 20, score: 100 },
      { pos: { x: 180, y: 250 }, radius: 20, score: 100 },
    ],
    flippers: {
      left: {
        pivot: { x: 120, y: 520 },
        length: 60,
        angle: Math.PI / 6, // 30 deg
        restAngle: Math.PI / 6,
        activeAngle: -Math.PI / 6,
        angularVelocity: 0,
        side: 'left',
        isPressed: false,
      },
      right: {
        pivot: { x: 240, y: 520 },
        length: 60,
        angle: Math.PI - Math.PI / 6, // 150 deg
        restAngle: Math.PI - Math.PI / 6,
        activeAngle: Math.PI + Math.PI / 6,
        angularVelocity: 0,
        side: 'right',
        isPressed: false,
      },
    },
    score: 0,
    lives: 3,
    gravity: GRAVITY,
  };
}

// Basic Circle-Line collision
function closestPointOnSegment(p: Vector, a: Vector, b: Vector): Vector {
  const ab = sub(b, a);
  const t = Math.max(0, Math.min(1, dot(sub(p, a), ab) / dot(ab, ab)));
  return add(a, mul(ab, t));
}

export function updatePhysics(state: GameState): GameState {
  let { ball, flippers, score } = state;
  
  // 1. Update flippers
  ['left', 'right'].forEach((key) => {
      const f = flippers[key as 'left' | 'right'];
      const target = f.isPressed ? f.activeAngle : f.restAngle;
      const diff = target - f.angle;
      f.angle += diff * 0.2; // Smooth transition
      // Store approximate angular velocity for collision impulse
      f.angularVelocity = diff * 0.2;
  });

  // 2. Update Ball (Gravity + Friction)
  ball.vel.y += state.gravity;
  ball.vel = mul(ball.vel, FRICTION);
  ball.pos = add(ball.pos, ball.vel);

  // 3. Collisions
  
  // Walls
  state.walls.forEach(wall => {
      const closest = closestPointOnSegment(ball.pos, wall.p1, wall.p2);
      const d = sub(ball.pos, closest);
      const distMag = mag(d);
      
      if (distMag < ball.radius) {
          const normal = normalize(d);
          const pen = ball.radius - distMag;
          ball.pos = add(ball.pos, mul(normal, pen)); // Push out
          
          // Reflect
          const vDotN = dot(ball.vel, normal);
          if (vDotN < 0) {
              ball.vel = sub(ball.vel, mul(normal, 2 * vDotN));
              ball.vel = mul(ball.vel, RESTITUTION);
          }
      }
  });

  // Bumpers
  state.bumpers.forEach(bumper => {
      const d = sub(ball.pos, bumper.pos);
      const distMag = mag(d);
      const minDist = ball.radius + bumper.radius;
      
      if (distMag < minDist) {
          const normal = normalize(d);
          const pen = minDist - distMag;
          ball.pos = add(ball.pos, mul(normal, pen));
          
          const vDotN = dot(ball.vel, normal);
          if (vDotN < 0) {
              ball.vel = sub(ball.vel, mul(normal, 2 * vDotN));
              ball.vel = mul(ball.vel, 1.2); // Bumper boost
          }
          score += bumper.score;
      }
  });

  // Flippers
  ['left', 'right'].forEach(key => {
      const f = flippers[key as 'left' | 'right'];
      const p2 = {
          x: f.pivot.x + Math.cos(f.angle) * f.length,
          y: f.pivot.y + Math.sin(f.angle) * f.length
      };
      
      const closest = closestPointOnSegment(ball.pos, f.pivot, p2);
      const d = sub(ball.pos, closest);
      const distMag = mag(d);
      
      if (distMag < ball.radius) {
          const normal = normalize(d);
          const pen = ball.radius - distMag;
          ball.pos = add(ball.pos, mul(normal, pen));
          
          let vRel = ball.vel;
          
          // Add flipper velocity impulse at point of impact
          // v = r * w (tangential velocity)
          // Rough approximation
          const r = dist(f.pivot, closest);
          const tangent = { x: -Math.sin(f.angle), y: Math.cos(f.angle) };
          const flipperVel = mul(tangent, r * f.angularVelocity); // Angular velocity direction check needed
          
          // Relative velocity
          vRel = sub(ball.vel, flipperVel);
          
          const vDotN = dot(vRel, normal);
          if (vDotN < 0) {
               // Reflect relative velocity
               let j = -(1 + RESTITUTION) * vDotN;
               const impulse = mul(normal, j);
               ball.vel = add(ball.vel, impulse);
               
               // Add flipper kick
               if (Math.abs(f.angularVelocity) > 0.01) {
                   ball.vel = add(ball.vel, mul(normal, 5)); // Extra kick
               }
          }
      }
  });
  
  return { ...state, ball, score };
}
