"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  LifeGameState,
  createInitialState,
  stepGeneration,
  setCell,
  clearGrid,
  randomizeGrid,
  setSpeed,
  toggleRunning,
  applyPattern,
  Pattern,
  SPEED_MS,
} from "@/lib/games/conways-life";

interface UseLifeGameOptions {
  gridWidth?: number;
  gridHeight?: number;
}

export function useLifeGame(options: UseLifeGameOptions = {}) {
  const { gridWidth = 40, gridHeight = 30 } = options;

  const [gameState, setGameState] = useState<LifeGameState>(() =>
    createInitialState(gridWidth, gridHeight)
  );

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle running state changes
  useEffect(() => {
    if (gameState.isRunning) {
      intervalRef.current = setInterval(() => {
        setGameState((prev) => stepGeneration(prev));
      }, SPEED_MS[gameState.speed]);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameState.isRunning, gameState.speed]);

  const handleToggleCell = useCallback((x: number, y: number) => {
    setGameState((prev) => setCell(prev, x, y));
  }, []);

  const handleToggleRunning = useCallback(() => {
    setGameState((prev) => toggleRunning(prev));
  }, []);

  const handleStep = useCallback(() => {
    setGameState((prev) => stepGeneration(prev));
  }, []);

  const handleClear = useCallback(() => {
    setGameState((prev) => clearGrid(prev));
  }, []);

  const handleRandomize = useCallback(() => {
    setGameState((prev) => randomizeGrid(prev));
  }, []);

  const handleSetSpeed = useCallback((speed: LifeGameState["speed"]) => {
    setGameState((prev) => setSpeed(prev, speed));
  }, []);

  const handleApplyPattern = useCallback((pattern: Pattern) => {
    setGameState((prev) => applyPattern(prev, pattern));
  }, []);

  return {
    gameState,
    toggleCell: handleToggleCell,
    toggleRunning: handleToggleRunning,
    step: handleStep,
    clear: handleClear,
    randomize: handleRandomize,
    setSpeed: handleSetSpeed,
    applyPattern: handleApplyPattern,
  };
}
