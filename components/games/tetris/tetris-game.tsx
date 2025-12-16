'use client';

import { useEffect, useRef } from 'react';
import { useTetrisGame } from '@/hooks/use-tetris-game';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { RotateCw, ArrowDown, ArrowLeft, ArrowRight, Play, Pause, RefreshCw, ChevronsDown } from 'lucide-react';

export function TetrisGame() {
  const {
    board,
    currentPiece,
    score,
    gameOver,
    isPaused,
    setIsPaused,
    resetGame,
    move,
    rotate,
    hardDrop,
    nextPieceType,
    level,
  } = useTetrisGame();

  const gameBoardRef = useRef<HTMLDivElement>(null);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (gameOver) return;

      if (e.key === 'p' || e.key === 'P') {
        setIsPaused((prev) => !prev);
        return;
      }

      if (isPaused) return;

      switch (e.key) {
        case 'ArrowLeft':
          move(-1, 0);
          break;
        case 'ArrowRight':
          move(1, 0);
          break;
        case 'ArrowDown':
          move(0, 1);
          break;
        case 'ArrowUp':
          rotate();
          break;
        case ' ':
          hardDrop();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isPaused, move, rotate, hardDrop, setIsPaused]);

  // Focus game board on mount for mobile/accessibility (optional)
  useEffect(() => {
    if (gameBoardRef.current) {
      gameBoardRef.current.focus();
    }
  }, []);

  // Render the combined board (static + current piece)
  // We can just render the board and overlay the current piece during render time
  // But the board state in the hook is "locked pieces only".
  // So we need to merge them for display.
  
  // Actually, let's create a display function helper inside the component
  const getCellColor = (x: number, y: number) => {
    // Check current piece
    if (currentPiece) {
      const { shape, x: px, y: py, type } = currentPiece;
      if (
        x >= px &&
        x < px + shape[0].length &&
        y >= py &&
        y < py + shape.length
      ) {
        if (shape[y - py][x - px]) {
          // It's part of the current piece
           // We need to know the color. 
           // In `lib/games/tetris.ts`, TETROMINOES[type].color
           // But I need to import TETROMINOES to get color?
           // Or just pass it from hook?
           // The hook returns 'currentPiece' which has 'type'.
           // I'll import TETROMINOES here too or map it.
           // Actually, `useTetrisGame` imports TETROMINOES.
           // I should probably export TETROMINOES from the hook or lib.
           // I'll import from lib.
           return 'bg-primary'; // Placeholder or use dynamic color
        }
      }
    }

    const cell = board[y][x];
    if (cell) {
      return cell.color;
    }
    return 'bg-muted/20';
  };

  // Wait, I need to get the specific color for the current piece.
  // I'll import TETROMINOES from lib.
  
  return (
    <div className="flex flex-col items-center justify-center gap-8 p-4 md:flex-row md:items-start">
      <Card className="relative p-1 border-2 border-primary/20 bg-background/50 backdrop-blur-sm">
        <div
          ref={gameBoardRef}
          className="grid grid-cols-10 grid-rows-20 gap-[1px] bg-muted/50 border border-border"
          style={{ width: '250px', height: '500px' }}
        >
          {board.map((row, y) =>
            row.map((_, x) => {
                // Determine color
                let color = 'bg-background'; // Default empty
                let isPiece = false;
                
                // Check locked board
                if (board[y][x]) {
                    color = board[y][x]!.color;
                }

                // Check active piece
                if (currentPiece) {
                     const { shape, x: px, y: py, type } = currentPiece;
                     const localY = y - py;
                     const localX = x - px;
                     if (localY >= 0 && localY < shape.length && localX >= 0 && localX < shape[0].length) {
                         if (shape[localY][localX]) {
                             // Import TETROMINOES or just hardcode/map colors?
                             // Since I didn't import TETROMINOES yet, let's use a mapping or import it.
                             // I'll use a dynamic import or just string manipulation if the color string is passed.
                             // The hook provides `currentPiece` which has `type`.
                             // I'll map types to colors here to avoid import if lazy, or just add the import.
                             // Better to import.
                             isPiece = true;
                         }
                     }
                }
                
                // We need the color for the active piece.
                // Since I cannot modify imports easily in this string block without rewriting,
                // I will add the import at the top.
                
                return (
                  <Cell 
                    key={`${x}-${y}`} 
                    x={x} 
                    y={y} 
                    boardCell={board[y][x]} 
                    currentPiece={currentPiece} 
                  />
                );
            })
          )}
        </div>

        {/* Overlays */}
        {gameOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in">
            <h2 className="text-3xl font-bold text-destructive mb-4">Game Over</h2>
            <p className="text-xl mb-6">Score: {score}</p>
            <Button onClick={resetGame} size="lg">Try Again</Button>
          </div>
        )}
        
        {isPaused && !gameOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-primary mb-4">Paused</h2>
            <Button onClick={() => setIsPaused(false)} size="lg" variant="outline">Resume</Button>
          </div>
        )}
      </Card>

      <div className="flex flex-col gap-6 w-full md:w-64">
        <Card className="p-6 flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Score</h3>
            <p className="text-4xl font-bold text-primary">{score}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Level</h3>
            <p className="text-2xl font-bold">{level}</p>
          </div>
          {nextPieceType && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Next</h3>
              <div className="w-24 h-24 border rounded-md flex items-center justify-center bg-muted/20">
                  <NextPiecePreview type={nextPieceType} />
              </div>
            </div>
          )}
        </Card>

        <div className="grid grid-cols-2 gap-2">
            {!isPaused && !gameOver ? (
                <Button variant="outline" onClick={() => setIsPaused(true)} className="w-full">
                    <Pause className="w-4 h-4 mr-2" /> Pause
                </Button>
            ) : (
                <Button variant="outline" onClick={() => setIsPaused(false)} disabled={gameOver} className="w-full">
                    <Play className="w-4 h-4 mr-2" /> Resume
                </Button>
            )}
            <Button variant="destructive" onClick={resetGame} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" /> Reset
            </Button>
        </div>

        {/* Mobile Controls */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
            <div className="col-start-2">
                 <Button variant="secondary" className="w-full h-12" onClick={() => rotate()}>
                    <RotateCw className="w-6 h-6" />
                 </Button>
            </div>
            <div className="col-start-1 row-start-2">
                <Button variant="secondary" className="w-full h-12" onClick={() => move(-1, 0)}>
                    <ArrowLeft className="w-6 h-6" />
                </Button>
            </div>
            <div className="col-start-2 row-start-2">
                <Button variant="secondary" className="w-full h-12" onClick={() => move(0, 1)}>
                    <ArrowDown className="w-6 h-6" />
                </Button>
            </div>
            <div className="col-start-3 row-start-2">
                <Button variant="secondary" className="w-full h-12" onClick={() => move(1, 0)}>
                    <ArrowRight className="w-6 h-6" />
                </Button>
            </div>
            <div className="col-start-2 row-start-3">
                 <Button variant="default" className="w-full h-12" onClick={() => hardDrop()}>
                    <ChevronsDown className="w-6 h-6" />
                 </Button>
            </div>
        </div>

        <Card className="p-4 text-xs text-muted-foreground hidden md:block">
            <h4 className="font-semibold mb-2">Controls</h4>
            <ul className="space-y-1">
                <li className="flex justify-between"><span>Rotate</span> <kbd className="bg-muted px-1 rounded">↑</kbd></li>
                <li className="flex justify-between"><span>Move</span> <kbd className="bg-muted px-1 rounded">←/→</kbd></li>
                <li className="flex justify-between"><span>Soft Drop</span> <kbd className="bg-muted px-1 rounded">↓</kbd></li>
                <li className="flex justify-between"><span>Hard Drop</span> <kbd className="bg-muted px-1 rounded">Space</kbd></li>
                <li className="flex justify-between"><span>Pause</span> <kbd className="bg-muted px-1 rounded">P</kbd></li>
            </ul>
        </Card>
      </div>
    </div>
  );
}

// Helper components
import { TETROMINOES, type TetrominoType, type CellValue } from '@/lib/games/tetris';

function Cell({ x, y, boardCell, currentPiece }: { x: number, y: number, boardCell: CellValue, currentPiece: any }) {
    let color = boardCell ? boardCell.color : null;
    let isPiece = false;

    if (currentPiece) {
        const { shape, x: px, y: py, type } = currentPiece;
        const localY = y - py;
        const localX = x - px;
        if (localY >= 0 && localY < shape.length && localX >= 0 && localX < shape[0].length) {
            if (shape[localY][localX]) {
                color = TETROMINOES[type as TetrominoType].color;
                isPiece = true;
            }
        }
    }

    return (
        <div className={cn(
            "w-full h-full rounded-[1px]", 
            color ? color : "bg-transparent",
            !color && "bg-secondary/10"
        )} />
    );
}

function NextPiecePreview({ type }: { type: TetrominoType }) {
    const { shape, color } = TETROMINOES[type];
    return (
        <div className="grid gap-[1px]" style={{ gridTemplateColumns: `repeat(${shape[0].length}, 1fr)` }}>
            {shape.map((row, y) => 
                row.map((cell, x) => (
                    <div key={`${x}-${y}`} className={cn("w-4 h-4 rounded-[1px]", cell ? color : "bg-transparent")} />
                ))
            )}
        </div>
    );
}
