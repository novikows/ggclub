import { GameStateManager } from './GameStateManager';
import { EventProcessor, AnimationAction } from './EventProcessor';
import * as rgsClient from '../api';
import { StakeEngineError, ERROR_CODES } from '../api';
import { PlayResponse } from '../types';
import config from '../config';

/**
 * Game Controller - orchestrates game flow and RGS communication
 */
export class GameController {
  private stateManager: GameStateManager;
  private eventProcessor: EventProcessor;
  private animationQueue: AnimationAction[] = [];
  private onAnimationAction?: (action: AnimationAction) => Promise<void>;
  private gameApp?: any; // Reference to GameApp for error display
  
  constructor(stateManager: GameStateManager) {
    this.stateManager = stateManager;
    this.eventProcessor = new EventProcessor();
  }
  
  /**
   * Set reference to GameApp for error display
   */
  setGameApp(app: any): void {
    this.gameApp = app;
  }
  
  /**
   * Set animation handler
   */
  setAnimationHandler(handler: (action: AnimationAction) => Promise<void>): void {
    this.onAnimationAction = handler;
  }
  
  /**
   * Initialize game - authenticate with RGS
   */
  async initialize(): Promise<void> {
    console.log('[GameController] Initializing...');
    this.stateManager.setState('INIT');
    
    try {
      // Parse URL params
      const urlParams = new URLSearchParams(window.location.search);
      const sessionID = urlParams.get('sessionID') || 'default-session';
      const rgsUrl = urlParams.get('rgs_url');
      
      if (config.enableDebug) {
        console.log('[GameController] Session ID:', sessionID);
        console.log('[GameController] RGS URL:', rgsUrl || 'mock');
        console.log('[GameController] RGS Mode:', config.rgsMode);
      }
      
      // Authenticate with RGS (mock or real)
      const response = await rgsClient.authenticate({ sessionID });
      
      // Update state
      this.stateManager.setSessionID(response.sessionID);
      this.stateManager.setConfig(response.config);
      this.stateManager.setBalance(response.balance);
      
      // Set initial bet to first bet level
      if (response.config.betLevels.length > 0) {
        this.stateManager.setCurrentBet(response.config.betLevels[0]);
      }
      
      console.log('[GameController] Authenticated successfully');
      console.log('[GameController] Balance:', response.balance);
      console.log('[GameController] Bet levels:', response.config.betLevels);
      
      // Ready to play
      this.stateManager.setState('IDLE');
      
    } catch (error) {
      console.error('[GameController] Initialization failed:', error);
      this.stateManager.setState('ERROR');
      
      // Handle specific errors
      if (error instanceof StakeEngineError) {
        this.showError(error.message);
      } else {
        this.showError('Failed to initialize game');
      }
      
      throw error;
    }
  }
  
  /**
   * Start a new round
   */
  async play(): Promise<void> {
    if (!this.stateManager.canPlay()) {
      console.warn('[GameController] Cannot play in current state');
      return;
    }
    
    console.log('[GameController] Starting round...');
    this.stateManager.setState('SPINNING');
    this.stateManager.resetBoard();
    this.stateManager.setLastWin(0);
    
    try {
      const sessionID = this.stateManager.getSessionID();
      const betAmount = this.stateManager.getCurrentBet();
      
      if (!sessionID) {
        throw new Error('No session ID');
      }
      
      // Call RGS play (mock or real)
      const response: PlayResponse = await rgsClient.play({
        sessionID,
        amount: betAmount,
        mode: 'BASE',
      });
      
      if (config.enableDebug) {
        console.log('[GameController] Response:', response);
        console.log('[GameController] Events:', response.round?.events);
      }
      
      // Update balance (after bet deducted)
      this.stateManager.setBalance(response.balance);
      
      // Store events
      this.stateManager.setCurrentEvents(response.round.events);
      
      // Process events into animation actions
      const actions = this.eventProcessor.processEvents(response.round.events);
      this.animationQueue = actions;
      
      console.log('[GameController] Round started, processing', actions.length, 'actions');
      
      // Execute animation queue
      await this.executeAnimationQueue();
      
    } catch (error) {
      console.error('[GameController] Play failed:', error);
      this.stateManager.setState('ERROR');
      
      // Handle specific Stake Engine errors
      if (error instanceof StakeEngineError) {
        this.showError(error.message);
        
        // Special handling for balance errors
        if (error.code === ERROR_CODES.ERR_IPB) {
          // Insufficient balance - return to idle
          this.stateManager.setState('IDLE');
        }
      } else {
        this.showError('Failed to play round');
      }
      
      throw error;
    }
  }
  
  /**
   * Execute animation queue sequentially
   */
  private async executeAnimationQueue(): Promise<void> {
    for (const action of this.animationQueue) {
      console.log('[GameController] Executing action:', action.type);
      
      // Update state based on action
      if (action.type === 'JOKER_TRANSFORM') {
        this.stateManager.setState('JOKER_TRANSFORM');
      } else if (action.type === 'SHOW_WIN') {
        this.stateManager.setState('DISPLAYING_WIN');
      }
      
      // Execute animation
      if (this.onAnimationAction) {
        await this.onAnimationAction(action);
      }
      
      // Handle win
      if (action.type === 'SHOW_WIN') {
        const winAmount = Math.round(
          this.stateManager.getCurrentBet() * action.payload.payoutMultiplier
        );
        
        if (winAmount > 0) {
          console.log('[GameController] Win amount:', winAmount);
          this.stateManager.setLastWin(winAmount);
        } else {
          console.log('[GameController] No win');
        }
        
        // Call end-round (acknowledges round completion)
        try {
          const sessionID = this.stateManager.getSessionID();
          if (sessionID) {
            const endResponse = await rgsClient.endRound({ sessionID });
            // Update balance if returned (some RGS may credit win here)
            if (endResponse.balance > 0) {
              this.stateManager.setBalance(endResponse.balance);
            }
          }
        } catch (error) {
          // endRound is not critical, just log error
          console.error('[GameController] endRound failed:', error);
        }
      }
    }
    
    // Clear queue
    this.animationQueue = [];
    
    // Return to idle after delay
    await this.delay(2000);
    this.stateManager.setState('IDLE');
  }
  
  /**
   * Utility delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Show error message to user
   */
  private showError(message: string): void {
    console.error('[GameController] Error:', message);
    
    // Show error in UI if GameApp reference is available
    if (this.gameApp && typeof this.gameApp.showError === 'function') {
      this.gameApp.showError(message);
    } else if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      // Fallback to alert (temporary)
      window.alert(message);
    }
  }
  
  /**
   * Get state manager (for UI access)
   */
  getStateManager(): GameStateManager {
    return this.stateManager;
  }
}
