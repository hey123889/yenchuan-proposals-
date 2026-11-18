(()=>{'use strict';
// needs-v2-core-20261117：8題同頁textarea（id=answer-<短碼>），一顆送出鍵，原生HTML POST到Google表單。
// 不動態產生題目/圖/選單；使用者文字只用 value / textContent。
const FORM_ACTION='https://docs.google.com/forms/d/e/1FAIpQLSdWfMr8rY7zN8K-zuc5h8jNrIANophaIlzvJWxDwr-WUS5HhA/formResponse';
const SOURCE_TAG='needs-v2-home-links';
const KEY='yenchuan-startup-answers-v1',MAX_LEN=3000,LOCK_MS=3000;
const topics=[
{id:'site',label:'官網呈現'},
{id:'mobile',label:'手機操作'},
{id:'content',label:'商品與文章'},
{id:'language',label:'語言與譯文'},
{id:'sample',label:'樣品與付款'},
{id:'inquiry',label:'詢價AI'},
{id:'amazon',label:'Amazon（後續）'},
{id:'market',label:'美國採購（後續）'}];
const $=id=>document.getElementById(id);
const field=t=>$('answer-'+t.id);
let locked=false;
function setText(id,text){const n=$(id);if(n)n.textContent=text;}
// 只讀目前輸入框；空白或純空白視為沒填。
function collect(){const a={};for(const t of topics){const n=field(t);if(!n)continue;const v=n.value.trim();if(v)a[t.id]=v;}return a;}
function summary(answers){
const rows=['沅川｜下一步需求填答','這是需求描述，不是正式執行/採購/發布核可。','填寫日期：'+new Date().toLocaleDateString('zh-TW'),''];
for(const t of topics)if(answers[t.id])rows.push('【'+t.label+'】',answers[t.id],'');
rows.push('只列已填主題；未填不代表同意，也不視為取消。','來源：v2單鍵需求頁；送達以Google確認頁及專案回覆紀錄為準。');
return rows.join('\n');}
function submit(){
if(locked)return;
const answers=collect(),filled=topics.filter(t=>answers[t.id]);
if(!filled.length){setText('export-status','至少寫一個主題再送出；其他主題可先留白。');return;}
const fields={
'entry.1789974636':filled.length===1?filled[0].label:'多主題：'+filled.map(t=>t.label).join('、'),
'entry.1266581977':summary(answers),
'entry.963595698':SOURCE_TAG,
'fvv':'1',
'pageHistory':'0'};
const form=document.createElement('form');
try{
form.method='POST';form.action=FORM_ACTION;form.target='_blank';form.setAttribute('rel','noopener noreferrer');form.style.display='none';
for(const [name,value]of Object.entries(fields)){const input=document.createElement('input');input.type='hidden';input.name=name;input.value=value;form.append(input);}
document.body.append(form);
form.submit();
}catch{
form.remove();
setText('export-status','未能開啟提交頁；答案仍在本頁，請確認沒有收到Google確認後再試，這次未標成成功。');
return;}
locked=true;
const btn=$('send-request');if(btn)btn.disabled=true;
setText('export-status','正在另開Google確認頁；請以其「需求已收到」訊息為準。原頁保留答案，若已確認收到請勿重複送出。');
setTimeout(()=>{locked=false;if(btn)btn.disabled=false;form.remove();},LOCK_MS);}
const sendBtn=$('send-request');
if(sendBtn)sendBtn.onclick=submit;
// Read existing drafts only; no new writes or removal of old data.
try{
const d=JSON.parse(localStorage.getItem(KEY));
if(d&&d.schema===1&&d.answers&&typeof d.answers==='object'){
for(const t of topics){const n=field(t),v=d.answers[t.id];if(n&&typeof v==='string')n.value=v.slice(0,MAX_LEN);}
}}
catch{}
})();
