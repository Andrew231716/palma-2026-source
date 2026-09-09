(()=>{
  const patchTus=(tus)=>{
    if(!tus?.Upload||tus.Upload.prototype.__palmaFreshSession)return tus;
    const proto=tus.Upload.prototype;
    proto.__palmaFreshSession=true;
    if(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)){
      proto.findPreviousUploads=async()=>[];
    }
    return tus;
  };

  const ensureTus=()=>{
    if(window.tus?.Upload)return Promise.resolve(patchTus(window.tus));
    if(window.__palmaTusFallback)return window.__palmaTusFallback;
    window.__palmaTusFallback=new Promise((resolve,reject)=>{
      const existing=document.querySelector('script[data-palma-tus-safe]');
      const s=existing||document.createElement('script');
      s.src='https://unpkg.com/tus-js-client@4.3.1/dist/tus.min.js';
      s.crossOrigin='anonymous';
      s.dataset.palmaTusSafe='true';
      s.onload=()=>window.tus?.Upload?resolve(patchTus(window.tus)):reject(new Error('tus_missing_after_load'));
      s.onerror=()=>reject(new Error('tus_cdn_load_failed'));
      if(!existing)document.head.appendChild(s);
    }).catch(err=>{window.__palmaTusFallback=null;console.error('Palma Ricordi TUS',err);throw err});
    return window.__palmaTusFallback;
  };
  void ensureTus().catch(()=>{});

  const css=document.createElement('style');
  css.id='palma-ricordi-photocircle-safe';
  css.textContent=`
    .pc-circle .pc-toolbar{position:sticky!important;top:0!important;z-index:40!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important}
    .pc-circle .pc-toolbar::-webkit-scrollbar{display:none!important}
    .pc-circle .palma-select-sticky,.pc-circle .pc-toolbar [data-select]{position:sticky!important;left:0!important;z-index:5!important;flex:0 0 auto!important;visibility:visible!important;opacity:1!important;display:inline-flex!important}
    .pc-circle .palma-batch-preview{margin:10px 14px 12px;padding:11px;border-radius:16px;background:#f5f7f6;border:1px solid rgba(18,59,77,.08)}
    .pc-circle .palma-batch-preview-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;color:#123b4d;font:800 12px system-ui}
    .pc-circle .palma-batch-preview-list{display:flex;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:2px;scrollbar-width:none}
    .pc-circle .palma-batch-preview-list::-webkit-scrollbar{display:none}
    .pc-circle .palma-batch-item{position:relative;flex:0 0 76px;width:76px;height:76px;border-radius:13px;overflow:hidden;background:#dfe8e6}
    .pc-circle .palma-batch-item img,.pc-circle .palma-batch-item video{width:100%;height:100%;object-fit:cover;display:block}
    .pc-circle .palma-batch-video{position:absolute;right:5px;top:5px;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:rgba(0,0,0,.65);color:white;font:700 10px system-ui}
    .pc-circle .palma-batch-more{flex:0 0 76px;height:76px;border-radius:13px;display:grid;place-items:center;text-align:center;background:#e7efed;color:#123b4d;font:800 12px system-ui;white-space:pre-line}
  `;
  document.head.appendChild(css);

  let previewUrls=[];
  const clearPreviewUrls=()=>{for(const u of previewUrls){try{URL.revokeObjectURL(u)}catch{}}previewUrls=[]};
  const markSelect=()=>{
    const circle=document.querySelector('.pc-circle');
    if(!circle)return;
    const b=circle.querySelector('[data-select]');
    if(b)b.classList.add('palma-select-sticky');
  };

  const renderBatchPreview=(input,files)=>{
    const circle=input.closest('.pc-circle');
    if(!circle)return;
    circle.querySelector('.palma-batch-preview')?.remove();
    clearPreviewUrls();
    if(!files.length)return;
    const box=document.createElement('div');box.className='palma-batch-preview';
    const head=document.createElement('div');head.className='palma-batch-preview-head';
    const photos=files.filter(f=>/^image\//i.test(f.type)||/\.(heic|heif|jpg|jpeg|png|gif|webp)$/i.test(f.name)).length;
    const videos=files.filter(f=>/^video\//i.test(f.type)||/\.(mov|mp4|m4v|avi|webm|3gp)$/i.test(f.name)).length;
    head.innerHTML=`<span>${files.length} elementi pronti</span><span>${photos?photos+' foto ':''}${videos?videos+' video':''}</span>`;
    const list=document.createElement('div');list.className='palma-batch-preview-list';
    const visible=files.slice(0,18);
    for(const f of visible){
      const item=document.createElement('div');item.className='palma-batch-item';
      const u=URL.createObjectURL(f);previewUrls.push(u);
      if(/^image\//i.test(f.type)||/\.(heic|heif|jpg|jpeg|png|gif|webp)$/i.test(f.name)){
        const img=document.createElement('img');img.src=u;img.alt='';item.appendChild(img);
      }else{
        const v=document.createElement('video');v.src=u;v.muted=true;v.playsInline=true;v.preload='metadata';item.appendChild(v);
        const badge=document.createElement('span');badge.className='palma-batch-video';badge.textContent='▶';item.appendChild(badge);
      }
      list.appendChild(item);
    }
    if(files.length>visible.length){const more=document.createElement('div');more.className='palma-batch-more';more.textContent=`+${files.length-visible.length}\naltre`;list.appendChild(more)}
    box.append(head,list);
    const uploadList=circle.querySelector('.pc-upload-list');
    if(uploadList?.parentElement)uploadList.parentElement.insertBefore(box,uploadList);
    else circle.querySelector('.pc-dock')?.prepend(box);
  };

  document.addEventListener('change',e=>{
    const input=e.target;
    if(!(input instanceof HTMLInputElement)||input.type!=='file'||!input.multiple||!input.closest('.pc-circle'))return;
    const files=[...(input.files||[])];
    if(files.length)renderBatchPreview(input,files);
  },true);

  const apply=()=>{markSelect();if(window.tus?.Upload)patchTus(window.tus)};
  const observer=new MutationObserver(apply);
  observer.observe(document.documentElement,{subtree:true,childList:true});
  setTimeout(apply,200);
})();
