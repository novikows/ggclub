<script lang="ts">
  import BoardView from '$lib/components/BoardView.svelte';
  import type { Symbol } from '$lib/types';
  
  let { cards = ['JOKER', 'KS', 'KD', '7H', '3S'] as Symbol[], winningPositions = [] as number[], initialFaceUp = true } = $props();
  
  let boardRef: any = $state();
</script>

<div style="padding: 20px; background: #16213e;">
  <BoardView bind:this={boardRef} {cards} {winningPositions} {initialFaceUp} />
  <div style="margin-top: 20px; display: flex; gap: 10px;">
    <button 
      onclick={() => boardRef?.transformJokers([{ position: 0, targetSymbol: 'KC' }])}
      style="padding: 10px 20px; background: #FF9800; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      Transform Joker → King of Clubs
    </button>
    <button 
      onclick={() => boardRef?.highlightWinningCards([0, 1, 2])}
      style="padding: 10px 20px; background: #FFD700; color: black; border: none; border-radius: 4px; cursor: pointer;"
    >
      Highlight Winners
    </button>
    <button 
      onclick={() => boardRef?.reset()}
      style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      Reset
    </button>
  </div>
</div>
