"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  BreakoutGameState,
  BreakoutInputState,
  BreakoutOptions,
  createInitialState,
  getBreakoutKeyIntent,
  launchBall,
  resetGame,
  stepGame,
  togglePause,
} from "@/lib/games/breakout";

interface UseBreakoutGameOptions extends BreakoutOptions {
  autoStart?: boolean;
}

export function useBreakoutGame(options: UseBreakoutGameOptions = {}) {
  const { autoStart = false, ...gameOptions } = options;

  const [gameState, setGameState] = useState<BreakoutGameState>(() =>
    createInitialState(gameOptions)
  );

  const inputRef = useRef<BreakoutInputState>({ left: false, right: false });
  const rafRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const tick = useCallback(() => {
    setGameState((prev) => stepGame(prev, inputRef.current));
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const start = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  useEffect(() => {
    if (gameState.status === "playing") start();
    else stop();
    return () => stop();
  }, [gameState.status, start, stop]);

  useEffect(() => {
    if (autoStart && gameState.status === "ready" && !gameState.ball.isLaunched) {
      setGameState((prev) => launchBall(prev));
    }
  }, [autoStart, gameState.status, gameState.ball.isLaunched]);

  const setInput = useCallback((partial: Partial<BreakoutInputState>) => {
    inputRef.current = { ...inputRef.current, ...partial };
  }, []);

  const primary = useCallback(() => {
    setGameState((prev) => {
      if (prev.status === "won" || prev.status === "lost") return prev;
      if (!prev.ball.isLaunched) return launchBall(prev);
      return togglePause(prev);
    });
  }, []);

  const reset = useCallback(() => {
    stop();
    inputRef.current = { left: false, right: false };
    setGameState(resetGame(gameOptions));
  }, [gameOptions, stop]);

  const pause = useCallback(() => {
    setGameState((prev) => togglePause(prev));
  }, []);

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const intent = getBreakoutKeyIntent(event.key);
      if (!intent) return;
      event.preventDefault();

      if (intent === "LEFT") setInput({ left: true });
      if (intent === "RIGHT") setInput({ right: true });
      if (intent === "PRIMARY") primary();
      if (intent === "PAUSE") pause();
      if (intent === "RESET") reset();
    };

    const onKeyUp = (event: KeyboardEvent) => {
      const intent = getBreakoutKeyIntent(event.key);
      if (!intent) return;
      event.preventDefault();

      if (intent === "LEFT") setInput({ left: false });
      if (intent === "RIGHT") setInput({ right: false });
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [pause, primary, reset, setInput]);

  const hud = useMemo(
    () => ({
      score: gameState.score,
      lives: gameState.lives,
      status: gameState.status,
    }),
    [gameState.lives, gameState.score, gameState.status]
  );

  return {
    gameState,
    hud,
    setInput,
    primary,
    pause,
    reset,
  };
}

