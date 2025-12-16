'use client';

import { useSpaceInvadersGame } from '@/hooks/use-space-invaders-game';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Play, Pause, RefreshCw, Heart } from 'lucide-react';
import { GAME_WIDTH, GAME_HEIGHT } from '@/lib/games/space-invaders';

export function SpaceInvadersGame() {
  const {
    player,
    aliens,
    bullets,
    score,
    gameOver,
    gameWon,
    isPaused,
    setIsPaused,
    resetGame,
  } = useSpaceInvadersGame();

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto">
      <Card className="p-4 bg-background/95 backdrop-blur flex justify-between items-center w-full max-w-[800px]">
         <div className="flex flex-col">
             <span className="text-xs text-muted-foreground uppercase tracking-wider">Score</span>
             <span className="text-2xl font-bold font-mono">{score.toString().padStart(6, '0')}</span>
         </div>
         <div className="flex gap-2">
            {Array.from({ length: Math.max(0, player.lives) }).map((_, i) => (
                <Heart key={i} className="w-6 h-6 fill-red-500 text-red-500" />
            ))}
         </div>
      </Card>

      <div 
        className="relative bg-black rounded-xl overflow-hidden shadow-2xl border-4 border-slate-800"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT, maxWidth: '100%', aspectRatio: `${GAME_WIDTH}/${GAME_HEIGHT}` }}
      >
        {/* Stars background */}
        <div className="absolute inset-0 opacity-50" 
             style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
        </div>

        {/* Player */}
        <div 
            className="absolute bg-green-500 transition-transform"
            style={{ 
                left: player.x, 
                top: player.y, 
                width: player.width, 
                height: player.height,
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' // Triangle-ish
            }}
        />

        {/* Aliens */}
        {aliens.map(alien => (
            <div
                key={alien.id}
                className={cn(
                    "absolute transition-transform",
                    alien.type === 1 && "bg-cyan-400",
                    alien.type === 2 && "bg-blue-500",
                    alien.type === 3 && "bg-purple-500",
                )}
                style={{
                    left: alien.x,
                    top: alien.y,
                    width: alien.width,
                    height: alien.height,
                    clipPath: alien.type === 1 
                        ? 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 100%, 80% 80%, 20% 80%, 0% 100%, 0% 20%)'
                        : 'rect(0 0 100% 100%)' // Simple rect for others or customize
                }}
            >
                {/* Eyes */}
                <div className="absolute top-1 left-1/4 w-1 h-1 bg-black" />
                <div className="absolute top-1 right-1/4 w-1 h-1 bg-black" />
            </div>
        ))}

        {/* Bullets */}
        {bullets.map(bullet => (
            <div
                key={bullet.id}
                className={cn(
                    "absolute rounded-full",
                    bullet.owner === 'player' ? "bg-yellow-400 shadow-[0_0_5px_yellow]" : "bg-red-500 shadow-[0_0_5px_red]"
                )}
                style={{
                    left: bullet.x,
                    top: bullet.y,
                    width: bullet.width,
                    height: bullet.height,
                }}
            />
        ))}

        {/* Overlays */}
        {(gameOver || gameWon) && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center animate-in fade-in z-50">
                <h2 className={cn("text-5xl font-black mb-4 tracking-tighter", gameWon ? "text-green-500" : "text-red-500")}>
                    {gameWon ? 'VICTORY!' : 'GAME OVER'}
                </h2>
                <p className="text-2xl text-white mb-8">Final Score: {score}</p>
                <Button size="lg" onClick={resetGame} className="text-xl px-8 py-6">
                    <RefreshCw className="mr-2 w-6 h-6" /> Play Again
                </Button>
            </div>
        )}
        
        {isPaused && !gameOver && !gameWon && (
             <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-50">
                <h2 className="text-4xl font-bold text-white mb-8">PAUSED</h2>
                <Button size="lg" onClick={() => setIsPaused(false)} variant="secondary">
                    Resume
                </Button>
            </div>
        )}
      </div>

      <div className="flex gap-4 w-full max-w-[800px]">
         <Button 
            className="flex-1" 
            variant="outline" 
            onClick={() => setIsPaused(!isPaused)}
            disabled={gameOver || gameWon}
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
      
      <div className="text-sm text-muted-foreground">
        Controls: Left/Right Arrows to move, Space to shoot.
      </div>
    </div>
  );
}
