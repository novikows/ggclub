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
 * Get hand tier color - dark theme: gold, dark red, white only
 */
export function getHandTierColor(tier: HandTier): number {
  switch (tier) {
    case 'JACKPOT': return 0xFFD700; // Golden yellow
    case 'BEST': return 0xCC0000;    // Dark red
    case 'HIGH': return 0x8B0000;    // Darker red
    case 'MEDIUM': return 0xFFFFFF;  // White
    case 'NORMAL': return 0xFFFFFF;  // White
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
