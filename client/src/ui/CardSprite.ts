import * as PIXI from 'pixi.js';
import { Symbol } from '../types';

/**
 * Card Sprite - represents a single playing card
 */
export class CardSprite extends PIXI.Container {
  private cardFront: PIXI.Sprite | null = null;
  private cardBack: PIXI.Sprite | null = null;
  private currentSymbol: Symbol | null = null;
  private isFaceUp: boolean = false;
  
  constructor() {
    super();
  }
  
  /**
   * Initialize card with textures
   */
  async init(): Promise<void> {
    // Load card back
    const backTexture = await PIXI.Assets.load('/assets/cards/BACK.png');
    this.cardBack = new PIXI.Sprite(backTexture);
    this.cardBack.anchor.set(0.5);
    this.addChild(this.cardBack);
    
    // Card starts face down
    this.isFaceUp = false;
  }
  
  /**
   * Set card symbol and load texture
   */
  async setSymbol(symbol: Symbol): Promise<void> {
    this.currentSymbol = symbol;
    
    // Load front texture
    const frontTexture = await PIXI.Assets.load(`/assets/cards/${symbol}.png`);
    
    // Remove old front if exists
    if (this.cardFront) {
      this.removeChild(this.cardFront);
    }
    
    this.cardFront = new PIXI.Sprite(frontTexture);
    this.cardFront.anchor.set(0.5);
    this.cardFront.visible = this.isFaceUp;
    this.addChild(this.cardFront);
  }
  
  /**
   * Flip card to face up with animation
   */
  async flipToFaceUp(duration: number = 300): Promise<void> {
    if (this.isFaceUp || !this.cardFront || !this.cardBack) return;
    
    // Shrink horizontally (flip effect)
    await this.animateFlip(duration / 2, 0);
    
    // Switch visibility
    this.cardBack.visible = false;
    this.cardFront.visible = true;
    
    // Expand horizontally
    await this.animateFlip(duration / 2, 1);
    
    this.isFaceUp = true;
  }
  
  /**
   * Flip card to face down with animation
   */
  async flipToFaceDown(duration: number = 300): Promise<void> {
    if (!this.isFaceUp || !this.cardFront || !this.cardBack) return;
    
    // Shrink horizontally
    await this.animateFlip(duration / 2, 0);
    
    // Switch visibility
    this.cardFront.visible = false;
    this.cardBack.visible = true;
    
    // Expand horizontally
    await this.animateFlip(duration / 2, 1);
    
    this.isFaceUp = false;
  }
  
  /**
   * Animate flip effect
   */
  private animateFlip(duration: number, targetScaleX: number): Promise<void> {
    return new Promise(resolve => {
      const startScaleX = this.scale.x;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        
        this.scale.x = startScaleX + (targetScaleX - startScaleX) * eased;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.scale.x = targetScaleX;
          resolve();
        }
      };
      
      animate();
    });
  }
  
  /**
   * Show card appearing animation
   */
  async appear(duration: number = 300): Promise<void> {
    this.alpha = 0;
    this.scale.set(0.5);
    
    return new Promise(resolve => {
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out back
        const eased = 1 - Math.pow(1 - progress, 3);
        
        this.alpha = eased;
        const scale = 0.5 + (0.5 * eased);
        this.scale.set(scale);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.alpha = 1;
          this.scale.set(1);
          resolve();
        }
      };
      
      animate();
    });
  }
  
  /**
   * Pulse animation (for joker highlight)
   */
  async pulse(duration: number = 600, pulses: number = 2): Promise<void> {
    const pulseDuration = duration / pulses;
    
    for (let i = 0; i < pulses; i++) {
      await this.animatePulse(pulseDuration);
    }
  }
  
  private animatePulse(duration: number): Promise<void> {
    return new Promise(resolve => {
      const startTime = Date.now();
      const baseScale = 1;
      const maxScale = 1.1;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Sin wave for smooth pulse
        const scale = baseScale + (maxScale - baseScale) * Math.sin(progress * Math.PI);
        this.scale.set(scale);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.scale.set(baseScale);
          resolve();
        }
      };
      
      animate();
    });
  }
  
  /**
   * Highlight card (winning card)
   */
  setHighlight(enabled: boolean, color: number = 0xFFD700): void {
    if (enabled) {
      // Add glow filter
      const glow = new PIXI.Graphics();
      glow.beginFill(color, 0.3);
      glow.drawRoundedRect(-5, -5, this.width + 10, this.height + 10, 10);
      glow.endFill();
      glow.name = 'highlight';
      this.addChildAt(glow, 0);
    } else {
      // Remove glow
      const highlight = this.getChildByName('highlight');
      if (highlight) {
        this.removeChild(highlight);
      }
    }
  }
  
  /**
   * Get card dimensions
   */
  getCardSize(): { width: number; height: number } {
    if (this.cardBack) {
      return {
        width: this.cardBack.texture.width,
        height: this.cardBack.texture.height,
      };
    }
    return { width: 140, height: 190 }; // Default size
  }
}
