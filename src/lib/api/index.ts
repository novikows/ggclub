/**
 * RGS Client API - Auto-selects correct client based on config
 */

import config from '$lib/config';

// Import all clients
import * as mockRgsClient from './mockRgsClient';
import * as localRgsClient from './localRgsClient';
import * as stakeRgsClient from './stakeRgsClient';

// Select client based on config
const client = 
  config.rgsMode === 'stake' ? stakeRgsClient :
  config.rgsMode === 'local' ? localRgsClient :
  mockRgsClient;

// Re-export all methods
export const authenticate = client.authenticate;
export const play = client.play;
export const endRound = client.endRound;
export const getBalance = client.getBalance;
export const onBalanceUpdate = client.onBalanceUpdate;
export const onRoundStateChange = client.onRoundStateChange;
export const displayAmount = client.displayAmount;

// Re-export types
export { StakeEngineError, ERROR_CODES } from './stakeRgsClient';
