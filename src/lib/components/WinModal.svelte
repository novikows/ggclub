<script lang="ts">
  import type { HandCategory } from '$lib/types';

  let { 
    visible = false,
    handCategory = 'HIGH_CARD' as HandCategory,
    winAmount = 0,
    multiplier = 0,
    onClose
  }: {
    visible: boolean;
    handCategory: HandCategory;
    winAmount: number;
    multiplier: number;
    onClose: () => void;
  } = $props();

  const formatMoney = (amount: number): string => {
    return `$${(amount / 1_000_000).toFixed(2)}`;
  };

  const handNames: Record<HandCategory, string> = {
    'HIGH_CARD': 'High Card',
    'PAIR': 'Pair',
    'TWO_PAIR': 'Two Pair',
    'THREE_OF_A_KIND': 'Three of a Kind',
    'STRAIGHT': 'Straight',
    'FLUSH': 'Flush',
    'FULL_HOUSE': 'Full House',
    'FOUR_OF_A_KIND': 'Four of a Kind',
    'STRAIGHT_FLUSH': 'Straight Flush',
    'ROYAL_FLUSH': 'Royal Flush'
  };

  const getTier = (mult: number): string => {
    if (mult >= 10) return 'JACKPOT';
    if (mult >= 5) return 'BEST';
    if (mult >= 3) return 'HIGH';
    if (mult >= 1.5) return 'MEDIUM';
    return 'NORMAL';
  };

  $effect(() => {
    if (visible && winAmount > 0) {
      setTimeout(() => {
        onClose();
      }, 3000);
    }
  });
</script>

{#if visible && winAmount > 0}
  <div class="modal-overlay" onclick={onClose} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && onClose()}>
    <div class="modal" class:jackpot={getTier(multiplier) === 'JACKPOT'}>
      <h2 class="hand-name">{handNames[handCategory]}</h2>
      <div class="win-amount">{formatMoney(winAmount)}</div>
      <div class="multiplier">×{multiplier.toFixed(2)}</div>
      <div class="tier-badge tier-{getTier(multiplier).toLowerCase()}">
        {getTier(multiplier)}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s;
  }

  .modal {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 24px;
    padding: 48px;
    text-align: center;
    min-width: 400px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  }

  .modal.jackpot {
    background: linear-gradient(135deg, #ffd700 0%, #ff6b6b 100%);
    animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55), jackpotPulse 1s infinite;
  }

  .hand-name {
    font-size: 32px;
    font-weight: bold;
    color: white;
    margin-bottom: 24px;
    text-transform: uppercase;
  }

  .win-amount {
    font-size: 64px;
    font-weight: bold;
    color: #ffd700;
    margin-bottom: 16px;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  }

  .multiplier {
    font-size: 24px;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 24px;
  }

  .tier-badge {
    display: inline-block;
    padding: 8px 24px;
    border-radius: 999px;
    font-weight: bold;
    font-size: 16px;
    text-transform: uppercase;
  }

  .tier-normal {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }

  .tier-medium {
    background: #4fc3f7;
    color: white;
  }

  .tier-high {
    background: #ff9800;
    color: white;
  }

  .tier-best {
    background: #9c27b0;
    color: white;
  }

  .tier-jackpot {
    background: #ffd700;
    color: #1a1a2e;
    animation: jackpotBadge 0.6s infinite;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes scaleIn {
    from { transform: scale(0.5); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  @keyframes jackpotPulse {
    0%, 100% { box-shadow: 0 20px 60px rgba(255, 215, 0, 0.5); }
    50% { box-shadow: 0 20px 80px rgba(255, 215, 0, 0.8); }
  }

  @keyframes jackpotBadge {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }

  @media (max-width: 768px) {
    .modal {
      padding: 32px;
      min-width: 320px;
      border-radius: 20px;
    }

    .hand-name {
      font-size: 24px;
      margin-bottom: 20px;
    }

    .win-amount {
      font-size: 48px;
      margin-bottom: 12px;
    }

    .multiplier {
      font-size: 20px;
      margin-bottom: 20px;
    }

    .tier-badge {
      padding: 6px 20px;
      font-size: 14px;
    }
  }

  @media (max-width: 480px) {
    .modal {
      padding: 24px;
      min-width: 280px;
      border-radius: 16px;
    }

    .hand-name {
      font-size: 20px;
      margin-bottom: 16px;
    }

    .win-amount {
      font-size: 36px;
      margin-bottom: 10px;
    }

    .multiplier {
      font-size: 16px;
      margin-bottom: 16px;
    }

    .tier-badge {
      padding: 4px 16px;
      font-size: 12px;
    }
  }
</style>
