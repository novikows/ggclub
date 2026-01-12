# 🚀 Joker Poker Board - Production Roadmap

**From:** Math SDK Complete (RTP 98.34% ✅)  
**To:** Live on Stake Engine  
**Timeline:** 2-3 weeks  
**Last Updated:** 2026-01-11

---

## 📍 Current Position: Week 1 Complete ✅

**What's done:**
- ✅ Math SDK forked & setup
- ✅ game.py implemented (581 lines)
- ✅ simulate.py implemented (148 lines)
- ✅ RTP validated: 98.34%
- ✅ 1M simulation successful
- ✅ Documentation complete

**What's next:**
- Generate 10M outcomes
- Contact Stake Engine
- Upload outcomes
- Frontend integration
- Production deploy

---

## 🎯 3-Week Production Plan

```
Week 1 (Days 1-7): Math SDK & Outcomes ✅ 90% DONE
  ├─ Days 1-2: Setup & Implementation ✅
  ├─ Day 3: RTP Tuning ✅
  ├─ Day 4: Validation ✅
  └─ Days 5-7: Generate & Upload ⏳ IN PROGRESS

Week 2 (Days 8-14): Frontend Integration ⏳ PENDING
  ├─ Days 8-9: Stake Engine Setup
  ├─ Days 10-11: Client Integration
  ├─ Days 12-13: Testing & Debugging
  └─ Day 14: Final Testing

Week 3 (Days 15-21): Production & Launch ⏳ PENDING
  ├─ Days 15-16: Build & Deploy
  ├─ Days 17-19: QA Testing
  ├─ Day 20: Bug Fixes & Polish
  └─ Day 21: Launch! 🚀
```

---

## 📋 Detailed Action Plan

---

## PHASE 1: Outcomes Generation & Upload (Days 5-7)

**Status:** ⏳ IN PROGRESS  
**Goal:** Upload 10M outcomes to Stake Engine  
**Timeline:** 2-3 days

---

### Day 5: Generate Outcomes ⏳ TODAY

#### Step 1.1: Prepare for Long-Running Task (5 min)

```bash
# In pokerspin-math repo
cd ~/Projects/_casik/pokerspin-math
source env/bin/activate

# Verify setup
python -c "from games.joker_poker.game import simulate_round; print('OK')"
python -c "from games.joker_poker.simulate import calculate_rtp; print('OK')"
```

**Success criteria:**
- [x] Both imports work without errors
- [x] Virtual env activated (shows `(env)`)

---

#### Step 1.2: Test Small Generation (10 min)

Before generating 10M, test with smaller batch:

```bash
# Test with 10K outcomes (takes ~5 seconds)
python -m games.joker_poker.simulate --generate --count 10000
```

**Expected output:**
```
Generating outcomes... 10,000/10,000 (100%)
✅ Generated 10,000 outcomes!
```

**Success criteria:**
- [ ] Generation completes without errors
- [ ] Progress bar shows correctly
- [ ] No crashes or exceptions

**If fails:** Debug before proceeding to 10M!

---

#### Step 1.3: Generate 10M Outcomes (30-60 min)

```bash
# Full generation - THIS TAKES TIME!
python -m games.joker_poker.simulate --generate --count 10000000

# Alternative: Run in background with nohup
nohup python -m games.joker_poker.simulate --generate --count 10000000 > generation.log 2>&1 &

# Monitor progress
tail -f generation.log
```

**Expected output:**
```
======================================================================
GENERATING OUTCOMES
======================================================================
Generating 10,000,000 outcomes...
This may take 30-60 minutes...

Progress: 1,000,000/10,000,000 (10%)
Progress: 2,000,000/10,000,000 (20%)
...
Progress: 10,000,000/10,000,000 (100%)

✅ Generated 10,000,000 outcomes!

Next step: Upload to Stake Engine
```

**Success criteria:**
- [ ] All 10M outcomes generated
- [ ] No errors during generation
- [ ] Files created in `uploads/` or similar directory
- [ ] Process completed successfully

**Estimated time:** 30-60 minutes depending on CPU

---

#### Step 1.4: Verify Generated Files (5 min)

```bash
# Check what files were created
find . -name "*.csv*" -o -name "*.json" -o -name "*.bin" 2>/dev/null

# Or check uploads directory
ls -lh uploads/ 2>/dev/null
ls -lh games/joker_poker/outcomes/ 2>/dev/null
ls -lh games/joker_poker/generated/ 2>/dev/null

# Check file sizes
du -sh games/joker_poker/
```

**Expected files:**
- Some data file (CSV, JSON, or binary format)
- Possibly compressed (.gz, .zip)
- Possibly metadata file
- Total size: 100-500 MB (compressed)

**Success criteria:**
- [ ] Files exist
- [ ] Reasonable file size
- [ ] No corruption errors

**If no files found:** Check generate code in `simulate.py` - may need to implement file writing!

---

### Day 6: Research Stake Engine Upload (4-6 hours)

**Current issue:** `make upload GAME=joker_poker` doesn't work

#### Step 2.1: Check Makefile (10 min)

```bash
# In pokerspin-math/
cat Makefile

# Look for available commands
make help
make --version
```

**What to look for:**
- [ ] Is there an `upload` target?
- [ ] Is there a `deploy` target?
- [ ] What commands ARE available?
- [ ] Any documentation in Makefile?

---

#### Step 2.2: Check Official Stake Engine Docs (30 min)

**Important:** The Stake Engine Math SDK repo we forked might be:
1. A real production tool ✅
2. An example/template repo ⚠️
3. Outdated or archived ❌

**Action items:**

```bash
# 1. Check README of our fork
cat README.md | head -100

# 2. Check if there's actual Stake Engine documentation
ls -la docs/ 2>/dev/null

# 3. Check remote repo info
git remote -v
# Visit the GitHub URLs in browser
```

**Research online:**
- Google: "Stake Engine Math SDK upload"
- Google: "Stake Engine game deployment"
- Check: https://stake-engine.com/docs
- Check: https://stakeengine.github.io/math-sdk/

**Success criteria:**
- [ ] Found official documentation
- [ ] Found upload instructions
- [ ] Understand the process

---

#### Step 2.3: Contact Stake Engine Support (1-2 days wait)

**Likely scenario:** You need official Stake Engine account/credentials.

**Action:**

1. **Find contact info:**
   - Website: https://stake-engine.com/contact
   - Email: support@stake-engine.com (or similar)
   - Discord/Slack community?

2. **Prepare your message:**
   ```
   Subject: New Game Integration - Joker Poker Board
   
   Hi Stake Engine Team,
   
   We're integrating a new casino game "Joker Poker Board" with your platform.
   
   Current status:
   - Game math implemented (RTP 98.34%)
   - 10M outcomes generated
   - Ready to upload
   
   Questions:
   1. How do we get API credentials for upload?
   2. What's the upload process? (our forked Math SDK doesn't have `make upload`)
   3. Is there a staging environment for testing?
   4. What's the approval process?
   
   Game details:
   - Type: 5-card board poker with Jokers
   - RTP: 98.34%
   - Outcomes: 10,000,000
   - Math validated
   
   Can you provide:
   - API key & team ID
   - Upload instructions
   - Integration guide
   
   Thanks!
   ```

3. **Send email and wait for response**

**Success criteria:**
- [ ] Contact email sent
- [ ] Response received (1-3 days typically)
- [ ] Credentials obtained
- [ ] Upload instructions received

---

#### Step 2.4: Alternative: Manual Upload via Web Interface (2 hours)

**If Stake Engine has admin panel:**

1. **Login to Stake Engine admin:**
   ```bash
   open https://admin.stake-engine.com
   # or whatever their admin URL is
   ```

2. **Look for:**
   - "Upload Game" button
   - "New Game" section
   - "Games" → "Add New"
   - File upload interface

3. **Upload files:**
   - Select generated outcome files
   - Fill in game metadata:
     - Name: Joker Poker Board
     - Game ID: joker_poker
     - RTP: 98.34%
     - Version: 1.0.0
   - Submit

4. **Verify:**
   - Game appears in game list
   - Status: Active or Pending
   - RTP displayed correctly

**Success criteria:**
- [ ] Files uploaded successfully
- [ ] Game visible in admin panel
- [ ] Status: Active or Processing

---

### Day 7: Verify Upload & Get Game ID (1-2 hours)

#### Step 3.1: Confirm Upload Success

**Via API (if credentials received):**
```bash
# Test API access
curl -X GET https://api.stake-engine.com/games/joker_poker \
  -H "Authorization: Bearer $STAKE_ENGINE_API_KEY" \
  -H "X-Team-ID: $STAKE_ENGINE_TEAM_ID"
```

**Expected response:**
```json
{
  "game_id": "joker_poker",
  "name": "Joker Poker Board",
  "version": "1.0.0",
  "status": "active",
  "rtp": 98.34,
  "outcomes_count": 10000000,
  "created_at": "2026-01-11T...",
  "cdn_url": "https://cdn.stake-engine.com/games/joker_poker/1.0.0/"
}
```

**Via Admin Panel:**
- Login and verify game appears
- Check all metadata is correct
- Note the Game ID / API endpoint

**Success criteria:**
- [ ] Upload confirmed
- [ ] Game status: Active
- [ ] Outcomes: 10,000,000 ✅
- [ ] RTP: 98.34% ✅
- [ ] Game ID obtained (for client)

---

#### Step 3.2: Test with Stake Engine Test Client (30 min)

**If Stake Engine provides test client:**

```bash
# Install test client (hypothetical)
npm install -g @stake-engine/test-client

# Run test
stake-test --game joker_poker --rounds 10

# Expected output
# Round 1: PAIR (High) - Win 0.9x ✅
# Round 2: HIGH_CARD (Low) - Win 0.1x ✅
# Round 3: STRAIGHT_FLUSH - Win 100x ✅
# ...
```

**Success criteria:**
- [ ] Test client connects
- [ ] Returns valid game data
- [ ] All hand types work
- [ ] Joker transformations work
- [ ] Payouts correct

---

#### Step 3.3: Document Game Configuration (15 min)

Create file: `pokerspin-math/GAME_CONFIG.md`

```markdown
# Joker Poker Board - Stake Engine Configuration

**Game ID:** joker_poker
**Version:** 1.0.0
**RTP:** 98.34%
**Status:** Active ✅

## API Endpoints:
- RGS: https://rgs.stake-engine.com/games/joker_poker
- Game ID: joker_poker_v1_20260111

## Credentials:
- Team ID: xxx (from Stake Engine)
- API Key: xxx (KEEP SECRET!)

## Stats:
- Outcomes: 10,000,000
- Joker frequency: 17.86%
- Royal Flush: 0.003%

## Upload Date: 2026-01-11
```

**Success criteria:**
- [ ] All info documented
- [ ] Credentials saved securely
- [ ] Game ID ready for frontend

---

## PHASE 2: Frontend Integration (Days 8-14)

**Status:** ⏳ PENDING  
**Goal:** Replace mock RGS with real Stake Engine client  
**Timeline:** 1 week

---

### Day 8: Setup Stake Engine Client (2-3 hours)

#### Step 4.1: Install Stake Engine NPM Package (10 min)

```bash
cd ~/Projects/_casik/pokerspin/client

# Check what Stake Engine provides
npm search stake-engine
npm search @stake-engine
npm search stakeengine

# Install (name might vary)
npm install stake-engine
# or
npm install @stake-engine/client
# or
npm install @stakeengine/rgs-client
```

**If package doesn't exist:**
- Check Stake Engine docs for client installation
- Might need to use their CDN:
  ```html
  <script src="https://cdn.stake-engine.com/client/v1.0.0/stake.js"></script>
  ```
- Or REST API directly with fetch/axios

**Success criteria:**
- [ ] Client library installed
- [ ] No dependency conflicts
- [ ] Types available (if TypeScript package)

---

#### Step 4.2: Study Stake Engine Client API (1 hour)

```bash
# Read documentation
cat node_modules/stake-engine/README.md

# Check TypeScript types
cat node_modules/stake-engine/index.d.ts

# Or check online docs
open https://stake-engine.com/docs/client
```

**What to learn:**
- How to authenticate?
- How to start a round?
- How to get game events?
- How to handle errors?
- Event structure format

**Document findings in:** `client/docs/stake-client-api.md`

**Success criteria:**
- [ ] Understand authentication flow
- [ ] Understand play round flow
- [ ] Know event structure
- [ ] Error handling documented

---

#### Step 4.3: Create Environment Config (15 min)

Create `client/.env.local`:

```bash
# Stake Engine Configuration
VITE_STAKE_ENGINE_API_URL=https://rgs.stake-engine.com
VITE_STAKE_ENGINE_GAME_ID=joker_poker
VITE_STAKE_ENGINE_TEAM_ID=your-team-id

# For development
VITE_USE_MOCK_RGS=false
VITE_ENABLE_DEBUG=true
```

Create `client/src/config.ts`:

```typescript
export const config = {
  stakeEngine: {
    apiUrl: import.meta.env.VITE_STAKE_ENGINE_API_URL,
    gameId: import.meta.env.VITE_STAKE_ENGINE_GAME_ID,
    teamId: import.meta.env.VITE_STAKE_ENGINE_TEAM_ID,
  },
  useMockRgs: import.meta.env.VITE_USE_MOCK_RGS === 'true',
  debug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
};
```

**Success criteria:**
- [ ] .env.local created (add to .gitignore!)
- [ ] config.ts created
- [ ] Can toggle mock/real RGS
- [ ] Debug mode available

---

### Day 9: Implement RGS Client Wrapper (4-6 hours)

#### Step 5.1: Create stakeRgsClient.ts (2 hours)

Create `client/src/api/stakeRgsClient.ts`:

```typescript
/**
 * Stake Engine RGS Client
 * Wrapper around official Stake Engine client
 */

import * as StakeEngine from 'stake-engine'; // or whatever package name
import { config } from '../config';
import type { Book, BookEvent } from '../types';

// Client instance
let client: StakeEngine.Client | null = null;
let sessionToken: string | null = null;

/**
 * Initialize and authenticate with Stake Engine
 */
export async function authenticate(): Promise<void> {
  try {
    // Initialize client
    client = new StakeEngine.Client({
      apiUrl: config.stakeEngine.apiUrl,
      gameId: config.stakeEngine.gameId,
      teamId: config.stakeEngine.teamId,
    });

    // Authenticate (get session token)
    const response = await client.authenticate({
      // Player ID, session ID, etc. - depends on Stake Engine API
      playerId: 'demo-player', // For testing
      currency: 'USD',
    });

    sessionToken = response.sessionToken;
    
    if (config.debug) {
      console.log('[StakeRGS] Authenticated:', sessionToken);
    }
  } catch (error) {
    console.error('[StakeRGS] Authentication failed:', error);
    throw error;
  }
}

/**
 * Start a game round
 */
export async function play(betAmount: number): Promise<Book> {
  if (!client || !sessionToken) {
    throw new Error('Not authenticated. Call authenticate() first.');
  }

  try {
    // Call Stake Engine play endpoint
    const response = await client.play({
      sessionToken,
      betAmount,
      gameId: config.stakeEngine.gameId,
    });

    // Transform Stake Engine response to our Book format
    const book: Book = {
      id: response.bookId,
      payoutMultiplier: response.payoutMultiplier,
      events: response.events as BookEvent[], // Assuming format matches
    };

    if (config.debug) {
      console.log('[StakeRGS] Play response:', book);
    }

    return book;
  } catch (error) {
    console.error('[StakeRGS] Play failed:', error);
    throw error;
  }
}

/**
 * End current round (acknowledge result)
 */
export async function endRound(): Promise<void> {
  if (!client || !sessionToken) {
    return; // Silently ignore if not authenticated
  }

  try {
    await client.endRound({
      sessionToken,
    });

    if (config.debug) {
      console.log('[StakeRGS] Round ended');
    }
  } catch (error) {
    console.error('[StakeRGS] End round failed:', error);
    // Don't throw - not critical
  }
}

/**
 * Get current balance
 */
export async function getBalance(): Promise<number> {
  if (!client || !sessionToken) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await client.getBalance({
      sessionToken,
    });

    return response.balance;
  } catch (error) {
    console.error('[StakeRGS] Get balance failed:', error);
    throw error;
  }
}

/**
 * Subscribe to balance updates
 */
export function onBalanceUpdate(callback: (balance: number) => void): void {
  if (!client) return;

  client.on('balanceUpdate', (event) => {
    callback(event.balance);
  });
}

/**
 * Subscribe to round state changes
 */
export function onRoundStateChange(callback: (state: string) => void): void {
  if (!client) return;

  client.on('roundStateChange', (event) => {
    callback(event.state);
  });
}

/**
 * Disconnect from Stake Engine
 */
export async function disconnect(): Promise<void> {
  if (client) {
    await client.disconnect();
    client = null;
    sessionToken = null;
  }
}
```

**Success criteria:**
- [ ] File created with all functions
- [ ] TypeScript compiles without errors
- [ ] Proper error handling
- [ ] Debug logging implemented

---

#### Step 5.2: Add Error Handling (1 hour)

Extend `stakeRgsClient.ts` with error types:

```typescript
// Add to stakeRgsClient.ts

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

// Common errors from Stake Engine docs
export const ERROR_CODES = {
  ERR_IS: 'INSUFFICIENT_BALANCE',
  ERR_IPB: 'INVALID_BET_AMOUNT',
  ERR_GSU: 'GAME_SERVICE_UNAVAILABLE',
  ERR_AUTH: 'AUTHENTICATION_FAILED',
  ERR_SESSION: 'SESSION_EXPIRED',
} as const;

// Wrap API calls with error handling
function handleStakeEngineError(error: any): never {
  if (error.code && ERROR_CODES[error.code as keyof typeof ERROR_CODES]) {
    throw new StakeEngineError(
      error.message || 'Stake Engine error',
      error.code,
      error.details
    );
  }
  throw error;
}
```

**Success criteria:**
- [ ] Error types defined
- [ ] Error handling in all functions
- [ ] User-friendly error messages

---

### Day 10-11: Replace Mock Client (6-8 hours)

#### Step 6.1: Update GameController.ts (2 hours)

Current (mock):
```typescript
import { mockRgsClient } from '../api/mockRgsClient';
```

New (real):
```typescript
import * as stakeRgs from '../api/stakeRgsClient';
import { mockRgsClient } from '../api/mockRgsClient';
import { config } from '../config';

// Choose client based on config
const rgsClient = config.useMockRgs ? mockRgsClient : stakeRgs;
```

**Changes needed in GameController:**

1. **Authentication on init:**
   ```typescript
   async initialize() {
     if (!config.useMockRgs) {
       await stakeRgs.authenticate();
     }
     // ... rest of init
   }
   ```

2. **Update play() method:**
   ```typescript
   async startRound() {
     try {
       const book = await rgsClient.play(this.currentBet);
       await this.processBook(book);
     } catch (error) {
       if (error instanceof StakeEngineError) {
         this.handleGameError(error);
       } else {
         throw error;
       }
     }
   }
   ```

3. **Add error handler:**
   ```typescript
   private handleGameError(error: StakeEngineError) {
     switch (error.code) {
       case ERROR_CODES.ERR_IS:
         this.showError('Insufficient balance');
         break;
       case ERROR_CODES.ERR_IPB:
         this.showError('Invalid bet amount');
         break;
       case ERROR_CODES.ERR_GSU:
         this.showError('Game temporarily unavailable');
         break;
       default:
         this.showError('An error occurred');
     }
   }
   ```

**Success criteria:**
- [ ] Can toggle mock/real RGS
- [ ] All API calls updated
- [ ] Error handling works
- [ ] TypeScript compiles

---

#### Step 6.2: Add Event Listeners (2 hours)

In `GameApp.ts`:

```typescript
import { onBalanceUpdate, onRoundStateChange } from './api/stakeRgsClient';

// In initialize()
onBalanceUpdate((balance) => {
  this.controlsView.updateBalance(balance);
});

onRoundStateChange((state) => {
  console.log('[GameApp] Round state:', state);
  // Handle state changes if needed
});
```

**Success criteria:**
- [ ] Balance updates in real-time
- [ ] State changes logged
- [ ] UI updates correctly

---

#### Step 6.3: Update ControlsView (1 hour)

Add balance display:

```typescript
// In ControlsView.ts

private balanceText: Text;

constructor() {
  // ... existing code
  
  // Add balance text
  this.balanceText = new Text(`Balance: $0.00`, {
    fontSize: 24,
    fill: 0xFFFFFF,
  });
  this.balanceText.position.set(50, 50);
  this.addChild(this.balanceText);
}

updateBalance(balance: number) {
  this.balanceText.text = `Balance: ${formatMoney(balance)}`;
}
```

**Success criteria:**
- [ ] Balance displays correctly
- [ ] Updates in real-time
- [ ] Formatted nicely

---

### Day 12-13: Testing & Debugging (10-12 hours)

#### Step 7.1: Test Mock vs Real Toggle (1 hour)

```bash
# Test with mock (should work as before)
VITE_USE_MOCK_RGS=true npm run dev

# Test with real Stake Engine
VITE_USE_MOCK_RGS=false npm run dev
```

**Test scenarios:**
- [ ] Switch between mock and real
- [ ] Authentication works
- [ ] First round plays successfully
- [ ] Balance updates correctly

---

#### Step 7.2: Test All Hand Types (3 hours)

Play 50+ rounds and verify:

**Checklist:**
- [ ] High Card (Low) - appears ~24%
- [ ] High Card (High) - appears ~17%
- [ ] Pair (Low) - appears ~23%
- [ ] Pair (High) - appears ~22%
- [ ] Two Pair - appears ~4%
- [ ] Three of a Kind - appears ~7%
- [ ] Straight - appears ~1%
- [ ] Flush - appears ~0.4%
- [ ] Full House - appears ~0.3%
- [ ] Four of a Kind - appears ~0.3%
- [ ] Straight Flush - appears rarely
- [ ] Royal Flush - appears very rarely
- [ ] Jokers appear ~18% of rounds
- [ ] Joker transformation animates correctly

**Success criteria:**
- [ ] All hand types work
- [ ] Payouts correct
- [ ] Animations play
- [ ] No console errors

---

#### Step 7.3: Test Error Scenarios (2 hours)

**Test cases:**

1. **Insufficient Balance:**
   - Set balance low
   - Try high bet
   - Verify error message

2. **Network Error:**
   - Disconnect internet mid-round
   - Verify error handling
   - Verify recovery on reconnect

3. **Invalid Bet:**
   - Try bet outside allowed range
   - Verify error message

4. **Session Expired:**
   - Wait for session timeout
   - Try to play
   - Verify re-authentication

**Success criteria:**
- [ ] All errors handled gracefully
- [ ] User sees helpful messages
- [ ] Game recovers from errors
- [ ] No crashes

---

#### Step 7.4: Performance Testing (2 hours)

**Metrics to track:**
- API response time: < 200ms
- Animation FPS: stable 60fps
- Memory usage: no leaks
- Round completion time: 3-5 seconds

**Tools:**
```bash
# Chrome DevTools
# - Performance tab
# - Memory tab
# - Network tab

# Or use Lighthouse
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

**Success criteria:**
- [ ] Fast API responses
- [ ] Smooth animations
- [ ] No memory leaks
- [ ] Good Lighthouse score (>90)

---

### Day 14: Final Integration Testing (4-6 hours)

#### Step 8.1: Cross-Browser Testing (2 hours)

Test on:
- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Chrome (mobile)
- [ ] Safari (iOS)

**Success criteria:**
- [ ] Works on all browsers
- [ ] UI looks correct
- [ ] Animations smooth
- [ ] No console errors

---

#### Step 8.2: Mobile Testing (2 hours)

Test on real devices:
- [ ] iPhone (various sizes)
- [ ] Android phone
- [ ] iPad / tablet

**Test:**
- Touch controls work
- Responsive layout
- Performance good
- No mobile-specific bugs

**Success criteria:**
- [ ] Mobile experience excellent
- [ ] Touch-friendly
- [ ] Readable on small screens

---

#### Step 8.3: Document Known Issues (1 hour)

Create `client/KNOWN_ISSUES.md`:

```markdown
# Known Issues

## Critical (Blockers)
- None ✅

## High Priority
- [ ] Issue 1...
- [ ] Issue 2...

## Medium Priority
- [ ] Issue 3...

## Low Priority / Nice to Have
- [ ] Issue 4...
```

**Success criteria:**
- [ ] All issues documented
- [ ] Priorities assigned
- [ ] Critical issues: NONE

---

## PHASE 3: Production Deployment (Days 15-21)

**Status:** ⏳ PENDING  
**Goal:** Live game on Stake Engine CDN  
**Timeline:** 1 week

---

### Day 15-16: Build & Deploy Prep (4-6 hours)

#### Step 9.1: Production Build (30 min)

```bash
cd ~/Projects/_casik/pokerspin/client

# Clean previous builds
rm -rf dist/

# Production build
VITE_USE_MOCK_RGS=false npm run build

# Verify build
ls -lh dist/
du -sh dist/
```

**Expected output:**
```
dist/
├── index.html
├── assets/
│   ├── index-abc123.js (minified)
│   ├── index-def456.css
│   └── cards/ (all card images)
└── ... other assets
```

**Success criteria:**
- [ ] Build completes without errors
- [ ] All assets included
- [ ] Files minified
- [ ] Size reasonable (~2-5MB total)

---

#### Step 9.2: Test Production Build Locally (30 min)

```bash
# Serve production build locally
npx serve dist/

# Open in browser
open http://localhost:3000
```

**Test:**
- [ ] Game loads correctly
- [ ] All features work
- [ ] Assets load (cards, etc.)
- [ ] No console errors
- [ ] Production API endpoints used

**Success criteria:**
- [ ] Prod build works locally
- [ ] Identical to dev experience
- [ ] No broken links/assets

---

#### Step 9.3: Prepare for CDN Upload (1 hour)

**Check Stake Engine CDN requirements:**

1. **File structure:**
   - Do they want specific structure?
   - Any manifest files needed?
   - Asset path requirements?

2. **Configuration:**
   - Environment variables for prod?
   - API endpoint configuration?
   - CDN URL references?

3. **Create deployment package:**
   ```bash
   # Zip for upload
   cd dist/
   zip -r ../joker-poker-v1.0.0.zip .
   cd ..
   
   # Verify
   unzip -l joker-poker-v1.0.0.zip
   ```

**Success criteria:**
- [ ] Upload package ready
- [ ] Meets CDN requirements
- [ ] All files included

---

### Day 17-19: QA & Testing (3 days)

#### Step 10.1: Deploy to Staging (2 hours)

**If Stake Engine has staging environment:**

```bash
# Upload to staging CDN
# (Method depends on Stake Engine process)

# Via admin panel:
open https://admin.stake-engine.com/games/joker_poker/deploy

# Or via CLI (if provided):
stake-deploy --game joker_poker --env staging --file joker-poker-v1.0.0.zip
```

**Success criteria:**
- [ ] Deployed to staging
- [ ] Accessible via staging URL
- [ ] Loads correctly

---

#### Step 10.2: Smoke Testing on Staging (2 hours)

**Basic tests:**
- [ ] Game loads
- [ ] Can authenticate
- [ ] Can place bet
- [ ] Round completes successfully
- [ ] Wins pay correctly
- [ ] Balance updates
- [ ] Can play multiple rounds

**Success criteria:**
- [ ] All basic features work
- [ ] No critical bugs
- [ ] Ready for full QA

---

#### Step 10.3: Full QA Test Plan (2-3 days)

**Test Matrix:**

| Test Category | Test Cases | Priority |
|--------------|-----------|----------|
| **Functional** | 50+ | High |
| **UI/UX** | 20+ | High |
| **Performance** | 10+ | Medium |
| **Security** | 5+ | High |
| **Compatibility** | 15+ | Medium |

**Detailed test cases:**

**Functional Tests (50+):**
1. [ ] Authentication works
2. [ ] Balance loads correctly
3. [ ] Can select bet amount (all 9 levels)
4. [ ] Play button works
5. [ ] Round starts correctly
6. [ ] Cards deal sequentially
7. [ ] Flop reveals (3 cards)
8. [ ] Turn reveals (1 card)
9. [ ] River reveals (1 card)
10. [ ] Joker appears ~18% of time
11. [ ] Joker transformation animates
12. [ ] Hand evaluation correct for all 13 types
13. [ ] Payout calculation correct
14. [ ] Win modal shows correct tier
15. [ ] Balance updates after win/loss
16. [ ] Can continue to next round
17. [ ] Round end acknowledged correctly
18. ... (continue for all features)

**UI/UX Tests (20+):**
1. [ ] Layout responsive on desktop
2. [ ] Layout responsive on mobile
3. [ ] Text readable on all screen sizes
4. [ ] Buttons clickable/touchable
5. [ ] Animations smooth (60fps)
6. [ ] No visual glitches
7. [ ] Color scheme consistent
8. [ ] Win modal looks good (all tiers)
9. ... (continue)

**Performance Tests (10+):**
1. [ ] Page load < 3 seconds
2. [ ] API response < 200ms
3. [ ] FPS stable 60
4. [ ] Memory usage < 200MB
5. [ ] No memory leaks (play 100 rounds)
6. [ ] CPU usage reasonable
7. ... (continue)

**Security Tests (5+):**
1. [ ] API keys not exposed in client
2. [ ] No console.log secrets
3. [ ] HTTPS used everywhere
4. [ ] No XSS vulnerabilities
5. [ ] No CSRF vulnerabilities

**Compatibility Tests (15+):**
1. [ ] Chrome 120+ (desktop)
2. [ ] Firefox 120+ (desktop)
3. [ ] Safari 17+ (desktop)
4. [ ] Edge 120+ (desktop)
5. [ ] Chrome (Android)
6. [ ] Safari (iOS 17+)
7. [ ] Tablet (iPad)
8. [ ] Tablet (Android)
9. [ ] 1920x1080 resolution
10. [ ] 1366x768 resolution
11. [ ] Mobile portrait (375x812)
12. [ ] Mobile landscape
13. ... (continue)

**Success criteria:**
- [ ] 100% of high priority tests pass
- [ ] 95%+ of all tests pass
- [ ] No critical bugs
- [ ] No blockers

---

### Day 20: Bug Fixes & Polish (6-8 hours)

#### Step 11.1: Prioritize Issues (1 hour)

From QA testing, categorize all issues:

**Critical (Must Fix):**
- Game-breaking bugs
- Security issues
- Major functionality broken

**High (Should Fix):**
- Important features not working
- Major UI issues
- Performance problems

**Medium (Nice to Fix):**
- Minor bugs
- Small UI improvements
- Edge cases

**Low (Can Wait):**
- Cosmetic issues
- Very rare edge cases
- Nice-to-have features

**Success criteria:**
- [ ] All issues categorized
- [ ] Plan to fix critical & high
- [ ] Medium/low issues documented for later

---

#### Step 11.2: Fix Critical & High Issues (4-6 hours)

Fix issues one by one:

1. [ ] Critical issue 1
2. [ ] Critical issue 2
3. [ ] High issue 1
4. [ ] High issue 2
5. ... (continue)

**For each fix:**
- Write fix
- Test locally
- Deploy to staging
- Retest on staging
- Mark as resolved

**Success criteria:**
- [ ] All critical issues fixed
- [ ] All high issues fixed
- [ ] Verified on staging

---

#### Step 11.3: Final Polish (1 hour)

**Polish checklist:**
- [ ] Remove debug console.logs
- [ ] Remove commented code
- [ ] Fix typos in UI text
- [ ] Optimize images if needed
- [ ] Add loading states where missing
- [ ] Improve error messages
- [ ] Add tooltips where helpful
- [ ] Check all copy/text

**Success criteria:**
- [ ] Production-quality polish
- [ ] No debug code
- [ ] Professional appearance

---

### Day 21: Production Launch 🚀

#### Step 12.1: Final Pre-Launch Checks (1 hour)

**Checklist:**
- [ ] All tests passed
- [ ] No critical bugs
- [ ] Staging works perfectly
- [ ] Production build ready
- [ ] Backup plan if issues arise
- [ ] Rollback plan ready
- [ ] Team briefed
- [ ] Support ready

**Success criteria:**
- [ ] Green light from all stakeholders
- [ ] Ready to launch

---

#### Step 12.2: Deploy to Production (30 min)

```bash
# Final production build
npm run build

# Create deployment package
cd dist && zip -r ../joker-poker-prod-v1.0.0.zip . && cd ..

# Deploy to production
# (Via Stake Engine process)

# Verify deployment
curl -I https://cdn.stake-engine.com/games/joker_poker/1.0.0/
```

**Success criteria:**
- [ ] Deployed successfully
- [ ] Accessible via prod URL
- [ ] Health check passes

---

#### Step 12.3: Production Smoke Test (30 min)

**Test on production:**
1. [ ] Load game
2. [ ] Authenticate
3. [ ] Play 10 rounds
4. [ ] Verify all hand types work
5. [ ] Check balance updates
6. [ ] Test on mobile
7. [ ] Test on desktop

**Success criteria:**
- [ ] Everything works on production
- [ ] No errors
- [ ] Performance good

---

#### Step 12.4: Monitor Initial Launch (2-4 hours)

**Monitoring:**
- Watch error logs
- Monitor API response times
- Check user reports
- Track RTP (should trend to 98.34%)
- Watch for any issues

**Metrics to track:**
- Total rounds played
- Unique players
- Average bet size
- Win rate
- Error rate
- API latency

**Success criteria:**
- [ ] No critical errors
- [ ] RTP trending correctly
- [ ] Users playing successfully
- [ ] Performance good

---

#### Step 12.5: Launch Announcement (30 min)

**Announce launch:**
- Internal team notification
- Stakeholders update
- Marketing (if applicable)
- Social media (if applicable)

```markdown
🎉 Joker Poker Board is LIVE! 🎰

5-card poker with wild Jokers
RTP: 98.34%
Max win: $400,000

Play now: [link]
```

**Success criteria:**
- [ ] Launch announced
- [ ] Team celebrates! 🎉

---

## 📊 Success Metrics

### Technical Metrics:
- [ ] RTP: 98.34% ±0.5% (over 10K+ rounds)
- [ ] API latency: < 200ms (p95)
- [ ] Error rate: < 0.1%
- [ ] Uptime: 99.9%+
- [ ] FPS: Stable 60fps
- [ ] Load time: < 3 seconds
- [ ] Mobile score: 90+ (Lighthouse)

### Business Metrics:
- [ ] Game live on Stake Engine ✅
- [ ] 100+ rounds played (Day 1)
- [ ] No critical bugs
- [ ] Positive user feedback
- [ ] All features working

---

## 🚨 Risk Management

### Potential Risks:

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Stake Engine upload issue | High | High | Contact support early, have backup plan |
| Frontend integration bugs | Medium | Medium | Thorough testing, staged rollout |
| Performance issues | Low | Medium | Load testing, optimization |
| RTP drift | Low | High | Monitor closely, validate math again |
| Security vulnerability | Low | Critical | Security audit, code review |

### Contingency Plans:

**If upload fails:**
- Escalate to Stake Engine support
- Request alternative upload method
- Use manual upload if available

**If integration breaks:**
- Rollback to mock RGS
- Fix issues on staging
- Redeploy when fixed

**If production has issues:**
- Rollback immediately
- Fix on staging
- Redeploy with fixes

---

## 📋 Final Checklist

### Week 1: Math SDK ✅
- [x] Fork Math SDK
- [x] Implement game.py
- [x] Tune RTP to 98.34%
- [x] Validate with 1M simulations
- [ ] Generate 10M outcomes ⏳ CURRENT
- [ ] Upload to Stake Engine

### Week 2: Frontend Integration ⏳
- [ ] Install Stake Engine client
- [ ] Create stakeRgsClient.ts
- [ ] Replace mock client
- [ ] Add event listeners
- [ ] Test all features
- [ ] Fix bugs

### Week 3: Production ⏳
- [ ] Build for production
- [ ] Deploy to staging
- [ ] Full QA testing
- [ ] Fix critical issues
- [ ] Deploy to production
- [ ] Launch! 🚀

---

## 🎯 Next Immediate Actions

**RIGHT NOW:**

1. **Generate 10M outcomes (30-60 min)**
   ```bash
   cd ~/Projects/_casik/pokerspin-math
   source env/bin/activate
   python -m games.joker_poker.simulate --generate --count 10000000
   ```

2. **Research Stake Engine upload (2-4 hours)**
   - Check Makefile
   - Read README
   - Check official docs
   - Contact support if needed

3. **Document findings**
   - Update this roadmap with actual process
   - Note any blockers
   - Plan next steps

**THIS WEEK:**
- Complete outcome generation
- Get Stake Engine credentials
- Upload outcomes
- Verify upload success

**NEXT WEEK:**
- Start frontend integration
- Install Stake Engine client
- Create RGS wrapper
- Begin testing

---

**Last Updated:** 2026-01-11  
**Status:** Week 1 - Day 5 (Generating outcomes)  
**Timeline:** 2-3 weeks to launch  
**Confidence:** High ✅

**Let's ship this! 🚀🎰✨**
