import type {
  GameEvent,
  RevealInitialBoardEvent,
  JokerTransformEvent,
  HandResultEvent,
  Symbol,
} from '../types';

/**
 * Event Processor - processes RGS events and converts to animation actions
 */

export interface AnimationAction {
  type: 'REVEAL_CARDS' | 'JOKER_TRANSFORM' | 'SHOW_WIN';
  payload: any;
}

/**
 * Rank values for card comparison
 */
const RANK_VALUES: Record<string, number> = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14,
};

export class EventProcessor {
  private finalBoard: Symbol[] = [];
  
  /**
   * Process events array and convert to animation actions
   */
  processEvents(events: GameEvent[]): AnimationAction[] {
    const actions: AnimationAction[] = [];
    
    for (const event of events) {
      switch (event.type) {
        case 'reveal_initial_board':
          actions.push(this.processRevealBoard(event as RevealInitialBoardEvent));
          break;
          
        case 'joker_transform':
          actions.push(this.processJokerTransform(event as JokerTransformEvent));
          break;
          
        case 'hand_result':
          actions.push(this.processHandResult(event as HandResultEvent));
          break;
          
        default:
          console.warn('[EventProcessor] Unknown event type:', event.type);
      }
    }
    
    return actions;
  }
  
  /**
   * Process reveal_initial_board event
   */
  private processRevealBoard(event: RevealInitialBoardEvent): AnimationAction {
    // Store the initial board
    this.finalBoard = event.board.map(s => s.symbol);
    
    return {
      type: 'REVEAL_CARDS',
      payload: {
        cards: event.board.map(s => s.symbol),
      },
    };
  }
  
  /**
   * Process joker_transform event
   */
  private processJokerTransform(event: JokerTransformEvent): AnimationAction {
    // Update the final board with joker transforms
    for (const transform of event.jokerTransforms) {
      this.finalBoard[transform.position] = transform.targetSymbol;
    }
    
    return {
      type: 'JOKER_TRANSFORM',
      payload: {
        transforms: event.jokerTransforms,
      },
    };
  }
  
  /**
   * Process hand_result event
   */
  private processHandResult(event: HandResultEvent): AnimationAction {
    let winningPositions = event.winningPositions;
    
    // For HIGH_CARD hands, always recalculate the highest card position
    // because the backend might not send the correct positions
    if (event.handCategory === 'HIGH_CARD') {
      const highestPosition = this.findHighestCardPosition(this.finalBoard);
      winningPositions = [highestPosition];
      console.log('[EventProcessor] HIGH_CARD detected, recalculated winning position:', highestPosition, 'card:', this.finalBoard[highestPosition]);
    }
    
    return {
      type: 'SHOW_WIN',
      payload: {
        handCategory: event.handCategory,
        payoutMultiplier: event.payoutMultiplier,
        winningPositions,
        jackpot: event.jackpot,
      },
    };
  }
  
  /**
   * Find the position of the highest card on the board
   */
  private findHighestCardPosition(board: Symbol[]): number {
    let highestValue = 0;
    let highestPosition = 0;
    
    for (let i = 0; i < board.length; i++) {
      const symbol = board[i];
      if (symbol === 'JOKER') continue; // Skip jokers (shouldn't happen after transforms)
      
      // Extract rank from card symbol (e.g., "AS" -> "A", "10H" -> "10")
      const rank = symbol.slice(0, -1); // Remove last character (suit)
      const value = RANK_VALUES[rank] || 0;
      
      if (value > highestValue) {
        highestValue = value;
        highestPosition = i;
      }
    }
    
    return highestPosition;
  }
}
