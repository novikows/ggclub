/**
 * Local RGS Client
 * 
 * Connects to local Math Server running on http://localhost:8000
 * Uses real pre-generated outcomes from pokerspin-math repository
 */

import type {
  AuthenticateRequest,
  AuthenticateResponse,
  PlayRequest,
  PlayResponse,
  EndRoundRequest,
  EndRoundResponse,
  BalanceResponse,
  GameEvent,
  Symbol,
  HandCategory,
} from '../types';

// ============================================================================
// CONFIGURATION
// ============================================================================

// Allow configuring RGS URL via environment variable for ngrok usage
const LOCAL_RGS_URL = import.meta.env.VITE_LOCAL_RGS_URL || 'https://8e9b96fc5466.ngrok-free.app'//'http://localhost:8000';

// ============================================================================
// ERROR HANDLING
// ============================================================================

export class LocalRgsError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'LocalRgsError';
  }
}

/**
 * Wrap fetch call with error handling
 */
async function fetchWithErrorHandling<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(`${LOCAL_RGS_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new LocalRgsError(
        error.message || `HTTP ${response.status}`,
        `ERR_${response.status}`,
        error
      );
    }

    return await response.json();
  } catch (error: any) {
    if (error instanceof LocalRgsError) {
      throw error;
    }
    
    // Network error or server not running
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new LocalRgsError(
        'Local Math Server not running. Please start: cd pokerspin-math && python -m games.joker_poker.server',
        'ERR_SERVER_NOT_RUNNING',
        error
      );
    }
    
    throw new LocalRgsError(
      error.message || 'Unknown error',
      'ERR_UNKNOWN',
      error
    );
  }
}

// ============================================================================
// STATE
// ============================================================================

let sessionID: string = '';
let currentBalance: number = 0;

// ============================================================================
// API METHODS
// ============================================================================

/**
 * Authenticate with local RGS
 */
export async function authenticate(
  _request: AuthenticateRequest
): Promise<AuthenticateResponse> {
  console.log('[LocalRGS] authenticate() called');
  
  const response = await fetchWithErrorHandling<{
    success: boolean;
    session_id: string;
    balance: number;
  }>('/api/auth', {
    method: 'POST',
    body: JSON.stringify({}),
  });

  if (!response.success) {
    throw new LocalRgsError('Authentication failed', 'ERR_AUTH');
  }

  sessionID = response.session_id;
  currentBalance = response.balance;

  console.log('[LocalRGS] Authenticated:', { sessionID, balance: currentBalance });

  return {
    balance: currentBalance,
    config: {
      minBet: 10000,      // $0.10
      maxBet: 100000000,  // $1000
      stepBet: 10000,     // $0.10
      betLevels: [
        10000,    // $0.10
        50000,    // $0.50
        100000,   // $1.00
        500000,   // $5.00
        1000000,  // $10.00
        5000000,  // $50.00
        10000000, // $100.00
        50000000, // $500.00
        100000000,// $1000.00
      ],
      currency: 'USD',
    },
    sessionID,
  };
}

/**
 * Play a round
 */
export async function play(
  request: PlayRequest
): Promise<PlayResponse> {
  console.log('[LocalRGS] play() called:', { bet: request.amount });

  const response = await fetchWithErrorHandling<{
    success: boolean;
    outcome: {
      id: number;
      payoutMultiplier: number;
      events: GameEvent[]; // Math Server already returns GameEvent format!
      handType: string;
      hasJoker: boolean;
      initialBoard: string[];
      finalBoard: string[];
    };
    balance: number;
    win_amount: number;
  }>('/api/play', {
    method: 'POST',
    body: JSON.stringify({
      bet: request.amount,
      session_id: sessionID,
    }),
  });

  if (!response.success) {
    throw new LocalRgsError('Play failed', 'ERR_PLAY');
  }

  currentBalance = response.balance;

  // Math Server already returns events in correct GameEvent format!
  // Just use them directly
  const events = response.outcome.events;

  console.log('[LocalRGS] Round complete:', {
    hand: response.outcome.handType,
    win: response.win_amount,
    balance: currentBalance,
    eventsCount: events.length,
  });

  return {
    balance: currentBalance,
    round: {
      id: `round-${response.outcome.id}`,
      events,
    },
  };
}

/**
 * End round (no-op for local server)
 */
export async function endRound(
  _request: EndRoundRequest
): Promise<EndRoundResponse> {
  console.log('[LocalRGS] endRound() called');
  
  return {
    balance: currentBalance,
  };
}

/**
 * Get current balance
 */
export async function getBalance(): Promise<BalanceResponse> {
  console.log('[LocalRGS] getBalance() called');

  // For local server, we track balance locally
  // Could also fetch from server if needed
  return {
    balance: currentBalance,
  };
}

/**
 * Health check
 */
export async function healthCheck(): Promise<{
  status: string;
  stats: any;
}> {
  return await fetchWithErrorHandling<any>('/health', {
    method: 'GET',
  });
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get current session ID
 */
export function getCurrentSessionID(): string {
  return sessionID;
}

/**
 * Get current balance
 */
export function getCurrentBalance(): number {
  return currentBalance;
}

/**
 * Test connection to local server
 */
export async function testConnection(): Promise<boolean> {
  try {
    const health = await healthCheck();
    console.log('[LocalRGS] Server health:', health);
    return health.status === 'healthy';
  } catch (error) {
    console.error('[LocalRGS] Connection test failed:', error);
    return false;
  }
}
