<script lang="ts">
  import BoardView from '$lib/components/BoardView.svelte';
  import type { Symbol } from '$lib/types';
  
  let { cards = [null, null, null, null, null] as (Symbol | null)[], winningPositions = [] as number[], initialFaceUp = false } = $props();
  
  let boardRef: any = $state();
</script>

<div style="padding: 20px; background: #16213e;">
  <BoardView bind:this={boardRef} {cards} {winningPositions} {initialFaceUp} />
  <div style="margin-top: 20px; display: flex; gap: 10px;">
    <button 
      onclick={() => boardRef?.revealCards(['AS', 'KD', '7C', 'JOKER', '9H'])}
      style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      Reveal Cards (with Joker)
    </button>
    <button 
      onclick={() => boardRef?.revealCards(['10H', 'JH', 'QH', 'KH', 'AH'])}
      style="padding: 10px 20px; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      Reveal Royal Flush
    </button>
    <button 
      onclick={() => boardRef?.reset()}
      style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      Reset
    </button>
  </div>
</div>
