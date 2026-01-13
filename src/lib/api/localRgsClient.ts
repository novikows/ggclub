/**
 * Local RGS Client for testing with Python server
 * 
 * Connects to local server at http://localhost:8000
 */

import config from '../config';
import type {
  AuthenticateRequest,
  AuthenticateResponse,
  PlayRequest,
  PlayResponse,
  EndRoundRequest,
  EndRoundResponse,
  BalanceResponse,
} from '$lib/types';

const BASE_URL = config.localRgsUrl || 'http://localhost:8000';

/**
 * POST /api/auth
 */
export async function authenticate(
  request: AuthenticateRequest
): Promise<AuthenticateResponse> {
  console.log('[LocalRGS] authenticate() called');
  
  const response = await fetch(`${BASE_URL}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error(`Auth failed: ${response.statusText}`);
  }
  
  return await response.json();
}

/**
 * POST /api/play
 */
export async function play(
  request: PlayRequest
): Promise<PlayResponse> {
  console.log('[LocalRGS] play() called');
  console.log('[LocalRGS] Bet:', request.amount);
  
  const response = await fetch(`${BASE_URL}/api/play`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || response.statusText);
  }
  
  const result = await response.json();
  console.log('[LocalRGS] Events:', result.round.events);
  return result;
}

/**
 * POST /wallet/end-round
 */
export async function endRound(
  _request: EndRoundRequest
): Promise<EndRoundResponse> {
  console.log('[LocalRGS] endRound() called');
  
  return {
    balance: 0,
  };
}

/**
 * GET /wallet/balance
 */
export async function getBalance(): Promise<BalanceResponse> {
  console.log('[LocalRGS] getBalance() called');
  
  return {
    balance: 0,
  };
}

/**
 * Event listeners (no-op for local)
 */
export function onBalanceUpdate(_callback: (balance: number) => void): void {
  console.log('[LocalRGS] onBalanceUpdate listener registered (no-op)');
}

export function onRoundStateChange(_callback: (state: string) => void): void {
  console.log('[LocalRGS] onRoundStateChange listener registered (no-op)');
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

export { StakeEngineError, ERROR_CODES } from './stakeRgsClient';
