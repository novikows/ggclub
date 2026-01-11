import * as PIXI from 'pixi.js';
import { HandTier, HandCategory } from '../types';
import { getHandTierColor, getHandTierLabel, formatHandCategory } from '../utils/handEvaluator';
import { formatCurrency } from '../utils/money';

/**
 * Win Modal - displays win information with tier-based styling
 */
export class WinModal extends PIXI.Container {
  private overlay: PIXI.Graphics;
  private panel: PIXI.Graphics;
  private tierLabel: PIXI.Text;
  private handLabel: PIXI.Text;
  private multiplierLabel: PIXI.Text;
  private winAmountLabel: PIXI.Text;
  private clickToContinueLabel: PIXI.Text;
  
  private onClose?: () => void;
  
  constructor() {
    super();
    this.visible = false;
  }
  
  /**
   * Initialize modal
   */
  init(): void {
    // Dark overlay
    this.overlay = new PIXI.Graphics();
    this.overlay.beginFill(0x000000, 0.7);
    this.overlay.drawRect(0, 0, 800, 600);
    this.overlay.endFill();
    this.overlay.eventMode = 'static';
    this.overlay.on('pointerdown', () => {
      this.hide();
    });
    this.addChild(this.overlay);
    
    // Panel
    this.panel = new PIXI.Graphics();
    this.addChild(this.panel);
    
    // Tier label (e.g., "🎰 JACKPOT 🎰")
    this.tierLabel = new PIXI.Text('', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 48,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 4,
    });
    this.tierLabel.anchor.set(0.5);
    this.addChild(this.tierLabel);
    
    // Hand label (e.g., "Royal Flush")
    this.handLabel = new PIXI.Text('', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 32,
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 3,
    });
    this.handLabel.anchor.set(0.5);
    this.addChild(this.handLabel);
    
    // Multiplier label (e.g., "x1000")
    this.multiplierLabel = new PIXI.Text('', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 28,
      fill: 0xFFD700,
      stroke: 0x000000,
      strokeThickness: 3,
    });
    this.multiplierLabel.anchor.set(0.5);
    this.addChild(this.multiplierLabel);
    
    // Win amount label (e.g., "$1,000.00")
    this.winAmountLabel = new PIXI.Text('', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 42,
      fontWeight: 'bold',
      fill: 0x4CAF50,
      stroke: 0x000000,
      strokeThickness: 4,
    });
    this.winAmountLabel.anchor.set(0.5);
    this.addChild(this.winAmountLabel);
    
    // Click to continue
    this.clickToContinueLabel = new PIXI.Text('Click anywhere to continue', {
      fontFamily: 'Arial, sans-serif',
      fontSize: 16,
      fill: 0xCCCCCC,
    });
    this.clickToContinueLabel.anchor.set(0.5);
    this.addChild(this.clickToContinueLabel);
  }
  
  /**
   * Show win modal
   */
  async show(
    tier: HandTier,
    handCategory: HandCategory,
    multiplier: number,
    winAmount: number
  ): Promise<void> {
    const color = getHandTierColor(tier);
    
    // Update panel
    this.panel.clear();
    this.panel.beginFill(color, 0.9);
    this.panel.drawRoundedRect(-250, -200, 500, 400, 20);
    this.panel.endFill();
    this.panel.lineStyle(4, 0xFFFFFF, 0.5);
    this.panel.drawRoundedRect(-250, -200, 500, 400, 20);
    
    // Update labels
    this.tierLabel.text = getHandTierLabel(tier);
    this.tierLabel.style.fill = 0xFFFFFF;
    
    this.handLabel.text = formatHandCategory(handCategory);
    this.multiplierLabel.text = `x${multiplier.toFixed(multiplier >= 1 ? 1 : 2)}`;
    this.winAmountLabel.text = `$${formatCurrency(winAmount)}`;
    
    // Show modal
    this.visible = true;
    this.alpha = 0;
    
    // Fade in animation
    await this.fadeIn(300);
    
    // Scale pulse animation for jackpot
    if (tier === 'JACKPOT') {
      this.animatePulse();
    }
  }
  
  /**
   * Hide modal
   */
  async hide(): Promise<void> {
    await this.fadeOut(200);
    this.visible = false;
    
    if (this.onClose) {
      this.onClose();
    }
  }
  
  /**
   * Fade in animation
   */
  private fadeIn(duration: number): Promise<void> {
    return new Promise(resolve => {
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        this.alpha = progress;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }
  
  /**
   * Fade out animation
   */
  private fadeOut(duration: number): Promise<void> {
    return new Promise(resolve => {
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        this.alpha = 1 - progress;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }
  
  /**
   * Pulse animation for jackpot
   */
  private animatePulse(): void {
    const startTime = Date.now();
    const duration = 1000;
    
    const animate = () => {
      if (!this.visible) return;
      
      const elapsed = Date.now() - startTime;
      const progress = (elapsed % duration) / duration;
      
      const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.05;
      this.panel.scale.set(scale);
      
      requestAnimationFrame(animate);
    };
    
    animate();
  }
  
  /**
   * Set close handler
   */
  setCloseHandler(handler: () => void): void {
    this.onClose = handler;
  }
  
  /**
   * Resize modal
   */
  resize(width: number, height: number): void {
    // Resize overlay
    this.overlay.clear();
    this.overlay.beginFill(0x000000, 0.7);
    this.overlay.drawRect(0, 0, width, height);
    this.overlay.endFill();
    
    // Center modal
    const centerX = width / 2;
    const centerY = height / 2;
    
    this.panel.position.set(centerX, centerY);
    this.tierLabel.position.set(centerX, centerY - 120);
    this.handLabel.position.set(centerX, centerY - 60);
    this.multiplierLabel.position.set(centerX, centerY);
    this.winAmountLabel.position.set(centerX, centerY + 60);
    this.clickToContinueLabel.position.set(centerX, centerY + 150);
  }
}
