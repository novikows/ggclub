import { getContext as getSvelteContext, setContext as setSvelteContext } from 'svelte';
import { eventEmitter } from './eventEmitter';
import type { EventEmitter } from './createEventEmitter';
import type { EmitterEvent } from './typesEmitterEvent';

type GameContext = {
  eventEmitter: EventEmitter<EmitterEvent>;
};

const CONTEXT_KEY = 'game-context';

export function setContext(): void {
  setSvelteContext<GameContext>(CONTEXT_KEY, {
    eventEmitter,
  });
}

export function getContext(): GameContext {
  return getSvelteContext<GameContext>(CONTEXT_KEY);
}
