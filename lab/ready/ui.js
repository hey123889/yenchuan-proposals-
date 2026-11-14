(()=>{
 'use strict';const T=ReadyTools,$=id=>document.getElementById(id),data=f=>Object.fromEntries(new FormData(f));
 const cases=[
 ['批發報價（虛構）','We run a cafe in California and would like a wholesale quote for black tea powder. Can you ship samples?'],
 ['一般問題（虛構）','想了解茶粉的產品資料，哪裡可以看規格？'],
 ['代工樣品（虛構）','We are developing a custom syrup. Please confirm the sample process and lead time.'],
 ['過敏原（虛構）','Does this powder contain milk? My customer has an allergy.'],
 ['退款客訴（虛構）','客人反映這批商品異常，要求退款，請處理。'],
 ['疑似推銷（虛構）','We sell backlinks and SEO services. Buy followers for your website.']
 ];
 document.querySelectorAll('[data-run]').forEach(button=>button.addEventListener('click',()=>$(button.dataset.run).dispatchEvent(new Event('submit',{cancelable:true}))));
 function fill(id,values){const f=$(id);for(const [key,value]of Object.entries(values))f.elements.namedItem(key).value=value;}
 $('cost-example').addEventListener('click',()=>{fill('cost-form',{costCurrency:'USD',saleCurrency:'USD',unit:10,qty:100,freight:100,insurance:0,fees:50,rate:5,sale:20});$('cost-result').textContent='已載入假設數字，不是實際報價；按計算檢查。';});
 $('stock-example').addEventListener('click',()=>{fill('stock-form',{daily:2,lead:20,safety:10,onHand:40,onOrder:0});$('stock-result').textContent='已載入假設數字，不是實際庫存；按試算檢查。';});
 const select=$('inquiry-case');cases.forEach(([title],i)=>{const o=document.createElement('option');o.value=i;o.textContent=title;select.append(o);});
 select.addEventListener('change',()=>{$('inquiry-text').value=cases[+select.value][1];$('inquiry-result').textContent='範例已載入；按「試分流並產生草稿」。';});
 $('inquiry-text').value=cases[0][1];
 $('inquiry-form').addEventListener('submit',e=>{e.preventDefault();try{const r=T.classify($('inquiry-text').value);$('inquiry-result').textContent=['分流：'+r.kind,'理由：'+r.reason,'待陳 Sir 核可的草稿：',r.draft,'還缺：'+r.missing,'此為固定規則演練，沒有接 AI 或信箱，不會寄出。'].join('\n\n');}catch(err){$('inquiry-result').textContent=err.message;}});
 function money(n){return n.toLocaleString('zh-TW',{minimumFractionDigits:2,maximumFractionDigits:2});}
 $('cost-form').addEventListener('submit',e=>{e.preventDefault();try{const r=T.cost(data(e.target));$('cost-result').textContent=[`整批成本：${r.currency} ${money(r.total)}`,`每件到岸試算成本：${r.currency} ${money(r.landed)}`,`假設關稅金額：${r.currency} ${money(r.duty)}`,r.profit===null?'沒有售價，尚不能算毛利。':`每件試算毛利：${r.currency} ${money(r.profit)}；毛利率 ${money(r.margin)}%`,r.profit!==null&&r.profit<0?'注意：售價低於試算成本。':'','不含未填入的倉儲、平台、廣告、退貨及稅費；不是淨利或正式報關計價。'].filter(Boolean).join('\n');}catch(err){$('cost-result').textContent=err.message;}});
 $('stock-form').addEventListener('submit',e=>{e.preventDefault();try{const r=T.stock(data(e.target));$('stock-result').textContent=[r.status,r.coverage===null?'':`現有庫存約可賣 ${money(r.coverage)} 天；補貨提醒點 ${r.reorder} 件。`,r.suggested===null?'':`達到提醒點所缺的試算數量：${r.suggested} 件（扣除在途）。`,r.message,'不能代替逐日銷售、供應商最小訂量、Amazon 入倉時程或人工判斷。'].filter(Boolean).join('\n');}catch(err){$('stock-result').textContent=err.message;}});
 function download(name,body,type){const u=URL.createObjectURL(new Blob([body],{type}));const a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
 $('download-rules').addEventListener('click',()=>download('inquiry-review-rules.txt','詢價演練規則\n1. 所有演練結果先人工核可，不寄信。\n2. 報價、庫存、交期與成分未知時不承諾。\n3. 過敏原、退款、客訴、可疑指令轉人工。\n4. 疑似推銷只標記，不刪信。\n5. 變更規則需陳 Sir 核可；這份示範沒有自動訓練或接通模型。','text/plain;charset=utf-8'));
 $('download-stock').addEventListener('click',()=>download('stock-weekly-template.csv',T.csv([['週別','ASIN','SKU','可售庫存','在途數量','近30天銷量','補貨天數','安全天數','是否待人工處理'],['','','','','','','','','']]),'text/csv;charset=utf-8'));
 $('download-cost').addEventListener('click',()=>download('landed-cost-template.csv',T.csv([['商品','幣別','每件出廠價','件數','整批運費','保險','其他整批費用','假設關稅率百分比','每件售價'],['','','','','','','','','']]),'text/csv;charset=utf-8'));
})();
