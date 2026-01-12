# 🎰 Joker Poker Board

Casino poker game with Joker wild cards, built for **Stake Engine** platform.

## 📦 Project Structure

### This Repository (Frontend)

```
pokerspin/
├── client/          # Frontend (PixiJS + TypeScript) ✅ COMPLETE
│   ├── src/
│   │   ├── api/    # RGS client (mock → real)
│   │   ├── game/   # Game logic & state machine
│   │   └── ui/     # PixiJS components
│   └── public/     # Assets (cards, backgrounds)
├── docs/
│   ├── stake/      # Stake Engine integration docs ⭐
│   │   ├── START_HERE.md
│   │   ├── MATH_SDK_SETUP_INSTRUCTIONS.md
│   │   ├── DECISION_SUMMARY.md  🆕
│   │   └── ...
│   └── [original specs]
└── README.md       # This file
```

### Separate Repository (Math SDK)

**Decision:** Fork официального Stake Engine Math SDK

```
pokerspin-math/  (fork от https://github.com/StakeEngine/math-sdk)
├── games/
│   └── joker_poker/     # Game math (Python)
│       ├── game.py      # Hand evaluation, Joker logic
│       └── simulate.py  # RTP simulation
└── uploads/
    └── joker_poker/     # Generated outcomes
```

**Why separate?**
- ✅ Math SDK используется 1 раз (для генерации outcomes)
- ✅ Frontend активная разработка
- ✅ Разные языки (Python vs TypeScript)
- ✅ Math SDK архивируется после upload

**Details:** [docs/stake/DECISION_SUMMARY.md](docs/stake/DECISION_SUMMARY.md)

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

**Архитектура:** Fork Math SDK + Frontend в этом репо
- 📖 **[docs/stake/DECISION_SUMMARY.md](docs/stake/DECISION_SUMMARY.md)** - Детали решения

#### Week 1: Math SDK (Python) → Отдельный репо `pokerspin-math`
- ✅ Fork Stake Engine Math SDK
- ✅ Implement Joker Poker game logic
- ✅ Generate 10M outcomes
- ✅ Upload to Stake Engine
- 📖 **[MATH_SDK_SETUP_INSTRUCTIONS.md](docs/stake/MATH_SDK_SETUP_INSTRUCTIONS.md)**

#### Week 2: Frontend Integration → Этот репо `pokerspin`
- Install `stake-engine` npm package
- Replace mock with real client
- Add event listeners
- Testing
- 📖 **[STAKE_CLIENT_INTEGRATION.md](docs/stake/STAKE_CLIENT_INTEGRATION.md)**

#### Week 3: Production Deploy → Stake CDN
- Build for production
- Upload to Stake CDN
- QA testing
- Launch! 🚀

---

## 📚 Documentation

### 🎯 **[PROJECT_STATUS.md](PROJECT_STATUS.md)** ⭐ **COMPLETE PROJECT SUMMARY**
**Complete overview:** Project, tech stack, current session, RTP tuning, next steps

### 🚀 **[PRODUCTION_ROADMAP.md](PRODUCTION_ROADMAP.md)** 🆕 **DETAILED PLAN TO LAUNCH**
**Step-by-step:** From now (Week 1 Day 5) to production launch (3 weeks)

### 🎨 **[FRONTEND_INTEGRATION_PLAN.md](FRONTEND_INTEGRATION_PLAN.md)** 🆕 **WEEK 2 DETAILED PLAN**
**Frontend:** Replace mock RGS with Stake Engine client (7 days, step-by-step)

---

### 🌟 Stake Engine Integration (Start Here!):

📁 **[docs/stake/](docs/stake/)** - All Stake Engine specs

1. **[docs/stake/START_HERE.md](docs/stake/START_HERE.md)** ⭐ **READ FIRST!**
2. **[docs/stake/DECISION_SUMMARY.md](docs/stake/DECISION_SUMMARY.md)** 🆕 **Архитектурное решение**
3. **[docs/stake/MATH_SDK_SETUP_INSTRUCTIONS.md](docs/stake/MATH_SDK_SETUP_INSTRUCTIONS.md)** 🆕 **Week 1 Setup**
4. **[docs/stake/MATH_SDK_DETAILED_GUIDE.md](docs/stake/MATH_SDK_DETAILED_GUIDE.md)** - Python код
5. **[docs/stake/STAKE_CLIENT_INTEGRATION.md](docs/stake/STAKE_CLIENT_INTEGRATION.md)** - Week 2 Frontend
6. **[docs/stake/NEXT_STEPS_STAKE_ENGINE.md](docs/stake/NEXT_STEPS_STAKE_ENGINE.md)** - Полный чеклист
7. **[docs/stake/README.md](docs/stake/README.md)** - Documentation index

### Current MVP:
- **[client/README.md](client/README.md)** - Client docs
- **[client/TESTING.md](client/TESTING.md)** - Test guide
- **[MVP_SUMMARY.md](MVP_SUMMARY.md)** - MVP overview

### Original Specs:
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

### Paytable (Validated RTP: 98.34%)

| Hand | Multiplier | Tier | Frequency |
|------|-----------|------|-----------|
| High Card (2-10) | x0.1 | NORMAL | 24% |
| High Card (J-A) | x0.35 | NORMAL | 17% |
| Pair (2-10) | x0.55 | NORMAL | 23% |
| Pair (J-A) | x0.9 | NORMAL | 22% |
| Two Pair (2-10) | x0.8 | NORMAL | 2% |
| Two Pair (J-A) | x1.5 | MEDIUM | 2% |
| Three of a Kind (2-10) | x1.8 | MEDIUM | 3.7% |
| Three of a Kind (J-A) | x3.0 | HIGH | 3.7% |
| Straight | x5 | HIGH | 1.1% |
| Flush | x10 | JACKPOT | 0.36% |
| Full House | x20 | JACKPOT | 0.31% |
| Four of a Kind | x40 | JACKPOT | 0.31% |
| Straight Flush | x100 | JACKPOT | 0.017% |
| Royal Flush | x1000 | JACKPOT 🎰 | 0.003% |

**RTP:** 98.34% (tested with 1M simulations) ✅

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
