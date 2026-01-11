# 🎰 Joker Poker Board

Casino poker game with Joker wild cards, built for **Stake Engine** platform.

## 📦 Project Structure

```
pokerspin/
├── client/          # Frontend (PixiJS + TypeScript) ✅ COMPLETE
├── docs/            # Original documentation
│   ├── quick_start_guide.md
│   ├── global_specification.md
│   └── state_machine_brief.md
├── packages/        # Monorepo (future)
│   ├── client/      # Frontend
│   ├── shared/      # Shared types
│   └── math-sdk/    # Stake Math SDK (Python)
└── [Stake Engine Specs] # Integration docs ⭐
```

## 🚀 Quick Start

### Current: MVP v1.0 with Mock (Working Now!)

```bash
cd client
npm install
npm run dev
```

**Open:** http://localhost:3000 🎮

### Status

✅ **MVP v1.0 Complete**
- Full client implementation with PixiJS
- Mock RGS with 15 game scenarios
- State machine (INIT → IDLE → SPINNING → WIN)
- Card animations (flop → turn → river)
- Joker transformation effects
- 5 win tiers with modals
- Responsive mobile-first UI
- Bet controls (9 levels)

🔄 **Next: Stake Engine Integration (3 weeks)**

#### Week 1: Math SDK (Python)
- Setup Stake Math SDK
- Implement Joker Poker game logic
- Generate 10M outcomes
- Upload to Stake Engine

#### Week 2: Frontend Integration
- Install `stake-engine` npm package
- Replace mock with real client
- Add event listeners
- Testing

#### Week 3: Production Deploy
- Build for production
- Upload to Stake CDN
- QA testing
- Launch! 🚀

---

## 📚 Documentation

### 🌟 Start Here:

**For Stake Engine Integration:**
1. **[STAKE_ENGINE_IMPLEMENTATION.md](STAKE_ENGINE_IMPLEMENTATION.md)** ⭐ **READ FIRST!**
2. **[STAKE_MATH_SDK_GUIDE.md](STAKE_MATH_SDK_GUIDE.md)** - Python Math SDK
3. **[STAKE_CLIENT_INTEGRATION.md](STAKE_CLIENT_INTEGRATION.md)** - TypeScript Client
4. **[STAKE_ENGINE_SUMMARY.md](STAKE_ENGINE_SUMMARY.md)** - Complete Summary
5. **[NEXT_STEPS_STAKE_ENGINE.md](NEXT_STEPS_STAKE_ENGINE.md)** - Implementation Plan

**Current MVP:**
- **[START_HERE.md](START_HERE.md)** - MVP Overview
- **[client/README.md](client/README.md)** - Client docs
- **[client/TESTING.md](client/TESTING.md)** - Test guide

**Original Specs:**
- **[docs/quick_start_guide.md](docs/quick_start_guide.md)** - Quick start
- **[docs/global_specification.md](docs/global_specification.md)** - Full spec

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
