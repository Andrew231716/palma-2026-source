(()=>{
  const SUPABASE_URL='https://cvdlzwralgtapsigyuko.supabase.co';
  const MEDIA_URL=`${SUPABASE_URL}/functions/v1/trip-media-circle`;
  const STORAGE_URL='https://cvdlzwralgtapsigyuko.storage.supabase.co/storage/v1/upload/resumable/sign';
  const PUBLISHABLE_KEY='sb_publishable_-hqWDIWPIcHNCp4CLih94g_XKsqP29G';
  const BUCKET='ricordi';
  const MOBILE=/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const CONCURRENCY=MOBILE?3:4;
  const MAX_PICK=250;
  let tusPromise=null;
  let previewUrls=[];

  const tripCode=()=>localStorage.getItem('palma2026-trip-code')||'';
  const clientId=()=>{
    let id=localStorage.getItem('palma2026-media-client-id');
    if(!id){id=crypto.randomUUID?.()||`${Date.now()}-${Math.random()}`;localStorage.setItem('palma2026-media-client-id',id)}
    return id;
  };
  const displayName=()=>{
    for(const key of ['palma2026-profile','palma2026-profile-name-draft']){
      const raw=localStorage.getItem(key);if(!raw)continue;
      try{const parsed=JSON.parse(raw);if(typeof parsed==='string'&&parsed.trim())return parsed.trim()}catch{}
      if(raw.trim())return raw.replace(/^"|"$/g,'').trim();
    }
    return 'Partecipante';
  };
  const fileKind=file=>{
    const m=(file.type||'').toLowerCase();if(m.startsWith('image/'))return'image';if(m.startsWith('video/'))return'video';
    const e=(file.name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1]||'');
    if(['jpg','jpeg','png','webp','gif','heic','heif','avif','tif','tiff','dng','bmp'].includes(e))return'image';
    if(['mp4','mov','m4v','webm','3gp','mkv','avi','mts','m2ts'].includes(e))return'video';
    return'';
  };
  const delay=ms=>new Promise(r=>setTimeout(r,ms));
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function ensureTus(){
    if(window.tus?.Upload)return Promise.resolve(window.tus);
    if(tusPromise)return tusPromise;
    tusPromise=new Promise((resolve,reject)=>{
      const s=document.createElement('script');s.src='https://unpkg.com/tus-js-client@4.3.1/dist/tus.min.js';s.crossOrigin='anonymous';
      s.onload=()=>window.tus?.Upload?resolve(window.tus):reject(new Error('tus_missing'));
      s.onerror=()=>reject(new Error('tus_load_failed'));document.head.appendChild(s);
    }).catch(e=>{tusPromise=null;throw e});
    return tusPromise;
  }
  void ensureTus().catch(()=>{});

  async function mediaApi(payload){
    let last;
    for(let attempt=0;attempt<3;attempt++){
      try{
        const r=await fetch(MEDIA_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:tripCode(),client_id:clientId(),...payload})});
        const d=await r.json().catch(()=>({}));
        if(r.ok)return d;
        const e=new Error(d?.error||`http_${r.status}`);e.status=r.status;throw e;
      }catch(e){last=e;const s=Number(e?.status||0);if(s&&![408,425,429,500,502,503,504].includes(s))throw e;if(attempt===2)throw e;await delay(500*(2**attempt))}
    }
    throw last||new Error('media_api_failed');
  }

  function tusUpload(file,path,token,contentType,onProgress=()=>{}){
    return ensureTus().then(({Upload})=>new Promise((resolve,reject)=>{
      const up=new Upload(file,{endpoint:STORAGE_URL,retryDelays:[0,1000,3000,5000,10000],headers:{'x-signature':token,apikey:PUBLISHABLE_KEY},uploadDataDuringCreation:true,removeFingerprintOnSuccess:true,chunkSize:6*1024*1024,metadata:{bucketName:BUCKET,objectName:path,contentType:contentType||file.type||'application/octet-stream',cacheControl:'31536000'},onError:reject,onProgress:(a,b)=>onProgress(b?Math.round(a/b*100):0),onSuccess:()=>resolve(up.url)});
      // Nuovo upload firmato = nuova sessione. Non riusare URL TUS scaduti di tentativi precedenti.
      up.start();
    }));
  }

  const canvasBlob=(canvas,q=.72)=>new Promise(r=>canvas.toBlob(r,'image/webp',q));
  async function imageThumb(file){
    let src,cleanup=()=>{};
    try{src=await createImageBitmap(file,{imageOrientation:'from-image'})}catch{
      const u=URL.createObjectURL(file),img=new Image();img.src=u;await img.decode();src=img;cleanup=()=>URL.revokeObjectURL(u);
    }
    const w=src.width||src.videoWidth,h=src.height||src.videoHeight,scale=Math.min(1,640/Math.max(w,h));
    const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*scale));c.height=Math.max(1,Math.round(h*scale));c.getContext('2d',{alpha:false}).drawImage(src,0,0,c.width,c.height);
    const blob=await canvasBlob(c);src.close?.();cleanup();return{blob,width:w,height:h,duration_ms:null};
  }
  async function videoThumb(file){
    const u=URL.createObjectURL(file),v=document.createElement('video');v.muted=true;v.playsInline=true;v.preload='metadata';v.src=u;
    const once=ev=>new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('video_thumb_timeout')),8000);v.addEventListener(ev,()=>{clearTimeout(t);res()},{once:true});v.addEventListener('error',()=>{clearTimeout(t);rej(new Error('video_thumb_error'))},{once:true})});
    try{await once('loadedmetadata');if(Number.isFinite(v.duration)&&v.duration>.2){v.currentTime=Math.min(.8,v.duration*.06);await once('seeked')}else await once('loadeddata');
      const w=v.videoWidth,h=v.videoHeight;if(!w||!h)throw new Error('video_dimensions');const scale=Math.min(1,640/Math.max(w,h));const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w*scale));c.height=Math.max(1,Math.round(h*scale));c.getContext('2d',{alpha:false}).drawImage(v,0,0,c.width,c.height);return{blob:await canvasBlob(c,.68),width:w,height:h,duration_ms:Math.round((v.duration||0)*1000)||null};
    }finally{v.removeAttribute('src');v.load();URL.revokeObjectURL(u)}
  }
  async function makeThumb(file){try{return fileKind(file)==='video'?await videoThumb(file):await imageThumb(file)}catch{return{blob:null,width:null,height:null,duration_ms:null}}}

  function clearPreviews(){for(const u of previewUrls){try{URL.revokeObjectURL(u)}catch{}}previewUrls=[]}
  function renderBatchPreview(circle,files){
    circle.querySelector('.palma-batch-preview')?.remove();clearPreviews();
    const box=document.createElement('div');box.className='palma-batch-preview';
    const photos=files.filter(f=>fileKind(f)==='image').length,videos=files.length-photos;
    box.innerHTML=`<div class="palma-batch-preview-head"><span>${files.length} elementi pronti</span><span>${photos?photos+' foto ':''}${videos?videos+' video':''}</span></div><div class="palma-batch-preview-list"></div>`;
    const list=box.querySelector('.palma-batch-preview-list');
    files.slice(0,18).forEach(f=>{const u=URL.createObjectURL(f);previewUrls.push(u);const item=document.createElement('div');item.className='palma-batch-item';if(fileKind(f)==='image'){const img=document.createElement('img');img.src=u;item.appendChild(img)}else{const v=document.createElement('video');v.src=u;v.muted=true;v.playsInline=true;v.preload='metadata';item.append(v);const badge=document.createElement('span');badge.className='palma-batch-video';badge.textContent='▶';item.append(badge)}list.append(item)});
    if(files.length>18){const more=document.createElement('div');more.className='palma-batch-more';more.textContent=`+${files.length-18}\naltre`;list.append(more)}
    const uploadList=circle.querySelector('.pc-upload-list');uploadList?.parentElement?.insertBefore(box,uploadList);
  }

  function getPanel(circle){
    let panel=circle.querySelector('.palma-fast-upload');
    if(!panel){panel=document.createElement('div');panel.className='palma-fast-upload';const list=circle.querySelector('.pc-upload-list');list?.parentElement?.insertBefore(panel,list);}
    return panel;
  }
  function paintPanel(circle,jobs){
    const p=getPanel(circle),done=jobs.filter(j=>j.state==='done'||j.state==='duplicate').length,failed=jobs.filter(j=>j.state==='failed').length;
    const total=jobs.reduce((s,j)=>s+j.file.size,0),weighted=jobs.reduce((s,j)=>s+j.file.size*(j.percent||0)/100,0),pct=total?Math.round(weighted/total*100):0;
    p.innerHTML=`<div class="palma-fast-summary"><strong>${done===jobs.length?'Caricamento completato':'Caricamento veloce'}</strong><span>${done}/${jobs.length} · ${pct}%${failed?` · ${failed} errori`:''}</span><i><b style="width:${pct}%"></b></i></div>`+jobs.slice(-30).map(j=>`<div class="palma-fast-row ${j.state==='failed'?'failed':''}"><b>${esc(j.file.name)}</b><span>${esc(j.label||'In coda')}</span><i><b style="width:${j.percent||0}%"></b></i></div>`).join('');
  }

  async function uploadOne(file,job,circle){
    job.state='uploading';job.label='Preparo…';job.percent=0;paintPanel(circle,job.batch);
    const prep=await mediaApi({op:'prepare_upload',name:file.name,mime:file.type||'application/octet-stream',size:file.size,kind:fileKind(file),display_name:displayName(),captured_at:file.lastModified?new Date(file.lastModified).toISOString():null});
    if(prep.duplicate){job.state='duplicate';job.percent=100;job.label='✓ Già presente';return}
    if(prep.provider!=='supabase')throw new Error('large_file_preview_not_supported');
    const thumb=await makeThumb(file);
    const thumbTask=thumb.blob&&prep.thumb_token?tusUpload(thumb.blob,prep.thumb_path,prep.thumb_token,'image/webp'):Promise.resolve();
    await Promise.all([tusUpload(file,prep.upload_path,prep.upload_token,prep.mime||file.type,p=>{job.percent=p;job.label=`Carico ${p}%`;paintPanel(circle,job.batch)}),thumbTask]);
    job.percent=100;job.label='Registro…';paintPanel(circle,job.batch);
    await mediaApi({op:'commit_upload',provider:'supabase',media_id:prep.media_id,path:prep.upload_path,name:prep.name||file.name,mime:prep.mime||file.type||'',size:file.size,kind:fileKind(file),uploader:displayName(),captured_at:file.lastModified?new Date(file.lastModified).toISOString():null,width:thumb.width,height:thumb.height,duration_ms:thumb.duration_ms});
    job.state='done';job.label='✓ Nel Circle';job.percent=100;
  }

  async function runPool(jobs,circle){
    let cursor=0;const workers=Array.from({length:Math.min(CONCURRENCY,jobs.length)},async()=>{while(cursor<jobs.length){const job=jobs[cursor++];try{await uploadOne(job.file,job,circle)}catch(e){console.error('Ricordi fast upload',e);job.state='failed';job.label=String(e?.message||'Caricamento non riuscito').replace('server_error','Errore server').replace('large_file_preview_not_supported','Video oltre 50 MB: usa il percorso standard');}finally{paintPanel(circle,jobs)}}});await Promise.all(workers);
  }

  async function handleFiles(input,files){
    const circle=input.closest('.pc-circle');if(!circle||!files.length)return;
    renderBatchPreview(circle,files);
    const jobs=files.map(file=>({file,state:'queued',percent:0,label:'In coda'}));jobs.forEach(j=>j.batch=jobs);paintPanel(circle,jobs);
    await runPool(jobs,circle);
    const ok=jobs.filter(j=>j.state==='done'||j.state==='duplicate').length;
    if(ok){setTimeout(()=>{circle.querySelector('[data-close]')?.click();setTimeout(()=>window.dispatchEvent(new Event('palma-open-circle')),180)},500)}
  }

  const css=document.createElement('style');css.id='palma-ricordi-photocircle-safe';css.textContent=`
    .pc-circle .pc-toolbar{position:sticky!important;top:0!important;z-index:40!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important}.pc-circle .pc-toolbar::-webkit-scrollbar{display:none!important}.pc-circle .pc-toolbar [data-select]{position:sticky!important;left:0!important;z-index:5!important;flex:0 0 auto!important;visibility:visible!important;opacity:1!important;display:inline-flex!important}
    .pc-circle .palma-batch-preview{margin:10px 14px 12px;padding:11px;border-radius:16px;background:#f5f7f6;border:1px solid rgba(18,59,77,.08)}.pc-circle .palma-batch-preview-head{display:flex;justify-content:space-between;gap:10px;margin-bottom:8px;color:#123b4d;font:800 12px system-ui}.pc-circle .palma-batch-preview-list{display:flex;gap:8px;overflow-x:auto;padding-bottom:2px}.pc-circle .palma-batch-item{position:relative;flex:0 0 76px;width:76px;height:76px;border-radius:13px;overflow:hidden;background:#dfe8e6}.pc-circle .palma-batch-item img,.pc-circle .palma-batch-item video{width:100%;height:100%;object-fit:cover}.pc-circle .palma-batch-video{position:absolute;right:5px;top:5px;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:rgba(0,0,0,.65);color:#fff;font:700 10px system-ui}.pc-circle .palma-batch-more{flex:0 0 76px;height:76px;border-radius:13px;display:grid;place-items:center;text-align:center;background:#e7efed;color:#123b4d;font:800 12px system-ui;white-space:pre-line}
    .pc-circle .palma-fast-upload{padding:0 14px;background:#fff;max-height:34dvh;overflow:auto}.pc-circle .palma-fast-summary{position:sticky;top:0;background:#fff;display:grid;grid-template-columns:1fr auto;gap:4px 8px;padding:10px 0;border-bottom:1px solid #e8ecea;z-index:2}.pc-circle .palma-fast-summary strong{font-size:12px;color:#173b45}.pc-circle .palma-fast-summary span{font-size:10px;color:#718086}.pc-circle .palma-fast-summary i,.pc-circle .palma-fast-row i{grid-column:1/-1;height:6px;border-radius:99px;background:#e9efed;overflow:hidden}.pc-circle .palma-fast-summary i b,.pc-circle .palma-fast-row i b{display:block;height:100%;background:linear-gradient(90deg,#2b9a8b,#55b9ae);transition:width .15s}.pc-circle .palma-fast-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px 8px;padding:8px 0;border-bottom:1px solid #eef1f0;font-size:11px}.pc-circle .palma-fast-row>b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.pc-circle .palma-fast-row.failed span{color:#a6463b}
  `;document.head.appendChild(css);

  document.addEventListener('change',e=>{
    const input=e.target;if(!(input instanceof HTMLInputElement)||input.type!=='file'||!input.multiple||!input.closest('.pc-circle'))return;
    const files=[...(input.files||[])].slice(0,MAX_PICK).filter(f=>fileKind(f));if(!files.length)return;
    e.stopImmediatePropagation();e.stopPropagation();input.value='';void handleFiles(input,files);
  },true);
})();