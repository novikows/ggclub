# 🚀 Быстрый старт: Реальная математика (2 команды)

## Терминал 1: Math Server

```bash
cd ~/Projects/_casik/pokerspin-math
source env/bin/activate
pip install fastapi uvicorn pydantic  # Если еще не установлено
python -m games.joker_poker.server
```

**✅ Сервер запущен на http://localhost:8000**

---

## Терминал 2: Frontend

```bash
cd ~/Projects/_casik/pokerspin/client
npm run dev
```

**✅ Frontend запущен на http://localhost:3000**

---

## Браузер

Откройте: **http://localhost:3000**

В консоли (F12) вы увидите:

```
[Config] { rgsMode: 'local', ... }
[RGS Client] Using: LOCAL
[LocalRGS] Authenticated
```

**🎰 Готово! Играйте с реальной математикой!**

---

## Проверка

```bash
# Health check
curl http://localhost:8000/health

# Test play
curl -X POST http://localhost:8000/api/play \
  -H "Content-Type: application/json" \
  -d '{"bet": 100000}'
```

---

## Переключение режимов

Отредактируйте `client/.env.local`:

```bash
# Моки (разработка)
VITE_RGS_MODE=mock

# Локальный сервер (тестирование)
VITE_RGS_MODE=local

# Stake Engine (продакшен)
VITE_RGS_MODE=stake
```

---

**Полная документация:** [LOCAL_MATH_SETUP.md](LOCAL_MATH_SETUP.md)
