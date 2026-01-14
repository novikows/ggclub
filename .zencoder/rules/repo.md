---
description: Repository Information Overview
alwaysApply: true
---

# Joker Poker Board Information

## Summary
Poker game frontend built with Svelte 5, SvelteKit, and Stake Engine integration. Features a 5-card poker board with flop → turn → river animations, joker transformation effects, and win celebration modals. Event-driven architecture with reactive state management using Svelte 5 runes.

## Structure
**Main Directories**:
- **src/lib/** - Core game logic, API clients, and reusable components
  - **api/** - Stake Engine RGS client and event processing
  - **game/** - Game state management and controller logic
  - **components/** - Svelte UI components (BoardView, CardSprite, ControlsView, WinModal)
  - **types/** - TypeScript type definitions
- **src/routes/** - SvelteKit routing (pages and layouts)
- **static/assets/** - Static assets (images, sounds, etc.)
- **docs/** - Project documentation and specifications

## Language & Runtime
**Language**: TypeScript  
**Version**: TypeScript 5.9.3  
**Framework**: Svelte 5.0.0 + SvelteKit 2.49.1  
**Build System**: Vite 6.0.0  
**Package Manager**: npm  
**Node Version**: Uses ES modules (type: "module")

## Dependencies
**Main Dependencies**:
- `svelte@^5.0.0` - Reactive framework with runes for state management
- `@sveltejs/kit@^2.49.1` - SvelteKit application framework
- `stake-engine@^0.1.32` - Official Stake Engine RGS client for game backend
- `pixi.js@^7.4.0` - 2D WebGL renderer (planned for future animation enhancements)
- `pixi-svelte@^2.0.0` - PixiJS integration with Svelte

**Development Dependencies**:
- `@sveltejs/adapter-static@^3.0.6` - Static site adapter for production builds
- `@sveltejs/vite-plugin-svelte@^5.0.0` - Vite plugin for Svelte
- `svelte-check@^4.3.4` - Type checking tool
- `@types/node@^20.11.0` - Node.js type definitions

## Build & Installation
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build (outputs to build/ directory)
npm run build

# Preview production build
npm run preview

# Type checking
npm run check

# Watch mode type checking
npm run check:watch

# TypeScript compilation check
npm run typecheck

# Lint code
npm run lint
```

## Main Files
**Entry Points**:
- `src/routes/+page.svelte` - Main game page
- `src/routes/+layout.svelte` - Root layout
- `src/app.html` - HTML template

**Core Logic**:
- `src/lib/game/gameState.svelte.ts` - Global reactive game state (Svelte 5 runes)
- `src/lib/game/GameController.svelte.ts` - Game flow orchestration
- `src/lib/game/EventProcessor.ts` - RGS event to animation conversion
- `src/lib/api/stakeRgsClient.ts` - Stake Engine RGS API integration

**Configuration**:
- `src/lib/config.ts` - RGS mode and debug settings
- `svelte.config.js` - SvelteKit configuration with static adapter
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript compiler options

## Architecture
**State Management**: Svelte 5 runes (`$state`, `$derived`, `$effect`) for reactive state  
**Game Flow**: GameController → EventProcessor → Components with reactive updates via gameState  
**Build Output**: Static site generated to `build/` directory for CDN deployment  
**RGS Integration**: Three modes configurable in `src/lib/config.ts`:
- `stake` - Production mode with real Stake Engine RGS
- `mock` - Development with mock data (planned)
- `local` - Development with local Python server (planned)
