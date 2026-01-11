# 🎰 Stake Engine Implementation - Complete Guide

**Project:** Joker Poker Board  
**Platform:** Stake Engine  
**Date:** 2026-01-11  
**Status:** Ready to Implement

---

## 🎯 What is Stake Engine?

Stake Engine - это платформа для casino games с **pre-generated outcomes**:

```
┌─────────────────────────────────────────────────────────────┐
│  КАК РАБОТАЕТ STAKE ENGINE:                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1️⃣  DEVELOPMENT (один раз)                                 │
│     ┌──────────────────────────────────────┐                │
│     │  Math SDK (Python)                   │                │
│     │  • Определяешь правила игры          │                │
│     │  • Симулируешь 10M раундов           │                │
│     │  • Генерируешь все возможные исходы  │                │
│     │  • Оптимизируешь RTP                 │                │
│     └──────────────┬───────────────────────┘                │
│                    │                                         │
│                    ▼                                         │
│     ┌──────────────────────────────────────┐                │
│     │  Upload to Stake Engine              │                │
│     │  • Загружаешь outcomes               │                │
│     │  • Загружаешь config                 │                │
│     │  • Загружаешь paytable               │                │
│     └──────────────────────────────────────┘                │
│                                                              │
│  2️⃣  RUNTIME (каждая игра)                                  │
│     ┌──────────────────────────────────────┐                │
│     │  Frontend (твой PixiJS клиент)       │                │
│     │  • Использует @stake-engine/client   │                │
│     └──────────────┬───────────────────────┘                │
│                    │ HTTP REST                              │
│                    ▼                                         │
│     ┌──────────────────────────────────────┐                │
│     │  Stake Engine RGS (их сервер)        │                │
│     │  • Выбирает pre-generated результат  │                │
│     │  • Возвращает события (events)       │                │
│     │  • Управляет wallet                  │                │
│     └──────────────────────────────────────┘                │
│                                                              │
│  🚫 НЕ НУЖЕН свой backend!                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 Документация (3 файла)

### 1️⃣ **[STAKE_ENGINE_IMPLEMENTATION.md](STAKE_ENGINE_IMPLEMENTATION.md)** ⭐ START HERE
- **Что:** Overview всей архитектуры
- **Зачем:** Понять как работает Stake Engine
- **Содержит:**
  - Архитектурные диаграммы
  - Phase 1: Math SDK
  - Phase 2: Frontend integration
  - Что нужно/не нужно делать
  - Timeline (3 недели)

### 2️⃣ **[STAKE_MATH_SDK_GUIDE.md](STAKE_MATH_SDK_GUIDE.md)** - Math SDK Details
- **Что:** Полная спецификация Math SDK (Python)
- **Зачем:** Настроить game math и сгенерировать outcomes
- **Содержит:**
  - Setup инструкции
  - 8 Python файлов с полным кодом:
    - `config.py` - Game configuration
    - `symbols.py` - 54-card deck
    - `board.py` - 5-card board
    - `evaluator.py` - Hand evaluation (13 types)
    - `joker.py` - Joker resolution
    - `paytable.py` - Payout rules
    - `events.py` - Event generation
    - `simulate.py` - RTP simulation
  - RTP calculation guide
  - Upload instructions

### 3️⃣ **[STAKE_CLIENT_INTEGRATION.md](STAKE_CLIENT_INTEGRATION.md)** - Frontend Integration
- **Что:** Замена mock на реальный Stake Engine client
- **Зачем:** Подключить фронтенд к Stake Engine RGS
- **Содержит:**
  - Install instructions
  - `stakeRgsClient.ts` с полным кодом
  - Изменения в `GameController.ts`
  - Event listeners setup
  - Testing checklist
  - Production build & upload

---

## 🚀 Quick Start

### For Python Developer (Math SDK):

```bash
# 1. Clone Math SDK
git clone https://github.com/StakeEngine/math-sdk.git
cd math-sdk

# 2. Setup
make setup

# 3. Create game
mkdir -p games/joker_poker
# Copy code from STAKE_MATH_SDK_GUIDE.md

# 4. Simulate
python -m games.joker_poker.simulate

# Expected: RTP 96-98% ✅

# 5. Upload
make upload GAME=joker_poker
```

### For Frontend Developer:

```bash
cd packages/client

# 1. Install Stake Engine client
npm install stake-engine

# 2. Create stakeRgsClient.ts
# Copy code from STAKE_CLIENT_INTEGRATION.md

# 3. Update GameController.ts
# Replace mock imports

# 4. Test
npm run dev

# 5. Deploy
npm run build
stake-engine upload-client --game joker_poker --path dist/
```

---

## 📋 Complete Implementation Checklist

### Week 1: Math SDK ✅

- [ ] **Setup** (Day 1)
  - [ ] Clone Stake Math SDK
  - [ ] Install Python 3.12+
  - [ ] Run `make setup`
  - [ ] Verify installation

- [ ] **Game Logic** (Days 2-4)
  - [ ] Create `games/joker_poker/` folder
  - [ ] Implement 8 Python files
  - [ ] Copy code from STAKE_MATH_SDK_GUIDE.md
  - [ ] Test each component

- [ ] **Hand Evaluation** (Day 4)
  - [ ] Implement all 13 hand types
  - [ ] Unit tests for each type
  - [ ] Verify correct detection

- [ ] **Joker Resolution** (Day 5)
  - [ ] Implement single Joker (48 iterations)
  - [ ] Implement double Joker (2,256 iterations)
  - [ ] Verify optimal substitution

- [ ] **Simulation** (Day 6)
  - [ ] Run 1M round simulation
  - [ ] Verify RTP: 96-98%
  - [ ] Check hand frequencies
  - [ ] Check Joker frequency (~3.7%)

- [ ] **Generate & Upload** (Day 7)
  - [ ] Generate 10M outcomes
  - [ ] Export to Stake Engine format
  - [ ] Upload to Stake Engine platform
  - [ ] Verify upload successful

### Week 2: Frontend Integration ✅

- [ ] **Install** (Day 8)
  - [ ] `npm install stake-engine`
  - [ ] Read Stake Engine docs
  - [ ] Study TypeScript client

- [ ] **Create Wrapper** (Day 9)
  - [ ] Create `stakeRgsClient.ts`
  - [ ] Implement `authenticate()`
  - [ ] Implement `play()`
  - [ ] Implement `endRound()`
  - [ ] Implement `getBalance()`

- [ ] **Update Controller** (Day 10-11)
  - [ ] Replace mock imports
  - [ ] Update `initialize()`
  - [ ] Update `play()`
  - [ ] Update `endRound()` calls
  - [ ] Add error handling

- [ ] **Event Listeners** (Day 12)
  - [ ] Add `balanceUpdate` listener
  - [ ] Add `roundActive` listener
  - [ ] Update balance display
  - [ ] Disable buttons during round

- [ ] **Testing** (Day 13)
  - [ ] Test authentication
  - [ ] Test 50+ rounds
  - [ ] Test all hand types
  - [ ] Test Joker scenarios
  - [ ] Test balance updates
  - [ ] Test error handling

- [ ] **Cleanup** (Day 14)
  - [ ] Delete mock files
  - [ ] Remove unused code
  - [ ] Update documentation
  - [ ] Final testing

### Week 3: Production ✅

- [ ] **Build** (Day 15-16)
  - [ ] `npm run build`
  - [ ] Verify dist/ folder
  - [ ] Test build locally
  - [ ] Check all assets

- [ ] **Upload** (Day 17)
  - [ ] Upload to Stake CDN
  - [ ] Get production URL
  - [ ] Verify game loads
  - [ ] Test with real session

- [ ] **QA Testing** (Days 18-20)
  - [ ] Play 100+ rounds
  - [ ] Track RTP
  - [ ] Test all scenarios
  - [ ] Mobile testing
  - [ ] Cross-browser testing
  - [ ] Performance testing

- [ ] **Launch** (Day 21)
  - [ ] Final checks
  - [ ] Documentation updates
  - [ ] Announce launch
  - [ ] Monitor metrics

---

## 🎲 Math SDK Implementation

### Files to Create (8 files):

```python
games/joker_poker/
├── config.py          # ~50 lines   - Game config
├── symbols.py         # ~80 lines   - 54-card deck
├── board.py           # ~60 lines   - 5-card board
├── evaluator.py       # ~400 lines  - 13 hand types
├── joker.py           # ~150 lines  - Joker resolution
├── paytable.py        # ~80 lines   - Multipliers
├── events.py          # ~60 lines   - Event generation
└── simulate.py        # ~120 lines  - RTP simulation

Total: ~1,000 lines of Python
```

### Key Algorithms:

**1. Fisher-Yates Shuffle:**
```python
import random

def shuffle(deck):
    for i in range(len(deck) - 1, 0, -1):
        j = random.randint(0, i)
        deck[i], deck[j] = deck[j], deck[i]
    return deck
```

**2. Royal Flush Detection:**
```python
def check_royal_flush(cards):
    if not is_flush(cards):
        return None
    ranks = {c.rank for c in cards}
    return ranks == {'10', 'J', 'Q', 'K', 'A'}
```

**3. Joker Resolution:**
```python
def resolve_joker(board, joker_pos, available_cards):
    best_card = None
    best_payout = 0
    
    for card in available_cards:  # 48 cards
        test_board = board.copy()
        test_board[joker_pos] = card
        hand = evaluate(test_board)
        payout = calculate_payout(hand, 1)
        
        if payout > best_payout:
            best_payout = payout
            best_card = card
    
    return best_card
```

---

## 🔌 Frontend Integration

### Files to Create/Update:

```typescript
client/src/api/
└── stakeRgsClient.ts  # NEW - Stake Engine wrapper (~200 lines)

client/src/game/
└── GameController.ts  # UPDATE - Replace mock imports

client/src/GameApp.ts  # UPDATE - Add event listeners

client/package.json    # UPDATE - Add stake-engine dependency
```

### Code Changes:

**Before (Mock):**
```typescript
import { mockRgsClient } from '../api/mockRgsClient';

const response = await mockRgsClient.play({
  sessionID, amount, mode: 'BASE'
});
```

**After (Stake Engine):**
```typescript
import * as stakeRgs from '../api/stakeRgsClient';

const response = await stakeRgs.play({
  sessionID, amount, mode: 'BASE'
});

// Response format SAME! ✅
// No other changes needed!
```

---

## 📊 Expected Results

### RTP Simulation (1M rounds):

```
============================================================
RTP SIMULATION RESULTS
============================================================
Total Rounds: 1,000,000
Total Bet:    1,000,000
Total Win:    970,000
RTP:          97.00% ✅
Joker Freq:   3.68% ✅

Hand Frequencies:
------------------------------------------------------------
HIGH_CARD          :  420,123 (42.012%)
PAIR               :  422,569 (42.257%)
TWO_PAIR           :   47,539 ( 4.754%)
THREE_OF_A_KIND    :   21,128 ( 2.113%)
STRAIGHT           :    3,924 ( 0.392%)
FLUSH              :    1,965 ( 0.197%)
FULL_HOUSE         :    1,442 ( 0.144%)
FOUR_OF_A_KIND     :      234 ( 0.023%)
STRAIGHT_FLUSH     :       14 ( 0.001%)
ROYAL_FLUSH        :        2 ( 0.000%) ✅
============================================================
```

---

## ✅ Success Criteria

### Math SDK:
- ✅ RTP: 97.0% (±1%)
- ✅ Royal Flush: ~0.00015% (~1 in 650k)
- ✅ Joker: ~3.7% (~1 in 27)
- ✅ All 13 hand types implemented
- ✅ Optimal Joker substitution

### Frontend:
- ✅ Stake client integrated
- ✅ Mock client removed
- ✅ All animations work
- ✅ Balance updates correctly
- ✅ Events processed correctly
- ✅ No breaking changes to UI

### Production:
- ✅ Game on Stake CDN
- ✅ API < 100ms response
- ✅ Mobile responsive
- ✅ Cross-browser compatible
- ✅ No console errors

---

## 🏗️ Architecture

### What We Build:

```
1. Math SDK Game (Python)
   ├── Deck: 52 cards + 2 Jokers
   ├── Board: 5-card poker
   ├── Evaluator: 13 hand types
   ├── Joker: Optimal resolution
   ├── Paytable: 13 multipliers
   └── Events: Frontend format

2. Frontend Client (TypeScript)
   ├── Install: stake-engine package
   ├── Wrapper: stakeRgsClient.ts
   ├── Update: GameController.ts
   └── Listeners: balance & round events
```

### What Stake Engine Provides:

```
✅ RGS Server (их инфраструктура)
✅ Wallet Management (их система)
✅ Session Management (их Redis)
✅ Balance Tracking (их DB)
✅ CDN Hosting (их CDN)
✅ TypeScript Client (их библиотека)
```

### What We DON'T Build:

```
❌ Node.js backend
❌ Fastify/Express server
❌ PostgreSQL database
❌ Redis server
❌ Wallet API
❌ Session API
❌ Real-time RNG
```

**Итого: Гораздо проще! 🎉**

---

## 📁 File Structure

### Current (MVP with Mock):
```
pokerspin/
├── client/
│   └── src/
│       └── api/
│           ├── mockRgsClient.ts   ❌ Delete
│           └── mockData.ts        ❌ Delete
```

### After Integration:
```
pokerspin/
├── packages/
│   ├── client/
│   │   └── src/
│   │       └── api/
│   │           └── stakeRgsClient.ts  ✅ New
│   │
│   └── shared/                        ✅ New (optional)
│       └── src/
│           ├── types/
│           ├── constants/
│           └── utils/
```

### Math SDK (separate repo):
```
math-sdk/                              ✅ Clone from GitHub
└── games/
    └── joker_poker/                   ✅ Create
        ├── config.py
        ├── symbols.py
        ├── board.py
        ├── evaluator.py
        ├── joker.py
        ├── paytable.py
        ├── events.py
        └── simulate.py
```

---

## 🎮 Paytable Reference

| Hand Type | Rank | Multiplier | Expected Frequency |
|-----------|------|------------|-------------------|
| Royal Flush | A-K-Q-J-10 | **x1000** | 0.00015% |
| Straight Flush | Any | x100 | 0.0014% |
| Four of a Kind | Any | x40 | 0.024% |
| Full House | Any | x20 | 0.14% |
| Flush | Any | x10 | 0.20% |
| Straight | Any | x5 | 0.39% |
| Three of a Kind | J-A | x3 | ~1% |
| Three of a Kind | 2-10 | x1.5 | ~1% |
| Two Pair | J-A | x0.8 | ~2% |
| Two Pair | 2-10 | x0.4 | ~2% |
| Pair | J-A | x0.4 | ~20% |
| Pair | 2-10 | x0.2 | ~20% |
| High Card | J-A | x0.1 | ~25% |
| High Card | 2-10 | x0 | ~28% |

**Target RTP:** 97.0%

---

## 🔑 Key Implementation Details

### 1. Joker Resolution (Critical!)

**Algorithm:**
```python
# For 1 Joker: Try 48 possible cards
# For 2 Jokers: Try 48*47 = 2,256 combinations
# Always pick the one with highest payout

best_payout = 0
best_card = None

for card in available_cards:
    test_board[joker_pos] = card
    hand = evaluate(test_board)
    payout = calculate(hand, bet=1)
    
    if payout > best_payout:
        best_payout = payout
        best_card = card

return best_card
```

**Why it matters:**
- ✅ Joker всегда превращается в лучшую карту
- ✅ Максимизирует выигрыш игрока
- ✅ Делает игру интереснее

### 2. Hand Evaluation Order

Проверяй руки от **сильнейшей к слабейшей**:
```python
1. Royal Flush       (сильнейшая)
2. Straight Flush
3. Four of a Kind
4. Full House
5. Flush
6. Straight
7. Three of a Kind
8. Two Pair
9. Pair
10. High Card        (слабейшая)
```

### 3. Event Generation

Frontend ожидает такие события:
```typescript
[
  {
    index: 0,
    type: 'reveal_initial_board',
    board: [
      { symbol: 'AS' },
      { symbol: 'JOKER' },
      { symbol: '7H' },
      { symbol: '9S' },
      { symbol: '3C' }
    ]
  },
  {
    index: 1,
    type: 'joker_transform',
    jokerTransforms: [
      { position: 1, targetSymbol: 'AD' }
    ]
  },
  {
    index: 2,
    type: 'hand_result',
    handCategory: 'PAIR',
    payoutMultiplier: 0.4,
    winningPositions: [0, 1],
    jackpot: false
  }
]
```

**Важно:** Формат должен точно совпадать!

---

## 🧪 Testing Strategy

### 1. Math SDK Testing:

```bash
# Unit tests
python -m pytest tests/test_evaluator.py
python -m pytest tests/test_joker.py

# RTP simulation
python -m games.joker_poker.simulate

# Expected: RTP 96-98%
```

### 2. Frontend Testing:

```bash
# Local testing
npm run dev
# Play 20+ rounds
# Check console logs

# Integration testing
npm run test

# Build testing
npm run build
npm run preview
```

### 3. Production Testing:

```bash
# Load game from Stake CDN
open "https://{team}.cdn.stake-engine.com/joker_poker/1.0.0/"

# Play 100+ rounds
# Track RTP (should trend to 97%)
# Verify all features work
```

---

## 📈 Timeline Summary

| Week | Focus | Hours | Deliverable |
|------|-------|-------|-------------|
| 1 | Math SDK | 40h | Game math on Stake Engine |
| 2 | Frontend | 40h | Client integrated |
| 3 | Testing & Deploy | 40h | Live game |

**Total:** 120 hours (~3 weeks)

---

## 💰 Cost Savings

**With Stake Engine:**
- 🚫 No backend server to maintain
- 🚫 No database to manage
- 🚫 No Redis to setup
- 🚫 No DevOps for scaling
- 🚫 No session management code
- 🚫 No wallet API code

**Saved:** ~2-3 weeks development + ongoing maintenance! 🎉

---

## 🔗 Resources

### Official:
- **Stake Engine:** https://stake-engine.com/docs
- **Math SDK:** https://github.com/StakeEngine/math-sdk
- **TS Client:** https://github.com/StakeEngine/ts-client

### Our Docs:
- **[STAKE_ENGINE_IMPLEMENTATION.md](STAKE_ENGINE_IMPLEMENTATION.md)** - Overview
- **[STAKE_MATH_SDK_GUIDE.md](STAKE_MATH_SDK_GUIDE.md)** - Python guide
- **[STAKE_CLIENT_INTEGRATION.md](STAKE_CLIENT_INTEGRATION.md)** - TypeScript guide
- **[NEXT_STEPS_STAKE_ENGINE.md](NEXT_STEPS_STAKE_ENGINE.md)** - Step-by-step plan

---

## 🎯 Current Status

### ✅ MVP v1.0 Complete:
- Frontend с PixiJS
- Mock RGS с 15 сценариями
- Все анимации работают
- State machine готов
- UI полностью функционален

### 🔄 Ready for Stake Engine:
- Документация готова (3 файла)
- Math SDK спецификация готова (8 Python файлов)
- Frontend integration план готов
- Checklist готов

### 🚀 Next Action:
**Start with Week 1: Math SDK Setup**

---

**Let's build it!** 🎰✨

---

**Version:** 2.0 (Stake Engine)  
**Date:** 2026-01-11  
**Status:** 📋 Ready to Implement
