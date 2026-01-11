# 🎰 Game Logic Specification - Real Implementation

**Project:** Joker Poker Board  
**Version:** 2.0 (Real RGS)  
**Date:** 2026-01-11  
**Status:** Specification

---

## Table of Contents

1. [Overview](#1-overview)
2. [Data Structures](#2-data-structures)
3. [Deck Management](#3-deck-management)
4. [Hand Evaluation](#4-hand-evaluation)
5. [Joker Logic](#5-joker-logic)
6. [Payout Calculation](#6-payout-calculation)
7. [Wallet Management](#7-wallet-management)
8. [API Specification](#8-api-specification)
9. [Event Generation](#9-event-generation)
10. [RTP & Math Validation](#10-rtp--math-validation)
11. [Error Handling](#11-error-handling)
12. [Security](#12-security)

---

## 1. Overview

### 1.1 Game Rules

**Joker Poker Board** is a 5-card poker game where:
- Player places bet and receives 5 cards (board only, no hole cards)
- Cards dealt face-down, revealed sequentially (flop → turn → river)
- Up to 2 Jokers can appear (wild cards)
- Jokers transform into best possible cards to maximize win
- Best 5-card poker hand determines payout
- 13 hand types from High Card to Royal Flush

### 1.2 Technical Stack

**Backend:**
- Language: Python 3.11+
- Framework: FastAPI (async)
- RNG: `secrets.SystemRandom()`
- Testing: pytest
- Type hints: mypy strict mode

**Data Storage:**
- Sessions: Redis (optional) or in-memory dict
- Balances: Redis (optional) or in-memory dict
- Persistent data: PostgreSQL (future)

---

## 2. Data Structures

### 2.1 Card

```python
from enum import Enum
from dataclasses import dataclass

class Suit(Enum):
    CLUBS = "C"
    DIAMONDS = "D"
    HEARTS = "H"
    SPADES = "S"

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
    JOKER = "JOKER"  # Special rank for Joker cards

@dataclass(frozen=True)
class Card:
    rank: Rank
    suit: Suit | None  # None for Joker
    
    def __str__(self) -> str:
        if self.rank == Rank.JOKER:
            return "JOKER"
        return f"{self.rank.value}{self.suit.value}"
    
    @property
    def is_joker(self) -> bool:
        return self.rank == Rank.JOKER
    
    @property
    def numeric_value(self) -> int:
        """Numeric value for sorting/comparison."""
        values = {
            Rank.TWO: 2, Rank.THREE: 3, Rank.FOUR: 4, Rank.FIVE: 5,
            Rank.SIX: 6, Rank.SEVEN: 7, Rank.EIGHT: 8, Rank.NINE: 9,
            Rank.TEN: 10, Rank.JACK: 11, Rank.QUEEN: 12, Rank.KING: 13,
            Rank.ACE: 14, Rank.JOKER: 0
        }
        return values[self.rank]
```

### 2.2 Hand Types

```python
class HandType(Enum):
    HIGH_CARD = "HIGH_CARD"
    PAIR = "PAIR"
    TWO_PAIR = "TWO_PAIR"
    THREE_OF_A_KIND = "THREE_OF_A_KIND"
    STRAIGHT = "STRAIGHT"
    FLUSH = "FLUSH"
    FULL_HOUSE = "FULL_HOUSE"
    FOUR_OF_A_KIND = "FOUR_OF_A_KIND"
    STRAIGHT_FLUSH = "STRAIGHT_FLUSH"
    ROYAL_FLUSH = "ROYAL_FLUSH"

class RankCategory(Enum):
    """For hands with rank-based payouts."""
    LOW = "LOW"    # 2-10
    HIGH = "HIGH"  # J-A
    ANY = "ANY"    # Doesn't matter

@dataclass
class HandResult:
    hand_type: HandType
    rank_category: RankCategory
    primary_rank: Rank  # Main rank (e.g., rank of pair/trips)
    kickers: list[Rank]  # Remaining cards for tiebreaking
    winning_positions: list[int]  # Card positions that form the hand
    
    @property
    def multiplier(self) -> float:
        """Get payout multiplier from paytable."""
        return PAYTABLE[self.hand_type][self.rank_category]
```

### 2.3 Joker Transform

```python
@dataclass
class JokerTransform:
    position: int  # Position on board (0-4)
    target_card: Card  # What Joker becomes
    
@dataclass
class JokerResolution:
    transforms: list[JokerTransform]
    resulting_hand: HandResult
```

### 2.4 Round State

```python
@dataclass
class RoundState:
    round_id: str
    session_id: str
    bet_amount: int  # In integer units (1000000 = $1.00)
    board: list[Card]  # 5 cards
    joker_transforms: JokerResolution | None
    final_hand: HandResult
    payout: int  # Win amount in integer units
    timestamp: datetime
```

---

## 3. Deck Management

### 3.1 Deck Creation

```python
from secrets import SystemRandom

class DeckManager:
    """Manages deck creation, shuffling, and dealing."""
    
    def __init__(self):
        self.rng = SystemRandom()
    
    def create_deck(self) -> list[Card]:
        """Create full deck: 52 standard cards + 2 Jokers."""
        deck = []
        
        # Add 52 standard cards
        for suit in Suit:
            for rank in [r for r in Rank if r != Rank.JOKER]:
                deck.append(Card(rank, suit))
        
        # Add 2 Jokers
        deck.append(Card(Rank.JOKER, None))
        deck.append(Card(Rank.JOKER, None))
        
        assert len(deck) == 54, "Deck must have exactly 54 cards"
        return deck
    
    def shuffle(self, deck: list[Card]) -> list[Card]:
        """
        Fisher-Yates shuffle using cryptographically secure RNG.
        
        Time complexity: O(n)
        Space complexity: O(1) (in-place)
        """
        shuffled = deck.copy()
        n = len(shuffled)
        
        for i in range(n - 1, 0, -1):
            j = self.rng.randint(0, i)
            shuffled[i], shuffled[j] = shuffled[j], shuffled[i]
        
        return shuffled
    
    def deal_board(self) -> list[Card]:
        """Deal 5 cards for the board."""
        deck = self.create_deck()
        shuffled = self.shuffle(deck)
        return shuffled[:5]
```

### 3.2 Shuffle Algorithm Details

**Fisher-Yates Shuffle:**
```
For i from n-1 down to 1:
    j ← random integer with 0 ≤ j ≤ i
    swap deck[i] with deck[j]
```

**Properties:**
- Unbiased: All permutations equally likely
- Efficient: O(n) time, O(1) space
- Secure: Uses `secrets.SystemRandom()` (OS entropy)

**Security Notes:**
- ❌ Don't use `random.random()` (Mersenne Twister is predictable)
- ✅ Use `secrets.SystemRandom()` (cryptographically secure)
- ❌ Don't seed with time (predictable)
- ✅ Use system entropy `/dev/urandom`

---

## 4. Hand Evaluation

### 4.1 Evaluation Algorithm

```python
class HandEvaluator:
    """Evaluates 5-card poker hands."""
    
    def evaluate(self, cards: list[Card]) -> HandResult:
        """
        Evaluate 5 cards and return best hand.
        
        Cards must not contain Jokers - they should be resolved first.
        """
        assert len(cards) == 5, "Must have exactly 5 cards"
        assert not any(c.is_joker for c in cards), "Jokers must be resolved"
        
        # Check hands in order of strength (strongest first)
        if result := self._check_royal_flush(cards):
            return result
        if result := self._check_straight_flush(cards):
            return result
        if result := self._check_four_of_a_kind(cards):
            return result
        if result := self._check_full_house(cards):
            return result
        if result := self._check_flush(cards):
            return result
        if result := self._check_straight(cards):
            return result
        if result := self._check_three_of_a_kind(cards):
            return result
        if result := self._check_two_pair(cards):
            return result
        if result := self._check_pair(cards):
            return result
        
        return self._check_high_card(cards)
```

### 4.2 Specific Hand Checks

#### 4.2.1 Royal Flush
```python
def _check_royal_flush(self, cards: list[Card]) -> HandResult | None:
    """
    Royal Flush: A, K, Q, J, 10 all same suit.
    
    Steps:
    1. Check if all cards same suit
    2. Check if ranks are exactly {A, K, Q, J, 10}
    """
    if not self._is_flush(cards):
        return None
    
    ranks = {c.rank for c in cards}
    royal_ranks = {Rank.ACE, Rank.KING, Rank.QUEEN, Rank.JACK, Rank.TEN}
    
    if ranks == royal_ranks:
        return HandResult(
            hand_type=HandType.ROYAL_FLUSH,
            rank_category=RankCategory.ANY,
            primary_rank=Rank.ACE,
            kickers=[],
            winning_positions=[0, 1, 2, 3, 4]
        )
    
    return None
```

#### 4.2.2 Straight Flush
```python
def _check_straight_flush(self, cards: list[Card]) -> HandResult | None:
    """Straight Flush: 5 sequential ranks, same suit."""
    if not self._is_flush(cards):
        return None
    
    if straight := self._is_straight(cards):
        return HandResult(
            hand_type=HandType.STRAIGHT_FLUSH,
            rank_category=RankCategory.ANY,
            primary_rank=straight.high_rank,
            kickers=[],
            winning_positions=[0, 1, 2, 3, 4]
        )
    
    return None
```

#### 4.2.3 Four of a Kind
```python
def _check_four_of_a_kind(self, cards: list[Card]) -> HandResult | None:
    """Four of a Kind: 4 cards of same rank."""
    rank_counts = self._count_ranks(cards)
    
    for rank, count in rank_counts.items():
        if count == 4:
            positions = [i for i, c in enumerate(cards) if c.rank == rank]
            kicker = [r for r, cnt in rank_counts.items() if cnt == 1][0]
            
            return HandResult(
                hand_type=HandType.FOUR_OF_A_KIND,
                rank_category=RankCategory.ANY,
                primary_rank=rank,
                kickers=[kicker],
                winning_positions=positions
            )
    
    return None
```

#### 4.2.4 Full House
```python
def _check_full_house(self, cards: list[Card]) -> HandResult | None:
    """Full House: 3 of a kind + pair."""
    rank_counts = self._count_ranks(cards)
    
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
            hand_type=HandType.FULL_HOUSE,
            rank_category=RankCategory.ANY,
            primary_rank=trips_rank,
            kickers=[pair_rank],
            winning_positions=positions
        )
    
    return None
```

### 4.3 Helper Methods

```python
def _is_flush(self, cards: list[Card]) -> bool:
    """Check if all cards are same suit."""
    suits = {c.suit for c in cards}
    return len(suits) == 1

def _is_straight(self, cards: list[Card]) -> StraightResult | None:
    """
    Check if cards form a straight.
    
    Special case: A can be low (A-2-3-4-5) or high (10-J-Q-K-A).
    """
    values = sorted([c.numeric_value for c in cards])
    
    # Check standard straight
    if values == list(range(values[0], values[0] + 5)):
        return StraightResult(high_rank=cards[values.index(max(values))].rank)
    
    # Check A-2-3-4-5 (wheel)
    if values == [2, 3, 4, 5, 14]:  # 14 = Ace
        return StraightResult(high_rank=Rank.FIVE)
    
    return None

def _count_ranks(self, cards: list[Card]) -> dict[Rank, int]:
    """Count occurrences of each rank."""
    counts = {}
    for card in cards:
        counts[card.rank] = counts.get(card.rank, 0) + 1
    return counts

def _get_rank_category(self, rank: Rank) -> RankCategory:
    """Determine if rank is LOW (2-10) or HIGH (J-A)."""
    face_cards = {Rank.JACK, Rank.QUEEN, Rank.KING, Rank.ACE}
    return RankCategory.HIGH if rank in face_cards else RankCategory.LOW
```

---

## 5. Joker Logic

### 5.1 Joker Resolution Algorithm

```python
class JokerResolver:
    """Resolves Jokers to optimal cards."""
    
    def __init__(self, evaluator: HandEvaluator):
        self.evaluator = evaluator
    
    def resolve(self, board: list[Card]) -> JokerResolution | None:
        """
        Find best Joker substitution(s) to maximize payout.
        
        Algorithm:
        1. Find all Joker positions
        2. Generate all valid substitutions
        3. Evaluate each resulting hand
        4. Return substitution with highest payout
        
        Time complexity:
        - 0 Jokers: O(1)
        - 1 Joker: O(48) - try all 48 possible cards
        - 2 Jokers: O(48 * 47) = O(2256) - try all combinations
        """
        joker_positions = [i for i, c in enumerate(board) if c.is_joker]
        
        if not joker_positions:
            return None
        
        best_hand = None
        best_transforms = []
        best_payout = 0
        
        # Generate all possible substitutions
        for substitution in self._generate_substitutions(board, joker_positions):
            # Create test board with substitution
            test_board = board.copy()
            for pos, card in substitution:
                test_board[pos] = card
            
            # Evaluate hand
            hand = self.evaluator.evaluate(test_board)
            payout = self._calculate_payout(hand, bet=1)  # Use unit bet
            
            if payout > best_payout:
                best_payout = payout
                best_hand = hand
                best_transforms = [
                    JokerTransform(pos, card) 
                    for pos, card in substitution
                ]
        
        return JokerResolution(
            transforms=best_transforms,
            resulting_hand=best_hand
        )
    
    def _generate_substitutions(
        self, 
        board: list[Card], 
        joker_positions: list[int]
    ) -> Iterator[list[tuple[int, Card]]]:
        """
        Generate all valid Joker substitutions.
        
        A valid substitution:
        - Replaces each Joker with a standard card
        - Doesn't create duplicate cards on the board
        - Uses only cards not already on the board
        """
        # Get cards already on board (non-Jokers)
        used_cards = {c for c in board if not c.is_joker}
        
        # Get all possible cards
        all_cards = self._get_all_standard_cards()
        available_cards = [c for c in all_cards if c not in used_cards]
        
        # Generate combinations
        if len(joker_positions) == 1:
            # Single Joker: try each available card
            for card in available_cards:
                yield [(joker_positions[0], card)]
        
        elif len(joker_positions) == 2:
            # Two Jokers: try each pair of available cards
            for i, card1 in enumerate(available_cards):
                for card2 in available_cards[i+1:]:
                    yield [
                        (joker_positions[0], card1),
                        (joker_positions[1], card2)
                    ]
    
    def _get_all_standard_cards(self) -> list[Card]:
        """Get all 52 standard cards (no Jokers)."""
        cards = []
        for suit in Suit:
            for rank in [r for r in Rank if r != Rank.JOKER]:
                cards.append(Card(rank, suit))
        return cards
```

### 5.2 Optimization Strategies

**For 1 Joker (48 iterations):**
- Fast: ~0.05ms on modern hardware
- No optimization needed

**For 2 Jokers (2,256 iterations):**
- Still acceptable: ~1-2ms
- Possible optimizations:
  1. Early termination if Royal Flush found
  2. Prune obviously bad substitutions
  3. Cache hand evaluations

**Future Optimization (if needed):**
```python
def resolve_optimized(self, board: list[Card]) -> JokerResolution:
    """
    Optimized Joker resolution with early termination.
    """
    # If we find Royal Flush, stop immediately (best possible)
    if hand.hand_type == HandType.ROYAL_FLUSH:
        return JokerResolution(...)
    
    # If we find Straight Flush, only check for Royal
    if hand.hand_type == HandType.STRAIGHT_FLUSH:
        # Only check Royal Flush possibilities
        pass
```

---

## 6. Payout Calculation

### 6.1 Paytable

```python
# Paytable: {HandType: {RankCategory: multiplier}}
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
```

### 6.2 Payout Calculator

```python
class PayoutCalculator:
    """Calculates payouts based on paytable."""
    
    MAX_WIN = 400_000_000_000  # $400,000 in integer units
    
    def calculate(self, hand: HandResult, bet: int) -> int:
        """
        Calculate payout for a hand.
        
        Args:
            hand: Evaluated poker hand
            bet: Bet amount in integer units
        
        Returns:
            Payout in integer units (0 if no win)
        """
        multiplier = PAYTABLE[hand.hand_type][hand.rank_category]
        
        if multiplier == 0:
            return 0
        
        # Calculate raw payout
        payout = int(bet * multiplier)
        
        # Cap at max win
        payout = min(payout, self.MAX_WIN)
        
        return payout
    
    def get_hand_tier(self, multiplier: float) -> str:
        """Get visual tier for frontend."""
        if multiplier >= 40:
            return "JACKPOT"
        elif multiplier > 10:
            return "BEST"
        elif multiplier > 3:
            return "HIGH"
        elif multiplier > 1.5:
            return "MEDIUM"
        else:
            return "NORMAL"
```

---

## 7. Wallet Management

### 7.1 Session Management

```python
from dataclasses import dataclass
from datetime import datetime, timedelta
import uuid

@dataclass
class Session:
    session_id: str
    player_id: str  # External player identifier
    balance: int  # Current balance in integer units
    created_at: datetime
    last_activity: datetime
    active_round: RoundState | None  # Round in progress (if any)
    
    def is_expired(self, timeout: timedelta = timedelta(minutes=30)) -> bool:
        """Check if session expired due to inactivity."""
        return datetime.now() - self.last_activity > timeout
    
    def is_locked(self) -> bool:
        """Check if session is locked (round in progress)."""
        return self.active_round is not None

class SessionManager:
    """Manages active player sessions."""
    
    def __init__(self):
        self.sessions: dict[str, Session] = {}
    
    def create_session(self, player_id: str, initial_balance: int) -> Session:
        """Create new session for player."""
        session = Session(
            session_id=str(uuid.uuid4()),
            player_id=player_id,
            balance=initial_balance,
            created_at=datetime.now(),
            last_activity=datetime.now(),
            active_round=None
        )
        self.sessions[session.session_id] = session
        return session
    
    def get_session(self, session_id: str) -> Session:
        """Get session by ID, raise error if not found or expired."""
        if session_id not in self.sessions:
            raise SessionNotFoundError(f"Session {session_id} not found")
        
        session = self.sessions[session_id]
        
        if session.is_expired():
            del self.sessions[session_id]
            raise SessionExpiredError(f"Session {session_id} expired")
        
        session.last_activity = datetime.now()
        return session
    
    def lock_session(self, session_id: str, round_state: RoundState):
        """Lock session for active round."""
        session = self.get_session(session_id)
        
        if session.is_locked():
            raise SessionLockedError("Round already in progress")
        
        session.active_round = round_state
    
    def unlock_session(self, session_id: str):
        """Unlock session after round completion."""
        session = self.get_session(session_id)
        session.active_round = None
```

### 7.2 Balance Management

```python
class BalanceManager:
    """Manages player balances with atomic operations."""
    
    def debit(self, session: Session, amount: int):
        """
        Deduct bet from balance.
        
        Raises InsufficientBalanceError if balance < amount.
        """
        if session.balance < amount:
            raise InsufficientBalanceError(
                f"Insufficient balance: {session.balance} < {amount}"
            )
        
        session.balance -= amount
    
    def credit(self, session: Session, amount: int):
        """Add win to balance."""
        session.balance += amount
    
    def get_balance(self, session: Session) -> int:
        """Get current balance."""
        return session.balance
```

---

## 8. API Specification

### 8.1 Authenticate

```
POST /wallet/authenticate
```

**Request:**
```json
{
  "sessionID": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "balance": 4530000000,
  "config": {
    "minBet": 100000,
    "maxBet": 1000000000,
    "stepBet": 100000,
    "betLevels": [
      100000,
      500000,
      1000000,
      5000000,
      10000000,
      50000000,
      100000000,
      500000000,
      1000000000
    ],
    "currency": "USD",
    "maxWin": 400000000000
  },
  "sessionID": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Implementation:**
```python
@app.post("/wallet/authenticate")
async def authenticate(request: AuthenticateRequest) -> AuthenticateResponse:
    """
    Authenticate session and return config.
    
    If session doesn't exist, create it with default balance.
    """
    try:
        # Try to get existing session
        session = session_manager.get_session(request.sessionID)
    except SessionNotFoundError:
        # Create new session
        session = session_manager.create_session(
            player_id=request.sessionID,  # Using sessionID as playerID for now
            initial_balance=4_530_000_000  # $4,530 default
        )
    
    return AuthenticateResponse(
        balance=session.balance,
        config=get_game_config(),
        sessionID=session.session_id
    )
```

### 8.2 Play

```
POST /wallet/play
```

**Request:**
```json
{
  "sessionID": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 1000000,
  "mode": "BASE"
}
```

**Response:**
```json
{
  "balance": 4529000000,
  "round": {
    "id": "round-1234",
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
}
```

**With Joker:**
```json
{
  "balance": 4529000000,
  "round": {
    "id": "round-1235",
    "events": [
      {
        "index": 0,
        "type": "reveal_initial_board",
        "board": [
          {"symbol": "AS"},
          {"symbol": "JOKER"},
          {"symbol": "7H"},
          {"symbol": "9S"},
          {"symbol": "3C"}
        ]
      },
      {
        "index": 1,
        "type": "joker_transform",
        "jokerTransforms": [
          {
            "position": 1,
            "targetSymbol": "AD"
          }
        ]
      },
      {
        "index": 2,
        "type": "hand_result",
        "handCategory": "PAIR",
        "payoutMultiplier": 0.4,
        "winningPositions": [0, 1],
        "jackpot": false
      }
    ]
  }
}
```

**Implementation:**
```python
@app.post("/wallet/play")
async def play(request: PlayRequest) -> PlayResponse:
    """
    Start a new round.
    
    Steps:
    1. Validate session
    2. Check session not locked
    3. Debit bet
    4. Deal cards
    5. Resolve Jokers (if any)
    6. Evaluate hand
    7. Generate events
    8. Lock session with round state
    9. Return response
    """
    # Validate session
    session = session_manager.get_session(request.sessionID)
    
    # Validate bet
    if request.amount < config.minBet or request.amount > config.maxBet:
        raise InvalidBetError("Bet out of range")
    
    # Debit bet
    balance_manager.debit(session, request.amount)
    
    # Deal board
    board = deck_manager.deal_board()
    
    # Resolve Jokers
    joker_resolution = None
    if any(c.is_joker for c in board):
        joker_resolution = joker_resolver.resolve(board)
        final_board = board.copy()
        for transform in joker_resolution.transforms:
            final_board[transform.position] = transform.target_card
    else:
        final_board = board
    
    # Evaluate hand
    hand = hand_evaluator.evaluate(final_board)
    
    # Calculate payout
    payout = payout_calculator.calculate(hand, request.amount)
    
    # Create round state
    round_state = RoundState(
        round_id=f"round-{uuid.uuid4()}",
        session_id=session.session_id,
        bet_amount=request.amount,
        board=board,
        joker_transforms=joker_resolution,
        final_hand=hand,
        payout=payout,
        timestamp=datetime.now()
    )
    
    # Lock session
    session_manager.lock_session(session.session_id, round_state)
    
    # Generate events
    events = event_generator.generate(round_state)
    
    return PlayResponse(
        balance=session.balance,
        round=RoundResponse(
            id=round_state.round_id,
            events=events
        )
    )
```

### 8.3 End Round

```
POST /wallet/end-round
```

**Request:**
```json
{
  "sessionID": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "balance": 4569000000
}
```

**Implementation:**
```python
@app.post("/wallet/end-round")
async def end_round(request: EndRoundRequest) -> EndRoundResponse:
    """
    Complete round and credit win.
    
    Steps:
    1. Validate session
    2. Check session is locked (round in progress)
    3. Credit payout
    4. Unlock session
    5. Return new balance
    """
    session = session_manager.get_session(request.sessionID)
    
    if not session.is_locked():
        raise NoActiveRoundError("No round in progress")
    
    round_state = session.active_round
    
    # Credit win
    if round_state.payout > 0:
        balance_manager.credit(session, round_state.payout)
    
    # Unlock session
    session_manager.unlock_session(session.session_id)
    
    return EndRoundResponse(balance=session.balance)
```

### 8.4 Balance

```
GET /wallet/balance?sessionID=550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "balance": 4569000000
}
```

---

## 9. Event Generation

### 9.1 Event Generator

```python
class EventGenerator:
    """Generates frontend events from round state."""
    
    def generate(self, round_state: RoundState) -> list[dict]:
        """Generate ordered events for frontend."""
        events = []
        index = 0
        
        # Event 1: Reveal initial board
        events.append({
            "index": index,
            "type": "reveal_initial_board",
            "board": [{"symbol": str(card)} for card in round_state.board]
        })
        index += 1
        
        # Event 2: Joker transform (if applicable)
        if round_state.joker_transforms:
            events.append({
                "index": index,
                "type": "joker_transform",
                "jokerTransforms": [
                    {
                        "position": t.position,
                        "targetSymbol": str(t.target_card)
                    }
                    for t in round_state.joker_transforms.transforms
                ]
            })
            index += 1
        
        # Event 3: Hand result
        events.append({
            "index": index,
            "type": "hand_result",
            "handCategory": round_state.final_hand.hand_type.value,
            "payoutMultiplier": round_state.final_hand.multiplier,
            "winningPositions": round_state.final_hand.winning_positions,
            "jackpot": round_state.final_hand.multiplier >= 40
        })
        
        return events
```

---

## 10. RTP & Math Validation

### 10.1 RTP Calculation

```python
class RTPCalculator:
    """Calculate Return to Player percentage."""
    
    def simulate(self, num_rounds: int = 1_000_000) -> RTPresult:
        """
        Run simulation to calculate RTP.
        
        Args:
            num_rounds: Number of rounds to simulate
        
        Returns:
            RTP result with statistics
        """
        total_bet = 0
        total_win = 0
        hand_frequencies = {hand_type: 0 for hand_type in HandType}
        joker_count = 0
        
        for _ in range(num_rounds):
            # Deal board
            board = deck_manager.deal_board()
            
            # Count Jokers
            num_jokers = sum(1 for c in board if c.is_joker)
            if num_jokers > 0:
                joker_count += 1
            
            # Resolve and evaluate
            if num_jokers > 0:
                resolution = joker_resolver.resolve(board)
                final_board = board.copy()
                for t in resolution.transforms:
                    final_board[t.position] = t.target_card
                hand = resolution.resulting_hand
            else:
                hand = hand_evaluator.evaluate(board)
            
            # Calculate payout (using unit bet)
            payout = payout_calculator.calculate(hand, 1)
            
            total_bet += 1
            total_win += payout
            hand_frequencies[hand.hand_type] += 1
        
        rtp = (total_win / total_bet) * 100
        
        return RTPResult(
            rtp=rtp,
            total_rounds=num_rounds,
            total_bet=total_bet,
            total_win=total_win,
            hand_frequencies=hand_frequencies,
            joker_frequency=joker_count / num_rounds
        )
```

### 10.2 Expected Results

**Target RTP:** 96-98%

**Expected Hand Frequencies (approximate):**
```
High Card:        ~50%
Pair:             ~42%
Two Pair:         ~4.7%
Three of a Kind:  ~2.1%
Straight:         ~0.39%
Flush:            ~0.20%
Full House:       ~0.14%
Four of a Kind:   ~0.024%
Straight Flush:   ~0.0014%
Royal Flush:      ~0.00015%
```

**Joker Frequency:**
- Expected: ~3.7% (2 Jokers in 54 cards)
- 1 Joker: ~3.5%
- 2 Jokers: ~0.2%

### 10.3 Validation Tests

```python
def test_rtp():
    """Validate RTP is within acceptable range."""
    calculator = RTPCalculator()
    result = calculator.simulate(1_000_000)
    
    assert 96 <= result.rtp <= 98, f"RTP out of range: {result.rtp}%"

def test_joker_frequency():
    """Validate Joker appearance frequency."""
    calculator = RTPCalculator()
    result = calculator.simulate(1_000_000)
    
    expected = 0.037  # 3.7%
    tolerance = 0.002  # ±0.2%
    
    assert abs(result.joker_frequency - expected) < tolerance

def test_no_impossible_hands():
    """Ensure no invalid hands are generated."""
    for _ in range(10_000):
        board = deck_manager.deal_board()
        
        # Check no duplicate cards
        assert len(board) == len(set(board)), "Duplicate cards found"
        
        # Check valid cards
        for card in board:
            assert card in ALL_VALID_CARDS, f"Invalid card: {card}"
```

---

## 11. Error Handling

### 11.1 Error Types

```python
class GameError(Exception):
    """Base exception for game errors."""
    pass

class SessionNotFoundError(GameError):
    """Session does not exist."""
    code = "ERR_IS"

class SessionExpiredError(GameError):
    """Session expired due to inactivity."""
    code = "ERR_SE"

class SessionLockedError(GameError):
    """Round already in progress."""
    code = "ERR_LOCKED"

class InsufficientBalanceError(GameError):
    """Balance too low for bet."""
    code = "ERR_IPB"

class InvalidBetError(GameError):
    """Bet amount invalid."""
    code = "ERR_BET"

class NoActiveRoundError(GameError):
    """No round in progress."""
    code = "ERR_NO_ROUND"
```

### 11.2 Error Responses

```json
{
  "error": {
    "code": "ERR_IPB",
    "message": "Insufficient balance: 100000 < 1000000",
    "details": {
      "balance": 100000,
      "required": 1000000
    }
  }
}
```

---

## 12. Security

### 12.1 RNG Security

```python
# ✅ GOOD: Cryptographically secure
from secrets import SystemRandom
rng = SystemRandom()
card_index = rng.randint(0, 53)

# ❌ BAD: Predictable
import random
random.seed(int(time.time()))  # DON'T DO THIS
card_index = random.randint(0, 53)
```

### 12.2 Session Security

- Generate UUIDs for sessions (UUID v4)
- Expire after 30 minutes inactivity
- Lock during active rounds
- Validate on every request

### 12.3 Rate Limiting

```python
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter

@app.post("/wallet/play")
@limiter.limit("100/minute")  # Max 100 plays per minute
async def play(...):
    pass
```

### 12.4 Input Validation

- Validate session IDs (UUID format)
- Validate bet amounts (within min/max)
- Validate mode (only "BASE" allowed)
- Sanitize all inputs

---

## 13. Testing Strategy

### 13.1 Unit Tests

```python
def test_deck_has_54_cards():
    deck = deck_manager.create_deck()
    assert len(deck) == 54

def test_shuffle_preserves_cards():
    deck = deck_manager.create_deck()
    shuffled = deck_manager.shuffle(deck)
    assert sorted(deck) == sorted(shuffled)

def test_royal_flush_detection():
    cards = [
        Card(Rank.TEN, Suit.HEARTS),
        Card(Rank.JACK, Suit.HEARTS),
        Card(Rank.QUEEN, Suit.HEARTS),
        Card(Rank.KING, Suit.HEARTS),
        Card(Rank.ACE, Suit.HEARTS),
    ]
    hand = hand_evaluator.evaluate(cards)
    assert hand.hand_type == HandType.ROYAL_FLUSH

def test_joker_resolution_finds_best_hand():
    board = [
        Card(Rank.ACE, Suit.SPADES),
        Card(Rank.JOKER, None),
        Card(Rank.SEVEN, Suit.HEARTS),
        Card(Rank.NINE, Suit.SPADES),
        Card(Rank.THREE, Suit.CLUBS),
    ]
    resolution = joker_resolver.resolve(board)
    # Should transform Joker to AS to make a pair
    assert resolution.transforms[0].target_card.rank == Rank.ACE
```

### 13.2 Integration Tests

```python
async def test_full_round_flow():
    # Authenticate
    auth_response = await client.post("/wallet/authenticate", json={
        "sessionID": "test-session"
    })
    
    # Play
    play_response = await client.post("/wallet/play", json={
        "sessionID": "test-session",
        "amount": 1000000,
        "mode": "BASE"
    })
    
    assert play_response.status_code == 200
    assert len(play_response.json()["round"]["events"]) >= 2
    
    # End round
    end_response = await client.post("/wallet/end-round", json={
        "sessionID": "test-session"
    })
    
    assert end_response.status_code == 200
```

### 13.3 Load Tests

```python
# Using locust
class PokerUser(HttpUser):
    @task
    def play_round(self):
        # Authenticate
        response = self.client.post("/wallet/authenticate", json={
            "sessionID": f"user-{self.user_id}"
        })
        
        # Play
        self.client.post("/wallet/play", json={
            "sessionID": f"user-{self.user_id}",
            "amount": 1000000,
            "mode": "BASE"
        })
        
        # End
        self.client.post("/wallet/end-round", json={
            "sessionID": f"user-{self.user_id}"
        })

# Run: locust -f load_test.py --users 100 --spawn-rate 10
```

---

## 14. Implementation Checklist

### Week 1: Core Math
- [ ] Card, Deck, Hand data structures
- [ ] Deck manager with Fisher-Yates shuffle
- [ ] Hand evaluator (all 13 types)
- [ ] Unit tests (100% coverage)
- [ ] Payout calculator
- [ ] Joker resolver
- [ ] RTP simulation

### Week 2: Backend API
- [ ] FastAPI project setup
- [ ] Session manager
- [ ] Balance manager
- [ ] /authenticate endpoint
- [ ] /play endpoint
- [ ] /end-round endpoint
- [ ] /balance endpoint
- [ ] Error handling
- [ ] Rate limiting

### Week 3: Integration & Testing
- [ ] Connect frontend to real API
- [ ] Remove mock client
- [ ] Integration tests
- [ ] Load tests (100 concurrent users)
- [ ] RTP validation (1M rounds)
- [ ] Security audit
- [ ] Performance optimization
- [ ] Documentation

---

## 15. Success Criteria

- ✅ RTP: 96-98%
- ✅ All 13 hand types correctly detected
- ✅ Joker finds optimal substitution 100% of time
- ✅ API response time < 100ms (p95)
- ✅ Supports 100+ concurrent users
- ✅ No balance discrepancies
- ✅ 100% test coverage on core math
- ✅ Frontend works without changes

---

**Ready to implement!** 🚀

See `IMPLEMENTATION_BRIEF.md` for high-level overview.
