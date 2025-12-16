'use client';

import { usePinballGame } from '@/hooks/use-pinball-game';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GAME_WIDTH, GAME_HEIGHT } from '@/lib/games/pinball';
import { Play, Pause, RefreshCw } from 'lucide-react';

export function PinballGame() {
  const {
    canvasRef,
    score,
    lives,
    gameOver,
    isPaused,
    setIsPaused,
    resetGame,
  } = usePinballGame();

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex justify-between w-full max-w-[400px]">
        <Card className="px-4 py-2">
            <span className="text-sm text-muted-foreground mr-2">Score</span>
            <span className="font-bold text-xl">{score}</span>
        </Card>
        <Card className="px-4 py-2">
            <span className="text-sm text-muted-foreground mr-2">Lives</span>
            <span className="font-bold text-xl">{lives}</span>
        </Card>
      </div>

      <div className="relative rounded-xl overflow-hidden border-4 border-slate-700 shadow-2xl bg-slate-900">
        <canvas
            ref={canvasRef}
            width={GAME_WIDTH}
            height={GAME_HEIGHT}
            className="block bg-slate-900"
        />

        {/* Overlays */}
        {(gameOver) && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center animate-in fade-in">
                <h2 className="text-4xl font-bold text-red-500 mb-4">GAME OVER</h2>
                <Button onClick={resetGame} size="lg">Try Again</Button>
            </div>
        )}
        
        {isPaused && !gameOver && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                <h2 className="text-3xl font-bold text-white mb-6">PAUSED</h2>
                <Button onClick={() => setIsPaused(false)} variant="secondary">Resume</Button>
            </div>
        )}
      </div>

      <div className="flex gap-4 w-full max-w-[400px]">
         <Button 
            className="flex-1" 
            variant="outline" 
            onClick={() => setIsPaused(!isPaused)}
            disabled={gameOver}
         >
            {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
            {isPaused ? "Resume" : "Pause"}
         </Button>
         <Button 
            className="flex-1" 
            variant="destructive" 
            onClick={resetGame}
         >
            <RefreshCw className="w-4 h-4 mr-2" /> Reset
         </Button>
      </div>

      <Card className="p-4 w-full max-w-[400px] text-sm text-muted-foreground">
        <h4 className="font-semibold mb-2">Controls</h4>
        <ul className="space-y-1">
            <li className="flex justify-between"><span>Left Flipper</span> <kbd className="bg-muted px-1 rounded">← / Z</kbd></li>
            <li className="flex justify-between"><span>Right Flipper</span> <kbd className="bg-muted px-1 rounded">→ / /</kbd></li>
            <li className="flex justify-between"><span>Plunger</span> <kbd className="bg-muted px-1 rounded">Space</kbd></li>
        </ul>
      </Card>
    </div>
  );
}
