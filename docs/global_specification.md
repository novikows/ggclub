Ок, да, давай сразу в техспеку. Ниже черновик **Tech Specification (EN)** для MVP на Stake Engine + HTML5 + JS + PixiJS, с учётом джокера, респинов и интеграции с RGS.

---

# 1. Game Overview

**Working title:** *Joker Poker Board* (placeholder)
**Platform:** Stake Engine (RGS) web game
**Tech stack (frontend MVP):**

* HTML5, CSS
* JavaScript / TypeScript
* PixiJS for rendering
* No Svelte requirement (we use Stake Engine as RGS only, custom frontend is allowed as long as it’s static files) ([Stake Engine][1])

**Math / backend:**

* Game math implemented with **Stake Math SDK** (Python), producing static compressed outcome files + CSV lookup tables as required by Stake Engine. ([Stake Engine][1])
* All possible game outcomes per mode are pre-generated and uploaded; /play selects a simulation based on weighting and returns event stream describing the round. ([Stake Engine][1])

**Core fantasy:**
Player bets, 5 poker cards are dealt to the board in one spin (5-card board only). Frontend animates them as "flop → turn → river" with delays for dopamine effects. Hand strength determines payout. Jokers act as wild cards, transforming into the best card to maximize the winning combination.

---

# 2. Core Mechanics

## 2.1 Round structure

* Each round is a **single 5‑card board**.
* Cards are generated entirely by Stake Engine math (no RNG in frontend).
* Game is **board-only**: no hole cards, no 7-card evaluation; just best 5-card hand from the board.

**Logical sequence inside a round (from player perspective):**

1. Player selects bet amount.
2. Player presses **SPIN**.
3. RGS `/play` is called, returning a `round` with an ordered list of events (see section 4). ([Stake Engine][2])
4. Frontend processes events:

   * Show initial board (all 5 card identities are known from events).
   * Animate them as **flop → turn → river** (3 + 1 + 1 reveal timing).
   * Apply **Joker transformation** (joker becomes the best card for winning hand).
   * Highlight winning cards and display win modal.
5. For `totalWin > 0`, frontend calls `/wallet/end-round` to finalize win and update balance. ([Stake Engine][3])

## 2.2 Deck & symbols

**Deck:**

* Standard 52-card deck **plus 2 Jokers** (maximum 2 jokers can appear on the board).
* Each symbol encoded by **symbol name** in math config, e.g.:

  * `AS` – Ace of Spades, `KD` – King of Diamonds, etc.
  * `JOK` – Joker card (acts as Wild card).

**Symbol configuration (math side):**

* All card ranks (2–A) treated as **paying symbols**; Jokers treated as **wild symbols** (can substitute for any card). ([Stake Engine][4])
* `config.special_symbols` includes joker mapping, e.g. `{"joker": ["JOK"]}` to mark wild cards and enable substitution logic. ([Stake Engine][4])

**Board:**

* Board represented as a 1D or 2D array of **Symbol objects**, as per Stake Board structure (internally they use a 2D array; here we have 1 row, 5 columns). ([Stake Engine][5])

## 2.3 Hand evaluation (payout logic)

For MVP:

* **Stake Engine math** is the source of truth for:

  * What combination is formed from the 5 cards.
  * The **final payout multiplier** for the round.
* Frontend can optionally re-evaluate the hand client-side for **purely visual** labels (e.g. “Four of a Kind”), but this is non-critical.

**Jackpot definition (visual + math tag):**

* **Jackpot hands** start at **Four of a Kind** or better:

  * Four of a Kind (any rank): min x10.
  * Straight Flush / Royal Flush: x10 or above (exact values defined in math file).

For MVP spec, paytable is approximate / to be finalized in math iteration. Frontend only needs:

```ts
type HandTier = "NORMAL" | "MEDIUM" | "HIGH" | "BEST" | "JACKPOT";
```

Classification based on **payout multiplier**:

* **NORMAL:** `0.1x – 1.5x`
* **MEDIUM:** `>1.5x – 3x`
* **HIGH:** `>3x – 5x`
* **BEST:** `>5x – 10x`
* **JACKPOT:** `>= 10x` (all Four of a Kind+ will naturally fall here with math design)

The math output must provide at least:

* `totalWinMultiplier: number` (payout / bet)
* `handCategory: string` (e.g. `"HIGH_CARD" | "PAIR" | "TWO_PAIR" | ... | "FOUR_OF_A_KIND" | "STRAIGHT_FLUSH" | "ROYAL_FLUSH"`)

Frontend maps `totalWinMultiplier` → `HandTier` and uses `handCategory` for text labels.

---

# 3. Joker Mechanics

## 3.1 Joker behavior

* **Joker is a Wild card** symbol (`JOK`) which:

  1. Acts as **any card** needed to create the **best possible winning combination** from the 5-card board.
  2. Maximum **2 Jokers** can appear on the board in a single round.

**Math side:**

* Math engine evaluates all possible card substitutions for joker(s) and selects the combination with the highest payout multiplier. ([Stake Engine][4])
* `config.special_symbols` includes joker mapping: `{"joker": ["JOK"]}` to mark it as wild card. ([Stake Engine][4])

**Frontend behavior:**

* Initially, joker is revealed as `JOK` card.
* **After the river card is revealed**, joker(s) visually transform into the target card(s) via flip animation.
* The transformation target is provided by the math engine in the `hand_result` event.

Frontend reads from event:

```json
{
  "type": "joker_transform",
  "jokerTransforms": [
    { "position": 1, "targetSymbol": "AS" },
    { "position": 4, "targetSymbol": "AS" }
  ]
}
```

---

# 4. Event Design & RGS Round Structure

Stake Engine’s events are arbitrary JSON objects with `index`, `type` and payload fields, returned from `/play` as part of the `round` object. ([Stake Engine][6])

For this game, we define a minimal custom event schema:

### 4.1 Event types

1. **`reveal_initial_board`**

   * One per round.
   * Payload:

     ```json
     {
       "index": 0,
       "type": "reveal_initial_board",
       "board": [
         { "symbol": "AS" },
         { "symbol": "KD" },
         { "symbol": "7C" },
         { "symbol": "JOK" },
         { "symbol": "9H" }
       ]
     }
     ```
   * Frontend:

     * Stores the full 5-card board.
     * Animates them as flop(0,1,2) → turn(3) → river(4) with delays.

2. **`joker_transform`** (optional)

   * Emitted if there is at least one Joker on the board.
   * Describes which jokers transform into which cards.
   * Payload:

     ```json
     {
       "index": 1,
       "type": "joker_transform",
       "jokerTransforms": [
         { "position": 1, "targetSymbol": "AS" },
         { "position": 4, "targetSymbol": "AS" }
       ]
     }
     ```
   * Frontend:

     * Animates joker(s) flipping to target card(s).
     * Updates board display.

3. **`hand_result`**

   * Logical final state of the board and pay.
   * Payload:

     ```json
     {
       "index": 2,
       "type": "hand_result",
       "handCategory": "FOUR_OF_A_KIND",
       "payoutMultiplier": 12.0,
       "winningPositions": [0, 1, 2, 3],
       "jackpot": false
     }
     ```
   * Frontend:

     * Highlights `winningPositions`.
     * Maps `payoutMultiplier` to `HandTier`.
     * Shows appropriate win modal.

5. **(Optional) `round_summary`**

   * For debug / reconnection.
   * Contains full breakdown of spin win, running bet win, etc., consistent with win/WalletManager structure. ([Stake Engine][7])

### 4.2 Round lifecycle and /end-round

* `/wallet/play` returns:

  * `balance` after bet is debited.
  * `round` object including ordered events. ([Stake Engine][2])
* Frontend:

  * Plays through all events in sequence.
  * When it sees `hand_result`, it knows final multiplier.
  * If `payoutMultiplier > 0`, frontend calls `/wallet/end-round` to finalize bet and update balance. ([Stake Engine][3])

---

# 5. Betting, Money & Turbo

## 5.1 Money units & bet levels

Stake Engine represents money as integers with 6 decimal places. For example: `1.0` → `1000000`; `0.1` → `100000`. ([Stake Engine][2])

MVP target bet levels:

* 0.1, 0.5, 1, 5, 10, 50, 100, 500, 1000

In RGS config, `betLevels` must be specified in integer units, e.g.:

```json
"betLevels": [
  100000,      // 0.1
  500000,      // 0.5
  1000000,     // 1
  5000000,     // 5
  10000000,    // 10
  50000000,    // 50
  100000000,   // 100
  500000000,   // 500
  1000000000   // 1000
]
```

Frontend:

* Reads `minBet`, `maxBet`, `stepBet`, `betLevels` from `/wallet/authenticate`. ([Stake Engine][2])
* Filters UI bet buttons to intersection of:

  * Provided `betLevels`.
  * The target set `[0.1, 0.5, 1, 5, 10, 50, 100, 500, 1000]` (converted to engine units).

---

# 6. Frontend Architecture (JS + PixiJS)

## 6.1 High-level components

* **`GameApp`** – main entry:

  * Parses URL query params: `sessionID`, `lang`, `device`, `rgs_url`. ([Stake Engine][2])
  * Calls `/wallet/authenticate` on initialization.
  * Instantiates PixiJS application and state machine.

* **`StateMachine`** (simple custom FSM or xstate if desired):

  * States: `INIT`, `IDLE`, `SPINNING`, `DISPLAYING_WIN`, `ERROR`.
  * Transitions triggered by UI actions and events from RGS.

* **PixiJS Layers:**

  * `BackgroundLayer`
  * `BoardLayer` – card sprites, joker transformation animations.
  * `UILayer` – bet controls, play button, balance/win/bet text, max win display, info/sound/paytable buttons.
  * `ModalLayer` – animated win modals.

## 6.2 Project structure (MVP)

```text
src/
  api/
    rgsClient.ts        // authenticate, balance, play, end-round
  game/
    GameState.ts        // FSM state, bet amount, current board, current events
    EventProcessor.ts   // map RGS events to visual actions
    JokerLogic.ts       // helper for joker transformation logic
  ui/
    BoardView.ts        // PixiJS container for cards & animations
    ControlsView.ts     // bet buttons, play button
    WinModal.ts         // tier-based modal
    PaytableView.ts     // paytable modal
    InfoView.ts         // info/rules modal
    HeaderView.ts       // max win, balance, win, bet display
    FooterView.ts       // controls + info/sound/paytable buttons
  assets/
    cards.png           // spritesheet
    ui.png
index.html
main.ts
```

---

# 7. UX, Animations & Visual Rules

## 7.1 Layout

* **Design approach:** **Mobile-first** – design for mobile, scale up for desktop (desktop = mobile layout at larger size).
* **Orientation:** Portrait for mobile, landscape for desktop (optional).
* **Layout structure:**

  * **Background:**
    * **MVP:** Static image (`/client/public/assets/background.jpg`)
    * **Future:** Will be replaced with video background (looping ambient video)
  
  * **Top header:** 
    * Maximum Win: **400,000** (fixed jackpot display, prominent)
  
  * **Center:** 
    * 5-card board, horizontally centered
    * Cards scale proportionally to screen size
  
  * **Bottom footer:**
    * **Left section:** 
      * Balance: `$XXX.XX`
      * Win: `$XXX.XX` (shows last win)
      * Bet: `$XXX.XX` (current bet amount)
    
    * **Center section:** 
      * `-` button (decrease bet)
      * Bet amount display (large, prominent)
      * `+` button (increase bet)
      * Large round **PLAY** button (center, primary action)
    
    * **Right section:** 
      * Info button (game rules)
      * Sound toggle button (on/off)
      * Paytable button (show payout table)

## 7.2 Animation flow per round

**Default animation timing:** `300ms` for all transitions (MVP standard)

1. **Board entry & card reveal:**

   * On `reveal_initial_board`:

     * **Step 1 - Flop (positions 0,1,2):**
       * 3 cards appear face-down (card back).
       * Pause (`300ms`).
       * Card 0 flips face-up (`300ms`).
       * Card 1 flips face-up (`300ms`).
       * Card 2 flips face-up (`300ms`).
     
     * **Step 2 - Turn (position 3):**
       * Card appears face-down.
       * Pause (`300ms`).
       * Card flips face-up (`300ms`).
     
     * **Step 3 - River (position 4):**
       * Card appears face-down.
       * Pause (`300ms`).
       * Card flips face-up (`300ms`).

2. **Joker transformation:**

   * On `joker_transform` (triggered **after river is revealed**):

     * Joker card(s) pulse/glow (`300ms`).
     * Joker(s) flip to card back (`300ms`).
     * Flip to target card with transformation effect (`300ms`).
     * Display brief text: `"Joker transforms to Ace"` or similar.

3. **Win highlight & modal:**

   * On `hand_result`:

     * Highlight `winningPositions` with outline / glow (`300ms` fade-in).
     * Show text label (e.g. "FOUR OF A KIND – ACES").
     * Show win modal variant based on `HandTier`:

       * NORMAL / MEDIUM / HIGH / BEST / JACKPOT — different colors, size, and possibly background animation intensity.
     * Modal shows:

       * Hand name.
       * Multiplier (e.g. `x12.0`).
       * Win amount (converted to currency).
   * On click anywhere or after timeout (`3000ms`), modal fades out and game returns to `IDLE`.

---

# 8. Stake Engine Integration Details

## 8.1 Game URL

Game will be hosted as static assets:

```text
https://{{TeamName}}.cdn.stake-engine.com/{{GameID}}/{{GameVersion}}/index.html?sessionID={{SessionID}}&lang={{Lang}}&device={{Device}}&rgs_url={{RgsUrl}}
```

* Frontend must **not hardcode** `rgs_url`; always read from query string. ([Stake Engine][2])

## 8.2 Wallet & Play

**Authenticate**

* On load:

```http
POST {{rgs_url}}/wallet/authenticate
{
  "sessionID": "<from URL>"
}
```

* Use response:

  * `balance` → UI.
  * `config` → allowed bet range, turbo availability, etc. ([Stake Engine][2])

**Play**

* On SPIN:

```http
POST {{rgs_url}}/wallet/play
{
  "amount": <selected bet in engine units>,
  "sessionID": "<sessionID>",
  "mode": "BASE"
}
```

* Response:

  * `balance` (after debit)
  * `round` containing:

    * `events`: ordered array of events (`reveal_initial_board`, `reveal_respin_step`, `hand_result`, etc.)
* Frontend pushes events into `EventProcessor`, which drives animations.

**End round**

* After finishing animations, if `payoutMultiplier > 0`:

```http
POST {{rgs_url}}/wallet/end-round
{
  "sessionID": "<sessionID>"
}
```

* Update balance from response. ([Stake Engine][3])

---

# 9. MVP Scope

**Included in MVP:**

* Stake Engine RGS integration:

  * `/wallet/authenticate`, `/wallet/balance`, `/wallet/play`, `/wallet/end-round`.
* Full JS/PixiJS HTML5 client:

  * 5-card board rendering and sequential card reveal animation (flop → turn → river).
  * Joker wild card transformation animations (after river reveal).
  * Bet selection with fixed bet levels: `0.1, 0.5, 1, 5, 10, 50, 100, 500, 1000`.
  * Responsive layout (mobile & desktop).
  * Max Win 400k display (fixed jackpot).
  * 5 win modal tiers with different visuals (NORMAL, MEDIUM, HIGH, BEST, JACKPOT).
  * Info, Sound, Paytable buttons and modals.
* Basic sound effects (SFX only, NO MUSIC for MVP):

  * Card flip sound (each card reveal)
  * Button click sound (UI interactions)
  * Win celebration sounds (different for each tier: NORMAL/MEDIUM/HIGH/BEST/JACKPOT)
  * Joker transformation sound (special effect)
  * Sound toggle in UI (on/off)
  
* Basic error handling:

  * Insufficient balance (ERR_IPB)
  * Invalid session (ERR_IS)
  * Network errors, timeouts
  * See Stake Engine documentation for complete error reference: [Stake Engine RGS][2]
  * Reconnection logic: Refer to Stake Engine docs for round recovery and reconnection flow

**Language support:**

* **MVP:** English only
* **Future:** Multi-language support (RU, etc.)

**Deferred / out of scope for first MVP:**

* Final, verified RTP calculations.
* Turbo mode / fast spin option.
* Advanced mobile gestures (swipe to change bet, etc.).
* Full localization (beyond EN).
* History view, game settings, advanced auto-spin.
* Dynamic jackpot calculation (Max Win 400k is static for now).
* Background music (only SFX in MVP).
* Video background (static image for MVP).

---

# 10. TypeScript Type Definitions

## 10.1 Core Types

```typescript
// ============================================================================
// SYMBOL & CARD TYPES
// ============================================================================

/** Card rank: 2-10, J, Q, K, A */
type CardRank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

/** Card suit: Clubs, Diamonds, Hearts, Spades */
type CardSuit = 'C' | 'D' | 'H' | 'S';

/** Card symbol: e.g., "AS", "10H", "KC" */
type CardSymbol = `${CardRank}${CardSuit}`;

/** Symbol type including Joker */
type Symbol = CardSymbol | 'JOKER';

/** Symbol object from RGS */
interface SymbolObject {
  symbol: Symbol;
}

// ============================================================================
// POKER HAND TYPES
// ============================================================================

/** Poker hand categories */
type HandCategory = 
  | 'HIGH_CARD'
  | 'PAIR'
  | 'TWO_PAIR'
  | 'THREE_OF_A_KIND'
  | 'STRAIGHT'
  | 'FLUSH'
  | 'FULL_HOUSE'
  | 'FOUR_OF_A_KIND'
  | 'STRAIGHT_FLUSH'
  | 'ROYAL_FLUSH';

/** Visual tier for win modal display */
type HandTier = 'NORMAL' | 'MEDIUM' | 'HIGH' | 'BEST' | 'JACKPOT';

// ============================================================================
// RGS EVENT TYPES
// ============================================================================

/** Base event structure from Stake Engine */
interface BaseEvent {
  index: number;
  type: string;
}

/** Event: Initial board reveal */
interface RevealInitialBoardEvent extends BaseEvent {
  type: 'reveal_initial_board';
  board: SymbolObject[]; // Array of 5 symbols
}

/** Event: Joker transformation (optional) */
interface JokerTransformEvent extends BaseEvent {
  type: 'joker_transform';
  jokerTransforms: Array<{
    position: number; // 0-4
    targetSymbol: Symbol;
  }>;
}

/** Event: Final hand result */
interface HandResultEvent extends BaseEvent {
  type: 'hand_result';
  handCategory: HandCategory;
  payoutMultiplier: number;
  winningPositions: number[]; // Array of indices 0-4
  jackpot: boolean;
}

/** Event: Round summary (optional, for debug) */
interface RoundSummaryEvent extends BaseEvent {
  type: 'round_summary';
  totalWin: number;
  betAmount: number;
  [key: string]: any; // Additional debug info
}

/** Union of all possible game events */
type GameEvent = 
  | RevealInitialBoardEvent 
  | JokerTransformEvent 
  | HandResultEvent 
  | RoundSummaryEvent;

// ============================================================================
// RGS API TYPES
// ============================================================================

/** POST /wallet/authenticate request */
interface AuthenticateRequest {
  sessionID: string;
}

/** POST /wallet/authenticate response */
interface AuthenticateResponse {
  balance: number; // Integer with 6 decimal places (e.g., 1000000 = $1.00)
  config: {
    minBet: number;
    maxBet: number;
    stepBet: number;
    betLevels: number[];
    currency: string;
    jurisdiction?: {
      disabledTurbo?: boolean;
      [key: string]: any;
    };
    [key: string]: any;
  };
  sessionID: string;
}

/** POST /wallet/play request */
interface PlayRequest {
  sessionID: string;
  amount: number; // Bet in engine units (e.g., 1000000 = $1.00)
  mode: 'BASE'; // Game mode (MVP only has BASE)
}

/** POST /wallet/play response */
interface PlayResponse {
  balance: number; // Balance after bet deducted
  round: {
    id: string;
    events: GameEvent[]; // Ordered array of events
    [key: string]: any;
  };
}

/** POST /wallet/end-round request */
interface EndRoundRequest {
  sessionID: string;
}

/** POST /wallet/end-round response */
interface EndRoundResponse {
  balance: number; // Balance after win credited
}

/** GET /wallet/balance response */
interface BalanceResponse {
  balance: number;
}

// ============================================================================
// GAME STATE TYPES
// ============================================================================

/** Game FSM states */
type GameState = 
  | 'INIT' 
  | 'IDLE' 
  | 'SPINNING' 
  | 'JOKER_TRANSFORM' 
  | 'DISPLAYING_WIN' 
  | 'ERROR';

/** Current board state */
interface BoardState {
  cards: (Symbol | null)[]; // Array of 5 symbols (null = not revealed yet)
  revealed: boolean[]; // Array of 5 booleans (true = face-up)
}

/** Game state manager */
interface GameStateManager {
  state: GameState;
  balance: number;
  currentBet: number;
  lastWin: number;
  board: BoardState;
  currentEvents: GameEvent[];
  sessionID: string | null;
  config: AuthenticateResponse['config'] | null;
}

// ============================================================================
// UI TYPES
// ============================================================================

/** Bet level in display units (e.g., 0.1, 1, 10) */
type BetLevel = 0.1 | 0.5 | 1 | 5 | 10 | 50 | 100 | 500 | 1000;

/** Sound state */
interface SoundState {
  enabled: boolean;
  volume: number; // 0-1
}

/** Modal types */
type ModalType = 'WIN' | 'INFO' | 'PAYTABLE' | 'ERROR' | null;

// ============================================================================
// ERROR TYPES
// ============================================================================

/** RGS error codes (see Stake Engine docs for complete list) */
type RGSErrorCode = 
  | 'ERR_IS'   // Invalid Session
  | 'ERR_IPB'  // Insufficient Player Balance
  | 'ERR_NETWORK' // Network/timeout error
  | string;    // Other error codes from Stake Engine

/** Error state */
interface ErrorState {
  code: RGSErrorCode;
  message: string;
  recoverable: boolean; // Can retry?
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Convert engine units to display currency */
function engineUnitsToDisplay(units: number): number {
  return units / 1000000;
}

/** Convert display currency to engine units */
function displayToEngineUnits(amount: number): number {
  return Math.round(amount * 1000000);
}

/** Map multiplier to hand tier */
function getHandTier(multiplier: number): HandTier {
  if (multiplier >= 40) return 'JACKPOT';
  if (multiplier > 10) return 'BEST';
  if (multiplier > 3) return 'HIGH';
  if (multiplier > 1.5) return 'MEDIUM';
  return 'NORMAL';
}
```

**Note:** For complete RGS API types and additional details, refer to [Stake Engine Documentation](https://stakeengine.github.io/math-sdk/rgs_docs/RGS/).

---

# 11. Poker Hand Rankings & Paytable

## 10.1 Standard Poker Hand Hierarchy

Poker hands ranked from lowest to highest:

1. **High Card** – No pair, ranked by highest card only
2. **Pair** – Two cards of the same rank
3. **Two Pair** – Two different pairs
4. **Three of a Kind (Set)** – Three cards of the same rank
5. **Straight** – Five cards in sequential rank (any suit)
6. **Flush** – Five cards of the same suit (any ranks)
7. **Full House** – Three of a kind + a pair
8. **Four of a Kind (Quad)** – Four cards of the same rank
9. **Straight Flush** – Five cards in sequential rank AND same suit
10. **Royal Flush** – A, K, Q, J, 10 all in the same suit (highest straight flush)

## 10.2 Payout Table (Multipliers)

| Hand Type | Rank Range | Multiplier | Hand Tier |
|-----------|------------|------------|-----------|
| High Card | JJ to AA | **x0.1** | NORMAL |
| Pair | 2 to 10 | **x0.2** | NORMAL |
| Pair | JJ to AA | **x0.4** | NORMAL |
| Two Pair | 2 to 10 | **x0.4** | NORMAL |
| Two Pair | JJ to AA | **x0.8** | NORMAL |
| Set (Three of a Kind) | 2 to 10 | **x1.5** | MEDIUM |
| Set (Three of a Kind) | JJ to AA | **x3** | HIGH |
| Straight | Any | **x5** | HIGH |
| Flush | Any | **x10** | JACKPOT |
| Full House | Any | **x20** | JACKPOT |
| Quad (Four of a Kind) | Any | **x40** | JACKPOT |
| Straight Flush | Any | **x100** | JACKPOT |
| Royal Flush | A-K-Q-J-10 same suit | **x1000** | JACKPOT |

**Hand Tier Classification:**

* **NORMAL:** x0.1 – x1.5 (includes High Card, Pairs, Two Pairs)
* **MEDIUM:** >x1.5 – x3 (includes low Sets)
* **HIGH:** >x3 – x10 (includes high Sets, Straight, Flush)
* **BEST:** >x10 – x40 (includes Full House, Quad)
* **JACKPOT:** >=x40 (includes top hands: Quad, Straight Flush, Royal Flush)

**Notes:**

* "JJ to AA" means face cards: Jack, Queen, King, Ace
* "2 to 10" means numbered cards: 2, 3, 4, 5, 6, 7, 8, 9, 10
* Jokers substitute to create the best possible hand
* All payouts are **bet multipliers** (e.g., bet $10 with x40 = win $400)

---

# 12. Complete Symbol Reference

## 11.1 Card Symbols (52 cards + 2 Jokers)

**Standard 52-card deck encoding:**

### Clubs (♣) - C
`2C, 3C, 4C, 5C, 6C, 7C, 8C, 9C, 10C, JC, QC, KC, AC`

### Diamonds (♦) - D
`2D, 3D, 4D, 5D, 6D, 7D, 8D, 9D, 10D, JD, QD, KD, AD`

### Hearts (♥) - H
`2H, 3H, 4H, 5H, 6H, 7H, 8H, 9H, 10H, JH, QH, KH, AH`

### Spades (♠) - S
`2S, 3S, 4S, 5S, 6S, 7S, 8S, 9S, 10S, JS, QS, KS, AS`

### Special Symbols
`JOKER` – Wild card (substitutes for any card)

**Total symbols:** 54 (52 cards + 1 Joker symbol type, max 2 on board)

## 12.2 Asset Files Mapping

All card assets are located in `/client/public/assets/cards/`:

**Card faces:**
* Pattern: `{RANK}{SUIT}.png`
* Examples: `AS.png`, `10H.png`, `KC.png`
* Total: 52 files

**Special cards:**
* `JOKER.png` – Joker card face
* `BACK.png` – Card back (used when cards face-down)

**Alternative designs (optional):**
* Some cards have `*2.png` variants (e.g., `AS2.png`, `KC2.png`)
* Use for variety or special effects if needed

**Card dimensions:** (to be measured from actual PNG files)

**Background:**
* `/client/public/assets/background.jpg` – static placeholder
* **Future:** Will be replaced with video background

---

# 13. State Machine Flow & Transitions

## 13.1 Game States

```
INIT → IDLE ⇄ SPINNING → JOKER_TRANSFORM → DISPLAYING_WIN → IDLE
  ↓                                ↓
ERROR ←─────────────────────────────
```

### State Definitions:

1. **INIT**
   * Entry: Application loads
   * Actions:
     * Parse URL params (sessionID, lang, device, rgs_url)
     * Call `/wallet/authenticate`
     * Load assets
     * Initialize PixiJS
   * Exit: On successful authentication → **IDLE**
   * Error: On auth failure → **ERROR**

2. **IDLE**
   * Entry: Ready to accept player input
   * UI State:
     * PLAY button enabled
     * Bet controls enabled (+/-)
     * Display current balance, bet amount
   * User Actions:
     * Click PLAY → **SPINNING**
     * Adjust bet → stay in **IDLE**
     * Open Info/Paytable/Sound modals → stay in **IDLE**

3. **SPINNING**
   * Entry: Player clicked PLAY, RGS `/play` called
   * Actions:
     * Disable PLAY button
     * Debit bet from balance
     * Receive event stream from RGS
     * Process `reveal_initial_board` event
     * Animate cards: flop → turn → river (sequential)
   * Exit conditions:
     * If Joker present → **JOKER_TRANSFORM**
     * If no Joker → **DISPLAYING_WIN**
   * Error: RGS error → **ERROR**

4. **JOKER_TRANSFORM**
   * Entry: River revealed, Joker(s) detected on board
   * Actions:
     * Process `joker_transform` event
     * Animate Joker(s) pulse/glow
     * Flip Joker(s) to target card(s)
     * Display transformation text
   * Exit: Animation complete → **DISPLAYING_WIN**

5. **DISPLAYING_WIN**
   * Entry: All cards revealed, hand evaluated
   * Actions:
     * Process `hand_result` event
     * Highlight winning positions
     * Display win modal (tier-based)
     * Show hand name, multiplier, win amount
     * If `payoutMultiplier > 0`: call `/wallet/end-round`
     * Update balance display
   * Exit conditions:
     * User clicks anywhere → **IDLE**
     * Timeout (~3-5s) → **IDLE**

6. **ERROR**
   * Entry: Any unrecoverable error occurs
   * Types:
     * Network error
     * Invalid session (ERR_IS)
     * Insufficient balance (ERR_IPB)
     * RGS timeout
   * UI State:
     * Show error modal
     * Display error message
   * User Actions:
     * Retry button → **INIT** (re-authenticate)
     * Contact support (show message)

## 13.2 Transitions Summary

| From State | Event/Condition | To State |
|------------|----------------|----------|
| INIT | Auth success | IDLE |
| INIT | Auth failure | ERROR |
| IDLE | Click PLAY | SPINNING |
| SPINNING | Cards revealed + Joker present | JOKER_TRANSFORM |
| SPINNING | Cards revealed + No Joker | DISPLAYING_WIN |
| SPINNING | RGS error | ERROR |
| JOKER_TRANSFORM | Animation complete | DISPLAYING_WIN |
| DISPLAYING_WIN | Click anywhere / timeout | IDLE |
| ANY | Network/session error | ERROR |
| ERROR | Retry | INIT |

## 13.3 Open Questions for State Machine

**Please clarify:**

1. **Reconnection during SPINNING:**
   * What if player disconnects mid-animation?
   * Should we restore the incomplete round on reconnect?
   * Does Stake Engine provide round recovery API?

2. **Rapid clicking:**
   * Can player click PLAY multiple times quickly?
   * Should we debounce PLAY button?
   * Or rely on state check (only clickable in IDLE)?

3. **Modal interruption:**
   * Can player open Info/Paytable during SPINNING/DISPLAYING_WIN?
   * Should modals pause animations?
   * Or disable modal buttons during active round?

4. **Balance updates:**
   * When exactly does balance update in UI?
   * After `/play` response (bet deducted)?
   * After `/end-round` response (win added)?
   * Or both?

5. **Error recovery:**
   * Which errors are recoverable (retry)?
   * Which errors require page reload?
   * Should we auto-retry on network timeout?

6. **Round in progress on page load:**
   * If player refreshes during active round, what happens?
   * Does Stake Engine return pending round state in `/authenticate`?
   * Should we replay the round animations or skip to result?

---

[1]: https://stakeengine.github.io/math-sdk/ "Stake Development Kits"
[2]: https://stakeengine.github.io/math-sdk/rgs_docs/RGS/ "RGS Technical Details - Stake Development Kits"
[3]: https://stakeengine.github.io/math-sdk/simple_example/simple_example/ "RGS Connection Example - Stake Development Kits"
[4]: https://stakeengine.github.io/math-sdk/math_docs/gamestate_section/syms_board_section/symbol_info/ "Symbols - Stake Development Kits"
[5]: https://stakeengine.github.io/math-sdk/math_docs/gamestate_section/syms_board_section/board_info/ "Board - Stake Development Kits"
[6]: https://stakeengine.github.io/math-sdk/math_docs/gamestate_section/events_info/ "Events - Stake Development Kits"
[7]: https://stakeengine.github.io/math-sdk/math_docs/gamestate_section/win_info/ "Wins - Stake Development Kits"
