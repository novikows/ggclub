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
  private sparkles: PIXI.Graphics[] = []; // Track sparkle particles for cleanup
  
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
   * Clear all sparkle particles
   */
  private clearSparkles(): void {
    // Remove all sparkles from the display
    for (const sparkle of this.sparkles) {
      if (this.children.includes(sparkle)) {
        this.removeChild(sparkle);
      }
    }
    // Clear the array
    this.sparkles = [];
  }
  
  /**
   * Show win modal with dark theme and smooth animation
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
    
    // Clear any leftover sparkles from previous show
    this.clearSparkles();
    
    this.isShowing = true;
    const color = getHandTierColor(tier);
    
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
    this.tierLabel.style.fill = color;
    
    this.handLabel.text = formatHandCategory(handCategory);
    this.handLabel.style.fill = 0xFFFFFF;
    
    this.multiplierLabel.text = `x${multiplier.toFixed(multiplier >= 1 ? 1 : 2)}`;
    this.multiplierLabel.style.fill = color;
    
    this.winAmountLabel.text = `$${formatCurrency(winAmount)}`;
    this.winAmountLabel.style.fill = color;
    
    // Set initial state - everything invisible
    this.visible = true;
    this.alpha = 0;
    
    // Set initial animation state for all elements
    this.panel.scale.set(0.7);
    this.panel.alpha = 0;
    this.tierLabel.alpha = 0;
    this.handLabel.alpha = 0;
    this.multiplierLabel.alpha = 0;
    this.winAmountLabel.alpha = 0;
    this.clickToContinueLabel.alpha = 0;
    
    // Smooth fade in with scale
    await this.animateModalIn();
    
    // Continuous pulse animation for jackpot and best wins
    if (tier === 'JACKPOT' || tier === 'BEST') {
      this.animatePulse();
    }
    
    // Sparkles animation for wins greater than x1
    if (multiplier > 1) {
      this.animateSparkles();
    }
  }
  
  /**
   * Smooth modal appearance animation
   */
  private animateModalIn(): Promise<void> {
    return new Promise(resolve => {
      const startTime = Date.now();
      const duration = 500;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        
        // Fade in overlay
        this.alpha = eased;
        
        // Scale and fade panel
        this.panel.scale.set(0.7 + eased * 0.3);
        this.panel.alpha = eased;
        
        // Fade in all labels with slight delay
        const labelDelay = 0.2;
        const labelProgress = Math.max(0, (progress - labelDelay) / (1 - labelDelay));
        
        this.tierLabel.alpha = labelProgress;
        this.handLabel.alpha = labelProgress;
        this.multiplierLabel.alpha = labelProgress;
        this.winAmountLabel.alpha = labelProgress;
        this.clickToContinueLabel.alpha = labelProgress;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Ensure final state
          this.alpha = 1;
          this.panel.scale.set(1);
          this.panel.alpha = 1;
          this.tierLabel.alpha = 1;
          this.handLabel.alpha = 1;
          this.multiplierLabel.alpha = 1;
          this.winAmountLabel.alpha = 1;
          this.clickToContinueLabel.alpha = 1;
          resolve();
        }
      };
      
      animate();
    });
  }
  
  /**
   * Add golden sparkles animation
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
      
      // Track sparkle for cleanup
      this.sparkles.push(sparkle);
      
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
            // Remove from tracking array
            const index = this.sparkles.indexOf(sparkle);
            if (index > -1) {
              this.sparkles.splice(index, 1);
            }
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
   * Hide modal with smooth animation
   */
  async hide(): Promise<void> {
    // Clean up all sparkle particles
    this.clearSparkles();
    
    await this.animateModalOut();
    this.visible = false;
    this.isShowing = false; // Reset flag
    
    if (this.onClose) {
      this.onClose();
    }
  }
  
  /**
   * Smooth modal disappearance animation
   */
  private animateModalOut(): Promise<void> {
    return new Promise(resolve => {
      const startTime = Date.now();
      const duration = 300;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Smooth ease in cubic
        const eased = progress * progress * progress;
        
        // Fade out and scale down
        this.alpha = 1 - eased;
        this.panel.scale.set(1 - eased * 0.2);
        
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
   * Pulse animation for jackpot - starts after main animation
   */
  private animatePulse(): void {
    // Wait a bit for main animation to complete
    setTimeout(() => {
      const startTime = Date.now();
      const duration = 1500;
      
      const animate = () => {
        if (!this.visible || !this.isShowing) return;
        
        const elapsed = Date.now() - startTime;
        const progress = (elapsed % duration) / duration;
        
        // Subtle pulse
        const scale = 1 + Math.sin(progress * Math.PI * 2) * 0.03;
        this.panel.scale.set(scale);
        
        requestAnimationFrame(animate);
      };
      
      animate();
    }, 500); // Start after main animation
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
