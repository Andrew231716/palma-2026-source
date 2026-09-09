(()=>{
  // Palma 2026 mobile stability hotfix.
  // 1) Never auto-resume a stale TUS upload from a previous attempt.
  const patchTus=()=>{
    const Upload=window.tus?.Upload;
    if(!Upload?.prototype||Upload.prototype.__palmaFreshUpload)return false;
    Upload.prototype.findPreviousUploads=async function(){return []};
    Upload.prototype.__palmaFreshUpload=true;
    return true;
  };
  let tusTries=0;const tusTimer=setInterval(()=>{if(patchTus()||++tusTries>120)clearInterval(tusTimer)},100);

  // 2) Keep the Ricordi selection action visible on phones even when the toolbar scrolls.
  const css=document.createElement('style');
  css.id='palma-mobile-critical-hotfix';
  css.textContent=`
    .pc-toolbar{position:sticky!important;top:0!important;z-index:40!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important}
    .pc-toolbar::-webkit-scrollbar{display:none!important}
    .pc-toolbar [data-select],.pc-toolbar button[data-action="select"],.pc-toolbar button.pc-select{position:sticky!important;left:0!important;z-index:3!important;flex:0 0 auto!important;visibility:visible!important;opacity:1!important}
    .palma-boarding-attach{display:flex;align-items:center;gap:8px;width:100%;margin-top:12px;padding:11px 14px;border:1px solid rgba(18,59,77,.12);border-radius:14px;background:#eef5f3;color:#123b4d;font-weight:800;cursor:pointer}
    .palma-boarding-file{display:none}
  `;
  document.head.appendChild(css);

  // 3) Restore a visible boarding-pass attachment control when the boarding add-on exposes no rendered one.
  const ensureBoardingAttach=()=>{
    const cards=[...document.querySelectorAll('.boarding-tools,.boarding-card,.boarding-modal,.tab-panel')].filter(x=>/imbarco|boarding/i.test(x.textContent||''));
    for(const host of cards){
      if(host.querySelector('.palma-boarding-attach,[data-boarding-attach],input[type=file][accept*="image"]'))continue;
      const input=document.createElement('input');input.type='file';input.accept='image/*,application/pdf';input.className='palma-boarding-file';
      const btn=document.createElement('button');btn.type='button';btn.className='palma-boarding-attach';btn.textContent='🎫 Allega carta d’imbarco';btn.onclick=()=>input.click();
      input.onchange=()=>{const f=input.files?.[0];if(!f)return;window.dispatchEvent(new CustomEvent('palma-boarding-file-selected',{detail:{file:f,host}}));};
      host.append(input,btn);
    }
  };
  const observer=new MutationObserver(ensureBoardingAttach);observer.observe(document.documentElement,{subtree:true,childList:true});setTimeout(ensureBoardingAttach,500);
})();
