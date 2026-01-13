/**
 * Mock RGS Client for local development
 * 
 * Simulates Stake Engine responses without backend connection
 */

import type {
  AuthenticateRequest,
  AuthenticateResponse,
  PlayRequest,
  PlayResponse,
  EndRoundRequest,
  EndRoundResponse,
  BalanceResponse,
} from '$lib/types';
import { MOCK_SCENARIOS } from './mockData';

// Mock state
let mockBalance = 100_000_000; // $100
let mockSessionID = 'mock-session-123';
let currentScenarioIndex = 0;

/**
 * POST /wallet/authenticate
 */
export async function authenticate(
  _request: AuthenticateRequest
): Promise<AuthenticateResponse> {
  console.log('[MockRGS] authenticate() called');
  
  await delay(300);
  
  return {
    balance: mockBalance,
    config: {
      minBet: 100_000,      // $0.10
      maxBet: 1_000_000_000, // $1000
      stepBet: 100_000,
      betLevels: [
        100_000,      // $0.10
        500_000,      // $0.50
        1_000_000,    // $1.00
        5_000_000,    // $5.00
        10_000_000,   // $10.00
        50_000_000,   // $50.00
        100_000_000,  // $100.00
        500_000_000,  // $500.00
        1_000_000_000 // $1000.00
      ],
      currency: 'USD',
      jurisdiction: {
        disabledTurbo: false,
      },
    },
    sessionID: mockSessionID,
  };
}

/**
 * POST /wallet/play
 */
export async function play(
  request: PlayRequest
): Promise<PlayResponse> {
  console.log('[MockRGS] play() called');
  console.log('[MockRGS] Bet:', request.amount);
  
  await delay(500);
  
  // Deduct bet from balance
  mockBalance -= request.amount;
  
  // Get scenario (cycle through mock scenarios)
  const scenario = MOCK_SCENARIOS[currentScenarioIndex % MOCK_SCENARIOS.length];
  currentScenarioIndex++;
  
  console.log('[MockRGS] Scenario:', scenario.name);
  console.log('[MockRGS] Events:', scenario.round.events);
  
  return {
    balance: mockBalance,
    round: scenario.round,
  };
}

/**
 * POST /wallet/end-round
 */
export async function endRound(
  _request: EndRoundRequest
): Promise<EndRoundResponse> {
  console.log('[MockRGS] endRound() called');
  
  await delay(200);
  
  // Balance already updated in play()
  return {
    balance: mockBalance,
  };
}

/**
 * GET /wallet/balance
 */
export async function getBalance(): Promise<BalanceResponse> {
  console.log('[MockRGS] getBalance() called');
  
  await delay(100);
  
  return {
    balance: mockBalance,
  };
}

/**
 * Event listeners (no-op for mock)
 */
export function onBalanceUpdate(_callback: (balance: number) => void): void {
  console.log('[MockRGS] onBalanceUpdate listener registered (no-op)');
}

export function onRoundStateChange(_callback: (state: string) => void): void {
  console.log('[MockRGS] onRoundStateChange listener registered (no-op)');
}

/**
 * Display amount helper
 */
export function displayAmount(
  amount: number,
  options?: {
    removeSymbol?: boolean;
    decimals?: number;
    wholeNumberDecimals?: boolean;
  }
): string {
  const dollars = amount / 1_000_000;
  const decimals = options?.decimals ?? 2;
  const formatted = dollars.toFixed(decimals);
  return options?.removeSymbol ? formatted : `$${formatted}`;
}

/**
 * Utility delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export error types for compatibility
export class StakeEngineError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'StakeEngineError';
  }
}

export const ERROR_CODES = {
  ERR_AUTH: 'AUTHENTICATION_FAILED',
  ERR_IS: 'INVALID_SESSION',
  ERR_SE: 'SESSION_EXPIRED',
  ERR_IPB: 'INSUFFICIENT_BALANCE',
  ERR_IBA: 'INVALID_BET_AMOUNT',
  ERR_BBR: 'BET_BELOW_MINIMUM',
  ERR_BAM: 'BET_ABOVE_MAXIMUM',
  ERR_GSU: 'GAME_SERVICE_UNAVAILABLE',
  ERR_IRR: 'INVALID_ROUND_REQUEST',
  ERR_RIP: 'ROUND_IN_PROGRESS',
  ERR_NET: 'NETWORK_ERROR',
  ERR_TIMEOUT: 'REQUEST_TIMEOUT',
} as const;
