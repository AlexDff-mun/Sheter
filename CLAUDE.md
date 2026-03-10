# Shelter PVE — Project Context for Claude Code

## Проект
DayZ PVE сервер "Shelter PVE". Сайт на GitHub Pages + API на VPS.

---

## Инфраструктура

| Что | Где |
|-----|-----|
| Репозиторий | https://github.com/AlexDff-mun/Shelter |
| Живой сайт | https://game.shelter-dayz.ru/ |
| VPS IP | 85.198.71.246 (Beget Cloud, Ubuntu 22.04) |
| API домен | https://shelter-dayz.ru/api |
| API файл на VPS | /var/www/shelter-api/index.js |
| PM2 | `pm2 restart shelter-api` |
| nginx конфиг | /etc/nginx/sites-available/shelter-api |

## Сервер DayZ
- IP: `217.168.247.192:2312` (Game Port)
- Query Port: `2317`
- Max players: `50`
- BattleMetrics ID: `37659741`
- Steam connect: `steam://run/221100/en/+connect 217.168.247.192:2312/`

## Ссылки
- Discord: https://discord.gg/4EWuqwfBu
- Telegram: https://t.me/ShelterPVE
- Магазин: https://shelter-games.ru/products
- WARGM: https://wargm.ru/server/66288
- BattleMetrics: https://www.battlemetrics.com/servers/dayz/37659741

---

## Файлы сайта

| Файл | Описание |
|------|----------|
| `index.html` | Главная страница |
| `map.html` | Интерактивная карта Leaflet + Chernarus |
| `admin.html` | Админ панель (авторизация через VPS /api/auth) |
| `faq.html` | FAQ + форма тикетов |
| `craft.html` | База крафта с иконками |
| `mechanics.html` | Механики сервера (вкладки) |
| `rules.html` | Правила сервера |
| `404.html` | Кастомная 404 |

---

## VPS API (Node.js/Express, порт 3000)

### Эндпоинты
```
POST /api/auth         { password } → { token }     (логин админа)
GET  /api/auth/check                → { ok, role }  (проверка токена)
GET  /api/server                    → { online, players, maxPlayers }
GET  /api/news                      → [ ...news ]   (публичный)
POST /api/news         auth         → создать новость
PUT  /api/news/:id     auth         → обновить
DELETE /api/news/:id   auth         → удалить
GET  /api/markers                   → [ ...markers ] (публичный)
POST /api/markers      auth         → сохранить массив маркеров
POST /api/ticket       { name, topic, message, contact } → Discord webhook
```

### Auth
- `Authorization: Bearer <token>` в заголовке
- Пароль по умолчанию: `shelter2024` (env: ADMIN_PASSWORD)
- JWT_SECRET: env JWT_SECRET

### Хранилище
- Новости: `/var/www/shelter-api/data/news.json`
- Маркеры: `/var/www/shelter-api/data/markers.json`

---

## Дизайн / цвета

```css
--red: #cc1f1f
--ember: #e05a1a
--khaki: #b7a98d
--bg: #080707
--text: #d4c9b5
--rad: #7ec8a0
--gold: #e0a020
--blue: #5b9bd5
```

Шрифты: `Oswald`, `Exo 2`, `Rajdhani`, `Share Tech Mono`

---

## Маркеры карты (дефолт)

```json
[
  {"id":"m1","text":"Лагерь выживших","cat":"trader","x":7856,"z":10544,"sz":true,"szr":90},
  {"id":"m2","text":"Терминал","cat":"trader","x":13859,"z":12789,"sz":true,"szr":108},
  {"id":"m3","text":"Егерь","cat":"trader","x":1186,"z":6244,"sz":true,"szr":50},
  {"id":"m4","text":"Инженерный пост","cat":"craft","x":3092,"z":10827,"sz":true,"szr":50},
  {"id":"m5","text":"Алькатрас","cat":"danger","x":2666,"z":1230,"sz":false,"szr":0},
  {"id":"m6","text":"Радар","cat":"danger","x":579,"z":13173,"sz":false,"szr":0},
  {"id":"m7","text":"Радиация","cat":"radiation","x":8351,"z":12765,"sz":false,"szr":0},
  {"id":"m8","text":"Радиация (Павлово)","cat":"radiation","x":2072,"z":3215,"sz":false,"szr":0}
]
```

---

## ✅ ЗАДАЧИ (приоритет)

### 🔴 Критично
- [ ] **Счётчик игроков** — залить обновлённый index.html на GitHub (API_URL исправлен на https://shelter-dayz.ru/api/server)
- [ ] **faq.html** — залить обновлённый faq.html (API_TICKET исправлен)
- [ ] **VPS API v2** — задеплоить vps_api_v2.js (нужен для admin панели):
  ```bash
  cd /var/www/shelter-api && npm install jsonwebtoken
  # заменить index.js содержимым vps_api_v2.js, затем:
  pm2 restart shelter-api
  curl -X POST http://localhost:3000/api/auth -H "Content-Type: application/json" -d '{"password":"shelter2024"}'
  ```
- [ ] **admin.html** — эндпоинты исправлены (/login→/auth, /verify→/auth/check), залить на GitHub

### 🟡 Важно
- [ ] **Карта — iZurvive стиль** — переделать map.html:
  - Тайловая карта (Leaflet tiles) вместо одного imageOverlay
  - Zoom levels 1-7, тайлы нарезать из map_chernarus.jpg
  - Слои переключаемые (рельеф / маркеры / сейфзоны)
  - Правый клик по карте — добавить маркер
  - Мини-карта в углу
  - Координаты в реальном времени как у iZurvive
- [ ] **Новости из VPS** — GET /api/news → index.html (сейчас localStorage)
- [ ] **Маркеры из VPS** — GET /api/markers → map.html (сейчас localStorage)

### 🟢 Улучшения
- [ ] **mechanics.html** — написать контент для вкладки "Гайды"
- [ ] **Discord интеграция** — новости из Discord канала на сайт
- [ ] **craft.html** — добавить новые рецепты
- [ ] **game.shelter-dayz.ru** — настроить как основной домен

### 🔵 Будущее
- [ ] Донат — ЮКасса + Expansion автовыдача
- [ ] Discord бот с тикет-системой
- [ ] RCON интеграция для реального онлайна
- [ ] Статистика игроков в admin.html

---

## Важные соглашения

1. **Именование файлов** — snake_case для JS, kebab-case для HTML/CSS
2. **Крафт-гайд** — загружаемые HTML файлы пользователя = источник истины для названий
3. **Restart timer** — MSK UTC+3, рестарты в 03:00 / 09:00 / 15:00 / 21:00 по МСК
4. **Фавикон** — images/favicon.ico, images/icon-192.png
5. **Язык** — сайт на русском, комментарии в коде на русском

---

## Как деплоить

### Сайт (GitHub Pages)
```bash
git add .
git commit -m "fix: описание"
git push origin main
# сайт обновляется через ~1-2 минуты
```

### VPS API
```bash
ssh root@85.198.71.246
cd /var/www/shelter-api
# редактировать index.js
pm2 restart shelter-api
pm2 logs shelter-api --lines 20
```

### Проверить API
```bash
curl https://shelter-dayz.ru/api/server
curl -X POST https://shelter-dayz.ru/api/auth -H "Content-Type: application/json" -d '{"password":"shelter2024"}'
```
