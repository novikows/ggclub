import type { BookEvent, BookEventOfType } from './typesBookEvent';
import { eventEmitter } from './eventEmitter';

type BookEventHandler<T extends BookEvent['type']> = (
  bookEvent: BookEventOfType<T>
) => Promise<void>;

type BookEventHandlerMap = {
  [K in BookEvent['type']]: BookEventHandler<K>;
};

export const bookEventHandlerMap: BookEventHandlerMap = {
  reveal_initial_board: async (bookEvent) => {
    const symbols = bookEvent.board.map((card) => card.symbol);
    eventEmitter.broadcast({ type: 'boardReveal', symbols });
  },

  joker_transform: async (bookEvent) => {
    eventEmitter.broadcast({
      type: 'boardTransformJokers',
      transforms: bookEvent.jokerTransforms,
    });
  },

  hand_result: async (bookEvent) => {
    eventEmitter.broadcast({
      type: 'boardHighlight',
      positions: bookEvent.winningPositions,
    });

    if (bookEvent.payoutMultiplier > 0) {
      eventEmitter.broadcast({
        type: 'winModalShow',
        handCategory: bookEvent.handCategory,
        winAmount: bookEvent.payoutMultiplier * 1_000_000,
        multiplier: bookEvent.payoutMultiplier,
      });
    }
  },

  round_summary: async () => {
    eventEmitter.broadcast({ type: 'roundEnd' });
  },
};
