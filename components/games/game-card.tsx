"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { GameCardControls } from "./game-card-controls";
import { GameConfig } from "@/lib/games-config";

interface GameCardProps {
  game: GameConfig;
  children: React.ReactNode;
}

export function GameCard({ game, children }: GameCardProps) {
  const [isPaused, setIsPaused] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={`
        relative overflow-hidden transition-all duration-300
        bg-[var(--card)] border-[var(--border)]
        ${isHovered ? "game-card-glow" : ""}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Link href={game.route} className="hover:text-[var(--color-neon-cyan)] transition-colors">
            <CardTitle className="text-lg text-[var(--color-neon-cyan)]">
              {game.name}
            </CardTitle>
          </Link>
          <GameCardControls
            isPaused={isPaused}
            onTogglePause={() => setIsPaused(!isPaused)}
            gameRoute={game.route}
          />
        </div>
        <CardDescription className="text-xs">
          {game.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 relative">
        <div className="aspect-[4/3] bg-[var(--arcade-black)] overflow-hidden flex items-center justify-center">
          {/* Game Preview or Placeholder */}
          {isPaused ? (
            <div className="flex flex-col items-center justify-center text-center p-4">
              <div className="text-4xl mb-2">🎮</div>
              <p className="text-sm text-[var(--muted-foreground)]">
                Click play to start
              </p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                {game.controls}
              </p>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center scale-[0.5] origin-center">
              {children}
            </div>
          )}
        </div>

        {/* Overlay when paused */}
        {isPaused && (
          <div
            className="absolute inset-0 bg-black/20 cursor-pointer flex items-center justify-center"
            onClick={() => setIsPaused(false)}
          >
            <div className="w-16 h-16 rounded-full bg-[var(--color-neon-cyan)]/20 flex items-center justify-center">
              <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-transparent border-l-[var(--color-neon-cyan)] ml-1" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
