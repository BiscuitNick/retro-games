import { BarrackGame } from "@/components/games/barrack";

export const metadata = {
  title: "Barrack - Retro Games",
  description: "Artillery strategy game with projectile physics!",
};

export default function BarrackPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[var(--color-neon-cyan)] text-glow mb-2">
          Barrack
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Artillery strategy game - destroy the enemy tanks!
        </p>
      </div>

      <div className="flex justify-center">
        <BarrackGame canvasWidth={800} canvasHeight={500} showControls={true} />
      </div>
    </div>
  );
}
