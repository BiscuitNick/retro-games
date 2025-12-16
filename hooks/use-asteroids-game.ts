"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AsteroidsGameState,
  createInitialState,
  update,
  rotateLeft,
  rotateRight,
  setThrusting,
  fireBullet,
  togglePause,
  resetGame,
} from "@/lib/games/asteroids";

interface UseAsteroidsGameOptions {
  canvasWidth?: number;
  canvasHeight?: number;
}

export function useAsteroidsGame(options: UseAsteroidsGameOptions = {}) {
  const { canvasWidth = 800, canvasHeight = 600 } = options;

  const [gameState, setGameState] = useState<AsteroidsGameState>(() =>
    createInitialState(canvasWidth, canvasHeight)
  );

  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number | null>(null);

  // Game loop
  const gameLoop = useCallback(() => {
    setGameState((prev) => {
      let state = prev;

      // Handle continuous key presses
      if (keysPressed.current.has("ArrowLeft") || keysPressed.current.has("a") || keysPressed.current.has("A")) {
        state = rotateLeft(state);
      }
      if (keysPressed.current.has("ArrowRight") || keysPressed.current.has("d") || keysPressed.current.has("D")) {
        state = rotateRight(state);
      }
      if (keysPressed.current.has("ArrowUp") || keysPressed.current.has("w") || keysPressed.current.has("W")) {
        state = setThrusting(state, true);
      } else {
        state = setThrusting(state, false);
      }

      return update(state);
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, []);

  // Start/stop game loop
  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameLoop]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);

      if (e.key === " ") {
        e.preventDefault();
        setGameState((prev) => fireBullet(prev));
      }

      if (e.key === "Escape" || e.key === "p" || e.key === "P") {
        e.preventDefault();
        setGameState((prev) => togglePause(prev));
      }

      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        setGameState(resetGame(canvasWidth, canvasHeight));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [canvasWidth, canvasHeight]);

  const handleTogglePause = useCallback(() => {
    setGameState((prev) => togglePause(prev));
  }, []);

  const handleReset = useCallback(() => {
    setGameState(resetGame(canvasWidth, canvasHeight));
  }, [canvasWidth, canvasHeight]);

  const handleFire = useCallback(() => {
    setGameState((prev) => fireBullet(prev));
  }, []);

  return {
    gameState,
    togglePause: handleTogglePause,
    reset: handleReset,
    fire: handleFire,
  };
}
