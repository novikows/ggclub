# Changelog

All notable changes to the Joker Poker Board client will be documented in this file.

## [1.0.0] - 2026-01-11

### 🎉 Initial MVP Release

#### ✨ Features
- **Core Game Engine**
  - Game state machine (INIT → IDLE → SPINNING → JOKER_TRANSFORM → DISPLAYING_WIN)
  - Event processor for RGS events
  - Game controller orchestrating game flow

- **Mock RGS API**
  - Authenticate endpoint simulation
  - Play endpoint with 15 pre-configured scenarios
  - End-round endpoint
  - Balance management
  - Weighted scenario selection (common hands appear more often)

- **PixiJS UI**
  - Card sprite with flip animations
  - 5-card board view with sequential reveals
  - Joker transformation animations
  - Winning card highlights with glow effects
  - Responsive layout (mobile-first)

- **Game Scenarios**
  - Loss scenarios
  - Normal wins: Pair, Two Pair (x0.1 - x1.5)
  - Medium wins: Three of a Kind (x1.5 - x3)
  - High wins: Three of a Kind (high), Straight (x3 - x10)
  - Jackpot wins: Flush, Full House, Four of a Kind, Straight Flush, Royal Flush (x10+)
  - Joker scenarios: Pair, Three of a Kind, Four of a Kind, Royal Flush with jokers

- **UI Components**
  - Reusable button component
  - Controls view with balance/win/bet displays
  - Bet adjustment controls (+/-)
  - Play button with state management
  - Win modal with tier-based styling (5 tiers)

- **Animations**
  - Card appear animation (fade + scale)
  - Card flip animation (horizontal scale)
  - Pulse animation for joker highlight
  - Win modal fade in/out
  - Jackpot pulse effect

- **Money Management**
  - Engine units ↔ display currency conversion
  - 9 bet levels: $0.10 to $1,000
  - Balance tracking
  - Win calculation

- **Hand Evaluation**
  - 13 hand types recognition
  - 5 visual tiers (NORMAL/MEDIUM/HIGH/BEST/JACKPOT)
  - Tier colors and labels
  - Hand category formatting

#### 🛠️ Technical
- TypeScript with strict mode
- Vite for development and build
- PixiJS v7 for rendering
- Proper type definitions from specification
- State management with listeners
- Event-driven architecture
- Responsive window resize handling
- Mobile-first design

#### 📝 Documentation
- README with quick start guide
- Type definitions matching specification
- Code comments and console logging
- 15 mock scenarios with descriptions

#### 🎨 Assets Required
- 52 card images (AS.png to 2C.png)
- JOKER.png
- BACK.png
- background.png

### 🔜 Next Steps

#### Phase 2: Real RGS Integration
- Replace mock client with real Stake Engine API
- Handle authentication errors (ERR_IS, ERR_IPB)
- Implement reconnection logic
- Add round recovery on page refresh

#### Phase 3: Sound & Polish
- Card flip sound effects
- Button click sounds
- Win celebration sounds (5 tiers)
- Joker transformation sound
- Sound toggle functionality

#### Phase 4: Additional UI
- Paytable modal
- Info/rules modal
- Sound toggle button
- Max win display (header)
- Better error handling UI

#### Phase 5: Advanced Features
- Animation speed control
- Game history view
- Auto-play mode
- Quick bet buttons
- Settings panel

---

## Version History

- **1.0.0** (2026-01-11) - Initial MVP with mock RGS
