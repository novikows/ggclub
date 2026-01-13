import type { 
  GameEvent, 
  Symbol, 
  HandCategory,
  HandResultEvent,
  RevealInitialBoardEvent,
  JokerTransformEvent,
  CardSymbol 
} from '$lib/types';

/**
 * Mock game scenarios for testing
 */

interface MockScenarioBase {
  name: string;
  board: Symbol[];
  hasJoker: boolean;
  jokerTransforms?: Array<{ position: number; targetSymbol: Symbol }>;
  handCategory: HandCategory;
  payoutMultiplier: number;
  winningPositions: number[];
}

interface MockScenario extends MockScenarioBase {
  round: {
    id: string;
    events: GameEvent[];
  };
}

/**
 * Rank values for comparison (higher is better)
 */
const RANK_VALUES: Record<string, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14,
};

/**
 * Convert scenario to game events
 */
function generateMockEvents(scenario: MockScenarioBase): GameEvent[] {
  const events: GameEvent[] = [];
  let index = 0;

  // Event 1: Reveal initial board
  const revealEvent: RevealInitialBoardEvent = {
    index: index++,
    type: 'reveal_initial_board',
    board: scenario.board.map(symbol => ({ symbol }))
  };
  events.push(revealEvent);

  // Event 2: Joker transform (if any)
  if (scenario.jokerTransforms && scenario.jokerTransforms.length > 0) {
    const jokerEvent: JokerTransformEvent = {
      index: index++,
      type: 'joker_transform',
      jokerTransforms: scenario.jokerTransforms
    };
    events.push(jokerEvent);
  }

  // Event 3: Hand result
  const resultEvent: HandResultEvent = {
    index: index++,
    type: 'hand_result',
    handCategory: scenario.handCategory,
    payoutMultiplier: scenario.payoutMultiplier,
    winningPositions: scenario.winningPositions,
    jackpot: scenario.payoutMultiplier >= 10
  };
  events.push(resultEvent);

  return events;
}

/**
 * Create round from scenario
 */
function createRound(scenario: MockScenarioBase) {
  return {
    id: `mock-round-${Date.now()}`,
    events: generateMockEvents(scenario)
  };
}

const scenarios: MockScenarioBase[] = [
  {
    name: 'Royal Flush',
    board: ['10H', 'JH', 'QH', 'KH', 'AH'] as Symbol[],
    hasJoker: false,
    handCategory: 'ROYAL_FLUSH' as HandCategory,
    payoutMultiplier: 1000,
    winningPositions: [0, 1, 2, 3, 4],
  },
  {
    name: 'Straight Flush',
    board: ['5D', '6D', '7D', '8D', '9D'] as Symbol[],
    hasJoker: false,
    handCategory: 'STRAIGHT_FLUSH' as HandCategory,
    payoutMultiplier: 100,
    winningPositions: [0, 1, 2, 3, 4],
  },
  {
    name: 'Four of a Kind',
    board: ['AS', 'AC', 'AD', 'AH', 'KS'] as Symbol[],
    hasJoker: false,
    handCategory: 'FOUR_OF_A_KIND' as HandCategory,
    payoutMultiplier: 40,
    winningPositions: [0, 1, 2, 3],
  },
  {
    name: 'Full House',
    board: ['KS', 'KC', 'KH', 'QS', 'QD'] as Symbol[],
    hasJoker: false,
    handCategory: 'FULL_HOUSE' as HandCategory,
    payoutMultiplier: 20,
    winningPositions: [0, 1, 2, 3, 4],
  },
  {
    name: 'Flush',
    board: ['2S', '5S', '7S', 'JS', 'KS'] as Symbol[],
    hasJoker: false,
    handCategory: 'FLUSH' as HandCategory,
    payoutMultiplier: 10,
    winningPositions: [0, 1, 2, 3, 4],
  },
  {
    name: 'Straight',
    board: ['6H', '7S', '8D', '9C', '10H'] as Symbol[],
    hasJoker: false,
    handCategory: 'STRAIGHT' as HandCategory,
    payoutMultiplier: 5,
    winningPositions: [0, 1, 2, 3, 4],
  },
  {
    name: 'Three of a Kind',
    board: ['JS', 'JD', 'JH', '5C', '7H'] as Symbol[],
    hasJoker: false,
    handCategory: 'THREE_OF_A_KIND' as HandCategory,
    payoutMultiplier: 3,
    winningPositions: [0, 1, 2],
  },
  {
    name: 'Two Pair',
    board: ['10S', '10D', '8H', '8C', '3S'] as Symbol[],
    hasJoker: false,
    handCategory: 'TWO_PAIR' as HandCategory,
    payoutMultiplier: 1.5,
    winningPositions: [0, 1, 2, 3],
  },
  {
    name: 'Pair',
    board: ['KS', 'KD', '7H', '5C', '3S'] as Symbol[],
    hasJoker: false,
    handCategory: 'PAIR' as HandCategory,
    payoutMultiplier: 0.9,
    winningPositions: [0, 1],
  },
  {
    name: 'High Card',
    board: ['AS', '10D', '7H', '5C', '2S'] as Symbol[],
    hasJoker: false,
    handCategory: 'HIGH_CARD' as HandCategory,
    payoutMultiplier: 0.35,
    winningPositions: [0],
  },
  {
    name: 'Joker + Pair → Three of a Kind',
    board: ['JOKER', 'KS', 'KD', '7H', '3S'] as Symbol[],
    hasJoker: true,
    jokerTransforms: [{ position: 0, targetSymbol: 'KC' as Symbol }],
    handCategory: 'THREE_OF_A_KIND' as HandCategory,
    payoutMultiplier: 3,
    winningPositions: [0, 1, 2],
  },
  {
    name: 'Joker + High Card → Pair',
    board: ['AS', '10D', '7H', 'JOKER', '2S'] as Symbol[],
    hasJoker: true,
    jokerTransforms: [{ position: 3, targetSymbol: 'AH' as Symbol }],
    handCategory: 'PAIR' as HandCategory,
    payoutMultiplier: 0.9,
    winningPositions: [0, 3],
  },
  {
    name: 'Two Jokers → Four of a Kind',
    board: ['JOKER', '10S', 'JOKER', '10D', '5C'] as Symbol[],
    hasJoker: true,
    jokerTransforms: [
      { position: 0, targetSymbol: '10H' as Symbol },
      { position: 2, targetSymbol: '10C' as Symbol }
    ],
    handCategory: 'FOUR_OF_A_KIND' as HandCategory,
    payoutMultiplier: 40,
    winningPositions: [0, 1, 2, 3],
  },
  {
    name: 'Joker → Royal Flush',
    board: ['10H', 'JH', 'QH', 'JOKER', 'AH'] as Symbol[],
    hasJoker: true,
    jokerTransforms: [{ position: 3, targetSymbol: 'KH' as Symbol }],
    handCategory: 'ROYAL_FLUSH' as HandCategory,
    payoutMultiplier: 1000,
    winningPositions: [0, 1, 2, 3, 4],
  },
];

export const MOCK_SCENARIOS: MockScenario[] = scenarios.map((scenario): MockScenario => ({
  ...scenario,
  round: createRound(scenario)
}));

export function getRandomScenario(): MockScenario {
  const weights = [
    0.1,  // Royal flush
    0.2,  // Straight flush
    0.5,  // Four of a kind
    1.0,  // Full house
    2.0,  // Flush
    3.0,  // Straight
    5.0,  // Three of a kind
    8.0,  // Two pair
    15.0, // Pair
    20.0, // High card
    5.0,  // Joker + Pair → Three of a Kind
    10.0, // Joker + High Card → Pair
    1.0,  // Two Jokers → Four of a Kind
    0.2,  // Joker → Royal Flush
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
