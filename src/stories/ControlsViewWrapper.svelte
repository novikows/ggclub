<script lang="ts">
  import ControlsView from '$lib/components/ControlsView.svelte';
  import { gameState } from '$lib/game/gameState.svelte';
  import type { GameState } from '$lib/types';

  let { 
    state = 'IDLE' as GameState,
    balance = 100_000_000,
    bet = 1_000_000,
    lastWin = 0,
    jokerMode = false,
    soundEnabled = true,
    onPlay = () => {},
    onBetIncrease = () => {},
    onBetDecrease = () => {},
    onToggleSound = () => {}
  } = $props();

  $effect(() => {
    gameState.setState(state);
  });

  $effect(() => {
    gameState.setBalance(balance);
  });

  $effect(() => {
    gameState.setCurrentBet(bet);
  });

  $effect(() => {
    gameState.setLastWin(lastWin);
  });

  $effect(() => {
    gameState.setJokerModeEnabled(jokerMode);
  });

  function handlePlay() {
    onPlay();
  }

  function handleBetIncrease() {
    gameState.setCurrentBet(gameState.currentBet * 2);
    onBetIncrease();
  }

  function handleBetDecrease() {
    gameState.setCurrentBet(Math.max(gameState.currentBet / 2, 100_000));
    onBetDecrease();
  }

  function handleToggleSound() {
    onToggleSound();
  }
</script>

<div style="padding: 120px 20px 20px; background: #16213e; min-height: 300px;">
  <ControlsView 
    onPlay={handlePlay}
    onBetIncrease={handleBetIncrease}
    onBetDecrease={handleBetDecrease}
    onToggleSound={handleToggleSound}
    {soundEnabled}
  />
</div>
