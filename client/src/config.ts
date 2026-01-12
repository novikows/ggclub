/**
 * Application Configuration
 * Reads from environment variables
 */

export type RgsMode = 'mock' | 'local' | 'stake';

export interface Config {
  // RGS Mode: mock (development) | local (math server) | stake (production)
  rgsMode: RgsMode;
  enableDebug: boolean;
  logRgsCalls: boolean;
  
  // Stake Engine (for production)
  stakeEngine: {
    gameId: string;
    teamId: string;
  };
}

// Parse environment variables
const config: Config = {
  // RGS Mode: mock | local | stake
  rgsMode: (import.meta.env.VITE_RGS_MODE || 'mock') as RgsMode,
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  logRgsCalls: import.meta.env.VITE_LOG_RGS_CALLS === 'true',
  
  stakeEngine: {
    gameId: import.meta.env.VITE_STAKE_ENGINE_GAME_ID || 'joker_poker',
    teamId: import.meta.env.VITE_STAKE_ENGINE_TEAM_ID || '',
  },
};

// Log config in debug mode
if (config.enableDebug) {
  console.log('[Config]', {
    rgsMode: config.rgsMode,
    gameId: config.stakeEngine.gameId,
    debug: config.enableDebug,
  });
}

export default config;
