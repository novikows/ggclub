<script lang="ts">
  import { gameState } from '$lib/game/gameState.svelte';
  import { audioManager } from '$lib/game/audioManager.svelte';
  import type { BonusMode } from '$lib/types';

  let { 
    visible = false,
    onClose,
    onSelectMode
  }: {
    visible?: boolean;
    onClose: () => void;
    onSelectMode: (modeId: string) => void;
  } = $props();

  const bonusModes = $derived(gameState.config?.bonusModes || []);
  const currentBet = $derived(gameState.currentBet);

  const formatMoney = (amount: number): string => {
    return `$${(amount / 1_000_000).toFixed(2)}`;
  };

  function handleSelectMode(modeId: string) {
    audioManager.playEffect('button-click');
    onSelectMode(modeId);
    onClose();
  }

  function handleClose() {
    audioManager.playEffect('button-click');
    onClose();
  }

  function handleBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  }

  function canAffordMode(mode: BonusMode): boolean {
    return gameState.balance >= currentBet * mode.cost;
  }
</script>

{#if visible}
  <div class="modal-backdrop" onclick={handleBackdropClick} role="presentation">
    <div class="modal-content">
      <h2 class="modal-title">🃏 Bonus Rounds</h2>
      <p class="modal-subtitle">Guaranteed Jokers in Your Deal</p>
      
      <div class="cards-container">
        {#each bonusModes as mode}
          {@const totalCost = currentBet * mode.cost}
          {@const canAfford = canAffordMode(mode)}
          
          <div class="bonus-card" class:disabled={!canAfford}>
            <div class="card-icon">{mode.icon}</div>
            
            <h3 class="card-title">{mode.name}</h3>
            
            <div class="card-cost">
              <span class="cost-multiplier">BET × {mode.cost}</span>
              <span class="cost-total">{formatMoney(totalCost)}</span>
            </div>
            
            <p class="card-description">{mode.description}</p>
            
            {#if !canAfford}
              <div class="insufficient-notice">Insufficient Balance</div>
            {/if}
            
            <button 
              class="buy-button" 
              class:disabled={!canAfford}
              onclick={() => handleSelectMode(mode.id)}
              disabled={!canAfford}
            >
              {#if canAfford}
                <span class="button-icon">🎰</span>
                <span>BUY NOW</span>
              {:else}
                <span>NOT ENOUGH</span>
              {/if}
            </button>
          </div>
        {/each}
      </div>
      
      <button class="cancel-button" onclick={handleClose}>
        CANCEL
      </button>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(8px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal-content {
    background: linear-gradient(135deg, rgba(20, 20, 40, 0.98), rgba(40, 20, 60, 0.98));
    border: 2px solid rgba(255, 215, 0, 0.3);
    border-radius: 24px;
    padding: 40px;
    max-width: 800px;
    width: 90vw;
    box-shadow: 
      0 0 60px rgba(255, 215, 0, 0.2),
      0 20px 60px rgba(0, 0, 0, 0.5);
    animation: slideUp 0.4s ease;
  }

  @keyframes slideUp {
    from {
      transform: translateY(50px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-title {
    font-size: 36px;
    font-weight: bold;
    color: #ffd700;
    text-align: center;
    margin: 0 0 8px 0;
    text-shadow: 
      0 0 10px rgba(255, 215, 0, 0.5),
      0 2px 4px rgba(0, 0, 0, 0.5);
  }

  .modal-subtitle {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.7);
    text-align: center;
    margin: 0 0 32px 0;
  }

  .cards-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
  }

  .bonus-card {
    background: linear-gradient(135deg, rgba(30, 30, 60, 0.8), rgba(50, 30, 80, 0.8));
    border: 2px solid rgba(255, 215, 0, 0.4);
    border-radius: 16px;
    padding: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .bonus-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent, rgba(255, 215, 0, 0.1), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s;
  }

  .bonus-card:not(.disabled):hover {
    transform: translateY(-8px);
    border-color: #ffd700;
    box-shadow: 
      0 0 30px rgba(255, 215, 0, 0.3),
      0 10px 30px rgba(0, 0, 0, 0.4);
  }

  .bonus-card:not(.disabled):hover::before {
    transform: translateX(100%);
  }

  .bonus-card.disabled {
    opacity: 0.6;
    border-color: rgba(255, 255, 255, 0.2);
    background: linear-gradient(135deg, rgba(30, 30, 60, 0.5), rgba(50, 30, 80, 0.5));
  }

  .card-icon {
    font-size: 64px;
    margin: 8px 0;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  .card-title {
    font-size: 22px;
    font-weight: bold;
    color: white;
    margin: 0;
    text-align: center;
  }

  .card-cost {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px 24px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 12px;
    width: 100%;
  }

  .cost-multiplier {
    font-size: 14px;
    color: rgba(255, 215, 0, 0.9);
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .cost-total {
    font-size: 28px;
    font-weight: bold;
    color: #ffd700;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }

  .card-description {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
    margin: 0;
    line-height: 1.5;
    min-height: 42px;
  }

  .insufficient-notice {
    font-size: 12px;
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.2);
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid rgba(255, 107, 107, 0.4);
    font-weight: bold;
    text-transform: uppercase;
  }

  .buy-button {
    width: 100%;
    padding: 16px 24px;
    background: linear-gradient(45deg, #ffd700, #ffed4e);
    color: #000;
    border: none;
    border-radius: 12px;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
  }

  .buy-button:not(.disabled):hover {
    transform: scale(1.05);
    box-shadow: 
      0 0 20px rgba(255, 215, 0, 0.6),
      0 6px 16px rgba(255, 215, 0, 0.4);
  }

  .buy-button:not(.disabled):active {
    transform: scale(0.98);
  }

  .buy-button.disabled {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.5);
    cursor: not-allowed;
    box-shadow: none;
  }

  .button-icon {
    font-size: 20px;
  }

  .cancel-button {
    width: 100%;
    padding: 14px 24px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .cancel-button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .cancel-button:active {
    transform: scale(0.98);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .modal-content {
      padding: 32px 24px;
      width: 95vw;
    }

    .modal-title {
      font-size: 28px;
    }

    .modal-subtitle {
      font-size: 14px;
      margin-bottom: 24px;
    }

    .cards-container {
      gap: 16px;
      margin-bottom: 24px;
    }

    .bonus-card {
      padding: 20px;
    }

    .card-icon {
      font-size: 48px;
    }

    .card-title {
      font-size: 18px;
    }

    .cost-total {
      font-size: 24px;
    }

    .buy-button {
      padding: 14px 20px;
      font-size: 16px;
    }
  }

  @media (max-width: 480px) {
    .modal-content {
      padding: 24px 16px;
      border-radius: 16px;
    }

    .modal-title {
      font-size: 24px;
    }

    .cards-container {
      grid-template-columns: 1fr;
    }

    .bonus-card {
      padding: 16px;
    }

    .card-icon {
      font-size: 40px;
    }

    .card-title {
      font-size: 16px;
    }

    .cost-multiplier {
      font-size: 12px;
    }

    .cost-total {
      font-size: 20px;
    }

    .card-description {
      font-size: 12px;
    }
  }
</style>
