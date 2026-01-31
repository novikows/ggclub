import type { Symbol, HandCategory } from '$lib/types';

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

const bonusEvents = {
  reveal_joker_pair: {
    index: 0,
    type: 'reveal_initial_board',
    board: [
      { symbol: 'JOKER' },
      { symbol: 'KS' },
      { symbol: 'KD' },
      { symbol: '7H' },
      { symbol: '3S' },
    ],
  } satisfies RevealInitialBoardEvent,

  reveal_joker_royal: {
    index: 0,
    type: 'reveal_initial_board',
    board: [
      { symbol: '10H' },
      { symbol: 'JH' },
      { symbol: 'QH' },
      { symbol: 'JOKER' },
      { symbol: 'AH' },
    ],
  } satisfies RevealInitialBoardEvent,

  reveal_joker_straight: {
    index: 0,
    type: 'reveal_initial_board',
    board: [
      { symbol: '6H' },
      { symbol: '7S' },
      { symbol: 'JOKER' },
      { symbol: '9C' },
      { symbol: '10H' },
    ],
  } satisfies RevealInitialBoardEvent,

  reveal_joker_flush: {
    index: 0,
    type: 'reveal_initial_board',
    board: [
      { symbol: '2S' },
      { symbol: '5S' },
      { symbol: 'JOKER' },
      { symbol: 'JS' },
      { symbol: 'KS' },
    ],
  } satisfies RevealInitialBoardEvent,

  reveal_joker_straight_flush: {
    index: 0,
    type: 'reveal_initial_board',
    board: [
      { symbol: '5D' },
      { symbol: '6D' },
      { symbol: '7D' },
      { symbol: 'JOKER' },
      { symbol: '9D' },
    ],
  } satisfies RevealInitialBoardEvent,

  joker_transform_to_king: {
    index: 1,
    type: 'joker_transform',
    jokerTransforms: [{ position: 0, targetSymbol: 'KC' as Symbol }],
  } satisfies JokerTransformEvent,

  joker_transform_to_royal: {
    index: 1,
    type: 'joker_transform',
    jokerTransforms: [{ position: 3, targetSymbol: 'KH' as Symbol }],
  } satisfies JokerTransformEvent,

  joker_transform_to_straight: {
    index: 1,
    type: 'joker_transform',
    jokerTransforms: [{ position: 2, targetSymbol: '8D' as Symbol }],
  } satisfies JokerTransformEvent,

  joker_transform_to_flush: {
    index: 1,
    type: 'joker_transform',
    jokerTransforms: [{ position: 2, targetSymbol: '7S' as Symbol }],
  } satisfies JokerTransformEvent,

  joker_transform_to_straight_flush: {
    index: 1,
    type: 'joker_transform',
    jokerTransforms: [{ position: 3, targetSymbol: '8D' as Symbol }],
  } satisfies JokerTransformEvent,

  hand_result_three_of_a_kind_from_joker: {
    index: 2,
    type: 'hand_result',
    handCategory: 'THREE_OF_A_KIND',
    payoutMultiplier: 3,
    winningPositions: [0, 1, 2],
    jackpot: false,
  } satisfies HandResultEvent,

  hand_result_royal_flush_from_joker: {
    index: 2,
    type: 'hand_result',
    handCategory: 'ROYAL_FLUSH',
    payoutMultiplier: 1000,
    winningPositions: [0, 1, 2, 3, 4],
    jackpot: true,
  } satisfies HandResultEvent,

  hand_result_straight_from_joker: {
    index: 2,
    type: 'hand_result',
    handCategory: 'STRAIGHT',
    payoutMultiplier: 5,
    winningPositions: [0, 1, 2, 3, 4],
    jackpot: false,
  } satisfies HandResultEvent,

  hand_result_flush_from_joker: {
    index: 2,
    type: 'hand_result',
    handCategory: 'FLUSH',
    payoutMultiplier: 10,
    winningPositions: [0, 1, 2, 3, 4],
    jackpot: true,
  } satisfies HandResultEvent,

  hand_result_straight_flush_from_joker: {
    index: 2,
    type: 'hand_result',
    handCategory: 'STRAIGHT_FLUSH',
    payoutMultiplier: 100,
    winningPositions: [0, 1, 2, 3, 4],
    jackpot: true,
  } satisfies HandResultEvent,
};

export default bonusEvents;
