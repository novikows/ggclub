import { createEventEmitter } from './createEventEmitter';
import type { EmitterEvent } from './typesEmitterEvent';

export const eventEmitter = createEventEmitter<EmitterEvent>();
