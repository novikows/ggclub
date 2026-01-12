/**
 * Stake Engine RGS Client Wrapper
 * 
 * Wraps official Stake Engine client with our application types.
 * Provides clean interface matching mockRgsClient.ts for easy swap.
 */

// NOTE: Replace with actual import once Stake Engine package is available
// import { RGSClient } from 'stake-engine';
// For now, we'll create a placeholder that uses the same interface

import config from '../config';
import type {
  AuthenticateRequest,
  AuthenticateResponse,
  PlayRequest,
  PlayResponse,
  EndRoundRequest,
  EndRoundResponse,
  BalanceResponse,
} from '../types';

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Stake Engine Error
 * Standardized error format
 */
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

/**
 * Error codes from Stake Engine
 */
export const ERROR_CODES = {
  // Authentication errors
  ERR_AUTH: 'AUTHENTICATION_FAILED',
  ERR_IS: 'INVALID_SESSION',
  ERR_SE: 'SESSION_EXPIRED',
  
  // Balance errors
  ERR_IPB: 'INSUFFICIENT_BALANCE',
  ERR_IBA: 'INVALID_BET_AMOUNT',
  ERR_BBR: 'BET_BELOW_MINIMUM',
  ERR_BAM: 'BET_ABOVE_MAXIMUM',
  
  // Game errors
  ERR_GSU: 'GAME_SERVICE_UNAVAILABLE',
  ERR_IRR: 'INVALID_ROUND_REQUEST',
  ERR_RIP: 'ROUND_IN_PROGRESS',
  
  // Network errors
  ERR_NET: 'NETWORK_ERROR',
  ERR_TIMEOUT: 'REQUEST_TIMEOUT',
} as const;

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.ERR_AUTH]: 'Authentication failed. Please refresh the page.',
  [ERROR_CODES.ERR_IS]: 'Invalid session. Please refresh the page.',
  [ERROR_CODES.ERR_SE]: 'Session expired. Please refresh the page.',
  [ERROR_CODES.ERR_IPB]: 'Insufficient balance. Please add funds.',
  [ERROR_CODES.ERR_IBA]: 'Invalid bet amount. Please try again.',
  [ERROR_CODES.ERR_BBR]: 'Bet below minimum. Please increase your bet.',
  [ERROR_CODES.ERR_BAM]: 'Bet above maximum. Please decrease your bet.',
  [ERROR_CODES.ERR_GSU]: 'Game temporarily unavailable. Please try again.',
  [ERROR_CODES.ERR_IRR]: 'Invalid request. Please refresh the page.',
  [ERROR_CODES.ERR_RIP]: 'Round already in progress.',
  [ERROR_CODES.ERR_NET]: 'Network error. Please check your connection.',
  [ERROR_CODES.ERR_TIMEOUT]: 'Request timeout. Please try again.',
};

/**
 * Parse Stake Engine error
 */
function parseStakeEngineError(error: any): StakeEngineError {
  if (error instanceof StakeEngineError) {
    return error;
  }
  
  const code = error.code || ERROR_CODES.ERR_GSU;
  const message = ERROR_MESSAGES[code] || error.message || 'An error occurred';
  
  return new StakeEngineError(message, code, error.details);
}

/**
 * Wrap API call with error handling
 */
async function wrapApiCall<T>(
  methodName: string,
  apiCall: () => Promise<T>
): Promise<T> {
  try {
    return await apiCall();
  } catch (error: any) {
    console.error(`[StakeRGS] ${methodName} failed:`, error);
    throw parseStakeEngineError(error);
  }
}

// ============================================================================
// CLIENT INITIALIZATION
// ============================================================================

let rgsClient: any = null;
let currentSessionID: string = '';

/**
 * Initialize RGS client
 * Called automatically on first API call
 */
function initializeClient() {
  if (rgsClient) return rgsClient;
  
  if (config.logRgsCalls) {
    console.log('[StakeRGS] Initializing client...');
    console.log('[StakeRGS] URL:', window.location.href);
  }
  
  // TODO: Replace with actual Stake Engine client initialization
  // Example: rgsClient = RGSClient({ url: window.location.href });
  
  // For now, create a placeholder that will throw an error if used
  rgsClient = {
    initialized: false,
    error: 'Stake Engine client not yet initialized. Install stake-engine package.',
  };
  
  if (config.logRgsCalls) {
    console.log('[StakeRGS] Client initialized (placeholder mode)');
  }
  
  return rgsClient;
}

/**
 * Get client instance (lazy initialization)
 */
function getClient() {
  if (!rgsClient) {
    initializeClient();
  }
  return rgsClient;
}

/**
 * Get current session ID from URL params
 */
function getCurrentSessionID(): string {
  if (currentSessionID) return currentSessionID;
  const params = new URLSearchParams(window.location.search);
  currentSessionID = params.get('sessionID') || '';
  return currentSessionID;
}

// ============================================================================
// API METHODS
// ============================================================================

/**
 * POST /wallet/authenticate
 * 
 * Authenticates player session and gets initial game config.
 */
export async function authenticate(
  _request: AuthenticateRequest
): Promise<AuthenticateResponse> {
  return wrapApiCall('authenticate', async () => {
    const _client = getClient();
    
    if (config.logRgsCalls) {
      console.log('[StakeRGS] authenticate() called');
      console.log('[StakeRGS] Request:', _request);
    }
    
    // TODO: Replace with actual Stake Engine call
    // const response = await client.Authenticate();
    
    // Placeholder: throw error to indicate real client needed
    throw new StakeEngineError(
      'Stake Engine client not implemented yet. Using mock client.',
      ERROR_CODES.ERR_GSU,
      { message: 'Install stake-engine package and replace placeholder' }
    );
    
    // Example of what this will look like when implemented:
    // return {
    //   balance: response.balance.amount,
    //   config: {
    //     minBet: response.config.minBet,
    //     maxBet: response.config.maxBet,
    //     stepBet: response.config.stepBet,
    //     betLevels: response.config.betLevels,
    //     currency: response.balance.currency,
    //   },
    //   sessionID: response.sessionID,
    // };
  });
}

/**
 * POST /wallet/play
 * 
 * Starts a new game round with specified bet amount.
 */
export async function play(
  request: PlayRequest
): Promise<PlayResponse> {
  return wrapApiCall('play', async () => {
    const _client = getClient();
    
    if (config.logRgsCalls) {
      console.log('[StakeRGS] play() called');
      console.log('[StakeRGS] Request:', request);
    }
    
    // Validate session
    if (request.sessionID !== getCurrentSessionID()) {
      throw new StakeEngineError(
        ERROR_MESSAGES[ERROR_CODES.ERR_IS],
        ERROR_CODES.ERR_IS
      );
    }
    
    // TODO: Replace with actual Stake Engine call
    // const response = await client.Play({
    //   amount: request.amount,
    //   mode: request.mode || 'BASE',
    // });
    
    throw new StakeEngineError(
      'Stake Engine client not implemented yet. Using mock client.',
      ERROR_CODES.ERR_GSU
    );
    
    // Example return:
    // return {
    //   balance: response.balance.amount,
    //   round: {
    //     id: response.round.id,
    //     events: response.round.events,
    //   },
    // };
  });
}

/**
 * POST /wallet/end-round
 * 
 * Acknowledges round completion.
 */
export async function endRound(
  _request: EndRoundRequest
): Promise<EndRoundResponse> {
  return wrapApiCall('endRound', async () => {
    const _client = getClient();
    
    if (config.logRgsCalls) {
      console.log('[StakeRGS] endRound() called');
    }
    
    // TODO: Replace with actual Stake Engine call
    // const response = await client.EndRound();
    
    // EndRound is not critical, so return empty response
    return { balance: 0 };
    
    // Example return:
    // return {
    //   balance: response.balance.amount,
    // };
  });
}

/**
 * GET /wallet/balance
 * 
 * Gets current player balance.
 */
export async function getBalance(): Promise<BalanceResponse> {
  return wrapApiCall('getBalance', async () => {
    const _client = getClient();
    
    // TODO: Replace with actual Stake Engine call
    // const response = await client.GetBalance();
    
    throw new StakeEngineError(
      'Stake Engine client not implemented yet. Using mock client.',
      ERROR_CODES.ERR_GSU
    );
    
    // Example return:
    // return {
    //   balance: response.balance.amount,
    // };
  });
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Subscribe to balance updates
 * Stake Engine sends balance updates via WebSocket
 */
export function onBalanceUpdate(_callback: (balance: number) => void): void {
  const _client = getClient();
  
  if (config.logRgsCalls) {
    console.log('[StakeRGS] onBalanceUpdate listener registered (placeholder)');
  }
  
  // TODO: Replace with actual Stake Engine event listener
  // if (client.on) {
  //   client.on('balanceUpdate', (event: any) => {
  //     if (config.logRgsCalls) {
  //       console.log('[StakeRGS] Balance update:', event.balance);
  //     }
  //     callback(event.balance.amount);
  //   });
  // }
}

/**
 * Subscribe to round state changes
 */
export function onRoundStateChange(_callback: (state: string) => void): void {
  const _client = getClient();
  
  if (config.logRgsCalls) {
    console.log('[StakeRGS] onRoundStateChange listener registered (placeholder)');
  }
  
  // TODO: Replace with actual Stake Engine event listener
  // if (client.on) {
  //   client.on('roundStateChange', (event: any) => {
  //     if (config.logRgsCalls) {
  //       console.log('[StakeRGS] Round state:', event.state);
  //     }
  //     callback(event.state);
  //   });
  // }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Display amount with currency formatting
 * Uses Stake Engine's DisplayAmount helper if available
 */
export function displayAmount(
  amount: number,
  _options?: {
    removeSymbol?: boolean;
    decimals?: number;
    wholeNumberDecimals?: boolean;
  }
): string {
  const _client = getClient();
  
  // TODO: Use Stake Engine's DisplayAmount if available
  // if (client.DisplayAmount) {
  //   return client.DisplayAmount(amount, {
  //     removeSymbol: options?.removeSymbol ?? false,
  //     decimals: options?.decimals ?? 2,
  //     wholeNumberDecimals: options?.wholeNumberDecimals ?? true,
  //   });
  // }
  
  // Fallback formatting
  return `$${(amount / 1000000).toFixed(2)}`;
}

/**
 * Disconnect from Stake Engine
 * Called on page unload
 */
export async function disconnect(): Promise<void> {
  if (rgsClient && rgsClient.disconnect) {
    await rgsClient.disconnect();
    rgsClient = null;
  }
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    disconnect();
  });
}
