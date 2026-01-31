<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import ControlsViewWrapper from './ControlsViewWrapper.svelte';
  import { fn } from 'storybook/test';

  const { Story } = defineMeta({
    title: 'Components/ControlsView',
    component: ControlsViewWrapper,
    tags: ['autodocs'],
    argTypes: {
      state: {
        control: 'select',
        options: ['INIT', 'IDLE', 'SPINNING', 'DISPLAYING_WIN'],
        description: 'Game state',
      },
      balance: {
        control: { type: 'number', min: 0, step: 1_000_000 },
        description: 'Player balance (in micro-units, 1_000_000 = $1)',
      },
      bet: {
        control: { type: 'number', min: 100_000, step: 100_000 },
        description: 'Current bet (in micro-units)',
      },
      lastWin: {
        control: { type: 'number', min: 0, step: 100_000 },
        description: 'Last win amount (in micro-units)',
      },
      jokerMode: {
        control: 'boolean',
        description: 'Enable Joker mode (bet × 2.25)',
      },
      soundEnabled: {
        control: 'boolean',
        description: 'Sound enabled state',
      },
      onPlay: { action: 'play' },
      onBetIncrease: { action: 'betIncrease' },
      onBetDecrease: { action: 'betDecrease' },
      onToggleSound: { action: 'toggleSound' },
    },
    args: {
      state: 'IDLE',
      balance: 100_000_000,
      bet: 1_000_000,
      lastWin: 0,
      jokerMode: false,
      soundEnabled: true,
      onPlay: fn(),
      onBetIncrease: fn(),
      onBetDecrease: fn(),
      onToggleSound: fn(),
    },
  });
</script>

<Story name="Interactive" />

<Story name="Spinning" args={{ state: 'SPINNING', balance: 99_000_000, bet: 1_000_000 }} />

<Story name="Displaying Win" args={{ state: 'DISPLAYING_WIN', balance: 103_000_000, lastWin: 3_000_000 }} />

<Story name="Low Balance" args={{ state: 'IDLE', balance: 500_000, bet: 1_000_000 }} />

<Story name="Joker Mode Active" args={{ state: 'IDLE', jokerMode: true }} />

<Story name="Sound Muted" args={{ state: 'IDLE', soundEnabled: false }} />

<Story name="High Roller" args={{ state: 'IDLE', balance: 500_000_000, bet: 10_000_000 }} />

<Story name="Big Win" args={{ state: 'DISPLAYING_WIN', balance: 200_000_000, lastWin: 100_000_000 }} />
