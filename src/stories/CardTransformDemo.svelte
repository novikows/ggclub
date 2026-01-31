<script lang="ts">
  import CardSprite from '$lib/components/CardSprite.svelte';
  import type { Symbol } from '$lib/types';

  interface Props {
    initialSymbol?: Symbol;
    targetSymbol?: Symbol;
  }

  let { 
    initialSymbol = 'JOKER',
    targetSymbol = 'AS'
  }: Props = $props();

  let cardRef: ReturnType<typeof CardSprite> | undefined = $state();
  let displaySymbol = $state<Symbol>('JOKER');
  
  $effect(() => {
    displaySymbol = initialSymbol;
  });

  async function handleTransform(target: Symbol) {
    await cardRef?.transform(target);
    displaySymbol = target;
  }

  function handleReset() {
    cardRef?.reset();
    displaySymbol = initialSymbol;
  }

  const POPULAR_TARGETS: Symbol[] = ['AS', 'KH', 'QD', 'JC', 'AH', 'KC'];
</script>

<div style="padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 20px;">
  <CardSprite bind:this={cardRef} symbol={displaySymbol} position={0} initialFaceUp={true} />
  
  <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; max-width: 500px;">
    <button 
      onclick={() => handleTransform(targetSymbol)}
      style="padding: 10px 20px; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      Transform to {targetSymbol}
    </button>
    {#each POPULAR_TARGETS as target}
      <button 
        onclick={() => handleTransform(target)}
        style="padding: 8px 16px; background: #673AB7; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;"
      >
        {target}
      </button>
    {/each}
    <button 
      onclick={handleReset}
      style="padding: 10px 20px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;"
    >
      Reset
    </button>
  </div>
  
  <p style="color: #aaa; font-size: 14px;">
    Current card: <strong style="color: white;">{displaySymbol}</strong>
  </p>
</div>
