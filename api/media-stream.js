import { Readable } from 'node:stream';

const TARGET = 'https://cvdlzwralgtapsigyuko.supabase.co/functions/v1/palma-media-stream';
const FORWARDED_HEADERS = [
  'accept-ranges',
  'cache-control',
  'content-disposition',
  'content-length',
  'content-range',
  'content-type',
  'etag',
  'last-modified',
];

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }
  const mediaId = String(req.query?.media_id || '').trim().slice(0, 80);
  if (!mediaId) return res.status(400).json({ error: 'missing_media_id' });
  const target = new URL(TARGET);
  target.searchParams.set('media_id', mediaId);
  if (String(req.query?.download || '') === '1') target.searchParams.set('download', '1');

  try {
    const headers = { cookie: req.headers.cookie || '' };
    if (req.headers.range) headers.range = req.headers.range;
    const upstream = await fetch(target, { method: 'GET', headers });
    res.statusCode = upstream.status;
    for (const name of FORWARDED_HEADERS) {
      const value = upstream.headers.get(name);
      if (value) res.setHeader(name, value);
    }
    if (!upstream.body) return res.end();
    const stream = Readable.fromWeb(upstream.body);
    stream.on('error', (error) => {
      console.error('media-stream-body', error?.message || String(error));
      if (!res.headersSent) res.status(502).json({ error: 'media_stream_unavailable' });
      else res.destroy(error);
    });
    return stream.pipe(res);
  } catch (error) {
    console.error('media-stream-proxy', error?.message || String(error));
    if (res.headersSent) return res.destroy(error);
    return res.status(502).json({ error: 'media_stream_unavailable' });
  }
}
