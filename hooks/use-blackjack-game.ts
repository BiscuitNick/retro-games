import { useState, useCallback, useEffect } from 'react';
import {
  type Card,
  type Hand,
  createDeck,
  shuffleDeck,
  calculateHandValue,
  isBust,
  isBlackjack,
} from '@/lib/games/blackjack';

type GameStatus = 'betting' | 'player-turn' | 'dealer-turn' | 'game-over';
type GameResult = 'win' | 'lose' | 'push' | 'blackjack' | null;

export function useBlackjackGame() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Hand>([]);
  const [dealerHand, setDealerHand] = useState<Hand>([]);
  const [chips, setChips] = useState(1000);
  const [currentBet, setCurrentBet] = useState(0);
  const [gameStatus, setGameStatus] = useState<GameStatus>('betting');
  const [gameResult, setGameResult] = useState<GameResult>(null);

  // Initialize deck
  useEffect(() => {
    setDeck(shuffleDeck(createDeck()));
  }, []);

  const placeBet = useCallback((amount: number) => {
    if (chips >= amount) {
      setChips((prev) => prev - amount);
      setCurrentBet((prev) => prev + amount);
    }
  }, [chips]);

  const clearBet = useCallback(() => {
    setChips((prev) => prev + currentBet);
    setCurrentBet(0);
  }, [currentBet]);

  const deal = useCallback(() => {
    if (currentBet === 0) return;
    if (deck.length < 10) {
      setDeck(shuffleDeck(createDeck()));
    }

    // Need to draw 4 cards from deck
    // We can't easily mutate state in a loop without functional updates or temp vars.
    // Let's use a temp deck.
    const tempDeck = [...deck];
    const pHand: Hand = [tempDeck.pop()!, tempDeck.pop()!];
    const dHand: Hand = [tempDeck.pop()!, tempDeck.pop()!];

    setDeck(tempDeck);
    setPlayerHand(pHand);
    setDealerHand(dHand);
    setGameStatus('player-turn');
    setGameResult(null);

    // Check for instant blackjack
    const playerBJ = isBlackjack(pHand);
    const dealerBJ = isBlackjack(dHand);

    if (playerBJ || dealerBJ) {
      setGameStatus('game-over');
      if (playerBJ && dealerBJ) {
        setGameResult('push');
        setChips(c => c + currentBet);
      } else if (playerBJ) {
        setGameResult('blackjack');
        setChips(c => c + currentBet * 2.5); // 3:2 payout (1.5 + 1)
      } else {
        setGameResult('lose');
      }
    }
  }, [currentBet, deck]);

  const hit = useCallback(() => {
    if (gameStatus !== 'player-turn') return;
    
    const tempDeck = [...deck];
    const card = tempDeck.pop();
    if (!card) return; // Should handle empty deck refill
    
    const newHand = [...playerHand, card];
    setDeck(tempDeck);
    setPlayerHand(newHand);

    if (isBust(newHand)) {
      setGameStatus('game-over');
      setGameResult('lose');
    }
  }, [deck, gameStatus, playerHand]);

  // Dealer logic
  const playDealerTurn = useCallback(() => {
    let currentDealerHand = [...dealerHand];
    let tempDeck = [...deck];

    // Dealer hits on soft 17? Let's say dealer stands on all 17s for simplicity.
    while (calculateHandValue(currentDealerHand) < 17) {
        const card = tempDeck.pop();
        if (card) {
            currentDealerHand.push(card);
        } else {
            break; // Empty deck?
        }
    }

    setDeck(tempDeck);
    setDealerHand(currentDealerHand);
    
    // Determine winner
    const playerValue = calculateHandValue(playerHand);
    const dealerValue = calculateHandValue(currentDealerHand);
    const dealerBust = isBust(currentDealerHand);

    if (dealerBust || playerValue > dealerValue) {
        setGameResult('win');
        setChips(c => c + currentBet * 2);
    } else if (dealerValue > playerValue) {
        setGameResult('lose');
    } else {
        setGameResult('push');
        setChips(c => c + currentBet);
    }
    
    setGameStatus('game-over');

  }, [dealerHand, deck, playerHand, currentBet]);

  const stand = useCallback(() => {
    if (gameStatus !== 'player-turn') return;
    setGameStatus('dealer-turn');
    // We need to trigger dealer turn.
    // Since playDealerTurn depends on state, and state updates are async,
    // we should call it in a useEffect when gameStatus changes to 'dealer-turn',
    // or just pass the current state to a helper.
    // But playDealerTurn uses 'dealerHand' from state.
    // If we call it immediately, it might use stale state?
    // Actually, 'stand' doesn't change dealerHand, so it's fine.
    // BUT, React batching...
    // Let's use a useEffect to trigger dealer logic.
  }, [gameStatus]);

  useEffect(() => {
    if (gameStatus === 'dealer-turn') {
        // Add a small delay for "thinking" or animation?
        const timer = setTimeout(() => {
            playDealerTurn();
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [gameStatus, playDealerTurn]);

  const resetGame = useCallback(() => {
    setPlayerHand([]);
    setDealerHand([]);
    setCurrentBet(0);
    setGameStatus('betting');
    setGameResult(null);
  }, []);

  return {
    deck,
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
  };
}
