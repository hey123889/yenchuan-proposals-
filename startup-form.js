(()=>{'use strict';
const topics=[
{id:'site',label:'官網呈現',done:'研發首頁、服務流程與內容整合試作已可看；研發/合站方向已定。',gap:'正式採用的頁面內容與可公開素材仍待公司確認，不必這次一次備齊。',question:'這版首頁哪一段需要調整？希望換成怎樣的內容？'},
{id:'mobile',label:'手機操作',done:'飲品卡可展開用料，第一張可連到原配方；可先直接試。',gap:'公司實際使用時的一處具體回饋；正式站仍未改。',question:'試用時哪一步不順？希望點下去看到什麼？沒有問題也可寫「先沿用試作」。'},
{id:'content',label:'商品與文章',done:'商品/文章已集中查找，文章列表有搜尋與分頁，內容稿與查核表已備。',gap:'同款商品事實、用語與哪份內容先核對；不把草稿當正式發布。',question:'商品或文章中，先核對哪個頁面或用語？想改成什麼？'},
{id:'language',label:'語言與譯文',done:'已做英、中、西、阿四語介面，阿文右到左；原文內容有標示。',gap:'具體頁面的譯文核對與公司用語；不重新選語言方向。',question:'已做的語系中，哪個頁面先核對譯文？哪一句需要調整？'},
{id:'sample',label:'樣品與付款',done:'樣品到付款的流程畫面已備好，尚不能真實收款。',gap:'公司確認的樣品情境/規則，正式串接及權限之後另安排。',question:'樣品詢價到付款，先想處理哪種情境？希望有哪些確認步驟？'},
{id:'inquiry',label:'詢價AI',done:'固定規則分類與草稿可演練；報價/交期/例外須人工核可的方向已定。',gap:'具體常見情境與公司答案；AI、信箱、WhatsApp尚未接通。',question:'先用哪一種常見詢價練習？希望先整理哪些資訊，再交人確認？請勿貼客人個資。'},
{id:'amazon',label:'Amazon（後續）',done:'公開策略、商品內容稿、成本/補貨試算與空白表已備；不是已接後台。',gap:'合法報表/標籤/成本才可診斷真實問題；實際操作另核可，本題可先跳過。',question:'後續最想釐清哪一個商品、庫存或內容問題？目前看到什麼現象？'},
{id:'market',label:'美國採購（後續）',done:'研究、候選名單、未寄開場信與官方資料清單已備。',gap:'具體買家/樣品/交易條件；沒有寄信、寄樣或成交，本題可先跳過。',question:'後續先想服務哪一類買家？想先處理哪個採購或樣品情境？'}];
const $=id=>document.getElementById(id),KEY='yenchuan-startup-answers-v1';let current=0,answers={},retention=false;
function message(t){$('save-status').textContent=t;}
function save(){if(!retention){message('答案目前只留在本頁，重整前請複製或下載摘要；尚未送出。');return;}try{localStorage.setItem(KEY,JSON.stringify({schema:1,answers,current,savedAt:new Date().toISOString()}));message('草稿已保留在這台裝置；沒有傳到伺服器。');}catch{message('瀏覽器不允許保存草稿；答案仍在本頁，請下載摘要，勿直接重整。');}}
function rememberAnswer(){const v=$('answer').value.trim();if(v)answers[topics[current].id]=v;else delete answers[topics[current].id];save();}
function render(focus=false){const t=topics[current];$('step').textContent='第'+(current+1)+'題／'+topics.length+'個主題，可先跳過';$('question-title').textContent=t.question;$('done').textContent=t.done;$('gap').textContent=t.gap;$('answer').value=answers[t.id]||'';$('previous').disabled=current===0;$('next').textContent=current===topics.length-1?'回到第一題':'下一題／先跳過';for(const b of $('topics').querySelectorAll('button'))b.setAttribute('aria-pressed',String(Number(b.dataset.index)===current));if(focus){$('question-title').tabIndex=-1;$('question-title').focus({preventScroll:true});}}
function go(index){rememberAnswer();current=index;render(true);save();}
for(let i=0;i<topics.length;i++){const b=document.createElement('button');b.type='button';b.textContent=topics[i].label;b.dataset.index=i;b.onclick=()=>go(i);$('topics').append(b);}
$('answer').addEventListener('input',rememberAnswer);$('previous').onclick=()=>{if(current)go(current-1);};$('next').onclick=()=>go((current+1)%topics.length);
$('remember').onchange=()=>{retention=$('remember').checked;if(!retention){try{localStorage.removeItem(KEY);}catch{}message('不再保留裝置草稿；本頁填答仍在，尚未送出。');}else save();};
function summary(){const rows=['沅川｜下一步需求填答','這是需求描述，不是正式執行/採購/發布核可。','填寫日期：'+new Date().toLocaleDateString('zh-TW'),''];let n=0;for(const t of topics){if(!answers[t.id])continue;n++;rows.push('【'+t.label+'】',answers[t.id],'');}if(!n)rows.push('目前尚未填答，可待公司內部討論後再補。');rows.push('只列已填主題；未填不代表同意，也不視為取消。','此摘要尚未自動送出，請從原聯絡管道交回。');return rows.join('\n');}
$('make-summary').onclick=()=>{rememberAnswer();$('summary-output').value=summary();$('summary-panel').hidden=false;$('export-status').textContent='已產生摘要，尚未送出。';$('summary-panel').scrollIntoView({block:'nearest'});};
$('copy').onclick=async()=>{rememberAnswer();$('summary-output').value=summary();const text=$('summary-output').value;try{await navigator.clipboard.writeText(text);$('export-status').textContent='摘要已複製；請自行貼到原聯絡管道，還沒有寄送。';}catch{$('summary-output').focus();$('summary-output').select();$('export-status').textContent='請複製已選取的摘要，再從原聯絡管道交回。';}};
$('download').onclick=()=>{rememberAnswer();$('summary-output').value=summary();const blob=new Blob(['\ufeff'+$('summary-output').value],{type:'text/plain;charset=utf-8'}),u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;a.download='沅川_需求填答_'+new Date().toISOString().slice(0,10)+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);$('export-status').textContent='已建立下載；檔案沒有自動寄送。';};
$('clear').onclick=()=>{if(!confirm('只清除這份表單在本頁及這台裝置的草稿？不影響任何網站或伺服器資料。'))return;answers={};current=0;retention=false;$('remember').checked=false;try{localStorage.removeItem(KEY);}catch{}$('summary-output').value='';$('summary-panel').hidden=true;render();message('已清除這份本機草稿；沒有改動伺服器資料。');};
try{const raw=localStorage.getItem(KEY);if(raw){const d=JSON.parse(raw);if(d.schema===1&&d.answers&&typeof d.answers==='object'){for(const t of topics)if(typeof d.answers[t.id]==='string')answers[t.id]=d.answers[t.id].slice(0,3000);current=Number.isInteger(d.current)&&d.current>=0&&d.current<topics.length?d.current:0;retention=true;$('remember').checked=true;message('已載入本機草稿；沒有從伺服器取回任何答案。');}}}catch{message('無法讀取本機草稿，可直接填寫並下載摘要。');}
render();if(!$('save-status').textContent)message('答案未送出。未勾保留時只留在本頁；可先只填一題再下載。');
})();
