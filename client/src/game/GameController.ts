import { GameStateManager } from './GameStateManager';
import { EventProcessor, AnimationAction } from './EventProcessor';
import { mockRgsClient } from '../api/mockRgsClient';
import { PlayResponse } from '../types';

/**
 * Game Controller - orchestrates game flow and RGS communication
 */
export class GameController {
  private stateManager: GameStateManager;
  private eventProcessor: EventProcessor;
  private animationQueue: AnimationAction[] = [];
  private onAnimationAction?: (action: AnimationAction) => Promise<void>;
  
  constructor(stateManager: GameStateManager) {
    this.stateManager = stateManager;
    this.eventProcessor = new EventProcessor();
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
      
      console.log('[GameController] Session ID:', sessionID);
      console.log('[GameController] RGS URL:', rgsUrl || 'mock');
      
      // Authenticate
      const response = await mockRgsClient.authenticate({ sessionID });
      
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
      
      // Call RGS play
      const response: PlayResponse = await mockRgsClient.play({
        sessionID,
        amount: betAmount,
        mode: 'BASE',
      });
      
      console.log('[GameController] Response:', response);
      console.log('[GameController] Events:', response.round?.events);
      
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
          
          // Credit win
          mockRgsClient.creditWin(winAmount);
          
          // Call end-round
          const sessionID = this.stateManager.getSessionID();
          if (sessionID) {
            const endResponse = await mockRgsClient.endRound({ sessionID });
            this.stateManager.setBalance(endResponse.balance);
          }
        } else {
          console.log('[GameController] No win');
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
   * Get state manager (for UI access)
   */
  getStateManager(): GameStateManager {
    return this.stateManager;
  }
}
