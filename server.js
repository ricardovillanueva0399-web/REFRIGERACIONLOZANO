require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
const IG_USER_ID = process.env.IG_USER_ID;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const GRAPH_VERSION = process.env.IG_GRAPH_VERSION || 'v21.0';
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutos, para no golpear los límites de la Graph API

let cache = { data: null, fetchedAt: 0 };

async function fetchLatestPosts(limit) {
  const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp';
  const url = `https://graph.facebook.com/${GRAPH_VERSION}/${IG_USER_ID}/media?fields=${fields}&limit=${limit}&access_token=${IG_ACCESS_TOKEN}`;

  const res = await fetch(url);
  const body = await res.json();

  if (!res.ok) {
    const message = body?.error?.message || 'Error desconocido al consultar la Instagram Graph API';
    const err = new Error(message);
    err.status = res.status;
    err.details = body?.error;
    throw err;
  }

  return body.data || [];
}

app.get('/api/instagram/posts', async (req, res) => {
  if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
    return res.status(500).json({
      error: 'Faltan IG_USER_ID o IG_ACCESS_TOKEN en las variables de entorno.',
    });
  }

  const limit = Math.min(Number(req.query.limit) || 6, 25);
  const now = Date.now();

  if (cache.data && now - cache.fetchedAt < CACHE_TTL_MS) {
    return res.json({ source: 'cache', posts: cache.data.slice(0, limit) });
  }

  try {
    const posts = await fetchLatestPosts(limit);
    cache = { data: posts, fetchedAt: now };
    res.json({ source: 'live', posts });
  } catch (err) {
    if (cache.data) {
      // Si falla la llamada pero hay una versión en caché, la servimos en vez de romper el sitio
      return res.json({ source: 'stale-cache', posts: cache.data.slice(0, limit) });
    }
    res.status(err.status || 502).json({ error: err.message, details: err.details });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`API de Instagram escuchando en el puerto ${PORT}`);
});
