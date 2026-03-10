// ═══════════════════════════════════════════════════════════════
// Shelter PVE — VPS API v2
// Node.js + express + jwt + cors
// /var/www/shelter-api/index.js
//
// npm install express cors jsonwebtoken
// pm2 restart shelter-api
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const cors    = require('cors');
const jwt     = require('jsonwebtoken');
const https   = require('https');
const fs      = require('fs');
const path    = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// ─ КОНФИГ ─────────────────────────────────────────────────────
const PORT       = 3000;
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'shelter2024'; // задай через: pm2 set shelter-api:ADMIN_PASSWORD yourpass
const JWT_SECRET = process.env.JWT_SECRET     || 'shelter_jwt_secret_change_me';
const JWT_EXPIRY = '24h';
const BM_ID      = '37659741';
const MAX_PLAYERS = 50;

const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK || '';
// Установить: pm2 set shelter-api:DISCORD_WEBHOOK https://discord.com/api/webhooks/...

// ─ ХРАНИЛИЩЕ (JSON-файлы на диске) ────────────────────────────
const DATA_DIR     = path.join(__dirname, 'data');
const NEWS_FILE    = path.join(DATA_DIR, 'news.json');
const MARKERS_FILE = path.join(DATA_DIR, 'markers.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const DEFAULT_MARKERS = [
  { id:'m1', text:"Лагерь выживших",    cat:"trader",    x:7856,    z:10544, sz:true,  szr:90  },
  { id:'m2', text:"Терминал",           cat:"trader",    x:13859,   z:12789, sz:true,  szr:108 },
  { id:'m3', text:"Егерь",             cat:"trader",    x:1186,    z:6244,  sz:true,  szr:50  },
  { id:'m4', text:"Инженерный пост",   cat:"craft",     x:3092,    z:10827, sz:true,  szr:50  },
  { id:'m5', text:"Алькатрас",         cat:"danger",    x:2666,    z:1230,  sz:false, szr:0   },
  { id:'m6', text:"Радар",             cat:"danger",    x:579,     z:13173, sz:false, szr:0   },
  { id:'m7', text:"Радиация",          cat:"radiation", x:8351,    z:12765, sz:false, szr:0   },
  { id:'m8', text:"Радиация (Павлово)",cat:"radiation", x:2072,    z:3215,  sz:false, szr:0   },
];

function readJSON(file, def) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch(e) { return def; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

// ─ MIDDLEWARE JWT ──────────────────────────────────────────────
function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token  = header.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch(e) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ─ AUTH ───────────────────────────────────────────────────────
// POST /api/auth   { password }  → { token }
app.post('/api/auth', (req, res) => {
  const { password } = req.body || {};
  if (!password || password !== ADMIN_PASS) {
    return res.status(401).json({ error: 'Неверный пароль' });
  }
  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  res.json({ token, expiresIn: JWT_EXPIRY });
});

// GET /api/auth/check — проверить токен
app.get('/api/auth/check', requireAuth, (req, res) => {
  res.json({ ok: true, role: req.user.role });
});

// ─ SERVER STATUS ───────────────────────────────────────────────
// GET /api/server
app.get('/api/server', (req, res) => {
  const url = `https://api.battlemetrics.com/servers/${BM_ID}`;
  https.get(url, { headers: { 'User-Agent': 'ShelterPVE/1.0' } }, (bmRes) => {
    let body = '';
    bmRes.on('data', d => body += d);
    bmRes.on('end', () => {
      try {
        const d = JSON.parse(body);
        const a = d.data?.attributes || {};
        res.json({
          online:     a.status === 'online',
          players:    a.players    ?? 0,
          maxPlayers: a.maxPlayers ?? MAX_PLAYERS,
          rank:       a.rank       ?? null,
          status:     a.status     ?? 'unknown',
        });
      } catch(e) {
        res.json({ online: false, players: 0, maxPlayers: MAX_PLAYERS });
      }
    });
  }).on('error', () => {
    res.json({ online: false, players: 0, maxPlayers: MAX_PLAYERS });
  });
});

// ─ NEWS ───────────────────────────────────────────────────────
// GET /api/news  — публичный (для index.html)
app.get('/api/news', (req, res) => {
  const news = readJSON(NEWS_FILE, []);
  res.json(news);
});

// POST /api/news  — создать (auth)
app.post('/api/news', requireAuth, (req, res) => {
  const { title, type, date, text } = req.body || {};
  if (!title || !text) return res.status(400).json({ error: 'title and text required' });
  const news = readJSON(NEWS_FILE, []);
  const item = { id: 'n' + Date.now(), title, type: type || 'announce', date: date || new Date().toISOString().split('T')[0], text };
  news.push(item);
  writeJSON(NEWS_FILE, news);
  res.json(item);
});

// PUT /api/news/:id — обновить (auth)
app.put('/api/news/:id', requireAuth, (req, res) => {
  const news = readJSON(NEWS_FILE, []);
  const idx = news.findIndex(n => n.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'not found' });
  const { title, type, date, text } = req.body || {};
  news[idx] = { ...news[idx], title: title || news[idx].title, type: type || news[idx].type, date: date || news[idx].date, text: text || news[idx].text };
  writeJSON(NEWS_FILE, news);
  res.json(news[idx]);
});

// DELETE /api/news/:id (auth)
app.delete('/api/news/:id', requireAuth, (req, res) => {
  let news = readJSON(NEWS_FILE, []);
  const before = news.length;
  news = news.filter(n => n.id !== req.params.id);
  if (news.length === before) return res.status(404).json({ error: 'not found' });
  writeJSON(NEWS_FILE, news);
  res.json({ deleted: req.params.id });
});

// ─ MARKERS ────────────────────────────────────────────────────
// GET /api/markers — публичный
app.get('/api/markers', (req, res) => {
  res.json(readJSON(MARKERS_FILE, DEFAULT_MARKERS));
});

// POST /api/markers — сохранить весь массив (auth)
app.post('/api/markers', requireAuth, (req, res) => {
  const data = req.body;
  if (!Array.isArray(data)) return res.status(400).json({ error: 'array expected' });
  writeJSON(MARKERS_FILE, data);
  res.json({ ok: true, count: data.length });
});

// ─ TICKET (форма обращений) ────────────────────────────────────
// POST /api/ticket  { name, topic, message, contact }
app.post('/api/ticket', async (req, res) => {
  const { name, topic, message, contact } = req.body || {};
  if (!name || !message) return res.status(400).json({ error: 'name and message required' });

  if (DISCORD_WEBHOOK) {
    const payload = JSON.stringify({
      embeds: [{
        title: `🎫 Новый тикет: ${topic || 'Без темы'}`,
        color: 0xcc1f1f,
        fields: [
          { name: '👤 Игрок', value: name, inline: true },
          { name: '📌 Тема',  value: topic || 'Без темы', inline: true },
          { name: '📝 Сообщение', value: message.substring(0, 1000) },
          { name: '📬 Контакт', value: contact || 'не указан', inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'Shelter PVE' }
      }]
    });

    const url = new URL(DISCORD_WEBHOOK);
    const opts = { hostname: url.hostname, path: url.pathname + url.search, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } };
    const r = https.request(opts);
    r.on('error', () => {});
    r.write(payload);
    r.end();
  }

  res.json({ ok: true });
});

// ─ START ──────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[Shelter API v2] Running on :${PORT}`);
  console.log(`  Auth: POST /api/auth`);
  console.log(`  Server: GET /api/server`);
  console.log(`  News: GET|POST|PUT|DELETE /api/news`);
  console.log(`  Markers: GET|POST /api/markers`);
});
