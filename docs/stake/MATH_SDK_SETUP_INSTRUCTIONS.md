# 🎲 Joker Poker Math SDK - Setup Instructions

**Project:** Joker Poker Board  
**Approach:** Fork official Stake Engine Math SDK  
**Timeline:** Week 1 (5-7 days)  
**Date:** 2026-01-11

---

## 📋 Overview

Мы будем использовать **официальный Stake Engine Math SDK** как базу, добавив нашу игру `joker_poker` в папку `games/`.

**Почему fork, а не отдельный репо?**
- ✅ Готовая инфраструктура (build, upload, tests)
- ✅ Проверенная архитектура
- ✅ Совместимость с Stake Engine гарантирована
- ✅ Можно синхронизировать updates от upstream

---

## 🚀 Step-by-Step Setup

### Step 1: Fork Math SDK (5 минут)

```bash
# 1. Go to GitHub
open https://github.com/StakeEngine/math-sdk

# 2. Click "Fork" button
# Choose your organization: _casik или YourUsername

# 3. Rename fork (optional)
# Repository name: "pokerspin-math" or keep "math-sdk"
```

**Result:** У вас есть fork на GitHub ✅

---

### Step 2: Clone & Setup (10 минут)

```bash
# Navigate to your projects folder
cd ~/Projects/_casik/

# Clone YOUR fork (not original!)
git clone https://github.com/YOUR_ORG/math-sdk.git pokerspin-math
cd pokerspin-math

# Add original as upstream (for updates)
git remote add upstream https://github.com/StakeEngine/math-sdk.git

# Verify remotes
git remote -v
# Should show:
# origin    https://github.com/YOUR_ORG/math-sdk.git (your fork)
# upstream  https://github.com/StakeEngine/math-sdk.git (original)

# Run setup
make setup

# This will:
# - Create Python virtual environment
# - Install dependencies (carrot, numpy, etc.)
# - Setup Rust tools (optional, for optimization)

# Activate virtual environment
source venv/bin/activate

# Verify installation
python -c "import carrot; print('Carrot SDK OK ✅')"
```

**Result:** Math SDK готов к работе ✅

---

### Step 3: Create Joker Poker Game (2 минуты)

```bash
# Still in pokerspin-math/
cd games

# Create game directory
mkdir joker_poker
cd joker_poker

# Create Python files
touch __init__.py
touch game.py
touch simulate.py

# Verify structure
ls -la
# Should show:
# __init__.py
# game.py
# simulate.py
```

**Result:** Структура игры создана ✅

---

### Step 4: Copy Game Code (10 минут)

Скопируйте код из документации:

#### 4.1 Copy `__init__.py`

```bash
# In games/joker_poker/__init__.py
# Leave empty or add:
"""Joker Poker - 5-card board poker with up to 2 wild jokers."""
```

#### 4.2 Copy `game.py`

**Source:** `docs/stake/MATH_SDK_DETAILED_GUIDE.md` → Section "3.1 games/joker_poker/game.py"

```bash
# Open in your editor
code game.py

# Copy FULL game.py code from MATH_SDK_DETAILED_GUIDE.md
# It's ~400-500 lines including:
# - Card types
# - Deck creation
# - Hand evaluation (13 types)
# - Joker resolution
# - Paytable
# - Event generation
```

**Key components in game.py:**
- `Card` dataclass
- `create_deck()` - 54 cards (52 + 2 Jokers)
- `evaluate_hand()` - 13 hand types
- `resolve_jokers()` - Optimal substitution
- `generate_book_events()` - Events for frontend
- `get_paytable()` - Win multipliers

#### 4.3 Copy `simulate.py`

**Source:** `docs/stake/MATH_SDK_DETAILED_GUIDE.md` → Section "3.2 games/joker_poker/simulate.py"

```bash
# Open in your editor
code simulate.py

# Copy FULL simulate.py code from MATH_SDK_DETAILED_GUIDE.md
# It's ~100-150 lines including:
# - RTP calculation
# - Hand frequency tracking
# - Joker frequency tracking
# - Results output
```

**Key functions:**
- `run_simulation(num_rounds)` - Test game math
- `main()` - CLI interface

---

### Step 5: Test Simulation (5 минут)

```bash
# Go back to root
cd ../..  # Now in pokerspin-math/

# Run simulation (1 million rounds)
python -m games.joker_poker.simulate

# Expected output:
# ===============================
# JOKER POKER SIMULATION RESULTS
# ===============================
# Rounds simulated: 1,000,000
# 
# RTP: 97.05%  ✅ (target: 97%)
# 
# Hand Frequencies:
# - Royal Flush: 0.00015%
# - Straight Flush: 0.0014%
# - Four of a Kind: 0.024%
# - Full House: 0.14%
# - Flush: 0.20%
# - Straight: 0.39%
# - Three of a Kind (High): 1.2%
# - Three of a Kind (Low): 1.0%
# - Two Pair (High): 2.3%
# - Two Pair (Low): 1.8%
# - Pair (High): 21.5%
# - Pair (Low): 18.2%
# - High Card: 25.1%
# 
# Joker Frequency: 3.70% (~1 in 27 rounds)
```

**Success criteria:**
- ✅ RTP: 96-98% (target 97%)
- ✅ Royal Flush: ~0.00015%
- ✅ Joker: ~3.7%
- ✅ No errors

**If RTP is off:**
- Check paytable multipliers in `game.py`
- Verify hand evaluation logic
- Re-run simulation with more rounds

---

### Step 6: Generate Outcomes (30-60 минут)

```bash
# Generate 10 million outcomes
python -m games.joker_poker.simulate --generate --count 10000000

# This will:
# 1. Run 10M simulations
# 2. Generate outcomes.csv
# 3. Create lookup tables
# 4. Compress files
# 5. Save to uploads/joker_poker/

# Progress output:
# Generating outcomes... 1M/10M (10%)
# Generating outcomes... 2M/10M (20%)
# ...
# Generating outcomes... 10M/10M (100%)
# 
# Compressing files...
# Creating lookup tables...
# 
# ✅ Done!
# Files saved to: uploads/joker_poker/
# Total size: ~500MB compressed
```

**Result files:**
```
uploads/joker_poker/
├── config.json          # Game configuration
├── outcomes.csv.gz      # 10M outcomes (compressed)
├── lookup_table.bin     # Fast lookup index
└── metadata.json        # RTP, frequencies, etc.
```

---

### Step 7: Upload to Stake Engine (10 минут)

```bash
# Make sure you have Stake Engine credentials
# Set environment variables:
export STAKE_ENGINE_API_KEY="your-api-key"
export STAKE_ENGINE_TEAM_ID="your-team-id"

# Or create .env file:
echo "STAKE_ENGINE_API_KEY=your-api-key" > .env
echo "STAKE_ENGINE_TEAM_ID=your-team-id" >> .env

# Upload to Stake Engine
make upload GAME=joker_poker

# Upload process:
# 1. Validates files
# 2. Checks RTP
# 3. Uploads to Stake Engine CDN
# 4. Creates game version
# 5. Registers with RGS

# Expected output:
# Uploading joker_poker...
# Validating config... ✅
# Validating outcomes... ✅
# Checking RTP: 97.05% ✅
# 
# Uploading files:
# - config.json (12 KB) ✅
# - outcomes.csv.gz (456 MB) ✅
# - lookup_table.bin (89 MB) ✅
# 
# Creating game version: joker_poker v1.0.0
# Registering with RGS...
# 
# ✅ Upload complete!
# 
# Game URL: https://rgs.stake-engine.com/games/joker_poker/1.0.0
# Game ID: jp_20260111_v1
# Status: Active
```

---

### Step 8: Verify in Admin Panel (5 минут)

```bash
# Open Stake Engine admin panel
open https://admin.stake-engine.com

# 1. Login with your account
# 2. Go to "Games" section
# 3. Find "Joker Poker"
# 4. Verify:
#    - Status: Active ✅
#    - RTP: 97.05% ✅
#    - Outcomes: 10,000,000 ✅
#    - Version: 1.0.0 ✅
```

---

### Step 9: Test with Test Client (10 минут)

```bash
# Stake Engine provides test client
# Install globally or in separate folder
npm install -g @stake-engine/test-client

# Run test
stake-test --game joker_poker --rounds 100

# Test output:
# Running 100 test rounds...
# 
# Round 1: High Card (A) - Win $0.10 ✅
# Round 2: Pair (K) - Win $0.40 ✅
# Round 3: No win ❌
# ...
# Round 100: Straight Flush - Win $100.00 ✅
# 
# Results:
# - Total rounds: 100
# - Wins: 68
# - Losses: 32
# - Win rate: 68%
# - Avg RTP: 96.8% (trending to 97%)
# 
# ✅ All tests passed!
```

---

## 🎯 Success Checklist

After completing all steps:

- [ ] **Fork created** - Your own copy of Math SDK ✅
- [ ] **Setup complete** - Virtual env, dependencies installed ✅
- [ ] **Game files created** - game.py, simulate.py ready ✅
- [ ] **Simulation passed** - RTP ~97%, no errors ✅
- [ ] **Outcomes generated** - 10M outcomes created ✅
- [ ] **Upload complete** - Files on Stake Engine ✅
- [ ] **Admin verified** - Game visible in admin panel ✅
- [ ] **Test passed** - 100 rounds work correctly ✅

---

## 📁 Final Repository Structure

```
pokerspin-math/  (your fork)
├── .git/
├── src/carrot/              # Stake Engine framework (don't modify)
├── games/
│   ├── example_game/        # Examples from Stake Engine
│   └── joker_poker/         # YOUR GAME ⭐
│       ├── __init__.py
│       ├── game.py          # Game logic (400+ lines)
│       └── simulate.py      # Simulation (150+ lines)
├── uploads/
│   └── joker_poker/         # Generated files
│       ├── config.json
│       ├── outcomes.csv.gz
│       └── lookup_table.bin
├── venv/                    # Python virtual environment
├── requirements.txt
├── Makefile
└── README.md                # Add custom README (see below)
```

---

## 📝 Custom README for Your Fork

Create `README_JOKER_POKER.md` in root:

```markdown
# Joker Poker - Stake Engine Math SDK

This is a fork of [Stake Engine Math SDK](https://github.com/StakeEngine/math-sdk) with our custom game: **Joker Poker**.

## Game: Joker Poker Board

5-card board-only poker with up to 2 wild Jokers.

**Features:**
- 54-card deck (52 + 2 Jokers)
- 13 hand types (High Card → Royal Flush)
- Optimal Joker substitution
- Target RTP: 97%

## Quick Start

```bash
# Setup
make setup
source venv/bin/activate

# Test
python -m games.joker_poker.simulate

# Generate
python -m games.joker_poker.simulate --generate

# Upload
make upload GAME=joker_poker
```

## Documentation

Full documentation: [pokerspin/docs/stake/](../pokerspin/docs/stake/)

## Links

- Main repo: https://github.com/_casik/pokerspin
- Stake Engine: https://stake-engine.com
- Math SDK Docs: https://stakeengine.github.io/math-sdk/
```

---

## 🔄 Git Workflow

### Initial Commit

```bash
cd pokerspin-math

# Add game files
git add games/joker_poker/

# Commit
git commit -m "Add Joker Poker game

- Implement game.py with 13 hand types
- Add joker resolution (optimal substitution)
- Create simulate.py for RTP testing
- Target RTP: 97%"

# Push to your fork
git push origin main
```

### Keep Upstream Updated

```bash
# Fetch updates from original Math SDK
git fetch upstream

# Merge updates (if any)
git merge upstream/main

# Push to your fork
git push origin main
```

---

## 🛠️ Troubleshooting

### Issue: `import carrot` fails

**Solution:**
```bash
# Make sure venv is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: RTP too high/low

**Solution:**
- Check paytable multipliers in `game.py`
- Verify hand evaluation logic
- Run more simulation rounds (10M instead of 1M)

### Issue: Upload fails

**Solution:**
```bash
# Verify credentials
echo $STAKE_ENGINE_API_KEY

# Check files exist
ls -lh uploads/joker_poker/

# Re-generate if needed
python -m games.joker_poker.simulate --generate
```

### Issue: Simulation too slow

**Solution:**
```bash
# Install Rust optimization (optional)
make setup-rust

# Or reduce rounds for testing
python -m games.joker_poker.simulate --count 100000
```

---

## 📊 Expected Performance

| Task | Time | CPU | Memory |
|------|------|-----|--------|
| Simulation (1M) | ~30s | ~100% | ~500MB |
| Generate (10M) | ~30-60min | ~100% | ~2GB |
| Upload | ~5-10min | ~20% | ~500MB |

**Hardware recommendations:**
- CPU: 4+ cores
- RAM: 8GB+
- Disk: 10GB free space
- Network: Stable connection for upload

---

## 🎯 Next Steps (After Math SDK Complete)

1. **Archive this repo** - Math SDK only needed for updates
2. **Switch to main repo** - `pokerspin/`
3. **Integrate frontend** - See `STAKE_CLIENT_INTEGRATION.md`
4. **Test end-to-end** - Frontend + Math SDK
5. **Deploy** - Upload to Stake CDN

---

## 📚 Related Documentation

| Document | Purpose |
|----------|---------|
| [START_HERE.md](../pokerspin/docs/stake/START_HERE.md) | Project overview |
| [MATH_SDK_DETAILED_GUIDE.md](../pokerspin/docs/stake/MATH_SDK_DETAILED_GUIDE.md) | Full game.py code |
| [STAKE_CLIENT_INTEGRATION.md](../pokerspin/docs/stake/STAKE_CLIENT_INTEGRATION.md) | Frontend integration |
| [NEXT_STEPS_STAKE_ENGINE.md](../pokerspin/docs/stake/NEXT_STEPS_STAKE_ENGINE.md) | Complete checklist |

---

## ✅ Completion Criteria

You're done when:

- ✅ Game simulates with RTP ~97%
- ✅ 10M outcomes generated
- ✅ Files uploaded to Stake Engine
- ✅ Game visible in admin panel
- ✅ Test client passes 100 rounds

**Estimated time:** 1 week (5-7 days)

---

**Ready to start?** 🚀

```bash
# Step 1: Fork on GitHub
open https://github.com/StakeEngine/math-sdk

# Step 2: Clone and begin!
git clone https://github.com/YOUR_ORG/math-sdk.git pokerspin-math
cd pokerspin-math
make setup
```

Good luck! 🎰✨
