import { SpaceInvadersGame } from '@/components/games/space-invaders';

export default function SpaceInvadersPage() {
  return (
    <div className="container py-8 flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Space Invaders</h1>
        <p className="text-muted-foreground">
          Defend Earth from the alien invasion!
        </p>
      </div>
      <SpaceInvadersGame />
    </div>
  );
}
