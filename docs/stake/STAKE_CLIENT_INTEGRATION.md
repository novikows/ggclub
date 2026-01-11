# 🔌 Stake Engine Client Integration Guide

**Project:** Joker Poker Board  
**Task:** Replace Mock RGS with Real Stake Engine Client  
**Date:** 2026-01-11

---

## Overview

Заменяем `mockRgsClient.ts` на официальный `@stake-engine/ts-client`.

**Преимущества:**
- ✅ Готовый клиент от Stake Engine
- ✅ TypeScript типы из коробки
- ✅ Автоматические balance updates через events
- ✅ Round state management
- ✅ Реконнекция из коробки

---

## 1. Installation

```bash
cd packages/client

# Install Stake Engine TypeScript client
npm install stake-engine

# Types included, no need for @types/
```

---

## 2. Create RGS Client Wrapper

### 2.1 Create `client/src/api/stakeRgsClient.ts`

```typescript
import { RGSClient } from 'stake-engine';
import type {
  AuthenticateRequest,
  AuthenticateResponse,
  PlayRequest,
  PlayResponse,
  EndRoundRequest,
  EndRoundResponse,
  BalanceResponse,
} from '../types';

/**
 * Stake Engine RGS Client Wrapper
 * 
 * Wraps the official Stake Engine client with our app's types.
 */

// Initialize Stake Engine client
export const rgsClient = RGSClient({
  url: window.location.href, // Gets rgs_url from query params automatically
});

/**
 * POST /wallet/authenticate
 */
export async function authenticate(
  request: AuthenticateRequest
): Promise<AuthenticateResponse> {
  try {
    const response = await rgsClient.Authenticate();
    
    console.log('[StakeRGS] Authenticated:', response);
    
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
    console.error('[StakeRGS] Authentication failed:', error);
    throw new Error('ERR_IS: Authentication failed');
  }
}

/**
 * POST /wallet/play
 */
export async function play(
  request: PlayRequest
): Promise<PlayResponse> {
  try {
    const response = await rgsClient.Play({
      amount: request.amount,
      mode: request.mode,
    });
    
    console.log('[StakeRGS] Play response:', response);
    console.log('[StakeRGS] Events:', response.round.events);
    
    // Map Stake Engine response to our types
    return {
      balance: response.balance.amount,
      round: {
        id: response.round.id,
        events: response.round.events, // Already in correct format!
      },
    };
  } catch (error: any) {
    console.error('[StakeRGS] Play failed:', error);
    
    // Handle specific Stake Engine errors
    if (error.code === 'ERR_IPB') {
      throw new Error('ERR_IPB: Insufficient balance');
    }
    
    throw error;
  }
}

/**
 * POST /wallet/end-round
 */
export async function endRound(
  request: EndRoundRequest
): Promise<EndRoundResponse> {
  try {
    const response = await rgsClient.EndRound();
    
    console.log('[StakeRGS] End round response:', response);
    
    return {
      balance: response.balance.amount,
    };
  } catch (error) {
    console.error('[StakeRGS] End round failed:', error);
    throw error;
  }
}

/**
 * GET /wallet/balance
 */
export async function getBalance(): Promise<BalanceResponse> {
  try {
    const response = await rgsClient.GetBalance();
    
    return {
      balance: response.balance.amount,
    };
  } catch (error) {
    console.error('[StakeRGS] Get balance failed:', error);
    throw error;
  }
}

/**
 * Display amount with currency formatting (Stake Engine helper)
 */
export function displayAmount(
  amount: number,
  options?: {
    removeSymbol?: boolean;
    decimals?: number;
    wholeNumberDecimals?: boolean;
  }
): string {
  return rgsClient.DisplayAmount(amount, {
    removeSymbol: options?.removeSymbol ?? false,
    decimals: options?.decimals ?? 2,
    wholeNumberDecimals: options?.wholeNumberDecimals ?? true,
  });
}
```

---

## 3. Update Game Controller

### 3.1 Replace Mock Import

```typescript
// client/src/game/GameController.ts

// ❌ OLD - Remove this:
// import { mockRgsClient } from '../api/mockRgsClient';

// ✅ NEW - Add this:
import * as stakeRgs from '../api/stakeRgsClient';
```

### 3.2 Update Methods

```typescript
export class GameController {
  // ...
  
  async initialize(): Promise<void> {
    console.log('[GameController] Initializing...');
    this.stateManager.setState('INIT');
    
    try {
      // ✅ Use Stake Engine client
      const response = await stakeRgs.authenticate({
        sessionID: sessionID,
      });
      
      // Rest stays the same
      this.stateManager.setSessionID(response.sessionID);
      this.stateManager.setConfig(response.config);
      this.stateManager.setBalance(response.balance);
      
      this.stateManager.setState('IDLE');
    } catch (error) {
      console.error('[GameController] Init failed:', error);
      this.stateManager.setState('ERROR');
      throw error;
    }
  }
  
  async play(): Promise<void> {
    // ...
    
    try {
      // ✅ Use Stake Engine client
      const response = await stakeRgs.play({
        sessionID,
        amount: betAmount,
        mode: 'BASE',
      });
      
      // ✅ Events already in correct format!
      this.stateManager.setBalance(response.balance);
      this.stateManager.setCurrentEvents(response.round.events);
      
      const actions = this.eventProcessor.processEvents(response.round.events);
      await this.executeAnimationQueue(actions);
      
    } catch (error) {
      console.error('[GameController] Play failed:', error);
      this.stateManager.setState('ERROR');
      throw error;
    }
  }
  
  async executeAnimationQueue(actions: AnimationAction[]): Promise<void> {
    for (const action of actions) {
      // ...
      
      if (action.type === 'SHOW_WIN') {
        const winAmount = Math.round(
          this.stateManager.getCurrentBet() * action.payload.payoutMultiplier
        );
        
        if (winAmount > 0) {
          this.stateManager.setLastWin(winAmount);
          
          // ✅ Use Stake Engine client
          const endResponse = await stakeRgs.endRound({
            sessionID: this.stateManager.getSessionID()!,
          });
          
          this.stateManager.setBalance(endResponse.balance);
        }
      }
    }
    
    // ...
  }
}
```

---

## 4. Add Event Listeners

### 4.1 Balance Updates (`client/src/GameApp.ts`)

```typescript
export class GameApp {
  // ...
  
  private setupStakeEngineListeners(): void {
    // Listen to balance updates from Stake Engine
    window.addEventListener('balanceUpdate', (event: Event) => {
      const customEvent = event as CustomEvent<{
        amount: number;
        currency: string;
      }>;
      
      console.log('[GameApp] Balance update from Stake Engine:', customEvent.detail);
      
      // Update UI
      this.stateManager.setBalance(customEvent.detail.amount);
    });
    
    // Listen to round state
    window.addEventListener('roundActive', (event: Event) => {
      const customEvent = event as CustomEvent<{ active: boolean }>;
      
      console.log('[GameApp] Round active:', customEvent.detail.active);
      
      // Disable/enable play button
      const canPlay = !customEvent.detail.active && 
                     this.stateManager.getState() === 'IDLE';
      
      this.controlsView.setPlayEnabled(canPlay);
    });
  }
  
  async start(): Promise<void> {
    // ...
    
    // Setup Stake Engine event listeners
    this.setupStakeEngineListeners();
    
    // Initialize game
    await this.gameController.initialize();
  }
}
```

---

## 5. Remove Mock Files

```bash
cd packages/client/src/api

# Delete mock files (keep as backup first)
mv mockRgsClient.ts mockRgsClient.ts.backup
mv mockData.ts mockData.ts.backup

# Or delete completely:
# rm mockRgsClient.ts
# rm mockData.ts
```

---

## 6. Environment Configuration

### 6.1 Environment Variables

```typescript
// client/src/config/env.ts

export const ENV = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Stake Engine will inject these via URL params:
  // ?rgs_url=...&sessionID=...&lang=...&device=...
};
```

### 6.2 URL Parameters

Stake Engine автоматически добавляет параметры:

```
https://your-team.cdn.stake-engine.com/joker_poker/1.0.0/index.html
  ?sessionID=550e8400-e29b-41d4-a716-446655440000
  &lang=en
  &device=desktop
  &rgs_url=https://rgs.stake-engine.com
```

RGSClient автоматически читает эти параметры! ✅

---

## 7. Testing

### 7.1 Local Testing

```bash
# Run client
cd packages/client
npm run dev

# Open with test session
open "http://localhost:3000?sessionID=test-session"
```

### 7.2 Verify Integration

Check console logs:

```
✅ [StakeRGS] Authenticated: {...}
✅ [StakeRGS] Balance: 4530000000
✅ [StakeRGS] Bet levels: [100000, 500000, ...]

✅ [StakeRGS] Play response: {...}
✅ [StakeRGS] Events: [{type: 'reveal_initial_board', ...}, ...]

✅ [StakeRGS] End round response: {...}
✅ [GameApp] Balance update from Stake Engine: {amount: 4530400000}
```

### 7.3 Test Scenarios

Play multiple rounds and verify:
- [ ] Cards reveal correctly (flop → turn → river)
- [ ] Jokers transform properly
- [ ] Win amounts calculate correctly
- [ ] Balance updates after each round
- [ ] All 13 hand types can occur
- [ ] RTP trends toward 97% over time

---

## 8. Production Build

### 8.1 Build Client

```bash
cd packages/client

# Build for production
npm run build

# Output: dist/ folder
```

### 8.2 Verify Build

```bash
# Check dist folder
ls -la dist/

# Should contain:
# - index.html
# - assets/ (JS, CSS)
# - assets/cards/ (54 card images)
# - assets/background.png
```

### 8.3 Upload to Stake CDN

```bash
# Upload via Stake Engine CLI
stake-engine upload-client \
  --game joker_poker \
  --version 1.0.0 \
  --path dist/

# Files will be hosted at:
# https://{team}.cdn.stake-engine.com/joker_poker/1.0.0/
```

---

## 9. Troubleshooting

### Issue: "Session not found"
```
Error: ERR_IS: Session not found
```

**Solution:**
- Verify `sessionID` in URL params
- Check Stake Engine test mode enabled
- Try re-authenticating

### Issue: "Events undefined"
```
TypeError: response.round.events is not iterable
```

**Solution:**
- Check Stake Engine response format
- Verify game uploaded correctly
- Check event generation in Math SDK

### Issue: "Balance not updating"
```
Balance stays same after win
```

**Solution:**
- Verify `endRound()` called
- Check balance event listener attached
- Check console for balance update events

### Issue: "RTP too high/low"
```
RTP: 105% or 85%
```

**Solution:**
- Re-run Math SDK simulation
- Adjust paytable multipliers
- Verify hand frequencies
- Check Joker resolution logic

---

## 10. Checklist

### Pre-Integration ✅

- [ ] Math SDK configured and tested
- [ ] Outcomes generated (10M rounds)
- [ ] RTP validated (96-98%)
- [ ] Game uploaded to Stake Engine
- [ ] Test mode accessible

### Integration ✅

- [ ] Install `stake-engine` package
- [ ] Create `stakeRgsClient.ts`
- [ ] Update `GameController.ts` imports
- [ ] Remove mock client files
- [ ] Add balance event listeners
- [ ] Add round state listeners

### Testing ✅

- [ ] Test authentication
- [ ] Test play round
- [ ] Test end round
- [ ] Verify balance updates
- [ ] Test all 13 hand types
- [ ] Test Joker scenarios
- [ ] Test on mobile
- [ ] Test on desktop

### Production ✅

- [ ] Build client (`npm run build`)
- [ ] Upload to Stake CDN
- [ ] Verify game URL works
- [ ] QA testing
- [ ] Launch! 🚀

---

## 11. Code Changes Summary

### Files to CREATE:
```
✅ client/src/api/stakeRgsClient.ts    # Stake Engine wrapper
```

### Files to UPDATE:
```
✅ client/src/game/GameController.ts   # Replace mock import
✅ client/src/GameApp.ts                # Add event listeners
✅ client/package.json                  # Add stake-engine dependency
```

### Files to DELETE:
```
❌ client/src/api/mockRgsClient.ts     # Old mock client
❌ client/src/api/mockData.ts          # Old mock scenarios
```

---

## 12. Example Integration

### Before (Mock):
```typescript
import { mockRgsClient } from '../api/mockRgsClient';

const response = await mockRgsClient.play({
  sessionID,
  amount: betAmount,
  mode: 'BASE',
});
```

### After (Stake Engine):
```typescript
import * as stakeRgs from '../api/stakeRgsClient';

const response = await stakeRgs.play({
  sessionID,
  amount: betAmount,
  mode: 'BASE',
});

// Response format is SAME!
// No other code changes needed ✅
```

---

## 13. Balance Event Integration

### Add to ControlsView:

```typescript
export class ControlsView extends PIXI.Container {
  init(): void {
    // ... existing code ...
    
    // Listen to Stake Engine balance updates
    this.setupBalanceListener();
  }
  
  private setupBalanceListener(): void {
    window.addEventListener('balanceUpdate', (event: Event) => {
      const customEvent = event as CustomEvent<{
        amount: number;
        currency: string;
      }>;
      
      console.log('[ControlsView] Balance update:', customEvent.detail);
      
      // Update balance display
      this.updateBalance(customEvent.detail.amount);
    });
  }
}
```

---

## 14. Testing Checklist

### Manual Tests:

1. **Authentication**
   ```
   ✅ Page loads
   ✅ Balance displays ($4,530)
   ✅ Bet levels loaded (9 levels)
   ✅ PLAY button enabled
   ```

2. **Play Round**
   ```
   ✅ Click PLAY
   ✅ Balance decreases
   ✅ Cards reveal (flop → turn → river)
   ✅ Events processed correctly
   ✅ Animations smooth
   ```

3. **Win Handling**
   ```
   ✅ Win amount calculated
   ✅ Win modal displays
   ✅ Balance increases after end-round
   ✅ Balance update event fired
   ```

4. **Joker Scenarios**
   ```
   ✅ Joker displays as JOKER.png
   ✅ Joker pulses after river
   ✅ Joker transforms to target card
   ✅ Win calculated with transformed card
   ```

5. **Error Handling**
   ```
   ✅ Insufficient balance error
   ✅ Invalid session error
   ✅ Network error handling
   ```

---

## 15. Production Deployment

### Step 1: Build

```bash
cd packages/client
npm run build
```

### Step 2: Verify Build

```bash
# Check assets
ls -la dist/assets/
ls -la dist/assets/cards/

# Should have:
# - 54 card images
# - background.png
# - JavaScript bundles
# - CSS files
```

### Step 3: Upload

```bash
# Upload to Stake Engine CDN
stake-engine upload-client \
  --game joker_poker \
  --version 1.0.0 \
  --path dist/
```

### Step 4: Get URL

```
Your game is now live at:
https://{team}.cdn.stake-engine.com/joker_poker/1.0.0/index.html
```

### Step 5: Test Production

```bash
# Open game URL with test session
open "https://{team}.cdn.stake-engine.com/joker_poker/1.0.0/index.html?sessionID=test"
```

---

## 16. Success Criteria

### Integration Complete When:

- ✅ Mock client removed
- ✅ Stake Engine client integrated
- ✅ All API calls work
- ✅ Balance updates correctly
- ✅ Events processed correctly
- ✅ All animations work
- ✅ No console errors
- ✅ RTP matches Math SDK (97%)
- ✅ Game playable on Stake Engine URL

---

## 17. Resources

### Documentation:
- **Stake TS Client:** https://github.com/StakeEngine/ts-client
- **RGS API Docs:** https://stake-engine.com/docs/rgs
- **Client Examples:** Check ts-client repo for examples

### Support:
- Check Stake Engine documentation
- GitHub Issues on ts-client repo
- Discord community

---

**Ready to integrate!** 🚀

**Estimated time:** 2-3 hours for full integration

**Next step:** Install `stake-engine` package and create wrapper
