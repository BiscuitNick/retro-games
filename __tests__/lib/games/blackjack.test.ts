import {
  createDeck,
  calculateHandValue,
  isBlackjack,
  isBust,
  Hand,
} from '@/lib/games/blackjack';

describe('Blackjack Game Logic', () => {
  describe('createDeck', () => {
    it('should create a deck with correct number of cards', () => {
      const deck = createDeck(1);
      expect(deck).toHaveLength(52);
    });

    it('should create multiple decks', () => {
      const deck = createDeck(6);
      expect(deck).toHaveLength(52 * 6);
    });
  });

  describe('calculateHandValue', () => {
    it('should calculate value correctly for number cards', () => {
      const hand: Hand = [
        { suit: 'hearts', rank: '2', id: '1' },
        { suit: 'hearts', rank: '5', id: '2' }
      ];
      expect(calculateHandValue(hand)).toBe(7);
    });

    it('should calculate face cards as 10', () => {
      const hand: Hand = [
        { suit: 'hearts', rank: 'J', id: '1' },
        { suit: 'hearts', rank: 'Q', id: '2' },
        { suit: 'hearts', rank: 'K', id: '3' }
      ];
      expect(calculateHandValue(hand)).toBe(30);
    });

    it('should handle Aces as 11', () => {
      const hand: Hand = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'hearts', rank: '5', id: '2' }
      ];
      expect(calculateHandValue(hand)).toBe(16);
    });

    it('should handle Aces as 1 to prevent bust', () => {
      const hand: Hand = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'hearts', rank: 'K', id: '2' },
        { suit: 'hearts', rank: '5', id: '3' }
      ];
      // 11 + 10 + 5 = 26 -> Bust.
      // 1 + 10 + 5 = 16.
      expect(calculateHandValue(hand)).toBe(16);
    });
  });

  describe('isBlackjack', () => {
    it('should return true for 21 with 2 cards', () => {
      const hand: Hand = [
        { suit: 'hearts', rank: 'A', id: '1' },
        { suit: 'hearts', rank: 'K', id: '2' }
      ];
      expect(isBlackjack(hand)).toBe(true);
    });

    it('should return false for 21 with 3 cards', () => {
      const hand: Hand = [
        { suit: 'hearts', rank: '7', id: '1' },
        { suit: 'hearts', rank: '7', id: '2' },
        { suit: 'hearts', rank: '7', id: '3' }
      ];
      expect(calculateHandValue(hand)).toBe(21);
      expect(isBlackjack(hand)).toBe(false);
    });
  });
});
