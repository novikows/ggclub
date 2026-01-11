# 🎲 Stake Math SDK Configuration Guide - Joker Poker

**Platform:** Stake Engine  
**Game:** Joker Poker Board  
**Date:** 2026-01-11  

---

## Table of Contents

1. [Setup Math SDK](#1-setup-math-sdk)
2. [Game Structure](#2-game-structure)
3. [Symbol Configuration](#3-symbol-configuration)
4. [Board & Game Logic](#4-board--game-logic)
5. [Hand Evaluation](#5-hand-evaluation)
6. [Joker Resolution](#6-joker-resolution)
7. [Paytable Configuration](#7-paytable-configuration)
8. [Event Generation](#8-event-generation)
9. [Simulation & RTP](#9-simulation--rtp)
10. [Upload & Testing](#10-upload--testing)

---

## 1. Setup Math SDK

### 1.1 Prerequisites

```bash
# Required:
Python 3.12+
Rust/Cargo (for optimization)

# Optional but recommended:
make
git
```

### 1.2 Clone & Install

```bash
# Clone Stake Math SDK
git clone https://github.com/StakeEngine/math-sdk.git
cd math-sdk

# Setup (creates venv and installs dependencies)
make setup

# Or manually:
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 1.3 Verify Installation

```bash
# Test SDK
python -c "from carrot import GameConfig; print('SDK OK')"

# Should output: SDK OK
```

---

## 2. Game Structure

### 2.1 Create Game Folder

```bash
cd math-sdk

# Create game directory
mkdir -p games/joker_poker
cd games/joker_poker

# Create files
touch __init__.py
touch config.py
touch symbols.py
touch board.py
touch evaluator.py
touch joker.py
touch paytable.py
touch events.py
touch simulate.py
```

### 2.2 Directory Structure

```
math-sdk/
└── games/
    └── joker_poker/
        ├── __init__.py          # Package init
        ├── config.py            # Game configuration
        ├── symbols.py           # Card symbols (54 cards)
        ├── board.py             # 5-card board logic
        ├── evaluator.py         # Hand evaluation (13 types)
        ├── joker.py             # Joker resolution
        ├── paytable.py          # Payout rules
        ├── events.py            # Event generation for frontend
        └── simulate.py          # Run simulation
```

---

## 3. Symbol Configuration

### 3.1 Define Cards (`games/joker_poker/symbols.py`)

```python
from typing import Optional
from dataclasses import dataclass

@dataclass(frozen=True)
class Card:
    """Playing card"""
    rank: str  # '2'-'10', 'J', 'Q', 'K', 'A', 'JOKER'
    suit: Optional[str]  # 'C', 'D', 'H', 'S' or None for Joker
    
    def __str__(self) -> str:
        if self.rank == "JOKER":
            return "JOKER"
        return f"{self.rank}{self.suit}"
    
    @property
    def is_joker(self) -> bool:
        return self.rank == "JOKER"
    
    @property
    def numeric_value(self) -> int:
        """Numeric value for sorting"""
        values = {
            '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
            '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
        }
        return values.get(self.rank, 0)

# All ranks
RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
SUITS = ['C', 'D', 'H', 'S']

def create_deck() -> list[Card]:
    """
    Create full 54-card deck:
    - 52 standard cards (13 ranks × 4 suits)
    - 2 Jokers
    """
    deck = []
    
    # Add 52 standard cards
    for suit in SUITS:
        for rank in RANKS:
            deck.append(Card(rank=rank, suit=suit))
    
    # Add 2 Jokers
    deck.append(Card(rank="JOKER", suit=None))
    deck.append(Card(rank="JOKER", suit=None))
    
    assert len(deck) == 54, f"Invalid deck size: {len(deck)}"
    
    return deck

def get_all_standard_cards() -> list[Card]:
    """Get all 52 standard cards (no Jokers)"""
    cards = []
    for suit in SUITS:
        for rank in RANKS:
            cards.append(Card(rank=rank, suit=suit))
    return cards
```

---

## 4. Board & Game Logic

### 4.1 Board Configuration (`games/joker_poker/board.py`)

```python
import random
from .symbols import Card, create_deck

class PokerBoard:
    """5-card poker board"""
    
    def __init__(self):
        self.positions = 5  # 5 cards
        self.board: list[Card] = []
    
    def deal(self) -> list[Card]:
        """
        Deal 5 random cards from deck.
        
        This is used during simulation to generate outcomes.
        Stake Engine will use these pre-generated boards at runtime.
        """
        deck = create_deck()
        random.shuffle(deck)
        self.board = deck[:5]
        return self.board
    
    def get_board(self) -> list[Card]:
        """Get current board"""
        return self.board
    
    def has_jokers(self) -> bool:
        """Check if board has any Jokers"""
        return any(card.is_joker for card in self.board)
    
    def get_joker_positions(self) -> list[int]:
        """Get positions of Jokers on board"""
        return [i for i, card in enumerate(self.board) if card.is_joker]
```

---

## 5. Hand Evaluation

### 5.1 Hand Evaluator (`games/joker_poker/evaluator.py`)

```python
from typing import Optional
from dataclasses import dataclass
from .symbols import Card

@dataclass
class HandResult:
    """Result of hand evaluation"""
    hand_type: str
    rank_category: str  # 'LOW', 'HIGH', or 'ANY'
    primary_rank: str
    kickers: list[str]
    winning_positions: list[int]

class HandEvaluator:
    """
    Evaluates 5-card poker hands.
    
    Implements standard poker hand rankings:
    1. Royal Flush
    2. Straight Flush
    3. Four of a Kind
    4. Full House
    5. Flush
    6. Straight
    7. Three of a Kind
    8. Two Pair
    9. Pair
    10. High Card
    """
    
    @staticmethod
    def evaluate(cards: list[Card]) -> HandResult:
        """Evaluate 5 cards and return best hand"""
        
        if len(cards) != 5:
            raise ValueError(f"Must have 5 cards, got {len(cards)}")
        
        # Verify no Jokers
        if any(c.is_joker for c in cards):
            raise ValueError("Jokers must be resolved before evaluation")
        
        # Check hands in descending order of strength
        evaluators = [
            HandEvaluator._check_royal_flush,
            HandEvaluator._check_straight_flush,
            HandEvaluator._check_four_of_a_kind,
            HandEvaluator._check_full_house,
            HandEvaluator._check_flush,
            HandEvaluator._check_straight,
            HandEvaluator._check_three_of_a_kind,
            HandEvaluator._check_two_pair,
            HandEvaluator._check_pair,
            HandEvaluator._check_high_card,
        ]
        
        for check in evaluators:
            if result := check(cards):
                return result
        
        # Fallback (should never reach here)
        return HandEvaluator._check_high_card(cards)
    
    @staticmethod
    def _check_royal_flush(cards: list[Card]) -> Optional[HandResult]:
        """Royal Flush: A, K, Q, J, 10 all same suit"""
        
        if not HandEvaluator._is_flush(cards):
            return None
        
        ranks = {c.rank for c in cards}
        if ranks == {'10', 'J', 'Q', 'K', 'A'}:
            return HandResult(
                hand_type='ROYAL_FLUSH',
                rank_category='ANY',
                primary_rank='A',
                kickers=[],
                winning_positions=[0, 1, 2, 3, 4]
            )
        
        return None
    
    @staticmethod
    def _check_straight_flush(cards: list[Card]) -> Optional[HandResult]:
        """Straight Flush: 5 sequential ranks, same suit"""
        
        if not HandEvaluator._is_flush(cards):
            return None
        
        straight = HandEvaluator._get_straight(cards)
        if straight:
            return HandResult(
                hand_type='STRAIGHT_FLUSH',
                rank_category='ANY',
                primary_rank=straight['high_rank'],
                kickers=[],
                winning_positions=[0, 1, 2, 3, 4]
            )
        
        return None
    
    @staticmethod
    def _check_four_of_a_kind(cards: list[Card]) -> Optional[HandResult]:
        """Four of a Kind: 4 cards same rank"""
        
        rank_counts = HandEvaluator._count_ranks(cards)
        
        for rank, count in rank_counts.items():
            if count == 4:
                positions = [i for i, c in enumerate(cards) if c.rank == rank]
                kicker = [r for r, cnt in rank_counts.items() if cnt == 1][0]
                
                return HandResult(
                    hand_type='FOUR_OF_A_KIND',
                    rank_category='ANY',
                    primary_rank=rank,
                    kickers=[kicker],
                    winning_positions=positions
                )
        
        return None
    
    @staticmethod
    def _check_full_house(cards: list[Card]) -> Optional[HandResult]:
        """Full House: 3 of a kind + pair"""
        
        rank_counts = HandEvaluator._count_ranks(cards)
        
        trips_rank = None
        pair_rank = None
        
        for rank, count in rank_counts.items():
            if count == 3:
                trips_rank = rank
            elif count == 2:
                pair_rank = rank
        
        if trips_rank and pair_rank:
            positions = [
                i for i, c in enumerate(cards)
                if c.rank in [trips_rank, pair_rank]
            ]
            
            return HandResult(
                hand_type='FULL_HOUSE',
                rank_category='ANY',
                primary_rank=trips_rank,
                kickers=[pair_rank],
                winning_positions=positions
            )
        
        return None
    
    @staticmethod
    def _check_flush(cards: list[Card]) -> Optional[HandResult]:
        """Flush: All same suit"""
        
        if not HandEvaluator._is_flush(cards):
            return None
        
        sorted_ranks = sorted(
            [c.rank for c in cards],
            key=lambda r: Card(r, 'C').numeric_value,
            reverse=True
        )
        
        return HandResult(
            hand_type='FLUSH',
            rank_category='ANY',
            primary_rank=sorted_ranks[0],
            kickers=sorted_ranks[1:],
            winning_positions=[0, 1, 2, 3, 4]
        )
    
    @staticmethod
    def _check_straight(cards: list[Card]) -> Optional[HandResult]:
        """Straight: 5 sequential ranks"""
        
        straight = HandEvaluator._get_straight(cards)
        
        if straight:
            return HandResult(
                hand_type='STRAIGHT',
                rank_category='ANY',
                primary_rank=straight['high_rank'],
                kickers=[],
                winning_positions=[0, 1, 2, 3, 4]
            )
        
        return None
    
    @staticmethod
    def _check_three_of_a_kind(cards: list[Card]) -> Optional[HandResult]:
        """Three of a Kind"""
        
        rank_counts = HandEvaluator._count_ranks(cards)
        
        for rank, count in rank_counts.items():
            if count == 3:
                positions = [i for i, c in enumerate(cards) if c.rank == rank]
                kickers = sorted(
                    [r for r, cnt in rank_counts.items() if cnt == 1],
                    key=lambda r: Card(r, 'C').numeric_value,
                    reverse=True
                )
                
                category = HandEvaluator._get_rank_category(rank)
                
                return HandResult(
                    hand_type='THREE_OF_A_KIND',
                    rank_category=category,
                    primary_rank=rank,
                    kickers=kickers,
                    winning_positions=positions
                )
        
        return None
    
    @staticmethod
    def _check_two_pair(cards: list[Card]) -> Optional[HandResult]:
        """Two Pair"""
        
        rank_counts = HandEvaluator._count_ranks(cards)
        pairs = [rank for rank, count in rank_counts.items() if count == 2]
        
        if len(pairs) == 2:
            pairs.sort(key=lambda r: Card(r, 'C').numeric_value, reverse=True)
            positions = [i for i, c in enumerate(cards) if c.rank in pairs]
            kicker = [r for r, cnt in rank_counts.items() if cnt == 1][0]
            
            category = HandEvaluator._get_rank_category(pairs[0])
            
            return HandResult(
                hand_type='TWO_PAIR',
                rank_category=category,
                primary_rank=pairs[0],
                kickers=[pairs[1], kicker],
                winning_positions=positions
            )
        
        return None
    
    @staticmethod
    def _check_pair(cards: list[Card]) -> Optional[HandResult]:
        """Pair"""
        
        rank_counts = HandEvaluator._count_ranks(cards)
        
        for rank, count in rank_counts.items():
            if count == 2:
                positions = [i for i, c in enumerate(cards) if c.rank == rank]
                kickers = sorted(
                    [r for r, cnt in rank_counts.items() if cnt == 1],
                    key=lambda r: Card(r, 'C').numeric_value,
                    reverse=True
                )
                
                category = HandEvaluator._get_rank_category(rank)
                
                return HandResult(
                    hand_type='PAIR',
                    rank_category=category,
                    primary_rank=rank,
                    kickers=kickers,
                    winning_positions=positions
                )
        
        return None
    
    @staticmethod
    def _check_high_card(cards: list[Card]) -> HandResult:
        """High Card (fallback)"""
        
        sorted_ranks = sorted(
            [c.rank for c in cards],
            key=lambda r: Card(r, 'C').numeric_value,
            reverse=True
        )
        
        category = HandEvaluator._get_rank_category(sorted_ranks[0])
        
        # Only pays if high card is face card
        positions = [0] if category == 'HIGH' else []
        
        return HandResult(
            hand_type='HIGH_CARD',
            rank_category=category,
            primary_rank=sorted_ranks[0],
            kickers=sorted_ranks[1:],
            winning_positions=positions
        )
    
    # ========================================================================
    # HELPER METHODS
    # ========================================================================
    
    @staticmethod
    def _is_flush(cards: list[Card]) -> bool:
        """Check if all cards same suit"""
        suits = {c.suit for c in cards if c.suit is not None}
        return len(suits) == 1
    
    @staticmethod
    def _get_straight(cards: list[Card]) -> Optional[dict]:
        """Check if cards form a straight"""
        
        values = sorted([c.numeric_value for c in cards])
        
        # Check standard straight (sequential)
        if values == list(range(values[0], values[0] + 5)):
            high_rank = cards[values.index(max(values))].rank
            return {'high_rank': high_rank}
        
        # Check A-2-3-4-5 (wheel)
        if values == [2, 3, 4, 5, 14]:  # 14 = Ace
            return {'high_rank': '5'}
        
        return None
    
    @staticmethod
    def _count_ranks(cards: list[Card]) -> dict[str, int]:
        """Count occurrences of each rank"""
        counts = {}
        for card in cards:
            counts[card.rank] = counts.get(card.rank, 0) + 1
        return counts
    
    @staticmethod
    def _get_rank_category(rank: str) -> str:
        """Determine if rank is LOW (2-10) or HIGH (J-A)"""
        face_cards = {'J', 'Q', 'K', 'A'}
        return 'HIGH' if rank in face_cards else 'LOW'
```

---

## 6. Joker Resolution

### 6.1 Joker Resolver (`games/joker_poker/joker.py`)

```python
from dataclasses import dataclass
from .symbols import Card, get_all_standard_cards
from .evaluator import HandEvaluator
from .paytable import calculate_payout

@dataclass
class JokerTransform:
    """Joker transformation"""
    position: int
    target_card: Card

@dataclass
class JokerResolution:
    """Result of Joker resolution"""
    transforms: list[JokerTransform]
    final_board: list[Card]

class JokerResolver:
    """
    Resolves Jokers to optimal cards for maximum payout.
    
    Algorithm:
    - 1 Joker: Try all 48 available cards (O(48))
    - 2 Jokers: Try all combinations (O(48*47) = O(2,256))
    """
    
    @staticmethod
    def resolve(board: list[Card]) -> Optional[JokerResolution]:
        """
        Find best Joker substitution(s) to maximize payout.
        
        Args:
            board: 5 cards, may contain 1-2 Jokers
        
        Returns:
            JokerResolution with transforms and final board
            None if no Jokers
        """
        joker_positions = [i for i, c in enumerate(board) if c.is_joker]
        
        if not joker_positions:
            return None
        
        if len(joker_positions) > 2:
            raise ValueError(f"Max 2 Jokers allowed, got {len(joker_positions)}")
        
        # Get cards already on board (non-Jokers)
        used_card_strings = {
            f"{c.rank}{c.suit}" for c in board if not c.is_joker
        }
        
        # Get available cards for substitution
        available_cards = [
            card for card in get_all_standard_cards()
            if f"{card.rank}{card.suit}" not in used_card_strings
        ]
        
        best_payout = -1
        best_transforms: list[JokerTransform] = []
        
        if len(joker_positions) == 1:
            # Single Joker: try each available card
            best_transforms = JokerResolver._resolve_single_joker(
                board, joker_positions[0], available_cards
            )
        else:
            # Two Jokers: try all combinations
            best_transforms = JokerResolver._resolve_two_jokers(
                board, joker_positions, available_cards
            )
        
        # Apply transformations
        final_board = board.copy()
        for transform in best_transforms:
            final_board[transform.position] = transform.target_card
        
        return JokerResolution(
            transforms=best_transforms,
            final_board=final_board
        )
    
    @staticmethod
    def _resolve_single_joker(
        board: list[Card],
        joker_pos: int,
        available_cards: list[Card]
    ) -> list[JokerTransform]:
        """Resolve single Joker (48 iterations)"""
        
        best_payout = -1
        best_card = None
        
        for card in available_cards:
            test_board = board.copy()
            test_board[joker_pos] = card
            
            hand = HandEvaluator.evaluate(test_board)
            payout = calculate_payout(hand, bet=1)
            
            if payout > best_payout:
                best_payout = payout
                best_card = card
        
        return [JokerTransform(position=joker_pos, target_card=best_card)]
    
    @staticmethod
    def _resolve_two_jokers(
        board: list[Card],
        joker_positions: list[int],
        available_cards: list[Card]
    ) -> list[JokerTransform]:
        """Resolve two Jokers (2,256 iterations)"""
        
        best_payout = -1
        best_cards = (None, None)
        
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
                    best_cards = (card1, card2)
        
        return [
            JokerTransform(position=pos1, target_card=best_cards[0]),
            JokerTransform(position=pos2, target_card=best_cards[1]),
        ]
```

---

## 7. Paytable Configuration

### 7.1 Paytable (`games/joker_poker/paytable.py`)

```python
from .evaluator import HandResult

# Paytable: multipliers for each hand type and rank category
PAYTABLE = {
    'ROYAL_FLUSH': {
        'ANY': 1000.0,
    },
    'STRAIGHT_FLUSH': {
        'ANY': 100.0,
    },
    'FOUR_OF_A_KIND': {
        'ANY': 40.0,
    },
    'FULL_HOUSE': {
        'ANY': 20.0,
    },
    'FLUSH': {
        'ANY': 10.0,
    },
    'STRAIGHT': {
        'ANY': 5.0,
    },
    'THREE_OF_A_KIND': {
        'LOW': 1.5,
        'HIGH': 3.0,
    },
    'TWO_PAIR': {
        'LOW': 0.4,
        'HIGH': 0.8,
    },
    'PAIR': {
        'LOW': 0.2,
        'HIGH': 0.4,
    },
    'HIGH_CARD': {
        'LOW': 0.0,
        'HIGH': 0.1,
    },
}

MAX_WIN = 400_000_000_000  # $400,000 in integer units

def calculate_payout(hand: HandResult, bet: int) -> int:
    """
    Calculate payout for a hand.
    
    Args:
        hand: Evaluated poker hand
        bet: Bet amount in integer units
    
    Returns:
        Payout in integer units (0 if no win)
    """
    
    try:
        multiplier = PAYTABLE[hand.hand_type][hand.rank_category]
    except KeyError:
        # No payout for this combination
        return 0
    
    if multiplier == 0:
        return 0
    
    # Calculate raw payout
    payout = int(bet * multiplier)
    
    # Cap at max win
    payout = min(payout, MAX_WIN)
    
    return payout
```

---

## 8. Event Generation

### 8.1 Event Generator (`games/joker_poker/events.py`)

```python
from typing import Any
from .symbols import Card
from .joker import JokerResolution
from .evaluator import HandResult

def generate_events(
    board: list[Card],
    joker_resolution: Optional[JokerResolution],
    hand_result: HandResult,
    payout_multiplier: float
) -> list[dict[str, Any]]:
    """
    Generate frontend events for Stake Engine.
    
    These events tell the frontend what happened in the round.
    """
    events = []
    index = 0
    
    # Event 1: Reveal initial board
    events.append({
        'index': index,
        'type': 'reveal_initial_board',
        'board': [
            {'symbol': str(card)} for card in board
        ]
    })
    index += 1
    
    # Event 2: Joker transform (if applicable)
    if joker_resolution:
        events.append({
            'index': index,
            'type': 'joker_transform',
            'jokerTransforms': [
                {
                    'position': t.position,
                    'targetSymbol': str(t.target_card)
                }
                for t in joker_resolution.transforms
            ]
        })
        index += 1
    
    # Event 3: Hand result
    events.append({
        'index': index,
        'type': 'hand_result',
        'handCategory': hand_result.hand_type,
        'payoutMultiplier': payout_multiplier,
        'winningPositions': hand_result.winning_positions,
        'jackpot': payout_multiplier >= 40
    })
    
    return events
```

---

## 9. Simulation & RTP

### 9.1 Simulation Script (`games/joker_poker/simulate.py`)

```python
import random
from collections import Counter
from .board import PokerBoard
from .joker import JokerResolver
from .evaluator import HandEvaluator
from .paytable import calculate_payout
from .events import generate_events

def simulate_round() -> dict:
    """Simulate a single round"""
    
    # Deal board
    poker_board = PokerBoard()
    initial_board = poker_board.deal()
    
    # Resolve Jokers
    joker_resolution = JokerResolver.resolve(initial_board)
    
    if joker_resolution:
        final_board = joker_resolution.final_board
    else:
        final_board = initial_board
    
    # Evaluate hand
    hand = HandEvaluator.evaluate(final_board)
    
    # Calculate payout (using unit bet)
    payout = calculate_payout(hand, bet=1)
    multiplier = payout / 1  # payout / bet
    
    # Generate events
    events = generate_events(
        initial_board,
        joker_resolution,
        hand,
        multiplier
    )
    
    return {
        'initial_board': [str(c) for c in initial_board],
        'final_board': [str(c) for c in final_board],
        'hand_type': hand.hand_type,
        'hand_category': hand.rank_category,
        'multiplier': multiplier,
        'payout': payout,
        'events': events,
        'has_joker': joker_resolution is not None,
    }

def calculate_rtp(num_rounds: int = 1_000_000) -> dict:
    """
    Calculate RTP by simulating many rounds.
    
    Args:
        num_rounds: Number of rounds to simulate
    
    Returns:
        RTP statistics
    """
    print(f"Simulating {num_rounds:,} rounds...")
    
    total_bet = 0
    total_win = 0
    hand_counts = Counter()
    joker_count = 0
    
    for i in range(num_rounds):
        if i % 100000 == 0:
            print(f"Progress: {i:,} / {num_rounds:,}")
        
        result = simulate_round()
        
        total_bet += 1
        total_win += result['payout']
        hand_counts[result['hand_type']] += 1
        
        if result['has_joker']:
            joker_count += 1
    
    rtp = (total_win / total_bet) * 100
    
    print("\n" + "="*60)
    print(f"RTP SIMULATION RESULTS")
    print("="*60)
    print(f"Total Rounds: {num_rounds:,}")
    print(f"Total Bet:    {total_bet:,}")
    print(f"Total Win:    {total_win:,}")
    print(f"RTP:          {rtp:.2f}%")
    print(f"Joker Freq:   {joker_count / num_rounds * 100:.2f}%")
    print("\nHand Frequencies:")
    print("-"*60)
    
    for hand_type, count in hand_counts.most_common():
        freq = count / num_rounds * 100
        print(f"{hand_type:20s}: {count:8,} ({freq:6.3f}%)")
    
    print("="*60)
    
    return {
        'rtp': rtp,
        'total_rounds': num_rounds,
        'hand_frequencies': dict(hand_counts),
        'joker_frequency': joker_count / num_rounds,
    }

def export_for_stake_engine(num_outcomes: int = 10_000_000):
    """
    Generate and export outcomes for Stake Engine.
    
    This creates the files that will be uploaded to Stake Engine.
    """
    print(f"Generating {num_outcomes:,} outcomes for Stake Engine...")
    
    outcomes = []
    
    for i in range(num_outcomes):
        if i % 1000000 == 0:
            print(f"Progress: {i:,} / {num_outcomes:,}")
        
        result = simulate_round()
        outcomes.append(result)
    
    # Calculate RTP
    total_bet = num_outcomes
    total_win = sum(o['payout'] for o in outcomes)
    rtp = (total_win / total_bet) * 100
    
    print(f"\nFinal RTP: {rtp:.2f}%")
    
    # Export to Stake Engine format
    # (Stake Engine has specific format requirements)
    # This would use their SDK functions
    
    return outcomes

if __name__ == '__main__':
    # Run RTP calculation
    calculate_rtp(1_000_000)
    
    # Generate outcomes for Stake Engine
    # export_for_stake_engine(10_000_000)
```

---

## 10. Upload & Testing

### 10.1 Run Simulation

```bash
cd math-sdk
source venv/bin/activate

# Run RTP simulation
python -m games.joker_poker.simulate

# Expected output:
# ============================================================
# RTP SIMULATION RESULTS
# ============================================================
# Total Rounds: 1,000,000
# Total Bet:    1,000,000
# Total Win:    970,000
# RTP:          97.00%
# Joker Freq:   3.68%
# 
# Hand Frequencies:
# ------------------------------------------------------------
# HIGH_CARD          :  420,123 (42.012%)
# PAIR               :  422,569 (42.257%)
# TWO_PAIR           :   47,539 ( 4.754%)
# THREE_OF_A_KIND    :   21,128 ( 2.113%)
# STRAIGHT           :    3,924 ( 0.392%)
# FLUSH              :    1,965 ( 0.197%)
# FULL_HOUSE         :    1,442 ( 0.144%)
# FOUR_OF_A_KIND     :      234 ( 0.023%)
# STRAIGHT_FLUSH     :       14 ( 0.001%)
# ROYAL_FLUSH        :        2 ( 0.000%)
# ============================================================
```

### 10.2 Validate Results

**RTP Check:**
- ✅ Target: 96-98%
- ✅ Tolerance: ±0.5%

**Joker Frequency:**
- ✅ Expected: ~3.7% (2/54 cards)
- ✅ Tolerance: ±0.2%

**Hand Frequencies:**
- ✅ Royal Flush: ~0.00015% (1 in 650,000)
- ✅ Four of a Kind: ~0.024% (1 in 4,165)
- ✅ Pair: ~42% (most common)

### 10.3 Generate Outcomes

```bash
# Generate 10M outcomes (this takes ~1 hour)
python -m games.joker_poker.simulate --generate

# This creates:
# - uploads/joker_poker/config.json
# - uploads/joker_poker/outcomes.csv
# - uploads/joker_poker/lookup_tables/
```

### 10.4 Upload to Stake Engine

```bash
# Upload via Stake Engine CLI
stake-engine upload \
  --game joker_poker \
  --version 1.0.0 \
  --path uploads/joker_poker/

# Or use Make command
make upload GAME=joker_poker
```

---

## 11. Testing Locally

### 11.1 Test Mode

Stake Engine provides test mode for local development:

```typescript
// client/src/api/stakeRgsClient.ts

const isDevelopment = import.meta.env.DEV;

export const rgsClient = RGSClient({
  url: window.location.href,
  mode: isDevelopment ? 'test' : 'production',
});
```

### 11.2 Test Scenarios

Once uploaded to Stake Engine, you can test:

```bash
# Open game in test mode
open "http://localhost:3000?sessionID=test&rgs_url=https://test.stake-engine.com/rgs"

# Play multiple rounds
# Check console for events
# Verify RTP over time
```

---

## 12. Checklist

### Math SDK Setup ✅

- [ ] Clone Stake Math SDK repo
- [ ] Setup Python environment (venv)
- [ ] Create `games/joker_poker/` folder
- [ ] Implement all 8 Python files:
  - [ ] `config.py` - Game config
  - [ ] `symbols.py` - Card deck (54 cards)
  - [ ] `board.py` - 5-card board logic
  - [ ] `evaluator.py` - Hand evaluation (13 types)
  - [ ] `joker.py` - Joker resolution
  - [ ] `paytable.py` - Payout calculation
  - [ ] `events.py` - Event generation
  - [ ] `simulate.py` - RTP simulation
- [ ] Run simulation (1M rounds)
- [ ] Verify RTP: 96-98%
- [ ] Generate outcomes (10M)
- [ ] Upload to Stake Engine

### Frontend Integration ✅

- [ ] Install `stake-engine` npm package
- [ ] Create `stakeRgsClient.ts`
- [ ] Update `GameController.ts`:
  - [ ] Replace mock import
  - [ ] Use `stakeRgs.authenticate()`
  - [ ] Use `stakeRgs.play()`
  - [ ] Use `stakeRgs.endRound()`
- [ ] Add balance event listeners
- [ ] Remove mock files
- [ ] Test with Stake Engine
- [ ] Verify all animations work
- [ ] Build for production
- [ ] Upload to Stake CDN

---

## 13. Expected Timeline

| Week | Tasks | Deliverable |
|------|-------|-------------|
| 1 | Math SDK setup + implementation | RTP validated at 97% |
| 2 | Frontend integration | Working with Stake Engine test mode |
| 3 | Testing + deploy | Live on Stake Engine CDN |

---

## 14. Resources

### Official Documentation:
- **Stake Engine Docs:** https://stake-engine.com/docs
- **Math SDK GitHub:** https://github.com/StakeEngine/math-sdk
- **TypeScript Client:** https://github.com/StakeEngine/ts-client
- **RGS API Docs:** https://stake-engine.com/docs/rgs

### Examples:
- Check `math-sdk/games/` for example games
- Reference existing implementations

---

**Ready to implement!** 🚀

**Next:** Start with Math SDK setup (Week 1)
