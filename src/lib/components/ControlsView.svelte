<script lang="ts">
  import { gameState } from '$lib/game/gameState.svelte';
  import { audioManager } from '$lib/game/audioManager.svelte';

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

  const formatMoney = (amount: number): string => {
    return `$${(amount / 1_000_000).toFixed(2)}`;
  };

  const canPlay = $derived(gameState.state === 'IDLE' && gameState.balance >= gameState.currentBet);
  const canChangeBet = $derived(gameState.state === 'IDLE');

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
</script>

<div class="controls">
  <div class="info-row">
    <div class="info-item">
      <span class="label">Balance:</span>
      <span class="value">{formatMoney(displayBalance || gameState.balance)}</span>
    </div>
    <div class="info-item">
      <span class="label">Bet:</span>
      <span class="value">{formatMoney(gameState.currentBet)}</span>
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
  }

  @media (max-width: 480px) {
    .controls {
      bottom: 10px;
      padding: 12px 16px;
      min-width: 280px;
      border-radius: 12px;
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

    .sound-toggle {
      top: -50px;
      width: 40px;
      height: 40px;
      font-size: 20px;
    }
  }
</style>
