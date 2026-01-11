# 🎰 Stake Engine Implementation - Joker Poker Board

**Project:** Joker Poker Board  
**Platform:** Stake Engine  
**Date:** 2026-01-11  
**Goal:** Configure Stake Math SDK + Integrate TypeScript Client

---

## 📋 Overview

Stake Engine использует **pre-generated outcomes** архитектуру:

```
┌─────────────────────────────────────────────────────────────┐
│  PHASE 1: Game Math Setup (один раз)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Stake Math SDK (Python)                               │ │
│  │  ✓ Определяем правила Joker Poker                     │ │
│  │  ✓ Генерируем все возможные исходы                    │ │
│  │  ✓ Оптимизируем RTP (96-98%)                          │ │
│  │  ✓ Создаем lookup tables                              │ │
│  │  ✓ Экспортируем в Stake Engine формат                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↓                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Upload to Stake Engine Platform                       │ │
│  │  ✓ Game config + paytable                              │ │
│  │  ✓ Pre-generated outcomes                              │ │
│  │  ✓ Event schemas                                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  PHASE 2: Frontend Integration                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Client (PixiJS + TypeScript)                          │ │
│  │  ✓ Install @stake-engine/ts-client                     │ │
│  │  ✓ Replace mockRgsClient                               │ │
│  │  ✓ Use RGSClient.Authenticate()                        │ │
│  │  ✓ Use RGSClient.Play()                                │ │
│  │  ✓ Use RGSClient.EndRound()                            │ │
│  │  ✓ Listen to balanceUpdate events                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

🚫 Node.js backend НЕ нужен! Stake Engine RGS все делает сам.
```

---

## 1. Stake Math SDK Configuration

### 1.1 Installation

```bash
# Clone Stake Math SDK
git clone https://github.com/StakeEngine/math-sdk.git
cd math-sdk

# Setup (requires Python 3.12+)
make setup

# Or manually
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 1.2 Project Structure

```
math-sdk/
├── games/
│   └── joker_poker/              # Наша игра
│       ├── __init__.py
│       ├── config.py             # Game configuration
│       ├── symbols.py            # Card symbols
│       ├── board.py              # 5-card board logic
│       ├── evaluator.py          # Hand evaluation
│       ├── joker.py              # Joker resolution
│       └── paytable.py           # Payout rules
├── src/
│   └── carrot/                   # Stake Engine core
└── uploads/
    └── joker_poker/              # Generated files
        ├── config.json
        ├── outcomes.csv
        └── lookup_tables/
```

### 1.3 Game Configuration (`games/joker_poker/config.py`)

```python
from carrot import GameConfig, GameMode, BetConfig

class JokerPokerConfig(GameConfig):
    """
    Joker Poker Board - 5 card board-only poker with wild Jokers
    """
    
    # Game metadata
    game_id = "joker_poker"
    game_name = "Joker Poker Board"
    version = "1.0.0"
    
    # Game modes
    modes = {
        "BASE": GameMode(
            mode_id="BASE",
            name="Base Game",
            description="Standard 5-card poker board"
        )
    }
    
    # Bet configuration
    bet_config = BetConfig(
        currency="USD",
        bet_levels=[
            100000,      # $0.10
            500000,      # $0.50
            1000000,     # $1.00
            5000000,     # $5.00
            10000000,    # $10.00
            50000000,    # $50.00
            100000000,   # $100.00
            500000000,   # $500.00
            1000000000,  # $1,000.00
        ],
        min_bet=100000,
        max_bet=1000000000,
        default_bet=1000000,
    )
    
    # Max win
    max_win = 400_000_000_000  # $400,000
    
    # RTP target
    target_rtp = 97.0  # 97%
    
    # Simulation settings
    num_simulations = 10_000_000  # 10M rounds for accuracy
```

### 1.4 Symbol Definition (`games/joker_poker/symbols.py`)

```python
from carrot import Symbol, SymbolConfig

class CardSymbol(Symbol):
    """Playing card symbol"""
    
    def __init__(self, rank: str, suit: str | None = None):
        self.rank = rank
        self.suit = suit
        
        # Symbol ID for Stake Engine
        if rank == "JOKER":
            symbol_id = "JOKER"
        else:
            symbol_id = f"{rank}{suit}"
        
        super().__init__(
            symbol_id=symbol_id,
            name=symbol_id,
            is_wild=(rank == "JOKER")
        )

def create_deck() -> list[CardSymbol]:
    """Create full 54-card deck"""
    
    ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
    suits = ['C', 'D', 'H', 'S']
    
    deck = []
    
    # 52 standard cards
    for suit in suits:
        for rank in ranks:
            deck.append(CardSymbol(rank, suit))
    
    # 2 Jokers
    deck.append(CardSymbol("JOKER"))
    deck.append(CardSymbol("JOKER"))
    
    return deck

class JokerPokerSymbols(SymbolConfig):
    """Symbol configuration for Joker Poker"""
    
    def __init__(self):
        self.deck = create_deck()
        
        super().__init__(
            symbols=self.deck,
            wild_symbols=["JOKER"],
            max_wild_per_board=2  # Max 2 Jokers per board
        )
```

### 1.5 Board Logic (`games/joker_poker/board.py`)

```python
from carrot import Board, BoardConfig
from .symbols import CardSymbol

class PokerBoard(Board):
    """5-card poker board"""
    
    def __init__(self):
        super().__init__(
            rows=1,
            cols=5,
            total_positions=5
        )
    
    def deal(self, deck: list[CardSymbol]) -> list[CardSymbol]:
        """Deal 5 random cards from deck"""
        import random
        
        shuffled = deck.copy()
        random.shuffle(shuffled)
        
        return shuffled[:5]
    
    def resolve_wilds(self, board: list[CardSymbol]) -> list[CardSymbol]:
        """
        Resolve Jokers to optimal cards.
        
        This is the CORE logic - finds best substitution.
        """
        from .evaluator import HandEvaluator
        from .paytable import calculate_payout
        
        joker_positions = [
            i for i, card in enumerate(board) 
            if card.rank == "JOKER"
        ]
        
        if not joker_positions:
            return board
        
        # Get available cards (not on board)
        used_cards = {
            f"{c.rank}{c.suit}" for c in board 
            if c.rank != "JOKER"
        }
        
        available_cards = [
            card for card in self.get_all_standard_cards()
            if f"{card.rank}{card.suit}" not in used_cards
        ]
        
        best_board = board.copy()
        best_payout = 0
        
        if len(joker_positions) == 1:
            # Single Joker: try 48 cards
            pos = joker_positions[0]
            
            for card in available_cards:
                test_board = board.copy()
                test_board[pos] = card
                
                hand = HandEvaluator.evaluate(test_board)
                payout = calculate_payout(hand, bet=1)
                
                if payout > best_payout:
                    best_payout = payout
                    best_board = test_board
        
        elif len(joker_positions) == 2:
            # Two Jokers: try 48 * 47 combinations
            pos1, pos2 = joker_positions
            
            for i, card1 in enumerate(available_cards):
                for card2 in available_cards[i+1:]:
                    test_board = board.copy()
                    test_board[pos1] = card1
                    test_board[pos2] = card2
                    
                    hand = HandEvaluator.evaluate(test_board)
                    payout = calculate_payout(hand, bet=1)
                    
                    if payout > best_payout:
                        best_payout = payout
                        best_board = test_board
        
        return best_board
    
    def get_all_standard_cards(self) -> list[CardSymbol]:
        """Get all 52 standard cards (no Jokers)"""
        ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
        suits = ['C', 'D', 'H', 'S']
        
        cards = []
        for suit in suits:
            for rank in ranks:
                cards.append(CardSymbol(rank, suit))
        
        return cards
```

### 1.6 Hand Evaluator (`games/joker_poker/evaluator.py`)

```python
from typing import Optional
from .symbols import CardSymbol

class HandType:
    ROYAL_FLUSH = "ROYAL_FLUSH"
    STRAIGHT_FLUSH = "STRAIGHT_FLUSH"
    FOUR_OF_A_KIND = "FOUR_OF_A_KIND"
    FULL_HOUSE = "FULL_HOUSE"
    FLUSH = "FLUSH"
    STRAIGHT = "STRAIGHT"
    THREE_OF_A_KIND = "THREE_OF_A_KIND"
    TWO_PAIR = "TWO_PAIR"
    PAIR = "PAIR"
    HIGH_CARD = "HIGH_CARD"

class RankCategory:
    LOW = "LOW"    # 2-10
    HIGH = "HIGH"  # J-A
    ANY = "ANY"

class HandResult:
    def __init__(
        self,
        hand_type: str,
        rank_category: str,
        primary_rank: str,
        kickers: list[str],
        winning_positions: list[int]
    ):
        self.hand_type = hand_type
        self.rank_category = rank_category
        self.primary_rank = primary_rank
        self.kickers = kickers
        self.winning_positions = winning_positions

class HandEvaluator:
    """Evaluates 5-card poker hands"""
    
    @staticmethod
    def evaluate(cards: list[CardSymbol]) -> HandResult:
        """Evaluate 5 cards and return best hand"""
        
        if len(cards) != 5:
            raise ValueError(f"Must have 5 cards, got {len(cards)}")
        
        # Check for Jokers (should be resolved)
        if any(c.rank == "JOKER" for c in cards):
            raise ValueError("Jokers must be resolved before evaluation")
        
        # Check hands in order of strength
        if result := HandEvaluator._check_royal_flush(cards):
            return result
        if result := HandEvaluator._check_straight_flush(cards):
            return result
        if result := HandEvaluator._check_four_of_a_kind(cards):
            return result
        if result := HandEvaluator._check_full_house(cards):
            return result
        if result := HandEvaluator._check_flush(cards):
            return result
        if result := HandEvaluator._check_straight(cards):
            return result
        if result := HandEvaluator._check_three_of_a_kind(cards):
            return result
        if result := HandEvaluator._check_two_pair(cards):
            return result
        if result := HandEvaluator._check_pair(cards):
            return result
        
        return HandEvaluator._check_high_card(cards)
    
    @staticmethod
    def _check_royal_flush(cards: list[CardSymbol]) -> Optional[HandResult]:
        """Check for Royal Flush: A, K, Q, J, 10 all same suit"""
        
        if not HandEvaluator._is_flush(cards):
            return None
        
        ranks = {c.rank for c in cards}
        royal_ranks = {'10', 'J', 'Q', 'K', 'A'}
        
        if ranks == royal_ranks:
            return HandResult(
                hand_type=HandType.ROYAL_FLUSH,
                rank_category=RankCategory.ANY,
                primary_rank='A',
                kickers=[],
                winning_positions=[0, 1, 2, 3, 4]
            )
        
        return None
    
    # ... (implement other hand checks similar to HandEvaluator.ts)
    
    @staticmethod
    def _is_flush(cards: list[CardSymbol]) -> bool:
        """Check if all cards same suit"""
        suits = {c.suit for c in cards}
        return len(suits) == 1
    
    @staticmethod
    def _get_rank_category(rank: str) -> str:
        """Determine if rank is LOW (2-10) or HIGH (J-A)"""
        face_cards = {'J', 'Q', 'K', 'A'}
        return RankCategory.HIGH if rank in face_cards else RankCategory.LOW
```

### 1.7 Paytable (`games/joker_poker/paytable.py`)

```python
from .evaluator import HandType, RankCategory

PAYTABLE = {
    HandType.HIGH_CARD: {
        RankCategory.LOW: 0.0,
        RankCategory.HIGH: 0.1,
    },
    HandType.PAIR: {
        RankCategory.LOW: 0.2,
        RankCategory.HIGH: 0.4,
    },
    HandType.TWO_PAIR: {
        RankCategory.LOW: 0.4,
        RankCategory.HIGH: 0.8,
    },
    HandType.THREE_OF_A_KIND: {
        RankCategory.LOW: 1.5,
        RankCategory.HIGH: 3.0,
    },
    HandType.STRAIGHT: {
        RankCategory.ANY: 5.0,
    },
    HandType.FLUSH: {
        RankCategory.ANY: 10.0,
    },
    HandType.FULL_HOUSE: {
        RankCategory.ANY: 20.0,
    },
    HandType.FOUR_OF_A_KIND: {
        RankCategory.ANY: 40.0,
    },
    HandType.STRAIGHT_FLUSH: {
        RankCategory.ANY: 100.0,
    },
    HandType.ROYAL_FLUSH: {
        RankCategory.ANY: 1000.0,
    },
}

def calculate_payout(hand, bet: int) -> int:
    """Calculate payout for a hand"""
    
    multiplier = PAYTABLE[hand.hand_type][hand.rank_category]
    
    if multiplier == 0:
        return 0
    
    payout = int(bet * multiplier)
    
    # Cap at max win ($400,000)
    MAX_WIN = 400_000_000_000
    return min(payout, MAX_WIN)
```

### 1.8 Generate Outcomes

```bash
# Run simulation to generate all outcomes
python -m games.joker_poker.simulate

# This will:
# 1. Generate 10M random boards
# 2. Resolve Jokers optimally
# 3. Evaluate hands
# 4. Calculate payouts
# 5. Optimize RTP
# 6. Export to Stake Engine format
```

### 1.9 Upload to Stake Engine

```bash
# Upload game to Stake Engine platform
make upload GAME=joker_poker

# Or use Stake Engine CLI
stake-engine upload \
  --game joker_poker \
  --config uploads/joker_poker/config.json \
  --outcomes uploads/joker_poker/outcomes.csv
```

---

## 2. Frontend Integration

### 2.1 Install TypeScript Client

```bash
cd packages/client

# Install Stake Engine client
npm install stake-engine

# Types are included!
```

### 2.2 Create RGS Client (`client/src/api/stakeRgsClient.ts`)

```typescript
import { RGSClient } from 'stake-engine';
import type {
  AuthenticateResponse,
  PlayResponse,
  EndRoundResponse,
  BalanceResponse,
} from '@pokerspin/shared/types';

/**
 * Real Stake Engine RGS Client
 * 
 * Replaces mockRgsClient.ts
 */

// Initialize RGS Client
export const rgsClient = RGSClient({
  url: window.location.href,
});

/**
 * Authenticate session
 */
export async function authenticate(): Promise<AuthenticateResponse> {
  try {
    const response = await rgsClient.Authenticate();
    
    console.log('[StakeRGS] Authenticated:', response);
    
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
    throw error;
  }
}

/**
 * Play round
 */
export async function play(
  sessionID: string,
  amount: number,
  mode: 'BASE' = 'BASE'
): Promise<PlayResponse> {
  try {
    const response = await rgsClient.Play({ amount, mode });
    
    console.log('[StakeRGS] Play response:', response);
    
    return {
      balance: response.balance.amount,
      round: {
        id: response.round.id,
        events: response.round.events,
      },
    };
  } catch (error) {
    console.error('[StakeRGS] Play failed:', error);
    throw error;
  }
}

/**
 * End round
 */
export async function endRound(sessionID: string): Promise<EndRoundResponse> {
  try {
    const response = await rgsClient.EndRound();
    
    console.log('[StakeRGS] End round:', response);
    
    return {
      balance: response.balance.amount,
    };
  } catch (error) {
    console.error('[StakeRGS] End round failed:', error);
    throw error;
  }
}

/**
 * Get balance
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
 * Display amount with currency formatting
 */
export function displayAmount(amount: number): string {
  return rgsClient.DisplayAmount(amount, {
    removeSymbol: false,
    decimals: 2,
    wholeNumberDecimals: true,
  });
}
```

### 2.3 Update Game Controller

```typescript
// client/src/game/GameController.ts

import { GameStateManager } from './GameStateManager';
import { EventProcessor, AnimationAction } from './EventProcessor';

// Replace mockRgsClient with stakeRgsClient
import * as stakeRgs from '../api/stakeRgsClient';

export class GameController {
  private stateManager: GameStateManager;
  private eventProcessor: EventProcessor;
  
  constructor(stateManager: GameStateManager) {
    this.stateManager = stateManager;
    this.eventProcessor = new EventProcessor();
  }
  
  async initialize(): Promise<void> {
    console.log('[GameController] Initializing with Stake Engine...');
    this.stateManager.setState('INIT');
    
    try {
      // Authenticate with Stake Engine
      const response = await stakeRgs.authenticate();
      
      // Update state
      this.stateManager.setSessionID(response.sessionID);
      this.stateManager.setConfig(response.config);
      this.stateManager.setBalance(response.balance);
      
      console.log('[GameController] Authenticated successfully');
      
      // Ready to play
      this.stateManager.setState('IDLE');
    } catch (error) {
      console.error('[GameController] Initialization failed:', error);
      this.stateManager.setState('ERROR');
      throw error;
    }
  }
  
  async play(): Promise<void> {
    if (!this.stateManager.canPlay()) {
      console.warn('[GameController] Cannot play in current state');
      return;
    }
    
    console.log('[GameController] Starting round with Stake Engine...');
    this.stateManager.setState('SPINNING');
    this.stateManager.resetBoard();
    this.stateManager.setLastWin(0);
    
    try {
      const sessionID = this.stateManager.getSessionID();
      const betAmount = this.stateManager.getCurrentBet();
      
      if (!sessionID) {
        throw new Error('No session ID');
      }
      
      // Call Stake Engine RGS
      const response = await stakeRgs.play(sessionID, betAmount, 'BASE');
      
      // Update balance (after bet deducted)
      this.stateManager.setBalance(response.balance);
      
      // Store events
      this.stateManager.setCurrentEvents(response.round.events);
      
      // Process events
      const actions = this.eventProcessor.processEvents(response.round.events);
      
      // Execute animations
      await this.executeAnimationQueue(actions);
      
    } catch (error) {
      console.error('[GameController] Play failed:', error);
      this.stateManager.setState('ERROR');
      throw error;
    }
  }
  
  // ... rest of the code stays the same
}
```

### 2.4 Balance Event Listener

```typescript
// client/src/ui/ControlsView.ts

export class ControlsView extends PIXI.Container {
  private balanceText: PIXI.Text;
  
  init(): void {
    // ... existing UI setup ...
    
    // Listen to Stake Engine balance updates
    window.addEventListener('balanceUpdate', (event: Event) => {
      const customEvent = event as CustomEvent<{
        amount: number;
        currency: string;
      }>;
      
      console.log('[ControlsView] Balance update:', customEvent.detail);
      this.updateBalance(customEvent.detail.amount);
    });
    
    // Listen to round state
    window.addEventListener('roundActive', (event: Event) => {
      const customEvent = event as CustomEvent<{ active: boolean }>;
      
      console.log('[ControlsView] Round active:', customEvent.detail.active);
      this.setPlayEnabled(!customEvent.detail.active);
    });
  }
}
```

### 2.5 Remove Mock Client

```bash
# Delete old mock files
rm client/src/api/mockRgsClient.ts
rm client/src/api/mockData.ts

# Update imports in GameController.ts
# Change: import { mockRgsClient } from '../api/mockRgsClient';
# To:     import * as stakeRgs from '../api/stakeRgsClient';
```

---

## 3. Testing

### 3.1 Local Testing

Stake Engine provides test mode:

```typescript
// For development/testing
const rgsClient = RGSClient({
  url: window.location.href,
  mode: 'test', // Test mode with unlimited balance
});
```

### 3.2 Integration Testing

```bash
# Run game locally with Stake Engine test environment
npm run dev

# Open: http://localhost:3000?sessionID=test-session
```

### 3.3 Verify Events

Check that events from Stake Engine match your expectations:

```typescript
// Stake Engine returns events like:
{
  round: {
    id: "round-123",
    events: [
      {
        index: 0,
        type: "reveal_initial_board",
        board: [
          { symbol: "AS" },
          { symbol: "JOKER" },
          { symbol: "7H" },
          { symbol: "9S" },
          { symbol: "3C" }
        ]
      },
      {
        index: 1,
        type: "joker_transform",
        jokerTransforms: [
          { position: 1, targetSymbol: "AD" }
        ]
      },
      {
        index: 2,
        type: "hand_result",
        handCategory: "PAIR",
        payoutMultiplier: 0.4,
        winningPositions: [0, 1],
        jackpot: false
      }
    ]
  }
}
```

---

## 4. Deployment

### 4.1 Build for Production

```bash
cd packages/client
npm run build

# Output: dist/ folder with static files
```

### 4.2 Upload to Stake Engine

```bash
# Upload frontend to Stake Engine CDN
stake-engine upload-client \
  --game joker_poker \
  --version 1.0.0 \
  --path dist/
```

### 4.3 Game URL

Your game will be available at:

```
https://{team}.cdn.stake-engine.com/joker_poker/1.0.0/index.html
  ?sessionID={session}
  &lang=en
  &device=desktop
  &rgs_url={rgs_url}
```

---

## 5. Implementation Checklist

### Phase 1: Math SDK (Week 1) ✅

- [ ] Clone Stake Math SDK
- [ ] Create `games/joker_poker/` folder
- [ ] Implement `config.py` (game config)
- [ ] Implement `symbols.py` (card deck)
- [ ] Implement `board.py` (5-card board + Joker resolution)
- [ ] Implement `evaluator.py` (13 hand types)
- [ ] Implement `paytable.py` (multipliers)
- [ ] Run simulation (10M rounds)
- [ ] Verify RTP: 96-98%
- [ ] Upload to Stake Engine platform

### Phase 2: Frontend Integration (Week 2) ✅

- [ ] Install `stake-engine` npm package
- [ ] Create `stakeRgsClient.ts`
- [ ] Update `GameController.ts` imports
- [ ] Add balance event listeners
- [ ] Remove mock client files
- [ ] Test with Stake Engine test mode
- [ ] Verify all 15 scenarios work
- [ ] Test animations with real events

### Phase 3: Testing & Deploy (Week 3) ✅

- [ ] Integration testing
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Build for production
- [ ] Upload to Stake Engine CDN
- [ ] Get game URL
- [ ] QA testing
- [ ] Launch! 🚀

---

## 6. Key Differences from Original Plan

### ❌ What We DON'T Need:

- ❌ Node.js backend server
- ❌ Fastify / Express
- ❌ PostgreSQL database
- ❌ Redis for sessions
- ❌ Prisma ORM
- ❌ Real-time RNG in runtime
- ❌ Custom wallet management
- ❌ Custom session management

### ✅ What We DO Need:

- ✅ Stake Math SDK (Python) - one-time setup
- ✅ Pre-generate all outcomes
- ✅ Upload to Stake Engine
- ✅ TypeScript client in frontend
- ✅ Event listeners for balance
- ✅ Static file hosting (Stake CDN)

---

## 7. Resources

### Documentation:
- **Stake Engine Docs:** https://stake-engine.com/docs
- **Math SDK GitHub:** https://github.com/StakeEngine/math-sdk
- **TypeScript Client:** https://github.com/StakeEngine/ts-client

### Support:
- **Discord:** (check Stake Engine website)
- **GitHub Issues:** Report bugs on their repos

---

## ✅ Success Criteria

- ✅ Math SDK generates valid outcomes
- ✅ RTP within 96-98%
- ✅ All 13 hand types work correctly
- ✅ Joker finds optimal substitution
- ✅ Frontend uses Stake Engine client
- ✅ Balance updates correctly
- ✅ Events match frontend expectations
- ✅ Game uploaded to Stake Engine CDN
- ✅ Game playable at Stake URL

---

**Ready to implement!** 🚀

**Next step:** Setup Stake Math SDK and create Joker Poker game configuration.
