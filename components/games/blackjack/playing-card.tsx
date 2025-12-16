import { cn } from '@/lib/utils';
import { type Card } from '@/lib/games/blackjack';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

interface PlayingCardProps {
  card: Card;
  hidden?: boolean;
  className?: string;
}

export function PlayingCard({ card, hidden = false, className }: PlayingCardProps) {
  if (hidden) {
    return (
      <div className={cn(
        "w-24 h-36 bg-primary rounded-lg border-2 border-white shadow-md flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-foreground/10 to-primary",
        className
      )}>
        <div className="w-20 h-32 border border-white/20 rounded flex items-center justify-center">
            <span className="text-primary-foreground/50 text-2xl font-bold">?</span>
        </div>
      </div>
    );
  }

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const Icon = {
    hearts: Heart,
    diamonds: Diamond,
    clubs: Club,
    spades: Spade,
  }[card.suit];

  return (
    <div className={cn(
      "w-24 h-36 bg-white rounded-lg border border-gray-300 shadow-md relative select-none flex flex-col justify-between p-2",
      isRed ? "text-red-600" : "text-slate-900",
      className
    )}>
        <div className="text-left font-bold text-lg leading-none">
            {card.rank}
            <Icon className="w-4 h-4" fill={isRed ? "currentColor" : "currentColor"} />
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
             <Icon className="w-16 h-16" fill={isRed ? "currentColor" : "currentColor"} />
        </div>

        <div className="text-right font-bold text-lg leading-none transform rotate-180">
            {card.rank}
            <Icon className="w-4 h-4" fill={isRed ? "currentColor" : "currentColor"} />
        </div>
    </div>
  );
}
