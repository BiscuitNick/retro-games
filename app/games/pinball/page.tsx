import { PinballGame } from '@/components/games/pinball';

export default function PinballPage() {
  return (
    <div className="container py-8 flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Pinball</h1>
        <p className="text-muted-foreground">
          Keep the ball in play using the flippers. Hit bumpers for points!
        </p>
      </div>
      <PinballGame />
    </div>
  );
}
