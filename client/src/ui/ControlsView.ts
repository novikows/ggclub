import * as PIXI from 'pixi.js';
import { UIButton } from './UIButton';
import { formatCurrency } from '../utils/money';

/**
 * Controls View - bet controls, play button, balance display
 */
export class ControlsView extends PIXI.Container {
  private balanceText: PIXI.Text;
  private winText: PIXI.Text;
  private betText: PIXI.Text;
  private betAmountText: PIXI.Text;
  private decreaseBtn: UIButton;
  private increaseBtn: UIButton;
  private playBtn: UIButton;
  
  private onPlayClick?: () => void;
  private onBetIncrease?: () => void;
  private onBetDecrease?: () => void;
  
  constructor() {
    super();
  }
  
  /**
   * Initialize UI
   */
  init(): void {
    // Balance display (top left)
    this.balanceText = this.createText('Balance: $0.00', 16);
    this.balanceText.position.set(20, 20);
    this.addChild(this.balanceText);
    
    this.winText = this.createText('Win: $0.00', 16);
    this.winText.position.set(20, 45);
    this.winText.style.fill = 0xFFD700;
    this.addChild(this.winText);
    
    this.betText = this.createText('Bet: $0.00', 16);
    this.betText.position.set(20, 70);
    this.addChild(this.betText);
    
    // Bet controls (bottom center)
    const centerX = 400; // Will be repositioned on resize
    const bottomY = 500;
    
    // Decrease button
    this.decreaseBtn = new UIButton('-', 50, 50, 0x2196F3);
    this.decreaseBtn.position.set(centerX - 150, bottomY);
    this.decreaseBtn.setClickHandler(() => {
      if (this.onBetDecrease) this.onBetDecrease();
    });
    this.addChild(this.decreaseBtn);
    
    // Bet amount display
    this.betAmountText = this.createText('$1.00', 24, 'bold');
    this.betAmountText.anchor.set(0.5);
    this.betAmountText.position.set(centerX, bottomY + 25);
    this.addChild(this.betAmountText);
    
    // Increase button
    this.increaseBtn = new UIButton('+', 50, 50, 0x2196F3);
    this.increaseBtn.position.set(centerX + 100, bottomY);
    this.increaseBtn.setClickHandler(() => {
      if (this.onBetIncrease) this.onBetIncrease();
    });
    this.addChild(this.increaseBtn);
    
    // Play button
    this.playBtn = new UIButton('PLAY', 150, 70, 0x4CAF50);
    this.playBtn.position.set(centerX - 75, bottomY + 70);
    this.playBtn.setClickHandler(() => {
      if (this.onPlayClick) this.onPlayClick();
    });
    this.addChild(this.playBtn);
  }
  
  /**
   * Create text with default style
   */
  private createText(text: string, fontSize: number = 16, fontWeight: string = 'normal'): PIXI.Text {
    return new PIXI.Text(text, {
      fontFamily: 'Arial, sans-serif',
      fontSize,
      fontWeight,
      fill: 0xFFFFFF,
      stroke: 0x000000,
      strokeThickness: 2,
    });
  }
  
  /**
   * Update balance display
   */
  updateBalance(balance: number): void {
    this.balanceText.text = `Balance: $${formatCurrency(balance)}`;
  }
  
  /**
   * Update win display
   */
  updateWin(win: number): void {
    this.winText.text = `Win: $${formatCurrency(win)}`;
  }
  
  /**
   * Update bet display
   */
  updateBet(bet: number): void {
    this.betText.text = `Bet: $${formatCurrency(bet)}`;
    this.betAmountText.text = `$${formatCurrency(bet)}`;
  }
  
  /**
   * Set play button enabled state
   */
  setPlayEnabled(enabled: boolean): void {
    this.playBtn.setEnabled(enabled);
  }
  
  /**
   * Set bet controls enabled state
   */
  setBetControlsEnabled(enabled: boolean): void {
    this.decreaseBtn.setEnabled(enabled);
    this.increaseBtn.setEnabled(enabled);
  }
  
  /**
   * Set event handlers
   */
  setPlayHandler(handler: () => void): void {
    this.onPlayClick = handler;
  }
  
  setBetIncreaseHandler(handler: () => void): void {
    this.onBetIncrease = handler;
  }
  
  setBetDecreaseHandler(handler: () => void): void {
    this.onBetDecrease = handler;
  }
  
  /**
   * Resize and reposition controls
   */
  resize(width: number, height: number): void {
    // Keep balance/win/bet in top left
    // Position bet controls and play button at bottom center
    
    const centerX = width / 2;
    const bottomY = height - 150;
    
    this.decreaseBtn.position.set(centerX - 150, bottomY);
    this.betAmountText.position.set(centerX, bottomY + 25);
    this.increaseBtn.position.set(centerX + 100, bottomY);
    this.playBtn.position.set(centerX - 75, bottomY + 70);
  }
}
