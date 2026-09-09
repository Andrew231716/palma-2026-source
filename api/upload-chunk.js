export const config = { api: { bodyParser: false } };

const TARGET = 'https://cvdlzwralgtapsigyuko.supabase.co/functions/v1/palma-upload-chunk';
const MAX_BODY = 16 * 1024 * 1024;

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new Error('chunk_too_large');
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'PUT, OPTIONS');
    return res.status(204).end();
  }
  if (req.method !== 'PUT') return res.status(405).json({ error: 'method_not_allowed' });
  const uploadUrl = String(req.headers['x-palma-upload-url'] || '').trim();
  const range = String(req.headers['content-range'] || '').trim();
  if (!uploadUrl || !range) return res.status(400).json({ error: 'missing_upload_headers' });

  try {
    const body = await readBody(req);
    const target = new URL(TARGET);
    target.searchParams.set('u', uploadUrl);
    const upstream = await fetch(target, {
      method: 'PUT',
      headers: {
        'content-type': 'application/octet-stream',
        'content-range': range,
        cookie: req.headers.cookie || '',
        origin: req.headers.origin || 'https://palma-2026.vercel.app',
      },
      body,
      signal: AbortSignal.timeout(60000),
    });
    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader('content-type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
    return res.send(text);
  } catch (error) {
    const code = error?.message === 'chunk_too_large' ? 413 : 502;
    console.error('upload-chunk-proxy', error?.message || String(error));
    return res.status(code).json({ error: error?.message || 'upload_chunk_unavailable' });
  }
}
