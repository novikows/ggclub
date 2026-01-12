/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RGS_MODE: string
  readonly VITE_ENABLE_DEBUG: string
  readonly VITE_LOG_RGS_CALLS: string
  readonly VITE_STAKE_ENGINE_GAME_ID: string
  readonly VITE_STAKE_ENGINE_TEAM_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
