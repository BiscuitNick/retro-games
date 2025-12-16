import { BreakoutGame } from "@/components/games/breakout";

export const metadata = {
  title: "Breakout - Retro Games",
  description: "Classic Breakout - bounce the ball and clear the bricks!",
};

export default function BreakoutPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[var(--color-neon-cyan)] text-glow mb-2">
          Breakout
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Bounce the ball, break the bricks, don’t drop it
        </p>
      </div>

      <div className="flex justify-center">
        <BreakoutGame width={480} height={320} showControls />
      </div>
    </div>
  );
}

