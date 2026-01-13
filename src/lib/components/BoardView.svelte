<script lang="ts">
  import { onMount } from 'svelte';
  import CardSprite from './CardSprite.svelte';
  import type { Symbol } from '$lib/types';

  let { 
    cards = $bindable([null, null, null, null, null] as (Symbol | null)[]),
    winningPositions = []
  }: {
    cards?: (Symbol | null)[];
    winningPositions?: number[];
  } = $props();
  
  let cardComponents: CardSprite[] = [];
  
  async function revealCards(symbols: Symbol[]) {
    if (symbols.length !== 5) {
      console.error('[BoardView] Expected 5 symbols, got', symbols.length);
      return;
    }

    cards = symbols;

    console.log('[BoardView] Revealing flop (0, 1, 2)');
    await Promise.all([
      cardComponents[0]?.reveal(),
      cardComponents[1]?.reveal(),
      cardComponents[2]?.reveal()
    ]);
    await delay(300);

    console.log('[BoardView] Revealing turn (3)');
    await cardComponents[3]?.reveal();
    await delay(300);

    console.log('[BoardView] Revealing river (4)');
    await cardComponents[4]?.reveal();
  }

  async function transformJokers(transforms: Array<{ position: number; targetSymbol: Symbol }>) {
    console.log('[BoardView] Transforming', transforms.length, 'jokers');
    
    for (const transform of transforms) {
      const card = cardComponents[transform.position];
      if (card) {
        await card.transform(transform.targetSymbol);
        await delay(200);
      }
    }
  }

  function highlightWinningCards(positions: number[]) {
    positions.forEach(pos => {
      if (pos >= 0 && pos < 5) {
        cardComponents[pos]?.highlight();
      }
    });
  }

  function reset() {
    cards = [null, null, null, null, null];
    cardComponents.forEach(card => card?.reset());
  }

  function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  export { revealCards, transformJokers, highlightWinningCards, reset };
</script>

<div class="board">
  {#each cards as card, i}
    <CardSprite bind:this={cardComponents[i]} symbol={card} highlighted={winningPositions.includes(i)} />
  {/each}
</div>

<style>
  .board {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    padding: 20px;
    flex-wrap: wrap;
    max-width: 100%;
  }

  @media (max-width: 1200px) {
    .board {
      gap: 15px;
      padding: 15px;
    }
  }

  @media (max-width: 768px) {
    .board {
      gap: 10px;
      padding: 10px;
    }
  }

  @media (max-width: 480px) {
    .board {
      gap: 8px;
      padding: 8px;
    }
  }
</style>
