"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MinesweeperGameState,
  createInitialState,
  resetGame,
  revealCell,
  toggleFlag,
} from "@/lib/games/minesweeper";

interface UseMinesweeperGameOptions {
  width?: number;
  height?: number;
  mines?: number;
}

export function useMinesweeperGame(options: UseMinesweeperGameOptions = {}) {
  const { width = 10, height = 10, mines = 15 } = options;

  const [gameState, setGameState] = useState<MinesweeperGameState>(() =>
    createInitialState(width, height, mines)
  );

  const [now, setNow] = useState(() => Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameState.status !== "playing" || !gameState.startedAt) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
      return;
    }

    timerRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [gameState.status, gameState.startedAt]);

  const elapsedSeconds = useMemo(() => {
    if (!gameState.startedAt) return 0;
    const end = gameState.endedAt ?? now;
    return Math.max(0, Math.floor((end - gameState.startedAt) / 1000));
  }, [gameState.startedAt, gameState.endedAt, now]);

  const reveal = useCallback((x: number, y: number) => {
    setGameState((prev) => revealCell(prev, x, y));
  }, []);

  const flag = useCallback((x: number, y: number) => {
    setGameState((prev) => toggleFlag(prev, x, y));
  }, []);

  const reset = useCallback(
    (next?: UseMinesweeperGameOptions) => {
      const w = next?.width ?? width;
      const h = next?.height ?? height;
      const m = next?.mines ?? mines;
      setNow(Date.now());
      setGameState(resetGame(w, h, m));
    },
    [width, height, mines]
  );

  const minesRemaining = Math.max(0, gameState.mines - gameState.flaggedCount);

  return {
    gameState,
    elapsedSeconds,
    minesRemaining,
    reveal,
    flag,
    reset,
  };
}

