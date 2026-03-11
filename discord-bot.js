const { Client, GatewayIntentBits } = require('discord.js');
const http = require('http');
const https = require('https');

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const API_URL = 'https://shelter-dayz.ru/api';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// ID каналов Discord
const CHANNELS = {
  '1363913152814649574': { tag: 'НОВОСТИ',          label: 'новости' },
  '1363934009859768422': { tag: 'ИЗМЕНЕНИЯ',         label: 'изменения' },
  '1421934937749327953': { tag: 'ОБНОВЛЕНИЯ МОДОВ',  label: 'обновления-модов' },
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// ─── Получить JWT токен ───────────────────────────────────────────────────────
async function getToken() {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ password: ADMIN_PASSWORD });
    const req = https.request({
      hostname: 'shelter-dayz.ru',
      path: '/api/auth',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data).token); } catch(e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Сохранить новость через API ─────────────────────────────────────────────
async function saveNews(newsItem) {
  const token = await getToken();
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(newsItem);
    const req = https.request({
      hostname: 'shelter-dayz.ru',
      path: '/api/news',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': 'Bearer ' + token,
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => { console.log('Saved news:', res.statusCode, data); resolve(); });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Форматировать сообщение Discord в новость ────────────────────────────────
function formatMessage(message, channelInfo) {
  const lines = message.content.trim().split('\n').filter(l => l.trim());
  const title = lines[0]?.replace(/[*_~`#]/g, '').trim().slice(0, 100) || 'Без названия';
  const text  = message.content.trim();
  const date  = new Date(message.createdTimestamp).toISOString().split('T')[0];

  return {
    id: `discord_${message.channelId}_${message.id}`,
    title,
    tag: channelInfo.tag,
    text,
    date,
    source: 'discord',
    channel: channelInfo.label,
    discord_msg_id: message.id,
    author: message.author?.username || 'Shelter',
    // Вложения (картинки)
    image: message.attachments?.first()?.url || null,
  };
}

// ─── Обработка нового сообщения ───────────────────────────────────────────────
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const channelInfo = CHANNELS[message.channelId];
  if (!channelInfo) return;
  if (!message.content.trim()) return;

  console.log(`[${channelInfo.label}] New message: ${message.content.slice(0, 80)}...`);

  try {
    const newsItem = formatMessage(message, channelInfo);
    await saveNews(newsItem);
    console.log(`✓ Saved to API: ${newsItem.title}`);
  } catch (err) {
    console.error('✗ Error saving news:', err.message);
  }
});

// ─── Запуск ───────────────────────────────────────────────────────────────────
client.once('ready', () => {
  console.log(`✓ Bot ready: ${client.user.tag}`);
  console.log(`  Watching channels: ${Object.keys(CHANNELS).join(', ')}`);
});

client.login(BOT_TOKEN).catch(err => {
  console.error('Login failed:', err.message);
  process.exit(1);
});
