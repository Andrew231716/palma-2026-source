export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'method_not_allowed' });
  }
  const text = String(request.query?.text || '').trim().slice(0, 200);
  const lang = request.query?.lang === 'it' ? 'it' : 'es';
  if (!text) return response.status(400).json({ error: 'empty_text' });

  try {
    const url = new URL('https://translate.google.com/translate_tts');
    url.searchParams.set('ie', 'UTF-8');
    url.searchParams.set('client', 'tw-ob');
    url.searchParams.set('tl', lang);
    url.searchParams.set('q', text);
    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 Palma-2026' },
    });
    if (!upstream.ok) throw new Error(`tts_${upstream.status}`);
    const audio = Buffer.from(await upstream.arrayBuffer());
    response.setHeader('Content-Type', upstream.headers.get('content-type') || 'audio/mpeg');
    response.setHeader('Cache-Control', 'private, max-age=86400');
    return response.status(200).send(audio);
  } catch (error) {
    console.error('speak-proxy', error?.message || String(error));
    return response.status(502).json({ error: 'speak_unavailable' });
  }
}
