<script lang="ts">
  import CardSprite from '$lib/components/CardSprite.svelte';
  import type { Symbol } from '$lib/types';

  interface Props {
    symbol?: Symbol;
  }

  let { symbol = 'AS' }: Props = $props();

  let cardRef: ReturnType<typeof CardSprite> | undefined = $state();
  let isFaceUp = $state(false);

  function handleFlip() {
    if (isFaceUp) {
      cardRef?.reset();
      isFaceUp = false;
    } else {
      cardRef?.flipToFaceUp();
      isFaceUp = true;
    }
  }

  function handleReset() {
    cardRef?.reset();
    isFaceUp = false;
  }
</script>

<div style="padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 20px;">
  <CardSprite bind:this={cardRef} {symbol} position={0} initialFaceUp={false} />
  <div style="display: flex; gap: 10px;">
    <button 
      onclick={handleFlip}
      style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      {isFaceUp ? 'Flip to Face Down' : 'Flip to Face Up'}
    </button>
    <button 
      onclick={handleReset}
      style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      Reset
    </button>
  </div>
  <p style="color: #aaa; font-size: 14px;">
    Card is currently: <strong style="color: white;">{isFaceUp ? 'Face Up' : 'Face Down'}</strong>
  </p>
</div>
