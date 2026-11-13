// Progressive enhancements only. No requests, storage, analytics or live actions.
(() => {
  const zh=document.documentElement.lang==='zh-Hant';
  const menu=document.querySelector('details.menu'),wide=matchMedia('(min-width:1180px)');
  if(menu){const syncMenu=()=>{menu.open=wide.matches;};syncMenu();wide.addEventListener('change',syncMenu);}
  document.querySelectorAll('.hero iframe[data-video-src]').forEach(frame=>{
    const hero=frame.closest('.hero'),button=document.createElement('button');button.type='button';button.className='btn ghost';button.setAttribute('aria-pressed','false');button.textContent=zh?'播放研發影片（Vimeo）':'Play lab video (Vimeo)';
    button.addEventListener('click',()=>{const play=button.getAttribute('aria-pressed')!=='true';button.setAttribute('aria-pressed',String(play));frame.src=play?frame.dataset.videoSrc:'about:blank';hero.classList.toggle('is-playing',play);button.textContent=play?(zh?'停止影片':'Stop video'):(zh?'播放研發影片（Vimeo）':'Play lab video (Vimeo)');});
    hero.querySelector('.hero-text').append(button);
  });
  document.querySelectorAll('[data-catalog]').forEach(grid=>{
    const cards=[...grid.children],pageSize=18;let page=1,query=new URLSearchParams(location.search).get('q')||'';
    const control=document.createElement('div');control.className='catalog-controls';
    const label=document.createElement('label'),input=document.createElement('input'),status=document.createElement('p'),prev=document.createElement('button'),next=document.createElement('button');
    label.textContent=zh?'搜尋文章或商品':'Search articles or products';input.type='search';input.value=query;input.autocomplete='off';label.append(input);
    status.setAttribute('role','status');status.setAttribute('aria-live','polite');prev.type=next.type='button';prev.textContent=zh?'上一頁':'Previous';next.textContent=zh?'下一頁':'Next';
    control.append(label,status,prev,next);grid.before(control);
    function render(){const matches=cards.filter(c=>c.textContent.toLocaleLowerCase().includes(query.toLocaleLowerCase()));const total=Math.max(1,Math.ceil(matches.length/pageSize));page=Math.max(1,Math.min(page,total));const visible=new Set(matches.slice((page-1)*pageSize,page*pageSize));cards.forEach(c=>c.hidden=!visible.has(c));status.textContent=zh?`找到 ${matches.length} 項，第 ${page}／${total} 頁`:`${matches.length} results · Page ${page} of ${total}`;prev.disabled=page===1;next.disabled=page===total;}
    input.addEventListener('input',()=>{query=input.value.trim();page=1;render();const u=new URL(location.href);if(query)u.searchParams.set('q',query);else u.searchParams.delete('q');history.replaceState(null,'',u);document.querySelectorAll('a[data-language]').forEach(a=>{const dest=new URL(a.href);dest.search=u.search;a.href=dest;});});
    prev.addEventListener('click',()=>{page--;render();control.scrollIntoView({block:'start'});});next.addEventListener('click',()=>{page++;render();control.scrollIntoView({block:'start'});});render();
  });
})();
