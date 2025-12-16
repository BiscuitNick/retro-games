"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play, Pause, Maximize2 } from "lucide-react";

interface GameCardControlsProps {
  isPaused: boolean;
  onTogglePause: () => void;
  gameRoute: string;
}

export function GameCardControls({
  isPaused,
  onTogglePause,
  gameRoute,
}: GameCardControlsProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onTogglePause();
        }}
        aria-label={isPaused ? "Play" : "Pause"}
      >
        {isPaused ? (
          <Play className="h-4 w-4" />
        ) : (
          <Pause className="h-4 w-4" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        asChild
        aria-label="Full screen"
      >
        <Link href={gameRoute}>
          <Maximize2 className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
