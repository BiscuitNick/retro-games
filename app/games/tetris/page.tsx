import { TetrisGame } from '@/components/games/tetris';

export default function TetrisPage() {
  return (
    <div className="container py-8 flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Tetris</h1>
        <p className="text-muted-foreground">
          Arrange the falling blocks to clear lines. Use arrow keys to move and rotate.
        </p>
      </div>
      <TetrisGame />
    </div>
  );
}
