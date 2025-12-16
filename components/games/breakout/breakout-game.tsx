"use client";

import { useEffect, useMemo, useRef } from "react";
import { useBreakoutGame } from "@/hooks/use-breakout-game";
import { Button } from "@/components/ui/button";
import { Pause, Play, RotateCcw } from "lucide-react";

interface BreakoutGameProps {
  width?: number;
  height?: number;
  showControls?: boolean;
}

export function BreakoutGame({ width = 480, height = 320, showControls = true }: BreakoutGameProps) {
  const { gameState, hud, setInput, primary, reset } = useBreakoutGame({ width, height });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const pixelRatio = useMemo(
    () =>
      typeof window === "undefined"
        ? 1
        : Math.max(1, Math.floor(window.devicePixelRatio || 1)),
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = gameState.width * pixelRatio;
    canvas.height = gameState.height * pixelRatio;
    canvas.style.width = `${gameState.width}px`;
    canvas.style.height = `${gameState.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    // Background
    ctx.fillStyle = "rgba(10, 10, 15, 1)";
    ctx.fillRect(0, 0, gameState.width, gameState.height);

    // Bricks
    for (const brick of gameState.bricks) {
      if (!brick.isAlive) continue;
      const glow = "rgba(0, 255, 255, 0.35)";
      ctx.fillStyle = "rgba(0, 255, 255, 0.85)";
      ctx.shadowColor = glow;
      ctx.shadowBlur = 10;
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
    }
    ctx.shadowBlur = 0;

    // Paddle
    ctx.fillStyle = "rgba(57, 255, 20, 0.9)";
    ctx.shadowColor = "rgba(57, 255, 20, 0.35)";
    ctx.shadowBlur = 12;
    ctx.fillRect(
      gameState.paddle.x,
      gameState.paddle.y,
      gameState.paddle.width,
      gameState.paddle.height
    );
    ctx.shadowBlur = 0;

    // Ball
    ctx.beginPath();
    ctx.arc(gameState.ball.x, gameState.ball.y, gameState.ball.radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "rgba(255, 0, 255, 0.9)";
    ctx.shadowColor = "rgba(255, 0, 255, 0.4)";
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.shadowBlur = 0;

    // HUD overlay
    ctx.fillStyle = "rgba(237, 237, 237, 0.85)";
    ctx.font = "bold 14px system-ui";
    ctx.fillText(`Score: ${hud.score}`, 12, 20);
    ctx.fillText(`Lives: ${hud.lives}`, gameState.width - 88, 20);

    if (hud.status === "ready") {
      ctx.fillStyle = "rgba(0, 255, 255, 0.9)";
      ctx.font = "bold 16px system-ui";
      ctx.fillText("Press Space to Launch", 140, gameState.height / 2);
    }

    if (hud.status === "paused") {
      ctx.fillStyle = "rgba(255, 255, 0, 0.9)";
      ctx.font = "bold 16px system-ui";
      ctx.fillText("PAUSED", 210, gameState.height / 2);
    }

    if (hud.status === "won") {
      ctx.fillStyle = "rgba(0, 255, 255, 0.95)";
      ctx.font = "bold 20px system-ui";
      ctx.fillText("YOU WIN!", 190, gameState.height / 2);
    }

    if (hud.status === "lost") {
      ctx.fillStyle = "rgba(255, 0, 255, 0.95)";
      ctx.font = "bold 20px system-ui";
      ctx.fillText("GAME OVER", 175, gameState.height / 2);
    }
  }, [gameState, hud, pixelRatio]);

  return (
    <div className="flex flex-col items-center gap-4">
      {showControls && (
        <div className="flex items-center justify-between w-full max-w-lg px-4">
          <div className="text-lg font-bold text-[var(--color-neon-cyan)]">
            Score: {hud.score}{" "}
            <span className="text-sm text-[var(--muted-foreground)] ml-2">
              Lives: {hud.lives}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={primary}
              aria-label={hud.status === "paused" ? "Resume" : "Pause or Launch"}
            >
              {hud.status === "paused" ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="icon" onClick={reset} aria-label="Reset">
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div
        className="border-2 border-[var(--color-neon-cyan)] rounded-lg overflow-hidden game-card-glow bg-[var(--color-arcade-black)] touch-none select-none"
        onPointerDown={(e) => {
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const x = e.clientX - rect.left;
          setInput({ left: x < rect.width * 0.45, right: x > rect.width * 0.55 });
        }}
        onPointerUp={() => setInput({ left: false, right: false })}
        onPointerCancel={() => setInput({ left: false, right: false })}
        onClick={() => {
          if (hud.status === "ready" || hud.status === "paused") primary();
        }}
        style={{ width: `${width}px`, height: `${height}px` }}
      >
        <canvas ref={canvasRef} className="block" />
      </div>

      {showControls && (
        <div className="text-sm text-[var(--muted-foreground)] text-center max-w-lg px-4">
          <p>Arrow Keys / A-D to move, Space to launch/pause</p>
          <p>Tap/drag on the board for touch controls</p>
        </div>
      )}
    </div>
  );
}
