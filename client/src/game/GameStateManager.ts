import {
  GameState,
  BoardState,
  GameEvent,
  GameStateManager as IGameStateManager,
  AuthenticateResponse,
} from '../types';

/**
 * Game State Manager - manages game state machine and data
 */
export class GameStateManager {
  private state: GameState = 'INIT';
  private balance: number = 0;
  private currentBet: number = 1000000; // Default $1.00
  private lastWin: number = 0;
  private board: BoardState = {
    cards: [null, null, null, null, null],
    revealed: [false, false, false, false, false],
  };
  private currentEvents: GameEvent[] = [];
  private sessionID: string | null = null;
  private config: AuthenticateResponse['config'] | null = null;
  
  // Listeners
  private stateChangeListeners: Array<(state: GameState) => void> = [];
  private balanceChangeListeners: Array<(balance: number) => void> = [];
  private betChangeListeners: Array<(bet: number) => void> = [];
  private winChangeListeners: Array<(win: number) => void> = [];
  
  constructor() {
    console.log('[GameState] Initialized');
  }
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  getState(): GameState {
    return this.state;
  }
  
  setState(newState: GameState): void {
    const oldState = this.state;
    this.state = newState;
    console.log(`[GameState] ${oldState} → ${newState}`);
    this.notifyStateChange(newState);
  }
  
  canPlay(): boolean {
    return this.state === 'IDLE' && this.balance >= this.currentBet;
  }
  
  // ============================================================================
  // BALANCE MANAGEMENT
  // ============================================================================
  
  getBalance(): number {
    return this.balance;
  }
  
  setBalance(balance: number): void {
    this.balance = balance;
    this.notifyBalanceChange(balance);
  }
  
  // ============================================================================
  // BET MANAGEMENT
  // ============================================================================
  
  getCurrentBet(): number {
    return this.currentBet;
  }
  
  setCurrentBet(bet: number): void {
    if (this.state !== 'IDLE') {
      console.warn('[GameState] Cannot change bet while not in IDLE state');
      return;
    }
    
    if (this.config && !this.config.betLevels.includes(bet)) {
      console.warn('[GameState] Invalid bet level:', bet);
      return;
    }
    
    this.currentBet = bet;
    this.notifyBetChange(bet);
  }
  
  increaseBet(): void {
    if (!this.config) return;
    
    const currentIndex = this.config.betLevels.indexOf(this.currentBet);
    if (currentIndex < this.config.betLevels.length - 1) {
      this.setCurrentBet(this.config.betLevels[currentIndex + 1]);
    }
  }
  
  decreaseBet(): void {
    if (!this.config) return;
    
    const currentIndex = this.config.betLevels.indexOf(this.currentBet);
    if (currentIndex > 0) {
      this.setCurrentBet(this.config.betLevels[currentIndex - 1]);
    }
  }
  
  // ============================================================================
  // WIN MANAGEMENT
  // ============================================================================
  
  getLastWin(): number {
    return this.lastWin;
  }
  
  setLastWin(win: number): void {
    this.lastWin = win;
    this.notifyWinChange(win);
  }
  
  // ============================================================================
  // BOARD MANAGEMENT
  // ============================================================================
  
  getBoard(): BoardState {
    return this.board;
  }
  
  resetBoard(): void {
    this.board = {
      cards: [null, null, null, null, null],
      revealed: [false, false, false, false, false],
    };
  }
  
  setCard(position: number, symbol: string): void {
    this.board.cards[position] = symbol as any;
  }
  
  revealCard(position: number): void {
    this.board.revealed[position] = true;
  }
  
  // ============================================================================
  // EVENT MANAGEMENT
  // ============================================================================
  
  getCurrentEvents(): GameEvent[] {
    return this.currentEvents;
  }
  
  setCurrentEvents(events: GameEvent[]): void {
    this.currentEvents = events;
  }
  
  clearEvents(): void {
    this.currentEvents = [];
  }
  
  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================
  
  getSessionID(): string | null {
    return this.sessionID;
  }
  
  setSessionID(sessionID: string): void {
    this.sessionID = sessionID;
  }
  
  getConfig(): AuthenticateResponse['config'] | null {
    return this.config;
  }
  
  setConfig(config: AuthenticateResponse['config']): void {
    this.config = config;
    
    // Set initial bet to first bet level if current bet not in levels
    if (config.betLevels.length > 0 && !config.betLevels.includes(this.currentBet)) {
      this.currentBet = config.betLevels[0];
    }
  }
  
  // ============================================================================
  // LISTENERS
  // ============================================================================
  
  onStateChange(listener: (state: GameState) => void): () => void {
    this.stateChangeListeners.push(listener);
    return () => {
      const index = this.stateChangeListeners.indexOf(listener);
      if (index > -1) {
        this.stateChangeListeners.splice(index, 1);
      }
    };
  }
  
  onBalanceChange(listener: (balance: number) => void): () => void {
    this.balanceChangeListeners.push(listener);
    return () => {
      const index = this.balanceChangeListeners.indexOf(listener);
      if (index > -1) {
        this.balanceChangeListeners.splice(index, 1);
      }
    };
  }
  
  onBetChange(listener: (bet: number) => void): () => void {
    this.betChangeListeners.push(listener);
    return () => {
      const index = this.betChangeListeners.indexOf(listener);
      if (index > -1) {
        this.betChangeListeners.splice(index, 1);
      }
    };
  }
  
  onWinChange(listener: (win: number) => void): () => void {
    this.winChangeListeners.push(listener);
    return () => {
      const index = this.winChangeListeners.indexOf(listener);
      if (index > -1) {
        this.winChangeListeners.splice(index, 1);
      }
    };
  }
  
  private notifyStateChange(state: GameState): void {
    this.stateChangeListeners.forEach(listener => listener(state));
  }
  
  private notifyBalanceChange(balance: number): void {
    this.balanceChangeListeners.forEach(listener => listener(balance));
  }
  
  private notifyBetChange(bet: number): void {
    this.betChangeListeners.forEach(listener => listener(bet));
  }
  
  private notifyWinChange(win: number): void {
    this.winChangeListeners.forEach(listener => listener(win));
  }
  
  // ============================================================================
  // SERIALIZATION (for reconnection)
  // ============================================================================
  
  serialize(): IGameStateManager {
    return {
      state: this.state,
      balance: this.balance,
      currentBet: this.currentBet,
      lastWin: this.lastWin,
      board: this.board,
      currentEvents: this.currentEvents,
      sessionID: this.sessionID,
      config: this.config,
    };
  }
  
  deserialize(data: IGameStateManager): void {
    this.state = data.state;
    this.balance = data.balance;
    this.currentBet = data.currentBet;
    this.lastWin = data.lastWin;
    this.board = data.board;
    this.currentEvents = data.currentEvents;
    this.sessionID = data.sessionID;
    this.config = data.config;
  }
}
