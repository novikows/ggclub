# 🎯 Implementation Brief - Real Game Logic

**Date:** 2026-01-11  
**Project:** Joker Poker Board - Real RGS Implementation  
**Goal:** Replace mock logic with real game math engine

---

## 📋 Current State (MVP v1.0)

### ✅ What Works (Frontend)
- Complete UI with PixiJS
- State machine (INIT → IDLE → SPINNING → WIN)
- Card animations (flop → turn → river)
- Joker transformation effects
- Win display modals (5 tiers)
- Bet management (9 levels)
- Balance display

### 🎲 What's Mocked
- **Mock RGS API** (`mockRgsClient.ts`)
  - 15 pre-configured scenarios
  - Fake random selection (weighted)
  - Simulated balance management
  - Pre-generated events
  
- **Mock Data** (`mockData.ts`)
  - Hardcoded game scenarios
  - Pre-calculated wins
  - Manual event generation

---

## 🎯 What Needs Real Implementation

### 1. **Game Math Engine** 🎲
Location: `server/` (new Python backend)

#### Components:
- **Deck Manager**
  - 52 standard cards + 2 Jokers (54 total)
  - Fair shuffle algorithm (cryptographically secure RNG)
  - Deal 5 cards for board
  - No card repetition in same round

- **Hand Evaluator**
  - Recognize 13 poker hand types
  - Rank hands (High Card → Royal Flush)
  - Handle Joker substitution
  - Calculate best possible hand

- **Joker Logic**
  - Max 2 Jokers per round
  - Find optimal substitution for each Joker
  - Transform to create highest-paying hand
  - Return transformation targets

- **Payout Calculator**
  - Apply multiplier based on hand type
  - Consider card ranks (J-A vs 2-10)
  - Calculate exact win amount
  - Validate against max win (400,000)

### 2. **Wallet Management** 💰
Location: `server/wallet/` (new)

#### Components:
- **Balance Manager**
  - Track player balance (integer units)
  - Debit bet at round start
  - Credit win at round end
  - Handle insufficient balance (ERR_IPB)

- **Session Manager**
  - Validate session tokens
  - Track active rounds
  - Handle timeouts
  - Prevent duplicate plays

- **Transaction Log**
  - Record all bets
  - Record all wins
  - Audit trail for debugging
  - Round history

### 3. **RNG (Random Number Generator)** 🎰
Location: `server/rng/` (new)

#### Requirements:
- **Cryptographically Secure**
  - Use `/dev/urandom` or equivalent
  - No predictable patterns
  - Fair distribution

- **Provably Fair (optional)**
  - Generate round seed
  - Allow verification
  - Store seed hash

### 4. **API Endpoints** 🔌
Location: `server/api/` (new)

#### Required Endpoints:
```
POST /wallet/authenticate
POST /wallet/play
POST /wallet/end-round
GET  /wallet/balance
POST /wallet/history (future)
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (PixiJS)                         │
│  ✅ COMPLETE - No changes needed                             │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTP/WebSocket
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  API GATEWAY (FastAPI/Flask)                 │
│  🆕 NEW - Replace mockRgsClient.ts                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  /wallet/authenticate  - Validate session & config     │ │
│  │  /wallet/play          - Start round, generate board   │ │
│  │  /wallet/end-round     - Credit win, update balance    │ │
│  │  /wallet/balance       - Check current balance         │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│               GAME MATH ENGINE (Python)                      │
│  🆕 NEW - Core game logic                                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  DeckManager      - Shuffle, deal cards                │ │
│  │  HandEvaluator    - Recognize poker hands              │ │
│  │  JokerResolver    - Find best joker substitution       │ │
│  │  PayoutCalculator - Calculate wins from paytable       │ │
│  │  EventGenerator   - Create frontend events             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                WALLET MANAGER (Python)                       │
│  🆕 NEW - Balance & session management                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  SessionStore   - Active sessions & tokens             │ │
│  │  BalanceStore   - Player balances (in-memory/Redis)    │ │
│  │  TransactionLog - Bet/win history                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (Optional)                         │
│  📊 FUTURE - Persistent storage                              │
│  • Player balances                                           │
│  • Round history                                             │
│  • Statistics                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Key Algorithms Needed

### 1. Fair Shuffle (Fisher-Yates)
```python
def shuffle_deck() -> List[Card]:
    deck = create_deck()  # 52 cards + 2 Jokers
    for i in range(len(deck) - 1, 0, -1):
        j = secure_random(0, i)
        deck[i], deck[j] = deck[j], deck[i]
    return deck
```

### 2. Hand Evaluation
```python
def evaluate_hand(cards: List[Card]) -> HandResult:
    # 1. Check for Royal Flush
    # 2. Check for Straight Flush
    # 3. Check for Four of a Kind
    # 4. Check for Full House
    # 5. Check for Flush
    # 6. Check for Straight
    # 7. Check for Three of a Kind
    # 8. Check for Two Pair
    # 9. Check for Pair
    # 10. High Card
    pass
```

### 3. Joker Resolution
```python
def resolve_jokers(board: List[Card]) -> JokerTransform:
    joker_positions = find_jokers(board)
    if not joker_positions:
        return None
    
    best_hand = None
    best_transforms = []
    
    # Try all possible substitutions
    for substitution in generate_substitutions(joker_positions):
        test_board = apply_substitution(board, substitution)
        hand = evaluate_hand(test_board)
        
        if hand.payout > best_hand.payout:
            best_hand = hand
            best_transforms = substitution
    
    return best_transforms
```

### 4. Payout Calculation
```python
def calculate_payout(hand: HandResult, bet: int) -> int:
    multiplier = PAYTABLE[hand.type][hand.rank_category]
    return int(bet * multiplier)
```

---

## 🎮 Paytable (Complete)

| Hand Type | Rank | Multiplier | Tier |
|-----------|------|------------|------|
| High Card | J-A | 0.1 | NORMAL |
| Pair | 2-10 | 0.2 | NORMAL |
| Pair | J-A | 0.4 | NORMAL |
| Two Pair | 2-10 | 0.4 | NORMAL |
| Two Pair | J-A | 0.8 | NORMAL |
| Three of a Kind | 2-10 | 1.5 | MEDIUM |
| Three of a Kind | J-A | 3.0 | HIGH |
| Straight | Any | 5.0 | HIGH |
| Flush | Any | 10.0 | JACKPOT |
| Full House | Any | 20.0 | JACKPOT |
| Four of a Kind | Any | 40.0 | JACKPOT |
| Straight Flush | Any | 100.0 | JACKPOT |
| Royal Flush | 10-J-Q-K-A same suit | 1000.0 | JACKPOT |

---

## 🔒 Security & Fairness

### RNG Requirements
- Use cryptographically secure random: `secrets.SystemRandom()`
- Seed from system entropy `/dev/urandom`
- No time-based seeds (predictable)

### Session Security
- Generate unique session tokens (UUID v4)
- Expire sessions after inactivity (30 min)
- Prevent concurrent plays (lock mechanism)

### Balance Protection
- Atomic operations (debit + credit)
- Validate bet <= balance before play
- Rollback on errors

### Rate Limiting
- Max 100 plays per minute per session
- Prevent bot abuse
- Gradual backoff on repeated errors

---

## 📈 RTP (Return to Player) Target

**Target RTP:** 96-98% (industry standard)

### How to Calculate:
```python
total_bet = 0
total_win = 0

for _ in range(1_000_000):  # Simulate 1M rounds
    board = deal_board()
    hand = evaluate_hand(board)
    payout = calculate_payout(hand, bet=1)
    
    total_bet += 1
    total_win += payout

rtp = (total_win / total_bet) * 100
```

### Validation:
- Run 1M+ simulations
- Verify RTP within target range
- Check distribution of hand frequencies
- Ensure Joker appears ~3.7% of time (2/54)

---

## 🚀 Implementation Phases

### Phase 1: Core Math (Week 1)
- [ ] Deck manager with shuffle
- [ ] Hand evaluator (13 types)
- [ ] Payout calculator
- [ ] Unit tests (100% coverage)

### Phase 2: Joker Logic (Week 1)
- [ ] Joker detection
- [ ] Substitution algorithm
- [ ] Optimization for best hand
- [ ] Unit tests

### Phase 3: API Layer (Week 2)
- [ ] FastAPI/Flask setup
- [ ] /authenticate endpoint
- [ ] /play endpoint
- [ ] /end-round endpoint
- [ ] Error handling

### Phase 4: Wallet System (Week 2)
- [ ] Session management
- [ ] Balance tracking (in-memory)
- [ ] Transaction logging
- [ ] Concurrency handling

### Phase 5: Integration (Week 3)
- [ ] Connect frontend to real API
- [ ] Remove mock client
- [ ] End-to-end testing
- [ ] Performance optimization

### Phase 6: Testing & Validation (Week 3)
- [ ] RTP simulation (1M+ rounds)
- [ ] Load testing (100 concurrent users)
- [ ] Security audit
- [ ] Bug fixes

---

## 📝 Next Steps

1. **Review this brief** ✅ (you are here)
2. **Create full specification** (next document)
3. **Setup Python backend** (FastAPI + Poetry)
4. **Implement core math** (TDD approach)
5. **Create API endpoints**
6. **Integrate with frontend**
7. **Test & validate**
8. **Deploy**

---

## 🎯 Success Criteria

- ✅ RTP within 96-98%
- ✅ All 13 hand types correctly evaluated
- ✅ Joker logic finds optimal substitution
- ✅ No balance discrepancies
- ✅ API response time < 100ms (95th percentile)
- ✅ Handle 100+ concurrent users
- ✅ Zero critical security vulnerabilities
- ✅ Frontend works without code changes

---

**Ready for full specification?** → See `GAME_LOGIC_SPECIFICATION.md`
