"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  BarrackGameState,
  createInitialState,
  update,
  adjustAngle,
  adjustPower,
  fire,
  togglePause,
  resetGame,
} from "@/lib/games/barrack";

interface UseBarrackGameOptions {
  canvasWidth?: number;
  canvasHeight?: number;
}

export function useBarrackGame(options: UseBarrackGameOptions = {}) {
  const { canvasWidth = 800, canvasHeight = 500 } = options;

  const [gameState, setGameState] = useState<BarrackGameState>(() =>
    createInitialState(canvasWidth, canvasHeight)
  );

  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number | null>(null);

  // Game loop
  const gameLoop = useCallback(() => {
    setGameState((prev) => {
      let state = prev;

      // Handle continuous key presses for angle/power adjustment
      if (state.currentTurn === "player" && !state.isFiring) {
        if (keysPressed.current.has("ArrowLeft") || keysPressed.current.has("a")) {
          state = adjustAngle(state, 1);
        }
        if (keysPressed.current.has("ArrowRight") || keysPressed.current.has("d")) {
          state = adjustAngle(state, -1);
        }
        if (keysPressed.current.has("ArrowUp") || keysPressed.current.has("w")) {
          state = adjustPower(state, 1);
        }
        if (keysPressed.current.has("ArrowDown") || keysPressed.current.has("s")) {
          state = adjustPower(state, -1);
        }
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
        setGameState((prev) => fire(prev));
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

  const handleFire = useCallback(() => {
    setGameState((prev) => fire(prev));
  }, []);

  const handleTogglePause = useCallback(() => {
    setGameState((prev) => togglePause(prev));
  }, []);

  const handleReset = useCallback(() => {
    setGameState(resetGame(canvasWidth, canvasHeight));
  }, [canvasWidth, canvasHeight]);

  const handleAdjustAngle = useCallback((delta: number) => {
    setGameState((prev) => adjustAngle(prev, delta));
  }, []);

  const handleAdjustPower = useCallback((delta: number) => {
    setGameState((prev) => adjustPower(prev, delta));
  }, []);

  return {
    gameState,
    fire: handleFire,
    togglePause: handleTogglePause,
    reset: handleReset,
    adjustAngle: handleAdjustAngle,
    adjustPower: handleAdjustPower,
  };
}
