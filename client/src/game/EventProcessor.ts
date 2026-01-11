import {
  GameEvent,
  RevealInitialBoardEvent,
  JokerTransformEvent,
  HandResultEvent,
} from '../types';

/**
 * Event Processor - processes RGS events and converts to animation actions
 */

export interface AnimationAction {
  type: 'REVEAL_CARDS' | 'JOKER_TRANSFORM' | 'SHOW_WIN';
  payload: any;
}

export class EventProcessor {
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
    return {
      type: 'SHOW_WIN',
      payload: {
        handCategory: event.handCategory,
        payoutMultiplier: event.payoutMultiplier,
        winningPositions: event.winningPositions,
        jackpot: event.jackpot,
      },
    };
  }
}
