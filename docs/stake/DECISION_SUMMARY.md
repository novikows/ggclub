# 🎯 Архитектурное решение: Math SDK Repository

**Date:** 2026-01-11  
**Decision:** Вариант 3 - Fork официального Stake Engine Math SDK  
**Status:** ✅ Утверждено

---

## 📋 Решение

### Выбранный вариант: Fork Math SDK

**Репозиторий:**
- Fork от: `https://github.com/StakeEngine/math-sdk`
- Название: `pokerspin-math` (или `math-sdk`)
- Организация: `_casik` или ваш личный GitHub

**Почему этот вариант?**

✅ **Готовая инфраструктура**
- Build system (Makefile)
- Upload scripts
- Test framework
- Проверенная архитектура

✅ **Официальная совместимость**
- Гарантированная работа с Stake Engine
- Updates от upstream
- Примеры других игр

✅ **Простота**
- Не нужно создавать infrastructure с нуля
- Все команды уже есть (`make setup`, `make upload`)
- Документация от Stake Engine

✅ **Разделение concerns**
- Math SDK (Python) отдельно
- Frontend (TypeScript) отдельно
- Каждый репо делает одну вещь хорошо

---

## 🏗️ Архитектура

### Два репозитория:

```
1. pokerspin-math (новый, fork)
   └── Используется: 1 раз для генерации outcomes
   └── Потом: архивируется, нужен только для updates

2. pokerspin (основной, уже есть)
   └── Используется: всегда для frontend разработки
   └── Интегрируется: с Stake Engine через TypeScript client
```

### Workflow:

```
Week 1: Math SDK (pokerspin-math repo)
┌──────────────────────────────────────┐
│ 1. Fork Math SDK                     │
│ 2. Add games/joker_poker/            │
│ 3. Simulate & verify RTP             │
│ 4. Generate 10M outcomes             │
│ 5. Upload to Stake Engine            │
└──────────────────────────────────────┘
            ↓
     ✅ Outcomes на Stake Engine
     ⏸️  Repo можно архивировать
            ↓
Week 2-3: Frontend (pokerspin repo)
┌──────────────────────────────────────┐
│ 1. npm install stake-engine          │
│ 2. Create stakeRgsClient.ts          │
│ 3. Replace mock with real client    │
│ 4. Test & deploy                     │
└──────────────────────────────────────┘
            ↓
     ✅ Игра работает!
```

---

## 📁 Структура репозиториев

### pokerspin-math (Fork Math SDK)

```
pokerspin-math/
├── .git/
│   └── remote: https://github.com/YOUR_ORG/math-sdk.git
│   └── upstream: https://github.com/StakeEngine/math-sdk.git
├── src/carrot/              # Stake framework (не трогаем)
├── games/
│   ├── example_game/        # Примеры от Stake
│   └── joker_poker/         # НАША ИГРА ⭐
│       ├── __init__.py
│       ├── game.py          # 400+ строк (из MATH_SDK_DETAILED_GUIDE.md)
│       └── simulate.py      # 150+ строк (из MATH_SDK_DETAILED_GUIDE.md)
├── uploads/
│   └── joker_poker/
│       ├── config.json
│       ├── outcomes.csv.gz  # 10M outcomes
│       └── lookup_table.bin
├── venv/                    # Python virtual env
├── requirements.txt
├── Makefile                 # make setup, make upload
└── README.md                # Stake Engine original README
└── README_JOKER_POKER.md    # Наша документация
```

**Использование:**
- Один раз для генерации game math
- Потом архивируется
- Редко обновляется (только если меняем paytable/rules)

---

### pokerspin (Основной репозиторий)

```
pokerspin/
├── client/                  # TypeScript frontend
│   ├── src/
│   │   ├── api/
│   │   │   ├── stakeRgsClient.ts  # Real Stake client (Week 2)
│   │   │   └── mockRgsClient.ts   # Mock (удалить Week 2)
│   │   ├── game/
│   │   │   ├── GameController.ts
│   │   │   └── GameStateManager.ts
│   │   └── ui/
│   │       └── BoardView.ts
│   ├── package.json
│   └── vite.config.ts
├── docs/
│   └── stake/
│       ├── START_HERE.md
│       ├── MATH_SDK_SETUP_INSTRUCTIONS.md  ⭐ NEW
│       ├── MATH_SDK_DETAILED_GUIDE.md
│       ├── STAKE_CLIENT_INTEGRATION.md
│       └── ...
└── README.md
```

**Использование:**
- Активная разработка frontend
- Интеграция с Stake Engine
- Deploy на Stake CDN

---

## 🚀 Next Steps (Week 1)

### Step 1: Fork Math SDK

```bash
# 1. Open GitHub
open https://github.com/StakeEngine/math-sdk

# 2. Click "Fork"
# Rename to: pokerspin-math
# Organization: _casik

# 3. Clone YOUR fork
cd ~/Projects/_casik/
git clone https://github.com/_casik/math-sdk.git pokerspin-math
cd pokerspin-math

# 4. Add upstream
git remote add upstream https://github.com/StakeEngine/math-sdk.git
```

**Time:** 5 минут ✅

---

### Step 2: Setup Environment

```bash
# In pokerspin-math/
make setup

# This creates:
# - venv/ (Python virtual environment)
# - Installs dependencies (carrot, numpy, etc.)

# Activate
source venv/bin/activate

# Verify
python -c "import carrot; print('OK')"
```

**Time:** 10 минут ✅

---

### Step 3: Create Game Files

```bash
# Create directory
mkdir -p games/joker_poker
cd games/joker_poker

# Create files
touch __init__.py
touch game.py
touch simulate.py
```

**Time:** 2 минуты ✅

---

### Step 4: Copy Code

**Source:** `pokerspin/docs/stake/MATH_SDK_DETAILED_GUIDE.md`

1. Open `MATH_SDK_DETAILED_GUIDE.md` in pokerspin repo
2. Copy `game.py` code (Section 3.1)
3. Paste into `pokerspin-math/games/joker_poker/game.py`
4. Copy `simulate.py` code (Section 3.2)
5. Paste into `pokerspin-math/games/joker_poker/simulate.py`

**Time:** 10 минут ✅

---

### Step 5: Test Simulation

```bash
# Run 1M simulation
python -m games.joker_poker.simulate

# Expected output:
# RTP: 97.05% ✅
# Royal Flush: 0.00015% ✅
# Joker: 3.70% ✅
```

**Time:** 5 минут ✅

**If fails:** Check MATH_SDK_SETUP_INSTRUCTIONS.md → Troubleshooting

---

### Step 6: Generate Outcomes

```bash
# Generate 10M outcomes (takes 30-60 min)
python -m games.joker_poker.simulate --generate --count 10000000

# Output:
# Creating outcomes... (progress bar)
# Compressing...
# ✅ Done! Files in uploads/joker_poker/
```

**Time:** 30-60 минут ⏳

---

### Step 7: Upload to Stake Engine

```bash
# Set credentials (get from Stake Engine admin)
export STAKE_ENGINE_API_KEY="your-key"
export STAKE_ENGINE_TEAM_ID="your-team"

# Upload
make upload GAME=joker_poker

# Expected:
# Uploading files...
# Validating RTP... ✅
# Creating game version...
# ✅ Upload complete!
```

**Time:** 10 минут ✅

---

### Step 8: Verify in Admin Panel

```bash
# Open admin
open https://admin.stake-engine.com

# Check:
# - Game: Joker Poker ✅
# - Status: Active ✅
# - RTP: 97.05% ✅
# - Outcomes: 10,000,000 ✅
```

**Time:** 5 минут ✅

---

### Step 9: Archive Repository

```bash
# Commit everything
git add .
git commit -m "Add Joker Poker game - RTP 97%"
git push origin main

# On GitHub: Settings → Archive repository
# Reason: Math SDK only needed for updates
```

**Time:** 5 минут ✅

---

## ✅ Week 1 Complete!

**Deliverable:**
- ✅ Math SDK forked & setup
- ✅ Game logic implemented
- ✅ RTP tested (97%)
- ✅ 10M outcomes generated
- ✅ Uploaded to Stake Engine
- ✅ Verified in admin panel
- ✅ Repository archived

**Next:** Week 2 - Frontend Integration (pokerspin repo)

---

## 📚 Documentation

### For Week 1 (Math SDK):
- **[MATH_SDK_SETUP_INSTRUCTIONS.md](MATH_SDK_SETUP_INSTRUCTIONS.md)** - Пошаговая инструкция ⭐
- **[MATH_SDK_DETAILED_GUIDE.md](MATH_SDK_DETAILED_GUIDE.md)** - Полный код

### For Week 2-3 (Frontend):
- **[STAKE_CLIENT_INTEGRATION.md](STAKE_CLIENT_INTEGRATION.md)** - TypeScript интеграция
- **[NEXT_STEPS_STAKE_ENGINE.md](NEXT_STEPS_STAKE_ENGINE.md)** - Полный чеклист

### Overview:
- **[START_HERE.md](START_HERE.md)** - Главный файл
- **[STAKE_ENGINE_SUMMARY.md](STAKE_ENGINE_SUMMARY.md)** - Полная сводка

---

## 🎯 Success Criteria

### Math SDK (Week 1):
- ✅ Fork создан
- ✅ Game files добавлены
- ✅ RTP: 96-98% (target 97%)
- ✅ Simulation runs без ошибок
- ✅ 10M outcomes generated
- ✅ Upload successful
- ✅ Game active в admin panel

### Frontend (Week 2-3):
- ⏳ stake-engine installed
- ⏳ stakeRgsClient.ts created
- ⏳ Mock replaced with real client
- ⏳ 100+ test rounds passed
- ⏳ Deployed to Stake CDN
- ⏳ Production game live

---

## 💡 Key Insights

### Why This Works:

1. **Separation of Concerns**
   - Math SDK = Python, одноразовый
   - Frontend = TypeScript, постоянная разработка

2. **Best of Both Worlds**
   - Official Math SDK infrastructure
   - Custom frontend на PixiJS

3. **Minimal Maintenance**
   - Math SDK archived after upload
   - Only update if rules change

4. **Stake Engine Philosophy**
   - Pre-generated outcomes (Math SDK)
   - Runtime selection (RGS)
   - Frontend agnostic (PixiJS OK)

---

## 📞 Need Help?

### Math SDK Issues:
- Check: [MATH_SDK_SETUP_INSTRUCTIONS.md](MATH_SDK_SETUP_INSTRUCTIONS.md) → Troubleshooting
- Reference: [MATH_SDK_DETAILED_GUIDE.md](MATH_SDK_DETAILED_GUIDE.md) → Code examples

### Frontend Issues:
- Check: [STAKE_CLIENT_INTEGRATION.md](STAKE_CLIENT_INTEGRATION.md)

### General Questions:
- Check: [START_HERE.md](START_HERE.md)

---

**Ready to start?** 🚀

```bash
# Fork Math SDK on GitHub
open https://github.com/StakeEngine/math-sdk

# Then follow MATH_SDK_SETUP_INSTRUCTIONS.md
```

**Timeline:** 3 weeks total
- Week 1: Math SDK ⏳
- Week 2: Frontend Integration
- Week 3: Testing & Deploy

**Let's build!** 🎰✨
