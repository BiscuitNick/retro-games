"use client";

import { useSnakeGame } from "@/hooks/use-snake-game";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

interface SnakeGameProps {
  gridWidth?: number;
  gridHeight?: number;
  cellSize?: number;
  showControls?: boolean;
}

export function SnakeGame({
  gridWidth = 20,
  gridHeight = 20,
  cellSize = 20,
  showControls = true,
}: SnakeGameProps) {
  const { gameState, togglePause, reset } = useSnakeGame({
    gridWidth,
    gridHeight,
    autoStart: true,
  });

  const { snake, food, score, isGameOver, isPaused } = gameState;

  const canvasWidth = gridWidth * cellSize;
  const canvasHeight = gridHeight * cellSize;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Score Display */}
      <div className="flex items-center justify-between w-full max-w-md px-4">
        <span className="text-xl font-bold text-[var(--color-neon-cyan)]">
          Score: {score}
        </span>
        {showControls && (
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
        )}
      </div>

      {/* Game Board */}
      <div
        className="relative border-2 border-[var(--color-neon-cyan)] rounded-lg overflow-hidden game-card-glow"
        style={{ width: canvasWidth, height: canvasHeight }}
      >
        {/* Grid Background */}
        <div
          className="absolute inset-0 bg-[var(--arcade-black)]"
          style={{
            backgroundImage: `
              linear-gradient(var(--color-arcade-gray) 1px, transparent 1px),
              linear-gradient(90deg, var(--color-arcade-gray) 1px, transparent 1px)
            `,
            backgroundSize: `${cellSize}px ${cellSize}px`,
          }}
        />

        {/* Snake */}
        {snake.map((segment, index) => (
          <div
            key={index}
            className={`absolute rounded-sm ${
              index === 0
                ? "bg-[var(--color-neon-green)]"
                : "bg-[var(--color-neon-cyan)]"
            }`}
            style={{
              left: segment.x * cellSize + 1,
              top: segment.y * cellSize + 1,
              width: cellSize - 2,
              height: cellSize - 2,
              boxShadow:
                index === 0
                  ? "0 0 8px var(--color-neon-green)"
                  : "0 0 4px var(--color-neon-cyan)",
            }}
          />
        ))}

        {/* Food */}
        <div
          className="absolute rounded-full bg-[var(--color-neon-pink)]"
          style={{
            left: food.x * cellSize + 2,
            top: food.y * cellSize + 2,
            width: cellSize - 4,
            height: cellSize - 4,
            boxShadow: "0 0 10px var(--color-neon-pink)",
          }}
        />

        {/* Pause Overlay */}
        {isPaused && !isGameOver && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--color-neon-cyan)] text-glow">
                PAUSED
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                Press Space to continue
              </p>
            </div>
          </div>
        )}

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-[var(--color-neon-pink)] text-glow">
                GAME OVER
              </p>
              <p className="text-xl text-[var(--color-neon-cyan)] mt-2">
                Score: {score}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={reset}
              >
                Play Again
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Controls Help */}
      {showControls && (
        <div className="text-sm text-[var(--muted-foreground)] text-center">
          <p>Use Arrow Keys or WASD to move</p>
          <p>Space to pause, R to restart</p>
        </div>
      )}
    </div>
  );
}
