<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BoardView from '$lib/components/BoardView.svelte';
  import WinModal from '$lib/components/WinModal.svelte';
  import bonusBooks, { getRandomBonusBook } from './data/bonus_books';
  import { delay } from './data/helpers';

  const { Story } = defineMeta({
    title: 'MODE_JOKER/book',
    tags: ['autodocs'],
  });

  const bookMap = Object.fromEntries(bonusBooks.map(b => [b.id, b]));
</script>

<script>
  let boardRefs = $state({});
  let winModalVisible = $state({});
  let currentHandCategory = $state({});
  let currentWinAmount = $state({});
  let currentMultiplier = $state({});

  async function playBook(bookId, events, boardRef) {
    boardRef?.reset();
    winModalVisible[bookId] = false;

    for (const event of events) {
      if (event.type === 'reveal_initial_board') {
        const symbols = event.board.map(c => c.symbol);
        await boardRef?.revealCards(symbols);
        await delay(500);
      } else if (event.type === 'joker_transform') {
        await boardRef?.transformJokers(event.jokerTransforms);
        await delay(500);
      } else if (event.type === 'hand_result') {
        boardRef?.highlightWinningCards(event.winningPositions);
        currentHandCategory[bookId] = event.handCategory;
        currentWinAmount[bookId] = event.payoutMultiplier * 1_000_000;
        currentMultiplier[bookId] = event.payoutMultiplier;
        if (event.payoutMultiplier > 0) {
          winModalVisible[bookId] = true;
        }
      }
    }
  }

  function closeModal(bookId) {
    winModalVisible[bookId] = false;
  }

  function resetBook(bookId, boardRef) {
    boardRef?.reset();
    winModalVisible[bookId] = false;
  }
</script>

<Story name="random">
  {@const book = getRandomBonusBook()}
  <div style="padding: 20px; background: #16213e; min-height: 500px;">
    <h2 style="color: white; margin-bottom: 10px;">Random Joker: {book.name}</h2>
    <p style="color: #aaa; margin-bottom: 20px;">Payout: {book.payoutMultiplier}x</p>
    <BoardView bind:this={boardRefs['random']} />
    <div style="margin-top: 20px;">
      <button onclick={() => playBook('random', book.events, boardRefs['random'])} style="padding: 12px 24px; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Play Book</button>
      <button onclick={() => resetBook('random', boardRefs['random'])} style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 16px;">Reset</button>
    </div>
    <WinModal visible={winModalVisible['random'] || false} handCategory={currentHandCategory['random'] || 'HIGH_CARD'} winAmount={currentWinAmount['random'] || 0} multiplier={currentMultiplier['random'] || 0} onClose={() => closeModal('random')} />
  </div>
</Story>

<Story name="joker_pair_to_three">
  {@const book = bookMap['bonus-joker-pair-to-three']}
  <div style="padding: 20px; background: #16213e; min-height: 500px;">
    <h2 style="color: white; margin-bottom: 10px;">{book.name}</h2>
    <p style="color: #aaa; margin-bottom: 20px;">Payout: {book.payoutMultiplier}x</p>
    <BoardView bind:this={boardRefs['joker_pair_to_three']} />
    <div style="margin-top: 20px;">
      <button onclick={() => playBook('joker_pair_to_three', book.events, boardRefs['joker_pair_to_three'])} style="padding: 12px 24px; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Play Book</button>
      <button onclick={() => resetBook('joker_pair_to_three', boardRefs['joker_pair_to_three'])} style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 16px;">Reset</button>
    </div>
    <WinModal visible={winModalVisible['joker_pair_to_three'] || false} handCategory={currentHandCategory['joker_pair_to_three'] || 'HIGH_CARD'} winAmount={currentWinAmount['joker_pair_to_three'] || 0} multiplier={currentMultiplier['joker_pair_to_three'] || 0} onClose={() => closeModal('joker_pair_to_three')} />
  </div>
</Story>

<Story name="joker_royal_flush">
  {@const book = bookMap['bonus-joker-royal-flush']}
  <div style="padding: 20px; background: #16213e; min-height: 500px;">
    <h2 style="color: white; margin-bottom: 10px;">{book.name}</h2>
    <p style="color: #aaa; margin-bottom: 20px;">Payout: {book.payoutMultiplier}x</p>
    <BoardView bind:this={boardRefs['joker_royal_flush']} />
    <div style="margin-top: 20px;">
      <button onclick={() => playBook('joker_royal_flush', book.events, boardRefs['joker_royal_flush'])} style="padding: 12px 24px; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Play Book</button>
      <button onclick={() => resetBook('joker_royal_flush', boardRefs['joker_royal_flush'])} style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 16px;">Reset</button>
    </div>
    <WinModal visible={winModalVisible['joker_royal_flush'] || false} handCategory={currentHandCategory['joker_royal_flush'] || 'HIGH_CARD'} winAmount={currentWinAmount['joker_royal_flush'] || 0} multiplier={currentMultiplier['joker_royal_flush'] || 0} onClose={() => closeModal('joker_royal_flush')} />
  </div>
</Story>

<Story name="joker_straight">
  {@const book = bookMap['bonus-joker-straight']}
  <div style="padding: 20px; background: #16213e; min-height: 500px;">
    <h2 style="color: white; margin-bottom: 10px;">{book.name}</h2>
    <p style="color: #aaa; margin-bottom: 20px;">Payout: {book.payoutMultiplier}x</p>
    <BoardView bind:this={boardRefs['joker_straight']} />
    <div style="margin-top: 20px;">
      <button onclick={() => playBook('joker_straight', book.events, boardRefs['joker_straight'])} style="padding: 12px 24px; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Play Book</button>
      <button onclick={() => resetBook('joker_straight', boardRefs['joker_straight'])} style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 16px;">Reset</button>
    </div>
    <WinModal visible={winModalVisible['joker_straight'] || false} handCategory={currentHandCategory['joker_straight'] || 'HIGH_CARD'} winAmount={currentWinAmount['joker_straight'] || 0} multiplier={currentMultiplier['joker_straight'] || 0} onClose={() => closeModal('joker_straight')} />
  </div>
</Story>

<Story name="joker_flush">
  {@const book = bookMap['bonus-joker-flush']}
  <div style="padding: 20px; background: #16213e; min-height: 500px;">
    <h2 style="color: white; margin-bottom: 10px;">{book.name}</h2>
    <p style="color: #aaa; margin-bottom: 20px;">Payout: {book.payoutMultiplier}x</p>
    <BoardView bind:this={boardRefs['joker_flush']} />
    <div style="margin-top: 20px;">
      <button onclick={() => playBook('joker_flush', book.events, boardRefs['joker_flush'])} style="padding: 12px 24px; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Play Book</button>
      <button onclick={() => resetBook('joker_flush', boardRefs['joker_flush'])} style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 16px;">Reset</button>
    </div>
    <WinModal visible={winModalVisible['joker_flush'] || false} handCategory={currentHandCategory['joker_flush'] || 'HIGH_CARD'} winAmount={currentWinAmount['joker_flush'] || 0} multiplier={currentMultiplier['joker_flush'] || 0} onClose={() => closeModal('joker_flush')} />
  </div>
</Story>

<Story name="joker_straight_flush">
  {@const book = bookMap['bonus-joker-straight-flush']}
  <div style="padding: 20px; background: #16213e; min-height: 500px;">
    <h2 style="color: white; margin-bottom: 10px;">{book.name}</h2>
    <p style="color: #aaa; margin-bottom: 20px;">Payout: {book.payoutMultiplier}x</p>
    <BoardView bind:this={boardRefs['joker_straight_flush']} />
    <div style="margin-top: 20px;">
      <button onclick={() => playBook('joker_straight_flush', book.events, boardRefs['joker_straight_flush'])} style="padding: 12px 24px; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Play Book</button>
      <button onclick={() => resetBook('joker_straight_flush', boardRefs['joker_straight_flush'])} style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 16px;">Reset</button>
    </div>
    <WinModal visible={winModalVisible['joker_straight_flush'] || false} handCategory={currentHandCategory['joker_straight_flush'] || 'HIGH_CARD'} winAmount={currentWinAmount['joker_straight_flush'] || 0} multiplier={currentMultiplier['joker_straight_flush'] || 0} onClose={() => closeModal('joker_straight_flush')} />
  </div>
</Story>

<Story name="joker_two_pair_to_full_house">
  {@const book = bookMap['bonus-joker-two-pair-to-full-house']}
  <div style="padding: 20px; background: #16213e; min-height: 500px;">
    <h2 style="color: white; margin-bottom: 10px;">{book.name}</h2>
    <p style="color: #aaa; margin-bottom: 20px;">Payout: {book.payoutMultiplier}x</p>
    <BoardView bind:this={boardRefs['joker_two_pair_to_full_house']} />
    <div style="margin-top: 20px;">
      <button onclick={() => playBook('joker_two_pair_to_full_house', book.events, boardRefs['joker_two_pair_to_full_house'])} style="padding: 12px 24px; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Play Book</button>
      <button onclick={() => resetBook('joker_two_pair_to_full_house', boardRefs['joker_two_pair_to_full_house'])} style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 16px;">Reset</button>
    </div>
    <WinModal visible={winModalVisible['joker_two_pair_to_full_house'] || false} handCategory={currentHandCategory['joker_two_pair_to_full_house'] || 'HIGH_CARD'} winAmount={currentWinAmount['joker_two_pair_to_full_house'] || 0} multiplier={currentMultiplier['joker_two_pair_to_full_house'] || 0} onClose={() => closeModal('joker_two_pair_to_full_house')} />
  </div>
</Story>

<Story name="joker_three_to_four">
  {@const book = bookMap['bonus-joker-three-to-four']}
  <div style="padding: 20px; background: #16213e; min-height: 500px;">
    <h2 style="color: white; margin-bottom: 10px;">{book.name}</h2>
    <p style="color: #aaa; margin-bottom: 20px;">Payout: {book.payoutMultiplier}x</p>
    <BoardView bind:this={boardRefs['joker_three_to_four']} />
    <div style="margin-top: 20px;">
      <button onclick={() => playBook('joker_three_to_four', book.events, boardRefs['joker_three_to_four'])} style="padding: 12px 24px; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Play Book</button>
      <button onclick={() => resetBook('joker_three_to_four', boardRefs['joker_three_to_four'])} style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 16px;">Reset</button>
    </div>
    <WinModal visible={winModalVisible['joker_three_to_four'] || false} handCategory={currentHandCategory['joker_three_to_four'] || 'HIGH_CARD'} winAmount={currentWinAmount['joker_three_to_four'] || 0} multiplier={currentMultiplier['joker_three_to_four'] || 0} onClose={() => closeModal('joker_three_to_four')} />
  </div>
</Story>

<Story name="joker_high_to_pair">
  {@const book = bookMap['bonus-joker-high-to-pair']}
  <div style="padding: 20px; background: #16213e; min-height: 500px;">
    <h2 style="color: white; margin-bottom: 10px;">{book.name}</h2>
    <p style="color: #aaa; margin-bottom: 20px;">Payout: {book.payoutMultiplier}x</p>
    <BoardView bind:this={boardRefs['joker_high_to_pair']} />
    <div style="margin-top: 20px;">
      <button onclick={() => playBook('joker_high_to_pair', book.events, boardRefs['joker_high_to_pair'])} style="padding: 12px 24px; background: #9C27B0; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Play Book</button>
      <button onclick={() => resetBook('joker_high_to_pair', boardRefs['joker_high_to_pair'])} style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 16px;">Reset</button>
    </div>
    <WinModal visible={winModalVisible['joker_high_to_pair'] || false} handCategory={currentHandCategory['joker_high_to_pair'] || 'HIGH_CARD'} winAmount={currentWinAmount['joker_high_to_pair'] || 0} multiplier={currentMultiplier['joker_high_to_pair'] || 0} onClose={() => closeModal('joker_high_to_pair')} />
  </div>
</Story>
