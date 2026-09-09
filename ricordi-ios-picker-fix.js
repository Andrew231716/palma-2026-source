(()=>{
  const ACCEPT='image/*,video/*,.heic,.heif,.jpg,.jpeg,.png,.webp,.gif,.mov,.mp4,.m4v,.webm,.3gp,.mkv,.avi,.mts,.m2ts';
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('.pc-circle [data-add]');
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    event.stopPropagation();
    const circle=button.closest('.pc-circle');
    if(!circle)return;
    const input=document.createElement('input');
    input.type='file';
    input.multiple=true;
    input.accept=ACCEPT;
    input.style.position='fixed';
    input.style.left='-9999px';
    input.style.width='1px';
    input.style.height='1px';
    input.style.opacity='0';
    input.setAttribute('aria-hidden','true');
    circle.appendChild(input);
    const cleanup=()=>setTimeout(()=>input.remove(),1200);
    input.addEventListener('cancel',cleanup,{once:true});
    input.addEventListener('change',cleanup,{once:true});
    input.click();
  },true);
})();
