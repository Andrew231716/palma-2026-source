(() => {
  window.__PALMA_CIRCLE_VERSION = '48-previews-compact-ui';

  const SUPABASE_URL = 'https://cvdlzwralgtapsigyuko.supabase.co';
  const STORAGE_URL = 'https://cvdlzwralgtapsigyuko.storage.supabase.co/storage/v1/upload/resumable/sign';
  const PUBLISHABLE_KEY = 'sb_publishable_-hqWDIWPIcHNCp4CLih94g_XKsqP29G';
  const MEDIA_URL = `${SUPABASE_URL}/functions/v1/trip-media-circle`;
  const PERSONAL_URL = `${SUPABASE_URL}/functions/v1/trip-media-personal`;
  const BUCKET = 'ricordi';
  const PAGE_SIZE = 30;
  const MAX_PICK = 250;
  const DIRECT_CHUNK = 10 * 1024 * 1024;
  const PROXY_CHUNK = 12 * 320 * 1024;
  const MOBILE_UPLOAD = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const UPLOAD_CONCURRENCY = MOBILE_UPLOAD ? 1 : 3;
  const LOCAL_PREVIEW_LIMIT = MOBILE_UPLOAD ? 0 : 8;
  const UPLOAD_HISTORY_MS = 30000;
  const META_CACHE_KEY = 'palma2026-circle-cache-v44';
  const THUMB_CACHE = 'palma2026-circle-thumbs-v1';
  const URL_TTL = 12 * 60 * 1000;
  const SORT_PREF_KEY = 'palma2026-circle-sort-v1';

  let media = [];
  let optimistic = [];
  let filter = 'all';
  let selectMode = false;
  let selected = new Set();
  let circleOverlay = null;
  let nextOffset = 0;
  let hasMore = true;
  let loading = false;
  let totalCount = 0;
  let totalBytes = 0;
  let lazyObserver = null;
  let moreObserver = null;
  let tusModulePromise = null;
  let uploadBatchQueue = [];
  let uploadBatchRunning = false;
  let uploadJobs = [];
  let uploadRenderTimer = null;
  let uploadSerial = 0;
  let sortBy = 'captured_at';
  let sortDir = 'desc';
  const urlCache = new Map();

  const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
  const bytes = (value) => {
    const size = Number(value || 0);
    if (size >= 1073741824) return `${(size / 1073741824).toFixed(1)} GB`;
    if (size >= 1048576) return `${(size / 1048576).toFixed(1)} MB`;
    if (size >= 1024) return `${Math.round(size / 1024)} KB`;
    return `${size} B`;
  };
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const dateOf = (item) => item?.captured_at || item?.created_at || new Date().toISOString();
  const groupDateOf = (item) => sortBy === 'created_at' ? (item?.created_at || dateOf(item)) : dateOf(item);
  const fmtDate = (value) => {
    try {
      return new Date(value).toLocaleString('it-IT', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });
    } catch { return ''; }
  };
  const dayLabel = (value) => {
    try {
      const date = new Date(value);
      const today = new Date();
      if (date.toDateString() === today.toDateString()) return 'Oggi';
      return date.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
    } catch { return 'Ricordi'; }
  };
  const initials = (value) => String(value || 'G').trim().split(/\s+/).slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '').join('') || 'G';
  const tripCode = () => localStorage.getItem('palma2026-trip-code') || '';
  const adminKey = () => localStorage.getItem('palma2026-onedrive-admin-key') || '';
  const displayName = () => {
    for (const key of ['palma2026-profile', 'palma2026-profile-name-draft']) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'string' && parsed.trim()) return parsed.trim();
      } catch {}
      if (raw.trim()) return raw.replace(/^"|"$/g, '').trim();
    }
    return 'Partecipante';
  };
  const clientId = () => {
    let id = localStorage.getItem('palma2026-media-client-id');
    if (!id) {
      id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      localStorage.setItem('palma2026-media-client-id', id);
    }
    return id;
  };
  const loadLocalSort = () => {
    try {
      const value = JSON.parse(localStorage.getItem(SORT_PREF_KEY) || 'null');
      if (value?.sort_by === 'created_at' || value?.sort_by === 'captured_at') sortBy = value.sort_by;
      if (value?.sort_dir === 'asc' || value?.sort_dir === 'desc') sortDir = value.sort_dir;
    } catch {}
  };
  const saveLocalSort = () => {
    try { localStorage.setItem(SORT_PREF_KEY, JSON.stringify({ sort_by: sortBy, sort_dir: sortDir })); } catch {}
  };
  loadLocalSort();
  const fileKind = (file) => {
    const mime = (file.type || '').toLowerCase();
    if (mime.startsWith('image/')) return 'image';
    if (mime.startsWith('video/')) return 'video';
    const suffix = file.name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || '';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif', 'avif', 'tif', 'tiff', 'dng', 'bmp'].includes(suffix)) return 'image';
    if (['mp4', 'mov', 'm4v', 'webm', '3gp', 'mkv', 'avi', 'mts', 'm2ts'].includes(suffix)) return 'video';
    return '';
  };
  const mediaKind = (item) => {
    const kind = String(item?.kind || '').toLowerCase();
    const mime = String(item?.mime_type || item?.mime || '').toLowerCase();
    const filename = String(item?.original_name || item?.download_name || item?.name || '').toLowerCase();
    if (kind === 'video' || mime.startsWith('video/') || /\.(mov|mp4|m4v|webm|3gp|mkv|avi|mts|m2ts)(?:$|[?#])/i.test(filename)) return 'video';
    return 'image';
  };
  const isBrowserImage = (item) => !/(heic|heif|dng|tiff?)/i.test(item?.mime_type || item?.original_name || '');

  function syncStreamSession() {
    try {
      const code = tripCode();
      const id = clientId();
      if (code) document.cookie = `palma_trip_code=${encodeURIComponent(code)}; Path=/; Max-Age=2592000; Secure; SameSite=Strict`;
      if (id) document.cookie = `palma_media_client=${encodeURIComponent(id)}; Path=/; Max-Age=2592000; Secure; SameSite=Strict`;
    } catch {}
  }

  async function mediaApi(payload) {
    const response = await fetch(MEDIA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: tripCode(), client_id: clientId(), ...payload }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.error || `http_${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }
    return data;
  }

  async function personalApi(payload) {
    const response = await fetch(PERSONAL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: tripCode(), client_id: clientId(), ...payload }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.error || `personal_${response.status}`);
      error.status = response.status;
      throw error;
    }
    return data;
  }

  async function markPersonal(item, state) {
    if (!item?.id || item.optimistic) return;
    const field = state === 'downloaded' ? 'downloaded' : 'viewed';
    const atField = field === 'downloaded' ? 'downloaded_at' : 'viewed_at';
    const now = new Date().toISOString();
    item[field] = true; item[atField] = item[atField] || now;
    const base = media.find((row) => row.id === item.id);
    if (base) { base[field] = true; base[atField] = base[atField] || now; }
    render();
    try { const data = await personalApi({ op: 'state_mark', media_id: item.id, state: field }); if (data?.[atField]) { item[atField] = data[atField]; if (base) base[atField] = data[atField]; } } catch (error) { console.error('Ricordi stato personale', error); }
  }

  async function mediaApiRetry(payload, attempts = 3) {
    let last = null;
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      try {
        return await mediaApi(payload);
      } catch (error) {
        last = error;
        const status = Number(error?.status || 0);
        const transient = !status || [408, 425, 429, 500, 502, 503, 504].includes(status);
        if (!transient || attempt === attempts - 1) throw error;
        await delay(500 * (2 ** attempt));
      }
    }
    throw last || new Error('media_api_failed');
  }

  function toast(message, type = 'ok') {
    let item = document.querySelector('.pc-toast');
    if (!item) {
      item = document.createElement('div');
      item.className = 'pc-toast';
      document.body.appendChild(item);
    }
    item.textContent = message;
    item.dataset.type = type;
    item.classList.add('show');
    clearTimeout(item._timer);
    item._timer = setTimeout(() => item.classList.remove('show'), 2800);
  }

  function overlay(html, className = '') {
    const element = document.createElement('div');
    element.className = `pc-overlay ${className}`;
    element.innerHTML = html;
    document.body.appendChild(element);
    const close = () => element.remove();
    element.addEventListener('click', (event) => {
      if (event.target === element && element.classList.contains('pc-dialog-wrap')) close();
    });
    element.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', close));
    return { o: element, close };
  }

  function readMediaCache() {
    try {
      const cache = JSON.parse(localStorage.getItem(META_CACHE_KEY) || 'null');
      if (cache?.code === tripCode() && cache?.sort_by === sortBy && cache?.sort_dir === sortDir && Array.isArray(cache.media) && Date.now() - Number(cache.at || 0) < 24 * 60 * 60 * 1000) {
        media = cache.media;
        totalCount = Number(cache.total_count || media.length);
        totalBytes = Number(cache.total_bytes || 0);
        nextOffset = media.length;
        hasMore = media.length < totalCount;
        return true;
      }
    } catch {}
    return false;
  }

  function writeMediaCache() {
    if (filter !== 'all') return;
    try {
      localStorage.setItem(META_CACHE_KEY, JSON.stringify({
        code: tripCode(),
        at: Date.now(),
        media: media.slice(0, 150),
        total_count: totalCount,
        total_bytes: totalBytes,
        sort_by: sortBy,
        sort_dir: sortDir,
      }));
    } catch {}
  }

  async function fresh(item, force = false) {
    if (!item?.id || item.optimistic) return item;
    const cached = urlCache.get(item.id);
    if (!force && cached && Date.now() - cached.at < URL_TTL) return { ...item, ...cached.value };
    const data = await mediaApi({ op: 'media_url', media_id: item.id });
    const value = {
      provider: data.provider || item.provider,
      url: data.url || item.url,
      stream_url: data.stream_url || data.url || item.stream_url,
      download_url: data.download_url || data.url || item.download_url,
      thumb_url: data.thumb_url || item.thumb_url,
      kind: data.kind || item.kind,
      mime_type: data.mime || item.mime_type,
      download_name: data.name || item.download_name,
      width: data.width || item.width,
      height: data.height || item.height,
      duration_ms: data.duration_ms || item.duration_ms,
    };
    urlCache.set(item.id, { at: Date.now(), value });
    return { ...item, ...value };
  }

  async function load(reset = false) {
    if (loading || (!reset && !hasMore)) return;
    loading = true;
    const status = circleOverlay?.querySelector('.pc-status');
    if (status) status.textContent = reset && !media.length ? 'Carico l’album…' : 'Aggiorno i ricordi…';
    try {
      const offset = reset ? 0 : nextOffset;
      const data = await personalApi({
        op: 'media_list',
        offset,
        limit: PAGE_SIZE,
        kind: filter === 'all' ? '' : filter,
        sort_by: sortBy,
        sort_dir: sortDir,
      });
      const page = data.media || [];
      if (reset) media = page;
      else {
        const known = new Set(media.map((item) => item.id));
        media = [...media, ...page.filter((item) => !known.has(item.id))];
      }
      nextOffset = Number(data.next_offset ?? (offset + page.length));
      hasMore = Boolean(data.has_more);
      totalCount = Number(data.total_count ?? media.length);
      totalBytes = Number(data.total_bytes || 0);
      writeMediaCache();
      render();
      renderMembers();
      if (status) status.textContent = `${totalCount} ${totalCount === 1 ? 'ricordo' : 'ricordi'} · ${bytes(totalBytes)} · anteprime CDN`;
      schedulePrefetch();
    } catch (error) {
      if (status) status.textContent = media.length ? 'Mostro l’ultima versione salvata' : 'Album non disponibile';
      if (circleOverlay && !media.length) {
        const grid = circleOverlay.querySelector('.pc-grid');
        if (grid) grid.innerHTML = '<div class="pc-empty"><div>☁️</div><strong>Album non disponibile</strong><span>Controlla la connessione e riprova.</span><button data-retry>Riprova</button></div>';
        grid?.querySelector('[data-retry]')?.addEventListener('click', () => load(true));
      }
    } finally {
      loading = false;
    }
  }

  const filteredMedia = () => [...optimistic.filter((item) => !item.failed), ...media]
    .filter((item) => filter === 'all' || mediaKind(item) === filter);
  const reactionText = (item) => Object.entries(item.reactions || {}).sort((a, b) => b[1] - a[1]).slice(0, 2)
    .map(([emoji, count]) => `${emoji}${count > 1 ? count : ''}`).join(' ');

  async function cachedThumb(img) {
    if (!img?.isConnected) return;
    const src = img.dataset.src || '';
    if (!src) return;
    if (img.tagName === 'VIDEO') {
      img.src = src;
      img.load();
      return;
    }
    if (src.startsWith('blob:') || src.startsWith('data:')) {
      img.src = src;
      return;
    }
    const version = encodeURIComponent(img.dataset.version || src.slice(-64));
    const cacheKey = new Request(`${location.origin}/__palma_thumb/${encodeURIComponent(img.dataset.id || '')}?v=${version}`);
    try {
      if ('caches' in window) {
        const cache = await caches.open(THUMB_CACHE);
        const hit = await cache.match(cacheKey);
        if (hit) {
          const blob = await hit.blob();
          const objectUrl = URL.createObjectURL(blob);
          img.src = objectUrl;
          img.addEventListener('load', () => URL.revokeObjectURL(objectUrl), { once: true });
          return;
        }
        const response = await fetch(src, { cache: 'force-cache' });
        if (response.ok) {
          await cache.put(cacheKey, response.clone());
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          img.src = objectUrl;
          img.addEventListener('load', () => URL.revokeObjectURL(objectUrl), { once: true });
          return;
        }
      }
    } catch {}
    img.src = src;
  }

  function wireLazyImages(grid) {
    lazyObserver?.disconnect();
    const images = [...grid.querySelectorAll('img[data-src],video[data-src]')];
    const reveal = (img) => {
      img.removeAttribute('data-lazy');
      void cachedThumb(img);
    };
    if (!('IntersectionObserver' in window)) {
      images.forEach(reveal);
      return;
    }
    lazyObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        lazyObserver.unobserve(entry.target);
        reveal(entry.target);
      });
    }, { root: circleOverlay?.querySelector('.pc-gallery-scroll') || null, rootMargin: '520px 0px' });
    images.forEach((img) => lazyObserver.observe(img));
  }

  function wireLoadMore(grid) {
    moreObserver?.disconnect();
    const sentinel = grid.querySelector('[data-more]');
    if (!sentinel || !hasMore) return;
    const next = () => {
      if (!loading) void load(false);
    };
    sentinel.addEventListener('click', next);
    if ('IntersectionObserver' in window) {
      moreObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) next();
      }, { root: circleOverlay?.querySelector('.pc-gallery-scroll') || null, rootMargin: '700px 0px' });
      moreObserver.observe(sentinel);
    }
  }

  function render() {
    if (!circleOverlay) return;
    const grid = circleOverlay.querySelector('.pc-grid');
    if (!grid) return;
    const items = filteredMedia();
    if (!items.length) {
      grid.innerHTML = '<div class="pc-empty"><div>📷</div><strong>Nessun ricordo</strong><span>Tocca Aggiungi per iniziare l’album condiviso.</span></div>';
      return;
    }
    const counts = new Map();
    items.forEach((item) => {
      const label = dayLabel(groupDateOf(item));
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    let html = '';
    let previousDay = '';
    for (const item of items) {
      const label = dayLabel(groupDateOf(item));
      if (label !== previousDay) {
        previousDay = label;
        html += `<div class="pc-day"><strong>${esc(label)}</strong><span>${counts.get(label) || 0}</span></div>`;
      }
      const persistedIndex = media.findIndex((row) => row.id === item.id);
      const selectedNow = selected.has(item.id);
      const kind = mediaKind(item);
      const thumb = item.thumb_url || item.url || '';
      const videoOriginal = kind === 'video' && !item.thumb_url && !!item.url;
      const tileMedia = thumb
        ? (videoOriginal
          ? `<video data-lazy data-src="${esc(thumb)}" data-id="${esc(item.id)}" data-version="${esc(item.path || item.captured_at || '')}" muted playsinline preload="metadata" aria-hidden="true" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"></video><div class="pc-fallback" style="display:none">▶</div>`
          : `<img data-lazy data-src="${esc(thumb)}" data-id="${esc(item.id)}" data-version="${esc(item.thumb_path || item.path || item.captured_at || '')}" loading="lazy" decoding="async" alt="" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><div class="pc-fallback" style="display:none">${kind === 'video' ? '▶' : '📷'}</div>`)
        : `<div class="pc-fallback">${kind === 'video' ? '▶' : '📷'}</div>`;
      html += `<button class="pc-tile ${selectedNow ? 'selected' : ''} ${item.optimistic ? 'uploading' : ''} ${item.failed ? 'failed' : ''}" data-id="${esc(item.id)}" data-i="${persistedIndex}">
        <div class="pc-tile-media">
          ${tileMedia}
          ${kind === 'video' ? '<span class="pc-video">▶</span>' : ''}
          ${selectMode && !item.optimistic ? `<span class="pc-check">${selectedNow ? '✓' : ''}</span>` : ''}
          ${!selectMode && !item.optimistic && (item.viewed || item.downloaded) ? `<span class="pc-state-stack">${item.viewed ? '<i>👁 Visto</i>' : ''}${item.downloaded ? '<i>↓ Scaricato</i>' : ''}</span>` : ''}
          ${item.optimistic ? `<span class="pc-uploading-badge ${item.duplicate ? 'duplicate' : ''}">${item.duplicate ? '✓ Già presente' : 'Caricamento…'}</span>` : ''}
        </div>
        <div class="pc-tile-meta"><span class="pc-avatar">${esc(initials(item.uploader_name))}</span>${item.comments_count ? `<span>💬 ${item.comments_count}</span>` : ''}${reactionText(item) ? `<span>${esc(reactionText(item))}</span>` : ''}</div>
      </button>`;
    }
    if (hasMore && !optimistic.length) {
      html += `<button class="pc-more" data-more>${loading ? 'Carico…' : 'Carica altri ricordi'}</button>`;
    }
    grid.innerHTML = html;
    grid.onclick = (event) => {
      const button = event.target.closest('.pc-tile');
      if (!button) return;
      const item = filteredMedia().find((row) => row.id === button.dataset.id);
      if (!item) return;
      if (item.optimistic) {
        toast(item.failed ? 'Questo file non è stato caricato' : 'Caricamento in corso…', item.failed ? 'error' : 'ok');
        return;
      }
      if (selectMode) {
        selected.has(item.id) ? selected.delete(item.id) : selected.add(item.id);
        render();
        updateSelectBar();
      } else {
        const index = media.findIndex((row) => row.id === item.id);
        openViewer(index);
      }
    };
    wireLazyImages(grid);
    wireLoadMore(grid);
  }

  function renderMembers() {
    if (!circleOverlay) return;
    const box = circleOverlay.querySelector('.pc-members');
    if (!box) return;
    const names = [...new Set(media.map((item) => item.uploader_name).filter(Boolean))];
    box.innerHTML = `<div class="pc-avatars">${names.slice(0, 5).map((person) => `<span title="${esc(person)}">${esc(initials(person))}</span>`).join('')}${names.length > 5 ? `<span>+${names.length - 5}</span>` : ''}</div><div><strong>${names.length || 1} ${names.length === 1 ? 'persona' : 'persone'}</strong><span>Album privato del viaggio</span></div>`;
  }

  function updateSelectBar() {
    if (!circleOverlay) return;
    const bar = circleOverlay.querySelector('.pc-selectbar');
    bar.classList.toggle('show', selectMode);
    circleOverlay.querySelector('.pc-uploadbar')?.classList.toggle('hidden', selectMode);
    bar.querySelector('strong').textContent = `${selected.size} selezionati`;
    circleOverlay.querySelector('[data-select]').textContent = selectMode ? 'Fine' : 'Seleziona';
  }

  function schedulePrefetch() {
    const run = () => {
      const candidates = media.slice(0, 15);
      candidates.forEach((item) => {
        const img = document.querySelector(`img[data-id="${CSS.escape(item.id)}"],video[data-id="${CSS.escape(item.id)}"]`);
        if (img && !img.getAttribute('src')) void cachedThumb(img);
      });
    };
    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 1000 });
    else setTimeout(run, 120);
  }

  function saveBlob(blob, filename, mime) {
    const file = new File([blob], filename, { type: mime || blob.type || 'application/octet-stream' });
    const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isiOS && navigator.share && navigator.canShare?.({ files: [file] })) {
      return navigator.share({ files: [file], title: filename });
    }
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 300000);
    return Promise.resolve();
  }

  async function downloadOne(item) {
    const filename = item.download_name || item.original_name || 'Palma-2026';
    let sourceItem = item;
    try { sourceItem = await fresh(item, true); } catch {}
    syncStreamSession();
    const src = sourceItem.provider === 'onedrive'
      ? `/api/media-stream?media_id=${encodeURIComponent(item.id)}&download=1`
      : sourceItem.download_url || sourceItem.url;
    if (!src) throw new Error('no_url');

    const nativeFallback = () => {
      const anchor = document.createElement('a');
      anchor.href = src;
      anchor.download = filename;
      anchor.target = '_blank';
      anchor.rel = 'noopener';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    };

    if (Number(item.size_bytes || 0) > 300 * 1024 * 1024) {
      nativeFallback();
      void markPersonal(item, 'downloaded');
      toast('Download avviato nel browser');
      return;
    }

    const controller = new AbortController();
    const { o, close } = overlay(`<section class="pc-download"><button data-close aria-label="Chiudi">✕</button><div class="pc-download-icon">↓</div><strong>${esc(filename)}</strong><span data-download-label>Preparo il file…</span><div class="pc-download-track"><b></b></div><small>0%</small></section>`, 'pc-dialog-wrap');
    o.querySelector('[data-close]').addEventListener('click', () => controller.abort(), { once: true });
    try {
      const response = await fetch(src, { signal: controller.signal });
      if (!response.ok) throw new Error(`download_${response.status}`);
      const total = Number(response.headers.get('content-length') || item.size_bytes || 0);
      const reader = response.body?.getReader();
      if (!reader) {
        const blob = await response.blob();
        await saveBlob(blob, filename, sourceItem.mime_type);
        void markPersonal(item, 'downloaded');
        close();
        return;
      }
      const chunks = [];
      let loaded = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.byteLength;
        const percent = total ? Math.min(100, Math.round(loaded / total * 100)) : 0;
        o.querySelector('.pc-download-track b').style.width = total ? `${percent}%` : '38%';
        o.querySelector('small').textContent = total ? `${percent}%` : bytes(loaded);
        o.querySelector('[data-download-label]').textContent = `Scarico ${bytes(loaded)}${total ? ` di ${bytes(total)}` : ''}`;
      }
      await saveBlob(new Blob(chunks, { type: sourceItem.mime_type || 'application/octet-stream' }), filename, sourceItem.mime_type);
      void markPersonal(item, 'downloaded');
      close();
    } catch (error) {
      close();
      if (error?.name === 'AbortError') return;
      nativeFallback();
      void markPersonal(item, 'downloaded');
      toast('Download avviato nel browser');
    }
  }

  async function shareOne(item) {
    const current = await fresh(item);
    const url = current.url || current.download_url;
    if (!url) throw new Error('no_url');
    const filename = current.download_name || current.original_name || 'Palma-2026';
    try {
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        const file = new File([blob], filename, { type: current.mime_type || blob.type });
        if (navigator.canShare?.({ files: [file] }) && navigator.share) {
          await navigator.share({ files: [file], title: 'Palma 2026' });
          return;
        }
      }
    } catch {}
    if (navigator.share) await navigator.share({ title: 'Palma 2026', text: current.caption || 'Un ricordo di Palma 2026', url });
    else {
      await navigator.clipboard.writeText(url);
      toast('Link temporaneo copiato');
    }
  }

  async function downloadSelected() {
    const items = media.filter((item) => selected.has(item.id));
    if (!items.length) return;
    for (let index = 0; index < items.length; index += 1) {
      toast(`File ${index + 1} di ${items.length}`);
      try { await downloadOne(items[index]); } catch { toast('Download non riuscito', 'error'); }
    }
  }

  function openViewer(index) {
    let item = media[index];
    if (!item) return;
    if (!item.viewed) void markPersonal(item, 'viewed');
    const video = mediaKind(item) === 'video';
    const display = item.thumb_url || (isBrowserImage(item) ? item.url : '');
    const reactions = ['❤️', '😍', '😂', '👍', '🎉', '😮'];
    const canEdit = item.can_delete || !!adminKey();
    const { o, close } = overlay(`<div class="pc-view" role="dialog" aria-modal="true" aria-label="Ricordo a schermo intero">
      <header><button data-close aria-label="Indietro">‹</button><div><span>${esc(item.uploader_name || 'Gruppo')}</span><small>${esc(fmtDate(dateOf(item)))}</small></div><button data-more-menu aria-label="Altre azioni">•••</button></header>
      <main class="pc-stage">
        ${video
          ? `<video poster="${esc(display || '')}" controls playsinline webkit-playsinline preload="metadata" controlslist="nodownload noplaybackrate"></video><button class="pc-preview-play" data-play-preview><span>▶</span><b>Riproduci</b><small>Streaming · l’originale resta protetto</small></button><div class="pc-video-loading">Caricamento video…</div><div class="pc-video-error"><div>🎬</div><strong>Anteprima video non disponibile</strong><span>Puoi comunque scaricare il file originale.</span></div>`
          : `<img src="${esc(display || '')}" alt="${esc(item.caption || item.original_name || 'Foto')}">`}
        <button class="pc-prev" data-prev aria-label="Precedente">‹</button><button class="pc-next" data-next aria-label="Successivo">›</button>
      </main>
      <section class="pc-caption">${item.caption ? `<p>${esc(item.caption)}</p>` : ''}<div class="pc-reaction-summary">${reactionText(item) || ''}</div></section>
      <nav class="pc-actions"><button data-react>${item.my_reaction || '☺︎'}<span>Reagisci</span></button><button data-comments>💬<span>Commenti ${item.comments_count || ''}</span></button><button data-download>↓<span>Scarica</span></button><button data-share>↗<span>Condividi</span></button></nav>
      <div class="pc-react-pop">${reactions.map((emoji) => `<button data-emoji="${emoji}">${emoji}</button>`).join('')}</div>
      <div class="pc-menu"><button data-caption ${canEdit ? '' : 'disabled'}>✏️ Modifica didascalia</button><button data-delete ${canEdit ? '' : 'disabled'}>🗑 Elimina dal Circle</button></div>
    </div>`, 'pc-view-wrap');

    const videoElement = o.querySelector('video');
    const playButton = o.querySelector('[data-play-preview]');
    const loadingLabel = o.querySelector('.pc-video-loading');
    const failVideo = () => {
      if (loadingLabel) loadingLabel.style.display = 'none';
      if (playButton) playButton.style.display = 'none';
      const error = o.querySelector('.pc-video-error');
      if (error) error.style.display = 'flex';
    };

    if (videoElement) {
      if (item.provider === 'onedrive') {
        syncStreamSession();
        videoElement.src = `/api/media-stream?media_id=${encodeURIComponent(item.id)}`;
        videoElement.load();
      } else {
        void fresh(item).then((current) => {
          item = current;
          videoElement.src = current.stream_url || current.url || '';
          videoElement.load();
        }).catch(failVideo);
      }
      videoElement.addEventListener('error', failVideo);
      videoElement.addEventListener('playing', () => {
        if (playButton) playButton.style.display = 'none';
        if (loadingLabel) loadingLabel.style.display = 'none';
        const error = o.querySelector('.pc-video-error');
        if (error) error.style.display = 'none';
      });
      playButton.onclick = async () => {
        playButton.disabled = true;
        if (loadingLabel) loadingLabel.style.display = 'block';
        try { await videoElement.play(); }
        catch { failVideo(); }
        finally { playButton.disabled = false; }
      };
    } else {
      void fresh(item).then((current) => {
        item = current;
        const image = o.querySelector('.pc-stage img');
        if (image && (current.url || current.thumb_url)) image.src = current.url || current.thumb_url;
      }).catch(() => {});
    }

    const go = (direction) => {
      const items = media.filter((row) => filter === 'all' || mediaKind(row) === filter);
      const position = items.findIndex((row) => row.id === item.id);
      const next = items[(position + direction + items.length) % items.length];
      close();
      openViewer(media.findIndex((row) => row.id === next.id));
    };
    o.querySelector('[data-prev]').onclick = () => go(-1);
    o.querySelector('[data-next]').onclick = () => go(1);
    let startX = 0;
    o.querySelector('.pc-stage').addEventListener('touchstart', (event) => { startX = event.touches[0].clientX; }, { passive: true });
    o.querySelector('.pc-stage').addEventListener('touchend', (event) => {
      const delta = event.changedTouches[0].clientX - startX;
      if (Math.abs(delta) > 70) go(delta < 0 ? 1 : -1);
    }, { passive: true });
    o.querySelector('[data-download]').onclick = async () => {
      try { await downloadOne(item); } catch { toast('Download non riuscito', 'error'); }
    };
    o.querySelector('[data-share]').onclick = async () => {
      try { await shareOne(item); } catch (error) { if (error?.name !== 'AbortError') toast('Condivisione non riuscita', 'error'); }
    };
    o.querySelector('[data-react]').onclick = () => o.querySelector('.pc-react-pop').classList.toggle('show');
    o.querySelectorAll('[data-emoji]').forEach((button) => {
      button.onclick = () => {
        const previous = item.my_reaction || '';
        const emoji = button.dataset.emoji === previous ? '' : button.dataset.emoji;
        item.my_reaction = emoji;
        const base = media.find((row) => row.id === item.id);
        if (base) base.my_reaction = emoji;
        o.querySelector('[data-react]').childNodes[0].nodeValue = emoji || '☺︎';
        o.querySelector('.pc-react-pop').classList.remove('show');
        void mediaApi({ op: 'reaction_set', media_id: item.id, emoji, display_name: displayName() }).catch(() => {
          item.my_reaction = previous;
          if (base) base.my_reaction = previous;
          o.querySelector('[data-react]').childNodes[0].nodeValue = previous || '☺︎';
          toast('Reazione non salvata', 'error');
        });
      };
    });
    o.querySelector('[data-comments]').onclick = () => openComments(item);
    o.querySelector('[data-more-menu]').onclick = () => o.querySelector('.pc-menu').classList.toggle('show');
    o.querySelector('[data-caption]')?.addEventListener('click', async () => {
      const caption = prompt('Didascalia', item.caption || '');
      if (caption === null) return;
      try {
        await mediaApi({ op: 'caption_update', media_id: item.id, caption, admin_key: adminKey() });
        toast('Didascalia aggiornata');
        close();
        await load(true);
      } catch { toast('Non puoi modificare questo contenuto', 'error'); }
    });
    o.querySelector('[data-delete]')?.addEventListener('click', async () => {
      if (!confirm('Eliminare questo ricordo per il gruppo?')) return;
      try {
        await mediaApi({ op: 'media_delete', media_id: item.id, admin_key: adminKey() });
        close();
        toast('Ricordo eliminato');
        await load(true);
      } catch { toast('Non puoi eliminare questo contenuto', 'error'); }
    });
  }

  function openComments(item) {
    const { o } = overlay(`<div class="pc-comments"><header><div><strong>Commenti</strong><span>${esc(item.caption || item.original_name || 'Ricordo')}</span></div><button data-close>✕</button></header><div class="pc-comment-list"><div class="pc-no-comments">Carico i commenti…</div></div><form><input maxlength="500" placeholder="Scrivi un commento…"><button aria-label="Invia">➤</button></form></div>`, 'pc-dialog-wrap');
    const list = o.querySelector('.pc-comment-list');
    const paint = (data) => {
      list.innerHTML = (data.comments || []).map((comment) => `<div class="pc-comment"><span class="pc-avatar">${esc(initials(comment.display_name))}</span><div><strong>${esc(comment.display_name || 'Partecipante')}</strong><p>${esc(comment.body)}</p><small>${esc(fmtDate(comment.created_at))}</small></div>${comment.is_mine ? `<button data-del-comment="${esc(comment.id)}">✕</button>` : ''}</div>`).join('') || '<div class="pc-no-comments">Ancora nessun commento.</div>';
      list.querySelectorAll('[data-del-comment]').forEach((button) => {
        button.onclick = () => {
          button.disabled = true;
          void mediaApi({ op: 'comment_delete', comment_id: button.dataset.delComment, admin_key: adminKey() })
            .then(refresh).catch(() => { button.disabled = false; toast('Non puoi eliminare il commento', 'error'); });
        };
      });
    };
    const refresh = async () => {
      try { paint(await mediaApi({ op: 'comment_list', media_id: item.id })); }
      catch { list.innerHTML = '<div class="pc-no-comments">Commenti non disponibili.</div>'; }
    };
    void refresh();
    o.querySelector('form').onsubmit = (event) => {
      event.preventDefault();
      const input = o.querySelector('input');
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      const temporary = document.createElement('div');
      temporary.className = 'pc-comment';
      temporary.innerHTML = `<span class="pc-avatar">${esc(initials(displayName()))}</span><div><strong>${esc(displayName())}</strong><p>${esc(text)}</p><small>Invio…</small></div>`;
      list.appendChild(temporary);
      void mediaApi({ op: 'comment_add', media_id: item.id, body: text, display_name: displayName() })
        .then(refresh).catch(() => { temporary.remove(); toast('Commento non inviato', 'error'); });
    };
  }

  function canvasBlob(canvas, quality = 0.74) {
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
  }

  async function imageThumbnail(file) {
    let source;
    let cleanup = () => {};
    try {
      if ('createImageBitmap' in window) source = await createImageBitmap(file, { imageOrientation: 'from-image' });
      else throw new Error('bitmap_unavailable');
    } catch {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.src = url;
      await image.decode();
      source = image;
      cleanup = () => URL.revokeObjectURL(url);
    }
    const width = source.width || source.videoWidth;
    const height = source.height || source.videoHeight;
    const scale = Math.min(1, 640 / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    canvas.getContext('2d', { alpha: false }).drawImage(source, 0, 0, canvas.width, canvas.height);
    const blob = await canvasBlob(canvas);
    source.close?.();
    cleanup();
    return { blob, width, height, duration_ms: null };
  }

  async function videoThumbnail(file) {
    const url = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.src = url;
    const once = (event) => new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('video_thumb_timeout')), 10000);
      video.addEventListener(event, () => { clearTimeout(timer); resolve(); }, { once: true });
      video.addEventListener('error', () => { clearTimeout(timer); reject(new Error('video_thumb_error')); }, { once: true });
    });
    try {
      await once('loadedmetadata');
      if (Number.isFinite(video.duration) && video.duration > 0.2) {
        video.currentTime = Math.min(1, video.duration * 0.08);
        await once('seeked');
      } else {
        await once('loadeddata');
      }
      const width = video.videoWidth;
      const height = video.videoHeight;
      if (!width || !height) throw new Error('video_dimensions');
      const scale = Math.min(1, 640 / Math.max(width, height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      canvas.getContext('2d', { alpha: false }).drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await canvasBlob(canvas, 0.7);
      return { blob, width, height, duration_ms: Math.round((video.duration || 0) * 1000) || null };
    } finally {
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(url);
    }
  }

  async function makeThumbnail(file) {
    try {
      return fileKind(file) === 'video' ? await videoThumbnail(file) : await imageThumbnail(file);
    } catch {
      return { blob: null, width: null, height: null, duration_ms: null };
    }
  }

  function loadTus() {
    if (window.tus?.Upload) return Promise.resolve(window.tus);
    if (tusModulePromise) return tusModulePromise;
    tusModulePromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-palma-tus]');
      const script = existing || document.createElement('script');
      const ready = () => window.tus?.Upload
        ? resolve(window.tus)
        : reject(new Error('upload_component_missing'));
      script.addEventListener('load', ready, { once: true });
      script.addEventListener('error', () => reject(new Error('upload_component_missing')), { once: true });
      if (!existing) {
        script.src = '/vendor/dist/tus.min.js?v=431';
        script.dataset.palmaTus = 'true';
        document.head.appendChild(script);
      } else if (window.tus?.Upload) ready();
    }).catch((error) => {
      tusModulePromise = null;
      throw error;
    });
    return tusModulePromise;
  }

  async function tusUpload(file, path, token, contentType, onProgress = () => {}) {
    const { Upload } = await loadTus();
    return new Promise((resolve, reject) => {
      const upload = new Upload(file, {
        endpoint: STORAGE_URL,
        retryDelays: [0, 1000, 3000, 5000, 10000],
        headers: { 'x-signature': token, apikey: PUBLISHABLE_KEY },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        chunkSize: 6 * 1024 * 1024,
        metadata: {
          bucketName: BUCKET,
          objectName: path,
          contentType: contentType || file.type || 'application/octet-stream',
          cacheControl: '31536000',
        },
        onError: reject,
        onProgress: (uploaded, total) => onProgress(total ? Math.round(uploaded / total * 100) : 0),
        onSuccess: () => resolve(upload.url),
      });
      upload.findPreviousUploads()
        .then((previous) => {
          if (previous.length) upload.resumeFromPreviousUpload(previous[0]);
          upload.start();
        })
        .catch(reject);
    });
  }

  async function directOneDriveChunk(preparation, file, start, end) {
    const range = `bytes ${start}-${end - 1}/${file.size}`;
    let last;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await fetch(preparation.upload_url, {
          method: 'PUT',
          headers: { 'Content-Range': range },
          body: file.slice(start, end),
        });
        const data = await response.json().catch(() => ({}));
        if ([200, 201, 202].includes(response.status)) return { status: response.status, data };
        last = new Error(data?.error?.message || data?.error || `onedrive_${response.status}`);
        last.status = response.status;
        if (![408, 429, 500, 502, 503, 504].includes(response.status)) throw last;
      } catch (error) {
        last = error;
        if (error instanceof TypeError) { last.cors = true; break; }
        if (attempt === 2 || (!([408, 429, 500, 502, 503, 504].includes(Number(error?.status))) && error?.status)) throw error;
      }
      await delay(500 * 2 ** attempt);
    }
    throw last || new Error('upload_direct_failed');
  }

  async function proxyOneDriveChunk(preparation, file, start, end) {
    const range = `bytes ${start}-${end - 1}/${file.size}`;
    let last;
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const response = await fetch('/api/upload-chunk', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Range': range,
            'X-Palma-Upload-Url': preparation.upload_url,
          },
          body: file.slice(start, end),
        });
        const data = await response.json().catch(() => ({}));
        if ([200, 201, 202].includes(response.status)) return { status: response.status, data };
        last = new Error(data?.error?.message || data?.error || `onedrive_${response.status}`);
        last.status = response.status;
        if (![408, 429, 500, 502, 503, 504].includes(response.status)) throw last;
      } catch (error) {
        last = error;
        if (attempt === 2 || (!([408, 429, 500, 502, 503, 504].includes(Number(error?.status))) && error?.status)) throw error;
      }
      await delay(650 * 2 ** attempt);
    }
    throw last || new Error('upload_proxy_failed');
  }

  async function uploadOneDrive(preparation, file, onProgress) {
    let start = 0;
    let final = null;
    let mode = 'direct';
    while (start < file.size) {
      const size = mode === 'direct' ? DIRECT_CHUNK : PROXY_CHUNK;
      const end = Math.min(start + size, file.size);
      try {
        const output = mode === 'direct'
          ? await directOneDriveChunk(preparation, file, start, end)
          : await proxyOneDriveChunk(preparation, file, start, end);
        if (output.status === 200 || output.status === 201) final = output.data;
        start = end;
        onProgress(Math.round(start / file.size * 100));
      } catch (error) {
        if (mode === 'direct' && (error?.cors || error instanceof TypeError)) {
          mode = 'proxy';
          continue;
        }
        throw error;
      }
    }
    if (!final?.id) throw new Error('missing_item');
    return final;
  }

  function scheduleUploadPanel() {
    if (uploadRenderTimer) return;
    uploadRenderTimer = setTimeout(() => {
      uploadRenderTimer = null;
      renderUploadPanel();
    }, 120);
  }

  function progress(job, percent, label) {
    if (!job) return;
    job.percent = Math.max(0, Math.min(100, Number(percent || 0)));
    if (label) job.label = label;
    scheduleUploadPanel();
  }

  async function uploadOne(file, job) {
    progress(job, 0, 'Preparo…');
    const preparation = await mediaApiRetry({
      op: 'prepare_upload',
      name: file.name,
      mime: file.type || 'application/octet-stream',
      size: file.size,
      kind: fileKind(file),
      display_name: displayName(),
      captured_at: file.lastModified ? new Date(file.lastModified).toISOString() : null,
    });
    if (preparation.duplicate) {
      progress(job, 100, '✓ Già presente');
      return { duplicate: true, media_id: preparation.media_id };
    }

    const thumbnail = preparation.provider === 'supabase'
      ? await makeThumbnail(file)
      : { blob: null, width: null, height: null, duration_ms: null };

    const thumbnailUpload = thumbnail.blob && preparation.thumb_token
      ? tusUpload(thumbnail.blob, preparation.thumb_path, preparation.thumb_token, 'image/webp')
      : Promise.resolve();
    let finalItem = null;
    const originalUpload = preparation.provider === 'supabase'
      ? tusUpload(file, preparation.upload_path, preparation.upload_token, preparation.mime || file.type,
        (percent) => progress(job, percent, `Carico ${percent}%`))
      : uploadOneDrive(preparation, file,
        (percent) => progress(job, percent, `Carico ${percent}%`)).then((item) => { finalItem = item; });
    await Promise.all([originalUpload, thumbnailUpload]);
    progress(job, 100, 'Registro nel Circle…');
    await mediaApiRetry({
      op: 'commit_upload',
      provider: preparation.provider,
      media_id: preparation.media_id,
      path: preparation.upload_path,
      item_id: finalItem?.id,
      name: preparation.name || file.name,
      mime: preparation.mime || file.type || '',
      size: file.size,
      kind: fileKind(file),
      uploader: displayName(),
      captured_at: file.lastModified ? new Date(file.lastModified).toISOString() : null,
      width: thumbnail.width,
      height: thumbnail.height,
      duration_ms: thumbnail.duration_ms,
    });
    progress(job, 100, '✓ Nel Circle');
    return { duplicate: false, media_id: preparation.media_id };
  }

  function uploadError(error) {
    const message = String(error?.message || 'upload_failed');
    if (/file_too_large_supabase_free/.test(message)) return 'Il file supera 50 MB e l’archivio per i video grandi non è disponibile';
    if (/413|too_large/i.test(message)) return 'File troppo grande';
    if (/tus|upload\/resumable|storage/i.test(message) && /401|403/.test(message)) return 'Autorizzazione del caricamento non valida: riprova';
    if (/401|403|unauthor|forbidden/i.test(message)) return 'Accesso scaduto';
    if (/429/.test(message)) return 'Servizio occupato, riprova tra poco';
    if (/upload_component_missing/i.test(message)) return 'Componente di caricamento non disponibile: ricarica la pagina';
    if (/network|fetch|tus/i.test(message)) return 'Connessione interrotta: il caricamento verrà ripreso';
    return 'Caricamento non riuscito';
  }

  async function runPool(files, limit, task) {
    let index = 0;
    const workers = Array.from({ length: Math.min(limit, files.length) }, async () => {
      while (index < files.length) {
        const current = index++;
        await task(files[current], current);
      }
    });
    await Promise.all(workers);
  }

  function releasePreview(job) {
    const url = job?.previewUrl || '';
    if (url.startsWith('blob:')) {
      try { URL.revokeObjectURL(url); } catch {}
    }
    if (job) job.previewUrl = '';
  }

  function trimUploadJobs() {
    const now = Date.now();
    uploadJobs = uploadJobs.filter((job) => {
      if (job.state === 'failed' || job.state === 'queued' || job.state === 'uploading') return true;
      return !job.finishedAt || now - job.finishedAt < UPLOAD_HISTORY_MS;
    });
  }

  function renderUploadPanel() {
    const list = circleOverlay?.querySelector('.pc-upload-list');
    if (!list) return;
    trimUploadJobs();
    if (!uploadJobs.length) {
      list.replaceChildren();
      return;
    }
    const totalBytesQueued = uploadJobs.reduce((sum, job) => sum + Number(job.file?.size || 0), 0);
    const weighted = uploadJobs.reduce((sum, job) => sum + Number(job.file?.size || 0) * Number(job.percent || 0) / 100, 0);
    const overall = totalBytesQueued ? Math.round(weighted / totalBytesQueued * 100) : 0;
    const done = uploadJobs.filter((job) => ['done', 'duplicate'].includes(job.state)).length;
    const failed = uploadJobs.filter((job) => job.state === 'failed').length;
    const active = uploadJobs.filter((job) => ['queued', 'uploading'].includes(job.state)).length;
    const summary = active
      ? `${done}/${uploadJobs.length} completati · ${overall}%${failed ? ` · ${failed} errori` : ''}`
      : `${done}/${uploadJobs.length} completati${failed ? ` · ${failed} da riprovare` : ''}`;
    const rows = uploadJobs.filter((job) => ['queued','uploading','failed'].includes(job.state) || !job.finishedAt || Date.now() - job.finishedAt < 8000).slice(-40).map((job) => {
      const stateLabel = job.state === 'failed' ? (job.error || 'Errore') : (job.label || 'In coda');
      const retry = job.state === 'failed'
        ? `<button type="button" data-upload-retry="${esc(job.id)}">Riprova</button>`
        : '';
      return `<div class="pc-upload-row ${job.state === 'failed' ? 'failed' : ''}" data-upload-job="${esc(job.id)}"><b>${esc(job.file?.name || 'File')}</b><span data-pct>${esc(stateLabel)}</span>${retry}<i class="pc-upload-progress"><b style="width:${Number(job.percent || 0)}%"></b></i></div>`;
    }).join('');
    list.innerHTML = `<div class="pc-upload-summary"><strong>${active ? 'Caricamento in corso' : 'Caricamento completato'}</strong><span>${esc(summary)}</span><i><b style="width:${overall}%"></b></i></div>${rows}`;
    list.querySelectorAll('[data-upload-retry]').forEach((button) => {
      button.onclick = () => {
        const job = uploadJobs.find((item) => item.id === button.dataset.uploadRetry);
        if (!job || job.state !== 'failed') return;
        job.state = 'queued';
        job.percent = 0;
        job.label = 'In coda';
        job.error = '';
        job.finishedAt = 0;
        if (job.optimistic) job.optimistic.failed = false;
        if (job.optimistic && !optimistic.some((item) => item.id === job.optimistic.id)) optimistic.push(job.optimistic);
        uploadBatchQueue.push({ id: `retry-${job.id}-${Date.now()}`, jobs: [job] });
        render();
        renderUploadPanel();
        void processUploadBatches();
      };
    });
  }

  async function processUploadBatches() {
    if (uploadBatchRunning) return;
    uploadBatchRunning = true;
    try {
      while (uploadBatchQueue.length) {
        const batch = uploadBatchQueue.shift();
        let uploadedCount = 0;
        let duplicateCount = 0;
        let failedCount = 0;
        await runPool(batch.jobs, UPLOAD_CONCURRENCY, async (job) => {
          job.state = 'uploading';
          job.startedAt = Date.now();
          progress(job, 0, 'Preparo…');
          try {
            const result = await uploadOne(job.file, job);
            if (result.duplicate) {
              job.state = 'duplicate';
              duplicateCount += 1;
            } else {
              job.state = 'done';
              uploadedCount += 1;
            }
            optimistic = optimistic.filter((item) => item.id !== job.optimistic?.id);
            releasePreview(job);
          } catch (error) {
            console.error('Ricordi upload', error);
            job.state = 'failed';
            job.error = uploadError(error);
            if (job.optimistic) job.optimistic.failed = true;
            failedCount += 1;
            progress(job, job.percent || 0, job.error);
          } finally {
            job.finishedAt = Date.now();
            if (!MOBILE_UPLOAD) render();
            renderUploadPanel();
          }
        });
        await load(true);
        const summary = [
          uploadedCount ? `${uploadedCount} ${uploadedCount === 1 ? 'caricato' : 'caricati'}` : '',
          duplicateCount ? `${duplicateCount} già ${duplicateCount === 1 ? 'presente' : 'presenti'}` : '',
          failedCount ? `${failedCount} da riprovare` : '',
        ].filter(Boolean).join(' · ');
        if (summary) toast(summary, failedCount ? 'error' : 'ok');
        setTimeout(() => renderUploadPanel(), UPLOAD_HISTORY_MS + 200);
      }
    } finally {
      uploadBatchRunning = false;
      renderUploadPanel();
      if (uploadBatchQueue.length) void processUploadBatches();
    }
  }

  function enqueueFiles(files) {
    trimUploadJobs();
    const batchId = `batch-${Date.now()}-${++uploadSerial}`;
    const previewBudget = Math.max(0, LOCAL_PREVIEW_LIMIT - optimistic.filter((item) => item.thumb_url?.startsWith('blob:')).length);
    const jobs = files.map((file, index) => {
      const id = `upload-${Date.now()}-${uploadSerial}-${index}-${Math.random().toString(36).slice(2, 7)}`;
      const usePreview = index < previewBudget && fileKind(file) === 'image';
      const previewUrl = usePreview ? URL.createObjectURL(file) : '';
      const optimisticItem = {
        id: `local-${id}`,
        optimistic: true,
        failed: false,
        kind: fileKind(file),
        mime_type: file.type,
        original_name: file.name,
        uploader_name: displayName(),
        captured_at: file.lastModified ? new Date(file.lastModified).toISOString() : new Date().toISOString(),
        thumb_url: previewUrl,
      };
      return { id, batchId, file, state: 'queued', percent: 0, label: 'In coda', previewUrl, optimistic: optimisticItem };
    });
    optimistic.push(...jobs.filter((job) => !MOBILE_UPLOAD || job.previewUrl).map((job) => job.optimistic));
    uploadJobs.push(...jobs);
    uploadBatchQueue.push({ id: batchId, jobs });
    render();
    renderUploadPanel();
    void processUploadBatches();
  }

  function ensureCircleStyle() {
    if (document.getElementById('pc-v43-style')) return;
    document.querySelectorAll('[id^="pc-v"]').forEach((style) => style.remove());
    const style = document.createElement('style');
    style.id = 'pc-v43-style';
    style.textContent = `
      .pc-overlay{position:fixed;inset:0;z-index:99990;background:rgba(7,17,24,.68);display:flex;align-items:flex-end;justify-content:center;color:#16252b}
      .pc-circle,.pc-view,.pc-comments{width:min(100%,820px);max-height:96dvh;overflow:auto;overscroll-behavior:contain;background:#fff;border-radius:28px 28px 0 0;box-shadow:0 -24px 70px rgba(0,0,0,.32);padding-bottom:max(12px,env(safe-area-inset-bottom));font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
      .pc-circle{display:flex;flex-direction:column;overflow:hidden;padding-bottom:0}.pc-circle>header{position:relative;flex:0 0 auto}.pc-gallery-scroll{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}.pc-dock{position:relative;z-index:10;flex:0 0 auto;background:#fff;box-shadow:0 -6px 20px rgba(23,59,69,.06)}
      .pc-circle header,.pc-view header,.pc-comments header{position:sticky;top:0;z-index:8;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:calc(13px + env(safe-area-inset-top)) 16px 13px;background:rgba(255,255,255,.96);backdrop-filter:blur(15px);border-bottom:1px solid #edf0ef}
      .pc-circle header strong,.pc-view header strong,.pc-comments header strong{font-size:21px;letter-spacing:-.02em}.pc-circle button,.pc-view button,.pc-comments button{font:inherit}
      .pc-circle header button,.pc-view header button,.pc-comments header button{border:0;background:#f2f4f3;color:#173b45;border-radius:999px;min-width:40px;height:40px;font-size:20px;cursor:pointer}
      .pc-album-sub{font-size:11px;color:#7a888d;margin-top:1px}.pc-cloud{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#e9f5f2}
      .pc-members{display:flex;gap:11px;align-items:center;padding:14px 16px 8px}.pc-members>div:last-child{display:flex;flex-direction:column}.pc-members strong{font-size:13px}.pc-members span{font-size:11px;color:#7a888d}.pc-avatars{display:flex}.pc-avatars span,.pc-avatar{width:33px;height:33px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#d9eeea,#f4e0d6);color:#173b45;font-size:11px;font-weight:800;border:2px solid #fff;margin-right:-7px}
      .pc-status{padding:0 16px 10px;color:#77868b;font-size:11.5px}.pc-toolbar{display:flex;gap:7px;overflow:auto;padding:8px 16px 13px;scrollbar-width:none}.pc-toolbar::-webkit-scrollbar{display:none}.pc-toolbar button,.pc-toolbar select,.pc-selectbar button{border:0;border-radius:999px;padding:9px 14px;background:#f2f4f3;color:#2f474e;font-weight:700;font-size:12px;white-space:nowrap}.pc-toolbar select{appearance:auto;max-width:178px}.pc-toolbar button.active{background:#173b45;color:white} 
      .pc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px;padding:0 2px 18px;background:#fff}.pc-day{grid-column:1/-1;display:flex;justify-content:space-between;padding:15px 12px 7px;background:#fff;color:#53686f;text-transform:capitalize;font-size:12px}.pc-day strong{font-size:13px}
      .pc-tile{position:relative;border:0;padding:0;background:#e9eeec;aspect-ratio:1;overflow:hidden;content-visibility:auto;contain:layout paint style;contain-intrinsic-size:160px 160px;cursor:pointer}.pc-tile-media,.pc-tile img,.pc-tile video{width:100%;height:100%;object-fit:cover}.pc-tile img,.pc-tile video{display:block;background:linear-gradient(110deg,#eef2f1 25%,#f8faf9 42%,#eef2f1 60%);background-size:240% 100%;animation:pc-shimmer 1.4s infinite}.pc-tile img[src],.pc-tile video[src]{animation:none}.pc-fallback{width:100%;height:100%;display:grid;place-items:center;background:linear-gradient(145deg,#eef5f3,#f7eee9);font-size:29px}.pc-tile:after{content:'';position:absolute;inset:auto 0 0;height:38%;background:linear-gradient(transparent,rgba(0,0,0,.45));pointer-events:none}.pc-tile-meta{position:absolute;z-index:2;left:7px;right:6px;bottom:6px;display:flex;align-items:center;gap:7px;color:white;text-shadow:0 1px 4px #000;font-size:10px}.pc-tile-meta .pc-avatar{width:24px;height:24px;border:1.5px solid #fff;color:#173b45;text-shadow:none}.pc-video,.pc-check{position:absolute;z-index:3;top:7px;right:7px;background:rgba(0,0,0,.56);color:white;border-radius:999px;padding:5px 7px;font-size:10px}.pc-check{left:7px;right:auto;min-width:26px;text-align:center}.pc-state-stack{position:absolute;z-index:4;top:7px;left:7px;display:flex;flex-direction:column;align-items:flex-start;gap:4px}.pc-state-stack i{display:block;padding:4px 6px;border-radius:999px;background:rgba(23,59,69,.84);color:white;font-size:8.5px;font-style:normal;font-weight:800;line-height:1}.pc-state-stack i+i{background:rgba(42,117,92,.9)}.pc-uploading-badge{position:absolute;z-index:4;inset:auto 7px 7px 7px;border-radius:999px;padding:6px 8px;background:rgba(23,59,69,.86);color:#fff;font-size:10px;font-weight:800}.pc-uploading-badge.duplicate{background:#347b68}
      .pc-more{grid-column:1/-1;border:0;background:#f2f6f4;color:#173b45;margin:16px auto 22px;border-radius:999px;padding:11px 18px;font-size:12px;font-weight:800}.pc-uploadbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 16px calc(11px + env(safe-area-inset-bottom));background:rgba(255,255,255,.97);backdrop-filter:blur(15px);border-top:1px solid #e8ecea}.pc-uploadbar.hidden{display:none}.pc-uploadbar>span{font-size:10.5px;color:#7e8c91;max-width:42%}.pc-upload-actions{display:flex;align-items:center;gap:8px;margin-left:auto}.pc-upload-actions button{border:1px solid #dce5e2;border-radius:999px;padding:12px 14px;background:#f4f7f5;color:#173b45;font-weight:800;white-space:nowrap}.pc-uploadbar .primary{border:0;padding:12px 17px;background:#173b45;color:white;box-shadow:0 8px 24px rgba(23,59,69,.22)}
      .pc-selectbar{display:none;justify-content:space-between;align-items:center;gap:8px;padding:11px 16px calc(11px + env(safe-area-inset-bottom));background:white;border-top:1px solid #e8ecea}.pc-selectbar.show{display:flex}.pc-upload-list{max-height:min(34dvh,280px);overflow:auto;padding:0 14px;background:white}.pc-upload-summary{position:sticky;top:0;z-index:3;display:grid;grid-template-columns:1fr auto;gap:3px 10px;padding:10px 2px 9px;background:rgba(255,255,255,.97);border-bottom:1px solid #e8ecea}.pc-upload-summary strong{font-size:12px;color:#173b45}.pc-upload-summary span{font-size:10px;color:#718086}.pc-upload-summary i{grid-column:1/-1;height:6px;border-radius:99px;background:#e9efed;overflow:hidden}.pc-upload-summary i b{display:block;height:100%;background:linear-gradient(90deg,#2b9a8b,#55b9ae);transition:width .2s}.pc-upload-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:5px 8px;align-items:center;padding:9px 2px;border-top:1px solid #eef1f0;font-size:11px}.pc-upload-row>b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pc-upload-row>button{border:0;border-radius:999px;background:#173b45;color:white;padding:5px 8px;font-size:10px;font-weight:800}.pc-upload-row.failed [data-pct]{color:#a6463b}.pc-upload-progress{grid-column:1/-1;height:5px;border-radius:99px;background:#edf1ef;overflow:hidden}.pc-upload-progress b{display:block;width:0;height:100%;background:linear-gradient(90deg,#2b9a8b,#55b9ae);transition:width .2s}
      .pc-empty{grid-column:1/-1;min-height:310px;display:grid;place-items:center;align-content:center;gap:7px;text-align:center;color:#78878c;background:white}.pc-empty>div{font-size:44px}.pc-empty strong{font-size:16px;color:#2b4249}.pc-empty span{font-size:12px;max-width:260px}.pc-empty button{margin-top:7px;border:0;border-radius:999px;background:#173b45;color:white;padding:10px 15px;font-weight:800}
      .pc-view{height:96dvh;background:#0b1115;color:white}.pc-view header{background:rgba(11,17,21,.84);border-bottom-color:#ffffff16;color:white}.pc-view header button{background:#ffffff16;color:white}.pc-view header small{display:block;color:#ffffff99;font-size:10px}.pc-stage{position:relative;background:#05090c;min-height:58dvh;display:grid;place-items:center;overflow:hidden}.pc-stage img,.pc-stage video{width:100%;max-height:70dvh;object-fit:contain}.pc-preview-play,.pc-video-loading,.pc-video-error{position:absolute;color:white}.pc-preview-play{display:flex;flex-direction:column;align-items:center;gap:5px;border:0;background:rgba(0,0,0,.62);border-radius:18px;padding:16px;color:white}.pc-video-loading{display:none}.pc-video-error{display:none;z-index:6;inset:0;background:#05090c;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;padding:28px}.pc-video-error strong{font-size:18px}.pc-video-error span{max-width:300px;color:#ffffffa8;font-size:12px}.pc-prev,.pc-next{position:absolute;top:50%;transform:translateY(-50%);border:0;border-radius:50%;width:44px;height:44px;background:rgba(0,0,0,.48)!important;color:white!important}.pc-prev{left:8px}.pc-next{right:8px}.pc-caption{padding:13px 16px;background:#0b1115}.pc-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;padding:0 10px 14px;background:#0b1115}.pc-actions button{border:0;background:#182127;color:white;border-radius:14px;padding:10px 4px}.pc-actions span{display:block;font-size:10px;margin-top:3px;color:#ffffffb0}.pc-react-pop,.pc-menu{display:none;position:absolute;z-index:12;background:white;color:#173b45;border-radius:15px;padding:8px;box-shadow:0 12px 40px rgba(0,0,0,.25)}.pc-react-pop.show,.pc-menu.show{display:flex}.pc-react-pop{left:10px;bottom:70px}.pc-menu{right:12px;top:68px;flex-direction:column}
      .pc-comments{max-height:90dvh}.pc-comment-list{padding:12px 16px;display:flex;flex-direction:column;gap:13px}.pc-comment{display:flex;gap:10px;align-items:flex-start}.pc-comment>div{flex:1}.pc-comment p{margin:3px 0}.pc-comment small{color:#74858a}.pc-comments form{position:sticky;bottom:0;display:flex;gap:8px;padding:12px 14px calc(12px + env(safe-area-inset-bottom));background:#fff}.pc-comments input{flex:1;border:1px solid #dce3e0;border-radius:999px;padding:11px 14px;font-size:16px}
      .pc-download{position:relative;width:min(90vw,390px);background:#fff;border-radius:24px;padding:27px 22px 22px;display:flex;flex-direction:column;align-items:center;gap:8px;box-shadow:0 24px 70px rgba(0,0,0,.3)}.pc-download>[data-close]{position:absolute;right:12px;top:12px;border:0;border-radius:50%;width:34px;height:34px}.pc-download-icon{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:#e9f5f2;color:#173b45;font-size:28px}.pc-download strong{max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pc-download span,.pc-download small{color:#718087;font-size:12px}.pc-download-track{width:100%;height:8px;border-radius:999px;background:#edf1ef;overflow:hidden;margin-top:7px}.pc-download-track b{display:block;width:0;height:100%;border-radius:inherit;background:linear-gradient(90deg,#2b9a8b,#55b9ae);transition:width .12s}
      .pc-toast{position:fixed;left:50%;bottom:calc(92px + env(safe-area-inset-bottom));z-index:100000;transform:translate(-50%,30px);opacity:0;background:#173b45;color:white;padding:10px 14px;border-radius:18px;max-width:min(88vw,460px);text-align:center;transition:.2s}.pc-toast.show{transform:translate(-50%,0);opacity:1}.pc-toast[data-type=error]{background:#8c3440}
      @keyframes pc-shimmer{to{background-position:-240% 0}}
      @media(max-width:480px){.pc-uploadbar>span{display:none}.pc-uploadbar{justify-content:flex-end}.pc-upload-actions{width:100%;justify-content:flex-end}}@media(max-width:720px){.pc-overlay{background:#fff;align-items:stretch}.pc-circle,.pc-view,.pc-comments{width:100%;height:100dvh;max-height:none;border-radius:0}.pc-grid{grid-template-columns:repeat(3,1fr)}.pc-circle header,.pc-comments header{padding-top:calc(10px + env(safe-area-inset-top))}.pc-dialog-wrap{background:rgba(7,17,24,.68);align-items:flex-end}.pc-dialog-wrap .pc-download{margin:auto}}
      @media(min-width:900px){.pc-grid{grid-template-columns:repeat(4,1fr)}}
      @media(prefers-reduced-motion:reduce){.pc-tile img,.pc-tile video{animation:none}.pc-toast,.pc-upload-progress b,.pc-download-track b{transition:none}}
    `;
    document.head.appendChild(style);
  }

  async function openCircle() {
    syncStreamSession();
    navigator.storage?.persist?.().catch(() => {});
    ensureCircleStyle();
    if (circleOverlay?.isConnected) return;
    const { o } = overlay(`<div class="pc-circle" role="dialog" aria-modal="true" aria-label="Ricordi">
      <header><button data-close aria-label="Chiudi">‹</button><div><strong>Ricordi</strong><div class="pc-album-sub">Album condiviso del viaggio</div></div><span class="pc-cloud">☁️</span></header>
      <div class="pc-gallery-scroll">
        <div class="pc-members"></div>
        <div class="pc-toolbar"><button data-filter="all" class="active">Tutti</button><button data-filter="image">Foto</button><button data-filter="video">Video</button><select data-sort aria-label="Ordina ricordi"><option value="captured_at:desc">Data foto · recenti</option><option value="captured_at:asc">Data foto · meno recenti</option><option value="created_at:desc">Aggiunta · recenti</option><option value="created_at:asc">Aggiunta · meno recenti</option></select></div>
        <div class="pc-status">Carico l’album…</div>
        <div class="pc-grid"></div>
      </div>
      <div class="pc-dock">
        <div class="pc-selectbar"><strong>0 selezionati</strong><div><button data-download-selected>Scarica</button><button data-clear-selected>Annulla</button></div></div>
        <div class="pc-upload-list"></div>
        <div class="pc-uploadbar"><span>I file già presenti vengono riconosciuti automaticamente</span><div class="pc-upload-actions"><button data-select>Seleziona</button><button class="primary" data-add>＋ Aggiungi</button></div><input data-files hidden type="file" multiple accept="image/*,video/*,.heic,.heif,.jpg,.jpeg,.png,.mov,.mp4,.m4v,.webm,.3gp"></div>
      </div>
    </div>`, 'pc-circle-wrap');
    circleOverlay = o;
    o.addEventListener('remove', () => {
      lazyObserver?.disconnect();
      moreObserver?.disconnect();
    });
    const sortSelect = o.querySelector('[data-sort]');
    if (sortSelect) {
      sortSelect.value = `${sortBy}:${sortDir}`;
      sortSelect.onchange = () => {
        const [nextBy, nextDir] = String(sortSelect.value || '').split(':');
        sortBy = nextBy === 'created_at' ? 'created_at' : 'captured_at';
        sortDir = nextDir === 'asc' ? 'asc' : 'desc';
        saveLocalSort();
        media = []; nextOffset = 0; hasMore = true; totalCount = 0; render();
        void personalApi({ op: 'prefs_set', sort_by: sortBy, sort_dir: sortDir }).catch(() => {});
        void load(true);
      };
      void personalApi({ op: 'prefs_get' }).then((prefs) => {
        const nextBy = prefs?.sort_by === 'created_at' ? 'created_at' : 'captured_at';
        const nextDir = prefs?.sort_dir === 'asc' ? 'asc' : 'desc';
        if (nextBy !== sortBy || nextDir !== sortDir) { sortBy = nextBy; sortDir = nextDir; saveLocalSort(); sortSelect.value = `${sortBy}:${sortDir}`; media = []; nextOffset = 0; hasMore = true; totalCount = 0; render(); void load(true); }
      }).catch(() => {});
    }
    o.querySelectorAll('[data-filter]').forEach((button) => {
      button.onclick = () => {
        filter = button.dataset.filter;
        o.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('active', item === button));
        media = [];
        nextOffset = 0;
        hasMore = true;
        totalCount = 0;
        render();
        void load(true);
      };
    });
    o.querySelector('[data-select]').onclick = () => {
      selectMode = !selectMode;
      if (!selectMode) selected.clear();
      render();
      updateSelectBar();
    };
    o.querySelector('[data-download-selected]').onclick = () => void downloadSelected();
    o.querySelector('[data-clear-selected]').onclick = () => {
      selected.clear();
      selectMode = false;
      render();
      updateSelectBar();
    };
    const input = o.querySelector('[data-files]');
    o.querySelector('[data-add]').onclick = () => input.click();
    input.onchange = () => {
      const files = [...input.files].slice(0, MAX_PICK).filter((file) => fileKind(file));
      input.value = '';
      if (!files.length) return toast('Nessun file compatibile', 'error');
      enqueueFiles(files);
    };
    renderUploadPanel();

    const cached = filter === 'all' && readMediaCache();
    if (cached) {
      render();
      renderMembers();
      o.querySelector('.pc-status').textContent = `${totalCount} ${totalCount === 1 ? 'ricordo' : 'ricordi'} · apro subito dalla cache…`;
    }
    updateSelectBar();
    void load(true);
  }

  syncStreamSession();
  window.addEventListener('palma-open-circle', () => void openCircle());
})();
