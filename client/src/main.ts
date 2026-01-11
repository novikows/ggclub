import { GameApp } from './GameApp';

/**
 * Main entry point
 */

console.log('='.repeat(80));
console.log('🎰 JOKER POKER BOARD - MVP');
console.log('='.repeat(80));
console.log('Version: 1.0.0');
console.log('Stack: PixiJS + TypeScript + Stake Engine (Mock)');
console.log('='.repeat(80));

// Create and start game
const game = new GameApp();
game.start().catch(error => {
  console.error('Failed to start game:', error);
  alert('Failed to start game. Please check console for details.');
});
