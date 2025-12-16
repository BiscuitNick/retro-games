import { LifeGame } from "@/components/games/conways-life";

export const metadata = {
  title: "Conway's Game of Life - Retro Games",
  description: "Cellular automaton simulation - watch patterns evolve!",
};

export default function ConwaysLifePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[var(--color-neon-cyan)] text-glow mb-2">
          Conway&apos;s Game of Life
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Cellular automaton simulation
        </p>
      </div>

      <div className="flex justify-center">
        <LifeGame gridWidth={40} gridHeight={30} cellSize={15} showControls={true} />
      </div>
    </div>
  );
}
