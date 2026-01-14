// ============================================================================
// SYMBOL & CARD TYPES
// ============================================================================

/** Card rank: 2-10, J, Q, K, A */
export type CardRank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

/** Card suit: Clubs, Diamonds, Hearts, Spades */
export type CardSuit = 'C' | 'D' | 'H' | 'S';

/** Card symbol: e.g., "AS", "10H", "KC" */
export type CardSymbol = `${CardRank}${CardSuit}`;

/** Symbol type including Joker */
export type Symbol = CardSymbol | 'JOKER';

/** Symbol object from RGS */
export interface SymbolObject {
  symbol: Symbol;
}

// ============================================================================
// POKER HAND TYPES
// ============================================================================

/** Poker hand categories */
export type HandCategory = 
  | 'HIGH_CARD'
  | 'PAIR'
  | 'TWO_PAIR'
  | 'THREE_OF_A_KIND'
  | 'STRAIGHT'
  | 'FLUSH'
  | 'FULL_HOUSE'
  | 'FOUR_OF_A_KIND'
  | 'STRAIGHT_FLUSH'
  | 'ROYAL_FLUSH';

/** Visual tier for win modal display */
export type HandTier = 'NORMAL' | 'MEDIUM' | 'HIGH' | 'BEST' | 'JACKPOT';

// ============================================================================
// RGS EVENT TYPES
// ============================================================================

/** Base event structure from Stake Engine */
export interface BaseEvent {
  index: number;
  type: string;
}

/** Event: Initial board reveal */
export interface RevealInitialBoardEvent extends BaseEvent {
  type: 'reveal_initial_board';
  board: SymbolObject[]; // Array of 5 symbols
}

/** Event: Joker transformation (optional) */
export interface JokerTransformEvent extends BaseEvent {
  type: 'joker_transform';
  jokerTransforms: Array<{
    position: number; // 0-4
    targetSymbol: Symbol;
  }>;
}

/** Event: Final hand result */
export interface HandResultEvent extends BaseEvent {
  type: 'hand_result';
  handCategory: HandCategory;
  payoutMultiplier: number;
  winningPositions: number[]; // Array of indices 0-4
  jackpot: boolean;
}

/** Event: Round summary (optional, for debug) */
export interface RoundSummaryEvent extends BaseEvent {
  type: 'round_summary';
  totalWin: number;
  betAmount: number;
  [key: string]: any; // Additional debug info
}

/** Union of all possible game events */
export type GameEvent = 
  | RevealInitialBoardEvent 
  | JokerTransformEvent 
  | HandResultEvent 
  | RoundSummaryEvent;

// ============================================================================
// RGS API TYPES
// ============================================================================

/** POST /wallet/authenticate request */
export interface AuthenticateRequest {
  sessionID: string;
}

/** Bonus mode configuration */
export interface BonusMode {
  id: string;
  name: string;
  cost: number;
  description: string;
  icon: string;
}

/** POST /wallet/authenticate response */
export interface AuthenticateResponse {
  balance: number; // Integer with 6 decimal places (e.g., 1000000 = $1.00)
  config: {
    minBet: number;
    maxBet: number;
    stepBet: number;
    betLevels: number[];
    currency: string;
    jurisdiction?: {
      disabledTurbo?: boolean;
      [key: string]: any;
    };
    bonusModes?: BonusMode[];
    [key: string]: any;
  };
  sessionID: string;
}

/** POST /wallet/play request */
export interface PlayRequest {
  sessionID: string;
  amount: number; // Bet in engine units (e.g., 1000000 = $1.00)
  mode: string; // Game mode: 'base', 'bonus_1joker', 'bonus_2jokers'
}

/** POST /wallet/play response */
export interface PlayResponse {
  balance: number; // Balance after bet deducted
  round: {
    id: string;
    events: GameEvent[]; // Ordered array of events
    [key: string]: any;
  };
}

/** POST /wallet/end-round request */
export interface EndRoundRequest {
  sessionID: string;
}

/** POST /wallet/end-round response */
export interface EndRoundResponse {
  balance: number; // Balance after win credited
}

/** GET /wallet/balance response */
export interface BalanceResponse {
  balance: number;
}

// ============================================================================
// GAME STATE TYPES
// ============================================================================

/** Game FSM states */
export type GameState = 
  | 'INIT' 
  | 'IDLE' 
  | 'SPINNING' 
  | 'JOKER_TRANSFORM' 
  | 'DISPLAYING_WIN' 
  | 'ERROR';

/** Current board state */
export interface BoardState {
  cards: (Symbol | null)[]; // Array of 5 symbols (null = not revealed yet)
  revealed: boolean[]; // Array of 5 booleans (true = face-up)
}

/** Game state manager */
export interface GameStateManager {
  state: GameState;
  balance: number;
  currentBet: number;
  lastWin: number;
  board: BoardState;
  currentEvents: GameEvent[];
  sessionID: string | null;
  config: AuthenticateResponse['config'] | null;
}

// ============================================================================
// UI TYPES
// ============================================================================

/** Bet level in display units (e.g., 0.1, 1, 10) */
export type BetLevel = 0.1 | 0.5 | 1 | 5 | 10 | 50 | 100 | 500 | 1000;

/** Sound state */
export interface SoundState {
  enabled: boolean;
  volume: number; // 0-1
}

/** Modal types */
export type ModalType = 'WIN' | 'INFO' | 'PAYTABLE' | 'ERROR' | null;

// ============================================================================
// ERROR TYPES
// ============================================================================

/** RGS error codes (see Stake Engine docs for complete list) */
export type RGSErrorCode = 
  | 'ERR_IS'   // Invalid Session
  | 'ERR_IPB'  // Insufficient Player Balance
  | 'ERR_NETWORK' // Network/timeout error
  | string;    // Other error codes from Stake Engine

/** Error state */
export interface ErrorState {
  code: RGSErrorCode;
  message: string;
  recoverable: boolean; // Can retry?
}

// ============================================================================
// ANIMATION TYPES
// ============================================================================

/** Animation action from EventProcessor */
export interface AnimationAction {
  type: 'REVEAL_CARDS' | 'JOKER_TRANSFORM' | 'SHOW_WIN';
  payload: any;
}
