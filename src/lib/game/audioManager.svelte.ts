export class AudioManager {
  private bgMusic: HTMLAudioElement | null = null;
  private soundEnabled = $state(true);
  private musicLoaded = $state(false);
  private soundEffects: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      this.initBackgroundMusic();
      this.initSoundEffects();
    }
  }

  private initBackgroundMusic() {
    try {
      this.bgMusic = new Audio('/assets/audio/background-music.webm');
      this.bgMusic.loop = true;
      this.bgMusic.volume = 0.3;
      
      this.bgMusic.addEventListener('canplaythrough', () => {
        this.musicLoaded = true;
        console.log('[AudioManager] Background music loaded');
      });

      this.bgMusic.addEventListener('error', (e) => {
        console.warn('[AudioManager] Failed to load background music, trying MP3 fallback');
        this.tryMP3Fallback();
      });
    } catch (error) {
      console.error('[AudioManager] Error initializing background music:', error);
    }
  }

  private tryMP3Fallback() {
    try {
      this.bgMusic = new Audio('/assets/audio/background-music.mp3');
      this.bgMusic.loop = true;
      this.bgMusic.volume = 0.3;
      this.bgMusic.addEventListener('canplaythrough', () => {
        this.musicLoaded = true;
        console.log('[AudioManager] Background music (MP3) loaded');
      });
    } catch (error) {
      console.warn('[AudioManager] MP3 fallback also failed, running without music');
    }
  }

  private initSoundEffects() {
    const effects = [
      'card-flip',
      'win-small',
      'win-big',
      'win-jackpot',
      'button-click'
    ];

    effects.forEach(effect => {
      try {
        const audio = new Audio(`/assets/audio/${effect}.webm`);
        audio.volume = 0.5;
        this.soundEffects.set(effect, audio);
      } catch (error) {
        console.warn(`[AudioManager] Failed to load sound effect: ${effect}`);
      }
    });
  }

  async play() {
    if (!this.soundEnabled || !this.bgMusic || !this.musicLoaded) {
      console.log('[AudioManager] Music not ready or sound disabled');
      return;
    }

    try {
      await this.bgMusic.play();
      console.log('[AudioManager] Background music playing');
    } catch (error) {
      console.warn('[AudioManager] Failed to play background music (autoplay blocked?):', error);
    }
  }

  pause() {
    if (this.bgMusic) {
      this.bgMusic.pause();
      console.log('[AudioManager] Background music paused');
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    
    if (this.soundEnabled) {
      this.play();
    } else {
      this.pause();
    }

    console.log('[AudioManager] Sound', this.soundEnabled ? 'enabled' : 'disabled');
    return this.soundEnabled;
  }

  playEffect(effectName: string) {
    if (!this.soundEnabled) return;

    const effect = this.soundEffects.get(effectName);
    if (effect) {
      effect.currentTime = 0;
      effect.play().catch(err => {
        console.warn(`[AudioManager] Failed to play effect ${effectName}:`, err);
      });
    }
  }

  setVolume(volume: number) {
    if (this.bgMusic) {
      this.bgMusic.volume = Math.max(0, Math.min(1, volume));
    }
  }

  isSoundEnabled() {
    return this.soundEnabled;
  }

  isMusicLoaded() {
    return this.musicLoaded;
  }
}

export const audioManager = new AudioManager();
