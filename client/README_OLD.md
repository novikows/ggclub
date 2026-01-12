# Joker Poker Board - Client MVP

Casino poker game built with PixiJS + TypeScript + Stake Engine (Mock RGS).

## 🎮 Features

- **5-card poker board** with flop → turn → river animations
- **Joker wild cards** that transform into winning cards
- **13 hand types** from High Card to Royal Flush
- **5 win tiers** with different visual effects (NORMAL/MEDIUM/HIGH/BEST/JACKPOT)
- **9 bet levels** from $0.10 to $1,000
- **Mobile-first responsive** UI
- **Mock RGS API** for testing without backend

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
cd client
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

Production files will be in `dist/` folder.

## 🎯 Game Flow

1. **INIT** - Authenticate with RGS (mock)
2. **IDLE** - Ready to play, adjust bet with +/- buttons
3. **SPINNING** - Cards reveal in sequence (flop → turn → river)
4. **JOKER_TRANSFORM** - Jokers transform to best cards (if present)
5. **DISPLAYING_WIN** - Show win modal with hand info
6. Back to **IDLE**

## 🃏 Mock Scenarios

The mock RGS includes 15 pre-configured scenarios:

### Losses
- No win - low cards

### Normal Wins (x0.1 - x1.5)
- Pair of Aces (x0.4)
- Two Pair - Kings & Queens (x0.8)

### Medium Wins (x1.5 - x3)
- Three of a Kind - 7s (x1.5)

### High Wins (x3 - x10)
- Three of a Kind - Aces (x3)
- Straight (x5)

### Jackpot Wins (x10+)
- Flush (x10)
- Full House (x20)
- Four of a Kind (x40)
- Straight Flush (x100)
- **Royal Flush (x1000)** 🎰

### Joker Scenarios
- Joker completes Pair
- Joker completes Three of a Kind
- Two Jokers complete Four of a Kind
- Joker completes Royal Flush

## 🎨 UI Components

### BoardView
- 5 card slots with flip animations
- Joker transformation effects
- Winning card highlights

### ControlsView
- Balance/Win/Bet displays
- +/- bet controls
- PLAY button

### WinModal
- Tier-based colors and animations
- Hand name and multiplier
- Win amount display

## 📝 Key Files

```
src/
├── types/index.ts          # TypeScript types from spec
├── utils/
│   ├── money.ts            # Money conversion utilities
│   └── handEvaluator.ts    # Hand tier logic
├── api/
│   ├── mockData.ts         # Mock game scenarios
│   └── mockRgsClient.ts    # Mock RGS API client
├── game/
│   ├── GameStateManager.ts # State management
│   ├── EventProcessor.ts   # Event → Animation converter
│   └── GameController.ts   # Main game logic
├── ui/
│   ├── CardSprite.ts       # Single card component
│   ├── BoardView.ts        # 5-card board
│   ├── UIButton.ts         # Reusable button
│   ├── ControlsView.ts     # Bet controls & play button
│   └── WinModal.ts         # Win display modal
├── GameApp.ts              # Main application
└── main.ts                 # Entry point
```

## 🔧 Configuration

### URL Parameters

The game reads these URL parameters (all optional for mock mode):

- `sessionID` - Session identifier (default: "default-session")
- `rgs_url` - RGS API URL (default: mock mode)
- `lang` - Language (default: "en")
- `device` - Device type (default: auto-detect)

Example:
```
http://localhost:3000?sessionID=test-123
```

### Bet Levels

Configured in `mockRgsClient.ts`:
```typescript
[0.1, 0.5, 1, 5, 10, 50, 100, 500, 1000]
```

## 🐛 Debugging

Open browser console to see detailed logs:

```
[GameController] Initializing...
[GameStateManager] INIT → IDLE
[MockRGS] Authenticate: {sessionID: "default-session"}
[BoardView] Revealing flop (0, 1, 2)
[BoardView] Revealing turn (3)
[BoardView] Revealing river (4)
[GameController] Win amount: 4000000
```

## 🎯 Next Steps

### For Real Integration

Replace mock RGS client with real API calls:

1. Update `src/api/mockRgsClient.ts` with real endpoints
2. Handle authentication errors (ERR_IS, ERR_IPB)
3. Implement reconnection logic
4. Add error recovery UI

### Additional Features

- Sound effects (card flip, button click, win sounds)
- Paytable modal
- Info/rules modal
- Sound toggle button
- Animation speed control
- History view

## 📚 Documentation

- [Quick Start Guide](../docs/quick_start_guide.md)
- [Global Specification](../docs/global_specification.md)
- [Stake Engine Docs](https://stakeengine.github.io/math-sdk/)

## 🎮 Controls

- **Click PLAY** - Start round
- **Click +/-** - Adjust bet
- **Click anywhere on win modal** - Continue to next round

## 💡 Tips

- Start with small bets to test all features
- Check console for detailed game flow logs
- Royal Flush is rare - may take many spins!
- Joker scenarios have special animations

---

**Ready to play?** 🎰 Run `npm run dev` and visit http://localhost:3000
