'use client';

import { useBlackjackGame } from '@/hooks/use-blackjack-game';
import { PlayingCard } from './playing-card';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateHandValue } from '@/lib/games/blackjack';
import { Coins, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BlackjackGame() {
  const {
    playerHand,
    dealerHand,
    chips,
    currentBet,
    gameStatus,
    gameResult,
    placeBet,
    clearBet,
    deal,
    hit,
    stand,
    resetGame,
  } = useBlackjackGame();

  const playerValue = calculateHandValue(playerHand);
  const dealerValue = calculateHandValue(dealerHand); // This shows full value, but we might want to hide it if dealer has hidden card
  
  // During game, dealer's second card is hidden until dealer-turn or game-over
  const dealerCardHidden = gameStatus === 'player-turn' || gameStatus === 'betting';
  const visibleDealerHand = dealerCardHidden ? [dealerHand[0]] : dealerHand;
  
  // Wait, if dealerHand has 2 cards, and one is hidden, calculating value of visible only?
  // Usually we show the value of the upcard only.
  const visibleDealerValue = dealerCardHidden && dealerHand.length > 0
    ? calculateHandValue([dealerHand[0]])
    : dealerValue;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
      {/* Game Table */}
      <div className="relative w-full aspect-video bg-green-900 rounded-xl border-8 border-yellow-900 shadow-2xl overflow-hidden p-8 flex flex-col justify-between">
        {/* Dealer Area */}
        <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs bg-black/50 text-white border-0">
                    Dealer: {visibleDealerValue}
                </Badge>
            </div>
            <div className="flex gap-[-4rem] justify-center h-36">
                {dealerHand.map((card, index) => (
                    <div key={card.id} className={cn("transition-all duration-500", index > 0 && "-ml-12")}>
                         <PlayingCard card={card} hidden={index === 1 && dealerCardHidden} />
                    </div>
                ))}
                {dealerHand.length === 0 && (
                    <div className="w-24 h-36 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center text-white/20">
                        Empty
                    </div>
                )}
            </div>
        </div>

        {/* Center Info / Result */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {gameResult && (
                <div className="bg-black/80 text-white px-8 py-4 rounded-xl text-3xl font-bold animate-in zoom-in fade-in border-2 border-yellow-500">
                    {gameResult === 'win' && 'YOU WIN!'}
                    {gameResult === 'lose' && 'DEALER WINS'}
                    {gameResult === 'push' && 'PUSH'}
                    {gameResult === 'blackjack' && 'BLACKJACK!'}
                </div>
            )}
            {gameStatus === 'betting' && (
                <div className="bg-black/40 text-white px-4 py-2 rounded-lg text-sm">
                    Place your bet
                </div>
            )}
        </div>

        {/* Player Area */}
        <div className="flex flex-col items-center gap-2">
             <div className="flex gap-[-4rem] justify-center h-36">
                {playerHand.map((card, index) => (
                    <div key={card.id} className={cn("transition-all duration-500", index > 0 && "-ml-12")}>
                         <PlayingCard card={card} />
                    </div>
                ))}
                 {playerHand.length === 0 && (
                    <div className="w-24 h-36 border-2 border-dashed border-white/20 rounded-lg flex items-center justify-center text-white/20">
                        Empty
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs bg-black/50 text-white border-0">
                    Player: {playerValue}
                </Badge>
            </div>
        </div>
      </div>

      {/* Controls Area */}
      <Card className="w-full p-6 flex flex-col md:flex-row justify-between items-center gap-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        
        {/* Stats */}
        <div className="flex flex-col gap-1 min-w-[120px]">
            <div className="flex items-center gap-2 text-muted-foreground">
                <Coins className="w-4 h-4" />
                <span className="text-sm font-medium">Chips</span>
            </div>
            <span className="text-2xl font-bold">{chips}</span>
        </div>

        {/* Betting Controls */}
        {gameStatus === 'betting' && (
            <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-2">
                     <span className="text-sm font-medium mr-2">Bet: {currentBet}</span>
                     {[10, 50, 100, 500].map(amount => (
                         <Button 
                            key={amount} 
                            onClick={() => placeBet(amount)}
                            disabled={chips < amount}
                            variant="outline"
                            className="rounded-full w-12 h-12 p-0 border-2"
                         >
                            {amount}
                         </Button>
                     ))}
                     <Button variant="ghost" size="sm" onClick={clearBet} disabled={currentBet === 0}>Clear</Button>
                </div>
                <Button size="lg" className="w-full md:w-auto px-8" onClick={deal} disabled={currentBet === 0}>
                    Deal Cards
                </Button>
            </div>
        )}

        {/* Game Actions */}
        {(gameStatus === 'player-turn') && (
            <div className="flex gap-4">
                <Button size="lg" variant="secondary" onClick={hit} className="w-32">Hit</Button>
                <Button size="lg" onClick={stand} className="w-32">Stand</Button>
            </div>
        )}

        {/* Game Over Actions */}
        {gameStatus === 'game-over' && (
             <Button size="lg" onClick={resetGame} className="w-32">
                <RefreshCw className="w-4 h-4 mr-2" /> New Hand
             </Button>
        )}

      </Card>
    </div>
  );
}
