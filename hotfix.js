(()=>{
  const ensureTus=()=>{
    if(window.tus?.Upload)return Promise.resolve(window.tus);
    if(window.__palmaTusFallback)return window.__palmaTusFallback;
    window.__palmaTusFallback=new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src='https://unpkg.com/tus-js-client@4.3.1/dist/tus.min.js';
      s.crossOrigin='anonymous';
      s.onload=()=>window.tus?.Upload?resolve(window.tus):reject(new Error('tus_missing_after_load'));
      s.onerror=()=>reject(new Error('tus_cdn_load_failed'));
      document.head.appendChild(s);
    }).catch(err=>{window.__palmaTusFallback=null;console.error('Palma TUS fallback',err);throw err});
    return window.__palmaTusFallback;
  };
  void ensureTus().catch(()=>{});

  const css=document.createElement('style');
  css.id='palma-mobile-critical-hotfix';
  css.textContent=`
    .pc-toolbar{position:sticky!important;top:0!important;z-index:40!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important}
    .pc-toolbar::-webkit-scrollbar{display:none!important}
    .palma-select-sticky,.pc-toolbar [data-select],.pc-toolbar button[data-action="select"],.pc-toolbar button.pc-select{position:sticky!important;left:0!important;z-index:5!important;flex:0 0 auto!important;visibility:visible!important;opacity:1!important;display:inline-flex!important}
    .palma-batch-preview{margin:12px 0 14px;padding:12px;border-radius:18px;background:#f5f7f6;border:1px solid rgba(18,59,77,.08)}
    .palma-batch-preview-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:9px;color:#123b4d;font:800 13px system-ui}
    .palma-batch-preview-list{display:flex;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:2px;scrollbar-width:none}
    .palma-batch-preview-list::-webkit-scrollbar{display:none}
    .palma-batch-item{position:relative;flex:0 0 76px;width:76px;height:76px;border-radius:13px;overflow:hidden;background:#dfe8e6}
    .palma-batch-item img,.palma-batch-item video{width:100%;height:100%;object-fit:cover;display:block}
    .palma-batch-video{position:absolute;right:5px;top:5px;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:rgba(0,0,0,.65);color:white;font:700 10px system-ui}
    .palma-batch-more{flex:0 0 76px;height:76px;border-radius:13px;display:grid;place-items:center;text-align:center;background:#e7efed;color:#123b4d;font:800 12px system-ui}
    .palma-boarding-tools{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
    .palma-boarding-attach,.palma-boarding-open,.palma-boarding-delete{display:inline-flex;align-items:center;justify-content:center;gap:7px;min-height:42px;padding:10px 13px;border:1px solid rgba(18,59,77,.12);border-radius:12px;background:#eef5f3;color:#123b4d;font:800 12px system-ui;cursor:pointer}
    .palma-boarding-open{background:#123b4d;color:#fff;text-decoration:none}
    .palma-boarding-delete{background:#fff;color:#9d3d2b}
    .palma-boarding-file{display:none!important}
    .palma-boarding-status{width:100%;font:600 11px system-ui;color:#667b82}
  `;
  document.head.appendChild(css);

  const markSelect=()=>{
    for(const b of document.querySelectorAll('button')){
      if(/^seleziona$/i.test((b.textContent||'').trim())) b.classList.add('palma-select-sticky');
    }
  };

  let previewUrls=[];
  const clearPreviewUrls=()=>{for(const u of previewUrls)URL.revokeObjectURL(u);previewUrls=[]};
  const renderBatchPreview=(input,files)=>{
    document.querySelector('.palma-batch-preview')?.remove();
    clearPreviewUrls();
    if(!files.length)return;
    const box=document.createElement('div');box.className='palma-batch-preview';
    const head=document.createElement('div');head.className='palma-batch-preview-head';
    const photos=files.filter(f=>/^image\//i.test(f.type)).length;
    const videos=files.filter(f=>/^video\//i.test(f.type)||/\.(mov|mp4|m4v|avi|webm)$/i.test(f.name)).length;
    head.innerHTML=`<span>${files.length} elementi pronti</span><span>${photos?photos+' foto ':''}${videos?videos+' video':''}</span>`;
    const list=document.createElement('div');list.className='palma-batch-preview-list';
    const visible=files.slice(0,18);
    for(const f of visible){
      const item=document.createElement('div');item.className='palma-batch-item';
      const u=URL.createObjectURL(f);previewUrls.push(u);
      if(/^image\//i.test(f.type)){
        const img=document.createElement('img');img.src=u;img.alt='';item.appendChild(img);
      }else{
        const v=document.createElement('video');v.src=u;v.muted=true;v.playsInline=true;v.preload='metadata';item.appendChild(v);
        const badge=document.createElement('span');badge.className='palma-batch-video';badge.textContent='▶';item.appendChild(badge);
      }
      list.appendChild(item);
    }
    if(files.length>visible.length){const more=document.createElement('div');more.className='palma-batch-more';more.textContent=`+${files.length-visible.length}\naltre`;list.appendChild(more)}
    box.append(head,list);
    const uploadArea=[...document.querySelectorAll('div,section')].find(el=>/caricamento in corso/i.test(el.textContent||'')&&el.querySelector('progress,.progress,[class*="progress"]'));
    const addButton=[...document.querySelectorAll('button')].find(b=>/aggiungi/i.test(b.textContent||''));
    if(uploadArea?.parentElement)uploadArea.parentElement.insertBefore(box,uploadArea);
    else if(addButton?.parentElement)addButton.parentElement.insertBefore(box,addButton);
    else input.parentElement?.insertBefore(box,input);
  };
  document.addEventListener('change',e=>{
    const input=e.target;
    if(!(input instanceof HTMLInputElement)||input.type!=='file'||!input.multiple)return;
    const files=[...(input.files||[])];
    if(!files.length)return;
    if(!files.some(f=>/^image\//i.test(f.type)||/^video\//i.test(f.type)||/\.(heic|heif|jpg|jpeg|png|gif|mov|mp4|m4v|webm)$/i.test(f.name)))return;
    renderBatchPreview(input,files);
  },true);

  const DB_NAME='palma2026-private';
  const STORE='files';
  const openDb=()=>new Promise((resolve,reject)=>{
    const r=indexedDB.open(DB_NAME,1);
    r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE)};
    r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);
  });
  const dbGet=async key=>{const db=await openDb();return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly');const r=tx.objectStore(STORE).get(key);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>reject(r.error)})};
  const dbSet=async(key,value)=>{const db=await openDb();return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(value,key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})};
  const dbDel=async key=>{const db=await openDb();return await new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(key);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})};

  const renderBoardingTools=async(card,leg)=>{
    if(card.querySelector(`[data-palma-boarding="${leg}"]`))return;
    const key=`boarding-${leg}`;
    const wrap=document.createElement('div');wrap.className='palma-boarding-tools';wrap.dataset.palmaBoarding=leg;
    const input=document.createElement('input');input.type='file';input.accept='image/*,application/pdf';input.className='palma-boarding-file';
    const attach=document.createElement('button');attach.type='button';attach.className='palma-boarding-attach';attach.textContent='🎫 Allega carta d’imbarco';
    const status=document.createElement('div');status.className='palma-boarding-status';
    const refresh=async()=>{
      wrap.querySelector('.palma-boarding-open')?.remove();wrap.querySelector('.palma-boarding-delete')?.remove();
      const saved=await dbGet(key).catch(()=>null);
      if(!saved){status.textContent='Nessun allegato salvato su questo dispositivo.';return;}
      status.textContent=`Salvato: ${saved.name||'carta d’imbarco'}`;
      const open=document.createElement('button');open.type='button';open.className='palma-boarding-open';open.textContent='Apri allegato';
      open.onclick=()=>{const u=URL.createObjectURL(saved.blob);window.open(u,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(u),60000)};
      const del=document.createElement('button');del.type='button';del.className='palma-boarding-delete';del.textContent='Rimuovi';
      del.onclick=async()=>{await dbDel(key);await refresh()};
      wrap.insertBefore(open,status);wrap.insertBefore(del,status);
    };
    attach.onclick=()=>input.click();
    input.onchange=async()=>{
      const f=input.files?.[0];input.value='';if(!f)return;
      if(f.size>25*1024*1024){status.textContent='File troppo grande. Usa un’immagine o PDF sotto 25 MB.';return;}
      status.textContent='Salvataggio…';
      try{await dbSet(key,{name:f.name,type:f.type,size:f.size,updatedAt:new Date().toISOString(),blob:f});await refresh()}catch{status.textContent='Non riesco a salvare l’allegato su questo dispositivo.'}
    };
    wrap.append(input,attach,status);card.appendChild(wrap);await refresh();
  };
  const ensureBoarding=()=>{
    const cards=[...document.querySelectorAll('.tab-panel .card')];
    for(const card of cards){
      const text=(card.textContent||'').toLowerCase();
      if(text.includes('andata')&&text.includes('settembre'))void renderBoardingTools(card,'andata');
      else if(text.includes('ritorno')&&text.includes('settembre'))void renderBoardingTools(card,'ritorno');
    }
  };
  const apply=()=>{markSelect();ensureBoarding()};
  const observer=new MutationObserver(apply);observer.observe(document.documentElement,{subtree:true,childList:true});
  setTimeout(apply,300);
})();
