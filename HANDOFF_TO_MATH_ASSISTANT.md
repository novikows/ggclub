# 🎰 Handoff: Frontend → Math Assistant

**Date:** 2026-01-13  
**From:** Frontend Team (pokerspin repo)  
**To:** Math Team (pokerspin-math repo)

---

## 📋 TL;DR

**Frontend готов** и работает на моках. Теперь нужен **Math SDK (Python)** для генерации реальных игровых outcomes в Stake Engine.

**Твоя задача:**
1. Настроить Stake Engine Math SDK (fork официального репо)
2. Реализовать игровую логику Joker Poker на Python
3. Сгенерировать outcomes (10M+ simulations)
4. Загрузить на Stake Engine RGS сервер

**Репозиторий:** `/Users/vladislavnovikov/Projects/_casik/pokerspin-math` (пока не существует)

---

## 🎮 Что за игра?

**Joker Poker Board** - 5-карточный покер с джокерами:

### Механика (1 раунд):
1. Игрок выбирает ставку ($0.10 - $1000)
2. Нажимает **PLAY**
3. На столе появляются **5 карт** (flop → turn → river с задержками)
4. Если есть **JOKER** (до 2-х) - он трансформируется в лучшую карту для максимизации выигрыша
5. Выигрыш зависит от покерной комбинации (от High Card до Royal Flush)

### Колода:
- **54 карты** = 52 обычные + 2 джокера
- Джокер = Wild карта (может быть любой картой)
- Символы: `AS`, `KD`, `7C`, `JOKER` и т.д.

### Комбинации (13 типов):
- `HIGH_CARD` → 0.35x
- `PAIR` → 0.9x
- `TWO_PAIR` → 1.5x
- `THREE_OF_A_KIND` → 3x
- `STRAIGHT` → 5x
- `FLUSH` → 10x
- `FULL_HOUSE` → 20x
- `FOUR_OF_A_KIND` → 40x
- `STRAIGHT_FLUSH` → 100x
- `ROYAL_FLUSH` → 1000x

---

## 🔗 Как это работает с Stake Engine?

### Архитектура:
```
┌─────────────────────────────────────────────────────────────┐
│                    STAKE ENGINE RGS                         │
│  (их инфраструктура - мы не трогаем)                        │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Math SDK (Python) ← ТВОЯ ЗАДАЧА                     │  │
│  │  - game.py: игровая логика                           │  │
│  │  - simulate.py: генерация outcomes                   │  │
│  │  - Outputs: compressed binary files                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓ upload                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Outcome Database (их сервер)                        │  │
│  │  - 10M+ pre-generated rounds                         │  │
│  │  - Weighted random selection                         │  │
│  │  - RTP-certified outcomes                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  RGS API (их HTTP API)                               │  │
│  │  - POST /wallet/authenticate                         │  │
│  │  - POST /wallet/play ← возвращает events             │  │
│  │  - POST /wallet/end-round                            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↓ HTTP calls
┌─────────────────────────────────────────────────────────────┐
│               FRONTEND (Svelte 5) ← УЖЕ ГОТОВ               │
│  - Обрабатывает events                                      │
│  - Анимирует карты                                          │
│  - Показывает выигрыши                                      │
└─────────────────────────────────────────────────────────────┘
```

### Что это значит:
- ✅ **НЕТ backend** - Stake Engine всё делает сам
- ✅ **НЕТ PostgreSQL/Redis** - outcomes хранятся у них
- ✅ **НЕТ RNG** - outcomes pre-generated и сертифицированы
- ✅ Только **Math SDK (Python)** + **Frontend (TypeScript)**

---

## 📤 Контракт между Frontend и Math

### Frontend вызывает `/play` и получает:

```json
{
  "balance": 99000000,
  "round": {
    "id": "round-123456",
    "events": [
      {
        "index": 0,
        "type": "reveal_initial_board",
        "board": [
          { "symbol": "AS" },
          { "symbol": "KD" },
          { "symbol": "7C" },
          { "symbol": "JOKER" },
          { "symbol": "9H" }
        ]
      },
      {
        "index": 1,
        "type": "joker_transform",
        "jokerTransforms": [
          { "position": 3, "targetSymbol": "AH" }
        ]
      },
      {
        "index": 2,
        "type": "hand_result",
        "handCategory": "PAIR",
        "payoutMultiplier": 0.9,
        "winningPositions": [0, 3],
        "jackpot": false
      }
    ]
  }
}
```

### Event Types (ОБЯЗАТЕЛЬНО):

#### 1. `reveal_initial_board`
```typescript
{
  index: 0,
  type: 'reveal_initial_board',
  board: Array<{ symbol: string }> // 5 элементов
}
```
- Всегда **первый** event
- Содержит все 5 карт (включая JOKER если есть)
- Frontend анимирует их как flop(3) → turn(1) → river(1)

#### 2. `joker_transform` (опционально)
```typescript
{
  index: 1,
  type: 'joker_transform',
  jokerTransforms: Array<{
    position: number,      // 0-4
    targetSymbol: string   // "AS", "KC" и т.д.
  }>
}
```
- Только если есть JOKER на доске
- Может быть до 2-х трансформаций
- Frontend анимирует flip: JOKER → target card

#### 3. `hand_result`
```typescript
{
  index: 2,
  type: 'hand_result',
  handCategory: 'PAIR' | 'THREE_OF_A_KIND' | ... | 'ROYAL_FLUSH',
  payoutMultiplier: number,      // 0 или 0.35-1000
  winningPositions: number[],    // [0,1,2,3,4] indices
  jackpot: boolean               // true если >= 10x
}
```
- Всегда **последний** event
- `handCategory`: одна из 13 категорий
- `payoutMultiplier`: множитель выигрыша (0 = проигрыш)
- `winningPositions`: индексы выигрышных карт для подсветки

---

## 📁 Структура Frontend (для контекста)

```
pokerspin/
├── src/
│   ├── lib/
│   │   ├── types/index.ts           ← TypeScript типы (контракт)
│   │   ├── api/
│   │   │   ├── stakeRgsClient.ts    ← Обёртка над stake-engine
│   │   │   ├── mockRgsClient.ts     ← Mock для разработки
│   │   │   ├── mockData.ts          ← 14 сценариев (ОБРАЗЕЦ!)
│   │   │   └── index.ts             ← Переключатель mock/stake
│   │   ├── game/
│   │   │   ├── gameState.svelte.ts  ← Глобальный state
│   │   │   └── GameController.svelte.ts ← Игровая логика
│   │   ├── components/              ← UI компоненты
│   │   └── config.ts                ← rgsMode: 'mock' | 'stake'
│   └── routes/
│       └── +page.svelte             ← Главная страница
├── docs/
│   ├── global_specification.md      ← Полная спека игры (1000 строк!)
│   └── stake/
│       ├── START_HERE.md
│       ├── MATH_SDK_SETUP_INSTRUCTIONS.md  ← Пошаговая инструкция
│       └── MATH_SDK_DETAILED_GUIDE.md      ← Код Python (не реализован)
└── package.json                     ← stake-engine: ^0.1.32 (установлен)
```

### 🎯 Важные файлы для тебя:

#### 1. **src/lib/types/index.ts** (224 строки)
**Зачем:** TypeScript типы - это **контракт** между frontend и math.

**Ключевые типы:**
```typescript
// Символы карт
type CardRank = '2' | '3' | ... | 'A';
type CardSuit = 'C' | 'D' | 'H' | 'S';
type CardSymbol = `${CardRank}${CardSuit}`;  // "AS", "KD"
type Symbol = CardSymbol | 'JOKER';

// События
interface RevealInitialBoardEvent { ... }
interface JokerTransformEvent { ... }
interface HandResultEvent { ... }

// Категории рук
type HandCategory = 'HIGH_CARD' | 'PAIR' | ... | 'ROYAL_FLUSH';
```

#### 2. **src/lib/api/mockData.ts** (257 строк)
**Зачем:** 14 реальных сценариев игры - **ОБРАЗЕЦ** того что должен генерировать Python.

**Примеры:**
- Royal Flush (x1000)
- Four of a Kind (x40)
- Joker + Pair → Three of a Kind (x3)
- Two Jokers → Four of a Kind (x40)
- Joker → Royal Flush (x1000)

**Используй это как reference!**

#### 3. **docs/global_specification.md** (1009 строк)
**Зачем:** Полная спека игры на английском.

**Содержит:**
- Механика джокеров
- Таблица выплат
- RGS event schema
- Hand evaluation алгоритм

#### 4. **docs/stake/MATH_SDK_SETUP_INSTRUCTIONS.md** (583 строки)
**Зачем:** Пошаговая инструкция setup Math SDK.

**9 шагов:**
1. Fork Math SDK на GitHub
2. Clone & setup (make setup)
3. Create game directory
4. Copy game code
5. Run simulation (RTP check)
6. Generate outcomes (10M rounds)
7. Upload to Stake Engine
8. Test integration
9. Deploy

---

## 🚀 Твоя задача (пошагово)

### **Phase 1: Setup (30 минут)**

```bash
# 1. Fork Math SDK
open https://github.com/StakeEngine/math-sdk
# Click "Fork" → Rename to "pokerspin-math"

# 2. Clone to _casik folder
cd ~/Projects/_casik/
git clone https://github.com/YOUR_ORG/math-sdk.git pokerspin-math
cd pokerspin-math

# 3. Setup
make setup
source venv/bin/activate

# 4. Verify
python -c "import carrot; print('OK ✅')"
```

### **Phase 2: Implement Game Logic (2-3 дня)**

```bash
cd games
mkdir joker_poker
cd joker_poker
touch __init__.py game.py simulate.py
```

**Файлы для реализации:**

#### **game.py** (400-500 строк)
Реализуй:
- [ ] `Card` dataclass (rank, suit)
- [ ] `create_deck()` → 54 карты (52 + 2 JOKER)
- [ ] `evaluate_hand(cards)` → HandCategory + winning_positions
  - Проверь все 13 категорий (HIGH_CARD → ROYAL_FLUSH)
- [ ] `resolve_jokers(cards)` → Оптимальная замена джокеров
  - Найди лучшую комбинацию из всех возможных
- [ ] `get_paytable()` → Multipliers для каждой комбинации
- [ ] `generate_book_events(board, bet_amount)` → Events для frontend
  - `reveal_initial_board`
  - `joker_transform` (если есть)
  - `hand_result`

**Образцы:**
- Смотри `src/lib/api/mockData.ts` - 14 реальных примеров
- Смотри `docs/global_specification.md` - секция 3 (Joker Mechanics)

#### **simulate.py** (150-200 строк)
Реализуй:
- [ ] `simulate_round()` → Один раунд (deal 5, evaluate, payout)
- [ ] `run_simulation(n_rounds)` → RTP calculation
  - Target RTP: **97%** (±1%)
- [ ] `generate_outcomes(n_outcomes)` → Binary files для Stake Engine
  - Минимум: **10,000,000** outcomes
  - Формат: Stake Engine compressed binary

**CLI:**
```bash
# Test simulation
python -m games.joker_poker.simulate

# Generate outcomes (30-60 min)
python -m games.joker_poker.simulate --generate --count 10000000
```

### **Phase 3: Test & Tune (1 день)**

```bash
# 1. Run RTP simulation
python -m games.joker_poker.simulate

# Expected output:
# RTP: 96.8% - 97.2% ✅
# Royal Flush: ~0.00015% (1/650,000)
# Four of a Kind: ~0.024% (1/4,165)
# Pair or better: ~42%
```

**Если RTP не 97%:**
- Подкрути multipliers в paytable
- Проверь частоту джокеров (должны быть редкими!)
- Баланс между high-value и low-value hands

### **Phase 4: Upload & Integration (1 день)**

```bash
# 1. Build outcomes
make build GAME=joker_poker

# 2. Upload to Stake Engine
make upload GAME=joker_poker
# Нужен API key от Stake Engine

# 3. Test с frontend
cd ../pokerspin
npm run dev
# Открой http://localhost:5173?sessionID=test-session
```

**Frontend автоматически:**
- Вызовет `/wallet/authenticate`
- Получит balance и config
- Вызовет `/wallet/play` при нажатии PLAY
- Обработает твои events
- Анимирует карты
- Покажет выигрыш

---

## ✅ Критерии успеха

### Must Have:
- [x] **RTP 96-98%** (optimal: 97%)
- [x] **Royal Flush ~1/650k** (редкий!)
- [x] **Events валидные** (смотри mockData.ts)
- [x] **Джокеры работают** (до 2-х на доске, оптимальная замена)
- [x] **10M+ outcomes** сгенерированы
- [x] **Frontend работает** без ошибок

### Nice to Have:
- [ ] Unit tests для evaluate_hand()
- [ ] Variance analysis (Low/Medium/High)
- [ ] Hit frequency report
- [ ] Debug mode с логами

---

## 📚 Ресурсы

### Документация в pokerspin:
1. **docs/global_specification.md** - полная спека игры
2. **docs/stake/MATH_SDK_SETUP_INSTRUCTIONS.md** - setup guide
3. **docs/stake/START_HERE.md** - overview проекта
4. **src/lib/types/index.ts** - TypeScript контракт
5. **src/lib/api/mockData.ts** - примеры events (ВАЖНО!)

### Официальные доки Stake Engine:
- Math SDK: https://github.com/StakeEngine/math-sdk
- RGS API: https://stakeengine.github.io/
- Carrot SDK: https://carrot-sdk.readthedocs.io/

### Примеры игр в Math SDK:
```bash
# После fork смотри:
games/
├── example_slots/     # Пример слота
├── example_poker/     # Пример покера (если есть)
└── joker_poker/       # ← Твоя задача
```

---

## 🐛 Возможные проблемы

### Problem: RTP слишком высокий (>98%)
**Fix:** Уменьши multipliers для частых hands (PAIR, TWO_PAIR)

### Problem: RTP слишком низкий (<96%)
**Fix:** Увеличь multipliers или сделай джокеры чаще

### Problem: Джокеры не работают
**Fix:** Проверь `resolve_jokers()` - он должен перебрать все 52 варианта и выбрать лучший

### Problem: Events не парсятся frontend
**Fix:** 
1. Проверь формат JSON (смотри mockData.ts)
2. Проверь типы (string, number, array)
3. Запусти frontend в dev mode - увидишь ошибки в console

### Problem: Upload failed
**Fix:** 
1. Проверь API key от Stake Engine
2. Проверь формат outcome files
3. Проверь make upload логи

---

## 🤝 Коммуникация

### Когда спрашивать Frontend Team:
- ❓ Формат events непонятен
- ❓ Frontend не может распарсить твои данные
- ❓ Нужно добавить новое поле в event
- ❓ Multipliers выглядят странно

### Что НЕ спрашивать:
- ❌ Как работает Stake Engine (читай доки)
- ❌ Как написать Python (гугли)
- ❌ Как считать RTP (есть в примерах)

### Как тестировать интеграцию:
```bash
# Terminal 1 (твоя сторона)
cd pokerspin-math
python -m games.joker_poker.simulate --serve  # Если есть local RGS

# Terminal 2 (frontend)
cd pokerspin
npm run dev
# Открой http://localhost:5173
```

---

## 🎯 Timeline

| Phase | Task | Time |
|-------|------|------|
| 1 | Setup Math SDK | 30 min |
| 2 | Implement game.py (hand evaluation) | 1 day |
| 3 | Implement simulate.py (RTP simulation) | 1 day |
| 4 | Generate outcomes (10M rounds) | 30-60 min |
| 5 | Test & tune RTP | 1 day |
| 6 | Upload to Stake Engine | 1 hour |
| 7 | Integration testing с frontend | 2-3 hours |
| **Total** | | **3-4 days** |

---

## ✨ Финальный чеклист

### Before you start:
- [ ] Прочитал docs/global_specification.md
- [ ] Посмотрел src/lib/api/mockData.ts (примеры!)
- [ ] Понял event schema (reveal → joker → result)
- [ ] Fork Math SDK на GitHub
- [ ] Setup virtualenv

### Implementation:
- [ ] game.py: evaluate_hand() - все 13 категорий
- [ ] game.py: resolve_jokers() - оптимальная замена
- [ ] game.py: generate_book_events() - правильный формат
- [ ] simulate.py: RTP calculation
- [ ] simulate.py: outcome generation

### Testing:
- [ ] RTP 96-98% ✅
- [ ] Royal Flush редкий (~1/650k)
- [ ] Джокеры трансформируются корректно
- [ ] Events парсятся frontend
- [ ] 10M outcomes сгенерированы

### Integration:
- [ ] Upload to Stake Engine
- [ ] Frontend работает с реальным RGS
- [ ] Анимации карт проигрываются
- [ ] Выигрыши отображаются
- [ ] Balance обновляется

---

## 🎉 Success!

Когда всё готово:
1. Frontend переключится на `rgsMode: 'stake'` (уже сделано!)
2. Игра будет работать на реальных outcomes
3. Можно деплоить на Stake Engine CDN
4. 🚀 Profit!

---

**Good luck!** 🎰

Если вопросы - читай доки или проси frontend team.

**Ключевые файлы:**
- `src/lib/api/mockData.ts` ← ОБРАЗЕЦ
- `src/lib/types/index.ts` ← КОНТРАКТ
- `docs/global_specification.md` ← СПЕКА
