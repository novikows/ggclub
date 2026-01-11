# Quick Start Guide for Developers

**Project:** Joker Poker Board MVP  
**Stack:** HTML5 + TypeScript + PixiJS + Stake Engine RGS  
**Last Updated:** 2026-01-11

---

## 🎯 What We're Building

**Casino poker game** where:
- Player bets → 5 cards dealt (flop → turn → river animation)
- Best poker hand wins (Joker = wild card)
- Mobile-first, responsive UI
- Stake Engine handles all RNG + payouts

---

## 📁 Project Structure

```
pokerspin/
├── client/
│   └── public/
│       └── assets/
│           ├── cards/          # 52 cards + JOKER.png + BACK.png
│           └── background.jpg  # Static background (video later)
├── docs/
│   ├── global_specification.md      # MAIN SPEC (read this!)
│   ├── state_machine_brief.md       # State machine questions
│   └── quick_start_guide.md         # This file
└── main_repo_info.md                # Duplicate spec (same as global)
```

---

## 🔑 Key Specs at a Glance

### Tech Stack
- **Frontend:** TypeScript + PixiJS v7+
- **Backend:** Stake Engine (Python Math SDK) - handled separately
- **Build:** Vite or similar (static files only)
- **No frameworks:** No React/Vue/Svelte (Stake Engine requirement)

### Bet Levels (9 levels)
```
0.1, 0.5, 1, 5, 10, 50, 100, 500, 1000
```

### Paytable (13 hand types)
| Hand | Multiplier | Tier |
|------|------------|------|
| High Card (J-A) | x0.1 | NORMAL |
| Pair (2-10) | x0.2 | NORMAL |
| Pair (J-A) | x0.4 | NORMAL |
| Two Pair (2-10) | x0.4 | NORMAL |
| Two Pair (J-A) | x0.8 | NORMAL |
| Set (2-10) | x1.5 | MEDIUM |
| Set (J-A) | x3 | HIGH |
| Straight | x5 | HIGH |
| Flush | x10 | JACKPOT |
| Full House | x20 | JACKPOT |
| Quad | x40 | JACKPOT |
| Straight Flush | x100 | JACKPOT |
| Royal Flush | x1000 | JACKPOT |

### Card Symbols (54 total)
- **Format:** `{RANK}{SUIT}` e.g., `AS`, `10H`, `KC`
- **Ranks:** 2-10, J, Q, K, A
- **Suits:** C (♣), D (♦), H (♥), S (♠)
- **Special:** `JOKER` (wild card, max 2 per round)

### Animation Timing
- **All animations:** 300ms (fixed for MVP)
- **Sequence:** Flop (3 cards) → pause → Turn (1 card) → pause → River (1 card) → Joker transform (if present) → Win modal

---

## 🎨 UI Layout (Mobile-First)

```
┌──────────────────────────────────┐
│   MAX WIN: 400,000               │ ← Header
├──────────────────────────────────┤
│                                  │
│      🂠  🂠  🂠  🂠  🂠          │ ← Board (5 cards)
│                                  │
├──────────────────────────────────┤
│ Balance: $100  Win: $0  Bet: $1  │ ← Footer left
│  [-]  $1.00  [+]   [PLAY]       │ ← Footer center
│       [i] [🔊] [📊]              │ ← Footer right
└──────────────────────────────────┘
```

**Buttons:**
- **PLAY:** Big round button (primary action)
- **+/-:** Cycle through bet levels
- **i:** Info/rules modal
- **🔊:** Sound toggle (on/off)
- **📊:** Paytable modal

---

## 🔄 Game Flow (Round Lifecycle)

1. **Player in IDLE state** → clicks PLAY
2. **Frontend calls:** `POST /wallet/play` (bet amount, sessionID)
3. **RGS returns:** event stream (reveal_initial_board, joker_transform?, hand_result)
4. **Frontend animates:**
   - 3 cards appear face-down → flip to face-up (flop)
   - 1 card face-down → flip (turn)
   - 1 card face-down → flip (river)
   - If Joker: transform animation
5. **Show win modal** (tier-based: NORMAL/MEDIUM/HIGH/BEST/JACKPOT)
6. **If win > 0:** `POST /wallet/end-round` (credit win)
7. **Return to IDLE** → player can play again

---

## 📡 Stake Engine API Endpoints

### 1. Authenticate (on page load)
```typescript
POST {rgs_url}/wallet/authenticate
Body: { sessionID: string }
Response: { balance, config: { betLevels, minBet, maxBet, ... } }
```

### 2. Play Round
```typescript
POST {rgs_url}/wallet/play
Body: { sessionID, amount, mode: "BASE" }
Response: { 
  balance,  // After bet deducted
  round: { 
    id, 
    events: [
      { type: "reveal_initial_board", board: [...] },
      { type: "joker_transform", jokerTransforms: [...] }, // optional
      { type: "hand_result", payoutMultiplier, winningPositions, ... }
    ]
  }
}
```

### 3. End Round (if won)
```typescript
POST {rgs_url}/wallet/end-round
Body: { sessionID }
Response: { balance }  // After win credited
```

### 4. Check Balance (anytime)
```typescript
GET {rgs_url}/wallet/balance
Response: { balance }
```

**Important:** 
- Money is in **integer units** with 6 decimals: `1000000 = $1.00`
- `rgs_url` comes from URL query param (don't hardcode!)

---

## 🃏 Joker Mechanics

- **Joker = Wild Card** (substitutes for any card)
- **Max 2 jokers** per round
- **Transformation:**
  1. Joker appears as `JOKER` card initially
  2. After river revealed → joker pulses/glows
  3. Flips to best card for winning hand
  4. Math engine decides transformation target

**Example Event:**
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

## 🎭 State Machine (Simplified)

```
INIT (loading) 
  ↓
IDLE (ready)
  ↓ [player clicks PLAY]
SPINNING (cards animating)
  ↓
JOKER_TRANSFORM (if joker present)
  ↓
DISPLAYING_WIN (show result)
  ↓ [click or timeout]
IDLE (ready for next round)
```

**Error handling:** Any error → ERROR state → show modal with retry option

**Open questions:** See `state_machine_brief.md` for reconnection/recovery details

---

## 🔊 Sound Effects (MVP)

- ✅ Card flip (each reveal)
- ✅ Button click
- ✅ Win sounds (5 tiers: NORMAL/MEDIUM/HIGH/BEST/JACKPOT)
- ✅ Joker transformation
- ✅ Sound toggle button
- ❌ **NO MUSIC** (MVP constraint)

---

## 📱 Mobile-First Design

- **Approach:** Design for mobile, scale up for desktop
- **Desktop = mobile at larger size** (no separate layout)
- **Portrait:** Primary orientation
- **Touch-friendly:** Large tap targets (min 44x44px)
- **Responsive:** Cards scale proportionally

---

## 🚫 MVP Exclusions (Don't Build These Yet)

- ❌ Turbo mode / fast spin
- ❌ Background music
- ❌ Video background (use static image)
- ❌ Localization (English only)
- ❌ History / game logs
- ❌ Auto-spin / quick bet
- ❌ Animation skip

---

## 📚 Full Documentation

**Read in this order:**

1. **This file** (`quick_start_guide.md`) - You are here ✅
2. **Global Spec** (`global_specification.md`) - Complete technical spec
3. **State Machine Brief** (`state_machine_brief.md`) - Open questions
4. **Stake Engine Docs** - https://stakeengine.github.io/math-sdk/

**Key Sections in Global Spec:**
- Section 4: Event Design (how RGS events work)
- Section 7: UX & Animations (timing, layout)
- Section 10: TypeScript Types (copy-paste ready)
- Section 11: Paytable (complete multipliers)

---

## ⚡ Quick Implementation Checklist

### Phase 1: Setup (Day 1)
- [ ] Initialize Vite + TypeScript project
- [ ] Install PixiJS (`npm install pixi.js`)
- [ ] Copy TypeScript types from Section 10 of spec
- [ ] Create project structure (api/, game/, ui/)

### Phase 2: Core (Days 2-3)
- [ ] Implement RGS client (authenticate, play, end-round)
- [ ] Build state machine (INIT → IDLE → SPINNING → WIN)
- [ ] Parse URL params (sessionID, rgs_url)
- [ ] Handle money conversion (engine units ↔ display)

### Phase 3: UI (Days 4-5)
- [ ] PixiJS app initialization
- [ ] Load card assets (52 cards + JOKER + BACK)
- [ ] Create board view (5 card slots)
- [ ] Footer: Balance, Win, Bet displays
- [ ] Bet controls: +/- buttons (cycle bet levels)
- [ ] PLAY button (trigger /play call)

### Phase 4: Animations (Days 6-7)
- [ ] Card flip animation (300ms)
- [ ] Flop → Turn → River sequence
- [ ] Joker transformation effect
- [ ] Win highlight (glow on winning cards)
- [ ] Win modal (5 tier variants)

### Phase 5: Polish (Days 8-9)
- [ ] Sound effects (flip, click, win tiers)
- [ ] Info modal (game rules)
- [ ] Paytable modal (show multipliers)
- [ ] Sound toggle
- [ ] Error handling (ERR_IPB, ERR_IS, network)

### Phase 6: Testing (Day 10)
- [ ] Test all 13 hand types
- [ ] Test joker transformation
- [ ] Test error scenarios
- [ ] Mobile responsive check
- [ ] Network disconnect handling

---

## 🐛 Common Pitfalls to Avoid

1. **Don't hardcode `rgs_url`** - always read from URL params
2. **Don't forget money conversion** - RGS uses integers (1000000 = $1)
3. **Don't call `/end-round` on losses** - only if payoutMultiplier > 0
4. **Don't use floats for money** - integers only for precision
5. **Don't skip state checks** - ensure state === IDLE before allowing PLAY

---

## 🆘 Need Help?

- **RGS API issues:** Read https://stakeengine.github.io/math-sdk/rgs_docs/RGS/
- **Event structure unclear:** See Section 4.1 in global_specification.md
- **State machine questions:** Review state_machine_brief.md
- **TypeScript types:** Copy from Section 10 of global_specification.md

---

**Ready to code?** Start with Phase 1 setup, then read the full spec! 🚀


