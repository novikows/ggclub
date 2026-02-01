<script lang="ts">
  import CardSprite from './CardSprite.svelte';
  import type { Symbol } from '$lib/types';

  let { 
    cards = $bindable([null, null, null, null, null] as (Symbol | null)[]),
    winningPositions = [],
    initialFaceUp = false
  }: {
    cards?: (Symbol | null)[];
    winningPositions?: number[];
    initialFaceUp?: boolean;
  } = $props();
  
  let card0: CardSprite | undefined = $state();
  let card1: CardSprite | undefined = $state();
  let card2: CardSprite | undefined = $state();
  let card3: CardSprite | undefined = $state();
  let card4: CardSprite | undefined = $state();
  
  const cardComponents = $derived([card0, card1, card2, card3, card4]);
  
  async function revealCards(symbols: Symbol[]) {
    if (symbols.length !== 5) {
      console.error('[BoardView] Expected 5 symbols, got', symbols.length);
      return;
    }

    cards = symbols;

    console.log('[BoardView] Collapsing to 3 cards'); 
    await delay(300);
    
    console.log('[BoardView] Moving flop cards to stack');
    await Promise.all([
      cardComponents[0]?.moveToStack(0),
      cardComponents[1]?.moveToStack(1),
      cardComponents[2]?.moveToStack(2),
      cardComponents[3]?.moveToStack(3),
      cardComponents[4]?.moveToStack(4)
    ]);
    await delay(100);
    await cardComponents[3]?.hide();
    await cardComponents[4]?.hide();
    await delay(300);

    console.log('[BoardView] Moving flop to positions');
    await Promise.all([
      cardComponents[0]?.moveToPosition(0),
      cardComponents[1]?.moveToPosition(1),
      cardComponents[2]?.moveToPosition(2)
    ]);
    await delay(300);

    console.log('[BoardView] Flipping flop');
    await Promise.all([
      cardComponents[0]?.flipToFaceUp(),
      cardComponents[1]?.flipToFaceUp(),
      cardComponents[2]?.flipToFaceUp()
    ]);
    await delay(400);

    console.log('[BoardView] Showing turn');
    cardComponents[3]?.showAtPosition();
    await delay(200);
    await cardComponents[3]?.flipToFaceUp();
    await delay(400);

    console.log('[BoardView] Showing river');
    cardComponents[4]?.showAtPosition();
    await delay(200);
    await cardComponents[4]?.flipToFaceUp();
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
  <CardSprite bind:this={card0} symbol={cards[0]} highlighted={winningPositions.includes(0)} position={0} {initialFaceUp} />
  <CardSprite bind:this={card1} symbol={cards[1]} highlighted={winningPositions.includes(1)} position={1} {initialFaceUp} />
  <CardSprite bind:this={card2} symbol={cards[2]} highlighted={winningPositions.includes(2)} position={2} {initialFaceUp} />
  <CardSprite bind:this={card3} symbol={cards[3]} highlighted={winningPositions.includes(3)} position={3} {initialFaceUp} />
  <CardSprite bind:this={card4} symbol={cards[4]} highlighted={winningPositions.includes(4)} position={4} {initialFaceUp} />
</div>

<style>
  .board {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 20px;
    padding: 20px;
    flex-wrap: nowrap;
    width: 1200px;
    position: relative;
    /* 5 карт * 180px + 4 gaps * 20px = 980px
       Чтобы они были по центру: (1200 - 980) / 2 = 110px */
    padding-left: 110px;
  }

  @media (max-width: 1200px) {
    .board {
      gap: 15px;
      padding: 15px;
      width: 1000px;
      /* 5 карт * 150px + 4 gaps * 15px = 810px
         (1000 - 810) / 2 = 95px */
      padding-left: 95px;
    }
  }

  @media (max-width: 768px) {
    .board {
      gap: 10px;
      padding: 10px;
      width: 750px;
      /* 5 карт * 120px + 4 gaps * 10px = 640px
         (750 - 640) / 2 = 55px */
      padding-left: 55px;
    }
  }

  @media (max-width: 480px) {
    .board {
      gap: 5px;
      padding: 5px;
      width: 100%;
      /* 5 карт * 75px + 4 gaps * 5px = 395px
         Для iPhone XR (414px) отступ: (414 - 395) / 2 = 9.5px */
      padding-left: 10px;
    }
  }

  @media (max-width: 400px) {
    .board {
      gap: 4px;
      padding: 5px;
      width: 100%;
      /* 5 карт * 65px + 4 gaps * 4px = 341px
         Для iPhone SE (375px) отступ: (375 - 341) / 2 = 17px */
      padding-left: 17px;
    }
  }
</style>
