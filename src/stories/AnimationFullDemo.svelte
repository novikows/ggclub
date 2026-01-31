<script lang="ts">
  import BoardView from '$lib/components/BoardView.svelte';
  import type { Symbol } from '$lib/types';
  
  let { cards = [null, null, null, null, null] as (Symbol | null)[], winningPositions = [] as number[], initialFaceUp = false } = $props();
  
  let boardRef: any = $state();
  
  async function playThreeOfAKind() {
    await boardRef?.revealCards(['JOKER', 'KS', 'KD', '7H', '3S']);
    await new Promise(r => setTimeout(r, 500));
    await boardRef?.transformJokers([{ position: 0, targetSymbol: 'KC' }]);
    await new Promise(r => setTimeout(r, 300));
    boardRef?.highlightWinningCards([0, 1, 2]);
  }
  
  async function playRoyalFlush() {
    await boardRef?.revealCards(['10H', 'JH', 'QH', 'JOKER', 'AH']);
    await new Promise(r => setTimeout(r, 500));
    await boardRef?.transformJokers([{ position: 3, targetSymbol: 'KH' }]);
    await new Promise(r => setTimeout(r, 300));
    boardRef?.highlightWinningCards([0, 1, 2, 3, 4]);
  }
</script>

<div style="padding: 20px; background: #16213e;">
  <BoardView bind:this={boardRef} {cards} {winningPositions} {initialFaceUp} />
  <div style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
    <button 
      onclick={playThreeOfAKind}
      style="padding: 10px 20px; background: #E91E63; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      Play Full Sequence (Three of a Kind)
    </button>
    <button 
      onclick={playRoyalFlush}
      style="padding: 10px 20px; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      Play Full Sequence (Royal Flush)
    </button>
    <button 
      onclick={() => boardRef?.reset()}
      style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      Reset
    </button>
  </div>
</div>
