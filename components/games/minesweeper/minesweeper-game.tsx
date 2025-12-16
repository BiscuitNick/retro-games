"use client";

import { useCallback, useMemo, useRef } from "react";
import { useMinesweeperGame } from "@/hooks/use-minesweeper-game";
import { Button } from "@/components/ui/button";
import { Flag, Bomb, RotateCcw } from "lucide-react";

interface MinesweeperGameProps {
  width?: number;
  height?: number;
  mines?: number;
  cellSize?: number;
  showControls?: boolean;
}

const NUMBER_COLORS: Record<number, string> = {
  1: "text-[var(--color-game-blue)]",
  2: "text-[var(--color-game-green)]",
  3: "text-[var(--color-game-red)]",
  4: "text-[var(--color-neon-purple)]",
  5: "text-[var(--color-neon-yellow)]",
  6: "text-[var(--color-neon-cyan)]",
  7: "text-[var(--color-neon-pink)]",
  8: "text-[var(--color-neon-orange)]",
};

export function MinesweeperGame({
  width = 10,
  height = 10,
  mines = 15,
  cellSize = 32,
  showControls = true,
}: MinesweeperGameProps) {
  const { gameState, elapsedSeconds, minesRemaining, reveal, flag, reset } =
    useMinesweeperGame({ width, height, mines });

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressFiredRef = useRef(false);

  const boardStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${gameState.width}, ${cellSize}px)`,
      gridTemplateRows: `repeat(${gameState.height}, ${cellSize}px)`,
    }),
    [cellSize, gameState.width, gameState.height]
  );

  const handlePointerDown = useCallback(
    (x: number, y: number) => {
      longPressFiredRef.current = false;
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = setTimeout(() => {
        longPressFiredRef.current = true;
        flag(x, y);
      }, 350);
    },
    [flag]
  );

  const handlePointerUp = useCallback(
    (x: number, y: number) => {
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
      if (!longPressFiredRef.current) {
        reveal(x, y);
      }
      longPressFiredRef.current = false;
    },
    [reveal]
  );

  const handlePointerLeave = useCallback(() => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
    longPressFiredRef.current = false;
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      {showControls && (
        <div className="flex items-center justify-between w-full max-w-lg px-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 text-lg font-bold text-[var(--color-neon-cyan)]">
              <Flag className="h-4 w-4" />
              {minesRemaining}
            </span>
            <span className="text-sm text-[var(--muted-foreground)]">
              Time: {elapsedSeconds}s
            </span>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => reset()}
            aria-label="Reset"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="relative">
        <div
          className="grid border-2 border-[var(--color-neon-cyan)] rounded-lg overflow-hidden game-card-glow bg-[var(--color-arcade-black)] select-none touch-none"
          style={boardStyle}
        >
          {gameState.cells.map((cell) => {
            const isRevealed = cell.isRevealed;
            const isMine = cell.isMine;
            const number = cell.adjacentMines;
            const label = isRevealed
              ? isMine
                ? "Mine"
                : number > 0
                  ? `${number}`
                  : ""
              : cell.isFlagged
                ? "Flag"
                : "";

            return (
              <button
                key={`${cell.x}-${cell.y}`}
                type="button"
                onContextMenu={(e) => {
                  e.preventDefault();
                  flag(cell.x, cell.y);
                }}
                onPointerDown={() => handlePointerDown(cell.x, cell.y)}
                onPointerUp={() => handlePointerUp(cell.x, cell.y)}
                onPointerLeave={handlePointerLeave}
                className={[
                  "flex items-center justify-center border border-[var(--color-arcade-light)]",
                  "text-sm font-bold",
                  isRevealed
                    ? "bg-[var(--color-arcade-dark)]"
                    : "bg-[var(--color-arcade-gray)] hover:bg-[var(--color-arcade-light)]",
                ].join(" ")}
                style={{ width: cellSize, height: cellSize }}
                aria-label={`Cell ${cell.x + 1},${cell.y + 1} ${label}`}
                disabled={gameState.status === "lost" || gameState.status === "won"}
              >
                {isRevealed ? (
                  isMine ? (
                    <Bomb className="h-4 w-4 text-[var(--color-neon-pink)]" />
                  ) : number > 0 ? (
                    <span className={NUMBER_COLORS[number] ?? ""}>{number}</span>
                  ) : null
                ) : cell.isFlagged ? (
                  <Flag className="h-4 w-4 text-[var(--color-neon-yellow)]" />
                ) : null}
              </button>
            );
          })}
        </div>

        {gameState.status === "lost" && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
            <div className="text-center px-6">
              <p className="text-3xl font-bold text-[var(--color-neon-pink)] text-glow">
                BOOM
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                Right-click (or long press) flags, left click reveals
              </p>
              <Button variant="outline" className="mt-4" onClick={() => reset()}>
                Play Again
              </Button>
            </div>
          </div>
        )}

        {gameState.status === "won" && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg">
            <div className="text-center px-6">
              <p className="text-3xl font-bold text-[var(--color-neon-cyan)] text-glow">
                YOU WIN
              </p>
              <p className="text-sm text-[var(--muted-foreground)] mt-2">
                Cleared in {elapsedSeconds}s
              </p>
              <Button variant="outline" className="mt-4" onClick={() => reset()}>
                Play Again
              </Button>
            </div>
          </div>
        )}
      </div>

      {showControls && (
        <div className="text-sm text-[var(--muted-foreground)] text-center max-w-lg px-4">
          <p>Left click reveals a cell</p>
          <p>Right click (or long press) toggles a flag</p>
        </div>
      )}
    </div>
  );
}

