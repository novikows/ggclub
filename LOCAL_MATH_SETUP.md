# 🎰 Запуск игры на реальной математике (локальный сервер)

**Дата:** 2026-01-12  
**Статус:** ✅ Готово к запуску

---

## 🎉 Что готово

- ✅ **Math SDK** с игрой `joker_poker`
- ✅ **10M outcomes** сгенерированы (8.7GB)
- ✅ **Локальный RGS сервер** на FastAPI
- ✅ **Frontend клиент** `localRgsClient.ts`
- ✅ **Конфигурация** обновлена на режим `local`
- ✅ **TypeScript** компилируется без ошибок

---

## 🚀 Как запустить

### Шаг 1: Установить зависимости для Math Server

```bash
cd ~/Projects/_casik/pokerspin-math
source env/bin/activate

# Установить FastAPI (если еще не установлен)
pip install fastapi uvicorn pydantic
```

**Возможные проблемы:**
- SSL ошибка → Попробуйте: `pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org fastapi uvicorn pydantic`
- Permission denied → Попробуйте: `pip install --user fastapi uvicorn pydantic`

---

### Шаг 2: Запустить Math Server

Откройте **отдельный терминал**:

```bash
cd ~/Projects/_casik/pokerspin-math
source env/bin/activate
python -m games.joker_poker.server
```

Вы должны увидеть:

```
📁 Loading outcomes from: .../outcomes_10000000.json
✅ Loaded 10,000,000 outcomes
🚀 Starting Joker Poker Server...
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

**✅ Math Server работает на: http://localhost:8000**

---

### Шаг 3: Запустить Frontend

Откройте **другой терминал**:

```bash
cd ~/Projects/_casik/pokerspin/client
npm run dev
```

Вы должны увидеть:

```
  VITE v5.0.11  ready in 234 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**✅ Frontend работает на: http://localhost:3000**

---

### Шаг 4: Открыть игру

Откройте в браузере:

**http://localhost:3000**

Вы должны увидеть в консоли браузера (F12):

```
[Config] { rgsMode: 'local', gameId: 'joker_poker', debug: true }
[RGS Client] Using: LOCAL
[LocalRGS] authenticate() called
[LocalRGS] Authenticated: { sessionID: 'test-session-123', balance: 1000000000 }
[GameController] INIT → IDLE
```

---

## 🎮 Как играть

1. **Настройте ставку** кнопками +/-
2. **Нажмите PLAY**
3. **Смотрите** как открываются карты с реальной математикой!
4. Каждый раунд использует **предгенерированный outcome** из 10M исходов

---

## 🔍 Проверка работы

### 1. Health Check Math Server

```bash
curl http://localhost:8000/health
```

Ожидаемый ответ:

```json
{
  "status": "healthy",
  "stats": {
    "total_outcomes": 10000000,
    "current_index": 0,
    "balance": 1000000000,
    "outcomes_file": "...",
    "file_exists": true
  }
}
```

### 2. Test Play Request

```bash
curl -X POST http://localhost:8000/api/play \
  -H "Content-Type: application/json" \
  -d '{"bet": 100000}'
```

### 3. Browser Console

Откройте DevTools (F12) → Console, должны быть логи:

```
[Config] { rgsMode: 'local', ... }
[RGS Client] Using: LOCAL
[LocalRGS] authenticate() called
[LocalRGS] play() called: { bet: 100000 }
[LocalRGS] Round complete: { hand: 'PAIR', win: 40000, balance: 999940000 }
```

---

## 📊 Что происходит

```
┌─────────────────────────────────────────────────┐
│  Frontend (localhost:3000)                      │
│  ├─ PixiJS UI                                  │
│  ├─ localRgsClient.ts                          │
│  └─ fetch → http://localhost:8000/api/play     │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│  Math Server (localhost:8000)                   │
│  ├─ FastAPI server                             │
│  ├─ games/joker_poker/server.py                │
│  ├─ Loads 10M outcomes from JSON               │
│  └─ Returns pre-generated outcomes             │
└─────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Math Server не запускается

**Проблема:** FastAPI не установлен

**Решение:**
```bash
cd pokerspin-math
source env/bin/activate
pip install fastapi uvicorn pydantic
```

---

### Math Server: "No outcomes available"

**Проблема:** Файл outcomes не найден

**Решение:**
```bash
cd pokerspin-math
ls -lh games/joker_poker/outputs/outcomes_10000000.json

# Если файла нет - сгенерируйте:
source env/bin/activate
python -m games.joker_poker.simulate --generate --count 10000000
```

---

### Frontend: "Local Math Server not running"

**Проблема:** Math Server не запущен или не доступен

**Решение:**
1. Проверьте что Math Server запущен: `curl http://localhost:8000/health`
2. Если нет - запустите: `cd pokerspin-math && source env/bin/activate && python -m games.joker_poker.server`

---

### Browser: CORS error

**Проблема:** CORS блокирует запросы

**Решение:** Math Server уже настроен с CORS. Проверьте что:
1. Frontend на `localhost:3000`
2. Math Server на `localhost:8000`
3. Оба запущены локально

---

### TypeScript errors

**Проблема:** Ошибки компиляции

**Решение:**
```bash
cd client
npm run typecheck
```

Если есть ошибки - проверьте что все изменения применены.

---

## 🔄 Переключение режимов

### Вернуться на моки

```bash
# В client/.env.local:
VITE_RGS_MODE=mock
```

### Использовать локальный сервер

```bash
# В client/.env.local:
VITE_RGS_MODE=local
```

### Использовать Stake Engine (когда готов)

```bash
# В client/.env.local:
VITE_RGS_MODE=stake
```

---

## 📈 Статистика outcomes

Ваш локальный сервер использует **10M реальных outcomes** с:

- ✅ Правильной математикой poker hands
- ✅ Joker трансформациями (17.8% частота)
- ✅ Всеми 10 типами рук
- ⚠️ RTP ~123% (нужна балансировка paytable)

**Примечание:** Высокий RTP означает, что игроки выигрывают больше чем ставят. Для продакшена нужно снизить multipliers в `game.py` чтобы достичь target RTP 97%.

---

## 📝 Конфигурация

### Math Server

Файл: `pokerspin-math/games/joker_poker/server.py`

```python
OUTCOMES_FILE = Path(__file__).parent / "outputs" / "outcomes_10000000.json"
PORT = 8000
HOST = "0.0.0.0"
```

### Frontend

Файл: `pokerspin/client/.env.local`

```bash
VITE_RGS_MODE=local           # mock | local | stake
VITE_ENABLE_DEBUG=true        # Show debug logs
VITE_LOG_RGS_CALLS=true       # Log API calls
```

---

## 🎯 Следующие шаги

### ✅ Сейчас (Week 2)
- [x] Math Server запущен
- [x] Frontend подключен
- [x] Игра работает на реальной математике
- [ ] Протестировать 50+ раундов
- [ ] Проверить все сценарии (Jokers, wins, loses)

### 🔜 Позже (Week 3)
- [ ] Исправить RTP до 97% (обновить paytable в `game.py`)
- [ ] Перегенерировать outcomes
- [ ] Загрузить на Stake Engine
- [ ] Переключиться на `VITE_RGS_MODE=stake`
- [ ] Production deploy

---

## 📚 Документация

### Локальный сервер
- **Swagger UI:** http://localhost:8000/docs
- **API Reference:** `pokerspin-math/games/joker_poker/SERVER_README.md`

### Frontend
- **Client Code:** `pokerspin/client/src/api/localRgsClient.ts`
- **Config:** `pokerspin/client/src/config.ts`
- **README:** `pokerspin/client/README.md`

### Math SDK
- **Game Logic:** `pokerspin-math/games/joker_poker/game.py`
- **Simulation:** `pokerspin-math/games/joker_poker/simulate.py`
- **README:** `pokerspin-math/games/joker_poker/README.md`

---

## 🎉 Готово!

Теперь у вас работает игра на **реальной математике** с **10M предгенерированных outcomes**!

```bash
# Terminal 1: Math Server
cd pokerspin-math && source env/bin/activate
python -m games.joker_poker.server

# Terminal 2: Frontend
cd pokerspin/client
npm run dev

# Browser
http://localhost:3000
```

**Играйте и наслаждайтесь!** 🎰✨

---

**Статус:** ✅ Работает локально  
**Math:** ✅ Реальная (10M outcomes)  
**RTP:** ⚠️ 123% (нужна балансировка)  
**Stake Engine:** ⏳ Готов к интеграции  
**Production:** ⏳ После балансировки RTP
