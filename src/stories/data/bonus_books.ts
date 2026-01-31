import type { GameEvent, Symbol, HandCategory } from '$lib/types';

interface Book {
  name: string;
  id: string;
  events: GameEvent[];
  handCategory: HandCategory;
  payoutMultiplier: number;
}

const bonusBooks: Book[] = [
  {
    name: 'Joker + Pair → Three of a Kind',
    id: 'bonus-joker-pair-to-three',
    handCategory: 'THREE_OF_A_KIND',
    payoutMultiplier: 3,
    events: [
      {
        index: 0,
        type: 'reveal_initial_board',
        board: [
          { symbol: 'JOKER' as Symbol },
          { symbol: 'KS' as Symbol },
          { symbol: 'KD' as Symbol },
          { symbol: '7H' as Symbol },
          { symbol: '3S' as Symbol },
        ],
      },
      {
        index: 1,
        type: 'joker_transform',
        jokerTransforms: [{ position: 0, targetSymbol: 'KC' as Symbol }],
      },
      {
        index: 2,
        type: 'hand_result',
        handCategory: 'THREE_OF_A_KIND',
        payoutMultiplier: 3,
        winningPositions: [0, 1, 2],
        jackpot: false,
      },
    ],
  },
  {
    name: 'Joker → Royal Flush',
    id: 'bonus-joker-royal-flush',
    handCategory: 'ROYAL_FLUSH',
    payoutMultiplier: 1000,
    events: [
      {
        index: 0,
        type: 'reveal_initial_board',
        board: [
          { symbol: '10H' as Symbol },
          { symbol: 'JH' as Symbol },
          { symbol: 'QH' as Symbol },
          { symbol: 'JOKER' as Symbol },
          { symbol: 'AH' as Symbol },
        ],
      },
      {
        index: 1,
        type: 'joker_transform',
        jokerTransforms: [{ position: 3, targetSymbol: 'KH' as Symbol }],
      },
      {
        index: 2,
        type: 'hand_result',
        handCategory: 'ROYAL_FLUSH',
        payoutMultiplier: 1000,
        winningPositions: [0, 1, 2, 3, 4],
        jackpot: true,
      },
    ],
  },
  {
    name: 'Joker → Straight',
    id: 'bonus-joker-straight',
    handCategory: 'STRAIGHT',
    payoutMultiplier: 5,
    events: [
      {
        index: 0,
        type: 'reveal_initial_board',
        board: [
          { symbol: '6H' as Symbol },
          { symbol: '7S' as Symbol },
          { symbol: 'JOKER' as Symbol },
          { symbol: '9C' as Symbol },
          { symbol: '10H' as Symbol },
        ],
      },
      {
        index: 1,
        type: 'joker_transform',
        jokerTransforms: [{ position: 2, targetSymbol: '8D' as Symbol }],
      },
      {
        index: 2,
        type: 'hand_result',
        handCategory: 'STRAIGHT',
        payoutMultiplier: 5,
        winningPositions: [0, 1, 2, 3, 4],
        jackpot: false,
      },
    ],
  },
  {
    name: 'Joker → Flush',
    id: 'bonus-joker-flush',
    handCategory: 'FLUSH',
    payoutMultiplier: 10,
    events: [
      {
        index: 0,
        type: 'reveal_initial_board',
        board: [
          { symbol: '2S' as Symbol },
          { symbol: '5S' as Symbol },
          { symbol: 'JOKER' as Symbol },
          { symbol: 'JS' as Symbol },
          { symbol: 'KS' as Symbol },
        ],
      },
      {
        index: 1,
        type: 'joker_transform',
        jokerTransforms: [{ position: 2, targetSymbol: '7S' as Symbol }],
      },
      {
        index: 2,
        type: 'hand_result',
        handCategory: 'FLUSH',
        payoutMultiplier: 10,
        winningPositions: [0, 1, 2, 3, 4],
        jackpot: true,
      },
    ],
  },
  {
    name: 'Joker → Straight Flush',
    id: 'bonus-joker-straight-flush',
    handCategory: 'STRAIGHT_FLUSH',
    payoutMultiplier: 100,
    events: [
      {
        index: 0,
        type: 'reveal_initial_board',
        board: [
          { symbol: '5D' as Symbol },
          { symbol: '6D' as Symbol },
          { symbol: '7D' as Symbol },
          { symbol: 'JOKER' as Symbol },
          { symbol: '9D' as Symbol },
        ],
      },
      {
        index: 1,
        type: 'joker_transform',
        jokerTransforms: [{ position: 3, targetSymbol: '8D' as Symbol }],
      },
      {
        index: 2,
        type: 'hand_result',
        handCategory: 'STRAIGHT_FLUSH',
        payoutMultiplier: 100,
        winningPositions: [0, 1, 2, 3, 4],
        jackpot: true,
      },
    ],
  },
  {
    name: 'Joker + Two Pair → Full House',
    id: 'bonus-joker-two-pair-to-full-house',
    handCategory: 'FULL_HOUSE',
    payoutMultiplier: 20,
    events: [
      {
        index: 0,
        type: 'reveal_initial_board',
        board: [
          { symbol: 'JOKER' as Symbol },
          { symbol: 'KS' as Symbol },
          { symbol: 'KD' as Symbol },
          { symbol: 'QH' as Symbol },
          { symbol: 'QC' as Symbol },
        ],
      },
      {
        index: 1,
        type: 'joker_transform',
        jokerTransforms: [{ position: 0, targetSymbol: 'KH' as Symbol }],
      },
      {
        index: 2,
        type: 'hand_result',
        handCategory: 'FULL_HOUSE',
        payoutMultiplier: 20,
        winningPositions: [0, 1, 2, 3, 4],
        jackpot: true,
      },
    ],
  },
  {
    name: 'Joker + Three → Four of a Kind',
    id: 'bonus-joker-three-to-four',
    handCategory: 'FOUR_OF_A_KIND',
    payoutMultiplier: 40,
    events: [
      {
        index: 0,
        type: 'reveal_initial_board',
        board: [
          { symbol: 'JS' as Symbol },
          { symbol: 'JD' as Symbol },
          { symbol: 'JH' as Symbol },
          { symbol: 'JOKER' as Symbol },
          { symbol: '7H' as Symbol },
        ],
      },
      {
        index: 1,
        type: 'joker_transform',
        jokerTransforms: [{ position: 3, targetSymbol: 'JC' as Symbol }],
      },
      {
        index: 2,
        type: 'hand_result',
        handCategory: 'FOUR_OF_A_KIND',
        payoutMultiplier: 40,
        winningPositions: [0, 1, 2, 3],
        jackpot: true,
      },
    ],
  },
  {
    name: 'Joker + High Card → Pair',
    id: 'bonus-joker-high-to-pair',
    handCategory: 'PAIR',
    payoutMultiplier: 0.9,
    events: [
      {
        index: 0,
        type: 'reveal_initial_board',
        board: [
          { symbol: 'AS' as Symbol },
          { symbol: '10D' as Symbol },
          { symbol: '7H' as Symbol },
          { symbol: 'JOKER' as Symbol },
          { symbol: '2S' as Symbol },
        ],
      },
      {
        index: 1,
        type: 'joker_transform',
        jokerTransforms: [{ position: 3, targetSymbol: 'AH' as Symbol }],
      },
      {
        index: 2,
        type: 'hand_result',
        handCategory: 'PAIR',
        payoutMultiplier: 0.9,
        winningPositions: [0, 3],
        jackpot: false,
      },
    ],
  },
];

export default bonusBooks;

export function getRandomBonusBook(): Book {
  return bonusBooks[Math.floor(Math.random() * bonusBooks.length)];
}
