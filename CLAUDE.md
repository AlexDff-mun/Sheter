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


---

## Discord

| Канал | ID |
|-------|----|
| #новости | 1363913152814649574 |
| #изменения | 1363934009859768422 |
| #обновления-модов | 1421934937749327953 |
| Сервер Discord | https://discord.gg/4EWuqwfBu |

### Как получить Bot Token
1. Открой https://discord.com/developers/applications
2. New Application → дай имя "ShelterBot"
3. Bot → Reset Token → скопируй токен
4. Bot → включи "Message Content Intent"
5. OAuth2 → URL Generator → bot + Read Message History → скопируй URL → открой → добавь бота на сервер

### Схема интеграции Discord → Сайт
```
Discord канал → discord.js бот на VPS → POST /api/news → data/news.json
                                                        ↓
                                         index.html GET /api/news каждые 5 мин
```

### Файл бота на VPS
- Путь: `/var/www/shelter-api/discord-bot.js`
- Запуск: `pm2 start discord-bot.js --name shelter-bot`
- Env: `DISCORD_BOT_TOKEN` через `pm2 set shelter-bot:DISCORD_BOT_TOKEN токен`

### Формат новости из Discord
```json
{
  "id": "discord_1363913152814649574_1234567890",
  "title": "Первая строка сообщения",
  "tag": "НОВОСТИ",
  "text": "Полный текст сообщения",
  "date": "2026-03-10",
  "source": "discord",
  "channel": "новости",
  "discord_msg_id": "1234567890"
}
```

---

## VPS — прямой доступ из Claude Code

Claude Code может напрямую деплоить на VPS через SSH. Для этого:

```bash
# Подключиться к VPS
ssh root@85.198.71.246

# Путь к API
cd /var/www/shelter-api

# Файлы
index.js          # основной API
discord-bot.js    # Discord бот (создать)
data/news.json    # новости
data/markers.json # маркеры карты

# PM2 процессы
pm2 list
pm2 restart shelter-api
pm2 restart shelter-bot
pm2 logs shelter-api --lines 20
```

### Workflow для Claude Code
1. Редактирует файлы локально (index.js, discord-bot.js)
2. Загружает на GitHub (`git push`)
3. На VPS: `curl -o /var/www/shelter-api/discord-bot.js https://raw.githubusercontent.com/AlexDff-mun/Shelter/main/discord-bot.js`
4. `pm2 restart shelter-bot`

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
- Пароль: env ADMIN_PASSWORD (задать через `pm2 set shelter-api:ADMIN_PASSWORD <YOUR_PASS>`)
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
  curl -X POST http://localhost:3000/api/auth -H "Content-Type: application/json" -d '{"password":"<YOUR_PASS>"}'
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
- [ ] **Маркеры из VPS** — GET /api/markers → map.html (сейчас localStorage) ✅ частично (загрузка работает, сохранение работает)

### 🟢 Улучшения
- [ ] **Discord → Новости и Обновления** — автоматически тянуть посты из Discord каналов на сайт:
  - Нужен Discord бот (или webhook listener) на VPS
  - Канал `#новости` → секция "Новости" на index.html
  - Канал `#обновления` → секция "Обновления" на index.html
  - Бот слушает новые сообщения → POST /api/news на VPS → index.html подтягивает через GET /api/news
  - Либо: Discord публичный канал → парсинг через Discord API (bot token нужен)
  - Хранение: /var/www/shelter-api/data/news.json
  - На index.html: секция новостей читает GET https://shelter-dayz.ru/api/news
  - Формат новости: { id, title, tag, text, date, source: 'discord' }
  - Discord Bot Token нужно получить на https://discord.com/developers
  - Установка: npm install discord.js на VPS
- [ ] **Авторизация через Steam** — вход на сайт через Steam OpenID:
  - Кнопка "Войти через Steam" на сайте (faq.html, возможно index.html)
  - Steam OpenID: GET https://steamcommunity.com/openid/login → редирект обратно на сайт
  - VPS эндпоинты: GET /api/steam/login → редирект на Steam, GET /api/steam/callback → сохранить steamId, вернуть JWT
  - После входа: показывать аватар Steam + ник в шапке сайта
  - Хранить сессию в sessionStorage (JWT с steamId, steamName, steamAvatar)
  - npm deps на VPS: openid, axios (или node-fetch)
  - Профиль Steam API: https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=STEAM_API_KEY&steamids=STEAMID
  - Steam API ключ получить на: https://steamcommunity.com/dev/apikey
  - После входа пользователь привязан к своему SteamID — все его тикеты хранятся под этим ID

- [ ] **Тикеты — переписка после обращения** — диалог между игроком и администрацией:
  - Текущий faq.html имеет форму отправки тикета (POST /api/ticket) — расширить до полноценного чата
  - Новые VPS эндпоинты:
    - GET  /api/tickets              (auth) → список тикетов пользователя (по steamId из JWT)
    - GET  /api/tickets/:id          → история сообщений тикета
    - POST /api/tickets/:id/reply    (auth) → добавить сообщение в тикет (игрок или админ)
    - PUT  /api/tickets/:id/status   (auth admin) → изменить статус (open/closed/pending)
  - Хранение: /var/www/shelter-api/data/tickets.json
  - Формат тикета: { id, steamId, steamName, topic, status, createdAt, messages: [{from, text, date}] }
  - На faq.html: после отправки тикета показывать страницу диалога с историей переписки
  - В admin.html: раздел "Тикеты" — список всех тикетов, фильтр по статусу, ответ на тикет
  - Уведомление: при ответе админа → POST Discord webhook в служебный канал

- [ ] **mechanics.html** — написать контент для вкладки "Гайды"
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
curl -X POST https://shelter-dayz.ru/api/auth -H "Content-Type: application/json" -d '{"password":"<YOUR_PASS>"}'
```
