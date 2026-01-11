import * as PIXI from 'pixi.js';
import { CardSprite } from './CardSprite';
import { Symbol } from '../types';

/**
 * Board View - displays 5 cards in a row
 */
export class BoardView extends PIXI.Container {
  private cards: CardSprite[] = [];
  private cardSpacing: number = 20;
  
  constructor() {
    super();
  }
  
  /**
   * Initialize board with 5 empty card slots
   */
  async init(): Promise<void> {
    console.log('[BoardView] Initializing...');
    
    // Create 5 card sprites
    for (let i = 0; i < 5; i++) {
      const card = new CardSprite();
      await card.init();
      this.cards.push(card);
      this.addChild(card);
    }
    
    // Layout cards
    this.layoutCards();
    
    console.log('[BoardView] Initialized with 5 cards');
  }
  
  /**
   * Layout cards horizontally
   */
  private layoutCards(): void {
    if (this.cards.length === 0) return;
    
    const cardSize = this.cards[0].getCardSize();
    const totalWidth = (cardSize.width * 5) + (this.cardSpacing * 4);
    
    let x = -totalWidth / 2 + cardSize.width / 2;
    
    for (const card of this.cards) {
      card.position.set(x, 0);
      x += cardSize.width + this.cardSpacing;
    }
  }
  
  /**
   * Reveal cards with flop → turn → river animation
   */
  async revealCards(symbols: Symbol[]): Promise<void> {
    if (symbols.length !== 5) {
      console.error('[BoardView] Expected 5 symbols, got', symbols.length);
      return;
    }
    
    // Set symbols for all cards
    for (let i = 0; i < 5; i++) {
      await this.cards[i].setSymbol(symbols[i]);
    }
    
    // Flop: Cards 0, 1, 2 appear and flip
    console.log('[BoardView] Revealing flop (0, 1, 2)');
    await this.revealCardSet([0, 1, 2]);
    await this.delay(300);
    
    // Turn: Card 3 appears and flips
    console.log('[BoardView] Revealing turn (3)');
    await this.revealCardSet([3]);
    await this.delay(300);
    
    // River: Card 4 appears and flips
    console.log('[BoardView] Revealing river (4)');
    await this.revealCardSet([4]);
  }
  
  /**
   * Reveal a set of cards simultaneously
   */
  private async revealCardSet(indices: number[]): Promise<void> {
    // Appear animation
    await Promise.all(
      indices.map(i => this.cards[i].appear(300))
    );
    
    // Flip animation
    await Promise.all(
      indices.map(i => this.cards[i].flipToFaceUp(300))
    );
  }
  
  /**
   * Transform jokers to target symbols
   */
  async transformJokers(
    transforms: Array<{ position: number; targetSymbol: Symbol }>
  ): Promise<void> {
    console.log('[BoardView] Transforming', transforms.length, 'jokers');
    
    // Pulse jokers
    await Promise.all(
      transforms.map(t => this.cards[t.position].pulse(600, 2))
    );
    
    await this.delay(200);
    
    // Flip and transform each joker
    for (const transform of transforms) {
      const card = this.cards[transform.position];
      
      // Flip to back
      await card.flipToFaceDown(300);
      
      // Change symbol
      await card.setSymbol(transform.targetSymbol);
      
      // Flip to front with new symbol
      await card.flipToFaceUp(300);
      
      await this.delay(200);
    }
  }
  
  /**
   * Highlight winning cards with tier-based animation intensity
   */
  highlightWinningCards(positions: number[], color?: number, tier?: string): void {
    const highlightColor = color ?? 0xFFD700;
    const highlightTier = tier ?? 'NORMAL';
    console.log('[BoardView] Highlighting positions:', positions, 'tier:', highlightTier);
    
    // Clear all highlights first
    this.cards.forEach(card => card.setHighlight(false));
    
    // Determine animation intensity based on tier
    const isHighTier = highlightTier === 'JACKPOT' || highlightTier === 'BEST' || highlightTier === 'HIGH';
    const delay = isHighTier ? 100 : 0; // Sequential for high tiers, instant for low
    
    // Highlight winning cards
    positions.forEach((pos, index) => {
      if (pos >= 0 && pos < 5) {
        setTimeout(() => {
          this.cards[pos].setHighlight(true, highlightColor, highlightTier);
        }, index * delay);
      }
    });
  }
  
  /**
   * Clear all highlights
   */
  clearHighlights(): void {
    this.cards.forEach(card => card.setHighlight(false));
  }
  
  /**
   * Reset board (hide all cards and flip to face down)
   */
  reset(): void {
    this.cards.forEach(card => {
      card.alpha = 0;
      card.scale.set(0.5);
      card.resetToFaceDown();
    });
    this.clearHighlights();
  }
  
  /**
   * Resize board to fit screen
   */
  resize(width: number, height: number): void {
    // Calculate scale to fit screen
    const cardSize = this.cards.length > 0 ? this.cards[0].getCardSize() : { width: 140, height: 190 };
    const totalWidth = (cardSize.width * 5) + (this.cardSpacing * 4);
    const maxBoardWidth = width * 0.9;
    
    if (totalWidth > maxBoardWidth) {
      const scale = maxBoardWidth / totalWidth;
      this.scale.set(scale);
    } else {
      this.scale.set(1);
    }
    
    // Center board
    this.position.set(width / 2, height / 2);
  }
  
  /**
   * Utility delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
