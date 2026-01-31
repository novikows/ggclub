<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import WinModal from '$lib/components/WinModal.svelte';
  import { fn } from 'storybook/test';

  const { Story } = defineMeta({
    title: 'Components/WinModal',
    component: WinModal,
    tags: ['autodocs'],
    argTypes: {
      visible: { control: 'boolean', description: 'Show/hide the modal' },
      handCategory: {
        control: 'select',
        options: [
          'HIGH_CARD',
          'PAIR',
          'TWO_PAIR',
          'THREE_OF_A_KIND',
          'STRAIGHT',
          'FLUSH',
          'FULL_HOUSE',
          'FOUR_OF_A_KIND',
          'STRAIGHT_FLUSH',
          'ROYAL_FLUSH',
        ],
        description: 'Winning hand category',
      },
      winAmount: { control: 'number', description: 'Win amount in cents' },
      multiplier: { control: 'number', description: 'Bet multiplier' },
      onClose: { action: 'close' },
    },
    args: {
      onClose: fn(),
    },
  });
</script>

<script>
</script>

<Story name="High Card" args={{ visible: true, handCategory: 'HIGH_CARD', winAmount: 350000, multiplier: 0.35 }} />

<Story name="Pair" args={{ visible: true, handCategory: 'PAIR', winAmount: 900000, multiplier: 0.9 }} />

<Story name="Two Pair" args={{ visible: true, handCategory: 'TWO_PAIR', winAmount: 1500000, multiplier: 1.5 }} />

<Story name="Three of a Kind" args={{ visible: true, handCategory: 'THREE_OF_A_KIND', winAmount: 3000000, multiplier: 3 }} />

<Story name="Straight" args={{ visible: true, handCategory: 'STRAIGHT', winAmount: 5000000, multiplier: 5 }} />

<Story name="Flush (Jackpot)" args={{ visible: true, handCategory: 'FLUSH', winAmount: 10000000, multiplier: 10 }} />

<Story name="Full House (Jackpot)" args={{ visible: true, handCategory: 'FULL_HOUSE', winAmount: 20000000, multiplier: 20 }} />

<Story name="Four of a Kind (Jackpot)" args={{ visible: true, handCategory: 'FOUR_OF_A_KIND', winAmount: 40000000, multiplier: 40 }} />

<Story name="Straight Flush (Jackpot)" args={{ visible: true, handCategory: 'STRAIGHT_FLUSH', winAmount: 100000000, multiplier: 100 }} />

<Story name="Royal Flush (Jackpot)" args={{ visible: true, handCategory: 'ROYAL_FLUSH', winAmount: 1000000000, multiplier: 1000 }} />

<Story name="All Tiers Comparison">
  {#snippet children(args)}
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; padding: 20px;">
      <div style="position: relative; height: 300px; background: #1a1a2e; border-radius: 8px; overflow: hidden;">
        <div style="position: absolute; top: 10px; left: 10px; color: white; font-size: 12px;">NORMAL (0.35x)</div>
        <WinModal visible={true} handCategory="HIGH_CARD" winAmount={350000} multiplier={0.35} onClose={args.onClose} />
      </div>
      <div style="position: relative; height: 300px; background: #1a1a2e; border-radius: 8px; overflow: hidden;">
        <div style="position: absolute; top: 10px; left: 10px; color: white; font-size: 12px;">MEDIUM (1.5x)</div>
        <WinModal visible={true} handCategory="TWO_PAIR" winAmount={1500000} multiplier={1.5} onClose={args.onClose} />
      </div>
      <div style="position: relative; height: 300px; background: #1a1a2e; border-radius: 8px; overflow: hidden;">
        <div style="position: absolute; top: 10px; left: 10px; color: white; font-size: 12px;">HIGH (3x)</div>
        <WinModal visible={true} handCategory="THREE_OF_A_KIND" winAmount={3000000} multiplier={3} onClose={args.onClose} />
      </div>
      <div style="position: relative; height: 300px; background: #1a1a2e; border-radius: 8px; overflow: hidden;">
        <div style="position: absolute; top: 10px; left: 10px; color: white; font-size: 12px;">JACKPOT (1000x)</div>
        <WinModal visible={true} handCategory="ROYAL_FLUSH" winAmount={1000000000} multiplier={1000} onClose={args.onClose} />
      </div>
    </div>
  {/snippet}
</Story>
