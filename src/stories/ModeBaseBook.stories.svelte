<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import BoardView from '$lib/components/BoardView.svelte';
  import WinModal from '$lib/components/WinModal.svelte';
  import baseBooks, { getRandomBaseBook } from './data/base_books';
  import { delay } from './data/helpers';

  const { Story } = defineMeta({
    title: 'MODE_BASE/book',
    tags: ['autodocs'],
  });

  const bookMap = Object.fromEntries(baseBooks.map(b => [b.handCategory, b]));
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
        await delay(300);
      } else if (event.type === 'joker_transform') {
        await boardRef?.transformJokers(event.jokerTransforms);
        await delay(300);
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
  {@const book = getRandomBaseBook()}
  <div style="padding: 20px; background: #16213e; min-height: 500px;">
    <h2 style="color: white; margin-bottom: 20px;">Random: {book.name}</h2>
    <p style="color: #aaa; margin-bottom: 20px;">Payout: {book.payoutMultiplier}x</p>
    <BoardView bind:this={boardRefs['random']} />
    <div style="margin-top: 20px;">
      <button onclick={() => playBook('random', book.events, boardRefs['random'])} style="padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Play Book</button>
      <button onclick={() => resetBook('random', boardRefs['random'])} style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 16px;">Reset</button>
    </div>
    <WinModal visible={winModalVisible['random'] || false} handCategory={currentHandCategory['random'] || 'HIGH_CARD'} winAmount={currentWinAmount['random'] || 0} multiplier={currentMultiplier['random'] || 0} onClose={() => closeModal('random')} />
  </div>
</Story>

<Story name="royal_flush">
  {@const book = bookMap['ROYAL_FLUSH']}
  <div style="padding: 20px; background: #16213e; min-height: 500px;">
    <h2 style="color: white; margin-bottom: 20px;">{book.name}</h2>
    <p style="color: #aaa; margin-bottom: 20px;">Payout: {book.payoutMultiplier}x</p>
    <BoardView bind:this={boardRefs['royal_flush']} />
    <div style="margin-top: 20px;">
      <button onclick={() => playBook('royal_flush', book.events, boardRefs['royal_flush'])} style="padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Play Book</button>
      <button onclick={() => resetBook('royal_flush', boardRefs['royal_flush'])} style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 16px;">Reset</button>
    </div>
    <WinModal visible={winModalVisible['royal_flush'] || false} handCategory={currentHandCategory['royal_flush'] || 'HIGH_CARD'} winAmount={currentWinAmount['royal_flush'] || 0} multiplier={currentMultiplier['royal_flush'] || 0} onClose={() => closeModal('royal_flush')} />
  </div>
</Story>

<Story name="straight_flush">
  {@const book = bookMap['STRAIGHT_FLUSH']}
  <div style="padding: 20px; background: #16213e; min-height: 500px;">
    <h2 style="color: white; margin-bottom: 20px;">{book.name}</h2>
    <p style="color: #aaa; margin-bottom: 20px;">Payout: {book.payoutMultiplier}x</p>
    <BoardView bind:this={boardRefs['straight_flush']} />
    <div style="margin-top: 20px;">
      <button onclick={() => playBook('straight_flush', book.events, boardRefs['straight_flush'])} style="padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Play Book</button>
      <button onclick={() => resetBook('straight_flush', boardRefs['straight_flush'])} style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 16px;">Reset</button>
    </div>
    <WinModal visible={winModalVisible['straight_flush'] || false} handCategory={currentHandCategory['straight_flush'] || 'HIGH_CARD'} winAmount={currentWinAmount['straight_flush'] || 0} multiplier={currentMultiplier['straight_flush'] || 0} onClose={() => closeModal('straight_flush')} />
  </div>
</Story>

<Story name="four_of_a_kind">
  {@const book = bookMap['FOUR_OF_A_KIND']}
  <div style="padding: 20px; background: #16213e; min-height: 500px;">
    <h2 style="color: white; margin-bottom: 20px;">{book.name}</h2>
    <p style="color: #aaa; margin-bottom: 20px;">Payout: {book.payoutMultiplier}x</p>
    <BoardView bind:this={boardRefs['four_of_a_kind']} />
    <div style="margin-top: 20px;">
      <button onclick={() => playBook('four_of_a_kind', book.events, boardRefs['four_of_a_kind'])} style="padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Play Book</button>
      <button onclick={() => resetBook('four_of_a_kind', boardRefs['four_of_a_kind'])} style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 16px;">Reset</button>
    </div>
    <WinModal visible={winModalVisible['four_of_a_kind'] || false} handCategory={currentHandCategory['four_of_a_kind'] || 'HIGH_CARD'} winAmount={currentWinAmount['four_of_a_kind'] || 0} multiplier={currentMultiplier['four_of_a_kind'] || 0} onClose={() => closeModal('four_of_a_kind')} />
  </div>
</Story>

<Story name="full_house">
  {@const book = bookMap['FULL_HOUSE']}
  <div style="padding: 20px; background: #16213e; min-height: 500px;">
    <h2 style="color: white; margin-bottom: 20px;">{book.name}</h2>
    <p style="color: #aaa; margin-bottom: 20px;">Payout: {book.payoutMultiplier}x</p>
    <BoardView bind:this={boardRefs['full_house']} />
    <div style="margin-top: 20px;">
      <button onclick={() => playBook('full_house', book.events, boardRefs['full_house'])} style="padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Play Book</button>
      <button onclick={() => resetBook('full_house', boardRefs['full_house'])} style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 16px;">Reset</button>
    </div>
    <WinModal visible={winModalVisible['full_house'] || false} handCategory={currentHandCategory['full_house'] || 'HIGH_CARD'} winAmount={currentWinAmount['full_house'] || 0} multiplier={currentMultiplier['full_house'] || 0} onClose={() => closeModal('full_house')} />
  </div>
</Story>

<Story name="flush">
  {@const book = bookMap['FLUSH']}
  <div style="padding: 20px; background: #16213e; min-height: 500px;">
    <h2 style="color: white; margin-bottom: 20px;">{book.name}</h2>
    <p style="color: #aaa; margin-bottom: 20px;">Payout: {book.payoutMultiplier}x</p>
    <BoardView bind:this={boardRefs['flush']} />
    <div style="margin-top: 20px;">
      <button onclick={() => playBook('flush', book.events, boardRefs['flush'])} style="padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Play Book</button>
      <button onclick={() => resetBook('flush', boardRefs['flush'])} style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 16px;">Reset</button>
    </div>
    <WinModal visible={winModalVisible['flush'] || false} handCategory={currentHandCategory['flush'] || 'HIGH_CARD'} winAmount={currentWinAmount['flush'] || 0} multiplier={currentMultiplier['flush'] || 0} onClose={() => closeModal('flush')} />
  </div>
</Story>

<Story name="straight">
  {@const book = bookMap['STRAIGHT']}
  <div style="padding: 20px; background: #16213e; min-height: 500px;">
    <h2 style="color: white; margin-bottom: 20px;">{book.name}</h2>
    <p style="color: #aaa; margin-bottom: 20px;">Payout: {book.payoutMultiplier}x</p>
    <BoardView bind:this={boardRefs['straight']} />
    <div style="margin-top: 20px;">
      <button onclick={() => playBook('straight', book.events, boardRefs['straight'])} style="padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Play Book</button>
      <button onclick={() => resetBook('straight', boardRefs['straight'])} style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 16px;">Reset</button>
    </div>
    <WinModal visible={winModalVisible['straight'] || false} handCategory={currentHandCategory['straight'] || 'HIGH_CARD'} winAmount={currentWinAmount['straight'] || 0} multiplier={currentMultiplier['straight'] || 0} onClose={() => closeModal('straight')} />
  </div>
</Story>

<Story name="three_of_a_kind">
  {@const book = bookMap['THREE_OF_A_KIND']}
  <div style="padding: 20px; background: #16213e; min-height: 500px;">
    <h2 style="color: white; margin-bottom: 20px;">{book.name}</h2>
    <p style="color: #aaa; margin-bottom: 20px;">Payout: {book.payoutMultiplier}x</p>
    <BoardView bind:this={boardRefs['three_of_a_kind']} />
    <div style="margin-top: 20px;">
      <button onclick={() => playBook('three_of_a_kind', book.events, boardRefs['three_of_a_kind'])} style="padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Play Book</button>
      <button onclick={() => resetBook('three_of_a_kind', boardRefs['three_of_a_kind'])} style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 16px;">Reset</button>
    </div>
    <WinModal visible={winModalVisible['three_of_a_kind'] || false} handCategory={currentHandCategory['three_of_a_kind'] || 'HIGH_CARD'} winAmount={currentWinAmount['three_of_a_kind'] || 0} multiplier={currentMultiplier['three_of_a_kind'] || 0} onClose={() => closeModal('three_of_a_kind')} />
  </div>
</Story>

<Story name="two_pair">
  {@const book = bookMap['TWO_PAIR']}
  <div style="padding: 20px; background: #16213e; min-height: 500px;">
    <h2 style="color: white; margin-bottom: 20px;">{book.name}</h2>
    <p style="color: #aaa; margin-bottom: 20px;">Payout: {book.payoutMultiplier}x</p>
    <BoardView bind:this={boardRefs['two_pair']} />
    <div style="margin-top: 20px;">
      <button onclick={() => playBook('two_pair', book.events, boardRefs['two_pair'])} style="padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Play Book</button>
      <button onclick={() => resetBook('two_pair', boardRefs['two_pair'])} style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 16px;">Reset</button>
    </div>
    <WinModal visible={winModalVisible['two_pair'] || false} handCategory={currentHandCategory['two_pair'] || 'HIGH_CARD'} winAmount={currentWinAmount['two_pair'] || 0} multiplier={currentMultiplier['two_pair'] || 0} onClose={() => closeModal('two_pair')} />
  </div>
</Story>

<Story name="pair">
  {@const book = bookMap['PAIR']}
  <div style="padding: 20px; background: #16213e; min-height: 500px;">
    <h2 style="color: white; margin-bottom: 20px;">{book.name}</h2>
    <p style="color: #aaa; margin-bottom: 20px;">Payout: {book.payoutMultiplier}x</p>
    <BoardView bind:this={boardRefs['pair']} />
    <div style="margin-top: 20px;">
      <button onclick={() => playBook('pair', book.events, boardRefs['pair'])} style="padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Play Book</button>
      <button onclick={() => resetBook('pair', boardRefs['pair'])} style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 16px;">Reset</button>
    </div>
    <WinModal visible={winModalVisible['pair'] || false} handCategory={currentHandCategory['pair'] || 'HIGH_CARD'} winAmount={currentWinAmount['pair'] || 0} multiplier={currentMultiplier['pair'] || 0} onClose={() => closeModal('pair')} />
  </div>
</Story>

<Story name="high_card">
  {@const book = bookMap['HIGH_CARD']}
  <div style="padding: 20px; background: #16213e; min-height: 500px;">
    <h2 style="color: white; margin-bottom: 20px;">{book.name}</h2>
    <p style="color: #aaa; margin-bottom: 20px;">Payout: {book.payoutMultiplier}x</p>
    <BoardView bind:this={boardRefs['high_card']} />
    <div style="margin-top: 20px;">
      <button onclick={() => playBook('high_card', book.events, boardRefs['high_card'])} style="padding: 12px 24px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 16px;">Play Book</button>
      <button onclick={() => resetBook('high_card', boardRefs['high_card'])} style="padding: 12px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px; font-size: 16px;">Reset</button>
    </div>
    <WinModal visible={winModalVisible['high_card'] || false} handCategory={currentHandCategory['high_card'] || 'HIGH_CARD'} winAmount={currentWinAmount['high_card'] || 0} multiplier={currentMultiplier['high_card'] || 0} onClose={() => closeModal('high_card')} />
  </div>
</Story>
