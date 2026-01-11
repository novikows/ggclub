import * as PIXI from 'pixi.js';
import { GameController } from './game/GameController';
import { GameStateManager } from './game/GameStateManager';
import { AnimationAction } from './game/EventProcessor';
import { BoardView } from './ui/BoardView';
import { ControlsView } from './ui/ControlsView';
import { WinModal } from './ui/WinModal';
import { getHandTier } from './utils/handEvaluator';

/**
 * Main Game Application
 */
export class GameApp {
  private app: PIXI.Application;
  private gameController: GameController;
  private stateManager: GameStateManager;
  
  // UI Components
  private background: PIXI.Sprite | null = null;
  private boardView: BoardView;
  private controlsView: ControlsView;
  private winModal: WinModal;
  
  constructor() {
    // Create PixiJS application
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000000,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    
    // Add to DOM
    document.getElementById('app')?.appendChild(this.app.view as HTMLCanvasElement);
    
    // Initialize game controller
    this.stateManager = new GameStateManager();
    this.gameController = new GameController(this.stateManager);
    
    // Create UI components
    this.boardView = new BoardView();
    this.controlsView = new ControlsView();
    this.winModal = new WinModal();
    
    console.log('[GameApp] Created');
  }
  
  /**
   * Initialize and start the game
   */
  async start(): Promise<void> {
    console.log('[GameApp] Starting...');
    
    try {
      // Hide loading screen
      const loading = document.getElementById('loading');
      if (loading) {
        loading.style.display = 'none';
      }
      
      // Load background
      await this.loadBackground();
      
      // Initialize UI
      await this.initUI();
      
      // Setup state listeners
      this.setupStateListeners();
      
      // Set animation handler
      this.gameController.setAnimationHandler(this.handleAnimation.bind(this));
      
      // Initialize game (authenticate with RGS)
      await this.gameController.initialize();
      
      console.log('[GameApp] Started successfully');
      
    } catch (error) {
      console.error('[GameApp] Failed to start:', error);
      alert('Failed to initialize game. Please refresh the page.');
    }
  }
  
  /**
   * Load background image
   */
  private async loadBackground(): Promise<void> {
    try {
      const texture = await PIXI.Assets.load('/assets/background.png');
      this.background = new PIXI.Sprite(texture);
      
      // Scale to cover screen
      const scale = Math.max(
        this.app.screen.width / this.background.width,
        this.app.screen.height / this.background.height
      );
      this.background.scale.set(scale);
      
      // Center
      this.background.position.set(
        (this.app.screen.width - this.background.width * scale) / 2,
        (this.app.screen.height - this.background.height * scale) / 2
      );
      
      this.app.stage.addChild(this.background);
    } catch (error) {
      console.warn('[GameApp] Failed to load background, using solid color');
    }
  }
  
  /**
   * Initialize UI components
   */
  private async initUI(): Promise<void> {
    // Initialize board
    await this.boardView.init();
    this.app.stage.addChild(this.boardView);
    
    // Initialize controls
    this.controlsView.init();
    this.controlsView.setPlayHandler(() => this.onPlayClick());
    this.controlsView.setBetIncreaseHandler(() => this.onBetIncrease());
    this.controlsView.setBetDecreaseHandler(() => this.onBetDecrease());
    this.app.stage.addChild(this.controlsView);
    
    // Initialize win modal
    this.winModal.init();
    this.winModal.setCloseHandler(() => this.onWinModalClose());
    this.app.stage.addChild(this.winModal);
    
    // Layout
    this.resize();
    
    // Handle window resize
    window.addEventListener('resize', () => this.resize());
  }
  
  /**
   * Setup state change listeners
   */
  private setupStateListeners(): void {
    // Balance changes
    this.stateManager.onBalanceChange(balance => {
      this.controlsView.updateBalance(balance);
    });
    
    // Bet changes
    this.stateManager.onBetChange(bet => {
      this.controlsView.updateBet(bet);
    });
    
    // Win changes
    this.stateManager.onWinChange(win => {
      this.controlsView.updateWin(win);
    });
    
    // State changes
    this.stateManager.onStateChange(state => {
      console.log('[GameApp] State changed to:', state);
      
      // Update UI based on state
      const canPlay = state === 'IDLE';
      this.controlsView.setPlayEnabled(canPlay);
      this.controlsView.setBetControlsEnabled(canPlay);
    });
  }
  
  /**
   * Handle animation actions from game controller
   */
  private async handleAnimation(action: AnimationAction): Promise<void> {
    console.log('[GameApp] Handling animation:', action.type);
    
    switch (action.type) {
      case 'REVEAL_CARDS':
        await this.boardView.revealCards(action.payload.cards);
        break;
        
      case 'JOKER_TRANSFORM':
        await this.boardView.transformJokers(action.payload.transforms);
        break;
        
      case 'SHOW_WIN':
        await this.showWin(action.payload);
        break;
    }
  }
  
  /**
   * Show win modal
   */
  private async showWin(payload: any): Promise<void> {
    const { handCategory, payoutMultiplier, winningPositions } = payload;
    
    // Highlight winning cards with tier-based animation
    if (winningPositions.length > 0) {
      const tier = getHandTier(payoutMultiplier);
      const color = this.getHandTierColor(tier);
      this.boardView.highlightWinningCards(winningPositions, color, tier);
      
      // Wait for highlight
      await this.delay(500);
      
      // Show win modal
      const winAmount = Math.round(this.stateManager.getCurrentBet() * payoutMultiplier);
      await this.winModal.show(tier, handCategory, payoutMultiplier, winAmount);
    } else {
      // No win - just delay
      await this.delay(1000);
    }
  }
  
  /**
   * Get color for hand tier - dark theme
   */
  private getHandTierColor(tier: string): number {
    switch (tier) {
      case 'JACKPOT': return 0xFFD700; // Golden yellow
      case 'BEST': return 0xCC0000;    // Dark red
      case 'HIGH': return 0x8B0000;    // Darker red
      case 'MEDIUM': return 0xFFFFFF;  // White
      default: return 0xFFFFFF;        // White
    }
  }
  
  /**
   * Play button clicked
   */
  private onPlayClick(): void {
    console.log('[GameApp] Play clicked');
    this.boardView.reset();
    this.boardView.clearHighlights();
    this.gameController.play();
  }
  
  /**
   * Increase bet
   */
  private onBetIncrease(): void {
    console.log('[GameApp] Bet increase clicked');
    this.stateManager.increaseBet();
  }
  
  /**
   * Decrease bet
   */
  private onBetDecrease(): void {
    console.log('[GameApp] Bet decrease clicked');
    this.stateManager.decreaseBet();
  }
  
  /**
   * Win modal closed
   */
  private onWinModalClose(): void {
    console.log('[GameApp] Win modal closed');
    this.boardView.clearHighlights();
  }
  
  /**
   * Resize and layout UI
   */
  private resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Resize app
    this.app.renderer.resize(width, height);
    
    // Resize background
    if (this.background) {
      const scale = Math.max(
        width / this.background.texture.width,
        height / this.background.texture.height
      );
      this.background.scale.set(scale);
      this.background.position.set(
        (width - this.background.texture.width * scale) / 2,
        (height - this.background.texture.height * scale) / 2
      );
    }
    
    // Resize UI components
    this.boardView.resize(width, height);
    this.controlsView.resize(width, height);
    this.winModal.resize(width, height);
  }
  
  /**
   * Utility delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
