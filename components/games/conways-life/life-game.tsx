"use client";

import { useLifeGame } from "@/hooks/use-life-game";
import { Button } from "@/components/ui/button";
import { PATTERNS } from "@/lib/games/conways-life";
import { Play, Pause, SkipForward, Trash2, Shuffle } from "lucide-react";

interface LifeGameProps {
  gridWidth?: number;
  gridHeight?: number;
  cellSize?: number;
  showControls?: boolean;
}

export function LifeGame({
  gridWidth = 40,
  gridHeight = 30,
  cellSize = 15,
  showControls = true,
}: LifeGameProps) {
  const {
    gameState,
    toggleCell,
    toggleRunning,
    step,
    clear,
    randomize,
    setSpeed,
    applyPattern,
  } = useLifeGame({ gridWidth, gridHeight });

  const { grid, generation, isRunning, speed } = gameState;

  const canvasWidth = gridWidth * cellSize;
  const canvasHeight = gridHeight * cellSize;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Controls */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {/* Play/Pause */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleRunning}
            aria-label={isRunning ? "Pause" : "Play"}
          >
            {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>

          {/* Step */}
          <Button
            variant="outline"
            size="icon"
            onClick={step}
            disabled={isRunning}
            aria-label="Step"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          {/* Clear */}
          <Button
            variant="outline"
            size="icon"
            onClick={clear}
            aria-label="Clear"
          >
            <Trash2 className="h-4 w-4" />
          </Button>

          {/* Random */}
          <Button
            variant="outline"
            size="icon"
            onClick={randomize}
            aria-label="Randomize"
          >
            <Shuffle className="h-4 w-4" />
          </Button>

          {/* Speed Controls */}
          <div className="flex gap-1 ml-2">
            {(["slow", "medium", "fast"] as const).map((s) => (
              <Button
                key={s}
                variant={speed === s ? "default" : "outline"}
                size="sm"
                onClick={() => setSpeed(s)}
                className="capitalize"
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Generation Counter */}
      <div className="text-xl font-bold text-[var(--color-neon-cyan)]">
        Generation: {generation}
      </div>

      {/* Grid */}
      <div
        className="relative border-2 border-[var(--color-neon-cyan)] rounded-lg overflow-hidden cursor-crosshair"
        style={{ width: canvasWidth, height: canvasHeight }}
      >
        {/* Background Grid Lines */}
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

        {/* Cells */}
        {grid.map((row, y) =>
          row.map(
            (cell, x) =>
              cell && (
                <div
                  key={`${x}-${y}`}
                  className="absolute bg-[var(--color-neon-cyan)]"
                  style={{
                    left: x * cellSize + 1,
                    top: y * cellSize + 1,
                    width: cellSize - 2,
                    height: cellSize - 2,
                    boxShadow: "0 0 4px var(--color-neon-cyan)",
                  }}
                />
              )
          )
        )}

        {/* Click Overlay */}
        <div
          className="absolute inset-0"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / cellSize);
            const y = Math.floor((e.clientY - rect.top) / cellSize);
            if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
              toggleCell(x, y);
            }
          }}
        />
      </div>

      {/* Patterns */}
      {showControls && (
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-[var(--muted-foreground)]">Patterns:</span>
          <div className="flex flex-wrap justify-center gap-2">
            {PATTERNS.map((pattern) => (
              <Button
                key={pattern.name}
                variant="outline"
                size="sm"
                onClick={() => applyPattern(pattern)}
              >
                {pattern.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Help */}
      {showControls && (
        <div className="text-sm text-[var(--muted-foreground)] text-center">
          <p>Click on cells to toggle them</p>
        </div>
      )}
    </div>
  );
}
