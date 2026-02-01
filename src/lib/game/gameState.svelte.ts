import type { GameState, Symbol, GameEvent, AuthenticateResponse } from '$lib/types';

class GameStateStore {
  state = $state<GameState>('INIT');
  balance = $state<number>(0);
  currentBet = $state<number>(0);
  lastWin = $state<number>(0);
  sessionID = $state<string | null>(null);
  config = $state<AuthenticateResponse['config'] | null>(null);
  board = $state<(Symbol | null)[]>([null, null, null, null, null]);
  revealed = $state<boolean[]>([false, false, false, false, false]);
  currentEvents = $state<GameEvent[]>([]);
  selectedMode = $state<string>('base');
  isJokerModeEnabled = $state<boolean>(false);

  setState(newState: GameState) {
    this.state = newState;
  }

  setBalance(amount: number) {
    this.balance = amount;
  }

  setCurrentBet(amount: number) {
    this.currentBet = amount;
  }

  setLastWin(amount: number) {
    this.lastWin = amount;
  }

  setSessionID(id: string) {
    this.sessionID = id;
  }

  setConfig(cfg: AuthenticateResponse['config']) {
    this.config = cfg;
  }

  setBoard(cards: (Symbol | null)[]) {
    this.board = cards;
  }

  setRevealed(revealed: boolean[]) {
    this.revealed = revealed;
  }

  setCurrentEvents(events: GameEvent[]) {
    this.currentEvents = events;
  }

  setSelectedMode(mode: string) {
    this.selectedMode = mode;
  }

  setJokerModeEnabled(enabled: boolean) {
    this.isJokerModeEnabled = enabled;
    this.selectedMode = enabled ? 'bonus_1joker' : 'base';
  }

  toggleJokerMode() {
    this.setJokerModeEnabled(!this.isJokerModeEnabled);
  }

  resetBoard() {
    this.board = [null, null, null, null, null];
    this.revealed = [false, false, false, false, false];
  }

  canPlay(): boolean {
    const effectiveBet = this.getEffectiveBet();
    return this.state === 'IDLE' && this.balance >= effectiveBet;
  }

  getState(): GameState {
    return this.state;
  }

  getSessionID(): string | null {
    return this.sessionID;
  }

  getCurrentBet(): number {
    return this.currentBet;
  }

  getSelectedMode(): string {
    return this.selectedMode;
  }

  getEffectiveBet(): number {
    if (this.isJokerModeEnabled) {
      return this.currentBet * 2.25;
    }
    const mode = this.config?.bonusModes?.find(m => m.id === this.selectedMode);
    const multiplier = mode?.cost || 1;
    return this.currentBet * multiplier;
  }
}

export const gameState = new GameStateStore();
