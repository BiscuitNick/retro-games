"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  SnakeGameState,
  createInitialState,
  moveSnake,
  setDirection,
  togglePause,
  resetGame,
  getDirectionFromKey,
  getDirectionFromSwipe,
  Direction,
} from "@/lib/games/snake";

interface UseSnakeGameOptions {
  gridWidth?: number;
  gridHeight?: number;
  autoStart?: boolean;
}

export function useSnakeGame(options: UseSnakeGameOptions = {}) {
  const { gridWidth = 20, gridHeight = 20, autoStart = false } = options;

  const [gameState, setGameState] = useState<SnakeGameState>(() =>
    createInitialState(gridWidth, gridHeight)
  );

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Start the game loop
  const startGameLoop = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }

    gameLoopRef.current = setInterval(() => {
      setGameState((prevState) => moveSnake(prevState));
    }, gameState.speed);
  }, [gameState.speed]);

  // Stop the game loop
  const stopGameLoop = useCallback(() => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  }, []);

  // Update game loop when speed changes
  useEffect(() => {
    if (!gameState.isPaused && !gameState.isGameOver) {
      startGameLoop();
    }
    return () => stopGameLoop();
  }, [gameState.speed, gameState.isPaused, gameState.isGameOver, startGameLoop, stopGameLoop]);

  // Handle direction change
  const changeDirection = useCallback((direction: Direction) => {
    setGameState((prevState) => setDirection(prevState, direction));
  }, []);

  // Handle pause toggle
  const handleTogglePause = useCallback(() => {
    setGameState((prevState) => togglePause(prevState));
  }, []);

  // Handle reset
  const handleReset = useCallback(() => {
    stopGameLoop();
    setGameState(resetGame(gridWidth, gridHeight));
  }, [gridWidth, gridHeight, stopGameLoop]);

  // Keyboard controls
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === " " || event.key === "Escape") {
        event.preventDefault();
        handleTogglePause();
        return;
      }

      if (event.key === "r" || event.key === "R") {
        event.preventDefault();
        handleReset();
        return;
      }

      const direction = getDirectionFromKey(event.key);
      if (direction) {
        event.preventDefault();
        changeDirection(direction);
      }
    },
    [changeDirection, handleTogglePause, handleReset]
  );

  // Touch controls
  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (!touchStartRef.current) return;

      const touch = event.changedTouches[0];
      const direction = getDirectionFromSwipe(
        touchStartRef.current.x,
        touchStartRef.current.y,
        touch.clientX,
        touch.clientY
      );

      if (direction) {
        changeDirection(direction);
      }

      touchStartRef.current = null;
    },
    [changeDirection]
  );

  // Set up event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleKeyDown, handleTouchStart, handleTouchEnd]);

  // Auto-start if option is enabled
  useEffect(() => {
    if (autoStart && !gameState.isPaused && !gameState.isGameOver) {
      startGameLoop();
    }
  }, [autoStart, gameState.isPaused, gameState.isGameOver, startGameLoop]);

  return {
    gameState,
    changeDirection,
    togglePause: handleTogglePause,
    reset: handleReset,
  };
}
