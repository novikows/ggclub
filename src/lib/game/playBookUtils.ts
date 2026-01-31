import type { BookEvent } from './typesBookEvent';
import { bookEventHandlerMap } from './bookEventHandlerMap';

export async function playBookEvent(
  bookEvent: BookEvent,
  _context?: { bookEvents: BookEvent[] }
): Promise<void> {
  const handler = bookEventHandlerMap[bookEvent.type];
  if (handler) {
    await (handler as (event: BookEvent) => Promise<void>)(bookEvent);
  } else {
    console.warn(`No handler found for bookEvent type: ${bookEvent.type}`);
  }
}

export async function playBookEvents(bookEvents: BookEvent[]): Promise<void> {
  for (const bookEvent of bookEvents) {
    await playBookEvent(bookEvent, { bookEvents });
  }
}
