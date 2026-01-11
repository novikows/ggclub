import { HandTier } from '../types';

/**
 * Map payout multiplier to hand tier for visual display
 */
export function getHandTier(multiplier: number): HandTier {
  if (multiplier >= 40) return 'JACKPOT';
  if (multiplier > 10) return 'BEST';
  if (multiplier > 3) return 'HIGH';
  if (multiplier > 1.5) return 'MEDIUM';
  return 'NORMAL';
}

/**
 * Get hand tier color
 */
export function getHandTierColor(tier: HandTier): number {
  switch (tier) {
    case 'JACKPOT': return 0xFFD700; // Gold
    case 'BEST': return 0xFF1493;    // Deep Pink
    case 'HIGH': return 0xFF4500;    // Orange Red
    case 'MEDIUM': return 0x9370DB;  // Medium Purple
    case 'NORMAL': return 0x4169E1;  // Royal Blue
  }
}

/**
 * Get hand tier label
 */
export function getHandTierLabel(tier: HandTier): string {
  switch (tier) {
    case 'JACKPOT': return '🎰 JACKPOT 🎰';
    case 'BEST': return '⭐ AMAZING WIN ⭐';
    case 'HIGH': return '🔥 BIG WIN 🔥';
    case 'MEDIUM': return '✨ GOOD WIN ✨';
    case 'NORMAL': return '✓ WIN';
  }
}

/**
 * Format hand category for display
 */
export function formatHandCategory(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}
