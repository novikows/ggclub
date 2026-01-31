<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import CardSprite from '$lib/components/CardSprite.svelte';
  import CardFlipDemo from './CardFlipDemo.svelte';
  import CardTransformDemo from './CardTransformDemo.svelte';
  import { ALL_SYMBOLS, ALL_RANKS, ALL_SUITS } from './data/helpers';

  const { Story } = defineMeta({
    title: 'Components/CardSprite',
    component: CardSprite,
    tags: ['autodocs'],
    argTypes: {
      symbol: {
        control: 'select',
        options: [null, ...ALL_SYMBOLS],
        description: 'Card symbol (null for face down)',
      },
      highlighted: {
        control: 'boolean',
        description: 'Highlight card as winning',
      },
      initialFaceUp: {
        control: 'boolean',
        description: 'Show card face up immediately',
      },
      position: {
        control: { type: 'number', min: 0, max: 4 },
        description: 'Card position (0-4)',
      },
    },
    args: {
      symbol: 'AS',
      highlighted: false,
      initialFaceUp: true,
      position: 0,
    },
  });
</script>

<Story name="Interactive" />

<Story name="Face Down" args={{ symbol: null, initialFaceUp: false }} />

<Story name="Joker" args={{ symbol: 'JOKER' }} />

<Story name="Highlighted (Winning)" args={{ symbol: 'AS', highlighted: true }} />

<Story name="All Spades">
  <div style="display: flex; gap: 10px; flex-wrap: wrap; padding: 20px;">
    {#each ALL_RANKS as rank}
      <CardSprite symbol={`${rank}S`} position={0} initialFaceUp={true} />
    {/each}
  </div>
</Story>

<Story name="All Hearts">
  <div style="display: flex; gap: 10px; flex-wrap: wrap; padding: 20px;">
    {#each ALL_RANKS as rank}
      <CardSprite symbol={`${rank}H`} position={0} initialFaceUp={true} />
    {/each}
  </div>
</Story>

<Story name="All Diamonds">
  <div style="display: flex; gap: 10px; flex-wrap: wrap; padding: 20px;">
    {#each ALL_RANKS as rank}
      <CardSprite symbol={`${rank}D`} position={0} initialFaceUp={true} />
    {/each}
  </div>
</Story>

<Story name="All Clubs">
  <div style="display: flex; gap: 10px; flex-wrap: wrap; padding: 20px;">
    {#each ALL_RANKS as rank}
      <CardSprite symbol={`${rank}C`} position={0} initialFaceUp={true} />
    {/each}
  </div>
</Story>

<Story name="All Aces">
  <div style="display: flex; gap: 20px; padding: 20px;">
    <CardSprite symbol="AS" position={0} initialFaceUp={true} />
    <CardSprite symbol="AH" position={1} initialFaceUp={true} />
    <CardSprite symbol="AD" position={2} initialFaceUp={true} />
    <CardSprite symbol="AC" position={3} initialFaceUp={true} />
  </div>
</Story>

<Story name="Animation - Flip">
  <CardFlipDemo symbol="AS" />
</Story>

<Story name="Animation - Transform">
  <CardTransformDemo initialSymbol="JOKER" targetSymbol="AS" />
</Story>

<Story name="Full Deck Grid">
  <div style="display: grid; grid-template-columns: repeat(13, 1fr); gap: 5px; padding: 20px; max-width: 1400px;">
    {#each ALL_SUITS as suit}
      {#each ALL_RANKS as rank}
        <div style="transform: scale(0.5); transform-origin: top left;">
          <CardSprite symbol={`${rank}${suit}`} position={0} initialFaceUp={true} />
        </div>
      {/each}
    {/each}
    <div style="transform: scale(0.5); transform-origin: top left;">
      <CardSprite symbol="JOKER" position={0} initialFaceUp={true} />
    </div>
  </div>
</Story>
