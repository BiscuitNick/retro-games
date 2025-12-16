import { MinesweeperGame } from "@/components/games/minesweeper";

export const metadata = {
  title: "Minesweeper - Retro Games",
  description: "Classic Minesweeper - clear the board without detonating a mine!",
};

export default function MinesweeperPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[var(--color-neon-cyan)] text-glow mb-2">
          Minesweeper
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Reveal safe tiles, flag mines, and clear the board
        </p>
      </div>

      <div className="flex justify-center">
        <MinesweeperGame width={12} height={12} mines={22} cellSize={32} showControls />
      </div>
    </div>
  );
}

