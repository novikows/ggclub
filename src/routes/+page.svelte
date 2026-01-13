<script lang="ts">
  import { onMount } from 'svelte';
  import { gameState } from '$lib/game/gameState.svelte';
  import { GameController } from '$lib/game/GameController.svelte';
  import { audioManager } from '$lib/game/audioManager.svelte';
  import type { AnimationAction } from '$lib/types';
  import BoardView from '$lib/components/BoardView.svelte';
  import ControlsView from '$lib/components/ControlsView.svelte';
  import WinModal from '$lib/components/WinModal.svelte';

  let boardViewRef: BoardView | undefined = $state();
  let controller: GameController;
  let showWinModal = $state(false);
  let winData = $state({ handCategory: 'HIGH_CARD' as any, winAmount: 0, multiplier: 0 });
  let initialized = $state(false);
  let error = $state<string | null>(null);
  let videoError = $state(false);
  let audioInitialized = $state(false);
  let displayBalance = $state(0);
  let targetBalance = $state(0);

  onMount(async () => {
    try {
      controller = new GameController();
      controller.setAnimationHandler(handleAnimation);
      await controller.initialize();
      displayBalance = gameState.balance;
      targetBalance = gameState.balance;
      initialized = true;
    } catch (err) {
      console.error('[Game] Initialization failed:', err);
      error = err instanceof Error ? err.message : 'Failed to initialize game';
    }
  });

  $effect(() => {
    if (!showWinModal && gameState.balance !== displayBalance) {
      targetBalance = gameState.balance;
    }
  });

  async function handleAnimation(action: AnimationAction): Promise<void> {
    console.log('[Game] Handling animation:', action.type);

    switch (action.type) {
      case 'REVEAL_CARDS':
        await boardViewRef?.revealCards(action.payload.cards);
        break;

      case 'JOKER_TRANSFORM':
        await boardViewRef?.transformJokers(action.payload.transforms);
        break;

      case 'SHOW_WIN':
        if (action.payload.winningPositions) {
          boardViewRef?.highlightWinningCards(action.payload.winningPositions);
        }
        if (action.payload.payoutMultiplier > 0) {
          const winAmount = Math.round(gameState.currentBet * action.payload.payoutMultiplier);
          winData = {
            handCategory: action.payload.handCategory,
            winAmount: winAmount,
            multiplier: action.payload.payoutMultiplier
          };
          showWinModal = true;
        }
        break;
    }
  }

  async function handlePlay() {
    if (!controller) return;
    
    if (!audioInitialized) {
      audioManager.play();
      audioInitialized = true;
    }
    
    showWinModal = false;
    boardViewRef?.reset();
    await controller.play();
  }

  function handleVideoError() {
    videoError = true;
    console.log('[Game] Video background failed to load, using gradient fallback');
  }

  function toggleSound() {
    audioManager.toggleSound();
  }

  function handleBetIncrease() {
    const config = gameState.config;
    if (!config) return;

    const currentIndex = config.betLevels.indexOf(gameState.currentBet);
    if (currentIndex < config.betLevels.length - 1) {
      gameState.setCurrentBet(config.betLevels[currentIndex + 1]);
    }
  }

  function handleBetDecrease() {
    const config = gameState.config;
    if (!config) return;

    const currentIndex = config.betLevels.indexOf(gameState.currentBet);
    if (currentIndex > 0) {
      gameState.setCurrentBet(config.betLevels[currentIndex - 1]);
    }
  }

  function closeWinModal() {
    showWinModal = false;
    animateBalanceToTarget();
  }

  function animateBalanceToTarget() {
    const startBalance = displayBalance;
    const endBalance = targetBalance;
    const difference = endBalance - startBalance;
    
    if (difference === 0) return;

    const duration = 1500;
    const steps = 50;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        displayBalance = endBalance;
        clearInterval(interval);
      } else {
        const progress = currentStep / steps;
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        displayBalance = Math.round(startBalance + difference * easeProgress);
      }
    }, stepDuration);
  }
</script>

<svelte:head>
  <title>Joker Poker Board</title>
</svelte:head>

<div class="game-container">
  {#if !videoError}
    <video 
      class="background-video" 
      autoplay 
      loop 
      muted 
      playsinline
      onerror={handleVideoError}
    >
      <source src="/assets/backgrounds/casino-bg.webm" type="video/webm" />
    </video>
  {/if}
  
  {#if error}
    <div class="error-screen">
      <h1>Error</h1>
      <p>{error}</p>
      <button onclick={() => window.location.reload()}>Reload</button>
    </div>
  {:else if !initialized}
    <div class="loading-screen">
      <div class="spinner"></div>
      <p>Loading...</p>
    </div>
  {:else}
    <div class="game-content">
      <BoardView bind:this={boardViewRef} />
      <ControlsView 
        onPlay={handlePlay}
        onBetIncrease={handleBetIncrease}
        onBetDecrease={handleBetDecrease}
        onToggleSound={toggleSound}
        soundEnabled={audioManager.isSoundEnabled()}
        displayBalance={displayBalance}
      />
      <WinModal 
        visible={showWinModal}
        handCategory={winData.handCategory}
        winAmount={winData.winAmount}
        multiplier={winData.multiplier}
        onClose={closeWinModal}
      />
    </div>
  {/if}
</div>

<style>
  .game-container {
    width: 100vw;
    height: 100vh;
    background: linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
  }

  .background-video {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    object-fit: cover;
    z-index: -1;
    opacity: 0.6;
    pointer-events: none;
  }

  .game-content {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
  }

  .loading-screen,
  .error-screen {
    text-align: center;
    color: white;
  }

  .spinner {
    width: 64px;
    height: 64px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 24px;
  }

  .error-screen h1 {
    font-size: 48px;
    margin-bottom: 24px;
  }

  .error-screen p {
    font-size: 18px;
    margin-bottom: 32px;
    opacity: 0.8;
  }

  .error-screen button {
    padding: 12px 32px;
    font-size: 16px;
    background: #ff6b6b;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .error-screen button:hover {
    transform: scale(1.05);
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
