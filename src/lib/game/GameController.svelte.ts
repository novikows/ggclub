import { gameState } from './gameState.svelte';
import { EventProcessor } from './EventProcessor';
import * as rgsClient from '$lib/api';
import { StakeEngineError, ERROR_CODES } from '$lib/api';
import type { PlayResponse, AnimationAction } from '$lib/types';
import config from '$lib/config';

export class GameController {
  private eventProcessor: EventProcessor;
  private animationQueue: AnimationAction[] = [];
  private onAnimationAction?: (action: AnimationAction) => Promise<void>;

  constructor() {
    this.eventProcessor = new EventProcessor();
  }

  setAnimationHandler(handler: (action: AnimationAction) => Promise<void>): void {
    this.onAnimationAction = handler;
  }

  async initialize(): Promise<void> {
    console.log('[GameController] Initializing...');
    gameState.setState('INIT');

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionID = urlParams.get('sessionID');
      const rgsUrl = urlParams.get('rgs_url');

      if (!sessionID && config.rgsMode === 'stake') {
        throw new Error('Missing sessionID in URL parameters. Game must be opened from Stake platform.');
      }

      const finalSessionID = sessionID || 'default-session';

      if (config.enableDebug) {
        console.log('[GameController] Session ID:', finalSessionID);
        console.log('[GameController] RGS URL:', rgsUrl || 'default');
        console.log('[GameController] RGS Mode:', config.rgsMode);
      }

      const response = await rgsClient.authenticate({ sessionID: finalSessionID });

      gameState.setSessionID(response.sessionID);
      gameState.setConfig(response.config);
      gameState.setBalance(response.balance);

      if (response.config.betLevels.length > 0) {
        gameState.setCurrentBet(response.config.betLevels[0]);
      }

      console.log('[GameController] Authenticated successfully');
      console.log('[GameController] Balance:', response.balance);
      console.log('[GameController] Bet levels:', response.config.betLevels);

      gameState.setState('IDLE');

    } catch (error) {
      console.error('[GameController] Initialization failed:', error);

      if (error instanceof StakeEngineError) {
        this.handleStakeEngineError(error);
      } else {
        gameState.setState('ERROR');
      }

      throw error;
    }
  }

  async play(): Promise<void> {
    if (!gameState.canPlay()) {
      console.warn('[GameController] Cannot play in current state');
      return;
    }

    console.log('[GameController] Starting round...');
    gameState.setState('SPINNING');
    gameState.resetBoard();
    gameState.setLastWin(0);

    try {
      const sessionID = gameState.getSessionID();
      const betAmount = gameState.getCurrentBet();

      if (!sessionID) {
        throw new Error('No session ID');
      }

      const selectedMode = gameState.getSelectedMode();
      
      const response: PlayResponse = await rgsClient.play({
        sessionID,
        amount: betAmount,
        mode: selectedMode,
      });

      if (config.enableDebug) {
        console.log('[GameController] Response:', response);
        console.log('[GameController] Events:', response.round?.events);
      }

      gameState.setBalance(response.balance);
      gameState.setCurrentEvents(response.round.events);

      const actions = this.eventProcessor.processEvents(response.round.events);
      this.animationQueue = actions;

      console.log('[GameController] Round started, processing', actions.length, 'actions');

      await this.executeAnimationQueue();

    } catch (error) {
      console.error('[GameController] Play failed:', error);

      if (error instanceof StakeEngineError) {
        this.handleStakeEngineError(error);
      } else {
        gameState.setState('ERROR');
      }

      throw error;
    }
  }

  private async executeAnimationQueue(): Promise<void> {
    for (const action of this.animationQueue) {
      console.log('[GameController] Executing action:', action.type);

      if (action.type === 'JOKER_TRANSFORM') {
        gameState.setState('JOKER_TRANSFORM');
      } else if (action.type === 'SHOW_WIN') {
        gameState.setState('DISPLAYING_WIN');
      }

      if (this.onAnimationAction) {
        await this.onAnimationAction(action);
      }

      if (action.type === 'SHOW_WIN') {
        const winAmount = Math.round(
          gameState.getCurrentBet() * action.payload.payoutMultiplier
        );

        if (winAmount > 0) {
          console.log('[GameController] Win amount:', winAmount);
          gameState.setLastWin(winAmount);
        } else {
          console.log('[GameController] No win');
        }

        try {
          const sessionID = gameState.getSessionID();
          if (sessionID) {
            const endResponse = await rgsClient.endRound({ sessionID });
            if (endResponse.balance > 0) {
              gameState.setBalance(endResponse.balance);
            }
          }
        } catch (error) {
          console.error('[GameController] endRound failed:', error);
        }
      }
    }

    this.animationQueue = [];

    await this.delay(2000);
    gameState.setState('IDLE');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private handleStakeEngineError(error: StakeEngineError): void {
    console.error('[GameController] Stake Engine Error:', error.code, error.message);

    switch (error.code) {
      case ERROR_CODES.ERR_IPB:
        gameState.setState('IDLE');
        break;

      case ERROR_CODES.ERR_IS:
      case ERROR_CODES.ERR_SE:
        gameState.setState('ERROR');
        break;

      case ERROR_CODES.ERR_NET:
      case ERROR_CODES.ERR_TIMEOUT:
        gameState.setState('IDLE');
        break;

      case ERROR_CODES.ERR_IBA:
      case ERROR_CODES.ERR_BBR:
      case ERROR_CODES.ERR_BAM:
        gameState.setState('IDLE');
        break;

      case ERROR_CODES.ERR_RIP:
        gameState.setState('SPINNING');
        break;

      default:
        gameState.setState('ERROR');
    }
  }
}

export type { AnimationAction };
