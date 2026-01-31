type EmitterEventHandler<T> = (event: T) => void | Promise<void>;
type EventHandlerMap<T> = Partial<Record<string, EmitterEventHandler<any>[]>>;

export function createEventEmitter<T extends { type: string }>() {
  const handlers: EventHandlerMap<T> = {};

  function subscribe<K extends T['type']>(
    type: K,
    handler: EmitterEventHandler<Extract<T, { type: K }>>
  ): () => void {
    if (!handlers[type]) handlers[type] = [];
    handlers[type]!.push(handler as any);

    return () => {
      handlers[type] = handlers[type]!.filter((h) => h !== handler);
    };
  }

  function broadcast(event: T): void {
    const typeHandlers = handlers[event.type] || [];
    typeHandlers.forEach((handler) => handler(event));
  }

  async function broadcastAsync(event: T): Promise<void> {
    const typeHandlers = handlers[event.type] || [];
    for (const handler of typeHandlers) {
      await handler(event);
    }
  }

  function subscribeOnMount<M extends Partial<Record<T['type'], EmitterEventHandler<any>>>>(
    handlerMap: M
  ): () => void {
    const unsubscribers: Array<() => void> = [];

    Object.entries(handlerMap).forEach(([type, handler]) => {
      if (handler) {
        const unsub = subscribe(type as T['type'], handler);
        unsubscribers.push(unsub);
      }
    });

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }

  return {
    subscribe,
    broadcast,
    broadcastAsync,
    subscribeOnMount,
  };
}

export type EventEmitter<T extends { type: string }> = ReturnType<typeof createEventEmitter<T>>;
