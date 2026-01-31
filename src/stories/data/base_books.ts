import type { GameEvent, Symbol, HandCategory } from '$lib/types';

interface Book {
  name: string;
  id: string;
  events: GameEvent[];
  handCategory: HandCategory;
  payoutMultiplier: number;
}

const baseBooks: Book[] = [
  {
    name: 'Royal Flush',
    id: 'base-royal-flush',
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
          { symbol: 'KH' as Symbol },
          { symbol: 'AH' as Symbol },
        ],
      },
      {
        index: 1,
        type: 'hand_result',
        handCategory: 'ROYAL_FLUSH',
        payoutMultiplier: 1000,
        winningPositions: [0, 1, 2, 3, 4],
        jackpot: true,
      },
    ],
  },
  {
    name: 'Straight Flush',
    id: 'base-straight-flush',
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
          { symbol: '8D' as Symbol },
          { symbol: '9D' as Symbol },
        ],
      },
      {
        index: 1,
        type: 'hand_result',
        handCategory: 'STRAIGHT_FLUSH',
        payoutMultiplier: 100,
        winningPositions: [0, 1, 2, 3, 4],
        jackpot: true,
      },
    ],
  },
  {
    name: 'Four of a Kind',
    id: 'base-four-of-a-kind',
    handCategory: 'FOUR_OF_A_KIND',
    payoutMultiplier: 40,
    events: [
      {
        index: 0,
        type: 'reveal_initial_board',
        board: [
          { symbol: 'AS' as Symbol },
          { symbol: 'AC' as Symbol },
          { symbol: 'AD' as Symbol },
          { symbol: 'AH' as Symbol },
          { symbol: 'KS' as Symbol },
        ],
      },
      {
        index: 1,
        type: 'hand_result',
        handCategory: 'FOUR_OF_A_KIND',
        payoutMultiplier: 40,
        winningPositions: [0, 1, 2, 3],
        jackpot: true,
      },
    ],
  },
  {
    name: 'Full House',
    id: 'base-full-house',
    handCategory: 'FULL_HOUSE',
    payoutMultiplier: 20,
    events: [
      {
        index: 0,
        type: 'reveal_initial_board',
        board: [
          { symbol: 'KS' as Symbol },
          { symbol: 'KC' as Symbol },
          { symbol: 'KH' as Symbol },
          { symbol: 'QS' as Symbol },
          { symbol: 'QD' as Symbol },
        ],
      },
      {
        index: 1,
        type: 'hand_result',
        handCategory: 'FULL_HOUSE',
        payoutMultiplier: 20,
        winningPositions: [0, 1, 2, 3, 4],
        jackpot: true,
      },
    ],
  },
  {
    name: 'Flush',
    id: 'base-flush',
    handCategory: 'FLUSH',
    payoutMultiplier: 10,
    events: [
      {
        index: 0,
        type: 'reveal_initial_board',
        board: [
          { symbol: '2S' as Symbol },
          { symbol: '5S' as Symbol },
          { symbol: '7S' as Symbol },
          { symbol: 'JS' as Symbol },
          { symbol: 'KS' as Symbol },
        ],
      },
      {
        index: 1,
        type: 'hand_result',
        handCategory: 'FLUSH',
        payoutMultiplier: 10,
        winningPositions: [0, 1, 2, 3, 4],
        jackpot: true,
      },
    ],
  },
  {
    name: 'Straight',
    id: 'base-straight',
    handCategory: 'STRAIGHT',
    payoutMultiplier: 5,
    events: [
      {
        index: 0,
        type: 'reveal_initial_board',
        board: [
          { symbol: '6H' as Symbol },
          { symbol: '7S' as Symbol },
          { symbol: '8D' as Symbol },
          { symbol: '9C' as Symbol },
          { symbol: '10H' as Symbol },
        ],
      },
      {
        index: 1,
        type: 'hand_result',
        handCategory: 'STRAIGHT',
        payoutMultiplier: 5,
        winningPositions: [0, 1, 2, 3, 4],
        jackpot: false,
      },
    ],
  },
  {
    name: 'Three of a Kind',
    id: 'base-three-of-a-kind',
    handCategory: 'THREE_OF_A_KIND',
    payoutMultiplier: 3,
    events: [
      {
        index: 0,
        type: 'reveal_initial_board',
        board: [
          { symbol: 'JS' as Symbol },
          { symbol: 'JD' as Symbol },
          { symbol: 'JH' as Symbol },
          { symbol: '5C' as Symbol },
          { symbol: '7H' as Symbol },
        ],
      },
      {
        index: 1,
        type: 'hand_result',
        handCategory: 'THREE_OF_A_KIND',
        payoutMultiplier: 3,
        winningPositions: [0, 1, 2],
        jackpot: false,
      },
    ],
  },
  {
    name: 'Two Pair',
    id: 'base-two-pair',
    handCategory: 'TWO_PAIR',
    payoutMultiplier: 1.5,
    events: [
      {
        index: 0,
        type: 'reveal_initial_board',
        board: [
          { symbol: '10S' as Symbol },
          { symbol: '10D' as Symbol },
          { symbol: '8H' as Symbol },
          { symbol: '8C' as Symbol },
          { symbol: '3S' as Symbol },
        ],
      },
      {
        index: 1,
        type: 'hand_result',
        handCategory: 'TWO_PAIR',
        payoutMultiplier: 1.5,
        winningPositions: [0, 1, 2, 3],
        jackpot: false,
      },
    ],
  },
  {
    name: 'Pair',
    id: 'base-pair',
    handCategory: 'PAIR',
    payoutMultiplier: 0.9,
    events: [
      {
        index: 0,
        type: 'reveal_initial_board',
        board: [
          { symbol: 'KS' as Symbol },
          { symbol: 'KD' as Symbol },
          { symbol: '7H' as Symbol },
          { symbol: '5C' as Symbol },
          { symbol: '3S' as Symbol },
        ],
      },
      {
        index: 1,
        type: 'hand_result',
        handCategory: 'PAIR',
        payoutMultiplier: 0.9,
        winningPositions: [0, 1],
        jackpot: false,
      },
    ],
  },
  {
    name: 'High Card',
    id: 'base-high-card',
    handCategory: 'HIGH_CARD',
    payoutMultiplier: 0.35,
    events: [
      {
        index: 0,
        type: 'reveal_initial_board',
        board: [
          { symbol: 'AS' as Symbol },
          { symbol: '10D' as Symbol },
          { symbol: '7H' as Symbol },
          { symbol: '5C' as Symbol },
          { symbol: '2S' as Symbol },
        ],
      },
      {
        index: 1,
        type: 'hand_result',
        handCategory: 'HIGH_CARD',
        payoutMultiplier: 0.35,
        winningPositions: [0],
        jackpot: false,
      },
    ],
  },
];

export default baseBooks;

export function getRandomBaseBook(): Book {
  return baseBooks[Math.floor(Math.random() * baseBooks.length)];
}
