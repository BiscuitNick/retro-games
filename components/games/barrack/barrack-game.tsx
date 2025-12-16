"use client";

import { useEffect, useRef } from "react";
import { useBarrackGame } from "@/hooks/use-barrack-game";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, Crosshair } from "lucide-react";
import { TANK_WIDTH, TANK_HEIGHT, BARREL_LENGTH, EXPLOSION_RADIUS } from "@/lib/games/barrack";

interface BarrackGameProps {
  canvasWidth?: number;
  canvasHeight?: number;
  showControls?: boolean;
}

export function BarrackGame({
  canvasWidth = 800,
  canvasHeight = 500,
  showControls = true,
}: BarrackGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gameState, fire, togglePause, reset } = useBarrackGame({
    canvasWidth,
    canvasHeight,
  });

  const {
    terrain,
    player,
    enemies,
    projectile,
    explosions,
    wind,
    score,
    currentTurn,
    isGameOver,
    isPaused,
    isFiring,
  } = gameState;

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas with sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    gradient.addColorStop(0, "#1a1a2e");
    gradient.addColorStop(1, "#0a0a0f");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw terrain
    ctx.fillStyle = "#2d5a27";
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight);
    for (let x = 0; x < terrain.length; x++) {
      ctx.lineTo(x, terrain[x]);
    }
    ctx.lineTo(canvasWidth, canvasHeight);
    ctx.closePath();
    ctx.fill();

    // Draw terrain outline
    ctx.strokeStyle = "#4a8a40";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, terrain[0]);
    for (let x = 1; x < terrain.length; x++) {
      ctx.lineTo(x, terrain[x]);
    }
    ctx.stroke();

    // Draw tanks
    const drawTank = (tank: typeof player, color: string) => {
      if (tank.health <= 0) return;

      const { position, angle } = tank;

      // Tank body
      ctx.fillStyle = color;
      ctx.fillRect(
        position.x - TANK_WIDTH / 2,
        position.y - TANK_HEIGHT,
        TANK_WIDTH,
        TANK_HEIGHT
      );

      // Tank turret
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(position.x, position.y - TANK_HEIGHT, 8, 0, Math.PI * 2);
      ctx.fill();

      // Barrel
      const angleRad = (angle * Math.PI) / 180;
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(position.x, position.y - TANK_HEIGHT);
      ctx.lineTo(
        position.x + Math.cos(angleRad) * BARREL_LENGTH,
        position.y - TANK_HEIGHT - Math.sin(angleRad) * BARREL_LENGTH
      );
      ctx.stroke();

      // Health bar
      const healthBarWidth = TANK_WIDTH;
      const healthBarHeight = 4;
      const healthPercent = tank.health / 100;

      ctx.fillStyle = "#333";
      ctx.fillRect(
        position.x - healthBarWidth / 2,
        position.y - TANK_HEIGHT - 15,
        healthBarWidth,
        healthBarHeight
      );

      ctx.fillStyle = healthPercent > 0.5 ? "#00ff00" : healthPercent > 0.25 ? "#ffff00" : "#ff0000";
      ctx.fillRect(
        position.x - healthBarWidth / 2,
        position.y - TANK_HEIGHT - 15,
        healthBarWidth * healthPercent,
        healthBarHeight
      );
    };

    // Draw player tank (green)
    drawTank(player, "#00ff00");

    // Draw enemy tanks (red)
    enemies.forEach((enemy) => {
      if (enemy.health > 0) {
        drawTank(enemy, "#ff3366");
      }
    });

    // Draw projectile
    if (projectile && projectile.active) {
      ctx.fillStyle = "#ffff00";
      ctx.beginPath();
      ctx.arc(projectile.position.x, projectile.position.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Trail
      ctx.strokeStyle = "rgba(255, 255, 0, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(projectile.position.x, projectile.position.y);
      ctx.lineTo(
        projectile.position.x - projectile.velocity.x * 3,
        projectile.position.y - projectile.velocity.y * 3
      );
      ctx.stroke();
    }

    // Draw explosions
    explosions.forEach((explosion) => {
      const progress = explosion.frame / explosion.maxFrames;
      const currentRadius = EXPLOSION_RADIUS * (1 + progress);
      const alpha = 1 - progress;

      const gradient = ctx.createRadialGradient(
        explosion.position.x,
        explosion.position.y,
        0,
        explosion.position.x,
        explosion.position.y,
        currentRadius
      );
      gradient.addColorStop(0, `rgba(255, 200, 0, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(255, 100, 0, ${alpha * 0.7})`);
      gradient.addColorStop(1, `rgba(255, 0, 0, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(explosion.position.x, explosion.position.y, currentRadius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw wind indicator
    ctx.fillStyle = "#00ffff";
    ctx.font = "16px monospace";
    ctx.textAlign = "center";
    const windText = wind > 0 ? `Wind: → ${wind}` : wind < 0 ? `Wind: ← ${Math.abs(wind)}` : "Wind: None";
    ctx.fillText(windText, canvasWidth / 2, 25);

    // Draw turn indicator
    ctx.fillStyle = currentTurn === "player" ? "#00ff00" : "#ff3366";
    ctx.font = "14px monospace";
    ctx.fillText(
      currentTurn === "player" ? "Your Turn" : "Enemy Turn",
      canvasWidth / 2,
      45
    );

    // Draw HUD
    ctx.fillStyle = "#00ffff";
    ctx.font = "16px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${score}`, 10, 25);
    ctx.fillText(`Angle: ${player.angle}°`, 10, 45);
    ctx.fillText(`Power: ${player.power}%`, 10, 65);

  }, [terrain, player, enemies, projectile, explosions, wind, score, currentTurn, canvasWidth, canvasHeight]);

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
              onClick={fire}
              disabled={isGameOver || isPaused || currentTurn !== "player" || isFiring}
              aria-label="Fire"
            >
              <Crosshair className="h-4 w-4" />
            </Button>
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
            {currentTurn === "player" ? "Your Turn" : "Enemy Turn"}
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
                Press Esc to continue
              </p>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--color-neon-pink)] text-glow">
                {player.health <= 0 ? "GAME OVER" : "VICTORY!"}
              </p>
              <p className="text-xl text-[var(--color-neon-cyan)] mt-2">
                Score: {score}
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
          <p>Arrow Keys or WASD to adjust angle/power</p>
          <p>Space to fire, Esc to pause, R to restart</p>
        </div>
      )}
    </div>
  );
}
