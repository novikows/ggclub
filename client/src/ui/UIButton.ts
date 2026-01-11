import * as PIXI from 'pixi.js';

/**
 * UI Button - reusable button component
 */
export class UIButton extends PIXI.Container {
  private bg: PIXI.Graphics;
  private label: PIXI.Text;
  private isPressed: boolean = false;
  private isEnabled: boolean = true;
  private onClick?: () => void;
  
  constructor(
    text: string,
    width: number = 120,
    height: number = 50,
    color: number = 0x4CAF50
  ) {
    super();
    
    this.eventMode = 'static';
    this.cursor = 'pointer';
    
    // Background
    this.bg = new PIXI.Graphics();
    this.drawButton(color, width, height);
    this.addChild(this.bg);
    
    // Label
    this.label = new PIXI.Text(text, {
      fontFamily: 'Arial, sans-serif',
      fontSize: 18,
      fontWeight: 'bold',
      fill: 0xFFFFFF,
    });
    this.label.anchor.set(0.5);
    this.label.position.set(width / 2, height / 2);
    this.addChild(this.label);
    
    // Events
    this.on('pointerdown', this.onPointerDown.bind(this));
    this.on('pointerup', this.onPointerUp.bind(this));
    this.on('pointerupoutside', this.onPointerUp.bind(this));
    this.on('pointerover', this.onPointerOver.bind(this));
    this.on('pointerout', this.onPointerOut.bind(this));
  }
  
  private drawButton(color: number, width: number, height: number): void {
    this.bg.clear();
    this.bg.beginFill(color);
    this.bg.drawRoundedRect(0, 0, width, height, 10);
    this.bg.endFill();
    
    // Border
    this.bg.lineStyle(2, 0xFFFFFF, 0.3);
    this.bg.drawRoundedRect(0, 0, width, height, 10);
  }
  
  private onPointerDown(): void {
    if (!this.isEnabled) return;
    this.isPressed = true;
    this.scale.set(0.95);
  }
  
  private onPointerUp(): void {
    if (!this.isEnabled) return;
    if (this.isPressed) {
      this.isPressed = false;
      this.scale.set(1);
      if (this.onClick) {
        this.onClick();
      }
    }
  }
  
  private onPointerOver(): void {
    if (!this.isEnabled) return;
    this.alpha = 0.9;
  }
  
  private onPointerOut(): void {
    if (!this.isEnabled) return;
    this.alpha = 1;
    this.scale.set(1);
    this.isPressed = false;
  }
  
  setClickHandler(handler: () => void): void {
    this.onClick = handler;
  }
  
  setText(text: string): void {
    this.label.text = text;
  }
  
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.alpha = enabled ? 1 : 0.5;
    this.cursor = enabled ? 'pointer' : 'default';
  }
}
