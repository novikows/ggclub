<script lang="ts">
  import { audioManager } from '$lib/game/audioManager.svelte';
  import type { Symbol } from '$lib/types';

  let { 
    symbol = $bindable(null as Symbol | null), 
    highlighted = false,
    position = 0,
    initialFaceUp = false
  } = $props();
  
  let visible = $state(true);
  let faceUp = $state(false);
  let transforming = $state(false);
  let hasAnimated = $state(false);
  
  $effect(() => {
    if (!hasAnimated) {
      faceUp = initialFaceUp;
    }
  });
  let scale = $state(1);
  let rotateY = $state(0);
  let translateX = $state(0);
  let translateY = $state(0);
  let zIndex = $state(0);
  let noTransition = $state(false);
  
  $effect(() => {
    zIndex = position;
  });

  async function show() {
    visible = true;
    faceUp = false;
    rotateY = 0;
  }

  function hide() {
    visible = false;
  }

  function showAtPosition() {
    visible = true;
    translateX = 0;
    translateY = 0;
    zIndex = position;
  }

  async function moveToStack(stackPosition: number) {
    // Определяем размеры в зависимости от ширины экрана
    const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
    let cardWidth = 180;
    let gap = 20;
    
    if (width <= 400) {
      cardWidth = 65;
      gap = 4;
    } else if (width <= 480) {
      cardWidth = 75;
      gap = 5;
    } else if (width <= 768) {
      cardWidth = 120;
      gap = 10;
    } else if (width <= 1200) {
      cardWidth = 150;
      gap = 15;
    }
    
    const pos = position; // Захватываем текущее значение
    // Все карты съезжаются к позиции 0 (первая карта слева)
    const targetX = -(pos * (cardWidth + gap));
    // Z-index: первые карты сверху, терн и ривер снизу (так они будут под флопом)
    zIndex = 10 - pos;
    // Очень маленький сдвиг по Y для эффекта стопки
    await animate({ translateX: targetX, translateY: pos * 1 }, 400);
  }

  async function moveToPosition(targetPosition: number) {
    zIndex = targetPosition;
    await animate({ translateX: 0, translateY: 0 }, 500);
  }

  async function slideFromCard(fromPosition: number, toPosition: number) {
    // Определяем размеры в зависимости от ширины экрана
    const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
    let cardWidth = 180;
    let gap = 20;
    
    if (width <= 400) {
      cardWidth = 65;
      gap = 4;
    } else if (width <= 480) {
      cardWidth = 75;
      gap = 5;
    } else if (width <= 768) {
      cardWidth = 120;
      gap = 10;
    } else if (width <= 1200) {
      cardWidth = 150;
      gap = 15;
    }
    
    // Вычисляем начальную позицию - точно под картой fromPosition
    const startOffset = (fromPosition - toPosition) * (cardWidth + gap);
    
    // Отключаем transition
    noTransition = true;
    
    // Мгновенно перемещаем карту под нужную карту и делаем видимой
    translateX = startOffset;
    translateY = 0;
    zIndex = fromPosition + 0.5; // Чуть выше той карты, из которой выезжаем
    visible = true; // Показываем карту только сейчас
    
    // Ждем применения стилей и включаем transition обратно
    await new Promise(resolve => requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    }));
    
    noTransition = false;
    
    // Плавно выезжаем на свою позицию
    zIndex = toPosition;
    await animate({ translateX: 0 }, 500);
  }

  async function flipToFaceUp() {
    hasAnimated = true;
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
    visible = true; // Все карты видимы после reset
    faceUp = false;
    highlighted = false;
    transforming = false;
    hasAnimated = false;
    scale = 1;
    rotateY = 0;
    translateX = 0;
    translateY = 0;
    zIndex = position;
    noTransition = false;
  }

  function animate(props: Record<string, number>, duration: number): Promise<void> {
    return new Promise(resolve => {
      if (props.scale !== undefined) scale = props.scale;
      if (props.rotateY !== undefined) rotateY = props.rotateY;
      if (props.translateX !== undefined) translateX = props.translateX;
      if (props.translateY !== undefined) translateY = props.translateY;
      setTimeout(resolve, duration);
    });
  }

  export { show, hide, showAtPosition, moveToStack, moveToPosition, slideFromCard, flipToFaceUp, transform, highlight, reset };

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
</script>

{#if visible}
  <div 
    class="card-container"
    class:no-transition={noTransition}
    style="
      transform: scale({scale}) translate({translateX}px, {translateY}px); 
      opacity: {visible ? 1 : 0};
      z-index: {zIndex};
    "
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
    transition: transform 0.5s ease-in-out, opacity 0.3s, z-index 0s;
    position: relative;
  }

  .card-container.no-transition {
    transition: none !important;
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
    overflow: hidden;
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
      width: 75px;
      height: 110px;
      border-radius: 8px;
    }
  }

  @media (max-width: 400px) {
    .card {
      width: 65px;
      height: 95px;
      border-radius: 7px;
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
    border-radius: 16px;
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
      border-radius: 14px;
    }
    .rank-center {
      font-size: 64px;
    }
  }

  @media (max-width: 768px) {
    .card-face {
      padding: 10px;
      font-size: 18px;
      border-radius: 12px;
    }
    .rank-center {
      font-size: 48px;
    }
  }

  @media (max-width: 480px) {
    .card-face {
      padding: 6px;
      font-size: 11px;
      border-radius: 8px;
    }
    .rank-center {
      font-size: 26px;
    }
  }

  @media (max-width: 400px) {
    .card-face {
      padding: 5px;
      font-size: 10px;
      border-radius: 7px;
    }
    .rank-center {
      font-size: 22px;
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
    border-radius: 8px;
  }

  @media (max-width: 1200px) {
    .card-back {
      border-radius: 14px;
    }
  }

  @media (max-width: 768px) {
    .card-back {
      border-radius: 12px;
    }
  }

  @media (max-width: 480px) {
    .card-back {
      border-radius: 8px;
    }
  }

  @media (max-width: 400px) {
    .card-back {
      border-radius: 7px;
    }
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
    border-radius: 16px;
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
    .joker-face {
      border-radius: 14px;
    }
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
    .joker-face {
      border-radius: 12px;
    }
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
    .joker-face {
      border-radius: 8px;
    }
    .joker-icon {
      font-size: 32px;
    }
    .joker-text {
      font-size: 8px;
      letter-spacing: 0.5px;
    }
    .joker-stars {
      font-size: 10px;
    }
  }

  @media (max-width: 400px) {
    .joker-face {
      border-radius: 7px;
    }
    .joker-icon {
      font-size: 28px;
    }
    .joker-text {
      font-size: 7px;
      letter-spacing: 0.5px;
    }
    .joker-stars {
      font-size: 9px;
    }
  }

  @keyframes sparkle {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.2); }
  }
</style>
