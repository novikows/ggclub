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

  resetBoard() {
    this.board = [null, null, null, null, null];
    this.revealed = [false, false, false, false, false];
  }

  canPlay(): boolean {
    return this.state === 'IDLE' && this.balance >= this.currentBet;
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
}

export const gameState = new GameStateStore();
