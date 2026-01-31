import type { GameEvent, Symbol, HandCategory } from '$lib/types';

type RevealInitialBoardEvent = {
  index: number;
  type: 'reveal_initial_board';
  board: Array<{ symbol: Symbol }>;
};

type JokerTransformEvent = {
  index: number;
  type: 'joker_transform';
  jokerTransforms: Array<{ position: number; targetSymbol: Symbol }>;
};

type HandResultEvent = {
  index: number;
  type: 'hand_result';
  handCategory: HandCategory;
  payoutMultiplier: number;
  winningPositions: number[];
  jackpot: boolean;
};

const baseEvents = {
  reveal_royal_flush: {
    index: 0,
    type: 'reveal_initial_board',
    board: [
      { symbol: '10H' },
      { symbol: 'JH' },
      { symbol: 'QH' },
      { symbol: 'KH' },
      { symbol: 'AH' },
    ],
  } satisfies RevealInitialBoardEvent,

  reveal_straight_flush: {
    index: 0,
    type: 'reveal_initial_board',
    board: [
      { symbol: '5D' },
      { symbol: '6D' },
      { symbol: '7D' },
      { symbol: '8D' },
      { symbol: '9D' },
    ],
  } satisfies RevealInitialBoardEvent,

  reveal_four_of_a_kind: {
    index: 0,
    type: 'reveal_initial_board',
    board: [
      { symbol: 'AS' },
      { symbol: 'AC' },
      { symbol: 'AD' },
      { symbol: 'AH' },
      { symbol: 'KS' },
    ],
  } satisfies RevealInitialBoardEvent,

  reveal_full_house: {
    index: 0,
    type: 'reveal_initial_board',
    board: [
      { symbol: 'KS' },
      { symbol: 'KC' },
      { symbol: 'KH' },
      { symbol: 'QS' },
      { symbol: 'QD' },
    ],
  } satisfies RevealInitialBoardEvent,

  reveal_flush: {
    index: 0,
    type: 'reveal_initial_board',
    board: [
      { symbol: '2S' },
      { symbol: '5S' },
      { symbol: '7S' },
      { symbol: 'JS' },
      { symbol: 'KS' },
    ],
  } satisfies RevealInitialBoardEvent,

  reveal_straight: {
    index: 0,
    type: 'reveal_initial_board',
    board: [
      { symbol: '6H' },
      { symbol: '7S' },
      { symbol: '8D' },
      { symbol: '9C' },
      { symbol: '10H' },
    ],
  } satisfies RevealInitialBoardEvent,

  reveal_three_of_a_kind: {
    index: 0,
    type: 'reveal_initial_board',
    board: [
      { symbol: 'JS' },
      { symbol: 'JD' },
      { symbol: 'JH' },
      { symbol: '5C' },
      { symbol: '7H' },
    ],
  } satisfies RevealInitialBoardEvent,

  reveal_two_pair: {
    index: 0,
    type: 'reveal_initial_board',
    board: [
      { symbol: '10S' },
      { symbol: '10D' },
      { symbol: '8H' },
      { symbol: '8C' },
      { symbol: '3S' },
    ],
  } satisfies RevealInitialBoardEvent,

  reveal_pair: {
    index: 0,
    type: 'reveal_initial_board',
    board: [
      { symbol: 'KS' },
      { symbol: 'KD' },
      { symbol: '7H' },
      { symbol: '5C' },
      { symbol: '3S' },
    ],
  } satisfies RevealInitialBoardEvent,

  reveal_high_card: {
    index: 0,
    type: 'reveal_initial_board',
    board: [
      { symbol: 'AS' },
      { symbol: '10D' },
      { symbol: '7H' },
      { symbol: '5C' },
      { symbol: '2S' },
    ],
  } satisfies RevealInitialBoardEvent,

  hand_result_royal_flush: {
    index: 1,
    type: 'hand_result',
    handCategory: 'ROYAL_FLUSH',
    payoutMultiplier: 1000,
    winningPositions: [0, 1, 2, 3, 4],
    jackpot: true,
  } satisfies HandResultEvent,

  hand_result_straight_flush: {
    index: 1,
    type: 'hand_result',
    handCategory: 'STRAIGHT_FLUSH',
    payoutMultiplier: 100,
    winningPositions: [0, 1, 2, 3, 4],
    jackpot: true,
  } satisfies HandResultEvent,

  hand_result_four_of_a_kind: {
    index: 1,
    type: 'hand_result',
    handCategory: 'FOUR_OF_A_KIND',
    payoutMultiplier: 40,
    winningPositions: [0, 1, 2, 3],
    jackpot: true,
  } satisfies HandResultEvent,

  hand_result_full_house: {
    index: 1,
    type: 'hand_result',
    handCategory: 'FULL_HOUSE',
    payoutMultiplier: 20,
    winningPositions: [0, 1, 2, 3, 4],
    jackpot: true,
  } satisfies HandResultEvent,

  hand_result_flush: {
    index: 1,
    type: 'hand_result',
    handCategory: 'FLUSH',
    payoutMultiplier: 10,
    winningPositions: [0, 1, 2, 3, 4],
    jackpot: true,
  } satisfies HandResultEvent,

  hand_result_straight: {
    index: 1,
    type: 'hand_result',
    handCategory: 'STRAIGHT',
    payoutMultiplier: 5,
    winningPositions: [0, 1, 2, 3, 4],
    jackpot: false,
  } satisfies HandResultEvent,

  hand_result_three_of_a_kind: {
    index: 1,
    type: 'hand_result',
    handCategory: 'THREE_OF_A_KIND',
    payoutMultiplier: 3,
    winningPositions: [0, 1, 2],
    jackpot: false,
  } satisfies HandResultEvent,

  hand_result_two_pair: {
    index: 1,
    type: 'hand_result',
    handCategory: 'TWO_PAIR',
    payoutMultiplier: 1.5,
    winningPositions: [0, 1, 2, 3],
    jackpot: false,
  } satisfies HandResultEvent,

  hand_result_pair: {
    index: 1,
    type: 'hand_result',
    handCategory: 'PAIR',
    payoutMultiplier: 0.9,
    winningPositions: [0, 1],
    jackpot: false,
  } satisfies HandResultEvent,

  hand_result_high_card: {
    index: 1,
    type: 'hand_result',
    handCategory: 'HIGH_CARD',
    payoutMultiplier: 0.35,
    winningPositions: [0],
    jackpot: false,
  } satisfies HandResultEvent,
};

export default baseEvents;
