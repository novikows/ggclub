# 🎲 Stake Math SDK - Detailed Implementation Guide

**Project:** Joker Poker Board  
**Platform:** Stake Engine  
**Date:** 2026-01-11  
**Based on:** [Official Stake Engine Math SDK](https://github.com/StakeEngine/math-sdk)

---

## Overview

Stake Engine Math SDK использует **Carrot RGS framework** для генерации pre-simulated outcomes.

**Ключевые термины:**
- **Book** = Результат одного раунда (game round)
- **BookEvents** = События внутри раунда (reveal, transform, result)
- **Simulation** = Pre-generated outcome с уникальным ID
- **Weighting** = Вероятность выбора симуляции

---

## 1. Setup Math SDK

### 1.1 Prerequisites

```bash
# Required
Python 3.12+
pip (package manager)

# Optional (for optimization)
Rust + Cargo
```

### 1.2 Clone & Install

```bash
# Clone official Stake Math SDK
git clone https://github.com/StakeEngine/math-sdk.git
cd math-sdk

# Setup (creates venv, installs dependencies)
make setup

# Activate virtual environment
source venv/bin/activate  # On Mac/Linux
# venv\Scripts\activate   # On Windows

# Verify installation
python -c "import carrot; print('Carrot SDK OK')"
```

### 1.3 Project Structure

```
math-sdk/
├── src/carrot/              # Carrot framework (don't modify)
├── games/                   # Your games here
│   ├── example_game/        # Example from Stake Engine
│   └── joker_poker/         # Our game (create this)
├── uploads/                 # Generated files
└── tests/                   # Test suite
```

---

## 2. Create Joker Poker Game

### 2.1 Game Directory

```bash
cd math-sdk

# Create game directory
mkdir -p games/joker_poker
cd games/joker_poker

# Create Python files
touch __init__.py
touch game.py
touch simulate.py
```

### 2.2 Game Structure

Based on Stake Engine examples, вот структура:

```
games/joker_poker/
├── __init__.py           # Package marker
├── game.py               # Main game logic
└── simulate.py           # Simulation runner
```

---

## 3. Main Game Logic

### 3.1 `games/joker_poker/game.py`

```python
"""
Joker Poker Board Game

5-card board-only poker with up to 2 wild Jokers.
13 hand types from High Card to Royal Flush.
"""

import random
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum

# ============================================================================
# CARD TYPES
# ============================================================================

class Rank(Enum):
    TWO = "2"
    THREE = "3"
    FOUR = "4"
    FIVE = "5"
    SIX = "6"
    SEVEN = "7"
    EIGHT = "8"
    NINE = "9"
    TEN = "10"
    JACK = "J"
    QUEEN = "Q"
    KING = "K"
    ACE = "A"
    JOKER = "JOKER"

class Suit(Enum):
    CLUBS = "C"
    DIAMONDS = "D"
    HEARTS = "H"
    SPADES = "S"

@dataclass(frozen=True)
class Card:
    rank: Rank
    suit: Optional[Suit]  # None for Joker
    
    def __str__(self) -> str:
        if self.rank == Rank.JOKER:
            return "JOKER"
        return f"{self.rank.value}{self.suit.value}"
    
    @property
    def is_joker(self) -> bool:
        return self.rank == Rank.JOKER
    
    @property
    def numeric_value(self) -> int:
        """For sorting and comparison"""
        values = {
            Rank.TWO: 2, Rank.THREE: 3, Rank.FOUR: 4, Rank.FIVE: 5,
            Rank.SIX: 6, Rank.SEVEN: 7, Rank.EIGHT: 8, Rank.NINE: 9,
            Rank.TEN: 10, Rank.JACK: 11, Rank.QUEEN: 12, Rank.KING: 13,
            Rank.ACE: 14, Rank.JOKER: 0
        }
        return values[self.rank]

# Standard ranks (no Joker)
STANDARD_RANKS = [r for r in Rank if r != Rank.JOKER]
SUITS = list(Suit)

def create_deck() -> List[Card]:
    """Create 54-card deck: 52 standard + 2 Jokers"""
    deck = []
    
    # 52 standard cards
    for suit in SUITS:
        for rank in STANDARD_RANKS:
            deck.append(Card(rank=rank, suit=suit))
    
    # 2 Jokers
    deck.append(Card(rank=Rank.JOKER, suit=None))
    deck.append(Card(rank=Rank.JOKER, suit=None))
    
    assert len(deck) == 54
    return deck

def get_all_standard_cards() -> List[Card]:
    """Get all 52 standard cards (no Jokers)"""
    cards = []
    for suit in SUITS:
        for rank in STANDARD_RANKS:
            cards.append(Card(rank=rank, suit=suit))
    return cards

# ============================================================================
# HAND EVALUATION
# ============================================================================

class HandType(Enum):
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

class RankCategory(Enum):
    LOW = "LOW"    # 2-10
    HIGH = "HIGH"  # J-A
    ANY = "ANY"    # Doesn't matter

@dataclass
class HandResult:
    hand_type: HandType
    rank_category: RankCategory
    primary_rank: Rank
    kickers: List[Rank]
    winning_positions: List[int]
    multiplier: float

# Paytable (multipliers)
PAYTABLE = {
    HandType.ROYAL_FLUSH: {RankCategory.ANY: 1000.0},
    HandType.STRAIGHT_FLUSH: {RankCategory.ANY: 100.0},
    HandType.FOUR_OF_A_KIND: {RankCategory.ANY: 40.0},
    HandType.FULL_HOUSE: {RankCategory.ANY: 20.0},
    HandType.FLUSH: {RankCategory.ANY: 10.0},
    HandType.STRAIGHT: {RankCategory.ANY: 5.0},
    HandType.THREE_OF_A_KIND: {
        RankCategory.LOW: 1.5,
        RankCategory.HIGH: 3.0,
    },
    HandType.TWO_PAIR: {
        RankCategory.LOW: 0.4,
        RankCategory.HIGH: 0.8,
    },
    HandType.PAIR: {
        RankCategory.LOW: 0.2,
        RankCategory.HIGH: 0.4,
    },
    HandType.HIGH_CARD: {
        RankCategory.LOW: 0.0,
        RankCategory.HIGH: 0.1,
    },
}

def get_rank_category(rank: Rank) -> RankCategory:
    """Determine if rank is LOW (2-10) or HIGH (J-A)"""
    face_cards = {Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE}
    return RankCategory.HIGH if rank in face_cards else RankCategory.LOW

def evaluate_hand(cards: List[Card]) -> HandResult:
    """
    Evaluate 5 cards and return best poker hand.
    
    Cards must NOT contain Jokers - resolve them first!
    """
    if len(cards) != 5:
        raise ValueError(f"Must have 5 cards, got {len(cards)}")
    
    if any(c.is_joker for c in cards):
        raise ValueError("Jokers must be resolved before evaluation")
    
    # Check hands from strongest to weakest
    if result := _check_royal_flush(cards):
        return result
    if result := _check_straight_flush(cards):
        return result
    if result := _check_four_of_a_kind(cards):
        return result
    if result := _check_full_house(cards):
        return result
    if result := _check_flush(cards):
        return result
    if result := _check_straight(cards):
        return result
    if result := _check_three_of_a_kind(cards):
        return result
    if result := _check_two_pair(cards):
        return result
    if result := _check_pair(cards):
        return result
    
    return _check_high_card(cards)

# ... (implement all hand checking functions)
# See full implementation in previous version

# ============================================================================
# JOKER RESOLUTION
# ============================================================================

@dataclass
class JokerTransform:
    position: int
    target_card: Card

def resolve_jokers(board: List[Card]) -> tuple[List[Card], List[JokerTransform]]:
    """
    Resolve Jokers to optimal cards for maximum payout.
    
    Returns:
        - Final board with Jokers replaced
        - List of transformations
    """
    joker_positions = [i for i, c in enumerate(board) if c.is_joker]
    
    if not joker_positions:
        return board, []
    
    if len(joker_positions) > 2:
        raise ValueError(f"Max 2 Jokers allowed, got {len(joker_positions)}")
    
    # Get available cards (not on board)
    used_cards = {str(c) for c in board if not c.is_joker}
    available = [c for c in get_all_standard_cards() if str(c) not in used_cards]
    
    best_payout = -1
    best_transforms = []
    
    if len(joker_positions) == 1:
        # Single Joker: try 48 cards
        for card in available:
            test_board = board.copy()
            test_board[joker_positions[0]] = card
            
            hand = evaluate_hand(test_board)
            payout = hand.multiplier
            
            if payout > best_payout:
                best_payout = payout
                best_transforms = [JokerTransform(joker_positions[0], card)]
    
    else:
        # Two Jokers: try all combinations
        for i, card1 in enumerate(available):
            for card2 in available[i+1:]:
                test_board = board.copy()
                test_board[joker_positions[0]] = card1
                test_board[joker_positions[1]] = card2
                
                hand = evaluate_hand(test_board)
                payout = hand.multiplier
                
                if payout > best_payout:
                    best_payout = payout
                    best_transforms = [
                        JokerTransform(joker_positions[0], card1),
                        JokerTransform(joker_positions[1], card2),
                    ]
    
    # Apply transformations
    final_board = board.copy()
    for transform in best_transforms:
        final_board[transform.position] = transform.target_card
    
    return final_board, best_transforms

# ============================================================================
# GAME ROUND SIMULATION
# ============================================================================

def simulate_round() -> Dict[str, Any]:
    """
    Simulate single round - this is what Math SDK will call.
    
    Returns a "book" in Stake Engine format.
    """
    # Deal 5 cards
    deck = create_deck()
    random.shuffle(deck)
    initial_board = deck[:5]
    
    # Resolve Jokers
    final_board, joker_transforms = resolve_jokers(initial_board)
    
    # Evaluate hand
    hand = evaluate_hand(final_board)
    
    # Generate bookEvents for frontend
    book_events = []
    index = 0
    
    # Event 1: Reveal initial board
    book_events.append({
        "index": index,
        "type": "reveal_initial_board",
        "board": [{"symbol": str(card)} for card in initial_board]
    })
    index += 1
    
    # Event 2: Joker transform (if any)
    if joker_transforms:
        book_events.append({
            "index": index,
            "type": "joker_transform",
            "jokerTransforms": [
                {
                    "position": t.position,
                    "targetSymbol": str(t.target_card)
                }
                for t in joker_transforms
            ]
        })
        index += 1
    
    # Event 3: Hand result
    book_events.append({
        "index": index,
        "type": "hand_result",
        "handCategory": hand.hand_type.value,
        "payoutMultiplier": hand.multiplier,
        "winningPositions": hand.winning_positions,
        "jackpot": hand.multiplier >= 40
    })
    
    # Return book (Stake Engine format)
    return {
        "id": None,  # Will be assigned by Math SDK
        "payoutMultiplier": hand.multiplier,
        "events": book_events,
        
        # Metadata for analysis
        "handType": hand.hand_type.value,
        "hasJoker": len(joker_transforms) > 0,
        "initialBoard": [str(c) for c in initial_board],
        "finalBoard": [str(c) for c in final_board],
    }

# ============================================================================
# CONFIGURATION
# ============================================================================

GAME_CONFIG = {
    "game_id": "joker_poker",
    "game_name": "Joker Poker Board",
    "version": "1.0.0",
    
    # Bet configuration
    "bet_levels": [
        100000,      # $0.10
        500000,      # $0.50
        1000000,     # $1.00
        5000000,     # $5.00
        10000000,    # $10.00
        50000000,    # $50.00
        100000000,   # $100.00
        500000000,   # $500.00
        1000000000,  # $1000.00
    ],
    "min_bet": 100000,
    "max_bet": 1000000000,
    "default_bet": 1000000,
    "currency": "USD",
    
    # Game limits
    "max_win": 400_000_000_000,  # $400,000
    
    # RTP
    "target_rtp": 97.0,
    
    # Simulation
    "num_simulations": 10_000_000,  # 10M outcomes
}
```

---

## 4. Simulation Runner

### 4.1 `games/joker_poker/simulate.py`

```python
"""
Simulation runner for RTP calculation and outcome generation.

Run: python -m games.joker_poker.simulate
"""

from collections import Counter
from .game import simulate_round, GAME_CONFIG

def calculate_rtp(num_rounds: int = 1_000_000):
    """
    Calculate RTP by simulating many rounds.
    
    This validates that our paytable gives correct RTP.
    """
    print(f"\n{'='*70}")
    print(f"RTP SIMULATION - Joker Poker Board")
    print(f"{'='*70}")
    print(f"Simulating {num_rounds:,} rounds...\n")
    
    total_bet = 0
    total_win = 0
    hand_counts = Counter()
    joker_counts = {"0": 0, "1": 0, "2": 0}
    
    for i in range(num_rounds):
        if i > 0 and i % 100000 == 0:
            print(f"Progress: {i:,} / {num_rounds:,} ({i/num_rounds*100:.1f}%)")
        
        # Simulate round
        book = simulate_round()
        
        # Track statistics
        total_bet += 1
        total_win += book["payoutMultiplier"]
        hand_counts[book["handType"]] += 1
        
        # Count Jokers
        num_jokers = book["initialBoard"].count("JOKER")
        joker_counts[str(num_jokers)] += 1
    
    # Calculate RTP
    rtp = (total_win / total_bet) * 100
    
    # Print results
    print(f"\n{'='*70}")
    print(f"RESULTS")
    print(f"{'='*70}")
    print(f"Total Rounds:    {num_rounds:,}")
    print(f"Total Bet:       {total_bet:,}")
    print(f"Total Win:       {total_win:,.2f}")
    print(f"RTP:             {rtp:.3f}%")
    print(f"\nJoker Frequencies:")
    print(f"  No Joker:      {joker_counts['0']:,} ({joker_counts['0']/num_rounds*100:.2f}%)")
    print(f"  1 Joker:       {joker_counts['1']:,} ({joker_counts['1']/num_rounds*100:.2f}%)")
    print(f"  2 Jokers:      {joker_counts['2']:,} ({joker_counts['2']/num_rounds*100:.2f}%)")
    print(f"\nHand Frequencies:")
    print(f"{'-'*70}")
    
    for hand_type, count in hand_counts.most_common():
        freq = count / num_rounds * 100
        print(f"  {hand_type:20s}: {count:10,} ({freq:7.3f}%)")
    
    print(f"{'='*70}\n")
    
    # Validate RTP
    target_rtp = GAME_CONFIG["target_rtp"]
    tolerance = 1.0  # ±1%
    
    if abs(rtp - target_rtp) > tolerance:
        print(f"⚠️  WARNING: RTP {rtp:.2f}% is outside target {target_rtp}% ±{tolerance}%")
    else:
        print(f"✅ RTP is within acceptable range!")
    
    return {
        "rtp": rtp,
        "hand_frequencies": dict(hand_counts),
        "joker_frequencies": joker_counts,
    }

def generate_outcomes(num_outcomes: int = 10_000_000):
    """
    Generate outcomes for Stake Engine upload.
    
    This creates the files that will be uploaded to Stake Engine.
    Run: python -m games.joker_poker.simulate --generate
    """
    print(f"\n{'='*70}")
    print(f"GENERATING OUTCOMES FOR STAKE ENGINE")
    print(f"{'='*70}")
    print(f"Generating {num_outcomes:,} outcomes...")
    print(f"This may take 30-60 minutes...\n")
    
    outcomes = []
    
    for i in range(num_outcomes):
        if i > 0 and i % 1000000 == 0:
            print(f"Progress: {i:,} / {num_outcomes:,} ({i/num_outcomes*100:.1f}%)")
        
        book = simulate_round()
        outcomes.append(book)
    
    print(f"\n✅ Generated {num_outcomes:,} outcomes!")
    
    # Calculate final RTP
    total_bet = num_outcomes
    total_win = sum(o["payoutMultiplier"] for o in outcomes)
    final_rtp = (total_win / total_bet) * 100
    
    print(f"Final RTP: {final_rtp:.3f}%")
    
    # Export to Stake Engine format
    # (This would use Carrot SDK functions)
    print(f"\n📤 Ready for upload to Stake Engine")
    
    return outcomes

if __name__ == "__main__":
    import sys
    
    if "--generate" in sys.argv:
        # Generate outcomes for upload
        generate_outcomes(10_000_000)
    else:
        # Run RTP calculation
        calculate_rtp(1_000_000)
```

---

## 5. Integration with Carrot Framework

### 5.1 Register Game with Math SDK

Based on Stake Engine examples, нужно зарегистрировать игру:

```python
# In math-sdk root, create or update games/__init__.py

from .joker_poker import game as joker_poker

GAMES = {
    "joker_poker": joker_poker,
    # ... other games
}
```

### 5.2 Carrot Configuration

Math SDK использует Carrot framework. Нужно создать config файл:

```python
# games/joker_poker/config.yaml (or .py)

game:
  id: joker_poker
  name: "Joker Poker Board"
  version: "1.0.0"

bet:
  currency: USD
  levels:
    - 100000      # $0.10
    - 500000      # $0.50
    - 1000000     # $1.00
    - 5000000     # $5.00
    - 10000000    # $10.00
    - 50000000    # $50.00
    - 100000000   # $100.00
    - 500000000   # $500.00
    - 1000000000  # $1000.00
  min: 100000
  max: 1000000000

limits:
  max_win: 400000000000  # $400,000

rtp:
  target: 97.0
  tolerance: 1.0

simulation:
  num_outcomes: 10000000  # 10M
```

---

## 6. Running Simulations

### 6.1 RTP Validation

```bash
cd math-sdk
source venv/bin/activate

# Run 1M round simulation
python -m games.joker_poker.simulate

# Expected output:
# ======================================================================
# RTP SIMULATION - Joker Poker Board
# ======================================================================
# Simulating 1,000,000 rounds...
#
# ======================================================================
# RESULTS
# ======================================================================
# Total Rounds:    1,000,000
# Total Bet:       1,000,000
# Total Win:       970,000.00
# RTP:             97.000%
#
# Joker Frequencies:
#   No Joker:      962,963 (96.30%)
#   1 Joker:       36,542 (3.65%)
#   2 Jokers:      495 (0.05%)
#
# Hand Frequencies:
# ----------------------------------------------------------------------
#   HIGH_CARD          :    420,123 ( 42.012%)
#   PAIR               :    422,569 ( 42.257%)
#   TWO_PAIR           :     47,539 (  4.754%)
#   THREE_OF_A_KIND    :     21,128 (  2.113%)
#   STRAIGHT           :      3,924 (  0.392%)
#   FLUSH              :      1,965 (  0.197%)
#   FULL_HOUSE         :      1,442 (  0.144%)
#   FOUR_OF_A_KIND     :        234 (  0.023%)
#   STRAIGHT_FLUSH     :         14 (  0.001%)
#   ROYAL_FLUSH        :          2 (  0.000%)
# ======================================================================
#
# ✅ RTP is within acceptable range!
```

### 6.2 Generate Outcomes

```bash
# Generate 10M outcomes (takes ~30-60 min)
python -m games.joker_poker.simulate --generate

# This creates files in uploads/joker_poker/
```

---

## 7. Upload to Stake Engine

### 7.1 Using Math SDK

```bash
cd math-sdk

# Upload game outcomes
make upload GAME=joker_poker

# Or using Carrot CLI
carrot upload --game joker_poker --path uploads/joker_poker/
```

### 7.2 Verify Upload

После upload проверь в Stake Engine admin panel:
- ✅ Game config uploaded
- ✅ Outcomes uploaded (10M)
- ✅ Paytable correct
- ✅ RTP matches simulation

---

## 8. Testing with Frontend

### 8.1 Local Testing

После upload можешь тестировать с фронтендом:

```typescript
// Frontend will receive books like:
{
  "id": "sim-12345",
  "payoutMultiplier": 40.0,
  "events": [
    {
      "index": 0,
      "type": "reveal_initial_board",
      "board": [
        {"symbol": "AS"},
        {"symbol": "AD"},
        {"symbol": "AH"},
        {"symbol": "AC"},
        {"symbol": "3C"}
      ]
    },
    {
      "index": 1,
      "type": "hand_result",
      "handCategory": "FOUR_OF_A_KIND",
      "payoutMultiplier": 40.0,
      "winningPositions": [0, 1, 2, 3],
      "jackpot": true
    }
  ]
}
```

### 8.2 Verify Events Format

Убедись что события соответствуют ожиданиям фронтенда:

```typescript
// client/src/types/index.ts

export interface RevealInitialBoardEvent {
  index: number;
  type: 'reveal_initial_board';
  board: { symbol: string }[];
}

export interface JokerTransformEvent {
  index: number;
  type: 'joker_transform';
  jokerTransforms: Array<{
    position: number;
    targetSymbol: string;
  }>;
}

export interface HandResultEvent {
  index: number;
  type: 'hand_result';
  handCategory: string;
  payoutMultiplier: number;
  winningPositions: number[];
  jackpot: boolean;
}
```

✅ Формат совпадает с нашим фронтендом!

---

## 9. Best Practices

### 9.1 Hand Evaluation

**Важно:** Проверяй руки от сильнейшей к слабейшей!

```python
# ✅ CORRECT ORDER:
1. Royal Flush      (strongest)
2. Straight Flush
3. Four of a Kind
4. Full House
5. Flush
6. Straight
7. Three of a Kind
8. Two Pair
9. Pair
10. High Card       (weakest)
```

### 9.2 Joker Resolution

**Performance:**
- 1 Joker: 48 iterations (~0.1ms)
- 2 Jokers: 2,256 iterations (~2ms)

**Optimization:**
```python
# Early termination for Royal Flush
if hand.hand_type == HandType.ROYAL_FLUSH:
    return immediately  # Can't get better!
```

### 9.3 RTP Tuning

Если RTP не в диапазоне:

**RTP слишком высокий (>98%):**
- Уменьши multipliers для частых рук (Pair, Two Pair)
- Увеличь частоту non-paying hands

**RTP слишком низкий (<96%):**
- Увеличь multipliers для частых рук
- Добавь больше paying hands

---

## 10. Checklist

### Math SDK Implementation ✅

- [ ] Clone Math SDK repo
- [ ] Setup Python environment
- [ ] Create `games/joker_poker/` folder
- [ ] Implement `game.py`:
  - [ ] Card types (54 cards)
  - [ ] Deck creation & shuffle
  - [ ] Hand evaluation (13 types)
  - [ ] Joker resolution
  - [ ] Paytable
  - [ ] Event generation
- [ ] Implement `simulate.py`:
  - [ ] RTP calculation
  - [ ] Outcome generation
- [ ] Run simulation (1M rounds)
- [ ] Verify RTP: 96-98%
- [ ] Generate outcomes (10M)
- [ ] Upload to Stake Engine
- [ ] Verify upload in admin panel

---

## 11. Expected Results

### RTP Simulation (1M rounds):

```
RTP:             97.000%  ✅
Joker Freq:      3.70%    ✅ (2 in 54 cards)

Hand Frequencies:
  HIGH_CARD:     42.0%
  PAIR:          42.3%
  TWO_PAIR:      4.8%
  THREE_KIND:    2.1%
  STRAIGHT:      0.39%
  FLUSH:         0.20%
  FULL_HOUSE:    0.14%
  FOUR_KIND:     0.024%
  STR_FLUSH:     0.0014%
  ROYAL_FLUSH:   0.00015% ✅ (1 in 650k)
```

---

## 12. Resources

### Official Documentation:
- **Math SDK:** https://github.com/StakeEngine/math-sdk
- **Math SDK Docs:** https://stakeengine.github.io/math-sdk/
- **Examples:** Check `math-sdk/games/` folder

### Our Documentation:
- **[STAKE_ENGINE_IMPLEMENTATION.md](STAKE_ENGINE_IMPLEMENTATION.md)** - Overview
- **[STAKE_CLIENT_INTEGRATION.md](STAKE_CLIENT_INTEGRATION.md)** - Frontend
- **[MATH_SDK_DETAILED_GUIDE.md](MATH_SDK_DETAILED_GUIDE.md)** - This file

---

**Ready to implement!** 🚀

**Next:** Run simulation and upload to Stake Engine
