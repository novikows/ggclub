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
   * Reset card to face down state
   */
  resetToFaceDown(): void {
    this.isFaceUp = false;
    if (this.cardBack) {
      this.cardBack.visible = true;
    }
    if (this.cardFront) {
      this.cardFront.visible = false;
    }
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
   * Enhanced pulse animation for Joker cards with golden glow
   */
  async pulse(duration: number = 600, pulses: number = 2): Promise<void> {
    // Add golden glow for Joker
    const jokerGlow = new PIXI.Graphics();
    jokerGlow.name = 'jokerGlow';
    this.addChildAt(jokerGlow, 0);
    
    // Track if animation should stop
    let shouldStopGlow = false;
    
    // Start glow animation
    const totalDuration = duration * pulses;
    this.animateJokerGlowControlled(jokerGlow, totalDuration, () => shouldStopGlow);
    
    // Pulse animation
    const pulseDuration = duration / pulses;
    for (let i = 0; i < pulses; i++) {
      await this.animatePulse(pulseDuration);
    }
    
    // Stop glow animation
    shouldStopGlow = true;
    
    // Clean up glow immediately
    if (this.children.includes(jokerGlow)) {
      this.removeChild(jokerGlow);
    }
  }
  
  private animatePulse(duration: number): Promise<void> {
    return new Promise(resolve => {
      const startTime = Date.now();
      const baseScale = 1;
      const maxScale = 1.15;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Sin wave for smooth pulse with more amplitude
        const scale = baseScale + (maxScale - baseScale) * Math.sin(progress * Math.PI);
        this.scale.set(scale);
        
        // Add rotation for extra flair
        this.rotation = Math.sin(progress * Math.PI) * 0.05;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.scale.set(baseScale);
          this.rotation = 0;
          resolve();
        }
      };
      
      animate();
    });
  }
  
  /**
   * Animate golden glow for Joker - dark gold theme with stop control
   */
  private animateJokerGlowControlled(
    glow: PIXI.Graphics, 
    duration: number,
    shouldStop: () => boolean
  ): void {
    const startTime = Date.now();
    const goldColor = 0xFFD700; // Only golden yellow for Joker
    const cardSize = this.getCardSize();
    
    const animate = () => {
      // Stop if flag is set or glow is removed
      if (shouldStop() || !this.children.includes(glow)) {
        return;
      }
      
      const elapsed = Date.now() - startTime;
      if (elapsed > duration) return;
      
      const progress = (elapsed % 400) / 400;
      
      // Subtle pulsing effect
      const alpha = 0.25 + Math.sin(progress * Math.PI * 2) * 0.15;
      const scaleOffset = Math.sin(progress * Math.PI * 2) * 0.1;
      
      const glowWidth = cardSize.width + 20;
      const glowHeight = cardSize.height + 20;
      
      glow.clear();
      
      // Single dark gold glow
      glow.beginFill(goldColor, alpha);
      glow.drawRoundedRect(
        -glowWidth / 2 - scaleOffset * 10, 
        -glowHeight / 2 - scaleOffset * 10, 
        glowWidth + scaleOffset * 20, 
        glowHeight + scaleOffset * 20, 
        12
      );
      glow.endFill();
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  
  /**
   * Highlight card with tier-based animation intensity
   */
  setHighlight(enabled: boolean, color?: number, tier?: string): void {
    // Set defaults
    const highlightColor = color ?? 0xFFD700;
    const highlightTier = tier ?? 'NORMAL';
    
    if (enabled) {
      // Remove old highlight if exists
      const oldHighlight = this.getChildByName('highlight');
      if (oldHighlight) {
        this.removeChild(oldHighlight);
      }
      
      // Create animated glow
      const glow = new PIXI.Graphics();
      glow.name = 'highlight';
      this.addChildAt(glow, 0);
      
      // Determine animation intensity
      const isHighTier = highlightTier === 'JACKPOT' || highlightTier === 'BEST' || highlightTier === 'HIGH';
      
      // Flash effect only for high tier wins
      if (isHighTier) {
        this.animateFlashEffect(highlightColor);
      }
      
      // Start continuous glow animation with tier-based intensity
      this.animateHighlight(glow, highlightColor, highlightTier);
      
      // Bounce animation with tier-based intensity
      this.animateBounce(highlightTier);
    } else {
      // Remove glow
      const highlight = this.getChildByName('highlight');
      if (highlight) {
        this.removeChild(highlight);
      }
    }
  }
  
  /**
   * Initial flash effect when card is highlighted
   */
  private animateFlashEffect(color: number): void {
    const flash = new PIXI.Graphics();
    flash.name = 'flash';
    this.addChildAt(flash, 0);
    
    const cardSize = this.getCardSize();
    const startTime = Date.now();
    const duration = 300;
    
    const animate = () => {
      if (!this.children.includes(flash)) return;
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Quick burst effect
      const alpha = (1 - progress) * 0.6;
      const scale = 1 + progress * 0.8;
      
      const flashWidth = cardSize.width + 20;
      const flashHeight = cardSize.height + 20;
      
      flash.clear();
      flash.beginFill(color, alpha);
      flash.drawRoundedRect(
        -flashWidth / 2 * scale, 
        -flashHeight / 2 * scale, 
        flashWidth * scale, 
        flashHeight * scale, 
        15
      );
      flash.endFill();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (this.children.includes(flash)) {
          this.removeChild(flash);
        }
      }
    };
    
    animate();
  }
  
  /**
   * Animate highlight glow with tier-based intensity
   */
  private animateHighlight(glow: PIXI.Graphics, color: number, tier: string): void {
    const startTime = Date.now();
    const cardSize = this.getCardSize();
    
    // Tier-based settings
    const isHighTier = tier === 'JACKPOT' || tier === 'BEST' || tier === 'HIGH';
    const duration = isHighTier ? 1000 : 1500; // Faster for high tier
    const baseAlpha = isHighTier ? 0.3 : 0.2;
    const alphaRange = isHighTier ? 0.2 : 0.1;
    const baseScale = isHighTier ? 0.15 : 0.08;
    const glowPadding = isHighTier ? 16 : 12;
    
    const animate = () => {
      if (!this.children.includes(glow)) return;
      
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % duration) / duration;
      
      // Pulsing effect
      const alpha = baseAlpha + Math.sin(progress * Math.PI * 2) * alphaRange;
      const scaleOffset = Math.sin(progress * Math.PI * 2) * baseScale;
      
      const glowWidth = cardSize.width + glowPadding;
      const glowHeight = cardSize.height + glowPadding;
      
      glow.clear();
      
      if (isHighTier) {
        // Double-layer glow for high tier
        // Outer glow
        glow.beginFill(color, alpha * 0.4);
        glow.drawRoundedRect(
          -glowWidth / 2 - scaleOffset * 12, 
          -glowHeight / 2 - scaleOffset * 12, 
          glowWidth + scaleOffset * 24, 
          glowHeight + scaleOffset * 24, 
          12
        );
        glow.endFill();
        
        // Inner glow for intensity
        glow.beginFill(color, alpha * 0.6);
        glow.drawRoundedRect(
          -glowWidth / 2 - scaleOffset * 6, 
          -glowHeight / 2 - scaleOffset * 6, 
          glowWidth + scaleOffset * 12, 
          glowHeight + scaleOffset * 12, 
          10
        );
        glow.endFill();
      } else {
        // Single simple glow for low tier
        glow.beginFill(color, alpha);
        glow.drawRoundedRect(
          -glowWidth / 2 - scaleOffset * 5, 
          -glowHeight / 2 - scaleOffset * 5, 
          glowWidth + scaleOffset * 10, 
          glowHeight + scaleOffset * 10, 
          10
        );
        glow.endFill();
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  /**
   * Bounce animation with tier-based intensity
   */
  private async animateBounce(tier: string = 'NORMAL'): Promise<void> {
    const startY = this.position.y;
    
    // Tier-based settings
    const isHighTier = tier === 'JACKPOT' || tier === 'BEST' || tier === 'HIGH';
    const bounceHeight = isHighTier ? -25 : -12; // Higher bounce for high tier
    const duration = isHighTier ? 600 : 400; // Longer for high tier
    const scaleBoost = isHighTier ? 0.15 : 0.05; // More scale for high tier
    const rotationAmount = isHighTier ? 0.08 : 0.03; // More rotation for high tier
    
    return new Promise(resolve => {
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        let eased: number;
        
        if (isHighTier) {
          // Multiple bounces for high tier
          if (progress < 0.4) {
            eased = Math.sin(progress * 2.5 * Math.PI) * 1.0;
          } else if (progress < 0.7) {
            eased = Math.sin((progress - 0.4) * 3.33 * Math.PI) * 0.5;
          } else {
            eased = Math.sin((progress - 0.7) * 3.33 * Math.PI) * 0.2;
          }
        } else {
          // Simple single bounce for low tier
          eased = Math.sin(progress * Math.PI);
        }
        
        this.position.y = startY + bounceHeight * eased;
        
        // Scale pulse during bounce
        const scale = 1 + Math.abs(eased) * scaleBoost;
        this.scale.set(scale);
        
        // Rotation (only for high tier)
        if (isHighTier) {
          this.rotation = Math.sin(progress * Math.PI * 2) * rotationAmount;
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.position.y = startY;
          this.scale.set(1);
          this.rotation = 0;
          resolve();
        }
      };
      
      animate();
    });
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
