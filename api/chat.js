const TARGET = 'https://cvdlzwralgtapsigyuko.supabase.co/functions/v1/palmino-chat';

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
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(req.body || {}),
      signal: AbortSignal.timeout(45000),
    });
    const body = await upstream.text();
    res.status(upstream.status);
    res.setHeader('content-type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    return res.send(body);
  } catch (error) {
    console.error('chat-proxy', error?.message || String(error));
    return res.status(502).json({ error: 'chat_proxy_unavailable' });
  }
}
