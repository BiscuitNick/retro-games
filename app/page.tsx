import Link from "next/link";
import { games } from "@/lib/games-config";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

// Game icons/emojis for visual representation
const gameIcons: Record<string, string> = {
  snake: "🐍",
  tetris: "🧱",
  minesweeper: "💣",
  "conways-life": "🔬",
  blackjack: "🃏",
  asteroids: "🚀",
  "space-invaders": "👾",
  breakout: "🧱",
  pinball: "🎰",
  barrack: "💥",
};

export default function Home() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-[var(--color-neon-cyan)] text-glow mb-4">
          Retro Games
        </h1>
        <p className="text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto">
          10 classic games, one nostalgic experience. Play directly in your browser!
        </p>
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <Link key={game.id} href={game.route} className="group">
            <Card className="h-full bg-[var(--card)] border-[var(--border)] overflow-hidden transition-all duration-300 hover:border-[var(--color-neon-cyan)] game-card-glow">
              <CardHeader className="pb-2">
                <CardTitle className="text-xl text-[var(--color-neon-cyan)] group-hover:text-glow transition-all">
                  {game.name}
                </CardTitle>
                <CardDescription className="text-sm">
                  {game.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                {/* Game Preview Area */}
                <div className="aspect-[4/3] bg-[var(--arcade-black)] relative overflow-hidden">
                  {/* Background Pattern */}
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `
                        linear-gradient(var(--color-arcade-gray) 1px, transparent 1px),
                        linear-gradient(90deg, var(--color-arcade-gray) 1px, transparent 1px)
                      `,
                      backgroundSize: "20px 20px",
                    }}
                  />

                  {/* Game Icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-7xl opacity-50 group-hover:opacity-80 transition-opacity group-hover:scale-110 transform duration-300">
                      {gameIcons[game.id] || "🎮"}
                    </span>
                  </div>

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-[var(--color-neon-cyan)]/20 border-[var(--color-neon-cyan)] text-[var(--color-neon-cyan)] hover:bg-[var(--color-neon-cyan)]/30"
                    >
                      <Play className="h-5 w-5 mr-2" />
                      Play Now
                    </Button>
                  </div>
                </div>

                {/* Controls Info */}
                <div className="p-4 border-t border-[var(--border)]">
                  <p className="text-xs text-[var(--muted-foreground)]">
                    <span className="font-semibold">Controls:</span> {game.controls}
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Footer Info */}
      <div className="text-center mt-12 text-[var(--muted-foreground)]">
        <p className="text-sm">
          Click any game card to play in full screen mode
        </p>
      </div>
    </div>
  );
}
