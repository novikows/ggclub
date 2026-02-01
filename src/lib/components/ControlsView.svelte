<script lang="ts">
  import { gameState } from '$lib/game/gameState.svelte';
  import { audioManager } from '$lib/game/audioManager.svelte';
  import ConfirmModal from './ConfirmModal.svelte';
  import type { BonusMode } from '$lib/types';

  let { 
    onPlay, 
    onBetIncrease, 
    onBetDecrease,
    onToggleSound,
    soundEnabled = true,
    displayBalance = 0
  }: {
    onPlay: () => void;
    onBetIncrease: () => void;
    onBetDecrease: () => void;
    onToggleSound?: () => void;
    soundEnabled?: boolean;
    displayBalance?: number;
  } = $props();

  let showConfirmModal = $state(false);
  let pendingJokerState = $state(false);

  const formatMoney = (amount: number): string => {
    return `$${(amount / 1_000_000).toFixed(2)}`;
  };

  const canPlay = $derived(gameState.state === 'IDLE' && gameState.balance >= gameState.getEffectiveBet());
  const canChangeBet = $derived(gameState.state === 'IDLE');
  const effectiveBet = $derived(gameState.getEffectiveBet());
  const isJokerMode = $derived(gameState.isJokerModeEnabled);

  function handlePlayClick() {
    audioManager.playEffect('button-click');
    onPlay();
  }

  function handleBetIncrease() {
    audioManager.playEffect('button-click');
    onBetIncrease();
  }

  function handleBetDecrease() {
    audioManager.playEffect('button-click');
    onBetDecrease();
  }

  function handleJokerToggle() {
    if (!canChangeBet) return;
    audioManager.playEffect('button-click');
    
    if (!isJokerMode) {
      pendingJokerState = true;
      showConfirmModal = true;
    } else {
      gameState.toggleJokerMode();
    }
  }

  function confirmJokerMode() {
    showConfirmModal = false;
    gameState.setJokerModeEnabled(true);
    audioManager.playEffect('button-click');
  }

  function cancelJokerMode() {
    showConfirmModal = false;
    pendingJokerState = false;
  }
</script>

<div class="controls">
  <div class="info-row">
    <div class="info-item">
      <span class="label">Balance:</span>
      <span class="value">{formatMoney(displayBalance || gameState.balance)}</span>
    </div>
    <div class="info-item">
      <span class="label">Total Bet:</span>
      <span class="value">{formatMoney(effectiveBet)}</span>
    </div>
    <div class="info-item">
      <span class="label">Win:</span>
      <span class="value win">{formatMoney(gameState.lastWin)}</span>
    </div>
  </div>

  <div class="buttons-row">
    <button class="btn btn-secondary" onclick={handleBetDecrease} disabled={!canChangeBet}>
      -
    </button>
    
    <button 
      class="btn btn-joker" 
      class:active={isJokerMode}
      onclick={handleJokerToggle} 
      disabled={!canChangeBet}
      title="Toggle Joker Mode (Bet × 2.25)"
    >
      <div class="joker-card" class:spinning={isJokerMode}>
        🃏
      </div>
      <span class="joker-text">JOKER</span>
    </button>
    
    <button class="btn btn-primary btn-play" onclick={handlePlayClick} disabled={!canPlay}>
      {#if gameState.state === 'SPINNING'}
        SPINNING...
      {:else if gameState.state === 'DISPLAYING_WIN'}
        WIN!
      {:else}
        PLAY
      {/if}
    </button>
    <button class="btn btn-secondary" onclick={handleBetIncrease} disabled={!canChangeBet}>
      +
    </button>
  </div>

  {#if onToggleSound}
    <button class="sound-toggle" onclick={onToggleSound} title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}>
      {soundEnabled ? '🔊' : '🔇'}
    </button>
  {/if}
</div>

<ConfirmModal
  visible={showConfirmModal}
  title="Activate Joker Mode?"
  message="Joker Mode increases your bet by 2.25× but guarantees at least 1 Joker in every hand for better winning chances!"
  confirmText="Activate"
  cancelText="Cancel"
  onConfirm={confirmJokerMode}
  onCancel={cancelJokerMode}
/>

<style>
  .controls {
    position: fixed;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    border-radius: 16px;
    padding: 20px 40px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-width: 400px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    gap: 24px;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .label {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
  }

  .value {
    font-size: 20px;
    font-weight: bold;
    color: white;
    transition: all 0.3s ease;
  }

  @keyframes balanceIncrease {
    0%, 100% { 
      transform: scale(1);
      color: white;
    }
    50% { 
      transform: scale(1.2);
      color: #ffd700;
    }
  }

  .value.win {
    color: #ffd700;
  }

  .buttons-row {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background: linear-gradient(45deg, #ff6b6b, #ee5a6f);
    color: white;
  }

  .btn-primary:not(:disabled):hover {
    transform: scale(1.05);
    box-shadow: 0 0 20px rgba(255, 107, 107, 0.5);
  }

  .btn-play {
    min-width: 120px;
  }

  .btn-joker {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    min-width: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
  }

  .btn-joker.active {
    background: linear-gradient(45deg, #ffd700, #ffed4e);
    color: #000;
    border-color: #ffd700;
    animation: jokerGlow 2s ease-in-out infinite;
  }

  @keyframes jokerGlow {
    0%, 100% {
      box-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
    }
    50% {
      box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
    }
  }

  .btn-joker:not(:disabled):hover {
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.5);
  }

  .btn-joker.active:not(:disabled):hover {
    box-shadow: 0 0 35px rgba(255, 215, 0, 0.9);
  }

  .joker-card {
    font-size: 24px;
    transition: transform 0.3s ease;
  }

  .joker-card.spinning {
    animation: spinCard 2s linear infinite;
  }

  @keyframes spinCard {
    0% {
      transform: rotateY(0deg);
    }
    100% {
      transform: rotateY(360deg);
    }
  }

  .joker-text {
    font-weight: bold;
  }

  .btn-secondary {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    width: 48px;
    height: 48px;
    padding: 0;
    font-size: 24px;
  }

  .btn-secondary:not(:disabled):hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .sound-toggle {
    position: absolute;
    top: -60px;
    right: 0;
    width: 48px;
    height: 48px;
    background: rgba(0, 0, 0, 0.6);
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sound-toggle:hover {
    background: rgba(0, 0, 0, 0.8);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.1);
  }

  .sound-toggle:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    .controls {
      bottom: 20px;
      padding: 16px 24px;
      min-width: 320px;
    }

    .active-mode-badge {
      padding: 8px 12px;
      font-size: 12px;
    }

    .badge-icon {
      font-size: 16px;
    }

    .badge-cost {
      font-size: 10px;
    }

    .info-row {
      gap: 16px;
    }

    .label {
      font-size: 10px;
    }

    .value {
      font-size: 16px;
    }

    .btn {
      padding: 10px 20px;
      font-size: 14px;
    }

    .btn-secondary {
      width: 40px;
      height: 40px;
      font-size: 20px;
    }

    .btn-play {
      min-width: 100px;
    }

    .btn-bonus {
      min-width: 90px;
      font-size: 14px;
    }
  }

  @media (max-width: 480px) {
    .controls {
      bottom: 10px;
      padding: 12px 16px;
      min-width: 280px;
      border-radius: 12px;
    }

    .active-mode-badge {
      padding: 6px 10px;
      font-size: 11px;
    }

    .badge-icon {
      font-size: 14px;
    }

    .badge-text {
      font-size: 10px;
    }

    .badge-cost {
      font-size: 9px;
    }

    .info-row {
      gap: 12px;
    }

    .label {
      font-size: 9px;
    }

    .value {
      font-size: 14px;
    }

    .btn {
      padding: 8px 16px;
      font-size: 12px;
    }

    .btn-secondary {
      width: 36px;
      height: 36px;
      font-size: 18px;
    }

    .btn-play {
      min-width: 80px;
    }

    .btn-bonus {
      min-width: 80px;
      font-size: 12px;
      gap: 4px;
    }

    .bonus-icon {
      font-size: 16px;
    }

    .sound-toggle {
      top: -50px;
      width: 40px;
      height: 40px;
      font-size: 20px;
    }
  }
</style>
