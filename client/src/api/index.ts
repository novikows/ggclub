/**
 * RGS Client Facade
 * 
 * Provides single import point for RGS client.
 * Automatically switches between mock and real based on config.
 */

import config from '../config';
import { MockRgsClient } from './mockRgsClient';
import * as StakeRgsClient from './stakeRgsClient';
import * as LocalRgsClient from './localRgsClient';
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
// CLIENT SELECTION
// ============================================================================

// Create mock instance
const mockClient = new MockRgsClient();

// Define interface for consistency
interface RgsClient {
  authenticate(request: AuthenticateRequest): Promise<AuthenticateResponse>;
  play(request: PlayRequest): Promise<PlayResponse>;
  endRound(request: EndRoundRequest): Promise<EndRoundResponse>;
  getBalance(): Promise<BalanceResponse>;
}

// Wrap mock client to match interface
const mockClientWrapper: RgsClient = {
  authenticate: (req) => mockClient.authenticate(req),
  play: (req) => mockClient.play(req),
  endRound: (req) => mockClient.endRound(req),
  getBalance: () => mockClient.getBalance(),
};

// Wrap Stake client to match interface
const stakeClientWrapper: RgsClient = {
  authenticate: (req) => StakeRgsClient.authenticate(req),
  play: (req) => StakeRgsClient.play(req),
  endRound: (req) => StakeRgsClient.endRound(req),
  getBalance: () => StakeRgsClient.getBalance(),
};

// Wrap Local client to match interface
const localClientWrapper: RgsClient = {
  authenticate: (req) => LocalRgsClient.authenticate(req),
  play: (req) => LocalRgsClient.play(req),
  endRound: (req) => LocalRgsClient.endRound(req),
  getBalance: () => LocalRgsClient.getBalance(),
};

// Select appropriate client based on config
let selectedClient: RgsClient;
switch (config.rgsMode) {
  case 'local':
    selectedClient = localClientWrapper;
    break;
  case 'stake':
    selectedClient = stakeClientWrapper;
    break;
  case 'mock':
  default:
    selectedClient = mockClientWrapper;
    break;
}

// Log which client is active
if (config.enableDebug) {
  console.log('[RGS Client] Using:', config.rgsMode.toUpperCase());
}

// ============================================================================
// EXPORTED API
// ============================================================================

/**
 * Authenticate with RGS
 */
export async function authenticate(
  request: AuthenticateRequest
): Promise<AuthenticateResponse> {
  return selectedClient.authenticate(request);
}

/**
 * Play a round
 */
export async function play(
  request: PlayRequest
): Promise<PlayResponse> {
  return selectedClient.play(request);
}

/**
 * End a round
 */
export async function endRound(
  request: EndRoundRequest
): Promise<EndRoundResponse> {
  return selectedClient.endRound(request);
}

/**
 * Get current balance
 */
export async function getBalance(): Promise<BalanceResponse> {
  return selectedClient.getBalance();
}

/**
 * Subscribe to balance updates
 * Only works with Stake Engine client
 */
export function onBalanceUpdate(callback: (balance: number) => void): void {
  if (config.rgsMode === 'stake') {
    StakeRgsClient.onBalanceUpdate(callback);
  } else if (config.enableDebug) {
    console.log(`[RGS Client] onBalanceUpdate not available in ${config.rgsMode} mode`);
  }
}

/**
 * Subscribe to round state changes
 * Only works with Stake Engine client
 */
export function onRoundStateChange(callback: (state: string) => void): void {
  if (config.rgsMode === 'stake') {
    StakeRgsClient.onRoundStateChange(callback);
  } else if (config.enableDebug) {
    console.log(`[RGS Client] onRoundStateChange not available in ${config.rgsMode} mode`);
  }
}

/**
 * Display amount with currency formatting
 */
export function displayAmount(
  amount: number,
  options?: {
    removeSymbol?: boolean;
    decimals?: number;
    wholeNumberDecimals?: boolean;
  }
): string {
  if (config.rgsMode === 'stake') {
    return StakeRgsClient.displayAmount(amount, options);
  }
  // Mock/Local fallback
  return `$${(amount / 1000000).toFixed(2)}`;
}

/**
 * Disconnect from RGS
 */
export async function disconnect(): Promise<void> {
  if (config.rgsMode === 'stake') {
    await StakeRgsClient.disconnect();
  }
}

// Export error types from Stake client
export {
  StakeEngineError,
  ERROR_CODES,
  ERROR_MESSAGES,
} from './stakeRgsClient';

// Export types
export type {
  AuthenticateRequest,
  AuthenticateResponse,
  PlayRequest,
  PlayResponse,
  EndRoundRequest,
  EndRoundResponse,
  BalanceResponse,
};
