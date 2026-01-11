# 🎰 Joker Poker Board

Casino poker game with Joker wild cards, built for Stake Engine RGS platform.

## 📦 Project Structure

```
pokerspin/
├── client/          # Frontend (PixiJS + TypeScript)
├── docs/            # Documentation
│   ├── quick_start_guide.md
│   ├── global_specification.md
│   └── state_machine_brief.md
└── server/          # Backend (Stake Engine Math - TODO)
```

## 🚀 Quick Start

### Client (MVP with Mock RGS)

```bash
cd client
npm install
npm run dev
```

Open http://localhost:3000

### Current Status

✅ **Completed - MVP v1.0**
- Full client implementation with PixiJS
- Mock RGS API with 15 game scenarios
- State machine (INIT → IDLE → SPINNING → WIN)
- Card animations (flop → turn → river)
- Joker transformation effects
- 5 win tiers with modals
- Responsive mobile-first UI
- Bet controls (9 levels)

🔜 **Next Phase**
- Real Stake Engine RGS integration
- Sound effects (card flip, win sounds)
- Paytable & info modals
- Backend math implementation

## 🎮 Features

### Game Mechanics
- **5-card poker board** (board-only, no hole cards)
- **Joker wild cards** (max 2 per round)
- **13 hand types** from High Card to Royal Flush
- **9 bet levels** from $0.10 to $1,000

### Visual Features
- Sequential card reveal (flop → turn → river)
- Joker transformation animations
- Winning card highlights
- Tier-based win modals (NORMAL/MEDIUM/HIGH/BEST/JACKPOT)
- Mobile-first responsive design

### Paytable

| Hand | Multiplier | Tier |
|------|-----------|------|
| High Card (J-A) | x0.1 | NORMAL |
| Pair (2-10) | x0.2 | NORMAL |
| Pair (J-A) | x0.4 | NORMAL |
| Two Pair (2-10) | x0.4 | NORMAL |
| Two Pair (J-A) | x0.8 | NORMAL |
| Three of a Kind (2-10) | x1.5 | MEDIUM |
| Three of a Kind (J-A) | x3 | HIGH |
| Straight | x5 | HIGH |
| Flush | x10 | JACKPOT |
| Full House | x20 | JACKPOT |
| Four of a Kind | x40 | JACKPOT |
| Straight Flush | x100 | JACKPOT |
| Royal Flush | x1000 | JACKPOT 🎰 |

## 📚 Documentation

- **[Quick Start Guide](docs/quick_start_guide.md)** - Get started quickly
- **[Global Specification](docs/global_specification.md)** - Complete technical spec
- **[State Machine Brief](docs/state_machine_brief.md)** - State flow details
- **[Client README](client/README.md)** - Frontend documentation

## 🛠️ Tech Stack

### Frontend
- **TypeScript** - Type-safe JavaScript
- **PixiJS v7** - WebGL rendering engine
- **Vite** - Fast build tool

### Backend (Future)
- **Stake Engine Math SDK** - Game math & RNG
- **Python** - Math implementation

## 🎯 Game Flow

```
INIT (loading)
  ↓
IDLE (ready to play)
  ↓ [player clicks PLAY]
SPINNING (cards animating)
  ↓
JOKER_TRANSFORM (if joker present)
  ↓
DISPLAYING_WIN (show result)
  ↓ [click or timeout]
IDLE (ready for next round)
```

## 🎨 Screenshots

See the Figma mockup in the screenshot provided.

## 📝 License

UNLICENSED - Private project

## 👥 Team

Developed for Stake Engine platform integration.

---

**Current Version:** MVP v1.0 (Mock RGS)  
**Status:** ✅ Ready for testing  
**Next:** Real RGS integration
