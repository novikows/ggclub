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
Player bets, 5 poker cards are dealt to the board in one spin (5-card board only). Frontend animates them as “flop → turn → river” with delays for dopamine effects. Hand strength determines payout. Jokers act as multipliers and trigger turbo re-spins of specific board positions.

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
   * Apply **Joker effects** and any re-spin sequences.
   * Highlight winning cards and display win modal.
5. For `totalWin > 0`, frontend calls `/wallet/end-round` to finalize win and update balance. ([Stake Engine][3])

## 2.2 Deck & symbols

**Deck:**

* Standard 52-card deck **plus Joker(s)**.
* Each symbol encoded by **symbol name** in math config, e.g.:

  * `AS` – Ace of Spades, `KD` – King of Diamonds, etc.
  * `JOK` – Joker card.

**Symbol configuration (math side):**

* All card ranks (2–A) treated as **paying symbols**; Jokers treated as **special symbols** with attributes (e.g. multiplier flags). ([Stake Engine][4])
* `config.special_symbols` includes joker mapping, e.g. `{"joker": ["JOK"]}` to mark special cards and enable joker-specific logic. ([Stake Engine][4])

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

# 3. Joker & Turbo Spin Mechanics

## 3.1 Joker behavior

* **Joker is a special card** symbol (`JOK`) which:

  1. Acts as a **win multiplier** (exact value and stacking handled by math).
  2. Triggers **turbo re-spins** of specific board positions.

Math side uses symbol attributes (e.g. `multiplier`) to apply additional multipliers via standard multiplier strategy. ([Stake Engine][4])

Frontend only needs to read from event:

```json
{
  "type": "joker_summary",
  "jokerCount": 2,
  "jokerPositions": [{ "index": 1 }, { "index": 4 }],
  "respins": {
    "mode": "TURN_RIVER", // "RIVER" | "TURN_RIVER" | "FULL_BOARD"
    "times": 2
  }
}
```

## 3.2 Turbo re-spin specification

Given a **board of 5 cards** indexed `0..4`:

* We visually treat:

  * `0,1,2` → “flop”
  * `3` → “turn”
  * `4` → “river”

**Re-spin rules:**

1. **1 Joker on board**

   * Respins: **River only**
   * Number of re-spins: **1**
   * Cards at index `4` are re-drawn (math side generates separate reveal events for each re-spin).

2. **2 Jokers on board**

   * Respins: **Turn and River**
   * Number of sequential re-spins: **2**
   * Cards at indices `3` and `4` are re-drawn on each re-spin step.

3. **3 Jokers on board**

   * Respins: **Full board turbo**
   * Number of re-spins: **5**
   * All 5 cards (`0..4`) are re-drawn on each step.

**Important:**

* All re-spins are part of **one round** (single `/play` call). Stake math engine precomputes the full sequence of board states and win updates as a chain of events.
* Final payout multiplier is based on the **final board** and applied jokers.

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

2. **`joker_summary`** (optional)

   * Emitted if there is at least one Joker.
   * Describes count and respin behavior (as in §3.1).
   * Used for UI copy and planning re-spin sequence.

3. **`reveal_respin_step`** (0–5 times, depending on jokers)

   * For each re-spin step.
   * Payload:

     ```json
     {
       "index": 1,
       "type": "reveal_respin_step",
       "step": 1,
       "affectedPositions": [3, 4],
       "newSymbols": [
         { "symbol": "QH" },
         { "symbol": "JOK" }
       ]
     }
     ```
   * Frontend:

     * Animates flip on specified indices.
     * Updates current board array.

4. **`hand_result`**

   * Logical final state of the board and pay.
   * Payload:

     ```json
     {
       "index": 6,
       "type": "hand_result",
       "handCategory": "FOUR_OF_A_KIND",
       "payoutMultiplier": 12.0,
       "winningPositions": [0, 1, 2, 3],
       "jackpot": true
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

MVP target bet levels (as per your list):

* 0.1, 0.5, 1, 2, 5, 10, 50, 100, 500, 1000

In RGS config, `betLevels` must be specified in integer units, e.g.:

```json
"betLevels": [
  100000,      // 0.1
  500000,      // 0.5
  1000000,     // 1
  2000000,     // 2
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
  * The target set `[0.1, 0.5, 1, 2, 5, 10, 50, 100, 500, 1000]` (converted to engine units).

## 5.2 Turbo spin flag

* Stake Engine supports jurisdiction flags such as `disabledTurbo`. ([Stake Engine][2])
* Frontend:

  * If `config.jurisdiction.disabledTurbo === true`, hide turbo toggle.
  * Otherwise, show **Turbo mode** (instant animations, minimal delays).

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
  * `BoardLayer` – card sprites, joker highlights.
  * `UILayer` – bet controls, spin/turbo buttons, balance text.
  * `ModalLayer` – animated win modals.

## 6.2 Project structure (MVP)

```text
src/
  api/
    rgsClient.ts        // authenticate, balance, play, end-round
  game/
    GameState.ts        // FSM state, bet amount, current board, current events
    EventProcessor.ts   // map RGS events to visual actions
    JokerLogic.ts       // helper for local joker counting, if needed
  ui/
    BoardView.ts        // PixiJS container for cards & animations
    ControlsView.ts     // bet buttons, spin, turbo
    WinModal.ts         // tier-based modal
    PaytableView.ts     // static for now
  assets/
    cards.png           // spritesheet
    ui.png
index.html
main.ts
```

---

# 7. UX, Animations & Visual Rules

## 7.1 Layout

* **Orientation:** Landscape, 16:9 baseline.
* **Above the fold:**

  * Top: balance, current bet, last win.
  * Center: 5-card board, horizontally centered.
  * Bottom: bet +/- controls, bet level carousel, SPIN button, TURBO toggle, Sound, Info.

## 7.2 Animation flow per round

1. **Board entry:**

   * On `reveal_initial_board`:

     * All 5 card backs appear instantly.
     * Animate:

       * Flop cards (0,1,2): flip face-up one-by-one (`~150–200ms` stagger).
       * Small pause (`~200ms`).
       * Turn (3): flip.
       * Pause (`~200ms`).
       * River (4): flip.
   * In **Turbo mode**, all cards flip almost instantly (minimal delays).

2. **Joker presence:**

   * On `joker_summary`:

     * Pulse glow on Joker cards for a moment.
     * Display small text: `"Joker x1 – River Respin"`, `"Joker x2 – Turn & River Respin x2"`, etc.

3. **Re-spin steps:**

   * For each `reveal_respin_step`:

     * Flip affected positions back to card back, then to new face.
     * Optional particle or arc line indicator on re-spun cards.
     * Turbo mode: faster flip and no pause between steps.

4. **Win highlight & modal:**

   * On `hand_result`:

     * Highlight `winningPositions` with outline / glow.
     * Show text label (e.g. “FOUR OF A KIND – QUEENS”).
     * Show win modal variant based on `HandTier`:

       * NORMAL / MEDIUM / HIGH / BEST / JACKPOT — different colors, size, and possibly background animation intensity.
     * Modal shows:

       * Hand name.
       * Multiplier (e.g. `x12.0`).
       * Win amount (converted to currency).
   * On click anywhere or after timeout, modal closes and game returns to `IDLE`.

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

  * 5-card board rendering and animation.
  * Joker + turbo re-spin animations (driven by events).
  * Bet selection with fixed bet levels as specified.
  * Turbo mode + disable via jurisdiction flag.
  * 5 win modal tiers with different visuals.
* Basic sound effects:

  * Flip, win, jackpot (can be placeholder).
* Basic error handling:

  * Insufficient balance (ERR_IPB), invalid session (ERR_IS), etc. ([Stake Engine][2])

**Deferred / out of scope for first MVP:**

* Final, verified RTP and full paytable.
* Mobile-specific UX polish beyond basic responsive layout.
* Full localization (beyond EN / RU).
* History view, settings, advanced auto-spin.

---

[1]: https://stakeengine.github.io/math-sdk/ "Stake Development Kits"
[2]: https://stakeengine.github.io/math-sdk/rgs_docs/RGS/ "RGS Technical Details - Stake Development Kits"
[3]: https://stakeengine.github.io/math-sdk/simple_example/simple_example/ "RGS Connection Example - Stake Development Kits"
[4]: https://stakeengine.github.io/math-sdk/math_docs/gamestate_section/syms_board_section/symbol_info/ "Symbols - Stake Development Kits"
[5]: https://stakeengine.github.io/math-sdk/math_docs/gamestate_section/syms_board_section/board_info/ "Board - Stake Development Kits"
[6]: https://stakeengine.github.io/math-sdk/math_docs/gamestate_section/events_info/ "Events - Stake Development Kits"
[7]: https://stakeengine.github.io/math-sdk/math_docs/gamestate_section/win_info/ "Wins - Stake Development Kits"
