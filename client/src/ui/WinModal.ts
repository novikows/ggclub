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
  private isShowing: boolean = false;
  
  constructor() {
    super();
    this.visible = false;
  }
  
  /**
   * Initialize modal
   */
  init(): void {
    // Darker overlay for better contrast
    this.overlay = new PIXI.Graphics();
    this.overlay.beginFill(0x000000, 0.85);
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
   * Show win modal with dark theme
   */
  async show(
    tier: HandTier,
    handCategory: HandCategory,
    multiplier: number,
    winAmount: number
  ): Promise<void> {
    // Prevent double show
    if (this.isShowing) {
      console.log('[WinModal] Already showing, ignoring duplicate show call');
      return;
    }
    
    this.isShowing = true;
    const color = getHandTierColor(tier);
    
    // Reset panel state
    this.panel.scale.set(1);
    this.panel.alpha = 1;
    
    // Update panel with very dark background
    this.panel.clear();
    
    // Very dark background (almost black)
    this.panel.beginFill(0x0A0A0A, 0.98);
    this.panel.drawRoundedRect(-250, -200, 500, 400, 20);
    this.panel.endFill();
    
    // Colored border based on tier
    this.panel.lineStyle(6, color, 0.9);
    this.panel.drawRoundedRect(-250, -200, 500, 400, 20);
    
    // Update labels
    this.tierLabel.text = getHandTierLabel(tier);
    this.tierLabel.style.fill = color; // Use tier color for tier label
    
    this.handLabel.text = formatHandCategory(handCategory);
    this.handLabel.style.fill = 0xFFFFFF; // White
    
    this.multiplierLabel.text = `x${multiplier.toFixed(multiplier >= 1 ? 1 : 2)}`;
    this.multiplierLabel.style.fill = color; // Use tier color
    
    this.winAmountLabel.text = `$${formatCurrency(winAmount)}`;
    this.winAmountLabel.style.fill = color; // Use tier color
    
    // Show modal
    this.visible = true;
    this.alpha = 0;
    
    // Set initial scale for slide-in animation
    this.panel.scale.set(0.5);
    this.panel.alpha = 0;
    
    // Fade in overlay
    await this.fadeIn(200);
    
    // Slide and scale in panel
    await this.slideInPanel();
    
    // Continuous pulse animation for jackpot and best wins
    if (tier === 'JACKPOT' || tier === 'BEST') {
      this.animatePulse();
      if (tier === 'JACKPOT') {
        this.animateSparkles();
      }
    }
  }
  
  /**
   * Slide in panel animation
   */
  private slideInPanel(): Promise<void> {
    return new Promise(resolve => {
      const startTime = Date.now();
      const duration = 400;
      
      // Store initial label positions
      const tierInitialY = this.tierLabel.y;
      const handInitialY = this.handLabel.y;
      const multiplierInitialY = this.multiplierLabel.y;
      const winAmountInitialY = this.winAmountLabel.y;
      const clickInitialY = this.clickToContinueLabel.y;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out back for bouncy effect
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        this.panel.scale.set(0.5 + eased * 0.5);
        this.panel.alpha = eased;
        
        // Slide all labels from their initial positions
        const labelOffset = (1 - eased) * 50;
        
        this.tierLabel.alpha = eased;
        this.tierLabel.y = tierInitialY + labelOffset;
        
        this.handLabel.alpha = eased;
        this.handLabel.y = handInitialY + labelOffset;
        
        this.multiplierLabel.alpha = eased;
        this.multiplierLabel.y = multiplierInitialY + labelOffset;
        
        this.winAmountLabel.alpha = eased;
        this.winAmountLabel.y = winAmountInitialY + labelOffset;
        
        this.clickToContinueLabel.alpha = eased;
        this.clickToContinueLabel.y = clickInitialY + labelOffset;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Reset to exact initial positions
          this.panel.scale.set(1);
          this.panel.alpha = 1;
          this.tierLabel.y = tierInitialY;
          this.handLabel.y = handInitialY;
          this.multiplierLabel.y = multiplierInitialY;
          this.winAmountLabel.y = winAmountInitialY;
          this.clickToContinueLabel.y = clickInitialY;
          resolve();
        }
      };
      
      animate();
    });
  }
  
  /**
   * Add golden sparkles for jackpot wins
   */
  private animateSparkles(): void {
    const goldColor = 0xFFD700;
    
    const createSparkle = () => {
      if (!this.visible) return;
      
      const sparkle = new PIXI.Graphics();
      sparkle.beginFill(goldColor);
      // Draw a simple diamond/rhombus shape as sparkle
      sparkle.moveTo(0, -6);
      sparkle.lineTo(4, 0);
      sparkle.lineTo(0, 6);
      sparkle.lineTo(-4, 0);
      sparkle.lineTo(0, -6);
      sparkle.endFill();
      
      // Get panel center position
      const panelCenterX = this.panel.x;
      const panelCenterY = this.panel.y;
      
      // Random position around panel
      const angle = Math.random() * Math.PI * 2;
      const startRadius = 280 + Math.random() * 40;
      const startX = panelCenterX + Math.cos(angle) * startRadius;
      const startY = panelCenterY + Math.sin(angle) * startRadius;
      
      sparkle.position.set(startX, startY);
      sparkle.alpha = 0;
      this.addChild(sparkle);
      
      // Animate sparkle
      const startTime = Date.now();
      const duration = 1200;
      
      const animate = () => {
        if (!this.visible || !this.children.includes(sparkle)) return;
        
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Fade in and out
        if (progress < 0.2) {
          sparkle.alpha = progress / 0.2;
        } else if (progress > 0.7) {
          sparkle.alpha = (1 - progress) / 0.3;
        } else {
          sparkle.alpha = 0.8;
        }
        
        // Move inward toward panel center
        const currentRadius = startRadius * (1 - progress * 0.6);
        sparkle.position.set(
          panelCenterX + Math.cos(angle) * currentRadius,
          panelCenterY + Math.sin(angle) * currentRadius
        );
        
        sparkle.rotation = progress * Math.PI * 3;
        sparkle.scale.set(0.8 + Math.sin(progress * Math.PI) * 0.4);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          if (this.children.includes(sparkle)) {
            this.removeChild(sparkle);
          }
        }
      };
      
      animate();
      
      // Create another sparkle
      if (this.visible) {
        setTimeout(createSparkle, 180);
      }
    };
    
    // Start creating sparkles
    for (let i = 0; i < 3; i++) {
      setTimeout(createSparkle, i * 120);
    }
  }
  
  /**
   * Hide modal
   */
  async hide(): Promise<void> {
    await this.fadeOut(200);
    this.visible = false;
    this.isShowing = false; // Reset flag
    
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
    // Resize overlay with darker tone
    this.overlay.clear();
    this.overlay.beginFill(0x000000, 0.85);
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
