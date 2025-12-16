import { BlackjackGame } from '@/components/games/blackjack';

export default function BlackjackPage() {
  return (
    <div className="container py-8 flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Blackjack</h1>
        <p className="text-muted-foreground">
          Get as close to 21 as possible without going over. Beat the dealer to win chips!
        </p>
      </div>
      <BlackjackGame />
    </div>
  );
}
