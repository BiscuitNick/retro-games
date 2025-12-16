"use client";

import { useEffect, useRef } from "react";
import { useAsteroidsGame } from "@/hooks/use-asteroids-game";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";
import { getShipPoints, getThrustPoints, ASTEROID_SIZES } from "@/lib/games/asteroids";

interface AsteroidsGameProps {
  canvasWidth?: number;
  canvasHeight?: number;
  showControls?: boolean;
}

export function AsteroidsGame({
  canvasWidth = 800,
  canvasHeight = 600,
  showControls = true,
}: AsteroidsGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState, togglePause, reset } = useAsteroidsGame({
    canvasWidth,
    canvasHeight,
  });

  const { ship, bullets, asteroids, score, lives, wave, isGameOver, isPaused, isInvulnerable } = gameState;

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw asteroids
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 2;
    asteroids.forEach((asteroid) => {
      ctx.beginPath();
      const vertices = asteroid.vertices;
      ctx.moveTo(
        asteroid.position.x + vertices[0].x,
        asteroid.position.y + vertices[0].y
      );
      for (let i = 1; i < vertices.length; i++) {
        ctx.lineTo(
          asteroid.position.x + vertices[i].x,
          asteroid.position.y + vertices[i].y
        );
      }
      ctx.closePath();
      ctx.stroke();
    });

    // Draw bullets
    ctx.fillStyle = "#ffff00";
    bullets.forEach((bullet) => {
      ctx.beginPath();
      ctx.arc(bullet.position.x, bullet.position.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw ship (with blinking when invulnerable)
    if (!isInvulnerable || Math.floor(Date.now() / 100) % 2 === 0) {
      const shipPoints = getShipPoints(ship);

      // Draw ship body
      ctx.strokeStyle = "#00ff00";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(shipPoints[0].x, shipPoints[0].y);
      for (let i = 1; i < shipPoints.length; i++) {
        ctx.lineTo(shipPoints[i].x, shipPoints[i].y);
      }
      ctx.closePath();
      ctx.stroke();

      // Draw thrust
      if (ship.isThrusting) {
        const thrustPoints = getThrustPoints(ship);
        ctx.strokeStyle = "#ff6600";
        ctx.beginPath();
        ctx.moveTo(thrustPoints[0].x, thrustPoints[0].y);
        ctx.lineTo(thrustPoints[1].x, thrustPoints[1].y);
        ctx.lineTo(thrustPoints[2].x, thrustPoints[2].y);
        ctx.closePath();
        ctx.stroke();
      }
    }

    // Draw HUD
    ctx.fillStyle = "#00ffff";
    ctx.font = "20px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Wave: ${wave}`, 10, 55);

    // Draw lives
    ctx.textAlign = "right";
    ctx.fillText(`Lives: ${lives}`, canvasWidth - 10, 30);

  }, [ship, bullets, asteroids, score, lives, wave, isInvulnerable, canvasWidth, canvasHeight]);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Controls */}
      {showControls && (
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold text-[var(--color-neon-cyan)]">
            Score: {score}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={togglePause}
              disabled={isGameOver}
              aria-label={isPaused ? "Play" : "Pause"}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={reset}
              aria-label="Reset"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-lg text-[var(--muted-foreground)]">
            Lives: {lives} | Wave: {wave}
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className="border-2 border-[var(--color-neon-cyan)] rounded-lg"
        />

        {/* Pause Overlay */}
        {isPaused && !isGameOver && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--color-neon-cyan)] text-glow">
                PAUSED
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                Press Space or Esc to continue
              </p>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--color-neon-pink)] text-glow">
                GAME OVER
              </p>
              <p className="text-xl text-[var(--color-neon-cyan)] mt-2">
                Score: {score}
              </p>
              <p className="text-lg text-[var(--muted-foreground)] mt-1">
                Wave: {wave}
              </p>
              <Button variant="outline" className="mt-4" onClick={reset}>
                Play Again
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Controls Help */}
      {showControls && (
        <div className="text-sm text-[var(--muted-foreground)] text-center">
          <p>Arrow Keys or WASD to move, Space to shoot</p>
          <p>Esc to pause, R to restart</p>
        </div>
      )}
    </div>
  );
}
