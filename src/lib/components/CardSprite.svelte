<script lang="ts">
  import { onMount } from 'svelte';
  import { audioManager } from '$lib/game/audioManager.svelte';
  import type { Symbol } from '$lib/types';

  let { symbol = $bindable(null as Symbol | null), highlighted = false } = $props();
  
  let visible = $state(false);
  let faceUp = $state(false);
  let transforming = $state(false);
  let scale = $state(0.5);
  let rotateY = $state(0);

  async function reveal() {
    visible = true;
    await animate({ scale: 1 }, 300);
    await flipToFaceUp();
  }

  async function flipToFaceUp() {
    audioManager.playEffect('card-flip');
    await animate({ rotateY: 90 }, 200);
    faceUp = true;
    await animate({ rotateY: 0 }, 200);
  }

  async function transform(newSymbol: Symbol) {
    transforming = true;
    audioManager.playEffect('card-flip');
    await animate({ scale: 1.2 }, 200);
    await animate({ rotateY: 90 }, 150);
    symbol = newSymbol;
    await animate({ rotateY: 0 }, 150);
    await animate({ scale: 1 }, 200);
    transforming = false;
  }

  function highlight() {
    highlighted = true;
  }

  function reset() {
    visible = false;
    faceUp = false;
    highlighted = false;
    transforming = false;
    scale = 0.5;
    rotateY = 0;
  }

  function animate(props: Record<string, number>, duration: number): Promise<void> {
    return new Promise(resolve => {
      if (props.scale !== undefined) scale = props.scale;
      if (props.rotateY !== undefined) rotateY = props.rotateY;
      setTimeout(resolve, duration);
    });
  }

  const getRankAndSuit = (sym: Symbol | null): { rank: string, suit: string, isJoker: boolean } => {
    if (!sym || sym === 'JOKER') {
      return { rank: sym === 'JOKER' ? '🃏' : '?', suit: '', isJoker: sym === 'JOKER' };
    }
    const rank = sym.slice(0, -1);
    const suit = sym.slice(-1);
    return { rank, suit, isJoker: false };
  };

  const getSuitSymbol = (suit: string): string => {
    const suitMap: Record<string, string> = {
      'H': '♥',
      'D': '♦',
      'C': '♣',
      'S': '♠'
    };
    return suitMap[suit] || '';
  };

  const getSuitColor = (suit: string): string => {
    return (suit === 'H' || suit === 'D') ? '#ff0000' : '#000000';
  };

  export { reveal, transform, highlight, reset };
</script>

{#if visible}
  <div 
    class="card-container"
    style="transform: scale({scale}); opacity: {visible ? 1 : 0}"
  >
    <div 
      class="card" 
      class:highlighted 
      class:transforming
      class:joker={symbol === 'JOKER'}
      style="transform: rotateY({rotateY}deg)"
    >
    {#if faceUp && symbol}
      {@const { rank, suit, isJoker } = getRankAndSuit(symbol)}
      {#if isJoker}
        <div class="card-face joker-face">
          <div class="joker-content">
            <div class="joker-icon">{rank}</div>
            <div class="joker-text">JOKER</div>
            <div class="joker-stars">✨</div>
          </div>
        </div>
      {:else}
        <div class="card-face" style="color: {getSuitColor(suit)}">
          <div class="rank-top">{rank}{getSuitSymbol(suit)}</div>
          <div class="rank-center">{getSuitSymbol(suit)}</div>
          <div class="rank-bottom">{rank}{getSuitSymbol(suit)}</div>
        </div>
      {/if}
    {:else}
      <div class="card-back">
        <div class="card-pattern"></div>
      </div>
    {/if}
    </div>
  </div>
{/if}

<style>
  .card-container {
    perspective: 1000px;
    transition: transform 0.3s, opacity 0.3s;
  }

  .card {
    width: 180px;
    height: 260px;
    border-radius: 16px;
    background: white;
    box-shadow: 0 8px 16px rgba(0,0,0,0.3);
    transition: transform 0.3s, box-shadow 0.3s;
    position: relative;
    transform-style: preserve-3d;
    backface-visibility: hidden;
  }

  @media (max-width: 1200px) {
    .card {
      width: 150px;
      height: 220px;
      border-radius: 14px;
    }
  }

  @media (max-width: 768px) {
    .card {
      width: 120px;
      height: 180px;
      border-radius: 12px;
    }
  }

  @media (max-width: 480px) {
    .card {
      width: 90px;
      height: 130px;
      border-radius: 10px;
    }
  }

  .card.highlighted {
    box-shadow: 0 0 30px 8px gold, 0 8px 16px rgba(0,0,0,0.3);
    animation: pulse 0.6s ease-in-out infinite;
  }

  .card.transforming {
    animation: glow 0.6s ease-in-out;
  }

  .card-face {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 16px;
    height: 100%;
    font-size: 28px;
    font-weight: bold;
    backface-visibility: hidden;
  }

  .rank-top {
    text-align: left;
  }

  .rank-center {
    text-align: center;
    font-size: 80px;
  }

  @media (max-width: 1200px) {
    .card-face {
      padding: 14px;
      font-size: 24px;
    }
    .rank-center {
      font-size: 64px;
    }
  }

  @media (max-width: 768px) {
    .card-face {
      padding: 10px;
      font-size: 18px;
    }
    .rank-center {
      font-size: 48px;
    }
  }

  @media (max-width: 480px) {
    .card-face {
      padding: 8px;
      font-size: 14px;
    }
    .rank-center {
      font-size: 32px;
    }
  }

  .rank-bottom {
    text-align: right;
    transform: rotate(180deg);
  }

  .card-back {
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    backface-visibility: hidden;
  }

  .card-pattern {
    width: 80%;
    height: 80%;
    background: repeating-linear-gradient(
      45deg,
      rgba(255,255,255,0.1),
      rgba(255,255,255,0.1) 10px,
      transparent 10px,
      transparent 20px
    );
    border-radius: 12px;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }

  @keyframes glow {
    0%, 100% { filter: brightness(1); }
    50% { filter: brightness(1.5); }
  }

  .card.joker {
    animation: joker-pulse 2s ease-in-out infinite;
  }

  @keyframes joker-pulse {
    0%, 100% { 
      box-shadow: 0 0 20px rgba(139, 0, 255, 0.6),
                  0 0 40px rgba(255, 215, 0, 0.4);
    }
    50% { 
      box-shadow: 0 0 40px rgba(139, 0, 255, 0.8),
                  0 0 60px rgba(255, 215, 0, 0.6);
    }
  }

  .joker-face {
    background: linear-gradient(135deg, #8B00FF 0%, #4B0082 50%, #FFD700 100%);
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px;
    height: 100%;
  }

  .joker-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .joker-icon {
    font-size: 90px;
    animation: joker-spin 4s linear infinite;
  }

  @keyframes joker-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .joker-text {
    font-size: 22px;
    font-weight: bold;
    letter-spacing: 2px;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.8);
  }

  .joker-stars {
    font-size: 24px;
    animation: sparkle 1.5s ease-in-out infinite;
  }

  @media (max-width: 1200px) {
    .joker-icon {
      font-size: 72px;
    }
    .joker-text {
      font-size: 18px;
    }
    .joker-stars {
      font-size: 20px;
    }
  }

  @media (max-width: 768px) {
    .joker-icon {
      font-size: 56px;
    }
    .joker-text {
      font-size: 14px;
      letter-spacing: 1px;
    }
    .joker-stars {
      font-size: 16px;
    }
  }

  @media (max-width: 480px) {
    .joker-icon {
      font-size: 40px;
    }
    .joker-text {
      font-size: 10px;
      letter-spacing: 1px;
    }
    .joker-stars {
      font-size: 12px;
    }
  }

  @keyframes sparkle {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.2); }
  }
</style>
