import { AsteroidsGame } from "@/components/games/asteroids";

export const metadata = {
  title: "Asteroids - Retro Games",
  description: "Space shooter with rotating ship and asteroids!",
};

export default function AsteroidsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-[var(--color-neon-cyan)] text-glow mb-2">
          Asteroids
        </h1>
        <p className="text-[var(--muted-foreground)]">
          Space shooter with rotating ship and asteroids
        </p>
      </div>

      <div className="flex justify-center">
        <AsteroidsGame canvasWidth={800} canvasHeight={600} showControls={true} />
      </div>
    </div>
  );
}
