import {
  AuthenticateRequest,
  AuthenticateResponse,
  PlayRequest,
  PlayResponse,
  EndRoundRequest,
  EndRoundResponse,
  BalanceResponse,
} from '../types';
import { displayToEngineUnits } from '../utils/money';
import { generateMockEvents, getRandomScenario } from './mockData';

/**
 * Mock RGS Client - simulates Stake Engine API
 * This will be replaced with real API calls later
 */

// Mock state
let mockBalance = displayToEngineUnits(4530); // $4,530.00
let mockSessionID = 'mock-session-123';
let currentRoundId = 0;

// Bet levels from spec
const BET_LEVELS = [
  displayToEngineUnits(0.1),
  displayToEngineUnits(0.5),
  displayToEngineUnits(1),
  displayToEngineUnits(5),
  displayToEngineUnits(10),
  displayToEngineUnits(50),
  displayToEngineUnits(100),
  displayToEngineUnits(500),
  displayToEngineUnits(1000),
];

/**
 * Simulate network delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class MockRgsClient {
  private rgsUrl: string;
  
  constructor(rgsUrl?: string) {
    this.rgsUrl = rgsUrl || 'mock://rgs-api';
  }
  
  /**
   * POST /wallet/authenticate
   */
  async authenticate(request: AuthenticateRequest): Promise<AuthenticateResponse> {
    await delay(300); // Simulate network
    
    console.log('[MockRGS] Authenticate:', request);
    
    mockSessionID = request.sessionID;
    
    return {
      balance: mockBalance,
      config: {
        minBet: BET_LEVELS[0],
        maxBet: BET_LEVELS[BET_LEVELS.length - 1],
        stepBet: BET_LEVELS[0],
        betLevels: BET_LEVELS,
        currency: 'USD',
      },
      sessionID: mockSessionID,
    };
  }
  
  /**
   * POST /wallet/play
   */
  async play(request: PlayRequest): Promise<PlayResponse> {
    await delay(500); // Simulate network
    
    console.log('[MockRGS] Play:', request);
    
    // Validate session
    if (request.sessionID !== mockSessionID) {
      throw new Error('ERR_IS: Invalid session');
    }
    
    // Validate balance
    if (mockBalance < request.amount) {
      throw new Error('ERR_IPB: Insufficient balance');
    }
    
    // Deduct bet
    mockBalance -= request.amount;
    
    // Generate random scenario
    const scenario = getRandomScenario();
    const events = generateMockEvents(scenario);
    
    // Calculate win
    const winAmount = Math.round(request.amount * scenario.payoutMultiplier);
    
    currentRoundId++;
    
    console.log('[MockRGS] Generated scenario:', scenario.name, 
                `x${scenario.payoutMultiplier}`,
                winAmount > 0 ? `Win: ${winAmount}` : 'Loss');
    
    return {
      balance: mockBalance,
      round: {
        id: `round-${currentRoundId}`,
        events,
        winAmount, // Not in spec but useful for debugging
      },
    };
  }
  
  /**
   * POST /wallet/end-round
   */
  async endRound(request: EndRoundRequest): Promise<EndRoundResponse> {
    await delay(200); // Simulate network
    
    console.log('[MockRGS] End round:', request);
    
    // In real API, this would credit the win
    // For mock, we'll assume the win was already calculated
    // and stored somewhere, so we just return balance
    
    return {
      balance: mockBalance,
    };
  }
  
  /**
   * GET /wallet/balance
   */
  async getBalance(): Promise<BalanceResponse> {
    await delay(100); // Simulate network
    
    return {
      balance: mockBalance,
    };
  }
  
  /**
   * Credit win (helper for mock)
   */
  creditWin(amount: number): void {
    mockBalance += amount;
    console.log('[MockRGS] Credited win:', amount, 'New balance:', mockBalance);
  }
  
  /**
   * Get current balance (for debugging)
   */
  getCurrentBalance(): number {
    return mockBalance;
  }
  
  /**
   * Set balance (for testing)
   */
  setBalance(amount: number): void {
    mockBalance = amount;
    console.log('[MockRGS] Balance set to:', mockBalance);
  }
}

// Export singleton instance
export const mockRgsClient = new MockRgsClient();
