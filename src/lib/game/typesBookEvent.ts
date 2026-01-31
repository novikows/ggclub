import type {
  RevealInitialBoardEvent,
  JokerTransformEvent,
  HandResultEvent,
  RoundSummaryEvent,
  GameEvent,
} from '$lib/types';

export type BookEvent = GameEvent;

export type BookEventOfType<T extends BookEvent['type']> = Extract<BookEvent, { type: T }>;

export type { RevealInitialBoardEvent, JokerTransformEvent, HandResultEvent, RoundSummaryEvent };
