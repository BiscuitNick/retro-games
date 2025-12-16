import { SnakeGame } from "@/components/games/snake";

export const metadata = {
  title: "Snake - Retro Games",
  description: "Classic Snake game - eat food and grow!",
};

export default function SnakePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[var(--color-neon-cyan)] text-glow mb-2">
          Snake
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Classic snake eating food and growing
        </p>
      </div>

      <div className="flex justify-center">
        <SnakeGame gridWidth={20} gridHeight={20} cellSize={20} showControls={true} />
      </div>
    </div>
  );
}
