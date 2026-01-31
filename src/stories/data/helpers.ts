import type { Symbol } from '$lib/types';

export const ALL_RANKS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'] as const;
export const ALL_SUITS = ['S', 'H', 'D', 'C'] as const;

export const ALL_SYMBOLS: Symbol[] = [
  ...ALL_RANKS.flatMap((rank) => ALL_SUITS.map((suit) => `${rank}${suit}` as Symbol)),
  'JOKER',
];

export const CARD_SYMBOLS_BY_SUIT: Record<string, Symbol[]> = {
  S: ALL_RANKS.map((rank) => `${rank}S` as Symbol),
  H: ALL_RANKS.map((rank) => `${rank}H` as Symbol),
  D: ALL_RANKS.map((rank) => `${rank}D` as Symbol),
  C: ALL_RANKS.map((rank) => `${rank}C` as Symbol),
};

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function formatMoney(amount: number): string {
  return `$${(amount / 1_000_000).toFixed(2)}`;
}
