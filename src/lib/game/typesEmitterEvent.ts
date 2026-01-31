import type { Symbol, HandCategory } from '$lib/types';

export type EmitterEventCardSprite =
  | { type: 'cardShow'; position: number }
  | { type: 'cardHide'; position: number }
  | { type: 'cardFlip'; position: number }
  | { type: 'cardTransform'; position: number; targetSymbol: Symbol }
  | { type: 'cardHighlight'; position: number }
  | { type: 'cardReset'; position: number };

export type EmitterEventBoardView =
  | { type: 'boardReveal'; symbols: Symbol[] }
  | { type: 'boardTransformJokers'; transforms: Array<{ position: number; targetSymbol: Symbol }> }
  | { type: 'boardHighlight'; positions: number[] }
  | { type: 'boardReset' };

export type EmitterEventWinModal =
  | { type: 'winModalShow'; handCategory: HandCategory; winAmount: number; multiplier: number }
  | { type: 'winModalHide' };

export type EmitterEventGame =
  | { type: 'gameStart' }
  | { type: 'gameEnd' }
  | { type: 'roundStart' }
  | { type: 'roundEnd' };

export type EmitterEvent =
  | EmitterEventCardSprite
  | EmitterEventBoardView
  | EmitterEventWinModal
  | EmitterEventGame;
