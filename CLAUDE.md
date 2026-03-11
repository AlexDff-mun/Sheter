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
| Тайлы карты | https://shelter-dayz.ru/tiles/{z}/{x}/{y}.jpg |
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

### Схема интеграции Discord → Сайт (✅ РЕАЛИЗОВАНО)
```
Discord канал → discord.js бот на VPS → POST /api/news → data/news.json
                                                        ↓
                                         index.html GET /api/news каждые 5 мин
```

### Файл бота на VPS
- Путь: `/var/www/shelter-api/discord-bot.js`
- Запуск: `pm2 start discord-bot.js --name shelter-bot`
- Env: `DISCORD_BOT_TOKEN` через env на VPS

---

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
| `index.html` | Главная страница (счётчик игроков, новости из API, рестарт-таймер) |
| `map.html` | Интерактивная тайловая карта Leaflet + Chernarus (тайлы с VPS) |
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
- Пароль: через env `ADMIN_PASSWORD` на VPS (НЕ хранить в коде!)
- JWT_SECRET: через env `JWT_SECRET` на VPS

### Тайлы карты (nginx)
- Путь: `/var/www/shelter-api/map-tiles/`
- URL: `https://shelter-dayz.ru/tiles/{z}/{x}/{y}.jpg`
- Zoom levels: 1-6 (256×256 jpg тайлы)
- nginx location: `/tiles/` → alias на map-tiles/

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

## ✅ ВЫПОЛНЕНО

- [x] **Счётчик игроков** — API_URL исправлен на https://shelter-dayz.ru/api/server
- [x] **Discord → Новости** — бот на VPS слушает каналы, POST /api/news, index.html подтягивает
- [x] **Тайловая карта** — map.html с Leaflet, тайлы на VPS (зумы 1-6), русские названия, измерение расстояний, URL-хэш
- [x] **Маркеры из VPS** — GET /api/markers → map.html (загрузка + сохранение)
- [x] **Безопасность** — пароли убраны из репозитория

---

## ✅ ЗАДАЧИ (приоритет)

### 🔴 Критично
- [ ] **Сменить пароль на VPS** — текущий `shelter2024` утёк в публичный репо, нужно сменить:
  ```bash
  ssh root@85.198.71.246
  cd /var/www/shelter-api
  # Установить новый пароль через env
  pm2 restart shelter-api
  ```
- [ ] **faq.html** — залить обновлённый (API_TICKET исправлен)
- [ ] **admin.html** — залить обновлённый (эндпоинты /login→/auth, /verify→/auth/check)

### 🟡 Важно
- [ ] **Кнопка "Подключиться" на index.html** — комбо-кнопка:
  - Основная кнопка → `steam://run/221100/en/+connect 217.168.247.192:2312/` (запускает DayZ и подключает)
  - Под ней маленькая "📋 Скопировать IP" → копирует `217.168.247.192:2312` в буфер + тост
  - Иконка "?" → модалка с пошаговой инструкцией:
    1. Нажми "Подключиться" — DayZ запустится автоматически
    2. Если не сработало — скопируй IP
    3. Открой DayZ → Серверы → Remote → вставь IP
    4. Или используй DayZ Launcher → Direct Connect
- [ ] **Координаты населённых пунктов на карте** — некоторые названия сдвинуты, нужно уточнить по скриншотам
- [ ] **Авторизация через Steam** — вход на сайт через Steam OpenID:
  - Кнопка "Войти через Steam" в шапке сайта
  - Steam OpenID: GET https://steamcommunity.com/openid/login → редирект обратно на сайт
  - VPS эндпоинты: GET /api/steam/login → редирект на Steam, GET /api/steam/callback → сохранить steamId, вернуть JWT
  - После входа: аватар Steam + ник в шапке сайта
  - Хранить сессию в sessionStorage (JWT с steamId, steamName, steamAvatar)
  - npm deps на VPS: openid, axios
  - Steam API ключ получить на: https://steamcommunity.com/dev/apikey
  - После входа пользователь привязан к своему SteamID

### 🟢 Улучшения
- [ ] **База игроков на VPS** — хранение профилей зарегистрированных игроков:
  - Хранилище: `/var/www/shelter-api/data/players.json` (или SQLite)
  - Формат: `{ steamId, steamName, steamAvatar, firstLogin, lastLogin, role }`
  - Эндпоинты: `GET /api/player/:steamId`, `PUT /api/player/:steamId`
  - Роли: player / vip / moderator / admin
- [ ] **Личный кабинет (profile.html)** — страница профиля после авторизации:
  - Аватар, ник, SteamID
  - Мои тикеты (список + статусы)
  - Мои метки на карте (после реализации пользовательских меток)
  - Дата первого захода
  - Статус на сервере (онлайн/офлайн — если RCON будет)
- [ ] **Пользовательские метки на карте** — только после Steam-авторизации:
  - Авторизованный игрок может ставить свои метки
  - Метки привязаны к steamId
  - Группы / расшаривание меток между игроками
- [ ] **Тикеты — переписка после обращения** — диалог между игроком и администрацией:
  - Расширить POST /api/ticket до полноценного чата
  - Новые VPS эндпоинты:
    - GET  /api/tickets              (auth) → список тикетов пользователя (по steamId из JWT)
    - GET  /api/tickets/:id          → история сообщений тикета
    - POST /api/tickets/:id/reply    (auth) → добавить сообщение
    - PUT  /api/tickets/:id/status   (auth admin) → изменить статус (open/closed/pending)
  - Хранение: /var/www/shelter-api/data/tickets.json
  - Формат: { id, steamId, steamName, topic, status, createdAt, messages: [{from, text, date}] }
  - В admin.html: раздел "Тикеты" — список, фильтр по статусу, ответ
  - Уведомление: при ответе админа → POST Discord webhook
- [ ] **Админ-панель — раздел "Игроки"** — управление базой игроков:
  - Список всех зарегистрированных
  - Присвоение ролей (игрок / VIP / модератор)
  - Бан на сайте
- [ ] **mechanics.html** — написать контент для вкладки "Гайды"
- [ ] **craft.html** — добавить новые рецепты

### 🔵 Будущее
- [ ] Донат — ЮКасса + Expansion автовыдача
- [ ] Discord бот с тикет-системой
- [ ] RCON интеграция для реального онлайна
- [ ] Статистика игроков в admin.html

---

## Важные соглашения

1. **Безопасность** — НИКОГДА не хранить пароли, токены, API-ключи в коде или репозитории. Только через env на VPS
2. **Именование файлов** — snake_case для JS, kebab-case для HTML/CSS
3. **Крафт-гайд** — загружаемые HTML файлы пользователя = источник истины для названий
4. **Restart timer** — MSK UTC+3, рестарты в 03:00 / 09:00 / 15:00 / 21:00 по МСК
5. **Фавикон** — images/favicon.ico, images/icon-192.png
6. **Язык** — сайт на русском, комментарии в коде на русском

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
curl https://shelter-dayz.ru/api/news
curl https://shelter-dayz.ru/tiles/3/4/3.jpg  # проверка тайлов
```
