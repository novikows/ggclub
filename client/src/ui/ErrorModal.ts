import { Container, Graphics, Text } from 'pixi.js';

/**
 * Error Modal
 * Displays error messages to the user
 */
export class ErrorModal extends Container {
  private background: Graphics;
  private panel: Graphics;
  private messageText: Text;
  private dismissText: Text;
  private isVisible: boolean = false;
  private autoHideTimer?: number;
  
  constructor() {
    super();
    
    // Semi-transparent background overlay
    this.background = new Graphics();
    this.background.beginFill(0x000000, 0.7);
    this.background.drawRect(-10000, -10000, 20000, 20000);
    this.background.endFill();
    this.background.interactive = true;
    this.background.on('pointerdown', () => {
      this.hide();
    });
    this.addChild(this.background);
    
    // Error panel
    this.panel = new Graphics();
    this.panel.beginFill(0x2A0A0A, 0.95); // Dark red
    this.panel.lineStyle(3, 0xFF4444); // Red border
    this.panel.drawRoundedRect(-400, -150, 800, 300, 10);
    this.panel.endFill();
    this.addChild(this.panel);
    
    // Error message text
    this.messageText = new Text('', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFFDDDD,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 750,
    });
    this.messageText.anchor.set(0.5);
    this.messageText.position.set(0, -30);
    this.addChild(this.messageText);
    
    // Dismiss instruction
    this.dismissText = new Text('Click anywhere to dismiss', {
      fontFamily: 'Arial',
      fontSize: 18,
      fill: 0xFF8888,
      align: 'center',
    });
    this.dismissText.anchor.set(0.5);
    this.dismissText.position.set(0, 80);
    this.addChild(this.dismissText);
    
    this.visible = false;
  }
  
  /**
   * Show error message
   */
  show(message: string, autoHideMs: number = 5000): void {
    this.messageText.text = message;
    this.visible = true;
    this.isVisible = true;
    
    // Clear existing auto-hide timer
    if (this.autoHideTimer) {
      window.clearTimeout(this.autoHideTimer);
    }
    
    // Auto-hide after specified time
    if (autoHideMs > 0) {
      this.autoHideTimer = window.setTimeout(() => {
        this.hide();
      }, autoHideMs);
    }
  }
  
  /**
   * Hide error modal
   */
  hide(): void {
    this.visible = false;
    this.isVisible = false;
    
    if (this.autoHideTimer) {
      window.clearTimeout(this.autoHideTimer);
      this.autoHideTimer = undefined;
    }
  }
  
  /**
   * Check if modal is visible
   */
  isShowing(): boolean {
    return this.isVisible;
  }
}
