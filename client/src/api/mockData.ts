import { 
  GameEvent, 
  Symbol, 
  HandCategory,
  HandResultEvent,
  RevealInitialBoardEvent,
  JokerTransformEvent 
} from '../types';

/**
 * Mock game scenarios for testing
 */

interface MockScenario {
  name: string;
  board: Symbol[];
  hasJoker: boolean;
  jokerTransforms?: Array<{ position: number; targetSymbol: Symbol }>;
  handCategory: HandCategory;
  payoutMultiplier: number;
  winningPositions: number[];
}

export const MOCK_SCENARIOS: MockScenario[] = [
  // Loss scenarios
  {
    name: 'No win - low cards',
    board: ['2C', '5D', '7H', '9S', '3C'],
    hasJoker: false,
    handCategory: 'HIGH_CARD',
    payoutMultiplier: 0,
    winningPositions: [],
  },
  
  // Normal wins
  {
    name: 'Pair of Aces',
    board: ['AS', 'AD', '7H', '9S', '3C'],
    hasJoker: false,
    handCategory: 'PAIR',
    payoutMultiplier: 0.4,
    winningPositions: [0, 1],
  },
  {
    name: 'Two Pair - Kings and Queens',
    board: ['KS', 'KD', 'QH', 'QS', '3C'],
    hasJoker: false,
    handCategory: 'TWO_PAIR',
    payoutMultiplier: 0.8,
    winningPositions: [0, 1, 2, 3],
  },
  
  // Medium wins
  {
    name: 'Three of a Kind - 7s',
    board: ['7S', '7D', '7H', '9S', '3C'],
    hasJoker: false,
    handCategory: 'THREE_OF_A_KIND',
    payoutMultiplier: 1.5,
    winningPositions: [0, 1, 2],
  },
  
  // High wins
  {
    name: 'Three of a Kind - Aces',
    board: ['AS', 'AD', 'AH', '9S', '3C'],
    hasJoker: false,
    handCategory: 'THREE_OF_A_KIND',
    payoutMultiplier: 3,
    winningPositions: [0, 1, 2],
  },
  {
    name: 'Straight - 5 to 9',
    board: ['5S', '6D', '7H', '8C', '9S'],
    hasJoker: false,
    handCategory: 'STRAIGHT',
    payoutMultiplier: 5,
    winningPositions: [0, 1, 2, 3, 4],
  },
  
  // Jackpot wins
  {
    name: 'Flush - Hearts',
    board: ['2H', '5H', '7H', 'JH', 'KH'],
    hasJoker: false,
    handCategory: 'FLUSH',
    payoutMultiplier: 10,
    winningPositions: [0, 1, 2, 3, 4],
  },
  {
    name: 'Full House - Aces over Kings',
    board: ['AS', 'AD', 'AH', 'KS', 'KC'],
    hasJoker: false,
    handCategory: 'FULL_HOUSE',
    payoutMultiplier: 20,
    winningPositions: [0, 1, 2, 3, 4],
  },
  {
    name: 'Four of a Kind - Jacks',
    board: ['JS', 'JD', 'JH', 'JC', '3C'],
    hasJoker: false,
    handCategory: 'FOUR_OF_A_KIND',
    payoutMultiplier: 40,
    winningPositions: [0, 1, 2, 3],
  },
  {
    name: 'Straight Flush - 7 to Jack',
    board: ['7H', '8H', '9H', '10H', 'JH'],
    hasJoker: false,
    handCategory: 'STRAIGHT_FLUSH',
    payoutMultiplier: 100,
    winningPositions: [0, 1, 2, 3, 4],
  },
  {
    name: 'Royal Flush - Spades',
    board: ['10S', 'JS', 'QS', 'KS', 'AS'],
    hasJoker: false,
    handCategory: 'ROYAL_FLUSH',
    payoutMultiplier: 1000,
    winningPositions: [0, 1, 2, 3, 4],
  },
  
  // Joker scenarios
  {
    name: 'Joker completes Pair of Aces',
    board: ['AS', 'JOKER', '7H', '9S', '3C'],
    hasJoker: true,
    jokerTransforms: [{ position: 1, targetSymbol: 'AD' }],
    handCategory: 'PAIR',
    payoutMultiplier: 0.4,
    winningPositions: [0, 1],
  },
  {
    name: 'Joker completes Three of a Kind',
    board: ['KS', 'KD', 'JOKER', '9S', '3C'],
    hasJoker: true,
    jokerTransforms: [{ position: 2, targetSymbol: 'KH' }],
    handCategory: 'THREE_OF_A_KIND',
    payoutMultiplier: 3,
    winningPositions: [0, 1, 2],
  },
  {
    name: 'Two Jokers complete Four of a Kind',
    board: ['AS', 'JOKER', 'AD', 'JOKER', '3C'],
    hasJoker: true,
    jokerTransforms: [
      { position: 1, targetSymbol: 'AH' },
      { position: 3, targetSymbol: 'AC' },
    ],
    handCategory: 'FOUR_OF_A_KIND',
    payoutMultiplier: 40,
    winningPositions: [0, 1, 2, 3],
  },
  {
    name: 'Joker completes Royal Flush',
    board: ['10H', 'JOKER', 'QH', 'KH', 'AH'],
    hasJoker: true,
    jokerTransforms: [{ position: 1, targetSymbol: 'JH' }],
    handCategory: 'ROYAL_FLUSH',
    payoutMultiplier: 1000,
    winningPositions: [0, 1, 2, 3, 4],
  },
];

/**
 * Generate mock events for a scenario
 */
export function generateMockEvents(scenario: MockScenario): GameEvent[] {
  const events: GameEvent[] = [];
  
  // Event 1: Reveal initial board
  const revealEvent: RevealInitialBoardEvent = {
    index: 0,
    type: 'reveal_initial_board',
    board: scenario.board.map(symbol => ({ symbol })),
  };
  events.push(revealEvent);
  
  // Event 2: Joker transform (if applicable)
  if (scenario.hasJoker && scenario.jokerTransforms) {
    const jokerEvent: JokerTransformEvent = {
      index: 1,
      type: 'joker_transform',
      jokerTransforms: scenario.jokerTransforms,
    };
    events.push(jokerEvent);
  }
  
  // Event 3: Hand result
  const resultEvent: HandResultEvent = {
    index: scenario.hasJoker ? 2 : 1,
    type: 'hand_result',
    handCategory: scenario.handCategory,
    payoutMultiplier: scenario.payoutMultiplier,
    winningPositions: scenario.winningPositions,
    jackpot: scenario.payoutMultiplier >= 40,
  };
  events.push(resultEvent);
  
  return events;
}

/**
 * Get random scenario
 */
export function getRandomScenario(): MockScenario {
  // Weighted selection - more common hands appear more often
  const weights = [
    3, // Loss
    5, // Pair of Aces
    4, // Two Pair
    3, // Three 7s
    2, // Three Aces
    2, // Straight
    1, // Flush
    1, // Full House
    1, // Four of a Kind
    0.5, // Straight Flush
    0.2, // Royal Flush
    3, // Joker pair
    2, // Joker three
    0.5, // Two jokers four
    0.2, // Joker royal
  ];
  
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < MOCK_SCENARIOS.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return MOCK_SCENARIOS[i];
    }
  }
  
  return MOCK_SCENARIOS[0];
}
