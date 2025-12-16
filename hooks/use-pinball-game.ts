import { useRef, useEffect, useState, useCallback } from 'react';
import {
  type GameState,
  createInitialState,
  updatePhysics,
  GAME_WIDTH,
  GAME_HEIGHT,
} from '@/lib/games/pinball';

export function usePinballGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialState());
  const requestRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Input state
  const keys = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
        keys.current[e.key] = true; 
        if (e.key === ' ' && !gameOver) {
            // Plunger logic could be here or in loop
        }
    };
    const handleKeyUp = (e: KeyboardEvent) => { 
        keys.current[e.key] = false; 
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameOver]);

  const resetGame = useCallback(() => {
    stateRef.current = createInitialState();
    setScore(0);
    setLives(3);
    setGameOver(false);
    setIsPaused(false);
  }, []);

  const draw = (ctx: CanvasRenderingContext2D, state: GameState) => {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Draw walls
    ctx.strokeStyle = '#cbd5e1'; // slate-300
    ctx.lineWidth = 4;
    ctx.beginPath();
    state.walls.forEach(wall => {
        ctx.moveTo(wall.p1.x, wall.p1.y);
        ctx.lineTo(wall.p2.x, wall.p2.y);
    });
    ctx.stroke();

    // Draw bumpers
    ctx.fillStyle = '#ef4444'; // red-500
    state.bumpers.forEach(bumper => {
        ctx.beginPath();
        ctx.arc(bumper.pos.x, bumper.pos.y, bumper.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    });

    // Draw flippers
    ctx.fillStyle = '#3b82f6'; // blue-500
    ['left', 'right'].forEach(key => {
        const f = state.flippers[key as 'left' | 'right'];
        const p2 = {
            x: f.pivot.x + Math.cos(f.angle) * f.length,
            y: f.pivot.y + Math.sin(f.angle) * f.length
        };
        ctx.beginPath();
        ctx.lineWidth = 6;
        ctx.moveTo(f.pivot.x, f.pivot.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.lineWidth = 4; // reset
    });

    // Draw ball
    ctx.fillStyle = '#eab308'; // yellow-500
    ctx.beginPath();
    ctx.arc(state.ball.pos.x, state.ball.pos.y, state.ball.radius, 0, Math.PI * 2);
    ctx.fill();
  };

  const update = () => {
    if (gameOver || isPaused) return;

    const state = stateRef.current;

    // Handle Inputs
    state.flippers.left.isPressed = keys.current['ArrowLeft'] || keys.current['z'];
    state.flippers.right.isPressed = keys.current['ArrowRight'] || keys.current['/'];

    // Plunger
    if (keys.current[' '] && state.ball.pos.x > 350 && state.ball.pos.y > 400) {
        // Only if ball is in plunger lane
        state.ball.vel.y = -15; // Launch
    }

    // Physics
    const newState = updatePhysics(state);
    
    // Check death
    if (newState.ball.pos.y > GAME_HEIGHT + 20) {
        if (lives > 1) {
            setLives(l => l - 1);
            // Reset ball
            newState.ball.pos = { x: 380, y: 500 };
            newState.ball.vel = { x: 0, y: 0 };
        } else {
            setLives(0);
            setGameOver(true);
        }
    }

    stateRef.current = newState;
    
    // Sync score occasionally to avoid react render spam? 
    // Or just check if changed.
    if (newState.score !== score) {
        setScore(newState.score);
    }
  };

  const loop = () => {
    update();
    
    const canvas = canvasRef.current;
    if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            draw(ctx, stateRef.current);
        }
    }
    
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [lives, gameOver, isPaused, score]); // Re-bind if these change, though Ref is stable.

  return {
    canvasRef,
    score,
    lives,
    gameOver,
    isPaused,
    setIsPaused,
    resetGame
  };
}
