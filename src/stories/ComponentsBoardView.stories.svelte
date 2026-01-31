<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BoardView from '$lib/components/BoardView.svelte';
  import AnimationRevealDemo from './AnimationRevealDemo.svelte';
  import AnimationJokerDemo from './AnimationJokerDemo.svelte';
  import AnimationFullDemo from './AnimationFullDemo.svelte';
  import { ALL_SYMBOLS } from './data/helpers';

  const { Story } = defineMeta({
    title: 'Components/BoardView',
    component: BoardView,
    tags: ['autodocs'],
    argTypes: {
      cards: {
        control: 'object',
        description: 'Array of 5 card symbols (Symbol | null)',
      },
      winningPositions: {
        control: 'object',
        description: 'Array of winning card positions (0-4)',
      },
      initialFaceUp: {
        control: 'boolean',
        description: 'Show cards face up immediately (for static preview)',
      },
    },
  });
</script>

<Story name="Empty Board" args={{ cards: [null, null, null, null, null], winningPositions: [], initialFaceUp: false }}>
  {#snippet children(args)}
    <div style="padding: 20px; background: #16213e;">
      <BoardView {...args} />
    </div>
  {/snippet}
</Story>

<Story name="Royal Flush" args={{ cards: ['10H', 'JH', 'QH', 'KH', 'AH'], winningPositions: [0, 1, 2, 3, 4], initialFaceUp: true }}>
  {#snippet children(args)}
    <div style="padding: 20px; background: #16213e;">
      <BoardView {...args} />
    </div>
  {/snippet}
</Story>

<Story name="Straight Flush" args={{ cards: ['5D', '6D', '7D', '8D', '9D'], winningPositions: [0, 1, 2, 3, 4], initialFaceUp: true }}>
  {#snippet children(args)}
    <div style="padding: 20px; background: #16213e;">
      <BoardView {...args} />
    </div>
  {/snippet}
</Story>

<Story name="Four of a Kind" args={{ cards: ['AS', 'AC', 'AD', 'AH', 'KS'], winningPositions: [0, 1, 2, 3], initialFaceUp: true }}>
  {#snippet children(args)}
    <div style="padding: 20px; background: #16213e;">
      <BoardView {...args} />
    </div>
  {/snippet}
</Story>

<Story name="With Joker" args={{ cards: ['JOKER', 'KS', 'KD', '7H', '3S'], winningPositions: [], initialFaceUp: true }}>
  {#snippet children(args)}
    <div style="padding: 20px; background: #16213e;">
      <BoardView {...args} />
    </div>
  {/snippet}
</Story>

<Story name="Two Jokers" args={{ cards: ['JOKER', 'KS', 'JOKER', '7H', '3S'], winningPositions: [], initialFaceUp: true }}>
  {#snippet children(args)}
    <div style="padding: 20px; background: #16213e;">
      <BoardView {...args} />
    </div>
  {/snippet}
</Story>

<Story name="Pair (Highlighted)" args={{ cards: ['KS', 'KD', '7H', '5C', '3S'], winningPositions: [0, 1], initialFaceUp: true }}>
  {#snippet children(args)}
    <div style="padding: 20px; background: #16213e;">
      <BoardView {...args} />
    </div>
  {/snippet}
</Story>

<Story name="Three of a Kind (Highlighted)" args={{ cards: ['JS', 'JD', 'JH', '5C', '7H'], winningPositions: [0, 1, 2], initialFaceUp: true }}>
  {#snippet children(args)}
    <div style="padding: 20px; background: #16213e;">
      <BoardView {...args} />
    </div>
  {/snippet}
</Story>

<Story name="Animation - Reveal Cards">
  {#snippet children()}
    <AnimationRevealDemo />
  {/snippet}
</Story>

<Story name="Animation - Joker Transform">
  {#snippet children()}
    <AnimationJokerDemo />
  {/snippet}
</Story>

<Story name="Full Game Animation">
  {#snippet children()}
    <AnimationFullDemo />
  {/snippet}
</Story>
