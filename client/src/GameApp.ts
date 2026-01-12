import * as PIXI from 'pixi.js';
import { GameController } from './game/GameController';
import { GameStateManager } from './game/GameStateManager';
import { AnimationAction } from './game/EventProcessor';
import { BoardView } from './ui/BoardView';
import { ControlsView } from './ui/ControlsView';
import { WinModal } from './ui/WinModal';
import { ErrorModal } from './ui/ErrorModal';
import { getHandTier } from './utils/handEvaluator';
import { onBalanceUpdate, onRoundStateChange } from './api';
import config from './config';

/**
 * Main Game Application
 */
export class GameApp {
  private app: PIXI.Application;
  private gameController: GameController;
  private stateManager: GameStateManager;
  
  // UI Components
  private backgroundVideo: HTMLVideoElement | null = null;
  private backgroundAudio: HTMLAudioElement | null = null;
  private audioButton: PIXI.Container | null = null;
  private audioButtonIcon: PIXI.Text | null = null;
  private audioButtonStrike: PIXI.Graphics | null = null;
  private isAudioPlaying: boolean = true;
  private boardView: BoardView;
  private controlsView: ControlsView;
  private winModal: WinModal;
  private errorModal: ErrorModal;
  
  constructor() {
    // Create PixiJS application
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });
    
    // Add to DOM
    document.getElementById('app')?.appendChild(this.app.view as HTMLCanvasElement);
    
    // Initialize game controller
    this.stateManager = new GameStateManager();
    this.gameController = new GameController(this.stateManager);
    
    // Connect GameController to GameApp for error display
    this.gameController.setGameApp(this);
    
    // Create UI components
    this.boardView = new BoardView();
    this.controlsView = new ControlsView();
    this.winModal = new WinModal();
    this.errorModal = new ErrorModal();
    
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
      
      // Load background audio
      await this.loadBackgroundAudio();
      
      // Initialize UI
      await this.initUI();
      
      // Setup state listeners
      this.setupStateListeners();
      
      // Setup Stake Engine event listeners (only if using Stake Engine)
      if (config.rgsMode === 'stake') {
        this.setupStakeEngineListeners();
      }
      
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
   * Load background video
   */
  private async loadBackground(): Promise<void> {
    try {
      // Create video element
      this.backgroundVideo = document.createElement('video');
      this.backgroundVideo.src = '/assets/background_video.mp4';
      this.backgroundVideo.loop = true;
      this.backgroundVideo.muted = true;
      this.backgroundVideo.autoplay = true;
      this.backgroundVideo.playsInline = true;
      
      // Style video to cover entire background
      this.backgroundVideo.style.position = 'fixed';
      this.backgroundVideo.style.top = '0';
      this.backgroundVideo.style.left = '0';
      this.backgroundVideo.style.width = '100%';
      this.backgroundVideo.style.height = '100%';
      this.backgroundVideo.style.objectFit = 'cover';
      this.backgroundVideo.style.zIndex = '-1';
      
      // Add to DOM before canvas
      const app = document.getElementById('app');
      if (app) {
        app.insertBefore(this.backgroundVideo, app.firstChild);
      }
      
      // Start playing
      await this.backgroundVideo.play();
      
      console.log('[GameApp] Background video loaded successfully');
    } catch (error) {
      console.warn('[GameApp] Failed to load background video, using solid color:', error);
    }
  }

  /**
   * Load background audio
   */
  private async loadBackgroundAudio(): Promise<void> {
    try {
      // Create audio element
      this.backgroundAudio = document.createElement('audio');
      this.backgroundAudio.src = '/assets/background_audio.mp3';
      this.backgroundAudio.loop = true;
      this.backgroundAudio.volume = 0.3; // Set volume to 30%
      this.backgroundAudio.autoplay = true;
      
      // Add to DOM
      const app = document.getElementById('app');
      if (app) {
        app.appendChild(this.backgroundAudio);
      }
      
      // Start playing
      await this.backgroundAudio.play();
      this.isAudioPlaying = true;
      
      console.log('[GameApp] Background audio loaded successfully');
    } catch (error) {
      console.warn('[GameApp] Failed to load background audio:', error);
      this.isAudioPlaying = false;
      // Audio autoplay might be blocked by browser, user interaction needed
    }
  }

  /**
   * Create audio toggle button
   */
  private createAudioButton(): void {
    this.audioButton = new PIXI.Container();
    
    // Background circle
    const bg = new PIXI.Graphics();
    bg.beginFill(0x000000, 0.7);
    bg.drawCircle(0, 0, 30);
    bg.endFill();
    bg.lineStyle(2, 0xFFFFFF, 0.5);
    bg.drawCircle(0, 0, 30);
    this.audioButton.addChild(bg);
    
    // Icon text (🎵 note)
    this.audioButtonIcon = new PIXI.Text('🎵', {
      fontFamily: 'Arial',
      fontSize: 28,
      fill: 0xFFFFFF,
    });
    this.audioButtonIcon.anchor.set(0.5);
    this.audioButton.addChild(this.audioButtonIcon);
    
    // Strike-through line (shown when muted)
    this.audioButtonStrike = new PIXI.Graphics();
    this.audioButtonStrike.lineStyle(3, 0xFF0000, 1); // Red line
    this.audioButtonStrike.moveTo(-20, -20);
    this.audioButtonStrike.lineTo(20, 20);
    this.audioButtonStrike.visible = !this.isAudioPlaying;
    this.audioButton.addChild(this.audioButtonStrike);
    
    // Make interactive
    this.audioButton.eventMode = 'static';
    this.audioButton.cursor = 'pointer';
    
    // Add hover effect
    this.audioButton.on('pointerover', () => {
      bg.clear();
      bg.beginFill(0x333333, 0.9);
      bg.drawCircle(0, 0, 30);
      bg.endFill();
      bg.lineStyle(2, 0xFFFFFF, 0.8);
      bg.drawCircle(0, 0, 30);
    });
    
    this.audioButton.on('pointerout', () => {
      bg.clear();
      bg.beginFill(0x000000, 0.7);
      bg.drawCircle(0, 0, 30);
      bg.endFill();
      bg.lineStyle(2, 0xFFFFFF, 0.5);
      bg.drawCircle(0, 0, 30);
    });
    
    // Add click handler
    this.audioButton.on('pointerdown', () => this.toggleAudio());
    
    this.app.stage.addChild(this.audioButton);
  }

  /**
   * Toggle audio on/off
   */
  private toggleAudio(): void {
    if (!this.backgroundAudio) return;
    
    if (this.isAudioPlaying) {
      this.backgroundAudio.pause();
      this.isAudioPlaying = false;
      if (this.audioButtonStrike) {
        this.audioButtonStrike.visible = true; // Show strike-through
      }
      console.log('[GameApp] Audio paused');
    } else {
      this.backgroundAudio.play().then(() => {
        this.isAudioPlaying = true;
        if (this.audioButtonStrike) {
          this.audioButtonStrike.visible = false; // Hide strike-through
        }
        console.log('[GameApp] Audio playing');
      }).catch(error => {
        console.warn('[GameApp] Failed to play audio:', error);
      });
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
    
    // Initialize error modal (on top)
    this.app.stage.addChild(this.errorModal);
    
    // Create audio button
    this.createAudioButton();
    
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
   * Setup Stake Engine WebSocket event listeners
   * Only called when using real Stake Engine client
   */
  private setupStakeEngineListeners(): void {
    if (config.enableDebug) {
      console.log('[GameApp] Setting up Stake Engine listeners');
    }
    
    // Listen for balance updates from Stake Engine
    onBalanceUpdate((balance: number) => {
      if (config.enableDebug) {
        console.log('[GameApp] Balance update from Stake Engine:', balance);
      }
      
      // Update controls view
      this.controlsView.updateBalance(balance);
      
      // Update state manager
      this.stateManager.setBalance(balance);
    });
    
    // Listen for round state changes
    onRoundStateChange((state: string) => {
      if (config.enableDebug) {
        console.log('[GameApp] Round state change from Stake Engine:', state);
      }
      
      // Could use this for additional UI feedback
      // For now, just log it
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
   * Show error message to user
   */
  public showError(message: string): void {
    console.error('[GameApp] Showing error:', message);
    this.errorModal.show(message);
  }
  
  /**
   * Resize and layout UI
   */
  private resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Resize app
    this.app.renderer.resize(width, height);
    
    // Background video resizes automatically via CSS
    
    // Position audio button (top right corner)
    if (this.audioButton) {
      this.audioButton.position.set(width - 50, 50);
    }
    
    // Resize UI components
    this.boardView.resize(width, height);
    this.controlsView.resize(width, height);
    this.winModal.resize(width, height);
    
    // Position error modal in center
    this.errorModal.position.set(width / 2, height / 2);
  }
  
  /**
   * Utility delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
