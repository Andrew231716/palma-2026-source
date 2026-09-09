const TARGET = 'https://cvdlzwralgtapsigyuko.supabase.co/functions/v1/palma-board-compat';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });
  try {
    const upstream = await fetch(TARGET, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        cookie: req.headers.cookie || '',
      },
      body: JSON.stringify(req.body || {}),
      signal: AbortSignal.timeout(30000),
    });
    const body = await upstream.text();
    const setCookie = upstream.headers.get('set-cookie');
    if (setCookie) res.setHeader('set-cookie', setCookie);
    res.status(upstream.status);
    res.setHeader('content-type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    return res.send(body);
  } catch (error) {
    console.error('board-proxy', error?.message || String(error));
    return res.status(502).json({ error: 'board_proxy_unavailable' });
  }
}
