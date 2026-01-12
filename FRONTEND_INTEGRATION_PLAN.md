# 🎨 Frontend Integration Plan - Detailed Roadmap

**Project:** Joker Poker Board  
**Task:** Replace Mock RGS with Real Stake Engine Client  
**Timeline:** 7 days (Week 2)  
**Date:** 2026-01-11

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Current State Analysis](#current-state-analysis)
3. [Stake Engine Client Architecture](#stake-engine-client-architecture)
4. [Day-by-Day Plan](#day-by-day-plan)
5. [File Changes Reference](#file-changes-reference)
6. [Testing Strategy](#testing-strategy)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### Goal
Replace `mockRgsClient.ts` with official Stake Engine TypeScript client while maintaining all existing functionality.

### Success Criteria
- [ ] Stake Engine client integrated
- [ ] Mock client fully replaced
- [ ] All game features working with real RGS
- [ ] Balance updates in real-time
- [ ] 50+ test rounds completed successfully
- [ ] No console errors
- [ ] Production-ready code

### What Changes vs What Stays

**✅ Stays the same:**
- All UI components (`BoardView`, `CardSprite`, `WinModal`, etc.)
- Game logic (`EventProcessor`, `GameStateManager`)
- Animation system
- Type definitions
- Visual design

**🔄 Changes:**
- `mockRgsClient.ts` → `stakeRgsClient.ts` (new implementation)
- `GameController.ts` (import changes, error handling)
- `GameApp.ts` (event listeners)
- `ControlsView.ts` (balance display updates)
- `package.json` (add stake-engine dependency)
- `vite.config.ts` (environment config)

---

## 📁 Current State Analysis

### Project Structure

```
client/
├── src/
│   ├── api/                          # RGS Communication Layer
│   │   ├── mockRgsClient.ts          # ❌ TO REPLACE
│   │   └── mockData.ts               # ✅ KEEP (for testing)
│   │
│   ├── game/                         # Core Game Logic
│   │   ├── GameController.ts         # 🔄 UPDATE (imports, error handling)
│   │   ├── EventProcessor.ts         # ✅ NO CHANGES
│   │   └── GameStateManager.ts       # ✅ NO CHANGES
│   │
│   ├── ui/                           # PixiJS UI Components
│   │   ├── BoardView.ts              # ✅ NO CHANGES
│   │   ├── CardSprite.ts             # ✅ NO CHANGES
│   │   ├── ControlsView.ts           # 🔄 UPDATE (balance display)
│   │   ├── UIButton.ts               # ✅ NO CHANGES
│   │   └── WinModal.ts               # ✅ NO CHANGES
│   │
│   ├── utils/                        # Helper Functions
│   │   ├── handEvaluator.ts          # ✅ NO CHANGES
│   │   └── money.ts                  # ✅ NO CHANGES
│   │
│   ├── types/
│   │   └── index.ts                  # ✅ NO CHANGES (already compatible!)
│   │
│   ├── GameApp.ts                    # 🔄 UPDATE (event listeners)
│   └── main.ts                       # ✅ NO CHANGES
│
├── public/                           # Static Assets
│   └── assets/                       # ✅ NO CHANGES
│       ├── cards/
│       └── background.png
│
├── package.json                      # 🔄 UPDATE (add stake-engine)
├── vite.config.ts                    # 🔄 UPDATE (env vars)
└── tsconfig.json                     # ✅ NO CHANGES
```

### Key Files Analysis

#### 1. **mockRgsClient.ts** (Current Mock Implementation)
- **Lines:** ~170
- **Purpose:** Simulates Stake Engine API
- **Features:**
  - `authenticate()` - returns balance, config, session
  - `play()` - returns events from 15 scenarios
  - `endRound()` - acknowledges round end
  - `getBalance()` - returns current balance
- **Status:** ❌ Will be replaced by `stakeRgsClient.ts`

#### 2. **GameController.ts** (Core Game Loop)
- **Lines:** ~190
- **Purpose:** Orchestrates game flow
- **Key methods:**
  - `initialize()` - authenticates with RGS (line 30-67)
  - `play()` - starts round, calls RGS (line 72-121)
  - `executeAnimationQueue()` - processes events (line 126+)
- **Changes needed:**
  - Line 3: Replace `mockRgsClient` import
  - Line 44: Replace `mockRgsClient.authenticate()`
  - Line 92: Replace `mockRgsClient.play()`
  - Add error handling for Stake Engine errors

#### 3. **types/index.ts** (TypeScript Types)
- **Lines:** ~214
- **Purpose:** Type definitions for game
- **Key types:**
  - `GameEvent` - already matches Stake Engine format!
  - `AuthenticateRequest/Response`
  - `PlayRequest/Response`
  - `EndRoundRequest/Response`
- **Status:** ✅ NO CHANGES NEEDED (already compatible)

#### 4. **GameApp.ts** (Application Entry)
- **Lines:** ~120
- **Purpose:** Initializes game, manages PixiJS
- **Changes needed:**
  - Add Stake Engine event listeners
  - Handle balance updates
  - Handle round state changes

#### 5. **ControlsView.ts** (UI Controls)
- **Lines:** ~300+
- **Purpose:** Bet controls, Play button, balance display
- **Changes needed:**
  - Add `updateBalance()` method
  - Subscribe to balance updates from Stake Engine

---

## 🏗️ Stake Engine Client Architecture

### How Stake Engine Works

```
┌─────────────────────────────────────────────────────────────┐
│  YOUR FRONTEND (PixiJS)                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  1. Load game with ?rgs_url=xxx&sessionID=yyy          │ │
│  │     URL params automatically passed by Stake Engine     │ │
│  └────────────────┬───────────────────────────────────────┘ │
│                   │                                          │
│                   ▼                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  2. Initialize RGSClient(window.location.href)         │ │
│  │     - Reads rgs_url from query params                  │ │
│  │     - Reads sessionID from query params                │ │
│  └────────────────┬───────────────────────────────────────┘ │
│                   │                                          │
│                   ▼                                          │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  3. Call rgsClient.Authenticate()                      │ │
│  │     → Returns balance, config, session                 │ │
│  └────────────────┬───────────────────────────────────────┘ │
│                   │                                          │
└───────────────────┼──────────────────────────────────────────┘
                    │ HTTP/WebSocket
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  STAKE ENGINE RGS SERVER                                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  4. Validates session, returns game config             │ │
│  └────────────────┬───────────────────────────────────────┘ │
└───────────────────┼──────────────────────────────────────────┘
                    │
┌───────────────────┼──────────────────────────────────────────┐
│  YOUR FRONTEND    │                                          │
│  ┌────────────────▼───────────────────────────────────────┐ │
│  │  5. Player clicks PLAY                                 │ │
│  │     → Call rgsClient.Play({ amount: bet })             │ │
│  └────────────────┬───────────────────────────────────────┘ │
└───────────────────┼──────────────────────────────────────────┘
                    │
┌───────────────────┼──────────────────────────────────────────┐
│  STAKE ENGINE     │                                          │
│  ┌────────────────▼───────────────────────────────────────┐ │
│  │  6. Pick random outcome from 10M pre-generated         │ │
│  │     → Return { balance, round: { id, events } }        │ │
│  └────────────────┬───────────────────────────────────────┘ │
└───────────────────┼──────────────────────────────────────────┘
                    │
┌───────────────────┼──────────────────────────────────────────┐
│  YOUR FRONTEND    │                                          │
│  ┌────────────────▼───────────────────────────────────────┐ │
│  │  7. Process events (same format as mock!)              │ │
│  │     → Animate cards                                    │ │
│  │     → Show win modal                                   │ │
│  │     → Call rgsClient.EndRound()                        │ │
│  └────────────────┬───────────────────────────────────────┘ │
└───────────────────┼──────────────────────────────────────────┘
                    │
┌───────────────────▼──────────────────────────────────────────┐
│  8. Balance updates automatically via WebSocket events       │
│     rgsClient.on('balanceUpdate', cb)                        │
└──────────────────────────────────────────────────────────────┘
```

### Event Format (Already Compatible!)

**Your current mock format:**
```typescript
{
  round: {
    id: "round-123",
    events: [
      { index: 0, type: "reveal_initial_board", board: [...] },
      { index: 1, type: "joker_transform", jokerTransforms: [...] },
      { index: 2, type: "hand_result", handCategory: "PAIR", ... }
    ]
  }
}
```

**Stake Engine format:**
```typescript
{
  round: {
    id: "abc123",
    events: [
      { index: 0, type: "reveal_initial_board", board: [...] },
      { index: 1, type: "joker_transform", jokerTransforms: [...] },
      { index: 2, type: "hand_result", handCategory: "PAIR", ... }
    ]
  }
}
```

**✅ Same format! No event processing changes needed!**

---

## 📅 Day-by-Day Plan

---

## **DAY 1: Setup & Configuration (3-4 hours)**

### Morning (2 hours): Install & Configure

#### ✅ Task 1.1: Install Stake Engine Package (15 min)

```bash
cd ~/Projects/_casik/pokerspin/client

# Search for official package name
npm search stake-engine
npm search @stake-engine

# Install (check actual package name from Stake Engine docs)
npm install stake-engine

# Or if scoped:
npm install @stake-engine/client
# Or:
npm install @stakeengine/rgs-client

# Verify installation
npm list | grep stake
```

**Expected package.json update:**
```json
{
  "dependencies": {
    "pixi.js": "^7.4.0",
    "stake-engine": "^1.0.0"  // Or actual version
  }
}
```

**If package doesn't exist:**
- Check Stake Engine documentation for actual package name
- Contact Stake Engine support
- Alternative: Use their CDN with `<script>` tag

**Success criteria:**
- [ ] Package installed
- [ ] No dependency conflicts
- [ ] TypeScript types available (check `node_modules/stake-engine/index.d.ts`)

**Files changed:**
- `package.json`
- `package-lock.json`

---

#### ✅ Task 1.2: Create Environment Configuration (30 min)

**1. Create `.env.local` file:**

```bash
# In client/ directory
touch .env.local

# Add to .gitignore if not already
echo ".env.local" >> .gitignore
```

**Content of `.env.local`:**
```bash
# Stake Engine Configuration
# These will be overridden by URL params in production

# Development mode - use mock or real RGS
VITE_USE_MOCK_RGS=true

# Stake Engine credentials (for development)
VITE_STAKE_ENGINE_GAME_ID=joker_poker
VITE_STAKE_ENGINE_TEAM_ID=your-team-id-here

# Debug mode
VITE_ENABLE_DEBUG=true
VITE_LOG_RGS_CALLS=true
```

**2. Create `src/config.ts`:**

```typescript
/**
 * Application Configuration
 * Reads from environment variables
 */

export interface Config {
  // Feature flags
  useMockRgs: boolean;
  enableDebug: boolean;
  logRgsCalls: boolean;
  
  // Stake Engine
  stakeEngine: {
    gameId: string;
    teamId: string;
  };
}

// Parse environment variables
const config: Config = {
  useMockRgs: import.meta.env.VITE_USE_MOCK_RGS === 'true',
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
    useMockRgs: config.useMockRgs,
    gameId: config.stakeEngine.gameId,
    debug: config.enableDebug,
  });
}

export default config;
```

**3. Update `vite.config.ts`:**

```typescript
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  // Make sure env variables are exposed
  envPrefix: 'VITE_',
});
```

**Success criteria:**
- [ ] `.env.local` created and in `.gitignore`
- [ ] `config.ts` created
- [ ] Can toggle mock/real RGS via env var
- [ ] TypeScript compiles: `npm run typecheck`

**Files changed:**
- `.env.local` (new)
- `src/config.ts` (new)
- `.gitignore` (updated)
- `vite.config.ts` (updated)

---

#### ✅ Task 1.3: Study Stake Engine Client API (1 hour)

**Read official documentation:**

```bash
# Check installed package docs
cat node_modules/stake-engine/README.md | less

# Check TypeScript types
cat node_modules/stake-engine/index.d.ts | less

# Or check online
open https://stake-engine.com/docs/client
```

**Document key findings in `docs/stake-engine-api-notes.md`:**

```markdown
# Stake Engine Client API - Key Notes

## Installation
- Package: stake-engine (or @stake-engine/client)
- Version: X.X.X
- TypeScript: ✅ Included

## Initialization
```typescript
import { RGSClient } from 'stake-engine';

const client = RGSClient({
  url: window.location.href  // Reads rgs_url & sessionID from query params
});
```

## API Methods

### Authenticate()
- Returns: { balance, config, sessionID }
- No parameters needed (reads from URL)

### Play({ amount, mode })
- Returns: { balance, round: { id, events } }
- Deducts bet automatically

### EndRound()
- Acknowledges round completion
- Returns: { balance }

### GetBalance()
- Returns current balance
- Returns: { balance }

## Events (WebSocket)

### balanceUpdate
```typescript
client.on('balanceUpdate', (event) => {
  console.log('New balance:', event.balance);
});
```

### roundStateChange
```typescript
client.on('roundStateChange', (event) => {
  console.log('Round state:', event.state);
});
```

## Helpers

### DisplayAmount(amount, options)
Formats currency with proper decimals and symbol
```

**Success criteria:**
- [ ] API methods documented
- [ ] Event structure understood
- [ ] Error codes documented
- [ ] Ready to implement wrapper

**Files changed:**
- `docs/stake-engine-api-notes.md` (new)

---

### Afternoon (1-2 hours): Review & Test Setup

#### ✅ Task 1.4: Test Current Mock Still Works (30 min)

```bash
# Test with mock (default)
VITE_USE_MOCK_RGS=true npm run dev

# Should open http://localhost:3000
# Play a few rounds
# Verify everything still works
```

**Test checklist:**
- [ ] Game loads
- [ ] Can authenticate
- [ ] Can place bet
- [ ] Round plays successfully
- [ ] Cards animate
- [ ] Win modal shows
- [ ] Balance updates
- [ ] No console errors

**Success criteria:**
- [ ] Mock still works perfectly
- [ ] No regressions
- [ ] Ready to start integration

---

#### ✅ Task 1.5: Create Integration Checklist (30 min)

Create `client/INTEGRATION_CHECKLIST.md`:

```markdown
# Stake Engine Integration Checklist

## Day 1: Setup ✅
- [x] stake-engine package installed
- [x] Environment config created
- [x] Config system implemented
- [x] API documentation reviewed
- [x] Mock still works

## Day 2: RGS Client Wrapper
- [ ] stakeRgsClient.ts created
- [ ] authenticate() implemented
- [ ] play() implemented
- [ ] endRound() implemented
- [ ] getBalance() implemented
- [ ] Error handling added
- [ ] Logging added

## Day 3: Update GameController
- [ ] Import replaced
- [ ] initialize() updated
- [ ] play() updated
- [ ] Error handling updated
- [ ] Compiles without errors

## Day 4: Update UI Components
- [ ] GameApp.ts event listeners
- [ ] ControlsView balance updates
- [ ] Error messages in UI

## Day 5-6: Testing
- [ ] Manual testing (50+ rounds)
- [ ] All hand types verified
- [ ] Joker scenarios tested
- [ ] Error scenarios tested
- [ ] Performance tested

## Day 7: Polish & Deploy
- [ ] Debug logs cleaned
- [ ] Production build tested
- [ ] Documentation updated
- [ ] Ready for staging
```

**Success criteria:**
- [ ] Checklist created
- [ ] Ready for Day 2

---

## **DAY 2: Create RGS Client Wrapper (4-5 hours)**

### Morning (3 hours): Implement stakeRgsClient.ts

#### ✅ Task 2.1: Create Base Client Structure (1 hour)

Create `src/api/stakeRgsClient.ts`:

```typescript
/**
 * Stake Engine RGS Client Wrapper
 * 
 * Wraps official Stake Engine client with our application types.
 * Provides clean interface matching mockRgsClient.ts for easy swap.
 */

import { RGSClient } from 'stake-engine'; // or actual package name
import config from '../config';
import type {
  AuthenticateRequest,
  AuthenticateResponse,
  PlayRequest,
  PlayResponse,
  EndRoundRequest,
  EndRoundResponse,
  BalanceResponse,
} from '../types';

// ============================================================================
// CLIENT INITIALIZATION
// ============================================================================

let rgsClient: any = null; // Will be initialized on first use

/**
 * Initialize RGS client
 * Called automatically on first API call
 */
function initializeClient() {
  if (rgsClient) return rgsClient;
  
  if (config.logRgsCalls) {
    console.log('[StakeRGS] Initializing client...');
    console.log('[StakeRGS] URL:', window.location.href);
  }
  
  // Initialize with current URL (reads rgs_url & sessionID from query params)
  rgsClient = RGSClient({
    url: window.location.href,
  });
  
  if (config.logRgsCalls) {
    console.log('[StakeRGS] Client initialized');
  }
  
  return rgsClient;
}

/**
 * Get client instance (lazy initialization)
 */
function getClient() {
  if (!rgsClient) {
    initializeClient();
  }
  return rgsClient;
}

// ============================================================================
// API METHODS
// ============================================================================

/**
 * POST /wallet/authenticate
 * 
 * Authenticates player session and gets initial game config.
 * No parameters needed - Stake Engine reads from URL query params.
 */
export async function authenticate(
  request: AuthenticateRequest
): Promise<AuthenticateResponse> {
  const client = getClient();
  
  try {
    if (config.logRgsCalls) {
      console.log('[StakeRGS] authenticate() called');
      console.log('[StakeRGS] Request:', request);
    }
    
    // Call Stake Engine
    const response = await client.Authenticate();
    
    if (config.logRgsCalls) {
      console.log('[StakeRGS] authenticate() response:', response);
    }
    
    // Map Stake Engine response to our types
    return {
      balance: response.balance.amount,
      config: {
        minBet: response.config.minBet,
        maxBet: response.config.maxBet,
        stepBet: response.config.stepBet,
        betLevels: response.config.betLevels,
        currency: response.balance.currency,
      },
      sessionID: response.sessionID,
    };
  } catch (error) {
    console.error('[StakeRGS] authenticate() failed:', error);
    throw new Error('ERR_AUTH: Authentication failed');
  }
}

/**
 * POST /wallet/play
 * 
 * Starts a new game round with specified bet amount.
 * Returns game events for animation.
 */
export async function play(
  request: PlayRequest
): Promise<PlayResponse> {
  const client = getClient();
  
  try {
    if (config.logRgsCalls) {
      console.log('[StakeRGS] play() called');
      console.log('[StakeRGS] Request:', request);
    }
    
    // Validate session (Stake Engine does this, but good to check)
    if (request.sessionID !== getCurrentSessionID()) {
      throw new Error('ERR_IS: Invalid session');
    }
    
    // Call Stake Engine
    const response = await client.Play({
      amount: request.amount,
      mode: request.mode || 'BASE',
    });
    
    if (config.logRgsCalls) {
      console.log('[StakeRGS] play() response:', response);
      console.log('[StakeRGS] Events:', response.round.events);
    }
    
    // Map to our types
    return {
      balance: response.balance.amount,
      round: {
        id: response.round.id,
        events: response.round.events, // Already in correct format!
      },
    };
  } catch (error: any) {
    console.error('[StakeRGS] play() failed:', error);
    
    // Handle specific Stake Engine error codes
    if (error.code === 'ERR_IPB') {
      throw new Error('ERR_IPB: Insufficient balance');
    }
    if (error.code === 'ERR_IS') {
      throw new Error('ERR_IS: Invalid session');
    }
    
    throw error;
  }
}

/**
 * POST /wallet/end-round
 * 
 * Acknowledges round completion.
 * Called after animations finish.
 */
export async function endRound(
  request: EndRoundRequest
): Promise<EndRoundResponse> {
  const client = getClient();
  
  try {
    if (config.logRgsCalls) {
      console.log('[StakeRGS] endRound() called');
    }
    
    const response = await client.EndRound();
    
    if (config.logRgsCalls) {
      console.log('[StakeRGS] endRound() response:', response);
    }
    
    return {
      balance: response.balance.amount,
    };
  } catch (error) {
    console.error('[StakeRGS] endRound() failed:', error);
    // Don't throw - endRound is not critical
    return { balance: 0 };
  }
}

/**
 * GET /wallet/balance
 * 
 * Gets current player balance.
 */
export async function getBalance(): Promise<BalanceResponse> {
  const client = getClient();
  
  try {
    const response = await client.GetBalance();
    
    return {
      balance: response.balance.amount,
    };
  } catch (error) {
    console.error('[StakeRGS] getBalance() failed:', error);
    throw error;
  }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Subscribe to balance updates
 * Stake Engine sends balance updates via WebSocket
 */
export function onBalanceUpdate(callback: (balance: number) => void): void {
  const client = getClient();
  
  if (client.on) {
    client.on('balanceUpdate', (event: any) => {
      if (config.logRgsCalls) {
        console.log('[StakeRGS] Balance update:', event.balance);
      }
      callback(event.balance.amount);
    });
  }
}

/**
 * Subscribe to round state changes
 */
export function onRoundStateChange(callback: (state: string) => void): void {
  const client = getClient();
  
  if (client.on) {
    client.on('roundStateChange', (event: any) => {
      if (config.logRgsCalls) {
        console.log('[StakeRGS] Round state:', event.state);
      }
      callback(event.state);
    });
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Display amount with currency formatting
 * Uses Stake Engine's DisplayAmount helper
 */
export function displayAmount(
  amount: number,
  options?: {
    removeSymbol?: boolean;
    decimals?: number;
    wholeNumberDecimals?: boolean;
  }
): string {
  const client = getClient();
  
  if (client.DisplayAmount) {
    return client.DisplayAmount(amount, {
      removeSymbol: options?.removeSymbol ?? false,
      decimals: options?.decimals ?? 2,
      wholeNumberDecimals: options?.wholeNumberDecimals ?? true,
    });
  }
  
  // Fallback if DisplayAmount not available
  return `$${(amount / 1000000).toFixed(2)}`;
}

/**
 * Get current session ID from URL params
 */
function getCurrentSessionID(): string {
  const params = new URLSearchParams(window.location.search);
  return params.get('sessionID') || '';
}

/**
 * Disconnect from Stake Engine
 * Called on page unload
 */
export async function disconnect(): Promise<void> {
  if (rgsClient && rgsClient.disconnect) {
    await rgsClient.disconnect();
    rgsClient = null;
  }
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    disconnect();
  });
}
```

**Success criteria:**
- [ ] File created
- [ ] All methods implemented
- [ ] Error handling added
- [ ] Logging added
- [ ] TypeScript compiles: `npm run typecheck`

**Files changed:**
- `src/api/stakeRgsClient.ts` (new, ~250 lines)

---

#### ✅ Task 2.2: Add Error Handling & Types (1 hour)

Extend `stakeRgsClient.ts` with comprehensive error handling:

```typescript
// Add to stakeRgsClient.ts after imports

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Stake Engine Error
 * Standardized error format
 */
export class StakeEngineError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'StakeEngineError';
  }
}

/**
 * Error codes from Stake Engine
 * See: https://stake-engine.com/docs/errors
 */
export const ERROR_CODES = {
  // Authentication errors
  ERR_AUTH: 'AUTHENTICATION_FAILED',
  ERR_IS: 'INVALID_SESSION',
  ERR_SE: 'SESSION_EXPIRED',
  
  // Balance errors
  ERR_IPB: 'INSUFFICIENT_BALANCE',
  ERR_IBA: 'INVALID_BET_AMOUNT',
  ERR_BBR: 'BET_BELOW_MINIMUM',
  ERR_BAM: 'BET_ABOVE_MAXIMUM',
  
  // Game errors
  ERR_GSU: 'GAME_SERVICE_UNAVAILABLE',
  ERR_IRR: 'INVALID_ROUND_REQUEST',
  ERR_RIP: 'ROUND_IN_PROGRESS',
  
  // Network errors
  ERR_NET: 'NETWORK_ERROR',
  ERR_TIMEOUT: 'REQUEST_TIMEOUT',
} as const;

/**
 * User-friendly error messages
 */
export const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.ERR_AUTH]: 'Authentication failed. Please refresh the page.',
  [ERROR_CODES.ERR_IS]: 'Invalid session. Please refresh the page.',
  [ERROR_CODES.ERR_SE]: 'Session expired. Please refresh the page.',
  [ERROR_CODES.ERR_IPB]: 'Insufficient balance. Please add funds.',
  [ERROR_CODES.ERR_IBA]: 'Invalid bet amount. Please try again.',
  [ERROR_CODES.ERR_BBR]: 'Bet below minimum. Please increase your bet.',
  [ERROR_CODES.ERR_BAM]: 'Bet above maximum. Please decrease your bet.',
  [ERROR_CODES.ERR_GSU]: 'Game temporarily unavailable. Please try again.',
  [ERROR_CODES.ERR_IRR]: 'Invalid request. Please refresh the page.',
  [ERROR_CODES.ERR_RIP]: 'Round already in progress.',
  [ERROR_CODES.ERR_NET]: 'Network error. Please check your connection.',
  [ERROR_CODES.ERR_TIMEOUT]: 'Request timeout. Please try again.',
};

/**
 * Parse Stake Engine error
 */
function parseStakeEngineError(error: any): StakeEngineError {
  // Check if it's already a StakeEngineError
  if (error instanceof StakeEngineError) {
    return error;
  }
  
  // Parse error from Stake Engine
  const code = error.code || ERROR_CODES.ERR_GSU;
  const message = ERROR_MESSAGES[code] || error.message || 'An error occurred';
  
  return new StakeEngineError(message, code, error.details);
}

/**
 * Wrap API call with error handling
 */
async function wrapApiCall<T>(
  methodName: string,
  apiCall: () => Promise<T>
): Promise<T> {
  try {
    return await apiCall();
  } catch (error: any) {
    console.error(`[StakeRGS] ${methodName} failed:`, error);
    throw parseStakeEngineError(error);
  }
}

// Update all API methods to use wrapApiCall
// Example:
export async function authenticate(
  request: AuthenticateRequest
): Promise<AuthenticateResponse> {
  return wrapApiCall('authenticate', async () => {
    const client = getClient();
    const response = await client.Authenticate();
    
    return {
      balance: response.balance.amount,
      config: {
        minBet: response.config.minBet,
        maxBet: response.config.maxBet,
        stepBet: response.config.stepBet,
        betLevels: response.config.betLevels,
        currency: response.balance.currency,
      },
      sessionID: response.sessionID,
    };
  });
}
```

**Success criteria:**
- [ ] Error types added
- [ ] Error codes documented
- [ ] User-friendly messages
- [ ] All methods wrapped with error handling
- [ ] TypeScript compiles

**Files changed:**
- `src/api/stakeRgsClient.ts` (updated, ~350 lines)

---

#### ✅ Task 2.3: Test Client Compilation (30 min)

```bash
# Type check
npm run typecheck

# Build (don't run yet, just compile)
npm run build

# Check for errors
```

**If errors:**
- Fix TypeScript issues
- Check import paths
- Verify stake-engine types

**Success criteria:**
- [ ] TypeScript compiles without errors
- [ ] No import errors
- [ ] Build succeeds

---

### Afternoon (1-2 hours): Test & Document

#### ✅ Task 2.4: Create Client Toggle System (1 hour)

Update `src/api/index.ts` (create if doesn't exist):

```typescript
/**
 * RGS Client Facade
 * 
 * Provides single import point for RGS client.
 * Automatically switches between mock and real based on config.
 */

import config from '../config';

// Import both clients
import { MockRgsClient } from './mockRgsClient';
import * as StakeRgsClient from './stakeRgsClient';

// Create mock instance (for backwards compatibility)
const mockClient = new MockRgsClient();

// Export appropriate client based on config
export const rgsClient = config.useMockRgs ? mockClient : StakeRgsClient;

// Also export individual functions for flexibility
export const {
  authenticate,
  play,
  endRound,
  getBalance,
  onBalanceUpdate,
  onRoundStateChange,
  displayAmount,
  disconnect,
} = rgsClient;

// Export types for error handling
export { StakeEngineError, ERROR_CODES, ERROR_MESSAGES } from './stakeRgsClient';

// Log which client is active
if (config.enableDebug) {
  console.log('[RGS Client] Using:', config.useMockRgs ? 'MOCK' : 'STAKE ENGINE');
}
```

**Success criteria:**
- [ ] Facade created
- [ ] Can toggle via config
- [ ] Both clients accessible
- [ ] Clean imports

**Files changed:**
- `src/api/index.ts` (new)

---

#### ✅ Task 2.5: Document API Differences (30 min)

Create `docs/rgs-client-comparison.md`:

```markdown
# RGS Client Comparison

## Mock vs Stake Engine Client

### Similarities ✅
- Same method signatures
- Same type definitions
- Same event format
- Same error handling

### Differences

| Feature | Mock | Stake Engine |
|---------|------|--------------|
| **Initialization** | new MockRgsClient() | RGSClient({ url }) |
| **Session** | Accepts any sessionID | Reads from URL params |
| **Balance** | Simulated | Real player balance |
| **Events** | 15 pre-defined scenarios | 10M pre-generated outcomes |
| **Errors** | Simulated | Real API errors |
| **Network** | Fake 300ms delay | Real HTTP/WebSocket |
| **State** | In-memory | Server-side |

### Switching Between Clients

```bash
# Use mock (development)
VITE_USE_MOCK_RGS=true npm run dev

# Use real Stake Engine (production)
VITE_USE_MOCK_RGS=false npm run dev
```

### When to Use Mock
- Local development
- Unit testing
- UI development
- Offline work

### When to Use Real Client
- Integration testing
- Staging environment
- Production
- RTP validation
```

**Success criteria:**
- [ ] Differences documented
- [ ] Switching guide clear
- [ ] Use cases explained

**Files changed:**
- `docs/rgs-client-comparison.md` (new)

---

## **DAY 3: Update GameController (3-4 hours)**

### Task 3.1: Replace Mock Import (30 min)

**File:** `src/game/GameController.ts`

**Change Line 3:**

```typescript
// ❌ OLD (line 3)
import { mockRgsClient } from '../api/mockRgsClient';

// ✅ NEW (line 3)
import * as rgsClient from '../api';
import { StakeEngineError, ERROR_CODES } from '../api';
```

**Success criteria:**
- [ ] Import changed
- [ ] No compilation errors
- [ ] StakeEngineError imported

---

### Task 3.2: Update initialize() Method (1 hour)

**File:** `src/game/GameController.ts` (lines 30-67)

**Replace:**

```typescript
// ❌ OLD
const response = await mockRgsClient.authenticate({ sessionID });

// ✅ NEW
const response = await rgsClient.authenticate({ sessionID });
```

**Full updated method:**

```typescript
async initialize(): Promise<void> {
  console.log('[GameController] Initializing...');
  this.stateManager.setState('INIT');
  
  try {
    // Parse URL params (Stake Engine provides these)
    const urlParams = new URLSearchParams(window.location.search);
    const sessionID = urlParams.get('sessionID') || 'default-session';
    const rgsUrl = urlParams.get('rgs_url');
    
    if (config.enableDebug) {
      console.log('[GameController] Session ID:', sessionID);
      console.log('[GameController] RGS URL:', rgsUrl || 'mock');
      console.log('[GameController] Using mock:', config.useMockRgs);
    }
    
    // Authenticate with RGS (mock or real)
    const response = await rgsClient.authenticate({ sessionID });
    
    // Update state
    this.stateManager.setSessionID(response.sessionID);
    this.stateManager.setConfig(response.config);
    this.stateManager.setBalance(response.balance);
    
    // Set initial bet to first bet level
    if (response.config.betLevels.length > 0) {
      this.stateManager.setCurrentBet(response.config.betLevels[0]);
    }
    
    console.log('[GameController] Authenticated successfully');
    console.log('[GameController] Balance:', response.balance);
    console.log('[GameController] Bet levels:', response.config.betLevels);
    
    // Ready to play
    this.stateManager.setState('IDLE');
    
  } catch (error) {
    console.error('[GameController] Initialization failed:', error);
    this.stateManager.setState('ERROR');
    
    // Handle specific errors
    if (error instanceof StakeEngineError) {
      this.showError(error.message);
    } else {
      this.showError('Failed to initialize game');
    }
    
    throw error;
  }
}
```

**Success criteria:**
- [ ] Method updated
- [ ] Uses rgsClient facade
- [ ] Error handling added
- [ ] Compiles without errors

---

### Task 3.3: Update play() Method (1 hour)

**File:** `src/game/GameController.ts` (lines 72-121)

**Replace:**

```typescript
// ❌ OLD (line 92)
const response: PlayResponse = await mockRgsClient.play({
  sessionID,
  amount: betAmount,
  mode: 'BASE',
});

// ✅ NEW (line 92)
const response: PlayResponse = await rgsClient.play({
  sessionID,
  amount: betAmount,
  mode: 'BASE',
});
```

**Full updated method with error handling:**

```typescript
async play(): Promise<void> {
  if (!this.stateManager.canPlay()) {
    console.warn('[GameController] Cannot play in current state');
    return;
  }
  
  console.log('[GameController] Starting round...');
  this.stateManager.setState('SPINNING');
  this.stateManager.resetBoard();
  this.stateManager.setLastWin(0);
  
  try {
    const sessionID = this.stateManager.getSessionID();
    const betAmount = this.stateManager.getCurrentBet();
    
    if (!sessionID) {
      throw new Error('No session ID');
    }
    
    // Call RGS play (mock or real)
    const response: PlayResponse = await rgsClient.play({
      sessionID,
      amount: betAmount,
      mode: 'BASE',
    });
    
    if (config.enableDebug) {
      console.log('[GameController] Response:', response);
      console.log('[GameController] Events:', response.round?.events);
    }
    
    // Update balance (after bet deducted)
    this.stateManager.setBalance(response.balance);
    
    // Store events
    this.stateManager.setCurrentEvents(response.round.events);
    
    // Process events into animation actions
    const actions = this.eventProcessor.processEvents(response.round.events);
    this.animationQueue = actions;
    
    console.log('[GameController] Round started, processing', actions.length, 'actions');
    
    // Execute animation queue
    await this.executeAnimationQueue();
    
  } catch (error) {
    console.error('[GameController] Play failed:', error);
    this.stateManager.setState('ERROR');
    
    // Handle specific Stake Engine errors
    if (error instanceof StakeEngineError) {
      this.showError(error.message);
      
      // Special handling for balance errors
      if (error.code === ERROR_CODES.ERR_IPB) {
        // Insufficient balance - disable play button
        this.stateManager.setState('IDLE');
      }
    } else {
      this.showError('Failed to play round');
    }
    
    throw error;
  }
}
```

**Success criteria:**
- [ ] Method updated
- [ ] Error handling improved
- [ ] Balance error handling
- [ ] Compiles without errors

---

### Task 3.4: Add Error Display Method (30 min)

Add to `GameController.ts`:

```typescript
/**
 * Show error message to user
 * This will be connected to UI in Day 4
 */
private showError(message: string): void {
  console.error('[GameController] Error:', message);
  
  // TODO: Show error in UI (Day 4)
  // For now, just log to console
  // Will be connected to error modal or toast
  
  if (typeof alert !== 'undefined') {
    alert(message); // Temporary - replace with nice UI
  }
}
```

**Success criteria:**
- [ ] Method added
- [ ] Called from error handlers
- [ ] Ready for UI connection

---

### Task 3.5: Test Compilation (30 min)

```bash
# Type check
npm run typecheck

# Build
npm run build

# Run dev server (with mock - should still work)
VITE_USE_MOCK_RGS=true npm run dev
```

**Test checklist:**
- [ ] No TypeScript errors
- [ ] Build succeeds
- [ ] Mock still works
- [ ] No runtime errors

**Success criteria:**
- [ ] GameController updated
- [ ] Compiles successfully
- [ ] Mock mode still works
- [ ] Ready for UI updates

**Files changed:**
- `src/game/GameController.ts` (updated, ~220 lines)

---

## **DAY 4: Update UI Components (3-4 hours)**

### Task 4.1: Update GameApp.ts - Add Event Listeners (2 hours)

**File:** `src/GameApp.ts`

**Add imports:**

```typescript
import { onBalanceUpdate, onRoundStateChange } from './api';
import config from './config';
```

**Add to initialize() method:**

```typescript
async initialize(): Promise<void> {
  // ... existing initialization code ...
  
  // Initialize game controller
  await this.gameController.initialize();
  
  // Setup Stake Engine event listeners (only if using real client)
  if (!config.useMockRgs) {
    this.setupStakeEngineListeners();
  }
  
  // ... rest of code ...
}

/**
 * Setup Stake Engine WebSocket event listeners
 */
private setupStakeEngineListeners(): void {
  if (config.enableDebug) {
    console.log('[GameApp] Setting up Stake Engine listeners');
  }
  
  // Listen for balance updates
  onBalanceUpdate((balance: number) => {
    if (config.enableDebug) {
      console.log('[GameApp] Balance update:', balance);
    }
    
    // Update controls view
    if (this.controlsView) {
      this.controlsView.updateBalance(balance);
    }
    
    // Update state manager
    this.gameController['stateManager'].setBalance(balance);
  });
  
  // Listen for round state changes
  onRoundStateChange((state: string) => {
    if (config.enableDebug) {
      console.log('[GameApp] Round state:', state);
    }
    
    // Could use this for additional UI feedback
    // For now, just log it
  });
}
```

**Success criteria:**
- [ ] Event listeners added
- [ ] Only runs for real client
- [ ] Balance updates connected
- [ ] Compiles without errors

**Files changed:**
- `src/GameApp.ts` (updated, ~150 lines)

---

### Task 4.2: Update ControlsView.ts - Balance Display (1-2 hours)

**File:** `src/ui/ControlsView.ts`

**Add method:**

```typescript
/**
 * Update balance display
 * Called when balance changes (from Stake Engine WebSocket or after round)
 */
public updateBalance(balance: number): void {
  // Update state manager (if not already updated)
  // This is a direct update from Stake Engine event
  
  // Format and display balance
  const balanceText = displayEngineToUnits(balance);
  
  // Update balance text (find existing balance text or create new)
  if (this.balanceText) {
    this.balanceText.text = `Balance: $${balanceText}`;
  }
  
  if (config.enableDebug) {
    console.log('[ControlsView] Balance updated:', balanceText);
  }
}
```

**If balance text doesn't exist, add in constructor:**

```typescript
constructor() {
  super();
  
  // ... existing code ...
  
  // Add balance text
  this.balanceText = new Text('Balance: $0.00', {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xFFFFFF,
    align: 'center',
  });
  this.balanceText.anchor.set(0.5);
  this.balanceText.position.set(0, -200); // Adjust position
  this.addChild(this.balanceText);
}
```

**Success criteria:**
- [ ] updateBalance() method added
- [ ] Balance text exists
- [ ] Updates when called
- [ ] Compiles without errors

**Files changed:**
- `src/ui/ControlsView.ts` (updated)

---

### Task 4.3: Add Error Modal/Toast (optional, 1 hour)

Create `src/ui/ErrorModal.ts`:

```typescript
import { Container, Graphics, Text } from 'pixi.js';

export class ErrorModal extends Container {
  private background: Graphics;
  private messageText: Text;
  private isVisible: boolean = false;
  
  constructor() {
    super();
    
    // Semi-transparent background
    this.background = new Graphics();
    this.background.beginFill(0x000000, 0.7);
    this.background.drawRect(-400, -150, 800, 300);
    this.background.endFill();
    this.addChild(this.background);
    
    // Error message text
    this.messageText = new Text('', {
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xFF4444,
      align: 'center',
      wordWrap: true,
      wordWrapWidth: 700,
    });
    this.messageText.anchor.set(0.5);
    this.addChild(this.messageText);
    
    // Click to dismiss
    this.background.interactive = true;
    this.background.on('pointerdown', () => {
      this.hide();
    });
    
    this.visible = false;
  }
  
  show(message: string): void {
    this.messageText.text = message;
    this.visible = true;
    this.isVisible = true;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.hide();
    }, 5000);
  }
  
  hide(): void {
    this.visible = false;
    this.isVisible = false;
  }
}
```

**Add to GameApp.ts:**

```typescript
import { ErrorModal } from './ui/ErrorModal';

// In class
private errorModal: ErrorModal;

// In initialize()
this.errorModal = new ErrorModal();
this.errorModal.position.set(
  this.app.screen.width / 2,
  this.app.screen.height / 2
);
this.app.stage.addChild(this.errorModal);

// Expose method for GameController
public showError(message: string): void {
  this.errorModal.show(message);
}
```

**Update GameController.ts:**

```typescript
// Add reference to GameApp
private gameApp?: any; // Will be set from GameApp

setGameApp(app: any): void {
  this.gameApp = app;
}

// Update showError()
private showError(message: string): void {
  console.error('[GameController] Error:', message);
  
  if (this.gameApp && this.gameApp.showError) {
    this.gameApp.showError(message);
  } else if (typeof alert !== 'undefined') {
    alert(message);
  }
}
```

**Success criteria:**
- [ ] ErrorModal created
- [ ] Connected to GameApp
- [ ] Shows errors nicely
- [ ] Auto-dismisses

**Files changed:**
- `src/ui/ErrorModal.ts` (new)
- `src/GameApp.ts` (updated)
- `src/game/GameController.ts` (updated)

---

## **DAY 5-6: Testing & Debugging (2 days)**

### Day 5 Morning: Switch to Real Client (2 hours)

#### Task 5.1: Test with Stake Engine (IF UPLOADED)

**Only if Week 1 outcomes are uploaded to Stake Engine!**

```bash
# Switch to real client
VITE_USE_MOCK_RGS=false npm run dev

# Should open with URL params from Stake Engine
# Format: http://localhost:3000?rgs_url=xxx&sessionID=yyy
```

**Manual test checklist:**
- [ ] Game loads
- [ ] Authentication succeeds
- [ ] Balance displays correctly
- [ ] Can place bet
- [ ] Round starts
- [ ] Events received
- [ ] Cards animate
- [ ] Joker transforms (if present)
- [ ] Win modal shows
- [ ] Balance updates
- [ ] Can play again

**If it doesn't work:**
- Check console for errors
- Verify rgs_url in query params
- Verify sessionID in query params
- Check network tab for API calls
- Verify Stake Engine outcomes uploaded

---

#### Task 5.2: Test Error Scenarios (2 hours)

**Test cases:**

1. **Insufficient Balance:**
   ```typescript
   // Manually set balance low in Stake Engine admin
   // Or modify code temporarily to test UI
   ```
   - [ ] Error shows in UI
   - [ ] Play button disabled
   - [ ] Clear error message

2. **Network Error:**
   - Disconnect WiFi mid-round
   - [ ] Error handled gracefully
   - [ ] Reconnect works
   - [ ] Can continue playing

3. **Invalid Session:**
   - Modify sessionID in URL
   - [ ] Shows error
   - [ ] Asks to refresh

4. **Invalid Bet:**
   - Try bet outside range
   - [ ] Error shown
   - [ ] Bet reset to valid value

**Success criteria:**
- [ ] All error scenarios tested
- [ ] Errors handled gracefully
- [ ] User sees helpful messages
- [ ] Can recover from errors

---

### Day 5 Afternoon: Integration Testing (3-4 hours)

#### Task 5.3: Play 50+ Rounds (2 hours)

**Test with both clients:**

```bash
# Test with mock
VITE_USE_MOCK_RGS=true npm run dev
# Play 25 rounds

# Test with real (if available)
VITE_USE_MOCK_RGS=false npm run dev
# Play 25 rounds
```

**Track stats:**

Create spreadsheet or note:
```
Round | Client | Bet | Hand | Multiplier | Win | Balance | Notes
------|--------|-----|------|------------|-----|---------|-------
1     | Mock   | $1  | PAIR | 0.9x       | $0.90 | $999.90 | OK
2     | Mock   | $1  | HIGH | 0.35x      | $0.35 | $999.25 | OK
...
```

**Look for:**
- [ ] All hand types appear
- [ ] Jokers appear ~18% of time
- [ ] Payouts correct
- [ ] Balance updates correctly
- [ ] No animation glitches
- [ ] No console errors
- [ ] Performance good

**Success criteria:**
- [ ] 50+ rounds played
- [ ] All hand types seen
- [ ] Jokers seen
- [ ] No critical bugs
- [ ] Stats recorded

---

#### Task 5.4: Verify Hand Types (1 hour)

**Manually verify each hand type works:**

- [ ] High Card (Low) - x0.1
- [ ] High Card (High) - x0.35
- [ ] Pair (Low) - x0.55
- [ ] Pair (High) - x0.9
- [ ] Two Pair (Low) - x0.8
- [ ] Two Pair (High) - x1.5
- [ ] Three of a Kind (Low) - x1.8
- [ ] Three of a Kind (High) - x3.0
- [ ] Straight - x5
- [ ] Flush - x10
- [ ] Full House - x20
- [ ] Four of a Kind - x40
- [ ] Straight Flush - x100 (rare!)
- [ ] Royal Flush - x1000 (very rare!)

**For rare hands:**
- May need to play many rounds
- Or temporarily modify mock to force scenario

**Success criteria:**
- [ ] All hand types verified
- [ ] Payouts match paytable
- [ ] Animations correct
- [ ] Win modals correct tier

---

### Day 6: Debugging & Performance (Full Day)

#### Task 5.5: Fix Bugs from Testing (4-6 hours)

**Common issues to watch for:**

1. **Balance sync issues**
   - Balance not updating after round
   - Balance updates but UI doesn't
   - Balance drift over many rounds

2. **Animation issues**
   - Cards not revealing
   - Joker transform glitchy
   - Win modal not showing

3. **State machine issues**
   - Game stuck in SPINNING
   - Can't play second round
   - Button states wrong

4. **Error handling issues**
   - Errors not displayed
   - Error modal doesn't dismiss
   - Errors crash game

**Debugging process:**

For each bug:
1. Reproduce consistently
2. Add debug logs
3. Identify root cause
4. Implement fix
5. Test fix
6. Verify no regressions

**Success criteria:**
- [ ] All bugs from testing fixed
- [ ] No new bugs introduced
- [ ] Clean console (no errors)

---

#### Task 5.6: Performance Testing (2 hours)

**Metrics to measure:**

```bash
# Open Chrome DevTools
# Performance tab

# Record session while playing 10 rounds
# Check:
# - FPS (should be 60fps stable)
# - Memory usage (should not grow)
# - API latency (should be <200ms)
```

**Use Lighthouse:**

```bash
npm install -g lighthouse

# Run audit
lighthouse http://localhost:3000 --view

# Target scores:
# - Performance: 90+
# - Best Practices: 90+
# - Accessibility: 80+
```

**Performance checklist:**
- [ ] FPS: 60fps stable
- [ ] Memory: No leaks (play 100 rounds)
- [ ] API: < 200ms p95
- [ ] Load time: < 3s
- [ ] Lighthouse: 90+ performance

**If performance issues:**
- Check for memory leaks
- Optimize animations
- Reduce console.logs in production
- Optimize asset sizes

**Success criteria:**
- [ ] Performance measured
- [ ] Meets targets
- [ ] No issues found

---

## **DAY 7: Polish & Production Prep (4-6 hours)**

### Task 6.1: Clean Up Debug Code (1 hour)

**Remove or disable debug code:**

1. **Update config for production:**

```typescript
// src/config.ts

const config: Config = {
  // In production, these should be false by default
  useMockRgs: import.meta.env.VITE_USE_MOCK_RGS === 'true' || false,
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true' || false,
  logRgsCalls: import.meta.env.VITE_LOG_RGS_CALLS === 'true' || false,
  
  // ... rest
};
```

2. **Remove console.logs in non-debug mode:**

Search for:
```typescript
console.log('[GameController]
console.log('[StakeRGS]
console.log('[GameApp]
```

Wrap in debug checks:
```typescript
if (config.enableDebug) {
  console.log('[GameController] ...');
}
```

3. **Remove development-only code:**
- Remove `alert()` fallbacks
- Remove temporary workarounds
- Remove test code

**Success criteria:**
- [ ] Debug code cleaned
- [ ] Logs only in debug mode
- [ ] Production build clean

**Files changed:**
- All source files (minor updates)

---

### Task 6.2: Update Documentation (1-2 hours)

**Update `client/README.md`:**

```markdown
# Joker Poker Board - Client

## Running the Game

### Development (with Mock RGS)
```bash
npm run dev
```

### Production (with Stake Engine)
The game is designed to run on Stake Engine's platform:
```
https://stake-engine.com/games/joker_poker/1.0.0/?rgs_url=xxx&sessionID=yyy
```

## Configuration

Environment variables in `.env.local`:
- `VITE_USE_MOCK_RGS` - Use mock vs real RGS
- `VITE_ENABLE_DEBUG` - Enable debug logs
- `VITE_LOG_RGS_CALLS` - Log API calls

## Architecture

### RGS Client
- Mock: `src/api/mockRgsClient.ts` (for development)
- Real: `src/api/stakeRgsClient.ts` (for production)
- Facade: `src/api/index.ts` (auto-switches)

### Integration Points
- `GameController.ts` - Uses RGS client
- `GameApp.ts` - Listens to Stake Engine events
- `ControlsView.ts` - Updates balance display

## Testing

See [INTEGRATION_CHECKLIST.md](./INTEGRATION_CHECKLIST.md)

## Deployment

1. Build: `npm run build`
2. Upload `dist/` to Stake Engine CDN
3. Game available at Stake Engine URL
```

**Success criteria:**
- [ ] README updated
- [ ] Configuration documented
- [ ] Architecture explained
- [ ] Testing guide updated

**Files changed:**
- `client/README.md` (updated)

---

### Task 6.3: Final Testing (2-3 hours)

**Complete final test:**

#### **Test Matrix:**

| Test | Mock | Real | Result |
|------|------|------|--------|
| Load game | [ ] | [ ] | |
| Authenticate | [ ] | [ ] | |
| Place bet (all levels) | [ ] | [ ] | |
| Play round | [ ] | [ ] | |
| All hand types | [ ] | [ ] | |
| Joker scenarios | [ ] | [ ] | |
| Win modal | [ ] | [ ] | |
| Balance updates | [ ] | [ ] | |
| Error handling | [ ] | [ ] | |
| Multiple rounds | [ ] | [ ] | |
| Performance | [ ] | [ ] | |
| Mobile | [ ] | [ ] | |
| Desktop | [ ] | [ ] | |

#### **Cross-browser:**

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Chrome Mobile
- [ ] Safari iOS

#### **Devices:**

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (iPad)
- [ ] Phone (iPhone, Android)

**Success criteria:**
- [ ] All tests pass
- [ ] Works on all browsers
- [ ] Works on all devices
- [ ] No critical bugs
- [ ] Ready for production

---

### Task 6.4: Create Deployment Package (1 hour)

```bash
# Clean previous builds
rm -rf dist/

# Production build (with real client as default)
VITE_USE_MOCK_RGS=false npm run build

# Verify build
ls -lh dist/
du -sh dist/

# Test locally
npx serve dist/
# Open http://localhost:3000
# Test one more time

# Create deployment package
cd dist/
zip -r ../joker-poker-client-v1.0.0.zip .
cd ..

# Verify package
unzip -l joker-poker-client-v1.0.0.zip
```

**Checklist:**
- [ ] Build succeeds
- [ ] All assets included
- [ ] Size reasonable (~2-5MB)
- [ ] Works when served
- [ ] Zip created

**Success criteria:**
- [ ] Deployment package ready
- [ ] Tested locally
- [ ] Ready to upload

**Files created:**
- `joker-poker-client-v1.0.0.zip`

---

## 📋 File Changes Reference

### Files Created (New):

```
client/
├── .env.local                           # Environment config
├── src/
│   ├── config.ts                        # Config system
│   ├── api/
│   │   ├── stakeRgsClient.ts            # Stake Engine client wrapper
│   │   └── index.ts                     # Client facade
│   └── ui/
│       └── ErrorModal.ts                # Error display (optional)
└── docs/
    ├── stake-engine-api-notes.md        # API documentation
    └── rgs-client-comparison.md         # Mock vs Real comparison

Total new files: 6
Total new lines: ~800
```

### Files Modified:

```
client/
├── package.json                         # Added stake-engine dependency
├── vite.config.ts                       # Updated env config
├── .gitignore                           # Added .env.local
├── README.md                            # Updated documentation
├── INTEGRATION_CHECKLIST.md             # Integration progress
├── src/
│   ├── game/
│   │   └── GameController.ts            # Replaced mock import, added error handling
│   ├── ui/
│   │   └── ControlsView.ts              # Added balance update method
│   └── GameApp.ts                       # Added Stake Engine event listeners

Total modified files: 8
Total modified lines: ~200
```

### Files Unchanged:

```
client/src/
├── api/
│   ├── mockRgsClient.ts                 # Keep for testing
│   └── mockData.ts                      # Keep for testing
├── game/
│   ├── EventProcessor.ts                # ✅ No changes
│   └── GameStateManager.ts              # ✅ No changes
├── ui/
│   ├── BoardView.ts                     # ✅ No changes
│   ├── CardSprite.ts                    # ✅ No changes
│   ├── UIButton.ts                      # ✅ No changes
│   └── WinModal.ts                      # ✅ No changes
├── types/
│   └── index.ts                         # ✅ Already compatible!
├── utils/
│   ├── handEvaluator.ts                 # ✅ No changes
│   └── money.ts                         # ✅ No changes
├── main.ts                              # ✅ No changes
└── public/assets/                       # ✅ No changes

Total unchanged: 15 files
```

---

## 🧪 Testing Strategy

### Test Levels:

```
┌─────────────────────────────────────────┐
│ Level 1: Unit Testing                   │
│ - Individual functions work              │
│ - Type checking passes                   │
│ - No compilation errors                  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│ Level 2: Integration Testing            │
│ - Mock client works                      │
│ - Real client works (if available)       │
│ - Toggle between clients works           │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│ Level 3: Feature Testing                │
│ - All hand types work                    │
│ - Joker scenarios work                   │
│ - Balance updates correctly              │
│ - Errors handled                         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│ Level 4: System Testing                 │
│ - 50+ rounds played                      │
│ - Cross-browser testing                  │
│ - Mobile testing                         │
│ - Performance testing                    │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│ Level 5: Acceptance Testing             │
│ - Production build works                 │
│ - Deployed to staging                    │
│ - All criteria met                       │
│ - Ready for production                   │
└──────────────────────────────────────────┘
```

### Test Checklist:

**Functional Tests (50+):**
- [ ] Authentication
- [ ] Balance display
- [ ] Bet selection (all 9 levels)
- [ ] Play button
- [ ] Round start
- [ ] Event processing
- [ ] Card reveal animations
- [ ] Joker transformations
- [ ] Hand evaluation (all 13 types)
- [ ] Payout calculation
- [ ] Win modal display (all 5 tiers)
- [ ] Balance update after win
- [ ] Balance update after loss
- [ ] Multiple consecutive rounds
- [ ] Error handling (all error codes)

**UI/UX Tests (20+):**
- [ ] Responsive layout (desktop)
- [ ] Responsive layout (mobile)
- [ ] Touch controls
- [ ] Button states
- [ ] Loading states
- [ ] Animation smoothness
- [ ] Visual feedback
- [ ] Error messages clear
- [ ] Win celebration feels good

**Performance Tests (10+):**
- [ ] Load time < 3s
- [ ] API calls < 200ms
- [ ] FPS stable 60fps
- [ ] Memory usage stable
- [ ] No memory leaks
- [ ] Smooth animations
- [ ] Asset loading optimized

**Compatibility Tests (15+):**
- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Edge (desktop)
- [ ] Chrome (mobile)
- [ ] Safari (iOS)
- [ ] Multiple screen sizes
- [ ] Portrait & landscape

---

## 🔧 Troubleshooting

### Common Issues:

#### Issue 1: "stake-engine package not found"

**Symptoms:**
```
npm ERR! 404 Not Found - GET https://registry.npmjs.org/stake-engine
```

**Solution:**
1. Check actual package name in Stake Engine docs
2. May be scoped: `@stake-engine/client`
3. Contact Stake Engine support for correct package name
4. Alternative: Use CDN version

---

#### Issue 2: "Events not processing"

**Symptoms:**
- Cards don't reveal
- Game stuck in SPINNING state

**Debug:**
```typescript
// Add in GameController.play()
console.log('Raw events from RGS:', response.round.events);
console.log('Processed actions:', actions);
```

**Solution:**
- Verify event format matches types
- Check EventProcessor.ts logic
- Ensure events array not empty

---

#### Issue 3: "Balance not updating"

**Symptoms:**
- Balance stays same after round
- Balance updates but UI doesn't show it

**Debug:**
```typescript
// Add in stakeRgsClient.ts
console.log('Balance from API:', response.balance.amount);

// Add in ControlsView.ts
console.log('updateBalance called with:', balance);
```

**Solution:**
- Verify onBalanceUpdate listener connected
- Check ControlsView.updateBalance() method
- Ensure balance text exists in UI

---

#### Issue 4: "TypeError: client.Authenticate is not a function"

**Symptoms:**
- Crash on initialization
- Client methods not available

**Solution:**
- Check Stake Engine client initialization
- Verify import statement
- Check if client exports correct methods
- Read package documentation

---

#### Issue 5: "CORS errors"

**Symptoms:**
```
Access to fetch at 'https://rgs.stake-engine.com' blocked by CORS
```

**Solution:**
- This is normal in local development
- Stake Engine URLs only work in their environment
- Use mock for local development
- Test real client on Stake Engine staging

---

## ✅ Final Checklist

### Day 1: Setup ✅
- [ ] stake-engine package installed
- [ ] Environment config created
- [ ] Config system working
- [ ] API documented
- [ ] Mock still works

### Day 2: RGS Client ✅
- [ ] stakeRgsClient.ts created
- [ ] All API methods implemented
- [ ] Error handling added
- [ ] Client toggle system working
- [ ] TypeScript compiles

### Day 3: GameController ✅
- [ ] Mock import replaced
- [ ] initialize() updated
- [ ] play() updated
- [ ] Error handling improved
- [ ] Compiles & runs

### Day 4: UI Components ✅
- [ ] GameApp event listeners added
- [ ] ControlsView balance updates
- [ ] Error modal created
- [ ] All UI working

### Day 5-6: Testing ✅
- [ ] 50+ rounds played
- [ ] All hand types verified
- [ ] Errors tested
- [ ] Performance tested
- [ ] Cross-browser tested
- [ ] Mobile tested
- [ ] All bugs fixed

### Day 7: Production ✅
- [ ] Debug code cleaned
- [ ] Documentation updated
- [ ] Final testing complete
- [ ] Build created
- [ ] Deployment package ready
- [ ] Ready for staging! 🚀

---

## 📊 Success Metrics

### Technical Metrics:
- [ ] TypeScript: 0 errors
- [ ] Build: Succeeds
- [ ] Size: < 5MB
- [ ] Load time: < 3s
- [ ] API latency: < 200ms
- [ ] FPS: 60fps stable
- [ ] Memory: No leaks

### Functional Metrics:
- [ ] Authentication: 100% success
- [ ] Rounds: 50+ completed
- [ ] Hand types: All 13 verified
- [ ] Errors: All handled
- [ ] Balance: Always correct
- [ ] Jokers: Appear ~18%

### Quality Metrics:
- [ ] Code reviews: Pass
- [ ] Tests: All pass
- [ ] No console errors
- [ ] No warnings
- [ ] Documentation: Complete
- [ ] Ready for production

---

**Last Updated:** 2026-01-11  
**Status:** Ready to start Day 1  
**Timeline:** 7 days  
**Confidence:** High ✅

**Let's integrate! 🚀🎨✨**
